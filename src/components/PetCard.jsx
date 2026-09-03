import { Heart } from "lucide-react";
import { useState } from "react";

export function PetCard({ onSelect, pet, isLiked, onFavorite }) {
  const [failed, setFailed] = useState(false);
  return (
    <article className="pet-card">
      <button className="pet-card-main" type="button" aria-label={"查看 " + pet.displayName + " 详情"} onClick={() => onSelect(pet)}>
        <div className="sprite-stage">
          <div className="catalog-sprite-window">
            {failed ? <span className="sprite-error">图片暂不可用</span> : <img className="catalog-spritesheet" src={pet.spritesheetPath} alt={pet.displayName + " 待机预览"} loading="lazy" width="1536" height={pet.height} onError={() => setFailed(true)} />}
          </div>
        </div>
        <div className="pet-meta">
          <h2>{pet.displayName}</h2>
          <p>by {pet.author}</p>
        </div>
      </button>
      <div className="card-quick-actions">
        <button type="button" aria-label={"收藏 " + pet.displayName} aria-pressed={isLiked} title={isLiked ? "取消收藏" : "收藏"} onClick={() => onFavorite(pet.id)}><Heart size={18} fill={isLiked ? "currentColor" : "none"} /></button>
      </div>
    </article>
  );
}
