// Rôles utilisateurs
export const ROLES = {
  CLIENT: 'client',
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin', // Cheikh Tidiane : peut créer/gérer les autres admins
};

// Rôles disposant de l'accès au back-office
export const ADMIN_ROLES = ['admin', 'superadmin'];

// Catégories de produits
export const CATEGORIES = {
  IPHONE: 'iphone',
  IPAD: 'ipad',
  MACBOOK: 'macbook',
};

// Statuts de commande
export const ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  RETURNED: 'returned',
};

// Moyens de paiement
export const PAYMENT_METHODS = {
  WAVE: 'wave',
  ORANGE_MONEY: 'orange_money',
  CARD: 'card',
  LEBALMA: 'lebalma',
  CASH: 'cash', // vente au comptoir / espèces
};

// Statuts de paiement
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

// Statuts d'une demande de retour
export const RETURN_STATUS = {
  REQUESTED: 'requested', // demande envoyée par le client
  APPROVED: 'approved', // acceptée, en attente de réception/remboursement
  REJECTED: 'rejected', // refusée par la boutique
  REFUNDED: 'refunded', // remboursement effectué
};

// Statuts de commande éligibles à une demande de retour
export const RETURNABLE_ORDER_STATUS = ['paid', 'shipped', 'delivered'];

// Fenêtre de retour (jours après la commande) — configurable
export const RETURN_WINDOW_DAYS = 14;

// === LEBALMA (financement échelonné) ===
export const LEBALMA_FREQUENCY = {
  WEEKLY: 'weekly', // à partir de l'iPhone 11 Pro
  MONTHLY: 'monthly', // à partir de l'iPhone 12 Pro
};

export const LEBALMA_CONTRACT_STATUS = {
  PENDING: 'pending', // en attente de validation
  ACTIVE: 'active',
  COMPLETED: 'completed',
  DEFAULTED: 'defaulted', // en défaut de paiement
  CANCELLED: 'cancelled',
};

export const INSTALLMENT_STATUS = {
  UPCOMING: 'upcoming',
  PENDING: 'pending', // paiement initié par le client, en attente de validation (virement/espèce)
  PAID: 'paid',
  LATE: 'late',
};

/**
 * Paramètres Lebalma configurables (⚠️ valeurs par défaut — à confirmer avec le métier).
 * Décisions actées : acompte = POURCENTAGE, appareil remis dès l'acompte payé.
 */
export const LEBALMA_CONFIG = {
  downPaymentPercent: 30, // % du prix payé à la souscription (à confirmer)
  weeklyInstallments: 12, // nb d'échéances plan hebdomadaire (à confirmer)
  monthlyInstallments: 6, // nb d'échéances plan mensuel (à confirmer)
  serviceFeePercent: 0, // frais de service éventuels (à confirmer)
};
