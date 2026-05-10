import { Download, Heart } from "lucide-react";
import { PetProfilePanel } from "./PetProfilePanel";
import { PetInfoWindow } from "./PetInfoWindow";
import { PetPreviewStage } from "./PetPreviewStage";
import { PixelPet } from "../PixelArt";

export function PetInfoCard({
  activeState,
  failed,
  frames,
  onClose,
  onStateChange,
  pet
}) {
  const preview = (
    <PetPreviewStage
      activeStateId={activeState}
      className="pet-info-preview-stage"
      failed={failed}
      controls={
        <div className="preview-actions" aria-label="桌宠操作">
          <button className="btn-like" type="button" aria-label={`喜欢 ${pet.displayName}`} title={`喜欢 ${pet.likes}`}>
            <Heart size={24} />
          </button>
          <button className="btn-download" type="button" aria-label={`下载 ${pet.displayName}`} title={`下载 ${pet.downloads}`}>
            <Download size={24} />
          </button>
        </div>
      }
      fallbackPreview={
        <div className="pet-preview-fallback-pet" style={{ "--pet-tone": pet.tone }}>
          <PixelPet type={pet.sprite} />
        </div>
      }
      frames={frames}
      onStateChange={onStateChange}
      petName={pet.displayName}
    />
  );

  return (
    <PetInfoWindow
      ariaLabel={`${pet.displayName} 桌宠信息`}
      closeLabel="关闭桌宠详情"
      onClose={onClose}
      preview={preview}
      title="桌宠信息"
    >
      <PetProfilePanel
        author={pet.author}
        description={pet.description}
        id={pet.manifestId}
        nickname={pet.displayName}
      />
    </PetInfoWindow>
  );
}
