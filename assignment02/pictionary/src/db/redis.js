const Redis = require('ioredis');
let redis;

function getRedis() {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      enableReadyCheck: true,
      maxRetriesPerRequest: null
    });
    redis.on('error', (err) => console.error('Redis error', err));
  }
  return redis;
}
async function closeRedis() { if (redis) await redis.quit(); }

module.exports = { getRedis, closeRedis };
