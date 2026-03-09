export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface DoubleWishboneHardpoints {
  upperWishboneInboardFront: Point3D;
  upperWishboneInboardRear: Point3D;
  upperWishboneOutboard: Point3D;
  lowerWishboneInboardFront: Point3D;
  lowerWishboneInboardRear: Point3D;
  lowerWishboneOutboard: Point3D;
  tierodInboard: Point3D;
  tierodOutboard: Point3D;
  wheelCenter: Point3D;
  contactPatch: Point3D;
  springWheelSide: Point3D;
  springBodySide: Point3D;
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
}

export interface GeometryResult {
  instantCenter: Point3D;
  rollCenterHeight: number;
  kpiAngle: number;
  casterAngle: number;
  scrubRadius: number;
  mechanicalTrail: number;
}

export interface CamberCurvePoint {
  travel: number;
  camberAngle: number;
}

export interface RollCenterPoint {
  rollAngle: number;
  rollCenterHeight: number;
}

export interface MotionRatioPoint {
  travel: number;
  motionRatio: number;
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
