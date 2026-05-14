require('dotenv').config();
const express = require('express');
const path = require('path');

const connectDB = require('./config/db');

const contentRoutes = require('./routes/content.routes');
const uploadRoutes = require('./routes/upload.routes');

const authRoutes = require('./routes/auth.routes');


const app = express();
const PORT = process.env.PORT || 8002;

// DB CONNECT
connectDB();

// MIDDLEWARE
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// STATIC ADMIN
app.use(express.static(path.join(__dirname, 'public')));

// ROUTES
app.use('/api/content', contentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/auth', authRoutes);
// ADMIN PAGE
app.get('/admin', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// HEALTH CHECK
app.get('/', (_req, res) => {
  res.send('Veltrix API Running');
});

// START SERVER
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔐 Admin: http://localhost:${PORT}/admin`);
});