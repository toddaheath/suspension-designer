import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { DoubleWishboneHardpoints, VehicleParams } from '../types/suspension';

const DEFAULT_HARDPOINTS: DoubleWishboneHardpoints = {
  upperWishboneInboardFront: { x: 100, y: 250, z: 300 },
  upperWishboneInboardRear: { x: -100, y: 250, z: 300 },
  upperWishboneOutboard: { x: 0, y: 600, z: 280 },
  lowerWishboneInboardFront: { x: 120, y: 200, z: 150 },
  lowerWishboneInboardRear: { x: -120, y: 200, z: 150 },
  lowerWishboneOutboard: { x: 0, y: 620, z: 130 },
  tierodInboard: { x: -80, y: 220, z: 160 },
  tierodOutboard: { x: -80, y: 610, z: 155 },
  wheelCenter: { x: 0, y: 650, z: 228 },
  contactPatch: { x: 0, y: 650, z: 0 },
  springWheelSide: { x: 0, y: 400, z: 150 },
  springBodySide: { x: 0, y: 350, z: 400 },
};

const DEFAULT_VEHICLE_PARAMS: VehicleParams = {
  trackWidth: 1200,
  wheelbase: 1550,
  sprungMass: 200,
  unsprungMass: 25,
  springRate: 25000,
  dampingCoefficient: 1500,
  rideHeight: 50,
  tireRadius: 228,
};

interface DesignState {
  hardpoints: DoubleWishboneHardpoints;
  vehicleParams: VehicleParams;
  name: string;
  isDirty: boolean;
  updateHardpoint: (
    name: keyof DoubleWishboneHardpoints,
    axis: 'x' | 'y' | 'z',
    value: number
  ) => void;
  updateVehicleParam: (name: keyof VehicleParams, value: number) => void;
  resetToDefaults: () => void;
}

export const useDesignStore = create<DesignState>()(
  immer((set) => ({
    hardpoints: DEFAULT_HARDPOINTS,
    vehicleParams: DEFAULT_VEHICLE_PARAMS,
    name: 'Untitled Design',
    isDirty: false,

    updateHardpoint: (name, axis, value) =>
      set((state) => {
        state.hardpoints[name][axis] = value;
        state.isDirty = true;
      }),

    updateVehicleParam: (name, value) =>
      set((state) => {
        state.vehicleParams[name] = value;
        state.isDirty = true;
      }),

    resetToDefaults: () =>
      set((state) => {
        state.hardpoints = DEFAULT_HARDPOINTS;
        state.vehicleParams = DEFAULT_VEHICLE_PARAMS;
        state.name = 'Untitled Design';
        state.isDirty = false;
      }),
  }))
);
