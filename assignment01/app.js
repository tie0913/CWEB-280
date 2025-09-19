
function pad(n){
  return n.toString().padStart(2, "0")
}

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
        subtract:(a, b) => a - b,
        formatDate:(d)=>`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
        percentage: (numinator, denumirator) => (numinator / denumirator) * 100 + "%",
        canInvite:(e) => {
          return e.status.code === 1 && e.states.code === 2 && new Date() <= e.deadline
        },
        eq:(a, b) => a === b
    }
});
const crypto = require('crypto');

const app = express();

app.use((req, res, next) => {
  res.locals.cspNonce = crypto.randomBytes(16).toString('base64');
  next();
});

// --- Core middleware ---
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "script-src": [
        "'self'",
        "https://cdn.tailwindcss.com",
        "https://cdn.jsdelivr.net",
        (req, res) => `'nonce-${res.locals.cspNonce}'`
      ],
      "style-src": ["'self'", "https://fonts.googleapis.com", "'unsafe-inline'"],
      "font-src": ["'self'", "https://fonts.gstatic.com"],
      "script-src-attr": ["'unsafe-inline'"],
    }
  }
}));
app.use(express.urlencoded({ extended: true })); // parse form posts
app.use(express.json());                         // parse JSON bodies
app.use(cookieParser());                         // read httpOnly JWT cookie

// Serve client-side JS (signup-validate.js, etc.)
app.use(express.static(path.join(__dirname, "public")));

// --- View engine ---
app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

app.use((req, res, next) => {
    const token = req.cookies?.session;
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

const eventRouter = require("./routes/events")

app.use("/events", eventRouter)
app.use(express.static("public"))

// --- Routes ---
// NOTE: these require your route files to export CommonJS modules (module.exports = router)
const authRoutes = require("./routes/auth.js");
const registrationRoutes = require("./routes/registrations.js");

app.get("/", (req, res) => {
    res.render("home", { title: "Home", message: "Hello Welcome" });
});

app.use(authRoutes);          // /signin, /signup, /logout, /signup/success
app.use("/registrations", registrationRoutes);  // /my/registrations, /register (GET/POST)

app.use((req, res) => res.status(404).render("errors/404", { title: "Not Found" }));

app.listen(PORT, () => {
    console.log(`Server has been started on http://localhost:${PORT}`);
});
