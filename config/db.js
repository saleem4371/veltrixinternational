const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.VI_MONGODB_URI) {
      throw new Error('MONGODB_URI missing');
    }

    await mongoose.connect(process.env.VI_MONGODB_URI, {
      serverSelectionTimeoutMS: 30000
    });

    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ MongoDB Error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;