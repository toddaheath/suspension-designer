import { useMemo } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ZAxis,
} from 'recharts';
import { useCalculationStore } from '../../stores/calculationStore';
import { useComparisonStore } from '../../stores/comparisonStore';

export default function InstantCenterChart() {
  const data = useCalculationStore((s) => s.instantCenterCurve);
  const geometry = useCalculationStore((s) => s.geometryResult);
  const compData = useComparisonStore((s) => s.instantCenterCurve);
  const isComparing = useComparisonStore((s) => s.isActive);
  const compName = useComparisonStore((s) => s.designName);

  const scatterData = useMemo(() => {
    return data.map((pt) => ({
      y: pt.icY,
      z: pt.icZ,
      travel: pt.wheelTravel,
    }));
  }, [data]);

  const compScatterData = useMemo(() => {
    if (!isComparing || compData.length === 0) return [];
    return compData.map((pt) => ({
      y: pt.icY,
      z: pt.icZ,
      travel: pt.wheelTravel,
    }));
  }, [compData, isComparing]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-500">
        {geometry ? (
          <div className="text-center space-y-2">
            <div className="text-gray-400 text-xs uppercase tracking-wide">Static Instant Center</div>
            <div className="text-lg font-mono text-emerald-400">
              Y: {geometry.instantCenter.y.toFixed(1)} mm, Z: {geometry.instantCenter.z.toFixed(1)} mm
            </div>
          </div>
        ) : (
          'No geometry data available'
        )}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis
          dataKey="y"
          type="number"
          name="IC Y"
          label={{ value: 'IC Y Position (mm)', position: 'bottom', offset: 0, fill: '#9ca3af', fontSize: 12 }}
          tick={{ fill: '#9ca3af', fontSize: 11 }}
          stroke="#4b5563"
          domain={['auto', 'auto']}
        />
        <YAxis
          dataKey="z"
          type="number"
          name="IC Z"
          label={{ value: 'IC Z Position (mm)', angle: -90, position: 'insideLeft', fill: '#9ca3af', fontSize: 12 }}
          tick={{ fill: '#9ca3af', fontSize: 11 }}
          stroke="#4b5563"
          domain={['auto', 'auto']}
        />
        <ZAxis range={[30, 30]} />
        <Tooltip
          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 4 }}
          labelStyle={{ color: '#d1d5db' }}
          formatter={(value: number, name: string) => [value.toFixed(1) + ' mm', name]}
          labelFormatter={() => ''}
          content={({ payload }) => {
            if (!payload || payload.length === 0) return null;
            const p = payload[0]?.payload;
            if (!p) return null;
            return (
              <div className="bg-gray-800 border border-gray-700 rounded p-2 text-xs">
                <div className="text-gray-300">Travel: {p.travel} mm</div>
                <div className="text-emerald-400">Y: {p.y.toFixed(1)} mm</div>
                <div className="text-emerald-400">Z: {p.z.toFixed(1)} mm</div>
              </div>
            );
          }}
        />
        {isComparing && <Legend wrapperStyle={{ fontSize: 10 }} />}
        <Scatter
          data={scatterData}
          fill="#10b981"
          name="Current"
          line={{ stroke: '#10b981', strokeWidth: 1.5 }}
          lineType="joint"
        />
        {isComparing && compScatterData.length > 0 && (
          <Scatter
            data={compScatterData}
            fill="#9b59b6"
            name={compName ?? 'Comparison'}
            line={{ stroke: '#9b59b6', strokeWidth: 1.5, strokeDasharray: '5 5' }}
            lineType="joint"
          />
        )}
      </ScatterChart>
    </ResponsiveContainer>
  );
}
