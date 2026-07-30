import { Op } from 'sequelize';
import { Product, Category } from '../models/index.js';

/**
 * Recherche/filtre les produits. Supporte : recherche texte, catégorie, modèle,
 * fourchette de prix, promo, top ventes, éligibilité Lebalma, tri et pagination.
 */
export async function findProducts(query = {}) {
  const {
    q,
    category,
    model,
    minPrice,
    maxPrice,
    color,
    storage,
    isPromo,
    isTopSale,
    lebalma,
    inStock,
    sort = 'recent',
    page = 1,
    limit = 12,
  } = query;

  const where = {};

  if (q) {
    where[Op.or] = [
      { name: { [Op.like]: `%${q}%` } },
      { model: { [Op.like]: `%${q}%` } },
      { description: { [Op.like]: `%${q}%` } },
    ];
  }
  if (model) where.model = { [Op.like]: `%${model}%` };
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price[Op.gte] = Number(minPrice);
    if (maxPrice) where.price[Op.lte] = Number(maxPrice);
  }
  if (isPromo === 'true') where.isPromo = true;
  if (isTopSale === 'true') where.isTopSale = true;
  if (lebalma === 'true') where.lebalmaEligible = true;
  if (inStock === 'true') where.stock = { [Op.gt]: 0 };

  // Tri
  const orderMap = {
    recent: [['createdAt', 'DESC']],
    price_asc: [['price', 'ASC']],
    price_desc: [['price', 'DESC']],
    popular: [['soldCount', 'DESC']],
    rating: [['ratingAvg', 'DESC']],
  };
  const order = orderMap[sort] || orderMap.recent;

  const include = [{ model: Category, as: 'category', attributes: ['id', 'name', 'slug'] }];
  if (category) {
    include[0].where = { slug: category };
  }

  const offset = (Number(page) - 1) * Number(limit);
  const { rows, count } = await Product.findAndCountAll({
    where,
    include,
    order,
    limit: Number(limit),
    offset,
    distinct: true,
  });

  // Filtres JSON (couleur/capacité) appliqués en mémoire (colonnes JSON)
  let items = rows;
  if (color) {
    items = items.filter((p) => (p.colors || []).some((c) => c.name === color || c === color));
  }
  if (storage) {
    items = items.filter((p) => (p.storages || []).includes(storage));
  }

  return {
    items,
    meta: {
      total: count,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(count / Number(limit)),
    },
  };
}

export function findProductById(id) {
  return Product.findByPk(id, {
    include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'slug'] }],
  });
}
