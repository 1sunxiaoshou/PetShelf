import { PET_ANIMATION_STATES, PET_ATLAS } from "../constants/petAtlas";
import { formatBytes, totalSize } from "./format";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const MAX_UPLOAD_LABEL = "10 MB";

export function getFolderName(files) {
  const firstPath = normalizePath(files[0]?.webkitRelativePath || files[0]?.name || "pet-folder");
  return firstPath.split("/")[0] || "pet-folder";
}

export async function validatePetFolder(files) {
  const errors = [];
  const sizeBytes = totalSize(files);
  const summaryChecks = [
    createSummaryCheck("size", "文件夹大小", sizeBytes < MAX_UPLOAD_BYTES, `${formatBytes(sizeBytes)} / ${MAX_UPLOAD_LABEL}`),
    createSummaryCheck("manifest", "pet.json", false, "等待校验"),
    createSummaryCheck("spritesheet", "spritesheet", false, "等待校验")
  ];
  const entries = files.map((file) => ({
    file,
    path: normalizePath(file.webkitRelativePath || file.name)
  }));

  if (sizeBytes >= MAX_UPLOAD_BYTES) {
    errors.push(`文件夹大小需要小于 ${MAX_UPLOAD_LABEL}`);
    updateSummary(summaryChecks, "size", false, `当前 ${formatBytes(sizeBytes)}，需要小于 ${MAX_UPLOAD_LABEL}`);
  }

  const manifestEntry = entries
    .filter((entry) => fileNameOf(entry.path) === "pet.json")
    .sort((a, b) => a.path.split("/").length - b.path.split("/").length)[0];

  if (!manifestEntry) {
    return {
      manifest: null,
      spritesheet: null,
      previewUrl: "",
      summaryChecks: updateSummary(summaryChecks, "manifest", false, "选择的文件夹内缺少 pet.json"),
      errors: [...errors, "选择的文件夹内缺少 pet.json"]
    };
  }

  const manifest = await parseManifest(manifestEntry, errors);
  if (!manifest) {
    return {
      manifest: null,
      spritesheet: null,
      previewUrl: "",
      summaryChecks: updateSummary(summaryChecks, "manifest", false, "JSON 格式错误"),
      errors
    };
  }

  const missingFields = getMissingManifestFields(manifest);
  if (missingFields.length > 0) {
    errors.push(`pet.json 缺少字段：${missingFields.join(", ")}`);
    updateSummary(summaryChecks, "manifest", false, `缺少 ${missingFields.join(", ")}`);
  } else {
    updateSummary(summaryChecks, "manifest", true, "已找到，字段完整");
  }

  const spritesheetEntry = findSpritesheet(entries, manifestEntry, manifest);
  if (!spritesheetEntry) {
    errors.push(`未找到 spritesheet 文件：${manifest.spritesheetPath || "spritesheet.webp"}`);
    return {
      manifest,
      spritesheet: null,
      previewUrl: "",
      summaryChecks: updateSummary(summaryChecks, "spritesheet", false, `未找到 ${manifest.spritesheetPath || "spritesheet.webp"}`),
      errors
    };
  }

  const spritesheet = await validateSpritesheet(spritesheetEntry, summaryChecks, errors);
  const previewFrames = spritesheet ? await createPreviewFramesOrFail(spritesheetEntry.file, summaryChecks, errors) : [];
  const previewUrl = previewFrames[0]?.frames[0]?.url || "";

  return {
    manifest,
    spritesheet,
    previewFrames,
    previewUrl,
    summaryChecks,
    errors
  };
}

async function createPreviewFramesOrFail(file, summaryChecks, errors) {
  try {
    return await createPreviewFrames(file);
  } catch {
    errors.push("无法生成宠物静态预览");
    updateSummary(summaryChecks, "spritesheet", false, "无法生成静态预览");
    return [];
  }
}

function createSummaryCheck(key, title, ok, detail) {
  return { key, title, ok, detail };
}

function updateSummary(summaryChecks, key, ok, detail) {
  const target = summaryChecks.find((check) => check.key === key);
  if (target) {
    target.ok = ok;
    target.detail = detail;
  }
  return summaryChecks;
}

function normalizePath(path) {
  return path.replaceAll("\\", "/").replace(/^\/+/, "").replace(/\/+$/, "");
}

function fileNameOf(path) {
  return normalizePath(path).split("/").pop();
}

async function parseManifest(manifestEntry, errors) {
  try {
    return JSON.parse(await manifestEntry.file.text());
  } catch {
    errors.push("pet.json 不是有效 JSON");
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

async function validateSpritesheet(spritesheetEntry, summaryChecks, errors) {
  const extension = fileNameOf(spritesheetEntry.path).split(".").pop()?.toLowerCase();
  const formatOk = extension === "webp" || extension === "png";
  if (!formatOk) {
    errors.push("spritesheet 仅支持 WebP 或 PNG");
    updateSummary(summaryChecks, "spritesheet", false, "仅支持 WebP 或 PNG");
    return null;
  }

  try {
    const spritesheet = await inspectSpritesheet(spritesheetEntry.file);
    const dimensionOk = spritesheet.width === PET_ATLAS.width && spritesheet.height === PET_ATLAS.height;
    if (!dimensionOk) {
      errors.push(`spritesheet 尺寸应为 ${PET_ATLAS.width}x${PET_ATLAS.height}`);
      updateSummary(summaryChecks, "spritesheet", false, `尺寸应为 ${PET_ATLAS.width}x${PET_ATLAS.height}，当前 ${spritesheet.width}x${spritesheet.height}`);
      return null;
    }

    if (!spritesheet.hasAlpha) {
      errors.push("spritesheet 需要透明背景");
      updateSummary(summaryChecks, "spritesheet", false, "未检测到透明像素");
      return null;
    }

    updateSummary(summaryChecks, "spritesheet", true, `${extension.toUpperCase()} · ${spritesheet.width}x${spritesheet.height} · 透明背景`);
    return spritesheet;
  } catch {
    errors.push("无法读取 spritesheet 图片");
    updateSummary(summaryChecks, "spritesheet", false, "图片无法打开");
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

function createPreviewFrames(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      try {
        const frames = PET_ANIMATION_STATES.map((state) => ({
          id: state.id,
          label: state.label,
          durations: state.durations,
          frames: state.columns.map((column) => ({
            column,
            url: drawPreviewFrame(image, state.row, column)
          }))
        }));
        URL.revokeObjectURL(objectUrl);
        resolve(frames);
      } catch (error) {
        URL.revokeObjectURL(objectUrl);
        reject(error);
      }
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("无法生成宠物预览"));
    };

    image.src = objectUrl;
  });
}

function drawPreviewFrame(image, row, column) {
  const canvas = document.createElement("canvas");
  canvas.width = PET_ATLAS.cellWidth;
  canvas.height = PET_ATLAS.cellHeight;
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(
    image,
    column * PET_ATLAS.cellWidth,
    row * PET_ATLAS.cellHeight,
    PET_ATLAS.cellWidth,
    PET_ATLAS.cellHeight,
    0,
    0,
    PET_ATLAS.cellWidth,
    PET_ATLAS.cellHeight
  );
  return canvas.toDataURL("image/png");
}
