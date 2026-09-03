import communityPets from "./community-pets.json";
import { petDescriptions } from "./petCopy";
export const pets = communityPets.map((pet) => ({ ...pet, description: petDescriptions[pet.id] || pet.description }));
export const sortOptions = [
  { id: "featured", label: "精选" },
  { id: "name", label: "名称" },
];
