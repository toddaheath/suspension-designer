import { useDesignStore } from '../../stores/designStore';
import ParameterGroup from './ParameterGroup';

export default function DesignNotesEditor() {
  const notes = useDesignStore((s) => s.notes);
  const setNotes = useDesignStore((s) => s.setNotes);

  return (
    <ParameterGroup title="Design Notes" defaultOpen={false}>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add notes about this design..."
        rows={4}
        className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-xs text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none resize-y"
      />
    </ParameterGroup>
  );
}
