const getByCoordinates = (x, y) => document.querySelector(`tbody > tr:nth-child(${y + 1}) > td:nth-child(${x + 1})`);
const getNodeIndex = el => [...el.parentNode.children].indexOf(el); // https://stackoverflow.com/a/40052000
const getCoordinates = el => [getNodeIndex(el), getNodeIndex(el.parentNode)];

const getWinning = (what, overWhat) => what === "1" && overWhat === "3" || what === "2" && overWhat === "1" || what === "3" && overWhat === "2";

const tds = document.querySelectorAll("td");
let player = 0;
const scores = [0, 0];
tds.forEach(td => td.addEventListener("click", () => {
    const choice = prompt("1, 2, 3") || "";
    if(!["1", "2", "3"].includes(choice)) return;
    td.dataset.type = choice;
    td.dataset.player = player.toString();
    td.innerText = choice;
    if(player === 0)
        td.style.background = "#ccf";
    else
        td.style.background = "#fcc";
    const coords = getCoordinates(td);
    let n = 0;
    for(let x = 0; x < 5; x++) {
        if(x === coords[0]) continue;
        const el = getByCoordinates(x, coords[1]) as HTMLTableCellElement;
        if(el.dataset.player === player.toString()) continue;
        if(getWinning(choice, el.dataset.type))
            n++;
    }
    for(let y = 0; y < 5; y++) {
        if(y === coords[1]) continue;
        const el = getByCoordinates(coords[0], y) as HTMLTableCellElement;
        if(el.dataset.player === player.toString()) continue;
        if(getWinning(choice, el.dataset.type))
            n++;
    }
    scores[player] += n;
    (document.querySelector("#score") as HTMLHeadingElement).innerText = scores.join(":");
    player = 1 - player;
    (document.querySelector("#player") as HTMLHeadingElement).innerText = (player + 1).toString();
}));