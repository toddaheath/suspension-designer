import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { useDesignStore } from '../../stores/designStore';
import HardpointEditor from '../editors/HardpointEditor';
import VehicleParamsEditor from '../editors/VehicleParamsEditor';
import SuspensionViewer3D from '../viewer/SuspensionViewer3D';
import ChartPanel from '../charts/ChartPanel';
import GeometryResultsPanel from '../results/GeometryResultsPanel';

export default function AppLayout() {
  const sidebarVisible = useUIStore((s) => s.sidebarVisible);
  const resultsVisible = useUIStore((s) => s.resultsVisible);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const toggleResults = useUIStore((s) => s.toggleResults);
  const designName = useDesignStore((s) => s.name);
  const isDirty = useDesignStore((s) => s.isDirty);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-gray-200">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 bg-[#1a1a2e] border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 rounded border border-gray-700"
          >
            {sidebarVisible ? 'Hide' : 'Show'} Params
          </button>
          <h1 className="text-sm font-bold text-blue-400 tracking-wide uppercase">
            Suspension Designer
          </h1>
          <span className="text-xs text-gray-400">
            {designName}
            {isDirty && <span className="text-yellow-400 ml-1">*</span>}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="text-xs text-gray-400">
                {user?.name || user?.email || 'User'}
              </span>
              <button
                onClick={logout}
                className="text-xs text-gray-400 hover:text-gray-200 px-2 py-1 border border-gray-700 rounded"
              >
                Logout
              </button>
            </>
          ) : (
            <a
              href="/login"
              className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1"
            >
              Login
            </a>
          )}
          <button
            onClick={toggleResults}
            className="px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 rounded border border-gray-700"
          >
            {resultsVisible ? 'Hide' : 'Show'} Results
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        {sidebarVisible && (
          <aside className="w-[300px] shrink-0 bg-[#1a1a2e] border-r border-gray-800 overflow-y-auto">
            <div className="p-3 space-y-3">
              <HardpointEditor />
              <VehicleParamsEditor />
            </div>
          </aside>
        )}

        {/* Center - 3D Viewer + Charts */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0">
            <SuspensionViewer3D />
          </div>
          <div className="h-[280px] shrink-0 border-t border-gray-800">
            <ChartPanel />
          </div>
        </main>

        {/* Right panel */}
        {resultsVisible && (
          <aside className="w-[280px] shrink-0 bg-gray-900 border-l border-gray-800 overflow-y-auto">
            <GeometryResultsPanel />
          </aside>
        )}
      </div>
    </div>
  );
}
