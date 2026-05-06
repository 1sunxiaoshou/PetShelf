export function LogoMark() {
  return (
    <svg className="logo-mark" viewBox="0 0 32 32" role="img" aria-label="PetShelf 标志">
      <path d="M7 12V6h4v4h10V6h4v6h3v13H4V12h3Z" fill="#ffffff" stroke="#123834" strokeWidth="2" />
      <path d="M10 18h3v3h-3zM19 18h3v3h-3zM14 24h4" stroke="#123834" strokeWidth="2" />
      <path d="M6 28h20" stroke="#0b8f86" strokeWidth="2" />
    </svg>
  );
}

export function PixelAvatar() {
  return (
    <div className="pixel-avatar" aria-hidden="true">
      <span />
      <i />
    </div>
  );
}

export function PixelPet({ type }) {
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
