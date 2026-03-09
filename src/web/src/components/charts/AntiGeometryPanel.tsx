import { useCalculationStore } from '../../stores/calculationStore';

export default function AntiGeometryPanel() {
  const data = useCalculationStore((s) => s.antiGeometryResult);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-500">
        No anti-geometry data available
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-full">
      <div className="grid grid-cols-2 gap-8">
        <div className="text-center">
          <div className="text-gray-400 text-xs uppercase tracking-wide mb-2">Anti-Dive</div>
          <div className={`text-4xl font-mono ${data.antiDivePercent >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
            {data.antiDivePercent.toFixed(1)}%
          </div>
        </div>
        <div className="text-center">
          <div className="text-gray-400 text-xs uppercase tracking-wide mb-2">Anti-Squat</div>
          <div className={`text-4xl font-mono ${data.antiSquatPercent >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
            {data.antiSquatPercent.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
}
