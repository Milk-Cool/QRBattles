export type UUID = `${string}-${string}-${string}-${string}-${string}`;
export type Card = {
    id: UUID;
    name: string;
    description: string;
    rarity: 1 | 2 | 3; // Rarity (Common/Rare/Epic)
    icon: UUID;
    type: 1 | 2 | 3; // Card type (Warrior/Mage/Archer)
};
export type CardOnGrid = {
    id: UUID | "";
    rarity: -1 | 1 | 2 | 3;
    type: -1 | 1 | 2 | 3;
    placedBy: -1 | 0 | 1;
    iconID: UUID | "";
};
export type Row = [CardOnGrid, CardOnGrid, CardOnGrid, CardOnGrid, CardOnGrid];
export type Grid = [Row, Row, Row, Row, Row];
export type Game = {
    grid: Grid,
    score: [number, number],
    player: 0 | 1,
    started: boolean,
    createTimestamp: number,
    startTimestamp: number,
    won: number,
    code: string
};
export const types = [null, "Warrior", "Mage", "Archer"];
export const rarities = [null, "Common", "Rare", "Epic"];