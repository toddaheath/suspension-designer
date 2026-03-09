import { useCalculationStore } from '../../stores/calculationStore';

export default function MotionRatioChart() {
  const dynamics = useCalculationStore((s) => s.dynamicsResult);

  if (!dynamics) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-500">
        No dynamics data available
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center space-y-4">
        <div className="text-gray-400 text-xs uppercase tracking-wide">Static Motion Ratio</div>
        <div className="text-4xl font-mono text-yellow-400">
          {dynamics.motionRatio.toFixed(4)}
        </div>
        <div className="grid grid-cols-2 gap-4 text-xs mt-4">
          <div>
            <div className="text-gray-500">Wheel Rate</div>
            <div className="text-gray-200 font-mono">{dynamics.wheelRate.toFixed(1)} N/mm</div>
          </div>
          <div>
            <div className="text-gray-500">Natural Freq.</div>
            <div className="text-gray-200 font-mono">{dynamics.naturalFrequency.toFixed(2)} Hz</div>
          </div>
          <div>
            <div className="text-gray-500">Damping Ratio</div>
            <div className="text-gray-200 font-mono">{dynamics.dampingRatio.toFixed(3)}</div>
          </div>
          <div>
            <div className="text-gray-500">Critical Damping</div>
            <div className="text-gray-200 font-mono">{dynamics.criticalDamping.toFixed(1)} N·s/mm</div>
          </div>
        </div>
      </div>
    </div>
  );
}
