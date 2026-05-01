import React, { useMemo, useState } from 'react';
import { Bell, X, Trash2, CheckCheck } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';

export function MutedNotificationBell() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    clearAllNotifications,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);

  const hasUnread = unreadCount > 0;

  const sortedNotifications = useMemo(() => {
    return [...notifications].sort((a, b) => {
      const aDate = new Date(a.createdAt || 0).getTime();
      const bDate = new Date(b.createdAt || 0).getTime();
      return bDate - aDate;
    });
  }, [notifications]);

  return (
    <div className="relative">
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
          <Bell className={`w-4 h-4 ${hasUnread ? 'text-purple-600' : ''}`} />

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
                onClick={markAllAsRead}
                className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-[#6b2358] transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>

              <button
                type="button"
                onClick={clearAllNotifications}
                className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear all
              </button>
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
                {sortedNotifications.map(notification => {
                  const isUnread = !notification.read;

                  return (
                    <div
                      key={notification.id}
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
                                {notification.title || 'Notification'}
                              </h4>

                              {notification.message && (
                                <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                                  {notification.message}
                                </p>
                              )}

                              {notification.createdAt && (
                                <p className="text-xs text-slate-400 mt-2">
                                  {new Date(notification.createdAt).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: 'numeric',
                                    minute: '2-digit',
                                  })}
                                </p>
                              )}
                            </div>

                            <button
                              type="button"
                              aria-label="Dismiss notification"
                              onClick={() => dismissNotification(notification.id)}
                              className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {isUnread && (
                            <button
                              type="button"
                              onClick={() => markAsRead(notification.id)}
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