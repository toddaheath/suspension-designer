import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { DoubleWishboneHardpoints, VehicleParams } from '../../types/suspension';

// Mock apiClient before importing the service
vi.mock('../apiClient', () => ({
  default: {
    post: vi.fn(),
  },
}));

import apiClient from '../apiClient';
import {
  calculateGeometry,
  calculateCamberCurve,
  calculateRollCenter,
  calculateDynamics,
  calculateBumpSteer,
  calculateAntiGeometry,
  calculateSteering,
  calculateSweep,
} from '../calculationService';

const mockPost = vi.mocked(apiClient.post);

const sampleHardpoints: DoubleWishboneHardpoints = {
  upperWishboneFrontPivot: { x: 100, y: 250, z: 300 },
  upperWishboneRearPivot: { x: -100, y: 250, z: 300 },
  upperBallJoint: { x: 0, y: 600, z: 280 },
  lowerWishboneFrontPivot: { x: 120, y: 200, z: 150 },
  lowerWishboneRearPivot: { x: -120, y: 200, z: 150 },
  lowerBallJoint: { x: 0, y: 620, z: 130 },
  tieRodInner: { x: -80, y: 220, z: 160 },
  tieRodOuter: { x: -80, y: 610, z: 155 },
  springDamperLower: { x: 0, y: 400, z: 150 },
  springDamperUpper: { x: 0, y: 350, z: 400 },
  pushrodWheelEnd: { x: 0, y: 500, z: 140 },
  pushrodRockerEnd: { x: 0, y: 300, z: 350 },
  wheelCenter: { x: 0, y: 650, z: 228 },
  contactPatch: { x: 0, y: 650, z: 0 },
};

const sampleVehicleParams: VehicleParams = {
  trackWidth: 1200,
  wheelbase: 1550,
  sprungMass: 200,
  unsprungMass: 25,
  springRate: 25000,
  dampingCoefficient: 1500,
  rideHeight: 50,
  tireRadius: 228,
  cgHeight: 300,
  frontBrakeProportion: 0.6,
  antiRollBarRate: 0,
};

