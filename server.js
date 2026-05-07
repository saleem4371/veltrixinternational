'use strict';
require('dotenv').config();

const express    = require('express');
const bcrypt     = require('bcryptjs');
const jwt        = require('jsonwebtoken');
const multer     = require('multer');
const nodemailer = require('nodemailer');
const path       = require('path');
const fs         = require('fs');
const crypto     = require('crypto');

const app  = express();
const PORT = process.env.PORT || 8002;
const JWT_SECRET = process.env.JWT_SECRET || 'veltrix-dev-secret-change-me';

// ─────────────────────────────────────────────
// PATHS
// ─────────────────────────────────────────────
const DATA_PATH   = path.join(__dirname, 'data', 'content.json');
const UPLOAD_DIR  = path.join(__dirname, 'public', 'uploads');
const PUBLIC_DIR  = path.join(__dirname, 'public');

[path.join(__dirname, 'data'), UPLOAD_DIR].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// ─────────────────────────────────────────────
// CONTENT HELPERS
// ─────────────────────────────────────────────
function readContent() {
  try { return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8')); }
  catch (e) {
    console.error('Error reading content.json:', e.message);
    return {};
  }
}

function writeContent(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
}

// ─────────────────────────────────────────────
// MULTER — IMAGE UPLOAD
// ─────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase();
    const name = crypto.randomBytes(12).toString('hex') + ext;
    cb(null, name);
  }
});

const fileFilter = (_req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error('Only image files are allowed (jpg, png, webp, svg, gif)'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// ─────────────────────────────────────────────
// NODEMAILER
// ─────────────────────────────────────────────
function createTransport() {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST || 'smtp.gmail.com',
    port:   parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

// ─────────────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(express.static(PUBLIC_DIR));

// Simple rate limiter for auth endpoint (no extra deps)
const loginAttempts = new Map();
function authRateLimit(req, res, next) {
  const ip  = req.ip || req.socket.remoteAddress;
  const now = Date.now();
  const rec = loginAttempts.get(ip) || { count: 0, reset: now + 60000 };
  if (now > rec.reset) { rec.count = 0; rec.reset = now + 60000; }
  rec.count++;
  loginAttempts.set(ip, rec);
  if (rec.count > 10) return res.status(429).json({ error: 'Too many attempts. Try again in a minute.' });
  next();
}

// JWT auth middleware
function requireAuth(req, res, next) {
  const auth  = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token. Please log in again.' });
  }
}

// ─────────────────────────────────────────────
// AUTH ROUTES
// ─────────────────────────────────────────────

// POST /api/auth/login
app.post('/api/auth/login', authRateLimit, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'Password is required' });

    const storedHash = process.env.ADMIN_PASSWORD_HASH;
    if (!storedHash) {
      // Dev fallback — warn in console
      console.warn('\x1b[33m⚠  ADMIN_PASSWORD_HASH not set in .env — using default dev password.\x1b[0m');
      if (password !== 'Veltrix@2025') return res.status(401).json({ error: 'Invalid password' });
    } else {
      const ok = await bcrypt.compare(password, storedHash);
      if (!ok) return res.status(401).json({ error: 'Invalid password' });
    }

    const token = jwt.sign({ admin: true, iat: Math.floor(Date.now() / 1000) }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, expiresIn: 86400 });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/verify  — check if token is still valid
app.post('/api/auth/verify', requireAuth, (_req, res) => {
  res.json({ valid: true });
});

// ─────────────────────────────────────────────
// CONTENT ROUTES
// ─────────────────────────────────────────────

// GET /api/content — public, returns all content
app.get('/api/content', (_req, res) => {
  res.json(readContent());
});

// PUT /api/content/hero
app.put('/api/content/hero', requireAuth, (req, res) => {
  const data = readContent();
  data.hero = { ...data.hero, ...req.body };
  writeContent(data);
  res.json({ ok: true });
});

// PUT /api/content/about
app.put('/api/content/about', requireAuth, (req, res) => {
  const data = readContent();
  data.about = { ...data.about, ...req.body };
  writeContent(data);
  res.json({ ok: true });
});

// PUT /api/content/contact
app.put('/api/content/contact', requireAuth, (req, res) => {
  const data = readContent();
  data.contact = { ...data.contact, ...req.body };
  writeContent(data);
  res.json({ ok: true });
});

// ── Services ──────────────────────────────────

// GET /api/content/services
app.get('/api/content/services', (_req, res) => {
  res.json(readContent().services || []);
});

