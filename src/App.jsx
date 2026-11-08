import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Plane, 
  Settings, 
  Calculator, 
  ShieldCheck, 
  Zap, 
  Battery, 
  Wind, 
  Disc 
} from 'lucide-react';
import CockpitOverview from './components/CockpitOverview';
import AircraftDatabase from './components/AircraftDatabase';
import ComponentDatabases from './components/ComponentDatabases';
import CalculatorEngine from './components/CalculatorEngine';
import AirplaneCalculator from './components/AirplaneCalculator';
import ValidatorChecks from './components/ValidatorChecks';
import SettingsOptions from './components/SettingsOptions';
import { aircrafts, motors, escs, batteries, propellers } from './data/rcData';
import { calculateSpecs } from './utils/calcEngine';

function App() {
  // Navigation Tabs state
  const [activeTab, setActiveTab] = useState('cockpit');
  const [componentSubTab, setComponentSubTab] = useState('motors');

  // Custom Fleet Database state (persisted in localStorage)
  const [customFleet, setCustomFleet] = useState(() => {
    try {
      const saved = localStorage.getItem('rc_custom_fleet');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Selected components state (initialized to default aircraft's Factory Stock setup)
  const initialStock = aircrafts[0]?.stockSetup || {};
  const [selectedAircraft, setSelectedAircraft] = useState(aircrafts[0]);
  const [selectedMotor, setSelectedMotor] = useState(() => motors.find(m => m.id === initialStock.motorId) || motors[0]);
  const [selectedEsc, setSelectedEsc] = useState(() => escs.find(e => e.id === initialStock.escId) || escs[0]);
  const [selectedBattery, setSelectedBattery] = useState(() => batteries.find(b => b.id === initialStock.batteryId) || batteries[0]);
  const [selectedPropeller, setSelectedPropeller] = useState(() => propellers.find(p => p.id === initialStock.propellerId) || propellers[0]);
  const [activeSetupType, setActiveSetupType] = useState('scale'); // Recommended setup tracking

  // Shared calculations slider load
  const [throttle, setThrottle] = useState(100);

  // Settings state
  const [crtEnabled, setCrtEnabled] = useState(true);
  const [unitSystem, setUnitSystem] = useState('imperial'); // 'imperial' or 'metric'
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Web Audio Synthesizer for Dyno Acoustic Telemetry Feedback
  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);
  const gainRef = useRef(null);

  useEffect(() => {
    if (!soundEnabled || throttle <= 0) {
      if (gainRef.current && audioCtxRef.current) {
        gainRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.08);
      }
      return;
    }

    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        gain.gain.value = 0;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        audioCtxRef.current = ctx;
        oscRef.current = osc;
        gainRef.current = gain;
      }

      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      const specs = calculateSpecs({
        aircraft: selectedAircraft,
        motor: selectedMotor,
        esc: selectedEsc,
        battery: selectedBattery,
        propeller: selectedPropeller,
        throttle
      });

      const blades = selectedPropeller?.blades || 2;
      const fundamentalHz = Math.max(45, Math.min((specs.rpm / 60) * blades, 420));
      const targetGain = Math.min(0.035, 0.005 + (throttle / 100) * 0.025);

      oscRef.current.frequency.setTargetAtTime(fundamentalHz, audioCtxRef.current.currentTime, 0.05);
      gainRef.current.gain.setTargetAtTime(targetGain, audioCtxRef.current.currentTime, 0.05);
    } catch {
      // Ignore Web Audio autoplay restrictions until user interaction
    }
  }, [soundEnabled, throttle, selectedAircraft, selectedMotor, selectedEsc, selectedBattery, selectedPropeller]);

  // Render Page Content based on tab Selection
  const renderContent = () => {
    switch (activeTab) {
      case 'cockpit':
        return (
          <CockpitOverview
            selectedAircraft={selectedAircraft}
            setSelectedAircraft={setSelectedAircraft}
            selectedMotor={selectedMotor}
            setSelectedMotor={setSelectedMotor}
            selectedEsc={selectedEsc}
            setSelectedEsc={setSelectedEsc}
            selectedBattery={selectedBattery}
            setSelectedBattery={setSelectedBattery}
            selectedPropeller={selectedPropeller}
            setSelectedPropeller={setSelectedPropeller}
            activeSetupType={activeSetupType}
            setActiveSetupType={setActiveSetupType}
            throttle={throttle}
            setThrottle={setThrottle}
            setActiveTab={setActiveTab}
            customFleet={customFleet}
            setCustomFleet={setCustomFleet}
            unitSystem={unitSystem}
            setUnitSystem={setUnitSystem}
            crtEnabled={crtEnabled}
            setCrtEnabled={setCrtEnabled}
            soundEnabled={soundEnabled}
            setSoundEnabled={setSoundEnabled}
          />
        );
      case 'aircraft':
        return (
          <AircraftDatabase 
            selectedAircraft={selectedAircraft}
            setSelectedAircraft={setSelectedAircraft}
            setSelectedMotor={setSelectedMotor}
            setSelectedEsc={setSelectedEsc}
            setSelectedBattery={setSelectedBattery}
            setSelectedPropeller={setSelectedPropeller}
            setThrottle={setThrottle}
            setActiveTab={setActiveTab}
            customFleet={customFleet}
            setCustomFleet={setCustomFleet}
            unitSystem={unitSystem}
          />
        );
      case 'components':
        return (
          <ComponentDatabases
            selectedMotor={selectedMotor}
            setSelectedMotor={setSelectedMotor}
            selectedEsc={selectedEsc}
            setSelectedEsc={setSelectedEsc}
            selectedBattery={selectedBattery}
            setSelectedBattery={setSelectedBattery}
            selectedPropeller={selectedPropeller}
            setSelectedPropeller={setSelectedPropeller}
            setActiveTab={setActiveTab}
            initialSubTab={componentSubTab}
            unitSystem={unitSystem}
          />
        );
      case 'calculator':
        return <CalculatorEngine unitSystem={unitSystem} />;
      case 'plane-calculator':
        return (
          <AirplaneCalculator 
            selectedAircraft={selectedAircraft}
            setSelectedAircraft={setSelectedAircraft}
            setSelectedMotor={setSelectedMotor}
            setSelectedEsc={setSelectedEsc}
            setSelectedBattery={setSelectedBattery}
            setSelectedPropeller={setSelectedPropeller}
            setThrottle={setThrottle}
            setActiveTab={setActiveTab}
            customFleet={customFleet}
            setCustomFleet={setCustomFleet}
            unitSystem={unitSystem}
          />
        );
      case 'validator':
        return (
          <ValidatorChecks
            selectedAircraft={selectedAircraft}
            selectedMotor={selectedMotor}
            selectedEsc={selectedEsc}
            selectedBattery={selectedBattery}
            selectedPropeller={selectedPropeller}
            unitSystem={unitSystem}
          />
        );
      case 'settings':
        return (
          <SettingsOptions
            crtEnabled={crtEnabled}
            setCrtEnabled={setCrtEnabled}
            unitSystem={unitSystem}
            setUnitSystem={setUnitSystem}
            soundEnabled={soundEnabled}
            setSoundEnabled={setSoundEnabled}
          />
        );
      default:
        return <div style={{ padding: '20px', color: '#fff' }}>Tab under construction</div>;
    }
  };

  const handleComponentTab = (subTab) => {
    setComponentSubTab(subTab);
    setActiveTab('components');
  };

  return (
    <div className={crtEnabled ? "crt-effect" : ""}>
      
      {/* Scroll vignette */}
      <div className="crt-vignette"></div>

      {/* Main viewport */}
      <main style={{ minHeight: 'calc(100vh - 65px)', paddingBottom: '20px' }}>
        {renderContent()}
      </main>

      {/* 9. Bottom Navigation Bar */}
      <nav className="nav-bar">
        <button 
          onClick={() => setActiveTab('cockpit')} 
          className={`nav-item ${activeTab === 'cockpit' ? 'active' : ''}`}
        >
          <LayoutDashboard size={16} />
          <span>COCKPIT</span>
          <span style={{ fontSize: '8px', opacity: 0.6 }}>OVERVIEW</span>
        </button>

        <button 
          onClick={() => setActiveTab('aircraft')} 
          className={`nav-item ${activeTab === 'aircraft' ? 'active' : ''}`}
        >
          <Plane size={16} />
          <span>AIRCRAFT</span>
          <span style={{ fontSize: '8px', opacity: 0.6 }}>DATABASE</span>
        </button>

        <button 
          onClick={() => handleComponentTab('motors')} 
          className={`nav-item ${activeTab === 'components' && componentSubTab === 'motors' ? 'active' : ''}`}
        >
          <Disc size={16} />
          <span>MOTORS</span>
          <span style={{ fontSize: '8px', opacity: 0.6 }}>DATABASE</span>
        </button>

        <button 
          onClick={() => handleComponentTab('props')} 
          className={`nav-item ${activeTab === 'components' && componentSubTab === 'props' ? 'active' : ''}`}
        >
          <Wind size={16} />
          <span>PROPELLERS</span>
          <span style={{ fontSize: '8px', opacity: 0.6 }}>DATABASE</span>
        </button>

        <button 
          onClick={() => handleComponentTab('batteries')} 
          className={`nav-item ${activeTab === 'components' && componentSubTab === 'batteries' ? 'active' : ''}`}
        >
          <Battery size={16} />
          <span>BATTERIES</span>
          <span style={{ fontSize: '8px', opacity: 0.6 }}>DATABASE</span>
        </button>

        <button 
          onClick={() => handleComponentTab('escs')} 
          className={`nav-item ${activeTab === 'components' && componentSubTab === 'escs' ? 'active' : ''}`}
        >
          <Zap size={16} />
          <span>ESCs</span>
          <span style={{ fontSize: '8px', opacity: 0.6 }}>DATABASE</span>
        </button>

        <button 
          onClick={() => setActiveTab('plane-calculator')} 
          className={`nav-item ${activeTab === 'plane-calculator' ? 'active' : ''}`}
        >
          <Plane size={16} />
          <span>AIRPLANE CALC</span>
          <span style={{ fontSize: '8px', opacity: 0.6 }}>CALCULATOR</span>
        </button>

        <button 
          onClick={() => setActiveTab('calculator')} 
          className={`nav-item ${activeTab === 'calculator' ? 'active' : ''}`}
        >
          <Calculator size={16} />
          <span>POWER SYS CALC</span>
          <span style={{ fontSize: '8px', opacity: 0.6 }}>CALCULATOR</span>
        </button>

        <button 
          onClick={() => setActiveTab('validator')} 
          className={`nav-item ${activeTab === 'validator' ? 'active' : ''}`}
        >
          <ShieldCheck size={16} />
          <span>VALIDATOR</span>
          <span style={{ fontSize: '8px', opacity: 0.6 }}>CHECKS</span>
        </button>

        <button 
          onClick={() => setActiveTab('settings')} 
          className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
        >
          <Settings size={16} />
          <span>SETTINGS</span>
          <span style={{ fontSize: '8px', opacity: 0.6 }}>OPTIONS</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
