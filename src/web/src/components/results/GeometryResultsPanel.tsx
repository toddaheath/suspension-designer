import { useCalculationStore } from '../../stores/calculationStore';

export default function GeometryResultsPanel() {
  const geometry = useCalculationStore((s) => s.geometryResult);
  const isLoading = useCalculationStore((s) => s.isLoading);
  const error = useCalculationStore((s) => s.error);

  if (isLoading) {
    return (
      <div className="p-4 text-sm text-gray-400">Calculating...</div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-red-400">Error: {error}</div>
    );
  }

  if (!geometry) {
    return (
      <div className="p-4 text-sm text-gray-500">
        No results yet. Modify hardpoints to trigger calculation.
      </div>
    );
  }

  const rows: { label: string; value: string; unit: string }[] = [
    {
      label: 'Instant Center X',
      value: geometry.instantCenter.x.toFixed(1),
      unit: 'mm',
    },
    {
      label: 'Instant Center Y',
      value: geometry.instantCenter.y.toFixed(1),
      unit: 'mm',
    },
    {
      label: 'Instant Center Z',
      value: geometry.instantCenter.z.toFixed(1),
      unit: 'mm',
    },
    {
      label: 'Roll Center Height',
      value: geometry.rollCenterHeight.toFixed(1),
      unit: 'mm',
    },
    {
      label: 'KPI Angle',
      value: geometry.kpiAngle.toFixed(2),
      unit: 'deg',
    },
    {
      label: 'Caster Angle',
      value: geometry.casterAngle.toFixed(2),
      unit: 'deg',
    },
    {
      label: 'Scrub Radius',
      value: geometry.scrubRadius.toFixed(1),
      unit: 'mm',
    },
    {
      label: 'Mechanical Trail',
      value: geometry.mechanicalTrail.toFixed(1),
      unit: 'mm',
    },
  ];

  return (
    <div className="p-3">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">
        Geometry Results
      </h3>
      <table className="w-full text-xs">
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-gray-800">
              <td className="py-1.5 text-gray-400">{row.label}</td>
              <td className="py-1.5 text-right text-gray-200 font-mono">
                {row.value}
              </td>
              <td className="py-1.5 pl-1 text-gray-500 w-8">{row.unit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
