import { useUIStore } from '../../stores/uiStore';
import CamberCurveChart from './CamberCurveChart';
import RollCenterChart from './RollCenterChart';
import MotionRatioChart from './MotionRatioChart';
import BumpSteerChart from './BumpSteerChart';
import AntiGeometryPanel from './AntiGeometryPanel';
import SteeringChart from './SteeringChart';
import SensitivityPanel from '../analysis/SensitivityPanel';

const TABS = [
  { key: 'camber' as const, label: 'Camber' },
  { key: 'rollCenter' as const, label: 'Roll Center' },
  { key: 'dynamics' as const, label: 'Dynamics' },
  { key: 'bumpSteer' as const, label: 'Bump Steer' },
  { key: 'antiGeometry' as const, label: 'Anti-Geometry' },
  { key: 'steering' as const, label: 'Steering' },
  { key: 'sensitivity' as const, label: 'Sensitivity' },
];

export default function ChartPanel() {
  const activeTab = useUIStore((s) => s.activeChartTab);
  const setActiveTab = useUIStore((s) => s.setActiveChartTab);

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <div className="flex border-b border-gray-700 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
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
        {activeTab === 'dynamics' && <MotionRatioChart />}
        {activeTab === 'bumpSteer' && <BumpSteerChart />}
        {activeTab === 'antiGeometry' && <AntiGeometryPanel />}
        {activeTab === 'steering' && <SteeringChart />}
        {activeTab === 'sensitivity' && (
          <div className="overflow-y-auto h-full">
            <SensitivityPanel />
          </div>
        )}
      </div>
    </div>
  );
}
