// SoundTrend — Main App
// React via CDN + Babel standalone

const { useState, useEffect, useCallback, useRef, useMemo } = React;

// ── Auth ──────────────────────────────────────────────────────────────────────
// Pick up JWT from ?token= on first load, persist to localStorage, strip URL.

const AUTH_KEY = 'sounds_auth_token';

function initAuth() {
  const params = new URLSearchParams(window.location.search);
  const urlToken = params.get('token');
  if (urlToken) {
    localStorage.setItem(AUTH_KEY, urlToken);
    history.replaceState({}, '', window.location.pathname);
  }
  return localStorage.getItem(AUTH_KEY);
}

function authHeaders() {
  const token = localStorage.getItem(AUTH_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Gate Screen ───────────────────────────────────────────────────────────────

function GateScreen() {
  return (
    <div className="gate-screen">
      <div className="gate-inner">
        <div className="gate-icon">🔒</div>
        <div className="gate-title">Access via Social Command Centre</div>
        <div className="gate-body">
          Open this app from the Social Command Centre — your session will carry across automatically.
        </div>
      </div>
    </div>
  );
}

// ── Global Audio Engine ───────────────────────────────────────────────────────
// Singleton: only one sound plays at a time across the whole app

const audioEngine = {
  audio: null,
  playingId: null,
  listeners: new Set(),

  subscribe(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); },
  _notify()     { this.listeners.forEach(fn => fn({ playingId: this.playingId, progress: this._progress(), duration: this._duration() })); },

  _progress() { return this.audio && this.audio.duration ? this.audio.currentTime / this.audio.duration : 0; },
  _duration() { return this.audio ? this.audio.duration || 0 : 0; },

  async play(sound) {
    const url = sound.previewUrl;

    // Toggle off if same sound
    if (this.playingId === sound.id && this.audio && !this.audio.paused) {
      this.audio.pause();
      this.playingId = null;
      this._notify();
      return;
    }

    // Stop current
    if (this.audio) {
      this.audio.pause();
      this.audio.ontimeupdate = null;
      this.audio.onended = null;
    }

    this.playingId = sound.id + '_loading';
    this._notify();

    const audio = new Audio(url);
    audio.volume = 0.75;
    this.audio = audio;

    // Seek to a mid-point snippet so it sounds like a "preview"
    const startAt = 30 + (sound.clipIndex * 12); // 30s, 42s, 54s, etc.

    audio.ontimeupdate = () => this._notify();
    audio.onended = () => { this.playingId = null; this._notify(); };
    audio.onerror = () => { this.playingId = null; this._notify(); };

    try {
      await audio.play();
      // Seek after play starts (some browsers need it in flight)
      if (audio.duration && audio.duration > startAt) {
        audio.currentTime = startAt;
      }
      this.playingId = sound.id;
      this._notify();
    } catch(e) {
      this.playingId = null;
      this._notify();
    }
  },

  stop() {
    if (this.audio) { this.audio.pause(); this.audio.ontimeupdate = null; }
    this.playingId = null;
    this._notify();
  }
};

function useAudioEngine() {
  const [state, setState] = useState({ playingId: null, progress: 0, duration: 0 });
  useEffect(() => audioEngine.subscribe(s => setState({ ...s })), []);
  return state;
}

function formatTime(secs) {
  if (!secs || isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatCount(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return n.toString();
}

function formatGrowth(n) {
  if (n >= 1_000_000) return '+' + (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000)     return '+' + (n / 1_000).toFixed(0) + 'K';
  return '+' + n;
}

function trendingScore(sound) {
  const normalized = (sound.growthPercent48h / 100) * sound.growthCount24h;
  return normalized + sound.useCount * 0.001;
}

// ── SVG Sparkline ─────────────────────────────────────────────────────────────

function Sparkline({ data, width = '100%', height = 56 }) {
  const svgRef = useRef(null);
  const [actualWidth, setActualWidth] = useState(320);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) setActualWidth(entry.contentRect.width);
    });
    ro.observe(el.parentElement || el);
    setActualWidth((el.parentElement || el).offsetWidth || 320);
    return () => ro.disconnect();
  }, []);

  const w = actualWidth - 2;
  const h = height;
  const pad = 4;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return [x, y];
  });

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');

  const areaPath = [
    `M${pts[0][0].toFixed(1)},${h}`,
    ...pts.map(p => `L${p[0].toFixed(1)},${p[1].toFixed(1)}`),
    `L${pts[pts.length-1][0].toFixed(1)},${h}`,
    'Z'
  ].join(' ');

  const lastPt = pts[pts.length - 1];

  return (
    <svg
      ref={svgRef}
      width={width}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      style={{ display: 'block', overflow: 'visible' }}
    >
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#3AA6FF" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#3AA6FF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#sparkGrad)" />
      <path d={linePath} fill="none" stroke="#3AA6FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastPt[0]} cy={lastPt[1]} r="3.5" fill="#3AA6FF" />
    </svg>
  );
}

