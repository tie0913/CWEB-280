
const path = require("path")
const Constants = require("./constants")

const createPage = require("../util/page")

const invites = require("./invites")
const {v4: uuidv4} = require("uuid")

function createList(size){
    res = [
      { "id": 1,  "name": "Cloud Security",        "type": { "code": 2, "name": "Seminar" } },
      { "id": 2,  "name": "Riverfront Cycling",    "type": { "code": 6, "name": "Tour" } },
      { "id": 3,  "name": "UX Prototyping",        "type": { "code": 1, "name": "Workshops" } },
      { "id": 4,  "name": "Microeconomics",        "type": { "code": 3, "name": "Lecture" } },
      { "id": 5,  "name": "Prompt Engineering",    "type": { "code": 4, "name": "Webinar" } },

      { "id": 6,  "name": "Botanical Garden",      "type": { "code": 6, "name": "Tour" } },
      { "id": 7,  "name": "Digital Photography",   "type": { "code": 1, "name": "Workshops" } },
      { "id": 8,  "name": "AI in Healthcare",      "type": { "code": 2, "name": "Seminar" } },
      { "id": 9,  "name": "Evolutionary Biology",  "type": { "code": 3, "name": "Lecture" } },
      { "id": 10, "name": "Leadership Skills",     "type": { "code": 5, "name": "Training" } },

      { "id": 11, "name": "Historic Downtown",     "type": { "code": 6, "name": "Tour" } },
      { "id": 12, "name": "Art History",           "type": { "code": 3, "name": "Lecture" } },
      { "id": 13, "name": "Public Speaking",       "type": { "code": 5, "name": "Training" } },
      { "id": 14, "name": "Serverless Architecture","type": { "code": 4, "name": "Webinar" } },
      { "id": 15, "name": "Data Science",          "type": { "code": 5, "name": "Training" } },

      { "id": 16, "name": "Comparative Literature","type": { "code": 3, "name": "Lecture" } },
      { "id": 17, "name": "Startup Pitch",         "type": { "code": 1, "name": "Workshops" } },
      { "id": 18, "name": "Blockchain Basics",     "type": { "code": 4, "name": "Webinar" } },
      { "id": 19, "name": "Museum Highlights",     "type": { "code": 6, "name": "Tour" } },
      { "id": 20, "name": "Behavioral Economics",  "type": { "code": 2, "name": "Seminar" } },

      { "id": 21, "name": "SQL for Analysts",      "type": { "code": 5, "name": "Training" } },
      { "id": 22, "name": "Sustainable Energy",    "type": { "code": 2, "name": "Seminar" } },
      { "id": 23, "name": "Remote Work",           "type": { "code": 4, "name": "Webinar" } },
      { "id": 24, "name": "Creative Coding",       "type": { "code": 1, "name": "Workshops" } },
      { "id": 25, "name": "Urban Planning",        "type": { "code": 2, "name": "Seminar" } },

      { "id": 26, "name": "Data Visualization",    "type": { "code": 1, "name": "Workshops" } },
      { "id": 27, "name": "Tech Campus",           "type": { "code": 6, "name": "Tour" } },
      { "id": 28, "name": "Cybersecurity Trends",  "type": { "code": 4, "name": "Webinar" } },
      { "id": 29, "name": "Agile Project",         "type": { "code": 5, "name": "Training" } },
      { "id": 30, "name": "Modern Physics",        "type": { "code": 3, "name": "Lecture" } },

      { "id": 31, "name": "Green Tech Expo",        "type": { "code": 1, "name": "Workshops" } },
      { "id": 32, "name": "Global Trade Forum",     "type": { "code": 2, "name": "Seminar" } }
    ];

    function getStatus(){
        let seed = Math.floor(Math.random() * 100) + 1
        return Constants.event.status[seed % Constants.event.status.length] 
    }

    function getType(){
        let seed = Math.floor(Math.random() * 100) + 1
        return Constants.event.types[seed % Constants.event.types.length] 
    }

    function getRandom(limit){
        return Math.floor(Math.random() * limit) + 1
    }

    function randomDate(start, end) {
        const startTime = start.getTime();
        const endTime = end.getTime();
        const randomTime = startTime + Math.random() * (endTime - startTime);
        return new Date(randomTime);
    }

    for(let e of res){
        let seats = getRandom(50)
        let vacant = getRandom(seats)
        if(e.id > 0 && e.id % 4 === 0){
            vacant = 1
        }
        e.vacant = vacant
        e.seats = seats
        e.status = getStatus()
        e.deadline = randomDate(new Date("2025-09-28"), new Date("2025-10-15"))
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

        if(matched.length  <= pageSize && pageNo > 1){
            throw new Error("Pagination Error")
        }

        return {
            list:matched.slice((pageNo - 1) * pageSize, pageNo * pageSize),
            pageInfo: createPage(pageSize, pageNo, matched.length)
        }
    }

    getEventByIds(...ids){
        const result = this.#list.filter(e => {
            return ids.includes(e.id)
        })
        return result
    }


    createInvites(eventId){
        let event = this.#list.find(e => e.id === eventId)
        return invites.create(event.id, uuidv4())
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