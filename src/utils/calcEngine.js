/**
 * Physics-based RC Power Bench Calculation Engine
 * Calibrated to match standard aerodynamic prop power laws (P = K * D^4 * P * RPM^3)
 * Benchmark reference configuration:
 * P-51D 60-Class, SunnySky X4120 600KV, 6S 5000mAh 45C, Hobbywing 120A, APC 15x10E
 * at 100% throttle:
 * - RPM: 8740 RPM
 * - Current: 78.6 A
 * - Voltage: 22.8 V
 * - Power: 1794 W
 * - Efficiency: 81%
 * - Temp: 48 C
 * - Thrust-to-Weight: 0.78
 */

export function formatAircraftTitle(ac) {
  if (!ac) return "";
  const rawName = (ac.name || "Custom Aircraft").replace(/\[USER INPUT MODEL\]/g, "").trim();
  if (/\(\d+(\.\d+)?["\s]*WS/i.test(rawName) || /\(\d+(\.\d+)?M\b/i.test(rawName)) {
    return ac.isUserInputModel && !ac.name.includes('[USER INPUT MODEL]') ? `[USER INPUT MODEL] ${rawName}` : ac.name;
  }
  const wsTag = ac.wingspan ? `${ac.wingspan}" WS` : "";
  const clsTag = ac.class ? ac.class : "";
  const tag = [wsTag, clsTag].filter(Boolean).join(" / ");
  const fullTitle = tag ? `${rawName} (${tag})` : rawName;
  return ac.isUserInputModel && !fullTitle.includes('[USER INPUT MODEL]') ? `[USER INPUT MODEL] ${fullTitle}` : fullTitle;
}

export function getMaxCells(voltageSupportedStr) {
  if (!voltageSupportedStr) return 12;
  const matches = String(voltageSupportedStr).match(/(\d+)S/gi);
  if (!matches || matches.length === 0) return 12;
  const numbers = matches.map(m => parseInt(m.replace(/S/i, ""), 10));
  return Math.max(...numbers);
}

export function getMinCells(voltageSupportedStr) {
  if (!voltageSupportedStr) return 2;
  const matches = String(voltageSupportedStr).match(/(\d+)S/gi);
  if (!matches || matches.length === 0) return 2;
  const numbers = matches.map(m => parseInt(m.replace(/S/i, ""), 10));
  return Math.min(...numbers);
}

/**
 * Unit conversion & formatting helpers (Imperial vs Metric)
 */
export function formatWeight(lbs, unitSystem = 'imperial', decimals = 1) {
  const val = parseFloat(lbs) || 0;
  if (unitSystem === 'metric') {
    return `${(val * 0.453592).toFixed(decimals)} kg`;
  }
  return `${val.toFixed(decimals)} lbs`;
}

export function formatLength(inches, unitSystem = 'imperial', decimals = 1) {
  const val = parseFloat(inches) || 0;
  if (unitSystem === 'metric') {
    return `${Math.round(val * 25.4)} mm`;
  }
  return `${Number.isInteger(val) ? val : val.toFixed(decimals)}"`;
}

export function formatArea(sqIn, unitSystem = 'imperial') {
  const val = parseFloat(sqIn) || 0;
  if (unitSystem === 'metric') {
    return `${(val * 0.064516).toFixed(1)} dm²`;
  }
  return `${Math.round(val)} sq.in`;
}

export function formatSpeed(mph, unitSystem = 'imperial') {
  const val = parseFloat(mph) || 0;
  if (unitSystem === 'metric') {
    return `${Math.round(val * 1.60934)} KM/H`;
  }
  return `${Math.round(val)} MPH`;
}

export function formatTemp(celsius, unitSystem = 'imperial') {
  const val = parseFloat(celsius) || 0;
  if (unitSystem === 'imperial') {
    return `${Math.round(val)}°C (${Math.round(val * 1.8 + 32)}°F)`;
  }
  return `${Math.round(val)}°C`;
}

export function calculateSpecs({ aircraft, motor, esc, battery, propeller, throttle }) {
  if (!aircraft || !motor || !esc || !battery || !propeller) {
    return {
      rpm: 0,
      amps: 0,
      ampsPerMotor: 0,
      volts: 0,
      watts: 0,
      wattsPerMotor: 0,
      engines: 1,
      efficiency: 0,
      temp: 0,
      thrustToWeight: 0,
      thrust: 0,
      pitchSpeed: 0,
      topSpeed: 0,
      flightTimeMin: 0,
      flightTimeMax: 0,
      motorLoad: 0,
      escLoad: 0,
      batteryLoad: 0,
      overallStatus: "INCOMPLETE",
      powerSystemStatus: "OFFLINE"
    };
  }

  const t = throttle / 100; // 0 to 1
  const engines = aircraft.enginesCount || 1;

  // 1. Calculate Full Throttle Current Load Factor based on Propeller Size, Motor KV, Battery Cells, Blades count, IR, and Static Prop Stall
  const blades = propeller.blades || 2;
  const bladesLoadMultiplier = blades === 3 ? 1.32 : blades === 4 ? 1.58 : 1.0;
  
  // Propeller absorbed power scales with D^4 and Pitch.
  const dFactor = Math.pow(propeller.diameter / 15.0, 4.0);
  const pFactor = propeller.pitch / 10.0;
  
  // Power scales with RPM^3. Aerodynamic torque Q scales with RPM^2, so Motor Current I = Q/Kt scales with V^2 and KV^3.
  const kvFactor = Math.pow(motor.kv / 600.0, 3.0);
  const cellFactor = Math.pow(battery.cells / 6.0, 2.0);
  const kProp = propeller.kProp || 1.0;

  // Static Propeller Stall Factor (High pitch-to-diameter props e.g. 13x10 pitch ratio 0.77 stall on static bench tests drawing heavy torque current)
  const pitchRatio = propeller.pitch / propeller.diameter;
  const staticStallMultiplier = pitchRatio > 0.65 ? (1.0 + 0.35 * (pitchRatio - 0.65)) : 1.0;

  // Low Internal Resistance (Ri) Boost: Motors with ultra-low Ri pass high current with minimal copper voltage drop
  const irFactor = motor.internalResistance ? Math.min(Math.max(0.016 / motor.internalResistance, 0.85), 1.30) : 1.0;

  const I_full = 78.6 * dFactor * pFactor * kvFactor * cellFactor * kProp * bladesLoadMultiplier * staticStallMultiplier * irFactor;

  // Battery resting voltage & IR drop under load
  const batteryIR = battery.cells * battery.internalResistance;
  const escIR = esc.resistance;
  const totalIR = batteryIR + escIR;
  const vRest = battery.cells * 3.964;

  let amps = 0;
  let volts = vRest;
  let watts = 0;
  let rpm = 0;

  if (t > 0) {
    amps = Math.pow(t, 2) * I_full + motor.noLoadCurrent;
    volts = Math.max(vRest - amps * totalIR, battery.cells * 3.0);
    watts = volts * amps;
    
    // Loaded RPM under aerodynamic drag
    const loadRatio = I_full / Math.max(motor.maxCurrent, 40);
    const rpmFactor = Math.max(0.84 - 0.15 * Math.max(loadRatio - 0.7, 0), 0.45);
    rpm = t * motor.kv * volts * rpmFactor;
  }

  // 5. System Efficiency (%)
  let efficiency = 0;
  if (t > 0) {
    const loadRatio = amps / motor.maxCurrent;
    efficiency = Math.round(81 * (1.0 - 0.15 * Math.pow(loadRatio - 0.7, 2)));
    efficiency = Math.max(Math.min(efficiency, 95), 10);
  }

  // 6. Temperature (C)
  let temp = 25; // ambient temp
  if (t > 0) {
    temp = 25 + 23 * Math.pow(t, 2) * Math.pow(amps / 78.6, 1.3) * (motor.maxCurrent / 80.0);
  }

  // 7. Performance Predictions
  const bladesThrustMultiplier = blades === 3 ? 1.20 : blades === 4 ? 1.36 : 1.0;
  let thrust = 0;
  if (t > 0) {
    thrust = 10.5 * Math.pow(propeller.diameter / 15.0, 3) * Math.sqrt(propeller.pitch / 10.0) * Math.pow(rpm / 8740.0, 2) * bladesThrustMultiplier * engines;
  }
  const thrustToWeight = aircraft.flyingWeight > 0 ? (thrust / aircraft.flyingWeight) : 0;

  // Pitch Speed (MPH)
  const flightRpm = rpm * 1.20;
  const pitchSpeed = rpm > 0 ? Math.round(flightRpm * propeller.pitch / 1056) : 0;

  // Top Speed estimate in level flight (MPH)
  const efficiencyFactor = Math.min(0.74 + 0.12 * Math.min(thrustToWeight, 1.5), 0.90);
  const topSpeed = rpm > 0 ? Math.round(pitchSpeed * efficiencyFactor) : 0;

  // Flight Time (minutes)
  let flightTimeMin = 0;
  let flightTimeMax = 0;
  if (amps > 0) {
    const capAh = battery.capacity / 1000;
    const avgCurrentRatioMin = 0.55;
    const avgCurrentRatioMax = 0.35;
    const totalAmps = amps * engines;
    
    flightTimeMin = Math.round((capAh / (totalAmps * avgCurrentRatioMin)) * 60);
    flightTimeMax = Math.round((capAh / (totalAmps * avgCurrentRatioMax)) * 60);
    
    flightTimeMin = Math.max(Math.min(flightTimeMin, 15), 3);
    flightTimeMax = Math.max(Math.min(flightTimeMax, 25), flightTimeMin + 2);
  }

  // 8. Load percentages (100% load = reaching motor max continuous current rating)
  const motorLoad = Math.round((amps / motor.maxCurrent) * 100);
  const escLoad = Math.round((amps / esc.maxAmps) * 100);
  const batMaxAmps = (battery.capacity / 1000) * battery.cRating * 0.57;
  const batteryLoad = Math.round(((amps * engines) / batMaxAmps) * 100);

  // Status Strings
  let overallStatus = "GOOD";
  let powerSystemStatus = "STABLE";

  if (motorLoad > 100 || escLoad > 100 || batteryLoad > 100) {
    overallStatus = "DANGER";
    powerSystemStatus = "UNSTABLE";
  } else if (motorLoad > 85 || escLoad > 85 || batteryLoad > 85) {
    overallStatus = "WARNING";
    powerSystemStatus = "STRESSED";
  } else if (t === 0) {
    overallStatus = "STANDBY";
    powerSystemStatus = "READY";
  }

  return {
    rpm: Math.round(rpm),
    amps: parseFloat((amps * engines).toFixed(1)),
    ampsPerMotor: parseFloat(amps.toFixed(1)),
    volts: parseFloat(volts.toFixed(1)),
    watts: Math.round(watts * engines),
    wattsPerMotor: Math.round(watts),
    engines,
    efficiency,
    temp: Math.round(temp),
    thrustToWeight: parseFloat(thrustToWeight.toFixed(2)),
    thrust: parseFloat(thrust.toFixed(2)),
    pitchSpeed,
    topSpeed,
    flightTimeMin,
    flightTimeMax,
    motorLoad,
    escLoad,
    batteryLoad,
    overallStatus,
    powerSystemStatus
  };
}

export function generatePowerCurve(aircraft, motor, esc, battery, propeller) {
  const points = [];
  for (let throttle = 0; throttle <= 100; throttle += 5) {
    const specs = calculateSpecs({ aircraft, motor, esc, battery, propeller, throttle });
    points.push({
      throttle,
      amps: specs.amps,
      ampsPerMotor: specs.ampsPerMotor,
      watts: specs.watts,
      wattsPerMotor: specs.wattsPerMotor
    });
  }
  return points;
}

export function getAirframeMaxCells(aircraft, stockCells = 4) {
  const ws = aircraft?.wingspan || 63;
  const cls = (aircraft?.class || '').toUpperCase();
  if (ws <= 52 || cls.includes('1.2M')) return Math.max(stockCells, 4);
  if (cls.includes('1.5M') || cls.includes('1.6M') || (ws <= 60 && !cls.includes('60'))) return Math.max(stockCells, 6);
  if (ws <= 75 && (aircraft?.enginesCount || 1) >= 4) return Math.max(stockCells, 4);
  if (ws <= 68) return Math.max(stockCells, 6);
  if (ws <= 82) return Math.max(stockCells, (aircraft?.enginesCount || 1) > 1 ? 8 : 10);
  return 12;
}

export function isEscVoltageCompatible(esc, cells) {
  if (!esc) return false;
  const vStr = esc.voltageSupported || esc.voltageRange;
  const minC = getMinCells(vStr);
  const maxC = getMaxCells(vStr);
  return cells >= minC && cells <= maxC;
}

export function isMotorVoltageCompatible(motor, cells) {
  if (!motor) return false;
  const vStr = motor.voltageSupported || motor.voltageRange;
  const minC = getMinCells(vStr);
  const maxC = getMaxCells(vStr);
  return cells >= minC && cells <= maxC;
}

export function getPropDiamBounds(aircraft, stockProp = null) {
  const ws = aircraft?.wingspan || 63;
  const engines = aircraft?.enginesCount || 1;
  const baseDiam = (stockProp && typeof stockProp === 'object' && stockProp.diameter)
    ? stockProp.diameter
    : Math.round(ws * (engines >= 4 ? 0.16 : engines === 2 ? 0.20 : 0.24));
  if (ws <= 52) return { minD: Math.max(10, baseDiam - 1), maxD: Math.min(13, baseDiam + 1) };
  if (ws <= 60) return { minD: Math.max(13, baseDiam - 1), maxD: Math.min(16, baseDiam + 1) };
  if (engines >= 4) return { minD: Math.max(11, baseDiam - 1), maxD: Math.min(13, baseDiam + 1) };
  if (engines === 2 && ws <= 76) return { minD: Math.max(12, baseDiam - 1), maxD: Math.min(15, baseDiam + 1) };
  if (engines === 2 && ws <= 84) return { minD: Math.max(14, baseDiam - 1), maxD: Math.min(17, baseDiam + 1) };
  if (engines === 2) return { minD: Math.max(17, baseDiam - 2), maxD: Math.min(20, baseDiam + 2) };
  if (ws <= 70) return { minD: Math.max(14, baseDiam - 1), maxD: Math.min(17, baseDiam + 2) };
  if (ws <= 86) return { minD: Math.max(18, baseDiam - 2), maxD: Math.min(22, baseDiam + 2) };
  return { minD: Math.max(20, baseDiam - 2), maxD: Math.min(26, baseDiam + 2) };
}

export function getRecommendationsForAircraftSpecs({
  wingspan,
  length,
  weight,
  wingArea,
  motors = [],
  batteries = [],
  escs = [],
  propellers = [],
  enginesCount = 1,
  flightStyle = 'scale',
  targetCellsOverride = null
}) {
  const w = Math.max(parseFloat(weight) || 8.5, 1.0);
  const ws = Math.max(parseFloat(wingspan) || 63, 24.0);
  const len = Math.max(parseFloat(length) || Math.round(ws * 0.82), 20.0);
  const wa = Math.max(parseFloat(wingArea) || Math.round((ws * ws) / 5.5), 120.0);
  const engines = Math.max(parseInt(enginesCount, 10) || 1, 1);
  const weightPerEngine = w / engines;

  // Power requirement calculation
  const minWatts = Math.round(w * 120);
  const scaleWatts = Math.round(w * 150);
  const maxWatts = Math.round(w * 200);
  const targetWattsTotal = flightStyle === 'aggressive' ? Math.round(w * 175) : (flightStyle === 'safe' ? minWatts : scaleWatts);

  const syntheticAircraft = {
    id: 'spec-calc-aircraft',
    wingspan: ws,
    length: len,
    flyingWeight: w,
    wingArea: wa,
    enginesCount: engines,
    powerRangeMin: minWatts,
    powerRangeMax: maxWatts
  };

  // Default target battery cell count strictly bounded by wingspan scale, multi-engine layout & airframe payload limits
  let defaultCells = 6;
  if (ws <= 52 || weightPerEngine <= 3.8) {
    defaultCells = weightPerEngine <= 2.6 ? 3 : 4;
  } else if (ws <= 60 || weightPerEngine <= 5.5) {
    defaultCells = weightPerEngine <= 4.5 ? 4 : 6;
  } else if (ws <= 68 || weightPerEngine <= 10.5) {
    defaultCells = 6;
  } else if (ws <= 79 || weightPerEngine <= 16.0) {
    defaultCells = (w >= 16.0 && engines === 1) ? 10 : 8;
  } else {
    defaultCells = w >= 24.0 ? 12 : 10;
  }

  const maxAllowedCells = getAirframeMaxCells(syntheticAircraft, defaultCells);
  const targetCells = (targetCellsOverride && Number.isFinite(Number(targetCellsOverride)))
    ? Math.max(3, Math.min(Number(targetCellsOverride), 12))
    : Math.min(defaultCells, maxAllowedCells);

  // Target Motor KV tuned for voltage efficiency and propeller torque
  let targetKv = 500;
  if (targetCells === 3) targetKv = 950;
  else if (targetCells === 4) targetKv = 820;
  else if (targetCells === 5) targetKv = 620;
  else if (targetCells === 6) targetKv = 500;
  else if (targetCells === 8) targetKv = 320;
  else if (targetCells === 10) targetKv = 230;
  else targetKv = 195;

  const { minD, maxD } = getPropDiamBounds(syntheticAircraft, null);
  const targetDiameter = Math.round((minD + maxD) / 2);
  const targetPitch = Math.round(targetDiameter * (flightStyle === 'aggressive' ? 0.65 : 0.55));

  // Target motor weight per engine (~9% to 13% of per-engine airframe weight in grams)
  const targetMotorWeightG = weightPerEngine * 453.592 * (flightStyle === 'aggressive' ? 0.115 : 0.095);
  const minMotorWeightG = Math.max(85, targetMotorWeightG * 0.55);
  const maxMotorWeightG = Math.max(220, targetMotorWeightG * 1.75);

  const maxBatteryWeightG = w * 453.592 * 0.30;
  const cellBatteries = batteries
    .filter(b => b.cells === targetCells && b.weight <= maxBatteryWeightG * 1.25)
    .sort((a, b) => (b.capacity * b.cRating) - (a.capacity * a.cRating));
  const batteryPool = cellBatteries.length > 0
    ? cellBatteries
    : batteries.filter(b => b.cells === targetCells).sort((a, b) => (b.capacity * b.cRating) - (a.capacity * a.cRating));
  const finalBatteryPool = batteryPool.length > 0 ? batteryPool : [batteries[0]].filter(Boolean);

  const compatibleMotors = motors.filter(m =>
    isMotorVoltageCompatible(m, targetCells) &&
    m.weight >= minMotorWeightG &&
    m.weight <= maxMotorWeightG
  );
  const motorPool = compatibleMotors.length > 0
    ? compatibleMotors
    : motors.filter(m => isMotorVoltageCompatible(m, targetCells));
  const finalMotorPool = motorPool.length > 0 ? motorPool : motors;

  const validEscs = escs
    .filter(e => isEscVoltageCompatible(e, targetCells))
    .sort((a, b) => a.maxAmps - b.maxAmps);
  const escPool = validEscs.length > 0 ? validEscs : [...escs].sort((a, b) => a.maxAmps - b.maxAmps);

  let bestCombo = null;
  let bestScore = Infinity;

  for (const bat of finalBatteryPool) {
    for (const mot of finalMotorPool) {
      for (const prop of propellers) {
        if (prop.diameter < minD || prop.diameter > maxD) continue;

        const maxEsc = escPool[escPool.length - 1];
        if (!maxEsc) continue;
        const probeSpecs = calculateSpecs({
          aircraft: syntheticAircraft,
          motor: mot,
          esc: maxEsc,
          battery: bat,
          propeller: prop,
          throttle: 100
        });

        const reqEscAmps = probeSpecs.ampsPerMotor * 1.22;
        const chosenEsc = escPool.find(e => e.maxAmps >= reqEscAmps) || maxEsc;
        const s = calculateSpecs({
          aircraft: syntheticAircraft,
          motor: mot,
          esc: chosenEsc,
          battery: bat,
          propeller: prop,
          throttle: 100
        });

        if (s.motorLoad > 88 || s.escLoad > 86 || s.batteryLoad > 86) continue;
        if (s.thrustToWeight < (flightStyle === 'aggressive' ? 1.00 : 0.80)) continue;

        const wattsDiff = Math.abs(s.watts - targetWattsTotal);
        const weightDiff = Math.abs(mot.weight - targetMotorWeightG) * 1.8;
        const loadPenalty = Math.max(0, s.motorLoad - 78) * 14;
        const score = wattsDiff + weightDiff + loadPenalty;

        if (score < bestScore) {
          bestScore = score;
          bestCombo = {
            matchingMotor: mot,
            matchingBattery: bat,
            matchingEsc: chosenEsc,
            matchingProp: prop,
            specs: s
          };
        }
      }
    }
  }

  if (!bestCombo) {
    const matchingBattery = finalBatteryPool[0] || batteries[0];
    const matchingMotor = finalMotorPool.reduce((best, curr) =>
      Math.abs(curr.kv - targetKv) < Math.abs(best.kv - targetKv) ? curr : best,
      finalMotorPool[0]
    ) || motors[0];
    const matchingProp = propellers.find(p => p.diameter >= minD && p.diameter <= maxD && Math.abs(p.diameter - targetDiameter) <= 1.5)
      || propellers.find(p => p.diameter >= minD && p.diameter <= maxD)
      || propellers[0];
    const maxEsc = escPool[escPool.length - 1] || escs[0];
    const probe = calculateSpecs({ aircraft: syntheticAircraft, motor: matchingMotor, esc: maxEsc, battery: matchingBattery, propeller: matchingProp, throttle: 100 });
    const matchingEsc = escPool.find(e => e.maxAmps >= probe.ampsPerMotor * 1.2) || maxEsc;
    bestCombo = { matchingMotor, matchingBattery, matchingEsc, matchingProp, specs: probe };
  }

  const targetAmps = Math.round(targetWattsTotal / (targetCells * 3.7));
  const recEscAmps = bestCombo.matchingEsc ? bestCombo.matchingEsc.maxAmps : Math.round((targetAmps / engines) * 1.25);

  return {
    minWatts,
    scaleWatts,
    maxWatts,
    targetMaxWatts: targetWattsTotal,
    targetCells: bestCombo.matchingBattery ? bestCombo.matchingBattery.cells : targetCells,
    targetKv: bestCombo.matchingMotor ? bestCombo.matchingMotor.kv : targetKv,
    targetDiameter: bestCombo.matchingProp ? bestCombo.matchingProp.diameter : targetDiameter,
    targetPropDiameter: bestCombo.matchingProp ? bestCombo.matchingProp.diameter : targetDiameter,
    targetPitch: bestCombo.matchingProp ? bestCombo.matchingProp.pitch : targetPitch,
    targetAmps,
    recEscAmps,
    targetEscAmps: recEscAmps,
    matchingMotor: bestCombo.matchingMotor,
    matchingBattery: bestCombo.matchingBattery,
    matchingEsc: bestCombo.matchingEsc,
    matchingProp: bestCombo.matchingProp
  };
}

export function tuneSetupForTargetVoltage({
  targetCells,
  aircraft,
  currentMotor = null,
  motors = [],
  batteries = [],
  escs = [],
  propellers = []
}) {
  const ws = aircraft?.wingspan || 63;
  const weightLb = aircraft?.flyingWeight || 8.5;
  const engines = aircraft?.enginesCount || 1;
  const stockMotor = motors.find(m => m.id === aircraft?.stockSetup?.motorId) || currentMotor || motors[0];
  const stockProp = propellers.find(p => p.id === aircraft?.stockSetup?.propellerId) || propellers[0];

  // 1. Find high-output batteries matching targetCells that fit the aircraft
  const maxBatteryWeightG = weightLb * 453.592 * 0.30;
  const exactCellBatteries = batteries
    .filter(b => b.cells === targetCells)
    .sort((a, b) => (b.capacity * b.cRating) - (a.capacity * a.cRating));
  const weightFitBatteries = exactCellBatteries.filter(b => b.weight <= maxBatteryWeightG * 1.35);
  const batteryCandidates = weightFitBatteries.length > 0
    ? weightFitBatteries
    : (exactCellBatteries.length > 0 ? exactCellBatteries : [batteries[0]].filter(Boolean));

  const loadedVolts = targetCells * 3.7;
  const { minD: minDiam, maxD: maxDiam } = getPropDiamBounds(aircraft, stockProp);

  // 2. Target RPM & Ideal Motor KV calculation for Target Cell Voltage
  let targetRPM = 10000;
  if (ws <= 52) targetRPM = 11500;
  else if (ws <= 60) targetRPM = 9800;
  else if (ws <= 79) targetRPM = 8600;
  else targetRPM = 6400;

  const idealKv = Math.round(targetRPM / loadedVolts);
  const targetWattsTotal = ((aircraft?.powerRangeMin || weightLb * 120) + (aircraft?.powerRangeMax || weightLb * 185)) / 2;

  // 3. Filter motors strictly compatible with targetCells and realistic for the aircraft's weight class
  const weightMatchedMotors = motors.filter(m =>
    isMotorVoltageCompatible(m, targetCells) &&
    m.weight >= (stockMotor?.weight || 200) * 0.60 &&
    m.weight <= (stockMotor?.weight || 200) * 1.85
  );
  const voltageCompatibleMotors = motors.filter(m => isMotorVoltageCompatible(m, targetCells));
  const motorCandidates = weightMatchedMotors.length > 0
    ? weightMatchedMotors
    : (voltageCompatibleMotors.length > 0 ? voltageCompatibleMotors : motors);

  const validEscs = escs
    .filter(e => isEscVoltageCompatible(e, targetCells))
    .sort((a, b) => a.maxAmps - b.maxAmps);
  const escPool = validEscs.length > 0 ? validEscs : [...escs].sort((a, b) => a.maxAmps - b.maxAmps);

  let bestScore = -Infinity;
  let bestBattery = batteryCandidates[0];
  let bestMotor = motorCandidates[0];
  let bestProp = propellers[0];
  let bestEsc = escPool[0];
  let bestSpecs = null;

  for (const bat of batteryCandidates) {
    for (const m of motorCandidates) {
      for (const p of propellers) {
        if (p.diameter < minDiam || p.diameter > maxDiam) continue;

        const maxEsc = escPool[escPool.length - 1];
        const probeSpecs = calculateSpecs({
          aircraft,
          motor: m,
          esc: maxEsc,
          battery: bat,
          propeller: p,
          throttle: 100
        });

        const reqEscAmps = Math.max(probeSpecs.ampsPerMotor * 1.20, m.maxCurrent * 1.05);
        const escCandidate = escPool.find(e => e.maxAmps >= reqEscAmps) || maxEsc;

        const s = calculateSpecs({
          aircraft,
          motor: m,
          esc: escCandidate,
          battery: bat,
          propeller: p,
          throttle: 100
        });

        // Strict safety check: Motor load <= 90%, ESC load <= 88%, Battery load <= 88%
        if (s.motorLoad <= 90 && s.escLoad <= 88 && s.batteryLoad <= 88 && s.thrustToWeight >= 0.75) {
          const wattsScore = 120 - Math.min(Math.abs(s.watts - targetWattsTotal) / Math.max(targetWattsTotal, 1) * 120, 120);
          const kvMatchScore = 80 - Math.min(Math.abs(m.kv - idealKv) * 0.4, 80);
          const weightMatchScore = 60 - Math.min(Math.abs(m.weight - (stockMotor?.weight || 250)) * 0.25, 60);
          const pitchSpeedScore = s.pitchSpeed * 1.1;
          const twScore = Math.min(s.thrustToWeight, 2.2) * 35;

          const totalScore = wattsScore + kvMatchScore + weightMatchScore + pitchSpeedScore + twScore;

          if (totalScore > bestScore) {
            bestScore = totalScore;
            bestBattery = bat;
            bestMotor = m;
            bestProp = p;
            bestEsc = escCandidate;
            bestSpecs = s;
          }
        }
      }
    }
  }

  // Fallback if user selected an extreme voltage (e.g., 3S on a Giant Scale or 12S on a tiny foamie)
  if (!bestSpecs) {
    let fallbackBestPenalty = Infinity;
    const bat = batteryCandidates[0];
    const maxEsc = escPool[escPool.length - 1];
    for (const m of motorCandidates) {
      for (const p of propellers) {
        if (p.diameter < minDiam - 1 || p.diameter > maxDiam + 1) continue;
        const probe = calculateSpecs({ aircraft, motor: m, esc: maxEsc, battery: bat, propeller: p, throttle: 100 });
        const escCandidate = escPool.find(e => e.maxAmps >= probe.ampsPerMotor * 1.18) || maxEsc;
        const s = calculateSpecs({ aircraft, motor: m, esc: escCandidate, battery: bat, propeller: p, throttle: 100 });
        const overloadPenalty = Math.max(0, s.motorLoad - 88) * 50 + Math.max(0, s.escLoad - 88) * 50 + Math.max(0, s.batteryLoad - 88) * 50;
        const penalty = Math.abs(s.watts - targetWattsTotal) + overloadPenalty + Math.abs(m.weight - (stockMotor?.weight || 250)) * 2;
        if (penalty < fallbackBestPenalty) {
          fallbackBestPenalty = penalty;
          bestBattery = bat;
          bestMotor = m;
          bestProp = p;
          bestEsc = escCandidate;
          bestSpecs = s;
        }
      }
    }
  }

  return {
    targetCells,
    battery: bestBattery,
    motor: bestMotor,
    esc: bestEsc,
    propeller: bestProp,
    specs: bestSpecs,
    idealKv
  };
}

/**
 * Stock-Relative Flight Profile Preset Engine
 * Anchors all 4 flight profiles ('safe', 'scale', 'aggressive', 'extreme') to the aircraft's
 * actual Factory Stock ('scale') baseline, guaranteeing strictly monotonic ESC ratings,
 * battery discharge/cell specs, power output (Watts), and pitch speed without component overloads.
 */
export function getPresetSetupForAircraft(aircraft, presetType, db = {}) {
  const { motors: mList = [], escs: eList = [], batteries: bList = [], propellers: pList = [] } = db;

  // 1. Resolve Factory Stock ('scale') baseline
  let stockMotor, stockEsc, stockBattery, stockProp;
  if (aircraft?.stockSetup) {
    stockMotor = mList.find(m => m.id === aircraft.stockSetup.motorId);
    stockEsc = eList.find(e => e.id === aircraft.stockSetup.escId);
    stockBattery = bList.find(b => b.id === aircraft.stockSetup.batteryId);
    stockProp = pList.find(p => p.id === aircraft.stockSetup.propellerId);
  }
  if (!stockMotor || !stockEsc || !stockBattery || !stockProp) {
    const rec = getRecommendationsForAircraftSpecs({
      wingspan: aircraft?.wingspan || 63,
      length: aircraft?.length || 52,
      weight: aircraft?.flyingWeight || 8.5,
      wingArea: aircraft?.wingArea || 720,
      motors: mList,
      batteries: bList,
      escs: eList,
      propellers: pList
    });
    stockMotor = stockMotor || rec.matchingMotor || mList[0];
    stockEsc = stockEsc || rec.matchingEsc || eList[0];
    stockBattery = stockBattery || rec.matchingBattery || bList[0];
    stockProp = stockProp || rec.matchingProp || pList[0];
  }

  const stockSpecs = calculateSpecs({
    aircraft,
    motor: stockMotor,
    esc: stockEsc,
    battery: stockBattery,
    propeller: stockProp,
    throttle: 100
  });

  if (presetType === 'scale') {
    return { motor: stockMotor, esc: stockEsc, battery: stockBattery, propeller: stockProp, specs: stockSpecs };
  }

  const { minD, maxD } = getPropDiamBounds(aircraft, stockProp);

  // 2. SAFE SCALE: Efficient, Long Runtime, Milder Load & Speed than Stock
  if (presetType === 'safe') {
    let bestSafe = null;
    let bestSafeScore = -Infinity;

    const safeBatteries = bList.filter(b =>
      b.cells <= stockBattery.cells &&
      b.cells >= Math.max(3, stockBattery.cells - 2) &&
      b.cRating <= stockBattery.cRating &&
      Math.abs(b.capacity - stockBattery.capacity) <= 1500
    );
    const batCandidates = safeBatteries.length > 0 ? safeBatteries : [stockBattery];

    const safeProps = pList.filter(p =>
      p.diameter >= Math.max(11, stockProp.diameter - 2) &&
      p.diameter <= stockProp.diameter &&
      p.pitch <= stockProp.pitch &&
      (p.blades || 2) <= (stockProp.blades || 2)
    );
    const propCandidates = safeProps.length > 0 ? safeProps : pList.filter(p => p.diameter <= stockProp.diameter);

    const motorCandidates = [stockMotor, ...mList.filter(m => m.id !== stockMotor.id && m.kv <= stockMotor.kv && Math.abs(m.weight - stockMotor.weight) <= 180)];

    for (const m of motorCandidates) {
      for (const b of batCandidates) {
        if (!isMotorVoltageCompatible(m, b.cells) && m.id !== stockMotor.id) continue;
        const esc = isEscVoltageCompatible(stockEsc, b.cells)
          ? stockEsc
          : (eList.find(e => isEscVoltageCompatible(e, b.cells) && e.maxAmps === stockEsc.maxAmps) || stockEsc);

        for (const p of propCandidates) {
          const s = calculateSpecs({ aircraft, motor: m, esc, battery: b, propeller: p, throttle: 100 });
          if (s.watts >= stockSpecs.watts * 0.45 && s.watts <= stockSpecs.watts * 0.88 &&
              s.pitchSpeed <= stockSpecs.pitchSpeed &&
              s.motorLoad <= Math.min(stockSpecs.motorLoad, 78) && s.escLoad <= 75 && s.batteryLoad <= 75) {
            const targetWatts = stockSpecs.watts * 0.72;
            const wattDiffPenalty = Math.abs(s.watts - targetWatts) / stockSpecs.watts * 100;
            const sameMotorBonus = m.id === stockMotor.id ? 40 : 0;
            const sameCellsBonus = b.cells === stockBattery.cells ? 20 : 10;
            const sameBatteryBonus = b.id === stockBattery.id ? 15 : 0;
            const score = sameMotorBonus + sameCellsBonus + sameBatteryBonus - wattDiffPenalty;
            if (score > bestSafeScore) {
              bestSafeScore = score;
              bestSafe = { motor: m, esc, battery: b, propeller: p, specs: s };
            }
          }
        }
      }
    }

    if (bestSafe) return bestSafe;
  }

  function getCandidateEscs(cells, minAmps, preferUpgradeOverAmps = 0) {
    const valid = eList
      .filter(e => isEscVoltageCompatible(e, cells) && e.maxAmps >= minAmps)
      .sort((a, b) => a.maxAmps - b.maxAmps);
    if (valid.length === 0) {
      return eList.filter(e => e.maxAmps >= minAmps).sort((a, b) => a.maxAmps - b.maxAmps);
    }
    if (preferUpgradeOverAmps > 0) {
      const upgraded = valid.filter(e => e.maxAmps > preferUpgradeOverAmps);
      if (upgraded.length > 0) return upgraded;
    }
    return valid;
  }

  function getUpgradedBatteries(targetCells, baseBattery, preferMaxTier = false) {
    const minCap = baseBattery.cells === targetCells ? baseBattery.capacity : 4000;
    const minC = baseBattery.cells === targetCells ? baseBattery.cRating : 45;
    const candidates = bList.filter(b =>
      b.cells === targetCells &&
      b.capacity >= minCap &&
      b.cRating >= minC
    ).sort((a, b) => {
      if (a.cRating !== b.cRating) return a.cRating - b.cRating;
      return a.capacity - b.capacity;
    });

    if (candidates.length === 0) {
      return bList.filter(b => b.cells === targetCells).sort((a, b) => b.cRating - a.cRating);
    }
    if (preferMaxTier) {
      return [...candidates].reverse();
    }
    const steppedUp = candidates.filter(b => b.cRating > baseBattery.cRating || b.capacity > baseBattery.capacity);
    return steppedUp.length > 0 ? steppedUp : candidates;
  }

  function findStepUpSetup(baseSetup, isExtreme = false) {
    const baseSpecs = baseSetup.specs;
    const maxAirframeCells = getAirframeMaxCells(aircraft, stockBattery.cells);
    const allowedCells = [baseSetup.battery.cells];
    if (baseSetup.battery.cells + 1 <= maxAirframeCells) allowedCells.push(baseSetup.battery.cells + 1);
    if (baseSetup.battery.cells + 2 <= maxAirframeCells) allowedCells.push(baseSetup.battery.cells + 2);

    let bestCandidate = null;
    let bestScore = -Infinity;

    const idealWattRatio = isExtreme ? 1.28 : 1.20;
    const maxWattRatio = isExtreme ? 1.95 : 1.55;
    const maxMotorLoad = isExtreme ? 96 : 88;
    const maxEscLoad = isExtreme ? 92 : 85;
    const maxBatLoad = isExtreme ? 92 : 85;

    for (const cells of allowedCells) {
      const batList = getUpgradedBatteries(cells, baseSetup.battery, isExtreme);
      if (batList.length === 0) continue;
      const targetBattery = batList[0];

      const motorPool = mList.filter(m => {
        if (!isMotorVoltageCompatible(m, cells)) return false;
        if (m.weight < stockMotor.weight * 0.75 || m.weight > stockMotor.weight * 2.15) return false;
        if (m.id !== baseSetup.motor.id && m.maxCurrent < baseSetup.motor.maxCurrent * 0.85) return false;
        return true;
      });

      const escPool = getCandidateEscs(
        cells,
        baseSetup.esc.maxAmps,
        isExtreme ? baseSetup.esc.maxAmps : (baseSetup.esc.maxAmps <= 100 ? baseSetup.esc.maxAmps : 0)
      );

      for (const m of motorPool) {
        for (const p of pList) {
          if (p.diameter < minD || p.diameter > maxD) continue;
          if (!isExtreme && p.pitch > stockProp.pitch + 2) continue;

          let chosenEsc = escPool[0] || baseSetup.esc;
          let s = calculateSpecs({ aircraft, motor: m, esc: chosenEsc, battery: targetBattery, propeller: p, throttle: 100 });
          if (s.escLoad > maxEscLoad || chosenEsc.maxAmps < m.maxCurrent * 0.90) {
            const biggerEsc = escPool.find(e => {
              const testS = calculateSpecs({ aircraft, motor: m, esc: e, battery: targetBattery, propeller: p, throttle: 100 });
              return testS.escLoad <= maxEscLoad && e.maxAmps >= baseSetup.esc.maxAmps;
            });
            if (biggerEsc) {
              chosenEsc = biggerEsc;
              s = calculateSpecs({ aircraft, motor: m, esc: chosenEsc, battery: targetBattery, propeller: p, throttle: 100 });
            }
          }

          if (chosenEsc.maxAmps < baseSetup.esc.maxAmps) continue;
          if (targetBattery.cells < baseSetup.battery.cells) continue;
          if (targetBattery.cells === baseSetup.battery.cells && targetBattery.cRating < baseSetup.battery.cRating) continue;
          if (s.watts <= baseSpecs.watts * 1.05) continue;
          if (s.pitchSpeed < baseSpecs.pitchSpeed) continue;
          if (s.motorLoad > maxMotorLoad || s.escLoad > maxEscLoad || s.batteryLoad > maxBatLoad) continue;

          const wattRatio = s.watts / baseSpecs.watts;
          if (wattRatio > maxWattRatio) continue;

          const wattTargetScore = 100 - Math.abs(wattRatio - idealWattRatio) * 140;
          const speedGainScore = Math.min((s.pitchSpeed - baseSpecs.pitchSpeed) * 1.5, 30);
          const sameMotorBonus = (!isExtreme && m.id === baseSetup.motor.id) ? 30 : 0;
          const sameCellsBonus = (!isExtreme && cells === baseSetup.battery.cells) ? 25 : 0;
          const escUpgradeBonus = chosenEsc.maxAmps > baseSetup.esc.maxAmps ? 15 : 5;
          const propScaleScore = 20 - Math.abs(p.diameter - baseSetup.propeller.diameter) * 5;

          const totalScore = wattTargetScore + speedGainScore + sameMotorBonus + sameCellsBonus + escUpgradeBonus + propScaleScore;
          if (totalScore > bestScore) {
            bestScore = totalScore;
            bestCandidate = { motor: m, esc: chosenEsc, battery: targetBattery, propeller: p, specs: s };
          }
        }
      }
    }

    return bestCandidate;
  }

  const stockObj = { motor: stockMotor, esc: stockEsc, battery: stockBattery, propeller: stockProp, specs: stockSpecs };
  const aggressiveObj = findStepUpSetup(stockObj, false);

  if (presetType === 'aggressive') {
    return aggressiveObj || stockObj;
  }

  if (presetType === 'extreme') {
    const baseForExtreme = aggressiveObj || stockObj;
    const extremeObj = findStepUpSetup(baseForExtreme, true);
    return extremeObj || aggressiveObj || stockObj;
  }

  return stockObj;
}

/**
 * Scale-Aware Maximum Speed Optimizer
 * Finds the highest pitch-speed / top-speed powerplant combination for the selected aircraft
 * while enforcing airframe cell limits, motor/battery weight limits, scale propeller diameter bounds,
 * and safe thermal load limits (<= 96% motor load, <= 92% ESC & battery load).
 */
export function getFastestSafeSetupForAircraft(aircraft, db = {}) {
  const { motors: mList = [], escs: eList = [], batteries: bList = [], propellers: pList = [] } = db;
  const stockPreset = getPresetSetupForAircraft(aircraft, 'scale', db);
  const extremePreset = getPresetSetupForAircraft(aircraft, 'extreme', db);

  const stockMotor = stockPreset.motor;
  const stockEsc = stockPreset.esc;
  const stockBattery = stockPreset.battery;
  const stockProp = stockPreset.propeller;

  const maxAllowedCells = getAirframeMaxCells(aircraft, stockBattery.cells);
  const maxAllowedBatWeight = Math.max(stockBattery.weight * 1.45, (aircraft?.flyingWeight || 8.5) * 453.592 * 0.30);
  const { minD, maxD } = getPropDiamBounds(aircraft, stockProp);
  const speedMinD = Math.max(10, minD - 1);

  let bestCandidate = extremePreset;
  let bestScore = (extremePreset.specs.pitchSpeed * 1000) + extremePreset.specs.watts;

  const validBatteries = bList.filter(b =>
    b.cells >= stockBattery.cells &&
    b.cells <= maxAllowedCells &&
    b.weight <= maxAllowedBatWeight
  );

  const validMotors = mList.filter(m =>
    m.weight >= stockMotor.weight * 0.75 &&
    m.weight <= stockMotor.weight * 1.85 &&
    m.maxPower >= stockMotor.maxPower * 0.90
  );

  for (const bat of validBatteries) {
    const validEscs = eList
      .filter(e => isEscVoltageCompatible(e, bat.cells) && e.maxAmps >= stockEsc.maxAmps)
      .sort((a, b) => a.maxAmps - b.maxAmps);
    if (validEscs.length === 0) continue;

    for (const m of validMotors) {
      if (!isMotorVoltageCompatible(m, bat.cells)) continue;

      for (const p of pList) {
        if (p.diameter < speedMinD || p.diameter > maxD) continue;

        const maxEsc = validEscs[validEscs.length - 1];
        const probeSpecs = calculateSpecs({
          aircraft,
          motor: m,
          esc: maxEsc,
          battery: bat,
          propeller: p,
          throttle: 100
        });

        const reqEscAmps = Math.max(probeSpecs.ampsPerMotor * 1.15, stockEsc.maxAmps);
        const chosenEsc = validEscs.find(e => e.maxAmps >= reqEscAmps) || maxEsc;

        const s = calculateSpecs({
          aircraft,
          motor: m,
          esc: chosenEsc,
          battery: bat,
          propeller: p,
          throttle: 100
        });

        if (s.motorLoad > 96 || s.escLoad > 92 || s.batteryLoad > 92) continue;
        if (s.thrustToWeight < 0.85) continue;
        if (s.watts < stockPreset.specs.watts * 1.05) continue;
        if (s.pitchSpeed < extremePreset.specs.pitchSpeed) continue;

        const score = (s.pitchSpeed * 1000) + s.watts;
        if (score > bestScore) {
          bestScore = score;
          bestCandidate = {
            motor: m,
            esc: chosenEsc,
            battery: bat,
            propeller: p,
            specs: s
          };
        }
      }
    }
  }

  return bestCandidate;
}
