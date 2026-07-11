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

  React.useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const renderMotors = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
      {motors.map(m => {
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
                  {m.isGasOrGlow ? (
                    <>
                      <tr><td className="label">Displacement</td><td className="val">{m.displacement}</td></tr>
                      <tr><td className="label">Horsepower</td><td className="val">{m.horsepower} HP</td></tr>
                      <tr><td className="label">Max RPM</td><td className="val">{m.maxRpm} RPM</td></tr>
                      <tr><td className="label">Weight</td><td className="val">{m.weight} g</td></tr>
                      <tr><td className="label">Fuel System</td><td className="val">{m.voltageSupported}</td></tr>
                    </>
                  ) : (
                    <>
                      <tr><td className="label">KV Rating</td><td className="val">{m.kv} KV</td></tr>
                      <tr><td className="label">Weight</td><td className="val">{m.weight} g</td></tr>
                      <tr><td className="label">Max Current</td><td className="val">{m.maxCurrent} A</td></tr>
                      <tr><td className="label">Max Power</td><td className="val">{m.maxPower} W</td></tr>
                      <tr><td className="label">Internal Resistance</td><td className="val">{m.internalResistance} Ω</td></tr>
                    </>
                  )}
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
      {escs.map(e => {
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
      {batteries.map(b => {
        const isActive = selectedBattery.id === b.id;
        return (
          <div key={b.id} style={cardStyle(isActive)}>
            <div>
              <div className="flex-between" style={{ fontSize: '10px', color: 'var(--color-amber-dim)' }}>
                <span>{b.brand}</span>
                <span>LIPO</span>
              </div>
              <h3 style={titleStyle}>{b.name}</h3>
              <table className="retro-table" style={{ fontSize: '11px', marginBottom: '12px' }}>
                <tbody>
                  <tr><td className="label">Cells count</td><td className="val">{b.cells}S ({b.cells * 3.7}V Nominal)</td></tr>
                  <tr><td className="label">Capacity</td><td className="val">{b.capacity} mAh</td></tr>
                  <tr><td className="label">Discharge Limit</td><td className="val">{b.cRating} C</td></tr>
                  <tr><td className="label">Weight</td><td className="val">{b.weight} g</td></tr>
                  <tr><td className="label">IR (Per Cell)</td><td className="val">{b.internalResistance} Ω</td></tr>
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
      {propellers.map(p => {
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
        
        <div className="card-content" style={{ padding: '16px' }}>
          {activeSubTab === 'motors' && renderMotors()}
          {activeSubTab === 'escs' && renderESCs()}
          {activeSubTab === 'batteries' && renderBatteries()}
          {activeSubTab === 'props' && renderPropellers()}
        </div>
      </div>
    </div>
  );
}
