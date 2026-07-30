import { Server } from 'socket.io';

let io = null;

/**
 * Initialise Socket.IO pour les notifications temps réel
 * (nouvelles commandes, mises à jour de statut, échéances Lebalma).
 */
export function initSocket(server) {
  io = new Server(server, {
    cors: {
      // En dev, on reflète l'origine (port Vite variable) ; en prod, on restreint à CLIENT_URL.
      origin: process.env.NODE_ENV === 'production' ? process.env.CLIENT_URL || false : true,
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    // Le client rejoint une "room" personnelle pour recevoir ses notifications
    socket.on('join', (userId) => {
      if (userId) socket.join(`user:${userId}`);
    });
    // Room admin (dashboard)
    socket.on('join:admin', () => socket.join('admins'));
  });

  return io;
}

/** Notifie un utilisateur précis */
export function notifyUser(userId, event, payload) {
  if (io) io.to(`user:${userId}`).emit(event, payload);
}

/** Notifie tous les admins connectés */
export function notifyAdmins(event, payload) {
  if (io) io.to('admins').emit(event, payload);
}

export function getIO() {
  return io;
}
