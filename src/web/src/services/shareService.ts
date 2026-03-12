import type { DoubleWishboneHardpoints, VehicleParams } from '../types/suspension';

interface SharedDesign {
  n: string;  // name
  h: DoubleWishboneHardpoints;
  v: VehicleParams;
}

/**
 * Encode a design into a shareable URL parameter string.
 * Uses JSON + base64 encoding for compact URL-safe representation.
 */
export function encodeDesign(name: string, hardpoints: DoubleWishboneHardpoints, vehicleParams: VehicleParams): string {
  const data: SharedDesign = { n: name, h: hardpoints, v: vehicleParams };
  const json = JSON.stringify(data);
  return btoa(json);
}

/**
 * Decode a design from a URL parameter string.
 * Returns null if the data is invalid.
 */
export function decodeDesign(encoded: string): { name: string; hardpoints: DoubleWishboneHardpoints; vehicleParams: VehicleParams } | null {
  try {
    const json = atob(encoded);
    const data = JSON.parse(json) as SharedDesign;
    if (!data.h || !data.v || !data.n) return null;
    // Basic validation
    if (typeof data.h.upperBallJoint?.x !== 'number') return null;
    if (typeof data.v.trackWidth !== 'number') return null;
    return { name: data.n, hardpoints: data.h, vehicleParams: data.v };
  } catch {
    return null;
  }
}

/**
 * Generate a full shareable URL for the current design.
 */
export function generateShareUrl(name: string, hardpoints: DoubleWishboneHardpoints, vehicleParams: VehicleParams): string {
  const encoded = encodeDesign(name, hardpoints, vehicleParams);
  const base = window.location.origin + window.location.pathname;
  return `${base}?design=${encoded}`;
}
