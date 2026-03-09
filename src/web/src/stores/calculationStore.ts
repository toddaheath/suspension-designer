import { create } from 'zustand';
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
} from '../types/suspension';
import {
  calculateGeometry,
  calculateCamberCurve,
  calculateRollCenter,
  calculateDynamics,
  calculateBumpSteer,
  calculateAntiGeometry,
  calculateSteering,
} from '../services/calculationService';

interface CalculationState {
  geometryResult: GeometryResult | null;
  dynamicsResult: DynamicsResult | null;
  antiGeometryResult: AntiGeometryResult | null;
  steeringResult: SteeringResult | null;
  camberCurve: CamberCurvePoint[];
  rollCenterCurve: RollCenterPoint[];
  bumpSteerCurve: BumpSteerPoint[];
  isLoading: boolean;
  error: string | null;
  fetchAll: (hardpoints: DoubleWishboneHardpoints, params: VehicleParams) => Promise<void>;
}

export const useCalculationStore = create<CalculationState>((set) => ({
  geometryResult: null,
  dynamicsResult: null,
  antiGeometryResult: null,
  steeringResult: null,
  camberCurve: [],
  rollCenterCurve: [],
  bumpSteerCurve: [],
  isLoading: false,
  error: null,

  fetchAll: async (hardpoints, params) => {
    set({ isLoading: true, error: null });
    try {
      const [geometry, camber, rollCenter, dynamics, bumpSteer, antiGeo, steering] =
        await Promise.all([
          calculateGeometry(hardpoints, params),
          calculateCamberCurve(hardpoints, params),
          calculateRollCenter(hardpoints, params),
          calculateDynamics(hardpoints, params),
          calculateBumpSteer(hardpoints, params),
          calculateAntiGeometry(hardpoints, params),
          calculateSteering(hardpoints, params),
        ]);
      set({
        geometryResult: geometry,
        camberCurve: camber,
        rollCenterCurve: rollCenter,
        dynamicsResult: dynamics,
        bumpSteerCurve: bumpSteer,
        antiGeometryResult: antiGeo,
        steeringResult: steering,
        isLoading: false,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Calculation failed';
      set({ error: message, isLoading: false });
    }
  },
}));
