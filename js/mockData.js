/**
 * SIH26143 — Marine Oil-Spill Detection, Source Attribution & Alert System
 * Mock Data Layer & Asynchronous API Abstraction
 * 
 * NOTE FOR ML / BACKEND INTEGRATION:
 * This file serves as the single source of truth for the frontend prototype.
 * All UI components query data exclusively through the asynchronous getter functions
 * defined at the bottom (e.g. getSpills(), getVessels(), getIncidentById()).
 * 
 * To connect a Python backend / notebook:
 * Replace the promise resolution in the getter functions with fetch() calls to your
 * FastAPI / Flask / REST endpoints. The data contract schemas are documented below.
 */

// ==========================================
// 1. OIL SPILL INCIDENTS
// ==========================================
export const mockSpills = [
  {
    id: 'OS-024',
    name: 'Arabian Sea Corridor Anomaly',
    locationName: 'Arabian Sea (140nm WNW of Mumbai High)',
    lat: 19.452,
    lng: 70.824,
    areaKm2: 14.8,
    detectionConfidence: 94.2,
    detectionTime: '2026-09-10 08:42 UTC',
    satelliteSensor: 'Sentinel-1B C-SAR (Interferometric Wide Swath)',
    estimatedVolumeTonnes: 420,
    thicknessMicrons: 45,
    slickType: 'Heavy Crude Emulsion',
    aisStatus: 'UNAVAILABLE', // The critical USP: SAR vessel classification required!
    riskLevel: 'HIGH',
    status: 'ACTIVE INVESTIGATION',
    driftHeadingDeg: 115,
    driftSpeedKnots: 1.4,
    suspectVesselCount: 4,
    recommendedAction: 'Immediate SAR vessel signature attribution & aerial reconnaissance dispatch.',
    description: 'High-backscatter signature dark patch with coherent edge damping detected during ascending orbit pass. AIS coverage gap detected across a 38nm radius between 05:00 and 08:00 UTC.'
  },
  {
    id: 'OS-019',
    name: 'Gulf of Khambhat Transit Slick',
    locationName: 'Gulf of Khambhat Maritime Channel',
    lat: 21.050,
    lng: 72.180,
    areaKm2: 5.2,
    detectionConfidence: 87.5,
    detectionTime: '2026-09-09 19:15 UTC',
    satelliteSensor: 'Radarsat-Constellation-3 SAR',
    estimatedVolumeTonnes: 95,
    thicknessMicrons: 18,
    slickType: 'Intermediate Fuel Oil (IFO 380)',
    aisStatus: 'AVAILABLE',
    riskLevel: 'MEDIUM',
    status: 'MONITORING',
    driftHeadingDeg: 160,
    driftSpeedKnots: 2.1,
    suspectVesselCount: 1,
    recommendedAction: 'Automated AIS track match confirmed. Marine Police notified for boarding verification.',
    description: 'Linear bilge discharge slick aligned with outbound shipping corridor. High likelihood of operational discharge during ballast water exchange.'
  },
  {
    id: 'OS-011',
    name: 'Palk Strait Coastal Sheen',
    locationName: 'Palk Bay / Rameswaram Offshore Zone',
    lat: 9.380,
    lng: 79.420,
    areaKm2: 2.4,
    detectionConfidence: 78.9,
    detectionTime: '2026-09-08 14:30 UTC',
    satelliteSensor: 'Sentinel-2 MSI (Spectral Ratio Index)',
    estimatedVolumeTonnes: 32,
    thicknessMicrons: 8,
    slickType: 'Light Diesel Rainbow Sheen',
    aisStatus: 'AVAILABLE',
    riskLevel: 'LOW',
    status: 'MONITORING',
    driftHeadingDeg: 210,
    driftSpeedKnots: 0.8,
    suspectVesselCount: 2,
    recommendedAction: 'Coast Guard coastal patrol craft ICG-C42 deployed for containment boom evaluation.',
    description: 'Thin surface sheen with minimal marine toxicity profile. Dispersing naturally under moderate sea state.'
  }
];

