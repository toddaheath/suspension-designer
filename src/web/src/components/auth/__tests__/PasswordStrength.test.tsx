import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RegisterForm from '../RegisterForm';

vi.mock('../../../stores/authStore', () => ({
  useAuthStore: vi.fn(),
}));

import { useAuthStore } from '../../../stores/authStore';

const mockRegister = vi.fn();
const mockUseAuthStore = vi.mocked(useAuthStore);

describe('Password strength indicator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuthStore.mockImplementation((selector: any) => {
      const state = { register: mockRegister, isLoading: false, error: null };
      return selector(state);
    });
  });

  it('shows no indicator when password is empty', () => {
    render(<RegisterForm onSwitchToLogin={vi.fn()} />);
    expect(screen.queryByText('Weak')).not.toBeInTheDocument();
    expect(screen.queryByText('Strong')).not.toBeInTheDocument();
  });

  it('shows Weak for short lowercase-only password', () => {
    render(<RegisterForm onSwitchToLogin={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'abc' } });
    expect(screen.getByText('Weak')).toBeInTheDocument();
  });

  it('shows Strong when all requirements met', () => {
    render(<RegisterForm onSwitchToLogin={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Abcdefg1' } });
    expect(screen.getByText('Strong')).toBeInTheDocument();
  });

  it('disables submit button when password is weak', () => {
    render(<RegisterForm onSwitchToLogin={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'weak' } });
    expect(screen.getByRole('button', { name: 'Register' })).toBeDisabled();
  });

  it('enables submit button when password is strong', () => {
    render(<RegisterForm onSwitchToLogin={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Strong1x' } });
    expect(screen.getByRole('button', { name: 'Register' })).not.toBeDisabled();
  });

  it('shows hints for missing requirements', () => {
    render(<RegisterForm onSwitchToLogin={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'abc' } });
    expect(screen.getByText('At least 8 characters')).toBeInTheDocument();
    expect(screen.getByText('One uppercase letter')).toBeInTheDocument();
    expect(screen.getByText('One number')).toBeInTheDocument();
  });

  it('does not call register when password is weak', () => {
    render(<RegisterForm onSwitchToLogin={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'weak' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Register' }));
    expect(mockRegister).not.toHaveBeenCalled();
  });
});
