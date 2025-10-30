const fs = require('fs');
const path = require('path');
const pino = require('pino');
const config = require('../config/env'); 

/**
 * BizLogger class
 *
 * Provides structured business-level logging using Pino.
 * Supports configurable log levels, file output, and optional
 * daily log rotation. Includes middleware for attaching contextual
 * loggers to requests (e.g., user ID, method, path).
 *
 * Features:
 *   - info, warn, error, and debug logging methods
 *   - optional file or rotating log storage
 *   - middleware to enrich request logs with context
 */
class BizLogger {
  constructor(opts = {}) {
    this.level = opts.level ?? config.biz_log.level ?? 'info';
    this.toFile = opts.toFile ?? config.biz_log.toFile ?? false;
    this.filePath = opts.filePath ?? config.biz_log.filePath ?? path.resolve(process.cwd(), './logs/biz.log');
    this.rotate = opts.rotate ?? config.biz_log.rotate ?? false;
    this.rotateDir = opts.rotateDir ?? config.biz_log.rotateDir ?? path.resolve(process.cwd(), './logs');
    this.maxFiles = Number(opts.maxFiles ?? config.biz_log.maxFiles ?? 7);

    const stream = this.#createStream();
    this.logger = pino(
      {
        level: this.level,
        timestamp: pino.stdTimeFunctions.isoTime,
        formatters: { level: (l) => ({ level: l }) }
      },
      stream
    );
  }

  info(msg, obj) { this.logger.info(obj ?? {}, msg); }
  warn(msg, obj) { this.logger.warn(obj ?? {}, msg); }
  error(msg, obj) { this.logger.error(obj ?? {}, msg); }
  debug(msg, obj) { this.logger.debug(obj ?? {}, msg); }
  child(bindings) { return this.logger.child(bindings || {}); }

  attachMiddleware() {
    return (req, _res, next) => {
      const ctx = {
        reqId: req.id || req.requestId || undefined,
        ip: req.ip,
        method: req.method,
        path: req.originalUrl || req.url,
        userId: req.user?.id || req.user?._id?.toString?.() || undefined
      };
      req.biz = this.child(ctx);
      next();
    };
  }

  #ensureDir(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

  #createStream() {
    if (this.rotate) {
      const rfs = require('rotating-file-stream');
      this.#ensureDir(this.rotateDir);
      return rfs.createStream('biz.log', {
        interval: '1d',
        path: this.rotateDir,
        maxFiles: this.maxFiles
      });
    }

    if (this.toFile) {
      const dir = path.dirname(this.filePath);
      this.#ensureDir(dir);
      return fs.createWriteStream(this.filePath, { flags: 'a' });
    }

    return process.stdout;
  }
}

const bizLoggerInstance = new BizLogger();

module.exports = {
  BizLogger,
  bizLogger: bizLoggerInstance, 
  attachBizLogger: () => bizLoggerInstance.attachMiddleware(), 
};
