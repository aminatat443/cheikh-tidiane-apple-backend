/**
 * Enveloppe un handler async pour propager les erreurs vers le middleware d'erreur.
 * Évite les try/catch répétitifs dans les controllers.
 */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
