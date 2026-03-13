import { useState, useRef, useEffect, useCallback } from 'react';
import { useDesignStore } from '../../stores/designStore';
import { VEHICLE_PRESETS } from '../../data/vehiclePresets';

export default function DesignToolbar() {
  const applyPreset = useDesignStore((s) => s.applyPreset);
  const exportToJson = useDesignStore((s) => s.exportToJson);
  const importFromJson = useDesignStore((s) => s.importFromJson);
  const resetToDefaults = useDesignStore((s) => s.resetToDefaults);
  const undo = useDesignStore((s) => s.undo);
  const redo = useDesignStore((s) => s.redo);
  const canUndo = useDesignStore((s) => s.canUndo);
  const canRedo = useDesignStore((s) => s.canRedo);
  const [presetOpen, setPresetOpen] = useState(false);
  const [importError, setImportError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const presetRef = useRef<HTMLDivElement>(null);

  // Close preset dropdown on click outside
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (presetRef.current && !presetRef.current.contains(e.target as Node)) {
      setPresetOpen(false);
    }
  }, []);

  useEffect(() => {
    if (presetOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [presetOpen, handleClickOutside]);

  // Keyboard shortcuts: Ctrl/Cmd+Z for undo, Ctrl/Cmd+Shift+Z for redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const handleExport = () => {
    const json = exportToJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'suspension-design.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError('');
    const reader = new FileReader();
    reader.onload = () => {
      const error = importFromJson(reader.result as string);
      if (error) setImportError(error);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1 flex-wrap">
        {/* Undo / Redo */}
        <button
          onClick={undo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className="px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Undo
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          title="Redo (Ctrl+Shift+Z)"
          className="px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Redo
        </button>

        <div className="w-px h-4 bg-gray-700 mx-0.5" />

        {/* Presets dropdown */}
        <div className="relative" ref={presetRef}>
          <button
            onClick={() => setPresetOpen(!presetOpen)}
            className="px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 text-gray-300"
          >
            Presets
          </button>
          {presetOpen && (
            <div className="absolute z-50 mt-1 left-0 w-52 bg-gray-800 border border-gray-600 rounded shadow-lg">
              {VEHICLE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    applyPreset(preset);
                    setPresetOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-gray-700 border-b border-gray-700 last:border-b-0"
                >
                  <div className="text-gray-200 font-medium">{preset.name}</div>
                  <div className="text-gray-500 text-[10px]">{preset.description}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleExport}
          className="px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 text-gray-300"
        >
          Export
        </button>

        <button
          onClick={() => fileRef.current?.click()}
          className="px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 text-gray-300"
        >
          Import
        </button>
        <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />

        <button
          onClick={resetToDefaults}
          className="px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 text-gray-400"
        >
          Reset
        </button>
      </div>

      {importError && (
        <div className="text-xs text-red-400">{importError}</div>
      )}
    </div>
  );
}
