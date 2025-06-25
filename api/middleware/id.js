import { REGEX_UUID } from "../misc/regex.js";
import Validator from "../misc/validator.js";
export const idMiddleware = (req, res, next) => {
    const valid = new Validator(req.query);
    if(!valid.str("id", { regex: REGEX_UUID }))
        return res.status(400).send("?id is not a UUID");
    next();
}