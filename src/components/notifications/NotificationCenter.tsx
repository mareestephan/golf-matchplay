'use client';

import { useState, useEffect } from 'react';
import { Bell, X, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { Notification } from '@/types';
import { getCurrentUser } from '@/lib/auth';
import {
  getNotifications,
  markAsRead,
  deleteNotification,
} from '@/lib/notifications';
import { cn } from '@/lib/utils';

const TYPE_ICON = {
  ROUND_SUBMITTED: FileText,
  ROUND_APPROVED: CheckCircle2,
  ROUND_REJECTED: XCircle,
} as const;

const TYPE_COLOR = {
  ROUND_SUBMITTED: 'text-mustard',
  ROUND_APPROVED: 'text-success',
  ROUND_REJECTED: 'text-danger',
} as const;

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const user = getCurrentUser();

  useEffect(() => {
    if (!user) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNotifications(getNotifications(user.id));
    const interval = setInterval(() => {
      setNotifications(getNotifications(user.id));
    }, 5000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleDelete = (id: string) => {
    deleteNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((o) => !o)}
        aria-label="Notifications"
        className="relative grid size-9 place-items-center border border-border text-muted-foreground transition-colors hover:border-ink hover:text-ink"
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 grid min-w-[1.125rem] place-items-center bg-terracotta px-1 font-mono text-[0.5625rem] font-bold leading-4 text-paper">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(22rem,calc(100vw-2rem))] border border-ink bg-popover shadow-[6px_6px_0_rgba(25,24,23,0.12)]">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="eyebrow text-ink">Notifications</p>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close"
                className="text-muted-foreground transition-colors hover:text-ink"
              >
                <X className="size-4" />
              </button>
            </div>

            {notifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <p className="text-sm text-muted-foreground">
                  No notifications yet
                </p>
              </div>
            ) : (
              <div className="max-h-[60vh] divide-y divide-border overflow-y-auto">
                {notifications.map((notif) => {
                  const Icon = TYPE_ICON[notif.type] ?? Bell;
                  return (
                    <div
                      key={notif.id}
                      className={cn(
                        'flex items-start gap-3 px-4 py-3 transition-colors',
                        !notif.read && 'bg-secondary/60'
                      )}
                    >
                      <button
                        onClick={() => handleMarkAsRead(notif.id)}
                        className="flex flex-1 items-start gap-3 text-left"
                      >
                        <Icon
                          className={cn(
                            'mt-0.5 size-4 shrink-0',
                            TYPE_COLOR[notif.type]
                          )}
                        />
                        <span>
                          <span className="block text-sm leading-snug text-ink">
                            {notif.message}
                          </span>
                          <time className="mt-1 block font-mono text-[0.625rem] uppercase tracking-wide text-muted-foreground">
                            {new Date(notif.createdAt).toLocaleString()}
                          </time>
                        </span>
                      </button>
                      <button
                        onClick={() => handleDelete(notif.id)}
                        aria-label="Delete notification"
                        className="mt-0.5 text-muted-foreground transition-colors hover:text-danger"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
