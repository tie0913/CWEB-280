const fs = require('fs');
const path = require('path');
const REPORT_PATH = path.join(__dirname, '..', 'reports', 'http-report.ndjson');

function ensureDir() {
  const dir = path.dirname(REPORT_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function logHttp({ testName, method, url, reqBody, status, resHeaders, resBody, durationMs }) {
  ensureDir();
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    testName, method, url, reqBody, status, resHeaders, resBody, durationMs
  }) + '\n';
  fs.appendFileSync(REPORT_PATH, line);
}

module.exports = { logHttp, REPORT_PATH };
