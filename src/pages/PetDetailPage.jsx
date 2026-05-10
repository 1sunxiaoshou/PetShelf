import { useEffect, useState } from "react";
import { PetInfoCard } from "../components/pet/PetInfoCard";
import { createPreviewFramesFromUrl } from "../utils/spritePreview";

export function PetDetailPage({ onClose, pet }) {
  const [activeState, setActiveState] = useState("idle");
  const [previewFrames, setPreviewFrames] = useState([]);
  const [previewFailed, setPreviewFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setPreviewFrames([]);
    setPreviewFailed(false);
    setActiveState("idle");

    if (!pet.spritesheetPath?.startsWith("/")) return undefined;

    createPreviewFramesFromUrl(pet.spritesheetPath)
      .then((frames) => {
        if (!cancelled) setPreviewFrames(frames);
      })
      .catch(() => {
        if (!cancelled) setPreviewFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [pet]);

  return (
    <div className="modal-backdrop" role="presentation">
      <PetInfoCard
        activeState={activeState}
        failed={previewFailed}
        frames={previewFrames}
        onClose={onClose}
        onStateChange={setActiveState}
        pet={pet}
      />
    </div>
  );
}
