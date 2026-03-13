import { useState } from 'react';
import { useCalculationStore } from '../../stores/calculationStore';
import { useTargetStore, evaluateTarget } from '../../stores/targetStore';
import type { TargetKey, TargetStatus } from '../../stores/targetStore';
import { useUnitStore, displayValue, unitLabel } from '../../stores/unitStore';
import { exportResultsCsv, downloadCsv } from '../../services/exportService';

const STATUS_STYLES: Record<TargetStatus, string> = {
  pass: 'bg-green-500',
  warn: 'bg-yellow-500',
  fail: 'bg-red-500',
  none: '',
};

const STATUS_LABELS: Record<TargetStatus, string> = {
  pass: 'Within target range',
  warn: 'Near target boundary',
  fail: 'Outside target range',
  none: '',
};

interface ResultRow {
  label: string;
  value: string;
  unit: string;
  targetKey?: TargetKey;
  numericValue?: number;  // always metric for target evaluation
}

export default function GeometryResultsPanel() {
  const geometry = useCalculationStore((s) => s.geometryResult);
  const dynamics = useCalculationStore((s) => s.dynamicsResult);
  const antiGeo = useCalculationStore((s) => s.antiGeometryResult);
  const steering = useCalculationStore((s) => s.steeringResult);
  const camberCurve = useCalculationStore((s) => s.camberCurve);
  const rollCenterCurve = useCalculationStore((s) => s.rollCenterCurve);
  const bumpSteerCurve = useCalculationStore((s) => s.bumpSteerCurve);
  const motionRatioCurve = useCalculationStore((s) => s.motionRatioCurve);
  const wheelRateCurve = useCalculationStore((s) => s.wheelRateCurve);
  const instantCenterCurve = useCalculationStore((s) => s.instantCenterCurve);
  const isLoading = useCalculationStore((s) => s.isLoading);
  const error = useCalculationStore((s) => s.error);
  const targets = useTargetStore((s) => s.targets);
  const unitSystem = useUnitStore((s) => s.system);
  const [copied, setCopied] = useState(false);

  const dv = (v: number, uKey: string) => displayValue(v, uKey, unitSystem);
  const ul = (uKey: string) => unitLabel(uKey, unitSystem);

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

  const geometryRows: ResultRow[] = geometry
    ? [
        { label: 'Instant Center X', value: dv(geometry.instantCenter.x, 'length').toFixed(1), unit: ul('length') },
        { label: 'Instant Center Y', value: dv(geometry.instantCenter.y, 'length').toFixed(1), unit: ul('length') },
        { label: 'Instant Center Z', value: dv(geometry.instantCenter.z, 'length').toFixed(1), unit: ul('length') },
        { label: 'Roll Center Height', value: dv(geometry.rollCenterHeight, 'length').toFixed(1), unit: ul('length'), targetKey: 'rollCenterHeight', numericValue: geometry.rollCenterHeight },
        { label: 'KPI Angle', value: geometry.kingpinInclinationDegrees.toFixed(2), unit: 'deg', targetKey: 'kpiAngle', numericValue: geometry.kingpinInclinationDegrees },
        { label: 'Caster Angle', value: geometry.casterAngleDegrees.toFixed(2), unit: 'deg', targetKey: 'casterAngle', numericValue: geometry.casterAngleDegrees },
        { label: 'Scrub Radius', value: dv(geometry.scrubRadius, 'length').toFixed(1), unit: ul('length'), targetKey: 'scrubRadius', numericValue: geometry.scrubRadius },
        { label: 'Mechanical Trail', value: dv(geometry.mechanicalTrail, 'length').toFixed(1), unit: ul('length'), targetKey: 'mechanicalTrail', numericValue: geometry.mechanicalTrail },
      ]
    : [];

  const dynamicsRows: ResultRow[] = dynamics
    ? [
        { label: 'Motion Ratio', value: dynamics.motionRatio.toFixed(3), unit: '', targetKey: 'motionRatio', numericValue: dynamics.motionRatio },
        { label: 'Wheel Rate', value: dv(dynamics.wheelRate, 'springRate').toFixed(1), unit: ul('springRate'), targetKey: 'wheelRate', numericValue: dynamics.wheelRate },
        { label: 'Natural Frequency', value: dynamics.naturalFrequency.toFixed(2), unit: 'Hz', targetKey: 'naturalFrequency', numericValue: dynamics.naturalFrequency },
        { label: 'Damping Ratio', value: dynamics.dampingRatio.toFixed(3), unit: '', targetKey: 'dampingRatio', numericValue: dynamics.dampingRatio },
        { label: 'Critical Damping', value: dv(dynamics.criticalDamping, 'damping').toFixed(1), unit: ul('damping') },
        { label: 'Roll Stiffness', value: dynamics.rollStiffness.toFixed(1), unit: 'N\u00b7m/deg' },
      ]
    : [];

  const antiGeoRows: ResultRow[] = antiGeo
    ? [
        { label: 'Anti-Dive', value: antiGeo.antiDivePercent.toFixed(1), unit: '%', targetKey: 'antiDive', numericValue: antiGeo.antiDivePercent },
        { label: 'Anti-Squat', value: antiGeo.antiSquatPercent.toFixed(1), unit: '%', targetKey: 'antiSquat', numericValue: antiGeo.antiSquatPercent },
      ]
    : [];

  const steeringRows: ResultRow[] =
    steering && steering.ackermannCurve.length > 0
      ? steering.ackermannCurve.map((pt) => ({
          label: `Steer ${pt.steeringAngleDegrees.toFixed(0)}\u00b0`,
          value: pt.ackermannPercent.toFixed(1),
          unit: '%',
        }))
      : [];

  const hasResults = geometryRows.length > 0 || dynamicsRows.length > 0;

  // Count compliance summary
  const allTargeted = [...geometryRows, ...dynamicsRows, ...antiGeoRows].filter((r) => r.targetKey);
  const enabledTargets = allTargeted.filter((r) => r.targetKey && targets[r.targetKey].enabled);
  const passCount = enabledTargets.filter((r) => evaluateTarget(targets[r.targetKey!], r.numericValue!) === 'pass').length;
  const warnCount = enabledTargets.filter((r) => evaluateTarget(targets[r.targetKey!], r.numericValue!) === 'warn').length;
  const failCount = enabledTargets.filter((r) => evaluateTarget(targets[r.targetKey!], r.numericValue!) === 'fail').length;

  const handleCopyAll = () => {
    const allRows = [...geometryRows, ...dynamicsRows, ...antiGeoRows];
    const text = allRows.map((r) => `${r.label}: ${r.value} ${r.unit}`).join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleExportCsv = () => {
    const csv = exportResultsCsv({
      geometry, dynamics, antiGeometry: antiGeo, steering,
      camberCurve, rollCenterCurve, bumpSteerCurve,
      motionRatioCurve, wheelRateCurve, instantCenterCurve,
    });
    downloadCsv(csv, 'suspension-results.csv');
  };

  return (
    <div className="p-3">
      {hasResults && (
        <div className="flex gap-1 mb-3">
          <button
            onClick={handleCopyAll}
            className="px-2 py-1 text-[10px] bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 text-gray-300"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={handleExportCsv}
            className="px-2 py-1 text-[10px] bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 text-gray-300"
          >
            Export CSV
          </button>
        </div>
      )}

      {/* Target compliance summary */}
      {enabledTargets.length > 0 && (
        <div className="mb-3 px-2 py-1.5 bg-gray-800/50 rounded border border-gray-700">
          <div className="text-[10px] text-gray-400 mb-1">Target Compliance</div>
          <div className="flex gap-3 text-xs">
            {passCount > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                <span className="text-green-400">{passCount} pass</span>
              </span>
            )}
            {warnCount > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" />
                <span className="text-yellow-400">{warnCount} warn</span>
              </span>
            )}
            {failCount > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                <span className="text-red-400">{failCount} fail</span>
              </span>
            )}
            {passCount === enabledTargets.length && (
              <span className="text-green-400 text-[10px]">All targets met</span>
            )}
          </div>
        </div>
      )}

      {geometryRows.length > 0 && (
        <>
          <h3 className="text-sm font-semibold text-gray-300 mb-3">
            Geometry Results
          </h3>
          <ResultTable rows={geometryRows} targets={targets} />
        </>
      )}
      {dynamicsRows.length > 0 && (
        <>
          <h3 className="text-sm font-semibold text-gray-300 mb-3 mt-4">
            Dynamics Results
          </h3>
          <ResultTable rows={dynamicsRows} targets={targets} />
        </>
      )}
      {antiGeoRows.length > 0 && (
        <>
          <h3 className="text-sm font-semibold text-gray-300 mb-3 mt-4">
            Anti-Geometry
          </h3>
          <ResultTable rows={antiGeoRows} targets={targets} />
        </>
      )}
      {steeringRows.length > 0 && (
        <>
          <h3 className="text-sm font-semibold text-gray-300 mb-3 mt-4">
            Ackermann Geometry
          </h3>
          <ResultTable rows={steeringRows} targets={targets} />
        </>
      )}
    </div>
  );
}

function ResultTable({
  rows,
  targets,
}: {
  rows: ResultRow[];
  targets: Record<TargetKey, { enabled: boolean; min: number; max: number }>;
}) {
  return (
    <table className="w-full text-xs">
      <tbody>
        {rows.map((row) => {
          const status: TargetStatus = row.targetKey && row.numericValue !== undefined
            ? evaluateTarget(targets[row.targetKey], row.numericValue)
            : 'none';

          return (
            <tr key={row.label} className="border-b border-gray-800">
              <td className="py-1.5 text-gray-400 flex items-center gap-1.5">
                {status !== 'none' && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_STYLES[status]}`}
                    title={`${STATUS_LABELS[status]} (${targets[row.targetKey!].min} - ${targets[row.targetKey!].max})`}
                  />
                )}
                {row.label}
              </td>
              <td className={`py-1.5 text-right font-mono ${
                status === 'fail' ? 'text-red-400' :
                status === 'warn' ? 'text-yellow-300' :
                status === 'pass' ? 'text-green-400' :
                'text-gray-200'
              }`}>
                {row.value}
              </td>
              <td className="py-1.5 pl-1 text-gray-500 w-8">{row.unit}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
