import { describe, it, expect } from 'vitest';
import { exportResultsCsv } from '../exportService';

const emptyData = {
  geometry: null,
  dynamics: null,
  antiGeometry: null,
  steering: null,
  camberCurve: [],
  rollCenterCurve: [],
  bumpSteerCurve: [],
};

describe('exportResultsCsv', () => {
  it('returns empty string when no data', () => {
    const csv = exportResultsCsv(emptyData);
    expect(csv).toBe('');
  });

  it('includes geometry section when geometry provided', () => {
    const csv = exportResultsCsv({
      ...emptyData,
      geometry: {
        instantCenter: { x: 10, y: 20, z: 30 },
        rollCenterHeight: 45.5,
        kingpinInclinationDegrees: 8.123,
        casterAngleDegrees: 5.456,
        scrubRadius: 12.3,
        mechanicalTrail: 15.7,
      },
    });
    expect(csv).toContain('Geometry Results');
    expect(csv).toContain('Roll Center Height');
    expect(csv).toContain('45.50');
    expect(csv).toContain('KPI Angle');
  });

  it('includes dynamics section when dynamics provided', () => {
    const csv = exportResultsCsv({
      ...emptyData,
      dynamics: {
        motionRatio: 0.85,
        wheelRate: 18.1,
        naturalFrequency: 2.3,
        dampingRatio: 0.45,
        criticalDamping: 3.2,
      },
    });
    expect(csv).toContain('Dynamics Results');
    expect(csv).toContain('Motion Ratio');
    expect(csv).toContain('0.8500');
  });

  it('includes camber curve data points', () => {
    const csv = exportResultsCsv({
      ...emptyData,
      camberCurve: [
        { wheelTravel: -20, camberAngleDegrees: -1.5 },
        { wheelTravel: 0, camberAngleDegrees: 0 },
        { wheelTravel: 20, camberAngleDegrees: 1.2 },
      ],
    });
    expect(csv).toContain('Camber Curve');
    expect(csv).toContain('Wheel Travel (mm)');
    expect(csv).toContain('-20.00');
  });

  it('includes bump steer data points', () => {
    const csv = exportResultsCsv({
      ...emptyData,
      bumpSteerCurve: [
        { wheelTravel: -10, toeAngleDegrees: 0.05 },
        { wheelTravel: 10, toeAngleDegrees: -0.03 },
      ],
    });
    expect(csv).toContain('Bump Steer');
    expect(csv).toContain('Toe Angle (deg)');
  });

  it('includes all sections when all data provided', () => {
    const csv = exportResultsCsv({
      geometry: {
        instantCenter: { x: 0, y: 0, z: 0 },
        rollCenterHeight: 50,
        kingpinInclinationDegrees: 8,
        casterAngleDegrees: 5,
        scrubRadius: 10,
        mechanicalTrail: 15,
      },
      dynamics: {
        motionRatio: 0.8,
        wheelRate: 16,
        naturalFrequency: 2,
        dampingRatio: 0.4,
        criticalDamping: 3,
      },
      antiGeometry: { antiDivePercent: 30, antiSquatPercent: 20 },
      steering: {
        ackermannCurve: [{ steeringAngleDegrees: 5, ackermannPercent: 60 }],
      },
      camberCurve: [{ wheelTravel: 0, camberAngleDegrees: 0 }],
      rollCenterCurve: [{ rollAngleDegrees: 0, rollCenterHeight: 50 }],
      bumpSteerCurve: [{ wheelTravel: 0, toeAngleDegrees: 0 }],
    });
    expect(csv).toContain('Geometry Results');
    expect(csv).toContain('Dynamics Results');
    expect(csv).toContain('Anti-Geometry');
    expect(csv).toContain('Camber Curve');
    expect(csv).toContain('Roll Center Migration');
    expect(csv).toContain('Bump Steer');
    expect(csv).toContain('Ackermann Geometry');
  });
});
