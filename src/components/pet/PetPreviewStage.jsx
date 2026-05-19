import { ChevronLeft, ChevronRight, LoaderCircle, XCircle } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { PET_ANIMATION_STATES, PET_ATLAS } from "../../constants/petAtlas";

export function PetPreviewStage({
  activeStateId,
  className = "",
  controls = null,
  emptyLabel = "等待宠物预览",
  failed = false,
  spritesheetUrl = "",
  onStateChange,
  petName,
  ready = true
}) {
  const [frameIndex, setFrameIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageLoadingFailed, setImageLoadingFailed] = useState(false);

  // 滑轮动画相关状态
  const [stripMotion, setStripMotion] = useState("");

  // 1. 获取对应的当前动作配置
  const activeState = useMemo(() => {
    return (
      PET_ANIMATION_STATES.find((state) => state.id === activeStateId) ||
      PET_ANIMATION_STATES.find((state) => state.id === "idle") ||
      PET_ANIMATION_STATES[0]
    );
  }, [activeStateId]);

  // 计算当前的索引
  const activeStateIndex = useMemo(() => {
    return Math.max(0, PET_ANIMATION_STATES.findIndex((state) => state.id === activeState.id));
  }, [activeState.id]);

  const previousStateIndexRef = useRef(activeStateIndex);

  // 2. 提取当前应该显示的 5 个状态（环形映射）
  const visibleStates = useMemo(() => {
    return getVisibleStates(PET_ANIMATION_STATES, activeStateIndex);
  }, [activeStateIndex]);

  // 3. 监听 spritesheetUrl 变化，进行图片预加载
  useEffect(() => {
    if (!spritesheetUrl) {
      setImageLoaded(false);
      setImageLoadingFailed(false);
      return undefined;
    }

    setImageLoaded(false);
    setImageLoadingFailed(false);

    const img = new Image();
    img.src = spritesheetUrl;

    img.onload = () => {
      setImageLoaded(true);
    };

    img.onerror = () => {
      setImageLoadingFailed(true);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [spritesheetUrl]);

  // 4. 状态或大图变化时重置帧指针
  useEffect(() => {
    setFrameIndex(0);
  }, [activeState.id, spritesheetUrl]);

  // 5. 监听动作切换，触发滑轮方向过渡动画
  useEffect(() => {
    const previousIndex = previousStateIndexRef.current;
    if (previousIndex === activeStateIndex) return;

    setStripMotion(getMotionDirection(previousIndex, activeStateIndex, PET_ANIMATION_STATES.length));
    previousStateIndexRef.current = activeStateIndex;
  }, [activeStateIndex]);

  // 6. 定时器轮播当前状态的每一帧
  useEffect(() => {
    if (!spritesheetUrl || !imageLoaded || failed || imageLoadingFailed) return undefined;

    const columns = activeState.columns || [];
    if (columns.length <= 1) return undefined;

    const durations = activeState.durations || [];
    const duration = durations[frameIndex] ?? 140;

    const timer = window.setTimeout(() => {
      setFrameIndex((prevIndex) => (prevIndex + 1) % columns.length);
    }, duration);

    return () => window.clearTimeout(timer);
  }, [frameIndex, activeState, spritesheetUrl, imageLoaded, failed, imageLoadingFailed]);

  // 点击左右箭头切换动作状态
  const selectRelativeState = (direction) => {
    const nextIndex = wrapIndex(activeStateIndex + direction, PET_ANIMATION_STATES.length);
    onStateChange?.(PET_ANIMATION_STATES[nextIndex].id);
  };

  // 渲染核心预览区
  const renderCorePreview = () => {
    if (failed || imageLoadingFailed) {
      return (
        <div className="pet-preview-core-state error" aria-label="预览生成失败">
          <XCircle size={30} />
          <span>预览失败</span>
        </div>
      );
    }

    if (!spritesheetUrl) {
      return (
        <div className="pet-preview-core-state empty" aria-label={emptyLabel}>
          <LoaderCircle className="spin-icon" size={26} />
          <span>{emptyLabel}</span>
        </div>
      );
    }

    if (!imageLoaded) {
      return (
        <div className="pet-preview-core-state loading" aria-label="正在加载预览">
          <LoaderCircle className="spin-icon" size={26} />
          <span>正在加载预览...</span>
        </div>
      );
    }

    const currentColumn = activeState.columns?.[frameIndex] ?? 0;
    return (
      <div className="pet-preview-sprite-stage-wrapper">
        <div
          className="pet-preview-sprite-display"
          style={{
            "--sprite-url": `url("${spritesheetUrl}")`,
            "--sprite-x": `-${currentColumn * PET_ATLAS.cellWidth}px`,
            "--sprite-y": `-${activeState.row * PET_ATLAS.cellHeight}px`
          }}
          role="img"
          aria-label={`${petName} ${activeState.label} 动作动画`}
        />
      </div>
    );
  };

  // 渲染单项缩略图的大图定位
  const renderThumbSprite = (state) => {
    if (!spritesheetUrl || !imageLoaded) {
      return <div className="pet-preview-thumb-sprite-placeholder" />;
    }

    return (
      <div
        className="pet-preview-thumb-sprite"
        style={{
          "--sprite-url": `url("${spritesheetUrl}")`,
          "--sprite-y": `-${state.row * PET_ATLAS.cellHeight}px`
        }}
      />
    );
  };

  const hasStates = spritesheetUrl && imageLoaded && !failed && !imageLoadingFailed;

  return (
    <div className={`pet-preview-stage-container ${className}`.trim()}>
      <div className="pet-preview-render-panel">

        {/* 核心视口 */}
        <div className="pet-preview-core-viewport">
          {renderCorePreview()}
        </div>

        {/* 底部动作滑轮条 */}
        <div className="pet-preview-stage-bottom">
          <div className="pet-preview-state-row" aria-label="宠物状态预览">
            <button
              className="state-arrow"
              type="button"
              aria-label="查看上一个状态"
              disabled={!hasStates}
              onClick={() => selectRelativeState(-1)}
            >
              <ChevronLeft size={20} />
            </button>

            <div
              className={[
                "pet-preview-state-strip",
                stripMotion ? `slide-${stripMotion}` : ""
              ].filter(Boolean).join(" ")}
              onAnimationEnd={() => setStripMotion("")}
            >
              {visibleStates.map((state, index) => {
                if (!state) {
                  return (
                    <span
                      className="pet-preview-state-spacer"
                      aria-hidden="true"
                      key={`spacer-${index}`}
                    />
                  );
                }

                const isActive = activeState.id === state.id;
                return (
                  <button
                    key={state.id}
                    aria-pressed={isActive}
                    disabled={!hasStates}
                    className={[
                      "pet-preview-state-thumb",
                      isActive ? "active" : ""
                    ].filter(Boolean).join(" ")}
                    type="button"
                    onClick={() => onStateChange?.(state.id)}
                  >
                    <div className="pet-preview-thumb-sprite-container">
                      {renderThumbSprite(state)}
                    </div>
                    <span>{state.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              className="state-arrow"
              type="button"
              aria-label="查看下一个状态"
              disabled={!hasStates}
              onClick={() => selectRelativeState(1)}
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* 操作区 */}
          {controls && <div className="pet-preview-inline-controls">{controls}</div>}
        </div>

      </div>
    </div>
  );
}

// 环形排列展示函数
function getVisibleStates(frames, activeIndex) {
  if (frames.length === 0) return [null, null, null, null, null];
  if (frames.length === 1) return [null, null, frames[0], null, null];
  if (frames.length === 2) {
    return [
      null,
      frames[wrapIndex(activeIndex - 1, frames.length)],
      frames[activeIndex],
      frames[wrapIndex(activeIndex + 1, frames.length)],
      null
    ];
  }
  if (frames.length === 3) {
    return [
      frames[wrapIndex(activeIndex - 2, frames.length)],
      frames[wrapIndex(activeIndex - 1, frames.length)],
      frames[activeIndex],
      frames[wrapIndex(activeIndex + 1, frames.length)],
      frames[wrapIndex(activeIndex + 2, frames.length)]
    ];
  }
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
