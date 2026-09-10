# SIH26143 — Marine Oil-Spill Detection, Source Attribution & Alert System

A mission-control grade maritime intelligence frontend prototype built for the **Smart India Hackathon (SIH 2026)**.

---

## 1. Problem Statement & Scope

**Problem Statement ID**: `SIH26143`  
**Focus Area**: Marine Oil-Spill Detection, Source Attribution & Alert System.

This platform provides surveillance, detection, and forensic attribution of marine oil spills, with an emphasis on solving the **AIS-missing / dark vessel case**:

- **Standard Workflow**: Oil spill detected &rarr; AIS transponder available &rarr; Spatial-temporal AIS track correlation &rarr; Responsible candidate vessel identified.
- **Critical USP (Hard Case)**: Oil spill detected &rarr; AIS unavailable / transponder extinguished &rarr; AIS-independent SAR satellite analysis &rarr; Vessel size/feature classification (CFAR) &rarr; Hydrodynamic particle backtracking &rarr; Forensic candidate ranking.

---

## 2. Current Prototype Status

This repository contains the **Foundation & Command Center (Module 1)**:
- **Architecture**: Single-Page Application (SPA) with zero build steps or heavy framework overhead.
- **Design Aesthetic**: Dark, precise, technical mission control inspired by naval defense command systems.
- **Implemented View**: **Command Center** featuring:
  - Interactive Leaflet map with dark maritime tiles covering the Indian EEZ (Arabian Sea, Bay of Bengal, Indian Ocean).
  - Custom pulsing radar SVG markers for oil spills.
  - Heading-oriented vessel markers highlighting AIS-dark vs. AIS-active targets.
  - Coast Guard response base pins with boom & dispersant readiness metrics.
  - Active incidents sidebar (`OS-024`, `OS-019`, `OS-011`) with click-to-focus map synchronization.
  - Slide-in Incident Dossier drawer for `OS-024` with detection telemetry and direct link to attribution analysis.
  - Map layer toggles (Spills, Vessels, Coast Guard Bases) and tactical legend.
  - Real-time live UTC clock and aggregate metric strip.
- **Future Module Containers**: Clean placeholder containers for Modules 2 to 5 (`Spill Monitoring`, `Source Attribution`, `Drift & Risk`, `Alerts & Response`) ready for seamless expansion.

---

## 3. Technology Stack

- **Markup**: Semantic HTML5
- **Styling**: Vanilla CSS3 (Custom CSS variables, dark nautical color system, responsive grid)
- **Logic**: Vanilla JavaScript (ES6 Modules)
- **Mapping**: Leaflet.js (CartoDB Dark Matter tiles)
- **Icons**: Lucide Icons (CDN)
- **Fonts**: Space Grotesk (Headings), Inter (Body), JetBrains Mono (Telemetry)

---

## 4. Project Directory Structure

```
/
├── index.html            # Main single-page application shell
├── css/
│   └── style.css         # Dark mission-control theme & styling
├── js/
│   ├── app.js            # App controller, SPA router, UTC clock, UI events
│   ├── map.js            # Leaflet engine, animated SVG markers, layer controls
│   └── mockData.js       # Mock datasets & async API abstraction layer
├── assets/
│   ├── images/           # Visual assets
│   └── icons/            # Tactical iconography
└── README.md             # Project documentation
```

---

## 5. Mock Data & Python Notebook / API Integration

All components consume data exclusively through the asynchronous getter functions in [`js/mockData.js`](file:///c:/Users/prana/Downloads/sih_2026/SIH26143-Marine-Intelligence/js/mockData.js):

- `getSpills()`
- `getIncidentById(id)`
- `getVessels()`
- `getResponseStations()`
- `getStats()`
- `getAttribution(incidentId)` *(Future ML endpoint)*
- `getDriftData(incidentId)` *(Future hydrodynamic endpoint)*
- `getRiskData(incidentId)` *(Future environmental sensitivity endpoint)*
- `getAlerts()` *(Future dispatch endpoint)*

### To connect a Python Backend / Notebook:
Replace the Promise resolutions in `js/mockData.js` with standard `fetch()` requests against your Python API (FastAPI, Flask, or Jupyter REST kernel):

```javascript
// Example future API connection:
export async function getSpills() {
  const response = await fetch('http://localhost:8000/api/v1/spills');
  return response.json();
}
```

---

## 6. Running Locally

No build tools, npm, or bundlers are required. Run using any local development server:

### Option A: Python Built-in Server
```bash
python -m http.server 8080
```
Then visit [http://localhost:8080](http://localhost:8080) in your browser.

### Option B: Node / npx serve
```bash
npx serve .
```

### Option C: VS Code Live Server
Right-click `index.html` and select **"Open with Live Server"**.
