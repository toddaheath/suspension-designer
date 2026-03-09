import { useEffect, useRef, useState } from 'react';
import { SuspensionScene } from './SuspensionScene';
import { useDesignStore } from '../../stores/designStore';

export default function SuspensionViewer3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<SuspensionScene | null>(null);
  const hardpoints = useDesignStore((s) => s.hardpoints);
  const tireRadius = useDesignStore((s) => s.vehicleParams.tireRadius);
  const [showLabels, setShowLabels] = useState(true);

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
      sceneRef.current.update(hardpoints, tireRadius);
    }
  }, [hardpoints, tireRadius]);

  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.setAnnotationsVisible(showLabels);
    }
  }, [showLabels]);

  return (
    <div ref={containerRef} className="w-full h-full relative bg-[#1a1a2e]">
      <div className="absolute top-2 right-2 z-10 flex gap-1">
        <button
          onClick={() => setShowLabels(!showLabels)}
          className={`px-2 py-1 text-xs rounded border ${
            showLabels
              ? 'bg-blue-600 border-blue-500 text-white'
              : 'bg-gray-800 border-gray-600 text-gray-400'
          }`}
        >
          Labels
        </button>
      </div>
    </div>
  );
}
