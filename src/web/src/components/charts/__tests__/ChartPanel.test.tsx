import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ChartPanel from '../ChartPanel';
import { useUIStore } from '../../../stores/uiStore';

// Mock all child chart components to avoid recharts rendering issues in jsdom
vi.mock('../CamberCurveChart', () => ({
  default: () => <div data-testid="camber-chart">CamberCurveChart</div>,
}));
vi.mock('../RollCenterChart', () => ({
  default: () => <div data-testid="roll-center-chart">RollCenterChart</div>,
}));
vi.mock('../MotionRatioChart', () => ({
  default: () => <div data-testid="motion-ratio-chart">MotionRatioChart</div>,
}));
vi.mock('../BumpSteerChart', () => ({
  default: () => <div data-testid="bump-steer-chart">BumpSteerChart</div>,
}));
vi.mock('../AntiGeometryPanel', () => ({
  default: () => <div data-testid="anti-geometry-panel">AntiGeometryPanel</div>,
}));
vi.mock('../SteeringChart', () => ({
  default: () => <div data-testid="steering-chart">SteeringChart</div>,
}));

describe('ChartPanel', () => {
  beforeEach(() => {
    // Reset to default tab (camber)
    useUIStore.setState({ activeChartTab: 'camber' });
  });

  const tabs = [
    { label: 'Camber', testId: 'camber-chart' },
    { label: 'Roll Center', testId: 'roll-center-chart' },
    { label: 'Dynamics', testId: 'motion-ratio-chart' },
    { label: 'Bump Steer', testId: 'bump-steer-chart' },
    { label: 'Anti-Geometry', testId: 'anti-geometry-panel' },
    { label: 'Steering', testId: 'steering-chart' },
  ];

  it('renders all 6 tab buttons', () => {
    render(<ChartPanel />);

    for (const tab of tabs) {
      expect(screen.getByRole('button', { name: tab.label })).toBeInTheDocument();
    }
  });

  it('shows CamberCurveChart by default', () => {
    render(<ChartPanel />);

    expect(screen.getByTestId('camber-chart')).toBeInTheDocument();
  });

  it.each(tabs)('clicking "$label" tab shows the correct chart', ({ label, testId }) => {
    render(<ChartPanel />);

    fireEvent.click(screen.getByRole('button', { name: label }));

    expect(screen.getByTestId(testId)).toBeInTheDocument();
  });

  it('only shows one chart component at a time', () => {
    render(<ChartPanel />);

    // Default is camber
    expect(screen.getByTestId('camber-chart')).toBeInTheDocument();
    expect(screen.queryByTestId('roll-center-chart')).not.toBeInTheDocument();
    expect(screen.queryByTestId('motion-ratio-chart')).not.toBeInTheDocument();
    expect(screen.queryByTestId('bump-steer-chart')).not.toBeInTheDocument();
    expect(screen.queryByTestId('anti-geometry-panel')).not.toBeInTheDocument();
    expect(screen.queryByTestId('steering-chart')).not.toBeInTheDocument();
  });

  it('switches from one chart to another', () => {
    render(<ChartPanel />);

    // Start on camber
    expect(screen.getByTestId('camber-chart')).toBeInTheDocument();

    // Switch to Roll Center
    fireEvent.click(screen.getByRole('button', { name: 'Roll Center' }));
    expect(screen.getByTestId('roll-center-chart')).toBeInTheDocument();
    expect(screen.queryByTestId('camber-chart')).not.toBeInTheDocument();

    // Switch to Steering
    fireEvent.click(screen.getByRole('button', { name: 'Steering' }));
    expect(screen.getByTestId('steering-chart')).toBeInTheDocument();
    expect(screen.queryByTestId('roll-center-chart')).not.toBeInTheDocument();
  });

  it('updates the UI store when a tab is clicked', () => {
    render(<ChartPanel />);

    fireEvent.click(screen.getByRole('button', { name: 'Anti-Geometry' }));

    expect(useUIStore.getState().activeChartTab).toBe('antiGeometry');
  });

  it('reflects external store changes', () => {
    render(<ChartPanel />);

    // Externally set the tab via the store, wrapped in act to flush state updates
    act(() => {
      useUIStore.setState({ activeChartTab: 'bumpSteer' });
    });

    expect(screen.getByTestId('bump-steer-chart')).toBeInTheDocument();
  });
});
