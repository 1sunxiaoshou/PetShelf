import { useState } from "react";
import { PetInfoCard } from "../components/pet/PetInfoCard";

export function PetDetailPage({ onClose, pet, isLiked, onLike }) {
  const [activeState, setActiveState] = useState("idle");

  return (
    <div className="modal-backdrop" role="presentation">
      <PetInfoCard
        activeState={activeState}
        onClose={onClose}
        onStateChange={setActiveState}
        pet={pet}
        isLiked={isLiked}
        onLike={onLike}
      />
    </div>
  );
}
