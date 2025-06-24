export default function initMiddleware(req, _res, next) {
    if(!("cardIDs" in req.session)) req.session.cardIDs = [];
    next();
}