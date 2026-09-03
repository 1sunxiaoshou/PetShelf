import { PetPreviewStage } from "../pet/PetPreviewStage";

export function UploadPreview({ activeFrameId, controls, failed, onFrameChange, passed, upload }) {
  return (
    <PetPreviewStage
      activeStateId={activeFrameId}
      className="pet-info-preview-stage"
      controls={controls}
      failed={failed}
      spritesheetUrl={upload.spritesheetUrl}
      spriteVersionNumber={[1, 2].includes(upload.manifest?.spriteVersionNumber) ? upload.manifest.spriteVersionNumber : 1}
      onStateChange={onFrameChange}
      petName={upload.manifest?.displayName || "宠物"}
      ready={passed && Boolean(upload.spritesheetUrl)}
    />
  );
}
