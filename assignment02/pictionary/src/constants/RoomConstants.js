const CLOSED = 0;
const WAITING = 1;
const ONGOING = 2;

const STATES = [
    { code: CLOSED, name: "closed" },
    { code: WAITING, name: "waiting" },
    { code: ONGOING, name: "ongoing" }
];

class RoomState {
    static isWaiting(room) {
        return room.state === WAITING;
    }
    static isOngoing(room) {
        return room.state === ONGOING;
    }

    static start(room) {
        room.state = ONGOING;
    }

    static close(room) {
        room.state = CLOSED;
    }
}

module.exports = {CLOSED, WAITING, ONGOING, RoomState, STATES };
