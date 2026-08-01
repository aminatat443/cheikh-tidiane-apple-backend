import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';

const LOGO_PATH = path.resolve('src/assets/logo.png');

const C = {
  ink: '#111827',
  muted: '#6B7280',
  accent: '#0A84FF',
  line: '#E5E7EB',
  surface: '#F9FAFB',
  white: '#FFFFFF',
  faint: '#9CA3AF',
};

const PAYMENT_LABELS = {
  wave: 'Wave',
  orange_money: 'Orange Money',
  card: 'Carte bancaire',
  lebalma: 'Lebalma',
};

/** Formate un entier FCFA avec séparateur d'espace (ex : 150000 → "150 000 FCFA"). */
const fmt = (n) => `${String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} FCFA`;

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

/** Récupère une image distante (cachet/signature) sous forme de Buffer, ou null. */
export async function fetchImageBuffer(url) {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  }
}

/**
 * Construit la facture PDF et la diffuse dans `stream` (res HTTP).
 * @param {object} p - { order, shop, stampBuffer }
 * @param {Writable} stream - flux de sortie (réponse Express)
 */
export function buildInvoicePdf({ order, shop, stampBuffer }, stream) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  doc.pipe(stream);

  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  const width = right - left;
  const shopName = shop.name || 'Cheikh Tidiane Apple';

  // ---------- En-tête ----------
  try {
    if (fs.existsSync(LOGO_PATH)) doc.image(LOGO_PATH, left, 45, { width: 68 });
  } catch {
    /* logo optionnel */
  }
  const infoX = left + 82;
  doc.fillColor(C.ink).font('Helvetica-Bold').fontSize(15).text(shopName, infoX, 48);
  doc.font('Helvetica').fontSize(9).fillColor(C.muted);
  let iy = 67;
  if (shop.address) { doc.text(shop.address, infoX, iy); iy += 12; }
  if (shop.phone) { doc.text(`Tél : ${shop.phone}`, infoX, iy); iy += 12; }
  if (shop.email) { doc.text(shop.email, infoX, iy); iy += 12; }

  doc.font('Helvetica-Bold').fontSize(26).fillColor(C.accent).text('FACTURE', right - 220, 46, { width: 220, align: 'right' });
  doc.font('Helvetica-Bold').fontSize(11).fillColor(C.ink).text(`N° ${order.reference}`, right - 220, 82, { width: 220, align: 'right' });
  doc.font('Helvetica').fontSize(9).fillColor(C.muted).text(`Date : ${fmtDate(order.createdAt)}`, right - 220, 97, { width: 220, align: 'right' });

  const sepY = Math.max(iy, 114) + 6;
  doc.moveTo(left, sepY).lineTo(right, sepY).lineWidth(2).strokeColor(C.ink).stroke();

  // ---------- Vendeur / Client ----------
  const colW = (width - 20) / 2;
  let by = sepY + 16;
  doc.font('Helvetica-Bold').fontSize(8).fillColor(C.muted).text('VENDEUR', left, by);
  doc.text('FACTURÉ À', left + colW + 20, by);
  by += 13;
  doc.font('Helvetica-Bold').fontSize(11).fillColor(C.ink).text(shopName, left, by, { width: colW });
  doc.text(order.shippingName || order.user?.name || 'Client', left + colW + 20, by, { width: colW });

  doc.font('Helvetica').fontSize(9).fillColor(C.muted);
  let vy = by + 15;
  if (shop.ninea) { doc.text(`NINEA : ${shop.ninea}`, left, vy, { width: colW }); vy += 12; }
  if (shop.rccm) { doc.text(`RCCM : ${shop.rccm}`, left, vy, { width: colW }); vy += 12; }
  let cy = by + 15;
  if (order.user?.email) { doc.text(order.user.email, left + colW + 20, cy, { width: colW }); cy += 12; }
  const phone = order.shippingPhone || order.user?.phone;
  if (phone) { doc.text(`Tél : ${phone}`, left + colW + 20, cy, { width: colW }); cy += 12; }
  const addr = [order.shippingAddress, order.shippingCity].filter(Boolean).join(', ');
  if (addr) { doc.text(addr, left + colW + 20, cy, { width: colW }); cy += 12; }

  // ---------- Tableau des articles ----------
  let ty = Math.max(vy, cy) + 16;
  const cols = {
    desc: { x: left, w: 248 },
    qty: { x: left + 252, w: 46 },
    pu: { x: left + 298, w: 100 },
    tot: { x: left + 398, w: width - 398 },
  };
  const header = () => {
    doc.rect(left, ty, width, 20).fill(C.surface);
    doc.fillColor(C.muted).font('Helvetica-Bold').fontSize(8);
    doc.text('DÉSIGNATION', cols.desc.x + 6, ty + 6, { width: cols.desc.w });
    doc.text('QTÉ', cols.qty.x, ty + 6, { width: cols.qty.w, align: 'center' });
    doc.text('P.U.', cols.pu.x, ty + 6, { width: cols.pu.w - 6, align: 'right' });
    doc.text('TOTAL', cols.tot.x, ty + 6, { width: cols.tot.w - 6, align: 'right' });
    ty += 20;
  };
  header();

  doc.font('Helvetica').fontSize(9.5);
  for (const it of order.items || []) {
    const label =
      it.productName +
      (it.storage || it.color ? ` — ${[it.storage, it.color].filter(Boolean).join(' · ')}` : '');
    const h = Math.max(18, doc.heightOfString(label, { width: cols.desc.w - 6 }) + 8);
    if (ty + h > doc.page.height - 170) {
      doc.addPage();
      ty = 50;
      header();
      doc.font('Helvetica').fontSize(9.5);
    }
    doc.fillColor(C.ink).text(label, cols.desc.x + 6, ty + 5, { width: cols.desc.w - 6 });
    doc.text(String(it.quantity), cols.qty.x, ty + 5, { width: cols.qty.w, align: 'center' });
    doc.text(fmt(it.unitPrice), cols.pu.x, ty + 5, { width: cols.pu.w - 6, align: 'right' });
    doc.font('Helvetica-Bold').text(fmt(it.unitPrice * it.quantity), cols.tot.x, ty + 5, { width: cols.tot.w - 6, align: 'right' });
    doc.font('Helvetica');
    ty += h;
    doc.moveTo(left, ty).lineTo(right, ty).lineWidth(0.5).strokeColor(C.line).stroke();
  }

  // ---------- Totaux ----------
  ty += 14;
  const totX = right - 230;
  const totW = 230;
  const rowT = (label, val) => {
    doc.font('Helvetica').fontSize(9.5).fillColor(C.muted);
    doc.text(label, totX, ty, { width: 120 });
    doc.text(val, totX + 120, ty, { width: totW - 120, align: 'right' });
    ty += 15;
  };
  rowT('Sous-total', fmt(order.subtotal));
  rowT('Livraison', fmt(order.shippingFee));
  doc.rect(totX, ty, totW, 26).fill(C.ink);
  doc.fillColor(C.white).font('Helvetica-Bold').fontSize(12);
  doc.text('TOTAL', totX + 10, ty + 7, { width: 100 });
  doc.text(fmt(order.total), totX + 10, ty + 7, { width: totW - 20, align: 'right' });
  ty += 26;

  ty += 16;
  const payLabel = PAYMENT_LABELS[order.paymentMethod] || '—';
  doc
    .font('Helvetica')
    .fontSize(9)
    .fillColor(C.muted)
    .text(`Mode de paiement : ${payLabel}${order.isLebalma ? '   (Financement Lebalma)' : ''}`, left, ty, { width });

  // ---------- Pied : mentions + cachet/signature ----------
  const footY = doc.page.height - 135;
  doc
    .font('Helvetica')
    .fontSize(8)
    .fillColor(C.muted)
    .text(
      `Merci de votre confiance. Facture générée par ${shopName}. Montants exprimés en FCFA (XOF).`,
      left,
      footY,
      { width: 240 }
    );

  const stampX = right - 170;
  const stampW = 170;
  let stampDrawn = false;
  if (stampBuffer) {
    try {
      doc.image(stampBuffer, stampX + 25, footY - 12, { fit: [120, 68], align: 'center' });
      stampDrawn = true;
    } catch {
      stampDrawn = false;
    }
  }
  if (!stampDrawn) {
    doc.rect(stampX + 25, footY - 12, 120, 60).lineWidth(0.5).dash(3, { space: 2 }).strokeColor(C.line).stroke().undash();
  }
  doc
    .fillColor(C.muted)
    .font('Helvetica-Bold')
    .fontSize(8)
    .text('CACHET & SIGNATURE', stampX, footY + 58, { width: stampW, align: 'center' });

  doc.end();
}
