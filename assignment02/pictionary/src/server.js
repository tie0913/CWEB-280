require('dotenv').config();
const http = require('http');
const app = require('./app');
const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const { getRedis, closeRedis } = require('./db/redis');
const { closeMongo } = require('./db/mongo');
const registerRoomSocket = require('./sockets/room.socket');

const PORT = Number(process.env.PORT) || 3000;
const server = http.createServer(app);

// Socket.IO
const io = new Server(server, { cors: { origin: '*' } }); // prod 收紧
const pub = getRedis().duplicate();
const sub = getRedis().duplicate();
Promise.all([pub.connect?.(), sub.connect?.()].map(p => p?.catch?.(() => {}))).finally(() => {
  io.adapter(createAdapter(pub, sub));
});

/** 
 * registe websocket event
 */ 
io.on('connection', (socket) => {
  registerRoomSocket(io, socket);
});

/*
 * launch the server
 */
server.listen(PORT, () => console.log(`HTTP+WS on http://localhost:${PORT}`));

/*
 * shutdown the server gracefully.
 */
async function shutdown(sig) {
  console.log(`\n${sig} received, shutting down...`);
  io.close();
  server.close(async () => {
    try { await closeRedis(); await closeMongo(); } finally { process.exit(0); }
  });
}
['SIGINT','SIGTERM'].forEach(s => process.on(s, () => shutdown(s)));
