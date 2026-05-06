import { useMemo, useRef, useState } from "react";
import { AppHeader } from "./components/AppHeader";
import { EmptyState } from "./components/EmptyState";
import { PetCard } from "./components/PetCard";
import { UploadDialog } from "./components/UploadDialog";
import { pets, sortOptions } from "./data/pets";
import { formatBytes, parseDownload, totalSize } from "./utils/format";
import { getFolderName, validatePetFolder } from "./utils/uploadValidation";

export default function App() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("hot");
  const [userOpen, setUserOpen] = useState(false);
  const [userTab, setUserTab] = useState("uploads");
  const [upload, setUpload] = useState(null);
  const fileInputRef = useRef(null);

  const filteredPets = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const list = normalized
      ? pets.filter((pet) => `${pet.displayName} ${pet.author}`.toLowerCase().includes(normalized))
      : pets;

    return [...list].sort((a, b) => {
      if (sort === "likes") return b.likes - a.likes;
      if (sort === "downloads") return parseDownload(b.downloads) - parseDownload(a.downloads);
      if (sort === "new") return b.id - a.id;
      return b.likes + parseDownload(b.downloads) - (a.likes + parseDownload(a.downloads));
    });
  }, [query, sort]);

  const handleFolderSelect = async (event) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    const folderName = getFolderName(files);
    const baseUpload = {
      folderName,
      fileCount: files.length,
      size: formatBytes(totalSize(files))
    };

    setUpload({
      ...baseUpload,
      status: "validating",
      manifest: null,
      spritesheet: null,
      previewUrl: "",
      summaryChecks: [
        { key: "size", title: "文件夹大小", ok: true, detail: `${baseUpload.size} / 10 MB` },
        { key: "manifest", title: "pet.json", ok: true, detail: "正在读取" },
        { key: "spritesheet", title: "spritesheet", ok: true, detail: "等待 pet.json" }
      ],
      errors: []
    });

    try {
      const result = await validatePetFolder(files);
      setUpload({
        ...baseUpload,
        ...result,
        status: result.errors.length > 0 ? "failed" : "preview"
      });
    } catch (error) {
      setUpload({
        ...baseUpload,
        status: "failed",
        manifest: null,
        spritesheet: null,
        previewUrl: "",
        summaryChecks: [
          { key: "size", title: "文件夹大小", ok: true, detail: `${baseUpload.size} / 10 MB` },
          { key: "manifest", title: "pet.json", ok: false, detail: error.message || "无法解析选择的文件夹" },
          { key: "spritesheet", title: "spritesheet", ok: false, detail: "未完成校验" }
        ],
        errors: [error.message || "无法解析选择的文件夹"]
      });
    }

    event.target.value = "";
  };

  return (
    <div className="app-shell">
      <AppHeader
        fileInputRef={fileInputRef}
        likedPets={pets.slice(3, 6)}
        onFolderSelect={handleFolderSelect}
        onQueryChange={setQuery}
        onUserClose={() => setUserOpen(false)}
        onUserTabChange={setUserTab}
        onUserToggle={() => setUserOpen((open) => !open)}
        query={query}
        uploadedPets={pets.slice(0, 2)}
        userOpen={userOpen}
        userTab={userTab}
      />

      <main className="main-content">
        <section className="page-heading" aria-labelledby="page-title">
          <div className="heading-left">
            <h1 id="page-title">宠物</h1>
            <div className="sort-row" aria-label="排序方式">
              {sortOptions.map((option) => (
                <button
                  key={option.id}
                  className={sort === option.id ? "sort-pill active" : "sort-pill"}
                  type="button"
                  onClick={() => setSort(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <p className="pet-count">共 {pets.length} 个宠物</p>
        </section>

        {filteredPets.length > 0 ? (
          <section className="pet-grid" aria-label="宠物列表">
            {filteredPets.map((pet) => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </section>
        ) : (
          <EmptyState query={query} onClear={() => setQuery("")} />
        )}
      </main>

      <footer className="footer">
        <span>© 2026 PetShelf</span>
        <span>PetShelf 使用轻量云平台部署，全球 CDN 加速</span>
        <button className="footer-link" type="button">状态页面</button>
        <button className="footer-link" type="button">帮助中心</button>
      </footer>

      {upload && <UploadDialog upload={upload} onClose={() => setUpload(null)} />}
    </div>
  );
}
