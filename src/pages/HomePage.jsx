import { useMemo } from "react";
import { EmptyState } from "../components/EmptyState";
import { PetGrid } from "../components/PetGrid";
import { SortControls } from "../components/SortControls";
import { sortOptions } from "../data/pets";
import { parseDownload } from "../utils/format";

export function HomePage({ onClearSearch, onPetSelect, onSortChange, pets, query, sort }) {
  const filteredPets = pets || [];

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
