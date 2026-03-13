import { useEffect, useRef, useState, useCallback } from 'react';
import { SuspensionScene } from './SuspensionScene';
import { useDesignStore } from '../../stores/designStore';
import { useCalculationStore } from '../../stores/calculationStore';
import { solveWheelTravel } from '../../services/kinematicsService';

export default function SuspensionViewer3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<SuspensionScene | null>(null);
  const hardpoints = useDesignStore((s) => s.hardpoints);
  const tireRadius = useDesignStore((s) => s.vehicleParams.tireRadius);
  const icCurve = useCalculationStore((s) => s.instantCenterCurve);
  const [showLabels, setShowLabels] = useState(true);
  const [showICPath, setShowICPath] = useState(false);

  // Animation state
  const [wheelTravel, setWheelTravel] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animSpeed, setAnimSpeed] = useState(1);
  const animRef = useRef<number>(0);
  const animTimeRef = useRef(0);

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

  // Update scene with hardpoints (apply wheel travel if non-zero)
  const updateScene = useCallback((travel: number) => {
    if (!sceneRef.current) return;
    const displaced = solveWheelTravel(hardpoints, travel);
    sceneRef.current.update(displaced, tireRadius);
  }, [hardpoints, tireRadius]);

  useEffect(() => {
    updateScene(wheelTravel);
  }, [hardpoints, tireRadius, wheelTravel, updateScene]);

  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.setAnnotationsVisible(showLabels);
    }
  }, [showLabels]);

  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.setICPathVisible(showICPath);
      if (showICPath) {
        sceneRef.current.updateICPath(icCurve);
      }
    }
  }, [showICPath, icCurve]);

  // Space bar play/pause
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return;
      if (e.key === ' ') {
        e.preventDefault();
        toggleAnimation();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [wheelTravel, isAnimating]); // eslint-disable-line react-hooks/exhaustive-deps

  // Animation loop: oscillate between -75mm and +75mm
  useEffect(() => {
    if (!isAnimating) {
      cancelAnimationFrame(animRef.current);
      return;
    }

    let lastTime: number | null = null;
    const tick = (time: number) => {
      if (lastTime === null) lastTime = time;
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      animTimeRef.current += dt * animSpeed;
      // Sinusoidal oscillation: amplitude = 75mm
      const travel = Math.sin(animTimeRef.current * Math.PI) * 75;
      setWheelTravel(travel);

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [isAnimating, animSpeed]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setWheelTravel(val);
    if (isAnimating) setIsAnimating(false);
  };

  const toggleAnimation = () => {
    if (!isAnimating) {
      animTimeRef.current = Math.asin(wheelTravel / 75) / Math.PI;
    }
    setIsAnimating(!isAnimating);
  };

  const resetTravel = () => {
    setIsAnimating(false);
    setWheelTravel(0);
  };

  return (
    <div ref={containerRef} className="w-full h-full relative bg-[#1a1a2e]">
      {/* Top-right controls */}
      <div className="absolute top-2 right-2 z-10 flex gap-1">
        {(['front', 'side', 'top', 'iso'] as const).map((preset) => (
          <button
            key={preset}
            onClick={() => sceneRef.current?.setCameraPreset(preset)}
            className="px-2 py-1 text-xs rounded border bg-gray-800 border-gray-600 text-gray-400 hover:text-gray-200 hover:bg-gray-700"
            title={`${preset.charAt(0).toUpperCase() + preset.slice(1)} view`}
          >
            {preset.charAt(0).toUpperCase() + preset.slice(1)}
          </button>
        ))}
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
        <button
          onClick={() => setShowICPath(!showICPath)}
          className={`px-2 py-1 text-xs rounded border ${
            showICPath
              ? 'bg-emerald-600 border-emerald-500 text-white'
              : 'bg-gray-800 border-gray-600 text-gray-400'
          }`}
          title="Show instant center migration path"
        >
          IC
        </button>
        <button
          onClick={() => sceneRef.current?.resetCamera()}
          className="px-2 py-1 text-xs rounded border bg-gray-800 border-gray-600 text-gray-400 hover:text-gray-200 hover:bg-gray-700"
          title="Reset camera view"
        >
          Reset
        </button>
      </div>

      {/* Bottom animation controls */}
      <div className="absolute bottom-2 left-2 right-2 z-10">
        <div className="bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleAnimation}
              className={`w-7 h-7 flex items-center justify-center rounded border text-xs shrink-0 ${
                isAnimating
                  ? 'bg-yellow-600 border-yellow-500 text-white'
                  : 'bg-blue-600 border-blue-500 text-white hover:bg-blue-700'
              }`}
              title={isAnimating ? 'Pause animation' : 'Animate suspension travel'}
            >
              {isAnimating ? '\u2016' : '\u25B6'}
            </button>

            <div className="flex-1 flex items-center gap-2">
              <span className="text-[10px] text-gray-400 w-6 text-right shrink-0">
                -75
              </span>
              <input
                type="range"
                min={-75}
                max={75}
                step={1}
                value={wheelTravel}
                onChange={handleSliderChange}
                className="flex-1 h-1.5 accent-blue-500 cursor-pointer"
                title={`Wheel travel: ${wheelTravel.toFixed(0)} mm`}
              />
              <span className="text-[10px] text-gray-400 w-6 shrink-0">
                +75
              </span>
            </div>

            <span className="text-xs text-gray-200 font-mono w-16 text-center shrink-0">
              {wheelTravel >= 0 ? '+' : ''}{wheelTravel.toFixed(0)} mm
            </span>

            {/* Speed control */}
            <select
              value={animSpeed}
              onChange={(e) => setAnimSpeed(parseFloat(e.target.value))}
              className="bg-gray-800 border border-gray-600 rounded px-1 py-0.5 text-[10px] text-gray-300"
              title="Animation speed"
            >
              <option value={0.5}>0.5x</option>
              <option value={1}>1x</option>
              <option value={2}>2x</option>
            </select>

            {wheelTravel !== 0 && (
              <button
                onClick={resetTravel}
                className="px-1.5 py-0.5 text-[10px] rounded border bg-gray-800 border-gray-600 text-gray-400 hover:text-gray-200 hover:bg-gray-700 shrink-0"
                title="Reset to static position"
              >
                Reset
              </button>
            )}
          </div>

          {/* Travel indicator labels */}
          <div className="flex justify-between mt-0.5 px-9">
            <span className="text-[9px] text-gray-500">Rebound</span>
            <span className="text-[9px] text-gray-500">
              {wheelTravel === 0 ? 'Static' : wheelTravel > 0 ? 'Bump' : 'Rebound'}
            </span>
            <span className="text-[9px] text-gray-500">Bump</span>
          </div>
        </div>
      </div>
    </div>
  );
}
