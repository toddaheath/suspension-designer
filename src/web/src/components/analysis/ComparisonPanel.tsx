import { useComparisonStore } from '../../stores/comparisonStore';
import { useCalculationStore } from '../../stores/calculationStore';
import { useDesignStore } from '../../stores/designStore';

interface DeltaRow {
  label: string;
  current: number;
  comparison: number;
  unit: string;
}

function formatDelta(delta: number): string {
  const sign = delta >= 0 ? '+' : '';
  return `${sign}${delta.toFixed(2)}`;
}

function deltaColor(delta: number, threshold: number): string {
  const abs = Math.abs(delta);
  if (abs < threshold * 0.1) return 'text-gray-400';
  if (abs < threshold * 0.5) return 'text-yellow-400';
  return 'text-red-400';
}

export default function ComparisonPanel() {
  const isActive = useComparisonStore((s) => s.isActive);
  const compName = useComparisonStore((s) => s.designName);
  const compGeo = useComparisonStore((s) => s.geometryResult);
  const compDyn = useComparisonStore((s) => s.dynamicsResult);
  const compAnti = useComparisonStore((s) => s.antiGeometryResult);
  const clearComparison = useComparisonStore((s) => s.clearComparison);

  const currentGeo = useCalculationStore((s) => s.geometryResult);
  const currentDyn = useCalculationStore((s) => s.dynamicsResult);
  const currentAnti = useCalculationStore((s) => s.antiGeometryResult);
  const currentName = useDesignStore((s) => s.name);

  if (!isActive || !compGeo || !compDyn || !compAnti) return null;
  if (!currentGeo || !currentDyn || !currentAnti) return null;

  const geometryRows: DeltaRow[] = [
    { label: 'Roll Center Height', current: currentGeo.rollCenterHeight, comparison: compGeo.rollCenterHeight, unit: 'mm' },
    { label: 'KPI Angle', current: currentGeo.kingpinInclinationDegrees, comparison: compGeo.kingpinInclinationDegrees, unit: 'deg' },
    { label: 'Caster Angle', current: currentGeo.casterAngleDegrees, comparison: compGeo.casterAngleDegrees, unit: 'deg' },
    { label: 'Scrub Radius', current: currentGeo.scrubRadius, comparison: compGeo.scrubRadius, unit: 'mm' },
    { label: 'Mechanical Trail', current: currentGeo.mechanicalTrail, comparison: compGeo.mechanicalTrail, unit: 'mm' },
    { label: 'IC Y', current: currentGeo.instantCenter.y, comparison: compGeo.instantCenter.y, unit: 'mm' },
    { label: 'IC Z', current: currentGeo.instantCenter.z, comparison: compGeo.instantCenter.z, unit: 'mm' },
  ];

  const dynamicsRows: DeltaRow[] = [
    { label: 'Motion Ratio', current: currentDyn.motionRatio, comparison: compDyn.motionRatio, unit: '' },
    { label: 'Wheel Rate', current: currentDyn.wheelRate, comparison: compDyn.wheelRate, unit: 'N/mm' },
    { label: 'Nat. Frequency', current: currentDyn.naturalFrequency, comparison: compDyn.naturalFrequency, unit: 'Hz' },
    { label: 'Damping Ratio', current: currentDyn.dampingRatio, comparison: compDyn.dampingRatio, unit: '' },
  ];

  const antiRows: DeltaRow[] = [
    { label: 'Anti-Dive', current: currentAnti.antiDivePercent, comparison: compAnti.antiDivePercent, unit: '%' },
    { label: 'Anti-Squat', current: currentAnti.antiSquatPercent, comparison: compAnti.antiSquatPercent, unit: '%' },
  ];

  return (
    <div className="p-3 border-t border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-purple-400">
          Comparison
        </h3>
        <button
          onClick={clearComparison}
          className="px-1.5 py-0.5 text-[10px] bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 text-gray-400"
        >
          Clear
        </button>
      </div>

      <div className="text-[10px] text-gray-400 mb-2">
        <span className="text-blue-400">{currentName}</span>
        {' vs '}
        <span className="text-purple-400">{compName}</span>
      </div>

      <DeltaTable title="Geometry" rows={geometryRows} />
      <DeltaTable title="Dynamics" rows={dynamicsRows} />
      <DeltaTable title="Anti-Geometry" rows={antiRows} />
    </div>
  );
}

function DeltaTable({ title, rows }: { title: string; rows: DeltaRow[] }) {
  return (
    <div className="mb-3">
      <div className="text-[10px] text-gray-500 font-semibold mb-1">{title}</div>
      <table className="w-full text-[10px]">
        <thead>
          <tr className="text-gray-500">
            <th className="text-left font-normal py-0.5">Param</th>
            <th className="text-right font-normal py-0.5 text-blue-400">Current</th>
            <th className="text-right font-normal py-0.5 text-purple-400">Compare</th>
            <th className="text-right font-normal py-0.5">Delta</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const delta = row.current - row.comparison;
            const maxVal = Math.max(Math.abs(row.current), Math.abs(row.comparison), 1);
            return (
              <tr key={row.label} className="border-t border-gray-800/50">
                <td className="py-1 text-gray-400">{row.label}</td>
                <td className="py-1 text-right font-mono text-gray-200">
                  {row.current.toFixed(2)}
                </td>
                <td className="py-1 text-right font-mono text-gray-300">
                  {row.comparison.toFixed(2)}
                </td>
                <td className={`py-1 text-right font-mono ${deltaColor(delta, maxVal)}`}>
                  {formatDelta(delta)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
