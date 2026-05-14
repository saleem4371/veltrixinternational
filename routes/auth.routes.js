const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Rate limit (simple in-memory)
const loginAttempts = new Map();

function authRateLimit(req, res, next) {
  const ip = req.ip || req.socket.remoteAddress;
  const now = Date.now();

  const rec = loginAttempts.get(ip) || {
    count: 0,
    reset: now + 60000
  };

  if (now > rec.reset) {
    rec.count = 0;
    rec.reset = now + 60000;
  }

  rec.count++;
  loginAttempts.set(ip, rec);

  if (rec.count > 10) {
    return res.status(429).json({
      error: 'Too many attempts. Try again in a minute.'
    });
  }

  next();
}

// LOGIN
router.post('/login', authRateLimit, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const storedHash = process.env.ADMIN_PASSWORD_HASH;

    // fallback dev password
    if (!storedHash) {
      if (password !== 'Veltrix@2025') {
        return res.status(401).json({ error: 'Invalid password' });
      }
    } else {
      const ok = await bcrypt.compare(password, storedHash);
      if (!ok) {
        return res.status(401).json({ error: 'Invalid password' });
      }
    }

    const token = jwt.sign(
      { admin: true },
      process.env.JWT_SECRET || 'veltrix-dev-secret',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      expiresIn: 86400
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// VERIFY TOKEN
router.post('/verify', (req, res) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET || 'veltrix-dev-secret');
    res.json({ valid: true });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;