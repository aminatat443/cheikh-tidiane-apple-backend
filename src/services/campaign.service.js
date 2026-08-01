import { fcfa } from './notification.service.js';

const CLIENT_URL = (process.env.CLIENT_URL || 'http://localhost:5173').split(',')[0].trim();
const font = "'Montserrat',Helvetica,Arial,sans-serif";
const productUrl = (p) => `${CLIENT_URL}/products/${p.id}`;

/** URL d'image absolue d'un produit (photo réelle, sinon visuel boutique, sinon placeholder). */
function productImage(p) {
  const img = Array.isArray(p.images) && p.images[0];
  if (img) return img; // Cloudinary / URL absolue
  const label = `${p.model || ''} ${p.name || ''}`.toLowerCase();
  if (p.category?.slug === 'iphone' || /iphone/.test(label)) {
    const n = (Math.abs(Number(p.id) || 0) % 3) + 1;
    return `${CLIENT_URL}/images/iphone-${n}.png`;
  }
  return `https://placehold.co/520x360/FFFFFF/111827/png?text=${encodeURIComponent(p.name || 'Produit')}&font=montserrat`;
}

const stars = (p) => {
  if (!p.ratingCount) return '★★★★★';
  const f = Math.max(0, Math.min(5, Math.round(p.ratingAvg || 0)));
  return '★'.repeat(f) + '☆'.repeat(5 - f);
};

const short = (s, n = 62) => {
  const t = (s || '').replace(/\s+/g, ' ').trim();
  return t.length > n ? `${t.slice(0, n - 1)}…` : t;
};

/* ---------------- Blocs réutilisables ---------------- */

function featuredCard(p) {
  const discount = p.oldPrice > p.price ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 0;
  return `
  <td class="col" width="50%" valign="top" style="padding:8px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FFFFFF;border:1px solid #E5E7EB;border-radius:16px;overflow:hidden;">
      <tr><td style="background:#F8FAFC;position:relative;">
        ${discount ? `<div style="position:absolute;top:10px;left:10px;background:#EF4444;color:#fff;font-family:${font};font-size:11px;font-weight:700;padding:3px 8px;border-radius:999px;">−${discount}%</div>` : ''}
        <a href="${productUrl(p)}"><img src="${productImage(p)}" width="252" alt="${p.name}" style="width:100%;height:auto;" /></a>
      </td></tr>
      <tr><td style="padding:16px 16px 18px 16px;">
        <p style="margin:0;font-family:${font};font-size:16px;font-weight:700;color:#111827;">${p.name}</p>
        ${p.description ? `<p style="margin:6px 0 0 0;font-family:${font};font-size:12px;line-height:17px;color:#6B7280;">${short(p.description)}</p>` : ''}
        <p style="margin:8px 0 0 0;font-family:${font};font-size:13px;color:#F59E0B;letter-spacing:1px;">${stars(p)}</p>
        ${p.oldPrice > p.price ? `<p style="margin:10px 0 0 0;"><span style="font-family:${font};font-size:13px;color:#9CA3AF;text-decoration:line-through;">${fcfa(p.oldPrice)}</span></p>` : '<p style="margin:10px 0 0 0;font-size:1px;">&nbsp;</p>'}
        <p style="margin:2px 0 0 0;font-family:${font};font-size:19px;font-weight:800;color:#111827;">${fcfa(p.price)}</p>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="btn-full" style="margin-top:12px;"><tr><td align="center" bgcolor="#0A84FF" style="border-radius:10px;"><a href="${productUrl(p)}" style="display:inline-block;width:100%;box-sizing:border-box;padding:11px 12px;font-family:${font};font-size:13px;font-weight:700;color:#FFFFFF;border-radius:10px;text-align:center;">Voir le produit</a></td></tr></table>
      </td></tr>
    </table>
  </td>`;
}

