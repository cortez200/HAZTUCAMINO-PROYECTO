// Capa de persistencia real con SQLite (node:sqlite, integrado en Node 22.5+).
// Reemplaza el archivo db.json: guarda usuarios y solicitudes de instituciones.

import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.HTC_DB || path.join(__dirname, 'htc.sqlite');

export const sqlite = new DatabaseSync(DB_PATH);

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    email         TEXT PRIMARY KEY,
    name          TEXT NOT NULL,
    nivel         TEXT NOT NULL,
    plan          TEXT NOT NULL DEFAULT 'free',
    done          INTEGER NOT NULL DEFAULT 0,
    answers       TEXT NOT NULL DEFAULT '{}',
    unknown       TEXT NOT NULL DEFAULT '[]',
    sims          TEXT NOT NULL DEFAULT '{}',
    saved         TEXT NOT NULL DEFAULT '[]',
    history       TEXT NOT NULL DEFAULT '[]',
    created_at    TEXT,
    premium_since TEXT,
    pwd_salt      TEXT,
    pwd_hash      TEXT,
    email_verified INTEGER NOT NULL DEFAULT 0,
    plan_until    TEXT
  );

  CREATE TABLE IF NOT EXISTS requests (
    id       TEXT PRIMARY KEY,
    center   TEXT,
    region   TEXT,
    tipo     TEXT,
    contacto TEXT,
    mensaje  TEXT,
    at       TEXT
  );

  CREATE TABLE IF NOT EXISTS purchases (
    id         TEXT PRIMARY KEY,
    email      TEXT,
    plan       TEXT,
    plan_nombre TEXT,
    amount     REAL,
    currency   TEXT,
    at         TEXT
  );

  CREATE TABLE IF NOT EXISTS visits (
    id      TEXT PRIMARY KEY,
    visitor TEXT,
    path    TEXT,
    ref     TEXT,
    ua      TEXT,
    at      TEXT
  );
`);

/* Migración: añade email_verified a bases de datos creadas antes de esta columna.
   Las cuentas ya existentes se consideran verificadas. */
const userCols = sqlite.prepare('PRAGMA table_info(users)').all().map((c) => c.name);
if (!userCols.includes('email_verified')) {
  sqlite.exec('ALTER TABLE users ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 0');
  sqlite.exec('UPDATE users SET email_verified = 1');
}
if (!userCols.includes('plan_until')) {
  sqlite.exec('ALTER TABLE users ADD COLUMN plan_until TEXT');
}

const str = (v, fallback) => {
  try { return JSON.stringify(v ?? fallback); } catch { return JSON.stringify(fallback); }
};
const parse = (s, fallback) => {
  try { return JSON.parse(s); } catch { return fallback; }
};

function rowToUser(r) {
  if (!r) return null;
  return {
    email: r.email, name: r.name, nivel: r.nivel, plan: r.plan,
    done: !!r.done, answers: parse(r.answers, {}), unknown: parse(r.unknown, []),
    sims: parse(r.sims, {}), saved: parse(r.saved, []), history: parse(r.history, []),
    createdAt: r.created_at, premiumSince: r.premium_since || undefined,
    planSince: r.premium_since || undefined, planUntil: r.plan_until || undefined,
    emailVerified: !!r.email_verified,
    pwdSalt: r.pwd_salt, pwdHash: r.pwd_hash
  };
}

const upsertStmt = sqlite.prepare(`
  INSERT INTO users (email,name,nivel,plan,done,answers,unknown,sims,saved,history,created_at,premium_since,pwd_salt,pwd_hash,email_verified,plan_until)
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  ON CONFLICT(email) DO UPDATE SET
    name          = excluded.name,
    nivel         = excluded.nivel,
    plan          = excluded.plan,
    done          = excluded.done,
    answers       = excluded.answers,
    unknown       = excluded.unknown,
    sims          = excluded.sims,
    saved         = excluded.saved,
    history       = excluded.history,
    created_at    = excluded.created_at,
    premium_since = excluded.premium_since,
    pwd_salt      = excluded.pwd_salt,
    pwd_hash      = excluded.pwd_hash,
    email_verified = excluded.email_verified,
    plan_until     = excluded.plan_until
`);

export function saveUser(u) {
  upsertStmt.run(
    u.email, u.name, u.nivel, u.plan, u.done ? 1 : 0,
    str(u.answers, {}), str(u.unknown, []), str(u.sims, {}), str(u.saved, []), str(u.history, []),
    u.createdAt || null, u.premiumSince || null, u.pwdSalt || null, u.pwdHash || null,
    u.emailVerified ? 1 : 0, u.planUntil || null
  );
}

const insertReqStmt = sqlite.prepare(
  'INSERT OR IGNORE INTO requests (id,center,region,tipo,contacto,mensaje,at) VALUES (?,?,?,?,?,?,?)'
);

export function saveRequest(r) {
  insertReqStmt.run(r.id, r.center, r.region, r.tipo, r.contacto, r.mensaje, r.at);
}

export function loadUsers() {
  const users = {};
  for (const row of sqlite.prepare('SELECT * FROM users').all()) {
    const u = rowToUser(row);
    users[u.email] = u;
  }
  return users;
}

export function loadRequests() {
  return sqlite.prepare('SELECT * FROM requests ORDER BY at').all();
}

/* ---------------- borrado de usuarios (panel admin) ---------------- */
export function deleteUser(email) {
  sqlite.prepare('DELETE FROM users WHERE email = ?').run(email);
}

/* ---------------- compras (suscripciones a planes) ---------------- */
const insertPurchaseStmt = sqlite.prepare(
  'INSERT INTO purchases (id,email,plan,plan_nombre,amount,currency,at) VALUES (?,?,?,?,?,?,?)'
);
export function savePurchase(p) {
  insertPurchaseStmt.run(
    p.id, p.email, p.plan, p.planNombre || p.plan,
    Number(p.amount) || 0, p.currency || 'S/', p.at || new Date().toISOString()
  );
}
export function loadPurchases() {
  return sqlite.prepare('SELECT * FROM purchases ORDER BY at DESC').all().map((r) => ({
    id: r.id, email: r.email, plan: r.plan, planNombre: r.plan_nombre,
    amount: r.amount, currency: r.currency, at: r.at
  }));
}

/* ---------------- visitas ---------------- */
const insertVisitStmt = sqlite.prepare(
  'INSERT INTO visits (id,visitor,path,ref,ua,at) VALUES (?,?,?,?,?,?)'
);
export function saveVisit(v) {
  insertVisitStmt.run(
    v.id, v.visitor || null, v.path || null,
    (v.ref || '').slice(0, 300), (v.ua || '').slice(0, 300),
    v.at || new Date().toISOString()
  );
}
export function loadVisits(limit = 500) {
  return sqlite.prepare('SELECT * FROM visits ORDER BY at DESC LIMIT ?').all(limit);
}
export function visitSummary() {
  const total = sqlite.prepare('SELECT COUNT(*) AS n FROM visits').get().n;
  const unique = sqlite.prepare('SELECT COUNT(DISTINCT visitor) AS n FROM visits').get().n;
  return { total, unique };
}
