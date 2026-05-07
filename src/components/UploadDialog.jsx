import { Check, ChevronLeft, ChevronRight, LoaderCircle, X, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

export function UploadDialog({ upload, onClose }) {
  const passed = upload.status === "preview";
  const failed = upload.status === "failed";
  const steps = getUploadSteps(upload);
  const [activeFrameId, setActiveFrameId] = useState("idle");

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="upload-dialog" role="dialog" aria-modal="true" aria-labelledby="upload-title">
        <div className="dialog-header">
          <div>
            <p>上传预览</p>
            <h2 id="upload-title">确认宠物资源</h2>
          </div>
          <button className="icon-button" type="button" aria-label="关闭上传弹窗" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="upload-review">
          <div className="upload-review-panel">
            {passed ? <UploadPetInfo upload={upload} /> : <UploadChecklist steps={steps} />}
          </div>

          <UploadPreview
            activeFrameId={activeFrameId}
            failed={failed}
            onFrameChange={setActiveFrameId}
            passed={passed}
            upload={upload}
          />
        </div>

        <div className="dialog-actions">
          <button className="secondary-button" type="button" onClick={onClose}>取消</button>
          {passed && (
            <button className="upload-button" type="button" onClick={onClose}>
              确认上传
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

function UploadChecklist({ steps }) {
  return (
    <div className="upload-checklist" aria-label="上传检查进度">
      {steps.map((step) => (
        <UploadCheckItem key={step.id} step={step} />
      ))}
    </div>
  );
}

function UploadCheckItem({ step }) {
  return (
    <div className={`upload-check-item ${step.status}`}>
      <span className="upload-check-icon" aria-hidden="true">
        <StepIcon status={step.status} />
      </span>
      <div>
        <strong>{step.label}</strong>
        {step.detail && <p>{step.detail}</p>}
      </div>
    </div>
  );
}

function StepIcon({ status }) {
  if (status === "success") return <Check size={18} />;
  if (status === "error") return <XCircle size={18} />;
  if (status === "running") return <LoaderCircle className="spin-icon" size={18} />;
  return <span className="pending-dot" />;
}

function UploadPreview({ activeFrameId, failed, onFrameChange, passed, upload }) {
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

function UploadPetInfo({ upload }) {
  return (
    <div className="pet-info-panel">
      <div className="pet-info-heading">
        <span>校验通过</span>
        <h3>{upload.manifest.displayName}</h3>
      </div>
      <dl className="pet-info-list">
        <div>
          <dt>ID</dt>
          <dd>{upload.manifest.id}</dd>
        </div>
        <div>
          <dt>Display Name</dt>
          <dd>{upload.manifest.displayName}</dd>
        </div>
        <div>
          <dt>Description</dt>
          <dd>{upload.manifest.description}</dd>
        </div>
        <div>
          <dt>spritesheet</dt>
          <dd>{upload.manifest.spritesheetPath}</dd>
        </div>
        <div>
          <dt>文件</dt>
          <dd>{upload.fileCount} 个文件 · {upload.size}</dd>
        </div>
      </dl>
    </div>
  );
}

function getUploadSteps(upload) {
  if (upload.status === "preview") {
    return createSteps("success", "success", "success");
  }

  if (upload.status === "failed") {
    const failedStep = getFailedStep(upload.summaryChecks);
    return createSteps(
      "success",
      failedStep.id === "validate" ? "error" : "success",
      failedStep.id === "render" ? "error" : "pending",
      failedStep
    );
  }

  if (upload.status === "rendering") {
    return createSteps("success", "success", "running");
  }

  if (upload.status === "checking") {
    return createSteps("success", "running", "pending");
  }

  return createSteps("running", "pending", "pending");
}

function createSteps(readStatus, validateStatus, renderStatus, failedStep = null) {
  return [
    {
      id: "read",
      label: "读取宠物文件",
      status: readStatus,
      detail: failedStep?.id === "read" ? failedStep.detail : ""
    },
    {
      id: "validate",
      label: "检查宠物格式",
      status: validateStatus,
      detail: failedStep?.id === "validate" ? failedStep.detail : ""
    },
    {
      id: "render",
      label: "生成宠物预览",
      status: renderStatus,
      detail: failedStep?.id === "render" ? failedStep.detail : ""
    }
  ];
}

function getFailedStep(summaryChecks = []) {
  const failedCheck = summaryChecks.find((check) => !check.ok);
  if (!failedCheck) return { id: "validate", detail: "无法解析选择的宠物文件夹" };

  if (failedCheck.key === "spritesheet") {
    return { id: "render", detail: failedCheck.detail };
  }

  return { id: "validate", detail: failedCheck.detail };
}
