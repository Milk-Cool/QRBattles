import { Card, rarities, types } from "../card";
import QRious from "qrious";

let key = "";

// https://stackoverflow.com/a/64772938
const printCanvas = (...els: HTMLCanvasElement[]) => {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);
    const win = iframe.contentWindow as Window;
    win.document.open();
    for(const el of els) win.document.writeln(`<img src="${el.toDataURL()}">`)
    win.document.close();
    win.focus();
    win.print();
    win.addEventListener("afterprint", () => iframe.remove());
};

function addCard(card: Card) {
    const cardEl = document.createElement("div");
    
    const name = document.createElement("h2");
    name.innerText = card.name;
    cardEl.appendChild(name);

    const rarityAndType = document.createElement("h4");
    rarityAndType.innerText = `${rarities[card.rarity]} / ${types[card.type]}`;
    cardEl.appendChild(rarityAndType);
    
    const description = document.createElement("p");
    description.innerText = card.description;
    cardEl.appendChild(description);
    
    const img = document.createElement("img");
    img.src = "/api/icons/" + card.icon;
    cardEl.appendChild(img);

    cardEl.appendChild(document.createElement("br"));

    const canvas = document.createElement("canvas");
    // @ts-ignore
    new QRious({
        element: canvas,
        value: new URL("/claim/" + card.id, location.origin).href
    });
    canvas.addEventListener("click", () => printCanvas(canvas));
    cardEl.appendChild(canvas);

    (document.querySelector("#cards") as HTMLDivElement).appendChild(cardEl);
}

(document.querySelector("#loginform") as HTMLFormElement).addEventListener("submit", async e => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    key = formData.get("key")?.toString() || "";
    const f = await fetch(`/api/admin/cards?key=${key}`);
    if(f.status !== 200) {
        alert("Wrong key!");
        return;
    }
    const j = await f.json() as Card[];
    for(const card of j) addCard(card);
    document.querySelectorAll("[name=\"key\"]").forEach(el => (el as HTMLInputElement).value = key);
    document.querySelectorAll(".keyquery").forEach(el => (el as HTMLFormElement).action += "?key=" + key);
    (document.querySelector("#login") as HTMLDivElement).classList.add("hidden");
    (document.querySelector("#forms") as HTMLDivElement).classList.remove("hidden");

    updateIcons();
});
const updateIcons = async () => {
    const f = await fetch("/api/admin/icons?key=" + key);
    const j = await f.json();
    for(const icon of j) {
        const iconID = icon.id;
        const img = document.createElement("img");
        img.src = `/api/icons/${iconID}`;
        img.title = iconID;
        img.height = 64;
        img.addEventListener("copy", e => {
            e.clipboardData?.setData("text/plain", iconID);
            e.preventDefault();
        });
        document.querySelector("#icons")?.appendChild(img);
    }
}