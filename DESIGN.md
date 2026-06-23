# Design

Visual system for Jaagruk — civic issue reporting platform.
Linear-inspired clarity. Urgent, trustworthy, empowering.

## Color

Strategy: **Restrained** — tinted neutrals + one accent ≤10%. Product default for a tool-first interface.

Mood: "Emergency dispatch console at dawn — crisp authority, focused urgency, civic steel."

### Palette (OKLCH)

```css
:root {
  /* Primary — deep civic violet, authoritative but not cold */
  --color-primary: oklch(0.420 0.170 268);
  --color-primary-hover: oklch(0.370 0.165 268);
  --color-primary-subtle: oklch(0.950 0.020 268);

  /* Background — pure white, Linear-clean */
  --color-bg: oklch(1.000 0.000 0);
  --color-surface: oklch(0.975 0.000 0);
  --color-surface-raised: oklch(0.985 0.000 0);

  /* Ink — near-black with the faintest violet lean */
  --color-ink: oklch(0.145 0.010 270);
  --color-muted: oklch(0.520 0.008 270);

  /* Accent — warm amber for urgency signals, status, CTAs */
  --color-accent: oklch(0.680 0.175 60);
  --color-accent-hover: oklch(0.620 0.170 60);

  /* Semantic — status colors for complaint lifecycle */
  --color-success: oklch(0.580 0.150 150);
  --color-warning: oklch(0.750 0.160 80);
  --color-error: oklch(0.550 0.190 25);
  --color-info: oklch(0.600 0.130 245);

  /* Status-specific (complaint states) */
  --color-status-submitted: oklch(0.600 0.130 245);
  --color-status-in-progress: oklch(0.680 0.175 60);
  --color-status-resolved: oklch(0.580 0.150 150);
  --color-status-rejected: oklch(0.520 0.008 270);
}
```

### Usage rules

- Primary on white for buttons, links, active states. White text on primary fills.
- Accent (amber) reserved for urgency: new reports, unread updates, CTAs. White text on accent fills.
- Status colors map directly to complaint lifecycle. Never decorative.
- Ink at 7:1+ contrast on bg. Muted at 4.5:1+ on bg.

## Typography

```css
:root {
  /* Font stack — Inter for UI, system fallback for speed */
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;

  /* Scale — minor third (1.200), clamped for responsive */
  --text-xs: clamp(0.694rem, 0.65vi + 0.5rem, 0.75rem);
  --text-sm: clamp(0.833rem, 0.8vi + 0.6rem, 0.875rem);
  --text-base: clamp(0.938rem, 0.9vi + 0.65rem, 1rem);
  --text-lg: clamp(1.125rem, 1.1vi + 0.75rem, 1.2rem);
  --text-xl: clamp(1.35rem, 1.3vi + 0.85rem, 1.44rem);
  --text-2xl: clamp(1.62rem, 1.6vi + 1rem, 1.728rem);
  --text-3xl: clamp(1.944rem, 1.9vi + 1.15rem, 2.074rem);
  --text-4xl: clamp(2.333rem, 2.3vi + 1.35rem, 2.488rem);

  /* Line heights */
  --leading-tight: 1.2;
  --leading-normal: 1.5;
  --leading-relaxed: 1.65;

  /* Letter spacing */
  --tracking-tight: -0.02em;
  --tracking-normal: 0em;
  --tracking-wide: 0.025em;

  /* Measure — cap body text at 65ch */
  --measure: 65ch;
}
```

### Type rules

- Body: `--text-base`, `--leading-normal`, `--tracking-normal`. Max-width `--measure`.
- Headings: `--leading-tight`, `--tracking-tight`. Use `text-wrap: balance` on h1–h3.
- Complaint IDs and timestamps: `--font-mono`, `--text-sm`.
- No font pairing — Inter carries all weights. Bold (600) for emphasis, Semibold (500) for subheads.
- Hindi text uses the same Inter (it has Devanagari support) or falls back to Noto Sans Devanagari.

