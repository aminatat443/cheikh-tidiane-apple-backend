import { body } from 'express-validator';

export const createProductRules = [
  body('name').trim().notEmpty().withMessage('Le nom est requis'),
  body('slug').trim().notEmpty().withMessage('Le slug est requis'),
  body('price').isInt({ min: 0 }).withMessage('Prix invalide (entier FCFA)'),
  body('categoryId').optional().isInt().withMessage('Catégorie invalide'),
  body('lebalmaFrequency')
    .optional({ nullable: true })
    .isIn(['weekly', 'monthly'])
    .withMessage('Fréquence Lebalma invalide'),
];

export const updateProductRules = [
  body('price').optional().isInt({ min: 0 }).withMessage('Prix invalide'),
  body('lebalmaFrequency')
    .optional({ nullable: true })
    .isIn(['weekly', 'monthly'])
    .withMessage('Fréquence Lebalma invalide'),
];
