import { useMemo } from "react";
import { EmptyState } from "../components/EmptyState";
import { PetGrid } from "../components/PetGrid";
import { SortControls } from "../components/SortControls";
import { sortOptions } from "../data/pets";
import { parseDownload } from "../utils/format";

export function HomePage({ onClearSearch, onPetSelect, onSortChange, pets, query, sort }) {
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
  }, [pets, query, sort]);

  return (
    <main className="main-content">
      <section className="page-heading" aria-labelledby="page-title">
        <div className="heading-left">
          <h1 id="page-title">宠物</h1>
          <SortControls activeSort={sort} onSortChange={onSortChange} options={sortOptions} />
        </div>
        <p className="pet-count">共 {pets.length} 个宠物</p>
      </section>

      {filteredPets.length > 0 ? (
        <PetGrid onPetSelect={onPetSelect} pets={filteredPets} />
      ) : (
        <EmptyState query={query} onClear={onClearSearch} />
      )}
    </main>
  );
}
