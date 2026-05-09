import { Check, LoaderCircle, XCircle } from "lucide-react";

export function UploadChecklist({ steps }) {
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