describe('calculationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('buildPayload (via service calls)', () => {
    it('sends correct payload structure with hardpoints and vehicle params', async () => {
      mockPost.mockResolvedValueOnce({ data: {} });

      await calculateGeometry(sampleHardpoints, sampleVehicleParams);

      const payload = mockPost.mock.calls[0][1];
      // Verify all hardpoints are included (excluding wheelCenter and contactPatch which are rendering-only)
      expect(payload).toHaveProperty('upperWishboneFrontPivot', sampleHardpoints.upperWishboneFrontPivot);
      expect(payload).toHaveProperty('upperWishboneRearPivot', sampleHardpoints.upperWishboneRearPivot);
      expect(payload).toHaveProperty('upperBallJoint', sampleHardpoints.upperBallJoint);
      expect(payload).toHaveProperty('lowerWishboneFrontPivot', sampleHardpoints.lowerWishboneFrontPivot);
      expect(payload).toHaveProperty('lowerWishboneRearPivot', sampleHardpoints.lowerWishboneRearPivot);
      expect(payload).toHaveProperty('lowerBallJoint', sampleHardpoints.lowerBallJoint);
      expect(payload).toHaveProperty('tieRodInner', sampleHardpoints.tieRodInner);
      expect(payload).toHaveProperty('tieRodOuter', sampleHardpoints.tieRodOuter);
      expect(payload).toHaveProperty('springDamperUpper', sampleHardpoints.springDamperUpper);
      expect(payload).toHaveProperty('springDamperLower', sampleHardpoints.springDamperLower);
      expect(payload).toHaveProperty('pushrodWheelEnd', sampleHardpoints.pushrodWheelEnd);
      expect(payload).toHaveProperty('pushrodRockerEnd', sampleHardpoints.pushrodRockerEnd);

      // Verify vehicle params are included
      expect(payload).toHaveProperty('trackWidth', 1200);
      expect(payload).toHaveProperty('wheelbase', 1550);
      expect(payload).toHaveProperty('sprungMass', 200);
      expect(payload).toHaveProperty('unsprungMass', 25);
      expect(payload).toHaveProperty('springRate', 25000);
      expect(payload).toHaveProperty('dampingCoefficient', 1500);
      expect(payload).toHaveProperty('rideHeight', 50);
      expect(payload).toHaveProperty('tireRadius', 228);
      expect(payload).toHaveProperty('cgHeight', 300);
      expect(payload).toHaveProperty('frontBrakeProportion', 0.6);
    });

    it('sets name to empty string and suspensionType/axlePosition to 0', async () => {
      mockPost.mockResolvedValueOnce({ data: {} });

      await calculateGeometry(sampleHardpoints, sampleVehicleParams);

      const payload = mockPost.mock.calls[0][1] as Record<string, unknown>;
      expect(payload.name).toBe('');
      expect(payload.suspensionType).toBe(0);
      expect(payload.axlePosition).toBe(0);
    });

    it('does not include wheelCenter or contactPatch in payload', async () => {
      mockPost.mockResolvedValueOnce({ data: {} });

      await calculateGeometry(sampleHardpoints, sampleVehicleParams);

      const payload = mockPost.mock.calls[0][1];
      expect(payload).not.toHaveProperty('wheelCenter');
      expect(payload).not.toHaveProperty('contactPatch');
    });
  });

  describe('calculateGeometry', () => {
    it('posts to /calculations/geometry and returns response data', async () => {
      const mockResult = {
        instantCenter: { x: 1, y: 2, z: 3 },
        rollCenterHeight: 50,
        kingpinInclinationDegrees: 12,
        casterAngleDegrees: 5,
        scrubRadius: 10,
        mechanicalTrail: 15,
      };
      mockPost.mockResolvedValueOnce({ data: mockResult });

      const result = await calculateGeometry(sampleHardpoints, sampleVehicleParams);

      expect(mockPost).toHaveBeenCalledWith('/calculations/geometry', expect.any(Object));
      expect(result).toEqual(mockResult);
    });
  });

  describe('calculateCamberCurve', () => {
    it('posts to /calculations/camber-curve and returns response data', async () => {
      const mockResult = [
        { wheelTravel: -50, camberAngleDegrees: -1.2 },
        { wheelTravel: 0, camberAngleDegrees: 0 },
        { wheelTravel: 50, camberAngleDegrees: 1.1 },
      ];
      mockPost.mockResolvedValueOnce({ data: mockResult });

      const result = await calculateCamberCurve(sampleHardpoints, sampleVehicleParams);

      expect(mockPost).toHaveBeenCalledWith('/calculations/camber-curve', expect.any(Object));
      expect(result).toEqual(mockResult);
    });
  });

  describe('calculateRollCenter', () => {
    it('posts to /calculations/roll-center and returns response data', async () => {
      const mockResult = [
        { rollAngleDegrees: -3, rollCenterHeight: 48 },
        { rollAngleDegrees: 0, rollCenterHeight: 50 },
        { rollAngleDegrees: 3, rollCenterHeight: 48 },
      ];
      mockPost.mockResolvedValueOnce({ data: mockResult });

      const result = await calculateRollCenter(sampleHardpoints, sampleVehicleParams);

      expect(mockPost).toHaveBeenCalledWith('/calculations/roll-center', expect.any(Object));
      expect(result).toEqual(mockResult);
    });
  });

  describe('calculateDynamics', () => {
    it('posts to /calculations/dynamics and returns response data', async () => {
      const mockResult = {
        motionRatio: 0.85,
        wheelRate: 18062.5,
        naturalFrequency: 1.7,
        dampingRatio: 0.45,
        criticalDamping: 3333,
      };
      mockPost.mockResolvedValueOnce({ data: mockResult });

      const result = await calculateDynamics(sampleHardpoints, sampleVehicleParams);

      expect(mockPost).toHaveBeenCalledWith('/calculations/dynamics', expect.any(Object));
      expect(result).toEqual(mockResult);
    });
  });

  describe('calculateBumpSteer', () => {
    it('posts to /calculations/bump-steer and returns response data', async () => {
      const mockResult = [
        { wheelTravel: -30, toeAngleDegrees: 0.01 },
        { wheelTravel: 0, toeAngleDegrees: 0 },
        { wheelTravel: 30, toeAngleDegrees: -0.02 },
      ];
      mockPost.mockResolvedValueOnce({ data: mockResult });

      const result = await calculateBumpSteer(sampleHardpoints, sampleVehicleParams);

      expect(mockPost).toHaveBeenCalledWith('/calculations/bump-steer', expect.any(Object));
      expect(result).toEqual(mockResult);
    });
  });

  describe('calculateAntiGeometry', () => {
    it('posts to /calculations/anti-geometry and returns response data', async () => {
      const mockResult = { antiDivePercent: 35.2, antiSquatPercent: 42.1 };
      mockPost.mockResolvedValueOnce({ data: mockResult });

      const result = await calculateAntiGeometry(sampleHardpoints, sampleVehicleParams);

      expect(mockPost).toHaveBeenCalledWith('/calculations/anti-geometry', expect.any(Object));
      expect(result).toEqual(mockResult);
    });
  });

  describe('calculateSteering', () => {
    it('posts to /calculations/steering and returns response data', async () => {
      const mockResult = {
        ackermannCurve: [
          { steeringAngleDegrees: 5, ackermannPercent: 95 },
          { steeringAngleDegrees: 10, ackermannPercent: 90 },
        ],
      };
      mockPost.mockResolvedValueOnce({ data: mockResult });

      const result = await calculateSteering(sampleHardpoints, sampleVehicleParams);

      expect(mockPost).toHaveBeenCalledWith('/calculations/steering', expect.any(Object));
      expect(result).toEqual(mockResult);
    });
  });

  describe('calculateSweep', () => {
    it('posts to /calculations/sweep and returns all results in one call', async () => {
      const mockResult = {
        geometry: { instantCenter: { x: 1, y: 2, z: 3 }, rollCenterHeight: 50 },
        camberCurve: [{ wheelTravel: 0, camberAngleDegrees: 0 }],
        rollCenterMigration: [{ rollAngleDegrees: 0, rollCenterHeight: 50 }],
        dynamics: { motionRatio: 0.85, wheelRate: 18000 },
        antiGeometry: { antiDivePercent: 35, antiSquatPercent: 42 },
        steering: { ackermannCurve: [{ steeringAngleDegrees: 5, ackermannPercent: 95 }] },
        bumpSteer: [{ wheelTravel: 0, toeAngleDegrees: 0 }],
      };
      mockPost.mockResolvedValueOnce({ data: mockResult });

      const result = await calculateSweep(sampleHardpoints, sampleVehicleParams);

      expect(mockPost).toHaveBeenCalledWith('/calculations/sweep', expect.any(Object));
      expect(result).toEqual(mockResult);
    });
  });

  describe('error propagation', () => {
    it('propagates errors from apiClient', async () => {
      mockPost.mockRejectedValueOnce(new Error('Network Error'));

      await expect(
        calculateGeometry(sampleHardpoints, sampleVehicleParams)
      ).rejects.toThrow('Network Error');
    });
  });
});
