import { describe, it, expect, beforeEach } from 'vitest';
import { useComparisonStore } from '../comparisonStore';

describe('comparisonStore', () => {
  beforeEach(() => {
    useComparisonStore.setState({
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
      isLoading: false,
      error: null,
    });
  });

  it('starts inactive', () => {
    const state = useComparisonStore.getState();
    expect(state.isActive).toBe(false);
    expect(state.designName).toBeNull();
  });

  it('clearComparison resets all state', () => {
    useComparisonStore.setState({
      isActive: true,
      designName: 'Test',
      designId: '123',
    });

    useComparisonStore.getState().clearComparison();
    const state = useComparisonStore.getState();
    expect(state.isActive).toBe(false);
    expect(state.designName).toBeNull();
    expect(state.designId).toBeNull();
  });

  it('has correct initial curve arrays', () => {
    const state = useComparisonStore.getState();
    expect(state.camberCurve).toEqual([]);
    expect(state.rollCenterCurve).toEqual([]);
    expect(state.bumpSteerCurve).toEqual([]);
  });
});
