import { create } from 'zustand';
import type {
  DoubleWishboneHardpoints,
  VehicleParams,
  GeometryResult,
  CamberCurvePoint,
  RollCenterPoint,
  MotionRatioPoint,
} from '../types/suspension';
import {
  calculateGeometry,
  calculateCamberCurve,
  calculateRollCenter,
  calculateMotionRatio,
} from '../services/calculationService';

interface CalculationState {
  geometryResult: GeometryResult | null;
  camberCurve: CamberCurvePoint[];
  rollCenterCurve: RollCenterPoint[];
  motionRatioCurve: MotionRatioPoint[];
  isLoading: boolean;
  error: string | null;
  fetchGeometry: (hardpoints: DoubleWishboneHardpoints) => Promise<void>;
  fetchCamberCurve: (hardpoints: DoubleWishboneHardpoints) => Promise<void>;
  fetchDynamics: (hardpoints: DoubleWishboneHardpoints, params: VehicleParams) => Promise<void>;
  fetchRollCenter: (hardpoints: DoubleWishboneHardpoints, params: VehicleParams) => Promise<void>;
}

export const useCalculationStore = create<CalculationState>((set) => ({
  geometryResult: null,
  camberCurve: [],
  rollCenterCurve: [],
  motionRatioCurve: [],
  isLoading: false,
  error: null,

  fetchGeometry: async (hardpoints) => {
    try {
      const result = await calculateGeometry(hardpoints);
      set({ geometryResult: result });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Geometry calculation failed';
      set({ error: message });
    }
  },

  fetchCamberCurve: async (hardpoints) => {
    try {
      const data = await calculateCamberCurve(hardpoints);
      set({ camberCurve: data });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Camber curve calculation failed';
      set({ error: message });
    }
  },

  fetchDynamics: async (hardpoints) => {
    try {
      const data = await calculateMotionRatio(hardpoints);
      set({ motionRatioCurve: data });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Motion ratio calculation failed';
      set({ error: message });
    }
  },

  fetchRollCenter: async (hardpoints, params) => {
    try {
      const data = await calculateRollCenter(hardpoints, params);
      set({ rollCenterCurve: data });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Roll center calculation failed';
      set({ error: message });
    }
  },
}));
