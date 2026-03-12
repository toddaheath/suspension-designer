import { useState, useMemo } from 'react';
import { useDesignStore } from '../../stores/designStore';
import { computeSensitivityHeatmap } from '../../services/sensitivityService';
import type { HeatmapResult } from '../../services/sensitivityService';

function cellColor(value: number): string {
  // 0 = dark blue (no sensitivity), 1 = bright red (max sensitivity)
  if (value < 0.1) return 'rgba(30, 58, 138, 0.3)';
  if (value < 0.25) return 'rgba(37, 99, 235, 0.5)';
  if (value < 0.5) return 'rgba(234, 179, 8, 0.5)';
  if (value < 0.75) return 'rgba(249, 115, 22, 0.6)';
  return 'rgba(239, 68, 68, 0.7)';
}

export default function SensitivityHeatmap() {
  const hardpoints = useDesignStore((s) => s.hardpoints);
  const vehicleParams = useDesignStore((s) => s.vehicleParams);
  const [result, setResult] = useState<HeatmapResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [perturbation, setPerturbation] = useState(5);

  const handleRun = () => {
    setIsRunning(true);
    setTimeout(() => {
      const r = computeSensitivityHeatmap(hardpoints, vehicleParams, perturbation);
      setResult(r);
      setIsRunning(false);
    }, 10);
  };

  const grid = useMemo(() => {
    if (!result) return null;
    const { cells, rows, cols } = result;
    const lookup = new Map<string, typeof cells[0]>();
    for (const c of cells) {
      lookup.set(`${c.hardpoint}.${c.axis}|${c.output}`, c);
    }
    return { rows, cols, lookup };
  }, [result]);

  return (
    <div className="p-3 space-y-3">
      <h3 className="text-sm font-semibold text-gray-300">Sensitivity Heatmap</h3>
      <p className="text-[10px] text-gray-500">
        Shows how much each hardpoint coordinate affects each output. Red = high sensitivity, blue = low.
      </p>

      <div className="flex items-center gap-2">
        <label className="text-[10px] text-gray-400">Perturbation (mm):</label>
        <input
          type="number"
          value={perturbation}
          onChange={(e) => setPerturbation(Math.max(1, parseInt(e.target.value) || 1))}
          className="w-16 bg-gray-800 border border-gray-600 rounded px-1.5 py-0.5 text-xs text-gray-200"
          min={1}
          max={50}
        />
        <button
          onClick={handleRun}
          disabled={isRunning}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded px-3 py-1 text-xs font-medium"
        >
          {isRunning ? 'Computing...' : 'Generate Heatmap'}
        </button>
      </div>

      {grid && (
        <div className="overflow-x-auto border border-gray-700 rounded">
          <table className="text-[9px] border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 bg-gray-900 px-1.5 py-1 text-gray-400 text-left border-b border-gray-700 z-10">Point</th>
                {grid.cols.map((col) => (
                  <th key={col} className="px-1.5 py-1 text-gray-400 text-center border-b border-gray-700 whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grid.rows.map((row) => (
                <tr key={row} className="hover:bg-gray-800/30">
                  <td className="sticky left-0 bg-gray-900 px-1.5 py-0.5 text-gray-300 font-mono border-b border-gray-800 z-10 whitespace-nowrap">
                    {row}
                  </td>
                  {grid.cols.map((col) => {
                    const cell = grid.lookup.get(`${row}|${col}`);
                    if (!cell) return <td key={col} className="px-1.5 py-0.5 border-b border-gray-800" />;
                    return (
                      <td
                        key={col}
                        className="px-1.5 py-0.5 text-center font-mono border-b border-gray-800 cursor-default"
                        style={{ backgroundColor: cellColor(cell.sensitivity) }}
                        title={`${row} -> ${col}: delta = ${cell.rawDelta.toFixed(4)} (${(cell.sensitivity * 100).toFixed(0)}%)`}
                      >
                        {cell.sensitivity > 0.01 ? (cell.sensitivity * 100).toFixed(0) : ''}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center gap-2 p-2 border-t border-gray-700">
            <span className="text-[9px] text-gray-500">Legend:</span>
            {[
              { label: 'Low', color: 'rgba(30, 58, 138, 0.3)' },
              { label: '', color: 'rgba(37, 99, 235, 0.5)' },
              { label: 'Mid', color: 'rgba(234, 179, 8, 0.5)' },
              { label: '', color: 'rgba(249, 115, 22, 0.6)' },
              { label: 'High', color: 'rgba(239, 68, 68, 0.7)' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-0.5">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
                {item.label && <span className="text-[9px] text-gray-500">{item.label}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
