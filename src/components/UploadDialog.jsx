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
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleConfirmUpload = async () => {
    setSubmitting(true);
    setErrorMessage("");
    try {
      const formData = new FormData();
      formData.append("manifest", JSON.stringify(upload.manifest));
      formData.append("spritesheet", upload.spritesheet);

      const res = await fetch("/api/pets", {
        method: "POST",
        headers: {
          "x-mock-user-id": "local-dev-user",
          "x-mock-user-name": "LocalDevPanda"
        },
        body: formData
      });

      if (res.ok) {
        if (window.refreshPetList) window.refreshPetList();
        if (window.refreshDashboard) window.refreshDashboard();
        onClose();
      } else {
        const err = await res.json();
        setErrorMessage(err.error || "上传桌宠失败，请稍后重试");
      }
    } catch (err) {
      setErrorMessage("网络服务异常，请检查后端连接");
    } finally {
      setSubmitting(false);
    }
  };

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
                <button className="btn-cancel" type="button" aria-label="取消上传" title="取消上传" disabled={submitting} onClick={onClose}>
                  <X size={24} />
                </button>
                <button 
                  className={`btn-confirm ${submitting ? "submitting" : ""}`} 
                  type="button" 
                  aria-label="确认上传" 
                  title={submitting ? "正在上传..." : "确认上传"} 
                  disabled={!passed || submitting} 
                  onClick={handleConfirmUpload}
                >
                  {submitting ? <div className="spinner-mini" /> : <Check size={25} />}
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
        {errorMessage && (
          <div className="upload-error-banner" style={{
            background: "rgba(239, 68, 68, 0.15)",
            borderLeft: "4px solid #ef4444",
            color: "#ef4444",
            padding: "10px 14px",
            borderRadius: "6px",
            fontSize: "13px",
            marginBottom: "16px",
            fontWeight: "500"
          }}>
            ⚠️ {errorMessage}
          </div>
        )}
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
