import { PixelAvatar, PixelPet } from "./PixelArt";

export function UserPanel({ activeTab, likedPets, onClose, onTabChange, uploadedPets }) {
  const list = activeTab === "uploads" ? uploadedPets : likedPets;

  return (
    <section className="user-panel" aria-label="用户面板">
      <div className="user-summary">
        <PixelAvatar />
        <div>
          <strong>PixelPanda</strong>
          <span>petshelf.dev/u/pixelpanda</span>
        </div>
        <button className="small-button" type="button" onClick={onClose}>
          管理信息
        </button>
      </div>

      <div className="user-tabs" role="tablist" aria-label="用户资源">
        <button
          className={activeTab === "uploads" ? "active" : ""}
          type="button"
          role="tab"
          aria-selected={activeTab === "uploads"}
          onClick={() => onTabChange("uploads")}
        >
          我的上传
        </button>
        <button
          className={activeTab === "likes" ? "active" : ""}
          type="button"
          role="tab"
          aria-selected={activeTab === "likes"}
          onClick={() => onTabChange("likes")}
        >
          我的点赞
        </button>
      </div>

      <div className="user-list">
        {list.map((pet) => (
          <div className="mini-pet" key={pet.id}>
            <PixelPet type={pet.sprite} />
            <div>
              <strong>{pet.displayName}</strong>
              <span>{activeTab === "uploads" ? `${pet.downloads} 下载` : `${pet.likes} 喜欢`}</span>
            </div>
            {activeTab === "uploads" && <button type="button">管理</button>}
          </div>
        ))}
      </div>
    </section>
  );
}
