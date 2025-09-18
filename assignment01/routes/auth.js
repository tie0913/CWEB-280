const { Router } = require("express");
const jwt = require("jsonwebtoken");
const fs = require("fs/promises");
const path = require("path");
const { validationResult } = require("express-validator");

const { createUser, verifyCredentials, getUserById } = require("../util/userStore.js");
const { uploadResume } = require("../middleware/upload.js");
const { signUpValidators } = require("../middleware/validators.js");

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "Test-Token-SECRET";
router.get('/signin', (req, res) => {
    res.render("signin", { title: "Sign In", chrome: false });
});

router.post("/signin", async (req, res) => {
    const { email, password } = req.body;

    const user = await verifyCredentials(email,password);
    console.log(user)
    if (!user.ok) {
        console.warn("[signin failed]",{email, reason: user.reason})

        return res.status(401).render("signin", {
            title: "Sign In",
            chrome: false,
            error: "Invalid email or password"
        });
    }

    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role }, 
        JWT_SECRET , { expiresIn: '1h' });
    res.cookie("session", token, { httpOnly: true, sameSite: "lax" });
    res.redirect("/");
});

router.get('/signup', (req, res) => res.render("signup", { title: "Sign Up", chrome: false }));

router.post("/signup",
    (req, res, next) => uploadResume(req, res, (err) => {
        if (err) {
            return res.status(400).render("signup", { title: "Sign up", chrome: false, error: err.message });
        }
        next();
    }),
    signUpValidators,
    async (req, res) => {
        const errors = validationResult(req);
        const { fullname, email, phone, position, password } = req.body;
        console.log("BODY: ", req.body)
        if (!errors.isEmpty()) {
            if (req.file?.path) {
                try { await fs.unlink(req.file.path); } catch { }
            }
            return res.status(400).render("signup", {
                title: "Sign up",
                chrome: false,
                error: errors.array().map(e => e.msg).join(", "),
                form: { fullname, email, phone, position }
            });
        }

        try {
            const resumePath = req.file ? path.relative(process.cwd(), req.file.path) : "";
            const user = await createUser({ email, password,  role : "user", fullname, phone, position, resumePath });
            res.redirect(`/signup/success?u=${encodeURIComponent(user.id)}`);
        } catch (e) {
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
    res.render("signup-success", {
        title: "Application Submitted",
        chrome: false,
        applicant: {
            name: user.fullname,
            email: user.email,
            phone: user.phone,
            position: user.position,
            resumePath: user.resumePath,
        },
    });
});

router.post("/signup/complete", async(req, res) =>{
    const {u} = req.body
    if (!u) return res.redirect("/signup");
    const user = await getUserById(u);
    if(!user) return res.redirect("/signup");

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.cookie("session", token, { httpOnly: true, sameSite: "lax" });
    console(res.cookie)
    res.redirect("/");
})

router.get("/logout", (req, res) => { res.clearCookie("session"); res.redirect("/"); });

// email: "admin@example.com"
// password = "Admin123!"
module.exports = router