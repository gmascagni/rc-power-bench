import React from 'react';
import { ToggleLeft, ToggleRight, Volume2, VolumeX, Eye, Shield, HelpCircle } from 'lucide-react';

export default function SettingsOptions({
  crtEnabled,
  setCrtEnabled,
  unitSystem,
  setUnitSystem,
  soundEnabled,
  setSoundEnabled
}) {
  return (
    <div className="crt-effect" style={{ padding: '16px', maxWidth: '800px', margin: '0 auto' }}>
      <div className="metal-panel">
        <div className="screw" style={{ top: '8px', left: '8px' }}></div>
        <div className="screw" style={{ top: '8px', right: '8px' }}></div>
        <div className="screw" style={{ bottom: '8px', left: '8px' }}></div>
        <div className="screw" style={{ bottom: '8px', right: '8px' }}></div>

        <div className="panel-header">
          ★ DIAGNOSTICS STATION SETTINGS & CONFIGURATION
        </div>

        <div className="card-content" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Cockpit Backlight Settings */}
          <div style={{ borderBottom: '1px solid var(--color-panel-border)', paddingBottom: '16px' }}>
            <div className="flex-between" style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye size={18} />
                <div>
                  <h3 style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>COCKPIT DIAL BACKLIGHT</h3>
                  <p style={{ fontSize: '10px', color: 'var(--color-amber-dim)' }}>
                    Toggles instrument dials backlights between a warm vacuum-tube amber glow and a bright clean white scale.
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => setCrtEnabled(!crtEnabled)} 
                className="btn-retro"
                style={{ minWidth: '110px', padding: '6px 12px' }}
              >
                {crtEnabled ? "WARM AMBER" : "CLEAN WHITE"}
              </button>
            </div>
          </div>

          {/* Unit System */}
          <div style={{ borderBottom: '1px solid var(--color-panel-border)', paddingBottom: '16px' }}>
            <div className="flex-between" style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={18} />
                <div>
                  <h3 style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>MEASUREMENT STANDARDS</h3>
                  <p style={{ fontSize: '10px', color: 'var(--color-amber-dim)' }}>
                    Switch measurement outputs between English (Inches, lbs, MPH) and Metric (Millimeters, grams, km/h).
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => setUnitSystem(unitSystem === 'imperial' ? 'metric' : 'imperial')} 
                className="btn-retro"
                style={{ minWidth: '100px', padding: '6px 12px', textTransform: 'uppercase' }}
              >
                {unitSystem}
              </button>
            </div>
          </div>

          {/* Audio Hum */}
          <div style={{ borderBottom: '1px solid var(--color-panel-border)', paddingBottom: '16px' }}>
            <div className="flex-between" style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                <div>
                  <h3 style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>BENCH ENGINE AUDIBLE FEEDBACK</h3>
                  <p style={{ fontSize: '10px', color: 'var(--color-amber-dim)' }}>
                    Generate simulated propeller wind noise and electric motor core whine based on load level.
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => setSoundEnabled(!soundEnabled)} 
                className="btn-retro"
                style={{ minWidth: '100px', padding: '6px 12px' }}
              >
                {soundEnabled ? "MUTED" : "UNMUTED"}
              </button>
            </div>
            
            {soundEnabled && (
              <div style={{
                marginTop: '10px',
                padding: '8px',
                backgroundColor: '#120e0c',
                border: '1px dotted var(--color-red)',
                borderRadius: '3px',
                fontSize: '9px',
                color: 'var(--color-red)',
                textAlign: 'center'
              }}>
                NOTE: Simulated synthesizer hum loops are active during bench test calculation sweeps. Keep speakers clear.
              </div>
            )}
          </div>

          {/* Help/Calibration Details */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <HelpCircle size={18} />
              <h3 style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>CALIBRATION BENCHMARKS</h3>
            </div>
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.4' }}>
              All metrics are calibrated against experimental static thrust stand values. Windtunnel conditions may reduce current draw by 15-20% and increase efficiency due to propeller unloading effect. Use with caution.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
