import { useState, useEffect } from 'react';

const ONBOARDING_KEY = 'suspension-designer-onboarded';

const steps = [
  {
    title: 'Welcome to Suspension Designer',
    body: 'Design and analyze double-wishbone suspension geometry with real-time calculations and 3D visualization.',
  },
  {
    title: 'Hardpoints & Parameters',
    body: 'Use the left sidebar to edit suspension hardpoint coordinates and vehicle parameters. Changes automatically recalculate all results.',
  },
  {
    title: '3D Viewer',
    body: 'The center panel shows a 3D view of your suspension. Drag to orbit, scroll to zoom, and use the Front/Side/Top/Iso buttons for preset views.',
  },
  {
    title: 'Charts & Analysis',
    body: 'Below the 3D view, explore camber curves, bump steer, roll center migration, motion ratio, and sensitivity analysis across tabs.',
  },
  {
    title: 'Results & Comparison',
    body: 'The right panel shows geometry results with target pass/fail indicators. Save designs and compare them side-by-side.',
  },
  {
    title: 'Design Targets',
    body: 'Set min/max targets for key metrics, or load a built-in preset (Street, Track, Comfort). Results highlight pass/warn/fail status.',
  },
];

export default function OnboardingOverlay() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem(ONBOARDING_KEY)) {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setVisible(false);
  };

  if (!visible) return null;

  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] text-gray-500 uppercase tracking-wide">
            Step {step + 1} of {steps.length}
          </span>
          <button
            onClick={dismiss}
            className="text-xs text-gray-500 hover:text-gray-300"
          >
            Skip
          </button>
        </div>
        <h2 className="text-lg font-semibold text-blue-400 mb-2">{current.title}</h2>
        <p className="text-sm text-gray-300 leading-relaxed mb-6">{current.body}</p>
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${i === step ? 'bg-blue-500' : 'bg-gray-700'}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 text-gray-400"
              >
                Back
              </button>
            )}
            <button
              onClick={isLast ? dismiss : () => setStep(step + 1)}
              className="px-4 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 rounded text-white font-medium"
            >
              {isLast ? 'Get Started' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
