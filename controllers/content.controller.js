const Content = require('../models/Content');

// GET content
const getContent = async (_req, res) => {
  try {
    let data = await Content.findOne();

    if (!data) {
      data = await Content.create({
        hero: {},
        about: {},
        contact: {},
        branding: {},
        services: [],
        products: []
      });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// HERO update
const updateHero = async (req, res) => {
  try {
    const data = await Content.findOne();
    data.hero = { ...data.hero, ...req.body };
    await data.save();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ABOUT update
const updateAbout = async (req, res) => {
  try {
    const data = await Content.findOne();
    data.about = { ...data.about, ...req.body };
    await data.save();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CONTACT update
const updateContact = async (req, res) => {
  try {
    const data = await Content.findOne();
    data.contact = { ...data.contact, ...req.body };
    await data.save();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET PRODUCTS
const getProducts = async (req, res) => {
  const content = await Content.findOne();
  res.json(content?.products || []);
};

// CREATE PRODUCT
const createProduct = async (req, res) => {
  let content = await Content.findOne();

  if (!content) content = new Content();

  const newProduct = {
    id: Date.now(),
    name: "New Product",
    cat: "",
    desc: "",
    url: "",
    tags: ""
  };

  content.products.push(newProduct);
  await content.save();

  res.json({ ok: true, product: newProduct });
};

// UPDATE PRODUCT
const updateProduct = async (req, res) => {
  const id = Number(req.params.id);

  const content = await Content.findOne();
  const product = content?.products?.find(p => p.id === id);

  if (!product) return res.status(404).json({ error: 'Not found' });

  Object.assign(product, req.body);

  await content.save();

  res.json({ ok: true });
};

// DELETE PRODUCT
 const deleteProduct = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({ error: 'Invalid product id' });
    }

    const content = await Content.findOne();

    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    if (!Array.isArray(content.products)) {
      content.products = [];
    }

    // find product first (optional for cleanup like image delete)
    const product = content.products.find(p => p.id === id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // OPTIONAL: delete image from cloudinary if needed
    // if (product.logo) {
    //   await deleteFromCloudinary(product.logo);
    // }

    // remove product
    content.products = content.products.filter(p => p.id !== id);

    await content.save();

    return res.json({
      ok: true,
      message: 'Product deleted successfully'
    });

  } catch (err) {
    console.error('DELETE PRODUCT ERROR:', err);
    return res.status(500).json({ error: err.message });
  }
};


module.exports = {
  getContent,
  updateHero,
  updateAbout,
  updateContact,

  getProducts,
createProduct,
  updateProduct,
  deleteProduct
};