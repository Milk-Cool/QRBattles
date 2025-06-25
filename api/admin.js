import express from "express";
import { adminMiddleware } from "./middleware/admin.js";
import { allCards, allIcons, createCard, createIcon, deleteCard, deleteIcon } from "../index.js";
import multer from "multer";

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
    // TODO: validation
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
    // TODO: validation
    await createIcon({
        buf: req.file.buffer
    });
    res.redirect("/admin/admin.html#" + req.key);
});
adminRouter.get("/deleteicon", async (req, res) => {
    // TODO: validation
    await deleteIcon(req.query.id);
    res.redirect("/admin/admin.html#" + req.key);
});
adminRouter.get("/deletecard", async (req, res) => {
    // TODO: validation
    await deleteCard(req.query.id);
    res.redirect("/admin/admin.html#" + req.key);
});
export default adminRouter;