## Spacing

```css
:root {
  /* 4px base, geometric scale */
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.5rem;    /* 24px */
  --space-6: 2rem;      /* 32px */
  --space-7: 3rem;      /* 48px */
  --space-8: 4rem;      /* 64px */
  --space-9: 6rem;      /* 96px */
}
```

## Radii

```css
:root {
  --radius-sm: 0.375rem;   /* 6px — inputs, small chips */
  --radius-md: 0.5rem;     /* 8px — cards, buttons */
  --radius-lg: 0.75rem;    /* 12px — modals, dialogs */
  --radius-full: 9999px;   /* pills, avatars */
}
```

## Shadows

```css
:root {
  --shadow-sm: 0 1px 2px oklch(0.000 0.000 0 / 0.05);
  --shadow-md: 0 4px 6px -1px oklch(0.000 0.000 0 / 0.07),
               0 2px 4px -2px oklch(0.000 0.000 0 / 0.05);
  --shadow-lg: 0 10px 15px -3px oklch(0.000 0.000 0 / 0.08),
               0 4px 6px -4px oklch(0.000 0.000 0 / 0.04);
  --shadow-focus: 0 0 0 3px oklch(0.420 0.170 268 / 0.25);
}
```

## Motion

Energy: **Functional-fast** — Linear-style. Motion communicates state change, never decorates.

```css
:root {
  --duration-instant: 100ms;
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 400ms;

  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);      /* expo out */
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);   /* expo in-out */
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-instant: 0ms;
    --duration-fast: 0ms;
    --duration-normal: 0ms;
    --duration-slow: 0ms;
  }
}
```

### Motion rules

- Status changes (submitted → in progress → resolved): crossfade + subtle scale, `--duration-normal`.
- Page transitions: none. Instant navigation, Linear-style.
- Hover/focus: `--duration-fast`, `--ease-out`. Opacity or background shifts only.
- Loading states: skeleton shimmer at `--duration-slow`, looping.
- Never animate images. Never bounce or elastic ease.

## Layout

- **Mobile-first**: 320px minimum viewport. Single column default.
- **Breakpoints**: `640px` (sm), `768px` (md), `1024px` (lg), `1280px` (xl).
- **Container**: max-width `1120px`, centered, `--space-4` inline padding.
- **Grid**: `repeat(auto-fit, minmax(280px, 1fr))` for complaint cards.
- **Touch targets**: minimum 48×48px. Minimum gap between interactive elements: 8px.
- **Bottom nav** on mobile (report, my complaints, notifications, profile).

## Z-index scale

```css
:root {
  --z-dropdown: 10;
  --z-sticky: 20;
  --z-modal-backdrop: 30;
  --z-modal: 40;
  --z-toast: 50;
  --z-tooltip: 60;
}
```

## Components

### Complaint Card
- Surface bg, `--radius-md`, `--shadow-sm`.
- Status pill (top-right): filled with status color, white text, `--radius-full`.
- Photo thumbnail (if attached): 80×80px, `--radius-sm`, `object-fit: cover`.
- Category icon + title (truncated at 2 lines).
- Location (muted text) + relative timestamp.
- Upvote count (if community-facing).

### Report Form
- Stepped flow: Location → Category → Photo → Description → Submit.
- Progress indicator: segmented bar, filled segments use `--color-primary`.
- Photo capture: native camera integration on mobile, drag-drop on desktop.
- Pin-drop map for location (Leaflet/OpenStreetMap for zero cost).

### Status Timeline
- Vertical timeline with status-colored dots.
- Each node: status label, timestamp, assignee (if applicable).
- Current status node is larger, pulsing gently (reduced motion: static).

### Navigation
- Mobile: fixed bottom bar, 4 items, icon + label.
- Desktop: left sidebar, collapsible, icons + labels.
- Active state: `--color-primary` icon + text, subtle bg tint.
