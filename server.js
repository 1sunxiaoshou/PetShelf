// server.js
import express from "express";
import pg from "pg";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import AdmZip from "adm-zip";
import multer from "multer";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Set up public static uploads path
const uploadsDir = path.join(__dirname, "public/uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir));

// Expose main public directory
app.use(express.static(path.join(__dirname, "public")));

// Neon PG Connection Pool
const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Prevent unhandled exceptions from idle database connection closures
pool.on("error", (err, client) => {
  console.error("Unexpected database pool client error:", err.message);
});

// Initialize database tables & seed initial data
async function initializeDatabase() {
  try {
    console.log("Connecting to Neon database and performing DDL setup...");
    
    // 1. DDL: Create pets table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pets (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          manifest_id VARCHAR(100) NOT NULL UNIQUE,
          display_name VARCHAR(100) NOT NULL,
          description TEXT,
          author_id VARCHAR(255) NOT NULL,
          author_name VARCHAR(100) NOT NULL,
          spritesheet_path TEXT NOT NULL,
          downloads_count INT DEFAULT 0,
          likes_count INT DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // 2. DDL: Create pet_likes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pet_likes (
          pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
          user_id VARCHAR(255) NOT NULL,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (pet_id, user_id)
      );
    `);

    console.log("DDL tables verify completed.");

    // 3. Seed: Check if pets table is empty
    const checkRes = await pool.query("SELECT COUNT(*) FROM pets");
    const count = parseInt(checkRes.rows[0].count);
    
    if (count === 0) {
      console.log("Database table 'pets' is empty. Seeding default Atri pet...");
      
      const atriSourceDir = path.join(__dirname, "public/pets/atri");
      const atriJsonPath = path.join(atriSourceDir, "pet.json");
      const atriImgPath = path.join(atriSourceDir, "spritesheet.webp");
      const atriDestImg = path.join(uploadsDir, "atri_spritesheet.webp");

      if (fs.existsSync(atriJsonPath) && fs.existsSync(atriImgPath)) {
        // Copy the spritesheet to uploads
        fs.copyFileSync(atriImgPath, atriDestImg);
        console.log("Copied Atri spritesheet to uploads folder.");

        // Read manifest details
        const manifestData = JSON.parse(fs.readFileSync(atriJsonPath, "utf-8"));

        // Insert Atri seed
        await pool.query(
          `INSERT INTO pets (manifest_id, display_name, description, author_id, author_name, spritesheet_path, downloads_count, likes_count)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            manifestData.id || "atri",
            manifestData.displayName || "亚托莉",
            manifestData.description || "A tiny chibi anime companion in a white sailor outfit.",
            "system-seed-creator",
            "CodexCreator",
            "/uploads/atri_spritesheet.webp",
            42,
            12
          ]
        );
        console.log("Atri default pet successfully seeded into PostgreSQL database.");
      } else {
        console.warn("Seeding failed: Atri source files not found at " + atriSourceDir);
      }
    } else {
      console.log("Pets table already contains data (" + count + " records). Skipping seed.");
    }
  } catch (err) {
    console.error("Database boot initialization failed:", err);
  }
}

// Basic Status Route
app.get("/api/status", (req, res) => {
  res.json({ status: "ok", message: "PetShelf Full-stack Server is running smoothly" });
});

