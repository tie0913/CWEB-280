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
    const eventIds = registrationList.map(r => {r.eventId})
    
    /**
     * search event list by event id array
     */
    const eventList = eventService.getEventByIds(eventIds)

    /** 
    const rows = await listUserRegistrations(req.user.id);

    const registrations = rows.map((r) =>({
        id: r.id,
        createAt: r.createAt,
        event: r.event
        ? { id: r.event.id, name: r.event.name, type: r.event.type, remaining: r.event.remaining} : null,
    }));
    */

    //res.render("my-registrations", { title: "My Registrations", registrations});

    res.render("my-registrations", {
        list:registrationList
    })
});
/** 
router.get("/register", requireAuth, async (req, res) => {
    const { eventId } = req.query;
    const events = await listEvents();
    const selectedEvent = eventId ? await findEvent(eventId) : null;

    res.render("register", { title: "Event Registration", events, selectedEvent });
});*/

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

    /*
    const events = await findEvent(eventId);
    if (!events) {
        return res.status(404).render("errors/404", { title: "Event Not Found" });
    }
    const ok = await tryReserveSeat(eventId);
    if (!ok) return res.status(409).render("errors/Full", { title: "Event Full" });

    await addRegistration({ userId: req.user.id, eventId });
    res.redirect("/my/registrations");
    */
});

module.exports = router;