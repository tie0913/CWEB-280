const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const { ensureFileWithDefault, readJson, writeJsonAtomic, withLock } = require("./jsonUtil.js");

const DATA_DIR = path.resolve("database");
const EVENTS_FILE = path.join(DATA_DIR, "events.json");
const REGS_FILE = path.join(DATA_DIR, "registrations.json");

async function ensureFiles() {
    await ensureFileWithDefault(EVENTS_FILE, { events: [] });
    await ensureFileWithDefault(REGS_FILE, { registrations: [] });
}

async function readEvents() {
    await ensureFiles();
    const { events = [] } = await readJson(EVENTS_FILE, { events: [] });
    return events;
}

async function readRegs() {
    await ensureFiles();
    const { registrations = [] } = await readJson(REGS_FILE, { registrations: [] });
    return registrations;
}

async function findEvent(id) {
    const events = await readEvents();
    return events.find(e => e.id === id) || null;
}

async function listEvents() {
    return await readEvents();
}

async function tryReserveSeat(eventId) {
    let ok = false;
    await withLock(async () => {
        const events = await readEvents();
        const idx = events.findIndex(e => e.id === eventId);
        if (idx < 0) throw new Error("Event not found");

        const event = events[idx];
        if (typeof event.remaining !== "number" || event.remaining <= 0) return;

        events[idx] = { ...event, remaining: event.remaining - 1 };
        await writeJsonAtomic(EVENTS_FILE, { events });
        ok = true;
    });
    return ok;
}

 async function addRegistration({ userId, eventId }) {
    const reg = {
        id: crypto.randomUUID(),
        userId,
        eventId,
        timestamp: new Date().toISOString()
    };
    await withLock(async () => {
        const { registrations } = await readJson(REGS_FILE, {registrations: []});
        registrations.push(reg);
        await writeJsonAtomic(REGS_FILE, { registrations });
    });
    return reg;
}

 async function listUserRegistrations(userId) {
    const [regs, events] = await Promise.all([readRegs(), readEvents()]);
    return regs.filter(r => r.userId === userId)
        .map(r => ({ ...r,event: events.find(e => e.id === r.eventId) || null }));
}

 async function seedEventsIfEmpty(seed = []) {
    await withLock(async () => {
        const { events } = await readJson(EVENTS_FILE, { events: [] });
        if (events.length > 0) return;
        await writeJsonAtomic(EVENTS_FILE, { events: seed });
    });
}

module.exports = {
  findEvent,
  listEvents,
  tryReserveSeat,
  addRegistration,
  listUserRegistrations,
  seedEventsIfEmpty,
};

