import { sequelize } from '../config/database.js';

import User from './user.model.js';
import Category from './category.model.js';
import Product from './product.model.js';
import Favorite from './favorite.model.js';
import { Cart, CartItem } from './cart.model.js';
import { Order, OrderItem } from './order.model.js';
import Payment from './payment.model.js';
import Review from './review.model.js';
import { LebalmaContract, LebalmaInstallment } from './lebalma.model.js';

// === Associations ===

// Catégorie <-> Produits
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// Favoris (User <-> Product)
User.hasMany(Favorite, { foreignKey: 'userId', as: 'favorites' });
Favorite.belongsTo(User, { foreignKey: 'userId' });
Product.hasMany(Favorite, { foreignKey: 'productId' });
Favorite.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Panier
User.hasOne(Cart, { foreignKey: 'userId', as: 'cart' });
Cart.belongsTo(User, { foreignKey: 'userId' });
Cart.hasMany(CartItem, { foreignKey: 'cartId', as: 'items' });
CartItem.belongsTo(Cart, { foreignKey: 'cartId' });
CartItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Commandes
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Paiements
Order.hasMany(Payment, { foreignKey: 'orderId', as: 'payments' });
Payment.belongsTo(Order, { foreignKey: 'orderId' });
User.hasMany(Payment, { foreignKey: 'userId' });
Payment.belongsTo(User, { foreignKey: 'userId' });

// Avis
User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Product.hasMany(Review, { foreignKey: 'productId', as: 'reviews' });
Review.belongsTo(Product, { foreignKey: 'productId' });

// Lebalma
User.hasMany(LebalmaContract, { foreignKey: 'userId', as: 'lebalmaContracts' });
LebalmaContract.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Product.hasMany(LebalmaContract, { foreignKey: 'productId' });
LebalmaContract.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
LebalmaContract.hasMany(LebalmaInstallment, { foreignKey: 'contractId', as: 'installments' });
LebalmaInstallment.belongsTo(LebalmaContract, { foreignKey: 'contractId', as: 'contract' });
Payment.belongsTo(LebalmaInstallment, { foreignKey: 'installmentId' });

export {
  sequelize,
  User,
  Category,
  Product,
  Favorite,
  Cart,
  CartItem,
  Order,
  OrderItem,
  Payment,
  Review,
  LebalmaContract,
  LebalmaInstallment,
};
