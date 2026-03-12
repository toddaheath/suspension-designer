import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export interface TargetRange {
  enabled: boolean;
  min: number;
  max: number;
}

export type TargetKey =
  | 'rollCenterHeight'
  | 'kpiAngle'
  | 'casterAngle'
  | 'scrubRadius'
  | 'mechanicalTrail'
  | 'motionRatio'
  | 'wheelRate'
  | 'naturalFrequency'
  | 'dampingRatio'
  | 'antiDive'
  | 'antiSquat';

export interface TargetDefinition {
  key: TargetKey;
  label: string;
  unit: string;
  defaultMin: number;
  defaultMax: number;
}

export const TARGET_DEFINITIONS: TargetDefinition[] = [
  { key: 'rollCenterHeight', label: 'Roll Center Height', unit: 'mm', defaultMin: 20, defaultMax: 80 },
  { key: 'kpiAngle', label: 'KPI Angle', unit: 'deg', defaultMin: 5, defaultMax: 15 },
  { key: 'casterAngle', label: 'Caster Angle', unit: 'deg', defaultMin: 3, defaultMax: 8 },
  { key: 'scrubRadius', label: 'Scrub Radius', unit: 'mm', defaultMin: -10, defaultMax: 30 },
  { key: 'mechanicalTrail', label: 'Mechanical Trail', unit: 'mm', defaultMin: 10, defaultMax: 40 },
  { key: 'motionRatio', label: 'Motion Ratio', unit: '', defaultMin: 0.5, defaultMax: 1.2 },
  { key: 'wheelRate', label: 'Wheel Rate', unit: 'N/mm', defaultMin: 10, defaultMax: 50 },
  { key: 'naturalFrequency', label: 'Natural Frequency', unit: 'Hz', defaultMin: 1.5, defaultMax: 3.0 },
  { key: 'dampingRatio', label: 'Damping Ratio', unit: '', defaultMin: 0.3, defaultMax: 0.8 },
  { key: 'antiDive', label: 'Anti-Dive', unit: '%', defaultMin: 10, defaultMax: 50 },
  { key: 'antiSquat', label: 'Anti-Squat', unit: '%', defaultMin: 10, defaultMax: 50 },
];

export interface TargetPreset {
  name: string;
  targets: Record<TargetKey, TargetRange>;
  builtIn?: boolean;
}

export const BUILT_IN_PRESETS: TargetPreset[] = [
  {
    name: 'Street Performance',
    builtIn: true,
    targets: buildTargetsFromPartial({
      rollCenterHeight: { enabled: true, min: 30, max: 80 },
      kpiAngle: { enabled: true, min: 8, max: 14 },
      casterAngle: { enabled: true, min: 3, max: 7 },
      scrubRadius: { enabled: true, min: -5, max: 25 },
      motionRatio: { enabled: true, min: 0.6, max: 0.9 },
      naturalFrequency: { enabled: true, min: 1.5, max: 2.5 },
      dampingRatio: { enabled: true, min: 0.3, max: 0.5 },
    }),
  },
  {
    name: 'Track / Race',
    builtIn: true,
    targets: buildTargetsFromPartial({
      rollCenterHeight: { enabled: true, min: 10, max: 60 },
      kpiAngle: { enabled: true, min: 5, max: 12 },
      casterAngle: { enabled: true, min: 4, max: 8 },
      scrubRadius: { enabled: true, min: -10, max: 10 },
      motionRatio: { enabled: true, min: 0.5, max: 0.8 },
      naturalFrequency: { enabled: true, min: 2.5, max: 4.0 },
      dampingRatio: { enabled: true, min: 0.5, max: 0.8 },
      antiDive: { enabled: true, min: 20, max: 50 },
      antiSquat: { enabled: true, min: 20, max: 50 },
    }),
  },
  {
    name: 'Comfort / Touring',
    builtIn: true,
    targets: buildTargetsFromPartial({
      rollCenterHeight: { enabled: true, min: 40, max: 100 },
      kpiAngle: { enabled: true, min: 10, max: 16 },
      casterAngle: { enabled: true, min: 2, max: 6 },
      motionRatio: { enabled: true, min: 0.7, max: 1.0 },
      naturalFrequency: { enabled: true, min: 1.0, max: 1.8 },
      dampingRatio: { enabled: true, min: 0.2, max: 0.4 },
    }),
  },
];

const CUSTOM_PRESETS_KEY = 'suspension-designer-target-presets';

function loadCustomPresets(): TargetPreset[] {
  try {
    const raw = localStorage.getItem(CUSTOM_PRESETS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as TargetPreset[];
  } catch {
    return [];
  }
}

function saveCustomPresets(presets: TargetPreset[]) {
  localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(presets));
}

interface TargetState {
  targets: Record<TargetKey, TargetRange>;
  targetsVisible: boolean;
  customPresets: TargetPreset[];
  toggleTargetsVisible: () => void;
  updateTarget: (key: TargetKey, field: 'enabled' | 'min' | 'max', value: boolean | number) => void;
  resetTargets: () => void;
  loadPreset: (preset: TargetPreset) => void;
  saveAsPreset: (name: string) => void;
  deletePreset: (name: string) => void;
}

function buildDefaultTargets(): Record<TargetKey, TargetRange> {
  const targets = {} as Record<TargetKey, TargetRange>;
  for (const def of TARGET_DEFINITIONS) {
    targets[def.key] = { enabled: false, min: def.defaultMin, max: def.defaultMax };
  }
  return targets;
}

function buildTargetsFromPartial(partial: Partial<Record<TargetKey, TargetRange>>): Record<TargetKey, TargetRange> {
  const base = buildDefaultTargets();
  for (const [key, value] of Object.entries(partial)) {
    base[key as TargetKey] = value;
  }
  return base;
}

export type TargetStatus = 'pass' | 'warn' | 'fail' | 'none';

export function evaluateTarget(target: TargetRange, value: number): TargetStatus {
  if (!target.enabled) return 'none';

  const range = target.max - target.min;
  const margin = range * 0.1; // 10% warning margin

  if (value >= target.min && value <= target.max) return 'pass';
  if (value >= target.min - margin && value <= target.max + margin) return 'warn';
  return 'fail';
}

export const useTargetStore = create<TargetState>()(
  immer((set, get) => ({
    targets: buildDefaultTargets(),
    targetsVisible: false,
    customPresets: loadCustomPresets(),

    toggleTargetsVisible: () => set((s) => { s.targetsVisible = !s.targetsVisible; }),

    updateTarget: (key, field, value) =>
      set((s) => {
        if (field === 'enabled') {
          s.targets[key].enabled = value as boolean;
        } else {
          s.targets[key][field] = value as number;
        }
      }),

    resetTargets: () => set((s) => { s.targets = buildDefaultTargets(); }),

    loadPreset: (preset) => set((s) => {
      s.targets = structuredClone(preset.targets);
    }),

    saveAsPreset: (name) => {
      const targets = structuredClone(get().targets);
      const preset: TargetPreset = { name, targets };
      set((s) => {
        const idx = s.customPresets.findIndex((p) => p.name === name);
        if (idx >= 0) {
          s.customPresets[idx] = preset;
        } else {
          s.customPresets.push(preset);
        }
        saveCustomPresets(s.customPresets);
      });
    },

    deletePreset: (name) => set((s) => {
      s.customPresets = s.customPresets.filter((p) => p.name !== name);
      saveCustomPresets(s.customPresets);
    }),
  }))
);