function recommendedCard(p) {
  return `
  <td class="col" width="25%" valign="top" style="padding:8px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FFFFFF;border:1px solid #E5E7EB;border-radius:14px;overflow:hidden;">
      <tr><td style="background:#F8FAFC;"><a href="${productUrl(p)}"><img src="${productImage(p)}" width="128" alt="${p.name}" style="width:100%;height:auto;" /></a></td></tr>
      <tr><td style="padding:10px 12px 14px 12px;">
        <p style="margin:0;font-family:${font};font-size:13px;font-weight:700;color:#111827;">${short(p.name, 22)}</p>
        <p style="margin:4px 0 0 0;font-family:${font};font-size:14px;font-weight:800;color:#0A84FF;">${fcfa(p.price)}</p>
      </td></tr>
    </table>
  </td>`;
}

function featuredRows(list) {
  let out = '';
  for (let i = 0; i < list.length; i += 2) {
    out += `<tr>${featuredCard(list[i])}${list[i + 1] ? featuredCard(list[i + 1]) : '<td class="col" width="50%" style="padding:8px;"></td>'}</tr>`;
  }
  return out;
}

const heroBlock = ({ eyebrow, title, subtitle, ctaText, ctaUrl, imageUrl }) => `
  <tr><td style="background-color:#111827;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td class="hero-pad" align="center" style="padding:44px 40px 8px 40px;">
        <p style="margin:0 0 14px 0;font-family:${font};font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#0A84FF;">${eyebrow}</p>
        <h1 class="h1" style="margin:0;font-family:${font};font-size:38px;line-height:44px;font-weight:800;letter-spacing:-1px;color:#FFFFFF;">${title}</h1>
        <p style="margin:16px auto 0 auto;max-width:430px;font-family:${font};font-size:16px;line-height:24px;color:#C7CDD6;">${subtitle}</p>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:26px auto 6px auto;"><tr><td align="center" bgcolor="#0A84FF" style="border-radius:999px;"><a href="${ctaUrl}" style="display:inline-block;padding:14px 34px;font-family:${font};font-size:15px;font-weight:700;color:#FFFFFF;border-radius:999px;">${ctaText} →</a></td></tr></table>
      </td></tr>
      <tr><td align="center" style="padding:14px 24px 4px 24px;">
        <img src="${imageUrl}" width="520" alt="Cheikh Tidiane Apple" style="width:100%;max-width:520px;height:auto;border-radius:14px;" />
      </td></tr>
    </table>
  </td></tr>`;

const sectionTitle = (eyebrow, title) => `
  <tr><td class="px" style="padding:38px 32px 6px 32px;">
    ${eyebrow ? `<p style="margin:0;font-family:${font};font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#0A84FF;">${eyebrow}</p>` : ''}
    <h2 style="margin:6px 0 0 0;font-family:${font};font-size:24px;font-weight:800;letter-spacing:-0.5px;color:#111827;">${title}</h2>
  </td></tr>`;

const whyChooseBlock = () => `
  <tr><td class="px" style="padding:28px 24px 8px 24px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F8FAFC;border-radius:16px;"><tr><td style="padding:20px 8px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
        <td class="col" width="25%" align="center" valign="top" style="padding:10px 8px;"><div style="font-size:22px;line-height:22px;">✅</div><p style="margin:8px 0 0 0;font-family:${font};font-size:12px;font-weight:700;color:#111827;">Garantie officielle</p></td>
        <td class="col" width="25%" align="center" valign="top" style="padding:10px 8px;"><div style="font-size:22px;line-height:22px;">🔒</div><p style="margin:8px 0 0 0;font-family:${font};font-size:12px;font-weight:700;color:#111827;">Paiement sécurisé</p></td>
        <td class="col" width="25%" align="center" valign="top" style="padding:10px 8px;"><div style="font-size:22px;line-height:22px;">🚚</div><p style="margin:8px 0 0 0;font-family:${font};font-size:12px;font-weight:700;color:#111827;">Livraison rapide</p></td>
        <td class="col" width="25%" align="center" valign="top" style="padding:10px 8px;"><div style="font-size:22px;line-height:22px;">💬</div><p style="margin:8px 0 0 0;font-family:${font};font-size:12px;font-weight:700;color:#111827;">Support client</p></td>
      </tr></table>
    </td></tr></table>
  </td></tr>`;

