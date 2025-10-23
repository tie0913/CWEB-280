const fs = require('fs');
const path = require('path');
const pino = require('pino');
const pinoHttp = require('pino-http');
const config = require('../config/env');

function ensureDirFor(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function createHttpLogger() {
  let logger;

  if (config.http_log.toFile) {
    ensureDirFor(config.http_log.filePath);
    const stream = fs.createWriteStream(config.http_log.filePath, { flags: 'a' });

    logger = pino(
      {
        level: config.http_log.level,
        timestamp: pino.stdTimeFunctions.isoTime,
        formatters: { level: (l) => ({ level: l }) },
      },
      stream
    );
  } else {
    logger = pino({
      level: config.http_log.level,
      transport: {
        target: 'pino-pretty', // 彩色控制台输出
        options: { translateTime: 'SYS:standard', ignore: 'pid,hostname' },
      },
    });
  }

  // 返回 express 中间件
  return pinoHttp({ logger });
}

module.exports = createHttpLogger;
