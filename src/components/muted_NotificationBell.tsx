import React from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';

export function MutedNotificationBell() {
  const { unreadCount } = useNotifications();

  const hasUnread = unreadCount > 0;

  return (
    <button
      onClick={() => {
        // For now, just log - navigation will be handled by parent component
        console.log('Notifications clicked');
      }}
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
  );
}