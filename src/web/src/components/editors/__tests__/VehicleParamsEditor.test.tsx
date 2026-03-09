import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import VehicleParamsEditor from '../VehicleParamsEditor';
import { useDesignStore } from '../../../stores/designStore';

describe('VehicleParamsEditor', () => {
  beforeEach(() => {
    useDesignStore.getState().resetToDefaults();
  });

  const expectedParams = [
    { label: 'Track Width', key: 'trackWidth', defaultValue: 1200 },
    { label: 'Wheelbase', key: 'wheelbase', defaultValue: 1550 },
    { label: 'Sprung Mass', key: 'sprungMass', defaultValue: 200 },
    { label: 'Unsprung Mass', key: 'unsprungMass', defaultValue: 25 },
    { label: 'Spring Rate', key: 'springRate', defaultValue: 25000 },
    { label: 'Damping Coeff.', key: 'dampingCoefficient', defaultValue: 1500 },
    { label: 'Ride Height', key: 'rideHeight', defaultValue: 50 },
    { label: 'Tire Radius', key: 'tireRadius', defaultValue: 228 },
    { label: 'CG Height', key: 'cgHeight', defaultValue: 300 },
    { label: 'Front Brake Bias', key: 'frontBrakeProportion', defaultValue: 0.6 },
  ];

  it('renders the "Vehicle Parameters" group title', () => {
    render(<VehicleParamsEditor />);
    expect(screen.getByText('Vehicle Parameters')).toBeInTheDocument();
  });

  it.each(expectedParams)('renders label for $label', ({ label }) => {
    render(<VehicleParamsEditor />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it.each(expectedParams)(
    'renders input for $key with default value $defaultValue',
    ({ key, defaultValue }) => {
      render(<VehicleParamsEditor />);
      const input = screen.getByLabelText(expectedParams.find((p) => p.key === key)!.label);
      expect(input).toHaveValue(defaultValue);
    }
  );

  it('renders all 10 number inputs', () => {
    render(<VehicleParamsEditor />);
    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs).toHaveLength(10);
  });

  it('calls updateVehicleParam when an input value changes', () => {
    render(<VehicleParamsEditor />);

    const input = screen.getByLabelText('Track Width');
    fireEvent.change(input, { target: { value: '1400' } });

    const state = useDesignStore.getState();
    expect(state.vehicleParams.trackWidth).toBe(1400);
    expect(state.isDirty).toBe(true);
  });

  it('sets value to 0 when input is cleared (empty string)', () => {
    render(<VehicleParamsEditor />);

    const input = screen.getByLabelText('Sprung Mass');
    fireEvent.change(input, { target: { value: '' } });

    expect(useDesignStore.getState().vehicleParams.sprungMass).toBe(0);
  });

  it('handles decimal values correctly', () => {
    render(<VehicleParamsEditor />);

    const input = screen.getByLabelText('Front Brake Bias');
    fireEvent.change(input, { target: { value: '0.65' } });

    expect(useDesignStore.getState().vehicleParams.frontBrakeProportion).toBe(0.65);
  });

  it('displays units next to their parameters', () => {
    render(<VehicleParamsEditor />);

    // The units are rendered as spans — check a few representative ones
    const mmElements = screen.getAllByText('mm');
    expect(mmElements.length).toBeGreaterThanOrEqual(1);

    expect(screen.getAllByText('kg').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('N/mm')).toBeInTheDocument();
    expect(screen.getByText('Ns/m')).toBeInTheDocument();
  });
});
