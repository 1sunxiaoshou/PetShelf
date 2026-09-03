export function filterPets(pets, query, sort, likedIds = null) {
  const term = query.trim().toLocaleLowerCase();
  const result = pets.filter((pet) =>
    (!likedIds || likedIds.includes(pet.id)) &&
    `${pet.displayName} ${pet.author} ${pet.searchNames || ""}`.toLocaleLowerCase().includes(term)
  );
  if (sort === "name") result.sort((a, b) => a.displayName.localeCompare(b.displayName, "zh-CN"));
  if (sort === "v2") result.sort((a, b) => b.spriteVersionNumber - a.spriteVersionNumber);
  return result;
}

export function readFavorites(storage) {
  try {
    const saved = JSON.parse(storage.getItem("petshelf-demo-favorites") || "[]");
    return Array.isArray(saved) ? saved.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}
