import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useCalculationStore } from '../../stores/calculationStore';

export default function RollCenterChart() {
  const data = useCalculationStore((s) => s.rollCenterCurve);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-500">
        No roll center data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis
          dataKey="rollAngle"
          label={{ value: 'Roll Angle (deg)', position: 'bottom', offset: 0, fill: '#9ca3af', fontSize: 12 }}
          tick={{ fill: '#9ca3af', fontSize: 11 }}
          stroke="#4b5563"
        />
        <YAxis
          label={{ value: 'RC Height (mm)', angle: -90, position: 'insideLeft', fill: '#9ca3af', fontSize: 12 }}
          tick={{ fill: '#9ca3af', fontSize: 11 }}
          stroke="#4b5563"
        />
        <Tooltip
          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 4 }}
          labelStyle={{ color: '#d1d5db' }}
          itemStyle={{ color: '#3498db' }}
          formatter={(value: number | undefined) => [value != null ? value.toFixed(1) + ' mm' : '', 'RC Height']}
          labelFormatter={(label) => `Roll: ${label} deg`}
        />
        <Line
          type="monotone"
          dataKey="rollCenterHeight"
          stroke="#3498db"
          strokeWidth={2}
          dot={{ fill: '#3498db', r: 2 }}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