// ==========================================
// 2. MONITORED MARITIME VESSELS
// Realistic AIS & SAR-derived targets around Indian Waters
// ==========================================
export const mockVessels = [
  // Dark/Suspect Vessels near OS-024 (SAR detected / AIS missing)
  {
    id: 'VES-8841',
    name: 'Unknown Target Alpha (SAR-104)',
    mmsi: 'Unknown / Silent',
    flag: 'Unregistered / Transponder Off',
    type: 'Crude Oil Tanker (VLCC Class)',
    lat: 19.310,
    lng: 70.620,
    heading: 142,
    speedKnots: 12.8,
    lengthM: 328,
    beamM: 60,
    aisStatus: 'UNAVAILABLE',
    sarDetected: true,
    attributionScore: 0.91,
    statusNote: 'SAR backscatter signature indicates ballast voyage VLCC. Passed spill coordinate at T-2.4 hrs.'
  },
  {
    id: 'VES-7412',
    name: 'Ocean Pioneer IV',
    mmsi: '419001882',
    flag: 'India (IN)',
    type: 'Offshore Supply Vessel (OSV)',
    lat: 19.680,
    lng: 71.150,
    heading: 260,
    speedKnots: 9.4,
    lengthM: 78,
    beamM: 18,
    aisStatus: 'AVAILABLE',
    sarDetected: true,
    attributionScore: 0.12,
    statusNote: 'Authorized support operations in Mumbai High oilfield.'
  },
  {
    id: 'VES-9034',
    name: 'Maratha Pride',
    mmsi: '419000543',
    flag: 'India (IN)',
    type: 'Product Tanker',
    lat: 18.910,
    lng: 72.420,
    heading: 310,
    speedKnots: 11.2,
    lengthM: 182,
    beamM: 28,
    aisStatus: 'AVAILABLE',
    sarDetected: false,
    attributionScore: 0.04,
    statusNote: 'Approaching JNPT outer anchorage.'
  },
  {
    id: 'VES-3309',
    name: 'Nordic Freedom',
    mmsi: '538007129',
    flag: 'Marshall Islands (MH)',
    type: 'Suezmax Tanker',
    lat: 20.120,
    lng: 69.840,
    heading: 125,
    speedKnots: 13.5,
    lengthM: 274,
    beamM: 48,
    aisStatus: 'AVAILABLE',
    sarDetected: true,
    attributionScore: 0.68,
    statusNote: 'En-route from Fujairah to Vadinar. AIS transponder degraded intermittent packet drop.'
  },
  {
    id: 'VES-1940',
    name: 'Pacific Mariner',
    mmsi: '356980000',
    flag: 'Panama (PA)',
    type: 'Capesize Bulk Carrier',
    lat: 17.650,
    lng: 71.800,
    heading: 340,
    speedKnots: 10.9,
    lengthM: 292,
    beamM: 45,
    aisStatus: 'AVAILABLE',
    sarDetected: false,
    attributionScore: 0.02,
    statusNote: 'Carrying iron ore northward.'
  },
  {
    id: 'VES-6621',
    name: 'Golden Crest',
    mmsi: '636019441',
    flag: 'Liberia (LR)',
    type: 'Chemical Tanker',
    lat: 21.180,
    lng: 72.050,
    heading: 175,
    speedKnots: 8.7,
    lengthM: 144,
    beamM: 23,
    aisStatus: 'AVAILABLE',
    sarDetected: true,
    attributionScore: 0.88,
    statusNote: 'Primary suspect for OS-019 bilge wash incident.'
  },
  {
    id: 'VES-4028',
    name: 'Falcon Explorer',
    mmsi: '419000998',
    flag: 'India (IN)',
    type: 'Container Ship',
    lat: 15.200,
    lng: 73.100,
    heading: 355,
    speedKnots: 16.4,
    lengthM: 220,
    beamM: 32,
    aisStatus: 'AVAILABLE',
    sarDetected: false,
    attributionScore: 0.01,
    statusNote: 'Transit corridor south to north.'
  },
  {
    id: 'VES-5114',
    name: 'Target Echo Bravo (SAR-208)',
    mmsi: 'Unknown / Silent',
    flag: 'Unknown',
    type: 'Medium Range Tanker',
    lat: 18.250,
    lng: 69.400,
    heading: 110,
    speedKnots: 14.1,
    lengthM: 183,
    beamM: 32,
    aisStatus: 'UNAVAILABLE',
    sarDetected: true,
    attributionScore: 0.74,
    statusNote: 'AIS transponder extinguished. Vessel size matched via SAR CFAR detector.'
  },
  {
    id: 'VES-6019',
    name: 'Chennai Glory',
    mmsi: '419000211',
    flag: 'India (IN)',
    type: 'LPG Carrier',
    lat: 13.120,
    lng: 80.350,
    heading: 80,
    speedKnots: 11.0,
    lengthM: 160,
    beamM: 25,
    aisStatus: 'AVAILABLE',
    sarDetected: false,
    attributionScore: 0.01,
    statusNote: 'Departed Ennore Port.'
  },
  {
    id: 'VES-8201',
    name: 'Southern Pearl',
    mmsi: '419001344',
    flag: 'India (IN)',
    type: 'Coastal Cargo',
    lat: 9.550,
    lng: 79.280,
    heading: 30,
    speedKnots: 7.8,
    lengthM: 65,
    beamM: 12,
    aisStatus: 'AVAILABLE',
    sarDetected: false,
    attributionScore: 0.05,
    statusNote: 'Coastal traffic near Gulf of Mannar.'
  },
  {
    id: 'VES-3199',
    name: 'ICG Samarth (Patrol)',
    mmsi: '419000001',
    flag: 'India - Coast Guard',
    type: 'Offshore Patrol Vessel',
    lat: 19.100,
    lng: 71.600,
    heading: 285,
    speedKnots: 18.5,
    lengthM: 105,
    beamM: 13.6,
    aisStatus: 'AVAILABLE',
    sarDetected: true,
    attributionScore: 0.00,
    statusNote: 'En-route to intercept coordinates near OS-024.'
  },
  {
    id: 'VES-9820',
    name: 'Al-Baraka Star',
    mmsi: '470211000',
    flag: 'UAE (AE)',
    type: 'Crude Oil Tanker',
    lat: 16.800,
    lng: 68.900,
    heading: 138,
    speedKnots: 12.0,
    lengthM: 248,
    beamM: 42,
    aisStatus: 'AVAILABLE',
    sarDetected: true,
    attributionScore: 0.15,
    statusNote: 'International transit lane through Arabian Sea.'
  }
];

