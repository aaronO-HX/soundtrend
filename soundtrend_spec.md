# SoundTrend — Product Spec v1.0
**Status:** Ready for build  
**Audience:** Claude Code  
**Last updated:** 2026-03-30

---

## 1. The Problem

Professional content creators need to move fast. Trending sounds on TikTok and Instagram can go from niche to saturated in 48 hours. Right now there's no single place to quickly see which sounds are gaining momentum, whether they're safe for commercial use, and what kind of content is winning with them. By the time creators spot a trend manually, it's often too late.

---

## 2. The User

**Primary persona: The Professional Content Creator**

- Creates content for clients or their own brand — speed matters, mistakes are costly
- Checks trends daily, often on mobile between shoots or client meetings
- Needs to know *instantly* if a sound is cleared for commercial use (legal risk if not)
- Wants to understand the creative territory of a sound before committing to it
- Is not technical — the UI must do the thinking for them

---

## 3. What Done Looks Like

A mobile-first web app (runs in browser, optimised for 390px–430px viewport) that shows a live-feeling feed of trending sounds across TikTok and Instagram. The creator opens the app, sees what's trending right now, taps a sound to learn more, and leaves with a clear decision: *use this* or *skip it*.

The app feels fast, confident, and opinionated — like TikTok's UI but branded in HX's purple and yellow. It does not feel like a spreadsheet or a report.

**The experience in three steps:**
1. Open app → see scrollable feed of trending sounds, separated by platform
2. Tap a sound → see commercial clearance status, use count, growth rate, and top content categories using it
3. Make a decision and move on

---

## 4. Prioritised Features

### P0 — Must have in v1 (the app doesn't work without these)

**Trending Sound Feed**
- Vertically scrollable card feed, one sound per card
- Each card shows: sound name, artist/original creator, platform badge (TikTok / Instagram), use count, 24–48hr growth indicator (e.g. "+12,400 uses in 24hrs"), and commercial use status badge (✅ Commercial OK / ⚠️ Check Licence / ❌ Not Commercial)
- Cards are sorted by a combined trending score (blends growth rate + total uses)
- Feed loads with at minimum 20 mock sounds across both platforms

**Platform Filter Tabs**
- Three tabs at the top of the feed: `All` | `TikTok` | `Instagram`
- Tabs filter the feed in-place with no page reload

**Trending Type Filter**
- Toggle or pill selector beneath the tabs: `🔥 Fastest Growing` | `📈 Most Used` | `✨ Newly Emerging`
- "Newly Emerging" = sounds with under 50k uses but >200% growth in 48hrs
- Filters update the feed sort order immediately

**Sound Detail View**
- Tap a card → expand or navigate to detail view
- Detail view shows:
  - Commercial use status with plain-English explanation (e.g. "This sound uses a licensed track. Safe for brand content.")
  - Total use count with trend sparkline (7-day mock data)
  - Growth rate badge
  - Top 4–5 content categories using this sound (e.g. 🕺 Dance, 📦 Product showcase, 😂 Comedy, 🗣️ Voiceover) shown as pill tags with percentage breakdown
  - Platform(s) it's trending on
  - "New" badge if it appeared in the last 24hrs

### P1 — Should have in v1 (high value, achievable)

**New Sound Badge**
- Sounds added to the mock dataset within the last 24hrs get a `NEW` badge on their card in the feed

**Summary Stats Bar**
- Sticky bar beneath the tab/filter row showing at-a-glance numbers: total trending sounds today, number cleared for commercial use, number newly emerging

**Empty + Loading States**
- Skeleton loader cards while feed "loads" (simulate 800ms delay for realism)
- Friendly empty state if a filter returns no results

### P2 — Nice to have in v1 if time allows

**Sound Search**
- Simple text input to search by sound name or artist within the mock dataset

**Category Filter**
- Filter the feed by content category (Dance, Comedy, Product, etc.) — useful for creators who always make a specific content type

---

## 5. Data Strategy (Demo / Mock)

Since this is a working demo, all data will be **hardcoded mock data** in a JSON file or JavaScript object. No external API calls are required.

### Mock dataset requirements
- Minimum **30 sound entries** across TikTok and Instagram (roughly 60/40 split)
- Each entry must include:

```json
{
  "id": "unique-string",
  "name": "Sound name",
  "artist": "Artist or @creator handle",
  "platform": "tiktok" | "instagram" | "both",
  "useCount": 1240000,
  "growthCount24h": 84000,
  "growthPercent48h": 340,
  "commercialStatus": "clear" | "check" | "blocked",
  "commercialNote": "Plain English explanation string",
  "isNew": true | false,
  "addedAt": "ISO timestamp",
  "categories": [
    { "label": "Dance", "emoji": "🕺", "percent": 42 },
    { "label": "Product showcase", "emoji": "📦", "percent": 28 }
  ],
  "sparkline": [12000, 18000, 22000, 41000, 67000, 95000, 124000]
}
```

