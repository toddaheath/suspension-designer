import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { DoubleWishboneHardpoints, VehicleParams, DesignData } from '../types/suspension';
import { listDesigns as apiListDesigns, getDesign as apiGetDesign, createDesign as apiCreateDesign, updateDesign as apiUpdateDesign, deleteDesign as apiDeleteDesign } from '../services/designService';
import { demoListDesigns, demoGetDesign, demoCreateDesign, demoUpdateDesign, demoDeleteDesign } from '../services/demoDesignService';
import type { DesignSummary, DesignDetail } from '../services/designService';

const isDemo = import.meta.env.VITE_DEMO_MODE === 'true';
const listDesigns = isDemo ? demoListDesigns : apiListDesigns;
const getDesign = isDemo ? demoGetDesign : apiGetDesign;
const createDesign = isDemo ? demoCreateDesign : apiCreateDesign;
const updateDesign = isDemo ? demoUpdateDesign : apiUpdateDesign;
const deleteDesign = isDemo ? demoDeleteDesign : apiDeleteDesign;
import type { VehiclePreset } from '../data/vehiclePresets';
import { useNotificationStore } from './notificationStore';

function notify(type: 'success' | 'error', message: string) {
  useNotificationStore.getState().addNotification(type, message);
}

const DEFAULT_HARDPOINTS: DoubleWishboneHardpoints = {
  upperWishboneFrontPivot: { x: 100, y: 250, z: 300 },
  upperWishboneRearPivot: { x: -100, y: 250, z: 300 },
  upperBallJoint: { x: 0, y: 600, z: 280 },
  lowerWishboneFrontPivot: { x: 120, y: 200, z: 150 },
  lowerWishboneRearPivot: { x: -120, y: 200, z: 150 },
  lowerBallJoint: { x: 0, y: 620, z: 130 },
  tieRodInner: { x: -80, y: 220, z: 160 },
  tieRodOuter: { x: -80, y: 610, z: 155 },
  springDamperLower: { x: 0, y: 400, z: 150 },
  springDamperUpper: { x: 0, y: 350, z: 400 },
  pushrodWheelEnd: { x: 0, y: 500, z: 140 },
  pushrodRockerEnd: { x: 0, y: 300, z: 350 },
  wheelCenter: { x: 0, y: 650, z: 228 },
  contactPatch: { x: 0, y: 650, z: 0 },
};

interface Snapshot {
  hardpoints: DoubleWishboneHardpoints;
  vehicleParams: VehicleParams;
}

const MAX_HISTORY = 50;
const undoStack: Snapshot[] = [];
const redoStack: Snapshot[] = [];

function pushUndo(snap: Snapshot) {
  undoStack.push(JSON.parse(JSON.stringify(snap)));
  if (undoStack.length > MAX_HISTORY) undoStack.shift();
  redoStack.length = 0;
}

const DEFAULT_VEHICLE_PARAMS: VehicleParams = {
  trackWidth: 1200,
  wheelbase: 1550,
  sprungMass: 200,
  unsprungMass: 25,
  springRate: 25000,
  dampingCoefficient: 1500,
  rideHeight: 50,
  tireRadius: 228,
  cgHeight: 300,
  frontBrakeProportion: 0.6,
  antiRollBarRate: 0,
};

interface DesignState {
  hardpoints: DoubleWishboneHardpoints;
  vehicleParams: VehicleParams;
  name: string;
  notes: string;
  designId: string | null;
  isDirty: boolean;
  savedDesigns: DesignSummary[];
  isSaving: boolean;
  isLoadingDesigns: boolean;
  updateHardpoint: (
    name: keyof DoubleWishboneHardpoints,
    axis: 'x' | 'y' | 'z',
    value: number
  ) => void;
  updateVehicleParam: (name: keyof VehicleParams, value: number) => void;
  setName: (name: string) => void;
  setNotes: (notes: string) => void;
  resetToDefaults: () => void;
  applyPreset: (preset: VehiclePreset) => void;
  exportToJson: () => string;
  importFromJson: (json: string) => string;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  cloneDesign: () => void;
  saveDesign: () => Promise<void>;
  loadDesign: (id: string) => Promise<void>;
  fetchDesigns: () => Promise<void>;
  deleteDesign: (id: string) => Promise<void>;
}

