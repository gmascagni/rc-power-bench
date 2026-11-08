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
    <div style={{ padding: '16px', maxWidth: '800px', margin: '0 auto' }}>
      <div className="metal-panel">
        <div className="screw" style={{ top: '8px', left: '8px' }}></div>
        <div className="screw" style={{ top: '8px', right: '8px' }}></div>
        <div className="screw" style={{ bottom: '8px', left: '8px' }}></div>
        <div className="screw" style={{ bottom: '8px', right: '8px' }}></div>

        <div className="panel-header">
          ⚙️ AVIONICS STATION SETTINGS & PREFERENCES
        </div>

        <div className="card-content" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Cockpit Backlight Settings */}
          <div style={{ borderBottom: '1px solid var(--color-panel-border)', paddingBottom: '16px' }}>
            <div className="flex-between" style={{ marginBottom: '8px', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                <Eye size={18} style={{ color: 'var(--color-amber)', flexShrink: 0 }} />
                <div>
                  <h3 style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>AVIONICS COCKPIT THEME & BACKLIGHT</h3>
                  <p style={{ fontSize: '11px', color: 'var(--color-amber-dim)', marginTop: '2px' }}>
                    Switch between Modern Avionics Sky-Blue Day Mode and Classic Vintage Warm Amber Instrumentation.
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => setCrtEnabled(!crtEnabled)} 
                className="btn-retro active"
                style={{ minWidth: '150px', padding: '8px 14px' }}
              >
                {crtEnabled ? "☀️ AVIONICS SKY" : "🌙 WARM AMBER"}
              </button>
            </div>
          </div>

          {/* Unit System */}
          <div style={{ borderBottom: '1px solid var(--color-panel-border)', paddingBottom: '16px' }}>
            <div className="flex-between" style={{ marginBottom: '8px', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                <Shield size={18} style={{ color: 'var(--color-cyan)', flexShrink: 0 }} />
                <div>
                  <h3 style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>MEASUREMENT STANDARDS</h3>
                  <p style={{ fontSize: '11px', color: 'var(--color-amber-dim)', marginTop: '2px' }}>
                    Switch telemetry readouts between Imperial (inches, lbs, MPH, °F) and Metric (mm, kg, km/h, °C).
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => setUnitSystem(unitSystem === 'imperial' ? 'metric' : 'imperial')} 
                className="btn-retro active"
                style={{ minWidth: '150px', padding: '8px 14px', textTransform: 'uppercase' }}
              >
                {unitSystem === 'imperial' ? '🇺🇸 IMPERIAL (LBS/MPH)' : '🌍 METRIC (KG/KMH)'}
              </button>
            </div>
          </div>

          {/* Audio Hum */}
          <div style={{ borderBottom: '1px solid var(--color-panel-border)', paddingBottom: '16px' }}>
            <div className="flex-between" style={{ marginBottom: '8px', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                {soundEnabled ? <Volume2 size={18} style={{ color: 'var(--color-green)', flexShrink: 0 }} /> : <VolumeX size={18} style={{ color: 'var(--color-amber-dim)', flexShrink: 0 }} />}
                <div>
                  <h3 style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>DYNO ACOUSTIC TELEMETRY FEEDBACK</h3>
                  <p style={{ fontSize: '11px', color: 'var(--color-amber-dim)', marginTop: '2px' }}>
                    Synthesizes live propeller vortex tone and brushless outrunner frequency scaled to RPM when advancing the throttle.
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => setSoundEnabled(!soundEnabled)} 
                className={`btn-retro ${soundEnabled ? 'active' : ''}`}
                style={{ minWidth: '150px', padding: '8px 14px' }}
              >
                {soundEnabled ? "🔊 AUDIO ACTIVE" : "🔇 AUDIO MUTED"}
              </button>
            </div>
            
            {soundEnabled && (
              <div style={{
                marginTop: '10px',
                padding: '8px 12px',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid var(--color-green)',
                borderRadius: '4px',
                fontSize: '10.5px',
                color: 'var(--color-green)',
                textAlign: 'center'
              }}>
                ✓ Web Audio Synthesizer is armed. Move the Throttle Quadrant in the Cockpit to hear live RPM-modulated prop & motor acoustics.
              </div>
            )}
          </div>

          {/* Help/Calibration Details */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <HelpCircle size={18} style={{ color: 'var(--color-amber)' }} />
              <h3 style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>AERODYNAMIC CALIBRATION BENCHMARKS</h3>
            </div>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', lineHeight: '1.5' }}>
              All metrics are calibrated against empirical static thrust stand measurements (P ∝ D⁴ × Pitch × RPM³). In-flight aerodynamic unloading typically reduces current draw by 15–20% and increases prop efficiency at cruise airspeed.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
