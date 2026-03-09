import apiClient from './apiClient';
import type {
  DoubleWishboneHardpoints,
  VehicleParams,
  GeometryResult,
  CamberCurvePoint,
  RollCenterPoint,
  MotionRatioPoint,
} from '../types/suspension';

export async function calculateGeometry(
  hardpoints: DoubleWishboneHardpoints
): Promise<GeometryResult> {
  const response = await apiClient.post<GeometryResult>(
    '/calculations/geometry',
    hardpoints
  );
  return response.data;
}

export async function calculateCamberCurve(
  hardpoints: DoubleWishboneHardpoints,
  travelRange: number = 50,
  steps: number = 21
): Promise<CamberCurvePoint[]> {
  const response = await apiClient.post<CamberCurvePoint[]>(
    '/calculations/camber-curve',
    { hardpoints, travelRange, steps }
  );
  return response.data;
}

export async function calculateRollCenter(
  hardpoints: DoubleWishboneHardpoints,
  vehicleParams: VehicleParams,
  maxRollAngle: number = 5,
  steps: number = 21
): Promise<RollCenterPoint[]> {
  const response = await apiClient.post<RollCenterPoint[]>(
    '/calculations/roll-center',
    { hardpoints, vehicleParams, maxRollAngle, steps }
  );
  return response.data;
}

export async function calculateMotionRatio(
  hardpoints: DoubleWishboneHardpoints,
  travelRange: number = 50,
  steps: number = 21
): Promise<MotionRatioPoint[]> {
  const response = await apiClient.post<MotionRatioPoint[]>(
    '/calculations/motion-ratio',
    { hardpoints, travelRange, steps }
  );
  return response.data;
}
