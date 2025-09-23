
const jwt = require("jsonwebtoken")
const SECRET = "saskpolytechnic-regian-cst-year2"


class Invites{
    create(eventId, uuid){
        const token = {
            eventId:eventId,
            uuid:uuid
        }
        const invitation = jwt.sign(token, SECRET, {
            expiresIn:'24h'
        })
        return invitation
    }

    resolve(invitation){
        let message = ""
        let code = 0
        let res
        try{
            res = jwt.verify(invitation, SECRET)
        }catch(err){
            code = -1
            message = "Verification Error"
            if(err.name === "TokenExpiredError"){
                message = "Token Has Expired"
            }else if(err.name === "JsonWebTokenError"){
                message = "Token is incorrect"
            }
        }
        return {
            code : code,
            message : message,
            verification: res,
            succeed(){
                return code === 0
            }
        }
    }
}

module.exports = new Invites()