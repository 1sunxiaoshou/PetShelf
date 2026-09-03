import { Download, Heart } from "lucide-react";
import { PetProfilePanel } from "./PetProfilePanel";
import { PetInfoWindow } from "./PetInfoWindow";
import { PetPreviewStage } from "./PetPreviewStage";

export function PetInfoCard({ activeState, onClose, onStateChange, pet, isLiked, onLike }) {
  return (
    <PetInfoWindow ariaLabel={pet.displayName + " 桌宠信息"} closeLabel="关闭桌宠详情" onClose={onClose} title="桌宠信息"
      preview={<PetPreviewStage activeStateId={activeState} className="pet-info-preview-stage" spritesheetUrl={pet.spritesheetPath}
        spriteVersionNumber={pet.spriteVersionNumber} onStateChange={onStateChange} petName={pet.displayName}
        controls={<div className="preview-actions" aria-label="桌宠操作">
          <button className="btn-like" type="button" aria-label={"收藏 " + pet.displayName} aria-pressed={isLiked} title={isLiked ? "取消收藏" : "收藏"} onClick={onLike}><Heart size={24} fill={isLiked ? "currentColor" : "none"} /></button>
          <a className="btn-download" href={"/pets/community/" + pet.id + "/pet.zip"} download={pet.id + ".zip"} aria-label={"下载 " + pet.displayName} title="下载"><Download size={24} /></a>
        </div>} />}
    >
      <PetProfilePanel author={pet.author} description={pet.description} id={pet.manifestId} nickname={pet.displayName} />
      <div className="pet-provenance pet-source-links">
        <a href={pet.sourceUrl} target="_blank" rel="noreferrer">来源 ↗</a>
        <a href={pet.licensePath} target="_blank" rel="noreferrer">许可 ↗</a>
      </div>
    </PetInfoWindow>
  );
}
