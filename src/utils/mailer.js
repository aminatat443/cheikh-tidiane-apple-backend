import nodemailer from 'nodemailer';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
}

/** Vrai si un serveur SMTP est configuré (sinon les envois sont simulés/log). */
export function isMailConfigured() {
  return Boolean(process.env.SMTP_HOST);
}

/**
 * Envoie un email. En développement sans SMTP configuré, log seulement.
 */
export async function sendMail({ to, subject, html, text }) {
  if (!process.env.SMTP_HOST) {
    console.log(`✉️  [MAIL simulé] à ${to} — ${subject}`);
    return { simulated: true };
  }
  return getTransporter().sendMail({
    from: process.env.MAIL_FROM || 'no-reply@example.com',
    to,
    subject,
    text,
    html,
  });
}

/**
 * Gabarit HTML avec un bouton d'action (vérification d'email, réinitialisation…).
 * Le lien brut est aussi affiché en repli (certains clients bloquent les boutons).
 */
export function actionEmail({ name, title, message, buttonLabel, link, note }) {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:auto;color:#111827">
    <div style="background:#111827;color:#fff;padding:16px 20px;border-radius:12px 12px 0 0">
      <strong style="font-size:16px">Cheikh Tidiane Apple</strong>
    </div>
    <div style="border:1px solid #E5E7EB;border-top:none;border-radius:0 0 12px 12px;padding:24px 20px">
      <p style="margin:0 0 10px">Bonjour ${name || ''},</p>
      <h2 style="font-size:18px;margin:0 0 8px">${title}</h2>
      <p style="margin:0 0 20px;line-height:1.5;color:#374151">${message}</p>
      <a href="${link}" style="display:inline-block;background:#0A84FF;color:#fff;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:9999px">${buttonLabel}</a>
      <p style="margin:20px 0 0;font-size:12px;color:#6B7280">
        Ou copiez ce lien dans votre navigateur :<br/>
        <a href="${link}" style="color:#0A84FF;word-break:break-all">${link}</a>
      </p>
      ${note ? `<p style="margin:16px 0 0;font-size:12px;color:#9CA3AF">${note}</p>` : ''}
    </div>
    <p style="color:#9CA3AF;font-size:12px;text-align:center;margin-top:12px">
      E-mail automatique — merci de ne pas y répondre.
    </p>
  </div>`;
}

/** Gabarit HTML sobre pour les notifications (commandes, Lebalma…). */
export function notificationEmail({ name, title, message }) {
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:auto;color:#111827">
    <div style="background:#111827;color:#fff;padding:16px 20px;border-radius:12px 12px 0 0">
      <strong style="font-size:16px">Cheikh Tidiane Apple</strong>
    </div>
    <div style="border:1px solid #E5E7EB;border-top:none;border-radius:0 0 12px 12px;padding:20px">
      <p style="margin:0 0 10px">Bonjour ${name || ''},</p>
      <h2 style="font-size:16px;margin:0 0 8px;color:#0A84FF">${title}</h2>
      <p style="margin:0;line-height:1.5;color:#374151">${message}</p>
    </div>
    <p style="color:#9CA3AF;font-size:12px;text-align:center;margin-top:12px">
      E-mail automatique — merci de ne pas y répondre.
    </p>
  </div>`;
}
