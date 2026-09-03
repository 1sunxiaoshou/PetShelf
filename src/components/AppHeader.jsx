import { FolderOpen, Heart, Search } from "lucide-react";
import { useEffect, useRef } from "react";
import { LogoMark } from "./PixelArt";

export function AppHeader({ fileInputRef, onFolderSelect, onQueryChange, query, favoritesOnly, onFavoritesToggle }) {
  const searchRef = useRef(null);
  useEffect(() => {
    const shortcut = (event) => {
      if (event.key === "/" && !event.ctrlKey && !event.metaKey && !event.altKey && !event.target.closest('input, textarea, [contenteditable="true"], [role="dialog"]') && !document.querySelector('[role="dialog"]')) {
        event.preventDefault(); searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, []);
  return (
    <header className="topbar">
      <a className="brand" href="/" aria-label="PetShelf 首页"><LogoMark /><span>Pet<span>Shelf</span></span></a>
      <label className="search-box">
        <Search size={20} aria-hidden="true" />
        <input ref={searchRef} value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="搜索宠物名称、作者..." aria-label="搜索宠物" />
        <kbd>/</kbd>
      </label>
      <div className="top-actions">
        <input ref={fileInputRef} className="visually-hidden" type="file" multiple webkitdirectory="" directory="" aria-label="选择宠物文件夹" onChange={onFolderSelect} />
        <button className="top-action-button upload-button" type="button" onClick={() => fileInputRef.current?.click()}><FolderOpen size={18} />本地预览</button>
        <button className="icon-button favorite-filter" type="button" aria-label="查看收藏" aria-pressed={favoritesOnly} title="收藏" onClick={onFavoritesToggle}><Heart size={22} fill={favoritesOnly ? "currentColor" : "none"} /></button>
      </div>
    </header>
  );
}
