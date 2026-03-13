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
  WheelRatePoint,
  InstantCenterPoint,
  AntiGeometryResult,
  SteeringResult,
} from '../types/suspension';
import { calculateSweep } from '../services/calculationService';
import { calculateSweepLocal } from '../services/demoCalculations';
import { demoGetDesign } from '../services/demoDesignService';
import { getDesign as apiGetDesign } from '../services/designService';

const isDemo = import.meta.env.VITE_DEMO_MODE === 'true';
const getDesign = isDemo ? demoGetDesign : apiGetDesign;

interface ComparisonState {
  isActive: boolean;
  designName: string | null;
  designId: string | null;
  hardpoints: DoubleWishboneHardpoints | null;
  vehicleParams: VehicleParams | null;
  geometryResult: GeometryResult | null;
  dynamicsResult: DynamicsResult | null;
  antiGeometryResult: AntiGeometryResult | null;
  steeringResult: SteeringResult | null;
  camberCurve: CamberCurvePoint[];
  rollCenterCurve: RollCenterPoint[];
  bumpSteerCurve: BumpSteerPoint[];
  motionRatioCurve: MotionRatioPoint[];
  wheelRateCurve: WheelRatePoint[];
  instantCenterCurve: InstantCenterPoint[];
  isLoading: boolean;
  error: string | null;
  loadForComparison: (id: string) => Promise<void>;
  clearComparison: () => void;
}

export const useComparisonStore = create<ComparisonState>((set) => ({
  isActive: false,
  designName: null,
  designId: null,
  hardpoints: null,
  vehicleParams: null,
  geometryResult: null,
  dynamicsResult: null,
  antiGeometryResult: null,
  steeringResult: null,
  camberCurve: [],
  rollCenterCurve: [],
  bumpSteerCurve: [],
  motionRatioCurve: [],
  wheelRateCurve: [],
  instantCenterCurve: [],
  isLoading: false,
  error: null,

  loadForComparison: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const detail = await getDesign(id);

      const hardpoints: DoubleWishboneHardpoints = {
        upperWishboneFrontPivot: detail.upperWishboneFrontPivot,
        upperWishboneRearPivot: detail.upperWishboneRearPivot,
        upperBallJoint: detail.upperBallJoint,
        lowerWishboneFrontPivot: detail.lowerWishboneFrontPivot,
        lowerWishboneRearPivot: detail.lowerWishboneRearPivot,
        lowerBallJoint: detail.lowerBallJoint,
        tieRodInner: detail.tieRodInner,
        tieRodOuter: detail.tieRodOuter,
        springDamperUpper: detail.springDamperUpper,
        springDamperLower: detail.springDamperLower,
        pushrodWheelEnd: detail.pushrodWheelEnd,
        pushrodRockerEnd: detail.pushrodRockerEnd,
        wheelCenter: {
          x: (detail.upperBallJoint.x + detail.lowerBallJoint.x) / 2,
          y: Math.max(detail.upperBallJoint.y, detail.lowerBallJoint.y) + 30,
          z: (detail.upperBallJoint.z + detail.lowerBallJoint.z) / 2,
        },
        contactPatch: {
          x: (detail.upperBallJoint.x + detail.lowerBallJoint.x) / 2,
          y: Math.max(detail.upperBallJoint.y, detail.lowerBallJoint.y) + 30,
          z: 0,
        },
      };

      const vehicleParams: VehicleParams = {
        trackWidth: detail.trackWidth,
        wheelbase: detail.wheelbase,
        sprungMass: detail.sprungMass,
        unsprungMass: detail.unsprungMass,
        springRate: detail.springRate,
        dampingCoefficient: detail.dampingCoefficient,
        rideHeight: detail.rideHeight,
        tireRadius: detail.tireRadius,
        cgHeight: detail.cgHeight,
        frontBrakeProportion: detail.frontBrakeProportion,
        antiRollBarRate: detail.antiRollBarRate ?? 0,
      };

      const sweep = isDemo
        ? calculateSweepLocal(hardpoints, vehicleParams)
        : await calculateSweep(hardpoints, vehicleParams);

      set({
        isActive: true,
        designName: detail.name,
        designId: id,
        hardpoints,
        vehicleParams,
        geometryResult: sweep.geometry,
        dynamicsResult: sweep.dynamics,
        antiGeometryResult: sweep.antiGeometry,
        steeringResult: sweep.steering,
        camberCurve: sweep.camberCurve,
        rollCenterCurve: sweep.rollCenterMigration,
        bumpSteerCurve: sweep.bumpSteer,
        motionRatioCurve: sweep.motionRatioCurve ?? [],
        wheelRateCurve: sweep.wheelRateCurve ?? [],
        instantCenterCurve: sweep.instantCenterCurve ?? [],
        isLoading: false,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load comparison design';
      set({ error: message, isLoading: false });
    }
  },

  clearComparison: () => {
    set({
      isActive: false,
      designName: null,
      designId: null,
      hardpoints: null,
      vehicleParams: null,
      geometryResult: null,
      dynamicsResult: null,
      antiGeometryResult: null,
      steeringResult: null,
      camberCurve: [],
      rollCenterCurve: [],
      bumpSteerCurve: [],
      motionRatioCurve: [],
      wheelRateCurve: [],
      instantCenterCurve: [],
      error: null,
    });
  },
}));
