import { PetProfilePanel } from "../pet/PetProfilePanel";

export function UploadPetInfo({ upload }) {
  const nickname = upload.manifest.displayName || upload.manifest.id;

  return (
    <PetProfilePanel
      description={upload.manifest.description}
      id={upload.manifest.id}
      nickname={nickname}
    />
  );
}
