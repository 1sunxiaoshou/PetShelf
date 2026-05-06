import { PixelPet } from "./PixelArt";

export function EmptyState({ query, onClear }) {
  return (
    <section className="empty-state" aria-live="polite">
      <div className="empty-pet">
        <PixelPet type="slime" />
      </div>
      <h2>{query ? `没有找到「${query}」` : "还没有宠物"}</h2>
      <p>{query ? "试试换个名字或作者搜索。" : "第一只宠物上传后，这里会出现资源卡片。"}</p>
      {query && (
        <button className="secondary-button" type="button" onClick={onClear}>
          清空搜索
        </button>
      )}
    </section>
  );
}
