import { PET_ATLAS } from "../constants/petAtlas";
import atriManifest from "../../public/pets/atri/pet.json";

export const pets = [
  {
    id: 1,
    manifestId: atriManifest.id,
    displayName: atriManifest.displayName,
    description: atriManifest.description,
    author: "本地测试资源",
    downloads: "0",
    likes: 0,
    sprite: "fox",
    tone: "#f47b35",
    packageManifest: atriManifest,
    spritesheetPath: `/pets/${atriManifest.id}/${atriManifest.spritesheetPath}`,
    atlas: PET_ATLAS
  }
];

export const sortOptions = [
  { id: "hot", label: "热门" },
  { id: "new", label: "最新" },
  { id: "downloads", label: "最多下载" },
  { id: "likes", label: "最多喜欢" }
];
