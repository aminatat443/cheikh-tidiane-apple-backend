import { Notification } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, fail } from '../utils/apiResponse.js';

// GET /api/notifications  → mes notifications (+ nombre non lues)
export const myNotifications = asyncHandler(async (req, res) => {
  const items = await Notification.findAll({
    where: { userId: req.user.id },
    order: [['createdAt', 'DESC']],
    limit: 50,
  });
  const unread = await Notification.count({ where: { userId: req.user.id, isRead: false } });
  return success(res, { data: items, meta: { unread } });
});

// PUT /api/notifications/:id/read
export const markRead = asyncHandler(async (req, res) => {
  const notif = await Notification.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!notif) return fail(res, { status: 404, message: 'Notification introuvable' });
  await notif.update({ isRead: true });
  return success(res, { data: notif });
});

// PUT /api/notifications/read-all
export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.update({ isRead: true }, { where: { userId: req.user.id, isRead: false } });
  return success(res, { message: 'Toutes les notifications sont lues' });
});

// DELETE /api/notifications/:id
export const remove = asyncHandler(async (req, res) => {
  const notif = await Notification.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!notif) return fail(res, { status: 404, message: 'Notification introuvable' });
  await notif.destroy();
  return success(res, { message: 'Notification supprimée' });
});
