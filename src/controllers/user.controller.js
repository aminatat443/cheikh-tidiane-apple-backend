import { asyncHandler } from '../utils/asyncHandler.js';
import { success } from '../utils/apiResponse.js';

// GET /api/users/profile
export const getProfile = asyncHandler(async (req, res) => {
  return success(res, { data: req.user });
});

// PUT /api/users/profile  { name, phone, address, city, avatar }
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, address, city, avatar } = req.body;
  await req.user.update({ name, phone, address, city, avatar });
  return success(res, { message: 'Profil mis à jour', data: req.user });
});
