import { Download, Heart } from "lucide-react";
import { PetProfilePanel } from "./PetProfilePanel";
import { PetInfoWindow } from "./PetInfoWindow";
import { PetPreviewStage } from "./PetPreviewStage";
import { PixelPet } from "../PixelArt";
import { useState, useEffect } from "react";

export function PetInfoCard({
  activeState,
  onClose,
  onStateChange,
  pet
}) {
  const [likesCount, setLikesCount] = useState(pet.likes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [downloadsCount, setDownloadsCount] = useState(pet.downloads || 0);

  // Load the current liked status from DB on detail window opening
  useEffect(() => {
    const checkIfLiked = async () => {
      try {
        const res = await fetch("/api/me/likes", {
          headers: {
            "x-mock-user-id": "local-dev-user",
            "x-mock-user-name": "LocalDevPanda"
          }
        });
        if (res.ok) {
          const likedPets = await res.json();
          const found = likedPets.some(p => p.id === pet.id);
          setIsLiked(found);
        }
      } catch (e) {
        console.error("Failed to query personal like state:", e);
      }
    };
    checkIfLiked();
  }, [pet.id]);

  const handleLike = async () => {
    try {
      const res = await fetch(`/api/pets/${pet.id}/like`, {
        method: "POST",
        headers: {
          "x-mock-user-id": "local-dev-user",
          "x-mock-user-name": "LocalDevPanda"
        }
      });
      if (res.ok) {
        const data = await res.json();
        setIsLiked(data.liked);
        setLikesCount(data.likesCount);
        if (window.refreshPetList) window.refreshPetList();
        if (window.refreshDashboard) window.refreshDashboard();
      }
    } catch (err) {
      console.error("Failed to toggle pet like state:", err);
    }
  };

  const handleDownload = () => {
    setDownloadsCount(prev => prev + 1);
    const downloadUrl = `/api/pets/${pet.id}/download`;
    
    // Create an anchor node to trigger memory stream download
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `${pet.manifestId}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Sync other lists asynchronously after some time
    setTimeout(() => {
      if (window.refreshPetList) window.refreshPetList();
      if (window.refreshDashboard) window.refreshDashboard();
    }, 1000);
  };

  const preview = (
    <PetPreviewStage
      activeStateId={activeState}
      className="pet-info-preview-stage"
      spritesheetUrl={pet.spritesheetPath}
      controls={
        <div className="preview-actions" aria-label="桌宠操作">
          <button 
            className={`btn-like ${isLiked ? "active" : ""}`} 
            type="button" 
            aria-label={`喜欢 ${pet.displayName}`} 
            title={`喜欢 ${likesCount}`}
            onClick={handleLike}
          >
            <Heart size={24} style={{ fill: isLiked ? "#ef4444" : "none", color: isLiked ? "#ef4444" : "currentColor" }} />
          </button>
          <button 
            className="btn-download" 
            type="button" 
            aria-label={`下载 ${pet.displayName}`} 
            title={`下载 ${downloadsCount}`}
            onClick={handleDownload}
          >
            <Download size={24} />
          </button>
        </div>
      }
      fallbackPreview={
        <div className="pet-preview-fallback-pet" style={{ "--pet-tone": pet.tone }}>
          <PixelPet type={pet.sprite} />
        </div>
      }
      onStateChange={onStateChange}
      petName={pet.displayName}
    />
  );

  return (
    <PetInfoWindow
      ariaLabel={`${pet.displayName} 桌宠信息`}
      closeLabel="关闭桌宠详情"
      onClose={onClose}
      preview={preview}
      title="桌宠信息"
    >
      <PetProfilePanel
        author={pet.author}
        description={pet.description}
        id={pet.manifestId}
        nickname={pet.displayName}
      />
    </PetInfoWindow>
  );
}
