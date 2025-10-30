const { createRoomSchema, listRoomsSchema } = require("../schemas/room.joi");
const roomService = require("../services/room.service");
const { succeed, fail } = require("../util/response");

class RoomController {
  async createRoom(req, res) {
    const { error, value } = createRoomSchema.validate(req.body);
    if (error)
      return res.status(400).json(
        fail(
          1,
          error.details.map((d) => d.message)
        )
      );
    try {
      const room = await roomService.createRoom(value, req.user['_id']);
      res.status(201).json(succeed(room));
    } catch (err) {
      res.status(500).json(fail(-1, err.message));
    }
  }

  async list(req, res) {
    const { error, value } = listRoomsSchema.validate(req.query);
    if (error)
      return res.status(400).json(
        fail(
          1,
          error.details.map((d) => d.message)
        )
      );

    try {
      res.json(succeed(await roomService.listRooms(value)));
    } catch (err) {
      res.status(500).json(fail(-1, err.message));
    }
  }

  async join(req, res) {
    try{
        const room = await roomService.joinRoom(req.params.roomId, req.user['_id']);
        res.json(succeed(room));
    } catch(err){
        const code = err.message === 'Room not found' ? 404 :
                     err.message.startsWith('Cannot join') ? 400 :
                     err.message === 'Room is full' ? 403 :
                     err.message === 'User already in room' ? 409 : 500;
        res.status(code).json(fail(-1, err.message));
    }
  }

  async leave(req, res) {
    try{
        const result = await roomService.leaveRoom(req.params.roomId, req.user['_id']);
        if(result.closed){
            const message = result.reason === 'owner left' ? 'Room closed as owner left' : 'Room closed';
            res.json(succeed({message}));
        }
        res.json(succeed(result.room));
    } catch(err){
        const code = err.message === 'Room not found' ? 404 :
                     err.message === 'User not in room' ? 400 : 500;
        res.status(code).json(fail(-1, err.message));
    }
  }

  async start(req, res) {
    try{
        const room = await roomService.startRoom(req.params.roomId, req.user['_id']);
        res.json(succeed(room));
    } catch(err){
        const code = err.message === 'Room not found' ? 404 :
                     err.message === 'Only owner can start the room' ? 403 :
                     err.message === 'Room is not in waiting state' ? 400 : 500;
        res.status(code).json(fail(-1, err.message));
    }
  }

  async delete(req, res) {
    try{
        await roomService.deleteRoom(req.params.roomId, req.user._id);
        res.status(204).end();
    } catch(err){
        const code = err.message === 'Room not found' ? 404 : 500;
        res.status(code).json(fail(-1, err.message));
    }
  }
}

module.exports = new RoomController();
