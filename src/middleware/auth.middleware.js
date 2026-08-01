import { verifyToken } from '../utils/jwt.js';
import { User } from '../models/index.js';
import { fail } from '../utils/apiResponse.js';
import { ROLES } from '../utils/constants.js';

/**
 * Vérifie le JWT (header Authorization: Bearer <token>) et attache req.user.
 */
export async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return fail(res, { status: 401, message: 'Non authentifié' });

    const decoded = verifyToken(token);
    // Un jeton temporaire 2FA ne donne pas accès aux ressources protégées.
    if (decoded.twoFactorPending) {
      return fail(res, { status: 401, message: 'Vérification 2FA requise' });
    }
    const user = await User.findByPk(decoded.id);
    if (!user) return fail(res, { status: 401, message: 'Utilisateur introuvable' });

    req.user = user;
    next();
  } catch (err) {
    return fail(res, { status: 401, message: 'Token invalide ou expiré' });
  }
}

/**
 * Restreint l'accès à certains rôles. Ex: adminOnly = restrictTo(ROLES.ADMIN)
 */
export function restrictTo(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return fail(res, { status: 403, message: 'Accès refusé' });
    }
    next();
  };
}

// L'accès admin est ouvert aux admins ET au super-admin.
export const adminOnly = restrictTo(ROLES.ADMIN, ROLES.SUPERADMIN);

// Réservé au super-admin (gestion des comptes admin).
export const superAdminOnly = restrictTo(ROLES.SUPERADMIN);
