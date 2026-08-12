import crypto from 'crypto';
import { Op } from 'sequelize';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { signToken, signTempToken, verifyToken } from '../utils/jwt.js';
import { success, created, fail } from '../utils/apiResponse.js';
import { ADMIN_ROLES } from '../utils/constants.js';
import { sendMail, isMailConfigured, actionEmail } from '../utils/mailer.js';

// Client Google (null si non configuré → l'endpoint renvoie 501).
// .trim() : tolère un espace accidentel dans le .env (ex. « = 796... »).
const GOOGLE_CLIENT_ID = (process.env.GOOGLE_CLIENT_ID || '').trim();
const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

// Base de l'app cliente (pour construire les liens des e-mails).
const CLIENT_URL = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');

// Durées de validité des jetons.
const EMAIL_VERIFY_TTL = 24 * 60 * 60 * 1000; // 24 h
const PASSWORD_RESET_TTL = 60 * 60 * 1000; // 1 h

/** Génère un jeton : `raw` envoyé par e-mail, `hash` (SHA-256) stocké en base. */
function makeToken() {
  const raw = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  return { raw, hash };
}
const hashToken = (raw) => crypto.createHash('sha256').update(String(raw || '')).digest('hex');

/**
 * Génère un jeton de vérification, le stocke (hash + expiration) et envoie l'e-mail.
 * En dev sans SMTP, le lien est loggé dans la console pour pouvoir tester.
 */
async function sendVerificationEmail(user) {
  const { raw, hash } = makeToken();
  await user.update({ emailVerifyToken: hash, emailVerifyExpires: new Date(Date.now() + EMAIL_VERIFY_TTL) });
  const link = `${CLIENT_URL}/verifier-email?token=${raw}`;
  await sendMail({
    to: user.email,
    subject: 'Confirmez votre adresse e-mail — Cheikh Tidiane Apple',
    html: actionEmail({
      name: user.name,
      title: 'Confirmez votre e-mail',
      message: 'Bienvenue ! Il ne reste qu\'une étape : confirmez votre adresse e-mail pour sécuriser votre compte.',
      buttonLabel: 'Confirmer mon e-mail',
      link,
      note: 'Ce lien expire dans 24 heures.',
    }),
    text: `Confirmez votre e-mail : ${link}`,
  });
  if (!isMailConfigured()) console.log(`🔗 [DEV] Lien de vérification pour ${user.email} : ${link}`);
}

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
  const {
    password,
    twoFactorSecret,
    emailVerifyToken,
    emailVerifyExpires,
    passwordResetToken,
    passwordResetExpires,
    ...rest
  } = user.toJSON();
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

  // Envoi de l'e-mail de confirmation (n'échoue pas l'inscription si l'e-mail plante).
  try {
    await sendVerificationEmail(user);
  } catch (e) {
    console.error('Envoi e-mail de vérification échoué :', e.message);
  }

  // Auto-connexion : le compte est utilisable, mais `emailVerified` reste false
  // tant que le lien n'est pas cliqué (le front peut afficher un rappel).
  const token = signToken({ id: user.id, role: user.role });
  return created(res, {
    message: 'Compte créé — vérifiez votre e-mail pour le confirmer',
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
      audience: GOOGLE_CLIENT_ID,
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

// POST /api/auth/verify-email  { token }  → confirme l'adresse e-mail
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) return fail(res, { status: 400, message: 'Jeton manquant' });

  const user = await User.scope('withPassword').findOne({
    where: { emailVerifyToken: hashToken(token), emailVerifyExpires: { [Op.gt]: new Date() } },
  });
  if (!user) return fail(res, { status: 400, message: 'Lien invalide ou expiré' });

  await user.update({ emailVerified: true, emailVerifyToken: null, emailVerifyExpires: null });
  return success(res, { message: 'E-mail confirmé avec succès', data: { user: sanitize(user) } });
});

// POST /api/auth/resend-verification  (authentifié)  → renvoie l'e-mail de confirmation
export const resendVerification = asyncHandler(async (req, res) => {
  const user = await User.scope('withPassword').findByPk(req.user.id);
  if (!user) return fail(res, { status: 404, message: 'Utilisateur introuvable' });
  if (user.emailVerified) return success(res, { message: 'E-mail déjà confirmé' });

  try {
    await sendVerificationEmail(user);
  } catch (e) {
    return fail(res, { status: 502, message: "Échec de l'envoi de l'e-mail" });
  }
  return success(res, { message: 'E-mail de confirmation renvoyé' });
});

// POST /api/auth/forgot-password  { email }  → envoie un lien de réinitialisation
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  // Réponse générique (ne révèle pas si l'e-mail existe → anti-énumération).
  const generic = { message: 'Si un compte existe, un e-mail de réinitialisation a été envoyé.' };

  const user = await User.scope('withPassword').findOne({ where: { email } });
  if (user) {
    const { raw, hash } = makeToken();
    await user.update({
      passwordResetToken: hash,
      passwordResetExpires: new Date(Date.now() + PASSWORD_RESET_TTL),
    });
    const link = `${CLIENT_URL}/reinitialiser-mot-de-passe?token=${raw}`;
    try {
      await sendMail({
        to: user.email,
        subject: 'Réinitialisation de votre mot de passe — Cheikh Tidiane Apple',
        html: actionEmail({
          name: user.name,
          title: 'Réinitialisez votre mot de passe',
          message: 'Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour en choisir un nouveau.',
          buttonLabel: 'Réinitialiser mon mot de passe',
          link,
          note: 'Ce lien expire dans 1 heure. Si vous n\'êtes pas à l\'origine de cette demande, ignorez cet e-mail.',
        }),
        text: `Réinitialisez votre mot de passe : ${link}`,
      });
    } catch (e) {
      console.error('Envoi e-mail de réinitialisation échoué :', e.message);
    }
    if (!isMailConfigured()) console.log(`🔗 [DEV] Lien de réinitialisation pour ${user.email} : ${link}`);
  }

  return success(res, generic);
});

// POST /api/auth/reset-password  { token, password }  → définit un nouveau mot de passe
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return fail(res, { status: 400, message: 'Jeton et mot de passe requis' });

  const user = await User.scope('withPassword').findOne({
    where: { passwordResetToken: hashToken(token), passwordResetExpires: { [Op.gt]: new Date() } },
  });
  if (!user) return fail(res, { status: 400, message: 'Lien invalide ou expiré' });

  // Le hook beforeSave hache le mot de passe. On invalide le jeton après usage.
  // On confirme aussi l'e-mail (l'utilisateur a prouvé qu'il le contrôle).
  await user.update({
    password,
    passwordResetToken: null,
    passwordResetExpires: null,
    emailVerified: true,
  });
  return success(res, { message: 'Mot de passe réinitialisé. Vous pouvez vous connecter.' });
});
