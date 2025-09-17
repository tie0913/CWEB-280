var express = require('express');

var eventRouter = express.Router();

const path = require("path")
const eventService = require("../public/javascripts/events")

eventRouter.get('/list', (res, resp) => {
    const param = {
        "statusCode":isNaN(res.query.statusCode)? -1 : parseInt(res.query.statusCode),
        "typeCode":isNaN(res.query.typeCode)? -1 : parseInt(res.query.typeCode),
        "pagination":{
            "pageSize":res.query.pageSize || 10,
            "pageNo":res.query.pageNo || 1
        }
    }
    console.log(param)
    const eventsListWithTotal = eventService.getEventList(param)
    resp.render("events", {
        "eventsListWithTotal": eventsListWithTotal
    })
});

module.exports = eventRouter;