// ==========================================
// 3. RESPONSE STATIONS & BASES
// ==========================================
export const mockResponseStations = [
  {
    id: 'STN-MUM',
    name: 'MRCC Mumbai (HQ Western Region)',
    code: 'MRCC-W',
    lat: 18.938,
    lng: 72.835,
    readinessTier: 'Tier 3 (National Level Response)',
    vesselAssets: 6,
    skimmersAvailable: 14,
    containmentBoomMeters: 4800,
    dispersantLitres: 35000,
    aerialAssets: ['Dornier 228 (CG Aviation Squadron)', 'Chetak Helicopter'],
    contactFreq: 'VHF Ch 16 / DSC 2187.5 kHz',
    status: 'OPERATIONAL'
  },
  {
    id: 'STN-KOC',
    name: 'MRCC Kochi (Southern Region)',
    code: 'MRCC-S',
    lat: 9.965,
    lng: 76.240,
    readinessTier: 'Tier 2 (Regional Hub)',
    vesselAssets: 4,
    skimmersAvailable: 8,
    containmentBoomMeters: 3200,
    dispersantLitres: 20000,
    aerialAssets: ['Dornier 228 CGAS 747'],
    contactFreq: 'VHF Ch 16 / DSC 2187.5 kHz',
    status: 'OPERATIONAL'
  },
  {
    id: 'STN-CHN',
    name: 'MRCC Chennai (Eastern Region)',
    code: 'MRCC-E',
    lat: 13.085,
    lng: 80.290,
    readinessTier: 'Tier 2 (Regional Hub)',
    vesselAssets: 5,
    skimmersAvailable: 10,
    containmentBoomMeters: 3600,
    dispersantLitres: 24000,
    aerialAssets: ['Dornier CGAS 745'],
    contactFreq: 'VHF Ch 16',
    status: 'OPERATIONAL'
  },
  {
    id: 'STN-VIZ',
    name: 'ICG Station Visakhapatnam',
    code: 'DHQ-6',
    lat: 17.695,
    lng: 83.300,
    readinessTier: 'Tier 2 (Bay of Bengal Command)',
    vesselAssets: 3,
    skimmersAvailable: 6,
    containmentBoomMeters: 2500,
    dispersantLitres: 16000,
    aerialAssets: ['ALH Dhruv MK-III'],
    contactFreq: 'VHF Ch 16',
    status: 'OPERATIONAL'
  },
  {
    id: 'STN-PBL',
    name: 'MRCC Port Blair (A&N Region)',
    code: 'MRCC-AN',
    lat: 11.667,
    lng: 92.740,
    readinessTier: 'Tier 2 (Island Command)',
    vesselAssets: 4,
    skimmersAvailable: 6,
    containmentBoomMeters: 2800,
    dispersantLitres: 18000,
    aerialAssets: ['Dornier CGAS 744'],
    contactFreq: 'VHF Ch 16 / Satellite IMMARSAT-C',
    status: 'OPERATIONAL'
  }
];

