import { PetCard } from "./PetCard";

export function PetGrid({ onPetSelect, pets, favorites, onFavorite }) {
  return (
    <section className="pet-grid" aria-label="宠物列表">
      {pets.map((pet) => (
        <PetCard key={pet.id} onSelect={onPetSelect} pet={pet} isLiked={favorites.includes(pet.id)} onFavorite={onFavorite} />
      ))}
    </section>
  );
}
