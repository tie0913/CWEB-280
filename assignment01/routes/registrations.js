const { Router } =  require("express");
const { requireAuth, requireAuthJson } = require ("../middleware/auth.js");
const registrationService = require("../service/registration")
const eventService = require("../service/events")
const Invites = require("../service/invites")
const {getUserById, readUsers} = require("../util/userStore.js")
const createPage = require("../util/page.js")
const getOrElse = require("../util/param")
const {
    listEvents,
    findEvent,
    tryReserveSeat,
    addRegistration,
    listUserRegistrations,
} = require("../util/eventStore.js");

const router = Router();


async function getRelatedInformation(registrationList, userId){
    /**
     * create an array containing event id
     */
    const eventIds = registrationList.map(r => r.eventId)

    /**
     * search event list by event id array
     */
    const eventList = eventService.getEventByIds(...eventIds)


    let userList = [];
    if(userId == undefined){
        let allUsers = await readUsers()
        userList = userList.concat(allUsers)
    }else{
        userList.push(await getUserById(userId))
    }

    /**
     * set up attributes and make sure each instance is a copy
     */
    return registrationList.map(r => {
        const event = eventList.find(e => e.id === r.eventId)
        const user = userList.find(u => u.id === r.userId)
        return {
            event:JSON.parse(JSON.stringify(event)),
            user:JSON.parse(JSON.stringify(user)),
            createAt:r.createdAt
        }
    })
}


router.get("/enter", requireAuth, async (req, res) => {

    const pageSize = getOrElse(req.query.pageSize,3)
    const pageNo = getOrElse(req.query.pageNo, 1)

    /**
     * get registration list by user id
     */
    let registrationList = registrationService.getRegistrationByUserId(req.user.id);

    let userId = undefined
    if(req.user.role !== "admin"){
        userId = req.user.id
    }
  
    /**
     * query event and user information and combine the together based on the registration information
     */
    let registrations = []
    if(registrationList.length > 0){
        registrations = registrations.concat(await getRelatedInformation(registrationList, userId))
    }
    
    res.render("registrations", {
        "registrations":registrations.slice((pageNo - 1) * pageSize, pageNo * pageSize),
        "pageInfo":createPage(pageSize, pageNo, registrations.length)
    })
});


function dealwithRegistration(user, code){
    const verification = Invites.resolve(code); if(!verification.succeed()){return {code:-1, message: verification.message}}
    const redeemResult = eventService.redeem(verification.verification.eventId); if(!redeemResult.succeed()) {return {code:-1, message: redeemResult.message}}
    const registResult = registrationService.regist(user.id, verification.verification); if(!registResult.succeed()) {return {code : -1, message: registResult.message}}
    return {code:0, message:"Registration Succeed"}
}

router.post("/regist", requireAuthJson, async (req, res) => {
    const { code } = req.body;
    let user = req.user
    const registrationResult = dealwithRegistration(user, code)
    res.json(registrationResult)
});

module.exports = router;