import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RegisterForm from '../RegisterForm';

const mockRegister = vi.fn();

vi.mock('../../../stores/authStore', () => ({
  useAuthStore: vi.fn(),
}));

import { useAuthStore } from '../../../stores/authStore';

const mockUseAuthStore = vi.mocked(useAuthStore);

describe('RegisterForm', () => {
  const mockOnSwitchToLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuthStore.mockImplementation((selector: any) => {
      const state = {
        register: mockRegister,
        isLoading: false,
        error: null,
      };
      return selector(state);
    });
  });

  it('renders name, email, and password inputs', () => {
    render(<RegisterForm onSwitchToLogin={mockOnSwitchToLogin} />);

    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('renders Register button', () => {
    render(<RegisterForm onSwitchToLogin={mockOnSwitchToLogin} />);

    expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument();
  });

  it('shows "Registering..." when isLoading is true', () => {
    mockUseAuthStore.mockImplementation((selector: any) => {
      const state = {
        register: mockRegister,
        isLoading: true,
        error: null,
      };
      return selector(state);
    });

    render(<RegisterForm onSwitchToLogin={mockOnSwitchToLogin} />);

    expect(screen.getByRole('button', { name: 'Registering...' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Registering...' })).toBeDisabled();
  });

  it('displays error message when error is set', () => {
    mockUseAuthStore.mockImplementation((selector: any) => {
      const state = {
        register: mockRegister,
        isLoading: false,
        error: 'Email already exists',
      };
      return selector(state);
    });

    render(<RegisterForm onSwitchToLogin={mockOnSwitchToLogin} />);

    expect(screen.getByText('Email already exists')).toBeInTheDocument();
  });

  it('calls register with name, email, and password on submit', () => {
    render(<RegisterForm onSwitchToLogin={mockOnSwitchToLogin} />);

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Jane Doe' },
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'jane@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'Password1' },
    });
    fireEvent.submit(screen.getByRole('button', { name: 'Register' }));

    expect(mockRegister).toHaveBeenCalledWith({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'Password1',
    });
  });

  it('calls onSwitchToLogin when Login link clicked', () => {
    render(<RegisterForm onSwitchToLogin={mockOnSwitchToLogin} />);

    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    expect(mockOnSwitchToLogin).toHaveBeenCalled();
  });

  it('all inputs are labeled correctly', () => {
    render(<RegisterForm onSwitchToLogin={mockOnSwitchToLogin} />);

    const nameInput = screen.getByLabelText('Name');
    expect(nameInput).toHaveAttribute('id', 'register-name');
    expect(nameInput).toHaveAttribute('type', 'text');

    const emailInput = screen.getByLabelText('Email');
    expect(emailInput).toHaveAttribute('id', 'register-email');
    expect(emailInput).toHaveAttribute('type', 'email');

    const passwordInput = screen.getByLabelText('Password');
    expect(passwordInput).toHaveAttribute('id', 'register-password');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
