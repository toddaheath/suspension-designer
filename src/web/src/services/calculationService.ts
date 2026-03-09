import apiClient from './apiClient';
import type {
  DoubleWishboneHardpoints,
  VehicleParams,
  GeometryResult,
  DynamicsResult,
  CamberCurvePoint,
  RollCenterPoint,
  BumpSteerPoint,
  AntiGeometryResult,
  SteeringResult,
  SuspensionDesignPayload,
} from '../types/suspension';

function buildPayload(
  hardpoints: DoubleWishboneHardpoints,
  vehicleParams: VehicleParams
): SuspensionDesignPayload {
  return {
    name: '',
    suspensionType: 0,
    axlePosition: 0,
    upperWishboneFrontPivot: hardpoints.upperWishboneFrontPivot,
    upperWishboneRearPivot: hardpoints.upperWishboneRearPivot,
    upperBallJoint: hardpoints.upperBallJoint,
    lowerWishboneFrontPivot: hardpoints.lowerWishboneFrontPivot,
    lowerWishboneRearPivot: hardpoints.lowerWishboneRearPivot,
    lowerBallJoint: hardpoints.lowerBallJoint,
    tieRodInner: hardpoints.tieRodInner,
    tieRodOuter: hardpoints.tieRodOuter,
    springDamperUpper: hardpoints.springDamperUpper,
    springDamperLower: hardpoints.springDamperLower,
    pushrodWheelEnd: hardpoints.pushrodWheelEnd,
    pushrodRockerEnd: hardpoints.pushrodRockerEnd,
    trackWidth: vehicleParams.trackWidth,
    wheelbase: vehicleParams.wheelbase,
    sprungMass: vehicleParams.sprungMass,
    unsprungMass: vehicleParams.unsprungMass,
    springRate: vehicleParams.springRate,
    dampingCoefficient: vehicleParams.dampingCoefficient,
    rideHeight: vehicleParams.rideHeight,
    tireRadius: vehicleParams.tireRadius,
    cgHeight: vehicleParams.cgHeight,
    frontBrakeProportion: vehicleParams.frontBrakeProportion,
  };
}

export async function calculateGeometry(
  hardpoints: DoubleWishboneHardpoints,
  vehicleParams: VehicleParams
): Promise<GeometryResult> {
  const response = await apiClient.post<GeometryResult>(
    '/calculations/geometry',
    buildPayload(hardpoints, vehicleParams)
  );
  return response.data;
}

export async function calculateCamberCurve(
  hardpoints: DoubleWishboneHardpoints,
  vehicleParams: VehicleParams
): Promise<CamberCurvePoint[]> {
  const response = await apiClient.post<CamberCurvePoint[]>(
    '/calculations/camber-curve',
    buildPayload(hardpoints, vehicleParams)
  );
  return response.data;
}

export async function calculateRollCenter(
  hardpoints: DoubleWishboneHardpoints,
  vehicleParams: VehicleParams
): Promise<RollCenterPoint[]> {
  const response = await apiClient.post<RollCenterPoint[]>(
    '/calculations/roll-center',
    buildPayload(hardpoints, vehicleParams)
  );
  return response.data;
}

export async function calculateDynamics(
  hardpoints: DoubleWishboneHardpoints,
  vehicleParams: VehicleParams
): Promise<DynamicsResult> {
  const response = await apiClient.post<DynamicsResult>(
    '/calculations/dynamics',
    buildPayload(hardpoints, vehicleParams)
  );
  return response.data;
}

export async function calculateBumpSteer(
  hardpoints: DoubleWishboneHardpoints,
  vehicleParams: VehicleParams
): Promise<BumpSteerPoint[]> {
  const response = await apiClient.post<BumpSteerPoint[]>(
    '/calculations/bump-steer',
    buildPayload(hardpoints, vehicleParams)
  );
  return response.data;
}

export async function calculateAntiGeometry(
  hardpoints: DoubleWishboneHardpoints,
  vehicleParams: VehicleParams
): Promise<AntiGeometryResult> {
  const response = await apiClient.post<AntiGeometryResult>(
    '/calculations/anti-geometry',
    buildPayload(hardpoints, vehicleParams)
  );
  return response.data;
}

export async function calculateSteering(
  hardpoints: DoubleWishboneHardpoints,
  vehicleParams: VehicleParams
): Promise<SteeringResult> {
  const response = await apiClient.post<SteeringResult>(
    '/calculations/steering',
    buildPayload(hardpoints, vehicleParams)
  );
  return response.data;
}
