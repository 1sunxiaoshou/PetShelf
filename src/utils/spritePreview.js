import { PET_ANIMATION_STATES, PET_ATLAS } from "../constants/petAtlas";

export function createPreviewFramesFromFile(file) {
  const objectUrl = URL.createObjectURL(file);
  return createPreviewFramesFromImageSource(objectUrl, () => URL.revokeObjectURL(objectUrl));
}

export function createPreviewFramesFromUrl(url) {
  return createPreviewFramesFromImageSource(url);
}

function createPreviewFramesFromImageSource(src, cleanup = null) {
  return new Promise((resolve, reject) => {
    const image = new Image();

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
        cleanup?.();
        resolve(frames);
      } catch (error) {
        cleanup?.();
        reject(error);
      }
    };

    image.onerror = () => {
      cleanup?.();
      reject(new Error("无法生成宠物预览"));
    };

    image.src = src;
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
