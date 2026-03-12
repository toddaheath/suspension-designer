import { useEffect } from 'react';

const isMac = typeof navigator !== 'undefined' && /Mac/.test(navigator.userAgent);
const mod = isMac ? 'Cmd' : 'Ctrl';

const SHORTCUTS = [
  { category: 'Editing', shortcuts: [
    { keys: `${mod}+Z`, description: 'Undo' },
    { keys: `${mod}+Shift+Z`, description: 'Redo' },
  ]},
  { category: 'View', shortcuts: [
    { keys: '?', description: 'Toggle this help' },
    { keys: 'Scroll', description: 'Zoom 3D view' },
    { keys: 'Left-drag', description: 'Rotate 3D view' },
    { keys: 'Right-drag', description: 'Pan 3D view' },
    { keys: 'Front/Side/Top/Iso', description: 'Camera presets (buttons)' },
  ]},
  { category: 'Analysis', shortcuts: [
    { keys: 'Compare', description: 'Click Compare on saved design' },
    { keys: 'Sensitivity tab', description: 'Parametric sweep analysis' },
  ]},
  { category: 'Animation', shortcuts: [
    { keys: 'Space', description: 'Play/pause suspension travel' },
  ]},
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsModal({ isOpen, onClose }: Props) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl w-96 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <h2 className="text-sm font-semibold text-gray-200">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 text-lg leading-none"
          >
            x
          </button>
        </div>
        <div className="p-4 space-y-4">
          {SHORTCUTS.map((group) => (
            <div key={group.category}>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                {group.category}
              </h3>
              <div className="space-y-1.5">
                {group.shortcuts.map((s) => (
                  <div key={s.keys} className="flex items-center justify-between">
                    <span className="text-xs text-gray-300">{s.description}</span>
                    <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-gray-800 border border-gray-600 rounded text-gray-300">
                      {s.keys}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="px-4 py-3 border-t border-gray-700">
          <p className="text-[10px] text-gray-500">
            Press <kbd className="px-1 py-0.5 bg-gray-800 border border-gray-600 rounded text-[10px]">?</kbd> or <kbd className="px-1 py-0.5 bg-gray-800 border border-gray-600 rounded text-[10px]">Esc</kbd> to close
          </p>
        </div>
      </div>
    </div>
  );
}
