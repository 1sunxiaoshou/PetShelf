import { PetPreviewStage } from "../pet/PetPreviewStage";

export function UploadPreview({ activeFrameId, controls, failed, onFrameChange, passed, upload }) {
  return (
    <PetPreviewStage
      activeStateId={activeFrameId}
      className="pet-info-preview-stage"
      controls={controls}
      failed={failed}
      spritesheetUrl={upload.spritesheetUrl}
      onStateChange={onFrameChange}
      petName={upload.manifest?.displayName || "宠物"}
      ready={passed && Boolean(upload.spritesheetUrl)}
    />
  );
}
