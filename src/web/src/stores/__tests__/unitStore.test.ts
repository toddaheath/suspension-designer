import { describe, it, expect, beforeEach } from 'vitest';
import { useUnitStore, displayValue, storageValue, unitLabel, UNITS } from '../unitStore';

describe('unitStore', () => {
  beforeEach(() => {
    useUnitStore.setState({ system: 'metric' });
  });

  it('starts in metric', () => {
    expect(useUnitStore.getState().system).toBe('metric');
  });

  it('toggles to imperial and back', () => {
    useUnitStore.getState().toggle();
    expect(useUnitStore.getState().system).toBe('imperial');
    useUnitStore.getState().toggle();
    expect(useUnitStore.getState().system).toBe('metric');
  });

  it('setSystem sets the system directly', () => {
    useUnitStore.getState().setSystem('imperial');
    expect(useUnitStore.getState().system).toBe('imperial');
  });
});

describe('displayValue', () => {
  it('returns the same value in metric', () => {
    expect(displayValue(100, 'length', 'metric')).toBe(100);
  });

  it('converts mm to inches in imperial', () => {
    expect(displayValue(25.4, 'length', 'imperial')).toBeCloseTo(1, 5);
  });

  it('converts kg to lbs in imperial', () => {
    expect(displayValue(1, 'mass', 'imperial')).toBeCloseTo(2.20462, 4);
  });

  it('does not convert angles', () => {
    expect(displayValue(45, 'angle', 'imperial')).toBe(45);
  });

  it('does not convert percentages', () => {
    expect(displayValue(50, 'percent', 'imperial')).toBe(50);
  });
});

describe('storageValue', () => {
  it('returns the same value in metric', () => {
    expect(storageValue(100, 'length', 'metric')).toBe(100);
  });

  it('converts inches to mm for storage', () => {
    expect(storageValue(1, 'length', 'imperial')).toBeCloseTo(25.4, 5);
  });

  it('round-trips correctly', () => {
    const original = 300;
    const displayed = displayValue(original, 'length', 'imperial');
    const stored = storageValue(displayed, 'length', 'imperial');
    expect(stored).toBeCloseTo(original, 5);
  });
});

describe('unitLabel', () => {
  it('returns mm for metric length', () => {
    expect(unitLabel('length', 'metric')).toBe('mm');
  });

  it('returns in for imperial length', () => {
    expect(unitLabel('length', 'imperial')).toBe('in');
  });

  it('returns empty string for ratio', () => {
    expect(unitLabel('ratio', 'metric')).toBe('');
  });
});

describe('UNITS', () => {
  it('has expected unit types', () => {
    expect(UNITS).toHaveProperty('length');
    expect(UNITS).toHaveProperty('mass');
    expect(UNITS).toHaveProperty('springRate');
    expect(UNITS).toHaveProperty('damping');
    expect(UNITS).toHaveProperty('angle');
    expect(UNITS).toHaveProperty('frequency');
    expect(UNITS).toHaveProperty('ratio');
    expect(UNITS).toHaveProperty('percent');
  });
});
