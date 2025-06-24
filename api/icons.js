import express from "express";
import { resolveIcon } from "../index.js";

const iconsRouter = express.Router();
iconsRouter.get("/:id", async (req, res) => {
    res.send(await resolveIcon(req.params.id));
});
export default iconsRouter;