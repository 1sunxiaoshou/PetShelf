import { ArrowLeft, Copy, Download, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { PixelPet } from "../components/PixelArt";
import { PetPreviewStage } from "../components/pet/PetPreviewStage";
import { createPreviewFramesFromUrl } from "../utils/spritePreview";

export function PetDetailPage({ onBack, pet }) {
  const [activeState, setActiveState] = useState("idle");
  const [previewFrames, setPreviewFrames] = useState([]);
  const [previewFailed, setPreviewFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setPreviewFrames([]);
    setPreviewFailed(false);
    setActiveState("idle");

    if (!pet.spritesheetPath?.startsWith("/")) return undefined;

    createPreviewFramesFromUrl(pet.spritesheetPath)
      .then((frames) => {
        if (!cancelled) setPreviewFrames(frames);
      })
      .catch(() => {
        if (!cancelled) setPreviewFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [pet]);

  return (
    <main className="main-content detail-content">
      <button className="detail-back" type="button" onClick={onBack}>
        <ArrowLeft size={18} />
        返回宠物列表
      </button>

      <section className="pet-detail" aria-labelledby="pet-detail-title">
        <div className="pet-detail-meta">
          <p className="detail-kicker">Codex Pet</p>
          <h1 id="pet-detail-title">{pet.displayName}</h1>
          <p className="detail-description">{pet.description}</p>

          <div className="detail-actions">
            <button className="upload-button" type="button">
              <Download size={18} />
              下载
            </button>
            <button className="secondary-button" type="button">
              <Heart size={18} />
              喜欢
            </button>
          </div>

          <dl className="detail-meta-list">
            <div>
              <dt>作者</dt>
              <dd>{pet.author}</dd>
            </div>
            <div>
              <dt>Manifest ID</dt>
              <dd>
                <code>{pet.manifestId}</code>
                <button className="copy-button" type="button" aria-label={`复制 ${pet.manifestId}`}>
                  <Copy size={15} />
                </button>
              </dd>
            </div>
            <div>
              <dt>下载</dt>
              <dd>{pet.downloads}</dd>
            </div>
            <div>
              <dt>喜欢</dt>
              <dd>{pet.likes}</dd>
            </div>
          </dl>
        </div>

        <PetPreviewStage
          activeStateId={activeState}
          className="pet-detail-preview"
          failed={previewFailed}
          fallbackPreview={
            <div className="pet-preview-fallback-pet" style={{ "--pet-tone": pet.tone }}>
              <PixelPet type={pet.sprite} />
            </div>
          }
          frames={previewFrames}
          onStateChange={setActiveState}
          petName={pet.displayName}
        />
      </section>

      <section className="compatibility-panel" aria-labelledby="compatibility-title">
        <h2 id="compatibility-title">包结构</h2>
        <dl>
          <div>
            <dt>Atlas</dt>
            <dd>{pet.atlas.width} x {pet.atlas.height}</dd>
          </div>
          <div>
            <dt>网格</dt>
            <dd>{pet.atlas.columns} x {pet.atlas.rows}</dd>
          </div>
          <div>
            <dt>单格</dt>
            <dd>{pet.atlas.cellWidth} x {pet.atlas.cellHeight}</dd>
          </div>
          <div>
            <dt>Spritesheet</dt>
            <dd>{pet.packageManifest.spritesheetPath}</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
