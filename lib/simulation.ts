export interface DamInputs {
  reservoirName: string;
  currentLevel: number; // percentage
  inflow: number; // m3/s
  outflow: number; // m3/s
  rainfall: number; // mm
  catchmentWetness: number; // 0.6, 1.0, 1.4
  safeDischarge: number; // m3/s
  capacity: number; // million m3
  forecastHorizon: number; // hours
}

export interface SimulationStep {
  hour: number;
  inflow: number;
  outflow: number;
  level: number;
  volume: number;
  downstreamStress: number; // ratio of outflow to safe discharge
}

export interface SimulationResult {
  steps: SimulationStep[];
  peakLevel: number;
  peakDischarge: number;
  floodRiskScore: number; // 0-100
  status: 'Safe' | 'Warning' | 'High' | 'Critical';
  recommendedAction: 'No action required' | 'Start gradual release' | 'Immediate controlled release required';
}

export const WETNESS_MULTIPLIERS = {
  Dry: 0.6,
  Normal: 1.0,
  Saturated: 1.4,
};

export const calculateSimulation = (inputs: DamInputs, optimized: boolean): SimulationResult => {
  const {
    currentLevel,
    inflow,
    rainfall,
    catchmentWetness,
    safeDischarge,
    capacity,
    forecastHorizon,
  } = inputs;

  const capacityM3 = capacity * 1_000_000;
  let currentVolume = (currentLevel / 100) * capacityM3;
  const steps: SimulationStep[] = [];
  
  let peakLevel = currentLevel;
  let peakDischarge = inputs.outflow;

  // Rainfall factor: simplified conversion from mm to m3/s inflow increase
  const rainfallInflowFactor = rainfall * catchmentWetness * 5; 
  const predictedInflowBase = inflow + rainfallInflowFactor;

  for (let h = 0; h <= forecastHorizon; h++) {
    const hourlyInflow = predictedInflowBase * (1 + Math.sin((h / forecastHorizon) * Math.PI) * 0.2);
    
    let hourlyOutflow = inputs.outflow;

    if (optimized) {
      const projectedLevel = (currentVolume / capacityM3) * 100;
      if (projectedLevel > 80) {
        const neededRelease = hourlyInflow + (currentVolume - 0.8 * capacityM3) / (forecastHorizon * 3600);
        hourlyOutflow = Math.min(neededRelease, safeDischarge * 1.2);
      } else if (projectedLevel > 70) {
        hourlyOutflow = Math.min(hourlyInflow * 1.1, safeDischarge);
      }
    } else {
      const projectedLevel = (currentVolume / capacityM3) * 100;
      if (projectedLevel > 90) {
        hourlyOutflow = Math.max(hourlyInflow * 2, safeDischarge * 2);
      }
    }

    currentVolume += (hourlyInflow - hourlyOutflow) * 3600;
    currentVolume = Math.max(0, Math.min(currentVolume, capacityM3 * 1.1)); 

    const level = (currentVolume / capacityM3) * 100;
    peakLevel = Math.max(peakLevel, level);
    peakDischarge = Math.max(peakDischarge, hourlyOutflow);

    steps.push({
      hour: h,
      inflow: hourlyInflow,
      outflow: hourlyOutflow,
      level: level,
      volume: currentVolume / 1_000_000,
      downstreamStress: (hourlyOutflow / safeDischarge) * 100,
    });
  }

  let status: SimulationResult['status'] = 'Safe';
  if (peakLevel > 95) status = 'Critical';
  else if (peakLevel > 90) status = 'High';
  else if (peakLevel > 80) status = 'Warning';

  const floodRiskScore = Math.min(100, (peakLevel * 0.6) + (peakDischarge / safeDischarge * 40));

  let recommendedAction: SimulationResult['recommendedAction'] = 'No action required';
  if (status === 'Critical' || status === 'High') {
    recommendedAction = 'Immediate controlled release required';
  } else if (status === 'Warning' || peakLevel > 75) {
    recommendedAction = 'Start gradual release';
  }

  return {
    steps,
    peakLevel,
    peakDischarge,
    floodRiskScore,
    status,
    recommendedAction,
  };
};
