// SoundTrend — Apify Integration
// Actor: data_xplorer/tiktok-trends (songs trend type)
// Refreshes every 4 hours, warms cache on startup, falls back to null so
// server.js can serve mock data instead.

const ACTOR_ID   = 'data_xplorer~tiktok-trends';
const CACHE_TTL  = 4 * 60 * 60 * 1000; // 4 hours

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
    const res = await fetch(
      `https://api.apify.com/v2/acts/${ACTOR_ID}/run-sync-get-dataset-items`,
      {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          trendType:       'songs',
          maxItems:        50,
          songCountryCode: 'US',
          songPeriod:      '7',
        }),
        signal: AbortSignal.timeout(5 * 60 * 1000), // actor can take up to 5 min
      }
    );

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`HTTP ${res.status}: ${body}`);
    }

    const items  = await res.json();
    const sounds = items.map(mapItem);
    console.log(`[Apify] Fetched ${sounds.length} trending sounds`);

    _cache     = sounds;
    _fetchedAt = Date.now();
    return sounds;

  } catch (err) {
    console.error('[Apify] Fetch failed:', err.message);
    return null;

  } finally {
    _fetching = false;
  }
}

// ── Public API ─────────────────────────────────────────────────────────────────

// Returns cached sounds if fresh, otherwise kicks off a background refresh
// and returns whatever we have (stale cache or null).
async function getSounds() {
  const stale = !_cache || !_fetchedAt || (Date.now() - _fetchedAt) > CACHE_TTL;

  if (stale) {
    // Fire-and-forget — don't block the API response
    fetchFromApify();
  }

  return _cache; // null on first cold start before fetch completes
}

// Warm the cache immediately on module load (defensive — never let this kill the process)
fetchFromApify().catch(err => {
  console.error('[Apify] Startup fetch crashed:', err);
});

module.exports = { getSounds };
