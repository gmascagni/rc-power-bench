import React from 'react';

export function CircularGauge({ 
  value, 
  min = 0, 
  max = 100, 
  label = "", 
  unit = "", 
  color = "var(--color-amber)", 
  warningThreshold = 85, 
  dangerThreshold = 95,
  size = 130
}) {
  const radius = 50;
  const strokeWidth = 6;
  const center = 65;
  
  // Needle angle calculation
  const startAngle = -135;
  const endAngle = 135;
  const totalAngle = endAngle - startAngle;
  
  // Clamp value between min and max
  const clampedValue = Math.min(Math.max(value, min), max);
  const percentage = (clampedValue - min) / (max - min);
  const needleAngle = startAngle + percentage * totalAngle;

  // Arc path calculation
  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians)
    };
  };

  const describeArc = (x, y, radius, startAngle, endAngle) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
      "M", start.x, start.y, 
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
  };

  // Generate tick marks
  const ticks = [];
  const tickCount = 11; // 10 segments
  for (let i = 0; i < tickCount; i++) {
    const angle = startAngle + (i / (tickCount - 1)) * totalAngle;
    const rad = ((angle - 90) * Math.PI) / 180;
    const p1 = {
      x: center + (radius - 2) * Math.cos(rad),
      y: center + (radius - 2) * Math.sin(rad)
    };
    const p2 = {
      x: center + (radius - 8) * Math.cos(rad),
      y: center + (radius - 8) * Math.sin(rad)
    };
    const isMajor = i % 2 === 0;
    ticks.push(
      <line 
        key={i} 
        x1={p1.x} 
        y1={p1.y} 
        x2={p2.x} 
        y2={p2.y} 
        stroke={isMajor ? "var(--color-amber)" : "var(--color-panel-border)"} 
        strokeWidth={isMajor ? 1.5 : 1}
      />
    );
  }

  // Determine current active glow color based on threshold
  let glowColor = "var(--color-amber-glow)";
  let textColor = "var(--color-amber)";
  if (clampedValue >= (max * (dangerThreshold / 100))) {
    glowColor = "var(--color-red-glow)";
    textColor = "var(--color-red)";
  } else if (clampedValue >= (max * (warningThreshold / 100))) {
    glowColor = "var(--color-amber-glow)";
    textColor = "var(--color-amber)";
  } else {
    textColor = "var(--color-green)";
    glowColor = "var(--color-green-glow)";
  }

  // Dial scale labels matching mockup exactly
  let scaleLabels = [];
  const upperLabel = label.toUpperCase();
  if (upperLabel.includes("RPM")) scaleLabels = ["0", "4K", "8K", "12K", "16K"];
  else if (upperLabel.includes("AMP")) scaleLabels = ["0", "40", "80", "120", "160"];
  else if (upperLabel.includes("VOLT")) scaleLabels = ["0", "10", "20", "30", "40"];
  else if (upperLabel.includes("WATT")) scaleLabels = ["0", "1K", "2K", "3K", "4K"];
  else if (upperLabel.includes("EFF")) scaleLabels = ["0", "25", "50", "75", "100"];
  else if (upperLabel.includes("TEMP")) scaleLabels = ["0", "50", "100", "150"];
  else if (upperLabel.includes("THRUST") || upperLabel.includes("WT")) scaleLabels = ["0", "1.0", "2.0"];

  const renderedScaleLabels = scaleLabels.map((lbl, idx) => {
    const divs = scaleLabels.length - 1;
    const angle = startAngle + (idx / divs) * totalAngle;
    const rad = ((angle - 90) * Math.PI) / 180;
    const rLabel = radius - 13;
    const x = center + rLabel * Math.cos(rad);
    const y = center + rLabel * Math.sin(rad);
    return (
      <text
        key={idx}
        x={x}
        y={y + 2.5}
        fill="var(--color-amber-dim)"
        fontSize="7.5"
        fontWeight="bold"
        textAnchor="middle"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {lbl}
      </text>
    );
  });

  return (
    <div className="flex-center flex-column" style={{ width: size, textAlign: 'center' }}>
      <svg width={size} height={size} viewBox="0 0 130 130">
        <defs>
          {/* Circular dial gradient */}
          <radialGradient id="dialGrad" cx="50%" cy="50%" r="50%">
            <stop offset="70%" stopColor="#1c1512" />
            <stop offset="100%" stopColor="#0e0a08" />
          </radialGradient>
          {/* Glass glare gradient */}
          <linearGradient id="glassReflection" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
            <stop offset="25%" stopColor="#ffffff" stopOpacity="0.06" />
            <stop offset="26%" stopColor="#ffffff" stopOpacity="0.0" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
          </linearGradient>
          {/* Drop shadow for needle */}
          <filter id="needleShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="2" stdDeviation="1" floodColor="#000" floodOpacity="0.95"/>
          </filter>
        </defs>

        {/* Outer Bezel (Metal effect) */}
        <circle cx={center} cy={center} r={58} fill="url(#dialGrad)" stroke="var(--color-panel-border)" strokeWidth="3" />
        <circle cx={center} cy={center} r={56} fill="none" stroke="#2e221b" strokeWidth="1" />

        {/* Backlight ambient glow circle */}
        <circle cx={center} cy={center} r={46} fill="none" stroke={textColor} strokeWidth="0.75" strokeOpacity="0.12" style={{ filter: `drop-shadow(0 0 3px ${glowColor})` }} />

        {/* Glass glare highlight cover */}
        <path d="M 20,40 A 50,50 0 0,1 110,40 A 48,48 0 0,0 20,40" fill="url(#glassReflection)" />

        {/* Dial Background Arc (dashed/dim) */}
        <path 
          d={describeArc(center, center, radius, startAngle, endAngle)} 
          fill="none" 
          stroke="var(--color-panel-border)" 
          strokeWidth={strokeWidth} 
          strokeLinecap="round" 
        />

        {/* Gauge Value Arc (glowing colored path) */}
        {clampedValue > min && (
          <path 
            d={describeArc(center, center, radius, startAngle, needleAngle)} 
            fill="none" 
            stroke={textColor} 
            strokeWidth={strokeWidth} 
            strokeLinecap="round" 
            style={{ filter: `drop-shadow(0 0 3px ${glowColor})` }}
          />
        )}

        {/* Tick Marks */}
        {ticks}

        {/* Dial Scale Numbers */}
        {renderedScaleLabels}

        {/* Center Hub */}
        <circle cx={center} cy={center} r={10} fill="#110d0b" stroke="var(--color-panel-border)" strokeWidth="1.5" />

        {/* Glowing Needle */}
        <g transform={`rotate(${needleAngle} ${center} ${center})`}>
          <polygon 
            points={`${center - 2},${center} ${center + 2},${center} ${center},${center - radius + 2}`} 
            fill="var(--color-red)" 
            style={{ filter: 'url(#needleShadow)' }}
          />
          <line x1={center} y1={center} x2={center} y2={center - radius} stroke="var(--color-red)" strokeWidth="2" />
          
          {/* Custom Fighter Jet silhouette on the thrust-to-weight ratio dial needle */}
          {(upperLabel.includes("THRUST") || upperLabel.includes("WT")) && (
            <path 
              d="M65,27 L67,31 L77,35 L77,37 L67,36 L67,42 L72,44 L72,45 L65,44 L58,45 L58,44 L63,42 L63,36 L53,37 L53,35 L63,31 Z"
              fill="#e2bd89"
              stroke="#000"
              strokeWidth="0.75"
              style={{ filter: 'url(#needleShadow)' }}
            />
          )}
        </g>
        <circle cx={center} cy={center} r={4} fill="#d13535" />

        {/* Dynamic Display Units & Numbers */}
        <text 
          x={center} 
          y={center + 28} 
          fill="#fff" 
          fontSize="15" 
          fontWeight="bold" 
          textAnchor="middle"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {typeof value === 'number' ? value.toLocaleString() : value}
        </text>
        
        <text 
          x={center} 
          y={center + 40} 
          fill="var(--color-amber-dim)" 
          fontSize="9" 
          textAnchor="middle"
          fontWeight="bold"
          style={{ letterSpacing: '0.5px' }}
        >
          {unit}
        </text>
      </svg>
      <div 
        className="glow-text" 
        style={{ 
          fontSize: '11px', 
          fontWeight: 'bold', 
          marginTop: '-10px', 
          color: 'var(--color-amber)', 
          textTransform: 'uppercase' 
        }}
      >
        {label}
      </div>
    </div>
  );
}

export function HorizontalBarGauge({ value, label, percentage, max = 100, unit = "%" }) {
  // Determine color based on load percentage
  let barColor = "var(--color-green)";
  let glowColor = "var(--color-green-glow)";
  
  if (percentage >= 95) {
    barColor = "var(--color-red)";
    glowColor = "var(--color-red-glow)";
  } else if (percentage >= 85) {
    barColor = "var(--color-amber)";
    glowColor = "var(--color-amber-glow)";
  }

  return (
    <div style={{ marginBottom: '12px' }}>
      <div className="flex-between" style={{ fontSize: '11px', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}>
        <span>{label}</span>
        <span style={{ color: barColor }}>{value}{unit}</span>
      </div>
      <div style={{ height: '8px', backgroundColor: '#120e0c', border: '1px solid var(--color-panel-border)', borderRadius: '2px', overflow: 'hidden', position: 'relative' }}>
        <div 
          style={{ 
            height: '100%', 
            width: `${Math.min(percentage, 100)}%`, 
            backgroundColor: barColor, 
            boxShadow: `0 0 8px ${glowColor}`, 
            transition: 'width 0.15s ease-out' 
          }} 
        />
      </div>
    </div>
  );
}
