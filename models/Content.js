const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema(
  {
    hero: {
      title: { type: String, default: '' },
      subtitle: { type: String, default: '' },
      description: { type: String, default: '' },
      cta: { type: String, default: '' },
      image: { type: String, default: '' },
    },

    about: {
      title: { type: String, default: '' },
      description: { type: String, default: '' },
    },

    contact: {
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      address: { type: String, default: '' },
    },

    branding: {
      mainLogo: { type: String, default: '' },
      favicon: { type: String, default: '' },
    },

    services: [
      {
        id: { type: Number },
        icon: { type: String, default: '' },
        title: { type: String, default: '' },
        desc: { type: String, default: '' },
        logo: { type: String, default: '' },
      },
    ],

    products: [
      {
        id: { type: Number },
        name: { type: String, default: '' },
        cat: { type: String, default: '' },
        desc: { type: String, default: '' },
        url: { type: String, default: '' },
        tags: { type: String, default: '' },
        op: { type: String, default: '' },
        logo: { type: String, default: '' },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Content', contentSchema);