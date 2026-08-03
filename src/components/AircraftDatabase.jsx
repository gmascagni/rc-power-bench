import React, { useState } from 'react';
import { aircrafts, motors, batteries, escs, propellers } from '../data/rcData';
import { getRecommendationsForAircraftSpecs } from '../utils/calcEngine';

export default function AircraftDatabase({ 
  selectedAircraft, 
  setSelectedAircraft, 
  setSelectedMotor,
  setSelectedEsc,
  setSelectedBattery,
  setSelectedPropeller,
  setThrottle,
  setActiveTab,
  customFleet = [],
  setCustomFleet = () => {}
}) {
  const allAircrafts = [...aircrafts, ...customFleet];

  // Inline Custom Aircraft Card Form State
  const [newBrand, setNewBrand] = useState("Custom Builder");
  const [newName, setNewName] = useState("Custom Warbird .60");
  const [newWingspan, setNewWingspan] = useState(63);
  const [newLength, setNewLength] = useState(56);
  const [newWeight, setNewWeight] = useState(8.5);
  const [newWingArea, setNewWingArea] = useState(720);
  const [dbSearchQuery, setDbSearchQuery] = useState("");

  const filteredAircrafts = allAircrafts.filter(ac =>
    ac.name.toLowerCase().includes(dbSearchQuery.toLowerCase()) ||
    ac.manufacturer.toLowerCase().includes(dbSearchQuery.toLowerCase()) ||
    ac.class.toLowerCase().includes(dbSearchQuery.toLowerCase())
  );

  // Live auto-power requirement calculations
  const weightNum = Math.max(parseFloat(newWeight) || 8.5, 0.5);
  const minWatts = Math.round(weightNum * 120);
  const maxWatts = Math.round(weightNum * 200);

  const handleAddCustomModel = () => {
    const recs = getRecommendationsForAircraftSpecs({
      wingspan: newWingspan,
      length: newLength,
      weight: newWeight,
      wingArea: newWingArea,
      motors,
      batteries,
      escs,
      propellers
    });

    const newPlane = {
      id: `custom-plane-${Date.now()}`,
      name: `[USER INPUT MODEL] ${newName.toUpperCase()}`,
      class: weightNum >= 7.0 ? "60-CLASS" : "50-CLASS",
      wingspan: parseFloat(newWingspan) || 63,
      length: parseFloat(newLength) || 56,
      wingArea: parseFloat(newWingArea) || 720,
      emptyWeight: Math.max(weightNum - 1.1, 1.0),
      flyingWeight: weightNum,
      powerRangeMin: minWatts,
      powerRangeMax: maxWatts,
      manufacturer: newBrand || "User Input Model",
      image: "p51.jpg",
      isUserInputModel: true,
      suggestedCg: "Scale CG per builder manual",
      description: `Custom user-input model: ${newName}. ${newWingspan}" Wingspan, ${newLength}" Fuselage, ${newWeight} lbs Flying Weight.`,
      stockSetup: {
        motorId: recs.matchingMotor ? recs.matchingMotor.id : motors[0].id,
        batteryId: recs.matchingBattery ? recs.matchingBattery.id : batteries[0].id,
        propellerId: recs.matchingProp ? recs.matchingProp.id : propellers[0].id,
        escId: recs.matchingEsc ? recs.matchingEsc.id : escs[0].id
      }
    };

    const updatedFleet = [...customFleet, newPlane];
    setCustomFleet(updatedFleet);
    localStorage.setItem('rc_custom_fleet', JSON.stringify(updatedFleet));

    // Load into cockpit immediately
    setSelectedAircraft(newPlane);
    if (recs.matchingMotor && setSelectedMotor) setSelectedMotor(recs.matchingMotor);
    if (recs.matchingBattery && setSelectedBattery) setSelectedBattery(recs.matchingBattery);
    if (recs.matchingEsc && setSelectedEsc) setSelectedEsc(recs.matchingEsc);
    if (recs.matchingProp && setSelectedPropeller) setSelectedPropeller(recs.matchingProp);
    if (setThrottle) setThrottle(100);
    setActiveTab('cockpit');
  };

  return (
    <div className="crt-effect" style={{ padding: '16px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="metal-panel" style={{ minHeight: '500px' }}>
        <div className="screw" style={{ top: '8px', left: '8px' }}></div>
        <div className="screw" style={{ top: '8px', right: '8px' }}></div>
        <div className="screw" style={{ bottom: '8px', left: '8px' }}></div>
        <div className="screw" style={{ bottom: '8px', right: '8px' }}></div>
        
        <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>★ WARBIRD DATA REGISTRY (.60-CLASS & CUSTOM FLEET)</div>
          <span style={{ fontSize: '10px', color: 'var(--color-amber-dim)' }}>{allAircrafts.length} MODELS REGISTERED</span>
        </div>
        
        <div className="card-content" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Top Search & Filter Bar */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#13171b', padding: '10px', borderRadius: '4px', border: '1px solid var(--color-panel-border)' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-amber-dim)', whiteSpace: 'nowrap' }}>🔍 SEARCH REGISTRY:</span>
            <input 
              type="text"
              className="retro-input"
              style={{ flex: 1, fontSize: '11px', padding: '6px' }}
              placeholder="Type plane model or manufacturer (e.g. Mustang, Corsair, P-40, Hangar 9, Top Flite)..."
              value={dbSearchQuery}
              onChange={(e) => setDbSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
            />
            <button 
              className="btn-retro"
              style={{ fontSize: '10px', padding: '6px 12px', borderColor: 'var(--color-amber)', color: 'var(--color-amber)', fontWeight: 'bold' }}
            >
              🔍 SEARCH
            </button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            
            {/* 1. Existing Aircraft Cards */}
            {filteredAircrafts.map((ac) => {
              const isActive = selectedAircraft.id === ac.id;
              
              return (
                <div 
                  key={ac.id} 
                  style={{
                    border: `2px solid ${isActive ? 'var(--color-amber)' : 'var(--color-panel-border)'}`,
                    borderRadius: '4px',
                    padding: '12px',
                    backgroundColor: isActive ? 'rgba(229,157,50,0.05)' : '#16100d',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: isActive ? '0 0 12px var(--color-amber-glow)' : 'none'
                  }}
                >
                  <div>
                    <div className="flex-between" style={{ marginBottom: '8px' }}>
                      <span style={{ fontSize: '10px', color: ac.isUserInputModel ? 'var(--color-amber)' : 'var(--color-amber-dim)', fontWeight: 'bold' }}>
                        {ac.isUserInputModel ? `[USER INPUT MODEL] ${ac.manufacturer}` : ac.manufacturer}
                      </span>
                      {isActive && <span style={{ color: 'var(--color-green)', fontSize: '10px', fontWeight: 'bold' }}>● ACTIVE</span>}
                    </div>
                    
                    <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', marginBottom: '8px', fontFamily: 'var(--font-serif)' }}>
                      {ac.name}
                    </h3>
                    
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.3', marginBottom: '12px' }}>
                      {ac.description}
                    </p>
                    
                    <table className="retro-table" style={{ fontSize: '11px', marginBottom: '12px' }}>
                      <tbody>
                        <tr>
                          <td className="label">WINGSPAN</td>
                          <td className="val">{ac.wingspan} in</td>
                        </tr>
                        <tr>
                          <td className="label">WING AREA</td>
                          <td className="val">{ac.wingArea} sq in</td>
                        </tr>
                        <tr>
                          <td className="label">FLYING WEIGHT</td>
                          <td className="val">{ac.flyingWeight.toFixed(1)} lbs</td>
                        </tr>
                        <tr>
                          <td className="label">POWER REQUIREMENT</td>
                          <td className="val">{ac.powerRangeMin} - {ac.powerRangeMax} W</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <button 
                    onClick={() => {
                      setSelectedAircraft(ac);
                      setActiveTab('cockpit');
                    }}
                    className={`btn-retro ${isActive ? 'active' : ''}`}
                    style={{ width: '100%', fontSize: '11px' }}
                  >
                    {isActive ? "LOADED IN COCKPIT" : "LOAD INTO COCKPIT"}
                  </button>
                </div>
              );
            })}

            {/* 2. Interactive NEW CUSTOM MODEL Card (Matching Screenshot!) */}
            <div 
              style={{
                border: '2px dashed var(--color-cyan)',
                borderRadius: '4px',
                padding: '12px',
                backgroundColor: '#121922',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 0 10px rgba(99, 179, 237, 0.15)'
              }}
            >
              <div>
                <div className="flex-between" style={{ marginBottom: '8px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--color-cyan)', fontWeight: 'bold' }}>➕ ADD NEW AIRCRAFT MODEL</span>
                  <span style={{ fontSize: '9px', color: 'rgba(99, 179, 237, 0.7)', fontWeight: 'bold' }}>[USER INPUT MODEL]</span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
                  <input 
                    type="text" 
                    className="retro-input" 
                    style={{ width: '100%', fontSize: '10px', padding: '4px' }}
                    placeholder="Manufacturer / Brand (e.g. Hangar 9)"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                  />
                  <input 
                    type="text" 
                    className="retro-input" 
                    style={{ width: '100%', fontSize: '12px', fontWeight: 'bold', padding: '4px', color: '#ffc97a' }}
                    placeholder="Model Name (e.g. Custom P-51D Mustang)"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
                
                <div style={{ marginBottom: '10px' }}>
                  <table className="retro-table" style={{ fontSize: '11px', width: '100%' }}>
                    <tbody>
                      <tr>
                        <td className="label" style={{ verticalAlign: 'middle' }}>WINGSPAN</td>
                        <td className="val" style={{ textAlign: 'right' }}>
                          <input 
                            type="number" 
                            className="retro-input" 
                            style={{ width: '65px', fontSize: '11px', textAlign: 'right', padding: '2px 4px' }}
                            value={newWingspan}
                            onChange={(e) => setNewWingspan(e.target.value)}
                          /> in
                        </td>
                      </tr>
                      <tr>
                        <td className="label" style={{ verticalAlign: 'middle' }}>WING AREA</td>
                        <td className="val" style={{ textAlign: 'right' }}>
                          <input 
                            type="number" 
                            className="retro-input" 
                            style={{ width: '65px', fontSize: '11px', textAlign: 'right', padding: '2px 4px' }}
                            value={newWingArea}
                            onChange={(e) => setNewWingArea(e.target.value)}
                          /> sq in
                        </td>
                      </tr>
                      <tr>
                        <td className="label" style={{ verticalAlign: 'middle' }}>FLYING WEIGHT</td>
                        <td className="val" style={{ textAlign: 'right' }}>
                          <input 
                            type="number" 
                            step="0.1"
                            className="retro-input" 
                            style={{ width: '65px', fontSize: '11px', textAlign: 'right', padding: '2px 4px' }}
                            value={newWeight}
                            onChange={(e) => setNewWeight(e.target.value)}
                          /> lbs
                        </td>
                      </tr>
                      <tr>
                        <td className="label">POWER REQUIREMENT</td>
                        <td className="val" style={{ color: 'var(--color-green)', fontWeight: 'bold' }}>{minWatts} - {maxWatts} W</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <button 
                onClick={handleAddCustomModel}
                className="btn-retro btn-red-launcher"
                style={{ width: '100%', fontSize: '12px', padding: '10px', height: '42px', justifyContent: 'center', fontWeight: 'bold' }}
              >
                ➕ ADD MODEL & LOAD INTO COCKPIT
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
