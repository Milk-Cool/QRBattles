import "drag-drop-touch";

import { Card, Game, rarities, types } from "./card";
import { makeAlert } from "./alerts";

const getByCoordinates = (x, y) => document.querySelector(`tbody > tr:nth-child(${y + 1}) > td:nth-child(${x + 1})`) as HTMLTableCellElement;
const getNodeIndex = el => [...el.parentNode.children].indexOf(el); // https://stackoverflow.com/a/40052000
const getCoordinates = el => [getNodeIndex(el), getNodeIndex(el.parentNode)];

const req = async (action: string, params?: URLSearchParams | Record<string, string>) => {
    const f = await fetch(`/api/game/${action}?${params ? (params instanceof URLSearchParams ? params : new URLSearchParams(params)).toString() : ""}`);
    const j = await f.json();
    if(j.error) {
        await makeAlert({}, j.error);
        return null;
    }
    return j;
};

let inGame: boolean = false;
let myPlayerNumber: number = 0;
let game: Game | null = null;

const updateScores = scores => (document.querySelector("#score") as HTMLHeadingElement).innerText = (myPlayerNumber === 1 ? scores.toReversed() : scores).join(":");
const updateMove = myMove => (document.querySelector("#move") as HTMLHeadingElement).innerText = myMove ? "Your move!" : "Wait for your opponent's move...";

const tds = document.querySelectorAll("td");
const move = async (td, id, cb) => {
    const [x, y] = getCoordinates(td);

    const res = await req("move", { x: x.toString(), y: y.toString(), id });
    if(res === null) return false;
    game = res.game;
    update();
    cb();
    await poll();
}
tds.forEach(td => {
    td.addEventListener("drop", async e => {
        if(!inGame || game === null) return;
        if(game.player !== myPlayerNumber) return;
        e.preventDefault();
        const id = e.dataTransfer.getData("text/plain");
        await move(td, id, () => document.querySelector(`[data-id="${id}"]`).remove());
    });
    td.addEventListener("dragover", e => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    });
});

const create = async () => {
    const res = await req("new");
    // if(res === null) return;
    myPlayerNumber = res.player;
    game = res.game as Game;
};
const join = async code => {
    const res = await req("join", { code });
    if(res === null) return;
    myPlayerNumber = res.player;
    game = res.game as Game;
};

const update = () => {
    if(game === null) return;
    updateMove(game.player === myPlayerNumber);
    updateScores(game.score);

    for(let x = 0; x < 5; x++)
        for(let y = 0; y < 5; y++) {
            if(game.grid[x][y].placedBy === -1) continue;
            const el = getByCoordinates(x, y);
            Array.from(el.children).map(x => x.remove());

            const img = document.createElement("img");
            img.src = "/api/icons/" + game.grid[x][y].iconID;
            el.appendChild(img);

            el.appendChild(document.createElement("br"));

            const p = document.createElement("p");
            p.innerText = `${types[game.grid[x][y].type]} (x${game.grid[x][y].rarity})`;
            el.appendChild(p);

            el.style.background = game.grid[x][y].placedBy === myPlayerNumber ? "#ccf" : "#fcc";
        }
};

const announceResults = async won => {
    if(won === "tie") await makeAlert({}, "It's a tie!");
    else if(won) await makeAlert({}, "You won!");
    else await makeAlert({}, "You lost :(");

    location.reload();
}

const poll = async () => {
    const poll = await req("poll");
    if(!poll.status) {
        game = poll.game;

        update();
    } else if(poll.status === "destroyed") {
        await makeAlert({}, "Game destroyed!");
        location.reload();
    } else if(poll.status === "done") {
        await announceResults(poll.won);
    }

    if(document.querySelector("#deck").children.length === 0 || !document.querySelector("td:empty")) {
        const res = await req("end");
        if(res !== null) await announceResults(res.won);
    }
};

const updateDeck = async () => {
    const f = await fetch("/api/me");
    const { cards: deck } = await f.json();
    if(deck.length < 7)
        makeAlert({}, "Please note: you can't play with <7 cards! Right now, you have " + deck.length.toString() + ".");
    for(const card of deck)
        pushCardToDeck(card);
};
updateDeck();

const startGame = () => {
    inGame = true;
    document.querySelector("#grid").classList.remove("hidden");
    document.querySelector("#deck").classList.remove("hidden");
    document.querySelector("#play").classList.add("hidden");
    document.querySelector("#guide").classList.add("hidden");
    document.querySelector("#guide-top").classList.remove("hidden");
};
const startWaiting = () => {
    (document.querySelector("#play") as HTMLButtonElement).innerText = "Waiting for P2...";
    (document.querySelector("#play") as HTMLButtonElement).disabled = true;
    document.querySelector("#guide-top").classList.remove("hidden");
};

// Replace with a nicer GUI later
const play = async () => {
    const action = await makeAlert({ cancel: true, cancelText: "Join", okText: "Create" }, "Create a game or join an existing one?");
    if(action === true) {
        await create();
        if(game === null) return;
        (document.querySelector("#code") as HTMLHeadingElement).innerText = ` | ${game.code.toUpperCase()}`;
        startWaiting();
        await poll();
        startGame();
        update();
    } else {
        const input = document.createElement("input");
        input.id = "codeinput";
        await join(await makeAlert({ textInputID: "codeinput" }, "Code:", document.createElement("br"), input));
        if(game === null) return;
        startGame();
        update();
        await poll();
    }
};
(document.querySelector("#play") as HTMLButtonElement).addEventListener("click", () => play());

const pushCardToDeck = (card: Card) => {
    const div = document.createElement("div");
    div.draggable = true;
    div.dataset.id = card.id;
    div.addEventListener("dragstart", e => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", card.id);
    });

    const name = document.createElement("h3");
    name.innerText = card.name;
    div.appendChild(name);

    const icon = document.createElement("img");
    icon.src = "/api/icons/" + card.icon;
    div.appendChild(icon);

    const type = document.createElement("h4");
    type.append(document.createTextNode(rarities[card.rarity]));
    type.appendChild(document.createElement("br"));
    type.append(document.createTextNode(types[card.type]));
    div.appendChild(type);
    if(card.rarity === 1)
        div.style.background = "#caf4fa";
    else if(card.rarity === 2)
        div.style.background = "#d1faca";
    else if(card.rarity === 3)
        div.style.background = "#facacc";
    
    document.querySelector("#deck").appendChild(div);
};

const guide = async () => {
    const guideP1 = document.createElement("h4");
    guideP1.innerText = `This game is kinda like rock-paper-scissors: there are three types of cards, each one beats one other type and loses to the other one. Archer beats mage, mage beats warrior and warrior beats archer. When you place a card, it searches for cards on that are on the same row or column as the one you placed and, if the card you placed is superior, you get points! The player with the most points wins. Good luck!`;
    guideP1.style.width = "85vw";
    const guideImg = document.createElement("img");
    guideImg.style.maxWidth = "35vw";
    guideImg.style.height = "auto";
    guideImg.src = "/triangle.svg";
    await makeAlert({}, guideP1, guideImg);
};

(document.querySelector("#guide") as HTMLAnchorElement).addEventListener("click", guide);
(document.querySelector("#guide-top") as HTMLAnchorElement).addEventListener("click", guide);