import { PetPreviewStage } from "../pet/PetPreviewStage";

export function UploadPreview({ activeFrameId, failed, onFrameChange, passed, upload }) {
  const frames = upload.previewFrames?.length ? upload.previewFrames : createFallbackFrames(upload);

  return (
    <PetPreviewStage
      activeStateId={activeFrameId}
      className="upload-pet-preview"
      failed={failed}
      frames={frames}
      onStateChange={onFrameChange}
      petName={upload.manifest?.displayName || "宠物"}
      ready={passed && Boolean(upload.previewUrl)}
    />
  );
}

function createFallbackFrames(upload) {
  if (!upload.previewUrl) return [];
  return [{ id: "idle", label: "站立", durations: [280], frames: [{ column: 0, url: upload.previewUrl }] }];
}
