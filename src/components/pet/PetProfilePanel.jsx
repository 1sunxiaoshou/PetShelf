import "./PetProfilePanel.css";

export function PetProfilePanel({
  author = "",
  description,
  nickname
}) {
  return (
    <div className="pet-profile-panel">
      <div className="pet-profile-header">
        <h2 className="pet-profile-name">{nickname}</h2>
        <div className="pet-profile-meta">
          {author && <span className="pet-profile-author">作者: {author}</span>}
        </div>
      </div>

      <div className="pet-profile-body">
        <p className="pet-profile-description">{description}</p>
      </div>
    </div>
  );
}
