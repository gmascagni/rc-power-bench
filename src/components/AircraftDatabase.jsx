import React from 'react';
import { aircrafts } from '../data/rcData';
import { Shield } from 'lucide-react';

export default function AircraftDatabase({ selectedAircraft, setSelectedAircraft, setActiveTab }) {
  return (
    <div className="crt-effect" style={{ padding: '16px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="metal-panel" style={{ minHeight: '500px' }}>
        <div className="screw" style={{ top: '8px', left: '8px' }}></div>
        <div className="screw" style={{ top: '8px', right: '8px' }}></div>
        <div className="screw" style={{ bottom: '8px', left: '8px' }}></div>
        <div className="screw" style={{ bottom: '8px', right: '8px' }}></div>
        
        <div className="panel-header">
          ★ WARBIRD DATA REGISTRY (.60-CLASS CLASSIC RELEASES)
        </div>
        
        <div className="card-content" style={{ padding: '16px' }}>
          <div style={{ marginBottom: '16px', color: 'var(--color-amber-dim)' }}>
            Browse and load pre-configured WWII warbirds from the military reference database.
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {aircrafts.map((ac) => {
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
                      <span style={{ fontSize: '10px', color: 'var(--color-amber-dim)', fontWeight: 'bold' }}>{ac.manufacturer}</span>
                      {isActive && <span style={{ color: 'var(--color-green)', fontSize: '10px', fontWeight: 'bold' }}>● ACTIVE</span>}
                    </div>
                    
                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', marginBottom: '8px', fontFamily: 'var(--font-serif)' }}>
                      {ac.name}
                    </h3>
                    
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.3', marginBottom: '12px' }}>
                      {ac.description}
                    </p>
                    
                    <table className="retro-table" style={{ fontSize: '11px', marginBottom: '12px' }}>
                      <tbody>
                        <tr>
                          <td className="label">Wingspan</td>
                          <td className="val">{ac.wingspan} in</td>
                        </tr>
                        <tr>
                          <td className="label">Wing Area</td>
                          <td className="val">{ac.wingArea} sq in</td>
                        </tr>
                        <tr>
                          <td className="label">Flying Weight</td>
                          <td className="val">{ac.flyingWeight.toFixed(1)} lbs</td>
                        </tr>
                        <tr>
                          <td className="label">Power Requirement</td>
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
          </div>
        </div>
      </div>
    </div>
  );
}
