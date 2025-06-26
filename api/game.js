import express from "express";
import { randomBytes } from "crypto";
import Validator from "./misc/validator.js";
import { resolveCardID } from "../index.js";

/**
 * @typedef {object} Cell
 * @prop {import("crypto").UUID | ""} id
 * @prop {import("../index.js").Card["type"] | -1} type
 * @prop {import("../index.js").Card["rarity"] | -1} rarity
 * @prop {0 | 1} placedBy
 * @prop {import("crypto").UUID | ""} iconID
 */
/** @typedef {[Cell, Cell, Cell, Cell, Cell]} Row */
/** @typedef {[Row, Row, Row, Row, Row]} Grid */
/**
 * @typedef {object} Game A game
 * @prop {Grid} grid The game grid
 * @prop {[number, number]} score The scores (P1, P2)
 * @prop {0 | 1} player The current player (P1 = 0, P2 = 1)
 * @prop {boolean} started Whether the game has started yet
 * @prop {number} createTimestamp Creation timestamp (timeout is 5 min after creation)
 * @prop {number} startTimestamp Start timestamp (timeout is 30 min after start)
 * @prop {number} won Who won (P1 = 0, P2 = 1, nobody = -1)
 * @prop {string} code Join code
 */

/** @type {Game[]} */
let games = [];

const gameValidMiddleware = (req, _res, next) => {
    if(!games[req.session.game] || games[req.session.game].code !== req.session.code) req.session.game = -1;
    next();
}
const makeError = error => ({ error: Array.isArray(error) ? error?.[0] : error });

const getWinning = (what, overWhat) => what === 1 && overWhat === 3 || what === 2 && overWhat === 1 || what === 3 && overWhat === 2;

const redactIDs = gameObjUnredacted => {
    /** @type {Game} */
    const gameObj = structuredClone(gameObjUnredacted);
    gameObj.grid = gameObj.grid.map(x => x.map(y => {
        y.id = "";
        return y;
    }));
    return gameObj;
}

const gameRouter = express.Router();
gameRouter.use(gameValidMiddleware);
gameRouter.get("/new", async (req, res) => {
    if(req.session.game !== -1)
        delete games[req.session.game];
    const game = games.push({
        grid: new Array(5).fill(() => new Array(5).fill({
            id: "",
            type: -1,
            rarity: -1,
            placedBy: -1,
            iconID: ""
        })).map(x => x()),
        score: [0, 0],
        player: 0,
        started: false,
        createTimestamp: Date.now(),
        startTimestamp: -1,
        won: -1,
        code: randomBytes(3).toString("hex")
    }) - 1;
    req.session.game = game;
    req.session.code = games[game].code;
    req.session.player = 0;
    await new Promise(resolve => req.session.save(resolve));
    res.send({ game: redactIDs(games[game]), player: 0 });
});
gameRouter.get("/join", async (req, res) => {
    const game = games.findIndex(x => x && x.code.toUpperCase() === req.query.code.toUpperCase());
    if(game === -1 || !games[game])
        return res.status(404).send(makeError`Game code invalid!`);
    if(games[game].started)
        return res.status(400).send(makeError`Game has already started!`);
    req.session.game = game;
    req.session.code = games[game].code;
    req.session.player = 1;
    await new Promise(resolve => req.session.save(resolve));
    games[game].started = true;
    games[game].startTimestamp = Date.now();
    res.send({ game: redactIDs(games[game]), player: 1 });
});
// gameRouter.get("/leave", (req, res) => {});
gameRouter.get("/poll", async (req, res) => {
    const game = req.session.game;
    if(game === -1 || !games[game]) return res.status(400).send(makeError`You're not in a game!`);
    const player = req.session.player;
    const started = games[game].started;
    const loop = resolve => {
        if(!games[game]) return resolve("destroyed");
        if(!started) {
            if(games[game].started) return resolve("started");
        } else {
            if(games[game].won !== -1) return resolve("done");
            if(games[game].player === player) return resolve("move");
        }
        setTimeout(loop, 200, resolve);
    };
    const status = await new Promise(loop);
    if(status === "destroyed") res.send({ status: "destroyed" });
    else if(status === "done") res.send({ status: "done", won: games[game].won === player });
    else res.send({ game: redactIDs(games[game]) });
});
gameRouter.get("/move", async (req, res) => {
    const game = req.session.game;
    if(game === -1 || !games[game]) return res.status(400).send(makeError`You're not in a game!`);
    if(!games[game].started)
        return res.send(makeError`The game hasn't started yet!`);
    const player = req.session.player;
    if(games[game].player !== player)
        return res.send(makeError`It's not your move yet!`);
    const cardID = req.query.id;
    if(!req.session.cardIDs.includes(cardID))
        return res.send(makeError`You don't have that card!`);
    if(games[game].grid.flat().find(x => x.id === cardID && x.placedBy === player))
        return res.send(makeError`You already placed that card!`);
    const valid = new Validator(req.query);
    if(!valid.strint("x", { min: 0, max: 4 }) || !valid.strint("y", { min: 0, max: 4 }))
        return res.send(makeError`Invalid coordinates!`);
    const posX = parseInt(req.query.x), posY = parseInt(req.query.y);
    if(games[game].grid[posX][posY].id !== "")
        return res.send(makeError`This cell is occupied!`);
    const card = await resolveCardID(cardID);
    if(!card)
        return res.send(makeError`No such card!`);
    games[game].grid[posX][posY] = {
        id: cardID,
        placedBy: player,
        rarity: card.rarity,
        type: card.type,
        iconID: card.icon
    };
    for(let x = 0; x < 5; x++) {
        if(x === posX) continue;
        const otherCard = games[game].grid[x][posY];
        if(otherCard.id === "") continue;
        if(getWinning(card.type, otherCard.type) && games[game].player !== otherCard.placedBy)
            games[game].score[player] += otherCard.rarity;
    }
    for(let y = 0; y < 5; y++) {
        if(y === posY) continue;
        const otherCard = games[game].grid[posX][y];
        if(otherCard.id === "") continue;
        if(getWinning(card.type, otherCard.type) && games[game].player !== otherCard.placedBy)
            games[game].score[player] += otherCard.rarity;
    }
    games[game].player = 1 - player;
    res.send({ game: redactIDs(games[game]) });
});
setInterval(() => {
    for(const game in games)
        if(games[game].started && Date.now() - games[game].startTimestamp >= 30 * 60 * 1000)
            delete games[game];
        else if(Date.now() - games[game].createTimestamp >= 5 * 60 * 1000)
            delete games[game];
}, 60 * 1000);
export default gameRouter;