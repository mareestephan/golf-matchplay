import { Notification } from '@/types';

const NOTIFICATIONS_STORAGE_KEY = 'matchplay_notifications';

export function getNotifications(userId: string): Notification[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    const allNotifications = data ? JSON.parse(data) : [];
    return allNotifications.filter((n: Notification) => n.userId === userId);
  } catch {
    return [];
  }
}

export function saveNotification(notification: Notification): void {
  if (typeof window === 'undefined') return;

  try {
    const data = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    const allNotifications = data ? JSON.parse(data) : [];
    allNotifications.push(notification);
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(allNotifications));
  } catch {
    console.error('Failed to save notification');
  }
}

export function markAsRead(notificationId: string): void {
  if (typeof window === 'undefined') return;

  try {
    const data = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!data) return;

    const allNotifications = JSON.parse(data);
    const updated = allNotifications.map((n: Notification) =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    console.error('Failed to mark notification as read');
  }
}

export function deleteNotification(notificationId: string): void {
  if (typeof window === 'undefined') return;

  try {
    const data = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!data) return;

    const allNotifications = JSON.parse(data);
    const filtered = allNotifications.filter((n: Notification) => n.id !== notificationId);
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(filtered));
  } catch {
    console.error('Failed to delete notification');
  }
}

export function getUnreadCount(userId: string): number {
  return getNotifications(userId).filter(n => !n.read).length;
}

export function createNotification(
  userId: string,
  type: Notification['type'],
  roundId: string,
  message: string
): Notification {
  return {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    type,
    roundId,
    message,
    read: false,
    createdAt: new Date().toISOString(),
  };
}
