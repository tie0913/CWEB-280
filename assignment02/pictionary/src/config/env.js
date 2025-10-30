require('dotenv').config();
const path = require('path')

function toAbs(p) {
  if (!p) return null;
  return path.isAbsolute(p) ? p : path.resolve(process.cwd(), p);
}

const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3000,

  mongo: {
    url: process.env.MONGO_URL || 'mongodb://localhost:27017/myapp',
    dbName: process.env.MONGO_DB || 'myapp',
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  http_log: {
    level: process.env.HTTP_LOG_LEVEL || 'info',
    toFile: String(process.env.HTTP_LOG_TO_FILE || 'false').toLowerCase() === 'true',
    filePath: toAbs(process.env.HTTP_LOG_FILE_PATH || './logs/http.log'),
    rotate: String(process.env.HTTP_LOG_ROTATE || 'false').toLowerCase() === 'true',
    rotateDir: toAbs(process.env.HTTP_LOG_ROTATE_DIR || './logs'),
    maxFiles: Number(process.env.HTTP_LOG_MAX_FILES || 7),
  },
  biz_log: {
    level: process.env.BIZ_LOG_LEVEL || 'info',
    toFile: String(process.env.BIZ_LOG_TO_FILE || 'false').toLowerCase() === 'true',
    filePath: toAbs(process.env.BIZ_LOG_FILE_PATH || './logs/http.log'),
    rotate: String(process.env.BIZ_LOG_ROTATE || 'false').toLowerCase() === 'true',
    rotateDir: toAbs(process.env.BIZ_LOG_ROTATE_DIR || './logs'),
    maxFiles: Number(process.env.BIZ_LOG_MAX_FILES || 7),
  },
  jwt_secret:process.env.JWT_SECRET,
  cookie_name:process.env.COOKIE_NAME
};

module.exports = config