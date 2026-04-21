// SoundTrend — Mock Sound Data (Node.js module for Railway backend)

const SOUNDS = [
  {
    id: "tt-001",
    name: "Espresso",
    artist: "Sabrina Carpenter",
    platform: "tiktok",
    useCount: 4820000,
    growthCount24h: 312000,
    growthPercent48h: 87,
    commercialStatus: "check",
    commercialNote: "Major label track. Licensed for personal use only — verify with your label rep before brand use.",
    isNew: false,
    addedAt: "2026-03-26T08:00:00Z",
    categories: [
      { label: "Dance", emoji: "🕺", percent: 38 },
      { label: "Comedy", emoji: "😂", percent: 27 },
      { label: "Get Ready With Me", emoji: "💄", percent: 21 },
      { label: "Lifestyle", emoji: "✨", percent: 14 }
    ],
    sparkline: [180000, 290000, 420000, 680000, 1200000, 2800000, 4820000]
  },
  {
    id: "tt-002",
    name: "BIRDS OF A FEATHER",
    artist: "Billie Eilish",
    platform: "tiktok",
    useCount: 6100000,
    growthCount24h: 184000,
    growthPercent48h: 42,
    commercialStatus: "check",
    commercialNote: "Major label (Interscope/Universal). Sync licence required for commercial content.",
    isNew: false,
    addedAt: "2026-03-20T10:00:00Z",
    categories: [
      { label: "Aesthetic", emoji: "🌸", percent: 44 },
      { label: "Travel", emoji: "✈️", percent: 29 },
      { label: "Dance", emoji: "🕺", percent: 17 },
      { label: "Voiceover", emoji: "🗣️", percent: 10 }
    ],
    sparkline: [320000, 510000, 980000, 2100000, 3800000, 5200000, 6100000]
  },
  {
    id: "tt-003",
    name: "Walk It Like I Talk It (Sped Up)",
    artist: "Migos / @hypesounds",
    platform: "tiktok",
    useCount: 2940000,
    growthCount24h: 228000,
    growthPercent48h: 124,
    commercialStatus: "blocked",
    commercialNote: "Sample contains unlicensed elements. Not cleared for any commercial or brand use.",
    isNew: false,
    addedAt: "2026-03-25T14:00:00Z",
    categories: [
      { label: "Product showcase", emoji: "📦", percent: 51 },
      { label: "Dance", emoji: "🕺", percent: 31 },
      { label: "Comedy", emoji: "😂", percent: 18 }
    ],
    sparkline: [48000, 120000, 310000, 740000, 1400000, 2200000, 2940000]
  },
  {
    id: "tt-004",
    name: "Rumours (Lo-Fi Edit)",
    artist: "@lofivibes.wav",
    platform: "tiktok",
    useCount: 890000,
    growthCount24h: 142000,
    growthPercent48h: 278,
    commercialStatus: "clear",
    commercialNote: "Original creator-owned track. Cleared for commercial brand content.",
    isNew: false,
    addedAt: "2026-03-27T09:00:00Z",
    categories: [
      { label: "Voiceover", emoji: "🗣️", percent: 48 },
      { label: "Lifestyle", emoji: "✨", percent: 30 },
      { label: "Product showcase", emoji: "📦", percent: 22 }
    ],
    sparkline: [12000, 28000, 64000, 150000, 340000, 620000, 890000]
  },
  {
    id: "tt-005",
    name: "Flowers",
    artist: "Miley Cyrus",
    platform: "tiktok",
    useCount: 8300000,
    growthCount24h: 95000,
    growthPercent48h: 18,
    commercialStatus: "check",
    commercialNote: "RCA Records. Commercial use requires sync licensing — check with your legal team.",
    isNew: false,
    addedAt: "2026-03-10T08:00:00Z",
    categories: [
      { label: "Motivation", emoji: "💪", percent: 36 },
      { label: "Aesthetic", emoji: "🌸", percent: 28 },
      { label: "Dance", emoji: "🕺", percent: 22 },
      { label: "Comedy", emoji: "😂", percent: 14 }
    ],
    sparkline: [2100000, 3400000, 4800000, 6100000, 7200000, 8000000, 8300000]
  },
  {
    id: "tt-006",
    name: "Chill Type Beat #47",
    artist: "@beatsbyomar",
    platform: "both",
    useCount: 1240000,
    growthCount24h: 84000,
    growthPercent48h: 104,
    commercialStatus: "clear",
    commercialNote: "Creator-licensed beat. Explicitly cleared for commercial use. Credit @beatsbyomar where possible.",
    isNew: false,
    addedAt: "2026-03-22T11:00:00Z",
    categories: [
      { label: "Product showcase", emoji: "📦", percent: 55 },
      { label: "Voiceover", emoji: "🗣️", percent: 28 },
      { label: "Lifestyle", emoji: "✨", percent: 17 }
    ],
    sparkline: [28000, 64000, 140000, 310000, 620000, 960000, 1240000]
  },
  {
    id: "tt-007",
    name: "HISS",
    artist: "Megan Thee Stallion",
    platform: "tiktok",
    useCount: 3610000,
    growthCount24h: 174000,
    growthPercent48h: 67,
    commercialStatus: "blocked",
    commercialNote: "Explicit content. Major label (300 Entertainment). Not cleared for brand or commercial use.",
    isNew: false,
    addedAt: "2026-03-21T16:00:00Z",
    categories: [
      { label: "Comedy", emoji: "😂", percent: 62 },
      { label: "Dance", emoji: "🕺", percent: 28 },
      { label: "Reaction", emoji: "😮", percent: 10 }
    ],
    sparkline: [240000, 520000, 980000, 1700000, 2500000, 3200000, 3610000]
  },
  {
    id: "tt-008",
    name: "Sunroof Instrumental",
    artist: "@sundaymorning.beats",
    platform: "tiktok",
    useCount: 470000,
    growthCount24h: 118000,
    growthPercent48h: 412,
    commercialStatus: "clear",
    commercialNote: "Independent artist. Cleared for commercial use via Creator Marketplace licence.",
    isNew: true,
    addedAt: "2026-03-29T07:30:00Z",
    categories: [
      { label: "Travel", emoji: "✈️", percent: 47 },
      { label: "Lifestyle", emoji: "✨", percent: 33 },
      { label: "Product showcase", emoji: "📦", percent: 20 }
    ],
    sparkline: [2000, 6000, 18000, 52000, 140000, 290000, 470000]
  },
  {
    id: "tt-009",
    name: "greedy",
    artist: "Tate McRae",
    platform: "tiktok",
    useCount: 5440000,
    growthCount24h: 136000,
    growthPercent48h: 34,
    commercialStatus: "check",
    commercialNote: "RCA/Sony Music. Personal use fine — brand campaigns need a sync licence.",
    isNew: false,
    addedAt: "2026-03-15T12:00:00Z",
    categories: [
      { label: "Dance", emoji: "🕺", percent: 68 },
      { label: "Get Ready With Me", emoji: "💄", percent: 20 },
      { label: "Comedy", emoji: "😂", percent: 12 }
    ],
    sparkline: [980000, 1600000, 2400000, 3500000, 4400000, 5100000, 5440000]
  },
  {
    id: "tt-010",
    name: "Minimal House Loop 12",
    artist: "@studioatmosphere",
    platform: "both",
    useCount: 38000,
    growthCount24h: 9400,
    growthPercent48h: 520,
    commercialStatus: "clear",
    commercialNote: "Royalty-free. Full commercial use licence included. No attribution required.",
    isNew: true,
    addedAt: "2026-03-29T11:00:00Z",
    categories: [
      { label: "Product showcase", emoji: "📦", percent: 72 },
      { label: "Voiceover", emoji: "🗣️", percent: 28 }
    ],
    sparkline: [800, 1600, 4000, 9000, 18000, 28000, 38000]
  },
  {
    id: "tt-011",
    name: "Butter (Instrumental)",
    artist: "BTS",
    platform: "tiktok",
    useCount: 2280000,
    growthCount24h: 67000,
    growthPercent48h: 41,
    commercialStatus: "blocked",
    commercialNote: "HYBE/BigHit Music. Strict no-commercial policy. Do not use in brand content.",
    isNew: false,
    addedAt: "2026-03-18T09:00:00Z",
    categories: [
      { label: "Dance", emoji: "🕺", percent: 74 },
      { label: "Comedy", emoji: "😂", percent: 16 },
      { label: "Aesthetic", emoji: "🌸", percent: 10 }
    ],
    sparkline: [420000, 700000, 1100000, 1600000, 2000000, 2180000, 2280000]
  },
  {
    id: "tt-012",
    name: "Golden Hour Ambience",
    artist: "@vibesetters.co",
    platform: "tiktok",
    useCount: 124000,
    growthCount24h: 41000,
    growthPercent48h: 680,
    commercialStatus: "clear",
    commercialNote: "Creator-owned ambient track. Full commercial clearance. Perfect for brand content.",
    isNew: true,
    addedAt: "2026-03-29T15:00:00Z",
    categories: [
      { label: "Aesthetic", emoji: "🌸", percent: 44 },
      { label: "Lifestyle", emoji: "✨", percent: 36 },
      { label: "Voiceover", emoji: "🗣️", percent: 20 }
    ],
    sparkline: [1200, 3400, 8000, 22000, 48000, 82000, 124000]
  },
  {
    id: "tt-013",
    name: "Rich Flex",
    artist: "Drake & 21 Savage",
    platform: "tiktok",
    useCount: 7900000,
    growthCount24h: 112000,
    growthPercent48h: 21,
    commercialStatus: "blocked",
    commercialNote: "OVO Sound/Republic Records. Explicitly blocked for commercial use. High IP enforcement.",
    isNew: false,
    addedAt: "2026-03-08T10:00:00Z",
    categories: [
      { label: "Comedy", emoji: "😂", percent: 58 },
      { label: "Flex", emoji: "💎", percent: 28 },
      { label: "Dance", emoji: "🕺", percent: 14 }
    ],
    sparkline: [3400000, 4800000, 5900000, 6800000, 7400000, 7700000, 7900000]
  },
  {
    id: "tt-014",
    name: "What Was I Made For?",
    artist: "Billie Eilish",
    platform: "tiktok",
    useCount: 4100000,
    growthCount24h: 88000,
    growthPercent48h: 29,
    commercialStatus: "check",
    commercialNote: "Interscope/Universal. Sync licence required. Barbie association may affect brand suitability.",
    isNew: false,
    addedAt: "2026-03-12T08:00:00Z",
    categories: [
      { label: "Emotional", emoji: "💙", percent: 52 },
      { label: "Aesthetic", emoji: "🌸", percent: 28 },
      { label: "Voiceover", emoji: "🗣️", percent: 20 }
    ],
    sparkline: [980000, 1600000, 2300000, 3100000, 3700000, 4000000, 4100000]
  },
  {
    id: "tt-015",
    name: "Corporate Bop (Clean)",
    artist: "@workweekwaves",
    platform: "both",
    useCount: 680000,
    growthCount24h: 94000,
    growthPercent48h: 196,
    commercialStatus: "clear",
    commercialNote: "Made-for-brand track. 100% commercially cleared. Ideal for B2B and corporate content.",
    isNew: false,
    addedAt: "2026-03-28T10:00:00Z",
    categories: [
      { label: "Product showcase", emoji: "📦", percent: 60 },
      { label: "Voiceover", emoji: "🗣️", percent: 25 },
      { label: "Lifestyle", emoji: "✨", percent: 15 }
    ],
    sparkline: [18000, 46000, 110000, 240000, 420000, 570000, 680000]
  },

  // ── Instagram sounds ────────────────────────────────────────────────────────

  {
    id: "ig-001",
    name: "Creepin' (Remix)",
    artist: "Metro Boomin ft. The Weeknd",
    platform: "instagram",
    useCount: 3200000,
    growthCount24h: 198000,
    growthPercent48h: 89,
    commercialStatus: "check",
    commercialNote: "Republic Records. Requires paid sync licence for brand campaigns.",
    isNew: false,
    addedAt: "2026-03-24T09:00:00Z",
    categories: [
      { label: "Aesthetic", emoji: "🌸", percent: 42 },
      { label: "Get Ready With Me", emoji: "💄", percent: 35 },
      { label: "Travel", emoji: "✈️", percent: 23 }
    ],
    sparkline: [140000, 310000, 620000, 1200000, 2000000, 2700000, 3200000]
  },
  {
    id: "ig-002",
    name: "About Damn Time",
    artist: "Lizzo",
    platform: "instagram",
    useCount: 5600000,
    growthCount24h: 74000,
    growthPercent48h: 19,
    commercialStatus: "check",
    commercialNote: "Atlantic Records. Check brand safety — artist has ongoing public controversies.",
    isNew: false,
    addedAt: "2026-03-14T11:00:00Z",
    categories: [
      { label: "Motivation", emoji: "💪", percent: 46 },
      { label: "Dance", emoji: "🕺", percent: 32 },
      { label: "Comedy", emoji: "😂", percent: 22 }
    ],
    sparkline: [1800000, 2900000, 3800000, 4600000, 5100000, 5400000, 5600000]
  },
  {
    id: "ig-003",
    name: "Lo-Fi Study Session Vol. 3",
    artist: "@chillhopmusic",
    platform: "instagram",
    useCount: 920000,
    growthCount24h: 76000,
    growthPercent48h: 124,
    commercialStatus: "clear",
    commercialNote: "Chillhop Records grants commercial rights for social media content. Full clearance.",
    isNew: false,
    addedAt: "2026-03-26T14:00:00Z",
    categories: [
      { label: "Voiceover", emoji: "🗣️", percent: 52 },
      { label: "Product showcase", emoji: "📦", percent: 30 },
      { label: "Lifestyle", emoji: "✨", percent: 18 }
    ],
    sparkline: [32000, 72000, 160000, 340000, 580000, 780000, 920000]
  },
  {
    id: "ig-004",
    name: "Savage (Sped Up)",
    artist: "Megan Thee Stallion ft. Beyoncé",
    platform: "instagram",
    useCount: 2800000,
    growthCount24h: 146000,
    growthPercent48h: 73,
    commercialStatus: "blocked",
    commercialNote: "Sony/Columbia. Explicit content flag. Not cleared for commercial use.",
    isNew: false,
    addedAt: "2026-03-23T08:00:00Z",
    categories: [
      { label: "Dance", emoji: "🕺", percent: 70 },
      { label: "Motivation", emoji: "💪", percent: 20 },
      { label: "Comedy", emoji: "😂", percent: 10 }
    ],
    sparkline: [280000, 540000, 980000, 1600000, 2200000, 2600000, 2800000]
  },
  {
    id: "ig-005",
    name: "Perfect Day (Acoustic)",
    artist: "@acousticmornings",
    platform: "instagram",
    useCount: 58000,
    growthCount24h: 17600,
    growthPercent48h: 840,
    commercialStatus: "clear",
    commercialNote: "Original indie artist. Commercially cleared. DM @acousticmornings for attribution info.",
    isNew: true,
    addedAt: "2026-03-29T08:00:00Z",
    categories: [
      { label: "Lifestyle", emoji: "✨", percent: 50 },
      { label: "Aesthetic", emoji: "🌸", percent: 30 },
      { label: "Voiceover", emoji: "🗣️", percent: 20 }
    ],
    sparkline: [400, 1200, 4000, 12000, 28000, 42000, 58000]
  },
  {
    id: "ig-006",
    name: "Calm Piano Background",
    artist: "@studiominimalist",
    platform: "instagram",
    useCount: 1480000,
    growthCount24h: 112000,
    growthPercent48h: 108,
    commercialStatus: "clear",
    commercialNote: "Royalty-free composition. Commercial use permitted with no restrictions.",
    isNew: false,
    addedAt: "2026-03-27T12:00:00Z",
    categories: [
      { label: "Product showcase", emoji: "📦", percent: 48 },
      { label: "Voiceover", emoji: "🗣️", percent: 36 },
      { label: "Lifestyle", emoji: "✨", percent: 16 }
    ],
    sparkline: [68000, 140000, 310000, 620000, 980000, 1240000, 1480000]
  },
  {
    id: "ig-007",
    name: "As It Was",
    artist: "Harry Styles",
    platform: "instagram",
    useCount: 9100000,
    growthCount24h: 62000,
    growthPercent48h: 10,
    commercialStatus: "check",
    commercialNote: "Columbia Records. Legacy chart hit — still requires sync licence for commercial campaigns.",
    isNew: false,
    addedAt: "2026-03-05T09:00:00Z",
    categories: [
      { label: "Aesthetic", emoji: "🌸", percent: 38 },
      { label: "Travel", emoji: "✈️", percent: 32 },
      { label: "Emotional", emoji: "💙", percent: 18 },
      { label: "Dance", emoji: "🕺", percent: 12 }
    ],
    sparkline: [5200000, 6400000, 7300000, 8100000, 8600000, 8900000, 9100000]
  },
  {
    id: "ig-008",
    name: "Upbeat Retail Mix",
    artist: "@brandreadybeats",
    platform: "instagram",
    useCount: 340000,
    growthCount24h: 88000,
    growthPercent48h: 388,
    commercialStatus: "clear",
    commercialNote: "Created specifically for commercial content. Full commercial licence. No strings attached.",
    isNew: false,
    addedAt: "2026-03-28T16:00:00Z",
    categories: [
      { label: "Product showcase", emoji: "📦", percent: 82 },
      { label: "Voiceover", emoji: "🗣️", percent: 18 }
    ],
    sparkline: [6000, 18000, 48000, 110000, 200000, 270000, 340000]
  },
  {
    id: "ig-009",
    name: "Levitating",
    artist: "Dua Lipa",
    platform: "instagram",
    useCount: 6800000,
    growthCount24h: 54000,
    growthPercent48h: 12,
    commercialStatus: "check",
    commercialNote: "Warner Music. Popular and brand-safe tone, but licensing still required for commercial campaigns.",
    isNew: false,
    addedAt: "2026-03-09T10:00:00Z",
    categories: [
      { label: "Dance", emoji: "🕺", percent: 44 },
      { label: "Travel", emoji: "✈️", percent: 30 },
      { label: "Aesthetic", emoji: "🌸", percent: 26 }
    ],
    sparkline: [3600000, 4800000, 5600000, 6200000, 6500000, 6700000, 6800000]
  },
  {
    id: "ig-010",
    name: "Neon City Drive",
    artist: "@synthwavecollective",
    platform: "instagram",
    useCount: 72000,
    growthCount24h: 24000,
    growthPercent48h: 740,
    commercialStatus: "clear",
    commercialNote: "Indie synth collective. Commercially cleared for brand use. Tag @synthwavecollective in post.",
    isNew: true,
    addedAt: "2026-03-30T06:00:00Z",
    categories: [
      { label: "Product showcase", emoji: "📦", percent: 44 },
      { label: "Aesthetic", emoji: "🌸", percent: 34 },
      { label: "Travel", emoji: "✈️", percent: 22 }
    ],
    sparkline: [600, 2000, 6000, 18000, 38000, 58000, 72000]
  },
  {
    id: "ig-011",
    name: "Anti-Hero",
    artist: "Taylor Swift",
    platform: "instagram",
    useCount: 11200000,
    growthCount24h: 48000,
    growthPercent48h: 8,
    commercialStatus: "blocked",
    commercialNote: "Taylor Swift / Republic Records. Swift's team actively enforces IP — avoid completely for brand use.",
    isNew: false,
    addedAt: "2026-03-01T10:00:00Z",
    categories: [
      { label: "Comedy", emoji: "😂", percent: 42 },
      { label: "Emotional", emoji: "💙", percent: 30 },
      { label: "Aesthetic", emoji: "🌸", percent: 18 },
      { label: "Dance", emoji: "🕺", percent: 10 }
    ],
    sparkline: [7400000, 8600000, 9400000, 10100000, 10700000, 11000000, 11200000]
  },
  {
    id: "ig-012",
    name: "Morning Stretch Beats",
    artist: "@wellnesswave.music",
    platform: "both",
    useCount: 210000,
    growthCount24h: 58000,
    growthPercent48h: 342,
    commercialStatus: "clear",
    commercialNote: "Health & wellness label with open commercial licence for fitness and lifestyle brands.",
    isNew: false,
    addedAt: "2026-03-28T08:00:00Z",
    categories: [
      { label: "Fitness", emoji: "🏋️", percent: 56 },
      { label: "Lifestyle", emoji: "✨", percent: 28 },
      { label: "Voiceover", emoji: "🗣️", percent: 16 }
    ],
    sparkline: [4000, 12000, 32000, 72000, 130000, 172000, 210000]
  },
  {
    id: "tt-016",
    name: "Sky Full of Stars (Lo-Fi)",
    artist: "@dreamscapebeats",
    platform: "tiktok",
    useCount: 44000,
    growthCount24h: 13200,
    growthPercent48h: 610,
    commercialStatus: "check",
    commercialNote: "Lo-fi rework of a Coldplay original. Underlying composition still owned by Warner Chappell — check before use.",
    isNew: true,
    addedAt: "2026-03-30T09:30:00Z",
    categories: [
      { label: "Aesthetic", emoji: "🌸", percent: 54 },
      { label: "Travel", emoji: "✈️", percent: 28 },
      { label: "Voiceover", emoji: "🗣️", percent: 18 }
    ],
    sparkline: [600, 1800, 5000, 14000, 26000, 36000, 44000]
  },
  {
    id: "tt-018",
    name: "Just a Cloud Away",
    artist: "@cloudninebeats",
    platform: "tiktok",
    useCount: 310000,
    growthCount24h: 72000,
    growthPercent48h: 162,
    commercialStatus: "clear",
    commercialNote: "Independent creator. Commercially cleared for brand use. Tag in caption appreciated.",
    isNew: false,
    addedAt: "2026-03-28T13:00:00Z",
    categories: [
      { label: "Lifestyle", emoji: "✨", percent: 46 },
      { label: "Travel", emoji: "✈️", percent: 32 },
      { label: "Aesthetic", emoji: "🌸", percent: 22 }
    ],
    sparkline: [8000, 18000, 42000, 88000, 170000, 250000, 310000]
  },
  {
    id: "ig-013",
    name: "Karma",
    artist: "Taylor Swift",
    platform: "instagram",
    useCount: 4600000,
    growthCount24h: 104000,
    growthPercent48h: 31,
    commercialStatus: "blocked",
    commercialNote: "Taylor Swift / Republic Records. IP enforcement is aggressive — do not use for any commercial purpose.",
    isNew: false,
    addedAt: "2026-03-19T10:00:00Z",
    categories: [
      { label: "Comedy", emoji: "😂", percent: 50 },
      { label: "Flex", emoji: "💎", percent: 30 },
      { label: "Aesthetic", emoji: "🌸", percent: 20 }
    ],
    sparkline: [1200000, 1900000, 2700000, 3400000, 4000000, 4400000, 4600000]
  },
  {
    id: "tt-017",
    name: "Running Up That Hill",
    artist: "Kate Bush",
    platform: "tiktok",
    useCount: 3800000,
    growthCount24h: 92000,
    growthPercent48h: 32,
    commercialStatus: "blocked",
    commercialNote: "Fish People/EMI. Kate Bush controls her masters. Strictly no commercial use.",
    isNew: false,
    addedAt: "2026-03-17T11:00:00Z",
    categories: [
      { label: "Emotional", emoji: "💙", percent: 48 },
      { label: "Aesthetic", emoji: "🌸", percent: 32 },
      { label: "Montage", emoji: "🎬", percent: 20 }
    ],
    sparkline: [1200000, 1800000, 2400000, 3000000, 3400000, 3650000, 3800000]
  }
];

// ── Audio preview clips (royalty-free, SoundHelix CDN) ───────────────────────
// 6 distinct tracks rotated across sounds for demo playback
const PREVIEW_CLIPS = [
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',  // energetic electronic
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',  // chill groove
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',  // upbeat pop feel
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',  // lo-fi ambient
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',  // driving beat
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3', // mellow mood
];

// Assign stable clip index and preview URL to each sound
SOUNDS.forEach((s, i) => {
  s.clipIndex  = i % PREVIEW_CLIPS.length;
  s.previewUrl = PREVIEW_CLIPS[s.clipIndex];
});

module.exports = SOUNDS;