const testimonialsBlock = () => `
  <tr><td class="px" style="padding:24px 32px 4px 32px;">
    <h2 style="margin:0;font-family:${font};font-size:20px;font-weight:800;letter-spacing:-0.4px;color:#111827;">Ils nous font confiance</h2>
  </td></tr>
  <tr><td class="px" style="padding:12px 24px 8px 24px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td class="col" width="50%" valign="top" style="padding:8px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FFFFFF;border:1px solid #E5E7EB;border-radius:16px;"><tr><td style="padding:16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td width="40" valign="middle"><img src="https://placehold.co/80x80/E5E7EB/111827/png?text=A" width="40" height="40" alt="Awa" style="border-radius:999px;" /></td><td valign="middle" style="padding-left:10px;"><p style="margin:0;font-family:${font};font-size:13px;font-weight:700;color:#111827;">Awa N.</p><p style="margin:1px 0 0 0;font-family:${font};font-size:12px;color:#F59E0B;letter-spacing:1px;">★★★★★</p></td></tr></table>
        <p style="margin:12px 0 0 0;font-family:${font};font-size:13px;line-height:20px;color:#374151;">« Livraison en 24h à Dakar, iPhone impeccable. Service au top ! »</p>
      </td></tr></table></td>
      <td class="col" width="50%" valign="top" style="padding:8px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FFFFFF;border:1px solid #E5E7EB;border-radius:16px;"><tr><td style="padding:16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td width="40" valign="middle"><img src="https://placehold.co/80x80/E5E7EB/111827/png?text=M" width="40" height="40" alt="Modou" style="border-radius:999px;" /></td><td valign="middle" style="padding-left:10px;"><p style="margin:0;font-family:${font};font-size:13px;font-weight:700;color:#111827;">Modou F.</p><p style="margin:1px 0 0 0;font-family:${font};font-size:12px;color:#F59E0B;letter-spacing:1px;">★★★★★</p></td></tr></table>
        <p style="margin:12px 0 0 0;font-family:${font};font-size:13px;line-height:20px;color:#374151;">« J'ai payé avec Lebalma, super pratique. Je recommande. »</p>
      </td></tr></table></td>
    </tr></table>
  </td></tr>`;

const recommendedSection = (recommended) => (recommended.length ? `
  <tr><td class="px" style="padding:26px 32px 4px 32px;">
    <h2 style="margin:0;font-family:${font};font-size:20px;font-weight:800;letter-spacing:-0.4px;color:#111827;">Vous aimerez aussi</h2>
  </td></tr>
  <tr><td class="px" style="padding:12px 24px 8px 24px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${recommended.map(recommendedCard).join('')}</tr></table>
  </td></tr>` : '');

function footer(shop, unsubscribeUrl, viewUrl) {
  const name = shop.name || 'Cheikh Tidiane Apple';
  return `
  <tr><td style="background-color:#111827;padding:32px 32px 28px 32px;" align="center">
    <p style="margin:0;font-family:${font};font-size:17px;font-weight:800;color:#FFFFFF;">Cheikh Tidiane <span style="color:#0A84FF;">Apple</span></p>
    <p style="margin:8px 0 0 0;font-family:${font};font-size:12px;line-height:19px;color:#9CA3AF;">${shop.address || 'Dakar, Sénégal'}<br />${shop.phone || '+221 77 000 00 00'} · ${shop.email || 'contact@cheikhtidianeapple.sn'}</p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:16px auto 0 auto;"><tr>
      <td style="padding:0 8px;"><a href="https://wa.me/221770000000" style="font-family:${font};font-size:12px;font-weight:600;color:#E5E7EB;">WhatsApp</a></td><td style="color:#374151;">·</td>
      <td style="padding:0 8px;"><a href="https://facebook.com" style="font-family:${font};font-size:12px;font-weight:600;color:#E5E7EB;">Facebook</a></td><td style="color:#374151;">·</td>
      <td style="padding:0 8px;"><a href="https://instagram.com" style="font-family:${font};font-size:12px;font-weight:600;color:#E5E7EB;">Instagram</a></td><td style="color:#374151;">·</td>
      <td style="padding:0 8px;"><a href="https://tiktok.com" style="font-family:${font};font-size:12px;font-weight:600;color:#E5E7EB;">TikTok</a></td>
    </tr></table>
    <p style="margin:16px 0 0 0;font-family:${font};font-size:11px;line-height:17px;color:#6B7280;">© 2026 ${name}. Tous droits réservés.<br /><a href="${unsubscribeUrl}" style="color:#9CA3AF;text-decoration:underline;">Se désabonner</a> · <a href="${viewUrl}" style="color:#9CA3AF;text-decoration:underline;">Voir dans le navigateur</a></p>
  </td></tr>`;
}

