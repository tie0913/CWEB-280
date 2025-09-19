
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

    resolve(invitation){

        let message = ""
        let code = 0
        try{
            let res = jwt.verify(invitation, SECRET)
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