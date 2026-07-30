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
