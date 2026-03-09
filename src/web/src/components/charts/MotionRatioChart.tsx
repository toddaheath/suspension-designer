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

export default function MotionRatioChart() {
  const data = useCalculationStore((s) => s.motionRatioCurve);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-500">
        No motion ratio data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis
          dataKey="travel"
          label={{ value: 'Wheel Travel (mm)', position: 'bottom', offset: 0, fill: '#9ca3af', fontSize: 12 }}
          tick={{ fill: '#9ca3af', fontSize: 11 }}
          stroke="#4b5563"
        />
        <YAxis
          label={{ value: 'Motion Ratio', angle: -90, position: 'insideLeft', fill: '#9ca3af', fontSize: 12 }}
          tick={{ fill: '#9ca3af', fontSize: 11 }}
          stroke="#4b5563"
        />
        <Tooltip
          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 4 }}
          labelStyle={{ color: '#d1d5db' }}
          itemStyle={{ color: '#f39c12' }}
          formatter={(value: number | undefined) => [value != null ? value.toFixed(4) : '', 'Motion Ratio']}
          labelFormatter={(label) => `Travel: ${label} mm`}
        />
        <Line
          type="monotone"
          dataKey="motionRatio"
          stroke="#f39c12"
          strokeWidth={2}
          dot={{ fill: '#f39c12', r: 2 }}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
