const { createRoomSchema, listRoomsSchema } = require("../schemas/room.joi");
const roomService = require("../services/room.service");
const { succeed, fail } = require("../util/response");

class RoomController {

  /**
   * Create a new chat room.
   *
   * Validates request data with createRoomSchema.
   * If validation fails, return HTTP 400 with error messages.
   * Otherwise, create a new room using roomService and the current user's ID.
   *
   * Response:
   *   201: Room created successfully.
   *   400: Invalid input data.
   *   500: Server error during room creation.
   */
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
      res.status(200).json(fail(-1, err.message));
    }
  }

  /**
   * List available chat rooms.
   *
   * Validates query parameters with listRoomsSchema.
   * If invalid, return HTTP 400 with error messages.
   * Otherwise, fetch and return the room list from roomService.
   *
   * Response:
   *   200: List of rooms.
   *   400: Invalid query parameters.
   *   500: Server error while listing rooms.
   */
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
      console.log(value)
      res.json(succeed(await roomService.listRooms(value)));
    } catch (err) {
      res.status(500).json(fail(-1, err.message));
    }
  }

  /**
   * Join a chat room by ID.
   *
   * Uses roomService.joinRoom() with the given roomId and current user ID.
   * Handles common join errors and returns the proper HTTP status.
   *
   * Response:
   *   200: Joined successfully.
   *   400: Invalid join request.
   *   403: Room is full.
   *   404: Room not found.
   *   409: User already in room.
   *   500: Server error.
   */
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

  /**
   * Leave a chat room.
   *
   * Calls roomService.leaveRoom() with roomId and current user ID.
   * If the room is closed (e.g., owner left), return a message accordingly.
   * Handles common errors with proper HTTP codes.
   *
   * Response:
   *   200: Successfully left or room closed.
   *   400: User not in room.
   *   404: Room not found.
   *   500: Server error.
   */
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

  /**
   * Start a chat room session.
   *
   * Calls roomService.startRoom() with roomId and user ID.
   * Only the owner can start a room that is in the waiting state.
   * Returns the updated room or an error with the proper status code.
   *
   * Response:
   *   200: Room started successfully.
   *   400: Room not in waiting state.
   *   403: Only owner can start the room.
   *   404: Room not found.
   *   500: Server error.
   */
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
}

module.exports = new RoomController();
