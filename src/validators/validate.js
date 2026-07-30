import { validationResult } from 'express-validator';
import { fail } from '../utils/apiResponse.js';

/** Middleware : renvoie 422 si des règles de validation ont échoué. */
export function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return fail(res, {
      status: 422,
      message: 'Données invalides',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}
