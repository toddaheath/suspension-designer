import { useState } from 'react';

interface ParameterGroupProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export default function ParameterGroup({
  title,
  children,
  defaultOpen = true,
}: ParameterGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-700 rounded mb-2">
      <button
        className="w-full flex items-center justify-between px-3 py-2 bg-gray-800 hover:bg-gray-750 text-sm font-medium text-gray-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{title}</span>
        <span className="text-gray-400">{isOpen ? '\u25B2' : '\u25BC'}</span>
      </button>
      {isOpen && <div className="p-3 space-y-2">{children}</div>}
    </div>
  );
}
