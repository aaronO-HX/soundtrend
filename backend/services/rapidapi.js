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

function mapItemToSound(item, index) {
  // Try every reasonable property name for each field
  const musicId  = pick(item, 'music_id', 'musicId', 'id', 'sound_id', 'soundId');
  const title    = pick(item, 'title', 'music_title', 'name', 'music_name', 'track_title') || 'Unknown';
  const artist   = pick(item, 'author', 'author_name', 'artist', 'musician', 'creator', 'music_author') || 'Unknown';
  const cover    = pick(item, 'cover', 'cover_url', 'coverUrl', 'image', 'thumbnail', 'avatar', 'album_cover');
  const audio    = pick(item, 'play_url', 'playUrl', 'audio_url', 'audioUrl', 'url', 'music_url');
  const duration = toNum(pick(item, 'duration', 'duration_sec', 'length'));

  const useCount    = toNum(pick(item, 'video_count', 'videoCount', 'use_count', 'useCount', 'posts', 'count', 'usages'));
  const playCount   = toNum(pick(item, 'play_count', 'playCount', 'plays', 'views', 'total_plays'));
  const growth24h   = toNum(pick(item, 'growth_24h', 'growth24h', 'growth_count_24h', 'change_24h'));
  const growthPct48 = toNum(pick(item, 'growth_percent_48h', 'growthPercent48h', 'growth_48h_percent', 'trend_score', 'growth_rate'));

  // Sparkline — if API returns a history array, use it; else flat placeholder
  const history = pick(item, 'history', 'trend', 'daily_counts', 'sparkline');
  let sparkline = [1, 1, 1, 1, 1, 1, 1];
  if (Array.isArray(history) && history.length > 0) {
    const nums = history.map(toNum).filter(n => Number.isFinite(n));
    if (nums.length >= 2) {
      // Pad/truncate to 7 entries
      if (nums.length >= 7) sparkline = nums.slice(-7);
      else sparkline = [...Array(7 - nums.length).fill(nums[0]), ...nums];
      sparkline = sparkline.map(v => Math.max(v, 1));
    }
  }

  return {
    id:               `rapid-tt-${musicId || index}`,
    name:             title,
    artist:           artist,
    platform:         'tiktok',
    rank:             index + 1,
    useCount:         playCount || useCount || 0,
    growthCount24h:   growth24h || null,
    growthPercent48h: Math.max(-90, Math.min(growthPct48 || 0, 500)),
    commercialStatus: 'check',
    commercialNote:   'Commercial use status unknown — verify rights with your label rep before using in branded content.',
    isNew:            useCount > 0 && useCount < 4 && playCount > 100_000,
    isPromoted:       false,
    addedAt:          new Date().toISOString(),
    duration:         duration || null,
    audioUrl:         audio || null,
    coverUrl:         cover || null,
    tiktokUrl:        null,
    country:          'GB',
    categories:       [],
    sparkline,
    _source:          'rapidapi',
    _raw:             item, // keep for debugging — strip in prod if response large
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

    // Log a compact preview of the response so we can adjust field mappings
    // without burning another quota call.
    console.log('[RapidAPI] Response top-level keys:', Object.keys(data || {}));
    console.log('[RapidAPI] Raw response preview:', JSON.stringify(data).slice(0, 1500));

    // Find the array of items — could be under `data`, `items`, `results`, etc.
    let items = null;
    if (Array.isArray(data)) items = data;
    else items = pick(data, 'data', 'items', 'results', 'list', 'musics', 'sounds', 'music_list');

    if (!Array.isArray(items) || items.length === 0) {
      console.warn('[RapidAPI] No items array found in response. Full body:', JSON.stringify(data).slice(0, 2000));
      _lastError = 'No items in response — check field path';
      return null;
    }

    console.log(`[RapidAPI] Got ${items.length} items`);
    console.log('[RapidAPI] First item keys:', Object.keys(items[0] || {}));
    console.log('[RapidAPI] First item sample:', JSON.stringify(items[0]).slice(0, 1000));

    const sounds = items.slice(0, 50).map(mapItemToSound);

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
