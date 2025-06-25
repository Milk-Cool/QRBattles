import "drag-drop-touch";

import { Card, Game, rarities, types } from "./card";

const getByCoordinates = (x, y) => document.querySelector(`tbody > tr:nth-child(${y + 1}) > td:nth-child(${x + 1})`) as HTMLTableCellElement;
const getNodeIndex = el => [...el.parentNode.children].indexOf(el); // https://stackoverflow.com/a/40052000
const getCoordinates = el => [getNodeIndex(el), getNodeIndex(el.parentNode)];

const req = async (action: string, params?: URLSearchParams | Record<string, string>) => {
    const f = await fetch(`/api/game/${action}?${params ? (params instanceof URLSearchParams ? params : new URLSearchParams(params)).toString() : ""}`);
    const j = await f.json();
    if(j.error) {
        alert(j.error);
        return null;
    }
    return j;
};

const updateScores = scores => (document.querySelector("#score") as HTMLHeadingElement).innerText = scores.join(":");
const updateMove = myMove => (document.querySelector("#move") as HTMLHeadingElement).innerText = myMove ? "Your move!" : "Wait for your opponent's move...";

let inGame: boolean = false;
let myPlayerNumber: number = 0;
let game: Game | null = null;

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
            el.innerText = `${game.grid[x][y].type} (w${game.grid[x][y].rarity})`;
            el.style.background = game.grid[x][y].placedBy === myPlayerNumber ? "#ccf" : "#fcc";
        }
};

const poll = async () => {
    const poll = await req("poll");
    if(!poll.status) {
        game = poll.game;

        update();
    } else if(poll.status === "destroyed") {
        alert("Game destroyed!");
        location.reload();
    } else if(poll.status === "done") {
        if(poll.won) alert("You won!");
        else alert("You lost :(");
    }
};

// Replace with a nicer GUI later
(async () => {
    const f = await fetch("/api/me");
    const { cards: deck } = await f.json();
    for(const card of deck)
        pushCardToDeck(card);

    const action = confirm("Confirm to create, cancel to join");
    if(action === true) {
        await create();
        if(game === null) return;
        alert(game.code);
        await poll();
        inGame = true;
        update();
    } else {
        await join(prompt("Code:"));
        if(game === null) return;
        inGame = true;
        update();
        await poll();
    }
})();

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