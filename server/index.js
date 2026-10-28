import express from 'express';
import cors from 'cors';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  AREAS, CARRERAS, PREGUNTAS, OPCIONES, NIVELES, UNIVERSIDADES, PLANS, FREE_TEST_LIMIT
} from './data.js';
import {
  loadUsers, loadRequests, saveUser, saveRequest,
  savePurchase, loadPurchases, saveVisit, loadVisits, visitSummary,
  deleteUser, backupUsers,
  catalogSeeded, markCatalogSeeded, seedCatalog, loadCatalog, deleteCatalogKind,
  upsertCatalogItem, deleteCatalogItem,
  metaGet, metaSet,
  saveReview, deleteReview, loadReviews, loadMyReview, reviewSummaries, reviewDistribution,
  getUniReviews, saveUniReviews, uniReviewSummary
} from './db.js';
import { sendMail, verificationEmail, resetEmail, institutionEmail, institutionAdminEmail } from './mailer.js';
import { fetchUniversityReviews, hasGoogle } from './google.js';
import { staticUniReviews, staticUniSummaries } from './uniReviews.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SECRET = process.env.HTC_SECRET || 'htc-dev-secret-change-me';
const PORT = process.env.PORT || 4000;
// URL pública del FRONTEND (Static Site). Se usa para armar los enlaces de los
// correos (verificar / restablecer). Si no se define, se deduce del host de la
// petición. En Render con frontend separado, define APP_URL con la URL del sitio.
const PUBLIC_URL = (process.env.APP_URL || '').replace(/\/$/, '');

/* -------------------------- persistencia (SQLite) -------------------------- */
let db = { users: loadUsers(), requests: loadRequests() };
function persist() {
  for (const u of Object.values(db.users)) saveUser(u);
  for (const r of db.requests) saveRequest(r);
  backupUsers();
}
/* -------------------------- catálogo editable --------------------------
   El catálogo (carreras, áreas, universidades y planes) se
   siembra una sola vez desde data.js y luego se gestiona desde el panel admin. */
const CATALOG_KINDS = ['areas', 'careers', 'universities', 'plans'];
if (!catalogSeeded()) {
  seedCatalog('areas', AREAS);
  seedCatalog('careers', CARRERAS);
  seedCatalog('universities', UNIVERSIDADES);
  seedCatalog('plans', PLANS);
  markCatalogSeeded();
}

/* Migración: elimina del catálogo guardado elementos que ya no existen en el
   proyecto (funcionalidades retiradas). Así la base queda limpia también. */
const CATALOG_CLEANUP_KEY = 'catalog_cleanup_v1';
if (!metaGet(CATALOG_CLEANUP_KEY)) {
  for (const kind of ['missions', 'simulations']) deleteCatalogKind(kind);
  metaSet(CATALOG_CLEANUP_KEY, new Date().toISOString());
}

/* Migración: agrega universidades nuevas y las asocia a las carreras una sola
   vez (no pisa las ediciones que el admin haya hecho en el panel). */
const UNI_SYNC_KEY = 'catalog_universities_v3';
if (!metaGet(UNI_SYNC_KEY)) {
  const cat = loadCatalog();
  const haveUni = new Set((cat.universities || []).map((u) => u.id));
  for (const u of UNIVERSIDADES) if (!haveUni.has(u.id)) upsertCatalogItem('universities', u.id, u);
  for (const c of CARRERAS) {
    const stored = (cat.careers || []).find((x) => x.id === c.id);
    if (!stored) continue;
    const have = new Set((stored.universidades || []).map((o) => o.id));
    const merged = [...(stored.universidades || [])];
    for (const o of (c.universidades || [])) if (!have.has(o.id)) merged.push(o);
    if (merged.length !== (stored.universidades || []).length) {
      stored.universidades = merged;
      upsertCatalogItem('careers', stored.id, stored);
    }
  }
  metaSet(UNI_SYNC_KEY, new Date().toISOString());
}

/* Migración: corrige etiquetas cortas de universidades nuevas para evitar
   confusiones entre siglas repetidas (por ejemplo, UNAP de Puno y UNAP de Iquitos). */
