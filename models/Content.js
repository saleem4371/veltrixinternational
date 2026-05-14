const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  hero: Object,
  about: Object,
  contact: Object,
  branding: Object,
  services: Array,
  products: Array,
}, {
  timestamps: true
});

module.exports = mongoose.model('Content', contentSchema);