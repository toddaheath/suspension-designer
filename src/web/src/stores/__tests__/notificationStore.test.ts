import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useNotificationStore } from '../notificationStore';

describe('useNotificationStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useNotificationStore.setState({ notifications: [] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('addNotification', () => {
    it('adds a notification with correct type and message', () => {
      useNotificationStore.getState().addNotification('success', 'Saved!');

      const { notifications } = useNotificationStore.getState();
      expect(notifications).toHaveLength(1);
      expect(notifications[0].type).toBe('success');
      expect(notifications[0].message).toBe('Saved!');
    });

    it('auto-generates an id', () => {
      useNotificationStore.getState().addNotification('info', 'Hello');

      const { notifications } = useNotificationStore.getState();
      expect(notifications[0].id).toBeDefined();
      expect(typeof notifications[0].id).toBe('string');
      expect(notifications[0].id.length).toBeGreaterThan(0);
    });

    it('generates unique ids for each notification', () => {
      useNotificationStore.getState().addNotification('info', 'First');
      useNotificationStore.getState().addNotification('error', 'Second');

      const { notifications } = useNotificationStore.getState();
      expect(notifications[0].id).not.toBe(notifications[1].id);
    });
  });

  describe('removeNotification', () => {
    it('removes the correct notification', () => {
      useNotificationStore.getState().addNotification('success', 'First');
      useNotificationStore.getState().addNotification('error', 'Second');

      const { notifications } = useNotificationStore.getState();
      expect(notifications).toHaveLength(2);

      const idToRemove = notifications[0].id;
      useNotificationStore.getState().removeNotification(idToRemove);

      const updated = useNotificationStore.getState().notifications;
      expect(updated).toHaveLength(1);
      expect(updated[0].message).toBe('Second');
    });
  });

  describe('multiple notifications', () => {
    it('can have multiple notifications coexist', () => {
      useNotificationStore.getState().addNotification('success', 'Success msg');
      useNotificationStore.getState().addNotification('error', 'Error msg');
      useNotificationStore.getState().addNotification('info', 'Info msg');

      const { notifications } = useNotificationStore.getState();
      expect(notifications).toHaveLength(3);
      expect(notifications[0].type).toBe('success');
      expect(notifications[1].type).toBe('error');
      expect(notifications[2].type).toBe('info');
    });
  });

  describe('auto-dismiss', () => {
    it('removes notification after 5000ms via setTimeout', () => {
      useNotificationStore.getState().addNotification('info', 'Temporary');

      expect(useNotificationStore.getState().notifications).toHaveLength(1);

      vi.advanceTimersByTime(4999);
      expect(useNotificationStore.getState().notifications).toHaveLength(1);

      vi.advanceTimersByTime(1);
      expect(useNotificationStore.getState().notifications).toHaveLength(0);
    });

    it('only auto-dismisses the specific notification', () => {
      useNotificationStore.getState().addNotification('info', 'First');

      vi.advanceTimersByTime(2000);

      useNotificationStore.getState().addNotification('error', 'Second');

      // At 5000ms total, first should be dismissed but second should remain
      vi.advanceTimersByTime(3000);
      const { notifications } = useNotificationStore.getState();
      expect(notifications).toHaveLength(1);
      expect(notifications[0].message).toBe('Second');
    });
  });
});
