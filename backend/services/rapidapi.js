// SoundTrend — RapidAPI Integration
// API: tiktok-most-trending-and-viral-content (by Woop)
// Endpoint: /music  (trending sounds — what SoundTrend is about)
//
// IMPORTANT: Free BASIC tier is 15 requests/month. Cache aggressively (24h).
//
// Schema is not publicly documented — we log the first response in full so we
// can adjust field names without burning more quota. Mapping is defensive: we
// try multiple likely property names for each field.

const RAPIDAPI_HOST = 'tiktok-most-trending-and-viral-content.p.rapidapi.com';
const ENDPOINT_PATH = '/music';
const CACHE_TTL     = 24 * 60 * 60 * 1000; // 24 hours

// ── Defensive field access ─────────────────────────────────────────────────────

function pick(obj, ...keys) {
  for (const k of keys) {
    if (obj == null) return undefined;
    const v = obj[k];
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return undefined;
}

function toNum(v) {
  if (v == null) return 0;
  if (typeof v === 'number') return v;
  // Handle strings like "1.2M", "345K"
  const s = String(v).trim();
  const match = s.match(/^([\d.]+)\s*([KMB])?$/i);
  if (match) {
    const n = parseFloat(match[1]);
    const suffix = (match[2] || '').toUpperCase();
    if (suffix === 'K') return Math.round(n * 1_000);
    if (suffix === 'M') return Math.round(n * 1_000_000);
    if (suffix === 'B') return Math.round(n * 1_000_000_000);
    return n;
  }
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

// ── Mapping ────────────────────────────────────────────────────────────────────
//
// Real response shape (confirmed via /debug/fetch on 2026-05-21):
//   { data: { stats: [ { music: { id, musicId, title, creator, url, cover,
//     duration, reposts, musicOriginal, dailyRise, dailyRise24hours,
//     dailyRiseMonth, musicUrl, appleLink, spotifyLink, youtubeLink, ... } } ] } }
//
// Items array path: data.stats
// Per-item music object path: item.music
// "musicOriginal: true" = user-generated audio (not licensed catalog music).
// We include these only when they cross a virality threshold (see fetcher).

function mapItemToSound(item, index) {
  const m = item?.music || {};

  const musicId    = m.musicId || m.id;
  const isOriginal = Boolean(m.musicOriginal);
  const title      = m.title || 'Unknown';
  const artist     = m.creator || m.authorNickname || 'Unknown';
  const cover      = m.cover || null;
  const audio      = m.url || null;
  const duration   = toNum(m.duration);
  const reposts    = toNum(m.reposts);

  // Commercial status:
  //  - Original sounds: definitely NOT licensed catalog — flag as not-commercial.
  //  - Catalog tracks: unknown rights — flag as check.
  const commercialStatus = isOriginal ? 'not-commercial' : 'check';
  const commercialNote   = isOriginal
    ? 'User-generated original audio — not commercially licensed. Do not use in branded content.'
    : 'Commercial use status unknown — verify rights with your label rep before using in branded content.';

  // Growth signals from API
  const dailyRise    = toNum(m.dailyRise);          // current daily rise (count)
  const dailyRise24h = toNum(m.dailyRise24hours);   // last-24h delta (count)
  const dailyRiseMo  = toNum(m.dailyRiseMonth);     // 30-day delta (count)

  // Growth % = 24h delta as a percentage of total reposts.
  // Clamp to display range.
  const growthPct = reposts > 0 && dailyRise24h
    ? Math.round((dailyRise24h / reposts) * 100)
    : 0;

  // Sparkline — we don't get a per-day series from this API, but we can
  // synthesize a plausible 7-day curve from `reposts` + `dailyRise24h`.
  // Today's value (index 6) = `reposts`; older days step backward.
  // The line rises toward today if the sound is gaining, flat if not.
  let sparkline;
  if (reposts > 0) {
    const step = dailyRise24h || Math.max(1, Math.round(reposts * 0.02));
    sparkline = [];
    for (let i = 6; i >= 0; i--) {
      // i = days ago (6 = oldest, 0 = today)
      sparkline.push(Math.max(reposts - step * i, 1));
    }
  } else {
    sparkline = [1, 1, 1, 1, 1, 1, 1];
  }

  // "Newly emerging" heuristic: low total uses but actively rising.
  const isNew = reposts > 0 && reposts < 200 && dailyRise24h > reposts * 0.1;

  return {
    id:               `rapid-tt-${musicId || index}`,
    name:             title,
    artist:           artist,
    platform:         'tiktok',
    rank:             index + 1,
    useCount:         reposts,
    growthCount24h:   dailyRise24h || null,
    growthPercent48h: Math.max(-90, Math.min(growthPct, 500)),
    commercialStatus,
    commercialNote,
    isOriginal,
    isNew,
    isPromoted:       false,
    addedAt:          m.parseDate || new Date().toISOString(),
    duration:         duration || null,
    audioUrl:         audio,
    coverUrl:         cover,
    tiktokUrl:        m.musicUrl || null,
    country:          'GB',
    categories:       [],
    sparkline,
    streamingLinks: {
      apple:    m.appleLink   || null,
      spotify:  m.spotifyLink || null,
      youtube:  m.youtubeLink || null,
      deezer:   m.deezerLink  || null,
    },
    _source:    'rapidapi',
    _musicId:   musicId,
    _genre:     m.genre,
    _status:    m.musicStatus,
  };
}

// ── Cache ──────────────────────────────────────────────────────────────────────

let _cache     = null;
let _fetchedAt = null;
let _fetching  = false;
let _lastError = null;

// ── Fetch ──────────────────────────────────────────────────────────────────────

async function fetchFromRapidAPI() {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) {
    console.log('[RapidAPI] RAPIDAPI_KEY not set — skipping live fetch, mock data will be used');
    return null;
  }

  if (_fetching) {
    console.log('[RapidAPI] Fetch already in progress — skipping duplicate');
    return null;
  }

  _fetching = true;
  console.log('[RapidAPI] Fetching trending sounds (UK)...');

  try {
    // Parameters — best-guess based on common TikTok scraper conventions.
    // Adjust once we see the playground's parameter list.
    const params = new URLSearchParams({
      country: 'GB',
      period:  '7',
      limit:   '50',
    });

    const url = `https://${RAPIDAPI_HOST}${ENDPOINT_PATH}?${params}`;
    console.log('[RapidAPI] GET', url);

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key':  key,
        'x-rapidapi-host': RAPIDAPI_HOST,
      },
    });

    console.log(`[RapidAPI] Response status: ${res.status}`);

    if (!res.ok) {
      const body = await res.text();
      console.error(`[RapidAPI] Non-OK response (${res.status}):`, body.slice(0, 500));
      _lastError = `HTTP ${res.status}: ${body.slice(0, 200)}`;
      return null;
    }

    const data = await res.json();

    // Items array path (confirmed): data.stats
    const items = data?.data?.stats;

    if (!Array.isArray(items) || items.length === 0) {
      console.warn('[RapidAPI] data.stats missing/empty. Top-level keys:', Object.keys(data || {}));
      console.warn('[RapidAPI] Body preview:', JSON.stringify(data).slice(0, 1500));
      _lastError = 'data.stats not found in response';
      return null;
    }

    console.log(`[RapidAPI] Got ${items.length} raw items`);

    // Original sounds with low engagement are noise (one creator's audio).
    // Original sounds with high engagement ARE viral trends — keep those.
    // Non-originals (commercial catalog tracks) we always keep.
    const ORIGINAL_REPOST_THRESHOLD = 1000;

    const filtered = items
      .filter(it => {
        const m = it?.music;
        if (!m || !m.title || m.title.trim().length === 0) return false;
        if (m.musicOriginal) {
          return toNum(m.reposts) >= ORIGINAL_REPOST_THRESHOLD;
        }
        return true; // commercial catalog track — always include
      })
      .sort((a, b) => toNum(b.music.reposts) - toNum(a.music.reposts))
      .slice(0, 50);

    const originalCount   = filtered.filter(it => it.music.musicOriginal).length;
    const commercialCount = filtered.length - originalCount;
    console.log(`[RapidAPI] After filtering: ${commercialCount} commercial + ${originalCount} viral originals = ${filtered.length} total`);

    const sounds = filtered.map(mapItemToSound);

    _cache     = sounds;
    _fetchedAt = Date.now();
    _lastError = null;
    console.log(`[RapidAPI] Cached ${sounds.length} sounds`);
    return sounds;

  } catch (err) {
    console.error('[RapidAPI] Fetch failed:', err.message, err.stack);
    _lastError = err.message;
    return null;

  } finally {
    _fetching = false;
  }
}

// ── Public API ─────────────────────────────────────────────────────────────────

async function getSounds() {
  const stale = !_cache || !_fetchedAt || (Date.now() - _fetchedAt) > CACHE_TTL;

  if (stale) {
    // Fire-and-forget — never block the API response.
    // Note: with only 15 requests/month on free tier, ONE call per 24h hits
    // ~30/month — we'll need PRO ($10/mo) for production, or extend TTL further.
    fetchFromRapidAPI().catch(err => console.error('[RapidAPI] Background refresh failed:', err));
  }

  return _cache; // null on cold start — caller falls back to mock data
}

function getCacheStatus() {
  return {
    cached:    Boolean(_cache),
    count:     _cache?.length || 0,
    fetchedAt: _fetchedAt ? new Date(_fetchedAt).toISOString() : null,
    fetching:  _fetching,
    lastError: _lastError,
  };
}

// Synchronous refresh — awaits the fetch, returns the result. For diagnostics.
async function refresh() {
  // Clear cache so we force a real fetch even if we just warmed it
  _cache = null;
  _fetchedAt = null;
  return await fetchFromRapidAPI();
}

module.exports = { getSounds, getCacheStatus, refresh };
