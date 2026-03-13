import { useEffect, useRef, useCallback } from 'react';

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
  ]},
  { category: 'Charts', shortcuts: [
    { keys: '1-9', description: 'Switch chart tab (1=Camber ... 9=Sensitivity)' },
  ]},
  { category: 'Animation', shortcuts: [
    { keys: 'Space', description: 'Play/pause suspension travel' },
  ]},
  { category: 'Theme', shortcuts: [
    { keys: 'T', description: 'Toggle dark/light theme' },
  ]},
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsModal({ isOpen, onClose }: Props) {
  const modalRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }
    if (e.key === 'Tab' && modalRef.current) {
      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener('keydown', handleKeyDown);
    // Auto-focus the close button on open
    const timer = setTimeout(() => {
      const btn = modalRef.current?.querySelector<HTMLElement>('button');
      btn?.focus();
    }, 0);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
    >
      <div ref={modalRef} className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl w-96 max-h-[80vh] overflow-y-auto">
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
