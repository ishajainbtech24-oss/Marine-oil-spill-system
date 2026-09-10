/**
 * SIH26143 — Marine Oil-Spill Detection, Source Attribution & Alert System
 * Application Controller & Orchestration Hub
 */

import {
  getSpills,
  getIncidentById,
  getVessels,
  getResponseStations,
  getStats
} from './mockData.js';

import {
  initTacticalMap,
  renderSpillsLayer,
  renderVesselsLayer,
  renderStationsLayer,
  toggleMapLayer,
  focusIncidentOnMap,
  invalidateMapSize
} from './map.js';

// State Management
const appState = {
  currentView: 'command-center',
  selectedIncidentId: 'OS-024',
  layers: {
    bathymetry: true,
    contours: true,
    spills: true,
    vessels: true,
    stations: true
  }
};

/**
 * Initialize Application on DOM Ready
 */
document.addEventListener('DOMContentLoaded', async () => {
  initUTCClock();
  initNavigation();
  initLayerToggles();
  initDrawerControls();

  // Initialize Tactical Leaflet Map
  initTacticalMap('leaflet-map', (spillId) => {
    handleSelectIncident(spillId);
  });

  // Load operational datasets through the async API abstraction
  await loadDashboardData();

  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Pre-select primary incident OS-024
  handleSelectIncident('OS-024', false);
});

/**
 * Live UTC Clock Tick Engine
 */
function initUTCClock() {
  const clockElement = document.getElementById('utc-clock-display');
  if (!clockElement) return;

  function updateTime() {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds = String(now.getUTCSeconds()).padStart(2, '0');

    clockElement.textContent = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  updateTime();
  setInterval(updateTime, 1000);
}

/**
 * SPA View Switching Architecture
 */
function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const returnButtons = document.querySelectorAll('[data-return]');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetView = item.getAttribute('data-view');
      if (targetView) switchView(targetView);
    });
  });

  returnButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const returnTarget = btn.getAttribute('data-return');
      if (returnTarget) switchView(returnTarget);
    });
  });

  // Handle URL hash changes
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash && document.getElementById(`view-${hash}`)) {
      switchView(hash, false);
    }
  });

  // Initial check for hash
  if (window.location.hash) {
    const initialHash = window.location.hash.replace('#', '');
    if (document.getElementById(`view-${initialHash}`)) {
      switchView(initialHash, false);
    }
  }
}

/**
 * Switch Active View Container
 */
