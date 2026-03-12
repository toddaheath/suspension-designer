import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { useDesignStore } from '../../stores/designStore';
import { useCalculationStore } from '../../stores/calculationStore';
import { useTargetStore } from '../../stores/targetStore';
import { useNavigate } from 'react-router-dom';
import HardpointEditor from '../editors/HardpointEditor';
import VehicleParamsEditor from '../editors/VehicleParamsEditor';
import DesignTargetsEditor from '../editors/DesignTargetsEditor';
import DesignNotesEditor from '../editors/DesignNotesEditor';
import DesignListPanel from '../designs/DesignListPanel';
import DesignToolbar from '../designs/DesignToolbar';
import SuspensionViewer3D from '../viewer/SuspensionViewer3D';
import ChartPanel from '../charts/ChartPanel';
import GeometryResultsPanel from '../results/GeometryResultsPanel';
import ComparisonPanel from '../analysis/ComparisonPanel';
import KeyboardShortcutsModal from '../KeyboardShortcutsModal';
import OnboardingOverlay from '../OnboardingOverlay';
import { useUnitStore } from '../../stores/unitStore';
import { generateReportHtml, openReport } from '../../services/reportService';
import { generateShareUrl, decodeDesign } from '../../services/shareService';
import { useNotificationStore } from '../../stores/notificationStore';

