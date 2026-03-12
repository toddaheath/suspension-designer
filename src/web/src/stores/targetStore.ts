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

interface TargetState {
  targets: Record<TargetKey, TargetRange>;
  targetsVisible: boolean;
  toggleTargetsVisible: () => void;
  updateTarget: (key: TargetKey, field: 'enabled' | 'min' | 'max', value: boolean | number) => void;
  resetTargets: () => void;
}

function buildDefaultTargets(): Record<TargetKey, TargetRange> {
  const targets = {} as Record<TargetKey, TargetRange>;
  for (const def of TARGET_DEFINITIONS) {
    targets[def.key] = { enabled: false, min: def.defaultMin, max: def.defaultMax };
  }
  return targets;
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
  immer((set) => ({
    targets: buildDefaultTargets(),
    targetsVisible: false,

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
  }))
);
