import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

/** Jeton court (5 min) pour l'étape intermédiaire de vérification 2FA. */
export function signTempToken(payload) {
  return jwt.sign({ ...payload, twoFactorPending: true }, SECRET, { expiresIn: '5m' });
}

export function verifyToken(token) {
  return jwt.verify(token, SECRET);
}
