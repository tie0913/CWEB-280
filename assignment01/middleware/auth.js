const jwt = require('jsonwebtoken');
const {JWT_SECRET} = require("../config/jwt.js")

function requireAuth(req, res, next) {
    const token = req.cookies?.session;
    if (!token) return res.status(403).render("errors/403", { title: "Forbidden" });

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload;
        res.locals.user = payload;
        next();
    } catch {
        return res.status(403).render("errors/403", { title: "Forbidden" });
    }
}

function requireAdmin(req, res, next){
    if (req.user?.role === "admin") return next();
    return res.status(403).render("error/403",{title: "Admins Only"});
}

function requireAuthJson(req, res, next){
    const token = req.cookies?.session;
    if(!token) {
        res.json({code:403, message:"unauthorized access, please sign in first"})
    }else{
        try{
            const payload = jwt.verify(token, JWT_SECRET);
            req.user = payload;
            res.locals.user = payload;
            next()
        } catch {
        }
    }
}

function requireAdminJson(req, res, next){
    if(req.user?.role === "admin") return next()
    res.json({code:403, message:"unauthorized access, this is admin only interface"})
}

module.exports = { requireAuth, requireAdmin, requireAuthJson, requireAdminJson };