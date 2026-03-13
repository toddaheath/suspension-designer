import type {
  DoubleWishboneHardpoints,
  VehicleParams,
  GeometryResult,
  DynamicsResult,
  AntiGeometryResult,
} from '../types/suspension';
import { calculateSweepLocal } from './demoCalculations';

export interface SensitivityPoint {
  paramValue: number;
  geometry: GeometryResult;
  dynamics: DynamicsResult;
  antiGeometry: AntiGeometryResult;
}

export interface SensitivityResult {
  hardpointName: keyof DoubleWishboneHardpoints;
  axis: 'x' | 'y' | 'z';
  points: SensitivityPoint[];
}

export function runSensitivitySweep(
  hardpoints: DoubleWishboneHardpoints,
  vehicleParams: VehicleParams,
  hardpointName: keyof DoubleWishboneHardpoints,
  axis: 'x' | 'y' | 'z',
  range: number,
  steps: number,
): SensitivityResult {
  const baseValue = hardpoints[hardpointName][axis];
  const stepSize = (range * 2) / steps;
  const points: SensitivityPoint[] = [];

  for (let i = 0; i <= steps; i++) {
    const offset = -range + i * stepSize;
    const paramValue = baseValue + offset;

    // Clone hardpoints and modify the target
    const modified = JSON.parse(JSON.stringify(hardpoints)) as DoubleWishboneHardpoints;
    modified[hardpointName][axis] = paramValue;

    const sweep = calculateSweepLocal(modified, vehicleParams);
    points.push({
      paramValue,
      geometry: sweep.geometry,
      dynamics: sweep.dynamics,
      antiGeometry: sweep.antiGeometry,
    });
  }

  return { hardpointName, axis, points };
}

export interface HeatmapCell {
  hardpoint: string;
  axis: string;
  output: string;
  sensitivity: number; // normalized 0-1
  rawDelta: number;
}

export interface HeatmapResult {
  cells: HeatmapCell[];
  rows: string[]; // hardpoint+axis labels
  cols: string[]; // output labels
}

const HEATMAP_OUTPUTS = [
  { key: 'rcHeight', label: 'RC Height', extract: (g: GeometryResult, _d: DynamicsResult) => g.rollCenterHeight },
  { key: 'kpi', label: 'KPI', extract: (g: GeometryResult) => g.kingpinInclinationDegrees },
  { key: 'caster', label: 'Caster', extract: (g: GeometryResult) => g.casterAngleDegrees },
  { key: 'scrubRadius', label: 'Scrub Radius', extract: (g: GeometryResult) => g.scrubRadius },
  { key: 'motionRatio', label: 'Motion Ratio', extract: (_g: GeometryResult, d: DynamicsResult) => d.motionRatio },
  { key: 'wheelRate', label: 'Wheel Rate', extract: (_g: GeometryResult, d: DynamicsResult) => d.wheelRate },
  { key: 'natFreq', label: 'Nat. Freq', extract: (_g: GeometryResult, d: DynamicsResult) => d.naturalFrequency },
] as const;

export function computeSensitivityHeatmap(
  hardpoints: DoubleWishboneHardpoints,
  vehicleParams: VehicleParams,
  perturbation = 5,
): HeatmapResult {
  const hardpointKeys: (keyof DoubleWishboneHardpoints)[] = [
    'upperBallJoint', 'lowerBallJoint',
    'upperWishboneFrontPivot', 'upperWishboneRearPivot',
    'lowerWishboneFrontPivot', 'lowerWishboneRearPivot',
    'tieRodInner', 'tieRodOuter',
    'springDamperUpper', 'springDamperLower',
  ];
  const axes: ('x' | 'y' | 'z')[] = ['x', 'y', 'z'];

  // Get baseline
  const baseSweep = calculateSweepLocal(hardpoints, vehicleParams);
  const baseGeo = baseSweep.geometry;
  const baseDyn = baseSweep.dynamics;

  const rows: string[] = [];
  const rawDeltas: { row: string; col: string; delta: number }[] = [];

  for (const hpKey of hardpointKeys) {
    for (const axis of axes) {
      const label = `${shortLabel(hpKey)}.${axis.toUpperCase()}`;
      rows.push(label);

      const modified = JSON.parse(JSON.stringify(hardpoints)) as DoubleWishboneHardpoints;
      modified[hpKey][axis] = hardpoints[hpKey][axis] + perturbation;
      const sweep = calculateSweepLocal(modified, vehicleParams);

      for (const out of HEATMAP_OUTPUTS) {
        const baseVal = out.extract(baseGeo, baseDyn);
        const newVal = out.extract(sweep.geometry, sweep.dynamics);
        const delta = Math.abs(newVal - baseVal);
        rawDeltas.push({ row: label, col: out.label, delta });
      }
    }
  }

  // Normalize per column (per output)
  const cols = HEATMAP_OUTPUTS.map((o) => o.label);
  const cells: HeatmapCell[] = [];

  for (const col of cols) {
    const colDeltas = rawDeltas.filter((d) => d.col === col);
    const maxDelta = Math.max(...colDeltas.map((d) => d.delta), 1e-10);
    for (const d of colDeltas) {
      const parts = d.row.split('.');
      cells.push({
        hardpoint: parts[0],
        axis: parts[1],
        output: d.col,
        sensitivity: d.delta / maxDelta,
        rawDelta: d.delta,
      });
    }
  }

  return { cells, rows, cols };
}

function shortLabel(key: keyof DoubleWishboneHardpoints): string {
  const map: Record<string, string> = {
    upperBallJoint: 'UBJ',
    lowerBallJoint: 'LBJ',
    upperWishboneFrontPivot: 'UWF',
    upperWishboneRearPivot: 'UWR',
    lowerWishboneFrontPivot: 'LWF',
    lowerWishboneRearPivot: 'LWR',
    tieRodInner: 'TRI',
    tieRodOuter: 'TRO',
    springDamperUpper: 'SDU',
    springDamperLower: 'SDL',
  };
  return map[key] ?? key;
}

export const SWEEPABLE_HARDPOINTS: { key: keyof DoubleWishboneHardpoints; label: string }[] = [
  { key: 'upperWishboneFrontPivot', label: 'Upper Wishbone Front Pivot' },
  { key: 'upperWishboneRearPivot', label: 'Upper Wishbone Rear Pivot' },
  { key: 'upperBallJoint', label: 'Upper Ball Joint' },
  { key: 'lowerWishboneFrontPivot', label: 'Lower Wishbone Front Pivot' },
  { key: 'lowerWishboneRearPivot', label: 'Lower Wishbone Rear Pivot' },
  { key: 'lowerBallJoint', label: 'Lower Ball Joint' },
  { key: 'tieRodInner', label: 'Tie Rod Inner' },
  { key: 'tieRodOuter', label: 'Tie Rod Outer' },
  { key: 'springDamperUpper', label: 'Spring/Damper Upper' },
  { key: 'springDamperLower', label: 'Spring/Damper Lower' },
];
