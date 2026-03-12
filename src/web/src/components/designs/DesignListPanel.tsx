import { useEffect, useState } from 'react';
import { useDesignStore } from '../../stores/designStore';
import { useAuthStore } from '../../stores/authStore';
import { useComparisonStore } from '../../stores/comparisonStore';

export default function DesignListPanel() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const savedDesigns = useDesignStore((s) => s.savedDesigns);
  const isLoadingDesigns = useDesignStore((s) => s.isLoadingDesigns);
  const isSaving = useDesignStore((s) => s.isSaving);
  const isDirty = useDesignStore((s) => s.isDirty);
  const designName = useDesignStore((s) => s.name);
  const designId = useDesignStore((s) => s.designId);
  const fetchDesigns = useDesignStore((s) => s.fetchDesigns);
  const loadDesign = useDesignStore((s) => s.loadDesign);
  const saveDesign = useDesignStore((s) => s.saveDesign);
  const deleteDesignAction = useDesignStore((s) => s.deleteDesign);
  const cloneDesign = useDesignStore((s) => s.cloneDesign);
  const setName = useDesignStore((s) => s.setName);
  const resetToDefaults = useDesignStore((s) => s.resetToDefaults);

  const comparisonId = useComparisonStore((s) => s.designId);
  const loadForComparison = useComparisonStore((s) => s.loadForComparison);
  const clearComparison = useComparisonStore((s) => s.clearComparison);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDesigns();
    }
  }, [isAuthenticated, fetchDesigns]);

  if (!isAuthenticated) {
    return (
      <div className="p-3 text-xs text-gray-500">
        Login to save and load designs.
      </div>
    );
  }

  return (
    <div className="p-3 space-y-3">
      <h3 className="text-sm font-semibold text-gray-300">Designs</h3>

      {/* Current design name + save */}
      <div className="space-y-2">
        <input
          type="text"
          value={designName}
          onChange={(e) => setName(e.target.value)}
          placeholder="Design name"
          className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-gray-200 focus:border-blue-500 focus:outline-none"
        />
        <div className="flex gap-2">
          <button
            onClick={saveDesign}
            disabled={isSaving}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded py-1 text-xs font-medium"
          >
            {isSaving ? 'Saving...' : isDirty ? 'Save *' : 'Save'}
          </button>
          <button
            onClick={cloneDesign}
            disabled={!designId}
            className="px-3 bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed text-gray-300 rounded py-1 text-xs"
            title="Duplicate current design"
          >
            Clone
          </button>
          <button
            onClick={resetToDefaults}
            className="px-3 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded py-1 text-xs"
          >
            New
          </button>
        </div>
      </div>

      {/* Saved designs list */}
      <div className="border-t border-gray-700 pt-2">
        {isLoadingDesigns ? (
          <div className="text-xs text-gray-500">Loading...</div>
        ) : savedDesigns.length === 0 ? (
          <div className="text-xs text-gray-500">No saved designs</div>
        ) : (
          <div className="space-y-1">
            {savedDesigns.map((d) => (
              <div
                key={d.id}
                className={`flex items-center justify-between px-2 py-1.5 rounded text-xs cursor-pointer transition-colors ${
                  d.id === designId
                    ? 'bg-blue-900/40 border border-blue-700 text-blue-300'
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-transparent'
                }`}
                onClick={() => loadDesign(d.id)}
              >
                <div className="truncate flex-1 mr-2">{d.name}</div>
                {confirmDeleteId === d.id ? (
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteDesignAction(d.id);
                        setConfirmDeleteId(null);
                      }}
                      className="px-1.5 py-0.5 bg-red-700 hover:bg-red-600 text-white rounded text-[10px]"
                    >
                      Yes
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDeleteId(null);
                      }}
                      className="px-1.5 py-0.5 bg-gray-600 hover:bg-gray-500 text-gray-200 rounded text-[10px]"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-0.5 shrink-0">
                    {d.id !== designId && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (comparisonId === d.id) {
                            clearComparison();
                          } else {
                            loadForComparison(d.id);
                          }
                        }}
                        className={`text-[10px] px-1 rounded ${
                          comparisonId === d.id
                            ? 'text-purple-400 hover:text-purple-300'
                            : 'text-gray-500 hover:text-purple-400'
                        }`}
                        title={comparisonId === d.id ? 'Clear comparison' : 'Compare with current design'}
                      >
                        {comparisonId === d.id ? 'Comparing' : 'Compare'}
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDeleteId(d.id);
                      }}
                      className="text-gray-500 hover:text-red-400 px-1"
                      title="Delete"
                    >
                      x
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