// ── Equalizer Animation ───────────────────────────────────────────────────────

function EqBars() {
  return (
    <div className="eq-bars">
      <div className="eq-bar" />
      <div className="eq-bar" />
      <div className="eq-bar" />
    </div>
  );
}

// ── Commercial Badge ──────────────────────────────────────────────────────────

function CommercialBadge({ status, size = 'sm' }) {
  const map = {
    clear:   { icon: '✅', label: 'Commercial OK', cls: 'clear' },
    check:   { icon: '⚠️', label: 'Check Licence', cls: 'check' },
    blocked: { icon: '❌', label: 'Not Commercial', cls: 'blocked' },
  };
  const { icon, label, cls } = map[status] || map.check;
  return (
    <span className={`commercial-badge ${cls}`}>
      {icon} {label}
    </span>
  );
}

// ── Platform Badge ────────────────────────────────────────────────────────────

function PlatformBadge({ platform }) {
  if (platform === 'both') return (
    <span className="platform-badge both">TT + IG</span>
  );
  if (platform === 'tiktok') return (
    <span className="platform-badge tiktok">TikTok</span>
  );
  return (
    <span className="platform-badge instagram">Instagram</span>
  );
}

// ── Skeleton Card ─────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skel-row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div className="skel" style={{ width: 180, height: 16, marginBottom: 8 }} />
          <div className="skel" style={{ width: 110, height: 12 }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-end' }}>
          <div className="skel" style={{ width: 64, height: 18, borderRadius: 999 }} />
          <div className="skel" style={{ width: 40, height: 14, borderRadius: 999 }} />
        </div>
      </div>
      <div className="skel-row" style={{ marginBottom: 12 }}>
        <div className="skel" style={{ width: 80, height: 22 }} />
        <div className="skel" style={{ width: 100, height: 22, marginLeft: 16 }} />
        <div className="skel" style={{ width: 90, height: 22, marginLeft: 'auto', borderRadius: 999 }} />
      </div>
      <div className="skel" style={{ width: 130, height: 22, borderRadius: 999 }} />
    </div>
  );
}

// ── Sound Card ────────────────────────────────────────────────────────────────

