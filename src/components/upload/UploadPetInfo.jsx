export function UploadPetInfo({ upload }) {
  return (
    <div className="pet-info-panel">
      <div className="pet-info-heading">
        <h3>{upload.manifest.displayName}</h3>
        <span className="pet-info-id">{upload.manifest.id}</span>
      </div>
      <p className="pet-info-desc">{upload.manifest.description}</p>
    </div>
  );
}
