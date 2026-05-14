require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.VI_MONGODB_URI);

const contentSchema = new mongoose.Schema(
  {
    hero: Object,
    about: Object,
    contact: Object,
    branding: Object,
    services: Array,
    products: Array,
  },
  { timestamps: true }
);

const Content = mongoose.model('Content', contentSchema);

async function seed() {
  await Content.deleteMany(); // optional reset

  await Content.create({
    hero: {
      title: "Veltrix International",
      subtitle: "Building Future Digital Products",
      description:
        "We design, develop and scale modern web & mobile solutions.",
      cta: "Get Started",
      image: "",
    },

    about: {
      title: "About Us",
      description:
        "Veltrix International is a modern tech company focused on scalable SaaS, AI tools, and enterprise solutions.",
    },

    contact: {
      email: "contact@veltrix.com",
      phone: "+91 90000 00000",
      address: "Karnataka, India",
    },

    branding: {
      mainLogo: "",
    },

    services: [
      {
        id: 1,
        icon: "💻",
        title: "Web Development",
        desc: "Modern full-stack web applications",
        logo: "",
      },
      {
        id: 2,
        icon: "📱",
        title: "Mobile Apps",
        desc: "Android & iOS apps",
        logo: "",
      },
      {
        id: 3,
        icon: "☁️",
        title: "Cloud Solutions",
        desc: "Scalable cloud infrastructure",
        logo: "",
      },
    ],

    products: [
      {
        id: 1,
        name: "Veltrix CRM",
        cat: "SaaS",
        desc: "Customer management platform",
        url: "#",
        tags: "CRM, SaaS",
        op: "Veltrix Product",
        logo: "",
      },
      {
        id: 2,
        name: "Veltrix AI",
        cat: "AI Tools",
        desc: "AI automation platform",
        url: "#",
        tags: "AI, Automation",
        op: "Veltrix Product",
        logo: "",
      },
    ],
  });

  console.log("✅ Seed data inserted");
  process.exit();
}

seed();