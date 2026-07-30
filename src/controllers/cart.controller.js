import { Cart, CartItem, Product } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, fail } from '../utils/apiResponse.js';

async function getOrCreateCart(userId) {
  const [cart] = await Cart.findOrCreate({ where: { userId } });
  return cart;
}

function itemsInclude() {
  return {
    model: CartItem,
    as: 'items',
    include: [{ model: Product, as: 'product' }],
  };
}

// GET /api/cart
export const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user.id);
  const full = await Cart.findByPk(cart.id, { include: [itemsInclude()] });
  const subtotal = (full.items || []).reduce(
    (sum, it) => sum + (it.product?.price || 0) * it.quantity,
    0
  );
  return success(res, { data: { cart: full, subtotal } });
});

// POST /api/cart  { productId, quantity, color, storage }
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1, color, storage } = req.body;

  const product = await Product.findByPk(productId);
  if (!product) return fail(res, { status: 404, message: 'Produit introuvable' });

  const cart = await getOrCreateCart(req.user.id);
  const [item, isNew] = await CartItem.findOrCreate({
    where: { cartId: cart.id, productId, color: color || null, storage: storage || null },
    defaults: { quantity },
  });
  if (!isNew) {
    item.quantity += Number(quantity);
    await item.save();
  }
  return success(res, { message: 'Ajouté au panier', data: item });
});

// PUT /api/cart/:itemId  { quantity }
export const updateItem = asyncHandler(async (req, res) => {
  const item = await CartItem.findByPk(req.params.itemId);
  if (!item) return fail(res, { status: 404, message: 'Article introuvable' });
  item.quantity = Number(req.body.quantity);
  if (item.quantity <= 0) {
    await item.destroy();
    return success(res, { message: 'Article retiré' });
  }
  await item.save();
  return success(res, { message: 'Quantité mise à jour', data: item });
});

// DELETE /api/cart/:itemId
export const removeItem = asyncHandler(async (req, res) => {
  const item = await CartItem.findByPk(req.params.itemId);
  if (!item) return fail(res, { status: 404, message: 'Article introuvable' });
  await item.destroy();
  return success(res, { message: 'Article retiré du panier' });
});
