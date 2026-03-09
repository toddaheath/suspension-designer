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

export default function BumpSteerChart() {
  const data = useCalculationStore((s) => s.bumpSteerCurve);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-500">
        No bump steer data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis
          dataKey="wheelTravel"
          label={{ value: 'Wheel Travel (mm)', position: 'bottom', offset: 0, fill: '#9ca3af', fontSize: 12 }}
          tick={{ fill: '#9ca3af', fontSize: 11 }}
          stroke="#4b5563"
        />
        <YAxis
          label={{ value: 'Toe Change (deg)', angle: -90, position: 'insideLeft', fill: '#9ca3af', fontSize: 12 }}
          tick={{ fill: '#9ca3af', fontSize: 11 }}
          stroke="#4b5563"
        />
        <Tooltip
          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 4 }}
          labelStyle={{ color: '#d1d5db' }}
          itemStyle={{ color: '#2ecc71' }}
          formatter={(value: number | undefined) => [value != null ? value.toFixed(4) + ' deg' : '', 'Toe']}
          labelFormatter={(label) => `Wheel Travel: ${label} mm`}
        />
        <Line
          type="monotone"
          dataKey="toeAngleDegrees"
          stroke="#2ecc71"
          strokeWidth={2}
          dot={{ fill: '#2ecc71', r: 2 }}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
