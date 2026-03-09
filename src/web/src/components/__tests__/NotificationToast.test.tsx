import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import NotificationToast from '../NotificationToast';
import { useNotificationStore } from '../../stores/notificationStore';

describe('NotificationToast', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    useNotificationStore.setState({ notifications: [] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders nothing when there are no notifications', () => {
    const { container } = render(<NotificationToast />);
    expect(container.innerHTML).toBe('');
  });

  it('renders notification messages', () => {
    useNotificationStore.setState({
      notifications: [
        { id: '1', type: 'success', message: 'Design saved!' },
        { id: '2', type: 'error', message: 'Something went wrong' },
      ],
    });

    render(<NotificationToast />);

    expect(screen.getByText('Design saved!')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  describe('shows correct colors for notification types', () => {
    it('applies green classes for success type', () => {
      useNotificationStore.setState({
        notifications: [{ id: '1', type: 'success', message: 'Success msg' }],
      });

      render(<NotificationToast />);

      const notification = screen.getByText('Success msg').closest('div');
      expect(notification?.className).toContain('bg-green-900/90');
      expect(notification?.className).toContain('border-green-700');
      expect(notification?.className).toContain('text-green-200');
    });

    it('applies red classes for error type', () => {
      useNotificationStore.setState({
        notifications: [{ id: '1', type: 'error', message: 'Error msg' }],
      });

      render(<NotificationToast />);

      const notification = screen.getByText('Error msg').closest('div');
      expect(notification?.className).toContain('bg-red-900/90');
      expect(notification?.className).toContain('border-red-700');
      expect(notification?.className).toContain('text-red-200');
    });

    it('applies blue classes for info type', () => {
      useNotificationStore.setState({
        notifications: [{ id: '1', type: 'info', message: 'Info msg' }],
      });

      render(<NotificationToast />);

      const notification = screen.getByText('Info msg').closest('div');
      expect(notification?.className).toContain('bg-blue-900/90');
      expect(notification?.className).toContain('border-blue-700');
      expect(notification?.className).toContain('text-blue-200');
    });
  });

  it('dismiss button removes notification', () => {
    const removeNotification = vi.fn();
    useNotificationStore.setState({
      notifications: [{ id: '42', type: 'info', message: 'Dismiss me' }],
      removeNotification,
    });

    render(<NotificationToast />);

    expect(screen.getByText('Dismiss me')).toBeInTheDocument();

    const dismissButton = screen.getByRole('button', { name: 'x' });
    fireEvent.click(dismissButton);

    expect(removeNotification).toHaveBeenCalledWith('42');
  });
});
