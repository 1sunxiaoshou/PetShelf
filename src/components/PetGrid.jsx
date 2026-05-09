import { PetCard } from "./PetCard";

export function PetGrid({ onPetSelect, pets }) {
  return (
    <section className="pet-grid" aria-label="宠物列表">
      {pets.map((pet) => (
        <PetCard key={pet.id} onSelect={onPetSelect} pet={pet} />
      ))}
    </section>
  );
}
