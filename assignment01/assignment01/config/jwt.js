const raw = process.env.JWT_SECRET ?? "test-token-secret";
const JWT_SECRET = String(raw).trim();
module.exports = {JWT_SECRET}