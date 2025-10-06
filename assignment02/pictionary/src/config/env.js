const { cleanEnv, str, num, url } = require('envalid');
require('dotenv').config();

module.exports = cleanEnv(process.env, {
  PORT: num({ default: 3000 }),
  MONGO_URL: url(),
  MONGO_DB: str({ default: 'app' }),
  REDIS_URL: url({ default: 'redis://localhost:6379' })
});
