import type {
  DoubleWishboneHardpoints,
  VehicleParams,
  GeometryResult,
  DynamicsResult,
  CamberCurvePoint,
  RollCenterPoint,
  BumpSteerPoint,
  MotionRatioPoint,
  AntiGeometryResult,
  SteeringResult,
  SweepResult,
  Point3D,
} from '../types/suspension';
import { solveWheelTravel } from './kinematicsService';

const DEG = 180 / Math.PI;

function midY(a: Point3D, b: Point3D): number {
  return (a.y + b.y) / 2;
}
function midZ(a: Point3D, b: Point3D): number {
  return (a.z + b.z) / 2;
}

/**
 * Find the intersection of two 2D lines defined by point+direction.
 * Line 1: p1 + t * d1, Line 2: p2 + s * d2.  Returns the intersection point.
 */
function lineIntersect2D(
  p1y: number, p1z: number, d1y: number, d1z: number,
  p2y: number, p2z: number, d2y: number, d2z: number,
): { y: number; z: number } | null {
  const denom = d1y * d2z - d1z * d2y;
  if (Math.abs(denom) < 1e-10) return null; // parallel
  const t = ((p2y - p1y) * d2z - (p2z - p1z) * d2y) / denom;
  return { y: p1y + t * d1y, z: p1z + t * d1z };
}

function computeInstantCenter(hp: DoubleWishboneHardpoints): Point3D {
  // Front-view (YZ plane): intersect upper and lower arm lines
  const upPivotY = midY(hp.upperWishboneFrontPivot, hp.upperWishboneRearPivot);
  const upPivotZ = midZ(hp.upperWishboneFrontPivot, hp.upperWishboneRearPivot);
  const loPivotY = midY(hp.lowerWishboneFrontPivot, hp.lowerWishboneRearPivot);
  const loPivotZ = midZ(hp.lowerWishboneFrontPivot, hp.lowerWishboneRearPivot);

  const upperDirY = hp.upperBallJoint.y - upPivotY;
  const upperDirZ = hp.upperBallJoint.z - upPivotZ;
  const lowerDirY = hp.lowerBallJoint.y - loPivotY;
  const lowerDirZ = hp.lowerBallJoint.z - loPivotZ;

  const ic = lineIntersect2D(
    upPivotY, upPivotZ, upperDirY, upperDirZ,
    loPivotY, loPivotZ, lowerDirY, lowerDirZ,
  );

  if (!ic) return { x: 0, y: 0, z: 0 };
  return { x: 0, y: ic.y, z: ic.z };
}

function computeRollCenterHeight(ic: Point3D, contactPatch: Point3D): number {
  // Line from IC to contact patch; find Z where Y = 0 (vehicle centerline)
  const dy = contactPatch.y - ic.y;
  if (Math.abs(dy) < 1e-10) return ic.z;
  const t = -ic.y / dy;
  return ic.z + t * (contactPatch.z - ic.z);
}

function computeKPI(hp: DoubleWishboneHardpoints): number {
  // Kingpin inclination: angle of steering axis from vertical in front (YZ) view
  const dy = hp.upperBallJoint.y - hp.lowerBallJoint.y;
  const dz = hp.upperBallJoint.z - hp.lowerBallJoint.z;
  return Math.atan2(Math.abs(dy), dz) * DEG;
}

function computeCaster(hp: DoubleWishboneHardpoints): number {
  // Caster: angle of steering axis from vertical in side (XZ) view
  const dx = hp.upperBallJoint.x - hp.lowerBallJoint.x;
  const dz = hp.upperBallJoint.z - hp.lowerBallJoint.z;
  return Math.atan2(dx, dz) * DEG;
}

function steeringAxisGroundIntercept(hp: DoubleWishboneHardpoints): Point3D {
  // Parametric line from LBJ to UBJ, solve for z=0
  const dx = hp.upperBallJoint.x - hp.lowerBallJoint.x;
  const dy = hp.upperBallJoint.y - hp.lowerBallJoint.y;
  const dz = hp.upperBallJoint.z - hp.lowerBallJoint.z;
  if (Math.abs(dz) < 1e-10) return hp.lowerBallJoint;
  const t = -hp.lowerBallJoint.z / dz;
  return {
    x: hp.lowerBallJoint.x + t * dx,
    y: hp.lowerBallJoint.y + t * dy,
    z: 0,
  };
}

function computeScrubRadius(hp: DoubleWishboneHardpoints): number {
  const intercept = steeringAxisGroundIntercept(hp);
  return intercept.y - hp.contactPatch.y;
}

function computeMechanicalTrail(hp: DoubleWishboneHardpoints): number {
  const intercept = steeringAxisGroundIntercept(hp);
  return intercept.x - hp.contactPatch.x;
}

