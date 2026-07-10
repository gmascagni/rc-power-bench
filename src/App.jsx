import React, { useState } from 'react';
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
import ValidatorChecks from './components/ValidatorChecks';
import SettingsOptions from './components/SettingsOptions';
import { aircrafts, motors, escs, batteries, propellers } from './data/rcData';

function App() {
  // Navigation Tabs state
  const [activeTab, setActiveTab] = useState('cockpit');
  const [componentSubTab, setComponentSubTab] = useState('motors');

  // Selected components state (initialized to default Scale Performance baseline)
  const [selectedAircraft, setSelectedAircraft] = useState(aircrafts[0]); // P-51D Mustang
  const [selectedMotor, setSelectedMotor] = useState(motors[0]); // SunnySky X4120 600KV
  const [selectedEsc, setSelectedEsc] = useState(escs[0]); // Hobbywing Platinum 120A HV
  const [selectedBattery, setSelectedBattery] = useState(batteries[0]); // 6S 5000mAh 45C
  const [selectedPropeller, setSelectedPropeller] = useState(propellers[0]); // APC 15x10E
  const [activeSetupType, setActiveSetupType] = useState('scale'); // Recommended setup tracking

  // Shared calculations slider load
  const [throttle, setThrottle] = useState(100);

  // Settings state
  const [crtEnabled, setCrtEnabled] = useState(true);
  const [unitSystem, setUnitSystem] = useState('imperial'); // 'imperial' or 'metric'
  const [soundEnabled, setSoundEnabled] = useState(false);

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
          />
        );
      case 'aircraft':
        return (
          <AircraftDatabase 
            selectedAircraft={selectedAircraft}
            setSelectedAircraft={setSelectedAircraft}
            setActiveTab={setActiveTab}
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
          />
        );
      case 'calculator':
        return <CalculatorEngine />;
      case 'validator':
        return (
          <ValidatorChecks
            selectedAircraft={selectedAircraft}
            selectedMotor={selectedMotor}
            selectedEsc={selectedEsc}
            selectedBattery={selectedBattery}
            selectedPropeller={selectedPropeller}
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
          onClick={() => setActiveTab('calculator')} 
          className={`nav-item ${activeTab === 'calculator' ? 'active' : ''}`}
        >
          <Calculator size={16} />
          <span>CALCULATOR</span>
          <span style={{ fontSize: '8px', opacity: 0.6 }}>ENGINE</span>
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
