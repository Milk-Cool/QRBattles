import { Card, rarities, types } from "./card";

(async () => {
    const card = await (await fetch("/api/claim?id=" + encodeURIComponent(location.hash.replace(/^#/, "")))).json() as Card & { error?: string };
    if(card.error) {
        alert(card.error);
        return location.href = "/";
    }
    (document.querySelector("#claimname") as HTMLSpanElement).innerText = card.name;
    (document.querySelector("#claimdesc") as HTMLHeadingElement).innerText = card.description;
    (document.querySelector("#claimicon") as HTMLImageElement).src = "/api/icons/" + card.icon;
    (document.querySelector("#claimtype") as HTMLHeadingElement).innerText = `${rarities[card.rarity]} / ${types[card.type]}`;
})();