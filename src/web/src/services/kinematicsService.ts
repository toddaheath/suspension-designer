import type { DoubleWishboneHardpoints, Point3D } from '../types/suspension';

/**
 * Front-view (YZ-plane) four-bar linkage solver for double-wishbone suspension.
 * Given a vertical wheel travel (bump positive, rebound negative),
 * calculates the displaced hardpoint positions by solving the
 * kinematic constraints of the upper and lower wishbone arcs.
 */
export function solveWheelTravel(
  hp: DoubleWishboneHardpoints,
  travel: number
): DoubleWishboneHardpoints {
  if (Math.abs(travel) < 0.01) return hp;

  // Chassis pivot points (average of front/rear pivots for front-view projection)
  const lowerPivotY = (hp.lowerWishboneFrontPivot.y + hp.lowerWishboneRearPivot.y) / 2;
  const lowerPivotZ = (hp.lowerWishboneFrontPivot.z + hp.lowerWishboneRearPivot.z) / 2;
  const upperPivotY = (hp.upperWishboneFrontPivot.y + hp.upperWishboneRearPivot.y) / 2;
  const upperPivotZ = (hp.upperWishboneFrontPivot.z + hp.upperWishboneRearPivot.z) / 2;

  // Arm lengths in YZ plane
  const lowerR = Math.sqrt(
    (hp.lowerBallJoint.y - lowerPivotY) ** 2 +
    (hp.lowerBallJoint.z - lowerPivotZ) ** 2
  );
  const upperR = Math.sqrt(
    (hp.upperBallJoint.y - upperPivotY) ** 2 +
    (hp.upperBallJoint.z - upperPivotZ) ** 2
  );

  // Upright length in YZ plane
  const uprightLen = Math.sqrt(
    (hp.upperBallJoint.y - hp.lowerBallJoint.y) ** 2 +
    (hp.upperBallJoint.z - hp.lowerBallJoint.z) ** 2
  );

  // Current lower arm angle
  const lowerAngle0 = Math.atan2(
    hp.lowerBallJoint.z - lowerPivotZ,
    hp.lowerBallJoint.y - lowerPivotY
  );

  // New lower ball joint Z with travel applied
  const newLBJZ = hp.lowerBallJoint.z + travel;
  const sinArg = (newLBJZ - lowerPivotZ) / lowerR;
  if (Math.abs(sinArg) > 0.999) return hp; // Out of arc range

  // Solve for the new lower arm angle and Y position
  const newLowerAngle = Math.asin(sinArg);
  // Pick the solution branch closest to the original angle
  const candidateA = newLowerAngle;
  const candidateB = Math.PI - newLowerAngle;
  const newAngle = Math.abs(candidateA - lowerAngle0) < Math.abs(candidateB - lowerAngle0)
    ? candidateA : candidateB;
  const newLBJY = lowerPivotY + lowerR * Math.cos(newAngle);

  // Solve two-circle intersection for upper ball joint:
  // Circle 1: center=(upperPivotY, upperPivotZ), radius=upperR
  // Circle 2: center=(newLBJY, newLBJZ), radius=uprightLen
  const dy = newLBJY - upperPivotY;
  const dz = newLBJZ - upperPivotZ;
  const d = Math.sqrt(dy * dy + dz * dz);

  if (d > upperR + uprightLen || d < Math.abs(upperR - uprightLen) || d < 1e-6) {
    return hp; // No valid solution
  }

  const a = (upperR * upperR - uprightLen * uprightLen + d * d) / (2 * d);
  const hSq = upperR * upperR - a * a;
  const h = Math.sqrt(Math.max(0, hSq));

  const pY = upperPivotY + a * dy / d;
  const pZ = upperPivotZ + a * dz / d;

  // Two intersection solutions
  const sol1Y = pY + h * dz / d;
  const sol1Z = pZ - h * dy / d;
  const sol2Y = pY - h * dz / d;
  const sol2Z = pZ + h * dy / d;

  // Pick the solution closest to the original upper ball joint
  const dist1 = (sol1Y - hp.upperBallJoint.y) ** 2 + (sol1Z - hp.upperBallJoint.z) ** 2;
  const dist2 = (sol2Y - hp.upperBallJoint.y) ** 2 + (sol2Z - hp.upperBallJoint.z) ** 2;
  const newUBJY = dist1 <= dist2 ? sol1Y : sol2Y;
  const newUBJZ = dist1 <= dist2 ? sol1Z : sol2Z;

  // Displacement vectors
  const dLBJ = { y: newLBJY - hp.lowerBallJoint.y, z: newLBJZ - hp.lowerBallJoint.z };
  const dUBJ = { y: newUBJY - hp.upperBallJoint.y, z: newUBJZ - hp.upperBallJoint.z };

  // Fraction along lower arm for spring/damper lower and pushrod wheel end
  const lowerArmFraction = (pt: Point3D) => {
    const dy = pt.y - lowerPivotY;
    const dz = pt.z - lowerPivotZ;
    const armDY = hp.lowerBallJoint.y - lowerPivotY;
    const armDZ = hp.lowerBallJoint.z - lowerPivotZ;
    const armLen2 = armDY * armDY + armDZ * armDZ;
    if (armLen2 < 1e-6) return 0;
    return (dy * armDY + dz * armDZ) / armLen2;
  };

  // Fraction along upright for tie rod outer
  const uprightFraction = (pt: Point3D) => {
    const dy = pt.y - hp.lowerBallJoint.y;
    const dz = pt.z - hp.lowerBallJoint.z;
    const uDY = hp.upperBallJoint.y - hp.lowerBallJoint.y;
    const uDZ = hp.upperBallJoint.z - hp.lowerBallJoint.z;
    const uLen2 = uDY * uDY + uDZ * uDZ;
    if (uLen2 < 1e-6) return 0;
    return (dy * uDY + dz * uDZ) / uLen2;
  };

  const result: DoubleWishboneHardpoints = JSON.parse(JSON.stringify(hp));

  // Ball joints
  result.lowerBallJoint.y = newLBJY;
  result.lowerBallJoint.z = newLBJZ;
  result.upperBallJoint.y = newUBJY;
  result.upperBallJoint.z = newUBJZ;

  // Wheel center: midpoint of ball joints in YZ
  const avgDY = (dLBJ.y + dUBJ.y) / 2;
  const avgDZ = (dLBJ.z + dUBJ.z) / 2;
  result.wheelCenter.y += avgDY;
  result.wheelCenter.z += avgDZ;

  // Contact patch: moves laterally but stays on ground
  result.contactPatch.y += avgDY;
  result.contactPatch.z = 0;

  // Tie rod outer moves with the upright
  const troFrac = uprightFraction(hp.tieRodOuter);
  result.tieRodOuter.y += dLBJ.y + troFrac * (dUBJ.y - dLBJ.y);
  result.tieRodOuter.z += dLBJ.z + troFrac * (dUBJ.z - dLBJ.z);

  // Spring/damper lower: attached to lower arm
  const sdFrac = lowerArmFraction(hp.springDamperLower);
  result.springDamperLower.y += dLBJ.y * sdFrac;
  result.springDamperLower.z += dLBJ.z * sdFrac;

  // Pushrod wheel end: attached to lower arm
  const prFrac = lowerArmFraction(hp.pushrodWheelEnd);
  result.pushrodWheelEnd.y += dLBJ.y * prFrac;
  result.pushrodWheelEnd.z += dLBJ.z * prFrac;

  return result;
}
