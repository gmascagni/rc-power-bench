import React from 'react';
import { calculateSpecs, getMaxCells, getMinCells, isEscVoltageCompatible, getPropDiamBounds, formatWeight } from '../utils/calcEngine';
import { ShieldAlert, AlertTriangle, CheckCircle, Flame, BatteryCharging, Zap } from 'lucide-react';

export default function ValidatorChecks({
  selectedAircraft,
  selectedMotor,
  selectedEsc,
  selectedBattery,
  selectedPropeller,
  unitSystem = 'imperial'
}) {
  const batteryWeightLbs = (selectedBattery?.weight || 0) / 453.59;
  const activeEmptyWeight = selectedAircraft?.emptyWeight || selectedAircraft?.flyingWeight || 8.5;
  const totalFlyingWeight = activeEmptyWeight + batteryWeightLbs;
  const enginesCount = selectedAircraft?.enginesCount || 1;
  const dynamicAircraft = {
    ...selectedAircraft,
    emptyWeight: activeEmptyWeight,
    flyingWeight: totalFlyingWeight
  };

  const specs = calculateSpecs({
    aircraft: dynamicAircraft,
    motor: selectedMotor,
    esc: selectedEsc,
    battery: selectedBattery,
    propeller: selectedPropeller,
    throttle: 100 // Test at full load
  });

  const motorAmps = specs.ampsPerMotor ?? (specs.amps / enginesCount);
  const motorWatts = specs.wattsPerMotor ?? (specs.watts / enginesCount);

  // Run validations
  const checks = [];

  // 1. ESC Current Capacity check (evaluated per ESC against single motor draw)
  const escSafe = specs.escLoad <= 85;
  const escMarginal = specs.escLoad > 85 && specs.escLoad <= 100;
  checks.push({
    title: "ESC CURRENT CAPACITY",
    description: `Per-ESC current draw: ${motorAmps}A (${specs.escLoad}% load) ${enginesCount > 1 ? `[Total system: ${specs.amps}A across ${enginesCount} ESCs] ` : ''}vs ESC max continuous capacity: ${selectedEsc.maxAmps}A (burst: ${selectedEsc.burstAmps}A)`,
    status: escSafe ? 'pass' : escMarginal ? 'warning' : 'fail',
    remedy: escSafe ? null : escMarginal ? "ESC is running above 85% continuous rating. Ensure direct cooling airflow and avoid prolonged WOT." : "High risk of ESC thermal destruction! Upgrade to a higher-amperage ESC."
  });

  // 2. ESC Voltage Rating check
  const escVoltageSafe = isEscVoltageCompatible(selectedEsc, selectedBattery.cells);
  const escVoltageStr = selectedEsc.voltageSupported || selectedEsc.voltageRange || "3S-6S";
  checks.push({
    title: "ESC VOLTAGE RATING",
    description: `Selected Battery: ${selectedBattery.cells}S (${(selectedBattery.cells * 4.2).toFixed(1)}V charged) vs ESC Rated Voltage: ${escVoltageStr}`,
    status: escVoltageSafe ? 'pass' : 'fail',
    remedy: escVoltageSafe ? null : `CRITICAL ESC OVERVOLTAGE/UNDERVOLTAGE! ${selectedBattery.cells}S battery is outside ${selectedEsc.name} rated voltage (${escVoltageStr}). Select an HV-rated ESC.`
  });

  // 3. Motor Continuous Current check (evaluated per motor)
  const motorCurrentSafe = specs.motorLoad <= 85;
  const motorCurrentMarginal = specs.motorLoad > 85 && specs.motorLoad <= 100;
  const motorOverloadPct = selectedMotor.maxCurrent > 0 ? Math.round(((motorAmps / selectedMotor.maxCurrent) - 1) * 100) : 0;
  checks.push({
    title: "MOTOR CONTINUOUS CURRENT LIMIT",
    description: `Per-motor current draw: ${motorAmps}A (${specs.motorLoad}% load) ${enginesCount > 1 ? `[${enginesCount}x Motors = ${specs.amps}A total] ` : ''}vs Motor max continuous limit: ${selectedMotor.maxCurrent}A`,
    status: motorCurrentSafe ? 'pass' : motorCurrentMarginal ? 'warning' : 'fail',
    remedy: motorCurrentSafe ? null : motorCurrentMarginal ? "Motor is operating at 86-100% of continuous current limit. Limit continuous full-throttle passes." : `Severe motor overload! Current draw exceeds motor rating by +${motorOverloadPct}%. Downsize propeller diameter/pitch or lower cell count to prevent winding burnout.`
  });

  // 4. Motor Power check (evaluated per motor)
  const motorWattsSafe = motorWatts <= selectedMotor.maxPower;
  const motorWattsMarginal = motorWatts > selectedMotor.maxPower && motorWatts <= selectedMotor.maxPower * 1.15;
  checks.push({
    title: "MOTOR THERMAL POWER LIMIT",
    description: `Per-motor power: ${motorWatts}W ${enginesCount > 1 ? `(Total airframe: ${specs.watts}W) ` : ''}vs Motor max limit: ${selectedMotor.maxPower}W`,
    status: motorWattsSafe ? 'pass' : motorWattsMarginal ? 'warning' : 'fail',
    remedy: motorWattsSafe ? null : motorWattsMarginal ? "Monitor motor core temperature. Improve cowled cooling airflow." : "Windings will overheat and burn. Decrease propeller diameter or pitch, or decrease battery voltage (cells)."
  });

  // 5. Motor Voltage Rating check
  const maxMotorCells = getMaxCells(selectedMotor.voltageSupported);
  const minMotorCells = getMinCells(selectedMotor.voltageSupported);
  const voltageSafe = selectedBattery.cells >= minMotorCells && selectedBattery.cells <= maxMotorCells;
  checks.push({
    title: "MOTOR VOLTAGE RATING",
    description: `Selected Battery: ${selectedBattery.cells}S vs Motor Rated Voltage: ${selectedMotor.voltageSupported}`,
    status: voltageSafe ? 'pass' : 'fail',
    remedy: voltageSafe ? null : `Voltage out of spec! Selected ${selectedBattery.cells}S battery is outside motor rated range (${selectedMotor.voltageSupported}). Select a battery matching motor cell specs.`
  });

  // 6. Battery Discharge C-Rate check (aligned with calculateSpecs sustained discharge limit)
  const maxBatAmps = Math.round((selectedBattery.capacity / 1000) * selectedBattery.cRating * 0.57);
  const peakBurstBatAmps = Math.round((selectedBattery.capacity / 1000) * selectedBattery.cRating);
  const batterySafe = specs.batteryLoad <= 85;
  const batteryMarginal = specs.batteryLoad > 85 && specs.batteryLoad <= 100;
  checks.push({
    title: "BATTERY DISCHARGE RATE (C)",
    description: `Total battery current draw: ${specs.amps}A (${specs.batteryLoad}% sustained load) vs sustained safe limit: ${maxBatAmps}A (${peakBurstBatAmps}A theoretical ${selectedBattery.cRating}C rating)`,
    status: batterySafe ? 'pass' : batteryMarginal ? 'warning' : 'fail',
    remedy: batterySafe ? null : batteryMarginal ? "Battery cells will run warm under sustained WOT. Ensure adequate venting." : "Severe risk of voltage sag, battery puffing, or thermal runaway. Choose a battery pack with higher capacity or C-rating."
  });

  // 7. Thrust-to-Weight Flight Capability Check
  const thrustSufficient = specs.thrustToWeight >= 0.7;
  const thrustExcellent = specs.thrustToWeight >= 0.90;
  checks.push({
    title: "THRUST-TO-WEIGHT FLIGHT CAPABILITY",
    description: `Thrust-to-weight ratio: ${specs.thrustToWeight} : 1 (${formatWeight(specs.thrust, unitSystem, 2)} thrust vs ${formatWeight(totalFlyingWeight, unitSystem, 2)} flying weight [airframe: ${formatWeight(activeEmptyWeight, unitSystem, 2)} + battery: ${formatWeight(batteryWeightLbs, unitSystem, 2)}])`,
    status: thrustExcellent ? 'pass' : thrustSufficient ? 'warning' : 'fail',
    remedy: thrustExcellent ? null : thrustSufficient ? "Flyable scale performance. Takeoff roll will require scale runway distance." : "Insufficient thrust. The warbird may struggle to climb out safely. Increase battery voltage or propeller size."
  });

  // 8. Propeller Airframe Scale & Ground Clearance Check
  const { minD, maxD } = getPropDiamBounds(dynamicAircraft, null);
  const propScaleSafe = selectedPropeller.diameter >= minD - 1 && selectedPropeller.diameter <= maxD;
  const propScaleWarning = (selectedPropeller.diameter === minD - 2 || selectedPropeller.diameter === maxD + 1);
  checks.push({
    title: "PROPELLER AIRFRAME SCALE & CLEARANCE",
    description: `Selected Propeller: ${selectedPropeller.diameter}" diameter vs Airframe Scale Envelope: ${minD}" – ${maxD}" (${dynamicAircraft.wingspan}" WS${enginesCount > 1 ? `, ${enginesCount}-Engine` : ''})`,
    status: propScaleSafe ? 'pass' : propScaleWarning ? 'warning' : 'fail',
    remedy: propScaleSafe ? null : selectedPropeller.diameter > maxD ? `Propeller diameter (${selectedPropeller.diameter}") exceeds landing gear / nacelle ground clearance (${maxD}" max) and risks prop strike!` : `Propeller diameter (${selectedPropeller.diameter}") is undersized for ${dynamicAircraft.wingspan}" wingspan cowl & disc area.`
  });

  // 9. RPM propeller speed limits
  const propLimit = 190000 / selectedPropeller.diameter; // Standard APC E RPM limit formula
  const rpmSafe = specs.rpm <= propLimit;
  checks.push({
    title: "PROPELLER STRUCTURAL LIMIT (RPM)",
    description: `Maximum RPM: ${specs.rpm} vs APC structural safety limit: ${Math.round(propLimit)} RPM`,
    status: rpmSafe ? 'pass' : 'fail',
    remedy: rpmSafe ? null : "Blade separation warning. APC Electric props should not exceed this RPM threshold. Swap to a gas prop or carbon-fiber prop."
  });

  // Calculate stats
  const totalFailures = checks.filter(c => c.status === 'fail').length;
  const totalWarnings = checks.filter(c => c.status === 'warning').length;

  return (
    <div style={{ padding: '16px', maxWidth: '1000px', margin: '0 auto' }}>
      <div className="metal-panel">
        <div className="screw" style={{ top: '8px', left: '8px' }}></div>
        <div className="screw" style={{ top: '8px', right: '8px' }}></div>
        <div className="screw" style={{ bottom: '8px', left: '8px' }}></div>
        <div className="screw" style={{ bottom: '8px', right: '8px' }}></div>

        <div className="panel-header">
          ★ FLIGHT PRE-CHECK & SAFETY VALIDATOR
        </div>

        <div className="card-content" style={{ padding: '16px' }}>
          
          {/* Header overall summary box */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            backgroundColor: '#120e0c',
            border: '2px solid var(--color-panel-border)',
            borderRadius: '4px',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: totalFailures > 0 ? 'rgba(209,53,53,0.1)' : totalWarnings > 0 ? 'rgba(229,157,50,0.1)' : 'rgba(76,175,80,0.1)',
              border: `3px solid ${totalFailures > 0 ? 'var(--color-red)' : totalWarnings > 0 ? 'var(--color-amber)' : 'var(--color-green)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: totalFailures > 0 ? '0 0 15px var(--color-red-glow)' : totalWarnings > 0 ? '0 0 15px var(--color-amber-glow)' : '0 0 15px var(--color-green-glow)'
            }}>
              {totalFailures > 0 ? <ShieldAlert size={36} className="glow-text-red" /> : 
               totalWarnings > 0 ? <AlertTriangle size={36} style={{ color: 'var(--color-amber)' }} /> : 
               <CheckCircle size={36} className="glow-text-green" />}
            </div>
            
            <div>
              <h2 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '18px',
                color: totalFailures > 0 ? 'var(--color-red)' : totalWarnings > 0 ? 'var(--color-amber)' : 'var(--color-green)',
                marginBottom: '4px'
              }}>
                {totalFailures > 0 ? "SAFETY PRE-CHECK COMPROMISED" : 
                 totalWarnings > 0 ? "MARGINAL CONFIGURATION WARNING" : 
                 "ALL DIAGNOSTIC CHECKS NOMINAL"}
              </h2>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>
                {totalFailures > 0 ? `Detected ${totalFailures} critical safety issues that will likely cause in-flight electronics failure or fires.` : 
                 totalWarnings > 0 ? `Detected ${totalWarnings} warnings. Flight is possible but limits must be managed carefully.` : 
                 "This power configuration matches limits and safety margins perfectly. Proceed with flight."}
              </p>
            </div>
          </div>

          {/* Validation Checks List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {checks.map((check, idx) => {
              const color = check.status === 'pass' ? 'var(--color-green)' : check.status === 'warning' ? 'var(--color-amber)' : 'var(--color-red)';
              const badgeBg = check.status === 'pass' ? 'rgba(76,175,80,0.08)' : check.status === 'warning' ? 'rgba(229,157,50,0.08)' : 'rgba(209,53,53,0.08)';
              
              return (
                <div 
                  key={idx} 
                  style={{
                    border: '1px solid var(--color-panel-border)',
                    borderRadius: '4px',
                    backgroundColor: '#120e0c',
                    padding: '12px'
                  }}
                >
                  <div className="flex-between" style={{ marginBottom: '6px' }}>
                    <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: '#fff', letterSpacing: '0.5px' }}>
                      {check.title}
                    </h3>
                    <span 
                      style={{
                        fontSize: '9px',
                        fontWeight: 'bold',
                        color: color,
                        border: `1px solid ${color}`,
                        borderRadius: '3px',
                        padding: '2px 6px',
                        backgroundColor: badgeBg
                      }}
                    >
                      {check.status.toUpperCase()}
                    </span>
                  </div>

                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginBottom: check.remedy ? '6px' : '0' }}>
                    {check.description}
                  </p>

                  {check.remedy && (
                    <div style={{
                      fontSize: '10px',
                      color: 'var(--color-amber-dim)',
                      borderTop: '1px dotted var(--color-panel-border)',
                      paddingTop: '6px',
                      marginTop: '4px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '4px'
                    }}>
                      <span style={{ color: 'var(--color-red)', fontWeight: 'bold' }}>REMEDY:</span>
                      <span>{check.remedy}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}
