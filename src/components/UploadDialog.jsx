import { AlertCircle, Check, FolderOpen, X } from "lucide-react";
import { UPLOAD_STEPS } from "../constants/petAtlas";
import { PixelPet } from "./PixelArt";

export function UploadDialog({ upload, onClose }) {
  const passed = upload.status === "preview";
  const failed = upload.status === "failed";
  const doneLimit = passed ? 3 : failed ? 2 : 1;
  const currentIndex = passed ? 3 : failed ? 2 : 1;

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

        <div className="upload-preview">
          <div className="upload-art">
            {failed ? <AlertCircle size={38} /> : <PixelPet type="foxTiny" />}
          </div>
          <div className="upload-file">
            <FolderOpen size={22} />
            <div>
              <strong>{upload.manifest?.displayName || upload.folderName}</strong>
              <span>{upload.fileCount} 个文件 · {upload.size}</span>
            </div>
          </div>
        </div>

        {upload.manifest && (
          <div className="manifest-summary">
            <span>ID：{upload.manifest.id}</span>
            <span>spritesheet：{upload.manifest.spritesheetPath}</span>
            <span>{upload.manifest.description}</span>
          </div>
        )}

        <div className="validation-list" aria-label="校验结果">
          {upload.checks.map((check) => (
            <div className={check.ok ? "validation-item ok" : "validation-item error"} key={check.label}>
              <span>{check.ok ? <Check size={14} /> : <X size={14} />}</span>
              <strong>{check.label}</strong>
              <em>{check.detail}</em>
            </div>
          ))}
        </div>

        <ol className="upload-steps">
          {UPLOAD_STEPS.map((step, index) => {
            const isDone = index < doneLimit;
            const isCurrent = index === currentIndex;
            return (
              <li key={step} className={isDone ? "done" : isCurrent ? "current" : ""}>
                <span>{isDone ? <Check size={14} /> : index + 1}</span>
                {step}
              </li>
            );
          })}
        </ol>

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
