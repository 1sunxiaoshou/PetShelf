import { PetPreviewStage } from "../pet/PetPreviewStage";

export function UploadPreview({ activeFrameId, controls, failed, onFrameChange, passed, upload }) {
  const frames = upload.previewFrames?.length ? upload.previewFrames : createFallbackFrames(upload);

  return (
    <PetPreviewStage
      activeStateId={activeFrameId}
      className="pet-info-preview-stage"
      controls={controls}
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
  return [{ id: "idle", label: "待机", durations: [280], frames: [{ column: 0, url: upload.previewUrl }] }];
}
