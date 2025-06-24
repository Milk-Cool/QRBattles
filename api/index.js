import express from "express";
import meRouter from "./me.js";
import initMiddleware from "./middleware/init.js";
import claimRouter from "./claim.js";

const apiRouter = express.Router();
apiRouter.use(initMiddleware);
apiRouter.use("/me", meRouter);
apiRouter.use("/claim", claimRouter);

export default apiRouter;