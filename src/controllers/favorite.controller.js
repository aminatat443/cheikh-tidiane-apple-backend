import { Favorite, Product } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, fail } from '../utils/apiResponse.js';

// GET /api/favorites
export const list = asyncHandler(async (req, res) => {
  const favorites = await Favorite.findAll({
    where: { userId: req.user.id },
    include: [{ model: Product, as: 'product' }],
    order: [['createdAt', 'DESC']],
  });
  return success(res, { data: favorites });
});

// POST /api/favorites  { productId }
export const add = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const [favorite, isNew] = await Favorite.findOrCreate({
    where: { userId: req.user.id, productId },
  });
  return success(res, {
    message: isNew ? 'Ajouté aux favoris' : 'Déjà dans les favoris',
    data: favorite,
  });
});

// DELETE /api/favorites/:productId
export const remove = asyncHandler(async (req, res) => {
  const deleted = await Favorite.destroy({
    where: { userId: req.user.id, productId: req.params.productId },
  });
  if (!deleted) return fail(res, { status: 404, message: 'Favori introuvable' });
  return success(res, { message: 'Retiré des favoris' });
});
