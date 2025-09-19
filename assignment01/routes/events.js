var express = require('express');

var eventRouter = express.Router();

const eventService = require("../service/events")
const readInt = require("./parameter")

const Constants = require("../service/constants")


function getOrElse(v, d){
    r = parseInt(v)
    if(isNaN(r)){
        return d
    }else{
        return r
    }
}


function getEventList(req, resp){
    let param = {
        "statusCode": getOrElse(req.query.statusCode, -1),
        "typeCode":getOrElse((req.query.typeCode), -1),
        "pagination":{
            "pageSize":getOrElse(req.query.pageSize,10),
            "pageNo":getOrElse(req.query.pageNo, 1)
        }
    }

    console.log(resp.locals.user)

    const typeList = Constants.event.types
    const statusList = Constants.event.status

    const eventsListWithTotal = eventService.getEventList(param)

    condition = {
        statusCode: param.statusCode == -1 ?  "" : param.statusCode,
        typeCode: param.typeCode == -1 ? "" : param.typeCode
    }

    let result = {
        "data": eventsListWithTotal,
        "param":condition,
        "selections":{
            "typeList":typeList,
            "statusList":statusList
        }
    }
    resp.render("events", result)
}

eventRouter.get('/list', getEventList);

eventRouter.get('/invites', (req, resp)=>{
    const p = readInt("eventId", req.query.eventId)

    if(p.ok){
        const eventId = p.value
        const token = eventService.createInvites(eventId)
        resp.json({code:0, message:token})
    }else{
        resp.json({code:-1, message:p.msg})
    }
})

module.exports = eventRouter;