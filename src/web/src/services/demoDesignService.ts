import type { DoubleWishboneHardpoints, VehicleParams } from '../types/suspension';
import type { DesignSummary, DesignDetail } from './designService';

const STORAGE_KEY = 'suspension-demo-designs';

function loadAll(): DesignDetail[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAll(designs: DesignDetail[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(designs));
}

function toDetail(
  id: string,
  name: string,
  hp: DoubleWishboneHardpoints,
  vp: VehicleParams,
): DesignDetail {
  const now = new Date().toISOString();
  return {
    id,
    name,
    createdAt: now,
    updatedAt: now,
    suspensionType: 0,
    axlePosition: 0,
    ...hp,
    ...vp,
  };
}

export async function demoListDesigns(): Promise<DesignSummary[]> {
  return loadAll().map(({ id, name, createdAt, updatedAt }) => ({
    id, name, createdAt, updatedAt,
  }));
}

export async function demoGetDesign(id: string): Promise<DesignDetail> {
  const designs = loadAll();
  const found = designs.find((d) => d.id === id);
  if (!found) throw new Error('Design not found');
  return found;
}

export async function demoCreateDesign(
  name: string,
  hp: DoubleWishboneHardpoints,
  vp: VehicleParams,
): Promise<DesignDetail> {
  const designs = loadAll();
  const id = crypto.randomUUID();
  const detail = toDetail(id, name, hp, vp);
  designs.push(detail);
  saveAll(designs);
  return detail;
}

export async function demoUpdateDesign(
  id: string,
  name: string,
  hp: DoubleWishboneHardpoints,
  vp: VehicleParams,
): Promise<DesignDetail> {
  const designs = loadAll();
  const idx = designs.findIndex((d) => d.id === id);
  if (idx < 0) throw new Error('Design not found');
  const detail = toDetail(id, name, hp, vp);
  detail.createdAt = designs[idx].createdAt;
  designs[idx] = detail;
  saveAll(designs);
  return detail;
}

export async function demoDeleteDesign(id: string): Promise<void> {
  const designs = loadAll().filter((d) => d.id !== id);
  saveAll(designs);
}
