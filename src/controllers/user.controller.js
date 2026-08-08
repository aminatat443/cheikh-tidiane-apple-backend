import { asyncHandler } from '../utils/asyncHandler.js';
import { success } from '../utils/apiResponse.js';

// GET /api/users/profile
export const getProfile = asyncHandler(async (req, res) => {
  return success(res, { data: req.user });
});

// PUT /api/users/profile  { name?, phone?, address?, city?, deliveryZone?, avatar? }
export const updateProfile = asyncHandler(async (req, res) => {
  // On ne met à jour que les champs réellement fournis (pas d'écrasement à null).
  const patch = {};
  for (const field of ['name', 'phone', 'address', 'city', 'deliveryZone', 'avatar']) {
    if (req.body[field] !== undefined) patch[field] = req.body[field];
  }
  await req.user.update(patch);
  return success(res, { message: 'Profil mis à jour', data: req.user });
});
