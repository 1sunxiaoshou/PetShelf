import { ChevronLeft, ChevronRight, LoaderCircle, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function PetPreviewStage({
  activeStateId,
  className = "",
  controls = null,
  emptyLabel = "等待宠物预览",
  failed = false,
  frames = [],
  fallbackPreview = null,
  onStateChange,
  petName,
  ready = true
}) {
  const previewStates = frames.filter((state) => state.frames?.[0]?.url);
  const activeState = previewStates.find((state) => state.id === activeStateId) || previewStates[0];
  const activeStateIndex = Math.max(0, previewStates.findIndex((state) => state.id === activeState?.id));
  const visibleStates = getVisibleStates(previewStates, activeStateIndex);
  const [activeFrameIndex, setActiveFrameIndex] = useState(0);
  const [stripMotion, setStripMotion] = useState("");
  const [stripMotionKey, setStripMotionKey] = useState(0);
  const previousStateIndexRef = useRef(activeStateIndex);
  const activeFrame = activeState?.frames?.[activeFrameIndex] || activeState?.frames?.[0];
  const hasStates = previewStates.length > 0;
  const canRender = ready && (activeFrame || fallbackPreview);
  const rootClassName = ["pet-preview-stage", ready ? "ready" : "", className].filter(Boolean).join(" ");

  const selectRelativeState = (direction) => {
    if (!hasStates) return;
    const nextIndex = wrapIndex(activeStateIndex + direction, previewStates.length);
    onStateChange?.(previewStates[nextIndex].id);
  };

  useEffect(() => {
    setActiveFrameIndex(0);
  }, [activeState?.id]);

  useEffect(() => {
    const previousIndex = previousStateIndexRef.current;

    if (!hasStates || previousIndex === activeStateIndex) return;

    setStripMotion(getMotionDirection(previousIndex, activeStateIndex, previewStates.length));
    setStripMotionKey((key) => key + 1);
    previousStateIndexRef.current = activeStateIndex;
  }, [activeStateIndex, hasStates, previewStates.length]);

  useEffect(() => {
    if (!ready || !activeState || !activeState.frames || activeState.frames.length <= 1) return undefined;

    const duration = activeState.durations?.[activeFrameIndex] ?? 140;
    const timer = window.setTimeout(() => {
      setActiveFrameIndex((index) => (index + 1) % activeState.frames.length);
    }, duration);

    return () => window.clearTimeout(timer);
  }, [activeFrameIndex, activeState, ready]);

  return (
    <div className={rootClassName}>
      {canRender ? (
        <div className="pet-preview-render-panel">
          <div className="pet-preview-render-stage">
            {activeFrame ? (
              <img src={activeFrame.url} alt={`${petName} ${activeState.label}预览`} />
            ) : (
              <div className="pet-preview-fallback" aria-label={`${petName} 预览`}>
                {fallbackPreview}
              </div>
            )}
          </div>
          {(hasStates || controls) && (
            <div className={["pet-preview-bottom-controls", controls ? "with-actions" : ""].filter(Boolean).join(" ")}>
              {hasStates && <div className="pet-preview-state-row" aria-label="宠物状态预览">
                <button className="state-arrow" type="button" aria-label="查看上一个状态" onClick={() => selectRelativeState(-1)}>
                  <ChevronLeft size={20} />
                </button>
                <div
                  className={["pet-preview-state-strip", stripMotion ? `slide-${stripMotion}` : ""].filter(Boolean).join(" ")}
                  key={stripMotionKey}
                >
                  {visibleStates.map((state, index) => state ? (
                    <button
                      key={state.id}
                      aria-pressed={activeState.id === state.id}
                      className={[
                        "pet-preview-state-thumb",
                        activeState.id === state.id ? "active" : ""
                      ].filter(Boolean).join(" ")}
                      type="button"
                      onClick={() => onStateChange?.(state.id)}
                    >
                      <img src={state.frames[0].url} alt="" />
                      <span>{state.label}</span>
                    </button>
                  ) : (
                    <span className="pet-preview-state-spacer" aria-hidden="true" key={`spacer-${index}`} />
                  ))}
                </div>
                <button className="state-arrow" type="button" aria-label="查看下一个状态" onClick={() => selectRelativeState(1)}>
                  <ChevronRight size={20} />
                </button>
              </div>}
              {controls && <div className="pet-preview-inline-controls">{controls}</div>}
            </div>
          )}
        </div>
      ) : failed ? (
        <div className="pet-preview-state error" aria-label="预览生成失败">
          <XCircle size={30} />
          <span>预览失败</span>
        </div>
      ) : (
        <div className="pet-preview-state" aria-label={emptyLabel}>
          <LoaderCircle className="spin-icon" size={26} />
          <span>{emptyLabel}</span>
        </div>
      )}
    </div>
  );
}

function getVisibleStates(frames, activeIndex) {
  if (frames.length === 0) return [null, null, null, null, null];
  if (frames.length === 1) return [null, null, frames[0], null, null];
  if (frames.length === 2) return [null, frames[wrapIndex(activeIndex - 1, frames.length)], frames[activeIndex], frames[wrapIndex(activeIndex + 1, frames.length)], null];
  if (frames.length === 3) return [frames[wrapIndex(activeIndex - 2, frames.length)], frames[wrapIndex(activeIndex - 1, frames.length)], frames[activeIndex], frames[wrapIndex(activeIndex + 1, frames.length)], frames[wrapIndex(activeIndex + 2, frames.length)]];
  return [-2, -1, 0, 1, 2].map((offset) => frames[wrapIndex(activeIndex + offset, frames.length)]);
}

function wrapIndex(index, length) {
  return (index + length) % length;
}

function getMotionDirection(previousIndex, nextIndex, length) {
  if (length <= 1) return "next";
  const forwardSteps = (nextIndex - previousIndex + length) % length;
  const backwardSteps = (previousIndex - nextIndex + length) % length;
  return forwardSteps <= backwardSteps ? "next" : "prev";
}
