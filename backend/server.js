const express = require('express');
const cors    = require('cors');
const jwt     = require('jsonwebtoken');
const SOUNDS  = require('./data/sounds');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
}));

// ── JWT auth middleware ────────────────────────────────────────────────────────
function requireAuth(req, res, next) {
  const header = req.headers['authorization'] || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('JWT_SECRET env var is not set');
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  try {
    req.user = jwt.verify(token, secret);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ── Routes ────────────────────────────────────────────────────────────────────

app.get('/health', (req, res) => {
  res.json({ status: 'ok', sounds: SOUNDS.length });
});

app.get('/api/sounds', requireAuth, (req, res) => {
  res.json(SOUNDS);
});

app.listen(PORT, () => {
  console.log(`SoundTrend API running on port ${PORT}`);
});
