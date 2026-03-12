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
