import express from "express";
import { allCards } from "../index.js";;

const demoRouter = express.Router();

demoRouter.get("/", async (_req, res) => {
    if(!process.env.DEMO_MODE)
        return res.status(400).send("Not in demo mode!");
    res.send(await allCards());
});
export default demoRouter;