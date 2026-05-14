const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ✅ UPLOAD HELPED BY MULTER (optional export)
const getPublicId = (url) => {
  try {
    if (!url) return null;

    const parts = url.split('/');
    const file = parts[parts.length - 1];
    const publicId = 'veltrix/' + file.split('.')[0];

    return publicId;
  } catch (err) {
    return null;
  }
};

// ✅ DELETE FUNCTION (THIS IS WHAT YOU WERE MISSING)
const deleteFromCloudinary = async (url) => {
  try {
    if (!url) return;

    const publicId = getPublicId(url);
    if (!publicId) return;

    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.warn('Cloudinary delete failed:', err.message);
  }
};

module.exports = {
  cloudinary,
  deleteFromCloudinary
};

module.exports = cloudinary;