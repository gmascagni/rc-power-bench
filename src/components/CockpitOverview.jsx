import React, { useState, useEffect } from 'react';
import { CircularGauge, HorizontalBarGauge } from './Gauges';
import PowerCurveChart from './PowerCurveChart';
import { calculateSpecs } from '../utils/calcEngine';
import { recommendedSetups, aircrafts, motors, escs, batteries, propellers } from '../data/rcData';
import { ShieldAlert, AlertTriangle, CheckCircle, Zap, Shield, HelpCircle, Activity } from 'lucide-react';
import heroBanner from '../assets/hero-banner.jpg';
import pinupPilot from '../assets/pinup-pilot.jpg';

import motorSpektrum from '../assets/motor_spektrum.jpg';
import motorElectric from '../assets/motor_electric.jpg';
import motorGas from '../assets/motor_gas.jpg';
import motorGlow from '../assets/motor_glow.jpg';

import escSpektrum from '../assets/esc_spektrum.jpg';
import escElectric from '../assets/esc_electric.jpg';
import escServo from '../assets/esc_servo.jpg';

import batterySpektrum from '../assets/battery_spektrum.jpg';
import batteryLipo from '../assets/battery_lipo.jpg';
import batteryGas from '../assets/battery_gas.jpg';

import propeller2b from '../assets/propeller_2b.jpg';


function renderNoseArt(planeId) {
  switch (planeId) {
    case 'p51d-mustang':
    case 'topflite-p51':
      return (
        <svg viewBox="0 0 40 40" style={{ width: '100%', height: '100%', background: '#261611' }}>
          <path d="M5,20 L15,17 L20,5 L25,17 L35,20 L25,23 L20,35 L15,23 Z" fill="#e59d32" stroke="#fff" strokeWidth="0.5" />
          <circle cx="20" cy="20" r="4" fill="#d13535" />
          <rect x="18" y="10" width="4" height="2" fill="#fff" />
          <rect x="18" y="28" width="4" height="2" fill="#fff" />
        </svg>
      );
    case 'f4u-corsair':
      return (
        <svg viewBox="0 0 40 40" style={{ width: '100%', height: '100%', background: '#0e111a' }}>
          <path d="M12,12 L28,28 M28,12 L12,28" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="20" cy="18" r="7" fill="#fff" />
          <rect x="18" y="24" width="4" height="4" rx="1" fill="#fff" />
          <circle cx="17" cy="17" r="1.5" fill="#000" />
          <circle cx="23" cy="17" r="1.5" fill="#000" />
        </svg>
      );
    case 'spitfire-mk9':
      return (
        <svg viewBox="0 0 40 40" style={{ width: '100%', height: '100%', background: '#1c2213' }}>
          <circle cx="20" cy="20" r="12" fill="#0f2b5c" />
          <circle cx="20" cy="20" r="8" fill="#fff" />
          <circle cx="20" cy="20" r="4" fill="#d13535" />
          <path d="M4,20 C10,12 18,20 20,20 C22,20 30,12 36,20" stroke="#ffd700" strokeWidth="1.5" fill="none" />
        </svg>
      );
    case 'bf109':
      return (
        <svg viewBox="0 0 40 40" style={{ width: '100%', height: '100%', background: '#302d26' }}>
          <path d="M10,20 L30,20 M20,10 L20,30" stroke="#fff" strokeWidth="8" />
          <path d="M10,20 L30,20 M20,10 L20,30" stroke="#000" strokeWidth="4" />
          <rect x="18" y="18" width="4" height="4" fill="#d13535" />
        </svg>
      );
    case 'fw190':
      return (
        <svg viewBox="0 0 40 40" style={{ width: '100%', height: '100%', background: '#242a20' }}>
          <circle cx="20" cy="20" r="14" fill="none" stroke="#e59d32" strokeWidth="1.5" />
          <path d="M15,15 Q20,30 25,15" stroke="#d13535" strokeWidth="3" fill="none" />
          <polygon points="12,12 20,20 28,12" fill="#fff" />
        </svg>
      );
    case 'p47d-thunderbolt':
      return (
        <svg viewBox="0 0 40 40" style={{ width: '100%', height: '100%', background: '#2b231e' }}>
          <circle cx="20" cy="20" r="12" fill="rgba(209, 53, 53, 0.15)" stroke="#d13535" strokeWidth="1" />
          <path d="M16,14 C18,12 24,12 24,18 C24,24 16,28 16,30 L26,30" stroke="#ff8888" strokeWidth="2" strokeLinecap="round" fill="none" />
          <circle cx="23" cy="15" r="2.5" fill="#ffd700" />
        </svg>
      );
    case 'hurricane':
      return (
        <svg viewBox="0 0 40 40" style={{ width: '100%', height: '100%', background: '#1c1512' }}>
          <path d="M8,12 Q20,16 32,12 L30,22 Q20,25 10,22 Z" fill="#996e33" />
          <text x="20" y="19" fill="#fff" fontSize="8" fontWeight="bold" textAnchor="middle">RAF</text>
        </svg>
      );
    case 'zero':
      return (
        <svg viewBox="0 0 40 40" style={{ width: '100%', height: '100%', background: '#eae7d9' }}>
          <circle cx="20" cy="20" r="8" fill="#d13535" />
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => (
            <line key={deg} x1="20" y1="20" x2={20 + 15 * Math.cos(deg * Math.PI / 180)} y2={20 + 15 * Math.sin(deg * Math.PI / 180)} stroke="#d13535" strokeWidth="1.5" />
          ))}
          <circle cx="20" cy="20" r="8" fill="#d13535" />
        </svg>
      );
    case 'p38-lightning':
      return (
        <svg viewBox="0 0 40 40" style={{ width: '100%', height: '100%', background: '#120e0c' }}>
          <path d="M15,12 L12,28 L28,28 L25,12 Z" fill="#d13535" />
          <path d="M12,14 Q20,6 28,14" stroke="#ff4d4d" strokeWidth="2.5" fill="none" />
          <circle cx="20" cy="20" r="4" fill="#ffd700" />
        </svg>
      );
    case 'f6f-hellcat':
      return (
        <svg viewBox="0 0 40 40" style={{ width: '100%', height: '100%', background: '#0e1726' }}>
          <path d="M8,25 Q20,10 32,25 Q20,34 8,25 Z" fill="#000" stroke="#ff8888" strokeWidth="1" />
          <path d="M10,24 L12,20 L14,24 L16,20 L18,24 L20,20 L22,24 L24,20 L26,24 L28,20 L30,24" stroke="#fff" strokeWidth="1.5" fill="none" />
          <circle cx="12" cy="14" r="2.5" fill="#fff" />
          <circle cx="12" cy="14" r="1" fill="#000" />
        </svg>
      );
    case 'f8f-bearcat':
      return (
        <svg viewBox="0 0 40 40" style={{ width: '100%', height: '100%', background: '#0a0d14' }}>
          {[10, 16, 22, 28].map(x => (
            <path key={x} d={`M ${x} 8 L ${x + 4} 32`} stroke="#ffb347" strokeWidth="2.5" strokeLinecap="round" />
          ))}
        </svg>
      );
    case 'f4f-wildcat':
      return (
        <svg viewBox="0 0 40 40" style={{ width: '100%', height: '100%', background: '#1c222b' }}>
          <circle cx="20" cy="20" r="12" fill="none" stroke="#fff" strokeWidth="1" strokeDasharray="2,2" />
          <path d="M12,24 C14,18 26,18 28,24 C28,24 24,12 20,12 C16,12 12,24 12,24 Z" fill="#ffb347" />
          <circle cx="17" cy="18" r="1.5" fill="#000" />
          <circle cx="23" cy="18" r="1.5" fill="#000" />
        </svg>
      );
    case 'topflite-p40':
      return (
        <svg viewBox="0 0 40 40" style={{ width: '100%', height: '100%', background: '#242a20' }}>
          {/* Yellow Tiger eye slash background */}
          <path d="M26,10 L31,14 L36,10" stroke="#ffb347" strokeWidth="1.5" fill="none" />
          
          {/* Shark mouth base */}
          <path d="M6,22 C14,12 26,12 34,22 C28,28 12,28 6,22 Z" fill="#731b1b" stroke="#fff" strokeWidth="0.75" />
          
          {/* Teeth Top */}
          <path d="M8,21 L10,24 L12,21 L14,24 L16,21 L18,24 L20,21 L22,24 L24,21 L26,24 L28,21 L30,24 L32,21" fill="#fff" />
          {/* Teeth Bottom */}
          <path d="M8,23 L10,20 L12,23 L14,20 L16,23 L18,20 L20,23 L22,20 L24,23 L26,20 L28,23 L30,20 L32,23" fill="#fff" />
          
          {/* Angry Eye */}
          <ellipse cx="14" cy="14" rx="4" ry="2" fill="#ffb347" stroke="#000" strokeWidth="0.5" />
          <circle cx="15" cy="14" r="1.2" fill="#000" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 40 40" style={{ width: '100%', height: '100%', background: '#111' }}>
          <circle cx="20" cy="20" r="10" fill="none" stroke="#e59d32" strokeWidth="2" />
        </svg>
      );
  }
}

