import { useEffect, useRef } from 'react';
import { SuspensionScene } from './SuspensionScene';
import { useDesignStore } from '../../stores/designStore';

export default function SuspensionViewer3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<SuspensionScene | null>(null);
  const hardpoints = useDesignStore((s) => s.hardpoints);

  useEffect(() => {
    if (!containerRef.current) return;
    const scene = new SuspensionScene(containerRef.current);
    sceneRef.current = scene;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          scene.resize(width, height);
        }
      }
    });
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.update(hardpoints);
    }
  }, [hardpoints]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative bg-[#1a1a2e]"
    />
  );
}
