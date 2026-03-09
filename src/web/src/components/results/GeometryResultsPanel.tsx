import { useCalculationStore } from '../../stores/calculationStore';

export default function GeometryResultsPanel() {
  const geometry = useCalculationStore((s) => s.geometryResult);
  const dynamics = useCalculationStore((s) => s.dynamicsResult);
  const antiGeo = useCalculationStore((s) => s.antiGeometryResult);
  const steering = useCalculationStore((s) => s.steeringResult);
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

  if (!geometry && !dynamics && !antiGeo && !steering) {
    return (
      <div className="p-4 text-sm text-gray-500">
        No results yet. Modify hardpoints to trigger calculation.
      </div>
    );
  }

  const geometryRows: { label: string; value: string; unit: string }[] = geometry
    ? [
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
          value: geometry.kingpinInclinationDegrees.toFixed(2),
          unit: 'deg',
        },
        {
          label: 'Caster Angle',
          value: geometry.casterAngleDegrees.toFixed(2),
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
      ]
    : [];

  const dynamicsRows: { label: string; value: string; unit: string }[] = dynamics
    ? [
        {
          label: 'Motion Ratio',
          value: dynamics.motionRatio.toFixed(3),
          unit: '',
        },
        {
          label: 'Wheel Rate',
          value: dynamics.wheelRate.toFixed(1),
          unit: 'N/mm',
        },
        {
          label: 'Natural Frequency',
          value: dynamics.naturalFrequency.toFixed(2),
          unit: 'Hz',
        },
        {
          label: 'Damping Ratio',
          value: dynamics.dampingRatio.toFixed(3),
          unit: '',
        },
        {
          label: 'Critical Damping',
          value: dynamics.criticalDamping.toFixed(1),
          unit: 'N·s/mm',
        },
      ]
    : [];

  const antiGeoRows: { label: string; value: string; unit: string }[] = antiGeo
    ? [
        { label: 'Anti-Dive', value: antiGeo.antiDivePercent.toFixed(1), unit: '%' },
        { label: 'Anti-Squat', value: antiGeo.antiSquatPercent.toFixed(1), unit: '%' },
      ]
    : [];

  const steeringRows: { label: string; value: string; unit: string }[] =
    steering && steering.ackermannCurve.length > 0
      ? steering.ackermannCurve.map((pt) => ({
          label: `Steer ${pt.steeringAngleDegrees.toFixed(0)}°`,
          value: pt.ackermannPercent.toFixed(1),
          unit: '%',
        }))
      : [];

  return (
    <div className="p-3">
      {geometryRows.length > 0 && (
        <>
          <h3 className="text-sm font-semibold text-gray-300 mb-3">
            Geometry Results
          </h3>
          <ResultTable rows={geometryRows} />
        </>
      )}
      {dynamicsRows.length > 0 && (
        <>
          <h3 className="text-sm font-semibold text-gray-300 mb-3 mt-4">
            Dynamics Results
          </h3>
          <ResultTable rows={dynamicsRows} />
        </>
      )}
      {antiGeoRows.length > 0 && (
        <>
          <h3 className="text-sm font-semibold text-gray-300 mb-3 mt-4">
            Anti-Geometry
          </h3>
          <ResultTable rows={antiGeoRows} />
        </>
      )}
      {steeringRows.length > 0 && (
        <>
          <h3 className="text-sm font-semibold text-gray-300 mb-3 mt-4">
            Ackermann Geometry
          </h3>
          <ResultTable rows={steeringRows} />
        </>
      )}
    </div>
  );
}

function ResultTable({ rows }: { rows: { label: string; value: string; unit: string }[] }) {
  return (
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
  );
}
