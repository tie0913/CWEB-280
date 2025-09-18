const PORT = 3000
const express = require("express")
const path = require("path")
const exphdb = require("express-handlebars")


function pad(n){
  return n.toString().padStart(2, "0")
}

const hbs = exphdb.create({
  extname: 'hbs',
  defaultLayout: 'main',
  layoutsDir: __dirname + '/views/layouts',
  partialsDir: __dirname + '/views/partials',
  helpers: {
    subtract:(a, b) => a - b,
    formatDate:(d)=>`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    percentage: (numinator, denumirator) => (numinator / denumirator) * 100 + "%",
    canInvite:(e) => {
      return e.status.code === 1 && e.states.code === 2 && new Date() <= e.deadline
    }
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
app.use(express.static("public"))

app.listen(PORT, ()=>{
  console.log("Server has been started")
})

