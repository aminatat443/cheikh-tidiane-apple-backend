import { User } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { signToken } from '../utils/jwt.js';
import { success, created, fail } from '../utils/apiResponse.js';

function sanitize(user) {
  const { password, ...rest } = user.toJSON();
  return rest;
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

  const token = signToken({ id: user.id, role: user.role });
  return success(res, {
    message: 'Connexion réussie',
    data: { user: sanitize(user), token },
  });
});

// GET /api/auth/me
export const me = asyncHandler(async (req, res) => {
  return success(res, { data: { user: req.user } });
});
