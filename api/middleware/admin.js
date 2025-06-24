export const adminMiddleware = (req, res, next) => {    
    if((!req.query || !("key" in req.query) || req.query.key !== process.env.ADMIN_KEY)
        && (!req.body || !("key" in req.body) || req.body.key !== process.env.ADMIN_KEY))
        return res.status(401).send("?key is invalid or not present!");
    // not very good coding but whatever
    req.key = req.query && "key" in req.query && req.query.key === process.env.ADMIN_KEY ? req.query.key : req.body.key;
    next();
}