export type UUID = `${string}-${string}-${string}-${string}-${string}`;
export type Card = {
    id: UUID;
    name: string;
    description: string;
    rarity: 1 | 2 | 3; // Rarity (Common/Rare/Epic)
    icon: UUID;
    type: 1 | 2 | 3; // Card type (Warrior/Mage/Archer)
};
export const types = [null, "Warrior", "Mage", "Archer"];
export const rarities = [null, "Common", "Rare", "Epic"];