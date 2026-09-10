/**
 * SIH26143 — Marine Oil-Spill Detection, Source Attribution & Alert System
 * Leaflet Map Visualization & Tactical Tactical Layers Engine
 */

let mapInstance = null;
let maritimeBaseLayer = null;
let maritimeLabelsLayer = null;
let bathymetryLayer = null;
let depthContoursLayer = null;
let spillsLayerGroup = null;
let vesselsLayerGroup = null;
let stationsLayerGroup = null;

// Registry of markers by ID to support programmatic focus & highlighting
const spillMarkers = {};
const vesselMarkers = {};
let onSpillSelectCallback = null;

/**
 * Initialize Leaflet Map centered over Indian Maritime Waters (EEZ, Arabian Sea, Bay of Bengal)
 */
export function initTacticalMap(containerId = 'leaflet-map', onSelectSpill) {
  if (mapInstance) return mapInstance;
  onSpillSelectCallback = onSelectSpill;

  // Center coordinates over Indian subcontinent maritime zone with explicit full interaction
  mapInstance = L.map(containerId, {
    center: [16.5, 75.5],
    zoom: 5,
    minZoom: 3,
    maxZoom: 18,
    zoomControl: false,
    attributionControl: true,
    dragging: true,
    scrollWheelZoom: true,
    doubleClickZoom: true,
    touchZoom: true,
    boxZoom: true,
    keyboard: true,
    bounceAtZoomLimits: true
  });

  // Explicitly ensure all interaction handlers are active
  if (mapInstance.dragging) mapInstance.dragging.enable();
  if (mapInstance.scrollWheelZoom) mapInstance.scrollWheelZoom.enable();
  if (mapInstance.doubleClickZoom) mapInstance.doubleClickZoom.enable();
  if (mapInstance.touchZoom) mapInstance.touchZoom.enable();
  if (mapInstance.boxZoom) mapInstance.boxZoom.enable();
  if (mapInstance.keyboard) mapInstance.keyboard.enable();

  // Re-position zoom control to bottom right
  L.control.zoom({ position: 'bottomright' }).addTo(mapInstance);

  // Create dedicated custom panes for granular layer blending & stacking
  mapInstance.createPane('bathymetryPane');
  mapInstance.getPane('bathymetryPane').style.zIndex = 220;

  mapInstance.createPane('contoursPane');
  mapInstance.getPane('contoursPane').style.zIndex = 230;

  mapInstance.createPane('labelsPane');
  mapInstance.getPane('labelsPane').style.zIndex = 450;
  mapInstance.getPane('labelsPane').style.pointerEvents = 'none';

  // 1. Maritime Dark Base Layer (Esri Dark Gray Canvas - No API Key, No Watermark, Clean Deep Palette)
  maritimeBaseLayer = L.tileLayer('https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 16,
    attribution: 'Base: &copy; <a href="https://www.esri.com/" target="_blank" rel="noopener noreferrer">Esri</a>, HERE, Garmin'
  }).addTo(mapInstance);

  // 2. GEBCO Global Bathymetry WMS Layer (Official GEBCO shaded relief grid for seabed depth variations)
  bathymetryLayer = L.tileLayer.wms('https://wms.gebco.net/mapserv?', {
    layers: 'GEBCO_LATEST',
    format: 'image/png',
    transparent: true,
    pane: 'bathymetryPane',
    attribution: 'Bathymetry: &copy; <a href="https://www.gebco.net/" target="_blank" rel="noopener noreferrer">GEBCO</a>'
  }).addTo(mapInstance);

  // 3. Depth Contours & Nautical Navigation Layer (OpenSeaMap transparent depth sectors and seamarks)
  depthContoursLayer = L.tileLayer('https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png', {
    maxZoom: 18,
    pane: 'contoursPane',
    attribution: 'Nautical &copy; <a href="https://www.openseamap.org" target="_blank" rel="noopener noreferrer">OpenSeaMap</a>'
  }).addTo(mapInstance);

  // Geographic Reference Labels (Clean, crisp country, sea, and city labels)
  maritimeLabelsLayer = L.tileLayer('https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 16,
    pane: 'labelsPane'
  }).addTo(mapInstance);

  // Initialize Tactical Layer Groups
  spillsLayerGroup = L.layerGroup().addTo(mapInstance);
  vesselsLayerGroup = L.layerGroup().addTo(mapInstance);
  stationsLayerGroup = L.layerGroup().addTo(mapInstance);

  // Invalidate size once initial layout settles
  setTimeout(() => {
    mapInstance.invalidateSize();
  }, 100);

  // Expose on window for programmatic verification and inspection
  window.mapInstance = mapInstance;

  return mapInstance;
}

/**
 * Render Oil Spill Markers with Concentric Radar Pulse Waves
 */
