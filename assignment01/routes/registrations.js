const { Router } =  require("express");
const { requireAuth } = require ("../middleware/auth.js");
const registrationService = require("../service/registration")
const eventService = require("../service/events")
const Invites = require("../service/invites")
const {
    listEvents,
    findEvent,
    tryReserveSeat,
    addRegistration,
    listUserRegistrations,
} = require("../util/eventStore.js");

const router = Router();


router.get("/enter", requireAuth, async (req, res) => {


    /**
     * get registration list by user id
     */
    let registrationList = registrationService.getRegistrationByUserId(req.user.id);

    /**
     * create an array containing event id
     */
    const eventIds = registrationList.map(r => r.eventId)
    /**
     * search event list by event id array
     */
    const eventList = eventService.getEventByIds(eventIds)

    const byId = Object.fromEntries(eventList.map(e => [e.id, e]))
    const registrations = registrationList.map(r =>{
        const ev = byId[r.eventId] || null;
        return{
            id: r.id,
            createdAt: r.createdAt || null,
            event: ev ?{
                id: ev.id,
                name: ev.name,
                type: String(ev.type),
                remaining: typeof ev.vacant === "number" ? ev.vacant : 0,
            } : null,
        };
    });


    res.render("my-registrations", {
        registrations
    })
});

router.post("/register", requireAuth, async (req, res) => {
    const { code } = req.body;

    let user = req.user

    let verification = Invites.resolve(code)

    let message = ""

    if(verification.succeed()){
        let redeemResult = eventService.redeem(verification.verification.eventId)
        if(redeemResult.succeed()){
            const registResult = registrationService.regist(user.id, verification.verification)
            if(!registResult.succeed()){
                message = registResult.message
            }
        }else{
            message = redeemResult.message
        }
    }else{
        message = verification.message    
    }

    if (message){
        return res.redirect(`/registrations/enter?error=${encodeURIComponent(message)}`)
    }
    return res.redirect("registrations/enter")
});

module.exports = router;