/** Ouverture d'email (doctype + head + coquille + en-tête/nav). */
const emailOpen = (title) => `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "https://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html lang="fr" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" /><meta name="x-apple-disable-message-reformatting" />
<title>${title}</title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
<style type="text/css">
  body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
  table,td{mso-table-lspace:0pt;mso-table-rspace:0pt}
  img{-ms-interpolation-mode:bicubic;border:0;height:auto;line-height:100%;outline:none;text-decoration:none;display:block}
  table{border-collapse:collapse!important}
  body{margin:0!important;padding:0!important;width:100%!important;background:#F8FAFC}
  @media only screen and (max-width:600px){
    .container{width:100%!important}.px{padding-left:20px!important;padding-right:20px!important}
    .col{display:block!important;width:100%!important;box-sizing:border-box!important}
    .h1{font-size:30px!important;line-height:36px!important}.hero-pad{padding:32px 22px!important}
    .btn-full a{display:block!important}
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#F8FAFC;">
<div style="display:none;font-size:1px;color:#F8FAFC;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${title}&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F8FAFC;"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background:#FFFFFF;border-radius:20px;overflow:hidden;border:1px solid #E5E7EB;">
  <tr><td class="px" align="center" style="padding:28px 32px 18px 32px;">
    <a href="${CLIENT_URL}" style="font-family:${font};font-size:22px;font-weight:800;letter-spacing:-0.4px;color:#111827;">Cheikh Tidiane <span style="color:#0A84FF;">Apple</span></a>
  </td></tr>
  <tr><td class="px" align="center" style="padding:0 24px 22px 24px;border-bottom:1px solid #E5E7EB;">
    <a href="${CLIENT_URL}/products?category=iphone" style="display:inline-block;padding:6px 12px;font-family:${font};font-size:13px;font-weight:600;color:#374151;">iPhone</a>
    <a href="${CLIENT_URL}/products?category=macbook" style="display:inline-block;padding:6px 12px;font-family:${font};font-size:13px;font-weight:600;color:#374151;">Mac</a>
    <a href="${CLIENT_URL}/products?category=ipad" style="display:inline-block;padding:6px 12px;font-family:${font};font-size:13px;font-weight:600;color:#374151;">iPad</a>
    <a href="${CLIENT_URL}/products" style="display:inline-block;padding:6px 12px;font-family:${font};font-size:13px;font-weight:600;color:#374151;">Accessoires</a>
  </td></tr>`;

const emailClose = () => `
</table>
</td></tr></table>
</body></html>`;

const ctaDark = (label, url) => `
  <tr><td class="px" align="center" style="padding:20px 32px 34px 32px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td align="center" bgcolor="#111827" style="border-radius:999px;"><a href="${url}" style="display:inline-block;padding:14px 34px;font-family:${font};font-size:15px;font-weight:700;color:#FFFFFF;border-radius:999px;">${label}</a></td></tr></table>
  </td></tr>`;

/** Ligne d'article de panier (image + nom + variante + quantité + total ligne). */
const cartRow = (it) => {
  const p = it.product || {};
  const price = it.price ?? p.price ?? 0;
  const variant = [it.storage, it.color].filter(Boolean).join(' · ');
  return `<tr>
    <td width="76" valign="top" style="padding:10px 0;"><a href="${productUrl(p)}"><img src="${productImage(p)}" width="64" height="64" alt="${p.name || 'Produit'}" style="width:64px;height:64px;border-radius:12px;border:1px solid #E5E7EB;background:#F8FAFC;" /></a></td>
    <td valign="top" style="padding:10px 0 10px 12px;">
      <p style="margin:0;font-family:${font};font-size:14px;font-weight:700;color:#111827;">${p.name || 'Produit'}</p>
      ${variant ? `<p style="margin:2px 0 0 0;font-family:${font};font-size:12px;color:#6B7280;">${variant}</p>` : ''}
      <p style="margin:2px 0 0 0;font-family:${font};font-size:12px;color:#6B7280;">Quantité : ${it.quantity || 1}</p>
    </td>
    <td valign="top" align="right" style="padding:10px 0;font-family:${font};font-size:14px;font-weight:800;color:#111827;white-space:nowrap;">${fcfa(price * (it.quantity || 1))}</td>
  </tr>`;
};

