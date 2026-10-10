// Envío de correos con nodemailer.
//
// Configuración por variables de entorno (SMTP real):
//   SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, MAIL_FROM
//
// Si no hay SMTP configurado, se usa el buzón de pruebas Ethereal
// (https://ethereal.email): el correo se "envía" y se devuelve una URL
// para verlo en el navegador. Ideal para desarrollo local.

import nodemailer from 'nodemailer';

const FROM = process.env.MAIL_FROM || 'Haz Tu Camino <no-reply@haztucamino.pe>';
const HAS_SMTP = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

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
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        });
        console.log(`[mail] Enviando correos reales vía ${process.env.SMTP_HOST}:${port} como ${process.env.SMTP_USER}.`);
        return t;
      }
      // Sin SMTP: cuenta de pruebas desechable.
      const test = await nodemailer.createTestAccount();
      const t = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: test.user, pass: test.pass }
      });
      t.__isEthereal = true;
      console.log('[mail] Sin SMTP configurado: usando buzón de pruebas Ethereal.');
      console.log(`[mail] Usuario Ethereal: ${test.user} / ${test.pass}`);
      return t;
    })();
  }
  return transportPromise;
}

/** Envía un correo. Devuelve { previewUrl? } (solo en modo Ethereal). */
export async function sendMail({ to, subject, html, text }) {
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
        <p style="color:#475569;line-height:1.6;margin:0 0 22px">${body}</p>
        <a href="${url}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:700">${cta}</a>
        <p style="color:#94a3b8;font-size:12px;margin:22px 0 0">Si el botón no funciona, copia este enlace:<br>${url}</p>
      </div>
      <div style="padding:16px 28px;border-top:1px solid #e2e8f0;color:#94a3b8;font-size:12px">
        Prototipo demostrativo · Hecho en Perú
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
