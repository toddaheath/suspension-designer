import { useTargetStore, TARGET_DEFINITIONS } from '../../stores/targetStore';
import type { TargetKey } from '../../stores/targetStore';
import ParameterGroup from './ParameterGroup';

function TargetRow({ targetKey }: { targetKey: TargetKey }) {
  const def = TARGET_DEFINITIONS.find((d) => d.key === targetKey)!;
  const target = useTargetStore((s) => s.targets[targetKey]);
  const updateTarget = useTargetStore((s) => s.updateTarget);

  return (
    <div className="mb-2">
      <div className="flex items-center gap-2 mb-1">
        <input
          type="checkbox"
          checked={target.enabled}
          onChange={(e) => updateTarget(targetKey, 'enabled', e.target.checked)}
          className="w-3 h-3 rounded accent-blue-500"
          id={`target-${targetKey}`}
        />
        <label htmlFor={`target-${targetKey}`} className="text-xs text-gray-300 flex-1">
          {def.label}
        </label>
        {def.unit && <span className="text-[10px] text-gray-500">{def.unit}</span>}
      </div>
      {target.enabled && (
        <div className="flex items-center gap-2 pl-5">
          <label className="text-[10px] text-gray-500">Min</label>
          <input
            type="number"
            value={target.min}
            onChange={(e) => updateTarget(targetKey, 'min', parseFloat(e.target.value) || 0)}
            className="w-16 bg-gray-800 border border-gray-600 rounded px-1.5 py-0.5 text-xs text-gray-200 focus:border-blue-500 focus:outline-none"
            step={def.unit === '' ? 0.1 : 1}
          />
          <label className="text-[10px] text-gray-500">Max</label>
          <input
            type="number"
            value={target.max}
            onChange={(e) => updateTarget(targetKey, 'max', parseFloat(e.target.value) || 0)}
            className="w-16 bg-gray-800 border border-gray-600 rounded px-1.5 py-0.5 text-xs text-gray-200 focus:border-blue-500 focus:outline-none"
            step={def.unit === '' ? 0.1 : 1}
          />
        </div>
      )}
    </div>
  );
}

export default function DesignTargetsEditor() {
  const resetTargets = useTargetStore((s) => s.resetTargets);

  return (
    <ParameterGroup title="Design Targets" defaultOpen={false}>
      {TARGET_DEFINITIONS.map((def) => (
        <TargetRow key={def.key} targetKey={def.key} />
      ))}
      <button
        onClick={resetTargets}
        className="w-full mt-1 px-2 py-1 text-[10px] bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 text-gray-400"
      >
        Reset Targets
      </button>
    </ParameterGroup>
  );
}
