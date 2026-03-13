import type {
  GeometryResult,
  DynamicsResult,
  AntiGeometryResult,
  CamberCurvePoint,
  RollCenterPoint,
  BumpSteerPoint,
  MotionRatioPoint,
  WheelRatePoint,
  InstantCenterPoint,
  SteeringResult,
} from '../types/suspension';

function toCsvRow(cells: (string | number)[]): string {
  return cells.map((c) => (typeof c === 'string' && c.includes(',') ? `"${c}"` : String(c))).join(',');
}

export function exportResultsCsv(data: {
  geometry: GeometryResult | null;
  dynamics: DynamicsResult | null;
  antiGeometry: AntiGeometryResult | null;
  steering: SteeringResult | null;
  camberCurve: CamberCurvePoint[];
  rollCenterCurve: RollCenterPoint[];
  bumpSteerCurve: BumpSteerPoint[];
  motionRatioCurve?: MotionRatioPoint[];
  wheelRateCurve?: WheelRatePoint[];
  instantCenterCurve?: InstantCenterPoint[];
}): string {
  const lines: string[] = [];

  if (data.geometry) {
    lines.push('Geometry Results');
    lines.push(toCsvRow(['Parameter', 'Value', 'Unit']));
    lines.push(toCsvRow(['Instant Center X', data.geometry.instantCenter.x.toFixed(2), 'mm']));
    lines.push(toCsvRow(['Instant Center Y', data.geometry.instantCenter.y.toFixed(2), 'mm']));
    lines.push(toCsvRow(['Instant Center Z', data.geometry.instantCenter.z.toFixed(2), 'mm']));
    lines.push(toCsvRow(['Roll Center Height', data.geometry.rollCenterHeight.toFixed(2), 'mm']));
    lines.push(toCsvRow(['KPI Angle', data.geometry.kingpinInclinationDegrees.toFixed(3), 'deg']));
    lines.push(toCsvRow(['Caster Angle', data.geometry.casterAngleDegrees.toFixed(3), 'deg']));
    lines.push(toCsvRow(['Scrub Radius', data.geometry.scrubRadius.toFixed(2), 'mm']));
    lines.push(toCsvRow(['Mechanical Trail', data.geometry.mechanicalTrail.toFixed(2), 'mm']));
    lines.push('');
  }

  if (data.dynamics) {
    lines.push('Dynamics Results');
    lines.push(toCsvRow(['Parameter', 'Value', 'Unit']));
    lines.push(toCsvRow(['Motion Ratio', data.dynamics.motionRatio.toFixed(4), '']));
    lines.push(toCsvRow(['Wheel Rate', data.dynamics.wheelRate.toFixed(2), 'N/mm']));
    lines.push(toCsvRow(['Natural Frequency', data.dynamics.naturalFrequency.toFixed(3), 'Hz']));
    lines.push(toCsvRow(['Damping Ratio', data.dynamics.dampingRatio.toFixed(4), '']));
    lines.push(toCsvRow(['Critical Damping', data.dynamics.criticalDamping.toFixed(2), 'N·s/mm']));
    lines.push('');
  }

  if (data.antiGeometry) {
    lines.push('Anti-Geometry');
    lines.push(toCsvRow(['Parameter', 'Value', 'Unit']));
    lines.push(toCsvRow(['Anti-Dive', data.antiGeometry.antiDivePercent.toFixed(2), '%']));
    lines.push(toCsvRow(['Anti-Squat', data.antiGeometry.antiSquatPercent.toFixed(2), '%']));
    lines.push('');
  }

  if (data.camberCurve.length > 0) {
    lines.push('Camber Curve');
    lines.push(toCsvRow(['Wheel Travel (mm)', 'Camber Angle (deg)']));
    data.camberCurve.forEach((p) =>
      lines.push(toCsvRow([p.wheelTravel.toFixed(2), p.camberAngleDegrees.toFixed(4)])),
    );
    lines.push('');
  }

  if (data.rollCenterCurve.length > 0) {
    lines.push('Roll Center Migration');
    lines.push(toCsvRow(['Roll Angle (deg)', 'Roll Center Height (mm)']));
    data.rollCenterCurve.forEach((p) =>
      lines.push(toCsvRow([p.rollAngleDegrees.toFixed(2), p.rollCenterHeight.toFixed(2)])),
    );
    lines.push('');
  }

  if (data.bumpSteerCurve.length > 0) {
    lines.push('Bump Steer');
    lines.push(toCsvRow(['Wheel Travel (mm)', 'Toe Angle (deg)']));
    data.bumpSteerCurve.forEach((p) =>
      lines.push(toCsvRow([p.wheelTravel.toFixed(2), p.toeAngleDegrees.toFixed(4)])),
    );
    lines.push('');
  }

  if (data.motionRatioCurve && data.motionRatioCurve.length > 0) {
    lines.push('Motion Ratio Curve');
    lines.push(toCsvRow(['Wheel Travel (mm)', 'Motion Ratio']));
    data.motionRatioCurve.forEach((p) =>
      lines.push(toCsvRow([p.wheelTravel.toFixed(2), p.motionRatio.toFixed(4)])),
    );
    lines.push('');
  }

  if (data.wheelRateCurve && data.wheelRateCurve.length > 0) {
    lines.push('Wheel Rate Curve');
    lines.push(toCsvRow(['Wheel Travel (mm)', 'Wheel Rate (N/mm)']));
    data.wheelRateCurve.forEach((p) =>
      lines.push(toCsvRow([p.wheelTravel.toFixed(2), p.wheelRate.toFixed(4)])),
    );
    lines.push('');
  }

  if (data.instantCenterCurve && data.instantCenterCurve.length > 0) {
    lines.push('Instant Center Migration');
    lines.push(toCsvRow(['Wheel Travel (mm)', 'IC Y (mm)', 'IC Z (mm)']));
    data.instantCenterCurve.forEach((p) =>
      lines.push(toCsvRow([p.wheelTravel.toFixed(2), p.icY.toFixed(2), p.icZ.toFixed(2)])),
    );
    lines.push('');
  }

  if (data.steering && data.steering.ackermannCurve.length > 0) {
    lines.push('Ackermann Geometry');
    lines.push(toCsvRow(['Steering Angle (deg)', 'Ackermann (%)']));
    data.steering.ackermannCurve.forEach((p) =>
      lines.push(toCsvRow([p.steeringAngleDegrees.toFixed(2), p.ackermannPercent.toFixed(2)])),
    );
  }

  return lines.join('\n');
}

export function downloadCsv(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
