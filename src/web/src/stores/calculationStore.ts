import { create } from 'zustand';
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
} from '../types/suspension';
import { calculateSweep } from '../services/calculationService';
import { calculateSweepLocal } from '../services/demoCalculations';

const isDemo = import.meta.env.VITE_DEMO_MODE === 'true';

interface CalculationState {
  geometryResult: GeometryResult | null;
  dynamicsResult: DynamicsResult | null;
  antiGeometryResult: AntiGeometryResult | null;
  steeringResult: SteeringResult | null;
  camberCurve: CamberCurvePoint[];
  rollCenterCurve: RollCenterPoint[];
  bumpSteerCurve: BumpSteerPoint[];
  motionRatioCurve: MotionRatioPoint[];
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
  motionRatioCurve: [],
  isLoading: false,
  error: null,

  fetchAll: async (hardpoints, params) => {
    set({ isLoading: true, error: null });
    try {
      const sweep = isDemo
        ? calculateSweepLocal(hardpoints, params)
        : await calculateSweep(hardpoints, params);
      set({
        geometryResult: sweep.geometry,
        camberCurve: sweep.camberCurve,
        rollCenterCurve: sweep.rollCenterMigration,
        dynamicsResult: sweep.dynamics,
        bumpSteerCurve: sweep.bumpSteer,
        antiGeometryResult: sweep.antiGeometry,
        steeringResult: sweep.steering,
        motionRatioCurve: sweep.motionRatioCurve ?? [],
        isLoading: false,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Calculation failed';
      set({ error: message, isLoading: false });
    }
  },
}));
