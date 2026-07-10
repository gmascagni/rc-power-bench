import React, { useState } from 'react';
import { calculateSpecs } from '../utils/calcEngine';
import { CircularGauge } from './Gauges';

export default function CalculatorEngine() {
  // Custom calculator state
  const [cells, setCells] = useState(6);
  const [capacity, setCapacity] = useState(5000);
  const [cRating, setCRating] = useState(45);
  const [kv, setKv] = useState(600);
  const [motorResistance, setMotorResistance] = useState(0.016);
  const [noLoadCurrent, setNoLoadCurrent] = useState(1.6);
  const [maxPower, setMaxPower] = useState(1800);
  const [maxCurrent, setMaxCurrent] = useState(80);
  const [escMaxAmps, setEscMaxAmps] = useState(120);
  const [escResistance, setEscResistance] = useState(0.0008);
  const [diameter, setDiameter] = useState(15);
  const [pitch, setPitch] = useState(10);
  const [flyingWeight, setFlyingWeight] = useState(8.5);
  const [throttle, setThrottle] = useState(100);

  // Form mock objects to fit calcEngine signature
  const aircraft = { flyingWeight };
  const motor = { kv, internalResistance: motorResistance, noLoadCurrent, maxPower, maxCurrent };
  const esc = { maxAmps: escMaxAmps, resistance: escResistance };
  const battery = { cells, capacity, cRating, internalResistance: 0.002 };
  const propeller = { diameter, pitch, kProp: 1.0 };

  const specs = calculateSpecs({ aircraft, motor, esc, battery, propeller, throttle });

  return (
    <div className="crt-effect" style={{ padding: '16px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="metal-panel">
        <div className="screw" style={{ top: '8px', left: '8px' }}></div>
        <div className="screw" style={{ top: '8px', right: '8px' }}></div>
        <div className="screw" style={{ bottom: '8px', left: '8px' }}></div>
        <div className="screw" style={{ bottom: '8px', right: '8px' }}></div>

        <div className="panel-header">
          ★ CUSTOM ENGINE BENCH (MANUAL OVERRIDE CALCULATOR)
        </div>

        <div className="card-content" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px', padding: '16px' }}>
          
          {/* Controls Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderRight: '1px solid var(--color-panel-border)', paddingRight: '20px' }}>
            
            {/* Battery Override */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-amber-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>
                BATTERY PACK PARAMETERS
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '9px', display: 'block', marginBottom: '2px' }}>CELLS (S)</label>
                  <input type="number" className="retro-input" value={cells} onChange={e => setCells(parseInt(e.target.value) || 1)} min="1" max="14" />
                </div>
                <div>
                  <label style={{ fontSize: '9px', display: 'block', marginBottom: '2px' }}>CAPACITY (mAh)</label>
                  <input type="number" className="retro-input" value={capacity} onChange={e => setCapacity(parseInt(e.target.value) || 100)} min="100" max="20000" step="100" />
                </div>
                <div>
                  <label style={{ fontSize: '9px', display: 'block', marginBottom: '2px' }}>C-RATING</label>
                  <input type="number" className="retro-input" value={cRating} onChange={e => setCRating(parseInt(e.target.value) || 1)} min="5" max="150" />
                </div>
              </div>
            </div>

            {/* Motor Override */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-amber-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>
                BRUSHLESS MOTOR CONSTANTS
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                <div>
                  <label style={{ fontSize: '9px', display: 'block', marginBottom: '2px' }}>MOTOR KV Rating</label>
                  <input type="number" className="retro-input" value={kv} onChange={e => setKv(parseInt(e.target.value) || 100)} min="50" max="3000" step="10" />
                </div>
                <div>
                  <label style={{ fontSize: '9px', display: 'block', marginBottom: '2px' }}>WINDING RES (Ω)</label>
                  <input type="number" className="retro-input" value={motorResistance} onChange={e => setMotorResistance(parseFloat(e.target.value) || 0.001)} min="0.001" max="0.5" step="0.001" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '9px', display: 'block', marginBottom: '2px' }}>NO LOAD (A)</label>
                  <input type="number" className="retro-input" value={noLoadCurrent} onChange={e => setNoLoadCurrent(parseFloat(e.target.value) || 0.1)} min="0.1" max="10" step="0.1" />
                </div>
                <div>
                  <label style={{ fontSize: '9px', display: 'block', marginBottom: '2px' }}>MAX WATTS (W)</label>
                  <input type="number" className="retro-input" value={maxPower} onChange={e => setMaxPower(parseInt(e.target.value) || 100)} min="100" max="6000" step="50" />
                </div>
                <div>
                  <label style={{ fontSize: '9px', display: 'block', marginBottom: '2px' }}>MAX AMPS (A)</label>
                  <input type="number" className="retro-input" value={maxCurrent} onChange={e => setMaxCurrent(parseInt(e.target.value) || 10)} min="10" max="250" />
                </div>
              </div>
            </div>

            {/* Propeller Override */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-amber-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>
                PROPELLER PROFILE
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '9px', display: 'block', marginBottom: '2px' }}>DIAMETER (IN)</label>
                  <input type="number" className="retro-input" value={diameter} onChange={e => setDiameter(parseFloat(e.target.value) || 5)} min="5" max="32" step="0.5" />
                </div>
                <div>
                  <label style={{ fontSize: '9px', display: 'block', marginBottom: '2px' }}>PITCH (IN)</label>
                  <input type="number" className="retro-input" value={pitch} onChange={e => setPitch(parseFloat(e.target.value) || 3)} min="3" max="24" step="0.5" />
                </div>
              </div>
            </div>

            {/* ESC Override */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-amber-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>
                ESC & AIRFRAME SPEC
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '9px', display: 'block', marginBottom: '2px' }}>ESC CAPACITY (A)</label>
                  <input type="number" className="retro-input" value={escMaxAmps} onChange={e => setEscMaxAmps(parseInt(e.target.value) || 10)} min="10" max="250" />
                </div>
                <div>
                  <label style={{ fontSize: '9px', display: 'block', marginBottom: '2px' }}>AIRFRAME WT (LBS)</label>
                  <input type="number" className="retro-input" value={flyingWeight} onChange={e => setFlyingWeight(parseFloat(e.target.value) || 1.0)} min="0.5" max="40" step="0.1" />
                </div>
              </div>
            </div>

            {/* Throttle Slider */}
            <div>
              <div className="flex-between" style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-amber-dim)', marginBottom: '4px' }}>
                <span>THROTTLE SETTING</span>
                <span style={{ color: '#fff' }}>{throttle}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={throttle} 
                onChange={e => setThrottle(parseInt(e.target.value))} 
                style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--color-red)' }}
              />
            </div>

          </div>

          {/* Outputs Column */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-amber-dim)', marginBottom: '12px', textTransform: 'uppercase' }}>
              DIAGNOSTICS PREDICTION RESULT
            </div>

            {/* Live readout grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div style={{ border: '1px solid var(--color-panel-border)', borderRadius: '4px', padding: '10px', backgroundColor: '#120e0c' }}>
                <div style={{ fontSize: '9px', color: 'var(--color-amber-dim)' }}>STATIC THRUST (EST)</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--color-green)' }}>{specs.thrust} lbs</div>
                <div style={{ fontSize: '9px', color: '#ffb347', marginTop: '2px' }}>Ratio: {specs.thrustToWeight} : 1</div>
              </div>
              <div style={{ border: '1px solid var(--color-panel-border)', borderRadius: '4px', padding: '10px', backgroundColor: '#120e0c' }}>
                <div style={{ fontSize: '9px', color: 'var(--color-amber-dim)' }}>PITCH SPEED (EST)</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--color-green)' }}>{specs.pitchSpeed} MPH</div>
                <div style={{ fontSize: '9px', color: '#ffb347', marginTop: '2px' }}>Level: ~{specs.topSpeed} MPH</div>
              </div>
            </div>

            {/* Gauges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', gap: '8px', marginBottom: '20px', padding: '10px', border: '1px solid var(--color-panel-border)', borderRadius: '4px', backgroundColor: '#140f0c' }}>
              <CircularGauge label="RPM" value={specs.rpm} min={0} max={16000} unit="RPM" size={90} />
              <CircularGauge label="AMPS" value={specs.amps} min={0} max={160} unit="AMPS" size={90} />
              <CircularGauge label="VOLTS" value={specs.volts} min={0} max={40} unit="VOLTS" size={90} />
              <CircularGauge label="WATTS" value={specs.watts} min={0} max={4000} unit="WATTS" size={90} />
            </div>

            {/* Output table */}
            <table className="retro-table">
              <tbody>
                <tr>
                  <td className="label">Motor Load Limit</td>
                  <td className="val" style={{ color: specs.motorLoad > 100 ? 'var(--color-red)' : '#fff' }}>
                    {specs.motorLoad}% {specs.motorLoad > 100 ? '[OVERLOAD]' : ''}
                  </td>
                </tr>
                <tr>
                  <td className="label">ESC Current Headroom</td>
                  <td className="val">
                    {Math.round(escMaxAmps - specs.amps)} A
                  </td>
                </tr>
                <tr>
                  <td className="label">Estimated Flight Time</td>
                  <td className="val">
                    {specs.flightTimeMin} - {specs.flightTimeMax} min
                  </td>
                </tr>
                <tr>
                  <td className="label">Average System Efficiency</td>
                  <td className="val" style={{ color: 'var(--color-green)' }}>
                    {specs.efficiency}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}
