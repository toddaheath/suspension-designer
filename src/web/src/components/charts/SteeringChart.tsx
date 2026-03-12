import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts';
import { useCalculationStore } from '../../stores/calculationStore';
import { useComparisonStore } from '../../stores/comparisonStore';

export default function SteeringChart() {
  const data = useCalculationStore((s) => s.steeringResult);
  const compData = useComparisonStore((s) => s.steeringResult);
  const isComparing = useComparisonStore((s) => s.isActive);
  const compName = useComparisonStore((s) => s.designName);

  const mergedData = useMemo(() => {
    if (!data || data.ackermannCurve.length === 0) return [];
    if (!isComparing || !compData || compData.ackermannCurve.length === 0) return data.ackermannCurve;
    return data.ackermannCurve.map((pt, i) => ({
      ...pt,
      compAckermann: compData.ackermannCurve[i]?.ackermannPercent,
    }));
  }, [data, compData, isComparing]);

  if (!data || data.ackermannCurve.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-500">
        No steering data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={mergedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis
          dataKey="steeringAngleDegrees"
          label={{ value: 'Steering Angle (deg)', position: 'bottom', offset: 0, fill: '#9ca3af', fontSize: 12 }}
          tick={{ fill: '#9ca3af', fontSize: 11 }}
          stroke="#4b5563"
        />
        <YAxis
          label={{ value: 'Ackermann %', angle: -90, position: 'insideLeft', fill: '#9ca3af', fontSize: 12 }}
          tick={{ fill: '#9ca3af', fontSize: 11 }}
          stroke="#4b5563"
        />
        <ReferenceLine y={100} stroke="#555" strokeDasharray="3 3" label={{ value: '100%', fill: '#666', fontSize: 10 }} />
        <Tooltip
          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 4 }}
          labelStyle={{ color: '#d1d5db' }}
          formatter={(value: number | undefined, name: string) => [
            value != null ? value.toFixed(1) + '%' : '',
            name === 'compAckermann' ? compName ?? 'Comparison' : 'Current',
          ]}
          labelFormatter={(label) => `Steer: ${label} deg`}
        />
        {isComparing && <Legend wrapperStyle={{ fontSize: 10 }} />}
        <Line
          type="monotone"
          dataKey="ackermannPercent"
          stroke="#9b59b6"
          strokeWidth={2}
          dot={{ fill: '#9b59b6', r: 2 }}
          activeDot={{ r: 4 }}
          name="Current"
        />
        {isComparing && (
          <Line
            type="monotone"
            dataKey="compAckermann"
            stroke="#e74c3c"
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
