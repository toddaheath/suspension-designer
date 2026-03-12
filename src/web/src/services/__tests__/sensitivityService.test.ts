import { describe, it, expect } from 'vitest';
import { runSensitivitySweep, SWEEPABLE_HARDPOINTS } from '../sensitivityService';
import type { DoubleWishboneHardpoints, VehicleParams } from '../../types/suspension';

const TEST_HARDPOINTS: DoubleWishboneHardpoints = {
  upperWishboneFrontPivot: { x: 100, y: 250, z: 300 },
  upperWishboneRearPivot: { x: -100, y: 250, z: 300 },
  upperBallJoint: { x: 0, y: 600, z: 280 },
  lowerWishboneFrontPivot: { x: 120, y: 200, z: 150 },
  lowerWishboneRearPivot: { x: -120, y: 200, z: 150 },
  lowerBallJoint: { x: 0, y: 620, z: 130 },
  tieRodInner: { x: -80, y: 220, z: 160 },
  tieRodOuter: { x: -80, y: 610, z: 155 },
  springDamperLower: { x: 0, y: 400, z: 150 },
  springDamperUpper: { x: 0, y: 350, z: 400 },
  pushrodWheelEnd: { x: 0, y: 500, z: 140 },
  pushrodRockerEnd: { x: 0, y: 300, z: 350 },
  wheelCenter: { x: 0, y: 650, z: 228 },
  contactPatch: { x: 0, y: 650, z: 0 },
};

const TEST_PARAMS: VehicleParams = {
  trackWidth: 1200,
  wheelbase: 1550,
  sprungMass: 200,
  unsprungMass: 25,
  springRate: 25000,
  dampingCoefficient: 1500,
  rideHeight: 50,
  tireRadius: 228,
  cgHeight: 300,
  frontBrakeProportion: 0.6,
};

describe('sensitivityService', () => {
  it('returns the correct number of points', () => {
    const result = runSensitivitySweep(TEST_HARDPOINTS, TEST_PARAMS, 'upperBallJoint', 'z', 30, 10);
    expect(result.points).toHaveLength(11); // steps + 1
  });

  it('sweeps around the base value', () => {
    const result = runSensitivitySweep(TEST_HARDPOINTS, TEST_PARAMS, 'upperBallJoint', 'z', 20, 10);
    const baseValue = TEST_HARDPOINTS.upperBallJoint.z; // 280
    expect(result.points[0].paramValue).toBeCloseTo(baseValue - 20, 5);
    expect(result.points[result.points.length - 1].paramValue).toBeCloseTo(baseValue + 20, 5);
  });

  it('produces geometry results at each point', () => {
    const result = runSensitivitySweep(TEST_HARDPOINTS, TEST_PARAMS, 'lowerBallJoint', 'y', 30, 6);
    for (const point of result.points) {
      expect(point.geometry).toBeDefined();
      expect(typeof point.geometry.rollCenterHeight).toBe('number');
      expect(typeof point.geometry.kingpinInclinationDegrees).toBe('number');
    }
  });

  it('produces dynamics results at each point', () => {
    const result = runSensitivitySweep(TEST_HARDPOINTS, TEST_PARAMS, 'springDamperUpper', 'z', 50, 4);
    for (const point of result.points) {
      expect(point.dynamics).toBeDefined();
      expect(typeof point.dynamics.motionRatio).toBe('number');
      expect(typeof point.dynamics.wheelRate).toBe('number');
    }
  });

  it('produces anti-geometry results at each point', () => {
    const result = runSensitivitySweep(TEST_HARDPOINTS, TEST_PARAMS, 'upperBallJoint', 'x', 20, 4);
    for (const point of result.points) {
      expect(point.antiGeometry).toBeDefined();
      expect(typeof point.antiGeometry.antiDivePercent).toBe('number');
    }
  });

  it('shows sensitivity: varying z of upper ball joint changes roll center', () => {
    const result = runSensitivitySweep(TEST_HARDPOINTS, TEST_PARAMS, 'upperBallJoint', 'z', 50, 10);
    const rollCenters = result.points.map((p) => p.geometry.rollCenterHeight);
    const min = Math.min(...rollCenters);
    const max = Math.max(...rollCenters);
    expect(max - min).toBeGreaterThan(1); // should show variation
  });

  it('stores the hardpoint name and axis', () => {
    const result = runSensitivitySweep(TEST_HARDPOINTS, TEST_PARAMS, 'tieRodOuter', 'x', 10, 4);
    expect(result.hardpointName).toBe('tieRodOuter');
    expect(result.axis).toBe('x');
  });

  it('SWEEPABLE_HARDPOINTS contains expected entries', () => {
    expect(SWEEPABLE_HARDPOINTS.length).toBe(10);
    const keys = SWEEPABLE_HARDPOINTS.map((h) => h.key);
    expect(keys).toContain('upperBallJoint');
    expect(keys).toContain('lowerBallJoint');
    expect(keys).toContain('springDamperUpper');
  });
});
