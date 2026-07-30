import { Product } from '../models/index.js';
import * as productRepo from '../repositories/product.repository.js';
import { computeLebalmaPlan, planFromProduct } from '../services/lebalma.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, created, fail } from '../utils/apiResponse.js';

// GET /api/products
export const list = asyncHandler(async (req, res) => {
  const { items, meta } = await productRepo.findProducts(req.query);
  return success(res, { data: items, meta });
});

// GET /api/products/:id
export const getOne = asyncHandler(async (req, res) => {
  const product = await productRepo.findProductById(req.params.id);
  if (!product) return fail(res, { status: 404, message: 'Produit introuvable' });

  // Ajoute le plan Lebalma si éligible
  let lebalma = null;
  if (product.lebalmaEligible && product.lebalmaMonths) {
    lebalma = computeLebalmaPlan(product.price, planFromProduct(product));
  }

  return success(res, { data: { product, lebalma } });
});

// POST /api/admin/products
export const create = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  return created(res, { message: 'Produit créé', data: product });
});

// PUT /api/admin/products/:id
export const update = asyncHandler(async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) return fail(res, { status: 404, message: 'Produit introuvable' });
  await product.update(req.body);
  return success(res, { message: 'Produit mis à jour', data: product });
});

// DELETE /api/admin/products/:id
export const remove = asyncHandler(async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) return fail(res, { status: 404, message: 'Produit introuvable' });
  await product.destroy();
  return success(res, { message: 'Produit supprimé' });
});
