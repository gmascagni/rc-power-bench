import React from 'react';
import { calculateSpecs } from '../utils/calcEngine';
import { ShieldAlert, AlertTriangle, CheckCircle, Flame, BatteryCharging, Zap } from 'lucide-react';

export default function ValidatorChecks({
  selectedAircraft,
  selectedMotor,
  selectedEsc,
  selectedBattery,
  selectedPropeller
}) {
  const specs = calculateSpecs({
    aircraft: selectedAircraft,
    motor: selectedMotor,
    esc: selectedEsc,
    battery: selectedBattery,
    propeller: selectedPropeller,
    throttle: 100 // Test at full load
  });

  // Run validations
  const checks = [];

  // 1. ESC check
  const escSafe = specs.amps <= selectedEsc.maxAmps;
  const escMarginal = specs.amps > selectedEsc.maxAmps && specs.amps <= selectedEsc.burstAmps;
  checks.push({
    title: "ESC CURRENT CAPACITY",
    description: `Current draw: ${specs.amps}A vs ESC max capacity: ${selectedEsc.maxAmps}A (burst: ${selectedEsc.burstAmps}A)`,
    status: escSafe ? 'pass' : escMarginal ? 'warning' : 'fail',
    remedy: escSafe ? null : escMarginal ? "Avoid prolonged full-throttle flights beyond 10-15 seconds." : "High risk of ESC thermal destruction. Upgrade to a larger ESC (minimum 100A+)."
  });

  // 2. Motor Power check
  const motorWattsSafe = specs.watts <= selectedMotor.maxPower;
  const motorWattsMarginal = specs.watts > selectedMotor.maxPower && specs.watts <= selectedMotor.maxPower * 1.2;
  checks.push({
    title: "MOTOR THERMAL POWER LIMIT",
    description: `Calculated Power: ${specs.watts}W vs Motor max limit: ${selectedMotor.maxPower}W`,
    status: motorWattsSafe ? 'pass' : motorWattsMarginal ? 'warning' : 'fail',
    remedy: motorWattsSafe ? null : motorWattsMarginal ? "Monitor motor core temperature. Improve cowled cooling airflow." : "Windings will overheat and burn. Decrease propeller diameter or pitch, or decrease battery voltage (cells)."
  });

  // 3. Battery Discharge C-Rate check
  const maxBatAmps = (selectedBattery.capacity / 1000) * selectedBattery.cRating;
  const batterySafe = specs.amps <= maxBatAmps * 0.8;
  const batteryMarginal = specs.amps > maxBatAmps * 0.8 && specs.amps <= maxBatAmps;
  checks.push({
    title: "BATTERY DISCHARGE RATE (C)",
    description: `Current draw: ${specs.amps}A vs battery continuous max limit: ${maxBatAmps}A (${selectedBattery.cRating}C continuous)`,
    status: batterySafe ? 'pass' : batteryMarginal ? 'warning' : 'fail',
    remedy: batterySafe ? null : batteryMarginal ? "Battery cells will run warm. Ensure adequate venting." : "Severe risk of battery puffing, swelling or thermal runaway. Choose a battery pack with higher capacity or C-rating."
  });

  // 4. Thrust-to-Weight Flight Capability Check
  const thrustSufficient = specs.thrustToWeight >= 0.7;
  const thrustExcellent = specs.thrustToWeight >= 0.95;
  checks.push({
    title: "THRUST-TO-WEIGHT FLIGHT CAPABILITY",
    description: `Thrust-to-weight ratio: ${specs.thrustToWeight} : 1 (${specs.thrust} lbs thrust vs ${selectedAircraft.flyingWeight} lbs flying weight)`,
    status: thrustExcellent ? 'pass' : thrustSufficient ? 'warning' : 'fail',
    remedy: thrustExcellent ? null : thrustSufficient ? "Flyable, scale performance. Takeoff run will require length." : "Insufficient power. The warbird may struggle to fly or stall on climb. Increase battery voltage or propeller size."
  });

  // 5. RPM propeller speed limits
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
    <div className="crt-effect" style={{ padding: '16px', maxWidth: '1000px', margin: '0 auto' }}>
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
