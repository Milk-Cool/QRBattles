import express from "express";
import { resolveCardID } from "../index.js";

const meRouter = express.Router();
meRouter.get("/", async (req, res) => {
    res.send({
        cards: await Promise.all(req.session.cardIDs.map(resolveCardID))
    })
});
export default meRouter;