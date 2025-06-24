import express from "express";
import { resolveCardID } from "../index.js";
import { idMiddleware } from "./middleware/id.js";

const claimRouter = express.Router();
claimRouter.get("/", idMiddleware, async (req, res) => {
    if(req.session.cardIDs.find(x => x === req.query.id))
        return res.status(400).send("You already have this card!");
    const card = await resolveCardID(req.query.id);
    if(!card)
        return res.status(404).send("Card not found");
    console.log(req.session.cardIDs);
    req.session.cardIDs.push(card.id);
    await new Promise(resolve => req.session.save(resolve));
    res.send(card);
});
export default claimRouter;