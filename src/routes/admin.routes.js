import { Router } from 'express';
import * as productController from '../controllers/product.controller.js';
import * as categoryController from '../controllers/category.controller.js';
import * as adminController from '../controllers/admin.controller.js';
import * as lebalmaController from '../controllers/lebalma.controller.js';
import * as campaignController from '../controllers/campaign.controller.js';
import * as returnController from '../controllers/return.controller.js';
import fs from 'fs';
import path from 'path';
import { protect, adminOnly, superAdminOnly } from '../middleware/auth.middleware.js';
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
router.get('/orders/:id/invoice.pdf', adminController.invoicePdf);
router.get('/orders/:id', adminController.getOrder);
router.put('/orders/:id/status', adminController.updateOrderStatus);
router.get('/clients', adminController.allClients);
router.post('/clients', adminController.createClient);

// Contrats Lebalma
router.post('/lebalma/contracts', lebalmaController.adminCreateContract);
router.get('/lebalma/contracts', lebalmaController.allContracts);
router.get('/lebalma/contracts/:id', lebalmaController.getContract);
router.put('/lebalma/contracts/:id/status', lebalmaController.updateContractStatus);
router.put('/lebalma/contracts/:id/deliver', lebalmaController.markDeviceDelivered);
router.put('/lebalma/installments/:id/pay', lebalmaController.markInstallmentPaid);

// Retours
router.get('/returns', returnController.allReturns);
router.get('/returns/:id', returnController.getReturnAdmin);
router.put('/returns/:id/status', returnController.updateReturnStatus);

// Relance panier abandonné (routes spécifiques AVANT la route générique :type)
router.get('/campaigns/abandoned-cart/preview', campaignController.previewAbandonedCart);
router.post('/campaigns/abandoned-cart/run', campaignController.runAbandonedCart);

// Recommandations personnalisées (routes spécifiques AVANT la route générique :type)
router.get('/campaigns/recommendations/preview', campaignController.previewRecommendations);
router.post('/campaigns/recommendations/run', campaignController.runRecommendations);

// Campagnes e-mail (promo, newsletter) — générées depuis les vrais produits
router.get('/campaigns/:type/preview', campaignController.preview);
router.post('/campaigns/:type/send', campaignController.send);

// Réglages (boutique / facturation : coordonnées, cachet + signature)
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

// Gestion des administrateurs — réservé au SUPER-ADMIN
router.get('/admins', superAdminOnly, adminController.listAdmins);
router.post('/admins', superAdminOnly, adminController.createAdmin);
router.delete('/admins/:id', superAdminOnly, adminController.deleteAdmin);

export default router;
