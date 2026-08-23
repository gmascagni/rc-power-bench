# ✈️ RC Power Bench Pro - .60 Class & Giant Scale Warbird Configurator

[![Live Site](https://img.shields.io/badge/Live_App-GitHub_Pages-brightgreen?style=for-the-badge&logo=github)](https://gmascagni.github.io/rc-power-bench/)
[![Vite](https://img.shields.io/badge/Built_With-Vite_React_19-blue?style=for-the-badge&logo=vite)](https://vitejs.dev/)

A physics-calibrated power system configurator, aerodynamic specification studio, and thermal safety bench designed for RC warbird pilots and scale model builders.

---

## 🌐 Live Application
Access the deployed app live: **[https://gmascagni.github.io/rc-power-bench/](https://gmascagni.github.io/rc-power-bench/)**

---

## ⚡ Key Features

* **🎛️ Interactive Cockpit Workbench**:
  * 8 integrated workbench widgets with photorealistic aluminum paneling, rivets, gunmetal styling, and CRT scanlines.
  * Analog CRT dial gauges for RPM, Amps, Volts, Watts, Efficiency, Motor Temp, and Thrust-to-Weight ($T:W$) ratio.
  * Dynamic flying weight tracking (Airframe Weight + Active LiPo Pack Weight).
  * Auto-Match propeller optimizer and dynamic voltage auto-tuning engine (auto-switches 6S $\rightarrow$ 8S $\rightarrow$ 10S $\rightarrow$ 12S when motors require higher cell counts).
  * Scale presets (Safe Scale, Scale Performance, Aggressive Scale, Extreme) tailored to .50-Class, .60-Class, and 50cc–70cc Giant Scale airframes.

* **🔬 Aerodynamic & Electrical Physics Engine**:
  * $P \propto \text{RPM}^3$ aerodynamic propeller power law and $I \propto V^2 \cdot \text{kV}^3$ current scaling.
  * Calibrated static thrust calculation (lbs & kg) taking into account diameter, pitch, blade count (2, 3, 4 blade), motor kV, and multi-engine configurations ($1\times, 2\times, 4\times$).
  * Pitch speed and level flight top speed estimations.
  * Flight runtime predictions based on battery capacity and average throttle consumption.

* **🛩️ Warbird Aircraft Registry & Custom Fleet**:
  * 39 pre-configured WWII Warbird airframes sorted alphabetically (A–Z).
  * Includes .50-Class, .60-Class, Multi-Engine Twins (B-25, Mosquito, P-38), and 50cc–70cc Giant Scale models (Ziroli, Legend Hobby, Seagull, Hangar 9, E-flite).
  * Built-in Custom Aircraft Builder wizard to add user models directly into the database.

* **📦 Comprehensive Component Database**:
  * **32 Brushless Motors** (BadAss, Dualsky, SunnySky, E-flite, Spektrum, Cobra, T-Motor, Hacker).
  * **15 Battery Packs** (3S to 12S LiPo, 2200mAh to 6000mAh).
  * **13 ESCs** (40A to 160A HV with Smart Telemetry).
  * **38 Propellers** sorted numerically by Diameter ($12" \rightarrow 26"$), Pitch ($6" \rightarrow 14"$), and Blades ($2, 3, 4\text{ Blade}$).

* **📐 Standalone Airplane Calculator**:
  * Calculates Wing Loading ($\text{oz/sq ft}$), 3D Cubic Wing Loading (WCL), Minimum Stall Speed ($\text{mph}$), and target Watts per lb.
  * Predicts Static Thrust (lbs/kg) and Thrust-to-Weight ($T:W$) ratios for custom airframes before adding them to the fleet.

* **🛡️ System Validator**:
  * Real-time thermal and electrical compatibility checks (ESC amp headroom, motor continuous current limit, motor thermal power limit, battery discharge C-rating, prop structural RPM limits).

---

## 🛠️ Project Structure

```
rc-power-bench/
├── docs/                      # Production distribution bundle (GitHub Pages root)
│   ├── assets/                # Optimized JS, CSS, and media bundles
│   └── index.html
├── src/
│   ├── assets/                # Photorealistic warbird, motor, ESC, battery, & propeller assets
│   ├── components/            # UI Components
│   │   ├── AircraftDatabase.jsx    # Aircraft registry & builder wizard
│   │   ├── AirplaneCalculator.jsx  # Aerodynamic specification studio
│   │   ├── CalculatorEngine.jsx    # Manual override power bench
│   │   ├── CockpitOverview.jsx     # Main 8-widget workbench dashboard
│   │   ├── ComponentDatabases.jsx  # Motors, Batteries, ESCs, & Propellers registries
│   │   ├── Gauges.jsx              # Analog CRT circular dials & bar gauges
│   │   ├── PowerCurveChart.jsx     # 0-100% throttle power curve chart
│   │   ├── SettingsOptions.jsx     # App preferences & reset options
│   │   └── ValidatorChecks.jsx     # Compatibility & safety checker
│   ├── data/
│   │   └── rcData.js               # Central database (Aircrafts, Motors, ESCs, Batteries, Props)
│   ├── utils/
│   │   └── calcEngine.js           # Aerodynamic & electrical physics engine
│   ├── App.css                     # Retro gunmetal, aluminum panel, & CRT styling
│   ├── App.jsx                     # Top navigation header & tab router
│   └── main.jsx                    # React 19 root entry
├── index.html
├── package.json
└── vite.config.js
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites
* **Node.js** (v18 or higher)
* **npm** (v9 or higher)

### Setup & Run

1. **Clone the repository**:
   ```bash
   git clone https://github.com/gmascagni/rc-power-bench.git
   cd rc-power-bench
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

4. **Build for production**:
   ```bash
   npm run build
   ```
   Compiles the production bundle into the `docs/` directory for GitHub Pages.

---

## 📄 License & Credits
Designed and built for scale RC warbird enthusiasts.  
Engineered with React 19, Vite, and Lucide Icons.
