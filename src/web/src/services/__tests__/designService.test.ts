import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { DoubleWishboneHardpoints, VehicleParams } from '../../types/suspension';

vi.mock('../apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import apiClient from '../apiClient';
import {
  listDesigns,
  getDesign,
  createDesign,
  updateDesign,
  deleteDesign,
} from '../designService';

const mockGet = vi.mocked(apiClient.get);
const mockPost = vi.mocked(apiClient.post);
const mockPut = vi.mocked(apiClient.put);
const mockDelete = vi.mocked(apiClient.delete);

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

describe('designService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listDesigns', () => {
    it('calls GET /designs and returns the data', async () => {
      const mockDesigns = [
        { id: '1', name: 'Design A', createdAt: '2025-01-01', updatedAt: '2025-01-02' },
        { id: '2', name: 'Design B', createdAt: '2025-02-01', updatedAt: '2025-02-02' },
      ];
      mockGet.mockResolvedValueOnce({ data: mockDesigns });

      const result = await listDesigns();

      expect(mockGet).toHaveBeenCalledWith('/designs');
      expect(result).toEqual(mockDesigns);
    });

    it('propagates errors', async () => {
      mockGet.mockRejectedValueOnce(new Error('Server error'));

      await expect(listDesigns()).rejects.toThrow('Server error');
    });
  });

  describe('getDesign', () => {
    it('calls GET /designs/:id and returns the data', async () => {
      const mockDetail = {
        id: 'abc-123',
        name: 'My Design',
        createdAt: '2025-01-01',
        updatedAt: '2025-01-02',
        suspensionType: 0,
        axlePosition: 0,
        ...sampleHardpoints,
        ...sampleVehicleParams,
      };
      mockGet.mockResolvedValueOnce({ data: mockDetail });

      const result = await getDesign('abc-123');

      expect(mockGet).toHaveBeenCalledWith('/designs/abc-123');
      expect(result).toEqual(mockDetail);
    });

    it('interpolates the id into the URL', async () => {
      mockGet.mockResolvedValueOnce({ data: {} });

      await getDesign('xyz-789');

      expect(mockGet).toHaveBeenCalledWith('/designs/xyz-789');
    });
  });

  describe('createDesign', () => {
    it('calls POST /designs with the correct payload', async () => {
      const mockResponse = { id: 'new-id', name: 'Test Design' };
      mockPost.mockResolvedValueOnce({ data: mockResponse });

      const result = await createDesign('Test Design', sampleHardpoints, sampleVehicleParams);

      expect(mockPost).toHaveBeenCalledWith('/designs', expect.any(Object));
      expect(result).toEqual(mockResponse);
    });

    it('includes design name in the payload', async () => {
      mockPost.mockResolvedValueOnce({ data: {} });

      await createDesign('My Design', sampleHardpoints, sampleVehicleParams);

      const payload = mockPost.mock.calls[0][1] as Record<string, unknown>;
      expect(payload.name).toBe('My Design');
    });

    it('includes all hardpoints in the payload', async () => {
      mockPost.mockResolvedValueOnce({ data: {} });

      await createDesign('Test', sampleHardpoints, sampleVehicleParams);

      const payload = mockPost.mock.calls[0][1] as Record<string, unknown>;
      expect(payload.upperWishboneFrontPivot).toEqual(sampleHardpoints.upperWishboneFrontPivot);
      expect(payload.lowerBallJoint).toEqual(sampleHardpoints.lowerBallJoint);
      expect(payload.tieRodInner).toEqual(sampleHardpoints.tieRodInner);
      expect(payload.tieRodOuter).toEqual(sampleHardpoints.tieRodOuter);
      expect(payload.springDamperUpper).toEqual(sampleHardpoints.springDamperUpper);
      expect(payload.springDamperLower).toEqual(sampleHardpoints.springDamperLower);
      expect(payload.pushrodWheelEnd).toEqual(sampleHardpoints.pushrodWheelEnd);
      expect(payload.pushrodRockerEnd).toEqual(sampleHardpoints.pushrodRockerEnd);
    });

    it('includes all vehicle params in the payload', async () => {
      mockPost.mockResolvedValueOnce({ data: {} });

      await createDesign('Test', sampleHardpoints, sampleVehicleParams);

      const payload = mockPost.mock.calls[0][1] as Record<string, unknown>;
      expect(payload.trackWidth).toBe(1200);
      expect(payload.wheelbase).toBe(1550);
      expect(payload.sprungMass).toBe(200);
      expect(payload.unsprungMass).toBe(25);
      expect(payload.springRate).toBe(25000);
      expect(payload.dampingCoefficient).toBe(1500);
      expect(payload.rideHeight).toBe(50);
      expect(payload.tireRadius).toBe(228);
      expect(payload.cgHeight).toBe(300);
      expect(payload.frontBrakeProportion).toBe(0.6);
    });

    it('sets suspensionType and axlePosition to 0', async () => {
      mockPost.mockResolvedValueOnce({ data: {} });

      await createDesign('Test', sampleHardpoints, sampleVehicleParams);

      const payload = mockPost.mock.calls[0][1] as Record<string, unknown>;
      expect(payload.suspensionType).toBe(0);
      expect(payload.axlePosition).toBe(0);
    });
  });

  describe('updateDesign', () => {
    it('calls PUT /designs/:id with the correct payload', async () => {
      const mockResponse = { id: 'existing-id', name: 'Updated Design' };
      mockPut.mockResolvedValueOnce({ data: mockResponse });

      const result = await updateDesign('existing-id', 'Updated Design', sampleHardpoints, sampleVehicleParams);

      expect(mockPut).toHaveBeenCalledWith('/designs/existing-id', expect.any(Object));
      expect(result).toEqual(mockResponse);
    });

    it('includes the updated name in the payload', async () => {
      mockPut.mockResolvedValueOnce({ data: {} });

      await updateDesign('id-1', 'New Name', sampleHardpoints, sampleVehicleParams);

      const payload = mockPut.mock.calls[0][1] as Record<string, unknown>;
      expect(payload.name).toBe('New Name');
    });

    it('interpolates the id into the URL', async () => {
      mockPut.mockResolvedValueOnce({ data: {} });

      await updateDesign('design-456', 'Name', sampleHardpoints, sampleVehicleParams);

      expect(mockPut).toHaveBeenCalledWith('/designs/design-456', expect.any(Object));
    });
  });

  describe('deleteDesign', () => {
    it('calls DELETE /designs/:id', async () => {
      mockDelete.mockResolvedValueOnce({ data: undefined });

      await deleteDesign('del-123');

      expect(mockDelete).toHaveBeenCalledWith('/designs/del-123');
    });

    it('does not return any data', async () => {
      mockDelete.mockResolvedValueOnce({ data: undefined });

      const result = await deleteDesign('del-123');

      expect(result).toBeUndefined();
    });

    it('propagates errors', async () => {
      mockDelete.mockRejectedValueOnce(new Error('Not found'));

      await expect(deleteDesign('bad-id')).rejects.toThrow('Not found');
    });
  });
});
