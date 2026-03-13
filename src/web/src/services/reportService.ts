import type {
  DoubleWishboneHardpoints,
  VehicleParams,
  GeometryResult,
  DynamicsResult,
  AntiGeometryResult,
  CamberCurvePoint,
  RollCenterPoint,
  BumpSteerPoint,
  MotionRatioPoint,
  WheelRatePoint,
  SteeringResult,
} from '../types/suspension';
import type { TargetRange, TargetKey } from '../stores/targetStore';
import { TARGET_DEFINITIONS, evaluateTarget } from '../stores/targetStore';

interface ReportData {
  name: string;
  notes: string;
  hardpoints: DoubleWishboneHardpoints;
  vehicleParams: VehicleParams;
  geometry: GeometryResult | null;
  dynamics: DynamicsResult | null;
  antiGeometry: AntiGeometryResult | null;
  steering: SteeringResult | null;
  camberCurve: CamberCurvePoint[];
  rollCenterCurve: RollCenterPoint[];
  bumpSteerCurve: BumpSteerPoint[];
  motionRatioCurve: MotionRatioPoint[];
  wheelRateCurve: WheelRatePoint[];
  targets: Record<TargetKey, TargetRange>;
}

function statusDot(status: string): string {
  const colors: Record<string, string> = {
    pass: '#22c55e',
    warn: '#eab308',
    fail: '#ef4444',
  };
  if (!colors[status]) return '';
  return `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${colors[status]};margin-right:6px;"></span>`;
}

