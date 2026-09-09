# Marine Oil-Spill Detection, Source Attribution & Alert System

SIH26143 — NTRO / Space Technology theme.

## What this is

A prototype that takes a detected oil spill (SAR-derived location/time),
estimates where it likely originated (backward drift), and produces a
ranked list of **candidate** vessels responsible - using AIS data when
available, and falling back to SAR-image-based vessel classification
(type, size, confidence) when AIS is unavailable or was switched off.

**This system never produces a definitive legal accusation.** All outputs
are investigative candidate assessments with confidence scores and
disclaimers.

## Current status

🚧 Early scaffolding stage. See `docs/progress.md` for what's real vs. simulated.

- [x] Project structure
- [x] Naive rule-based baseline classifier (`ml-service/classifier/baseline_stub.py`)
- [ ] Real vessel-type/size classifier (trained on OpenSARShip)
- [ ] AIS candidate matching
- [ ] AIS-missing fallback
- [ ] Drift model
- [ ] Habitat-risk overlay
- [ ] Alert engine
- [ ] Leaflet dashboard

## Project structure

```
backend/       Node.js + Express API
ml-service/    Python FastAPI service: classifier, feature extraction, drift model
frontend/      Leaflet.js dashboard
data/          raw / processed / sample / geojson data (raw & processed gitignored)
notebooks/     exploration & evaluation notebooks
config/        scoring weights and other tunable parameters
tests/         unit tests
docs/          notes on assumptions, limitations, and what's simulated vs real
```

## Setup

See `docs/setup.md` for full instructions. Quick start for the ML side:

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 ml-service/classifier/baseline_stub.py
```

## Important caveats

- Oil-spill *detection* itself is simulated/sample data in this prototype - we
  start from a given spill polygon, we do not run detection on raw satellite
  imagery.
- AIS data is historical/sample, not a live feed.
- No output should ever be read as a definitive attribution of fault.
