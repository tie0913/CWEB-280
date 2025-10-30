const roomRepo = require('../repositories/room.repo');
const { WAITING, ONGOING, RoomState } = require('../constants/RoomConstants');
const { ObjectId } = require('mongodb');

const eqId = (a,b) => a.toString() === b.toString();

class RoomService{
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

    async deleteRoom(roomId, userId){
        const room = await roomRepo.getRoomById(roomId);
        if(!room) throw new Error('Room not found');
        if(!eqId(room.ownerId, userId)) throw new Error('Only owner can delete the room');
        await roomRepo.delete(roomId);
    }
}

module.exports = new RoomService();