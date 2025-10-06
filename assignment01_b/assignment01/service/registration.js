/**
 * 
 * 
 * 
 * registration structure
 *      user id
 *      event id
 *      regist_date
 *      
 * 
 */
const {v4:uuidv4} = require("uuid")

class RegistrationService{
    #tickets
    #list
    constructor(){
        this.#list = []
        this.#tickets = new Set()
    }
    getAllRegistration(){
        return this.#list
    }

    getRegistrationByUserId(userId){
        return this.#list.filter(e => e.userId === userId)
    }

    regist(userId, token){
        const eventId = token.eventId
        const uuid = token.uuid
        let code = 0
        let message = ""
        if(this.#tickets.has(uuid)){
            code = 1
            message = "Tickets has been used already"
        }else{
            this.#tickets.add(uuid)
            this.#list.push({
                userId:userId,
                eventId:eventId,
                createdAt: new Date()
            });
        }

        return {
            code:code,
            message: message,
            succeed() {return code === 0;}
        }
    }
}


module.exports = new RegistrationService()