function computeGeometry(hp: DoubleWishboneHardpoints): GeometryResult {
  const instantCenter = computeInstantCenter(hp);
  return {
    instantCenter,
    rollCenterHeight: computeRollCenterHeight(instantCenter, hp.contactPatch),
    kingpinInclinationDegrees: computeKPI(hp),
    casterAngleDegrees: computeCaster(hp),
    scrubRadius: computeScrubRadius(hp),
    mechanicalTrail: computeMechanicalTrail(hp),
  };
}

function uprightAngle(hp: DoubleWishboneHardpoints): number {
  // Angle of the upright (UBJ-LBJ line) from vertical in YZ plane
  const dy = hp.upperBallJoint.y - hp.lowerBallJoint.y;
  const dz = hp.upperBallJoint.z - hp.lowerBallJoint.z;
  return Math.atan2(dy, dz);
}

function computeCamberCurve(hp: DoubleWishboneHardpoints): CamberCurvePoint[] {
  const staticAngle = uprightAngle(hp);
  const points: CamberCurvePoint[] = [];
  for (let travel = -75; travel <= 75; travel += 5) {
    const displaced = solveWheelTravel(hp, travel);
    const angle = uprightAngle(displaced);
    points.push({
      wheelTravel: travel,
      camberAngleDegrees: (angle - staticAngle) * DEG,
    });
  }
  return points;
}

function computeRollCenterMigration(hp: DoubleWishboneHardpoints): RollCenterPoint[] {
  const points: RollCenterPoint[] = [];
  for (let rollDeg = -5; rollDeg <= 5; rollDeg += 0.5) {
    // Approximate roll by applying opposite bump/rebound to left/right
    // For a single corner, we simulate the roll as vertical travel
    const rollRad = rollDeg / DEG;
    const halfTrack = hp.contactPatch.y;
    const verticalTravel = halfTrack * Math.sin(rollRad);

    const displaced = solveWheelTravel(hp, verticalTravel);
    const ic = computeInstantCenter(displaced);
    const rcHeight = computeRollCenterHeight(ic, displaced.contactPatch);

    points.push({
      rollAngleDegrees: rollDeg,
      rollCenterHeight: rcHeight,
    });
  }
  return points;
}

function computeMotionRatio(hp: DoubleWishboneHardpoints): number {
  const delta = 1; // 1mm perturbation
  const staticSpring = Math.sqrt(
    (hp.springDamperUpper.x - hp.springDamperLower.x) ** 2 +
    (hp.springDamperUpper.y - hp.springDamperLower.y) ** 2 +
    (hp.springDamperUpper.z - hp.springDamperLower.z) ** 2
  );

  const displaced = solveWheelTravel(hp, delta);
  const newSpring = Math.sqrt(
    (displaced.springDamperUpper.x - displaced.springDamperLower.x) ** 2 +
    (displaced.springDamperUpper.y - displaced.springDamperLower.y) ** 2 +
    (displaced.springDamperUpper.z - displaced.springDamperLower.z) ** 2
  );

  const springChange = Math.abs(staticSpring - newSpring);
  return springChange / delta;
}

function springLength(hp: DoubleWishboneHardpoints): number {
  return Math.sqrt(
    (hp.springDamperUpper.x - hp.springDamperLower.x) ** 2 +
    (hp.springDamperUpper.y - hp.springDamperLower.y) ** 2 +
    (hp.springDamperUpper.z - hp.springDamperLower.z) ** 2
  );
}

function computeMotionRatioCurve(hp: DoubleWishboneHardpoints): MotionRatioPoint[] {
  const delta = 0.5; // small perturbation for numerical derivative
  const points: MotionRatioPoint[] = [];
  for (let travel = -75; travel <= 75; travel += 5) {
    const displaced = solveWheelTravel(hp, travel);
    const displacedPlus = solveWheelTravel(hp, travel + delta);
    const len1 = springLength(displaced);
    const len2 = springLength(displacedPlus);
    const mr = Math.abs(len1 - len2) / delta;
    points.push({ wheelTravel: travel, motionRatio: mr });
  }
  return points;
}

function computeDynamics(hp: DoubleWishboneHardpoints, vp: VehicleParams): DynamicsResult {
  const motionRatio = computeMotionRatio(hp);
  const wheelRate = (vp.springRate / 1000) * motionRatio * motionRatio; // N/mm
  const cornerMass = vp.sprungMass / 4; // per corner
  const naturalFrequency = Math.sqrt((wheelRate * 1000) / cornerMass) / (2 * Math.PI);
  const criticalDamping = 2 * Math.sqrt((vp.springRate / 1000) * cornerMass) * 1000; // N·s/m
  const dampingRatio = vp.dampingCoefficient / criticalDamping;

  return {
    motionRatio,
    wheelRate,
    naturalFrequency,
    dampingRatio,
    criticalDamping: criticalDamping / 1000, // convert to N·s/mm
  };
}

