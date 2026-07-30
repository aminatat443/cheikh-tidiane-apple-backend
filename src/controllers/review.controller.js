import { sequelize, Review, Product, User } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, created, fail } from '../utils/apiResponse.js';

// GET /api/products/:productId/reviews
export const listByProduct = asyncHandler(async (req, res) => {
  const reviews = await Review.findAll({
    where: { productId: req.params.productId, isApproved: true },
    include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatar'] }],
    order: [['createdAt', 'DESC']],
  });
  return success(res, { data: reviews });
});

// POST /api/products/:productId/reviews  { rating, comment }
export const create = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { rating, comment } = req.body;

  const product = await Product.findByPk(productId);
  if (!product) return fail(res, { status: 404, message: 'Produit introuvable' });

  const review = await sequelize.transaction(async (t) => {
    const [r, isNew] = await Review.findOrCreate({
      where: { userId: req.user.id, productId },
      defaults: { rating, comment },
      transaction: t,
    });
    if (!isNew) await r.update({ rating, comment }, { transaction: t });

    // Recalcule la note moyenne du produit
    const stats = await Review.findOne({
      where: { productId, isApproved: true },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'avg'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      raw: true,
      transaction: t,
    });
    await product.update(
      { ratingAvg: Number(stats.avg || 0), ratingCount: Number(stats.count || 0) },
      { transaction: t }
    );
    return r;
  });

  return created(res, { message: 'Avis publié', data: review });
});
