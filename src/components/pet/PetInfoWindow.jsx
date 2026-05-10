import { Leaf, Sparkles, X } from "lucide-react";

export function PetInfoWindow({
  ariaLabel,
  children,
  className = "",
  closeLabel = "关闭窗口",
  onClose,
  preview,
  title = "桌宠信息"
}) {
  return (
    <section className={["pet-info-card", className].filter(Boolean).join(" ")} role="dialog" aria-modal="true" aria-label={ariaLabel || title}>
      <header className="pet-info-card-header">
        <div className="pet-info-card-title">
          <span className="pet-info-card-mark" aria-hidden="true">
            <Leaf size={28} />
          </span>
          <h1>{title}</h1>
          <span className="pet-info-card-sparkle" aria-hidden="true">
            <Sparkles size={14} />
          </span>
        </div>
        {onClose && (
          <button className="pet-info-card-close" type="button" aria-label={closeLabel} onClick={onClose}>
            <X size={24} />
          </button>
        )}
      </header>

      <div className="pet-info-card-body">
        <aside className="pet-info-panel-card">
          <div className="pet-info-panel-content">
            {children}
          </div>
        </aside>

        <div className="pet-info-preview-card">
          {preview}
        </div>
      </div>
    </section>
  );
}
