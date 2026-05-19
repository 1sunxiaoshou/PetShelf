import { useEffect, useRef, useState } from "react";
import { AppHeader } from "./components/AppHeader";
import { UploadDialog } from "./components/UploadDialog";
import { HomePage } from "./pages/HomePage";
import { PetDetailPage } from "./pages/PetDetailPage";
import { formatBytes, totalSize } from "./utils/format";
import { getFolderName, validatePetFolder } from "./utils/uploadValidation";

const UPLOAD_STEP_DELAY = 220;

export default function App() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("hot");
  const [petsList, setPetsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPetId, setSelectedPetId] = useState(getPetIdFromHash());
  const [selectedPet, setSelectedPet] = useState(null);
  const [userOpen, setUserOpen] = useState(false);
  const [userTab, setUserTab] = useState("uploads");
  const [upload, setUpload] = useState(null);
  const [myUploads, setMyUploads] = useState([]);
  const [myLikes, setMyLikes] = useState([]);
  const fileInputRef = useRef(null);

  // Fetch pet lists from the backend with dynamic parameters
  const fetchPets = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/pets?query=${encodeURIComponent(query)}&sort=${sort}`);
      if (res.ok) {
        const data = await res.json();
        setPetsList(data);
      }
    } catch (err) {
      console.error("Failed to load pet catalog:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user personal creations and liked collections
  const fetchUserDashboard = async () => {
    const mockHeaders = {
      "x-mock-user-id": "local-dev-user",
      "x-mock-user-name": "LocalDevPanda"
    };
    try {
      const uRes = await fetch("/api/me/uploads", { headers: mockHeaders });
      if (uRes.ok) {
        const uData = await uRes.json();
        setMyUploads(uData);
      }
      const lRes = await fetch("/api/me/likes", { headers: mockHeaders });
      if (lRes.ok) {
        const lData = await lRes.json();
        setMyLikes(lData);
      }
    } catch (err) {
      console.error("Failed to fetch user collection metrics:", err);
    }
  };

  useEffect(() => {
    fetchPets();
  }, [query, sort]);

  useEffect(() => {
    if (userOpen) {
      fetchUserDashboard();
    }
  }, [userOpen]);

  // Expose global callbacks for child components to trigger updates
  useEffect(() => {
    window.refreshPetList = fetchPets;
    window.refreshDashboard = fetchUserDashboard;
    return () => {
      delete window.refreshPetList;
      delete window.refreshDashboard;
    };
  }, [query, sort]);

  // Handle URL Hash change dynamically (supports both boots and navigational events)
  useEffect(() => {
    const handleHashChange = async () => {
      const id = getPetIdFromHash();
      setSelectedPetId(id);

      if (id) {
        try {
          const res = await fetch(`/api/pets/${id}`);
          if (res.ok) {
            const data = await res.json();
            setSelectedPet(data);
            return;
          }
        } catch (err) {
          console.error("Failed to fetch detailed pet payload:", err);
        }
      }
      setSelectedPet(null);
    };

    window.addEventListener("hashchange", handleHashChange);
    handleHashChange(); // Run initial lookup
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handlePetSelect = (pet) => {
    setSelectedPetId(pet.id);
    window.location.hash = `pet=${pet.id}`;
  };

  const handleBackToList = () => {
    setSelectedPetId(null);
    setSelectedPet(null);
    window.history.pushState("", document.title, window.location.pathname + window.location.search);
  };

  const handleFolderSelect = async (event) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    const folderName = getFolderName(files);
    const baseUpload = {
      folderName,
      fileCount: files.length,
      size: formatBytes(totalSize(files))
    };

    setUpload({
      ...baseUpload,
      status: "reading",
      manifest: null,
      spritesheet: null,
      previewFrames: [],
      previewUrl: "",
      summaryChecks: [
        { key: "size", title: "文件夹大小", ok: true, detail: `${baseUpload.size} / 10 MB` },
        { key: "manifest", title: "pet.json", ok: true, detail: "正在读取" },
        { key: "spritesheet", title: "spritesheet", ok: true, detail: "等待 pet.json" }
      ],
      errors: []
    });

    try {
      await waitForUploadStep();
      setUpload((current) => current ? { ...current, status: "checking" } : current);

      const result = await validatePetFolder(files);

      if (result.errors.length > 0) {
        setUpload({
          ...baseUpload,
          ...result,
          status: "failed"
        });
      } else {
        setUpload({
          ...baseUpload,
          ...result,
          status: "rendering"
        });
        await waitForUploadStep();
        setUpload({
          ...baseUpload,
          ...result,
          status: "preview"
        });
      }
    } catch (error) {
      setUpload({
        ...baseUpload,
        status: "failed",
        manifest: null,
        spritesheet: null,
        previewFrames: [],
        previewUrl: "",
        summaryChecks: [
          { key: "size", title: "文件夹大小", ok: true, detail: `${baseUpload.size} / 10 MB` },
          { key: "manifest", title: "pet.json", ok: false, detail: error.message || "无法解析选择的文件夹" },
          { key: "spritesheet", title: "spritesheet", ok: false, detail: "未完成校验" }
        ],
        errors: [error.message || "无法解析选择的文件夹"]
      });
    }

    event.target.value = "";
  };

  return (
    <div className="app-shell">
      <AppHeader
        fileInputRef={fileInputRef}
        likedPets={myLikes}
        onFolderSelect={handleFolderSelect}
        onQueryChange={setQuery}
        onUserClose={() => setUserOpen(false)}
        onUserTabChange={setUserTab}
        onUserToggle={() => setUserOpen((open) => !open)}
        query={query}
        uploadedPets={myUploads}
        userOpen={userOpen}
        userTab={userTab}
      />

      <HomePage
        onClearSearch={() => setQuery("")}
        onPetSelect={handlePetSelect}
        onSortChange={setSort}
        pets={petsList}
        query={query}
        sort={sort}
      />

      <footer className="footer">
        <span>© 2026 PetShelf</span>
        <span>PetShelf 使用轻量云平台部署，全球 CDN 加速</span>
        <button className="footer-link" type="button">状态页面</button>
        <button className="footer-link" type="button">帮助中心</button>
      </footer>

      {selectedPet && <PetDetailPage onClose={handleBackToList} pet={selectedPet} />}
      {upload && <UploadDialog upload={upload} onClose={() => setUpload(null)} />}
    </div>
  );
}

function waitForUploadStep() {
  return new Promise((resolve) => {
    window.setTimeout(resolve, UPLOAD_STEP_DELAY);
  });
}

function getPetIdFromHash() {
  const match = window.location.hash.match(/^#pet=([a-f0-9-]+)$/i);
  return match ? match[1] : null;
}
