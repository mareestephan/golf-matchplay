'use client';

import { useState, useEffect } from 'react';
import { Notification } from '@/types';
import { getCurrentUser } from '@/lib/auth';
import { getNotifications, markAsRead, deleteNotification } from '@/lib/notifications';
import styles from './NotificationCenter.module.scss';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const user = getCurrentUser();

  useEffect(() => {
    if (!user) return;
    
    // Load notifications
    const userNotifications = getNotifications(user.id);
    setNotifications(userNotifications);

    // Poll for new notifications every 5 seconds
    const interval = setInterval(() => {
      const updated = getNotifications(user.id);
      setNotifications(updated);
    }, 5000);

    return () => clearInterval(interval);
  }, [user?.id]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead(notificationId);
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const handleDelete = (notificationId: string) => {
    deleteNotification(notificationId);
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  return (
    <div className={styles['notification-center']}>
      <button
        className={styles['notification-center__bell']}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <span className={styles['notification-center__icon']}>⊙</span>
        {unreadCount > 0 && (
          <span className={styles['notification-center__badge']}>
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className={styles['notification-center__panel']}>
          <div className={styles['notification-center__header']}>
            <h3>Notifications</h3>
            <button
              className={styles['notification-center__close']}
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          {notifications.length === 0 ? (
            <div className={styles['notification-center__empty']}>
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className={styles['notification-center__list']}>
              {notifications.map(notif => (
                <div
                  key={notif.id}
                  className={`${styles['notification-center__item']} ${
                    !notif.read ? styles['notification-center__item--unread'] : ''
                  }`}
                >
                  <div
                    className={styles['notification-center__content']}
                    onClick={() => handleMarkAsRead(notif.id)}
                  >
                    <span className={styles['notification-center__type']}>
                      {notif.type === 'ROUND_SUBMITTED' && '📝'}
                      {notif.type === 'ROUND_APPROVED' && '✅'}
                      {notif.type === 'ROUND_REJECTED' && '❌'}
                    </span>
                    <div>
                      <p className={styles['notification-center__message']}>
                        {notif.message}
                      </p>
                      <time className={styles['notification-center__time']}>
                        {new Date(notif.createdAt).toLocaleString()}
                      </time>
                    </div>
                  </div>
                  <button
                    className={styles['notification-center__delete']}
                    onClick={() => handleDelete(notif.id)}
                    aria-label="Delete notification"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
