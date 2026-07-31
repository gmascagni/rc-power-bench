import React from 'react';
import { generatePowerCurve } from '../utils/calcEngine';
import { recommendedSetups, motors, escs, batteries, propellers } from '../data/rcData';

export default function PowerCurveChart({ aircraft, motor, esc, battery, propeller, currentThrottle }) {
  // Generate selected data points
  const data = generatePowerCurve(aircraft, motor, esc, battery, propeller);

  // Retrieve stock recommended setup components (Scale Performance baseline)
  const recSetup = recommendedSetups.scale;
  const recMotor = motors.find(m => m.id === recSetup.motorId) || motor;
  const recEsc = escs.find(e => e.id === recSetup.escId) || esc;
  const recBattery = batteries.find(b => b.id === recSetup.batteryId) || battery;
  const recPropeller = propellers.find(p => p.id === recSetup.propellerId) || propeller;

  // Generate recommended data points
  const recData = generatePowerCurve(aircraft, recMotor, recEsc, recBattery, recPropeller);

  // Dimensions of SVG
  const width = 480;
  const height = 180;
  const padding = { top: 18, right: 35, bottom: 25, left: 35 };

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

  // Calculate current throttle position for the vertical indicator line
  const cursorX = getX(currentThrottle);
  const targetThrottle = Math.round(currentThrottle / 5) * 5;
  const currentPt = data.find(p => p.throttle === targetThrottle) || { watts: 0, amps: 0 };
  const stockPt = recData.find(p => p.throttle === targetThrottle) || { watts: 0, amps: 0 };
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
              <text x={padding.left - 6} y={y + 3.5} fill="var(--color-amber-dim)" fontSize="12.5" fontWeight="bold" textAnchor="end">{val}</text>
              {/* Watts label (Right, maps 150A -> 5000W, so 30A -> 1000W) */}
              <text x={width - padding.right + 6} y={y + 3.5} fill="var(--color-amber-dim)" fontSize="12.5" fontWeight="bold" textAnchor="start">{Math.round(val * 5000 / 150)}</text>
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
              <text x={x} y={height - padding.bottom + 16} fill="var(--color-amber-dim)" fontSize="12.5" fontWeight="bold" textAnchor="middle">{val}</text>
            </g>
          );
        })}

        {/* Axis Labels */}
        <text x={padding.left - 28} y={padding.top - 5} fill="var(--color-red)" fontSize="13" fontWeight="bold">AMPS</text>
        <text x={width - padding.right + 2} y={padding.top - 5} fill="var(--color-amber)" fontSize="13" fontWeight="bold">WATTS</text>
        <text x={width / 2} y={height - 2} fill="var(--color-amber-dim)" fontSize="13.5" textAnchor="middle" fontWeight="bold" style={{ letterSpacing: '1px' }}>THROTTLE %</text>

        {/* Stock Recommended Curves (Dashed & Faded) */}
        <path d={recWattsPath} fill="none" stroke="var(--color-amber)" strokeWidth="1.5" strokeDasharray="4,3" strokeOpacity="0.45" />
        <path d={recAmpsPath} fill="none" stroke="var(--color-red)" strokeWidth="1.5" strokeDasharray="4,3" strokeOpacity="0.45" />

        {/* Current Selected Curves (Solid & Glowing) */}
        <path d={wattsPath} fill="none" stroke="var(--color-amber)" strokeWidth="2.5" style={{ filter: 'drop-shadow(0 0 2.5px var(--color-amber-glow))' }} />
        <path d={ampsPath} fill="none" stroke="var(--color-red)" strokeWidth="2.5" style={{ filter: 'drop-shadow(0 0 2.5px var(--color-red-glow))' }} />

        {/* Comparison Data Box (Bottom Right Empty Space) */}
        <g transform={`translate(${width - padding.right - 128}, ${height - padding.bottom - 58})`}>
          <rect width="124" height="54" fill="rgba(19, 23, 27, 0.94)" stroke="var(--color-panel-border)" strokeWidth="1" rx="2" />
          <text x="6" y="11" fill="var(--color-amber-dim)" fontSize="9.5" fontWeight="bold">VS STOCK BASELINE</text>
          
          <text x="6" y="24" fill="rgba(255,255,255,0.4)" fontSize="10.5">STOCK:</text>
          <text x="118" y="24" fill="rgba(255,255,255,0.6)" fontSize="10.5" textAnchor="end" style={{ fontFamily: 'var(--font-mono)' }}>
            {Math.round(stockPt.watts)}W / {Math.round(stockPt.amps)}A
          </text>
          
          <text x="6" y="37" fill="var(--color-amber)" fontSize="10.5" fontWeight="bold">MODIFIED:</text>
          <text x="118" y="37" fill="var(--color-amber)" fontSize="10.5" fontWeight="bold" textAnchor="end" style={{ fontFamily: 'var(--font-mono)' }}>
            {Math.round(currentPt.watts)}W / {Math.round(currentPt.amps)}A
          </text>

          <text x="6" y="48" fill={wattsDelta >= 0 ? "var(--color-green)" : "var(--color-red)"} fontSize="9.5" fontWeight="bold">
            {wattsDelta >= 0 ? `+${wattsDelta}W (+${wattsPct}%)` : `${wattsDelta}W (${wattsPct}%)`}
          </text>
        </g>

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
            <circle cx={cursorX} cy={getYAmps(currentPt.amps)} r="3.5" fill="var(--color-red)" stroke="#fff" strokeWidth="1" />
            <circle cx={cursorX} cy={getYWatts(currentPt.watts)} r="3.5" fill="var(--color-amber)" stroke="#fff" strokeWidth="1" />
            
            {/* Stock dots (Faded border circles) */}
            <circle cx={cursorX} cy={getYAmps(stockPt.amps)} r="3" fill="none" stroke="var(--color-red)" strokeWidth="1" opacity="0.7" />
            <circle cx={cursorX} cy={getYWatts(stockPt.watts)} r="3" fill="none" stroke="var(--color-amber)" strokeWidth="1" opacity="0.7" />
          </g>
        )}
      </svg>

      {/* Legend & System Summary Container Under Chart */}
      <div style={{ marginTop: '8px', padding: '8px 10px', background: '#13171b', borderRadius: '4px', border: '1px solid var(--color-panel-border)' }}>
        
        {/* Line 1: Chart Legend with Battery Voltage */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '16px', fontSize: '13px', fontWeight: 'bold', borderBottom: '1px dashed var(--color-panel-border)', paddingBottom: '6px', marginBottom: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ display: 'inline-block', width: '16px', height: '3.5px', background: 'var(--color-red)', boxShadow: '0 0 4px var(--color-red-glow)' }}></span>
            <span style={{ color: 'var(--color-red)' }}>MOD AMPS ({battery.cells}S / {(battery.cells * 3.7).toFixed(1)}V)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ display: 'inline-block', width: '16px', height: '3.5px', background: 'var(--color-amber)', boxShadow: '0 0 4px var(--color-amber-glow)' }}></span>
            <span style={{ color: 'var(--color-amber)' }}>MOD WATTS ({battery.cells}S / {(battery.cells * 3.7).toFixed(1)}V)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.7 }}>
            <span style={{ display: 'inline-block', width: '16px', height: '0', borderTop: '2.5px dashed var(--color-red)' }}></span>
            <span style={{ color: 'var(--color-red)' }}>STOCK AMPS ({recBattery.cells}S / {(recBattery.cells * 3.7).toFixed(1)}V)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.7 }}>
            <span style={{ display: 'inline-block', width: '16px', height: '0', borderTop: '2.5px dashed var(--color-amber)' }}></span>
            <span style={{ color: 'var(--color-amber)' }}>STOCK WATTS ({recBattery.cells}S / {(recBattery.cells * 3.7).toFixed(1)}V)</span>
          </div>
        </div>

        {/* Line 2: Color-Scaled Summary Line (Voltage / Motor / Amp Draw) */}
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
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', fontSize: '12.5px', fontFamily: 'var(--font-mono)', gap: '8px' }}>
              <div>
                <span style={{ color: 'var(--color-amber-dim)', fontWeight: 'bold' }}>VOLTAGE: </span>
                <span style={{ color: '#fff', fontWeight: 'bold' }}>{battery.cells}S ({(battery.cells * 3.7).toFixed(1)}V)</span>
              </div>
              <div>
                <span style={{ color: 'var(--color-amber-dim)', fontWeight: 'bold' }}>MOTOR: </span>
                <span style={{ color: '#ffc97a', fontWeight: 'bold' }}>{motor.name}</span>
              </div>
              <div>
                <span style={{ color: 'var(--color-amber-dim)', fontWeight: 'bold' }}>CURRENT DRAW: </span>
                <span style={{ color: ampColor, textShadow: ampGlow, fontWeight: 'bold', fontSize: '13.5px' }}>
                  {activeAmps} A [{statusLabel}]
                </span>
              </div>
            </div>
          );
        })()}

      </div>
    </div>
  );
}