const UNI_LABELS_KEY = 'catalog_university_labels_v1';
if (!metaGet(UNI_LABELS_KEY)) {
  const cat = loadCatalog();
  const newIds = new Set(['unap-iquitos', 'untumbes', 'unam', 'untrm', 'unh', 'unaj', 'undc', 'unach', 'unia', 'upt', 'uwiener', 'upeu', 'unife', 'ulasalle']);
  for (const stored of (cat.universities || [])) {
    if (!newIds.has(stored.id)) continue;
    const source = UNIVERSIDADES.find((u) => u.id === stored.id);
    if (source && source.corto && stored.corto !== source.corto) {
      stored.corto = source.corto;
      upsertCatalogItem('universities', stored.id, stored);
    }
  }
  metaSet(UNI_LABELS_KEY, new Date().toISOString());
}

const PUBLIC_PENSION_KEY = 'catalog_public_pension_v1';
if (!metaGet(PUBLIC_PENSION_KEY)) {
  const cat = loadCatalog();
  const sourceById = new Map(UNIVERSIDADES.filter((u) => u.tipo === 'Pública').map((u) => [u.id, u.pension]));
  for (const stored of (cat.universities || [])) {
    const pension = sourceById.get(stored.id);
    if (!pension) continue;
    if (stored.pension?.min !== pension.min || stored.pension?.max !== pension.max) {
      stored.pension = { ...pension };
      upsertCatalogItem('universities', stored.id, stored);
    }
  }
  for (const career of (cat.careers || [])) {
    let careerChanged = false;
    for (const o of (career.universidades || [])) {
      const pension = sourceById.get(o.id);
      if (!pension) continue;
      if (o.min !== pension.min || o.max !== pension.max) {
        o.min = pension.min;
        o.max = pension.max;
        careerChanged = true;
      }
    }
    if (careerChanged) upsertCatalogItem('careers', career.id, career);
  }
  metaSet(PUBLIC_PENSION_KEY, new Date().toISOString());
}

/* Migración: actualiza las imágenes de las carreras que ya estaban guardadas
   en SQLite con las nuevas fotografías del catálogo. */
const CAREER_IMAGES_KEY = 'catalog_career_images_v3';
if (!metaGet(CAREER_IMAGES_KEY)) {
  const cat = loadCatalog();
  const sourceById = new Map(CARRERAS.map((c) => [c.id, c.img]));
  for (const stored of (cat.careers || [])) {
    const img = sourceById.get(stored.id);
    if (img && stored.img !== img) {
      stored.img = img;
      upsertCatalogItem('careers', stored.id, stored);
    }
  }
  metaSet(CAREER_IMAGES_KEY, new Date().toISOString());
}

/* -------------------------- seguridad -------------------------- */
function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { salt, hash };
}
function verifyPassword(password, salt, hash) {
  if (typeof password !== 'string' || !salt || !hash) return false;
  let calc;
  try { calc = crypto.scryptSync(password, salt, 64); } catch { return false; }
  const stored = Buffer.from(hash, 'hex');
  return calc.length === stored.length && crypto.timingSafeEqual(calc, stored);
}
function signToken(email) {
  const payload = Buffer.from(JSON.stringify({ email, iat: Date.now() })).toString('base64url');
  const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}
