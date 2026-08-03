import React, { useState } from 'react';
import { motors, escs, batteries, propellers } from '../data/rcData';

export default function ComponentDatabases({
  selectedMotor, setSelectedMotor,
  selectedEsc, setSelectedEsc,
  selectedBattery, setSelectedBattery,
  selectedPropeller, setSelectedPropeller,
  setActiveTab,
  initialSubTab
}) {
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab || 'motors');
  const [componentSearch, setComponentSearch] = useState("");

  React.useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const filteredMotors = motors.filter(m => 
    m.name.toLowerCase().includes(componentSearch.toLowerCase()) || 
    m.brand.toLowerCase().includes(componentSearch.toLowerCase()) ||
    m.kv.toString().includes(componentSearch)
  );

  const filteredESCs = escs.filter(e => 
    e.name.toLowerCase().includes(componentSearch.toLowerCase()) || 
    e.brand.toLowerCase().includes(componentSearch.toLowerCase())
  );

  const filteredBatteries = batteries.filter(b => 
    b.name.toLowerCase().includes(componentSearch.toLowerCase()) || 
    b.brand.toLowerCase().includes(componentSearch.toLowerCase())
  );

  const filteredPropellers = propellers.filter(p => 
    p.name.toLowerCase().includes(componentSearch.toLowerCase()) || 
    p.type.toLowerCase().includes(componentSearch.toLowerCase())
  );

  const renderMotors = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
      {filteredMotors.map(m => {
        const isActive = selectedMotor.id === m.id;
        return (
          <div key={m.id} style={cardStyle(isActive)}>
            <div>
              <div className="flex-between" style={{ fontSize: '10px', color: 'var(--color-amber-dim)' }}>
                <span>{m.brand}</span>
                <span>{m.type}</span>
              </div>
              <h3 style={titleStyle}>{m.name}</h3>
              <table className="retro-table" style={{ fontSize: '11px', marginBottom: '12px' }}>
                <tbody>
                  <tr><td className="label">KV Rating</td><td className="val">{m.kv} KV</td></tr>
                  <tr><td className="label">Weight</td><td className="val">{m.weight} g</td></tr>
                  <tr><td className="label">Max Current</td><td className="val">{m.maxCurrent} A</td></tr>
                  <tr><td className="label">Max Power</td><td className="val">{m.maxPower} W</td></tr>
                  <tr><td className="label">Internal Resistance</td><td className="val">{m.internalResistance} Ω</td></tr>
                </tbody>
              </table>
            </div>
            <button 
              onClick={() => { setSelectedMotor(m); setActiveTab('cockpit'); }}
              className={`btn-retro ${isActive ? 'active' : ''}`}
              style={{ width: '100%', fontSize: '11px' }}
            >
              {isActive ? "SELECTED" : "SELECT MOTOR"}
            </button>
          </div>
        );
      })}
    </div>
  );

  const renderESCs = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
      {filteredESCs.map(e => {
        const isActive = selectedEsc.id === e.id;
        return (
          <div key={e.id} style={cardStyle(isActive)}>
            <div>
              <div className="flex-between" style={{ fontSize: '10px', color: 'var(--color-amber-dim)' }}>
                <span>{e.brand}</span>
                <span>{e.voltageRange}</span>
              </div>
              <h3 style={titleStyle}>{e.name}</h3>
              <table className="retro-table" style={{ fontSize: '11px', marginBottom: '12px' }}>
                <tbody>
                  <tr><td className="label">Continuous Amps</td><td className="val">{e.maxAmps} A</td></tr>
                  <tr><td className="label">Burst Amps</td><td className="val">{e.burstAmps} A</td></tr>
                  <tr><td className="label">Internal Resistance</td><td className="val">{e.resistance} Ω</td></tr>
                  <tr><td className="label">Weight</td><td className="val">{e.weight} g</td></tr>
                  <tr><td className="label">BEC Spec</td><td className="val">{(e.becOutput || "N/A").replace("BEC: ", "")}</td></tr>
                </tbody>
              </table>
            </div>
            <button 
              onClick={() => { setSelectedEsc(e); setActiveTab('cockpit'); }}
              className={`btn-retro ${isActive ? 'active' : ''}`}
              style={{ width: '100%', fontSize: '11px' }}
            >
              {isActive ? "SELECTED" : "SELECT ESC"}
            </button>
          </div>
        );
      })}
    </div>
  );

  const renderBatteries = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
      {filteredBatteries.map(b => {
        const isActive = selectedBattery.id === b.id;
        return (
          <div key={b.id} style={cardStyle(isActive)}>
            <div>
              <div className="flex-between" style={{ fontSize: '10px', color: 'var(--color-amber-dim)' }}>
                <span>{b.brand}</span>
                <span>{b.chemistry || "LiPo"}</span>
              </div>
              <h3 style={titleStyle}>{b.name}</h3>
              <table className="retro-table" style={{ fontSize: '11px', marginBottom: '12px' }}>
                <tbody>
                  <tr><td className="label">Cell Count</td><td className="val">{b.cells}S ({(b.cells * 3.7).toFixed(1)}V)</td></tr>
                  <tr><td className="label">Capacity</td><td className="val">{b.capacity} mAh</td></tr>
                  <tr><td className="label">C-Rating</td><td className="val">{b.cRating} C</td></tr>
                  <tr><td className="label">Weight</td><td className="val">{b.weight} g</td></tr>
                </tbody>
              </table>
            </div>
            <button 
              onClick={() => { setSelectedBattery(b); setActiveTab('cockpit'); }}
              className={`btn-retro ${isActive ? 'active' : ''}`}
              style={{ width: '100%', fontSize: '11px' }}
            >
              {isActive ? "SELECTED" : "SELECT BATTERY"}
            </button>
          </div>
        );
      })}
    </div>
  );

  const renderPropellers = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
      {filteredPropellers.map(p => {
        const isActive = selectedPropeller.id === p.id;
        return (
          <div key={p.id} style={cardStyle(isActive)}>
            <div>
              <div className="flex-between" style={{ fontSize: '10px', color: 'var(--color-amber-dim)' }}>
                <span>APC Propellers</span>
                <span>{p.type}</span>
              </div>
              <h3 style={titleStyle}>{p.name}</h3>
              <table className="retro-table" style={{ fontSize: '11px', marginBottom: '12px' }}>
                <tbody>
                  <tr><td className="label">Diameter</td><td className="val">{p.diameter} in</td></tr>
                  <tr><td className="label">Pitch</td><td className="val">{p.pitch} in</td></tr>
                  <tr><td className="label">Load Coeff (kProp)</td><td className="val">{p.kProp}</td></tr>
                </tbody>
              </table>
            </div>
            <button 
              onClick={() => { setSelectedPropeller(p); setActiveTab('cockpit'); }}
              className={`btn-retro ${isActive ? 'active' : ''}`}
              style={{ width: '100%', fontSize: '11px' }}
            >
              {isActive ? "SELECTED" : "SELECT PROPELLER"}
            </button>
          </div>
        );
      })}
    </div>
  );

  const cardStyle = (isActive) => ({
    border: `2px solid ${isActive ? 'var(--color-amber)' : 'var(--color-panel-border)'}`,
    borderRadius: '4px',
    padding: '12px',
    backgroundColor: isActive ? 'rgba(229,157,50,0.05)' : '#16100d',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxShadow: isActive ? '0 0 10px var(--color-amber-glow)' : 'none'
  });

  const titleStyle = {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#fff',
    margin: '6px 0 10px 0',
    fontFamily: 'var(--font-mono)'
  };

  return (
    <div className="crt-effect" style={{ padding: '16px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="metal-panel" style={{ minHeight: '500px' }}>
        <div className="screw" style={{ top: '8px', left: '8px' }}></div>
        <div className="screw" style={{ top: '8px', right: '8px' }}></div>
        <div className="screw" style={{ bottom: '8px', left: '8px' }}></div>
        <div className="screw" style={{ bottom: '8px', right: '8px' }}></div>
        
        <div className="panel-header" style={{ justifyContent: 'space-between' }}>
          <span>★ COMPONENT COMPARTMENT ARCHIVES</span>
          
          <div style={{ display: 'flex', gap: '4px' }}>
            {['motors', 'props', 'batteries', 'escs'].map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveSubTab(tab)}
                className={`btn-retro ${activeSubTab === tab ? 'active' : ''}`}
                style={{ padding: '4px 10px', fontSize: '9px' }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        
        <div className="card-content" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Top Search Filter Bar */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#13171b', padding: '10px', borderRadius: '4px', border: '1px solid var(--color-panel-border)' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-amber-dim)', whiteSpace: 'nowrap' }}>🔍 SEARCH ARCHIVE:</span>
            <input 
              type="text"
              className="retro-input"
              style={{ flex: 1, fontSize: '11px', padding: '6px' }}
              placeholder={`Search ${activeSubTab} by name, brand, or spec (e.g. Dualsky, 380, Spektrum, Hobbywing)...`}
              value={componentSearch}
              onChange={(e) => setComponentSearch(e.target.value)}
            />
          </div>

          {activeSubTab === 'motors' && renderMotors()}
          {activeSubTab === 'escs' && renderESCs()}
          {activeSubTab === 'batteries' && renderBatteries()}
          {activeSubTab === 'props' && renderPropellers()}
        </div>
      </div>
    </div>
  );
}
