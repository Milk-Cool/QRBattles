import { Game } from "./card";

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
tds.forEach(td => td.addEventListener("click", async () => {
    if(!inGame || game === null) return;
    if(game.player !== myPlayerNumber) return;
    const [x, y] = getCoordinates(td);
    const id = prompt("Card ID:");
    
    const res = await req("move", { x: x.toString(), y: y.toString(), id });
    if(res === null) return;
    game = res.game;
    update();
    await poll();
}));

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
            console.log(game.grid[x][y]);
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
    const action = confirm("Confirm to create, cancel to join");
    if(action === true) {
        await create();
        if(game === null) return;
        inGame = true;
        alert(game.code);
        update();
        await poll();
    } else {
        await join(prompt("Code:"));
        if(game === null) return;
        inGame = true;
        update();
        await poll();
    }
})();