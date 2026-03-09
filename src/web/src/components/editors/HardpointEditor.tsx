import { useDesignStore } from '../../stores/designStore';
import ParameterGroup from './ParameterGroup';
import type { DoubleWishboneHardpoints } from '../../types/suspension';

const HARDPOINT_GROUPS: {
  label: string;
  points: { key: keyof DoubleWishboneHardpoints; label: string }[];
}[] = [
  {
    label: 'Upper Wishbone',
    points: [
      { key: 'upperWishboneFrontPivot', label: 'Front Pivot' },
      { key: 'upperWishboneRearPivot', label: 'Rear Pivot' },
      { key: 'upperBallJoint', label: 'Ball Joint' },
    ],
  },
  {
    label: 'Lower Wishbone',
    points: [
      { key: 'lowerWishboneFrontPivot', label: 'Front Pivot' },
      { key: 'lowerWishboneRearPivot', label: 'Rear Pivot' },
      { key: 'lowerBallJoint', label: 'Ball Joint' },
    ],
  },
  {
    label: 'Tie Rod',
    points: [
      { key: 'tieRodInner', label: 'Inner' },
      { key: 'tieRodOuter', label: 'Outer' },
    ],
  },
  {
    label: 'Wheel & Contact',
    points: [
      { key: 'wheelCenter', label: 'Wheel Center' },
      { key: 'contactPatch', label: 'Contact Patch' },
    ],
  },
  {
    label: 'Spring / Damper',
    points: [
      { key: 'springDamperLower', label: 'Lower (Wheel Side)' },
      { key: 'springDamperUpper', label: 'Upper (Body Side)' },
    ],
  },
  {
    label: 'Pushrod',
    points: [
      { key: 'pushrodWheelEnd', label: 'Wheel End' },
      { key: 'pushrodRockerEnd', label: 'Rocker End' },
    ],
  },
];

function PointInput({
  pointKey,
  label,
}: {
  pointKey: keyof DoubleWishboneHardpoints;
  label: string;
}) {
  const point = useDesignStore((s) => s.hardpoints[pointKey]);
  const updateHardpoint = useDesignStore((s) => s.updateHardpoint);

  return (
    <div className="mb-2">
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className="grid grid-cols-3 gap-1">
        {(['x', 'y', 'z'] as const).map((axis) => (
          <div key={axis} className="flex items-center">
            <span className="text-xs text-gray-500 w-4 uppercase">{axis}</span>
            <input
              type="number"
              value={point[axis]}
              onChange={(e) =>
                updateHardpoint(pointKey, axis, parseFloat(e.target.value) || 0)
              }
              className="w-full bg-gray-800 border border-gray-600 rounded px-1.5 py-0.5 text-xs text-gray-200 focus:border-blue-500 focus:outline-none"
              step={1}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HardpointEditor() {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-300 mb-2 px-1">
        Hardpoints (mm)
      </h3>
      {HARDPOINT_GROUPS.map((group) => (
        <ParameterGroup key={group.label} title={group.label} defaultOpen={false}>
          {group.points.map((pt) => (
            <PointInput key={pt.key} pointKey={pt.key} label={pt.label} />
          ))}
        </ParameterGroup>
      ))}
    </div>
  );
}
