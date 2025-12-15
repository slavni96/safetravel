# Safetravel — interactive visa & health map

Safetravel is a React + Vite app that visualizes visa/health requirements per country on an interactive Leaflet map, styled with an Apple-inspired glass UI.

## Features
- Search a country, spotlight it on the map, and view details in a bottom sheet.
- Country polygons colored by visa/e-authorization/vaccine classification (green/blue/yellow/red/purple).
- Bottom sheet shows capital/region/population/area/coords plus source, visa text, and health text (when available).
- Floating legend button opens a modal with the color key.
- Mobile-first layout with desktop adaptations.

## Data pipeline
1) **Generate raw entry data** from viaggiaresicuri.it (uses their JSON API):
```bash
npm run generate:requirements          # full dataset -> data/entry-requirements.json
npm run generate:requirements -- --country=TWN   # dry-run single country to stdout
```

2) **Classify** visa/e-auth/vaccine flags and colors (best-effort heuristics):
```bash
npm run classify:requirements          # updates data/entry-requirements.json
npm run classify:requirements -- --dry # preview to stdout
```

Notes:
- The generator skips Italy (ITA/IT) because the API returns only placeholders (“.”).
- Colors follow: green (no visa/no e-auth/no vaccines), blue (e-auth, no vaccines), yellow (e-auth + vaccines), red (visa, no vaccines), purple (visa + vaccines).

## Dev
```bash
npm install
npm run dev
npm run build
```

## Deployment (GitHub Pages)
- Workflow: `.github/workflows/deploy.yml` builds on pushes to main/master and deploys `dist` to GitHub Pages.
- Ensure repo settings: Pages → Source: GitHub Actions.

## Scripts
- `npm run generate:requirements` – fetch entry data (writes `data/entry-requirements.json`).
- `npm run classify:requirements` – infer booleans/colors from text and update the JSON.
- `npm run build` – type-check and bundle.
