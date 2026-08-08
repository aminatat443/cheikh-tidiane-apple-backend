import { Feedback } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, created, fail } from '../utils/apiResponse.js';

// GET /api/feedback  → avis approuvés (pour la page d'accueil)
export const listApproved = asyncHandler(async (req, res) => {
  const items = await Feedback.findAll({
    where: { isApproved: true },
    order: [['createdAt', 'DESC']],
    limit: 12,
  });
  return success(res, { data: items });
});

// POST /api/feedback  { name, role?, rating, comment }
export const create = asyncHandler(async (req, res) => {
  const { name, role, rating, comment } = req.body;
  if (!name || !comment || !rating) {
    return fail(res, { status: 400, message: 'Nom, note et commentaire requis' });
  }
  const r = Math.min(5, Math.max(1, Number(rating) || 5));
  const fb = await Feedback.create({
    name: String(name).slice(0, 60),
    role: role ? String(role).slice(0, 60) : null,
    rating: r,
    comment: String(comment).slice(0, 600),
  });
  return created(res, { message: 'Merci pour votre avis !', data: fb });
});