export default function CockpitOverview({
  selectedAircraft,
  setSelectedAircraft,
  selectedMotor,
  setSelectedMotor,
  selectedEsc,
  setSelectedEsc,
  selectedBattery,
  setSelectedBattery,
  selectedPropeller,
  setSelectedPropeller,
  activeSetupType,
  setActiveSetupType,
  throttle,
  setThrottle
}) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const [savedConfigs, setSavedConfigs] = useState(() => {
    try {
      const saved = localStorage.getItem('rc_saved_setups');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedSavedConfigId, setSelectedSavedConfigId] = useState(() => {
    try {
      const saved = localStorage.getItem('rc_saved_setups');
      const parsed = saved ? JSON.parse(saved) : [];
      return parsed.length > 0 ? parsed[parsed.length - 1].id : "";
    } catch {
      return "";
    }
  });

  const [fastestSetup, setFastestSetup] = useState(null);

  useEffect(() => {
    let bestPitchSpeed = 0;
    let bestCombo = null;

    for (const m of motors) {
      for (const p of propellers) {
        for (const e of escs) {
          for (const b of batteries) {
            const cells = b.cells;
            if (cells > 6 && e.voltageSupported && e.voltageSupported.includes("6S LiPo")) continue;
            if (cells > 8 && e.voltageSupported && e.voltageSupported.includes("8S LiPo")) continue;
            
            const s = calculateSpecs({
              aircraft: selectedAircraft,
              motor: m,
              esc: e,
              battery: b,
              propeller: p,
              throttle: 100
            });

            // Ensure physical safety bounds are preserved to prevent unrealistic blowups
            const isSafe = s.amps <= e.maxAmps * 1.1 && s.amps <= m.maxCurrent * 1.15;
            
            if (isSafe && s.pitchSpeed > bestPitchSpeed) {
              bestPitchSpeed = s.pitchSpeed;
              bestCombo = {
                motorId: m.id,
                escId: e.id,
                batteryId: b.id,
                propellerId: p.id,
                pitchSpeed: s.pitchSpeed
              };
            }
          }
        }
      }
    }
    setFastestSetup(bestCombo);
  }, [selectedAircraft]);

  const applyFastestSetup = () => {
    if (fastestSetup) {
      const m = motors.find(item => item.id === fastestSetup.motorId);
      const e = escs.find(item => item.id === fastestSetup.escId);
      const b = batteries.find(item => item.id === fastestSetup.batteryId);
      const p = propellers.find(item => item.id === fastestSetup.propellerId);
      if (m) setSelectedMotor(m);
      if (e) setSelectedEsc(e);
      if (b) setSelectedBattery(b);
      if (p) setSelectedPropeller(p);
      setThrottle(100);
      setActiveSetupType("fastest");
    }
  };

  // Helper functions to get active component images dynamically based on brand/type
  const getMotorImage = () => {
    if (selectedMotor.isGasOrGlow) {
      return selectedMotor.engineType === 'gas' ? motorGas : motorGlow;
    }
    return selectedMotor.brand === 'Spektrum' ? motorSpektrum : motorElectric;
  };

  const getEscImage = () => {
    if (selectedMotor.isGasOrGlow) {
      return escServo; // throttle servo governs combustion engines
    }
    return selectedEsc.brand === 'Spektrum' ? escSpektrum : escElectric;
  };

  const getBatteryImage = () => {
    if (selectedMotor.isGasOrGlow) {
      return batteryGas; // fuel tank acts as battery energy equivalent
    }
    return selectedBattery.brand.includes('Spektrum') ? batterySpektrum : batteryLipo;
  };

  const getPropellerImage = () => {
    return propeller2b;
  };

  // Calculate outputs
  const specs = calculateSpecs({
    aircraft: selectedAircraft,
    motor: selectedMotor,
    esc: selectedEsc,
    battery: selectedBattery,
    propeller: selectedPropeller,
    throttle: throttle
  });

  // Apply Recommended Setup
  const applySetup = (type) => {
    setActiveSetupType(type);
    const setup = recommendedSetups[type];
    if (setup) {
      const m = motors.find(item => item.id === setup.motorId);
      const e = escs.find(item => item.id === setup.escId);
      const b = batteries.find(item => item.id === setup.batteryId);
      const p = propellers.find(item => item.id === setup.propellerId);
      if (m) setSelectedMotor(m);
      if (e) setSelectedEsc(e);
      if (b) setSelectedBattery(b);
      if (p) setSelectedPropeller(p);
      setThrottle(100); // Set default full bench load
    }
  };

  // Run calculation simulation (Bench Test)
  const runSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    let currentT = 0;
    setThrottle(0);

    const interval = setInterval(() => {
      currentT += 2;
      if (currentT <= 100) {
        setThrottle(currentT);
      } else if (currentT <= 140) {
        // Hold at 100% for a brief moment
      } else if (currentT <= 240) {
        setThrottle(240 - currentT);
      } else {
        clearInterval(interval);
        setIsSimulating(false);
        setThrottle(100); // Return to default bench test load
      }
    }, 30);
  };

  const saveCurrentSetup = () => {
    const newConfig = {
      id: Date.now().toString(),
      name: `${selectedAircraft.name.replace(/★/g, "").trim()} - ${selectedMotor.brand} ${selectedMotor.kv}KV`,
      timestamp: new Date().toLocaleDateString(),
      aircraftId: selectedAircraft.id,
      motorId: selectedMotor.id,
      escId: selectedEsc.id,
      batteryId: selectedBattery.id,
      propellerId: selectedPropeller.id,
      throttle: throttle
    };

    const updated = [...savedConfigs, newConfig];
    setSavedConfigs(updated);
    setSelectedSavedConfigId(newConfig.id);
    localStorage.setItem('rc_saved_setups', JSON.stringify(updated));
    setSaveMessage("CONFIG STORED TO EEPROM");
    setTimeout(() => setSaveMessage(""), 2000);
  };

  const exportToCSV = () => {
    let csv = "Throttle (%),Current (A),Voltage (V),Power (W),RPM,Thrust (lb),Thrust-to-Weight,Efficiency (%),Temp (C)\n";
    for (let t = 0; t <= 100; t += 10) {
      const s = calculateSpecs({
        aircraft: selectedAircraft,
        motor: selectedMotor,
        esc: selectedEsc,
        battery: selectedBattery,
        propeller: selectedPropeller,
        throttle: t
      });
      csv += `${t},${s.amps},${s.volts},${s.watts},${s.rpm},${s.thrust},${s.thrustToWeight},${s.efficiency},${s.temp}\n`;
    }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `telemetry_report_${selectedAircraft.id}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToTxt = () => {
    let report = `==================================================\n`;
    report += `         RC POWER BENCH PRO DIAGNOSTICS REPORT\n`;
    report += `==================================================\n\n`;
    report += `DATE: ${new Date().toLocaleString()}\n`;
    report += `AIRCRAFT: ${selectedAircraft.name.replace(/★/g, "").trim()} (${selectedAircraft.manufacturer})\n`;
    report += `CLASS: ${selectedAircraft.class}\n\n`;
    
    report += `--- SYSTEM CONFIGURATION ---\n`;
    report += `MOTOR: ${selectedMotor.name} (${selectedMotor.kv} KV)\n`;
    report += `ESC: ${selectedEsc.name} (${selectedEsc.maxAmps}A)\n`;
    report += `BATTERY: ${selectedBattery.name} (${selectedBattery.cells}S)\n`;
    report += `PROPELLER: ${selectedPropeller.name} (${selectedPropeller.blades} Blades)\n\n`;
    
    report += `--- PERFORMANCE METRICS (At ${throttle}% Throttle) ---\n`;
    report += `STATIC CURRENT: ${specs.amps} A\n`;
    report += `VOLTAGE UNDER LOAD: ${specs.volts} V\n`;
    report += `POWER OUTPUT: ${specs.watts} W\n`;
    report += `PROP RPM: ${specs.rpm} RPM\n`;
    report += `STATIC THRUST: ${specs.thrust} lbs\n`;
    report += `THRUST-TO-WEIGHT RATIO: ${specs.thrustToWeight}\n`;
    report += `PITCH SPEED (ESTIMATED): ${specs.pitchSpeed} MPH\n`;
    report += `TOP SPEED (ESTIMATED): ${specs.topSpeed} MPH\n`;
    report += `SYSTEM EFFICIENCY: ${specs.efficiency} %\n`;
    report += `MOTOR TEMP: ${specs.temp} C\n`;
    report += `FLIGHT TIME (ESTIMATED): ${specs.flightTimeMin} - ${specs.flightTimeMax} min\n\n`;
    
    report += `--- SYSTEM LOADS ---\n`;
    report += `MOTOR LOAD: ${specs.motorLoad} %\n`;
    report += `ESC LOAD: ${specs.escLoad} %\n`;
    report += `BATTERY LOAD: ${specs.batteryLoad} %\n`;
    report += `OVERALL STATUS: ${specs.overallStatus}\n`;
    report += `POWER SYSTEM STATUS: ${specs.powerSystemStatus}\n\n`;
    
    report += `==================================================\n`;
    report += `Generated by RC Power Bench Pro - Crimson Skies Edition\n`;
    report += `==================================================\n`;

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `specs_sheet_${selectedAircraft.id}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // SVG Drawing Helpers for component cards
  const drawMotorSvg = () => (
    <svg viewBox="0 0 80 50" className="component-svg">
      <rect x="25" y="10" width="30" height="30" rx="3" fill="#302620" stroke="var(--color-amber-dim)" strokeWidth="1" />
      <rect x="55" y="22" width="10" height="6" fill="#7a6254" />
      <line x1="10" y1="25" x2="25" y2="25" stroke="#7a6254" strokeWidth="3" />
      <line x1="25" y1="15" x2="55" y2="15" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
      <circle cx="40" cy="25" r="8" fill="none" stroke="var(--color-amber-dim)" strokeWidth="1" strokeDasharray="3,3" />
    </svg>
  );

  const drawEscSvg = () => (
    <svg viewBox="0 0 80 50" className="component-svg">
      <rect x="15" y="12" width="50" height="26" rx="2" fill="#241b17" stroke="var(--color-amber-dim)" strokeWidth="1" />
      {/* Heatsink Fins */}
      {[22, 28, 34, 40, 46, 52, 58].map(x => (
        <line key={x} x1={x} y1="16" x2={x} y2="34" stroke="#7a6254" strokeWidth="2" />
      ))}
      <rect x="5" y="20" width="10" height="4" fill="#a03010" />
      <rect x="5" y="26" width="10" height="4" fill="#101010" />
      <rect x="65" y="18" width="10" height="3" fill="#a03010" />
      <rect x="65" y="23" width="10" height="3" fill="#e59d32" />
      <rect x="65" y="28" width="10" height="3" fill="#2020a0" />
    </svg>
  );

  const drawBatterySvg = () => (
    <svg viewBox="0 0 80 50" className="component-svg">
      <rect x="15" y="15" width="50" height="20" rx="1" fill="#731b1b" stroke="var(--color-red)" strokeWidth="1" />
      <rect x="10" y="20" width="5" height="10" fill="#241b17" />
      <rect x="65" y="22" width="4" height="6" fill="#a08010" />
      <line x1="20" y1="20" x2="60" y2="20" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
      <text x="40" y="29" fill="rgba(255,255,255,0.4)" fontSize="7" textAnchor="middle" fontWeight="bold">LIPO</text>
    </svg>
  );

  const drawPropellerSvg = () => {
    const blades = selectedPropeller.blades || 2;
    if (blades === 3) {
      return (
        <svg viewBox="0 0 80 50" className="component-svg">
          <ellipse cx="40" cy="14" rx="4" ry="12" fill="#302620" stroke="var(--color-amber-dim)" strokeWidth="1" />
          <ellipse cx="40" cy="14" rx="4" ry="12" fill="#302620" stroke="var(--color-amber-dim)" strokeWidth="1" transform="rotate(120 40 25)" />
          <ellipse cx="40" cy="14" rx="4" ry="12" fill="#302620" stroke="var(--color-amber-dim)" strokeWidth="1" transform="rotate(240 40 25)" />
          <circle cx="40" cy="25" r="4" fill="#7a6254" stroke="#241b17" strokeWidth="1.5" />
        </svg>
      );
    }
    if (blades === 4) {
      return (
        <svg viewBox="0 0 80 50" className="component-svg">
          <ellipse cx="40" cy="14" rx="4" ry="12" fill="#302620" stroke="var(--color-amber-dim)" strokeWidth="1" transform="rotate(45 40 25)" />
          <ellipse cx="40" cy="14" rx="4" ry="12" fill="#302620" stroke="var(--color-amber-dim)" strokeWidth="1" transform="rotate(135 40 25)" />
          <ellipse cx="40" cy="14" rx="4" ry="12" fill="#302620" stroke="var(--color-amber-dim)" strokeWidth="1" transform="rotate(225 40 25)" />
          <ellipse cx="40" cy="14" rx="4" ry="12" fill="#302620" stroke="var(--color-amber-dim)" strokeWidth="1" transform="rotate(315 40 25)" />
          <circle cx="40" cy="25" r="4" fill="#7a6254" stroke="#241b17" strokeWidth="1.5" />
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 80 50" className="component-svg">
        <ellipse cx="40" cy="25" rx="5" ry="25" fill="#302620" stroke="var(--color-amber-dim)" strokeWidth="1" transform="rotate(45 40 25)" />
        <circle cx="40" cy="25" r="4" fill="#7a6254" stroke="#241b17" strokeWidth="1.5" />
      </svg>
    );
  };

  return (
    <div className="crt-effect">
      <div className="crt-vignette"></div>
      
      {/* 0. Top Header */}
      <header className="metal-panel" style={{ marginBottom: '16px', borderRadius: '0', borderWidth: '0 0 2px 0', position: 'relative', overflow: 'hidden' }}>
        <div className="screw" style={{ top: '8px', left: '8px' }}></div>
        <div className="screw" style={{ bottom: '8px', left: '8px' }}></div>
        
        {/* Red Ribbon in the top-right corner of the header panel */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 0,
          height: 0,
          borderStyle: 'solid',
          borderWidth: '0 38px 38px 0',
          borderColor: `transparent var(--color-red) transparent transparent`,
          zIndex: 20
        }}>
          <span style={{
            position: 'absolute',
            top: '3px',
            right: '-32px',
            color: '#fff',
            fontSize: '7.5px',
            fontWeight: 'bold',
            transform: 'rotate(45deg)',
            display: 'block',
            width: '35px',
            textAlign: 'center',
            fontFamily: 'var(--font-mono)'
          }}>v3.0.0</span>
        </div>

        <div className="flex-between header-flex" style={{ padding: '8px 24px' }}>
          {/* Logo Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="180" height="50" viewBox="0 0 180 50">
              {/* Wing Left */}
              <path d="M40,25 C20,13 10,16 2,21 C12,27 25,27 38,25 C28,29 18,31 8,31 C20,35 32,33 40,31" fill="#731b1b" stroke="#8e6840" strokeWidth="1" />
              {/* Wing Right */}
              <path d="M140,25 C160,13 170,16 178,21 C168,27 155,27 142,25 C152,29 162,31 172,31 C160,35 148,33 140,31" fill="#731b1b" stroke="#8e6840" strokeWidth="1" />
              {/* Gear wheel backing */}
              <circle cx="90" cy="22" r="16" fill="#1b120f" stroke="#8e6840" strokeWidth="2.5" />
              <circle cx="90" cy="22" r="12" fill="none" stroke="#e2bd89" strokeWidth="1" strokeDasharray="3,3" />
              {/* Inside Crosslines */}
              <path d="M90,6 L90,38 M74,22 L106,22" stroke="#8e6840" strokeWidth="1.5" />
              {/* Red Star in Center */}
              <path d="M90,13 L93,20 L100,20 L95,24 L97,31 L90,27 L83,31 L85,24 L80,20 L87,20 Z" fill="#d13535" stroke="#fff" strokeWidth="0.5" />
              {/* Logo Texts */}
              <text x="90" y="7" fill="#ffc97a" fontSize="7.5" fontWeight="bold" textAnchor="middle" fontFamily="var(--font-serif)" letterSpacing="0.5">RC POWER BENCH</text>
              <rect x="79" y="34" width="22" height="9" rx="2" fill="#291a13" stroke="#8e6840" strokeWidth="1" />
              <text x="90" y="41.5" fill="#ffb347" fontSize="7.5" fontWeight="bold" textAnchor="middle">PRO</text>
            </svg>
          </div>

          {/* Center Info Panel */}
          <div style={{ textAlign: 'center' }}>
            <h1 className="glow-text" style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: 'var(--color-amber)', letterSpacing: '2px', textTransform: 'uppercase' }}>
              ★ {selectedAircraft.name} ★
            </h1>
            <div className="flex-center gap-12" style={{ marginTop: '2px' }}>
              <span style={{ fontSize: '12px', color: '#ffb347', fontWeight: 'bold', letterSpacing: '1.5px' }}>{selectedAircraft.class} ARF REFERENCE</span>
              <span style={{ color: 'var(--color-panel-border)' }}>|</span>
              <span style={{ fontFamily: 'var(--font-script)', fontSize: '18px', color: '#ffc97a', letterSpacing: '1px' }}>Fly Fast. Fly Hard. Keep 'Em Flying!</span>
            </div>
          </div>

          {/* Right Aviator Art Banner */}
          <div className="header-aviator-banner" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ position: 'relative', width: '130px', height: '52px', border: '1.5px solid var(--color-panel-border)', borderRadius: '3px', overflow: 'hidden' }}>
              <img 
                src={new URL(`../assets/aircraft/${selectedAircraft.image}`, import.meta.url).href} 
                alt={selectedAircraft.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
              {/* Crimson filter overlay */}
              <div style={{ 
                position: 'absolute', 
                top: 0, left: 0, width: '100%', height: '100%', 
                background: 'linear-gradient(to top, rgba(167, 46, 33, 0.5), rgba(18, 14, 12, 0.8))',
                mixBlendMode: 'multiply' 
              }}></div>
              
              <div style={{ 
                position: 'absolute', 
                top: '2px', 
                right: '12px', 
                fontSize: '18px', 
                color: '#ff4d4d', 
                fontFamily: 'var(--font-script)',
                textShadow: '1px 1px 2px #000'
              }}>
                Crimson Skies
              </div>
              <div style={{ 
                position: 'absolute', 
                bottom: '1px', 
                right: '12px', 
                fontSize: '12px', 
                color: '#ffc97a', 
                fontFamily: 'var(--font-script)',
                textShadow: '1px 1px 2px #000'
              }}>
                No Clouds Too High
              </div>
            </div>
            <div style={{ position: 'relative', width: '52px', height: '52px', border: '2.5px solid #8e6840', borderRadius: '50%', overflow: 'hidden', boxShadow: '0 0 10px rgba(0,0,0,0.8)' }}>
              <img src={pinupPilot} alt="Pinup Aviator" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <div className="dashboard-grid" style={{ position: 'relative' }}>
        {/* Faint transparent selected airplane watermark background */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          right: '5%',
          bottom: '10%',
          backgroundImage: `url(${new URL(`../assets/aircraft/${selectedAircraft.image}`, import.meta.url).href})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.37,
          pointerEvents: 'none',
          zIndex: 0
        }} />
        
        {/* Left Side: Aircraft Selector & Database Specs */}
        <section className="metal-panel left-column">
          <div className="rivet top-left"></div>
          <div className="rivet top-right"></div>
          <div className="rivet bottom-left"></div>
          <div className="rivet bottom-right"></div>
          
          <div className="panel-header">
            <span className="badge">1</span> SELECT AIRCRAFT
          </div>
          
          <div className="card-content" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Custom Aircraft Selector */}
            <select 
              className="retro-select" 
              value={selectedAircraft.id} 
              onChange={(e) => {
                const ac = aircrafts.find(item => item.id === e.target.value);
                if (ac) setSelectedAircraft(ac);
              }}
            >
              {aircrafts.map(ac => (
                <option key={ac.id} value={ac.id}>{ac.name}</option>
              ))}
            </select>

            {/* Aircraft Photo View */}
            <div style={{ 
              height: '110px', 
              border: '1px solid var(--color-panel-border)', 
              borderRadius: '4px',
              backgroundColor: '#120e0c',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img 
                src={new URL(`../assets/aircraft/${selectedAircraft.image}`, import.meta.url).href} 
                alt={selectedAircraft.name} 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  opacity: 0.85
                }} 
              />
              {/* Dynamic Nose Art Overlay Badge */}
              <div style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                width: '32px',
                height: '32px',
                border: '1.5px solid #8e6840',
                borderRadius: '50%',
                overflow: 'hidden',
                boxShadow: '0 2px 5px rgba(0,0,0,0.8)',
                zIndex: 10
              }}>
                {renderNoseArt(selectedAircraft.id)}
              </div>
              <div style={{
                position: 'absolute',
                top: 0, left: 0, width: '100%', height: '100%',
                background: 'linear-gradient(to top, rgba(18, 14, 12, 0.9) 0%, rgba(18, 14, 12, 0) 40%)'
              }}></div>
              <div style={{ position: 'absolute', bottom: '6px', left: '6px', fontSize: '9px', fontWeight: 'bold', color: '#fff', textShadow: '1px 1px 2px #000' }}>
                {selectedAircraft.manufacturer}
              </div>
            </div>

            {/* Recommended Setup Buttons */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-amber-dim)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                RECOMMENDED SETUPS
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {Object.keys(recommendedSetups).map((type) => {
                  const s = recommendedSetups[type];
                  const isActive = activeSetupType === type;
                  let starColor = "var(--color-amber-dim)";
                  if (type === 'safe') starColor = "var(--color-green)";
                  else if (type === 'scale') starColor = "#ffb347";
                  else if (type === 'aggressive') starColor = "var(--color-amber)";
                  else starColor = "var(--color-red)";

                  return (
                    <button 
                      key={type}
                      onClick={() => applySetup(type)}
                      className={`btn-retro ${isActive ? 'active' : ''}`}
                      style={{ justifyContent: 'space-between', padding: '6px 12px', fontSize: '11px' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: starColor }}>★</span>
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontWeight: 'bold', fontSize: '11px' }}>{s.name}</div>
                          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', textTransform: 'capitalize' }}>{s.subtitle}</div>
                        </div>
                      </div>
                      <div className={`status-lamp ${isActive ? 'green' : 'green off'}`} />
                    </button>
                  );
                })}
                
                {fastestSetup && (
                  <button 
                    onClick={applyFastestSetup}
                    className={`btn-retro ${activeSetupType === 'fastest' ? 'active' : ''}`}
                    style={{ 
                      justifyContent: 'space-between', 
                      padding: '6px 12px', 
                      fontSize: '11px',
                      borderColor: activeSetupType === 'fastest' ? 'var(--color-red)' : 'rgba(209, 53, 53, 0.4)',
                      boxShadow: activeSetupType === 'fastest' ? '0 0 10px var(--color-red-glow)' : 'none',
                      marginTop: '6px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'var(--color-red)' }}>⚡</span>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '11px', color: 'var(--color-red)' }}>SPEED RUN SETUP</div>
                        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)' }}>
                          Max Pitch Speed: {fastestSetup.pitchSpeed} MPH
                        </div>
                      </div>
                    </div>
                    <div className={`status-lamp ${activeSetupType === 'fastest' ? 'red' : 'red off'}`} />
                  </button>
                )}
              </div>
            </div>

            {/* Aircraft specs table */}
            <div style={{ borderTop: '2px solid var(--color-panel-border)', paddingTop: '10px' }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-amber-dim)', marginBottom: '6px', textTransform: 'uppercase' }}>
                AIRCRAFT SPECS
              </div>
              <table className="retro-table">
                <tbody>
                  <tr>
                    <td className="label">Wingspan</td>
                    <td className="val">{selectedAircraft.wingspan} in</td>
                  </tr>
                  <tr>
                    <td className="label">Length</td>
                    <td className="val">{selectedAircraft.length} in</td>
                  </tr>
                  <tr>
                    <td className="label">Wing Area</td>
                    <td className="val">{selectedAircraft.wingArea} sq in</td>
                  </tr>
                  <tr>
                    <td className="label">Empty Weight</td>
                    <td className="val">{selectedAircraft.emptyWeight.toFixed(1)} lb</td>
                  </tr>
                  <tr>
                    <td className="label">Flying Weight</td>
                    <td className="val">{selectedAircraft.flyingWeight.toFixed(1)} lb</td>
                  </tr>
                  <tr>
                    <td className="label">Power Range</td>
                    <td className="val">{selectedAircraft.powerRangeMin} - {selectedAircraft.powerRangeMax} W</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Builders Manual Download Section */}
            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-amber-dim)', textTransform: 'uppercase' }}>
                BUILDERS MANUAL
              </div>
              {selectedAircraft.manualUrl ? (
                <a 
                  href={selectedAircraft.manualUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-retro"
                  style={{ 
                    fontSize: '11px', 
                    padding: '8px 12px', 
                    textAlign: 'center', 
                    width: '100%', 
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <span>📥 DOWNLOAD MANUAL (PDF)</span>
                </a>
              ) : (
                <button 
                  disabled
                  className="btn-retro"
                  style={{ 
                    fontSize: '11px', 
                    padding: '8px 12px', 
                    width: '100%', 
                    opacity: 0.5, 
                    cursor: 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <span>⚠️ MANUAL: NOT AVAILABLE</span>
                </button>
              )}
            </div>
            
            {/* Decal stamp */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4px' }}>
              <svg width="100" height="24" viewBox="0 0 100 24">
                <line x1="5" y1="12" x2="95" y2="12" stroke="var(--color-panel-border)" strokeWidth="1" />
                <circle cx="50" cy="12" r="10" fill="#1c1512" stroke="var(--color-panel-border)" strokeWidth="1.5" />
                <path d="M46,12 L49,7 L54,12 L49,17 Z" fill="var(--color-red)" />
                <circle cx="50" cy="12" r="2" fill="#fff" />
              </svg>
            </div>
          </div>
        </section>

        {/* Center Section: Current setup cards, setup notes, status bars, and dials dashboard */}
        <div className="middle-column" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Top middle panel group: Setup, notes, overall status */}
          {/* Top middle panel group: Setup, notes, overall status */}
          <div className="middle-row-grid" style={{ gap: '16px' }}>
            
            {/* 2. Current Setup component selector */}
            <div className="metal-panel">
              <div className="rivet top-left"></div>
              <div className="rivet top-right"></div>
              <div className="rivet bottom-left"></div>
              <div className="rivet bottom-right"></div>
              <div className="panel-header">
                <span className="badge">2</span> CURRENT SETUP
              </div>
              <div className="card-content setup-inner-grid" style={{ gap: '8px', padding: '8px' }}>
                
                {/* Motor Select */}
                <div style={{ border: '1px solid var(--color-panel-border)', padding: '6px', borderRadius: '3px', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '8px', color: 'var(--color-amber-dim)', fontWeight: 'bold' }}>MOTOR</div>
                    <div style={{ height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '4px 0', overflow: 'hidden' }}>
                      <img src={getMotorImage()} alt="Brushless Motor" style={{ height: '100%', maxWidth: '100%', objectFit: 'contain', borderRadius: '3px' }} />
                    </div>
                    <select 
                      style={{ fontSize: '9px', padding: '2px', width: '100%' }} 
                      className="retro-select" 
                      value={selectedMotor.id}
                      onChange={(e) => {
                        const item = motors.find(x => x.id === e.target.value);
                        if (item) { setSelectedMotor(item); setActiveSetupType(null); }
                      }}
                    >
                      {motors.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>
                  <div style={{ fontSize: '7.5px', color: 'rgba(255,255,255,0.7)', marginTop: '4px', lineHeight: '1.2' }}>
                    <div style={{ fontWeight: 'bold', color: '#ffb347', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {selectedMotor.isGasOrGlow ? `Power: ${selectedMotor.horsepower} HP (${selectedMotor.displacement})` : `Mod: ${selectedMotor.model}`}
                    </div>
                    <div style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {selectedMotor.isGasOrGlow ? `Fuel: ${selectedMotor.voltageSupported}` : `Volt: ${selectedMotor.voltageSupported.replace(" LiPo", "")}`}
                    </div>
                  </div>
                </div>

                {/* ESC Select */}
                <div style={{ border: '1px solid var(--color-panel-border)', padding: '6px', borderRadius: '3px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '8px', color: 'var(--color-amber-dim)', fontWeight: 'bold' }}>ESC</div>
                    <div style={{ height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '4px 0', overflow: 'hidden' }}>
                      <img src={getEscImage()} alt="Electronic Speed Controller" style={{ height: '100%', maxWidth: '100%', objectFit: 'contain', borderRadius: '3px' }} />
                    </div>
                    <select 
                      style={{ fontSize: '9px', padding: '2px', width: '100%' }} 
                      className="retro-select" 
                      value={selectedEsc.id}
                      onChange={(e) => {
                        const item = escs.find(x => x.id === e.target.value);
                        if (item) { setSelectedEsc(item); setActiveSetupType(null); }
                      }}
                    >
                      {escs.map(escItem => <option key={escItem.id} value={escItem.id}>{escItem.name}</option>)}
                    </select>
                  </div>
                  <div style={{ fontSize: '7.5px', color: 'rgba(255,255,255,0.7)', marginTop: '4px', lineHeight: '1.2' }}>
                    <div style={{ fontWeight: 'bold', color: '#ffb347', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {selectedMotor.isGasOrGlow ? "Servo: Standard Size" : `Mod: ${selectedEsc.model}`}
                    </div>
                    <div style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {selectedMotor.isGasOrGlow ? "Signal: PWM Servo Throttle" : `Volt: ${selectedEsc.voltageSupported.replace(" LiPo", "")}`}
                    </div>
                  </div>
                </div>

                {/* Battery Select */}
                <div style={{ border: '1px solid var(--color-panel-border)', padding: '6px', borderRadius: '3px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '8px', color: 'var(--color-amber-dim)', fontWeight: 'bold' }}>BATTERY</div>
                    <div style={{ height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '4px 0', overflow: 'hidden' }}>
                      <img src={getBatteryImage()} alt="LiPo Battery" style={{ height: '100%', maxWidth: '100%', objectFit: 'contain', borderRadius: '3px' }} />
                    </div>
                    <select 
                      style={{ fontSize: '9px', padding: '2px', width: '100%' }} 
                      className="retro-select" 
                      value={selectedBattery.id}
                      onChange={(e) => {
                        const item = batteries.find(x => x.id === e.target.value);
                        if (item) { setSelectedBattery(item); setActiveSetupType(null); }
                      }}
                    >
                      {batteries.map(b => <option key={b.id} value={b.id}>{b.name.replace(" LIPO", "")}</option>)}
                    </select>
                  </div>
                  <div style={{ fontSize: '7.5px', color: 'rgba(255,255,255,0.7)', marginTop: '4px', lineHeight: '1.2' }}>
                    <div style={{ fontWeight: 'bold', color: '#ffb347' }}>
                      {selectedMotor.isGasOrGlow ? "Fuel Capacity" : `${selectedBattery.cells}S Pack`}
                    </div>
                    <div>
                      {selectedMotor.isGasOrGlow ? `Tank: ${selectedMotor.fuelCapacityOz} oz` : `Cap: ${selectedBattery.capacity}mAh`}
                    </div>
                  </div>
                </div>

                {/* Propeller Select */}
                <div style={{ border: '1px solid var(--color-panel-border)', padding: '6px', borderRadius: '3px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '8px', color: 'var(--color-amber-dim)', fontWeight: 'bold' }}>PROPELLER</div>
                    <div style={{ height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '4px 0', overflow: 'hidden' }}>
                      <img src={getPropellerImage()} alt="Propeller" style={{ height: '100%', maxWidth: '100%', objectFit: 'contain', borderRadius: '3px' }} />
                    </div>
                    <select 
                      style={{ fontSize: '9px', padding: '2px', width: '100%' }} 
                      className="retro-select" 
                      value={selectedPropeller.id}
                      onChange={(e) => {
                        const item = propellers.find(x => x.id === e.target.value);
                        if (item) { setSelectedPropeller(item); setActiveSetupType(null); }
                      }}
                    >
                      {propellers.map(p => <option key={p.id} value={p.id}>{p.name.replace("APC ", "")}</option>)}
                    </select>
                  </div>
                  <div style={{ fontSize: '7.5px', color: 'rgba(255,255,255,0.7)', marginTop: '4px', lineHeight: '1.2' }}>
                    <div style={{ fontWeight: 'bold', color: '#ffb347' }}>Size: {selectedPropeller.diameter}&quot;x{selectedPropeller.pitch}&quot;</div>
                    <div>Type: {selectedPropeller.type}</div>
                  </div>
                </div>

              </div>
            </div>

            {/* 3. Setup Notes / Dynamic Performance Bounds */}
            <div className="metal-panel">
              <div className="rivet top-left"></div>
              <div className="rivet top-right"></div>
              <div className="rivet bottom-left"></div>
              <div className="rivet bottom-right"></div>
              <div className="panel-header">
                <span className="badge">3</span> SETUP NOTES
              </div>
              <div className="card-content" style={{ padding: '8px', fontSize: '11px' }}>
                <div style={{ color: '#ffb347', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '11px', marginBottom: '4px' }}>
                  {activeSetupType && recommendedSetups[activeSetupType] ? recommendedSetups[activeSetupType].name : (activeSetupType === 'fastest' ? "SPEED RUN SETUP" : "CUSTOM WORKBENCH CONFIG")}
                </div>
                <div style={{ borderBottom: '1px solid var(--color-panel-border)', paddingBottom: '4px', marginBottom: '4px' }}>
                  <div className="flex-between">
                    <span style={{ color: 'var(--color-amber-dim)' }}>Voltage Range:</span>
                    <span style={{ fontWeight: 'bold', color: '#fff' }}>
                      {activeSetupType && recommendedSetups[activeSetupType] ? recommendedSetups[activeSetupType].notes.voltageRange : `${selectedBattery.cells}S`}
                    </span>
                  </div>
                  <div className="flex-between">
                    <span style={{ color: 'var(--color-amber-dim)' }}>Power Range:</span>
                    <span style={{ fontWeight: 'bold', color: '#fff' }}>
                      {activeSetupType && recommendedSetups[activeSetupType] ? recommendedSetups[activeSetupType].notes.powerRange : `${Math.round(specs.watts * 0.75)} - ${specs.watts} W`}
                    </span>
                  </div>
                  <div className="flex-between">
                    <span style={{ color: 'var(--color-amber-dim)' }}>Speed Est:</span>
                    <span style={{ fontWeight: 'bold', color: '#fff' }}>
                      {activeSetupType && recommendedSetups[activeSetupType] ? recommendedSetups[activeSetupType].notes.speedEstimate : `${specs.topSpeed} MPH / ${specs.pitchSpeed} MPH Pitch`}
                    </span>
                  </div>
                  <div className="flex-between">
                    <span style={{ color: 'var(--color-amber-dim)' }}>Amps Range:</span>
                    <span style={{ fontWeight: 'bold', color: '#fff' }}>
                      {activeSetupType === 'safe' ? '40 - 50 A' :
                       activeSetupType === 'scale' ? '70 - 80 A' :
                       activeSetupType === 'aggressive' ? '80 - 95 A' :
                       activeSetupType === 'extreme' ? '110 - 120 A' :
                       `${Math.round(specs.amps * 0.75)} - ${Math.round(specs.amps)} A`}
                    </span>
                  </div>
                </div>
                <p style={{ color: '#fff', fontSize: '10px', lineHeight: '1.2' }}>
                  {activeSetupType && recommendedSetups[activeSetupType] ? recommendedSetups[activeSetupType].notes.behavior : (activeSetupType === 'fastest' ? "Extreme performance speed run setup. Tuned for maximum pitch speed and high static load." : "Analyzing electrical characteristics of custom setup. Check Validator for details.")}
                </p>
                <div style={{ color: 'var(--color-red)', fontWeight: 'bold', marginTop: '6px', fontSize: '9px', lineHeight: '1.1' }}>
                  WARNING: {activeSetupType && recommendedSetups[activeSetupType] ? recommendedSetups[activeSetupType].notes.warning : (activeSetupType === 'fastest' ? "Monitor high current draw and temperatures closely to prevent battery thermal runaway." : "Ensure continuous cooling airflow around motor windings on static tests.")}
                </div>
              </div>
            </div>

            {/* 4. System Status Panel */}
            <div className="metal-panel">
              <div className="rivet top-left"></div>
              <div className="rivet top-right"></div>
              <div className="rivet bottom-left"></div>
              <div className="rivet bottom-right"></div>
              <div className="panel-header">
                <span className="badge">4</span> SYSTEM STATUS
              </div>
              <div className="card-content" style={{ padding: '8px' }}>
                <div className="flex-between" style={{ marginBottom: '4px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--color-amber-dim)' }}>OVERALL STATUS</span>
                  <span className={
                    specs.overallStatus === "GOOD" ? "glow-text-green" :
                    specs.overallStatus === "WARNING" ? "glow-text" : "glow-text-red"
                  } style={{ fontWeight: 'bold', fontSize: '13px' }}>
                    {specs.overallStatus}
                  </span>
                </div>

                <div className="flex-between" style={{ marginBottom: '8px', borderBottom: '1px dashed rgba(255,255,255,0.08)', paddingBottom: '4px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--color-amber-dim)' }}>CURRENT DRAW</span>
                  <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--color-red)', textShadow: '0 0 8px var(--color-red-glow)', fontFamily: 'var(--font-mono)' }}>{specs.amps} A</span>
                </div>

                <HorizontalBarGauge label="Motor Load" value={specs.motorLoad} percentage={specs.motorLoad} />
                <HorizontalBarGauge label="ESC Load" value={specs.escLoad} percentage={specs.escLoad} />
                <HorizontalBarGauge label="Battery Load" value={specs.batteryLoad} percentage={specs.batteryLoad} />

                <div className="flex-between" style={{ borderTop: '1px solid var(--color-panel-border)', paddingTop: '6px', marginTop: '4px' }}>
                  <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--color-amber-dim)' }}>POWER SYSTEM</span>
                  <span className={
                    specs.powerSystemStatus === "STABLE" ? "glow-text-green" :
                    specs.powerSystemStatus === "STRESSED" ? "glow-text" : "glow-text-red"
                  } style={{ fontWeight: 'bold', fontSize: '11px' }}>
                    {specs.powerSystemStatus}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* 5. Live gauges dashboard */}
          <div className="metal-panel">
            <div className="rivet top-left"></div>
            <div className="rivet top-right"></div>
            <div className="rivet bottom-left"></div>
            <div className="rivet bottom-right"></div>
            <div className="panel-header">
              <span className="badge">5</span> LIVE SYSTEM DIAGNOSTICS
            </div>
            <div className="card-content" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', gap: '8px', padding: '12px 6px' }}>
              <CircularGauge label="RPM" value={specs.rpm} min={0} max={16000} unit="RPM" warningThreshold={80} dangerThreshold={90} />
              <CircularGauge label="AMPS" value={specs.amps} min={0} max={160} unit="AMPS" warningThreshold={85} dangerThreshold={95} />
              <CircularGauge label="VOLTS" value={specs.volts} min={0} max={40} unit="VOLTS" warningThreshold={80} dangerThreshold={90} />
              <CircularGauge label="WATTS" value={specs.watts} min={0} max={4000} unit="WATTS" warningThreshold={80} dangerThreshold={90} />
              <CircularGauge label="EFFICIENCY" value={specs.efficiency} min={0} max={100} unit="EFFICIENCY" warningThreshold={60} dangerThreshold={75} />
              <CircularGauge label="TEMP" value={specs.temp} min={0} max={150} unit="°C TEMP" warningThreshold={70} dangerThreshold={85} />
            </div>
          </div>

          {/* Performance prediction & power curve bottom row */}
          <div className="bottom-row-grid" style={{ gap: '16px' }}>
            
            {/* 7. Performance Prediction card with plane image on left and specs table on right */}
            <div className="metal-panel">
              <div className="rivet top-left"></div>
              <div className="rivet top-right"></div>
              <div className="rivet bottom-left"></div>
              <div className="rivet bottom-right"></div>
              <div className="panel-header">
                <span className="badge">7</span> PERFORMANCE PREDICTION
              </div>
              <div className="card-content prediction-inner-grid" style={{ gap: '10px', padding: '8px' }}>
                {/* Flight Photo with red/vignette overlay */}
                <div style={{ 
                  border: '1.5px solid var(--color-panel-border)', 
                  borderRadius: '3.5px', 
                  position: 'relative', 
                  overflow: 'hidden', 
                  height: '116px',
                  boxShadow: 'inset 0 0 10px rgba(0,0,0,0.9)'
                }}>
                  <img 
                    src={new URL(`../assets/aircraft/${selectedAircraft.image}`, import.meta.url).href} 
                    alt={selectedAircraft.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                  {/* Crimson overlay filter */}
                  <div style={{ 
                    position: 'absolute', 
                    top: 0, left: 0, width: '100%', height: '100%', 
                    background: 'linear-gradient(to top, rgba(167, 46, 33, 0.45), rgba(18, 14, 12, 0.75))',
                    mixBlendMode: 'multiply' 
                  }}></div>
                </div>

                <div>
                  <table className="retro-table" style={{ fontSize: '10px' }}>
                    <tbody>
                      <tr>
                        <td className="label">Pitch Speed (Est)</td>
                        <td className="val" style={{ color: 'var(--color-amber)' }}>{specs.pitchSpeed} MPH</td>
                      </tr>
                      <tr>
                        <td className="label">Thrust to Weight</td>
                        <td className="val" style={{ color: '#ff8888', fontWeight: 'bold' }}>{specs.thrustToWeight} : 1</td>
                      </tr>
                      <tr>
                        <td className="label">Vertical Performance</td>
                        <td className="val">
                          {specs.thrustToWeight >= 1.2 ? "★★★★★" : 
                           specs.thrustToWeight >= 0.9 ? "★★★★☆" : 
                           specs.thrustToWeight >= 0.7 ? "★★★☆☆" : "★★☆☆☆"}
                        </td>
                      </tr>
                      <tr>
                        <td className="label">Acceleration</td>
                        <td className="val">
                          {specs.thrustToWeight >= 1.2 ? "★★★★★" : 
                           specs.thrustToWeight >= 0.95 ? "★★★★☆" : 
                           specs.thrustToWeight >= 0.75 ? "★★★☆☆" : "★★☆☆☆"}
                        </td>
                      </tr>
                      <tr>
                        <td className="label">Top Speed (Level)</td>
                        <td className="val" style={{ color: 'var(--color-green)' }}>~{specs.topSpeed} MPH</td>
                      </tr>
                      <tr>
                        <td className="label">Flight Time (Est)</td>
                        <td className="val" style={{ color: '#fff' }}>{specs.flightTimeMin}-{specs.flightTimeMax} MIN</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Thrust to Weight ratio gauge in its own panel */}
            <div className="metal-panel">
              <div className="rivet top-left"></div>
              <div className="rivet top-right"></div>
              <div className="rivet bottom-left"></div>
              <div className="rivet bottom-right"></div>
              <div className="panel-header" style={{ fontSize: '10px', justifyContent: 'center' }}>
                ★ THRUST / WT RATIO
              </div>
              <div className="card-content flex-center" style={{ padding: '6px' }}>
                <CircularGauge 
                  label="THRUST RATIO" 
                  value={specs.thrustToWeight} 
                  min={0} 
                  max={2.0} 
                  unit="RATIO" 
                  warningThreshold={150} 
                  dangerThreshold={180}
                  size={110} 
                />
              </div>
            </div>

            {/* 8. Power Curve graph */}
            <div className="metal-panel">
              <div className="rivet top-left"></div>
              <div className="rivet top-right"></div>
              <div className="rivet bottom-left"></div>
              <div className="rivet bottom-right"></div>
              <div className="panel-header">
                <span className="badge">8</span> POWER CURVE (ESTIMATED)
              </div>
              <div className="card-content" style={{ padding: '4px 8px' }}>
                <PowerCurveChart 
                  aircraft={selectedAircraft}
                  motor={selectedMotor}
                  esc={selectedEsc}
                  battery={selectedBattery}
                  propeller={selectedPropeller}
                  currentThrottle={throttle}
                />
              </div>
            </div>

          </div>

        </div>

        {/* Right Side: Throttle slider, calculation launcher, and action utilities */}
        <section className="metal-panel right-column" style={{ height: '100%', justifyContent: 'space-between' }}>
          <div className="rivet top-left"></div>
          <div className="rivet top-right"></div>
          <div className="rivet bottom-left"></div>
          <div className="rivet bottom-right"></div>
          
          <div>
            <div className="panel-header" style={{ borderBottom: '2px solid var(--color-panel-border)' }}>
              <span className="badge">6</span> CONTROL BENCH
            </div>
            
            {/* Throttle slider element styled as a retro military control lever */}
            <div className="card-content" style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-amber-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                THROTTLE ACTUATOR
              </div>
              
              <div style={{
                position: 'relative',
                height: '240px',
                width: '60px',
                background: 'linear-gradient(90deg, #150f0c 0%, #2b1f1a 50%, #150f0c 100%)',
                border: '3px solid var(--color-panel-border)',
                borderRadius: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'inset 0 0 15px rgba(0,0,0,0.9)'
              }}>
                {/* Tick marks on slot */}
                <div style={{ position: 'absolute', left: '10px', height: '180px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: 'var(--color-panel-border)', fontSize: '8px', fontWeight: 'bold' }}>
                  <span>100</span>
                  <span>80</span>
                  <span>60</span>
                  <span>40</span>
                  <span>20</span>
                  <span>0</span>
                </div>
                
                {/* Slot */}
                <div style={{
                  position: 'absolute',
                  width: '6px',
                  height: '180px',
                  backgroundColor: '#0a0706',
                  borderRadius: '3px',
                  boxShadow: '0 1px 1px rgba(255,255,255,0.05)'
                }}></div>
                
                {/* Knob */}
                <div 
                  style={{
                    position: 'absolute',
                    bottom: `${12 + (throttle / 100) * 180}px`,
                    width: '32px',
                    height: '24px',
                    background: 'radial-gradient(circle at 10px 8px, #731b1b 0%, #2c0a0a 100%)',
                    border: '2px solid var(--color-red)',
                    borderRadius: '4px',
                    cursor: 'ns-resize',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.8), 0 0 10px var(--color-red-glow)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: isSimulating ? 'bottom 0.03s linear' : 'none'
                  }}
                  onMouseDown={(e) => {
                    const slider = e.currentTarget.parentElement;
                    if (!slider || isSimulating) return;
                    
                    const handleMouseMove = (moveEvent) => {
                      const rect = slider.getBoundingClientRect();
                      const y = moveEvent.clientY - rect.top - 30; // offset padding
                      const h = 180; // height of track
                      const rawPct = 100 - (y / h) * 100;
                      const newT = Math.round(Math.max(Math.min(rawPct, 100), 0));
                      setThrottle(newT);
                    };

                    const handleMouseUp = () => {
                      window.removeEventListener('mousemove', handleMouseMove);
                      window.removeEventListener('mouseup', handleMouseUp);
                    };

                    window.addEventListener('mousemove', handleMouseMove);
                    window.addEventListener('mouseup', handleMouseUp);
                  }}
                >
                  <div style={{ width: '24px', height: '2px', backgroundColor: '#fff', opacity: 0.7 }} />
                </div>
              </div>

              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', textShadow: '0 0 8px rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono)' }}>
                {throttle}% LOAD
              </div>
            </div>

            {/* Run calculation button */}
            <div style={{ padding: '0 12px 12px 12px' }}>
              <button 
                onClick={runSimulation}
                className="btn-retro btn-red-launcher"
                style={{ width: '100%', height: '56px', display: 'flex', flexDirection: 'column', padding: '8px' }}
                disabled={isSimulating}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Activity size={20} className={isSimulating ? "animate-pulse" : ""} />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '13px', fontWeight: 'bold' }}>RUN CALCULATION</div>
                    <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-mono)' }}>
                      {isSimulating ? "Diagnostics Sweep Active..." : "Update Live System Data"}
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Action buttons (compare, save, export) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', borderTop: '2px solid var(--color-panel-border)' }}>
            
            {saveMessage && (
              <div style={{
                textAlign: 'center',
                fontSize: '10px',
                color: 'var(--color-green)',
                fontWeight: 'bold',
                animation: 'pulse 1s infinite',
                marginBottom: '4px'
              }}>
                {saveMessage}
              </div>
            )}

            <button onClick={() => setIsCompareOpen(true)} className="btn-retro" style={{ fontSize: '11px', width: '100%' }}>
              <span>🔍 COMPARE SETUPS</span>
            </button>
            
            <button onClick={saveCurrentSetup} className="btn-retro" style={{ fontSize: '11px', width: '100%' }}>
              <span>💾 SAVE SETUP</span>
            </button>
            
            <button onClick={() => setIsExportOpen(true)} className="btn-retro" style={{ fontSize: '11px', width: '100%' }}>
              <span>📤 EXPORT REPORT</span>
            </button>
          </div>
        </section>

      </div>

      {/* Compare Setups Modal */}
      {isCompareOpen && (
        <div className="modal-overlay" onClick={() => setIsCompareOpen(false)}>
          <div className="modal-content metal-panel" onClick={(e) => e.stopPropagation()} style={{ border: '2.5px solid var(--color-panel-border)' }}>
            <div className="rivet top-left"></div>
            <div className="rivet top-right"></div>
            <div className="rivet bottom-left"></div>
            <div className="rivet bottom-right"></div>
            <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><span className="badge">🔍</span> SYSTEM COMPARISON TOOL</div>
              <button className="btn-retro" onClick={() => setIsCompareOpen(false)} style={{ padding: '2px 8px', fontSize: '9px' }}>CLOSE</button>
            </div>
            <div className="card-content" style={{ padding: '12px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '10px', color: 'var(--color-amber-dim)', fontWeight: 'bold' }}>COMPARE TO SAVED:</span>
                {savedConfigs.length > 0 ? (
                  <select 
                    className="retro-select" 
                    style={{ fontSize: '10px', padding: '4px', maxWidth: '300px' }}
                    value={selectedSavedConfigId}
                    onChange={(e) => setSelectedSavedConfigId(e.target.value)}
                  >
                    {savedConfigs.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.timestamp})</option>
                    ))}
                  </select>
                ) : (
                  <span style={{ fontSize: '10px', color: 'var(--color-red)', fontWeight: 'bold' }}>NO SAVED CONFIGS YET (SAVE CURRENT SETUP FIRST)</span>
                )}
              </div>
              
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Current Selected</th>
                    <th>Stock Baseline</th>
                    <th>Saved Config</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const recSetup = recommendedSetups.scale;
                    const recMotor = motors.find(m => m.id === recSetup.motorId) || selectedMotor;
                    const recEsc = escs.find(e => e.id === recSetup.escId) || selectedEsc;
                    const recBattery = batteries.find(b => b.id === recSetup.batteryId) || selectedBattery;
                    const recPropeller = propellers.find(p => p.id === recSetup.propellerId) || selectedPropeller;
                    const stockSpecs = calculateSpecs({
                      aircraft: selectedAircraft,
                      motor: recMotor,
                      esc: recEsc,
                      battery: recBattery,
                      propeller: recPropeller,
                      throttle: throttle
                    });

                    const savedConfig = savedConfigs.find(c => c.id === selectedSavedConfigId) || savedConfigs[0];
                    let savedSpecs = null;
                    let sAc = null, sM = null, sE = null, sB = null, sP = null;
                    if (savedConfig) {
                      sAc = aircrafts.find(a => a.id === savedConfig.aircraftId) || selectedAircraft;
                      sM = motors.find(m => m.id === savedConfig.motorId) || selectedMotor;
                      sE = escs.find(e => e.id === savedConfig.escId) || selectedEsc;
                      sB = batteries.find(b => b.id === savedConfig.batteryId) || selectedBattery;
                      sP = propellers.find(p => p.id === savedConfig.propellerId) || selectedPropeller;
                      savedSpecs = calculateSpecs({
                        aircraft: sAc,
                        motor: sM,
                        esc: sE,
                        battery: sB,
                        propeller: sP,
                        throttle: savedConfig.throttle || 100
                      });
                    }

                    const rows = [
                      { label: "Aircraft", cur: selectedAircraft.name.replace(/★/g, "").trim(), stk: selectedAircraft.name.replace(/★/g, "").trim(), sav: sAc ? sAc.name.replace(/★/g, "").trim() : "-" },
                      { label: "Motor", cur: selectedMotor.brand + " " + selectedMotor.kv + "KV", stk: recMotor.brand + " " + recMotor.kv + "KV", sav: sM ? sM.brand + " " + sM.kv + "KV" : "-" },
                      { label: "ESC", cur: selectedEsc.brand + " " + selectedEsc.maxAmps + "A", stk: recEsc.brand + " " + recEsc.maxAmps + "A", sav: sE ? sE.brand + " " + sE.maxAmps + "A" : "-" },
                      { label: "Battery", cur: selectedBattery.cells + "S " + selectedBattery.capacity + "mAh", stk: recBattery.cells + "S " + recBattery.capacity + "mAh", sav: sB ? sB.cells + "S " + sB.capacity + "mAh" : "-" },
                      { label: "Propeller", cur: selectedPropeller.diameter + "x" + selectedPropeller.pitch + " (" + selectedPropeller.blades + "B)", stk: recPropeller.diameter + "x" + recPropeller.pitch + " (" + recPropeller.blades + "B)", sav: sP ? sP.diameter + "x" + sP.pitch + " (" + sP.blades + "B)" : "-" },
                      { label: "Throttle", cur: throttle + "%", stk: throttle + "%", sav: savedConfig ? (savedConfig.throttle || 100) + "%" : "-" },
                      { label: "Current (A)", cur: specs.amps + " A", stk: stockSpecs.amps + " A", sav: savedSpecs ? savedSpecs.amps + " A" : "-" },
                      { label: "Power (W)", cur: specs.watts + " W", stk: stockSpecs.watts + " W", sav: savedSpecs ? savedSpecs.watts + " W" : "-" },
                      { label: "Thrust Ratio", cur: specs.thrustToWeight, stk: stockSpecs.thrustToWeight, sav: savedSpecs ? savedSpecs.thrustToWeight : "-" },
                      { label: "Pitch Speed", cur: specs.pitchSpeed + " MPH", stk: stockSpecs.pitchSpeed + " MPH", sav: savedSpecs ? savedSpecs.pitchSpeed + " MPH" : "-" },
                      { label: "Top Speed", cur: specs.topSpeed + " MPH", stk: stockSpecs.topSpeed + " MPH", sav: savedSpecs ? savedSpecs.topSpeed + " MPH" : "-" },
                      { label: "Motor Load", cur: specs.motorLoad + "%", stk: stockSpecs.motorLoad + "%", sav: savedSpecs ? savedSpecs.motorLoad + "%" : "-" },
                      { label: "Motor Temp", cur: specs.temp + " °C", stk: stockSpecs.temp + " °C", sav: savedSpecs ? savedSpecs.temp + " °C" : "-" },
                      { label: "Flight Time", cur: specs.flightTimeMin + "-" + specs.flightTimeMax + " min", stk: stockSpecs.flightTimeMin + "-" + stockSpecs.flightTimeMax + " min", sav: savedSpecs ? savedSpecs.flightTimeMin + "-" + savedSpecs.flightTimeMax + " min" : "-" },
                    ];

                    return rows.map((r, i) => (
                      <tr key={i}>
                        <td className="comparison-table td label-cell">{r.label}</td>
                        <td className="comparison-table td active-cell">{r.cur}</td>
                        <td className="comparison-table td stock-cell">{r.stk}</td>
                        <td className="comparison-table td saved-cell">{r.sav}</td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Export Report Modal */}
      {isExportOpen && (
        <div className="modal-overlay" onClick={() => setIsExportOpen(false)}>
          <div className="modal-content metal-panel" onClick={(e) => e.stopPropagation()} style={{ border: '2.5px solid var(--color-panel-border)', maxWidth: '420px' }}>
            <div className="rivet top-left"></div>
            <div className="rivet top-right"></div>
            <div className="rivet bottom-left"></div>
            <div className="rivet bottom-right"></div>
            <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><span className="badge">📤</span> EXPORT DIAGNOSTICS REPORT</div>
              <button className="btn-retro" onClick={() => setIsExportOpen(false)} style={{ padding: '2px 8px', fontSize: '9px' }}>CLOSE</button>
            </div>
            <div className="card-content" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontSize: '11px', color: 'var(--color-amber-dim)', lineHeight: '1.3' }}>
                Select your output file format. The report compiles active bench test values, estimated level speeds, and system validator checks.
              </p>
              
              <button 
                onClick={() => {
                  exportToCSV();
                  setIsExportOpen(false);
                }} 
                className="btn-retro"
                style={{ fontSize: '12px', padding: '10px', justifyContent: 'center' }}
              >
                📊 DOWNLOAD CSV TELEMETRY SWEEP (.csv)
              </button>

              <button 
                onClick={() => {
                  exportToTxt();
                  setIsExportOpen(false);
                }} 
                className="btn-retro"
                style={{ fontSize: '12px', padding: '10px', justifyContent: 'center' }}
              >
                📄 DOWNLOAD BUILDER SPECS SHEET (.txt)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
