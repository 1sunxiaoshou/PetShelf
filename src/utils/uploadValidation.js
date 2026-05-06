import { PET_ATLAS } from "../constants/petAtlas";

export function getFolderName(files) {
  const firstPath = normalizePath(files[0]?.webkitRelativePath || files[0]?.name || "pet-folder");
  return firstPath.split("/")[0] || "pet-folder";
}

export async function validatePetFolder(files) {
  const checks = [];
  const errors = [];
  const entries = files.map((file) => ({
    file,
    path: normalizePath(file.webkitRelativePath || file.name)
  }));

  const manifestEntry = entries
    .filter((entry) => fileNameOf(entry.path) === "pet.json")
    .sort((a, b) => a.path.split("/").length - b.path.split("/").length)[0];

  if (!manifestEntry) {
    return {
      manifest: null,
      spritesheet: null,
      checks: [{ label: "找到 pet.json", ok: false, detail: "选择的文件夹内缺少 pet.json" }],
      errors: ["选择的文件夹内缺少 pet.json"]
    };
  }

  checks.push({ label: "找到 pet.json", ok: true, detail: manifestEntry.path });

  const manifest = await parseManifest(manifestEntry, checks, errors);
  const missingFields = getMissingManifestFields(manifest);
  checks.push({
    label: "校验 manifest 字段",
    ok: missingFields.length === 0,
    detail: missingFields.length === 0 ? "字段完整" : `缺少 ${missingFields.join(", ")}`
  });
  if (missingFields.length > 0) errors.push(`pet.json 缺少字段：${missingFields.join(", ")}`);

  const spritesheetEntry = findSpritesheet(entries, manifestEntry, manifest);
  checks.push({
    label: "找到 spritesheet 文件",
    ok: Boolean(spritesheetEntry),
    detail: spritesheetEntry ? spritesheetEntry.path : `未找到 ${manifest?.spritesheetPath || "spritesheet.webp"}`
  });
  if (!spritesheetEntry) errors.push(`未找到 spritesheet 文件：${manifest?.spritesheetPath || "spritesheet.webp"}`);

  const spritesheet = spritesheetEntry ? await validateSpritesheet(spritesheetEntry, checks, errors) : null;

  return {
    manifest,
    spritesheet,
    checks,
    errors
  };
}

function normalizePath(path) {
  return path.replaceAll("\\", "/").replace(/^\/+/, "").replace(/\/+$/, "");
}

function fileNameOf(path) {
  return normalizePath(path).split("/").pop();
}

async function parseManifest(manifestEntry, checks, errors) {
  try {
    const manifest = JSON.parse(await manifestEntry.file.text());
    checks.push({ label: "解析 pet.json", ok: true, detail: manifest.displayName || manifest.id || "已解析" });
    return manifest;
  } catch {
    errors.push("pet.json 不是有效 JSON");
    checks.push({ label: "解析 pet.json", ok: false, detail: "JSON 格式错误" });
    return null;
  }
}

function getMissingManifestFields(manifest) {
  const requiredFields = ["id", "displayName", "description", "spritesheetPath"];
  if (!manifest) return requiredFields;
  return requiredFields.filter((field) => !manifest[field] || typeof manifest[field] !== "string");
}

function findSpritesheet(entries, manifestEntry, manifest) {
  const manifestDir = manifestEntry.path.split("/").slice(0, -1).join("/");
  const spritesheetPath = manifest?.spritesheetPath ? normalizePath(manifest.spritesheetPath) : "spritesheet.webp";
  const expectedSpritesheetPath = normalizePath(manifestDir ? `${manifestDir}/${spritesheetPath}` : spritesheetPath);
  return entries.find((entry) => entry.path === expectedSpritesheetPath);
}

async function validateSpritesheet(spritesheetEntry, checks, errors) {
  const extension = fileNameOf(spritesheetEntry.path).split(".").pop()?.toLowerCase();
  const formatOk = extension === "webp" || extension === "png";
  checks.push({
    label: "校验 spritesheet 格式",
    ok: formatOk,
    detail: formatOk ? extension.toUpperCase() : "仅支持 WebP 或 PNG"
  });
  if (!formatOk) errors.push("spritesheet 仅支持 WebP 或 PNG");

  try {
    const spritesheet = await inspectSpritesheet(spritesheetEntry.file);
    const dimensionOk = spritesheet.width === PET_ATLAS.width && spritesheet.height === PET_ATLAS.height;
    checks.push({
      label: "校验 atlas 尺寸",
      ok: dimensionOk,
      detail: `${spritesheet.width}x${spritesheet.height}`
    });
    if (!dimensionOk) errors.push(`spritesheet 尺寸应为 ${PET_ATLAS.width}x${PET_ATLAS.height}`);

    checks.push({
      label: "校验透明背景",
      ok: spritesheet.hasAlpha,
      detail: spritesheet.hasAlpha ? "检测到透明像素" : "未检测到透明像素"
    });
    if (!spritesheet.hasAlpha) errors.push("spritesheet 需要透明背景");

    return spritesheet;
  } catch {
    errors.push("无法读取 spritesheet 图片");
    checks.push({ label: "读取 spritesheet", ok: false, detail: "图片无法打开" });
    return null;
  }
}

function inspectSpritesheet(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        context.drawImage(image, 0, 0);
        const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
        let hasAlpha = false;

        for (let index = 3; index < data.length; index += 64) {
          if (data[index] < 255) {
            hasAlpha = true;
            break;
          }
        }

        URL.revokeObjectURL(objectUrl);
        resolve({
          width: image.naturalWidth,
          height: image.naturalHeight,
          hasAlpha
        });
      } catch (error) {
        URL.revokeObjectURL(objectUrl);
        reject(error);
      }
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("无法读取图片"));
    };

    image.src = objectUrl;
  });
}
