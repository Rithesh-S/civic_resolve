const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Middleware to compress images uploaded by multer
const compressUploadedImages = async (req, res, next) => {
  if (!req.files) return next();

  const allFiles = [
    ...(req.files.images || []),
    ...(req.files.proofs || []),
  ];

  try {
    for (const file of allFiles) {
      const ext = path.extname(file.originalname).toLowerCase();

      // Only compress jpg, jpeg, png
      if (!['.jpg', '.jpeg', '.png'].includes(ext)) continue;

      const compressedPath = file.path + '-compressed' + ext;

      await sharp(file.path)
        .resize({ width: 1200 }) // optional resize
        .jpeg({ quality: 80 })   // adjust quality (80 is a good balance)
        .toFile(compressedPath);

      // Replace original file with compressed one
      fs.unlinkSync(file.path);
      fs.renameSync(compressedPath, file.path);
    }

    next();
  } catch (err) {
    console.error('Error compressing images:', err);
    return res.status(500).json({ error: 'Failed to compress images' });
  }
};

module.exports = { compressUploadedImages };
