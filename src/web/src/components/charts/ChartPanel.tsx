import { useUIStore } from '../../stores/uiStore';
import CamberCurveChart from './CamberCurveChart';
import RollCenterChart from './RollCenterChart';
import MotionRatioChart from './MotionRatioChart';

const TABS = [
  { key: 'camber' as const, label: 'Camber Curve' },
  { key: 'rollCenter' as const, label: 'Roll Center' },
  { key: 'motionRatio' as const, label: 'Motion Ratio' },
];

export default function ChartPanel() {
  const activeTab = useUIStore((s) => s.activeChartTab);
  const setActiveTab = useUIStore((s) => s.setActiveChartTab);

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <div className="flex border-b border-gray-700">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-xs font-medium transition-colors ${
              activeTab === tab.key
                ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-800'
                : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex-1 p-2">
        {activeTab === 'camber' && <CamberCurveChart />}
        {activeTab === 'rollCenter' && <RollCenterChart />}
        {activeTab === 'motionRatio' && <MotionRatioChart />}
      </div>
    </div>
  );
}
