
const jwt = require("jsonwebtoken")
const SECRET = "saskpolytechnic-regian-cst-year2"


class Invites{
    create(eventId, uuid){
        return jwt.sign({
            eventId:eventId,
            unique:uuid
        }, SECRET, {
            expiresIn:'24h'
        })
    }
}

module.exports = new Invites()