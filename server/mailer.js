// Envío de correos.
//
// Proveedores por HTTPS (recomendados en Render: usa el puerto 443, que no
// está bloqueado; los puertos SMTP 25/465/587 SÍ se bloquean en el plan gratis):
//   RESEND_API_KEY   → https://resend.com  (requiere verificar un dominio)
//   BREVO_API_KEY    → https://brevo.com   (gratis 300/día, basta verificar
//                                            tu correo remitente)
//
// Respaldo por SMTP (SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS).
// Si no hay nada configurado, se usa el buzón de pruebas Ethereal.

import nodemailer from 'nodemailer';

const FROM = process.env.MAIL_FROM || 'Haz Tu Camino <no-reply@haztucamino.pe>';
const HAS_SMTP = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const BREVO_API_KEY = process.env.BREVO_API_KEY;

// Proveedor activo, por orden de preferencia.
const PROVIDER = RESEND_API_KEY ? 'resend' : BREVO_API_KEY ? 'brevo' : HAS_SMTP ? 'smtp' : 'ethereal';
console.log(`[mail] Proveedor de correo activo: ${PROVIDER}.`);
if (PROVIDER === 'smtp') {
  console.log('[mail] Aviso: en Render (plan gratis) los puertos SMTP 25/465/587 están bloqueados. Define RESEND_API_KEY o BREVO_API_KEY para enviar por HTTPS.');
}

// Evita que una conexión SMTP bloqueada (p. ej. en Render) cuelgue el request.
const TIMEOUTS = {
  connectionTimeout: 8000,
  greetingTimeout: 8000,
  socketTimeout: 12000
};

let transportPromise = null;

async function getTransport() {
  if (!transportPromise) {
    transportPromise = (async () => {
      if (HAS_SMTP) {
        const port = Number(process.env.SMTP_PORT || 587);
        const secure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true' || port === 465;
        const t = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port,
          secure,
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
          ...TIMEOUTS
        });
        return t;
      }
      // Sin SMTP: cuenta de pruebas desechable.
      const test = await nodemailer.createTestAccount();
      const t = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: test.user, pass: test.pass },
        ...TIMEOUTS
      });
      t.__isEthereal = true;
      console.log('[mail] Sin correo configurado: usando buzón de pruebas Ethereal.');
      console.log(`[mail] Usuario Ethereal: ${test.user} / ${test.pass}`);
      return t;
    })();
  }
  return transportPromise;
}

// Extrae { email, name } de "Nombre <correo@dominio>".
function parseFrom(value) {
  const m = /^\s*(.*?)\s*<([^>]+)>\s*$/.exec(value || '');
  if (m && m[2]) return { name: m[1] || undefined, email: m[2].trim() };
  return { email: String(value || '').trim() };
}

// Envío por HTTPS con Resend (puerto 443).
async function sendViaResend({ to, subject, html, text }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to: [to], subject, html, text })
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
  const data = await res.json().catch(() => ({}));
  return { messageId: data.id || null };
}

// Envío por HTTPS con Brevo (puerto 443).
async function sendViaBrevo({ to, subject, html, text }) {
  const { email, name } = parseFrom(FROM);
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': BREVO_API_KEY, 'Content-Type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ sender: { email, name }, to: [{ email: to }], subject, htmlContent: html, textContent: text })
  });
  if (!res.ok) throw new Error(`Brevo ${res.status}: ${await res.text()}`);
  const data = await res.json().catch(() => ({}));
  return { messageId: data.messageId || null };
}

export function mailProvider() {
  return PROVIDER;
}

/** Envía un correo. Devuelve { messageId, previewUrl? }. */
export async function sendMail({ to, subject, html, text }) {
  if (PROVIDER === 'resend') return sendViaResend({ to, subject, html, text });
  if (PROVIDER === 'brevo') return sendViaBrevo({ to, subject, html, text });
  const transport = await getTransport();
  const info = await transport.sendMail({ from: FROM, to, subject, html, text });
  const previewUrl = transport.__isEthereal ? nodemailer.getTestMessageUrl(info) : null;
  if (previewUrl) console.log(`[mail] Ver correo: ${previewUrl}`);
  return { messageId: info.messageId, previewUrl };
}

/* ---------------- plantillas ---------------- */
const shell = (title, body, cta, url) => `
  <div style="font-family:Inter,Segoe UI,Arial,sans-serif;background:#f1f5f9;padding:32px">
    <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0">
      <div style="background:linear-gradient(120deg,#4f46e5,#7c3aed);padding:22px 28px;color:#fff;font-weight:800;font-size:18px">
        🧭 Haz Tu Camino
      </div>
      <div style="padding:28px;color:#0f172a">
        <h1 style="font-size:20px;margin:0 0 12px">${title}</h1>
        <p style="color:#475569;line-height:1.6;margin:0 0 ${cta && url ? 22 : 0}px">${body}</p>
        ${cta && url ? `<a href="${url}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:700">${cta}</a>` : ''}
      </div>
      <div style="padding:16px 28px;border-top:1px solid #e2e8f0;color:#94a3b8;font-size:12px">
        Haz Tu Camino · Hecho en Perú
      </div>
    </div>
  </div>`;

export function verificationEmail(name, url) {
  return {
    subject: 'Confirma tu correo · Haz Tu Camino',
    text: `Hola ${name}, confirma tu correo abriendo este enlace: ${url}`,
    html: shell('Confirma tu correo', `Hola ${name}, gracias por registrarte. Solo falta confirmar que este correo es tuyo.`, 'Confirmar mi correo', url)
  };
}

export function resetEmail(name, url) {
  return {
    subject: 'Restablece tu contraseña · Haz Tu Camino',
    text: `Hola ${name}, restablece tu contraseña aquí: ${url}. Caduca en 30 minutos.`,
    html: shell('Restablece tu contraseña', `Hola ${name}, recibimos una solicitud para cambiar tu contraseña. El enlace caduca en 30 minutos. Si no fuiste tú, ignora este correo.`, 'Cambiar contraseña', url)
  };
}

export function institutionEmail(center) {
  return {
    subject: 'Recibimos tu solicitud · Haz Tu Camino',
    text: `Hola, recibimos la solicitud de ${center}. Nuestro equipo te contactará muy pronto para coordinar una sesión.`,
    html: shell('Recibimos tu solicitud', `¡Gracias! Recibimos la solicitud de <b>${center}</b>. Nuestro equipo te contactará muy pronto para coordinar una sesión para tus estudiantes.`)
  };
}

/* Notificación interna al equipo cuando alguien solicita información. */
export function institutionAdminEmail(r, url) {
  const rows = [
    ['Institución', r.center],
    ['Tipo', r.tipo],
    ['Región', r.region],
    ['Contacto', r.contacto],
    ['Mensaje', r.mensaje || '(sin mensaje)'],
    ['Fecha', r.at ? new Date(r.at).toLocaleString('es-PE') : '']
  ].filter(([, v]) => v);
  const body = `<p style="color:#475569;line-height:1.6;margin:0 0 16px">Nueva solicitud de institución:</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      ${rows.map(([k, v]) => `<tr><td style="padding:6px 10px 6px 0;color:#64748b;white-space:nowrap;vertical-align:top">${k}</td><td style="padding:6px 0;color:#0f172a;font-weight:600">${v}</td></tr>`).join('')}
    </table>`;
  const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n');
  return {
    subject: `Nueva solicitud de institución · ${r.center}`,
    text: `Nueva solicitud de institución.\n\n${text}`,
    html: shell('Nueva solicitud de institución', body, 'Ver en el panel', url)
  };
}
