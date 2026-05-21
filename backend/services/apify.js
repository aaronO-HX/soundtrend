// SoundTrend — Apify Integration
// Actor: clockworks/tiktok-explore-scraper
//
// This actor returns posts (not pre-ranked sounds). We fetch ~250 explore
// posts, group them by musicMeta.musicId, then rank sounds by post count.
// Results cached for 24h; first /api/sounds request triggers the fetch.

const { ApifyClient } = require('apify-client');

const ACTOR_ID  = 'clockworks/tiktok-explore-scraper';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// ── Aggregation ────────────────────────────────────────────────────────────────

// Group posts by musicId, accumulate stats, rank by use count
function aggregateByMusic(posts) {
  const byMusic = new Map();

  for (const post of posts) {
    const m = post.musicMeta;
    if (!m || !m.musicId) continue;

    // Skip original sounds — we want catalog/recognisable tracks, not
    // one-off user audio. Original sounds are tied to a single creator and
    // usually aren't "trending sounds" in the sense the dashboard wants.
    if (m.musicOriginal) continue;

    const id = m.musicId;
    if (!byMusic.has(id)) {
      byMusic.set(id, {
        musicId:    id,
        name:       m.musicName    || 'Unknown',
        artist:     m.musicAuthor  || 'Unknown',
        album:      m.musicAlbum   || null,
        coverUrl:   m.coverMediumUrl || null,
        audioUrl:   m.playUrl       || null,
        posts:      [],
      });
    }

    byMusic.get(id).posts.push(post);
  }

  // Sort by post count (= use count proxy), take top 50
  return [...byMusic.values()]
    .map(s => ({
      ...s,
      useCount:     s.posts.length,
      totalPlays:   s.posts.reduce((sum, p) => sum + (p.playCount    || 0), 0),
      totalLikes:   s.posts.reduce((sum, p) => sum + (p.diggCount    || 0), 0),
      totalShares:  s.posts.reduce((sum, p) => sum + (p.shareCount   || 0), 0),
      totalComments:s.posts.reduce((sum, p) => sum + (p.commentCount || 0), 0),
    }))
    .sort((a, b) => b.useCount - a.useCount || b.totalPlays - a.totalPlays)
    .slice(0, 50);
}

// Build a 7-day sparkline from post timestamps (cumulative plays per day)
function buildSparkline(posts) {
  if (!posts || posts.length === 0) return [1, 1, 1, 1, 1, 1, 1];

  const now      = Date.now() / 1000; // seconds
  const oneDay   = 86400;
  const buckets  = new Array(7).fill(0);

  for (const post of posts) {
    if (!post.createTime) continue;
    const age = now - post.createTime;
    const dayIdx = 6 - Math.floor(age / oneDay);
    if (dayIdx >= 0 && dayIdx < 7) {
      buckets[dayIdx] += (post.playCount || 0) + 1; // +1 to ensure non-zero
    }
  }

  // Cumulative — so the chart trends upward as posts accumulate
  for (let i = 1; i < 7; i++) {
    buckets[i] += buckets[i - 1];
  }

  // Ensure no zeros (sparkline component needs non-zero range)
  return buckets.map(v => Math.max(v, 1));
}

// ── Mapping ────────────────────────────────────────────────────────────────────

function mapAggregateToSound(agg, index) {
  const sparkline = buildSparkline(agg.posts);

  // Categorise platform mentions based on `musicOriginal` and post count.
  // We have no real commercial flag from this actor, so default to "check"
  // for safety — users should verify rights before brand use.
  const commercialStatus = 'check';
  const commercialNote   = 'Commercial use status unknown — verify rights with your label rep before using in branded content.';

  // Newly emerging: very few posts but high recent engagement
  const isNew = agg.useCount < 4 && agg.totalPlays > 100_000;

  // Growth % approximated: last 2 days vs first 2 days of sparkline
  const recent = sparkline[6] - sparkline[4];
  const older  = Math.max(sparkline[2] - sparkline[0], 1);
  const growthPercent48h = Math.round(((recent - older) / older) * 100);

  return {
    id:               `apify-tt-${agg.musicId}`,
    name:             agg.name,
    artist:           agg.artist,
    platform:         'tiktok',
    rank:             index + 1,
    useCount:         agg.totalPlays || agg.useCount,
    growthCount24h:   null,
    growthPercent48h: Math.max(-90, Math.min(growthPercent48h, 500)),
    commercialStatus,
    commercialNote,
    isNew,
    isPromoted:       false,
    addedAt:          new Date().toISOString(),
    duration:         null,
    audioUrl:         agg.audioUrl,
    coverUrl:         agg.coverUrl,
    tiktokUrl:        null,
    country:          'GB',
    categories:       [],
    sparkline,
    _source:          'apify',
    _postCount:       agg.useCount,
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
  console.log('[Apify] Fetching TikTok Explore feed (UK)...');

  try {
    const client = new ApifyClient({ token });

    const input = {
      exploreCategoryTypes: ['pc_web_explorePage_all'],
      resultsPerPage:       250,
      shouldDownloadVideos: false,
      shouldDownloadCovers: false,
      shouldDownloadSubtitles: false,
      shouldDownloadSlideshowImages: false,
      proxyCountryCode:     'GB',
    };
    console.log('[Apify] Input:', JSON.stringify(input));

    const run = await client.actor(ACTOR_ID).call(input, { waitSecs: 300 });
    console.log(`[Apify] Run finished: status=${run.status} datasetId=${run.defaultDatasetId}`);

    const { items: posts } = await client.dataset(run.defaultDatasetId).listItems();
    console.log(`[Apify] Got ${posts.length} posts`);

    if (posts.length === 0) {
      console.warn('[Apify] 0 posts returned — actor may be misconfigured or rate-limited');
      return null;
    }

    const aggregated = aggregateByMusic(posts);
    console.log(`[Apify] Aggregated into ${aggregated.length} unique trending sounds`);

    const sounds = aggregated.map(mapAggregateToSound);

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

async function getSounds() {
  const stale = !_cache || !_fetchedAt || (Date.now() - _fetchedAt) > CACHE_TTL;

  if (!_cache) {
    // Cold start — block until we have data
    return await fetchFromApify();
  }

  if (stale) {
    // Have stale data — refresh in background, serve stale immediately
    fetchFromApify().catch(err => console.error('[Apify] Background refresh failed:', err));
  }

  return _cache;
}

// NOTE: No startup auto-fetch — first /api/sounds request warms the cache.

module.exports = { getSounds };
