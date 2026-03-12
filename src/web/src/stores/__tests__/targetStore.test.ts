import { describe, it, expect, beforeEach } from 'vitest';
import { useTargetStore, evaluateTarget, TARGET_DEFINITIONS } from '../targetStore';
import type { TargetRange } from '../targetStore';

describe('targetStore', () => {
  beforeEach(() => {
    useTargetStore.getState().resetTargets();
  });

  it('initializes all targets as disabled', () => {
    const { targets } = useTargetStore.getState();
    for (const def of TARGET_DEFINITIONS) {
      expect(targets[def.key].enabled).toBe(false);
    }
  });

  it('initializes targets with default min/max values', () => {
    const { targets } = useTargetStore.getState();
    for (const def of TARGET_DEFINITIONS) {
      expect(targets[def.key].min).toBe(def.defaultMin);
      expect(targets[def.key].max).toBe(def.defaultMax);
    }
  });

  it('updateTarget enables a target', () => {
    useTargetStore.getState().updateTarget('rollCenterHeight', 'enabled', true);
    expect(useTargetStore.getState().targets.rollCenterHeight.enabled).toBe(true);
  });

  it('updateTarget changes min value', () => {
    useTargetStore.getState().updateTarget('rollCenterHeight', 'min', 10);
    expect(useTargetStore.getState().targets.rollCenterHeight.min).toBe(10);
  });

  it('updateTarget changes max value', () => {
    useTargetStore.getState().updateTarget('rollCenterHeight', 'max', 100);
    expect(useTargetStore.getState().targets.rollCenterHeight.max).toBe(100);
  });

  it('resetTargets restores defaults', () => {
    useTargetStore.getState().updateTarget('dampingRatio', 'enabled', true);
    useTargetStore.getState().updateTarget('dampingRatio', 'min', 0.1);
    useTargetStore.getState().resetTargets();

    const { targets } = useTargetStore.getState();
    expect(targets.dampingRatio.enabled).toBe(false);
    expect(targets.dampingRatio.min).toBe(0.3);
  });

  it('toggleTargetsVisible flips visibility', () => {
    expect(useTargetStore.getState().targetsVisible).toBe(false);
    useTargetStore.getState().toggleTargetsVisible();
    expect(useTargetStore.getState().targetsVisible).toBe(true);
    useTargetStore.getState().toggleTargetsVisible();
    expect(useTargetStore.getState().targetsVisible).toBe(false);
  });
});

describe('evaluateTarget', () => {
  it('returns "none" for disabled target', () => {
    const target: TargetRange = { enabled: false, min: 10, max: 50 };
    expect(evaluateTarget(target, 30)).toBe('none');
  });

  it('returns "pass" for value within range', () => {
    const target: TargetRange = { enabled: true, min: 10, max: 50 };
    expect(evaluateTarget(target, 30)).toBe('pass');
  });

  it('returns "pass" for value at min boundary', () => {
    const target: TargetRange = { enabled: true, min: 10, max: 50 };
    expect(evaluateTarget(target, 10)).toBe('pass');
  });

  it('returns "pass" for value at max boundary', () => {
    const target: TargetRange = { enabled: true, min: 10, max: 50 };
    expect(evaluateTarget(target, 50)).toBe('pass');
  });

  it('returns "warn" for value slightly below min (within 10% margin)', () => {
    const target: TargetRange = { enabled: true, min: 10, max: 50 };
    // Range is 40, margin is 4, so 6 < 10 but >= 10-4=6
    expect(evaluateTarget(target, 7)).toBe('warn');
  });

  it('returns "warn" for value slightly above max (within 10% margin)', () => {
    const target: TargetRange = { enabled: true, min: 10, max: 50 };
    // Range is 40, margin is 4, so 53 > 50 but <= 50+4=54
    expect(evaluateTarget(target, 53)).toBe('warn');
  });

  it('returns "fail" for value well outside range', () => {
    const target: TargetRange = { enabled: true, min: 10, max: 50 };
    expect(evaluateTarget(target, 100)).toBe('fail');
  });

  it('returns "fail" for value well below min', () => {
    const target: TargetRange = { enabled: true, min: 10, max: 50 };
    expect(evaluateTarget(target, -5)).toBe('fail');
  });
});
