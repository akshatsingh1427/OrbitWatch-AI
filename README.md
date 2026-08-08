# ORBITAL — Space Mission Control

A "Space Mission Control" SaaS dashboard built for the Frontend Wars 2026 hackathon. 100% client-side — all data is realistic mock generated in-browser, no backend, no APIs, no databases.

## Stack

- **React 18 + TypeScript + Vite** — app shell
- **Tailwind CSS** — dark "space command center" theme with custom color ramps
- **react-three-fiber + drei + three.js** — interactive 3D orbital view (procedural Earth shader, orbiting satellites)
- **recharts** — telemetry charts (area, line, bar, radial)
- **framer-motion** — tab transitions, staggered entrance animations, toasts, command palette
- **zustand** — lightweight store for active tab, live telemetry, alerts, subsystems, comms, resources
- **lucide-react** — icons

## Features

### 5 Tabs (sidebar navigation, collapses to bottom bar on mobile)
1. **Overview** — mission status cards, 3D orbital scene centerpiece, KPI strip with sparklines, active mission detail, mission roster
2. **Telemetry** — altitude/velocity/signal/power charts, live scrolling telemetry feed, position readout
3. **Comms & Health** — uplink/downlink link status, subsystem health bars, auto-scrolling alert log with severity badges
4. **Timeline** — animated horizontal stepper (Launch → Orbit Insertion → System Check → Payload Ops → Data Downlink → Mission End) with progress line fill
5. **Resources** — fuel radial gauge, power generation bar chart, data usage area chart, event counter

### 3D Scene (centerpiece)
- Procedural Earth with a custom GLSL shader (blue/green landmasses, fresnel atmosphere rim, fake day/night lighting) — no external textures
- 3 orbiting satellites (low-poly box body + thin plane solar panels) at different speeds/inclinations
- Orbit rings for visual clarity, atmospheric glow shell, star dust
- Interactive: drag to rotate, scroll to zoom, click a satellite to highlight + show floating info card
- Performance: capped `devicePixelRatio`, `useMemo` for geometries, touch devices get auto-rotate (drag disabled to avoid scroll conflicts)

### Differentiators
- **Keyboard shortcuts**: `1`–`5` jump tabs, `/` focus search, `?` toggle shortcut overlay, `⌘/Ctrl+K` command palette
- **Command palette** — fuzzy search tabs + missions, arrow-key navigation, Enter to execute
- **Live UTC clock** + "LINK OK" status pill in header
- **Toast notifications** — auto-dismissing, fire when a mock warning/critical alert generates
- **Loading skeletons** + staggered entrance animations so nothing pops in
- **Live data** — telemetry, subsystems, comms, and resources all tick on intervals with realistic jitter

## Architecture

```
src/
├── App.tsx                  # shell: header, sidebar, tab routing, live tick loops, loading state
├── main.tsx                 # entry
├── index.css                # Tailwind + custom glass/glow/scrollbar utilities
├── lib/
│   └── mockData.ts           # typed generators + simulated live-update functions
├── store/
│   └── useStore.ts           # zustand store (active tab, telemetry, alerts, subsystems, comms, resources, toasts, palette)
└── components/
    ├── Starfield.tsx         # canvas starfield background
    ├── Sidebar.tsx           # desktop sidebar + mobile bottom bar
    ├── HeaderClock.tsx       # UTC clock + link pill
    ├── Scene3D.tsx           # r3f Earth + satellites + orbit rings + click selection
    ├── Sparkline.tsx         # inline SVG sparkline
    ├── ui.tsx                # Panel, Skeleton, StatusBadge shared primitives
    ├── Toasts.tsx            # auto-dismissing toast stack
    ├── CommandPalette.tsx    # ⌘K fuzzy nav
    ├── KeyboardShortcuts.tsx # global key handler + shortcut overlay
    └── tabs/
        ├── OverviewTab.tsx
        ├── TelemetryTab.tsx
        ├── CommsTab.tsx
        ├── TimelineTab.tsx
        └── ResourcesTab.tsx
```

### Data flow
All data lives in `lib/mockData.ts` as typed interfaces (`Mission`, `Satellite`, `TelemetryPoint`, `Subsystem`, `CommsLink`, `AlertEvent`, `TimelineStage`, `ResourceData`). The zustand store holds the live state and exposes `tick*` functions that `App.tsx` calls on `setInterval` (2–4s per data type). Charts and readouts subscribe to the store and re-render on every tick.

## Run

```bash
npm install
npm run dev      # dev server on :5173
npm run build    # production build to dist/
npm run typecheck
```

## Notes
- All data is mock. No backend, no network calls, no Supabase — per competition rules.
- The 3D scene is the highest-risk component; if WebGL is unavailable the rest of the dashboard still works.
- Fonts (Inter + JetBrains Mono) load from Google Fonts via `<link>` in `index.html`.
