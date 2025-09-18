import { Router } from 'express';
import jwt from 'jsonwebtoken';
import fs from "fs/promises"
import { createUser, verifyCredentials, getUserById } from '../util/userStore.js';
import { uploadResume } from '../middleware/upload.js';
import { validationResult } from "express-validator";
import { signUpValidators } from "../middleware/validators.js"

const router = Router();

router.get('/signin', (req, res) => {
    res.render("signin", { title: "Sign In", chrome: false });
});

router.post("/signin", async (req, res) => {
    const { email, password } = req.body;

    const user = await verifyCredentials(email,password);
    if (!user) {
        return res.status(401).render("signin", {
            title: "Sign In",
            chrome: false,
            error: "Invalid email or password"
        });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.cookie("session", token, { httpOnly: true, sameSite: "lax" });
    res.redirect("/my/registrations");
});

router.get('/signup', (req, res) => res.render("signup", { title: "Sign Up", chrome: false }));

router.post("/signup",
    // 1) handle file upload first (multer parses form-data)
    (req, res, next) => uploadResume(req, res, (err) => {
        if (err) {
            return res.status(400).render("signup", { title: "Sign up", chrome: false, error: err.message });
        }
        next();
    }),
    // 2) then validate fields
    signUpValidators,
    async (req, res) => {
        const errors = validationResult(req);
        const { name, email, phone, position, password } = req.body;

        if (!errors.isEmpty()) {
            // delete uploaded file if validation failed
            if (req.file?.path) {
                try { await fs.unlink(req.file.path); } catch { }
            }
            return res.status(400).render("signup", {
                title: "Sign up",
                chrome: false,
                error: errors.array().map(e => e.msg).join(", "),
                // Optionally re-fill safe fields (not password)
                form: { name, email, phone, position }
            });
        }

        try {
            const resumePath = req.file ? path.relative(process.cwd(), req.file.path) : "";
            const user = await createUser({ email, password, role: "user", name, phone, position, resumePath });

            // Redirect to success page showing submitted details + uploaded file info
            res.redirect(`/signup/success?u=${encodeURIComponent(user.id)}`);
        } catch (e) {
            // delete uploaded file on create error
            if (req.file?.path) {
                try { await fs.unlink(req.file.path); } catch { }
            }
            return res.status(400).render("signup", { title: "Sign up", chrome: false, error: e.message || "Sign up failed" });
        }
    }
);

router.get("/signup/success", async (req, res) => {
    const userId = req.query.u;
    if (!userId) return res.redirect("/signup");

    const user = await getUserById(userId);
    if (!user) return res.redirect("/signup");

    // You can choose chrome: false or true; keeping false to match auth pages
    res.render("signup-success", {
        title: "Application Submitted",
        chrome: false,
        applicant: {
            name: user.name,
            email: user.email,
            phone: user.phone,
            position: user.position,
            resumePath: user.resumePath, // display a path or a download link you create
        },
    });
});

router.post("/logout", (req, res) => {
    res.clearCookie("session");
    res.redirect("/");
});
// email: "admin@example.com"
// password = "Admin123!"
module.exports = router;