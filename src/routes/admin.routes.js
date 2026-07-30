import { Router } from 'express';
import * as productController from '../controllers/product.controller.js';
import * as categoryController from '../controllers/category.controller.js';
import * as adminController from '../controllers/admin.controller.js';
import fs from 'fs';
import path from 'path';
import { protect, adminOnly } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import { uploadBuffer, isCloudinaryConfigured } from '../config/cloudinary.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createProductRules, updateProductRules } from '../validators/product.validator.js';
import { validate } from '../validators/validate.js';

const UPLOAD_DIR = 'src/uploads';

const router = Router();

// Toutes les routes admin sont protégées + réservées au rôle admin
router.use(protect, adminOnly);

// Tableau de bord
router.get('/dashboard', adminController.dashboard);

// Produits
router.post('/products', createProductRules, validate, productController.create);
router.put('/products/:id', updateProductRules, validate, productController.update);
router.delete('/products/:id', productController.remove);
// Upload d'images produit (jusqu'à 6) → Cloudinary si configuré, sinon disque local
router.post(
  '/products/upload',
  upload.array('images', 6),
  asyncHandler(async (req, res) => {
    const urls = [];
    for (const file of req.files || []) {
      if (isCloudinaryConfigured()) {
        urls.push(await uploadBuffer(file.buffer));
      } else {
        const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        const filename = `${Date.now()}-${Math.round(Math.random() * 1e6)}-${safe}`;
        fs.writeFileSync(path.join(UPLOAD_DIR, filename), file.buffer);
        urls.push(`${req.protocol}://${req.get('host')}/uploads/${filename}`);
      }
    }
    res.json({ success: true, message: 'Images téléversées', data: urls });
  })
);

// Catégories
router.post('/categories', categoryController.create);
router.put('/categories/:id', categoryController.update);
router.delete('/categories/:id', categoryController.remove);

// Commandes & clients
router.get('/orders', adminController.allOrders);
router.put('/orders/:id/status', adminController.updateOrderStatus);
router.get('/clients', adminController.allClients);

export default router;
