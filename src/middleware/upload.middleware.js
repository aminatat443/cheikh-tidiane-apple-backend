import multer from 'multer';

/**
 * Upload d'images en mémoire (Multer memoryStorage) : les fichiers sont ensuite
 * poussés vers Cloudinary via `uploadBuffer` (voir config/cloudinary.js).
 */
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo
  fileFilter: (req, file, cb) => {
    if (/^image\/(jpeg|png|webp|jpg)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Format d’image non supporté'));
  },
});
