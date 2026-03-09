import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HardpointEditor from '../HardpointEditor';
import { useDesignStore } from '../../../stores/designStore';

const GROUP_TITLES = [
  'Upper Wishbone',
  'Lower Wishbone',
  'Tie Rod',
  'Wheel & Contact',
  'Spring / Damper',
  'Pushrod',
];

/** Expand all collapsed ParameterGroup sections so their children render. */
function expandAllGroups() {
  for (const title of GROUP_TITLES) {
    const button = screen.getByText(title).closest('button')!;
    fireEvent.click(button);
  }
}

describe('HardpointEditor', () => {
  beforeEach(() => {
    useDesignStore.getState().resetToDefaults();
  });

  it('renders the "Hardpoints" heading', () => {
    render(<HardpointEditor />);
    expect(screen.getByText('Hardpoints (mm)')).toBeInTheDocument();
  });

  it('renders all hardpoint group names', () => {
    render(<HardpointEditor />);
    for (const title of GROUP_TITLES) {
      expect(screen.getByText(title)).toBeInTheDocument();
    }
  });

  it('renders X, Y, Z inputs for each hardpoint (42 total)', () => {
    render(<HardpointEditor />);
    expandAllGroups();

    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs).toHaveLength(42);
  });

  it('changing an input value updates the store', () => {
    render(<HardpointEditor />);
    expandAllGroups();

    const input = screen.getByLabelText('Ball Joint X', { selector: '#hp-upperBallJoint-x' });
    fireEvent.change(input, { target: { value: '55' } });

    const state = useDesignStore.getState();
    expect(state.hardpoints.upperBallJoint.x).toBe(55);
    expect(state.isDirty).toBe(true);
  });

  it('uses fieldset elements for accessibility', () => {
    render(<HardpointEditor />);
    expandAllGroups();

    const fieldsets = document.querySelectorAll('fieldset');
    // 14 hardpoints, each wrapped in a <fieldset>
    expect(fieldsets.length).toBe(14);
  });

  it('inputs have correct default values for upperBallJoint (x:0, y:600, z:280)', () => {
    render(<HardpointEditor />);
    expandAllGroups();

    const xInput = screen.getByLabelText('Ball Joint X', { selector: '#hp-upperBallJoint-x' });
    const yInput = screen.getByLabelText('Ball Joint Y', { selector: '#hp-upperBallJoint-y' });
    const zInput = screen.getByLabelText('Ball Joint Z', { selector: '#hp-upperBallJoint-z' });

    expect(xInput).toHaveValue(0);
    expect(yInput).toHaveValue(600);
    expect(zInput).toHaveValue(280);
  });
});
