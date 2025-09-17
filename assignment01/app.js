const PORT = 3000
const express = require("express")
const path = require("path")
const exphdb = require("express-handlebars")

const hbs = exphdb.create({
  extname: 'hbs',
  defaultLayout: 'main',
  layoutsDir: __dirname + '/views/layouts',
  partialsDir: __dirname + '/views/partials',
  helpers: {
    isEqual: (a, b, options) => {
      return a === b ? options.fn(this) : options.inverse(this);
    },
    multiply: (a, b) => a * b,
    formatPrice: (price) => `$${price.toFixed(2)}`,
    remove:(c) => c.substring(1),
    percentage: (numinator, denumirator) => (numinator / denumirator) * 100 + "%",
    depercentage: (numinator, denumirator) => ((denumirator - numinator)/ denumirator) * 100 + "%"
  }
})

const app = express()
app.engine('hbs', hbs.engine)
app.set("view engine", "hbs")
app.set("views", path.join(__dirname, "views"));

const eventRouter = require("./routes/events")

app.get("/", (req, resp) => {
  resp.render("home", {"message":"Hello Welcome"})
})

app.use("/events", eventRouter)

app.listen(PORT, ()=>{
  console.log("Server has been started")
})

