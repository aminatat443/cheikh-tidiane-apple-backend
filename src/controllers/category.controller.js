import { Category } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, created, fail } from '../utils/apiResponse.js';

// GET /api/categories
export const list = asyncHandler(async (req, res) => {
  const categories = await Category.findAll({ order: [['name', 'ASC']] });
  return success(res, { data: categories });
});

// POST /api/admin/categories
export const create = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  return created(res, { message: 'Catégorie créée', data: category });
});

// PUT /api/admin/categories/:id
export const update = asyncHandler(async (req, res) => {
  const category = await Category.findByPk(req.params.id);
  if (!category) return fail(res, { status: 404, message: 'Catégorie introuvable' });
  await category.update(req.body);
  return success(res, { message: 'Catégorie mise à jour', data: category });
});

// DELETE /api/admin/categories/:id
export const remove = asyncHandler(async (req, res) => {
  const category = await Category.findByPk(req.params.id);
  if (!category) return fail(res, { status: 404, message: 'Catégorie introuvable' });
  await category.destroy();
  return success(res, { message: 'Catégorie supprimée' });
});