export function renderSpillsLayer(spills) {
  if (!spillsLayerGroup) return;
  spillsLayerGroup.clearLayers();

  spills.forEach(spill => {
    const isHighlight = spill.id === 'OS-024';
    
    // Custom pulsing SVG DivIcon
    const pulseIcon = L.divIcon({
      className: 'spill-marker-wrapper',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      html: `
        <div class="spill-marker-container" title="Oil Spill ${spill.id} (${spill.slickType})">
          <div class="spill-pulse-wave"></div>
          <div class="spill-pulse-wave delay"></div>
          <div class="spill-marker-core" style="${isHighlight ? 'width: 16px; height: 16px; background: #e85d5d; box-shadow: 0 0 14px #e85d5d;' : ''}"></div>
        </div>
      `
    });

    const marker = L.marker([spill.lat, spill.lng], { icon: pulseIcon });

    // Custom dark tactical popup
    const popupHtml = `
      <div style="font-family: 'Space Grotesk', sans-serif; min-width: 210px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 6px; border-bottom: 1px solid rgba(143,163,174,0.2); padding-bottom: 4px;">
          <span style="font-weight:700; color:#e85d5d; letter-spacing:0.06em; font-size:12px;">INCIDENT ${spill.id}</span>
          <span style="font-size:9px; background:rgba(232,93,93,0.15); border:1px solid rgba(232,93,93,0.4); color:#e85d5d; padding:2px 5px; border-radius:3px; font-weight:700;">${spill.riskLevel} RISK</span>
        </div>
        <div style="font-size:11px; color:#F4F7F8; font-weight:600; margin-bottom:4px;">${spill.name}</div>
        <div style="font-size:10px; color:#8FA3AE; margin-bottom:8px;">${spill.locationName}</div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; font-family:'JetBrains Mono', monospace; font-size:10px; background:#122D3D; padding:6px 8px; border-radius:3px; margin-bottom:8px;">
          <div><span style="color:#8FA3AE; font-size:9px; font-family:'Space Grotesk';">AREA:</span><br><b style="color:#18A6A6;">${spill.areaKm2} km²</b></div>
          <div><span style="color:#8FA3AE; font-size:9px; font-family:'Space Grotesk';">AIS:</span><br><b style="color:${spill.aisStatus === 'UNAVAILABLE' ? '#F4B942' : '#18A6A6'};">${spill.aisStatus}</b></div>
        </div>
        <button id="popup-btn-${spill.id}" style="width:100%; background:#18A6A6; color:#071521; border:none; padding:5px 8px; font-size:10px; font-weight:700; border-radius:3px; cursor:pointer; font-family:'Space Grotesk'; text-transform:uppercase; letter-spacing:0.06em;">
          Inspect Incident Dossier
        </button>
      </div>
    `;

    marker.bindPopup(popupHtml, { offset: [0, -10] });

    marker.on('click', () => {
      if (onSpillSelectCallback) {
        onSpillSelectCallback(spill.id);
      }
    });

    marker.on('popupopen', () => {
      const btn = document.getElementById(`popup-btn-${spill.id}`);
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (onSpillSelectCallback) onSpillSelectCallback(spill.id);
        });
      }
    });

    spillsLayerGroup.addLayer(marker);
    spillMarkers[spill.id] = marker;
  });
}

/**
 * Render Monitored Vessels with Directional Heading
 */
export function renderVesselsLayer(vessels) {
  if (!vesselsLayerGroup) return;
  vesselsLayerGroup.clearLayers();

  vessels.forEach(vessel => {
    const isDark = vessel.aisStatus === 'UNAVAILABLE';
    const color = isDark ? '#F4B942' : '#4EA8DE';
    const heading = vessel.heading || 0;

    // Custom SVG ship marker oriented by vessel true heading
    const shipIcon = L.divIcon({
      className: 'vessel-marker-wrapper',
      iconSize: [26, 26],
      iconAnchor: [13, 13],
      html: `
        <div class="vessel-marker-container" style="transform: rotate(${heading}deg);" title="${vessel.name} [${vessel.type}]">
          <svg class="vessel-svg-icon ${isDark ? 'ais-dark' : 'ais-normal'}" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 19 21 12 17 5 21 12 2" fill="${color}" fill-opacity="0.25"/>
          </svg>
        </div>
      `
    });

    const marker = L.marker([vessel.lat, vessel.lng], { icon: shipIcon });

    const popupHtml = `
      <div style="font-family: 'Space Grotesk', sans-serif; min-width: 200px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 4px; border-bottom: 1px solid rgba(143,163,174,0.2); padding-bottom: 4px;">
          <span style="font-weight:700; color:${color}; font-size:11px;">${vessel.name}</span>
          <span style="font-size:9px; background:${isDark ? 'rgba(244,185,66,0.15)' : 'rgba(78,168,222,0.15)'}; color:${color}; padding:2px 5px; border-radius:2px; font-weight:700;">
            ${isDark ? 'AIS DARK' : 'AIS ACTIVE'}
          </span>
        </div>
        <div style="font-size:10px; color:#8FA3AE; margin-bottom:6px;">Type: <b style="color:#F4F7F8;">${vessel.type}</b></div>
        <div style="font-size:10px; color:#8FA3AE; margin-bottom:6px;">Flag: <b style="color:#F4F7F8;">${vessel.flag}</b></div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px; font-family:'JetBrains Mono', monospace; font-size:10px; background:#122D3D; padding:5px 8px; border-radius:3px; margin-bottom:6px;">
          <div><span style="color:#8FA3AE; font-size:8px;">SPEED:</span><br><b style="color:#18A6A6;">${vessel.speedKnots} kts</b></div>
          <div><span style="color:#8FA3AE; font-size:8px;">HEADING:</span><br><b style="color:#18A6A6;">${vessel.heading}°</b></div>
        </div>
        <div style="font-size:9px; color:#8FA3AE; font-style:italic;">${vessel.statusNote}</div>
      </div>
    `;

    marker.bindPopup(popupHtml, { offset: [0, -10] });
    vesselsLayerGroup.addLayer(marker);
    vesselMarkers[vessel.id] = marker;
  });
}

