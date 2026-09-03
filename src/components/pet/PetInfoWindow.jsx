import { Leaf, Sparkles, X } from "lucide-react";
import { useEffect, useRef } from "react";

export function PetInfoWindow({
  ariaLabel,
  children,
  className = "",
  closeLabel = "关闭窗口",
  onClose,
  preview,
  title = "桌宠信息"
}) {
  const dialogRef = useRef(null);
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);
  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const background = Array.from(document.querySelectorAll('.app-shell > :not(.modal-backdrop)'));
    const previousInert = background.map((element) => element.inert);
    background.forEach((element) => { element.inert = true; });
    document.body.style.overflow = 'hidden';
    dialogRef.current?.querySelector('button')?.focus();
    const onKey = (event) => {
      if (event.key === 'Escape') { event.preventDefault(); closeRef.current?.(); }
      if (event.key !== 'Tab') return;
      const targets = Array.from(dialogRef.current.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled)')).filter((element) => element.getClientRects().length);
      if (!targets.length) return;
      const first = targets[0];
      const last = targets[targets.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      background.forEach((element, index) => { element.inert = previousInert[index]; });
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, []);
  return (
    <section ref={dialogRef} className={["pet-info-card", className].filter(Boolean).join(" ")} role="dialog" aria-modal="true" aria-label={ariaLabel || title}>
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
