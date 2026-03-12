import { describe, it, expect, beforeEach } from 'vitest';
import { VEHICLE_PRESETS } from '../../data/vehiclePresets';
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

  describe('undo/redo', () => {
    it('canUndo is false initially after a fresh reset with no modifications', () => {
      const store = useDesignStore;
      // Drain any leftover undo entries from prior tests
      while (store.getState().canUndo) {
        store.getState().undo();
      }
      // Drain redo stack too
      while (store.getState().canRedo) {
        store.getState().redo();
      }
      while (store.getState().canUndo) {
        store.getState().undo();
      }
      expect(store.getState().canUndo).toBe(false);
    });

    it('canUndo becomes true after updateHardpoint', () => {
      const store = useDesignStore;
      store.getState().updateHardpoint('upperBallJoint', 'x', 42);
      expect(store.getState().canUndo).toBe(true);
    });

    it('undo restores the previous hardpoint value', () => {
      const store = useDesignStore;
      const originalX = store.getState().hardpoints.upperBallJoint.x;

      store.getState().updateHardpoint('upperBallJoint', 'x', 777);
      expect(store.getState().hardpoints.upperBallJoint.x).toBe(777);

      store.getState().undo();
      expect(store.getState().hardpoints.upperBallJoint.x).toBe(originalX);
    });

    it('canRedo becomes true after undo', () => {
      const store = useDesignStore;
      store.getState().updateHardpoint('lowerBallJoint', 'y', 555);
      store.getState().undo();
      expect(store.getState().canRedo).toBe(true);
    });

    it('redo restores the value again after undo', () => {
      const store = useDesignStore;
      store.getState().updateHardpoint('upperBallJoint', 'z', 123);
      store.getState().undo();
      store.getState().redo();
      expect(store.getState().hardpoints.upperBallJoint.z).toBe(123);
    });

    it('undo with empty stack does nothing', () => {
      const store = useDesignStore;
      // Drain any leftover undo entries
      while (store.getState().canUndo) {
        store.getState().undo();
      }
      // Drain redo too
      while (store.getState().canRedo) {
        store.getState().redo();
      }
      while (store.getState().canUndo) {
        store.getState().undo();
      }

      const stateBefore = {
        hardpoints: JSON.parse(JSON.stringify(store.getState().hardpoints)),
        vehicleParams: JSON.parse(JSON.stringify(store.getState().vehicleParams)),
      };

      store.getState().undo();

      expect(JSON.parse(JSON.stringify(store.getState().hardpoints))).toEqual(stateBefore.hardpoints);
      expect(JSON.parse(JSON.stringify(store.getState().vehicleParams))).toEqual(stateBefore.vehicleParams);
    });
  });

  describe('setName', () => {
    it('changes the name', () => {
      const store = useDesignStore;
      store.getState().setName('My Custom Design');
      expect(store.getState().name).toBe('My Custom Design');
    });

    it('sets isDirty to true', () => {
      const store = useDesignStore;
      expect(store.getState().isDirty).toBe(false);
      store.getState().setName('New Name');
      expect(store.getState().isDirty).toBe(true);
    });
  });

  describe('applyPreset', () => {
    it('updates hardpoints and vehicleParams from preset', () => {
      const store = useDesignStore;
      const preset = VEHICLE_PRESETS[0]; // FSAE

      store.getState().applyPreset(preset);

      expect(store.getState().hardpoints.upperBallJoint).toEqual(preset.hardpoints.upperBallJoint);
      expect(store.getState().hardpoints.lowerBallJoint).toEqual(preset.hardpoints.lowerBallJoint);
      expect(store.getState().vehicleParams.trackWidth).toBe(preset.vehicleParams.trackWidth);
      expect(store.getState().vehicleParams.springRate).toBe(preset.vehicleParams.springRate);
      expect(store.getState().vehicleParams.tireRadius).toBe(preset.vehicleParams.tireRadius);
    });

    it('sets isDirty to true', () => {
      const store = useDesignStore;
      expect(store.getState().isDirty).toBe(false);

      store.getState().applyPreset(VEHICLE_PRESETS[0]);
      expect(store.getState().isDirty).toBe(true);
    });

    it('sets designId to null', () => {
      const store = useDesignStore;
      store.getState().applyPreset(VEHICLE_PRESETS[0]);
      expect(store.getState().designId).toBeNull();
    });

    it('sets name to preset name', () => {
      const store = useDesignStore;
      const preset = VEHICLE_PRESETS[1]; // Road Sport Car

      store.getState().applyPreset(preset);
      expect(store.getState().name).toBe(preset.name);
    });
  });

  describe('cloneDesign', () => {
    it('prefixes name with "Copy of"', () => {
      const store = useDesignStore;
      store.getState().setName('My Design');
      store.getState().cloneDesign();
      expect(store.getState().name).toBe('Copy of My Design');
    });

    it('clears designId and sets isDirty', () => {
      const store = useDesignStore;
      store.getState().setName('Test');
      store.getState().cloneDesign();
      expect(store.getState().designId).toBeNull();
      expect(store.getState().isDirty).toBe(true);
    });

    it('preserves hardpoints and vehicleParams', () => {
      const store = useDesignStore;
      store.getState().updateHardpoint('upperBallJoint', 'x', 42);
      const hpBefore = JSON.parse(JSON.stringify(store.getState().hardpoints));
      const vpBefore = JSON.parse(JSON.stringify(store.getState().vehicleParams));

      store.getState().cloneDesign();

      expect(JSON.parse(JSON.stringify(store.getState().hardpoints))).toEqual(hpBefore);
      expect(JSON.parse(JSON.stringify(store.getState().vehicleParams))).toEqual(vpBefore);
    });
  });

  describe('exportToJson / importFromJson', () => {
    it('exportToJson returns valid JSON with name, hardpoints, vehicleParams', () => {
      const store = useDesignStore;
      store.getState().setName('Export Test');

      const json = store.getState().exportToJson();
      const parsed = JSON.parse(json);

      expect(parsed).toHaveProperty('name', 'Export Test');
      expect(parsed).toHaveProperty('hardpoints');
      expect(parsed).toHaveProperty('vehicleParams');
      expect(parsed.hardpoints).toHaveProperty('upperBallJoint');
      expect(parsed.vehicleParams).toHaveProperty('trackWidth');
    });

    it('importFromJson with valid JSON updates the store', () => {
      const store = useDesignStore;

      // First export a known state
      store.getState().setName('Original');
      store.getState().updateHardpoint('upperBallJoint', 'x', 42);
      const json = store.getState().exportToJson();

      // Reset to defaults so store is different
      store.getState().resetToDefaults();
      expect(store.getState().hardpoints.upperBallJoint.x).not.toBe(42);

      // Import the saved JSON
      const result = store.getState().importFromJson(json);

      expect(result).toBe(true);
      expect(store.getState().name).toBe('Original');
      expect(store.getState().hardpoints.upperBallJoint.x).toBe(42);
      expect(store.getState().isDirty).toBe(true);
      expect(store.getState().designId).toBeNull();
    });

    it('importFromJson with invalid JSON returns false', () => {
      const store = useDesignStore;
      const result = store.getState().importFromJson('not valid json {{{');
      expect(result).toBe(false);
    });

    it('importFromJson with missing hardpoints returns false', () => {
      const store = useDesignStore;
      const json = JSON.stringify({ name: 'No hardpoints', vehicleParams: {} });
      // The store checks !data.hardpoints — an empty object is truthy, but
      // a payload with hardpoints explicitly absent should fail.
      const jsonMissing = JSON.stringify({ name: 'Missing', vehicleParams: { trackWidth: 1200 } });
      // Remove hardpoints key entirely
      const obj = JSON.parse(jsonMissing);
      delete obj.hardpoints;
      const result = store.getState().importFromJson(JSON.stringify(obj));
      expect(result).toBe(false);
    });

    it('importFromJson rejects hardpoint missing x/y/z', () => {
      const store = useDesignStore;
      const exported = JSON.parse(store.getState().exportToJson());
      exported.hardpoints.upperBallJoint = { x: 1 }; // missing y, z
      const result = store.getState().importFromJson(JSON.stringify(exported));
      expect(result).toBe(false);
    });

    it('importFromJson rejects non-numeric hardpoint coordinates', () => {
      const store = useDesignStore;
      const exported = JSON.parse(store.getState().exportToJson());
      exported.hardpoints.lowerBallJoint = { x: 'bad', y: 0, z: 0 };
      const result = store.getState().importFromJson(JSON.stringify(exported));
      expect(result).toBe(false);
    });

    it('importFromJson rejects zero or negative trackWidth', () => {
      const store = useDesignStore;
      const exported = JSON.parse(store.getState().exportToJson());
      exported.vehicleParams.trackWidth = 0;
      const result = store.getState().importFromJson(JSON.stringify(exported));
      expect(result).toBe(false);
    });

    it('importFromJson rejects missing springRate', () => {
      const store = useDesignStore;
      const exported = JSON.parse(store.getState().exportToJson());
      delete exported.vehicleParams.springRate;
      const result = store.getState().importFromJson(JSON.stringify(exported));
      expect(result).toBe(false);
    });
  });
});