/**
 * Rend un email complet (coquille + blocs). Utilisé par la promo et la newsletter.
 */
function renderEmail({ title, shop, hero, eyebrow, heading, featured, recommended, showTestimonials, unsubscribeUrl, viewUrl }) {
  return `${emailOpen(title)}
  ${hero}
  ${sectionTitle(eyebrow, heading)}
  <tr><td class="px" style="padding:18px 24px 8px 24px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${featuredRows(featured)}</table>
  </td></tr>
  ${recommendedSection(recommended)}
  ${whyChooseBlock()}
  ${showTestimonials ? testimonialsBlock() : ''}
  ${ctaDark('Découvrir toute la boutique', `${CLIENT_URL}/products`)}
  ${footer(shop, unsubscribeUrl, viewUrl)}
${emailClose()}`;
}

/* ---------------- Builders publics ---------------- */

export function buildPromoEmail({ featured = [], recommended = [], shop = {}, unsubscribeUrl = '#', viewUrl = '#' }) {
  const hero = heroBlock({
    eyebrow: 'Offre exclusive',
    title: "Changez d'iPhone<br />aujourd'hui.",
    subtitle: 'Jusqu\'à <strong style="color:#FFFFFF;">30% de réduction</strong> sur une sélection de modèles.',
    ctaText: 'Acheter maintenant',
    ctaUrl: `${CLIENT_URL}/products?isPromo=true`,
    imageUrl: 'https://placehold.co/1040x460/111827/FFFFFF/png?text=iPhone%2017%20Pro%20%C2%B7%2016%20Pro%20%C2%B7%2015%20Pro&font=montserrat',
  });
  return renderEmail({
    title: `${shop.name || 'Cheikh Tidiane Apple'} — Jusqu'à 30% de réduction`,
    shop, hero, eyebrow: 'En vedette', heading: 'Nos meilleures offres',
    featured, recommended, showTestimonials: true, unsubscribeUrl, viewUrl,
  });
}

export function buildNewsletterEmail({ featured = [], recommended = [], shop = {}, unsubscribeUrl = '#', viewUrl = '#' }) {
  const hero = heroBlock({
    eyebrow: 'Nouveautés',
    title: 'Les nouveaux iPhone<br />sont arrivés.',
    subtitle: 'Découvrez les tout derniers modèles disponibles chez Cheikh Tidiane Apple.',
    ctaText: 'Découvrir les nouveautés',
    ctaUrl: `${CLIENT_URL}/products`,
    imageUrl: 'https://placehold.co/1040x460/111827/FFFFFF/png?text=Nouveaux%20arrivages&font=montserrat',
  });
  return renderEmail({
    title: `${shop.name || 'Cheikh Tidiane Apple'} — Nouveaux arrivages`,
    shop, hero, eyebrow: 'Nouveautés', heading: 'Nos derniers arrivages',
    featured, recommended, showTestimonials: false, unsubscribeUrl, viewUrl,
  });
}

