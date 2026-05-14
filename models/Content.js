const mongoose = require('mongoose');

const ContentSchema = new mongoose.Schema(
  {
    hero: Object,
    about: Object,
    contact: Object,
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
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Content', ContentSchema);
