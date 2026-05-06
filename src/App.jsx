import { useMemo, useRef, useState } from "react";
import { Bell, Check, ChevronDown, Download, FileArchive, Heart, Info, Search, Upload, X } from "lucide-react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const pets = [
  makePet(1, "orange-cat-dango", "橘猫团子", "PixelPanda", "1.2k", 256, "fox", "#f47b35"),
  makePet(2, "night-black-cat", "黑猫夜行", "Aoi.dev", "987", 201, "blackCat", "#22242b"),
  makePet(3, "dino-rex", "小恐龙 Rex", "CodeLover", "756", 180, "dino", "#65b843"),
  makePet(4, "penguin-bobo", "企鹅波波", "LinCode", "642", 132, "penguin", "#2c6fb9"),
  makePet(5, "shiba-achai", "柴犬阿柴", "ShibaScript", "1.1k", 243, "shiba", "#d58a38"),
  makePet(6, "soft-rabbit", "软萌兔兔", "Bunny.exe", "834", 177, "rabbit", "#ffffff"),
  makePet(7, "pixel-robot", "像素机器人", "ByteCraft", "512", 98, "robot", "#8aa4b8"),
  makePet(8, "slime-ball", "史莱姆球", "SlimeFun", "463", 91, "slime", "#4fc3e8"),
  makePet(9, "parrot-pipi", "绿鹦鹉 PiPi", "FeatherDev", "389", 76, "parrot", "#5aa84a"),
  makePet(10, "tiny-fox-miyou", "小狐狸米柚", "KitsuneLab", "678", 142, "foxTiny", "#ff7337"),
  makePet(11, "calico-meow", "三花喵喵", "MeowCat", "553", 110, "calico", "#f2c0a4"),
  makePet(12, "hedgehog-ball", "刺猬球球", "HedgeLog", "321", 64, "hedgehog", "#8a6d5b")
];

function makePet(id, manifestId, displayName, author, downloads, likes, sprite, tone) {
  const description = `${displayName} 的 Codex 兼容桌宠包。`;
  return {
    id,
    manifestId,
    displayName,
    description,
    author,
    downloads,
    likes,
    sprite,
    tone,
    packageManifest: {
      id: manifestId,
      displayName,
      description,
      spritesheetPath: "spritesheet.webp"
    },
    atlas: {
      columns: 8,
      rows: 9,
      cellWidth: 192,
      cellHeight: 208,
      width: 1536,
      height: 1872
    }
  };
}

const sortOptions = [
  { id: "hot", label: "热门" },
  { id: "new", label: "最新" },
  { id: "downloads", label: "最多下载" },
  { id: "likes", label: "最多喜欢" }
];

function App() {
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

  const startUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUpload({
      fileName: file.name,
      size: `${Math.max(file.size / 1024, 1).toFixed(0)} KB`,
      step: "preview"
    });
    event.target.value = "";
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="PetShelf 首页">
          <LogoMark />
          <span>Pet<span>Shelf</span></span>
        </a>

        <label className="search-box">
          <Search size={20} aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索宠物名称、作者..."
            aria-label="搜索宠物"
          />
          <kbd>/</kbd>
        </label>

        <div className="top-actions">
          <input
            ref={fileInputRef}
            className="visually-hidden"
            type="file"
            accept=".zip,application/zip"
            onChange={startUpload}
          />
          <button className="upload-button" type="button" onClick={() => fileInputRef.current?.click()}>
            <Upload size={18} />
            上传
          </button>
          <a className="top-docs-link" href="/docs/product-plan.md">
            <Info size={18} />
            文档
          </a>
          <button className="icon-button" type="button" aria-label="通知">
            <Bell size={22} />
          </button>
          <div className="user-area">
            <button
              className="avatar-button"
              type="button"
              aria-expanded={userOpen}
              aria-label="打开用户面板"
              onClick={() => setUserOpen((open) => !open)}
            >
              <PixelAvatar />
              <ChevronDown size={18} />
            </button>
            {userOpen && (
              <UserPanel activeTab={userTab} onTabChange={setUserTab} onClose={() => setUserOpen(false)} />
            )}
          </div>
        </div>
      </header>

      <main className="main-content">
        <section className="page-heading" aria-labelledby="page-title">
          <div>
            <h1 id="page-title">宠物</h1>
            <p>共 {pets.length} 个 Codex 兼容宠物，为 Codex 宠物系统收纳可下载的桌宠资源。</p>
          </div>
        </section>

        <section className="sort-row" aria-label="排序方式">
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

function parseDownload(value) {
  return value.endsWith("k") ? Number.parseFloat(value) * 1000 : Number.parseInt(value, 10);
}

function PetCard({ pet }) {
  return (
    <article className="pet-card">
      <div className="sprite-stage" style={{ "--pet-tone": pet.tone }}>
        <PixelPet type={pet.sprite} />
      </div>
      <div className="pet-meta">
        <h2>{pet.displayName}</h2>
        <p>by {pet.author}</p>
        <div className="pet-stats">
          <span><Download size={16} />{pet.downloads}</span>
          <span><Heart size={16} />{pet.likes}</span>
        </div>
      </div>
    </article>
  );
}

function EmptyState({ query, onClear }) {
  return (
    <section className="empty-state" aria-live="polite">
      <div className="empty-pet">
        <PixelPet type="slime" />
      </div>
      <h2>{query ? `没有找到「${query}」` : "还没有宠物"}</h2>
      <p>{query ? "试试换个名字或作者搜索。" : "第一只宠物上传后，这里会出现资源卡片。"}</p>
      {query && (
        <button className="secondary-button" type="button" onClick={onClear}>
          清空搜索
        </button>
      )}
    </section>
  );
}

function UploadDialog({ upload, onClose }) {
  const steps = ["上传", "自动校验文件结构", "解析渲染弹窗", "用户手动确认", "完成上传"];

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
            <PixelPet type="foxTiny" />
          </div>
          <div className="upload-file">
            <FileArchive size={22} />
            <div>
              <strong>{upload.fileName}</strong>
              <span>{upload.size}</span>
            </div>
          </div>
        </div>

        <ol className="upload-steps">
          {steps.map((step, index) => (
            <li key={step} className={index < 3 ? "done" : index === 3 ? "current" : ""}>
              <span>{index < 3 ? <Check size={14} /> : index + 1}</span>
              {step}
            </li>
          ))}
        </ol>

        <div className="dialog-actions">
          <button className="secondary-button" type="button" onClick={onClose}>取消</button>
          <button className="upload-button" type="button" onClick={onClose}>确认上传</button>
        </div>
      </section>
    </div>
  );
}

