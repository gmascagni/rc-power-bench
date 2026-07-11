/**
 * Physics-based RC Power Bench Calculation Engine
 * Calibrated to match the benchmark configuration numbers:
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

  // 1. Calculate Full Throttle Current Load Factor based on Propeller Size, Motor KV, Battery Cells, and Blades count
  const blades = propeller.blades || 2;
  const bladesLoadMultiplier = blades === 3 ? 1.34 : blades === 4 ? 1.62 : 1.0;
  
  const dFactor = Math.pow(propeller.diameter / 15.0, 4.2);
  const pFactor = propeller.pitch / 10.0;
  const kvFactor = Math.pow(motor.kv / 600.0, 2.2);
  const cellFactor = Math.pow(battery.cells / 6.0, 3.2);
  const kProp = propeller.kProp || 1.0;

  const I_full = 77.0 * dFactor * pFactor * kvFactor * cellFactor * kProp * bladesLoadMultiplier;

  // Current, Voltage, Power, and RPM Calculations
  let amps = 0;
  let volts = battery.cells * 3.964;
  let watts = 0;
  let rpm = 0;

  if (motor.isGasOrGlow) {
    const idleRpm = 1800;
    const refDiameter = motor.refDiameter || 18;
    const refPitch = motor.refPitch || 8;
    const refLoad = Math.pow(refDiameter, 3) * refPitch;
    const load = Math.pow(propeller.diameter, 3) * propeller.pitch * Math.sqrt(blades / 2);
    
    if (t > 0) {
      // Calculate realistic RPM governed by propeller load
      rpm = Math.round(Math.min(idleRpm + t * (motor.maxRpm - idleRpm) * Math.pow(refLoad / load, 0.35), motor.maxRpm * 1.15));
      watts = Math.round(motor.horsepower * 746 * t);
      
      // Map to equivalent electrical statistics for conversion reference
      const eqCells = motor.eqCells || 6;
      volts = Math.max(eqCells * 3.7 - (t * 2.0), eqCells * 3.3);
      amps = Math.round(watts / volts);
    }
  } else {
    // Standard electric outrunner/inrunner equations
    if (t > 0) {
      amps = Math.pow(t, 2) * I_full + motor.noLoadCurrent;
    }
    const batteryIR = battery.cells * battery.internalResistance;
    const escIR = esc.resistance;
    const totalIR = batteryIR + escIR;
    const vRest = battery.cells * 3.964;
    volts = vRest;
    if (amps > 0) {
      volts = Math.max(vRest - amps * totalIR, battery.cells * 3.0);
    }
    watts = volts * amps;
    if (t > 0) {
      rpm = t * motor.kv * volts * (0.835 - 0.19 * (amps - motor.noLoadCurrent) / I_full);
    }
  }

  // 5. System Efficiency (%)
  // Standard efficiency curve peaking at ~80-85% depending on load vs max current
  let efficiency = 0;
  if (t > 0) {
    const loadRatio = amps / motor.maxCurrent;
    efficiency = Math.round(81 * (1.0 - 0.15 * Math.pow(loadRatio - 0.7, 2)));
    efficiency = Math.max(Math.min(efficiency, 95), 10);
  }

  // 6. Temperature (C)
  // Rises with current and throttle. Calibrated to 48C at 100% on default setup
  let temp = 25; // ambient temp
  if (t > 0) {
    temp = 25 + 23 * Math.pow(t, 2) * Math.pow(amps / 78.6, 1.3) * (motor.maxCurrent / 80.0);
  }

  // 7. Performance Predictions
  // Thrust (calibrated to 6.63 lbs thrust for default, matching 0.78 ratio on 8.5 lbs plane)
  const bladesThrustMultiplier = blades === 3 ? 1.20 : blades === 4 ? 1.36 : 1.0;
  let thrust = 0;
  if (t > 0) {
    thrust = 6.63 * Math.pow(propeller.diameter / 15.0, 3) * Math.sqrt(propeller.pitch / 10.0) * Math.pow(rpm / 8740.0, 2) * bladesThrustMultiplier;
  }
  const thrustToWeight = aircraft.flyingWeight > 0 ? (thrust / aircraft.flyingWeight) : 0;

  // Pitch Speed (MPH)
  // Standard theoretical pitch speed formula: RPM * pitch / 1056
  // Propeller unloads in flight (RPM rises by ~20% compared to static static bench testing)
  const flightRpm = rpm * 1.20;
  const pitchSpeed = rpm > 0 ? Math.round(flightRpm * propeller.pitch / 1056) : 0;

  // Top Speed estimate in level flight (MPH)
  // Aerodynamic drag prevents plane from exceeding pitch speed.
  // Loaded top speed is typical 74% - 90% of pitch speed, scaling with thrust-to-weight ratio.
  const efficiencyFactor = Math.min(0.74 + 0.12 * Math.min(thrustToWeight, 1.5), 0.90);
  const topSpeed = rpm > 0 ? Math.round(pitchSpeed * efficiencyFactor) : 0;

  // Flight Time (minutes)
  // For electric: Capacity is in mAh.
  // For gas/glow: Run time on typical fuel tank (capacity in oz).
  let flightTimeMin = 0;
  let flightTimeMax = 0;
  if (motor.isGasOrGlow) {
    if (t > 0) {
      const baseTime = motor.engineType === 'gas' ? 14 : 10;
      flightTimeMin = Math.round(baseTime * (0.85 / Math.sqrt(t)));
      flightTimeMax = Math.round(baseTime * (1.30 / Math.sqrt(t)));
      // Clamp values to realistic ranges
      flightTimeMin = Math.max(Math.min(flightTimeMin, 25), 6);
      flightTimeMax = Math.max(Math.min(flightTimeMax, 35), flightTimeMin + 3);
    }
  } else if (amps > 0) {
    const capAh = battery.capacity / 1000;
    // average current in normal flight is lower than static bench current
    const avgCurrentRatioMin = 0.55; // aggressive mixed throttle
    const avgCurrentRatioMax = 0.35; // gentle cruising
    
    flightTimeMin = Math.round((capAh / (amps * avgCurrentRatioMin)) * 60);
    flightTimeMax = Math.round((capAh / (amps * avgCurrentRatioMax)) * 60);
    
    // clamp values to realistic ranges
    flightTimeMin = Math.max(Math.min(flightTimeMin, 15), 3);
    flightTimeMax = Math.max(Math.min(flightTimeMax, 25), flightTimeMin + 2);
  }

  // 8. Load percentages
  // Motor load (calibrated so 78.6A on 80A max is 72% using 1.35x safety burst margin)
  const motorLoad = Math.round((amps / (motor.maxCurrent * 1.35)) * 100);
  // ESC load
  const escLoad = Math.round((amps / esc.maxAmps) * 100);
  // Battery load (calibrated: 78.6A on 5Ah 45C = 61% load against practical limit)
  const batMaxAmps = (battery.capacity / 1000) * battery.cRating * 0.57;
  const batteryLoad = Math.round((amps / batMaxAmps) * 100);

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
    amps: parseFloat(amps.toFixed(1)),
    volts: parseFloat(volts.toFixed(1)),
    watts: Math.round(watts),
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