function SoundCard({ sound, index, onClick }) {
  const delay = Math.min(index * 0.04, 0.4);
  const { playingId } = useAudioEngine();
  const isPlaying  = playingId === sound.id;
  const isLoading  = playingId === sound.id + '_loading';

  function handlePlay(e) {
    e.stopPropagation();
    audioEngine.play(sound);
  }

  return (
    <div
      className={`sound-card commercial-${sound.commercialStatus}`}
      style={{ animationDelay: `${delay}s` }}
      onClick={() => onClick(sound)}
    >
      <div className="card-top">
        <div className="card-title-group">
          <div className="card-name">{sound.name}</div>
          <div className="card-artist">{sound.artist}</div>
        </div>
        <div className="card-badges">
          <PlatformBadge platform={sound.platform} />
          {sound.isNew && <span className="new-badge">NEW</span>}
        </div>
      </div>

      <div className="card-stats">
        <div className="stat-block">
          <span className="val">{formatCount(sound.useCount)}</span>
          <span className="lbl">Uses</span>
        </div>
        <div className="stat-block" style={{ marginLeft: 4 }}>
          <span className="growth-chip" style={{ animationDelay: `${delay + 0.15}s` }}>
            ↑ {formatGrowth(sound.growthCount24h)} / 24h
          </span>
        </div>
        <div className="stat-block" style={{ marginLeft: 'auto' }}>
          <span className="val" style={{ color: '#3AA6FF' }}>+{sound.growthPercent48h}%</span>
          <span className="lbl">48h growth</span>
        </div>
      </div>

      <div className="card-bottom">
        <button
          className={`play-btn ${isPlaying ? 'playing' : ''} ${isLoading ? 'loading' : ''}`}
          onClick={handlePlay}
          title={isPlaying ? 'Pause preview' : 'Play preview'}
        >
          {isLoading ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
            </svg>
          ) : isPlaying ? (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: 2 }}>
              <path d="M5 3l14 9-14 9V3z"/>
            </svg>
          )}
        </button>
        <div className="card-commercial" style={{ marginLeft: 10 }}>
          {isPlaying ? <EqBars /> : <CommercialBadge status={sound.commercialStatus} />}
        </div>
        <div className="card-chevron">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

// ── Audio Player Component ────────────────────────────────────────────────────

function AudioPlayer({ sound }) {
  const { playingId, progress, duration } = useAudioEngine();
  const isPlaying = playingId === sound.id;
  const isLoading = playingId === sound.id + '_loading';
  const elapsed   = duration * progress;

  return (
    <div className="audio-player">
      <button
        className={`audio-play-large ${isPlaying ? 'playing' : ''} ${isLoading ? 'loading' : ''}`}
        onClick={() => audioEngine.play(sound)}
        title={isPlaying ? 'Pause' : 'Play preview'}
      >
        {isLoading ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
          </svg>
        ) : isPlaying ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>
          </svg>
        ) : (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: 2 }}>
            <path d="M5 3l14 9-14 9V3z"/>
          </svg>
        )}
      </button>

      <div className="audio-info">
        <div className="audio-label">
          {isLoading ? 'Loading preview…' : isPlaying ? 'Now playing preview' : 'Sound preview'}
        </div>
        <div className="audio-progress-track">
          <div className="audio-progress-fill" style={{ width: `${progress * 100}%` }} />
        </div>
        <div className="audio-time">
          <span>{formatTime(elapsed)}</span>
          <span>{duration ? formatTime(duration) : '--:--'}</span>
        </div>
      </div>

      {isPlaying && <EqBars />}
    </div>
  );
}

// ── Detail Sheet ──────────────────────────────────────────────────────────────

