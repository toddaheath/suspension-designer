export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface DoubleWishboneHardpoints {
  upperWishboneFrontPivot: Point3D;
  upperWishboneRearPivot: Point3D;
  upperBallJoint: Point3D;
  lowerWishboneFrontPivot: Point3D;
  lowerWishboneRearPivot: Point3D;
  lowerBallJoint: Point3D;
  tieRodInner: Point3D;
  tieRodOuter: Point3D;
  springDamperUpper: Point3D;
  springDamperLower: Point3D;
  pushrodWheelEnd: Point3D;
  pushrodRockerEnd: Point3D;
  wheelCenter: Point3D;
  contactPatch: Point3D;
}

export interface VehicleParams {
  trackWidth: number;
  wheelbase: number;
  sprungMass: number;
  unsprungMass: number;
  springRate: number;
  dampingCoefficient: number;
  rideHeight: number;
  tireRadius: number;
  cgHeight: number;
  frontBrakeProportion: number;
  antiRollBarRate: number;
}

export interface GeometryResult {
  instantCenter: Point3D;
  rollCenterHeight: number;
  kingpinInclinationDegrees: number;
  casterAngleDegrees: number;
  scrubRadius: number;
  mechanicalTrail: number;
}

export interface DynamicsResult {
  motionRatio: number;
  wheelRate: number;
  naturalFrequency: number;
  dampingRatio: number;
  criticalDamping: number;
  rollStiffness: number;
}

export interface CamberCurvePoint {
  wheelTravel: number;
  camberAngleDegrees: number;
}

export interface RollCenterPoint {
  rollAngleDegrees: number;
  rollCenterHeight: number;
}

export interface BumpSteerPoint {
  wheelTravel: number;
  toeAngleDegrees: number;
}

export interface MotionRatioPoint {
  wheelTravel: number;
  motionRatio: number;
}

export interface WheelRatePoint {
  wheelTravel: number;
  wheelRate: number;
}

export interface InstantCenterPoint {
  wheelTravel: number;
  icY: number;
  icZ: number;
}

export interface AntiGeometryResult {
  antiDivePercent: number;
  antiSquatPercent: number;
}

export interface AckermannPoint {
  steeringAngleDegrees: number;
  ackermannPercent: number;
}

export interface SteeringResult {
  ackermannCurve: AckermannPoint[];
}

export interface SweepResult {
  geometry: GeometryResult;
  camberCurve: CamberCurvePoint[];
  rollCenterMigration: RollCenterPoint[];
  dynamics: DynamicsResult;
  antiGeometry: AntiGeometryResult;
  steering: SteeringResult;
  bumpSteer: BumpSteerPoint[];
  motionRatioCurve: MotionRatioPoint[];
  wheelRateCurve: WheelRatePoint[];
  instantCenterCurve: InstantCenterPoint[];
}

export interface DesignData {
  id?: string;
  name: string;
  hardpoints: DoubleWishboneHardpoints;
  vehicleParams: VehicleParams;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface SuspensionDesignPayload {
  name: string;
  suspensionType: number;
  axlePosition: number;
  upperWishboneFrontPivot: Point3D;
  upperWishboneRearPivot: Point3D;
  upperBallJoint: Point3D;
  lowerWishboneFrontPivot: Point3D;
  lowerWishboneRearPivot: Point3D;
  lowerBallJoint: Point3D;
  tieRodInner: Point3D;
  tieRodOuter: Point3D;
  springDamperUpper: Point3D;
  springDamperLower: Point3D;
  pushrodWheelEnd: Point3D;
  pushrodRockerEnd: Point3D;
  trackWidth: number;
  wheelbase: number;
  sprungMass: number;
  unsprungMass: number;
  springRate: number;
  dampingCoefficient: number;
  rideHeight: number;
  tireRadius: number;
  cgHeight: number;
  frontBrakeProportion: number;
  antiRollBarRate: number;
}
