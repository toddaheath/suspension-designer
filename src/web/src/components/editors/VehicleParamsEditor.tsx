import { useDesignStore } from '../../stores/designStore';
import ParameterGroup from './ParameterGroup';
import type { VehicleParams } from '../../types/suspension';

const PARAM_DEFS: {
  key: keyof VehicleParams;
  label: string;
  unit: string;
  step: number;
}[] = [
  { key: 'trackWidth', label: 'Track Width', unit: 'mm', step: 10 },
  { key: 'wheelbase', label: 'Wheelbase', unit: 'mm', step: 10 },
  { key: 'sprungMass', label: 'Sprung Mass', unit: 'kg', step: 5 },
  { key: 'unsprungMass', label: 'Unsprung Mass', unit: 'kg', step: 1 },
  { key: 'springRate', label: 'Spring Rate', unit: 'N/mm', step: 1 },
  { key: 'dampingCoefficient', label: 'Damping Coeff.', unit: 'Ns/m', step: 100 },
  { key: 'rideHeight', label: 'Ride Height', unit: 'mm', step: 5 },
  { key: 'tireRadius', label: 'Tire Radius', unit: 'mm', step: 5 },
  { key: 'cgHeight', label: 'CG Height', unit: 'mm', step: 5 },
  { key: 'frontBrakeProportion', label: 'Front Brake Bias', unit: '', step: 0.05 },
];

export default function VehicleParamsEditor() {
  const vehicleParams = useDesignStore((s) => s.vehicleParams);
  const updateVehicleParam = useDesignStore((s) => s.updateVehicleParam);

  return (
    <ParameterGroup title="Vehicle Parameters">
      {PARAM_DEFS.map((def) => (
        <div key={def.key} className="flex items-center gap-2 mb-1">
          <label htmlFor={`vp-${def.key}`} className="text-xs text-gray-400 w-28 shrink-0">
            {def.label}
          </label>
          <input
            id={`vp-${def.key}`}
            type="number"
            value={vehicleParams[def.key]}
            onChange={(e) =>
              updateVehicleParam(def.key, parseFloat(e.target.value) || 0)
            }
            step={def.step}
            className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 py-0.5 text-xs text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
          <span className="text-xs text-gray-500 w-10">{def.unit}</span>
        </div>
      ))}
    </ParameterGroup>
  );
}
