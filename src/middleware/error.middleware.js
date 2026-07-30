import { fail } from '../utils/apiResponse.js';

/** Route non trouvée */
export function notFound(req, res) {
  return fail(res, { status: 404, message: `Route introuvable : ${req.originalUrl}` });
}

/** Gestionnaire d'erreurs central */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  console.error('❌', err);

  // Erreurs de validation / contraintes Sequelize
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return fail(res, {
      status: 400,
      message: 'Erreur de validation',
      errors: err.errors?.map((e) => ({ field: e.path, message: e.message })),
    });
  }

  const status = err.status || 500;
  return fail(res, {
    status,
    message: err.message || 'Erreur interne du serveur',
  });
}