export function buildAbandonedCartEmail({ user = {}, items = [], shop = {}, unsubscribeUrl = '#', viewUrl = '#' }) {
  const subtotal = items.reduce((s, it) => s + (it.price ?? it.product?.price ?? 0) * (it.quantity || 1), 0);
  const first = (user.name || '').split(' ')[0];
  const hero = heroBlock({
    eyebrow: 'Votre panier vous attend',
    title: 'Vous avez oublié<br />quelque chose ?',
    subtitle: `${first ? `${first}, v` : 'V'}os articles sont toujours disponibles. Finalisez votre commande en quelques secondes.`,
    ctaText: 'Reprendre ma commande',
    ctaUrl: `${CLIENT_URL}/cart`,
    imageUrl: 'https://placehold.co/1040x460/111827/FFFFFF/png?text=Votre%20panier&font=montserrat',
  });

  const body = `
  <tr><td class="px" style="padding:34px 32px 4px 32px;">
    <h2 style="margin:0;font-family:${font};font-size:22px;font-weight:800;letter-spacing:-0.4px;color:#111827;">Votre panier</h2>
  </td></tr>
  <tr><td class="px" style="padding:8px 32px 0 32px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      ${items.map(cartRow).join('')}
      <tr><td colspan="3" style="border-top:1px solid #E5E7EB;padding-top:14px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td style="font-family:${font};font-size:15px;font-weight:700;color:#111827;">Sous-total</td>
          <td align="right" style="font-family:${font};font-size:18px;font-weight:800;color:#111827;">${fcfa(subtotal)}</td>
        </tr></table>
      </td></tr>
    </table>
  </td></tr>
  <tr><td class="px" align="center" style="padding:22px 32px 8px 32px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td align="center" bgcolor="#0A84FF" style="border-radius:999px;"><a href="${CLIENT_URL}/cart" style="display:inline-block;padding:14px 40px;font-family:${font};font-size:15px;font-weight:700;color:#FFFFFF;border-radius:999px;">Finaliser ma commande →</a></td></tr></table>
  </td></tr>`;

  return `${emailOpen(`${shop.name || 'Cheikh Tidiane Apple'} — Vous avez oublié votre panier`)}
  ${hero}
  ${body}
  ${whyChooseBlock()}
  ${footer(shop, unsubscribeUrl, viewUrl)}
${emailClose()}`;
}

/* ---------------- Emails transactionnels ---------------- */

const orderItemRow = (it) => {
  const variant = [it.storage, it.color].filter(Boolean).join(' · ');
  return `<tr>
    <td style="padding:9px 0;font-family:${font};font-size:14px;color:#111827;border-bottom:1px solid #F1F5F9;">${it.productName}${variant ? ` <span style="color:#6B7280;">— ${variant}</span>` : ''} <span style="color:#6B7280;">× ${it.quantity}</span></td>
    <td align="right" style="padding:9px 0;font-family:${font};font-size:14px;font-weight:700;color:#111827;white-space:nowrap;border-bottom:1px solid #F1F5F9;">${fcfa((it.unitPrice || 0) * (it.quantity || 1))}</td>
  </tr>`;
};

export function buildOrderEmail({ user = {}, order = {}, items = [], shop = {}, kind = 'confirmation', unsubscribeUrl = '#', viewUrl = '#' }) {
  const isShipped = kind === 'shipped';
  const first = (user.name || '').split(' ')[0];
  const hero = heroBlock({
    eyebrow: isShipped ? 'Commande expédiée' : 'Commande confirmée',
    title: isShipped ? 'Votre commande<br />est en route !' : 'Merci pour<br />votre commande !',
    subtitle: isShipped
      ? `${first ? `${first}, v` : 'V'}otre colis a été expédié. Vous le recevrez très bientôt.`
      : `${first ? `${first}, n` : 'N'}ous préparons votre commande ${order.reference || ''}.`,
    ctaText: 'Suivre ma commande',
    ctaUrl: `${CLIENT_URL}/orders`,
    imageUrl: `https://placehold.co/1040x460/111827/FFFFFF/png?text=${isShipped ? 'Exp%C3%A9di%C3%A9e' : 'Merci%20!'}&font=montserrat`,
  });
  const addr = [order.shippingAddress, order.shippingCity].filter(Boolean).join(', ');
  const body = `
  <tr><td class="px" style="padding:32px 32px 4px 32px;">
    <h2 style="margin:0;font-family:${font};font-size:22px;font-weight:800;letter-spacing:-0.4px;color:#111827;">Récapitulatif</h2>
    <p style="margin:4px 0 0 0;font-family:${font};font-size:13px;color:#6B7280;">Commande <strong style="color:#111827;">${order.reference || ''}</strong></p>
  </td></tr>
  <tr><td class="px" style="padding:12px 32px 0 32px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      ${items.map(orderItemRow).join('')}
      <tr><td style="padding:12px 0 0 0;font-family:${font};font-size:13px;color:#6B7280;">Sous-total</td><td align="right" style="padding:12px 0 0 0;font-family:${font};font-size:13px;color:#6B7280;">${fcfa(order.subtotal)}</td></tr>
      <tr><td style="padding:4px 0;font-family:${font};font-size:13px;color:#6B7280;">Livraison</td><td align="right" style="padding:4px 0;font-family:${font};font-size:13px;color:#6B7280;">${fcfa(order.shippingFee)}</td></tr>
      <tr><td style="padding:8px 0 0 0;font-family:${font};font-size:16px;font-weight:800;color:#111827;border-top:2px solid #111827;">Total</td><td align="right" style="padding:8px 0 0 0;font-family:${font};font-size:16px;font-weight:800;color:#0A84FF;border-top:2px solid #111827;">${fcfa(order.total)}</td></tr>
    </table>
  </td></tr>
  ${addr ? `<tr><td class="px" style="padding:18px 32px 0 32px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F8FAFC;border-radius:14px;"><tr><td style="padding:14px 16px;"><p style="margin:0;font-family:${font};font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#6B7280;">Livraison</p><p style="margin:4px 0 0 0;font-family:${font};font-size:13px;line-height:19px;color:#374151;">${order.shippingName || ''}<br />${addr}<br />${order.shippingPhone || ''}</p></td></tr></table></td></tr>` : ''}
  ${ctaDark('Suivre ma commande', `${CLIENT_URL}/orders`)}`;
  const title = isShipped ? `Commande ${order.reference} expédiée` : `Confirmation de commande ${order.reference}`;
  return `${emailOpen(title)}
  ${hero}
  ${body}
  ${footer(shop, unsubscribeUrl, viewUrl)}
${emailClose()}`;
}

