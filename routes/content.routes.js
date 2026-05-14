const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/content.controller');

router.get('/', ctrl.getContent);
router.put('/hero', ctrl.updateHero);
router.put('/about', ctrl.updateAbout);
router.put('/contact', ctrl.updateContact);

// ✅ THIS MUST EXIST
router.get('/products', ctrl.getProducts);
router.post('/products', ctrl.createProduct);
router.put('/products/:id', ctrl.updateProduct);
router.delete('/products/:id', ctrl.deleteProduct);

module.exports = router;