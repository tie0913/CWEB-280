const { Router } =  require("express");
const { requireAuth } = require ("../middleware/auth.js");
const {
    listEvents,
    findEvent,
    tryReserveSeat,
    addRegistraction,
    listUserRegistrations,
} = require("../util/eventStore.js");

const router = Router();
router.get("/my/registrations", requireAuth, async (req, res) => {
    const rows = await listUserRegistrations(req.user.id);
    res.render("my-registrations", { title: "My Registrations", registrations: rows });
});

router.get("/register", requireAuth, async (req, res) => {
    const { eventID } = req.query;
    const events = await listEvents();
    const selectedEvent = eventId ? await findEvent(eventId) : null;
    res.render("register", { title: "Event Registration", events, selectedEvent });
});

router.post("/register", requireAuth, async (req, res) => {
    const { eventId } = req.body;
    const events = await findEvent(eventId);
    if (!events) {
        return res.status(404).render("errors/404", { title: "Event Not Found" });
    }
    const ok = await tryReserveSeat(eventId);
    if (!ok) return res.status(409).render("errors/Full", { title: "Event Full" });

    await addRegistraction({ userId: req.user.id, eventId });
    res.redirect("/my/registrations");
});

module.exports = router;