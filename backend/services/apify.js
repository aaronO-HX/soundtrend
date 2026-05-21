// SoundTrend — Apify Integration
// Actor: data_xplorer/tiktok-trends (songs trend type)
// Refreshes every 4 hours, warms cache on startup, falls back to null so
// server.js can serve mock data instead.

const { ApifyClient } = require('apify-client');

const ACTOR_ID   = 'data_xplorer/tiktok-trends';
const CACHE_TTL  = 24 * 60 * 60 * 1000; // 24 hours — trending sounds change slowly

// ── Helpers ────────────────────────────────────────────────────────────────────

// Approximate a use-count from rank position.
// Real top-10 TikTok sounds typically have 5M–20M uses; rank 50 ≈ 300K–600K.
function estimateUseCount(rank) {
  return Math.round(18_000_000 / Math.pow(Math.max(rank, 1), 0.82));
}

// Map one Apify result item → SoundTrend schema
function mapItem(item, index) {
  const rank       = item['Rank_song']        ?? (index + 1);
  const rankChange = item['Rank Change_song'] ?? 0;
  const trendData  = (item['Trend Data_song'] ?? []).slice(-7);

  // Sparkline: convert rank values → estimated use counts so the chart
  // reads "up = popular", matching the frontend's visual expectation.
  const sparkline = trendData.length >= 2
    ? trendData.map(d => estimateUseCount(d.value ?? rank))
    : Array.from({ length: 7 }, (_, i) =>
        estimateUseCount(Math.max(1, rank + (6 - i) * 2)));

  // Commercial status
  const isCommercial    = Boolean(item['Is Commercial_song']);
  const commercialStatus = isCommercial ? 'clear' : 'check';
  const commercialNote   = isCommercial
    ? 'In TikTok Commercial Music Library — cleared for brand use.'
    : 'Not in TikTok Commercial Music Library. Verify rights before brand use.';

  // Growth signal derived from rank movement (capped to ±500%)
  const growthPercent48h = rankChange > 0
    ? Math.min(rankChange * 8, 500)
    : Math.max(rankChange * 3, -90);

  return {
    id:              `apify-tt-${index + 1}`,
    name:            item['Title_song']          || 'Unknown',
    artist:          item['Artist_song']         || 'Unknown',
    platform:        'tiktok',
    rank,
    rankChange,
    trendDirection:  item['Trend Direction_song'] || 'stable',
    useCount:        estimateUseCount(rank),
    growthCount24h:  null,  // not in actor output
    growthPercent48h,
    commercialStatus,
    commercialNote,
    isNew:           Boolean(item['Is New_song']),
    isPromoted:      Boolean(item['Is Promoted_song']),
    addedAt:         new Date().toISOString(),
    duration:        item['Duration_song']   || null,
    audioUrl:        item['Audio URL_song']  || null,
    coverUrl:        item['Cover_song']      || null,
    tiktokUrl:       item['TikTok URL_song'] || null,
    country:         item['Country_song']    || 'US',
    categories:      [],   // not in actor output
    sparkline,
    _source:         'apify',
  };
}

// ── Cache ──────────────────────────────────────────────────────────────────────

let _cache     = null;
let _fetchedAt = null;
let _fetching  = false;

// ── Fetch ──────────────────────────────────────────────────────────────────────

async function fetchFromApify() {
  const token = process.env.APIFY_TOKEN;
  if (!token) {
    console.log('[Apify] APIFY_TOKEN not set — skipping live fetch, mock data will be used');
    return null;
  }

  if (_fetching) {
    console.log('[Apify] Fetch already in progress — skipping duplicate');
    return null;
  }

  _fetching = true;
  console.log('[Apify] Fetching trending TikTok sounds...');

  try {
    const client = new ApifyClient({ token });

    const input = {
      trendType:          'songs',
      songCountryCode:    'GB',    // UK
      songPeriod:         '7',     // last 7 days
      songCommercialOnly: true,    // commercial music library only
      maxItems:           50,
      // Note: industryId (e.g. "travel") is hashtags-only — not supported for songs
    };
    console.log('[Apify] Input:', JSON.stringify(input));

    const run = await client.actor(ACTOR_ID).call(input, {
      waitSecs: 300, // up to 5 min
    });

    console.log(`[Apify] Run finished: status=${run.status} datasetId=${run.defaultDatasetId}`);

    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    if (items.length === 0) {
      console.warn('[Apify] Got 0 items from dataset');
    } else {
      console.log('[Apify] First item keys:', Object.keys(items[0]).join(', '));
    }

    const sounds = items.map(mapItem);
    console.log(`[Apify] Fetched ${sounds.length} trending sounds`);

    _cache     = sounds;
    _fetchedAt = Date.now();
    return sounds;

  } catch (err) {
    console.error('[Apify] Fetch failed:', err.message, err.stack);
    return null;

  } finally {
    _fetching = false;
  }
}

// ── Public API ─────────────────────────────────────────────────────────────────

// Returns cached sounds. On cold start (no cache yet) AWAIT the fetch so the
// first request actually gets data. On subsequent stale checks, refresh in the
// background and return what we have.
async function getSounds() {
  const stale = !_cache || !_fetchedAt || (Date.now() - _fetchedAt) > CACHE_TTL;

  if (!_cache) {
    // Cold start — block until we have data (or fetch fails and returns null)
    return await fetchFromApify();
  }

  if (stale) {
    // Have stale data — refresh in background, serve stale immediately
    fetchFromApify().catch(err => console.error('[Apify] Background refresh failed:', err));
  }

  return _cache;
}

// NOTE: No auto-fetch on startup — this hammers Apify on every Railway redeploy
// and triggers rate limits. The first /api/sounds request will warm the cache instead.

module.exports = { getSounds };