// ==========================================
// 4. AIS STATUS & TELEMETRY STREAM
// ==========================================
export const mockAIS = {
  coverageStatus: 'DEGRADED_REGIONAL',
  gapZonesDetected: 8,
  activeTransponders: 127,
  darkVesselAnomalies: 4,
  lastSatellitePass: 'Sentinel-1B @ 08:35 UTC',
  nextSatellitePass: 'Radarsat Constellation @ 12:48 UTC'
};

// ==========================================
// 5. SYSTEM AGGREGATE STATS
// ==========================================
export const mockStats = {
  activeSpills: 3,
  vesselsMonitored: 127,
  aisGaps: 8,
  highRiskZones: 4,
  activeAlerts: 3
};

// ==========================================
// 6. PLACEHOLDERS FOR FUTURE ML / NOTEBOOK INTEGRATION
// ==========================================

export const mockAttribution = {
  incidentId: 'OS-024',
  method: 'HYBRID_BACKTRACKING_SAR_RANK',
  backtrackHours: 12,
  candidates: [
    {
      vesselId: 'VES-8841',
      rank: 1,
      name: 'Unknown Target Alpha (SAR-104)',
      type: 'VLCC Tanker',
      sarConfidence: 0.91,
      spillIntersectDistanceKm: 1.8,
      aisGapDetected: true,
      estimatedVolumeAttributed: '380 - 450 tonnes',
      matchVector: { trajectoryCoherence: 0.94, temporalAlignment: 0.96, sizeProfileMatch: 0.88 }
    },
    {
      vesselId: 'VES-3309',
      rank: 2,
      name: 'Nordic Freedom',
      type: 'Suezmax Tanker',
      sarConfidence: 0.68,
      spillIntersectDistanceKm: 8.4,
      aisGapDetected: false,
      estimatedVolumeAttributed: '< 80 tonnes',
      matchVector: { trajectoryCoherence: 0.62, temporalAlignment: 0.70, sizeProfileMatch: 0.71 }
    }
  ]
};

export const mockDrift = {
  incidentId: 'OS-024',
  forecastHours: 48,
  windVector: { speedKnots: 14, directionDeg: 285 },
  oceanCurrentVector: { speedKnots: 1.1, directionDeg: 120 },
  trajectoryPoints: [],
  shorelineImpactForecastHours: 36,
  vulnerableEcosystems: ['Alibaug Mangroves', 'Kashid Marine Turtle Nesting Shore']
};

export const mockRisk = {
  incidentId: 'OS-024',
  environmentalIndex: 'HIGH_SENSITIVITY',
  coralReefsWithin50km: 0,
  mangroveProximityKm: 62,
  fisheriesEconomicImpactEstUSD: '4.2M'
};

export const mockAlerts = [
  {
    id: 'ALT-1092',
    timestamp: '08:44 UTC',
    severity: 'CRITICAL',
    title: 'High-Volume Spill Detected - OS-024',
    recipient: 'Indian Coast Guard Western Region HQ & DG Shipping',
    status: 'DISPATCHED'
  },
  {
    id: 'ALT-1093',
    timestamp: '08:47 UTC',
    severity: 'WARNING',
    title: 'AIS Gap Anomaly Identified (SAR-104)',
    recipient: 'Maritime Security Operations Centre (MSOC)',
    status: 'UNDER_ANALYSIS'
  }
];

// ==========================================
// 7. ASYNC DATA ACCESS LAYER (API PROMISES)
// ==========================================

export async function getSpills() {
  return Promise.resolve([...mockSpills]);
}

export async function getIncidentById(id) {
  const spill = mockSpills.find(s => s.id === id);
  return Promise.resolve(spill || null);
}

export async function getVessels() {
  return Promise.resolve([...mockVessels]);
}

export async function getResponseStations() {
  return Promise.resolve([...mockResponseStations]);
}

export async function getAISStatus() {
  return Promise.resolve({ ...mockAIS });
}

export async function getStats() {
  return Promise.resolve({ ...mockStats });
}

export async function getAttribution(incidentId = 'OS-024') {
  return Promise.resolve({ ...mockAttribution, incidentId });
}

export async function getDriftData(incidentId = 'OS-024') {
  return Promise.resolve({ ...mockDrift, incidentId });
}

export async function getRiskData(incidentId = 'OS-024') {
  return Promise.resolve({ ...mockRisk, incidentId });
}

export async function getAlerts() {
  return Promise.resolve([...mockAlerts]);
}
