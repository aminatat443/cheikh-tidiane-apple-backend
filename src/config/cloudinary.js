import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const isCloudinaryConfigured = () => Boolean(process.env.CLOUDINARY_CLOUD_NAME);

/**
 * Téléverse un buffer image (depuis Multer memoryStorage) vers Cloudinary.
 * @returns {Promise<string>} l'URL sécurisée de l'image.
 */
export function uploadBuffer(buffer, folder = 'cheikh-tidiane-apple/products') {
  return new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured()) {
      return reject(new Error('Cloudinary non configuré'));
    }
    const stream = cloudinary.uploader.upload_stream(
      { folder, transformation: [{ width: 1200, crop: 'limit' }] },
      (error, result) => (error ? reject(error) : resolve(result.secure_url))
    );
    stream.end(buffer);
  });
}

export default cloudinary;
