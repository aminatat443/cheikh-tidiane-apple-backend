import crypto from 'crypto';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { signToken, signTempToken, verifyToken } from '../utils/jwt.js';
import { success, created, fail } from '../utils/apiResponse.js';
import { ADMIN_ROLES } from '../utils/constants.js';

// Client Google (null si non configuré → l'endpoint renvoie 501).
const googleClient = process.env.GOOGLE_CLIENT_ID
  ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
  : null;

/** Émet le jeton final ou déclenche l'étape 2FA selon le compte. */
function issueSession(res, user) {
  // 2FA déjà activée → étape de vérification (code).
  if (user.twoFactorEnabled) {
    return success(res, {
      message: 'Vérification en deux étapes requise',
      data: { twoFactorRequired: true, tempToken: signTempToken({ id: user.id }) },
    });
  }
  // 2FA OBLIGATOIRE pour les administrateurs → forcer l'enrôlement à la connexion.
  if (ADMIN_ROLES.includes(user.role)) {
    return success(res, {
      message: 'Configuration de la double authentification requise',
      data: { twoFactorSetupRequired: true, tempToken: signTempToken({ id: user.id }) },
    });
  }
  const token = signToken({ id: user.id, role: user.role });
  return success(res, { message: 'Connexion réussie', data: { user: sanitize(user), token } });
}

function sanitize(user) {
  const { password, twoFactorSecret, ...rest } = user.toJSON();
  return rest;
}

/** Vérifie un code TOTP saisi contre le secret de l'utilisateur. */
function checkTotp(secret, code) {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token: String(code || '').trim(),
    window: 1,
  });
}

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  const existing = await User.scope('withPassword').findOne({ where: { email } });
  if (existing) return fail(res, { status: 409, message: 'Cet email est déjà utilisé' });

  const user = await User.create({ name, email, password, phone });
  const token = signToken({ id: user.id, role: user.role });

  return created(res, {
    message: 'Compte créé avec succès',
    data: { user: sanitize(user), token },
  });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.scope('withPassword').findOne({ where: { email } });
  if (!user || !(await user.comparePassword(password))) {
    return fail(res, { status: 401, message: 'Email ou mot de passe incorrect' });
  }

  // 2FA activée → étape de vérification ; sinon jeton final.
  return issueSession(res, user);
});

// POST /api/auth/google  { credential }  → connexion via Google Identity Services
export const googleAuth = asyncHandler(async (req, res) => {
  if (!googleClient) {
    return fail(res, { status: 501, message: 'Connexion Google non configurée' });
  }
  const { credential } = req.body;
  if (!credential) return fail(res, { status: 400, message: 'Jeton Google manquant' });

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch {
    return fail(res, { status: 401, message: 'Jeton Google invalide' });
  }

  const email = payload?.email;
  if (!email) return fail(res, { status: 400, message: 'Email Google indisponible' });

  let user = await User.scope('withPassword').findOne({ where: { email } });
  if (!user) {
    // Création d'un compte client (mot de passe aléatoire, non utilisé).
    user = await User.create({
      name: payload.name || email.split('@')[0],
      email,
      password: crypto.randomBytes(24).toString('hex'),
      avatar: payload.picture || null,
    });
  }
  return issueSession(res, user);
});

// POST /api/auth/2fa/verify  { tempToken, code }  → valide le code et délivre le JWT
export const verifyTwoFactor = asyncHandler(async (req, res) => {
  const { tempToken, code } = req.body;
  let decoded;
  try {
    decoded = verifyToken(tempToken);
  } catch {
    return fail(res, { status: 401, message: 'Session expirée — reconnectez-vous' });
  }
  if (!decoded?.twoFactorPending) return fail(res, { status: 400, message: 'Jeton invalide' });

  const user = await User.scope('withPassword').findByPk(decoded.id);
  if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
    return fail(res, { status: 400, message: 'Double authentification non configurée' });
  }
  if (!checkTotp(user.twoFactorSecret, code)) {
    return fail(res, { status: 401, message: 'Code invalide' });
  }

  const token = signToken({ id: user.id, role: user.role });
  return success(res, { message: 'Connexion réussie', data: { user: sanitize(user), token } });
});