function verifyToken(token) {
  if (!token || !token.includes('.')) return null;
  const [payload, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try { return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')); } catch { return null; }
}

/* Token firmado y con caducidad para acciones por correo (verificar / reset). */
function signAction(email, purpose, ttlMs) {
  const payload = Buffer.from(JSON.stringify({ email, purpose, exp: Date.now() + ttlMs })).toString('base64url');
  const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}
function verifyAction(token, purpose) {
  const data = verifyToken(token);
  if (!data || data.purpose !== purpose) return null;
  if (!data.exp || data.exp < Date.now()) return null;
  return data;
}
/* Base de los enlaces que ve el usuario (frontend). Prioriza APP_URL, que en
   Render debe ser la URL de la Static Site; si no, usa el host de la petición. */
function baseUrl(req) {
  if (PUBLIC_URL) return PUBLIC_URL;
  if (req) {
    const proto = String(req.headers['x-forwarded-proto'] || req.protocol || 'http').split(',')[0].trim();
    const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim();
    if (host) return `${proto}://${host}`;
  }
  return `http://localhost:${process.env.CLIENT_PORT || 5173}`;
}
/* Base del propio servidor (API/admin). El panel vive aquí, no en el frontend. */
function serverBase(req) {
  if (req) {
    const proto = String(req.headers['x-forwarded-proto'] || req.protocol || 'http').split(',')[0].trim();
    const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim();
    if (host) return `${proto}://${host}`;
  }
  return `http://localhost:${process.env.PORT || 4000}`;
}
const verifyUrl = (base, token) => `${base}/#/register?token=${encodeURIComponent(token)}`;
const resetUrl = (base, token) => `${base}/#/restablecer?token=${encodeURIComponent(token)}`;

/* -------------------------- admin -------------------------- */
const ADMIN_EMAIL = String(process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'haztucamidotest@gmail.com').trim().toLowerCase();
const ADMIN_PASSWORD = String(process.env.ADMIN_PASSWORD || 'admin123');

/* Token de administrador: mismo firmado, pero marcado como admin. */
function signAdminToken() {
  const payload = Buffer.from(JSON.stringify({ role: 'admin', iat: Date.now() })).toString('base64url');
  const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}
function verifyAdminToken(token) {
  const data = verifyToken(token);
  return Boolean(data && data.role === 'admin');
}
function adminAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!verifyAdminToken(token)) {
    return res.status(401).json({ error: 'Sesión de administrador no válida.' });
  }
  next();
}

/* -------------------------- helpers -------------------------- */
const newAccount = (name, email, nivel, emailVerified = false) => ({
  email, name, nivel, plan: 'free', done: false, emailVerified,
  answers: {}, unknown: [], saved: [], history: [],
  createdAt: new Date().toISOString(), planSince: null, planUntil: null
});
const isPremium = (u) => u && (u.plan === 'premium' || u.plan === 'super');
const testAttempts = (u) => (u && Array.isArray(u.history) ? u.history.length : 0);
function publicAccount(u) {
  if (!u) return null;
  return {
    email: u.email, name: u.name, nivel: u.nivel, plan: u.plan, done: u.done,
    emailVerified: u.emailVerified,
    planSince: u.planSince || u.premiumSince || undefined,
    planUntil: u.planUntil || undefined,
    answers: u.answers, unknown: u.unknown, saved: u.saved,
    history: u.history, createdAt: u.createdAt
  };
}
function areaScores(acc) {
  return AREAS.map((ar) => {
    const qs = PREGUNTAS.filter((p) => p.area === ar.id);
    let sum = 0;
    qs.forEach((p) => { if (acc.answers[p.id] != null) sum += acc.answers[p.id]; });
    return { id: ar.id, nombre: ar.nombre, pct: Math.round((sum / (qs.length * 2)) * 100) };
  }).sort((x, y) => y.pct - x.pct);
}
function dateLabel() {
  return new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
}
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim().toLowerCase());

/* -------------------------- app -------------------------- */
const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const payload = verifyToken(token);
  if (!payload || !db.users[payload.email]) {
    return res.status(401).json({ error: 'Sesión no válida. Inicia sesión nuevamente.' });
  }
  req.user = db.users[payload.email];
  next();
}

