import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { ensureFileWithDefault, readJson, writeJsonAtomic, withLock } from "./jsonUtil.js";


const DATA_DIR = path.resolve("database");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const SALT_ROUNDS = 10;

async function readUsers() {
    await ensureFileWithDefault(USERS_FILE, { users: [] });
    const { users = [] } = await readJson(USERS_FILE, { users: [] });
    return users;
}

export async function findByEmail(email) {
    const users = await readUsers();
    return users.find(u => u.email === String(email)) || null;
}

export async function createUser({ email, password, role }) {
    if (!email || !password) throw new Error("Email and password are required");
    email = String(email).trim();
    const existing = await findByEmail(email);
    if (existing) throw new Error("Email already in use");

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = {
        id: crypto.randomUUID(),
        email,
        passwordHash,
        role,
        name,
        phone,
        position,
        resumePath,
        createdAt: new Date().toISOString(),
    };

    await withLock(async () => {
        const users = await readJson(USERS_FILE, { users: [] });
        users.push(user);
        await writeJsonAtomic(USERS_FILE, { users });
    });

    const { passwordHash: _, ...safe } = user;
    return safe;
}

export async function verifyCredentials(email, password) {
    const user = await findByEmail(email);
    if (!user) return null;
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return null;
    const { passwordHash, ...safe } = user;
    return safe;
}

export async function seedAdminIfEmpty({ email = "admin@example.com", password = "Admin123!", role = "admin" } = {}) {
    await withLock(async () => {
        const { users } = await readJson(USERS_FILE, { users: [] });
        if (users.length) return;
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        users.push({ id: crypto.randomUUID(), email, passwordHash, role, createdAt: new Date().toISOString() });
        await writeJsonAtomic(USERS_FILE, { users });
    });
}

export async function getUserById(id) {
    await ensureFileWithDefault(USERS_FILE, { users: [] });
    const { users = [] } = await readJson(USERS_FILE, { users: [] });
    return users.find(u => u.id === id) || null;
}

 //{
 //     "id": "b8a7c8b0-0f4b-4c06-9c1f-7c3bb0d8b4a1",
 //     "email": "admin@example.com",
 //     "passwordHash": "$2b$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
 //     "role": "admin",
 //     "createdAt": "2025-09-17T18:00:00.000Z"
 // }