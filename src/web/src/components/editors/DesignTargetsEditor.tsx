import { useState } from 'react';
import { useTargetStore, TARGET_DEFINITIONS, BUILT_IN_PRESETS } from '../../stores/targetStore';
import type { TargetKey } from '../../stores/targetStore';
import { useNotificationStore } from '../../stores/notificationStore';
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
  const loadPreset = useTargetStore((s) => s.loadPreset);
  const saveAsPreset = useTargetStore((s) => s.saveAsPreset);
  const deletePreset = useTargetStore((s) => s.deletePreset);
  const customPresets = useTargetStore((s) => s.customPresets);
  const [saveName, setSaveName] = useState('');
  const [showSave, setShowSave] = useState(false);
  const addNotification = useNotificationStore((s) => s.addNotification);

  const allPresets = [...BUILT_IN_PRESETS, ...customPresets];

  const handleLoadPreset = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.value;
    if (!name) return;
    const preset = allPresets.find((p) => p.name === name);
    if (preset) {
      loadPreset(preset);
      addNotification('success', `Loaded target preset: ${name}`);
    }
    e.target.value = '';
  };

  const handleSave = () => {
    const trimmed = saveName.trim();
    if (!trimmed) return;
    saveAsPreset(trimmed);
    addNotification('success', `Saved target preset: ${trimmed}`);
    setSaveName('');
    setShowSave(false);
  };

  return (
    <ParameterGroup title="Design Targets" defaultOpen={false}>
      {/* Preset selector */}
      <div className="mb-2 space-y-1">
        <select
          onChange={handleLoadPreset}
          defaultValue=""
          className="w-full bg-gray-800 border border-gray-600 rounded px-1.5 py-1 text-xs text-gray-200 focus:border-blue-500 focus:outline-none"
        >
          <option value="" disabled>Load preset...</option>
          <optgroup label="Built-in">
            {BUILT_IN_PRESETS.map((p) => (
              <option key={p.name} value={p.name}>{p.name}</option>
            ))}
          </optgroup>
          {customPresets.length > 0 && (
            <optgroup label="Custom">
              {customPresets.map((p) => (
                <option key={p.name} value={p.name}>{p.name}</option>
              ))}
            </optgroup>
          )}
        </select>
        <div className="flex gap-1">
          {!showSave ? (
            <button
              onClick={() => setShowSave(true)}
              className="flex-1 px-2 py-0.5 text-[10px] bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 text-gray-400"
            >
              Save as Preset
            </button>
          ) : (
            <>
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                placeholder="Preset name"
                className="flex-1 bg-gray-800 border border-gray-600 rounded px-1.5 py-0.5 text-xs text-gray-200 focus:border-blue-500 focus:outline-none"
                autoFocus
              />
              <button onClick={handleSave} className="px-2 py-0.5 text-[10px] bg-blue-600 hover:bg-blue-500 rounded text-white">
                Save
              </button>
              <button onClick={() => { setShowSave(false); setSaveName(''); }} className="px-1.5 py-0.5 text-[10px] bg-gray-700 hover:bg-gray-600 rounded text-gray-400">
                X
              </button>
            </>
          )}
          {customPresets.length > 0 && !showSave && (
            <button
              onClick={() => {
                const name = prompt('Delete which custom preset?', customPresets[0]?.name);
                if (name) {
                  deletePreset(name);
                  addNotification('info', `Deleted preset: ${name}`);
                }
              }}
              className="px-2 py-0.5 text-[10px] bg-gray-800 hover:bg-red-900/50 rounded border border-gray-700 text-gray-500 hover:text-red-400"
              title="Delete a custom preset"
            >
              Del
            </button>
          )}
        </div>
      </div>

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
