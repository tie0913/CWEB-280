var express = require('express');

var eventRouter = express.Router();

const path = require("path")
const eventService = require("../service/events")
const readInt = require("./parameter")


function getOrElse(v, d){

    if(isNaN(v)){
        return d
    }else{
        let r 
        try {
            r = parseInt(v)
        } catch (error) {
            r = d
        }

        return r
    }
}


function getEventList(res, resp){
    let param = {
        "statusCode": getOrElse(res.query.statusCode, -1),
        "typeCode":getOrElse((res.query.typeCode), -1),
        "pagination":{
            "pageSize":getOrElse(res.query.pageSize,10),
            "pageNo":getOrElse(res.query.pageNo, 1)
        }
    }

    const eventsListWithTotal = eventService.getEventList(param)
    let result = {
        "data": eventsListWithTotal,
        "param":param
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