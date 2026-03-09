import apiClient from './apiClient';
import { buildPayload } from './buildPayload';
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
  SweepResult,
} from '../types/suspension';

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

export async function calculateSweep(
  hardpoints: DoubleWishboneHardpoints,
  vehicleParams: VehicleParams
): Promise<SweepResult> {
  const response = await apiClient.post<SweepResult>(
    '/calculations/sweep',
    buildPayload(hardpoints, vehicleParams)
  );
  return response.data;
}
