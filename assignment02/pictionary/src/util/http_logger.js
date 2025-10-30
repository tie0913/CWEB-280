const fs = require('fs');
const path = require('path');
const pino = require('pino');
const pinoHttp = require('pino-http');
const config = require('../config/env');

function ensureDirFor(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

/**
 * Create an HTTP logger middleware.
 *
 * Configures a Pino-based HTTP logger according to config.http_log settings.
 * Supports logging to file or pretty-printing to console.
 *
 * Returns:
 *   A pino-http middleware instance for Express or similar frameworks.
 */
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
        target: 'pino-pretty', 
        options: { translateTime: 'SYS:standard', ignore: 'pid,hostname' },
      },
    });
  }

  return pinoHttp({ logger });
}

module.exports = createHttpLogger;
