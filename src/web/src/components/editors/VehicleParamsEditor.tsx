import { useDesignStore } from '../../stores/designStore';
import { useUnitStore, displayValue, storageValue, unitLabel } from '../../stores/unitStore';
import ParameterGroup from './ParameterGroup';
import type { VehicleParams } from '../../types/suspension';

type UnitKey = 'length' | 'mass' | 'springRate' | 'damping' | 'ratio';

const PARAM_DEFS: {
  key: keyof VehicleParams;
  label: string;
  unitKey: UnitKey;
  step: number;
  min: number;
  max: number;
}[] = [
  { key: 'trackWidth', label: 'Track Width', unitKey: 'length', step: 10, min: 500, max: 3000 },
  { key: 'wheelbase', label: 'Wheelbase', unitKey: 'length', step: 10, min: 500, max: 5000 },
  { key: 'sprungMass', label: 'Sprung Mass', unitKey: 'mass', step: 5, min: 50, max: 5000 },
  { key: 'unsprungMass', label: 'Unsprung Mass', unitKey: 'mass', step: 1, min: 5, max: 200 },
  { key: 'springRate', label: 'Spring Rate', unitKey: 'springRate', step: 1, min: 1, max: 500 },
  { key: 'dampingCoefficient', label: 'Damping Coeff.', unitKey: 'damping', step: 100, min: 100, max: 50000 },
  { key: 'rideHeight', label: 'Ride Height', unitKey: 'length', step: 5, min: 10, max: 500 },
  { key: 'tireRadius', label: 'Tire Radius', unitKey: 'length', step: 5, min: 100, max: 500 },
  { key: 'cgHeight', label: 'CG Height', unitKey: 'length', step: 5, min: 50, max: 2000 },
  { key: 'frontBrakeProportion', label: 'Front Brake Bias', unitKey: 'ratio', step: 0.05, min: 0.3, max: 0.9 },
];

export default function VehicleParamsEditor() {
  const vehicleParams = useDesignStore((s) => s.vehicleParams);
  const updateVehicleParam = useDesignStore((s) => s.updateVehicleParam);
  const unitSystem = useUnitStore((s) => s.system);

  return (
    <ParameterGroup title="Vehicle Parameters">
      {PARAM_DEFS.map((def) => {
        const displayed = displayValue(vehicleParams[def.key], def.unitKey, unitSystem);
        const unit = unitLabel(def.unitKey, unitSystem);
        return (
          <div key={def.key} className="flex items-center gap-2 mb-1">
            <label htmlFor={`vp-${def.key}`} className="text-xs text-gray-400 w-28 shrink-0">
              {def.label}
            </label>
            <input
              id={`vp-${def.key}`}
              type="number"
              value={parseFloat(displayed.toFixed(def.unitKey === 'ratio' ? 3 : 2))}
              onChange={(e) => {
                const raw = parseFloat(e.target.value) || 0;
                updateVehicleParam(def.key, storageValue(raw, def.unitKey, unitSystem));
              }}
              step={def.step}
              min={displayValue(def.min, def.unitKey, unitSystem)}
              max={displayValue(def.max, def.unitKey, unitSystem)}
              title={`${displayValue(def.min, def.unitKey, unitSystem).toFixed(0)} – ${displayValue(def.max, def.unitKey, unitSystem).toFixed(0)} ${unit}`}
              className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 py-0.5 text-xs text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
            <span className="text-xs text-gray-500 w-10">{unit}</span>
          </div>
        );
      })}
    </ParameterGroup>
  );
}
