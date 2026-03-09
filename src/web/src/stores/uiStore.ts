import { create } from 'zustand';

type ChartTab = 'camber' | 'rollCenter' | 'motionRatio';
type ViewMode = '3d' | 'charts' | 'split';

interface UIState {
  sidebarVisible: boolean;
  resultsVisible: boolean;
  activeChartTab: ChartTab;
  viewMode: ViewMode;
  toggleSidebar: () => void;
  toggleResults: () => void;
  setActiveChartTab: (tab: ChartTab) => void;
  setViewMode: (mode: ViewMode) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarVisible: true,
  resultsVisible: true,
  activeChartTab: 'camber',
  viewMode: '3d',

  toggleSidebar: () => set((s) => ({ sidebarVisible: !s.sidebarVisible })),
  toggleResults: () => set((s) => ({ resultsVisible: !s.resultsVisible })),
  setActiveChartTab: (tab) => set({ activeChartTab: tab }),
  setViewMode: (mode) => set({ viewMode: mode }),
}));
