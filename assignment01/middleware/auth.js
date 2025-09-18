const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

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

module.exports = { requireAuth, requireAdmin  };