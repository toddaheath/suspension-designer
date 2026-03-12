import { create } from 'zustand';

export type UnitSystem = 'metric' | 'imperial';

interface UnitState {
  system: UnitSystem;
  toggle: () => void;
  setSystem: (system: UnitSystem) => void;
}

export const useUnitStore = create<UnitState>((set) => ({
  system: 'metric',
  toggle: () => set((s) => ({ system: s.system === 'metric' ? 'imperial' : 'metric' })),
  setSystem: (system) => set({ system }),
}));

// Conversion factors (metric -> imperial)
const MM_TO_IN = 1 / 25.4;
const KG_TO_LB = 2.20462;
const N_MM_TO_LBF_IN = 0.00571015;    // N/mm -> lbf/in
const NS_MM_TO_LBS_IN = 0.00571015;   // N·s/mm -> lb·s/in

export interface UnitDef {
  metric: string;
  imperial: string;
  toImperial: (v: number) => number;
  toMetric: (v: number) => number;
}

export const UNITS: Record<string, UnitDef> = {
  length: {
    metric: 'mm',
    imperial: 'in',
    toImperial: (v) => v * MM_TO_IN,
    toMetric: (v) => v / MM_TO_IN,
  },
  mass: {
    metric: 'kg',
    imperial: 'lb',
    toImperial: (v) => v * KG_TO_LB,
    toMetric: (v) => v / KG_TO_LB,
  },
  springRate: {
    metric: 'N/mm',
    imperial: 'lbf/in',
    toImperial: (v) => v / N_MM_TO_LBF_IN,
    toMetric: (v) => v * N_MM_TO_LBF_IN,
  },
  damping: {
    metric: 'N·s/mm',
    imperial: 'lb·s/in',
    toImperial: (v) => v / NS_MM_TO_LBS_IN,
    toMetric: (v) => v * NS_MM_TO_LBS_IN,
  },
  angle: {
    metric: 'deg',
    imperial: 'deg',
    toImperial: (v) => v,
    toMetric: (v) => v,
  },
  frequency: {
    metric: 'Hz',
    imperial: 'Hz',
    toImperial: (v) => v,
    toMetric: (v) => v,
  },
  ratio: {
    metric: '',
    imperial: '',
    toImperial: (v) => v,
    toMetric: (v) => v,
  },
  percent: {
    metric: '%',
    imperial: '%',
    toImperial: (v) => v,
    toMetric: (v) => v,
  },
};

/** Display-convert a value from metric storage to the active unit system */
export function displayValue(value: number, unitKey: string, system: UnitSystem): number {
  if (system === 'metric') return value;
  return UNITS[unitKey]?.toImperial(value) ?? value;
}

/** Convert a display value back to metric for storage */
export function storageValue(value: number, unitKey: string, system: UnitSystem): number {
  if (system === 'metric') return value;
  return UNITS[unitKey]?.toMetric(value) ?? value;
}

/** Get the display unit label for the current system */
export function unitLabel(unitKey: string, system: UnitSystem): string {
  const u = UNITS[unitKey];
  if (!u) return '';
  return system === 'metric' ? u.metric : u.imperial;
}
