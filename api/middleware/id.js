import { REGEX_UUID } from "../misc/regex.js";
export const idMiddleware = (req, res, next) => {
    if(!("id" in req.query) || typeof req.query.id !== "string" || !req.query.id.match(REGEX_UUID))
        return res.status(400).send("?id is not a UUID");
    next();
}