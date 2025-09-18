const fs = require("fs/promises");
const path = require("path");
const bcrypt = require("bcrypt");

const DATA_DIR = path.resolve("../database");
const USERS_FILE = path.join(DATA_DIR, "users.json"); 
const SALT_ROUNDS = 10;

const ADMIN = {
  email: "admin@example.com",
  password: "Admin123!", 
  role: "admin",
  name: "Admin",
  phone: "",
  position: "",
  resumePath: "",
};

async function ensureUsersFile() {
  try { await fs.access(USERS_FILE); }
  catch { await fs.mkdir(path.dirname(USERS_FILE), { recursive: true });
          await fs.writeFile(USERS_FILE, JSON.stringify({ users: [] }, null, 2), "utf8"); }
}

async function readUsers() {
  await ensureUsersFile();
  const txt = await fs.readFile(USERS_FILE, "utf8");
  try { return JSON.parse(txt).users || []; } catch { return []; }
}

async function writeUsers(users) {
  await fs.writeFile(USERS_FILE, JSON.stringify({ users }, null, 2), "utf8");
}

(async () => {
  const users = await readUsers();
  if (users.find(u => u.email.toLowerCase() === ADMIN.email.toLowerCase())) {
    console.log("Admin already exists:", ADMIN.email);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(ADMIN.password, SALT_ROUNDS);
  const adminUser = {
    id: cryptoRandomUUID(),
    email: ADMIN.email,
    passwordHash,
    role: ADMIN.role,
    name: ADMIN.name,
    phone: ADMIN.phone,
    position: ADMIN.position,
    resumePath: ADMIN.resumePath,
    createdAt: new Date().toISOString(),
  };

  users.push(adminUser);
  await writeUsers(users);
  console.log("✅ Admin created:", ADMIN.email);
  console.log("   Password:", ADMIN.password);
})().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});

// Small UUID helper (works in Node without crypto.randomUUID in older versions)
function cryptoRandomUUID() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  const rnd = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).slice(-4);
  return `${rnd()}${rnd()}-${rnd()}-${rnd()}-${rnd()}-${rnd()}${rnd()}${rnd()}`;
}
