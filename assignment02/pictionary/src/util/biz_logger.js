// src/logger/bizLogger.js
const fs = require('fs');
const path = require('path');
const pino = require('pino');
const config = require('../config/env'); // 里头包含 bizLog: { level, toFile, filePath, rotate, rotateDir, maxFiles }

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

  // -------- 公共 API --------
  info(msg, obj) { this.logger.info(obj ?? {}, msg); }
  warn(msg, obj) { this.logger.warn(obj ?? {}, msg); }
  error(msg, obj) { this.logger.error(obj ?? {}, msg); }
  debug(msg, obj) { this.logger.debug(obj ?? {}, msg); }
  child(bindings) { return this.logger.child(bindings || {}); }

  /**
   * Express 中间件：把带请求上下文的 child logger 挂到 req.biz
   * - 依赖 pino-http 的 req.id（如果你配置了 genReqId）；没有也不影响
   * - 若有鉴权中间件把用户放在 req.user，则自动携带 userId
   */
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

  // -------- 私有工具 --------
  #ensureDir(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

  #createStream() {
    if (this.rotate) {
      // 轮转模式：每天一个文件（需要安装 rotating-file-stream）
      // npm i rotating-file-stream
      const rfs = require('rotating-file-stream');
      this.#ensureDir(this.rotateDir);
      return rfs.createStream('biz.log', {
        interval: '1d',
        path: this.rotateDir,
        maxFiles: this.maxFiles
      });
    }

    if (this.toFile) {
      // 固定文件模式
      const dir = path.dirname(this.filePath);
      this.#ensureDir(dir);
      return fs.createWriteStream(this.filePath, { flags: 'a' });
    }

    // 默认输出到控制台（stdout）
    return process.stdout;
  }
}

// 单例导出
const bizLoggerInstance = new BizLogger();

module.exports = {
  BizLogger,
  bizLogger: bizLoggerInstance,    // 直接用：const { bizLogger } = require('./logger/bizLogger')
  attachBizLogger: () => bizLoggerInstance.attachMiddleware(), // 中间件：app.use(attachBizLogger())
};
