import { Bell, ChevronDown, Info, Search, Upload } from "lucide-react";
import { LogoMark, PixelAvatar } from "./PixelArt";
import { UserPanel } from "./UserPanel";

export function AppHeader({
  fileInputRef,
  likedPets,
  onFolderSelect,
  onQueryChange,
  onUserClose,
  onUserToggle,
  query,
  uploadedPets,
  userOpen,
  userTab,
  onUserTabChange
}) {
  return (
    <header className="topbar">
      <a className="brand" href="/" aria-label="PetShelf 首页">
        <LogoMark />
        <span>Pet<span>Shelf</span></span>
      </a>

      <label className="search-box">
        <Search size={20} aria-hidden="true" />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="搜索宠物名称、作者..."
          aria-label="搜索宠物"
        />
        <kbd>/</kbd>
      </label>

      <div className="top-actions">
        <input
          ref={fileInputRef}
          className="visually-hidden"
          type="file"
          multiple
          webkitdirectory=""
          directory=""
          aria-label="选择宠物文件夹"
          onChange={onFolderSelect}
        />
        <a className="top-docs-link" href="/docs/product-plan.md">
          <Info size={18} />
          文档中心
        </a>
        <button className="upload-button" type="button" onClick={() => fileInputRef.current?.click()}>
          <Upload size={18} />
          上传
        </button>
        <button className="icon-button" type="button" aria-label="通知">
          <Bell size={22} />
        </button>
        <div className="user-area">
          <button
            className="avatar-button"
            type="button"
            aria-expanded={userOpen}
            aria-label="打开用户面板"
            onClick={onUserToggle}
          >
            <PixelAvatar />
            <ChevronDown size={18} />
          </button>
          {userOpen && (
            <UserPanel
              activeTab={userTab}
              likedPets={likedPets}
              onClose={onUserClose}
              onTabChange={onUserTabChange}
              uploadedPets={uploadedPets}
            />
          )}
        </div>
      </div>
    </header>
  );
}
