const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { ensureFileWithDefault, readJson, writeJsonAtomic, withLock } = require("./jsonUtil.js");

const DATA_DIR = path.resolve("database");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const SALT_ROUNDS = 10;
const normalizeEmail = (e) => String(e || "").trim().toLowerCase();

async function readUsers() {
  await ensureFileWithDefault(USERS_FILE, { users: [] });
  const data = await readJson(USERS_FILE, { users: [] });   // could be {users: []} or []
  if (Array.isArray(data)) return data;                      // tolerate legacy shape
  return Array.isArray(data.users) ? data.users : [];
}

async function findByEmail(email) {
    const users = await readUsers();
    const needle = normalizeEmail(email);
    return users.find(u => normalizeEmail(u.email) === needle) || null;
}

async function createUser({   
    email,
  password,
  role = "user",
  fullname = "",
  phone = "",
  position = "",
  resumePath = "", }) {
    if (!email || !password) throw new Error("Email and password are required");
    email = String(email).trim();
    const existing = await findByEmail(email);
    if (existing) throw new Error("Email already in use");

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = {
        id: crypto.randomUUID(),
        email,
        passwordHash,
        role,
        fullname,
        phone,
        position,
        resumePath,
        createdAt: new Date().toISOString(),
    };

    await withLock(async () => {
        const data = await readJson(USERS_FILE, { users: [] });
        const arr = Array.isArray(data.users) ? data.users: [];
        arr.push(user);
        await writeJsonAtomic(USERS_FILE, { users: arr });
    });

    const { passwordHash: _, ...safe } = user;
    return safe;
}

async function verifyCredentials(email, password) {
  const user = await findByEmail(email);
  if (!user) return { ok: false, reason: "email", user: null };  // email not found

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return { ok: false, reason: "password", user: null }; // wrong password

  const { passwordHash, ...safe } = user;
  return { ok: true, reason: null, user: safe };
}

async function getUserById(id) {
    await ensureFileWithDefault(USERS_FILE, { users: [] });
    const { users = [] } = await readJson(USERS_FILE, { users: [] });
    return users.find(u => u.id === id) || null;
}

module.exports = {
    readUsers,
    findByEmail,
    createUser,
    verifyCredentials,
    getUserById,
}
 //{
 //     "id": "b8a7c8b0-0f4b-4c06-9c1f-7c3bb0d8b4a1",
 //     "email": "admin@example.com",
 //     "passwordHash": "$2b$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
 //     "role": "admin",
 //     "createdAt": "2025-09-17T18:00:00.000Z"
 // }