function computeAntiGeometry(hp: DoubleWishboneHardpoints, vp: VehicleParams): AntiGeometryResult {
  // Side-view instant center: intersection of upper and lower arms in XZ plane
  const upPivotX = (hp.upperWishboneFrontPivot.x + hp.upperWishboneRearPivot.x) / 2;
  const upPivotZ = midZ(hp.upperWishboneFrontPivot, hp.upperWishboneRearPivot);
  const loPivotX = (hp.lowerWishboneFrontPivot.x + hp.lowerWishboneRearPivot.x) / 2;
  const loPivotZ = midZ(hp.lowerWishboneFrontPivot, hp.lowerWishboneRearPivot);

  const ic = lineIntersect2D(
    upPivotX, upPivotZ,
    hp.upperBallJoint.x - upPivotX, hp.upperBallJoint.z - upPivotZ,
    loPivotX, loPivotZ,
    hp.lowerBallJoint.x - loPivotX, hp.lowerBallJoint.z - loPivotZ,
  );

  if (!ic) return { antiDivePercent: 0, antiSquatPercent: 0 };

  // Anti-dive: front braking geometry
  // tan(angle) = IC_height / IC_distance_forward
  const sideViewAngle = Math.atan2(ic.z, Math.abs(ic.y) || vp.wheelbase);
  const antiDivePercent = (Math.tan(sideViewAngle) * vp.wheelbase * vp.frontBrakeProportion / vp.cgHeight) * 100;

  // Anti-squat: rear driving geometry (simplified - use complement)
  const antiSquatPercent = (Math.tan(sideViewAngle) * vp.wheelbase * (1 - vp.frontBrakeProportion) / vp.cgHeight) * 100;

  return {
    antiDivePercent: Math.abs(antiDivePercent),
    antiSquatPercent: Math.abs(antiSquatPercent),
  };
}

function computeBumpSteer(hp: DoubleWishboneHardpoints): BumpSteerPoint[] {
  const points: BumpSteerPoint[] = [];

  // Static toe reference: tie rod angle in XY plane
  const staticToeAngle = Math.atan2(
    hp.tieRodOuter.x - hp.tieRodInner.x,
    hp.tieRodOuter.y - hp.tieRodInner.y,
  );

  for (let travel = -75; travel <= 75; travel += 5) {
    const displaced = solveWheelTravel(hp, travel);
    const toeAngle = Math.atan2(
      displaced.tieRodOuter.x - displaced.tieRodInner.x,
      displaced.tieRodOuter.y - displaced.tieRodInner.y,
    );
    points.push({
      wheelTravel: travel,
      toeAngleDegrees: (toeAngle - staticToeAngle) * DEG,
    });
  }
  return points;
}

function computeSteering(vp: VehicleParams): SteeringResult {
  const ackermannCurve = [];
  for (let innerAngle = 5; innerAngle <= 40; innerAngle += 5) {
    const innerRad = innerAngle / DEG;
    const turningRadius = vp.wheelbase / Math.tan(innerRad);
    const idealOuterRad = Math.atan(vp.wheelbase / (turningRadius + vp.trackWidth));
    const idealOuterDeg = idealOuterRad * DEG;

    // For a typical rack-and-pinion, the actual outer angle is approximately
    // a linear interpolation. We simulate partial Ackermann.
    const actualOuterDeg = innerAngle * 0.85; // simplified
    const ackermannPercent = idealOuterDeg > 0
      ? ((innerAngle - actualOuterDeg) / (innerAngle - idealOuterDeg)) * 100
      : 0;

    ackermannCurve.push({
      steeringAngleDegrees: innerAngle,
      ackermannPercent: Math.min(Math.max(ackermannPercent, 0), 200),
    });
  }
  return { ackermannCurve };
}

/**
 * Compute all suspension analysis results locally (no backend required).
 * Used in demo/GitHub Pages mode.
 */
export function calculateSweepLocal(
  hardpoints: DoubleWishboneHardpoints,
  vehicleParams: VehicleParams,
): SweepResult {
  return {
    geometry: computeGeometry(hardpoints),
    camberCurve: computeCamberCurve(hardpoints),
    rollCenterMigration: computeRollCenterMigration(hardpoints),
    dynamics: computeDynamics(hardpoints, vehicleParams),
    antiGeometry: computeAntiGeometry(hardpoints, vehicleParams),
    steering: computeSteering(vehicleParams),
    bumpSteer: computeBumpSteer(hardpoints),
    motionRatioCurve: computeMotionRatioCurve(hardpoints),
  };
}
