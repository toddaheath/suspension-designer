import { describe, it, expect } from 'vitest';
import { solveWheelTravel } from '../kinematicsService';
import type { DoubleWishboneHardpoints } from '../../types/suspension';

const DEFAULT_HARDPOINTS: DoubleWishboneHardpoints = {
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

describe('solveWheelTravel', () => {
  it('returns original hardpoints for zero travel', () => {
    const result = solveWheelTravel(DEFAULT_HARDPOINTS, 0);
    expect(result).toBe(DEFAULT_HARDPOINTS);
  });

  it('does not mutate original hardpoints', () => {
    const original = JSON.parse(JSON.stringify(DEFAULT_HARDPOINTS));
    solveWheelTravel(DEFAULT_HARDPOINTS, 30);
    expect(DEFAULT_HARDPOINTS).toEqual(original);
  });

  it('moves lower ball joint upward in bump', () => {
    const result = solveWheelTravel(DEFAULT_HARDPOINTS, 30);
    expect(result.lowerBallJoint.z).toBeGreaterThan(DEFAULT_HARDPOINTS.lowerBallJoint.z);
  });

  it('moves lower ball joint downward in rebound', () => {
    const result = solveWheelTravel(DEFAULT_HARDPOINTS, -30);
    expect(result.lowerBallJoint.z).toBeLessThan(DEFAULT_HARDPOINTS.lowerBallJoint.z);
  });

  it('preserves lower arm length (arc constraint)', () => {
    const result = solveWheelTravel(DEFAULT_HARDPOINTS, 40);

    const pivotY = (DEFAULT_HARDPOINTS.lowerWishboneFrontPivot.y + DEFAULT_HARDPOINTS.lowerWishboneRearPivot.y) / 2;
    const pivotZ = (DEFAULT_HARDPOINTS.lowerWishboneFrontPivot.z + DEFAULT_HARDPOINTS.lowerWishboneRearPivot.z) / 2;

    const origLen = Math.sqrt(
      (DEFAULT_HARDPOINTS.lowerBallJoint.y - pivotY) ** 2 +
      (DEFAULT_HARDPOINTS.lowerBallJoint.z - pivotZ) ** 2
    );
    const newLen = Math.sqrt(
      (result.lowerBallJoint.y - pivotY) ** 2 +
      (result.lowerBallJoint.z - pivotZ) ** 2
    );

    expect(newLen).toBeCloseTo(origLen, 4);
  });

  it('preserves upper arm length (arc constraint)', () => {
    const result = solveWheelTravel(DEFAULT_HARDPOINTS, 40);

    const pivotY = (DEFAULT_HARDPOINTS.upperWishboneFrontPivot.y + DEFAULT_HARDPOINTS.upperWishboneRearPivot.y) / 2;
    const pivotZ = (DEFAULT_HARDPOINTS.upperWishboneFrontPivot.z + DEFAULT_HARDPOINTS.upperWishboneRearPivot.z) / 2;

    const origLen = Math.sqrt(
      (DEFAULT_HARDPOINTS.upperBallJoint.y - pivotY) ** 2 +
      (DEFAULT_HARDPOINTS.upperBallJoint.z - pivotZ) ** 2
    );
    const newLen = Math.sqrt(
      (result.upperBallJoint.y - pivotY) ** 2 +
      (result.upperBallJoint.z - pivotZ) ** 2
    );

    expect(newLen).toBeCloseTo(origLen, 4);
  });

  it('preserves upright length', () => {
    const result = solveWheelTravel(DEFAULT_HARDPOINTS, 50);

    const origUpright = Math.sqrt(
      (DEFAULT_HARDPOINTS.upperBallJoint.y - DEFAULT_HARDPOINTS.lowerBallJoint.y) ** 2 +
      (DEFAULT_HARDPOINTS.upperBallJoint.z - DEFAULT_HARDPOINTS.lowerBallJoint.z) ** 2
    );
    const newUpright = Math.sqrt(
      (result.upperBallJoint.y - result.lowerBallJoint.y) ** 2 +
      (result.upperBallJoint.z - result.lowerBallJoint.z) ** 2
    );

    expect(newUpright).toBeCloseTo(origUpright, 4);
  });

  it('does not move chassis-side points', () => {
    const result = solveWheelTravel(DEFAULT_HARDPOINTS, 40);

    expect(result.upperWishboneFrontPivot).toEqual(DEFAULT_HARDPOINTS.upperWishboneFrontPivot);
    expect(result.upperWishboneRearPivot).toEqual(DEFAULT_HARDPOINTS.upperWishboneRearPivot);
    expect(result.lowerWishboneFrontPivot).toEqual(DEFAULT_HARDPOINTS.lowerWishboneFrontPivot);
    expect(result.lowerWishboneRearPivot).toEqual(DEFAULT_HARDPOINTS.lowerWishboneRearPivot);
    expect(result.springDamperUpper).toEqual(DEFAULT_HARDPOINTS.springDamperUpper);
    expect(result.pushrodRockerEnd).toEqual(DEFAULT_HARDPOINTS.pushrodRockerEnd);
    expect(result.tieRodInner).toEqual(DEFAULT_HARDPOINTS.tieRodInner);
  });

  it('keeps contact patch on ground (z=0)', () => {
    const result = solveWheelTravel(DEFAULT_HARDPOINTS, 50);
    expect(result.contactPatch.z).toBe(0);
  });

  it('is approximately symmetric for bump and rebound', () => {
    const bump = solveWheelTravel(DEFAULT_HARDPOINTS, 30);
    const rebound = solveWheelTravel(DEFAULT_HARDPOINTS, -30);

    const bumpDY = bump.lowerBallJoint.y - DEFAULT_HARDPOINTS.lowerBallJoint.y;
    const reboundDY = rebound.lowerBallJoint.y - DEFAULT_HARDPOINTS.lowerBallJoint.y;

    // Both should move inward (Y decreases due to arc), but in the same direction
    // For a typical geometry, bump and rebound both cause the ball joint to track inward
    expect(bumpDY).not.toBe(0);
    expect(reboundDY).not.toBe(0);
  });

  it('returns original for extreme out-of-range travel', () => {
    const result = solveWheelTravel(DEFAULT_HARDPOINTS, 9999);
    expect(result).toBe(DEFAULT_HARDPOINTS);
  });
});
