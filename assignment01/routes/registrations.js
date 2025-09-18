const { Router } =  require("express");
const { requireAuth } = require ("../middleware/auth.js");
const {
    listEvents,
    findEvent,
    tryReserveSeat,
    addRegistration,
    listUserRegistrations,
} = require("../util/eventStore.js");

const router = Router();


router.get("/my/registrations", requireAuth, async (req, res) => {
    const rows = await listUserRegistrations(req.user.id);

    const registrations = rows.map((r) =>({
        id: r.id,
        createAt: r.createAt,
        event: r.event
        ? { id: r.event.id, name: r.event.name, type: r.event.type, remaining: r.event.remaining} : null,
    }));

    res.render("my-registrations", { title: "My Registrations", registrations});
});

router.get("/register", requireAuth, async (req, res) => {
    const { eventId } = req.query;
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

    await addRegistration({ userId: req.user.id, eventId });
    res.redirect("/my/registrations");
});

module.exports = router;