/**
 * Configuration des passerelles de paiement.
 * Un moyen est « live » si ses clés sont présentes ; sinon on bascule en
 * simulation (testable en local) — aucune clé = aucun appel réseau réel.
 */
export const paymentEnv = {
  appUrl: process.env.APP_URL || 'http://localhost:5000',
  clientUrl: (process.env.CLIENT_URL || 'http://localhost:5173').split(',')[0].trim(),
  wave: {
    apiKey: process.env.WAVE_API_KEY || '',
    webhookSecret: process.env.WAVE_WEBHOOK_SECRET || '',
    apiBase: process.env.WAVE_API_BASE || 'https://api.wave.com/v1',
  },
  orange: {
    clientId: process.env.OM_CLIENT_ID || '',
    clientSecret: process.env.OM_CLIENT_SECRET || '',
    merchantKey: process.env.OM_MERCHANT_KEY || '',
    apiBase: process.env.OM_API_BASE || 'https://api.orange.com/orange-money-webpay/dev/v1',
    tokenUrl: process.env.OM_TOKEN_URL || 'https://api.orange.com/oauth/v3/token',
  },
};

/** 'live' si le provider est configuré, sinon 'simulation'. */
export function providerMode(method) {
  if (method === 'wave') return paymentEnv.wave.apiKey ? 'live' : 'simulation';
  if (method === 'orange_money') {
    return paymentEnv.orange.merchantKey && paymentEnv.orange.clientId ? 'live' : 'simulation';
  }
  return 'simulation'; // carte : pas d'intégration réelle ici
}
