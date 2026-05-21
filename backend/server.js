const express = require('express');
const cors    = require('cors');
const jwt     = require('jsonwebtoken');
const MOCK    = require('./data/sounds');
const apify   = require('./services/apify');

// Catch-all: log but don't crash the server
process.on('uncaughtException', err => {
  console.error('[FATAL] Uncaught exception:', err);
});
process.on('unhandledRejection', reason => {
  console.error('[FATAL] Unhandled rejection:', reason);
});

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
}));

// Log every incoming request — so we can prove if requests are reaching the server
app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.url} from ${req.ip}`);
  next();
});

// Dead-simple route — no JWT, no Apify, just confirm we're alive
app.get('/ping', (req, res) => {
  res.type('text').send('pong');
});

app.get('/', (req, res) => {
  res.type('text').send('SoundTrend API — try /health or /ping');
});

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
  const status = apify.getCacheStatus();
  res.json({
    status:     'ok',
    dataSource: status.cached ? 'apify' : 'mock',
    sounds:     status.cached ? status.count : MOCK.length,
    apifyToken: Boolean(process.env.APIFY_TOKEN),
    cache:      status,
  });
});

app.get('/api/sounds', requireAuth, async (req, res) => {
  try {
    const live = await apify.getSounds();

    if (live && live.length > 0) {
      // Merge: live TikTok sounds + mock Instagram sounds
      const instagramMock = MOCK.filter(s => s.platform === 'instagram');
      return res.json([...live, ...instagramMock]);
    }

    // Fall back to full mock data set
    console.warn('[API] Serving mock data — no live Apify data available');
    res.json(MOCK);

  } catch (err) {
    console.error('[API] /api/sounds error:', err.message);
    res.json(MOCK);
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`SoundTrend API listening on 0.0.0.0:${PORT}`);
  console.log(`Data source: ${process.env.APIFY_TOKEN ? 'Apify (live)' : 'Mock (no APIFY_TOKEN)'}`);
});
