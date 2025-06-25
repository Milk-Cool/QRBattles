import express from "express";
import { adminMiddleware } from "./middleware/admin.js";
import { allCards, allIcons, createCard, createIcon, deleteCard, deleteIcon } from "../index.js";
import multer from "multer";
import Validator from "./misc/validator.js";
import { REGEX_UUID } from "./misc/regex.js";
import { idMiddleware } from "./middleware/id.js";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const adminRouter = express.Router();
adminRouter.use(express.urlencoded({ extended: true }), adminMiddleware);

adminRouter.get("/cards", async (req, res) => {
    res.send(await allCards());
});
adminRouter.get("/icons", async (req, res) => {
    res.send((await allIcons()).map(x => ({ id: x.id })));
});
adminRouter.post("/newcard", async (req, res) => {
    const valid = new Validator(req.body);
    if(!valid.str("description", { min: 1, max: 300 })
        || !valid.str("icon", { regex: REGEX_UUID })
        || !valid.str("name", { min: 1, max: 100 })
        || !valid.strint("rarity", { min: 1, max: 3 })
        || !valid.strint("type", { min: 1, max: 3 }))
        return res.status(400).send("Invalid data");
    await createCard({
        description: req.body.description,
        icon: req.body.icon,
        name: req.body.name,
        rarity: req.body.rarity,
        type: req.body.type
    });
    res.redirect("/admin/admin.html#" + req.key);
});
adminRouter.post("/newicon", upload.single("icon"), async (req, res) => {
    if(!req.file.buffer.subarray(0, 8).equals(Buffer.from("89504e470d0a1a0a", "hex")))
        return res.status(400).send("Invalid PNG!");
    await createIcon({
        buf: req.file.buffer
    });
    res.redirect("/admin/admin.html#" + req.key);
});
adminRouter.get("/deleteicon", idMiddleware, async (req, res) => {
    await deleteIcon(req.query.id);
    res.redirect("/admin/admin.html#" + req.key);
});
adminRouter.get("/deletecard", idMiddleware, async (req, res) => {
    await deleteCard(req.query.id);
    res.redirect("/admin/admin.html#" + req.key);
});
adminRouter.get("/claimall", async (req, res) => {
    const cards = await allCards();
    req.session.cardIDs = cards.map(x => x.id);
    await new Promise(resolve => req.session.save(resolve));
    res.send("OK");
});
export default adminRouter;