export function buildRecommendationsEmail({ user = {}, products = [], shop = {}, unsubscribeUrl = '#', viewUrl = '#' }) {
  const first = (user.name || '').split(' ')[0];
  const hero = heroBlock({
    eyebrow: 'Rien que pour vous',
    title: first ? `${first},<br />votre sélection.` : 'Votre sélection<br />du moment.',
    subtitle: 'Des produits choisis selon vos préférences et vos achats récents.',
    ctaText: 'Voir la sélection',
    ctaUrl: `${CLIENT_URL}/products`,
    imageUrl: 'https://placehold.co/1040x460/111827/FFFFFF/png?text=Pour%20vous&font=montserrat',
  });
  return renderEmail({
    title: `${shop.name || 'Cheikh Tidiane Apple'} — Notre sélection pour vous`,
    shop, hero, eyebrow: 'Recommandations', heading: 'Sélectionnés pour vous',
    featured: products.slice(0, 4), recommended: products.slice(4, 8), showTestimonials: false, unsubscribeUrl, viewUrl,
  });
}

export function buildBackInStockEmail({ user = {}, product = {}, shop = {}, unsubscribeUrl = '#', viewUrl = '#' }) {
  const first = (user.name || '').split(' ')[0];
  const hero = heroBlock({
    eyebrow: 'De retour en stock',
    title: 'Bonne nouvelle !<br />C\'est de retour.',
    subtitle: `${first ? `${first}, l` : 'L'}e produit que vous attendiez est de nouveau disponible — ne le manquez pas.`,
    ctaText: 'Voir le produit',
    ctaUrl: `${CLIENT_URL}/products/${product.id}`,
    imageUrl: 'https://placehold.co/1040x460/111827/FFFFFF/png?text=De%20retour%20en%20stock&font=montserrat',
  });
  const body = `
  <tr><td class="px" style="padding:28px 24px 8px 24px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      ${featuredCard(product)}
      <td class="col" width="50%" style="padding:8px;" valign="top"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="height:100%;"><tr><td valign="middle" style="padding:8px;">
        <p style="margin:0;font-family:${font};font-size:15px;line-height:22px;color:#374151;">Il est très demandé — nous vous conseillons de commander rapidement avant une nouvelle rupture.</p>
      </td></tr></table></td>
    </tr></table>
  </td></tr>`;
  return `${emailOpen(`${product.name || 'Produit'} est de retour en stock`)}
  ${hero}
  ${body}
  ${whyChooseBlock()}
  ${footer(shop, unsubscribeUrl, viewUrl)}
${emailClose()}`;
}
