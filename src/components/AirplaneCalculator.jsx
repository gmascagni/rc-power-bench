import React, { useState } from 'react';
import { aircrafts, motors, batteries, escs, propellers } from '../data/rcData';
import { getRecommendationsForAircraftSpecs } from '../utils/calcEngine';
import { AlertTriangle, Plane, Zap, Shield, HelpCircle } from 'lucide-react';

export default function AirplaneCalculator({
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
  const [modelName, setModelName] = useState("Custom Warbird .60");
  const [manufacturer, setManufacturer] = useState("Custom Builder");
  const [wingspan, setWingspan] = useState(63);
  const [length, setLength] = useState(56);
  const [flyingWeight, setFlyingWeight] = useState(8.5);
  const [wingArea, setWingArea] = useState(720);
  const [flightStyle, setFlightStyle] = useState("scale"); // 'scale' or 'aggressive'

  // Aerodynamic math calculations
  const weightLbs = Math.max(parseFloat(flyingWeight) || 8.5, 0.5);
  const weightOz = weightLbs * 16;
  const areaSqIn = Math.max(parseFloat(wingArea) || 720, 10);
  const areaSqFt = areaSqIn / 144;

  // Wing loading in oz / sq ft
  const wingLoading = weightOz / areaSqFt;

  // Cubic Wing Loading (WCL) = weight (oz) / (area in sq ft ^ 1.5)
  const wcl = weightOz / Math.pow(areaSqFt, 1.5);

  // Stall speed estimation (mph) = 3.7 * sqrt(wingLoading)
  const stallSpeedMph = 3.7 * Math.sqrt(wingLoading);

  // Power recommendation calculations
  const wattsPerLbMin = flightStyle === "aggressive" ? 180 : 120;
  const wattsPerLbMax = flightStyle === "aggressive" ? 220 : 150;
  const minWatts = Math.round(weightLbs * wattsPerLbMin);
  const maxWatts = Math.round(weightLbs * wattsPerLbMax);

  // Wing loading classification
  let loadingClass = "Scale Warbird";
  let loadingColor = "var(--color-amber)";
  if (wingLoading < 15) {
    loadingClass = "Park Flyer / Trainer";
    loadingColor = "var(--color-green)";
  } else if (wingLoading < 22) {
    loadingClass = "Sport Model";
    loadingColor = "var(--color-cyan)";
  } else if (wingLoading > 32) {
    loadingClass = "Heavy Scale Warbird";
    loadingColor = "var(--color-red)";
  }

  // WCL Classification
  let wclCategory = "Scale Warbird (Scale In-Flight Inertia)";
  if (wcl < 7) wclCategory = "Glider / Light Park Flyer";
  else if (wcl < 10) wclCategory = "Sport Aerobatic Aircraft";
  else if (wcl > 15) wclCategory = "High-Speed Racer / Jet";

  // Component Recommendations
  const recs = getRecommendationsForAircraftSpecs({
    wingspan,
    length,
    weight: flyingWeight,
    wingArea,
    motors,
    batteries,
    escs,
    propellers
  });

  const handleAddAndLoad = () => {
    const newPlane = {
      id: `custom-plane-${Date.now()}`,
      name: `[USER INPUT MODEL] ${modelName.toUpperCase()}`,
      class: weightLbs >= 7.0 ? "60-CLASS" : "50-CLASS",
      wingspan: parseFloat(wingspan) || 63,
      length: parseFloat(length) || 56,
      wingArea: parseFloat(wingArea) || 720,
      emptyWeight: Math.max(weightLbs - 1.1, 1.0),
      flyingWeight: weightLbs,
      powerRangeMin: minWatts,
      powerRangeMax: maxWatts,
      manufacturer: manufacturer || "User Custom Model",
      image: "p51.jpg",
      isUserInputModel: true,
      suggestedCg: "Scale CG per builder manual",
      description: `Custom user-input model created via Airplane Calculator: ${modelName}. ${wingspan}" Wingspan, ${length}" Length, ${flyingWeight} lbs Flying Weight.`,
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

    if (setSelectedAircraft) setSelectedAircraft(newPlane);
    if (recs.matchingMotor && setSelectedMotor) setSelectedMotor(recs.matchingMotor);
    if (recs.matchingBattery && setSelectedBattery) setSelectedBattery(recs.matchingBattery);
    if (recs.matchingEsc && setSelectedEsc) setSelectedEsc(recs.matchingEsc);
    if (recs.matchingProp && setSelectedPropeller) setSelectedPropeller(recs.matchingProp);
    if (setThrottle) setThrottle(100);
    if (setActiveTab) setActiveTab('cockpit');
  };

  return (
    <div className="crt-effect" style={{ padding: '16px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="metal-panel">
        <div className="screw" style={{ top: '8px', left: '8px' }}></div>
        <div className="screw" style={{ top: '8px', right: '8px' }}></div>
        <div className="screw" style={{ bottom: '8px', left: '8px' }}></div>
        <div className="screw" style={{ bottom: '8px', right: '8px' }}></div>

        <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>★ AIRPLANE CALCULATOR (AERODYNAMIC & AIRFRAME SPECIFICATION STUDIO)</div>
          <span style={{ fontSize: '10px', color: 'var(--color-amber-dim)' }}>STANDALONE AIRFRAME ENGINE</span>
        </div>

        <div className="card-content" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ color: 'var(--color-amber-dim)', fontSize: '11px', lineHeight: '1.4' }}>
            Calculate wing loading, 3D cubic wing loading (WCL), stall speed estimates, target power ratios, and auto-recommend matching motors, batteries, ESCs, and propellers for any custom airframe.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            
            {/* Input Controls Card */}
            <div style={{ background: '#13171c', border: '1px solid var(--color-panel-border)', borderRadius: '4px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#ffc97a', borderBottom: '1px solid var(--color-panel-border)', paddingBottom: '6px' }}>
                ✈️ AIRFRAME PARAMETERS & SPECS
              </div>

              <div>
                <label style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--color-amber-dim)' }}>MODEL NAME</label>
                <input type="text" className="retro-input" style={{ width: '100%', fontSize: '11px' }} value={modelName} onChange={(e) => setModelName(e.target.value)} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--color-amber-dim)' }}>MANUFACTURER</label>
                  <input type="text" className="retro-input" style={{ width: '100%', fontSize: '11px' }} value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--color-amber-dim)' }}>FLYING WEIGHT (LBS)</label>
                  <input type="number" step="0.1" className="retro-input" style={{ width: '100%', fontSize: '11px' }} value={flyingWeight} onChange={(e) => setFlyingWeight(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--color-amber-dim)' }}>WINGSPAN (INCHES)</label>
                  <input type="number" className="retro-input" style={{ width: '100%', fontSize: '11px' }} value={wingspan} onChange={(e) => setWingspan(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--color-amber-dim)' }}>FUSE LENGTH (INCHES)</label>
                  <input type="number" className="retro-input" style={{ width: '100%', fontSize: '11px' }} value={length} onChange={(e) => setLength(e.target.value)} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--color-amber-dim)' }}>WING AREA (SQ INCHES)</label>
                <input type="number" className="retro-input" style={{ width: '100%', fontSize: '11px' }} value={wingArea} onChange={(e) => setWingArea(e.target.value)} />
              </div>

              <div>
                <label style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--color-amber-dim)' }}>TARGET FLIGHT PERFORMANCE PROFILE</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '4px' }}>
                  <button 
                    onClick={() => setFlightStyle("scale")} 
                    className={`btn-retro ${flightStyle === "scale" ? 'active' : ''}`}
                    style={{ fontSize: '10px', padding: '6px' }}
                  >
                    ✈️ SCALE CRUISE (120W/lb)
                  </button>
                  <button 
                    onClick={() => setFlightStyle("aggressive")} 
                    className={`btn-retro ${flightStyle === "aggressive" ? 'active' : ''}`}
                    style={{ fontSize: '10px', padding: '6px' }}
                  >
                    ⚡ HIGH SPEED (200W/lb)
                  </button>
                </div>
              </div>
            </div>

            {/* Aerodynamic Telemetry Output Card */}
            <div style={{ background: '#13171c', border: '1px solid var(--color-panel-border)', borderRadius: '4px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-green)', borderBottom: '1px solid var(--color-panel-border)', paddingBottom: '6px' }}>
                📊 AERODYNAMIC TELEMETRY & FLIGHT MATRIX
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ padding: '8px', background: '#1a2027', borderRadius: '4px', border: '1px solid var(--color-panel-border)' }}>
                  <div style={{ fontSize: '9px', color: 'var(--color-amber-dim)' }}>WING LOADING</div>
                  <div style={{ fontSize: '15px', fontWeight: 'bold', color: loadingColor, fontFamily: 'var(--font-mono)' }}>{wingLoading.toFixed(1)} oz/sq ft</div>
                  <div style={{ fontSize: '8.5px', color: 'rgba(255,255,255,0.6)' }}>{loadingClass}</div>
                </div>

                <div style={{ padding: '8px', background: '#1a2027', borderRadius: '4px', border: '1px solid var(--color-panel-border)' }}>
                  <div style={{ fontSize: '9px', color: 'var(--color-amber-dim)' }}>CUBIC WING LOADING (WCL)</div>
                  <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#ffc97a', fontFamily: 'var(--font-mono)' }}>{wcl.toFixed(1)} WCL</div>
                  <div style={{ fontSize: '8.5px', color: 'rgba(255,255,255,0.6)' }}>{wclCategory}</div>
                </div>

                <div style={{ padding: '8px', background: '#1a2027', borderRadius: '4px', border: '1px solid var(--color-panel-border)' }}>
                  <div style={{ fontSize: '9px', color: 'var(--color-amber-dim)' }}>ESTIMATED STALL SPEED</div>
                  <div style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--color-red)', fontFamily: 'var(--font-mono)' }}>{stallSpeedMph.toFixed(1)} mph</div>
                  <div style={{ fontSize: '8.5px', color: 'rgba(255,255,255,0.6)' }}>Minimum Level Airspeed</div>
                </div>

                <div style={{ padding: '8px', background: '#1a2027', borderRadius: '4px', border: '1px solid var(--color-panel-border)' }}>
                  <div style={{ fontSize: '9px', color: 'var(--color-amber-dim)' }}>POWER REQUIREMENT</div>
                  <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', fontFamily: 'var(--font-mono)' }}>{minWatts}W - {maxWatts}W</div>
                  <div style={{ fontSize: '8.5px', color: 'rgba(255,255,255,0.6)' }}>{wattsPerLbMin}W - {wattsPerLbMax}W per lb</div>
                </div>
              </div>

              {/* Component Match Summary */}
              <div style={{ padding: '10px', background: 'rgba(255, 179, 71, 0.05)', borderRadius: '4px', border: '1px solid #ffb347' }}>
                <div style={{ fontSize: '10.5px', fontWeight: 'bold', color: 'var(--color-amber)', marginBottom: '4px' }}>
                  🏆 RECOMMENDED POWER PACKAGE MATCH
                </div>
                <div style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <div>MOTOR: <strong style={{ color: '#ffc97a' }}>{recs.matchingMotor ? recs.matchingMotor.name : '-'}</strong></div>
                  <div>BATTERY: <strong style={{ color: '#fff' }}>{recs.matchingBattery ? recs.matchingBattery.name : '-'}</strong></div>
                  <div>PROPELLER: <strong style={{ color: '#63b3ed' }}>{recs.matchingProp ? recs.matchingProp.name : '-'}</strong></div>
                  <div>ESC: <strong style={{ color: 'var(--color-red)' }}>{recs.matchingEsc ? recs.matchingEsc.name : '-'}</strong></div>
                </div>
              </div>

              {/* Disclaimer */}
              <div style={{ backgroundColor: 'rgba(255, 179, 71, 0.1)', border: '1px solid #ffb347', borderRadius: '4px', padding: '6px 8px', fontSize: '9px', color: 'var(--color-amber)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={14} style={{ flexShrink: 0, color: '#ffb347' }} />
                <span>DISCLAIMER: USER INPUT MODEL - Calculations based on user-entered airframe parameters.</span>
              </div>

              <button 
                onClick={handleAddAndLoad}
                className="btn-retro btn-red-launcher"
                style={{ width: '100%', fontSize: '11px', padding: '10px', justifyContent: 'center', fontWeight: 'bold' }}
              >
                ➕ SAVE MODEL TO AIRCRAFT DATABASE & LOAD INTO COCKPIT
              </button>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
