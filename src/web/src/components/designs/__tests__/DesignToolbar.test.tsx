import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import DesignToolbar from '../DesignToolbar';
import { useDesignStore } from '../../../stores/designStore';
import { VEHICLE_PRESETS } from '../../../data/vehiclePresets';

describe('DesignToolbar', () => {
  beforeEach(() => {
    useDesignStore.getState().resetToDefaults();
  });

  // ─── Rendering ────────────────────────────────────────────────────

  it('renders all toolbar buttons', () => {
    render(<DesignToolbar />);

    expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Redo' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Presets' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Import' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument();
  });

  // ─── Undo / Redo disabled state ──────────────────────────────────

  it('disables Undo and Redo when there is no history', () => {
    render(<DesignToolbar />);

    expect(screen.getByRole('button', { name: 'Undo' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Redo' })).toBeDisabled();
  });

  it('enables Undo after a state change and Redo after an undo', () => {
    // Make a change to push something onto the undo stack
    act(() => {
      useDesignStore.getState().updateVehicleParam('trackWidth', 9999);
    });

    render(<DesignToolbar />);

    const undoBtn = screen.getByRole('button', { name: 'Undo' });
    const redoBtn = screen.getByRole('button', { name: 'Redo' });

    expect(undoBtn).toBeEnabled();
    expect(redoBtn).toBeDisabled();

    // Perform undo
    fireEvent.click(undoBtn);

    expect(screen.getByRole('button', { name: 'Redo' })).toBeEnabled();
  });

  // ─── Presets dropdown ─────────────────────────────────────────────

  it('opens preset dropdown on click and shows all preset items', () => {
    render(<DesignToolbar />);

    // Dropdown should not be visible initially
    for (const preset of VEHICLE_PRESETS) {
      expect(screen.queryByText(preset.name)).not.toBeInTheDocument();
    }

    // Click Presets button
    fireEvent.click(screen.getByRole('button', { name: 'Presets' }));

    // Now all presets should be visible
    for (const preset of VEHICLE_PRESETS) {
      expect(screen.getByText(preset.name)).toBeInTheDocument();
      expect(screen.getByText(preset.description)).toBeInTheDocument();
    }
  });

  it('applies a preset and closes dropdown when a preset is clicked', () => {
    render(<DesignToolbar />);

    fireEvent.click(screen.getByRole('button', { name: 'Presets' }));

    const firstPreset = VEHICLE_PRESETS[0];
    fireEvent.click(screen.getByText(firstPreset.name));

    // Dropdown should be closed
    expect(screen.queryByText(firstPreset.description)).not.toBeInTheDocument();

    // Store should have the preset applied
    const state = useDesignStore.getState();
    expect(state.name).toBe(firstPreset.name);
    expect(state.vehicleParams.trackWidth).toBe(firstPreset.vehicleParams.trackWidth);
  });

  it('closes preset dropdown when clicking outside', () => {
    render(<DesignToolbar />);

    // Open the dropdown
    fireEvent.click(screen.getByRole('button', { name: 'Presets' }));
    expect(screen.getByText(VEHICLE_PRESETS[0].name)).toBeInTheDocument();

    // Click outside (mousedown on document body)
    fireEvent.mouseDown(document.body);

    // Dropdown should be closed
    expect(screen.queryByText(VEHICLE_PRESETS[0].description)).not.toBeInTheDocument();
  });

  // ─── Export ───────────────────────────────────────────────────────

  it('exports design as JSON and triggers download', () => {
    const createObjectURLMock = vi.fn(() => 'blob:mock-url');
    const revokeObjectURLMock = vi.fn();
    global.URL.createObjectURL = createObjectURLMock;
    global.URL.revokeObjectURL = revokeObjectURLMock;

    const clickMock = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') {
        return { href: '', download: '', click: clickMock } as unknown as HTMLElement;
      }
      return originalCreateElement(tag);
    });

    render(<DesignToolbar />);
    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    expect(createObjectURLMock).toHaveBeenCalledTimes(1);
    expect(clickMock).toHaveBeenCalledTimes(1);
    expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:mock-url');

    vi.restoreAllMocks();
  });

  // ─── Import ───────────────────────────────────────────────────────

  it('triggers hidden file input click when Import button is clicked', () => {
    render(<DesignToolbar />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = vi.spyOn(fileInput, 'click');

    fireEvent.click(screen.getByRole('button', { name: 'Import' }));

    expect(clickSpy).toHaveBeenCalledTimes(1);
    clickSpy.mockRestore();
  });

  it('imports a valid JSON file and updates the store', async () => {
    const designData = {
      name: 'Test Import',
      hardpoints: useDesignStore.getState().hardpoints,
      vehicleParams: { ...useDesignStore.getState().vehicleParams, trackWidth: 7777 },
    };

    render(<DesignToolbar />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File([JSON.stringify(designData)], 'design.json', {
      type: 'application/json',
    });

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
      // Wait for FileReader to finish
      await new Promise((r) => setTimeout(r, 50));
    });

    const state = useDesignStore.getState();
    expect(state.name).toBe('Test Import');
    expect(state.vehicleParams.trackWidth).toBe(7777);
  });

  it('shows error message when importing an invalid JSON file', async () => {
    render(<DesignToolbar />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['not valid json'], 'bad.json', {
      type: 'application/json',
    });

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(screen.getByText('Invalid design file')).toBeInTheDocument();
  });

  // ─── Reset ────────────────────────────────────────────────────────

  it('resets to defaults when Reset button is clicked', () => {
    // First change the store state
    act(() => {
      useDesignStore.getState().updateVehicleParam('trackWidth', 9999);
      useDesignStore.getState().setName('Modified Design');
    });

    render(<DesignToolbar />);
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));

    const state = useDesignStore.getState();
    expect(state.name).toBe('Untitled Design');
    expect(state.vehicleParams.trackWidth).toBe(1200);
    expect(state.isDirty).toBe(false);
  });

  // ─── Keyboard shortcuts ───────────────────────────────────────────

  it('calls undo on Ctrl+Z', () => {
    // Push something onto undo stack first
    act(() => {
      useDesignStore.getState().updateVehicleParam('trackWidth', 5555);
    });
    expect(useDesignStore.getState().vehicleParams.trackWidth).toBe(5555);

    render(<DesignToolbar />);

    fireEvent.keyDown(window, { key: 'z', ctrlKey: true });

    // Should have undone the change back to 1200
    expect(useDesignStore.getState().vehicleParams.trackWidth).toBe(1200);
  });

  it('calls redo on Ctrl+Shift+Z', () => {
    // Push something, then undo it
    act(() => {
      useDesignStore.getState().updateVehicleParam('trackWidth', 5555);
      useDesignStore.getState().undo();
    });
    expect(useDesignStore.getState().vehicleParams.trackWidth).toBe(1200);

    render(<DesignToolbar />);

    fireEvent.keyDown(window, { key: 'z', ctrlKey: true, shiftKey: true });

    expect(useDesignStore.getState().vehicleParams.trackWidth).toBe(5555);
  });
});
