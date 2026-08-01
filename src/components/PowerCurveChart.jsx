import React from 'react';
import { generatePowerCurve } from '../utils/calcEngine';
import { recommendedSetups, motors, escs, batteries, propellers } from '../data/rcData';

export default function PowerCurveChart({ aircraft, motor, esc, battery, propeller, currentThrottle }) {
  // Generate selected data points
  const data = generatePowerCurve(aircraft, motor, esc, battery, propeller);

  // Retrieve manufacturer recommended stock setup components for the selected aircraft
  const stockConfig = aircraft?.stockSetup || recommendedSetups.scale;
  const recMotor = motors.find(m => m.id === stockConfig.motorId) || motor;
  const recEsc = escs.find(e => e.id === stockConfig.escId) || esc;
  const recBattery = batteries.find(b => b.id === stockConfig.batteryId) || battery;
  const recPropeller = propellers.find(p => p.id === stockConfig.propellerId) || propeller;

  // Generate recommended data points
  const recData = generatePowerCurve(aircraft, recMotor, recEsc, recBattery, recPropeller);

  // Retrieve saved model / benchmark setup (Fastest / Speed Run or Auto-Tuned prop)
  const optSetup = recommendedSetups.fastest;
  const optMotor = motor;
  const optEsc = esc;
  const optBattery = battery;
  // Select optimal speed prop for motor & battery if active prop differs, or fastest setup prop
  const optPropeller = propellers.find(p => p.id === optSetup.propellerId) || propeller;

  // Generate benchmark data points
  const optData = generatePowerCurve(aircraft, optMotor, optEsc, optBattery, optPropeller);

  // Dimensions of SVG (Enlarged chart canvas)
  const width = 500;
  const height = 230;
  const padding = { top: 24, right: 42, bottom: 32, left: 42 };

  // Scale functions
  const getX = (throttle) => {
    return padding.left + (throttle / 100) * (width - padding.left - padding.right);
  };

  const getYAmps = (amps) => {
    // Amps ranges 0 to 150
    return height - padding.bottom - (amps / 150) * (height - padding.top - padding.bottom);
  };

  const getYWatts = (watts) => {
    // Watts ranges 0 to 5000
    return height - padding.bottom - (watts / 5000) * (height - padding.top - padding.bottom);
  };

  // Generate path strings for selected setup
  let ampsPath = "";
  let wattsPath = "";
  data.forEach((p, idx) => {
    const x = getX(p.throttle);
    const yA = getYAmps(p.amps);
    const yW = getYWatts(p.watts);

    if (idx === 0) {
      ampsPath += `M ${x} ${yA}`;
      wattsPath += `M ${x} ${yW}`;
    } else {
      ampsPath += ` L ${x} ${yA}`;
      wattsPath += ` L ${x} ${yW}`;
    }
  });

  // Generate path strings for stock recommended setup
  let recAmpsPath = "";
  let recWattsPath = "";
  recData.forEach((p, idx) => {
    const x = getX(p.throttle);
    const yA = getYAmps(p.amps);
    const yW = getYWatts(p.watts);

    if (idx === 0) {
      recAmpsPath += `M ${x} ${yA}`;
      recWattsPath += `M ${x} ${yW}`;
    } else {
      recAmpsPath += ` L ${x} ${yA}`;
      recWattsPath += ` L ${x} ${yW}`;
    }
  });

  // Generate path strings for benchmark setup
  let optWattsPath = "";
  optData.forEach((p, idx) => {
    const x = getX(p.throttle);
    const yW = getYWatts(p.watts);

    if (idx === 0) {
      optWattsPath += `M ${x} ${yW}`;
    } else {
      optWattsPath += ` L ${x} ${yW}`;
    }
  });

  // Calculate current throttle position for the vertical indicator line
  const cursorX = getX(currentThrottle);
  const targetThrottle = Math.round(currentThrottle / 5) * 5;
  const currentPt = data.find(p => p.throttle === targetThrottle) || { watts: 0, amps: 0 };
  const stockPt = recData.find(p => p.throttle === targetThrottle) || { watts: 0, amps: 0 };
  const optPt = optData.find(p => p.throttle === targetThrottle) || { watts: 0, amps: 0 };
  const wattsDelta = Math.round(currentPt.watts - stockPt.watts);
  const wattsPct = stockPt.watts > 0 ? Math.round((wattsDelta / stockPt.watts) * 100) : 0;

  return (
    <div style={{ position: 'relative' }}>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ background: '#13171b', borderRadius: '4px', border: '1px solid var(--color-panel-border)' }}>
        <defs>
          <linearGradient id="ampsGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--color-red)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--color-red)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="wattsGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--color-amber)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--color-amber)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {/* Horizontal grids */}
        {[0, 30, 60, 90, 120, 150].map((val) => {
          const y = getYAmps(val);
          return (
            <g key={`y-${val}`}>
              <line 
                x1={padding.left} 
                y1={y} 
                x2={width - padding.right} 
                y2={y} 
                stroke="var(--color-panel-border)" 
                strokeWidth="1" 
                strokeDasharray="2,4" 
              />
              {/* Amps label (Left) */}
              <text x={padding.left - 6} y={y + 4} fill="var(--color-amber-dim)" fontSize="13.5" fontWeight="bold" textAnchor="end">{val}</text>
              {/* Watts label (Right, maps 150A -> 5000W) */}
              <text x={width - padding.right + 6} y={y + 4} fill="var(--color-amber-dim)" fontSize="13.5" fontWeight="bold" textAnchor="start">{Math.round(val * 5000 / 150)}</text>
            </g>
          );
        })}

        {/* Vertical grids */}
        {[0, 20, 40, 60, 80, 100].map((val) => {
          const x = getX(val);
          return (
            <g key={`x-${val}`}>
              <line 
                x1={x} 
                y1={padding.top} 
                x2={x} 
                y2={height - padding.bottom} 
                stroke="var(--color-panel-border)" 
                strokeWidth="1" 
                strokeDasharray="2,4" 
              />
              <text x={x} y={height - padding.bottom + 17} fill="var(--color-amber-dim)" fontSize="13.5" fontWeight="bold" textAnchor="middle">{val}</text>
            </g>
          );
        })}

        {/* Axis Labels */}
        <text x={padding.left - 30} y={padding.top - 6} fill="var(--color-red)" fontSize="14.5" fontWeight="bold">AMPS</text>
        <text x={width - padding.right + 2} y={padding.top - 6} fill="var(--color-amber)" fontSize="14.5" fontWeight="bold">WATTS</text>
        <text x={width / 2} y={height - 2} fill="var(--color-amber-dim)" fontSize="14.5" textAnchor="middle" fontWeight="bold" style={{ letterSpacing: '1px' }}>THROTTLE %</text>

        {/* Stock Recommended Curves (Dashed & Faded) */}
        <path d={recWattsPath} fill="none" stroke="var(--color-amber)" strokeWidth="1.8" strokeDasharray="5,3" strokeOpacity="0.45" />
        <path d={recAmpsPath} fill="none" stroke="var(--color-red)" strokeWidth="1.8" strokeDasharray="5,3" strokeOpacity="0.45" />

        {/* Saved Benchmark Curve (Cyan Dot-Dash) */}
        <path d={optWattsPath} fill="none" stroke="var(--color-cyan)" strokeWidth="1.8" strokeDasharray="6,3,2,3" strokeOpacity="0.55" />

        {/* Current Selected Curves (Solid & Glowing) */}
        <path d={wattsPath} fill="none" stroke="var(--color-amber)" strokeWidth="2.8" style={{ filter: 'drop-shadow(0 0 3px var(--color-amber-glow))' }} />
        <path d={ampsPath} fill="none" stroke="var(--color-red)" strokeWidth="2.8" style={{ filter: 'drop-shadow(0 0 3px var(--color-red-glow))' }} />

        {/* Vertical Throttle Indicator Cursor Line */}
        {currentThrottle > 0 && (
          <g>
            <line 
              x1={cursorX} 
              y1={padding.top} 
              x2={cursorX} 
              y2={height - padding.bottom} 
              stroke="#fff" 
              strokeWidth="1.5" 
              style={{ filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.8))' }} 
            />
            {/* Modified dots */}
            <circle cx={cursorX} cy={getYAmps(currentPt.amps)} r="4" fill="var(--color-red)" stroke="#fff" strokeWidth="1" />
            <circle cx={cursorX} cy={getYWatts(currentPt.watts)} r="4" fill="var(--color-amber)" stroke="#fff" strokeWidth="1" />
            
            {/* Stock dots (Faded border circles) */}
            <circle cx={cursorX} cy={getYAmps(stockPt.amps)} r="3.5" fill="none" stroke="var(--color-red)" strokeWidth="1.2" opacity="0.75" />
            <circle cx={cursorX} cy={getYWatts(stockPt.watts)} r="3.5" fill="none" stroke="var(--color-amber)" strokeWidth="1.2" opacity="0.75" />
          </g>
        )}
      </svg>

      {/* 3-Setup Comprehensive Comparison Panel Under Power Curve */}
      <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        
        {/* Setup 1: Stock ARF Baseline */}
        <div style={{ padding: '8px 10px', background: '#13171b', borderRadius: '4px', border: '1px solid var(--color-panel-border)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ display: 'inline-block', width: '16px', height: '0', borderTop: '2.5px dashed var(--color-red)' }}></span>
              <span style={{ color: 'var(--color-red)' }}>1. STOCK ARF BASELINE SETUP</span>
            </div>
            <span style={{ color: 'var(--color-amber-dim)', fontSize: '11.5px', fontFamily: 'var(--font-mono)' }}>
              {Math.round(stockPt.watts)} W / {Math.round(stockPt.amps)} A @ 100% THROTTLE
            </span>
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', fontFamily: 'var(--font-mono)', lineHeight: '1.4' }}>
            <span style={{ color: '#fff', fontWeight: 'bold' }}>{recBattery.cells}S ({(recBattery.cells * 3.7).toFixed(1)}V)</span> | <span style={{ color: '#ffc97a' }}>{recMotor.name}</span> | <span style={{ color: '#63b3ed' }}>{recPropeller.name}</span> | <span>{recEsc.name}</span>
          </div>
        </div>

        {/* Setup 2: Current Workbench Setup (Active Selected) */}
        {(() => {
          const activeAmps = currentPt.amps > 0 ? currentPt.amps : data[data.length - 1].amps;
          const currentRatio = activeAmps / Math.max(motor.maxCurrent, 1);
          let ampColor = "var(--color-green)";
          let ampGlow = "0 0 8px var(--color-green-glow)";
          let statusLabel = "SAFE";
          
          if (currentRatio > 1.0) {
            ampColor = "var(--color-red)";
            ampGlow = "0 0 8px var(--color-red-glow)";
            statusLabel = "OVERLOAD";
          } else if (currentRatio >= 0.85) {
            ampColor = "#ffc107";
            ampGlow = "0 0 8px rgba(255, 193, 7, 0.5)";
            statusLabel = "HIGH LOAD";
          }

          return (
            <div style={{ padding: '8px 10px', background: 'rgba(255, 179, 71, 0.05)', borderRadius: '4px', border: '1px solid #ffb347' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', fontSize: '12.5px', fontWeight: 'bold', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ display: 'inline-block', width: '16px', height: '3.5px', background: 'var(--color-amber)', boxShadow: '0 0 5px var(--color-amber-glow)' }}></span>
                  <span style={{ color: 'var(--color-amber)' }}>2. CURRENT WORKBENCH SETUP (SELECTED)</span>
                </div>
                <span style={{ color: ampColor, textShadow: ampGlow, fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
                  {Math.round(currentPt.watts)} W / {activeAmps} A [{statusLabel}]
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#fff', fontFamily: 'var(--font-mono)', lineHeight: '1.4' }}>
                <span style={{ color: '#fff', fontWeight: 'bold' }}>{battery.cells}S ({(battery.cells * 3.7).toFixed(1)}V)</span> | <span style={{ color: '#ffc97a', fontWeight: 'bold' }}>{motor.name}</span> | <span style={{ color: '#63b3ed', fontWeight: 'bold' }}>{propeller.name}</span> | <span>{esc.name}</span>
              </div>
            </div>
          );
        })()}

        {/* Setup 3: Saved Model / Speed Tuned Setup */}
        <div style={{ padding: '8px 10px', background: '#13171b', borderRadius: '4px', border: '1px solid var(--color-panel-border)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: 'var(--color-cyan)', fontWeight: 'bold' }}>━ · </span>
              <span style={{ color: 'var(--color-cyan)' }}>3. SAVED MODEL / BENCHMARK TUNED SETUP</span>
            </div>
            <span style={{ color: wattsDelta >= 0 ? "var(--color-green)" : "var(--color-red)", fontSize: '11.5px', fontFamily: 'var(--font-mono)' }}>
              {wattsDelta >= 0 ? `+${wattsDelta}W (+${wattsPct}%) VS STOCK` : `${wattsDelta}W (${wattsPct}%) VS STOCK`}
            </span>
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', fontFamily: 'var(--font-mono)', lineHeight: '1.4' }}>
            <span style={{ color: '#fff', fontWeight: 'bold' }}>{optBattery.cells}S ({(optBattery.cells * 3.7).toFixed(1)}V)</span> | <span style={{ color: '#ffc97a' }}>{optMotor.name}</span> | <span style={{ color: '#63b3ed' }}>{optPropeller.name}</span> | <span>{optEsc.name}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
