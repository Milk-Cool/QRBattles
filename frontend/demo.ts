import { Card } from "./card";
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

(document.querySelector("#printall") as HTMLButtonElement).addEventListener("click", () => printCanvas(...Array.from(document.querySelectorAll("canvas"))));

function addCard(card: Card) {
    const canvas = document.createElement("canvas");
    canvas.style.margin = "1em";
    // @ts-ignore
    new QRious({
        element: canvas,
        value: new URL("/claim/" + card.id, location.origin).href
    });
    canvas.addEventListener("click", () => printCanvas(canvas));
    (document.querySelector("#cards") as HTMLDivElement).appendChild(canvas);
}
(async () => {
    const f = await fetch(`/api/demo`);
    if(f.status !== 200) {
        alert("Not in demo mode!");
        return;
    }
    const j = await f.json() as Card[];
    for(const card of j) addCard(card);
})();