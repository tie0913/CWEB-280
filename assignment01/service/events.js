
const path = require("path")
const Constants = require("./constants")

const createPage = require("./page")

const invites = require("./invites")
const {v4: uuidv4} = require("uuid")

function createList(size){
    res = []

    function getStatus(){
        let seed = Math.floor(Math.random() * 100) + 1
        return Constants.event.status[seed % Constants.event.status.length] 
    }

    function getStates(){
        let seed = Math.floor(Math.random() * 100) + 1
        return Constants.event.states[seed % Constants.event.states.length] 
    }

    function getType(){
        let seed = Math.floor(Math.random() * 100) + 1
        return Constants.event.types[seed % Constants.event.types.length] 
    }

    function getRandom(limit){
        return Math.floor(Math.random() * limit) + 1
    }

    for(let i = 0; i < size;i++){

        seats = getRandom(100)
        vacant = getRandom(seats)

        res.push({
            "id":i,
            "name":`Event Name ${i}`,
            "status":getStatus(),
            "states":getStates(),
            "type":getType(),
            "vacant":vacant,
            "seats": seats,
            "deadline":new Date("2025-09-30")
        })
    }

    return res
}
class EventService{
    #list
    constructor(){
        this.#list = createList(30)
    }

    getEventList({statusCode, typeCode, pagination:{pageSize, pageNo}}){
        let matched = this.#list.filter(e => {
            const statusMatched = statusCode < 0 ? true : e.status.code === statusCode
            const typeMatched = typeCode  < 0 ? true : e.type.code === typeCode
            return statusMatched && typeMatched
        })

        return {
            list:matched.slice((pageNo - 1) * pageSize, pageNo * pageSize),
            pageInfo: createPage(pageSize, pageNo, matched.length/pageSize, matched.length)
        }
    }

    getEventByIds(...ids){
        return this.#list.filter(e => ids.includes(e.id))
    }


    createInvites(eventId){
        let event = this.#list.find(e => e.id === eventId)
        return invites.create(event, uuidv4())
    }

    redeem(eventId){

        let code = 0
        let message = ""
        let event = this.#list.find(e => e.id === eventId)
        if(event.vacant > 0){
            event.vacant--
        }else{
            code = 1
            message = "insufficient seats"
        }

        return {
            code: code,
            message: message,
            succeed(){
                return code === 0
            }
        }
    }

}

module.exports = new EventService()