// PUT /api/content/services/:id
app.put('/api/content/services/:id', requireAuth, (req, res) => {
  const data = readContent();
  const id   = parseInt(req.params.id);
  const idx  = data.services.findIndex(s => s.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Service not found' });
  data.services[idx] = { ...data.services[idx], ...req.body };
  writeContent(data);
  res.json({ ok: true, service: data.services[idx] });
});

// POST /api/content/services
app.post('/api/content/services', requireAuth, (req, res) => {
  const data = readContent();
  const newService = {
    id:   Date.now(),
    icon: '✨',
    title:'New Service',
    desc: 'Describe this service...',
    logo: null,
    ...req.body
  };
  data.services.push(newService);
  writeContent(data);
  res.status(201).json({ ok: true, service: newService });
});

// DELETE /api/content/services/:id
app.delete('/api/content/services/:id', requireAuth, (req, res) => {
  const data = readContent();
  const id   = parseInt(req.params.id);
  const svc  = data.services.find(s => s.id === id);
  if (!svc) return res.status(404).json({ error: 'Service not found' });
  // Clean up logo file
  if (svc.logo) deleteUploadedFile(svc.logo);
  data.services = data.services.filter(s => s.id !== id);
  writeContent(data);
  res.json({ ok: true });
});

// ── Ventures / Products ───────────────────────

// PUT /api/content/products/:id
app.put('/api/content/products/:id', requireAuth, (req, res) => {
  const data = readContent();
  const id   = parseInt(req.params.id);
  const idx  = data.products.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Venture not found' });
  data.products[idx] = { ...data.products[idx], ...req.body };
  writeContent(data);
  res.json({ ok: true, product: data.products[idx] });
});

// POST /api/content/products
app.post('/api/content/products', requireAuth, (req, res) => {
  const data = readContent();
  const newProduct = {
    id:   Date.now(),
    name: 'New Venture',
    cat:  'Category',
    desc: 'Describe this venture...',
    url:  '#',
    tags: 'Tag1, Tag2',
    op:   'A Veltrix International Product',
    logo: null,
    ...req.body
  };
  data.products.push(newProduct);
  writeContent(data);
  res.status(201).json({ ok: true, product: newProduct });
});

// DELETE /api/content/products/:id
app.delete('/api/content/products/:id', requireAuth, (req, res) => {
  const data = readContent();
  const id   = parseInt(req.params.id);
  const prod = data.products.find(p => p.id === id);
  if (!prod) return res.status(404).json({ error: 'Venture not found' });
  if (prod.logo) deleteUploadedFile(prod.logo);
  data.products = data.products.filter(p => p.id !== id);
  writeContent(data);
  res.json({ ok: true });
});

// ─────────────────────────────────────────────
// UPLOAD ROUTES
// ─────────────────────────────────────────────

function deleteUploadedFile(urlPath) {
  try {
    const filename = path.basename(urlPath);
    const fullPath = path.join(UPLOAD_DIR, filename);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
  } catch (e) { console.warn('Could not delete file:', e.message); }
}

// POST /api/upload/main-logo
app.post('/api/upload/main-logo', requireAuth, upload.single('logo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const data = readContent();
  // Delete old logo
  if (data.branding?.mainLogo) deleteUploadedFile(data.branding.mainLogo);
  if (!data.branding) data.branding = {};
  data.branding.mainLogo = '/uploads/' + req.file.filename;
  writeContent(data);
  res.json({ ok: true, url: data.branding.mainLogo });
});

// DELETE /api/upload/main-logo
app.delete('/api/upload/main-logo', requireAuth, (req, res) => {
  const data = readContent();
  if (data.branding?.mainLogo) {
    deleteUploadedFile(data.branding.mainLogo);
    data.branding.mainLogo = null;
    writeContent(data);
  }
  res.json({ ok: true });
});

// POST /api/upload/product/:id
app.post('/api/upload/product/:id', requireAuth, upload.single('logo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const data = readContent();
  const id   = parseInt(req.params.id);
  const prod = data.products.find(p => p.id === id);
  if (!prod) return res.status(404).json({ error: 'Venture not found' });
  if (prod.logo) deleteUploadedFile(prod.logo);
  prod.logo = '/uploads/' + req.file.filename;
  writeContent(data);
  res.json({ ok: true, url: prod.logo });
});

// DELETE /api/upload/product/:id
app.delete('/api/upload/product/:id', requireAuth, (req, res) => {
  const data = readContent();
  const id   = parseInt(req.params.id);
  const prod = data.products.find(p => p.id === id);
  if (!prod) return res.status(404).json({ error: 'Venture not found' });
  if (prod.logo) { deleteUploadedFile(prod.logo); prod.logo = null; }
  writeContent(data);
  res.json({ ok: true });
});

// POST /api/upload/service/:id
app.post('/api/upload/service/:id', requireAuth, upload.single('logo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const data = readContent();
  const id   = parseInt(req.params.id);
  const svc  = data.services.find(s => s.id === id);
  if (!svc) return res.status(404).json({ error: 'Service not found' });
  if (svc.logo) deleteUploadedFile(svc.logo);
  svc.logo = '/uploads/' + req.file.filename;
  writeContent(data);
  res.json({ ok: true, url: svc.logo });
});

// DELETE /api/upload/service/:id
app.delete('/api/upload/service/:id', requireAuth, (req, res) => {
  const data = readContent();
  const id   = parseInt(req.params.id);
  const svc  = data.services.find(s => s.id === id);
  if (!svc) return res.status(404).json({ error: 'Service not found' });
  if (svc.logo) { deleteUploadedFile(svc.logo); svc.logo = null; }
  writeContent(data);
  res.json({ ok: true });
});

// ─────────────────────────────────────────────
// CONTACT FORM
// ─────────────────────────────────────────────
app.post('/api/contact', async (req, res) => {
  const { firstName, lastName, email, subject, message } = req.body;
  if (!firstName || !email || !message) {
    return res.status(400).json({ error: 'First name, email, and message are required.' });
  }

  // Send email if SMTP is configured
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = createTransport();
      await transporter.sendMail({
        from:    process.env.CONTACT_FROM || process.env.SMTP_USER,
        to:      process.env.CONTACT_RECIPIENT || process.env.SMTP_USER,
        replyTo: email,
        subject: `[Veltrix Contact] ${subject || 'General Inquiry'} — ${firstName} ${lastName || ''}`.trim(),
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
            <h2 style="color:#00D2FF;border-bottom:2px solid #00D2FF;padding-bottom:8px;">New Contact Form Submission</h2>
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 0;color:#666;width:120px;"><strong>From</strong></td><td>${firstName} ${lastName || ''}</td></tr>
              <tr><td style="padding:8px 0;color:#666;"><strong>Email</strong></td><td><a href="mailto:${email}">${email}</a></td></tr>
              <tr><td style="padding:8px 0;color:#666;"><strong>Subject</strong></td><td>${subject || 'General Inquiry'}</td></tr>
            </table>
            <h3 style="margin-top:20px;color:#333;">Message</h3>
            <div style="background:#f5f5f5;padding:16px;border-radius:8px;line-height:1.6;">
              ${String(message).replace(/\n/g,'<br>')}
            </div>
            <p style="font-size:12px;color:#999;margin-top:20px;">
              Sent via veltrix.ae contact form
            </p>
          </div>`
      });
    } catch (err) {
      console.error('Email send error:', err.message);
      // Still return 200 — don't break UX if email fails
    }
  } else {
    console.log('\x1b[33m⚠  SMTP not configured — contact form submission logged only.\x1b[0m');
    console.log({ firstName, lastName, email, subject, message });
  }

  res.json({ ok: true, message: 'Message received. We\'ll be in touch soon!' });
});

// ─────────────────────────────────────────────
// SPA FALLBACK — admin.html
// ─────────────────────────────────────────────
app.get('/admin', (_req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'admin.html'));
});

app.get('/admin.html', (_req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'admin.html'));
});

// ─────────────────────────────────────────────
// ERROR HANDLER
// ─────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.message);
  if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'File too large. Max 5MB.' });
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// ─────────────────────────────────────────────
// START
// ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('\x1b[36m');
  console.log('  ╔══════════════════════════════════════╗');
  console.log('  ║   VELTRIX INTERNATIONAL — Phase 2    ║');
  console.log(`  ║   Server running on port ${PORT}         ║`);
  console.log(`  ║   http://localhost:${PORT}               ║`);
  console.log(`  ║   Admin: http://localhost:${PORT}/admin   ║`);
  console.log('  ╚══════════════════════════════════════╝');
  console.log('\x1b[0m');
  if (!process.env.ADMIN_PASSWORD_HASH) {
    console.warn('\x1b[33m  ⚠  ADMIN_PASSWORD_HASH not set — using default dev password (Veltrix@2025)\x1b[0m');
    console.warn('\x1b[33m  ⚠  Set ADMIN_PASSWORD_HASH in .env before going live!\x1b[0m\n');
  }
});
