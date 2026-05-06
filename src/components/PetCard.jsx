import { Download, Heart } from "lucide-react";
import { PixelPet } from "./PixelArt";

export function PetCard({ pet }) {
  return (
    <article className="pet-card">
      <div className="sprite-stage" style={{ "--pet-tone": pet.tone }}>
        <PixelPet type={pet.sprite} />
        <div className="card-quick-actions" aria-hidden="true">
          <button type="button" tabIndex={-1}>
            <Download size={18} />
          </button>
          <button type="button" tabIndex={-1}>
            <Heart size={18} />
          </button>
        </div>
      </div>
      <div className="pet-meta">
        <h2>{pet.displayName}</h2>
        <p>by {pet.author}</p>
        <div className="pet-stats">
          <span><Download size={16} />{pet.downloads}</span>
          <span><Heart size={16} />{pet.likes}</span>
        </div>
      </div>
    </article>
  );
}
