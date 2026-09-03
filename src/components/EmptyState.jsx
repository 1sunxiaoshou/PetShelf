import { PixelPet } from "./PixelArt";

export function EmptyState({ query, onClear, favoritesOnly = false }) {
  return (
    <section className="empty-state" aria-live="polite">
      <div className="empty-pet">
        <PixelPet type="slime" />
      </div>
      <h2>{query ? `没有找到「${query}」` : favoritesOnly ? "还没有收藏" : "还没有宠物"}</h2>
      <p>{query ? "试试换个名字或作者搜索。" : "点击宠物卡片上的爱心，收藏喜欢的作品。"}</p>
      {(query || favoritesOnly) && (
        <button className="secondary-button" type="button" onClick={onClear}>
          {query ? "清空搜索" : "浏览全部宠物"}
        </button>
      )}
    </section>
  );
}
