import { useCalculationStore } from '../../stores/calculationStore';
import { useComparisonStore } from '../../stores/comparisonStore';
import { useUnitStore, displayValue, unitLabel } from '../../stores/unitStore';

function DeltaIndicator({ current, comparison, decimals = 3 }: { current: number; comparison: number; decimals?: number }) {
  const delta = current - comparison;
  const sign = delta >= 0 ? '+' : '';
  const color = Math.abs(delta) < 0.001 ? 'text-gray-500' : delta > 0 ? 'text-green-400' : 'text-red-400';
  return (
    <span className={`text-[10px] font-mono ${color}`}>
      ({sign}{delta.toFixed(decimals)})
    </span>
  );
}

export default function MotionRatioChart() {
  const dynamics = useCalculationStore((s) => s.dynamicsResult);
  const compDyn = useComparisonStore((s) => s.dynamicsResult);
  const isComparing = useComparisonStore((s) => s.isActive);
  const compName = useComparisonStore((s) => s.designName);
  const unitSystem = useUnitStore((s) => s.system);

  if (!dynamics) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-500">
        No dynamics data available
      </div>
    );
  }

  const wrDisplay = displayValue(dynamics.wheelRate, 'springRate', unitSystem);
  const wrUnit = unitLabel('springRate', unitSystem);
  const cdDisplay = displayValue(dynamics.criticalDamping, 'damping', unitSystem);
  const cdUnit = unitLabel('damping', unitSystem);

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-4">
        <div className="text-gray-400 text-xs uppercase tracking-wide">Static Motion Ratio</div>
        <div className="text-4xl font-mono text-yellow-400">
          {dynamics.motionRatio.toFixed(4)}
          {isComparing && compDyn && (
            <div className="text-sm mt-1">
              <DeltaIndicator current={dynamics.motionRatio} comparison={compDyn.motionRatio} decimals={4} />
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4 text-xs mt-4">
          <div>
            <div className="text-gray-500">Wheel Rate</div>
            <div className="text-gray-200 font-mono">{wrDisplay.toFixed(1)} {wrUnit}</div>
            {isComparing && compDyn && (
              <DeltaIndicator current={dynamics.wheelRate} comparison={compDyn.wheelRate} decimals={1} />
            )}
          </div>
          <div>
            <div className="text-gray-500">Natural Freq.</div>
            <div className="text-gray-200 font-mono">{dynamics.naturalFrequency.toFixed(2)} Hz</div>
            {isComparing && compDyn && (
              <DeltaIndicator current={dynamics.naturalFrequency} comparison={compDyn.naturalFrequency} decimals={2} />
            )}
          </div>
          <div>
            <div className="text-gray-500">Damping Ratio</div>
            <div className="text-gray-200 font-mono">{dynamics.dampingRatio.toFixed(3)}</div>
            {isComparing && compDyn && (
              <DeltaIndicator current={dynamics.dampingRatio} comparison={compDyn.dampingRatio} />
            )}
          </div>
          <div>
            <div className="text-gray-500">Critical Damping</div>
            <div className="text-gray-200 font-mono">{cdDisplay.toFixed(1)} {cdUnit}</div>
            {isComparing && compDyn && (
              <DeltaIndicator current={dynamics.criticalDamping} comparison={compDyn.criticalDamping} decimals={1} />
            )}
          </div>
        </div>
        {isComparing && compName && (
          <div className="text-[10px] text-gray-500 mt-2">
            Comparing with <span className="text-purple-400">{compName}</span>
          </div>
        )}
      </div>
    </div>
  );
}
