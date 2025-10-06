
function create(values){
    res = []
    for(let i = 0; i < values.length; i++){
        res.push({
            "code": i + 1,
            "name": values[i]
        })
    }
    return res
}

const Constants = {
    "event":{
        "status":create(["Open", "Closed"]),
        "states":create(["Sold out", "Presale Only"]),
        "types":create(["Workshops", "Seminar", "Lecture", "Webinar", "Training", "Tour"])
    }
}

module.exports = Constants