// GET /api/pets - Get list of pets (search and sort)
app.get("/api/pets", async (req, res) => {
  const { query, sort } = req.query;
  let sql = "SELECT * FROM pets";
  const params = [];
  
  if (query) {
    sql += " WHERE display_name ILIKE $1 OR author_name ILIKE $1";
    params.push(`%${query}%`);
  }
  
  if (sort === "new") {
    sql += " ORDER BY created_at DESC";
  } else if (sort === "downloads") {
    sql += " ORDER BY downloads_count DESC";
  } else if (sort === "likes") {
    sql += " ORDER BY likes_count DESC";
  } else {
    // Default: hot (likes + downloads)
    sql += " ORDER BY (likes_count + downloads_count) DESC, created_at DESC";
  }
  
  try {
    const dbRes = await pool.query(sql, params);
    const mapped = dbRes.rows.map(row => ({
      id: row.id,
      manifestId: row.manifest_id,
      displayName: row.display_name,
      description: row.description,
      author: row.author_name,
      downloads: row.downloads_count,
      likes: row.likes_count,
      spritesheetPath: row.spritesheet_path,
      createdAt: row.created_at
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/pets/:id - Get a single pet detail
app.get("/api/pets/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const dbRes = await pool.query("SELECT * FROM pets WHERE id = $1", [id]);
    if (dbRes.rows.length === 0) {
      return res.status(404).json({ error: "Pet not found" });
    }
    const row = dbRes.rows[0];
    res.json({
      id: row.id,
      manifestId: row.manifest_id,
      displayName: row.display_name,
      description: row.description,
      author: row.author_name,
      downloads: row.downloads_count,
      likes: row.likes_count,
      spritesheetPath: row.spritesheet_path,
      createdAt: row.created_at
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/pets/:id/download - Increment download and bundle zip dynamically on the fly
app.get("/api/pets/:id/download", async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Increment downloads in DB
    const dbRes = await pool.query(
      "UPDATE pets SET downloads_count = downloads_count + 1 WHERE id = $1 RETURNING *",
      [id]
    );
    if (dbRes.rows.length === 0) {
      return res.status(404).json({ error: "Pet not found" });
    }
    const pet = dbRes.rows[0];
    
    // 2. Read physical spritesheet file
    const spritesheetFileName = path.basename(pet.spritesheet_path);
    const filePath = path.join(uploadsDir, spritesheetFileName);
    
    if (!fs.existsSync(filePath)) {
      return res.status(500).json({ error: "Physical spritesheet asset missing on server" });
    }

    // 3. Build pet.json structure
    const manifestJSON = JSON.stringify({
      id: pet.manifest_id,
      displayName: pet.display_name,
      description: pet.description,
      spritesheetPath: "spritesheet.webp"
    }, null, 2);

    // 4. Create ZIP in memory via adm-zip
    const zip = new AdmZip();
    zip.addFile("pet.json", Buffer.from(manifestJSON, "utf8"));
    zip.addLocalFile(filePath, "", "spritesheet.webp");
    
    const zipBuffer = zip.toBuffer();

    // 5. Stream ZIP download response
    res.setHeader("Content-Disposition", `attachment; filename="${pet.manifest_id}.zip"`);
    res.setHeader("Content-Type", "application/zip");
    res.send(zipBuffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AUTHENTICATION MIDDLEWARE WITH GRACEFUL DEGRADATION TO MOCK SESSIONS
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    try {
      // Decode JWT safely (supporting local and production payloads)
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        Buffer.from(base64, "base64")
          .toString("utf8")
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const payload = JSON.parse(jsonPayload);
      req.user = {
        id: payload.sub || payload.id || "neon-user-id",
        name: payload.email || payload.name || "NeonUser"
      };
      return next();
    } catch (e) {
      // Decode failed, fall back to mock check
    }
  }

  // Local sandbox dev fallback header
  const mockUserId = req.headers["x-mock-user-id"];
  const mockUserName = req.headers["x-mock-user-name"];
  if (mockUserId && mockUserName) {
    req.user = { id: mockUserId, name: mockUserName };
    return next();
  }

  return res.status(401).json({ error: "Unauthorized: Please log in using Neon Auth" });
}

// MULTER CONFIGURATION FOR SPRITESHEET UPLOADS
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".webp";
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `spritesheet-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// POST /api/pets/:id/like - Toggle like state for the logged-in user
app.post("/api/pets/:id/like", requireAuth, async (req, res) => {
  const petId = req.params.id;
  const userId = req.user.id;
  
  try {
    // 1. Verify pet exists
    const petCheck = await pool.query("SELECT id FROM pets WHERE id = $1", [petId]);
    if (petCheck.rows.length === 0) {
      return res.status(404).json({ error: "Pet not found" });
    }

    // 2. Check if user already liked this pet
    const checkRes = await pool.query(
      "SELECT * FROM pet_likes WHERE pet_id = $1 AND user_id = $2",
      [petId, userId]
    );
    
    if (checkRes.rows.length > 0) {
      // 3. Unlike: delete record and decrement likes count
      await pool.query("DELETE FROM pet_likes WHERE pet_id = $1 AND user_id = $2", [petId, userId]);
      const updated = await pool.query(
        "UPDATE pets SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = $1 RETURNING likes_count",
        [petId]
      );
      return res.json({ success: true, liked: false, likesCount: updated.rows[0].likes_count });
    } else {
      // 4. Like: insert record and increment likes count
      await pool.query("INSERT INTO pet_likes (pet_id, user_id) VALUES ($1, $2)", [petId, userId]);
      const updated = await pool.query(
        "UPDATE pets SET likes_count = likes_count + 1 WHERE id = $1 RETURNING likes_count",
        [petId]
      );
      return res.json({ success: true, liked: true, likesCount: updated.rows[0].likes_count });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/pets - Upload new pet spritesheet and metadata manifest
app.post("/api/pets", requireAuth, upload.single("spritesheet"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Missing required spritesheet image file" });
    }

    const { id, displayName, description } = JSON.parse(req.body.manifest);
    const userId = req.user.id;
    const userName = req.user.name;

    const relativePath = `/uploads/${req.file.filename}`;

    // Insert record into PostgreSQL
    const dbRes = await pool.query(
      `INSERT INTO pets (manifest_id, display_name, description, author_id, author_name, spritesheet_path)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id, displayName, description, userId, userName, relativePath]
    );

    res.status(201).json({ success: true, pet: dbRes.rows[0] });
  } catch (err) {
    // Delete file if DB insert fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    // Handle uniqueness constraint violations gracefully
    if (err.code === "23505") {
      return res.status(400).json({ error: "桌宠标识 ID 已存在，请在 pet.json 中使用其他 ID！" });
    }
    res.status(500).json({ error: err.message });
  }
});

// GET /api/me/uploads - Retrieve uploaded pets list
app.get("/api/me/uploads", requireAuth, async (req, res) => {
  try {
    const dbRes = await pool.query("SELECT * FROM pets WHERE author_id = $1 ORDER BY created_at DESC", [req.user.id]);
    res.json(dbRes.rows.map(row => ({
      id: row.id,
      manifestId: row.manifest_id,
      displayName: row.display_name,
      description: row.description,
      author: row.author_name,
      downloads: row.downloads_count,
      likes: row.likes_count,
      spritesheetPath: row.spritesheet_path
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/me/likes - Retrieve liked pets list
app.get("/api/me/likes", requireAuth, async (req, res) => {
  try {
    const dbRes = await pool.query(
      `SELECT p.* FROM pets p 
       JOIN pet_likes l ON p.id = l.pet_id 
       WHERE l.user_id = $1 
       ORDER BY l.created_at DESC`,
      [req.user.id]
    );
    res.json(dbRes.rows.map(row => ({
      id: row.id,
      manifestId: row.manifest_id,
      displayName: row.display_name,
      description: row.description,
      author: row.author_name,
      downloads: row.downloads_count,
      likes: row.likes_count,
      spritesheetPath: row.spritesheet_path
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`PetShelf Server is listening on port ${PORT}`);
  await initializeDatabase();
});