- Populate with realistic-sounding (but fictional) sound names and artists
- Include a spread of commercial statuses — not all green
- Include 4–5 genuinely "newly emerging" sounds (low use count, high growth %)

---

## 6. Design Direction

### Visual style
The app should feel like **TikTok's aesthetic applied to the HX brand** — dark background, high contrast, bold type, energetic but clean. Think: content feed, not dashboard.

### HX Brand Guidelines (from brand.holidayextras.com)

**Colours**
| Token | Value | Usage |
|---|---|---|
| `--hx-purple` | `#542E91` | Primary actions, active tabs, key UI elements |
| `--hx-yellow` | `#FDDC06` | Accent, badges, highlights, "NEW" labels |
| `--hx-black` | `#232323` | App background (use near-black for dark mode feel) |
| `--hx-white` | `#FFFFFF` | Primary text on dark backgrounds |
| `--hx-off-white` | `#F0F0F0` | Secondary text, card borders |
| `--functional-green` | `#00B0A6` | Commercial clear badge |
| `--functional-orange` | `#FFB55F` | Check licence badge |
| `--functional-red` | `#FF5F68` | Not commercial badge |
| `--functional-blue` | `#3AA6FF` | Sparklines, data accents |

**Typography**
- Font: **Nunito** (Google Fonts — import via CDN)
- Headings: Nunito Bold (700) or ExtraBold (800)
- Body: Nunito Regular (400) or SemiBold (600)
- Sound names: Bold, large (18–20px)
- Stats/metadata: Regular, smaller (12–14px)

**Component style**
- Cards: dark surface (`#1a1a2e` or similar near-black), rounded corners (16px), subtle border (`rgba(255,255,255,0.08)`)
- Active tab: HX Purple background, white text
- Inactive tab: transparent, muted text
- Commercial badges: pill shape, coloured background, white text, emoji prefix
- Platform badges: small, pill shape — TikTok in near-black with white text, Instagram in gradient pill (pink-to-purple) or flat purple

### Layout
- Max width: 430px, centred on desktop with a subtle app-chrome feel
- Sticky header: app name "SoundTrend" + HX logo placeholder
- Sticky tabs + filter row below header
- Scrollable feed takes remaining height
- Bottom safe area padding for mobile (env(safe-area-inset-bottom))

### Micro-interactions
- Cards have a subtle press state (scale 0.98 on tap/click)
- Tab switch animates the active indicator sliding across
- Detail view slides up from bottom (bottom sheet pattern) or fades in
- Growth numbers on cards pulse or animate in on load

---

## 7. Tech Stack

Claude Code should use the following — chosen to keep things simple and dependency-light:

| Layer | Choice | Reason |
|---|---|---|
| Framework | **React** (via Vite) | Fast setup, component model suits the card feed |
| Styling | **CSS Modules** or plain CSS with custom properties | Keeps HX tokens easy to manage; no build complexity |
| Data | **Local JSON file** (`/src/data/sounds.json`) | No API needed; easy to edit |
| Charts | **Recharts** | Simple sparkline support, React-native |
| Icons | **Lucide React** | Clean, consistent icon set |
| Fonts | Google Fonts CDN (Nunito) | No install needed |
| Routing | None required | Single-page, use component state for views |

No backend. No database. No authentication. Runs entirely in the browser.

---

## 8. Deliberately Out of Scope for v1

The following are **not** being built in v1. Do not implement them, even partially:

| Feature | Why excluded |
|---|---|
| Real API integration (TikTok, Instagram, Chartmetric) | Requires API keys, rate limits, backend — overkill for demo |
| Push or email notifications | Adds backend complexity; user said in-app is fine |
| Watchlist / saved sounds | Needs persistence (localStorage or backend); post-demo feature |
| Sharing to team / clients | Collaboration feature for v2 |
| User accounts or login | No auth in v1 |
| Audio playback of sounds | Licensing complexity; preview links not available in mock data |
| Historical trend comparison | Interesting but not needed for the core job-to-be-done |
| Mobile app (iOS/Android) | Web-first for demo; app is a v2 consideration |

---

## 9. Success Criteria

The demo is considered complete when:

1. The feed loads with 30+ mock sounds and displays correctly at 390px width
2. Platform filter tabs (All / TikTok / Instagram) correctly filter the feed
3. Trending type filters (Fastest Growing / Most Used / Newly Emerging) correctly re-sort the feed
4. Tapping a sound card opens a detail view with commercial status, use count, sparkline, and content categories
5. Commercial status badges are visually distinct and use the correct HX functional colours
6. The app uses Nunito font and HX Purple/Yellow throughout
7. No console errors on load
8. Feels fast — skeleton loaders used, no visible layout shift

---

## 10. Open Questions (for post-demo)

- Which real data provider to use for v2? (Chartmetric and Tokboard are the leading candidates)
- Should "newly emerging" sounds have a different card treatment — e.g. a distinct card style to make them pop?
- Is there appetite for a simple weekly digest email in v2, summarising the week's top sounds?