function DetailSheet({ sound, onClose }) {
  const [closing, setClosing] = useState(false);
  const [barsReady, setBarsReady] = useState(false);

  useEffect(() => {
    // Animate category bars after mount
    const t = setTimeout(() => setBarsReady(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    // Prevent body scroll while sheet open
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  function handleClose() {
    setClosing(true);
    setTimeout(onClose, 200);
  }

  const commercialInfo = {
    clear:   { icon: '✅', label: 'Cleared for Commercial Use' },
    check:   { icon: '⚠️', label: 'Check Your Licence' },
    blocked: { icon: '❌', label: 'Not Cleared for Commercial Use' },
  }[sound.commercialStatus];

  const days = ['7d ago', '6d', '5d', '4d', '3d', '2d', 'Today'];

  return (
    <div className={`sheet-overlay ${closing ? 'closing' : ''}`} onClick={handleClose}>
      <div
        className={`detail-sheet ${closing ? 'closing' : ''}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="sheet-handle-wrap">
          <div className="sheet-handle" />
        </div>

        {/* Header */}
        <div className="sheet-header">
          <div className="sheet-title">{sound.name}</div>
          <div className="sheet-artist">{sound.artist}</div>
          <div className="sheet-badges">
            <PlatformBadge platform={sound.platform} />
            {sound.isNew && <span className="new-badge">NEW</span>}
          </div>
        </div>

        <div className="sheet-body">

          {/* Audio Player */}
          <AudioPlayer sound={sound} />

          {/* Commercial Status */}
          <div className={`commercial-block ${sound.commercialStatus}`}>
            <div className="commercial-icon">{commercialInfo.icon}</div>
            <div className="commercial-text-wrap">
              <div className="commercial-status-label">{commercialInfo.label}</div>
              <div className="commercial-note">{sound.commercialNote}</div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-tile">
              <div className="stat-tile-val">{formatCount(sound.useCount)}</div>
              <div className="stat-tile-lbl">Total Uses</div>
            </div>
            <div className="stat-tile">
              <div className="stat-tile-val green">{formatGrowth(sound.growthCount24h)}</div>
              <div className="stat-tile-lbl">Uses in 24h</div>
            </div>
            <div className="stat-tile">
              <div className="stat-tile-val orange">+{sound.growthPercent48h}%</div>
              <div className="stat-tile-lbl">48h Growth</div>
            </div>
            <div className="stat-tile">
              <div className={`stat-tile-val ${sound.isNew ? 'blue' : ''}`}>
                {sound.isNew ? '< 24h ago' : '2–7 days'}
              </div>
              <div className="stat-tile-lbl">Added</div>
            </div>
          </div>

          {/* Sparkline */}
          <div className="sparkline-section">
            <div className="section-label">7-Day Trend</div>
            <div className="sparkline-wrap">
              <Sparkline data={sound.sparkline} height={72} />
              <div className="sparkline-labels">
                {days.map((d, i) => (
                  <span key={i} className="sparkline-day">{d}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Content Categories */}
          <div>
            <div className="section-label">Top Content Categories</div>
            <div className="categories-list">
              {sound.categories.map((cat, i) => (
                <div key={i} className="category-row">
                  <div className="category-label">
                    <span>{cat.emoji}</span>
                    <span>{cat.label}</span>
                  </div>
                  <div className="category-bar-track">
                    <div
                      className="category-bar-fill"
                      style={{ width: barsReady ? `${cat.percent}%` : '0%' }}
                    />
                  </div>
                  <div className="category-pct">{cat.percent}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* Close */}
          <button className="close-btn" onClick={handleClose}>
            Close
          </button>

        </div>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────

function App() {
  const [token]                     = useState(() => initAuth());
  const [sounds, setSounds]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [platform, setPlatform]     = useState('all');
  const [trendType, setTrendType]   = useState('trending');
  const [search, setSearch]         = useState('');
  const [selectedSound, setSelectedSound] = useState(null);

  // ── Gate: no token → don't fetch, just show gate screen
  if (!token) return <GateScreen />;

  // ── Load sounds from API
  useEffect(() => {
    const apiUrl = (window.API_URL || 'http://localhost:3001') + '/api/sounds';
    fetch(apiUrl, { headers: authHeaders() })
      .then(r => {
        if (r.status === 401) throw new Error('unauthorized');
        return r.json();
      })
      .then(data => { setSounds(data); setLoading(false); })
      .catch(() => { setFetchError(true); setLoading(false); });
  }, []);

  // ── Filtered + sorted feed
  const feed = useMemo(() => {
    let list = sounds.slice();

    // Platform filter
    if (platform === 'tiktok') {
      list = list.filter(s => s.platform === 'tiktok' || s.platform === 'both');
    } else if (platform === 'instagram') {
      list = list.filter(s => s.platform === 'instagram' || s.platform === 'both');
    }

    // Search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q)
      );
    }

    // Trend type filter + sort
    if (trendType === 'emerging') {
      list = list.filter(s => s.useCount < 50_000 && s.growthPercent48h > 200);
      list.sort((a, b) => b.growthPercent48h - a.growthPercent48h);
    } else if (trendType === 'most-used') {
      list.sort((a, b) => b.useCount - a.useCount);
    } else {
      // Fastest growing / trending (default)
      list.sort((a, b) => trendingScore(b) - trendingScore(a));
    }

    return list;
  }, [platform, trendType, search, sounds]);

  // ── Stats
  const stats = useMemo(() => {
    const all = sounds;
    const commercial = all.filter(s => s.commercialStatus === 'clear').length;
    const emerging = all.filter(s => s.useCount < 50_000 && s.growthPercent48h > 200).length;
    return { total: all.length, commercial, emerging };
  }, [sounds]);

  return (
    <div className="app">

      {/* ── Header */}
      <header className="header">
        <div className="header-logo">
          <div className="logo-icon">🎵</div>
          <div className="logo-text">Sound<span>Trend</span></div>
        </div>
        <div className="header-badge">Live Demo</div>
      </header>

      {/* ── Body: sidebar + feed */}
      <div className="app-body">

        {/* ── Sidebar / Sticky Controls */}
        <aside className="sidebar">
          <div className="sticky-controls">

            {/* Platform Tabs */}
            <div className="platform-tabs">
              {[
                { id: 'all',       label: 'All' },
                { id: 'tiktok',    label: '♪ TikTok' },
                { id: 'instagram', label: '◈ Instagram' },
              ].map(t => (
                <button
                  key={t.id}
                  className={`tab-btn ${platform === t.id ? 'active' : ''}`}
                  onClick={() => setPlatform(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Trend Type Pills */}
            <div className="trend-filter">
              {[
                { id: 'trending',  label: '🔥 Fastest Growing' },
                { id: 'most-used', label: '📈 Most Used' },
                { id: 'emerging',  label: '✨ Newly Emerging' },
              ].map(p => (
                <button
                  key={p.id}
                  className={`pill-btn ${trendType === p.id ? 'active' : ''}`}
                  onClick={() => setTrendType(p.id)}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="search-wrap">
              <div className="search-wrap-inner">
                <span className="search-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                </span>
                <input
                  className="search-input"
                  type="text"
                  placeholder="Search sounds or artists…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Stats Bar */}
            <div className="stats-bar">
              <div className="stat-item">
                <div className="stat-value">{stats.total}</div>
                <div className="stat-label">Trending Today</div>
              </div>
              <div className="stat-item green">
                <div className="stat-value">{stats.commercial}</div>
                <div className="stat-label">Comm. Cleared</div>
              </div>
              <div className="stat-item yellow">
                <div className="stat-value">{stats.emerging}</div>
                <div className="stat-label">Newly Emerging</div>
              </div>
            </div>

          </div>
        </aside>

        {/* ── Feed */}
        <main className="feed">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          ) : fetchError ? (
            <div className="empty-state">
              <div className="empty-icon">⚠️</div>
              <div className="empty-title">Couldn't reach the API</div>
              <div className="empty-body">Make sure the backend is running and <code>window.API_URL</code> in <code>index.html</code> points to it.</div>
            </div>
          ) : feed.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <div className="empty-title">No sounds found</div>
              <div className="empty-body">
                {search
                  ? `No results for "${search}". Try a different search term.`
                  : 'No sounds match this combination of filters. Try adjusting your selection.'}
              </div>
            </div>
          ) : (
            feed.map((sound, i) => (
              <SoundCard
                key={sound.id}
                sound={sound}
                index={i}
                onClick={setSelectedSound}
              />
            ))
          )}
        </main>

      </div>{/* end app-body */}

      {/* ── Detail Sheet */}
      {selectedSound && (
        <DetailSheet
          sound={selectedSound}
          onClose={() => setSelectedSound(null)}
        />
      )}

    </div>
  );
}

// ── Mount ─────────────────────────────────────────────────────────────────────
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));
