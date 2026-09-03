import { useEffect, useMemo, useRef, useState } from "react";
import { AppHeader } from "./components/AppHeader";
import { UploadDialog } from "./components/UploadDialog";
import { HomePage } from "./pages/HomePage";
import { PetDetailPage } from "./pages/PetDetailPage";
import { pets } from "./data/pets";
import { formatBytes, totalSize } from "./utils/format";
import { getFolderName, validatePetFolder } from "./utils/uploadValidation";
import { filterPets, readFavorites } from "./utils/demoCatalog";

function getPetIdFromHash() {
  return window.location.hash.match(/^#pet=([a-z0-9-]+)$/i)?.[1] || null;
}

export default function App() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");
  const [favorites, setFavorites] = useState(() => {
    try { return readFavorites(window.localStorage); } catch { return []; }
  });
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState(getPetIdFromHash);
  const [upload, setUpload] = useState(null);
  const [storageWarning, setStorageWarning] = useState("");
  const fileInputRef = useRef(null);
  const previewRequest = useRef(0);
  const selectedPet = pets.find((pet) => pet.id === selectedPetId);
  const visiblePets = useMemo(() => filterPets(pets, query, sort, favoritesOnly ? favorites : null), [query, sort, favoritesOnly, favorites]);

  useEffect(() => {
    const handleHash = () => setSelectedPetId(getPetIdFromHash());
    window.addEventListener("hashchange", handleHash);
    window.addEventListener("popstate", handleHash);
    return () => {
      window.removeEventListener("hashchange", handleHash);
      window.removeEventListener("popstate", handleHash);
    };
  }, []);

  useEffect(() => {
    try { window.localStorage.setItem("petshelf-demo-favorites", JSON.stringify(favorites)); }
    catch { setStorageWarning("浏览器不允许保存收藏，本次收藏仅在当前页面有效。"); }
  }, [favorites]);

  useEffect(() => {
    const url = upload?.spritesheetUrl;
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [upload?.spritesheetUrl]);

  const toggleFavorite = (id) => setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const closeDetail = () => {
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    setSelectedPetId(null);
  };
  const closePreview = () => { previewRequest.current += 1; setUpload(null); };

  const handleFolderSelect = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;
    const request = ++previewRequest.current;
    const base = { folderName: getFolderName(files), fileCount: files.length, size: formatBytes(totalSize(files)) };
    setUpload({ ...base, status: "checking", summaryChecks: [], errors: [] });
    try {
      const result = await validatePetFolder(files);
      if (request !== previewRequest.current) {
        if (result.spritesheetUrl) URL.revokeObjectURL(result.spritesheetUrl);
        return;
      }
      setUpload({ ...base, ...result, status: result.errors.length ? "failed" : "preview" });
    } catch (error) {
      if (request === previewRequest.current) setUpload({ ...base, status: "failed", errors: [error.message], summaryChecks: [{ key: "manifest", ok: false, detail: error.message }] });
    }
  };

  return (
    <div className="app-shell">
      <AppHeader fileInputRef={fileInputRef} onFolderSelect={handleFolderSelect} onQueryChange={setQuery} query={query}
        favoritesOnly={favoritesOnly} onFavoritesToggle={() => setFavoritesOnly((value) => !value)} />
      {storageWarning && <p className="demo-notice" role="status">{storageWarning}</p>}
      {selectedPetId && !selectedPet && <p className="demo-notice" role="status">没有找到这只宠物。<button type="button" onClick={closeDetail}>返回列表</button></p>}
      <HomePage onClearSearch={() => { setQuery(""); setFavoritesOnly(false); }} onPetSelect={(pet) => { window.location.hash = "pet=" + pet.id; }}
        onSortChange={setSort} pets={visiblePets} query={query} sort={sort} favorites={favorites} onFavorite={toggleFavorite} favoritesOnly={favoritesOnly} />
      <footer className="footer">
        <span>© 2026 PetShelf</span>
      </footer>
      {selectedPet && <PetDetailPage key={selectedPet.id} onClose={closeDetail} pet={selectedPet} isLiked={favorites.includes(selectedPet.id)} onLike={() => toggleFavorite(selectedPet.id)} />}
      {upload && <UploadDialog upload={upload} onClose={closePreview} />}
    </div>
  );
}
