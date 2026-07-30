/**
 * Réponses JSON normalisées : { success, message, data } / { success:false, message, errors }
 */
export function success(res, { data = null, message = 'OK', status = 200, meta } = {}) {
  const body = { success: true, message, data };
  if (meta) body.meta = meta;
  return res.status(status).json(body);
}

export function created(res, { data = null, message = 'Ressource créée' } = {}) {
  return success(res, { data, message, status: 201 });
}

export function fail(res, { message = 'Erreur', status = 400, errors = null } = {}) {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(status).json(body);
}
