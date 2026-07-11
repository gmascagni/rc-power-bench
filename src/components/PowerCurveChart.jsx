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
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ background: '#120e0c', borderRadius: '4px', border: '1px solid var(--color-panel-border)' }}>
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
              <text x={padding.left - 6} y={y + 3.5} fill="var(--color-amber-dim)" fontSize="11" textAnchor="end">{val}</text>
              {/* Watts label (Right, maps 150A -> 5000W, so 30A -> 1000W) */}
              <text x={width - padding.right + 6} y={y + 3.5} fill="var(--color-amber-dim)" fontSize="11" textAnchor="start">{Math.round(val * 5000 / 150)}</text>
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
              <text x={x} y={height - padding.bottom + 15} fill="var(--color-amber-dim)" fontSize="11" textAnchor="middle">{val}</text>
            </g>
          );
        })}

        {/* Legend */}
        <g transform="translate(12, 12)">
          {/* Selected curves */}
          <line x1="0" y1="0" x2="12" y2="0" stroke="var(--color-red)" strokeWidth="2.5" />
          <text x="16" y="3.5" fill="var(--color-red)" fontSize="10" fontWeight="bold">MOD AMPS</text>
          
          <line x1="85" y1="0" x2="97" y2="0" stroke="var(--color-amber)" strokeWidth="2.5" />
          <text x="101" y="3.5" fill="var(--color-amber)" fontSize="10" fontWeight="bold">MOD WATTS</text>

          {/* Recommended stock baseline curves */}
          <line x1="180" y1="0" x2="192" y2="0" stroke="var(--color-red)" strokeWidth="1.5" strokeDasharray="3,2" strokeOpacity="0.5" />
          <text x="196" y="3.5" fill="var(--color-red)" fillOpacity="0.65" fontSize="10" fontWeight="bold">STOCK AMPS</text>

          <line x1="275" y1="0" x2="287" y2="0" stroke="var(--color-amber)" strokeWidth="1.5" strokeDasharray="3,2" strokeOpacity="0.5" />
          <text x="291" y="3.5" fill="var(--color-amber)" fillOpacity="0.65" fontSize="10" fontWeight="bold">STOCK WATTS</text>
        </g>

        {/* Axis Labels */}
        <text x={padding.left - 28} y={padding.top - 5} fill="var(--color-red)" fontSize="11" fontWeight="bold">AMPS</text>
        <text x={width - padding.right + 2} y={padding.top - 5} fill="var(--color-amber)" fontSize="11" fontWeight="bold">WATTS</text>
        <text x={width / 2} y={height - 2} fill="var(--color-amber-dim)" fontSize="12" textAnchor="middle" fontWeight="bold" style={{ letterSpacing: '1px' }}>THROTTLE %</text>

        {/* Stock Recommended Curves (Dashed & Faded) */}
        <path d={recWattsPath} fill="none" stroke="var(--color-amber)" strokeWidth="1.5" strokeDasharray="4,3" strokeOpacity="0.45" />
        <path d={recAmpsPath} fill="none" stroke="var(--color-red)" strokeWidth="1.5" strokeDasharray="4,3" strokeOpacity="0.45" />

        {/* Current Selected Curves (Solid & Glowing) */}
        <path d={wattsPath} fill="none" stroke="var(--color-amber)" strokeWidth="2.5" style={{ filter: 'drop-shadow(0 0 2.5px var(--color-amber-glow))' }} />
        <path d={ampsPath} fill="none" stroke="var(--color-red)" strokeWidth="2.5" style={{ filter: 'drop-shadow(0 0 2.5px var(--color-red-glow))' }} />

        {/* Comparison Data Box (Bottom Right Empty Space) */}
        <g transform={`translate(${width - padding.right - 120}, ${height - padding.bottom - 54})`}>
          <rect width="115" height="50" fill="rgba(18, 14, 12, 0.92)" stroke="var(--color-panel-border)" strokeWidth="1" rx="2" />
          <text x="6" y="10" fill="var(--color-amber-dim)" fontSize="8" fontWeight="bold">VS STOCK BASELINE</text>
          
          <text x="6" y="22" fill="rgba(255,255,255,0.4)" fontSize="9">STOCK:</text>
          <text x="110" y="22" fill="rgba(255,255,255,0.6)" fontSize="9" textAnchor="end" style={{ fontFamily: 'var(--font-mono)' }}>
            {Math.round(stockPt.watts)}W / {Math.round(stockPt.amps)}A
          </text>
          
          <text x="6" y="34" fill="var(--color-amber)" fontSize="9" fontWeight="bold">MODIFIED:</text>
          <text x="110" y="34" fill="var(--color-amber)" fontSize="9" fontWeight="bold" textAnchor="end" style={{ fontFamily: 'var(--font-mono)' }}>
            {Math.round(currentPt.watts)}W / {Math.round(currentPt.amps)}A
          </text>

          <text x="6" y="44" fill={wattsDelta >= 0 ? "var(--color-green)" : "var(--color-red)"} fontSize="8.5" fontWeight="bold">
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
    </div>
  );
}
