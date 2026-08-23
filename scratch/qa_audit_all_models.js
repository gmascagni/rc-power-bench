import { aircrafts, motors, escs, batteries, propellers } from '../src/data/rcData.js';
import { calculateSpecs, getRecommendationsForAircraftSpecs } from '../src/utils/calcEngine.js';

console.log("=========================================================================");
console.log("   AUTOMATED QA AUDIT: WING LOADING & POWER PRESET REALISM TEST   ");
console.log("=========================================================================\n");

let failureCount = 0;
let warningCount = 0;

const presetTypes = ['scale', 'safe', 'aggressive', 'extreme'];

aircrafts.forEach((ac, idx) => {
  const ws = ac.wingspan || 63;
  const emptyWt = ac.emptyWeight || 7.0;
  const stockFlyingWt = ac.flyingWeight || 8.5;
  const wingAreaSqIn = ac.wingArea || 720;
  const areaSqFt = wingAreaSqIn / 144;

  console.log(`[MODEL ${idx + 1}/${aircrafts.length}] ${ac.name}`);
  console.log(`   Wingspan: ${ws}" | Class: ${ac.class || 'N/A'} | Stock Wt: ${stockFlyingWt} lbs | Wing Area: ${wingAreaSqIn} sq in`);

  presetTypes.forEach(type => {
    let targetMotor = null;
    let targetBattery = null;
    let targetEsc = null;
    let targetProp = null;

    if (type === 'scale' && ac.stockSetup) {
      targetMotor = motors.find(m => m.id === ac.stockSetup.motorId);
      targetBattery = batteries.find(b => b.id === ac.stockSetup.batteryId);
      targetEsc = escs.find(e => e.id === ac.stockSetup.escId);
      targetProp = propellers.find(p => p.id === ac.stockSetup.propellerId);
    } else {
      // Dynamic recommendation logic test
      const recs = getRecommendationsForAircraftSpecs({
        wingspan: ws,
        length: ac.length || 50,
        weight: stockFlyingWt,
        wingArea: wingAreaSqIn,
        motors, batteries, escs, propellers
      });

      targetMotor = recs.matchingMotor;
      targetBattery = recs.matchingBattery;
      targetEsc = recs.matchingEsc;
      targetProp = recs.matchingProp;

      if (type === 'extreme' && ws <= 50) {
        // Test if extreme on small foamie is capped to 4S max
        if (targetBattery.cells > 4) {
          console.error(`   ❌ FAIL [EXTREME]: 1.2m foamie ${ac.name} was assigned a ${targetBattery.cells}S battery! Must be <= 4S!`);
          failureCount++;
        }
      }
    }

    if (!targetMotor || !targetBattery || !targetEsc || !targetProp) return;

    const batWeightLbs = (targetBattery.weight || 0) / 453.59;
    const calcFlyingWeight = emptyWt + batWeightLbs;
    const weightOz = calcFlyingWeight * 16;
    const wingLoading = weightOz / areaSqFt;
    const wcl = weightOz / Math.pow(areaSqFt, 1.5);

    const specs = calculateSpecs({
      aircraft: { ...ac, flyingWeight: calcFlyingWeight },
      motor: targetMotor,
      esc: targetEsc,
      battery: targetBattery,
      propeller: targetProp,
      throttle: 100
    });

    const wattsPerLb = (specs.watts / calcFlyingWeight).toFixed(1);

    // Validation Rules
    let issue = null;
    if (ws <= 52 && targetBattery.cells > 4) {
      issue = `OVERSIZED BATTERY (${targetBattery.cells}S on ${ws}" airframe)`;
      failureCount++;
    } else if (ws <= 65 && targetBattery.cells > 8) {
      issue = `OVERSIZED BATTERY (${targetBattery.cells}S on ${ws}" airframe)`;
      failureCount++;
    } else if (wingLoading > 45) {
      issue = `EXCESSIVE WING LOADING (${wingLoading.toFixed(1)} oz/sq ft)`;
      failureCount++;
    } else if (wcl > 18) {
      issue = `EXCESSIVE CUBIC WING LOADING (${wcl.toFixed(1)} WCL)`;
      failureCount++;
    } else if (specs.motorLoad > 115) {
      issue = `MOTOR OVERLOAD (${specs.motorLoad}%)`;
      warningCount++;
    }

    if (issue) {
      console.log(`   ⚠️ [${type.toUpperCase()}] ${targetBattery.cells}S ${targetBattery.name} | Wt: ${calcFlyingWeight.toFixed(2)} lbs | WL: ${wingLoading.toFixed(1)} oz/sqft | WCL: ${wcl.toFixed(1)} | ${wattsPerLb} W/lb | ${issue}`);
    }
  });

  console.log("");
});

console.log("=========================================================================");
console.log(`AUDIT COMPLETE: ${failureCount} Failures, ${warningCount} Warnings across ${aircrafts.length} models.`);
console.log("=========================================================================");
