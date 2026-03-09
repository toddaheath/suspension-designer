import { describe, it, expect, beforeEach } from 'vitest';
import { useDesignStore } from '../designStore';

describe('useDesignStore', () => {
  beforeEach(() => {
    useDesignStore.getState().resetToDefaults();
  });

  describe('default hardpoints', () => {
    it('has correct structure with all expected hardpoint keys', () => {
      const { hardpoints } = useDesignStore.getState();

      const expectedKeys = [
        'upperWishboneFrontPivot',
        'upperWishboneRearPivot',
        'upperBallJoint',
        'lowerWishboneFrontPivot',
        'lowerWishboneRearPivot',
        'lowerBallJoint',
        'tieRodInner',
        'tieRodOuter',
        'springDamperLower',
        'springDamperUpper',
        'pushrodWheelEnd',
        'pushrodRockerEnd',
        'wheelCenter',
        'contactPatch',
      ];

      for (const key of expectedKeys) {
        expect(hardpoints).toHaveProperty(key);
      }
    });

    it('each hardpoint has x, y, z numeric coordinates', () => {
      const { hardpoints } = useDesignStore.getState();

      for (const point of Object.values(hardpoints)) {
        expect(point).toHaveProperty('x');
        expect(point).toHaveProperty('y');
        expect(point).toHaveProperty('z');
        expect(typeof point.x).toBe('number');
        expect(typeof point.y).toBe('number');
        expect(typeof point.z).toBe('number');
      }
    });
  });

  describe('updateHardpoint', () => {
    it('changes the correct value and sets isDirty', () => {
      const store = useDesignStore;

      expect(store.getState().isDirty).toBe(false);

      store.getState().updateHardpoint('upperBallJoint', 'x', 42);

      expect(store.getState().hardpoints.upperBallJoint.x).toBe(42);
      expect(store.getState().isDirty).toBe(true);
    });

    it('does not modify other hardpoints', () => {
      const store = useDesignStore;
      const originalLowerBallJoint = { ...store.getState().hardpoints.lowerBallJoint };

      store.getState().updateHardpoint('upperBallJoint', 'z', 999);

      expect(store.getState().hardpoints.lowerBallJoint).toEqual(originalLowerBallJoint);
    });
  });

  describe('updateVehicleParam', () => {
    it('changes the correct value and sets isDirty', () => {
      const store = useDesignStore;

      expect(store.getState().isDirty).toBe(false);

      store.getState().updateVehicleParam('trackWidth', 1400);

      expect(store.getState().vehicleParams.trackWidth).toBe(1400);
      expect(store.getState().isDirty).toBe(true);
    });

    it('does not modify other vehicle params', () => {
      const store = useDesignStore;
      const originalSpringRate = store.getState().vehicleParams.springRate;

      store.getState().updateVehicleParam('trackWidth', 1400);

      expect(store.getState().vehicleParams.springRate).toBe(originalSpringRate);
    });
  });

  describe('resetToDefaults', () => {
    it('restores original values after modifications', () => {
      const store = useDesignStore;

      // Capture defaults before any changes
      store.getState().resetToDefaults();
      const defaultHardpoints = { ...store.getState().hardpoints };
      const defaultVehicleParams = { ...store.getState().vehicleParams };

      // Make modifications
      store.getState().updateHardpoint('upperBallJoint', 'x', 999);
      store.getState().updateVehicleParam('trackWidth', 9999);
      store.getState().setName('Modified Design');

      // Verify modifications took effect
      expect(store.getState().hardpoints.upperBallJoint.x).toBe(999);
      expect(store.getState().vehicleParams.trackWidth).toBe(9999);
      expect(store.getState().name).toBe('Modified Design');
      expect(store.getState().isDirty).toBe(true);

      // Reset
      store.getState().resetToDefaults();

      // Verify defaults are restored
      expect(store.getState().hardpoints).toEqual(defaultHardpoints);
      expect(store.getState().vehicleParams).toEqual(defaultVehicleParams);
      expect(store.getState().name).toBe('Untitled Design');
      expect(store.getState().designId).toBeNull();
      expect(store.getState().isDirty).toBe(false);
    });
  });
});
