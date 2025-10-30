const roomRepo = require('../repositories/room.repo');
const { WAITING, RoomState } = require('../constants/RoomConstants');
const { ObjectId } = require('mongodb');

const eqId = (a,b) => a.toString() === b.toString();

class RoomService{

    /**
     * Create a new chat room.
     *
     * Builds a room object with the given name, owner, maxPlayers, and visibility.
     * Sets initial state to WAITING and adds the owner as the first member.
     * Saves the room via roomRepo and returns the created room with its ID.
     *
     * Returns:
     *   The created room object including _id.
     */
    async createRoom({name, maxPlayers, visibility}, ownerId){
        const ownerObjectId = new ObjectId(ownerId);
        const room = {
            name,
            ownerId: ownerObjectId,
            maxPlayers,
            visibility,
            state: WAITING ,
            members: [ownerObjectId],
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const roomId = await roomRepo.create(room);
        return {...room, _id: roomId}
    }

    /**
     * List chat rooms with filters and pagination.
     *
     * Retrieves rooms from roomRepo using query, visibility, and state filters.
     * Calculates total pages and returns paginated results.
     *
     * Returns:
     *   { list, page, size, total, totalPages }
     */
    async listRooms({ q, visibility, state, page, size}){
        const { total, items } = await roomRepo.list({
            q,
            visibility,
            state,
            skip: (page - 1) * size,
            limit: size
        });
        const totalPages = Math.ceil(total / size);
        return {list: items, page, size, total, totalPages};
    }

    /**
     * Join a user to a room.
     *
     * Verifies the room exists, is in the waiting state, not full,
     * and that the user is not already a member. Adds the user and updates the room.
     *
     * Throws:
     *   'Room not found' | 'Cannot join room...' | 'Room is full' | 'User already in room'
     *
     * Returns:
     *   The updated room object.
     */
    async joinRoom(roomId, userId){
        const room = await roomRepo.getRoomById(roomId);
        if(!room) throw new Error('Room not found');
        if(!RoomState.isWaiting(room)) throw new Error('Cannot join room that is not in waiting state');

        if(room.members.length >= room.maxPlayers) throw new Error('Room is full');
        if(room.members.some(id => eqId(id, userId))) throw new Error('User already in room');

        room.members.push(userId);
        room.updatedAt = new Date();
        await roomRepo.update(roomId, {members: room.members, updatedAt: room.updatedAt});
        return room;
    }

    /**
     * Remove a user from a room.
     *
     * Checks if the room exists and the user is a member.
     * If the owner or last member leaves, the room is deleted.
     * Otherwise, removes the user and updates the member list.
     *
     * Throws:
     *   'Room not found' | 'User not in room'
     *
     * Returns:
     *   { closed: true, reason } if room closed,
     *   { closed: false, room } otherwise.
     */
    async leaveRoom(roomId, userId){
        const room = await roomRepo.getRoomById(roomId);
        if(!room) throw new Error('Room not found');

        const isMember = room.members.some(id => eqId(id, userId));
        if(!isMember) throw new Error('User not in room');

        if(eqId(room.ownerId, userId)){
            await roomRepo.delete(roomId);
            return { closed: true, reason: 'owner left' };
        }

        room.members = room.members.filter(id => !eqId(id, userId));
        if(room.members.length === 0){
            await roomRepo.delete(roomId);
            return { closed: true, reason: 'no members left' };
        }

        room.updatedAt = new Date();
        await roomRepo.update(roomId, {members: room.members, updatedAt: room.updatedAt});
        return { closed: false, room};
    }

    /**
     * Start a room session.
     *
     * Ensures the room exists, the requester is the owner,
     * and the room is in the waiting state before starting it.
     * Updates the room state and timestamp.
     *
     * Throws:
     *   'Room not found' | 'Only owner can start the room' | 'Room is not in waiting state'
     *
     * Returns:
     *   The updated room object.
     */
    async startRoom(roomId, userId){
        const room = await roomRepo.getRoomById(roomId);
        if(!room) throw new Error('Room not found');
        if(!eqId(room.ownerId, userId)) throw new Error('Only owner can start the room');
        if(!RoomState.isWaiting(room)) throw new Error('Room is not in waiting state');

        RoomState.start(room);
        room.updatedAt = new Date();
        await roomRepo.update(roomId, {state: room.state, updatedAt: room.updatedAt});
        return room;
    }

    /**
     * Delete a room.
     *
     * Verifies the room exists and that the requester is the owner.
     * Deletes the room from the repository if authorized.
     *
     * Throws:
     *   'Room not found' | 'Only owner can delete the room'
     */
    async deleteRoom(roomId, userId){
        const room = await roomRepo.getRoomById(roomId);
        if(!room) throw new Error('Room not found');
        if(!eqId(room.ownerId, userId)) throw new Error('Only owner can delete the room');
        await roomRepo.delete(roomId);
    }
}

module.exports = new RoomService();