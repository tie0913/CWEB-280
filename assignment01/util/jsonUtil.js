const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

let queue = Promise.resolve();
 const withLock = (fn) => (queue = queue.then(fn, fn));

 async function ensureDir(dirPath) {
    await fs.mkdir(dirPath, { recursive: true });
}
/**
 * Ensure a JSON file exists; if missing, create it with provided default object.
 * @param {string} filePath - absolute or relative path
 * @param {object} defaultObj - e.g. { events: [] }
 */
 async function ensureFileWithDefault(filePath, defaultObj) {
    await ensureDir(path.dirname(filePath));
    try {
        await fs.access(filePath);
    } catch {
        await writeJsonAtomic(filePath, defaultObj);
    }
}
/**
 * Read and parse JSON from file. If empty, returns fallback.
 * @param {string} filePath
 * @param {object} fallback - returned if file is missing or empty
 */
 async function readJson(filePath, fallback = {}) {
    await ensureDir(path.dirname(filePath));
    try {
        const txt = await fs.readFile(filePath, "utf8");
        if (!txt?.trim()) return fallback;
        return JSON.parse(txt);
    } catch {
        return fallback;
    }
}
/**
 * Atomic write: write to a temp file and rename it over the target file.
 * @param {string} filePath
 * @param {object} payloadObj
 */
 async function writeJsonAtomic(filePath, payloadObj) {
    const tmp = filepath + "." + crypto.randomBytes(6).toString("hex") + ".tmp";
    const data = JSON.stringify(payloadObj, null, 2);
    await fs.writeFile(tmp, data, "utf8");
    await fs.rename(tmp, filePath);
}

module.exports = {
  withLock,
  ensureDir,
  ensureFileWithDefault,
  readJson,
  writeJsonAtomic,
};

