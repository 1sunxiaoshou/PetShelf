import { X } from "lucide-react";

export function UploadDialog({ upload, onClose }) {
  const passed = upload.status === "preview";
  const failed = upload.status === "failed";
  const previewLabel = failed ? "无法生成预览" : "等待宠物预览";

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
          <div className={passed && upload.previewUrl ? "upload-pet-preview ready" : "upload-pet-preview"}>
            {passed && upload.previewUrl ? (
              <img src={upload.previewUrl} alt={`${upload.manifest.displayName} 静态预览`} />
            ) : (
              <span>{previewLabel}</span>
            )}
          </div>

          <div className="upload-review-panel">
            {passed ? <PetInfo upload={upload} /> : <ValidationSummary checks={upload.summaryChecks} />}
          </div>
        </div>

        <div className="dialog-actions">
          <button className="secondary-button" type="button" onClick={onClose}>取消</button>
          <button className="upload-button" type="button" onClick={onClose} disabled={!passed}>
            {failed ? "校验未通过" : "确认上传"}
          </button>
        </div>
      </section>
    </div>
  );
}

function ValidationSummary({ checks }) {
  return (
    <div className="validation-summary" aria-label="校验结果">
      {checks.map((check, index) => (
        <div className={check.ok ? "summary-row" : "summary-row error"} key={check.key}>
          <span className="summary-index">{index + 1}</span>
          <div>
            <strong>{check.title}</strong>
            <p>{check.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function PetInfo({ upload }) {
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
          <dt>描述</dt>
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
