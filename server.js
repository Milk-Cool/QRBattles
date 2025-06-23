import express from "express";
import ViteExpress from "vite-express";

const port = 5328;

const app = express();

app.get("/test", (_, res) => res.send("Hello from express!"));

ViteExpress.listen(app, port, () => console.log(`Listening at :${port}...`));