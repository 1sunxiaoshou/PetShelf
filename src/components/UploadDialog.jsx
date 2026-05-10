import { Check, X } from "lucide-react";
import { useState } from "react";
import { PetInfoWindow } from "./pet/PetInfoWindow";
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
      <PetInfoWindow
        ariaLabel="上传预览"
        closeLabel="关闭上传弹窗"
        onClose={onClose}
        preview={
          <UploadPreview
            activeFrameId={activeFrameId}
            controls={
              <div className="preview-actions" aria-label="上传操作">
                <button className="btn-cancel" type="button" aria-label="取消上传" title="取消上传" onClick={onClose}>
                  <X size={24} />
                </button>
                <button className="btn-confirm" type="button" aria-label="确认上传" title="确认上传" disabled={!passed} onClick={onClose}>
                  <Check size={25} />
                </button>
              </div>
            }
            failed={failed}
            onFrameChange={setActiveFrameId}
            passed={passed}
            upload={upload}
          />
        }
        title="上传预览"
      >
        {passed ? <UploadPetInfo upload={upload} /> : <UploadChecklist steps={steps} />}
      </PetInfoWindow>
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
