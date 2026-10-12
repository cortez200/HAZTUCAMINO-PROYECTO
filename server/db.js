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
    progress      TEXT NOT NULL DEFAULT '{}',
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

  CREATE TABLE IF NOT EXISTS catalog (
    kind       TEXT NOT NULL,
    id         TEXT NOT NULL,
    json       TEXT NOT NULL,
    position   INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT,
    PRIMARY KEY (kind, id)
  );

  CREATE TABLE IF NOT EXISTS meta (
    key   TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS reviews (
    career     TEXT NOT NULL,
    email      TEXT NOT NULL,
    name       TEXT,
    rating     INTEGER NOT NULL,
    comment    TEXT,
    at         TEXT,
    updated_at TEXT,
    PRIMARY KEY (career, email)
  );

  CREATE TABLE IF NOT EXISTS uni_reviews (
    uni_id     TEXT PRIMARY KEY,
    rating     REAL,
    total      INTEGER NOT NULL DEFAULT 0,
    maps_url   TEXT,
    reviews    TEXT NOT NULL DEFAULT '[]',
    fetched_at TEXT
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
/* Migración: progreso de misiones (XP, insignias, historial por carrera).
   En bases existentes arranca vacío sin tocar los datos previos (sims, answers…). */
if (!userCols.includes('progress')) {
  sqlite.exec("ALTER TABLE users ADD COLUMN progress TEXT NOT NULL DEFAULT '{}'");
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
    progress: parse(r.progress, {}),
    createdAt: r.created_at, premiumSince: r.premium_since || undefined,
    planSince: r.premium_since || undefined, planUntil: r.plan_until || undefined,
    emailVerified: !!r.email_verified,
    pwdSalt: r.pwd_salt, pwdHash: r.pwd_hash
  };
}

const upsertStmt = sqlite.prepare(`
  INSERT INTO users (email,name,nivel,plan,done,answers,unknown,sims,saved,history,progress,created_at,premium_since,pwd_salt,pwd_hash,email_verified,plan_until)
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
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
    progress      = excluded.progress,
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
    str(u.progress, {}),
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

/* ---------------- catálogo editable (panel admin) ----------------
   Cada entidad del catálogo (carreras, áreas, universidades, simulaciones y
   planes) se guarda como un documento JSON. Se siembra una vez desde data.js
   y a partir de ahí el panel admin puede crear, editar y borrar. */
export function catalogSeeded() {
  const row = sqlite.prepare("SELECT value FROM meta WHERE key = 'catalog_seeded'").get();
  return Boolean(row);
}
export function markCatalogSeeded() {
  sqlite.prepare("INSERT OR REPLACE INTO meta (key, value) VALUES ('catalog_seeded', ?)")
    .run(new Date().toISOString());
}
export function seedCatalog(kind, items) {
  const ins = sqlite.prepare(
    'INSERT OR IGNORE INTO catalog (kind,id,json,position,updated_at) VALUES (?,?,?,?,?)'
  );
  const at = new Date().toISOString();
  (items || []).forEach((it, i) => ins.run(kind, String(it.id), JSON.stringify(it), i, at));
}
export function loadCatalog() {
  const out = {};
  for (const row of sqlite.prepare('SELECT kind,id,json FROM catalog ORDER BY kind, position').all()) {
    let obj;
    try { obj = JSON.parse(row.json); } catch { obj = { id: row.id }; }
    (out[row.kind] = out[row.kind] || []).push(obj);
  }
  return out;
}
export function upsertCatalogItem(kind, id, obj) {
  const next = sqlite.prepare('SELECT COALESCE(MAX(position), -1) + 1 AS p FROM catalog WHERE kind = ?').get(kind).p;
  sqlite.prepare(`
    INSERT INTO catalog (kind,id,json,position,updated_at) VALUES (?,?,?,?,?)
    ON CONFLICT(kind,id) DO UPDATE SET json = excluded.json, updated_at = excluded.updated_at
  `).run(kind, String(id), JSON.stringify(obj), next, new Date().toISOString());
}
export function deleteCatalogItem(kind, id) {
  sqlite.prepare('DELETE FROM catalog WHERE kind = ? AND id = ?').run(kind, String(id));
}

/* ---------------- metadatos genéricos (migraciones) ---------------- */
export function metaGet(key) {
  const row = sqlite.prepare('SELECT value FROM meta WHERE key = ?').get(key);
  return row ? row.value : null;
}
export function metaSet(key, value) {
  sqlite.prepare('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)').run(key, value);
}

/* ---------------- reseñas de carreras (usuarios reales) ----------------
   Cada usuario deja una sola reseña por carrera (se actualiza si vuelve a
   opinar). Las reseñas son contenido real enviado por las personas. */
const upsertReviewStmt = sqlite.prepare(`
  INSERT INTO reviews (career,email,name,rating,comment,at,updated_at)
  VALUES (?,?,?,?,?,?,?)
  ON CONFLICT(career,email) DO UPDATE SET
    name       = excluded.name,
    rating     = excluded.rating,
    comment    = excluded.comment,
    updated_at = excluded.updated_at
`);

export function saveReview(r) {
  const now = new Date().toISOString();
  upsertReviewStmt.run(
    r.career, r.email, r.name || null, Math.round(Number(r.rating) || 0),
    (r.comment || '').slice(0, 800), r.at || now, now
  );
}

export function deleteReview(career, email) {
  sqlite.prepare('DELETE FROM reviews WHERE career = ? AND email = ?').run(career, email);
}

function rowToReview(r) {
  return {
    career: r.career, name: r.name || 'Estudiante', rating: r.rating,
    comment: r.comment || '', at: r.at, updatedAt: r.updated_at
  };
}

/* Reseñas públicas de una carrera (sin correo), más recientes primero. */
export function loadReviews(career) {
  return sqlite.prepare('SELECT * FROM reviews WHERE career = ? ORDER BY updated_at DESC')
    .all(career).map(rowToReview);
}

/* Reseña propia (para precargar el formulario). */
export function loadMyReview(career, email) {
  const r = sqlite.prepare('SELECT * FROM reviews WHERE career = ? AND email = ?').get(career, email);
  return r ? rowToReview(r) : null;
}

/* Resumen { count, avg } por carrera (para tarjetas y listados). */
export function reviewSummaries() {
  const out = {};
  const rows = sqlite.prepare(
    'SELECT career, COUNT(*) AS n, AVG(rating) AS avg FROM reviews GROUP BY career'
  ).all();
  for (const r of rows) out[r.career] = { count: r.n, avg: Math.round(r.avg * 10) / 10 };
  return out;
}

/* Distribución de estrellas (1..5) para una carrera. */
export function reviewDistribution(career) {
  const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const rows = sqlite.prepare('SELECT rating, COUNT(*) AS n FROM reviews WHERE career = ? GROUP BY rating').all(career);
  for (const r of rows) if (dist[r.rating] != null) dist[r.rating] = r.n;
  return dist;
}

/* ---------------- reseñas reales de universidades (Google Maps) ----------------
   Cache local de la calificación y los comentarios públicos de Google Places,
   para no llamar a la API en cada visita (ahorra cuota y responde rápido). */
export function getUniReviews(uniId) {
  const r = sqlite.prepare('SELECT * FROM uni_reviews WHERE uni_id = ?').get(uniId);
  if (!r) return null;
  let reviews;
  try { reviews = JSON.parse(r.reviews); } catch { reviews = []; }
  return {
    uniId: r.uni_id, rating: r.rating, total: r.total,
    mapsUrl: r.maps_url, reviews, fetchedAt: r.fetched_at
  };
}

export function saveUniReviews(uniId, data) {
  sqlite.prepare(`
    INSERT INTO uni_reviews (uni_id,rating,total,maps_url,reviews,fetched_at)
    VALUES (?,?,?,?,?,?)
    ON CONFLICT(uni_id) DO UPDATE SET
      rating     = excluded.rating,
      total      = excluded.total,
      maps_url   = excluded.maps_url,
      reviews    = excluded.reviews,
      fetched_at = excluded.fetched_at
  `).run(
    uniId, data.rating ?? null, Number(data.total) || 0,
    data.mapsUrl || null, JSON.stringify(data.reviews || []),
    data.fetchedAt || new Date().toISOString()
  );
}

/* Resumen { rating, total, fetchedAt } de todas las universidades. */
export function uniReviewSummary() {
  const out = {};
  for (const r of sqlite.prepare('SELECT uni_id,rating,total,fetched_at FROM uni_reviews').all()) {
    out[r.uni_id] = { rating: r.rating, total: r.total, fetchedAt: r.fetched_at };
  }
  return out;
}
