import express from "express";
import ViteExpress from "vite-express";
import expressSession from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./index.js";
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

app.get("/test", (_, res) => res.send("Hello from express!"));

ViteExpress.listen(app, port, () => console.log(`Listening at :${port}...`));