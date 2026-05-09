import { Download, Heart } from "lucide-react";
import { PixelPet } from "./PixelArt";

export function PetCard({ onSelect, pet }) {
  return (
    <article className="pet-card">
      <button className="pet-card-main" type="button" aria-label={`查看 ${pet.displayName} 详情`} onClick={() => onSelect?.(pet)}>
        <div className="sprite-stage" style={{ "--pet-tone": pet.tone }}>
          <PixelPet type={pet.sprite} />
        </div>
        <div className="pet-meta">
          <h2>{pet.displayName}</h2>
          <p>by {pet.author}</p>
          <div className="pet-stats">
            <span><Download size={16} />{pet.downloads}</span>
            <span><Heart size={16} />{pet.likes}</span>
          </div>
        </div>
      </button>
      <div className="card-quick-actions">
        <button type="button" aria-label={`下载 ${pet.displayName}`}>
          <Download size={18} />
        </button>
        <button type="button" aria-label={`喜欢 ${pet.displayName}`}>
          <Heart size={18} />
        </button>
      </div>
    </article>
  );
}
