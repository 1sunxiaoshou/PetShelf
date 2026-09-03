import { ChevronLeft, ChevronRight, LoaderCircle, Pause, Play, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getAnimationStates, getFramePosition, getPetAtlas } from "../../constants/petAtlas";

export function PetPreviewStage({
  activeStateId, className = "", controls = null, emptyLabel = "等待宠物预览",
  failed = false, spritesheetUrl = "", spriteVersionNumber = 1,
  onStateChange, petName = "宠物", ready = true
}) {
  const atlas = getPetAtlas(spriteVersionNumber);
  const states = useMemo(() => getAnimationStates(spriteVersionNumber), [spriteVersionNumber]);
  const activeState = states.find((state) => state.id === activeStateId) || states[0];
  const activeIndex = states.indexOf(activeState);
  const [frameIndex, setFrameIndex] = useState(0);
  const [lookDirection, setLookDirection] = useState(0);
  const [imageStatus, setImageStatus] = useState("loading");
  const [paused, setPaused] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [pageVisible, setPageVisible] = useState(!document.hidden);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const motionChange = () => setPaused(preference.matches);
    const visibilityChange = () => setPageVisible(!document.hidden);
    preference.addEventListener("change", motionChange);
    document.addEventListener("visibilitychange", visibilityChange);
    return () => {
      preference.removeEventListener("change", motionChange);
      document.removeEventListener("visibilitychange", visibilityChange);
    };
  }, []);

  useEffect(() => {
    setImageStatus("loading");
    if (!spritesheetUrl) return;
    const image = new Image();
    image.onload = () => setImageStatus(image.naturalWidth === atlas.width && image.naturalHeight === atlas.height ? "ready" : "failed");
    image.onerror = () => setImageStatus("failed");
    image.src = spritesheetUrl;
    return () => { image.onload = null; image.onerror = null; };
  }, [spritesheetUrl, atlas.width, atlas.height]);

  useEffect(() => { setFrameIndex(0); setLookDirection(0); }, [activeState.id, spritesheetUrl]);

  useEffect(() => {
    if (paused || !pageVisible || !ready || failed || imageStatus !== "ready" || activeState.id === "look") return;
    const timer = window.setTimeout(() => setFrameIndex((index) => (index + 1) % activeState.columns.length), activeState.durations[frameIndex] ?? 140);
    return () => window.clearTimeout(timer);
  }, [frameIndex, activeState, paused, pageVisible, ready, failed, imageStatus]);

  const usable = Boolean(spritesheetUrl) && imageStatus === "ready" && !failed && ready;
  const frame = getFramePosition(activeState, activeState.id === "look" ? lookDirection : frameIndex);
  const visibleStates = [-2, -1, 0, 1, 2].map((offset) => states[(activeIndex + offset + states.length) % states.length]);
  const selectRelativeState = (offset) => onStateChange?.(states[(activeIndex + offset + states.length) % states.length].id);
  const spriteStyle = (position) => ({
    "--sprite-url": 'url("' + spritesheetUrl + '")',
    "--sprite-x": "-" + position.column * atlas.cellWidth + "px",
    "--sprite-y": "-" + position.row * atlas.cellHeight + "px",
    "--atlas-size": atlas.width + "px " + atlas.height + "px"
  });

  return (
    <div className={("pet-preview-stage-container " + className).trim()}>
      <div className="pet-preview-render-panel">
        <div className="pet-preview-core-viewport">
          {failed || imageStatus === "failed" ? (
            <div className="pet-preview-core-state error" role="status"><XCircle size={30} /><span>预览失败：图片无法读取或尺寸不符</span></div>
          ) : !usable ? (
            <div className="pet-preview-core-state loading" role="status"><LoaderCircle className="spin-icon" size={26} /><span>{spritesheetUrl ? "正在加载预览..." : emptyLabel}</span></div>
          ) : (
            <div className="pet-preview-sprite-stage-wrapper">
              <div className="pet-preview-sprite-display" style={spriteStyle(frame)} role="img" aria-label={petName + " " + activeState.label + " 动作动画"} />
            </div>
          )}
        </div>
        <div className="pet-preview-stage-bottom">
          <div className="pet-preview-state-row" aria-label="宠物状态预览">
            <button className="state-arrow" type="button" aria-label="查看上一个状态" disabled={!usable} onClick={() => selectRelativeState(-1)}><ChevronLeft size={20} /></button>
            <div className="pet-preview-state-strip">
              {visibleStates.map((state) => (
                <button key={state.id} aria-pressed={activeState.id === state.id} disabled={!usable}
                  className={"pet-preview-state-thumb" + (activeState.id === state.id ? " active" : "")}
                  type="button" onClick={() => onStateChange?.(state.id)}>
                  <div className="pet-preview-thumb-sprite-container">
                    {usable && <div className="pet-preview-thumb-sprite" style={spriteStyle(getFramePosition(state))} />}
                  </div>
                  <span>{state.label}</span>
                </button>
              ))}
            </div>
            <button className="state-arrow" type="button" aria-label="查看下一个状态" disabled={!usable} onClick={() => selectRelativeState(1)}><ChevronRight size={20} /></button>
          </div>
          <div className="playback-controls">
            {activeState.id === "look" ? (
              <label className="direction-control">
                <span>环视 {lookDirection * 22.5}°</span>
                <input type="range" min="0" max="15" step="1" value={lookDirection} aria-label="环视方向" disabled={!usable} onChange={(event) => setLookDirection(Number(event.target.value))} />
              </label>
            ) : (
              <>
                <button type="button" disabled={!usable} onClick={() => setPaused((value) => !value)} aria-label={paused ? "播放动画" : "暂停动画"}>{paused ? <Play size={15} /> : <Pause size={15} />}{paused ? "播放" : "暂停"}</button>
                <input type="range" min="0" max={activeState.columns.length - 1} step="1" value={frameIndex % activeState.columns.length} aria-label="动画帧" disabled={!usable}
                  onChange={(event) => { setPaused(true); setFrameIndex(Number(event.target.value)); }} />
                <span>{activeState.label}</span>
              </>
            )}
          </div>
          {controls && <div className="pet-preview-inline-controls">{controls}</div>}
        </div>
      </div>
    </div>
  );
}
