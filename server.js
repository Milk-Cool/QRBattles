import express from "express";
import ViteExpress from "vite-express";
import expressSession from "express-session";
import connectPgSimple from "connect-pg-simple";
import { initDb, pool } from "./index.js";
import apiRouter from "./api/index.js";
const pgSession = connectPgSimple(expressSession);

const port = 5328;

const app = express();
app.use(expressSession({
    store: new pgSession({
        pool,
        createTableIfMissing: true
    }),
    secret: process.env.COOKIE_SECRET,
    resave: false,
    cookie: { maxAge: 10e12 }
}));

app.use("/api", apiRouter);

(async () => {
    await initDb();
    ViteExpress.listen(app, port, () => console.log(`Listening at :${port}...`));
})();

const stop = async () => {
    // i'll put stuff here if needed
    process.exit(0);
};
process.on("SIGHUP", async () => await stop());
process.on("SIGUSR2", async () => await stop());
process.on("SIGINT", async () => await stop());
process.on("SIGTERM", async () => await stop());