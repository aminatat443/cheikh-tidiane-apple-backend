import { Notification, User } from '../models/index.js';
import { ROLES } from '../utils/constants.js';
import { notifyUser } from '../sockets/index.js';
import { sendMail, notificationEmail, isMailConfigured } from '../utils/mailer.js';

/** Formate un montant FCFA (entier) — utilitaire pour les messages. */
export const fcfa = (n) => `${Number(n || 0).toLocaleString('fr-FR')} FCFA`;

/**
 * Crée une notification pour un utilisateur et l'émet en temps réel
 * (Socket.IO → room `user:<id>`, événement `notification:new`).
 */
export async function createNotification({ userId, type, title, message, link = null }) {
  if (!userId) return null;
  const notif = await Notification.create({ userId, type, title, message, link });
  notifyUser(userId, 'notification:new', notif.toJSON());

  // Envoi e-mail best-effort (non bloquant) — actif si SMTP configuré, sinon simulé.
  if (isMailConfigured()) {
    User.findByPk(userId, { attributes: ['name', 'email'] })
      .then((u) => {
        if (u?.email) {
          return sendMail({
            to: u.email,
            subject: title,
            text: message,
            html: notificationEmail({ name: u.name, title, message }),
          });
        }
        return null;
      })
      .catch(() => {});
  }

  return notif;
}

/**
 * Crée la même notification pour tous les administrateurs (une ligne chacun)
 * et l'émet à chacun. (Room personnelle → pas de doublon même s'ils sont
 * aussi dans la room `admins`.)
 */
export async function notifyAllAdmins({ type, title, message, link = null }) {
  const admins = await User.findAll({ where: { role: ROLES.ADMIN }, attributes: ['id'] });
  return Promise.all(
    admins.map((a) => createNotification({ userId: a.id, type, title, message, link }))
  );
}
