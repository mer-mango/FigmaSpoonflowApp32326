import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, X, Trash2, CheckCheck } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';

type AnyNotification = {
  id?: string;
  title?: string;
  message?: string;
  body?: string;
  type?: string;
  category?: string;
  createdAt?: string | Date;
  timestamp?: string | Date;
  read?: boolean;
  isRead?: boolean;
  status?: string;
  [key: string]: any;
};

const getNotificationText = (notification: AnyNotification) => {
  return (
    notification.message ||
    notification.body ||
    notification.description ||
    ''
  );
};

const getNotificationTitle = (notification: AnyNotification) => {
  return (
    notification.title ||
    notification.type ||
    notification.category ||
    'Notification'
  );
};

const getNotificationTime = (notification: AnyNotification) => {
  const rawDate = notification.createdAt || notification.timestamp;

  if (!rawDate) return '';

  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export function MutedNotificationBell() {
  const notificationContext = useNotifications() as any;
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  const notifications: AnyNotification[] = Array.isArray(notificationContext.notifications)
    ? notificationContext.notifications
    : [];

  const unreadCount =
    typeof notificationContext.unreadCount === 'number'
      ? notificationContext.unreadCount
      : notifications.filter(n => !n.read && !n.isRead && n.status !== 'read').length;

  const hasUnread = unreadCount > 0;

  const sortedNotifications = useMemo(() => {
    return [...notifications].sort((a, b) => {
      const aDate = new Date(a.createdAt || a.timestamp || 0).getTime();
      const bDate = new Date(b.createdAt || b.timestamp || 0).getTime();
      return bDate - aDate;
    });
  }, [notifications]);

  const markAsRead =
    notificationContext.markAsRead ||
    notificationContext.markNotificationAsRead ||
    notificationContext.readNotification;

  const dismissNotification =
    notificationContext.dismissNotification ||
    notificationContext.deleteNotification ||
    notificationContext.removeNotification ||
    notificationContext.clearNotification;

  const markAllAsRead =
    notificationContext.markAllAsRead ||
    notificationContext.markAllNotificationsAsRead;

  const clearAll =
    notificationContext.clearAll ||
    notificationContext.clearAllNotifications ||
    notificationContext.dismissAllNotifications;

  const handleDismiss = (notificationId?: string) => {
    if (!notificationId) return;

    if (dismissNotification) {
      dismissNotification(notificationId);
      return;
    }

    if (markAsRead) {
      markAsRead(notificationId);
      return;
    }

    console.warn('No dismiss/delete notification handler found in NotificationContext');
  };

  const handleMarkAsRead = (notificationId?: string) => {
    if (!notificationId) return;

    if (markAsRead) {
      markAsRead(notificationId);
      return;
    }

    console.warn('No mark-as-read notification handler found in NotificationContext');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={popoverRef}>
      <button
        type="button"
        aria-label="Open notifications"
        onClick={() => setIsOpen(prev => !prev)}
        className={`
          relative w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl 
          text-slate-700 hover:bg-slate-100/60 transition-all
          ${hasUnread ? 'bg-purple-50 hover:bg-purple-100' : ''}
        `}
        title="Notifications"
      >
        <div className="relative">
          <Bell className={`w-4.5 h-4.5 ${hasUnread ? 'text-purple-600' : ''}`} />
          {hasUnread && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>

        <span className={`font-medium text-sm ${hasUnread ? 'text-purple-700' : ''}`}>
          Notifications
        </span>

        {hasUnread && (
          <span className="ml-auto px-2 py-0.5 bg-purple-600 text-white text-xs font-bold rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-full bottom-0 ml-3 z-[1400] w-[360px] rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
            <div>
              <h3 className="font-medium text-slate-800">Notifications</h3>
              <p className="text-xs text-slate-500">
                {notifications.length > 0
                  ? `${notifications.length} total`
                  : 'No notifications right now'}
              </p>
            </div>

            <button
              type="button"
              aria-label="Close notifications"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          {notifications.length > 0 && (
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 bg-white">
              <button
                type="button"
                onClick={() => {
                  if (markAllAsRead) {
                    markAllAsRead();
                  } else {
                    sortedNotifications.forEach(n => handleMarkAsRead(n.id));
                  }
                }}
                className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-[#6b2358] transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>

              {clearAll && (
                <button
                  type="button"
                  onClick={() => clearAll()}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear all
                </button>
              )}
            </div>
          )}

          <div className="max-h-[420px] overflow-y-auto">
            {sortedNotifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">
                  You’re all caught up.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {sortedNotifications.map((notification, index) => {
                  const id = notification.id || `notification-${index}`;
                  const isUnread =
                    !notification.read &&
                    !notification.isRead &&
                    notification.status !== 'read';

                  return (
                    <div
                      key={id}
                      className={`px-4 py-3 transition-colors ${
                        isUnread ? 'bg-purple-50/60' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                            isUnread ? 'bg-purple-600' : 'bg-slate-300'
                          }`}
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h4 className="text-sm font-medium text-slate-800">
                                {getNotificationTitle(notification)}
                              </h4>

                              {getNotificationText(notification) && (
                                <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                                  {getNotificationText(notification)}
                                </p>
                              )}

                              {getNotificationTime(notification) && (
                                <p className="text-xs text-slate-400 mt-2">
                                  {getNotificationTime(notification)}
                                </p>
                              )}
                            </div>

                            <button
                              type="button"
                              aria-label="Dismiss notification"
                              onClick={() => handleDismiss(notification.id)}
                              className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {isUnread && (
                            <button
                              type="button"
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="mt-2 text-xs text-[#6b2358] hover:underline"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
