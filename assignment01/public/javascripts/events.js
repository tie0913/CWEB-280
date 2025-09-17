
const path = require("path")
const Constants = require("./constants")
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

    for(let i = 0; i < size;i++){
        res.push({
            "id":i,
            "name":`Event Name ${i}`,
            "status":getStatus(),
            "states":getStates(),
            "type":getType(),
            "occupied":0,
            "vacant":100,
            "seats": 100,
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
            total:matched.length
        }
    }
}

module.exports = new EventService()