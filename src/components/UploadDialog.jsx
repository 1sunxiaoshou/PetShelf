import { X } from "lucide-react";
import { useState } from "react";
import { UploadChecklist } from "./upload/UploadChecklist";
import { UploadPetInfo } from "./upload/UploadPetInfo";
import { UploadPreview } from "./upload/UploadPreview";

export function UploadDialog({ upload, onClose }) {
  const passed = upload.status === "preview";
  const failed = upload.status === "failed";
  const steps = getUploadSteps(upload);
  const [activeFrameId, setActiveFrameId] = useState("idle");

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="upload-dialog" role="dialog" aria-modal="true" aria-label="上传预览">
        <div className="dialog-header">
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
