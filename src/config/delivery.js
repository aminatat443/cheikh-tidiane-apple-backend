/**
 * Zones de livraison (région de Dakar) et tarifs en FCFA (XOF, entiers).
 * ⚠️ La boutique est située à **Keur Massar** : les tarifs augmentent avec la
 * distance depuis Keur Massar (zones triées du plus proche au plus lointain).
 * Source de vérité côté serveur : le frais est TOUJOURS recalculé ici,
 * jamais celui envoyé par le client (cf. CLAUDE.md §7).
 */
export const DELIVERY_ZONES = [
  { key: 'keur-massar-malika', label: 'Keur Massar / Malika', fee: 1000 },
  { key: 'thiaroye-yeumbeul', label: 'Thiaroye / Yeumbeul', fee: 1000 },
  { key: 'pikine-guediawaye', label: 'Pikine / Guédiawaye', fee: 1500 },
  { key: 'rufisque-bargny', label: 'Rufisque / Bargny', fee: 2000 },
  { key: 'parcelles-camberene', label: 'Parcelles Assainies / Cambérène', fee: 2000 },
  { key: 'diamniadio-rionord', label: 'Diamniadio / Rufisque Nord', fee: 2500 },
  { key: 'grand-yoff-patte-oie', label: "Grand Yoff / Patte d'Oie", fee: 2500 },
  { key: 'grand-dakar-hlm', label: 'Grand Dakar / HLM / Liberté', fee: 2500 },
  { key: 'sicap-mermoz-sacrecoeur', label: 'Sicap / Mermoz / Sacré-Cœur', fee: 3000 },
  { key: 'medina-fann-pointe', label: 'Médina / Fann / Point E', fee: 3000 },
  { key: 'dakar-plateau', label: 'Dakar-Plateau / Centre-ville', fee: 3500 },
  { key: 'ouakam-mamelles', label: 'Ouakam / Mamelles', fee: 3500 },
  { key: 'almadies-ngor-yoff', label: 'Almadies / Ngor / Yoff', fee: 3500 },
  { key: 'hors-dakar', label: 'Hors région de Dakar', fee: 5000 },
];

/** Frais de livraison d'une zone (null si la clé est inconnue). */
export function getZoneFee(key) {
  const zone = DELIVERY_ZONES.find((z) => z.key === key);
  return zone ? zone.fee : null;
}

/** Libellé lisible d'une zone (chaîne vide si inconnue). */
export function getZoneLabel(key) {
  const zone = DELIVERY_ZONES.find((z) => z.key === key);
  return zone ? zone.label : '';
}
