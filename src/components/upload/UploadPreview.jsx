import { ChevronLeft, ChevronRight, LoaderCircle, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

export function UploadPreview({ activeFrameId, failed, onFrameChange, passed, upload }) {
  const frames = upload.previewFrames?.length ? upload.previewFrames : createFallbackFrames(upload);
  const activeState = frames.find((frame) => frame.id === activeFrameId) || frames[0];
  const activeStateIndex = Math.max(0, frames.findIndex((frame) => frame.id === activeState?.id));
  const visibleStates = getVisibleStates(frames, activeStateIndex);
  const [activeFrameIndex, setActiveFrameIndex] = useState(0);
  const className = passed && upload.previewUrl ? "upload-pet-preview ready" : "upload-pet-preview";

  const selectRelativeState = (direction) => {
    if (frames.length === 0) return;
    const nextIndex = wrapIndex(activeStateIndex + direction, frames.length);
    onFrameChange(frames[nextIndex].id);
  };

  useEffect(() => {
    setActiveFrameIndex(0);
  }, [activeState?.id]);

  useEffect(() => {
    if (!passed || !activeState || activeState.frames.length <= 1) return undefined;

    const duration = activeState.durations[activeFrameIndex] ?? 140;
    const timer = window.setTimeout(() => {
      setActiveFrameIndex((index) => (index + 1) % activeState.frames.length);
    }, duration);

    return () => window.clearTimeout(timer);
  }, [activeFrameIndex, activeState, passed]);

  const activeFrame = activeState?.frames[activeFrameIndex] || activeState?.frames[0];

  return (
    <div className={className}>
      {passed && activeState && activeFrame ? (
        <div className="upload-render-panel">
          <div className="upload-render-stage">
            <img src={activeFrame.url} alt={`${upload.manifest.displayName} ${activeState.label}预览`} />
          </div>
          <div className="upload-state-row" aria-label="宠物状态预览">
            <button className="state-arrow" type="button" aria-label="查看上一个状态" onClick={() => selectRelativeState(-1)}>
              <ChevronLeft size={20} />
            </button>
            <div className="upload-state-strip">
              {visibleStates.map((frame, index) => frame ? (
                <button
                  key={frame.id}
                  aria-pressed={activeState.id === frame.id}
                  className={activeState.id === frame.id ? "upload-state-thumb active" : "upload-state-thumb"}
                  type="button"
                  onClick={() => onFrameChange(frame.id)}
                >
                  <img src={frame.frames[0].url} alt="" />
                  <span>{frame.label}</span>
                </button>
              ) : (
                <span className="upload-state-spacer" aria-hidden="true" key={`spacer-${index}`} />
              ))}
            </div>
            <button className="state-arrow" type="button" aria-label="查看下一个状态" onClick={() => selectRelativeState(1)}>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      ) : failed ? (
        <div className="upload-preview-state error" aria-label="预览生成失败">
          <XCircle size={30} />
          <span>预览失败</span>
        </div>
      ) : (
        <div className="upload-preview-state" aria-label="等待预览生成">
          <LoaderCircle className="spin-icon" size={26} />
          <span>等待宠物预览</span>
        </div>
      )}
    </div>
  );
}

function createFallbackFrames(upload) {
  if (!upload.previewUrl) return [];
  return [{ id: "idle", label: "站立", durations: [280], frames: [{ column: 0, url: upload.previewUrl }] }];
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
