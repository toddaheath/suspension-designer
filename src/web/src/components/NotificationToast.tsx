import { useNotificationStore } from '../stores/notificationStore';

const COLORS = {
  success: 'bg-green-900/90 border-green-700 text-green-200',
  error: 'bg-red-900/90 border-red-700 text-red-200',
  info: 'bg-blue-900/90 border-blue-700 text-blue-200',
};

export default function NotificationToast() {
  const notifications = useNotificationStore((s) => s.notifications);
  const remove = useNotificationStore((s) => s.removeNotification);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`px-4 py-3 rounded border text-sm shadow-lg flex items-start gap-2 ${COLORS[n.type]}`}
        >
          <span className="flex-1">{n.message}</span>
          <button
            onClick={() => remove(n.id)}
            className="text-current opacity-60 hover:opacity-100 shrink-0"
          >
            x
          </button>
        </div>
      ))}
    </div>
  );
}
