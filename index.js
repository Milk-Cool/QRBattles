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
 * @prop {number} rarity Card rarity
 * @prop {import("crypto").UUID} icon Card icon
 * @prop {1 | 2 | 3} type Card type (Warrior/Mage/Archer)
 */

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
};

/**
 * @argument {import("crypto").UUID} id Card ID
 * @returns {Card} The card
 */
export const resolveCardID = async (id) => {
    // TODO: just a placeholder!
    return {
        id: id,
        name: "Placeholder",
        description: "Description placeholder"
    };
};