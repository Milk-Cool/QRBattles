export default function initMiddleware(req, _res, next) {
    if(!("cardIDs" in req.session)) req.session.cardIDs = [];
    if(!("game" in req.session)) req.session.game = -1;
    next();
}