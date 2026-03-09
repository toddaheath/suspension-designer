import apiClient from './apiClient';
import type { DoubleWishboneHardpoints, VehicleParams, SuspensionDesignPayload } from '../types/suspension';

export interface DesignSummary {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DesignDetail extends DesignSummary {
  suspensionType: number;
  axlePosition: number;
  upperWishboneFrontPivot: { x: number; y: number; z: number };
  upperWishboneRearPivot: { x: number; y: number; z: number };
  upperBallJoint: { x: number; y: number; z: number };
  lowerWishboneFrontPivot: { x: number; y: number; z: number };
  lowerWishboneRearPivot: { x: number; y: number; z: number };
  lowerBallJoint: { x: number; y: number; z: number };
  tieRodInner: { x: number; y: number; z: number };
  tieRodOuter: { x: number; y: number; z: number };
  springDamperUpper: { x: number; y: number; z: number };
  springDamperLower: { x: number; y: number; z: number };
  pushrodWheelEnd: { x: number; y: number; z: number };
  pushrodRockerEnd: { x: number; y: number; z: number };
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
}

export async function listDesigns(): Promise<DesignSummary[]> {
  const response = await apiClient.get<DesignSummary[]>('/designs');
  return response.data;
}

export async function getDesign(id: string): Promise<DesignDetail> {
  const response = await apiClient.get<DesignDetail>(`/designs/${id}`);
  return response.data;
}

export async function createDesign(
  name: string,
  hardpoints: DoubleWishboneHardpoints,
  vehicleParams: VehicleParams
): Promise<DesignDetail> {
  const payload: SuspensionDesignPayload = {
    name,
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
  const response = await apiClient.post<DesignDetail>('/designs', payload);
  return response.data;
}

export async function updateDesign(
  id: string,
  name: string,
  hardpoints: DoubleWishboneHardpoints,
  vehicleParams: VehicleParams
): Promise<DesignDetail> {
  const payload: SuspensionDesignPayload = {
    name,
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
  const response = await apiClient.put<DesignDetail>(`/designs/${id}`, payload);
  return response.data;
}

export async function deleteDesign(id: string): Promise<void> {
  await apiClient.delete(`/designs/${id}`);
}
