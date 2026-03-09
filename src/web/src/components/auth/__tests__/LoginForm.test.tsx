import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LoginForm from '../LoginForm';

const mockLogin = vi.fn();

vi.mock('../../../stores/authStore', () => ({
  useAuthStore: vi.fn(),
}));

import { useAuthStore } from '../../../stores/authStore';

const mockUseAuthStore = vi.mocked(useAuthStore);

describe('LoginForm', () => {
  const mockOnSwitchToRegister = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuthStore.mockImplementation((selector: any) => {
      const state = {
        login: mockLogin,
        isLoading: false,
        error: null,
      };
      return selector(state);
    });
  });

  it('renders email and password inputs', () => {
    render(<LoginForm onSwitchToRegister={mockOnSwitchToRegister} />);

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('renders Login button', () => {
    render(<LoginForm onSwitchToRegister={mockOnSwitchToRegister} />);

    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  it('shows "Logging in..." when isLoading is true', () => {
    mockUseAuthStore.mockImplementation((selector: any) => {
      const state = {
        login: mockLogin,
        isLoading: true,
        error: null,
      };
      return selector(state);
    });

    render(<LoginForm onSwitchToRegister={mockOnSwitchToRegister} />);

    expect(screen.getByRole('button', { name: 'Logging in...' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Logging in...' })).toBeDisabled();
  });

  it('displays error message when error is set', () => {
    mockUseAuthStore.mockImplementation((selector: any) => {
      const state = {
        login: mockLogin,
        isLoading: false,
        error: 'Invalid credentials',
      };
      return selector(state);
    });

    render(<LoginForm onSwitchToRegister={mockOnSwitchToRegister} />);

    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });

  it('calls login with email and password on submit', () => {
    render(<LoginForm onSwitchToRegister={mockOnSwitchToRegister} />);

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'secret123' },
    });
    fireEvent.submit(screen.getByRole('button', { name: 'Login' }));

    expect(mockLogin).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'secret123',
    });
  });

  it('calls onSwitchToRegister when Register link clicked', () => {
    render(<LoginForm onSwitchToRegister={mockOnSwitchToRegister} />);

    fireEvent.click(screen.getByRole('button', { name: 'Register' }));

    expect(mockOnSwitchToRegister).toHaveBeenCalled();
  });

  it('email input is labeled correctly', () => {
    render(<LoginForm onSwitchToRegister={mockOnSwitchToRegister} />);

    const emailInput = screen.getByLabelText('Email');
    expect(emailInput).toHaveAttribute('id', 'login-email');
    expect(emailInput).toHaveAttribute('type', 'email');
  });
});
