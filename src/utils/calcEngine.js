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

export function getMaxCells(voltageSupportedStr) {
  if (!voltageSupportedStr) return 6;
  const str = String(voltageSupportedStr).toUpperCase();
  if (str.includes("12S")) return 12;
  if (str.includes("10S")) return 10;
  if (str.includes("8S")) return 8;
  if (str.includes("6S")) return 6;
  if (str.includes("5S")) return 5;
  if (str.includes("4S")) return 4;
  if (str.includes("3S")) return 3;
  return 6;
}

export function getMinCells(voltageSupportedStr) {
  if (!voltageSupportedStr) return 2;
  const str = String(voltageSupportedStr).toUpperCase();
  if (str.includes("10S")) return 10;
  if (str.includes("8S")) return 8;
  if (str.includes("6S")) return 6;
  if (str.includes("5S")) return 5;
  if (str.includes("4S")) return 4;
  if (str.includes("3S")) return 3;
  return 2;
}

export function calculateSpecs({ aircraft, motor, esc, battery, propeller, throttle }) {
  if (!aircraft || !motor || !esc || !battery || !propeller) {
    return {
      rpm: 0,
      amps: 0,
      volts: 0,
      watts: 0,
      efficiency: 0,
      temp: 0,
      thrustToWeight: 0,
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

  // 1. Calculate Full Throttle Current Load Factor based on Propeller Size, Motor KV, Battery Cells, and Blades count
  const blades = propeller.blades || 2;
  const bladesLoadMultiplier = blades === 3 ? 1.34 : blades === 4 ? 1.62 : 1.0;
  
  const dFactor = Math.pow(propeller.diameter / 15.0, 4.2);
  const pFactor = Math.pow(propeller.pitch / 10.0, 1.35);
  const kvFactor = Math.pow(motor.kv / 600.0, 2.8);
  const cellFactor = Math.pow(battery.cells / 6.0, 3.0);
  const kProp = propeller.kProp || 1.0;

  const I_full = 78.6 * dFactor * pFactor * kvFactor * cellFactor * kProp * bladesLoadMultiplier;

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
    volts: parseFloat(volts.toFixed(1)),
    watts: Math.round(watts * engines),
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
      watts: specs.watts
    });
  }
  return points;
}
