import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const isCloudinaryConfigured = () => Boolean(process.env.CLOUDINARY_CLOUD_NAME);

/**
 * Transformation « photo produit pro » (façon PhotoRoom) :
 *  - cadrage carré e-commerce 1200×1200 avec marge autour du produit,
 *  - fond blanc uniforme,
 *  - format & qualité automatiques (WebP/AVIF, compression).
 * Option : suppression automatique de l'arrière-plan (vrai détourage sur blanc)
 * si l'add-on « Cloudinary AI Background Removal » est activé → mettre
 * CLOUDINARY_BG_REMOVAL=true dans le .env.
 */
function productTransform() {
  const bgRemoval = process.env.CLOUDINARY_BG_REMOVAL === 'true';
  return [
    ...(bgRemoval ? [{ effect: 'background_removal' }] : []),
    { width: 1040, height: 1040, crop: 'fit' }, // ajuste avec une marge
    { width: 1200, height: 1200, crop: 'pad', background: 'white' }, // canvas blanc carré
    { quality: 'auto:good', fetch_format: 'auto' },
  ];
}

// Transformation « brute » : préserve l'image telle quelle (transparence conservée,
// ex. cachet/signature de facture) — pas de fond blanc forcé.
const rawTransform = [
  { width: 1200, crop: 'limit' },
  { quality: 'auto:good', fetch_format: 'auto' },
];

/**
 * Téléverse un buffer image (Multer memoryStorage) vers Cloudinary.
 * @param {Buffer} buffer
 * @param {{folder?:string, mode?:'product'|'raw'}} options
 *   mode 'product' (défaut) → optimisation e-commerce fond blanc ;
 *   mode 'raw' → aucune transformation de fond (cachet, logo…).
 * @returns {Promise<string>} URL sécurisée de l'image optimisée.
 */
export function uploadBuffer(buffer, { folder = 'cheikh-tidiane-apple/products', mode = 'product' } = {}) {
  return new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured()) {
      return reject(new Error('Cloudinary non configuré'));
    }
    const transformation = mode === 'raw' ? rawTransform : productTransform();
    const stream = cloudinary.uploader.upload_stream(
      { folder, transformation },
      (error, result) => (error ? reject(error) : resolve(result.secure_url))
    );
    stream.end(buffer);
  });
}

export default cloudinary;