// POST /api/auth/2fa/enroll  { tempToken }  → 1re connexion : QR à scanner
export const enrollTwoFactor = asyncHandler(async (req, res) => {
  let decoded;
  try {
    decoded = verifyToken(req.body.tempToken);
  } catch {
    return fail(res, { status: 401, message: 'Session expirée — reconnectez-vous' });
  }
  if (!decoded?.twoFactorPending) return fail(res, { status: 400, message: 'Jeton invalide' });
  const user = await User.scope('withPassword').findByPk(decoded.id);
  if (!user) return fail(res, { status: 404, message: 'Utilisateur introuvable' });

  const secret = speakeasy.generateSecret({ name: `Cheikh Tidiane Apple (${user.email})` });
  await user.update({ twoFactorSecret: secret.base32, twoFactorEnabled: false });
  const qr = await QRCode.toDataURL(secret.otpauth_url);
  return success(res, { data: { qr, secret: secret.base32 } });
});

// POST /api/auth/2fa/enroll/verify  { tempToken, code }  → active la 2FA et connecte
export const enrollVerifyTwoFactor = asyncHandler(async (req, res) => {
  let decoded;
  try {
    decoded = verifyToken(req.body.tempToken);
  } catch {
    return fail(res, { status: 401, message: 'Session expirée — reconnectez-vous' });
  }
  if (!decoded?.twoFactorPending) return fail(res, { status: 400, message: 'Jeton invalide' });
  const user = await User.scope('withPassword').findByPk(decoded.id);
  if (!user?.twoFactorSecret) return fail(res, { status: 400, message: 'Lancez d’abord la configuration' });
  if (!checkTotp(user.twoFactorSecret, req.body.code)) {
    return fail(res, { status: 401, message: 'Code invalide — réessayez' });
  }
  await user.update({ twoFactorEnabled: true });
  const token = signToken({ id: user.id, role: user.role });
  return success(res, { message: 'Connexion réussie', data: { user: sanitize(user), token } });
});

// POST /api/auth/2fa/setup  → génère un secret + QR code (à scanner dans l'app)
export const setupTwoFactor = asyncHandler(async (req, res) => {
  const secret = speakeasy.generateSecret({ name: `Cheikh Tidiane Apple (${req.user.email})` });
  const user = await User.scope('withPassword').findByPk(req.user.id);
  // Secret stocké en attente ; activé uniquement après confirmation d'un code.
  await user.update({ twoFactorSecret: secret.base32, twoFactorEnabled: false });
  const qr = await QRCode.toDataURL(secret.otpauth_url);
  return success(res, { data: { qr, secret: secret.base32 } });
});

// POST /api/auth/2fa/enable  { code }  → active la 2FA après vérification du code
export const enableTwoFactor = asyncHandler(async (req, res) => {
  const user = await User.scope('withPassword').findByPk(req.user.id);
  if (!user.twoFactorSecret) {
    return fail(res, { status: 400, message: 'Lancez d’abord la configuration' });
  }
  if (!checkTotp(user.twoFactorSecret, req.body.code)) {
    return fail(res, { status: 401, message: 'Code invalide — réessayez' });
  }
  await user.update({ twoFactorEnabled: true });
  return success(res, { message: 'Double authentification activée' });
});

// POST /api/auth/2fa/disable  { code }  → désactive la 2FA
export const disableTwoFactor = asyncHandler(async (req, res) => {
  const user = await User.scope('withPassword').findByPk(req.user.id);
  // La 2FA est obligatoire pour les administrateurs → désactivation interdite.
  if (ADMIN_ROLES.includes(user.role)) {
    return fail(res, { status: 403, message: 'La double authentification est obligatoire pour les administrateurs.' });
  }
  if (user.twoFactorEnabled && user.twoFactorSecret && !checkTotp(user.twoFactorSecret, req.body.code)) {
    return fail(res, { status: 401, message: 'Code invalide' });
  }
  await user.update({ twoFactorEnabled: false, twoFactorSecret: null });
  return success(res, { message: 'Double authentification désactivée' });
});

// GET /api/auth/me
export const me = asyncHandler(async (req, res) => {
  return success(res, { data: { user: req.user } });
});
