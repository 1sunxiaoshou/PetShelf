import { useState } from "react";
import { PetInfoWindow } from "./pet/PetInfoWindow";
import { UploadPetInfo } from "./upload/UploadPetInfo";
import { UploadPreview } from "./upload/UploadPreview";

export function UploadDialog({ upload, onClose }) {
  const passed = upload.status === "preview";
  const failed = upload.status === "failed";
  const [activeFrameId, setActiveFrameId] = useState("idle");
  return (
    <div className="modal-backdrop" role="presentation">
      <PetInfoWindow ariaLabel="本地文件夹预览" closeLabel="关闭本地预览" onClose={onClose} title="本地预览"
        preview={<UploadPreview activeFrameId={activeFrameId} failed={failed} onFrameChange={setActiveFrameId} passed={passed} upload={upload} />}>
        {passed ? <UploadPetInfo upload={upload} /> : (
          <div role="status">
            <h2>{failed ? "文件校验未通过" : "正在检查宠物文件"}</h2>
            {failed && <ul>{upload.errors.map((error, index) => <li key={index}>{error}</li>)}</ul>}
          </div>
        )}
        <div className="pet-provenance">
          <p>{upload.folderName} · {upload.size}</p>
        </div>
      </PetInfoWindow>
    </div>
  );
}
