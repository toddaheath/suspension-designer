import { useCalculationStore } from '../../stores/calculationStore';
import { useComparisonStore } from '../../stores/comparisonStore';

function DeltaIndicator({ current, comparison }: { current: number; comparison: number }) {
  const delta = current - comparison;
  const sign = delta >= 0 ? '+' : '';
  const color = Math.abs(delta) < 0.1 ? 'text-gray-500' : delta > 0 ? 'text-green-400' : 'text-red-400';
  return (
    <div className={`text-sm font-mono ${color}`}>
      ({sign}{delta.toFixed(1)}%)
    </div>
  );
}

export default function AntiGeometryPanel() {
  const data = useCalculationStore((s) => s.antiGeometryResult);
  const compData = useComparisonStore((s) => s.antiGeometryResult);
  const isComparing = useComparisonStore((s) => s.isActive);
  const compName = useComparisonStore((s) => s.designName);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-500">
        No anti-geometry data available
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="grid grid-cols-2 gap-8">
          <div className="text-center">
            <div className="text-gray-400 text-xs uppercase tracking-wide mb-2">Anti-Dive</div>
            <div className={`text-4xl font-mono ${data.antiDivePercent >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
              {data.antiDivePercent.toFixed(1)}%
            </div>
            {isComparing && compData && (
              <DeltaIndicator current={data.antiDivePercent} comparison={compData.antiDivePercent} />
            )}
          </div>
          <div className="text-center">
            <div className="text-gray-400 text-xs uppercase tracking-wide mb-2">Anti-Squat</div>
            <div className={`text-4xl font-mono ${data.antiSquatPercent >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
              {data.antiSquatPercent.toFixed(1)}%
            </div>
            {isComparing && compData && (
              <DeltaIndicator current={data.antiSquatPercent} comparison={compData.antiSquatPercent} />
            )}
          </div>
        </div>
        {isComparing && compName && (
          <div className="text-[10px] text-gray-500 mt-3">
            Comparing with <span className="text-purple-400">{compName}</span>
          </div>
        )}
      </div>
    </div>
  );
}
