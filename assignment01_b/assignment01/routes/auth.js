const { Router } = require("express");
const jwt = require("jsonwebtoken");
const fs = require("fs/promises");
const path = require("path");
const { validationResult } = require("express-validator");

const { createUser, verifyCredentials, getUserById } = require("../util/userStore.js");
const { uploadResume } = require("../middleware/upload.js");
const { signUpValidators } = require("../middleware/validators.js");
const {JWT_SECRET} = require("../config/jwt.js")


const router = Router();

router.get('/signin', (req, res) => {
    res.render("signin", { title: "Sign In", chrome: false });
});

router.post("/signin", async (req, res) => {
    const { email, password } = req.body;

    const queryResult = await verifyCredentials(email,password);
    if (!queryResult.ok) {
        console.warn("[signin failed]",{email, reason: queryResult.reason})

        return res.status(401).render("signin", {
            title: "Sign In",
            chrome: false,
            error: "Invalid email or password"
        });
    }

    const user = queryResult.user
    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role , fullname:user.fullname}, 
        JWT_SECRET ,
        { expiresIn: '1h' });

    res.cookie("session", token, { httpOnly: true, sameSite: "lax" });
    res.redirect("/");
});

router.get('/signup', (req, res) => res.render("signup", { title: "Sign Up", chrome: false }));

router.post("/signup", 
    (req, resp, next) =>{
        const multifile = uploadResume.single('resume')
        multifile(req, res, async(err)=>{
            if(err){
                let msg = err.message || 'Uploading failed'
                if(err.code === "Limited File Type") msg = "Only PDF File can be uploaded"
                if(err.code === "LIMIT_FILE_SIZE") msg = "File Can NOT Greater Than 2MB" 

                if (req.file?.path) {
                  try { await fs.unlink(req.file.path); } catch {}
                }
                return resp.status(400).render("signup", { title: "Sign up", chrome: false, error: msg });
            }else{
                next()
            }
        })
    },
    signUpValidators,
    async (req, res) => {
        const errors = validationResult(req);
        const { fullname, email, phone, position, password } = req.body;
        console.log("BODY: ", req.body)
        if (!errors.isEmpty()) {
            if (req.file?.path) {
                try { await fs.unlink(req.file.path); } catch {
                 }
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
    res.render("profile", {
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