import express from "express";
import meRouter from "./me.js";
import initMiddleware from "./middleware/init.js";
import claimRouter from "./claim.js";
import adminRouter from "./admin.js";
import iconsRouter from "./icons.js";
import gameRouter from "./game.js";
import demoRouter from "./demo.js";

const apiRouter = express.Router();
apiRouter.use(initMiddleware);
apiRouter.use("/me", meRouter);
apiRouter.use("/claim", claimRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/icons", iconsRouter);
apiRouter.use("/game", gameRouter);
apiRouter.use("/demo", demoRouter);

export default apiRouter;