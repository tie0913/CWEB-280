module.exports = function registerRoomSocket(io, socket) {
  // heart beat
  socket.on('ping', () => socket.emit('pong'));

  // join room 
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    io.to(roomId).emit('sys', { msg: `user ${socket.id} joined`, ts: Date.now() });
  });

  // leave room
  socket.on('leave_room', (roomId) => socket.leave(roomId));

  // in room events broadcast
  socket.on('room_event', ({ roomId, type, payload }) => {
    io.to(roomId).emit('room_event', { from: socket.id, type, payload, ts: Date.now() });
  });
};
