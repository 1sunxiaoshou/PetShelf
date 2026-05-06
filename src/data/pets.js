import { PET_ATLAS } from "../constants/petAtlas";

export const pets = [
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

export const sortOptions = [
  { id: "hot", label: "热门" },
  { id: "new", label: "最新" },
  { id: "downloads", label: "最多下载" },
  { id: "likes", label: "最多喜欢" }
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
    atlas: PET_ATLAS
  };
}