const isDemo = import.meta.env.VITE_DEMO_MODE === 'true';

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
  const isCalculating = useCalculationStore((s) => s.isLoading);
  const calcError = useCalculationStore((s) => s.error);
  const navigate = useNavigate();
  const unitSystem = useUnitStore((s) => s.system);
  const toggleUnits = useUnitStore((s) => s.toggle);

  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  // Load shared design from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const designParam = params.get('design');
    if (designParam) {
      const decoded = decodeDesign(designParam);
      if (decoded) {
        const store = useDesignStore.getState();
        store.importFromJson(JSON.stringify({
          name: decoded.name,
          hardpoints: decoded.hardpoints,
          vehicleParams: decoded.vehicleParams,
        }));
        useNotificationStore.getState().addNotification('success', `Loaded shared design: ${decoded.name}`);
        // Clean the URL
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, []);

  const handleShare = () => {
    const { name, hardpoints, vehicleParams } = useDesignStore.getState();
    const url = generateShareUrl(name, hardpoints, vehicleParams);
    navigator.clipboard.writeText(url).then(() => {
      useNotificationStore.getState().addNotification('success', 'Share link copied to clipboard');
    });
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
      return;
    }

    if (e.key === '?') {
      e.preventDefault();
      setShortcutsOpen((prev) => !prev);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleGenerateReport = () => {
    const designState = useDesignStore.getState();
    const calcState = useCalculationStore.getState();
    const targetState = useTargetStore.getState();

    const html = generateReportHtml({
      name: designState.name,
      notes: designState.notes,
      hardpoints: designState.hardpoints,
      vehicleParams: designState.vehicleParams,
      geometry: calcState.geometryResult,
      dynamics: calcState.dynamicsResult,
      antiGeometry: calcState.antiGeometryResult,
      steering: calcState.steeringResult,
      camberCurve: calcState.camberCurve,
      rollCenterCurve: calcState.rollCenterCurve,
      bumpSteerCurve: calcState.bumpSteerCurve,
      targets: targetState.targets,
    });

    openReport(html);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-gray-200">
      {/* Header */}
      <header className="flex items-center justify-between px-2 sm:px-4 py-2 bg-[#1a1a2e] border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
          <button
            onClick={toggleSidebar}
            aria-pressed={sidebarVisible}
            aria-label="Toggle parameter sidebar"
            className="px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 focus:ring-1 focus:ring-blue-500 focus:outline-none shrink-0"
          >
            <span className="hidden sm:inline">{sidebarVisible ? 'Hide' : 'Show'} Params</span>
            <span className="sm:hidden">{sidebarVisible ? '\u2190' : '\u2192'}</span>
          </button>
          <h1 className="text-sm font-bold text-blue-400 tracking-wide uppercase hidden md:block shrink-0">
            Suspension Designer
          </h1>
          <h1 className="text-sm font-bold text-blue-400 tracking-wide uppercase md:hidden shrink-0">
            SusDes
          </h1>
          {isDemo && (
            <span className="px-1.5 py-0.5 text-[10px] bg-yellow-600/20 text-yellow-400 border border-yellow-600/40 rounded shrink-0">
              Demo
            </span>
          )}
          <span className="text-xs text-gray-400 truncate min-w-0">
            {designName}
            {isDirty && <span className="text-yellow-400 ml-1">*</span>}
          </span>
          {isCalculating && (
            <span className="text-xs text-blue-400 animate-pulse shrink-0 hidden sm:inline">Calculating...</span>
          )}
          {calcError && (
            <span className="text-xs text-red-400 shrink-0" title={calcError}>Calc error</span>
          )}
        </div>
        <div className="flex items-center gap-1 sm:gap-3 shrink-0">
          <button
            onClick={toggleUnits}
            className="px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 text-gray-400 hover:text-gray-200"
            title={`Switch to ${unitSystem === 'metric' ? 'imperial' : 'metric'} units`}
          >
            {unitSystem === 'metric' ? 'mm' : 'in'}
          </button>
          <button
            onClick={handleShare}
            className="px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 text-gray-400 hover:text-gray-200 hidden sm:block"
            title="Copy shareable link to clipboard"
          >
            Share
          </button>
          <button
            onClick={handleGenerateReport}
            className="px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 text-gray-400 hover:text-gray-200 hidden sm:block"
            title="Generate printable report"
          >
            Report
          </button>
          <button
            onClick={() => setShortcutsOpen(true)}
            className="px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 text-gray-400 hover:text-gray-200 hidden sm:block"
            title="Keyboard shortcuts (?)"
          >
            ?
          </button>
          {isAuthenticated ? (
            <>
              <span className="text-xs text-gray-400 hidden lg:inline">
                {user?.name || user?.email || 'User'}
              </span>
              <button
                onClick={logout}
                className="text-xs text-gray-400 hover:text-gray-200 px-2 py-1 border border-gray-700 rounded hidden sm:block"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 hidden sm:block"
            >
              Login
            </button>
          )}
          <button
            onClick={toggleResults}
            aria-pressed={resultsVisible}
            aria-label="Toggle results panel"
            className="px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 focus:ring-1 focus:ring-blue-500 focus:outline-none shrink-0"
          >
            <span className="hidden sm:inline">{resultsVisible ? 'Hide' : 'Show'} Results</span>
            <span className="sm:hidden">{resultsVisible ? '\u2192' : '\u2190'}</span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar - overlay on mobile, fixed on desktop */}
        {sidebarVisible && (
          <aside className="w-[280px] sm:w-[300px] shrink-0 bg-[#1a1a2e] border-r border-gray-800 overflow-y-auto absolute sm:relative z-20 h-[calc(100vh-41px)] sm:h-auto">
            <div className="p-3 space-y-3">
              <DesignToolbar />
              <DesignListPanel />
              <DesignNotesEditor />
              <DesignTargetsEditor />
              <HardpointEditor />
              <VehicleParamsEditor />
            </div>
          </aside>
        )}

        {/* Center - 3D Viewer + Charts */}
        <main className="flex-1 flex flex-col overflow-hidden min-w-0">
          <div className="flex-1 min-h-0">
            <SuspensionViewer3D />
          </div>
          <div className="h-[200px] sm:h-[280px] shrink-0 border-t border-gray-800">
            <ChartPanel />
          </div>
        </main>

        {/* Right panel - overlay on mobile, fixed on desktop */}
        {resultsVisible && (
          <aside className="w-[260px] sm:w-[280px] shrink-0 bg-gray-900 border-l border-gray-800 overflow-y-auto absolute sm:relative right-0 z-20 h-[calc(100vh-41px)] sm:h-auto">
            <GeometryResultsPanel />
            <ComparisonPanel />
          </aside>
        )}
      </div>

      {/* Modals */}
      <KeyboardShortcutsModal
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
      <OnboardingOverlay />
    </div>
  );
}
