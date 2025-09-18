
const PORT = 3000;
const path = require("path");
const express = require("express");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const exphbs = require("express-handlebars");
const jwt = require("jsonwebtoken")
const {JWT_SECRET} = require("./config/jwt.js")
// --- Handlebars engine + helpers ---
const hbs = exphbs.create({
    extname: ".hbs",
    defaultLayout: "main",
    layoutsDir: path.join(__dirname, "views/layouts"),
    partialsDir: path.join(__dirname, "views/partials"),
    helpers: {
        isEqual: function (a, b, options) {
            return a === b ? options.fn(this) : options.inverse(this);
        },
        multiply: (a, b) => a * b,
        formatPrice: (price) => `$${Number(price).toFixed(2)}`,
        remove: (c) => String(c).substring(1),
        eq: (a, b) => a === b, // simple equality (used in some templates)
    },
});

const app = express();

// --- Core middleware ---
app.use(helmet());
app.use(express.urlencoded({ extended: true })); // parse form posts
app.use(express.json());                         // parse JSON bodies
app.use(cookieParser());                         // read httpOnly JWT cookie

// Serve client-side JS (signup-validate.js, etc.)
app.use(express.static(path.join(__dirname, "public")));

// --- View engine ---
app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

// --- Default locals (nav + chrome default) ---
app.use((req, res, next) => {
    // pages can override with { chrome: false } to hide header/footer
    res.locals.chrome = true;

    const token = req.cookies?.session;
    console.log(`Token from HOME: ${token}`)
    if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      req.user = payload;      
      res.locals.user = payload;  
    } catch(e) {
        console.log(`ERROR: ${e}`);
        res.clearCookie("session");  // bad/expired token — clear it
    }
}
  
    next();
});

// --- Routes ---
// NOTE: these require your route files to export CommonJS modules (module.exports = router)
const authRoutes = require("./routes/auth.js");
const registrationRoutes = require("./routes/registrations.js");

app.get("/", (req, res) => {
    res.render("home", { title: "Home", message: "Hello Welcome" });
});

app.use(authRoutes);          // /signin, /signup, /logout, /signup/success
app.use(registrationRoutes);  // /my/registrations, /register (GET/POST)

//app.use((req, res) => res.status(404).render("errors/404", { title: "Not Found" }));

app.listen(PORT, () => {
    console.log(`Server has been started on http://localhost:${PORT}`);
});
