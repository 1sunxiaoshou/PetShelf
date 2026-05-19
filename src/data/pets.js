import { PET_ATLAS } from "../constants/petAtlas";

export const pets = [
  {
    id: 1,
    manifestId: "atri",
    displayName: "亚托莉",
    description: "A tiny chibi anime companion in a white sailor outfit.",
    author: "本地测试资源",
    downloads: "0",
    likes: 0,
    sprite: "fox",
    tone: "#f47b35",
    spritesheetPath: "/pets/atri/spritesheet.webp",
    atlas: PET_ATLAS
  }
];

export const sortOptions = [
  { id: "hot", label: "热门" },
  { id: "new", label: "最新" },
  { id: "downloads", label: "最多下载" },
  { id: "likes", label: "最多喜欢" }
];
