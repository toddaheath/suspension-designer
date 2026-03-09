import { describe, it, expect, beforeEach } from 'vitest';
import { useCalculationStore } from '../calculationStore';

describe('useCalculationStore', () => {
  beforeEach(() => {
    useCalculationStore.setState({
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

  describe('initial state', () => {
    it('has null geometry result', () => {
      const { geometryResult } = useCalculationStore.getState();
      expect(geometryResult).toBeNull();
    });

    it('has null dynamics result', () => {
      const { dynamicsResult } = useCalculationStore.getState();
      expect(dynamicsResult).toBeNull();
    });

    it('has null anti-geometry result', () => {
      const { antiGeometryResult } = useCalculationStore.getState();
      expect(antiGeometryResult).toBeNull();
    });

    it('has null steering result', () => {
      const { steeringResult } = useCalculationStore.getState();
      expect(steeringResult).toBeNull();
    });

    it('has empty camber curve array', () => {
      const { camberCurve } = useCalculationStore.getState();
      expect(camberCurve).toEqual([]);
    });

    it('has empty roll center curve array', () => {
      const { rollCenterCurve } = useCalculationStore.getState();
      expect(rollCenterCurve).toEqual([]);
    });

    it('has empty bump steer curve array', () => {
      const { bumpSteerCurve } = useCalculationStore.getState();
      expect(bumpSteerCurve).toEqual([]);
    });

    it('is not loading', () => {
      const { isLoading } = useCalculationStore.getState();
      expect(isLoading).toBe(false);
    });

    it('has no error', () => {
      const { error } = useCalculationStore.getState();
      expect(error).toBeNull();
    });
  });

  describe('store interface', () => {
    it('has fetchAll method', () => {
      const { fetchAll } = useCalculationStore.getState();
      expect(typeof fetchAll).toBe('function');
    });
  });
});