/**
 * Render Coast Guard Response Stations
 */
export function renderStationsLayer(stations) {
  if (!stationsLayerGroup) return;
  stationsLayerGroup.clearLayers();

  stations.forEach(station => {
    const stationIcon = L.divIcon({
      className: 'station-marker-wrapper',
      iconSize: [26, 26],
      iconAnchor: [13, 13],
      html: `
        <div class="station-marker-container" title="${station.name}">
          <div class="station-marker-pin">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
        </div>
      `
    });

    const marker = L.marker([station.lat, station.lng], { icon: stationIcon });

    const popupHtml = `
      <div style="font-family: 'Space Grotesk', sans-serif; min-width: 220px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 4px; border-bottom: 1px solid rgba(143,163,174,0.2); padding-bottom: 4px;">
          <span style="font-weight:700; color:#18A6A6; font-size:11px;">${station.code}</span>
          <span style="font-size:9px; background:rgba(24,166,166,0.15); color:#18A6A6; padding:2px 5px; border-radius:2px; font-weight:700;">
            ${station.status}
          </span>
        </div>
        <div style="font-size:11px; color:#F4F7F8; font-weight:600; margin-bottom:4px;">${station.name}</div>
        <div style="font-size:10px; color:#8FA3AE; margin-bottom:6px;">${station.readinessTier}</div>
        <div style="font-size:10px; background:#122D3D; padding:6px 8px; border-radius:3px; margin-bottom:4px; font-family:'JetBrains Mono', monospace;">
          <div><span style="color:#8FA3AE; font-size:8px;">BOOM CAPACITY:</span> <b style="color:#F4F7F8;">${station.containmentBoomMeters}m</b></div>
          <div><span style="color:#8FA3AE; font-size:8px;">DISPERSANT:</span> <b style="color:#F4F7F8;">${station.dispersantLitres}L</b></div>
          <div><span style="color:#8FA3AE; font-size:8px;">PATROL VESSELS:</span> <b style="color:#18A6A6;">${station.vesselAssets}</b></div>
        </div>
        <div style="font-size:9px; color:#8FA3AE;">Comm: ${station.contactFreq}</div>
      </div>
    `;

    marker.bindPopup(popupHtml, { offset: [0, -12] });
    stationsLayerGroup.addLayer(marker);
  });
}

/**
 * Toggle map layer visibility by name
 */
export function toggleMapLayer(layerName, isVisible) {
  if (!mapInstance) return;

  if (layerName === 'spills' && spillsLayerGroup) {
    if (isVisible) mapInstance.addLayer(spillsLayerGroup);
    else mapInstance.removeLayer(spillsLayerGroup);
  } else if (layerName === 'vessels' && vesselsLayerGroup) {
    if (isVisible) mapInstance.addLayer(vesselsLayerGroup);
    else mapInstance.removeLayer(vesselsLayerGroup);
  } else if (layerName === 'stations' && stationsLayerGroup) {
    if (isVisible) mapInstance.addLayer(stationsLayerGroup);
    else mapInstance.removeLayer(stationsLayerGroup);
  } else if (layerName === 'bathymetry' && bathymetryLayer) {
    if (isVisible) mapInstance.addLayer(bathymetryLayer);
    else mapInstance.removeLayer(bathymetryLayer);
  } else if (layerName === 'contours' && depthContoursLayer) {
    if (isVisible) mapInstance.addLayer(depthContoursLayer);
    else mapInstance.removeLayer(depthContoursLayer);
  }
}

/**
 * Pan and Zoom to a specific spill incident
 */
export function focusIncidentOnMap(spillId, lat, lng, zoom = 8) {
  if (!mapInstance) return;
  mapInstance.flyTo([lat, lng], zoom, {
    animate: true,
    duration: 1.2
  });

  const marker = spillMarkers[spillId];
  if (marker) {
    setTimeout(() => {
      marker.openPopup();
    }, 1200);
  }
}

/**
 * Invalidate map size (essential when switching between views)
 */
export function invalidateMapSize() {
  if (!mapInstance) return;
  requestAnimationFrame(() => {
    mapInstance.invalidateSize({ animate: false });
  });
}
