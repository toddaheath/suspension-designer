import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { useCalculationStore } from '../../stores/calculationStore';

export default function SteeringChart() {
  const data = useCalculationStore((s) => s.steeringResult);

  if (!data || data.ackermannCurve.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-500">
        No steering data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data.ackermannCurve} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
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
          itemStyle={{ color: '#9b59b6' }}
          formatter={(value: number | undefined) => [value != null ? value.toFixed(1) + '%' : '', 'Ackermann']}
          labelFormatter={(label) => `Steer: ${label} deg`}
        />
        <Line
          type="monotone"
          dataKey="ackermannPercent"
          stroke="#9b59b6"
          strokeWidth={2}
          dot={{ fill: '#9b59b6', r: 2 }}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