export function switchView(viewId, updateHistory = true) {
  if (appState.currentView === viewId) return;

  // Update Nav Items
  document.querySelectorAll('.nav-item').forEach(item => {
    const isActive = item.getAttribute('data-view') === viewId;
    item.classList.toggle('active', isActive);
  });

  // Update View Containers
  document.querySelectorAll('.view-container').forEach(container => {
    const isTarget = container.id === `view-${viewId}`;
    container.classList.toggle('active-view', isTarget);
  });

  appState.currentView = viewId;

  if (updateHistory) {
    window.location.hash = viewId;
  }

  // When switching back to Command Center, recalculate Leaflet canvas size
  if (viewId === 'command-center') {
    invalidateMapSize();
  }

  // Refresh Lucide icons if any rendered inside newly visible view
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

/**
 * Load Data and Populate Command Center Components
 */
async function loadDashboardData() {
  try {
    // 1. Fetch System Aggregate Stats
    const stats = await getStats();
    if (stats) {
      document.getElementById('stat-active-spills').textContent = String(stats.activeSpills).padStart(2, '0');
      document.getElementById('stat-vessels-monitored').textContent = String(stats.vesselsMonitored);
      document.getElementById('stat-ais-gaps').textContent = String(stats.aisGaps).padStart(2, '0');
      document.getElementById('stat-high-risk').textContent = String(stats.highRiskZones).padStart(2, '0');
      document.getElementById('stat-active-alerts').textContent = String(stats.activeAlerts).padStart(2, '0');
    }

    // 2. Fetch Spills and Render to Map and List
    const spills = await getSpills();
    renderSpillsLayer(spills);
    renderActiveIncidentsList(spills);

    // 3. Fetch Vessels and Render to Map
    const vessels = await getVessels();
    renderVesselsLayer(vessels);

    // 4. Fetch Response Stations and Render to Map
    const stations = await getResponseStations();
    renderStationsLayer(stations);

  } catch (error) {
    console.error('Failed to load maritime intelligence telemetry:', error);
  }
}

/**
 * Render Active Incidents List in Right Sidebar Panel
 */
function renderActiveIncidentsList(spills) {
  const container = document.getElementById('active-incidents-list');
  if (!container) return;

  container.innerHTML = '';

  spills.forEach(spill => {
    const card = document.createElement('div');
    card.className = `incident-card ${spill.id === appState.selectedIncidentId ? 'active-selected' : ''}`;
    card.id = `incident-card-${spill.id}`;

    const riskClass = spill.riskLevel === 'HIGH' ? 'risk-high' : spill.riskLevel === 'MEDIUM' ? 'risk-medium' : 'risk-low';
    const aisClass = spill.aisStatus === 'UNAVAILABLE' ? 'ais-missing' : 'ais-available';

    card.innerHTML = `
      <div class="incident-card-top">
        <div class="incident-id-badge">
          <span class="bullet" style="${spill.riskLevel === 'HIGH' ? 'background:#e85d5d;' : spill.riskLevel === 'MEDIUM' ? 'background:#f4b942;' : 'background:#4ea8de;'}"></span>
          <span>${spill.id}</span>
        </div>
        <span class="badge-tag investigation">${spill.status}</span>
      </div>
      <div class="incident-location" title="${spill.name}">${spill.name}</div>
      <div class="incident-badge-row">
        <span class="badge-tag ${riskClass}">${spill.riskLevel} RISK</span>
        <span class="badge-tag ${aisClass}">
          ${spill.aisStatus === 'UNAVAILABLE' ? '<i data-lucide="radio-off" style="width:10px;height:10px;"></i>' : ''}
          AIS ${spill.aisStatus}
        </span>
        <span class="badge-tag" style="background:var(--bg-elevated); color:var(--text-muted);">${spill.areaKm2} km²</span>
      </div>
    `;

    card.addEventListener('click', () => {
      handleSelectIncident(spill.id, true);
    });

    container.appendChild(card);
  });

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

/**
 * Handle Incident Selection (Map Click or List Card Click)
 */
async function handleSelectIncident(incidentId, flyTo = true) {
  appState.selectedIncidentId = incidentId;

  // Highlight selected card in list
  document.querySelectorAll('.incident-card').forEach(card => {
    card.classList.toggle('active-selected', card.id === `incident-card-${incidentId}`);
  });

  // Query incident details from async data layer
  const incident = await getIncidentById(incidentId);
  if (!incident) return;

  // Populate Drawer Elements
  document.getElementById('drawer-spill-id').textContent = `OIL SPILL #${incident.id}`;
  document.getElementById('drawer-status').textContent = incident.status;
  document.getElementById('drawer-risk').textContent = `${incident.riskLevel} RISK`;
  document.getElementById('drawer-time').textContent = incident.detectionTime;
  document.getElementById('drawer-area').textContent = `${incident.areaKm2} km²`;
  document.getElementById('drawer-confidence').textContent = `${incident.detectionConfidence}%`;
  document.getElementById('drawer-ais').textContent = incident.aisStatus;
  document.getElementById('drawer-volume').textContent = `${incident.estimatedVolumeTonnes} Tonnes`;
  document.getElementById('drawer-sensor').textContent = incident.satelliteSensor;
  document.getElementById('drawer-description').textContent = incident.description;

  // Color styles based on severity
  const riskElem = document.getElementById('drawer-risk');
  if (incident.riskLevel === 'HIGH') {
    riskElem.className = 'cell-value highlight-red';
  } else if (incident.riskLevel === 'MEDIUM') {
    riskElem.className = 'cell-value highlight-amber';
  } else {
    riskElem.className = 'cell-value highlight-teal';
  }

  const aisElem = document.getElementById('drawer-ais');
  aisElem.className = incident.aisStatus === 'UNAVAILABLE' ? 'cell-value highlight-amber' : 'cell-value highlight-teal';

  // Open Drawer
  const drawer = document.getElementById('incident-drawer');
  const workspace = document.querySelector('.command-workspace');
  if (drawer) {
    drawer.classList.add('open');
    if (workspace) workspace.classList.add('drawer-open');
    invalidateMapSize();
  }

  // Pan and fly map to coordinates
  if (flyTo) {
    focusIncidentOnMap(incident.id, incident.lat, incident.lng, 8);
  }
}

/**
 * Drawer Close and Action Controls
 */
function initDrawerControls() {
  const closeBtn = document.getElementById('drawer-close-btn');
  const drawer = document.getElementById('incident-drawer');
  const workspace = document.querySelector('.command-workspace');

  if (closeBtn && drawer) {
    closeBtn.addEventListener('click', () => {
      drawer.classList.remove('open');
      if (workspace) workspace.classList.remove('drawer-open');
      invalidateMapSize();
    });
  }

  // "OPEN ATTRIBUTION ANALYSIS" Button
  const attributionBtn = document.getElementById('btn-open-attribution');
  if (attributionBtn) {
    attributionBtn.addEventListener('click', () => {
      // Switches seamlessly to SOURCE ATTRIBUTION view
      switchView('source-attribution');
    });
  }
}

/**
 * Map Layer Filter Toggles
 */
function initLayerToggles() {
  const buttons = document.querySelectorAll('.layer-btn');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const layer = btn.getAttribute('data-layer');
      if (!layer) return;

      const isCurrentlyActive = btn.classList.contains('active');
      const newActive = !isCurrentlyActive;

      btn.classList.toggle('active', newActive);
      appState.layers[layer] = newActive;
      toggleMapLayer(layer, newActive);
    });
  });
}