function UserPanel({ activeTab, onTabChange, onClose }) {
  const uploads = pets.slice(0, 2);
  const liked = pets.slice(3, 6);
  const list = activeTab === "uploads" ? uploads : liked;

  return (
    <section className="user-panel" aria-label="用户面板">
      <div className="user-summary">
        <PixelAvatar />
        <div>
          <strong>PixelPanda</strong>
          <span>petshelf.dev/u/pixelpanda</span>
        </div>
        <button className="small-button" type="button" onClick={onClose}>
          管理信息
        </button>
      </div>

      <div className="user-tabs" role="tablist" aria-label="用户资源">
        <button
          className={activeTab === "uploads" ? "active" : ""}
          type="button"
          role="tab"
          aria-selected={activeTab === "uploads"}
          onClick={() => onTabChange("uploads")}
        >
          我的上传
        </button>
        <button
          className={activeTab === "likes" ? "active" : ""}
          type="button"
          role="tab"
          aria-selected={activeTab === "likes"}
          onClick={() => onTabChange("likes")}
        >
          我的点赞
        </button>
      </div>

      <div className="user-list">
        {list.map((pet) => (
          <div className="mini-pet" key={pet.id}>
            <PixelPet type={pet.sprite} />
            <div>
              <strong>{pet.displayName}</strong>
              <span>{activeTab === "uploads" ? `${pet.downloads} 下载` : `${pet.likes} 喜欢`}</span>
            </div>
            {activeTab === "uploads" && <button type="button">管理</button>}
          </div>
        ))}
      </div>
    </section>
  );
}

function LogoMark() {
  return (
    <svg className="logo-mark" viewBox="0 0 32 32" role="img" aria-label="PetShelf 标志">
      <path d="M7 12V6h4v4h10V6h4v6h3v13H4V12h3Z" fill="#ffffff" stroke="#123834" strokeWidth="2" />
      <path d="M10 18h3v3h-3zM19 18h3v3h-3zM14 24h4" stroke="#123834" strokeWidth="2" />
      <path d="M6 28h20" stroke="#0b8f86" strokeWidth="2" />
    </svg>
  );
}

function PixelAvatar() {
  return (
    <div className="pixel-avatar" aria-hidden="true">
      <span />
      <i />
    </div>
  );
}

function PixelPet({ type }) {
  const faces = {
    fox: ["耳", "橘"],
    blackCat: ["夜", "喵"],
    dino: ["龙", "R"],
    penguin: ["企", "鹅"],
    shiba: ["柴", "犬"],
    rabbit: ["兔", "兔"],
    robot: ["机", "器"],
    slime: ["史", "莱"],
    parrot: ["鹦", "鹉"],
    foxTiny: ["狐", "狸"],
    calico: ["三", "花"],
    hedgehog: ["刺", "猬"]
  };

  const [left, right] = faces[type] ?? ["宠", "物"];
  return (
    <div className={`pixel-pet ${type}`}>
      <span className="pet-ear left-ear" />
      <span className="pet-ear right-ear" />
      <span className="pet-face">
        <i>{left}</i>
        <i>{right}</i>
      </span>
      <span className="pet-shadow" />
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
