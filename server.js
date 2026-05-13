
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