function getTargetStatus(key: TargetKey, value: number, targets: Record<TargetKey, TargetRange>): string {
  const target = targets[key];
  if (!target || !target.enabled) return '';
  const status = evaluateTarget(target, value);
  return status === 'none' ? '' : statusDot(status);
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function generateReportHtml(data: ReportData): string {
  const {
    name, notes, hardpoints, vehicleParams,
    geometry, dynamics, antiGeometry, steering,
    camberCurve, rollCenterCurve, bumpSteerCurve,
    motionRatioCurve, wheelRateCurve,
    targets,
  } = data;

  const rows = (items: [string, string, string, TargetKey?][]) =>
    items.map(([label, value, unit, targetKey]) => {
      const dot = targetKey && geometry ? getTargetStatus(targetKey, parseFloat(value), targets) : '';
      return `<tr><td>${dot}${label}</td><td class="val">${value}</td><td class="unit">${unit}</td></tr>`;
    }).join('\n');

  const hardpointRows = (pts: [string, { x: number; y: number; z: number }][]) =>
    pts.map(([label, p]) =>
      `<tr><td>${label}</td><td class="val">${p.x.toFixed(1)}</td><td class="val">${p.y.toFixed(1)}</td><td class="val">${p.z.toFixed(1)}</td></tr>`
    ).join('\n');

  const curveRows = (pts: { col1: number; col2: number }[]) =>
    pts.map((p) =>
      `<tr><td class="val">${p.col1.toFixed(2)}</td><td class="val">${p.col2.toFixed(4)}</td></tr>`
    ).join('\n');

  // Count target compliance
  const enabledTargets = TARGET_DEFINITIONS.filter((d) => targets[d.key]?.enabled);
  let complianceSummary = '';
  if (enabledTargets.length > 0) {
    const getVal = (key: TargetKey): number | null => {
      if (!geometry && !dynamics && !antiGeometry) return null;
      const map: Partial<Record<TargetKey, number>> = {};
      if (geometry) {
        map.rollCenterHeight = geometry.rollCenterHeight;
        map.kpiAngle = geometry.kingpinInclinationDegrees;
        map.casterAngle = geometry.casterAngleDegrees;
        map.scrubRadius = geometry.scrubRadius;
        map.mechanicalTrail = geometry.mechanicalTrail;
      }
      if (dynamics) {
        map.motionRatio = dynamics.motionRatio;
        map.wheelRate = dynamics.wheelRate;
        map.naturalFrequency = dynamics.naturalFrequency;
        map.dampingRatio = dynamics.dampingRatio;
      }
      if (antiGeometry) {
        map.antiDive = antiGeometry.antiDivePercent;
        map.antiSquat = antiGeometry.antiSquatPercent;
      }
      return map[key] ?? null;
    };

    const statusRows = enabledTargets.map((d) => {
      const val = getVal(d.key);
      if (val === null) return '';
      const status = evaluateTarget(targets[d.key], val);
      return `<tr><td>${statusDot(status)}${d.label}</td><td class="val">${val.toFixed(2)}</td><td class="val">${targets[d.key].min} - ${targets[d.key].max}</td><td class="unit">${d.unit}</td></tr>`;
    }).join('\n');

    complianceSummary = `
      <h2>Target Compliance</h2>
      <table>
        <tr><th>Parameter</th><th>Actual</th><th>Target Range</th><th>Unit</th></tr>
        ${statusRows}
      </table>`;
  }

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Suspension Report - ${name}</title>
<style>
  @media print {
    body { margin: 0; }
    .no-print { display: none; }
    @page { margin: 15mm; }
  }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 11px;
    line-height: 1.4;
    color: #1a1a1a;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }
  h1 { font-size: 20px; margin-bottom: 4px; color: #1a1a2e; }
  h2 { font-size: 14px; margin-top: 20px; margin-bottom: 8px; color: #1a1a2e; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
  .meta { color: #666; font-size: 10px; margin-bottom: 16px; }
  .notes { background: #f8f8f8; border-left: 3px solid #3498db; padding: 8px 12px; margin-bottom: 16px; font-style: italic; white-space: pre-wrap; }
  table { border-collapse: collapse; width: 100%; margin-bottom: 12px; }
  th, td { text-align: left; padding: 3px 8px; border-bottom: 1px solid #eee; }
  th { background: #f4f4f4; font-weight: 600; font-size: 10px; color: #555; text-transform: uppercase; }
  .val { text-align: right; font-family: 'SF Mono', Monaco, monospace; }
  .unit { color: #888; width: 50px; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .print-btn {
    position: fixed; top: 10px; right: 10px;
    padding: 8px 16px; background: #3498db; color: white; border: none;
    border-radius: 4px; cursor: pointer; font-size: 12px;
  }
  .print-btn:hover { background: #2980b9; }
</style>
</head>
<body>
<button class="print-btn no-print" onclick="window.print()">Print / Save PDF</button>

<h1>${name}</h1>
<div class="meta">Generated: ${formatDate()} | Coordinate System: SAE J670 (mm, deg)</div>

${notes ? `<div class="notes">${notes}</div>` : ''}

${complianceSummary}

<div class="two-col">
<div>
<h2>Vehicle Parameters</h2>
<table>
  <tr><th>Parameter</th><th>Value</th><th>Unit</th></tr>
  ${rows([
    ['Track Width', vehicleParams.trackWidth.toFixed(0), 'mm'],
    ['Wheelbase', vehicleParams.wheelbase.toFixed(0), 'mm'],
    ['Sprung Mass', vehicleParams.sprungMass.toFixed(0), 'kg'],
    ['Unsprung Mass', vehicleParams.unsprungMass.toFixed(0), 'kg'],
    ['Spring Rate', vehicleParams.springRate.toFixed(0), 'N/mm'],
    ['Damping Coefficient', vehicleParams.dampingCoefficient.toFixed(0), 'Ns/m'],
    ['Ride Height', vehicleParams.rideHeight.toFixed(0), 'mm'],
    ['Tire Radius', vehicleParams.tireRadius.toFixed(0), 'mm'],
    ['CG Height', vehicleParams.cgHeight.toFixed(0), 'mm'],
    ['Front Brake Bias', (vehicleParams.frontBrakeProportion * 100).toFixed(0), '%'],
  ])}
</table>
</div>

<div>
${geometry ? `
<h2>Geometry Results</h2>
<table>
  <tr><th>Parameter</th><th>Value</th><th>Unit</th></tr>
  ${rows([
    ['Roll Center Height', geometry.rollCenterHeight.toFixed(2), 'mm', 'rollCenterHeight'],
    ['KPI Angle', geometry.kingpinInclinationDegrees.toFixed(3), 'deg', 'kpiAngle'],
    ['Caster Angle', geometry.casterAngleDegrees.toFixed(3), 'deg', 'casterAngle'],
    ['Scrub Radius', geometry.scrubRadius.toFixed(2), 'mm', 'scrubRadius'],
    ['Mechanical Trail', geometry.mechanicalTrail.toFixed(2), 'mm', 'mechanicalTrail'],
    ['Instant Center X', geometry.instantCenter.x.toFixed(2), 'mm'],
    ['Instant Center Y', geometry.instantCenter.y.toFixed(2), 'mm'],
    ['Instant Center Z', geometry.instantCenter.z.toFixed(2), 'mm'],
  ])}
</table>
` : ''}
</div>
</div>

${dynamics ? `
<h2>Dynamics Results</h2>
<table>
  <tr><th>Parameter</th><th>Value</th><th>Unit</th></tr>
  ${rows([
    ['Motion Ratio', dynamics.motionRatio.toFixed(4), '', 'motionRatio'],
    ['Wheel Rate', dynamics.wheelRate.toFixed(2), 'N/mm', 'wheelRate'],
    ['Natural Frequency', dynamics.naturalFrequency.toFixed(3), 'Hz', 'naturalFrequency'],
    ['Damping Ratio', dynamics.dampingRatio.toFixed(4), '', 'dampingRatio'],
    ['Critical Damping', dynamics.criticalDamping.toFixed(2), 'N\u00b7s/mm'],
  ])}
</table>
` : ''}

${antiGeometry ? `
<h2>Anti-Geometry</h2>
<table>
  <tr><th>Parameter</th><th>Value</th><th>Unit</th></tr>
  ${rows([
    ['Anti-Dive', antiGeometry.antiDivePercent.toFixed(2), '%', 'antiDive'],
    ['Anti-Squat', antiGeometry.antiSquatPercent.toFixed(2), '%', 'antiSquat'],
  ])}
</table>
` : ''}

<h2>Hardpoint Coordinates</h2>
<table>
  <tr><th>Point</th><th>X (mm)</th><th>Y (mm)</th><th>Z (mm)</th></tr>
  ${hardpointRows([
    ['Upper Wishbone Front Pivot', hardpoints.upperWishboneFrontPivot],
    ['Upper Wishbone Rear Pivot', hardpoints.upperWishboneRearPivot],
    ['Upper Ball Joint', hardpoints.upperBallJoint],
    ['Lower Wishbone Front Pivot', hardpoints.lowerWishboneFrontPivot],
    ['Lower Wishbone Rear Pivot', hardpoints.lowerWishboneRearPivot],
    ['Lower Ball Joint', hardpoints.lowerBallJoint],
    ['Tie Rod Inner', hardpoints.tieRodInner],
    ['Tie Rod Outer', hardpoints.tieRodOuter],
    ['Spring/Damper Lower', hardpoints.springDamperLower],
    ['Spring/Damper Upper', hardpoints.springDamperUpper],
    ['Pushrod Wheel End', hardpoints.pushrodWheelEnd],
    ['Pushrod Rocker End', hardpoints.pushrodRockerEnd],
    ['Wheel Center', hardpoints.wheelCenter],
    ['Contact Patch', hardpoints.contactPatch],
  ])}
</table>

<div class="two-col">
${camberCurve.length > 0 ? `
<div>
<h2>Camber Curve</h2>
<table>
  <tr><th>Travel (mm)</th><th>Camber (deg)</th></tr>
  ${curveRows(camberCurve.map((p) => ({ col1: p.wheelTravel, col2: p.camberAngleDegrees })))}
</table>
</div>
` : ''}

${rollCenterCurve.length > 0 ? `
<div>
<h2>Roll Center Migration</h2>
<table>
  <tr><th>Roll Angle (deg)</th><th>RC Height (mm)</th></tr>
  ${curveRows(rollCenterCurve.map((p) => ({ col1: p.rollAngleDegrees, col2: p.rollCenterHeight })))}
</table>
</div>
` : ''}
</div>

${bumpSteerCurve.length > 0 ? `
<h2>Bump Steer</h2>
<table>
  <tr><th>Travel (mm)</th><th>Toe Angle (deg)</th></tr>
  ${curveRows(bumpSteerCurve.map((p) => ({ col1: p.wheelTravel, col2: p.toeAngleDegrees })))}
</table>
` : ''}

<div class="two-col">
${motionRatioCurve.length > 0 ? `
<div>
<h2>Motion Ratio Curve</h2>
<table>
  <tr><th>Travel (mm)</th><th>Motion Ratio</th></tr>
  ${curveRows(motionRatioCurve.map((p) => ({ col1: p.wheelTravel, col2: p.motionRatio })))}
</table>
</div>
` : ''}

${wheelRateCurve.length > 0 ? `
<div>
<h2>Wheel Rate Curve</h2>
<table>
  <tr><th>Travel (mm)</th><th>Wheel Rate (N/mm)</th></tr>
  ${curveRows(wheelRateCurve.map((p) => ({ col1: p.wheelTravel, col2: p.wheelRate })))}
</table>
</div>
` : ''}
</div>

${steering?.ackermannCurve && steering.ackermannCurve.length > 0 ? `
<h2>Ackermann Geometry</h2>
<table>
  <tr><th>Steering Angle (deg)</th><th>Ackermann (%)</th></tr>
  ${curveRows(steering.ackermannCurve.map((p) => ({ col1: p.steeringAngleDegrees, col2: p.ackermannPercent })))}
</table>
` : ''}

</body>
</html>`;
}

export function openReport(html: string): void {
  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}
