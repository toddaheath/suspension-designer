import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { useDesignStore } from '../../stores/designStore';
import {
  runSensitivitySweep,
  SWEEPABLE_HARDPOINTS,
} from '../../services/sensitivityService';
import type { SensitivityResult } from '../../services/sensitivityService';
import type { DoubleWishboneHardpoints } from '../../types/suspension';

const OUTPUT_KEYS = [
  { key: 'rollCenterHeight', label: 'Roll Center Height', unit: 'mm', extract: (p: SensitivityResult['points'][0]) => p.geometry.rollCenterHeight },
  { key: 'kpi', label: 'KPI', unit: 'deg', extract: (p: SensitivityResult['points'][0]) => p.geometry.kingpinInclinationDegrees },
  { key: 'caster', label: 'Caster', unit: 'deg', extract: (p: SensitivityResult['points'][0]) => p.geometry.casterAngleDegrees },
  { key: 'scrubRadius', label: 'Scrub Radius', unit: 'mm', extract: (p: SensitivityResult['points'][0]) => p.geometry.scrubRadius },
  { key: 'mechanicalTrail', label: 'Mech. Trail', unit: 'mm', extract: (p: SensitivityResult['points'][0]) => p.geometry.mechanicalTrail },
  { key: 'motionRatio', label: 'Motion Ratio', unit: '', extract: (p: SensitivityResult['points'][0]) => p.dynamics.motionRatio },
  { key: 'wheelRate', label: 'Wheel Rate', unit: 'N/mm', extract: (p: SensitivityResult['points'][0]) => p.dynamics.wheelRate },
  { key: 'naturalFreq', label: 'Nat. Frequency', unit: 'Hz', extract: (p: SensitivityResult['points'][0]) => p.dynamics.naturalFrequency },
  { key: 'antiDive', label: 'Anti-Dive', unit: '%', extract: (p: SensitivityResult['points'][0]) => p.antiGeometry.antiDivePercent },
  { key: 'antiSquat', label: 'Anti-Squat', unit: '%', extract: (p: SensitivityResult['points'][0]) => p.antiGeometry.antiSquatPercent },
] as const;

const CHART_COLORS = [
  '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6',
  '#1abc9c', '#e67e22', '#34495e', '#e84393', '#00cec9',
];

export default function SensitivityPanel() {
  const hardpoints = useDesignStore((s) => s.hardpoints);
  const vehicleParams = useDesignStore((s) => s.vehicleParams);

  const [selectedHardpoint, setSelectedHardpoint] = useState<keyof DoubleWishboneHardpoints>('upperBallJoint');
  const [selectedAxis, setSelectedAxis] = useState<'x' | 'y' | 'z'>('z');
  const [range, setRange] = useState(30);
  const [steps, setSteps] = useState(20);
  const [result, setResult] = useState<SensitivityResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const baseValue = hardpoints[selectedHardpoint][selectedAxis];

  const handleRun = () => {
    setIsRunning(true);
    // Use setTimeout to avoid blocking the UI
    setTimeout(() => {
      const r = runSensitivitySweep(hardpoints, vehicleParams, selectedHardpoint, selectedAxis, range, steps);
      setResult(r);
      setIsRunning(false);
    }, 10);
  };

  const chartData = useMemo(() => {
    if (!result) return [];
    return result.points.map((p) => {
      const row: Record<string, number> = { paramValue: p.paramValue };
      for (const out of OUTPUT_KEYS) {
        row[out.key] = out.extract(p);
      }
      return row;
    });
  }, [result]);

  const selectedLabel = SWEEPABLE_HARDPOINTS.find((h) => h.key === selectedHardpoint)?.label ?? selectedHardpoint;

  return (
    <div className="p-3 space-y-3">
      <h3 className="text-sm font-semibold text-gray-300">Parametric Sensitivity</h3>

      {/* Controls */}
      <div className="space-y-2">
        <div>
          <label className="text-[10px] text-gray-400 block mb-0.5">Hardpoint</label>
          <select
            value={selectedHardpoint}
            onChange={(e) => setSelectedHardpoint(e.target.value as keyof DoubleWishboneHardpoints)}
            className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-gray-200"
          >
            {SWEEPABLE_HARDPOINTS.map((h) => (
              <option key={h.key} value={h.key}>{h.label}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-[10px] text-gray-400 block mb-0.5">Axis</label>
            <div className="flex gap-1">
              {(['x', 'y', 'z'] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => setSelectedAxis(a)}
                  className={`flex-1 py-1 text-xs rounded border ${
                    selectedAxis === a
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {a.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="w-20">
            <label className="text-[10px] text-gray-400 block mb-0.5">Range (mm)</label>
            <input
              type="number"
              value={range}
              onChange={(e) => setRange(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-gray-200"
              min={1}
              max={200}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400">
            Base: {baseValue.toFixed(0)} mm | Sweep: {(baseValue - range).toFixed(0)} to {(baseValue + range).toFixed(0)} mm
          </span>
        </div>

        <button
          onClick={handleRun}
          disabled={isRunning}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded py-1.5 text-xs font-medium"
        >
          {isRunning ? 'Running...' : 'Run Sensitivity Study'}
        </button>
      </div>

      {/* Results - small multiples */}
      {result && chartData.length > 0 && (
        <div className="space-y-1 border-t border-gray-700 pt-3">
          <div className="text-[10px] text-gray-400 mb-2">
            {selectedLabel} {selectedAxis.toUpperCase()} sensitivity ({(baseValue - range).toFixed(0)} to {(baseValue + range).toFixed(0)} mm)
          </div>
          <div className="grid grid-cols-2 gap-2">
            {OUTPUT_KEYS.map((out, idx) => (
              <MiniChart
                key={out.key}
                data={chartData}
                dataKey={out.key}
                label={out.label}
                unit={out.unit}
                color={CHART_COLORS[idx % CHART_COLORS.length]}
                baseValue={baseValue}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MiniChart({
  data,
  dataKey,
  label,
  unit,
  color,
  baseValue,
}: {
  data: Record<string, number>[];
  dataKey: string;
  label: string;
  unit: string;
  color: string;
  baseValue: number;
}) {
  const values = data.map((d) => d[dataKey]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = max - min;

  return (
    <div className="bg-gray-800/50 rounded border border-gray-700 p-1.5">
      <div className="text-[9px] text-gray-400 mb-0.5 truncate" title={`${label} (${unit})`}>
        {label} {unit && <span className="text-gray-500">({unit})</span>}
      </div>
      <div className="text-[9px] text-gray-500 mb-0.5">
        {min.toFixed(2)} — {max.toFixed(2)} (delta: {spread.toFixed(2)})
      </div>
      <div className="h-[80px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 2, right: 4, left: 0, bottom: 2 }}>
            <CartesianGrid strokeDasharray="2 2" stroke="#374151" />
            <XAxis
              dataKey="paramValue"
              tick={{ fill: '#6b7280', fontSize: 8 }}
              stroke="#374151"
              tickFormatter={(v) => v.toFixed(0)}
            />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 8 }}
              stroke="#374151"
              width={35}
              tickFormatter={(v) => v.toFixed(1)}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 4, fontSize: 10 }}
              labelFormatter={(v) => `${v} mm`}
              formatter={(v: number) => [v.toFixed(3) + (unit ? ` ${unit}` : ''), label]}
            />
            <ReferenceLine x={baseValue} stroke="#6b7280" strokeDasharray="3 3" />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
