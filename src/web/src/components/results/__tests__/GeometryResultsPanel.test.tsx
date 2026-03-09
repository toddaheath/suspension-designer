import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import GeometryResultsPanel from '../GeometryResultsPanel';

vi.mock('../../../stores/calculationStore', () => ({
  useCalculationStore: vi.fn(),
}));

import { useCalculationStore } from '../../../stores/calculationStore';

const mockUseStore = vi.mocked(useCalculationStore);

// ── Sample data ──────────────────────────────────────────────────────────────

const sampleGeometry = {
  instantCenter: { x: 100.5, y: -200.3, z: 450.7 },
  rollCenterHeight: 52.3,
  kingpinInclinationDegrees: 12.45,
  casterAngleDegrees: 5.67,
  scrubRadius: 10.2,
  mechanicalTrail: 15.8,
};

const sampleDynamics = {
  motionRatio: 0.654,
  wheelRate: 28.3,
  naturalFrequency: 1.42,
  dampingRatio: 0.345,
  criticalDamping: 4200.5,
};

const sampleAntiGeometry = {
  antiDivePercent: 38.2,
  antiSquatPercent: 55.7,
};

const sampleSteering = {
  ackermannCurve: [
    { steeringAngleDegrees: 10, ackermannPercent: 62.3 },
    { steeringAngleDegrees: 20, ackermannPercent: 58.1 },
    { steeringAngleDegrees: 30, ackermannPercent: 53.9 },
  ],
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const emptyState = {
  geometryResult: null,
  dynamicsResult: null,
  antiGeometryResult: null,
  steeringResult: null,
  isLoading: false,
  error: null,
};

function setupStore(overrides: Partial<typeof emptyState> = {}) {
  const state = { ...emptyState, ...overrides };
  mockUseStore.mockImplementation((selector: any) => selector(state));
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('GeometryResultsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 1. Loading state
  it('shows "Calculating..." when isLoading is true', () => {
    setupStore({ isLoading: true });
    render(<GeometryResultsPanel />);
    expect(screen.getByText('Calculating...')).toBeInTheDocument();
  });

  // 2. Error state
  it('shows error message when error is set', () => {
    setupStore({ error: 'Server unreachable' });
    render(<GeometryResultsPanel />);
    expect(screen.getByText('Error: Server unreachable')).toBeInTheDocument();
  });

  // 3. No results state
  it('shows "No results yet" when all results are null', () => {
    setupStore();
    render(<GeometryResultsPanel />);
    expect(
      screen.getByText(/No results yet/),
    ).toBeInTheDocument();
  });

  // 4. Geometry result rows
  it('renders geometry result rows', () => {
    setupStore({ geometryResult: sampleGeometry });
    render(<GeometryResultsPanel />);

    expect(screen.getByText('Instant Center X')).toBeInTheDocument();
    expect(screen.getByText('100.5')).toBeInTheDocument();

    expect(screen.getByText('Instant Center Y')).toBeInTheDocument();
    expect(screen.getByText('-200.3')).toBeInTheDocument();

    expect(screen.getByText('Instant Center Z')).toBeInTheDocument();
    expect(screen.getByText('450.7')).toBeInTheDocument();

    expect(screen.getByText('Roll Center Height')).toBeInTheDocument();
    expect(screen.getByText('52.3')).toBeInTheDocument();

    expect(screen.getByText('KPI Angle')).toBeInTheDocument();
    expect(screen.getByText('12.45')).toBeInTheDocument();

    expect(screen.getByText('Caster Angle')).toBeInTheDocument();
    expect(screen.getByText('5.67')).toBeInTheDocument();

    expect(screen.getByText('Scrub Radius')).toBeInTheDocument();
    expect(screen.getByText('10.2')).toBeInTheDocument();

    expect(screen.getByText('Mechanical Trail')).toBeInTheDocument();
    expect(screen.getByText('15.8')).toBeInTheDocument();
  });

  // 5. Dynamics result rows
  it('renders dynamics result rows', () => {
    setupStore({ dynamicsResult: sampleDynamics });
    render(<GeometryResultsPanel />);

    expect(screen.getByText('Motion Ratio')).toBeInTheDocument();
    expect(screen.getByText('0.654')).toBeInTheDocument();

    expect(screen.getByText('Wheel Rate')).toBeInTheDocument();
    expect(screen.getByText('28.3')).toBeInTheDocument();

    expect(screen.getByText('Natural Frequency')).toBeInTheDocument();
    expect(screen.getByText('1.42')).toBeInTheDocument();

    expect(screen.getByText('Damping Ratio')).toBeInTheDocument();
    expect(screen.getByText('0.345')).toBeInTheDocument();

    expect(screen.getByText('Critical Damping')).toBeInTheDocument();
    expect(screen.getByText('4200.5')).toBeInTheDocument();
  });

  // 6. Anti-geometry rows
  it('renders anti-geometry rows', () => {
    setupStore({ antiGeometryResult: sampleAntiGeometry });
    render(<GeometryResultsPanel />);

    expect(screen.getByText('Anti-Dive')).toBeInTheDocument();
    expect(screen.getByText('38.2')).toBeInTheDocument();

    expect(screen.getByText('Anti-Squat')).toBeInTheDocument();
    expect(screen.getByText('55.7')).toBeInTheDocument();
  });

  // 7. Ackermann Geometry rows
  it('renders Ackermann Geometry rows when steeringResult is present', () => {
    setupStore({ steeringResult: sampleSteering });
    render(<GeometryResultsPanel />);

    expect(screen.getByText('Steer 10°')).toBeInTheDocument();
    expect(screen.getByText('62.3')).toBeInTheDocument();

    expect(screen.getByText('Steer 20°')).toBeInTheDocument();
    expect(screen.getByText('58.1')).toBeInTheDocument();

    expect(screen.getByText('Steer 30°')).toBeInTheDocument();
    expect(screen.getByText('53.9')).toBeInTheDocument();
  });

  // 8. Section headers
  it('renders all section headers when all results are present', () => {
    setupStore({
      geometryResult: sampleGeometry,
      dynamicsResult: sampleDynamics,
      antiGeometryResult: sampleAntiGeometry,
      steeringResult: sampleSteering,
    });
    render(<GeometryResultsPanel />);

    expect(screen.getByText('Geometry Results')).toBeInTheDocument();
    expect(screen.getByText('Dynamics Results')).toBeInTheDocument();
    expect(screen.getByText('Anti-Geometry')).toBeInTheDocument();
    expect(screen.getByText('Ackermann Geometry')).toBeInTheDocument();
  });
});
