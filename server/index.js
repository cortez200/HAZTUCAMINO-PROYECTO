import express from 'express';
import cors from 'cors';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  AREAS, CARRERAS, PREGUNTAS, OPCIONES, SIMS, NIVELES, FREE_SIMS, UNIVERSIDADES, PLANS, FREE_TEST_LIMIT, area as findArea
} from './data.js';
import {
  loadUsers, loadRequests, saveUser, saveRequest,
  savePurchase, loadPurchases, saveVisit, loadVisits, visitSummary,
  deleteUser
} from './db.js';
import { sendMail, verificationEmail, resetEmail, institutionEmail, institutionAdminEmail } from './mailer.js';

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
}

/* -------------------------- seguridad -------------------------- */
function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { salt, hash };
}
function verifyPassword(password, salt, hash) {
  const calc = crypto.scryptSync(password, salt, 64);
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
const verifyUrl = (base, token) => `${base}/#/verificar?token=${encodeURIComponent(token)}`;
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
  answers: {}, unknown: [], sims: {}, saved: [], history: [],
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
    answers: u.answers, unknown: u.unknown, sims: u.sims, saved: u.saved,
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
  res.json({
    areas: AREAS, careers: CARRERAS, preguntas: PREGUNTAS, opciones: OPCIONES,
    simulations: SIMS, niveles: NIVELES, freeSims: FREE_SIMS, universities: UNIVERSIDADES,
    plans: PLANS, freeTestLimit: FREE_TEST_LIMIT
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
const VERIFY_TTL = 24 * 60 * 60 * 1000;   // 24 h
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
  if (!isEmail(mail)) return res.status(400).json({ error: 'Correo no válido. Escribe un correo real.' });
  if (!password || String(password).length < 6) return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
  if (!NIVELES.some((n) => n.id === nivel)) return res.status(400).json({ error: 'Elige en qué etapa estás.' });

  const existing = db.users[mail];
  if (existing && existing.emailVerified) {
    return res.status(409).json({ error: 'Ya existe una cuenta con ese correo. Inicia sesión u olvidaste tu contraseña.' });
  }
  const base = baseUrl(req);
  if (existing) {
    // Cuenta creada antes pero sin confirmar: actualiza datos y reenvía el correo.
    existing.name = String(name).trim();
    existing.nivel = nivel;
    const { salt, hash } = hashPassword(password);
    existing.pwdSalt = salt; existing.pwdHash = hash;
    persist();
    // El correo se manda en segundo plano para no retrasar la respuesta.
    sendVerificationEmail(existing, base).catch((e) => console.error('[auth] No se pudo enviar el correo de verificación:', e?.message || e));
    return res.status(200).json({ ok: true, email: mail, account: publicAccount(existing), verificationSent: true });
  }

  const { salt, hash } = hashPassword(password);
  const account = newAccount(String(name).trim(), mail, nivel, false);
  db.users[mail] = { ...account, pwdSalt: salt, pwdHash: hash };
  persist();
  // La cuenta queda pendiente de confirmar: no se inicia sesión todavía.
  // El correo (que confirma la dirección) se envía en segundo plano.
  sendVerificationEmail(db.users[mail], base).catch((e) => console.error('[auth] No se pudo enviar el correo de verificación:', e?.message || e));
  res.status(201).json({ ok: true, email: mail, account: publicAccount(db.users[mail]), verificationSent: true });
});

app.post('/api/auth/login', (req, res) => {
  const mail = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  if (!isEmail(mail)) return res.status(400).json({ error: 'Correo no válido. Revísalo e intenta de nuevo.' });
  const u = db.users[mail];
  if (!u) return res.status(404).json({ error: 'Ese correo no está registrado. Crea una cuenta.' });
  if (!verifyPassword(password, u.pwdSalt, u.pwdHash)) return res.status(401).json({ error: 'Contraseña incorrecta.' });
  if (!u.emailVerified) {
    return res.status(403).json({
      error: 'Tu correo aún no está confirmado. Revisa tu bandeja (y el spam) o reenvía el correo de confirmación.',
      needsVerification: true, email: mail
    });
  }
  res.json({ token: signToken(mail), account: publicAccount(u) });
});

/* Reenvía el correo de confirmación. */
app.post('/api/auth/resend', (req, res) => {
  const mail = String(req.body?.email || '').trim().toLowerCase();
  if (!isEmail(mail)) return res.status(400).json({ error: 'Correo no válido.' });
  const u = db.users[mail];
  if (!u) return res.status(404).json({ error: 'Ese correo no está registrado.' });
  if (u.emailVerified) return res.json({ ok: true, alreadyVerified: true });
  // Se envía en segundo plano: la respuesta no depende del servidor SMTP.
  sendVerificationEmail(u, baseUrl(req)).catch((e) => console.error('[auth] No se pudo reenviar el correo de verificación:', e?.message || e));
  res.json({ ok: true, email: mail, verificationSent: true });
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

app.post('/api/account/sims', auth, (req, res) => {
  const { simId, score } = req.body || {};
  const sim = SIMS.find((s) => s.id === simId);
  if (!sim) return res.status(400).json({ error: 'Simulación no válida.' });
  if (!isPremium(req.user)) {
    return res.status(402).json({ error: 'Las simulaciones son parte del plan Premium. Actívalo para continuar.', premiumRequired: true });
  }
  const num = Math.max(0, Math.min(20, Number(score) || 0));
  req.user.sims = { ...(req.user.sims || {}), [simId]: num };
  persist();
  res.json({ account: publicAccount(req.user) });
});

const PLAN_DAYS = { premium: 30, super: 365 };
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
    notice: `Plan ${plan.nombre} activado. Esta es una demostración: no se realizó ningún cobro real.`
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
    sims: u.sims ? Object.keys(u.sims).length : 0,
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
  app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(path.join(CLIENT_DIST, 'index.html')));
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor.' });
});

app.listen(PORT, () => {
  console.log(`[haz-tu-camino] API escuchando en http://localhost:${PORT}`);
});
