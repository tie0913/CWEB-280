import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
    const token = req.cookies?.session;
    if (!token) return res.status(403).render("errors/403", { title: "Forbidden" });
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload;
        res.locals.user = payload;
        next();
    } catch {
        return res.status(403).render("errors/403", { title: "Forbidden" });
    }
}