import { PetProfilePanel } from "../pet/PetProfilePanel";
import { petDescriptions } from "../../data/petCopy";

export function UploadPetInfo({ upload }) {
  const nickname = upload.manifest.displayName || upload.manifest.id;

  return (
    <PetProfilePanel
      description={petDescriptions[upload.manifest.id] || upload.manifest.description}
      id={upload.manifest.id}
      nickname={nickname}
    />
  );
}
