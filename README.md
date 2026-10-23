# SwitchBoard — Interactive 3D Product Viewer

A browser-based interactive 3D product viewer for the redesigned modular household electrical switchboard. Built with **Three.js** and **GSAP** — no external CAD model required; geometry is constructed procedurally.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
```

Then open the URL shown in your terminal (typically **http://localhost:5173**).

---

## Production Build

```bash
npm run build
npm run preview   # serves the built output locally
```

---

## Features

| Control | How to use |
|---|---|
| **Orbit** | Left-click + drag |
| **Zoom** | Scroll wheel |
| **Pan** | Right-click + drag |
| **Select component** | Click any part of the board |
| **Day / Night** | Toolbar button — simulates photoluminescent glow in night mode |
| **Exploded view** | Toolbar button — separates housing, faceplate, buttons and symbol inserts |
| **Camera presets** | Toolbar: 3D (perspective) · Front · Side · Top (orthographic) |
| **Reset camera** | Toolbar reset button |

---

## 3D Model Structure

```
boardGroup
├── housing            — ABS back box with rounded corners
├── faceplate          — PC/ABS faceplate
├── screws (×4)        — Brushed-metal mounting screws
├── conduit            — Rear cable entry
│
├── switch_light       — Rocker button (Light)
│   ├── symbol_light   — Raised tactile symbol (bulb + rays)
│   └── glow_light     — Photoluminescent insert strip
│
├── switch_fan         — Rocker button (Fan)
│   ├── symbol_fan     — Raised tactile symbol (4-blade fan)
│   └── glow_fan       — Photoluminescent insert strip
│
├── switch_exhaust     — Rocker button (Exhaust)
│   ├── symbol_exhaust — Raised tactile symbol (vent + arrow)
│   └── glow_exhaust   — Photoluminescent insert strip
│
└── switch_socket      — Socket outlet
    ├── symbol_socket  — Raised tactile symbol (UK 3-pin)
    └── glow_socket    — Photoluminescent insert strip
```

---

## Technology Stack

| Library | Version | Purpose |
|---|---|---|
| [Three.js](https://threejs.org) | ^0.169 | 3D rendering, geometry, PBR materials |
| [GSAP](https://gsap.com) | ^3.12 | Smooth UI animations and transitions |
| [Vite](https://vitejs.dev) | ^5.4 | Dev server and bundler |

---

## Glow Simulation Note

Night mode simulates the visual appearance of photoluminescent (strontium aluminate) inserts using Three.js emissive materials and point lights. This is a visual design simulation only and does not claim to represent actual photoluminescent performance or certification.

---

## Project Structure

```
switchboard-viewer/
├── index.html          # HTML shell + UI overlay elements
├── package.json
├── src/
│   ├── main.js         # Three.js scene, geometry, interactions
│   └── style.css       # Dark studio theme, UI components
└── README.md
```
