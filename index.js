import { randomUUID } from "crypto";
import pg from "pg";

export const pool = new pg.Pool({
    host: process.env.POSTGRES_HOST,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB
});

/**
 * @typedef {object} Card A card
 * @prop {import("crypto").UUID} id The card ID
 * @prop {string} name The card name
 * @prop {string} description The card description
 * @prop {1 | 2 | 3} rarity Card rarity (Common/Rare/Epic)
 * @prop {import("crypto").UUID} icon Card icon
 * @prop {1 | 2 | 3} type Card type (Warrior/Mage/Archer)
 */
/** @typedef {Omit<Card, "id"> & { id?: import("crypto").UUID }} CardOptID A card with an optional ID field */
/**
 * @typedef {object} Icon An icon
 * @prop {import("crypto").UUID} id The icon ID
 * @prop {Buffer} buf The icon buffer (PNG)
 */
/** @typedef {Omit<Icon, "id"> & { id?: import("crypto").UUID }} IconOptID An icon with an optional ID field */

export const initDb = async () => {
    await pool.query(`CREATE TABLE IF NOT EXISTS cards (
        id uuid UNIQUE NOT NULL,
        name varchar(100) NOT NULL,
        description varchar(300) NOT NULL,
        rarity INTEGER NOT NULL,
        icon uuid NOT NULL,
        type INTEGER NOT NULL,

        PRIMARY KEY (id)
    )`);
    await pool.query(`CREATE TABLE IF NOT EXISTS icons (
        id uuid UNIQUE NOT NULL,
        buf bytea NOT NULL,

        PRIMARY KEY (id)
    )`);
};

/**
 * @argument {import("crypto").UUID} id Card ID
 * @returns {Promise<Card>} The card
 */
export const resolveCardID = async (id) => {
    return (await pool.query(`SELECT * FROM cards WHERE id = $1`, [id])).rows?.[0];
};

/**
 * @returns {Promise<Card[]>} The cards
 */
export const allCards = async () => {
    return (await pool.query(`SELECT * FROM cards`)).rows;
};

/**
 * @param {CardOptID} card Card to create
 */
export const createCard = async card => {
    if(!card.id) card.id = randomUUID();
    await pool.query(`INSERT INTO cards (id, name, description,
        rarity, icon, type) VALUES ($1, $2, $3, $4, $5, $6)`,
        [card.id, card.name, card.description, card.rarity,
            card.icon, card.type]);
};

/**
 * @param {import("crypto").UUID} id Icon ID
 * @returns {Promise<Buffer>} The icon as a buffer
 */
export const resolveIcon = async id => {
    return (await pool.query(`SELECT * FROM icons WHERE id = $1`, [id])).rows?.[0]?.buf;
}

/**
 * @param {IconOptID} icon Card to create
 */
export const createIcon = async icon => {
    if(!icon.id) icon.id = randomUUID();
    await pool.query(`INSERT INTO icons (id, buf) VALUES ($1, $2)`,
        [icon.id, icon.buf]);
};

/**
 * @returns {Promise<Icon[]>} The icons
 */
export const allIcons = async () => {
    return (await pool.query(`SELECT * FROM icons`)).rows;
};