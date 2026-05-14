const express = require('express');
const router = express.Router();
const Content = require('../models/Content'); // ✅ FIX: missing in your code
const upload = require('../config/upload');

// optional (only if you really use cloudinary delete)
const { deleteFromCloudinary } = require('../config/cloudinary');


// =========================
// MAIN LOGO UPLOAD
// =========================
router.post('/main-logo', upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // works for cloudinary multer
    const url = req.file.path || req.file.url;

    let content = await Content.findOne();

    if (!content) {
      content = new Content();
    }

    if (!content.branding) {
      content.branding = {};
    }

    content.branding.mainLogo = url;

    await content.save();

    return res.json({
      ok: true,
      url
    });

  } catch (err) {
    console.error('MAIN LOGO UPLOAD ERROR:', err);
    return res.status(500).json({ error: err.message });
  }
});


// =========================
// PRODUCT LOGO UPLOAD
// =========================
router.post('/product/:id', upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const url = req.file.path || req.file.url;
    const id = Number(req.params.id);

    let content = await Content.findOne();

    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    const product = content.products?.find(p => p.id === id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    product.logo = url;

    await content.save();

    return res.json({
      ok: true,
      url
    });

  } catch (err) {
    console.error('PRODUCT UPLOAD ERROR:', err);
    return res.status(500).json({ error: err.message });
  }
});


// =========================
// DELETE MAIN LOGO
// =========================
router.delete('/main-logo', async (req, res) => {
  try {
    const { url } = req.body;

    if (url) {
      await deleteFromCloudinary(url);
    }

    const content = await Content.findOne();

    if (content?.branding) {
      content.branding.mainLogo = null;
      await content.save();
    }

    return res.json({ ok: true });

  } catch (err) {
    console.error('DELETE MAIN LOGO ERROR:', err);
    return res.status(500).json({ error: err.message });
  }
});


// =========================
// DELETE PRODUCT LOGO
// =========================
router.delete('/product/:id', async (req, res) => {
  try {
    const { url } = req.body;
    const id = Number(req.params.id);

    if (url) {
      await deleteFromCloudinary(url);
    }

    const content = await Content.findOne();

    const product = content?.products?.find(p => p.id === id);

    if (product) {
      product.logo = null;
      await content.save();
    }

    return res.json({ ok: true });

  } catch (err) {
    console.error('DELETE PRODUCT LOGO ERROR:', err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;