function applyDesignDetail(state: DesignState, detail: DesignDetail) {
  state.designId = detail.id;
  state.name = detail.name;
  state.isDirty = false;
  state.hardpoints = {
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
    // Derive rendering-only fields from geometry
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
  state.vehicleParams = {
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
}

export const useDesignStore = create<DesignState>()(
  immer((set, get) => ({
    hardpoints: DEFAULT_HARDPOINTS,
    vehicleParams: DEFAULT_VEHICLE_PARAMS,
    name: 'Untitled Design',
    notes: '',
    designId: null,
    isDirty: false,
    savedDesigns: [],
    isSaving: false,
    isLoadingDesigns: false,
    canUndo: false,
    canRedo: false,

    updateHardpoint: (name, axis, value) =>
      set((state) => {
        pushUndo({ hardpoints: JSON.parse(JSON.stringify(state.hardpoints)), vehicleParams: JSON.parse(JSON.stringify(state.vehicleParams)) });
        state.hardpoints[name][axis] = value;
        state.isDirty = true;
        state.canUndo = undoStack.length > 0;
        state.canRedo = redoStack.length > 0;
      }),

    updateVehicleParam: (name, value) =>
      set((state) => {
        pushUndo({ hardpoints: JSON.parse(JSON.stringify(state.hardpoints)), vehicleParams: JSON.parse(JSON.stringify(state.vehicleParams)) });
        state.vehicleParams[name] = value;
        state.isDirty = true;
        state.canUndo = undoStack.length > 0;
        state.canRedo = redoStack.length > 0;
      }),

    setName: (name) =>
      set((state) => {
        state.name = name;
        state.isDirty = true;
      }),

    setNotes: (notes) =>
      set((state) => {
        state.notes = notes;
        state.isDirty = true;
      }),

    resetToDefaults: () =>
      set((state) => {
        state.hardpoints = DEFAULT_HARDPOINTS;
        state.vehicleParams = DEFAULT_VEHICLE_PARAMS;
        state.name = 'Untitled Design';
        state.notes = '';
        state.designId = null;
        state.isDirty = false;
      }),

    applyPreset: (preset) =>
      set((state) => {
        state.hardpoints = { ...preset.hardpoints };
        state.vehicleParams = { ...preset.vehicleParams };
        state.name = preset.name;
        state.designId = null;
        state.isDirty = true;
      }),

    exportToJson: () => {
      const { name, notes, hardpoints, vehicleParams } = get();
      const data = { name, notes, hardpoints, vehicleParams };
      return JSON.stringify(data, null, 2);
    },

    importFromJson: (json: string) => {
      try {
        const data = JSON.parse(json) as DesignData;
        if (!data.hardpoints) return 'Missing "hardpoints" object';
        if (!data.vehicleParams) return 'Missing "vehicleParams" object';

        // Validate required hardpoint keys exist and have x/y/z
        const requiredHardpoints: (keyof DoubleWishboneHardpoints)[] = [
          'upperWishboneFrontPivot', 'upperWishboneRearPivot', 'upperBallJoint',
          'lowerWishboneFrontPivot', 'lowerWishboneRearPivot', 'lowerBallJoint',
          'tieRodInner', 'tieRodOuter', 'springDamperUpper', 'springDamperLower',
        ];
        for (const key of requiredHardpoints) {
          const pt = data.hardpoints[key];
          if (!pt) return `Missing hardpoint: ${key}`;
          if (typeof pt.x !== 'number' || typeof pt.y !== 'number' || typeof pt.z !== 'number') {
            return `Invalid coordinates for ${key} (need x, y, z numbers)`;
          }
        }

        // Validate required vehicle params
        const requiredParams: (keyof VehicleParams)[] = [
          'trackWidth', 'wheelbase', 'sprungMass', 'unsprungMass',
          'springRate', 'dampingCoefficient', 'tireRadius',
        ];
        for (const key of requiredParams) {
          if (typeof data.vehicleParams[key] !== 'number') return `Missing vehicle param: ${key}`;
          if (data.vehicleParams[key] <= 0) return `Vehicle param "${key}" must be > 0`;
        }

        set((state) => {
          state.name = data.name || 'Imported Design';
          state.notes = (data as { notes?: string }).notes || '';
          state.hardpoints = data.hardpoints;
          state.vehicleParams = data.vehicleParams;
          state.designId = null;
          state.isDirty = true;
        });
        return '';
      } catch {
        return 'Invalid JSON file';
      }
    },

    undo: () =>
      set((state) => {
        const snap = undoStack.pop();
        if (!snap) return;
        redoStack.push(JSON.parse(JSON.stringify({ hardpoints: state.hardpoints, vehicleParams: state.vehicleParams })));
        state.hardpoints = snap.hardpoints;
        state.vehicleParams = snap.vehicleParams;
        state.isDirty = true;
        state.canUndo = undoStack.length > 0;
        state.canRedo = redoStack.length > 0;
      }),

    redo: () =>
      set((state) => {
        const snap = redoStack.pop();
        if (!snap) return;
        undoStack.push(JSON.parse(JSON.stringify({ hardpoints: state.hardpoints, vehicleParams: state.vehicleParams })));
        state.hardpoints = snap.hardpoints;
        state.vehicleParams = snap.vehicleParams;
        state.isDirty = true;
        state.canUndo = undoStack.length > 0;
        state.canRedo = redoStack.length > 0;
      }),

    cloneDesign: () =>
      set((state) => {
        state.name = `Copy of ${state.name}`;
        state.designId = null;
        state.isDirty = true;
      }),

    saveDesign: async () => {
      const { name, hardpoints, vehicleParams, designId } = get();
      set({ isSaving: true });
      try {
        const result = designId
          ? await updateDesign(designId, name, hardpoints, vehicleParams)
          : await createDesign(name, hardpoints, vehicleParams);
        set((state) => {
          state.designId = result.id;
          state.isDirty = false;
          state.isSaving = false;
        });
        notify('success', `Design "${name}" saved`);
        get().fetchDesigns();
      } catch {
        set({ isSaving: false });
        notify('error', 'Failed to save design');
      }
    },

    loadDesign: async (id: string) => {
      try {
        const detail = await getDesign(id);
        set((state) => {
          applyDesignDetail(state, detail);
        });
      } catch {
        notify('error', 'Failed to load design');
      }
    },

    fetchDesigns: async () => {
      set({ isLoadingDesigns: true });
      try {
        const designs = await listDesigns();
        set({ savedDesigns: designs, isLoadingDesigns: false });
      } catch {
        set({ isLoadingDesigns: false });
      }
    },

    deleteDesign: async (id: string) => {
      try {
        await deleteDesign(id);
        set((state) => {
          state.savedDesigns = state.savedDesigns.filter((d) => d.id !== id);
          if (state.designId === id) {
            state.designId = null;
          }
        });
        notify('success', 'Design deleted');
      } catch {
        notify('error', 'Failed to delete design');
      }
    },
  }))
);
