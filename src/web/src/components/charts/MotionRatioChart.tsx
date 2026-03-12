import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useCalculationStore } from '../../stores/calculationStore';
import { useComparisonStore } from '../../stores/comparisonStore';

export default function MotionRatioChart() {
  const data = useCalculationStore((s) => s.motionRatioCurve);
  const dynamics = useCalculationStore((s) => s.dynamicsResult);
  const compData = useComparisonStore((s) => s.motionRatioCurve);
  const isComparing = useComparisonStore((s) => s.isActive);
  const compName = useComparisonStore((s) => s.designName);

  const mergedData = useMemo(() => {
    if (!isComparing || compData.length === 0) return data;
    return data.map((pt, i) => ({
      ...pt,
      compMotionRatio: compData[i]?.motionRatio,
    }));
  }, [data, compData, isComparing]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-500">
        {dynamics ? (
          <div className="text-center space-y-2">
            <div className="text-gray-400 text-xs uppercase tracking-wide">Static Motion Ratio</div>
            <div className="text-4xl font-mono text-yellow-400">{dynamics.motionRatio.toFixed(4)}</div>
          </div>
        ) : (
          'No dynamics data available'
        )}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={mergedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis
          dataKey="wheelTravel"
          label={{ value: 'Wheel Travel (mm)', position: 'bottom', offset: 0, fill: '#9ca3af', fontSize: 12 }}
          tick={{ fill: '#9ca3af', fontSize: 11 }}
          stroke="#4b5563"
        />
        <YAxis
          label={{ value: 'Motion Ratio', angle: -90, position: 'insideLeft', fill: '#9ca3af', fontSize: 12 }}
          tick={{ fill: '#9ca3af', fontSize: 11 }}
          stroke="#4b5563"
          domain={['auto', 'auto']}
        />
        <Tooltip
          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 4 }}
          labelStyle={{ color: '#d1d5db' }}
          formatter={(value: number | undefined, name: string) => [
            value != null ? value.toFixed(4) : '',
            name === 'compMotionRatio' ? compName ?? 'Comparison' : 'Current',
          ]}
          labelFormatter={(label) => `Wheel Travel: ${label} mm`}
        />
        {isComparing && <Legend wrapperStyle={{ fontSize: 10 }} />}
        <Line
          type="monotone"
          dataKey="motionRatio"
          stroke="#f39c12"
          strokeWidth={2}
          dot={{ fill: '#f39c12', r: 2 }}
          activeDot={{ r: 4 }}
          name="Current"
        />
        {isComparing && (
          <Line
            type="monotone"
            dataKey="compMotionRatio"
            stroke="#9b59b6"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name={compName ?? 'Comparison'}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