/* catálogo público */
app.get('/api/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));
app.get('/api/catalog', (_req, res) => {
  const cat = loadCatalog();
  res.json({
    areas: cat.areas || [], careers: cat.careers || [], preguntas: PREGUNTAS, opciones: OPCIONES,
    niveles: NIVELES,
    universities: cat.universities || [], plans: cat.plans || [], freeTestLimit: FREE_TEST_LIMIT
  });
});

/* -------------------------- reseñas de carreras --------------------------
   Contenido real enviado por las personas (una reseña por usuario y carrera).
   Públicas para leer; para escribir se necesita sesión. */
app.get('/api/reviews', (req, res) => {
  const career = String(req.query.career || '').trim();
  if (!career) return res.status(400).json({ error: 'Falta indicar la carrera.' });
  const reviews = loadReviews(career);
  const count = reviews.length;
  const avg = count ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10 : 0;
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const payload = verifyToken(token);
  const email = payload && db.users[payload.email] ? payload.email : null;
  res.json({
    summary: { count, avg, dist: reviewDistribution(career) },
    reviews,
    mine: email ? loadMyReview(career, email) : null
  });
});

app.get('/api/reviews/summary', (_req, res) => res.json({ summaries: reviewSummaries() }));

app.post('/api/reviews', auth, (req, res) => {
  const career = String(req.body?.career || '').trim();
  const rating = Math.round(Number(req.body?.rating));
  const comment = String(req.body?.comment || '').trim().slice(0, 800);
  if (!CARRERAS.some((c) => c.id === career)) return res.status(400).json({ error: 'Carrera no válida.' });
  if (!(rating >= 1 && rating <= 5)) return res.status(400).json({ error: 'Elige una calificación de 1 a 5 estrellas.' });
  if (comment.length < 4) return res.status(400).json({ error: 'Escribe un comentario breve (mínimo 4 caracteres).' });
  saveReview({ career, email: req.user.email, name: req.user.name, rating, comment });
  res.status(201).json({
    ok: true,
    mine: loadMyReview(career, req.user.email),
    summaries: reviewSummaries()
  });
});

app.delete('/api/reviews/:career', auth, (req, res) => {
  deleteReview(req.params.career, req.user.email);
  res.json({ ok: true, summaries: reviewSummaries() });
});

/* ------------------ reseñas reales de universidades (Google Maps) ------------------
   Calificación y comentarios públicos de Google Places. Se cachean en SQLite
   para no gastar la cuota de la API en cada visita. */
const UNI_TTL_MS = 1000 * 60 * 60 * 24 * 14; // 14 días

app.get('/api/universities/reviews', (_req, res) => {
  const summaries = { ...staticUniSummaries(), ...uniReviewSummary() };
  res.json({ enabled: true, summaries });
});

app.get('/api/universities/:id/reviews', async (req, res) => {
  const u = UNIVERSIDADES.find((x) => x.id === req.params.id);
  if (!u) return res.status(404).json({ error: 'Universidad no encontrada.' });

  let cached = getUniReviews(u.id);
  const stale = !cached || (Date.now() - Date.parse(cached.fetchedAt || 0) > UNI_TTL_MS);
  if ((!cached || stale || !cached.reviews?.length) && hasGoogle()) {
    const data = await fetchUniversityReviews(u);
    if (data) { saveUniReviews(u.id, { ...data, fetchedAt: new Date().toISOString() }); cached = getUniReviews(u.id); }
  }

  const fallback = staticUniReviews(u.id);
  const live = cached && (cached.reviews?.length || cached.rating != null);
  const src = live ? cached : fallback;

  res.json({
    enabled: true,
    source: live ? 'Google Places' : (fallback?.editorial ? 'Resumen de opiniones' : 'Google Maps'),
    university: { id: u.id, nombre: u.nombre, corto: u.corto, ciudad: u.ciudad, color: u.color },
    rating: src?.rating ?? null,
    total: src?.total ?? 0,
    editorial: Boolean(src?.editorial),
    mapsUrl: src?.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(u.nombre + ' ' + (u.ciudad || ''))}`,
    reviews: src?.reviews || [],
    fetchedAt: live ? cached.fetchedAt : null
  });
});

/* registro de visitas (analítica simple) */
app.post('/api/track', (req, res) => {
  const { visitor, path, ref } = req.body || {};
  saveVisit({
    id: crypto.randomUUID(),
    visitor: visitor ? String(visitor).slice(0, 80) : null,
    path: path ? String(path).slice(0, 200) : '/',
    ref: ref ? String(ref) : (req.headers.referer || ''),
    ua: req.headers['user-agent'] || '',
    at: new Date().toISOString()
  });
  res.json({ ok: true });
});

/* auth */
const VERIFY_TTL = 7 * 24 * 60 * 60 * 1000; // 7 días
const RESET_TTL = 30 * 60 * 1000;         // 30 min

async function sendVerificationEmail(u, base) {
  const token = signAction(u.email, 'verify', VERIFY_TTL);
  const { previewUrl } = await sendMail({ to: u.email, ...verificationEmail(u.name, verifyUrl(base || baseUrl(), token)) });
  return previewUrl || null;
}

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, nivel } = req.body || {};
  const mail = String(email || '').trim().toLowerCase();
  if (!name || String(name).trim().length < 2) return res.status(400).json({ error: 'Escribe tu nombre.' });
  if (!isEmail(mail)) return res.status(400).json({ error: 'Correo no v\u00e1lido. Escribe un correo real.' });
  if (!password || String(password).length < 6) return res.status(400).json({ error: 'La contrase\u00f1a debe tener al menos 6 caracteres.' });
  if (!NIVELES.some((n) => n.id === nivel)) return res.status(400).json({ error: 'Elige en qu\u00e9 etapa est\u00e1s.' });
  const existing = db.users[mail];
  if (existing && existing.emailVerified) return res.status(409).json({ error: 'Ya existe una cuenta con ese correo. Inicia sesi\u00f3n o recupera tu contrase\u00f1a.' });
  const base = baseUrl(req);
  let user = existing;
  if (user) {
    user.name = String(name).trim(); user.nivel = nivel;
    const { salt, hash } = hashPassword(password);
    user.pwdSalt = salt; user.pwdHash = hash;
  } else {
    const { salt, hash } = hashPassword(password);
    user = { ...newAccount(String(name).trim(), mail, nivel, false), pwdSalt: salt, pwdHash: hash };
    db.users[mail] = user;
  }
  persist();
  try {
    const previewUrl = await sendVerificationEmail(user, base);
    return res.status(existing ? 200 : 201).json({ ok: true, email: mail, verificationSent: true, previewUrl });
  } catch (e) {
    console.error('[auth] Verification email failed:', e?.message || e);
    return res.status(502).json({ error: 'La cuenta se guard\u00f3, pero no pudimos enviar el correo. Intenta reenviarlo.', email: mail, verificationEmailFailed: true });
  }
});

app.post('/api/auth/login', (req, res) => {
  const mail = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  if (!isEmail(mail)) return res.status(400).json({ error: 'Correo no v\u00e1lido. Rev\u00edsalo e intenta de nuevo.' });
  const u = db.users[mail];
  if (!u) return res.status(404).json({ error: 'Ese correo no est\u00e1 registrado. Crea una cuenta.' });
  if (!verifyPassword(password, u.pwdSalt, u.pwdHash)) return res.status(401).json({ error: 'Contrase\u00f1a incorrecta.' });
  if (!u.emailVerified) return res.status(403).json({ error: 'Confirma tu correo antes de ingresar.', needsVerification: true, email: mail });
  res.json({ token: signToken(mail), account: publicAccount(u) });
});

/* Reenv\u00eda el correo de confirmaci\u00f3n. */
app.post('/api/auth/resend', async (req, res) => {
  const mail = String(req.body?.email || '').trim().toLowerCase();
  if (!isEmail(mail)) return res.status(400).json({ error: 'Correo no v\u00e1lido.' });
  const u = db.users[mail];
  if (!u) return res.status(404).json({ error: 'Ese correo no est\u00e1 registrado.' });
  if (u.emailVerified) return res.json({ ok: true, alreadyVerified: true });
  try {
    const previewUrl = await sendVerificationEmail(u, baseUrl(req));
    res.json({ ok: true, email: mail, verificationSent: true, previewUrl });
  } catch (e) {
    console.error('[auth] Verification resend failed:', e?.message || e);
    res.status(502).json({ error: 'No pudimos enviar el correo. Intenta de nuevo m\u00e1s tarde.', email: mail });
  }
});

/* Confirma el correo con el token del enlace. */
app.post('/api/auth/verify', (req, res) => {
  const data = verifyAction(req.body?.token, 'verify');
  if (!data) return res.status(400).json({ error: 'El enlace no es válido o ya caducó. Solicita uno nuevo.' });
  const u = db.users[data.email];
  if (!u) return res.status(404).json({ error: 'La cuenta ya no existe.' });
  if (!u.emailVerified) { u.emailVerified = true; persist(); }
  res.json({ ok: true, email: u.email, account: publicAccount(u), token: signToken(u.email) });
});

/* Solicita el enlace de recuperación de contraseña. */
app.post('/api/auth/forgot', async (req, res) => {
  const mail = String(req.body?.email || '').trim().toLowerCase();
  if (!isEmail(mail)) return res.status(400).json({ error: 'Correo no válido. Escribe un correo real.' });
  const u = db.users[mail];
  if (!u) return res.status(404).json({ error: 'Ese correo no está registrado. Revisa que esté bien escrito.' });
  let previewUrl = null;
  try {
    const token = signAction(mail, 'reset', RESET_TTL);
    ({ previewUrl } = await sendMail({ to: mail, ...resetEmail(u.name, resetUrl(baseUrl(req), token)) }));
  } catch {
    return res.status(502).json({ error: 'No pudimos enviar el correo. Intenta más tarde.' });
  }
  res.json({ ok: true, email: mail, previewUrl });
});

/* Cambia la contraseña usando el token del enlace. */
app.post('/api/auth/reset', (req, res) => {
  const data = verifyAction(req.body?.token, 'reset');
  const password = String(req.body?.password || '');
  if (!data) return res.status(400).json({ error: 'El enlace no es válido o ya caducó. Solicita uno nuevo.' });
  if (password.length < 6) return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
  const u = db.users[data.email];
  if (!u) return res.status(404).json({ error: 'La cuenta ya no existe.' });
  const { salt, hash } = hashPassword(password);
  u.pwdSalt = salt; u.pwdHash = hash; u.emailVerified = true;
  persist();
  res.json({ ok: true, email: u.email });
});

app.get('/api/account', auth, (req, res) => res.json({ account: publicAccount(req.user) }));

app.put('/api/account', auth, (req, res) => {
  const { name, nivel } = req.body || {};
  if (name != null) {
    if (String(name).trim().length < 2) return res.status(400).json({ error: 'Nombre demasiado corto.' });
    req.user.name = String(name).trim();
  }
  if (nivel != null) {
    if (!NIVELES.some((n) => n.id === nivel)) return res.status(400).json({ error: 'Etapa no válida.' });
    req.user.nivel = nivel;
  }
  persist();
  res.json({ account: publicAccount(req.user) });
});

app.post('/api/account/test', auth, (req, res) => {
  const { answers, unknown } = req.body || {};
  if (!answers || typeof answers !== 'object') return res.status(400).json({ error: 'Respuestas no válidas.' });
  if (!isPremium(req.user) && testAttempts(req.user) >= FREE_TEST_LIMIT) {
    return res.status(402).json({
      error: `Ya usaste tus ${FREE_TEST_LIMIT} tests gratis. Activa Premium para hacer tests ilimitados.`,
      premiumRequired: true
    });
  }
  const clean = {};
  for (const p of PREGUNTAS) {
    const v = answers[p.id];
    if (v != null && [0, 1, 2].includes(v)) clean[p.id] = v;
  }
  if (Object.keys(clean).length !== PREGUNTAS.length) {
    return res.status(400).json({ error: 'Debes responder las 32 preguntas.' });
  }
  req.user.answers = clean;
  req.user.unknown = Array.isArray(unknown) ? [...new Set(unknown)].filter((x) => AREAS.some((a) => a.id === x)) : [];
  req.user.done = true;
  const res3 = areaScores(req.user).slice(0, 3);
  req.user.history = [{ date: dateLabel(), top: res3 }, ...(req.user.history || [])].slice(0, 12);
  persist();
  res.json({ account: publicAccount(req.user), top: areaScores(req.user) });
});

app.post('/api/account/saved', auth, (req, res) => {
  const id = req.body?.careerId;
  if (!CARRERAS.some((c) => c.id === id)) return res.status(400).json({ error: 'Carrera no válida.' });
  const saved = req.user.saved || [];
  req.user.saved = saved.includes(id) ? saved.filter((x) => x !== id) : [...saved, id];
  persist();
  res.json({ account: publicAccount(req.user) });
});

app.post('/api/account/change-password', auth, (req, res) => {
  const { current, next } = req.body || {};
  if (!verifyPassword(String(current || ''), req.user.pwdSalt, req.user.pwdHash)) {
    return res.status(401).json({ error: 'La contraseña actual no coincide.' });
  }
  if (!next || String(next).length < 6) return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres.' });
  const { salt, hash } = hashPassword(next);
  req.user.pwdSalt = salt; req.user.pwdHash = hash;
  persist();
  res.json({ ok: true });
});

app.post('/api/account/subscribe', auth, (req, res) => {
  const planId = String(req.body?.plan || 'premium');
  const plan = PLANS.find((p) => p.id === planId && p.id !== 'free');
  if (!plan) return res.status(400).json({ error: 'Plan no válido.' });
  const now = new Date();
  const until = new Date(now.getTime() + (PLAN_DAYS[plan.id] || 30) * 24 * 60 * 60 * 1000);
  req.user.plan = plan.id;
  req.user.premiumSince = now.toISOString();
  req.user.planSince = now.toISOString();
  req.user.planUntil = until.toISOString();
  persist();
  // Registra la compra para el panel de administración.
  savePurchase({
    id: crypto.randomUUID(), email: req.user.email, plan: plan.id,
    planNombre: plan.nombre, amount: plan.precio || 0,
    currency: plan.moneda || 'S/', at: now.toISOString()
  });
  res.json({
    account: publicAccount(req.user),
    notice: `Plan ${plan.nombre} activado correctamente.`
  });
});

app.post('/api/account/cancel', auth, (req, res) => {
  req.user.plan = 'free';
  req.user.premiumSince = null;
  req.user.planSince = null;
  req.user.planUntil = null;
  persist();
  res.json({ account: publicAccount(req.user), notice: 'Volviste al plan Básico.' });
});

app.post('/api/institutions', async (req, res) => {
  const { center, region, tipo, contacto, mensaje } = req.body || {};
  if (!center || String(center).trim().length < 3) return res.status(400).json({ error: 'Indica el nombre del colegio o institución.' });
  if (!contacto || String(contacto).trim().length < 5) return res.status(400).json({ error: 'Deja un correo o teléfono de contacto.' });
  const centerName = String(center).trim();
  const contact = String(contacto).trim();
  const request = {
    id: crypto.randomUUID(), center: centerName,
    region: String(region || '').trim(), tipo: String(tipo || 'colegio').trim(),
    contacto: contact, mensaje: String(mensaje || '').trim(),
    at: new Date().toISOString()
  };
  db.requests.push(request);
  persist();

  const panelUrl = `${serverBase(req)}/admin`;
  const applicantEmail = isEmail(contact) ? contact : null;

  // Aviso interno al equipo (siempre) + confirmación al solicitante (si dejó correo).
  const tasks = [ sendMail({ to: ADMIN_EMAIL, ...institutionAdminEmail(request, panelUrl) }) ];
  if (applicantEmail) tasks.push(sendMail({ to: applicantEmail, ...institutionEmail(centerName) }));

  const results = await Promise.allSettled(tasks);
  const notified = results[0].status === 'fulfilled';
  const emailSent = applicantEmail ? results[1]?.status === 'fulfilled' : false;
  results.forEach((r, i) => {
    if (r.status === 'rejected') console.error('[instituciones] No se pudo enviar un correo:', r.reason?.message || r.reason);
  });

  res.status(201).json({ ok: true, notified, emailSent, message: 'Solicitud registrada. Te contactaremos pronto.' });
});

/* -------------------------- panel de administración -------------------------- */
const ADMIN_FILE = path.join(__dirname, 'admin.html');
app.get(['/admin', '/admin.html'], (_req, res) => res.sendFile(ADMIN_FILE));

app.post('/api/admin/login', (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Credenciales de administrador incorrectas.' });
  }
  res.json({ token: signAdminToken(), email: ADMIN_EMAIL });
});

app.get('/api/admin/stats', adminAuth, (_req, res) => {
  const users = Object.values(db.users);
  const purchases = loadPurchases();
  const visits = visitSummary();
  const buyers = new Set(purchases.map((p) => p.email));
  const revenue = purchases.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const testsTaken = users.reduce((s, u) => s + (Array.isArray(u.history) ? u.history.length : 0), 0);
  res.json({
    users: users.length,
    verified: users.filter((u) => u.emailVerified).length,
    premium: users.filter((u) => u.plan === 'premium' || u.plan === 'super').length,
    demos: db.requests.length,
    purchases: purchases.length,
    buyers: buyers.size,
    revenue,
    visits: visits.total,
    uniqueVisitors: visits.unique,
    testsTaken
  });
});

app.get('/api/admin/users', adminAuth, (_req, res) => {
  const users = Object.values(db.users).map((u) => ({
    email: u.email, name: u.name, nivel: u.nivel, plan: u.plan,
    emailVerified: !!u.emailVerified, done: !!u.done,
    tests: Array.isArray(u.history) ? u.history.length : 0,
    saved: Array.isArray(u.saved) ? u.saved.length : 0,
    createdAt: u.createdAt || null, planUntil: u.planUntil || null
  })).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  res.json({ users });
});

/* Elimina una cuenta registrada desde el panel admin.
   Las compras se conservan para que sigan contando en las estadísticas. */
app.delete('/api/admin/users/:email', adminAuth, (req, res) => {
  const mail = String(req.params.email || '').trim().toLowerCase();
  if (!db.users[mail]) return res.status(404).json({ error: 'Ese usuario ya no existe.' });
  delete db.users[mail];
  deleteUser(mail);
  backupUsers();
  res.json({ ok: true, email: mail });
});

app.get('/api/admin/purchases', adminAuth, (_req, res) => {
  res.json({ purchases: loadPurchases() });
});

app.get('/api/admin/visits', adminAuth, (_req, res) => {
  res.json({ summary: visitSummary(), visits: loadVisits(500) });
});

app.get('/api/admin/demos', adminAuth, (_req, res) => {
  const demos = [...db.requests].sort((a, b) => String(b.at).localeCompare(String(a.at)));
  res.json({ demos });
});

/* -------------------------- catálogo (panel admin) -------------------------- */
app.get('/api/admin/catalog', adminAuth, (_req, res) => {
  const cat = loadCatalog();
  const out = {};
  for (const k of CATALOG_KINDS) out[k] = cat[k] || [];
  res.json(out);
});

app.post('/api/admin/catalog/:kind', adminAuth, (req, res) => {
  const kind = req.params.kind;
  if (!CATALOG_KINDS.includes(kind)) return res.status(400).json({ error: 'Tipo de catálogo no válido.' });
  const item = req.body;
  if (!item || typeof item !== 'object' || Array.isArray(item)) return res.status(400).json({ error: 'Datos no válidos.' });
  const id = String(item.id || '').trim();
  if (!id) return res.status(400).json({ error: 'Falta el identificador (id).' });
  const saved = { ...item, id };
  upsertCatalogItem(kind, id, saved);
  res.json({ ok: true, item: saved });
});

app.put('/api/admin/catalog/:kind/:id', adminAuth, (req, res) => {
  const kind = req.params.kind;
  if (!CATALOG_KINDS.includes(kind)) return res.status(400).json({ error: 'Tipo de catálogo no válido.' });
  const item = req.body;
  if (!item || typeof item !== 'object' || Array.isArray(item)) return res.status(400).json({ error: 'Datos no válidos.' });
  const id = String(req.params.id);
  const saved = { ...item, id };
  upsertCatalogItem(kind, id, saved);
  res.json({ ok: true, item: saved });
});

app.delete('/api/admin/catalog/:kind/:id', adminAuth, (req, res) => {
  const kind = req.params.kind;
  if (!CATALOG_KINDS.includes(kind)) return res.status(400).json({ error: 'Tipo de catálogo no válido.' });
  deleteCatalogItem(kind, req.params.id);
  res.json({ ok: true });
});

/* Sirve la app compilada (client/dist) en el mismo puerto, si existe. */
const CLIENT_DIST = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST, {
    setHeaders(res, filePath) {
      // Los assets llevan hash en el nombre: se pueden cachear para siempre.
      if (/[\\/]assets[\\/]/.test(filePath)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      } else if (/\.html$/.test(filePath)) {
        res.setHeader('Cache-Control', 'no-cache');
      }
    }
  }));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(path.join(CLIENT_DIST, 'index.html'));
  });
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor.' });
});

app.listen(PORT, () => {
  console.log(`[haz-tu-camino] API escuchando en http://localhost:${PORT}`);
});
