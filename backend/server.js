const express = require('express');
const cors    = require('cors');
const jwt     = require('jsonwebtoken');
const MOCK    = require('./data/sounds');
const rapid   = require('./services/rapidapi');

// Catch-all: log but don't crash the server
process.on('uncaughtException', err => {
  console.error('[FATAL] Uncaught exception:', err);
});
process.on('unhandledRejection', reason => {
  console.error('[FATAL] Unhandled rejection:', reason);
});

const app  = express();
const PORT = process.env.PORT || 3001;

// ── CORS ──────────────────────────────────────────────────────────────────────
// FRONTEND_URL env var accepts a single origin or a comma-separated list.
// If unset, defaults to '*' (open) — fine for development, lock down for prod.
// Vercel preview deploys (*.vercel.app) are auto-allowed when FRONTEND_URL is set,
// so PR previews still work without manually adding each one.
const allowList = (process.env.FRONTEND_URL || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, cb) {
    // No FRONTEND_URL set → open CORS (dev mode)
    if (allowList.length === 0) return cb(null, true);
    // Same-origin / curl / server-to-server requests have no Origin header
    if (!origin) return cb(null, true);
    // Explicit allow-list match
    if (allowList.includes(origin)) return cb(null, true);
    // Allow any Vercel preview URL (auto-deploys per branch)
    if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) return cb(null, true);
    console.warn(`[CORS] Rejected origin: ${origin}`);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
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

// TEMPORARY debug endpoint — triggers a live RapidAPI fetch and returns the
// result. No auth. Remove once response schema is confirmed.
app.get('/debug/fetch', async (req, res) => {
  console.log('[DEBUG] Manual RapidAPI fetch triggered via /debug/fetch');
  try {
    const result = await rapid.refresh();
    res.json({
      ok:          true,
      gotResult:   Array.isArray(result),
      count:       Array.isArray(result) ? result.length : 0,
      status:      rapid.getCacheStatus(),
      firstTwo:    Array.isArray(result) ? result.slice(0, 2) : null,
    });
  } catch (err) {
    console.error('[DEBUG] /debug/fetch error:', err);
    res.status(500).json({ ok: false, error: err.message, stack: err.stack });
  }
});

app.get('/health', (req, res) => {
  const status = rapid.getCacheStatus();
  res.json({
    status:       'ok',
    dataSource:   status.cached ? 'rapidapi' : 'mock',
    sounds:       status.cached ? status.count : MOCK.length,
    rapidApiKey:  Boolean(process.env.RAPIDAPI_KEY),
    cache:        status,
  });
});

app.get('/api/sounds', requireAuth, async (req, res) => {
  try {
    const live = await rapid.getSounds();

    if (live && live.length > 0) {
      // Merge: live TikTok sounds + mock Instagram sounds
      const instagramMock = MOCK.filter(s => s.platform === 'instagram');
      return res.json([...live, ...instagramMock]);
    }

    // Fall back to full mock data set
    console.warn('[API] Serving mock data — no live RapidAPI data available');
    res.json(MOCK);

  } catch (err) {
    console.error('[API] /api/sounds error:', err.message);
    res.json(MOCK);
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`SoundTrend API listening on 0.0.0.0:${PORT}`);
  console.log(`Data source: ${process.env.RAPIDAPI_KEY ? 'RapidAPI (live)' : 'Mock (no RAPIDAPI_KEY)'}`);
});
