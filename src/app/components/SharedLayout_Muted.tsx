import React, { useState } from 'react';
import { 
  Home, 
  Calendar, 
  CheckSquare, 
  Pin, 
  Users, 
  Target, 
  FileText,
  Sparkles,
  Settings,
  Utensils,
  RefreshCw,
} from "lucide-react";
import { MutedNotificationBell } from './muted_NotificationBell';
import { SpoonIcon } from './SpoonIcon';
import { toast } from 'sonner';

interface NavItem {
  icon: any;
  label: string;
  count: number | null;
  color: string;
  bgColor: string;
  isActive: boolean;
  page: 'today' | 'tasks' | 'contacts' | 'content' | 'goals' | 'calendar' | 'documents' | 'settings';
}

interface SharedLayoutMutedProps {
  children: React.ReactNode;
  currentPage: 'today' | 'tasks' | 'contacts' | 'content' | 'goals' | 'calendar' | 'documents' | 'settings';
  onNavigate?: (page: 'today' | 'tasks' | 'contacts' | 'content' | 'goals' | 'calendar' | 'documents' | 'settings') => void;
  onAddTask?: (task: { title: string; contact?: { name: string; initials: string }; dueDate?: string }) => void;
  onQuickAddClick?: () => void;
  onJamieClick?: () => void;
  onQuickAddSelect?: (type: 'task' | 'contact' | 'content' | 'voice') => void;
  onNotificationsClick?: () => void;
  onSyncCalendar?: () => Promise<void> | void;
  unreadNotificationsCount?: number;
  counts?: {
    calendar?: number;
    tasks?: number;
    content?: number;
    contacts?: number;
    goals?: number;
    documents?: number;
  };
}

export function SharedLayout_Muted({ 
  children, 
  currentPage, 
  onNavigate,
  onAddTask,
  onQuickAddClick,
  onJamieClick,
  onQuickAddSelect,
  onNotificationsClick,
  onSyncCalendar,
  unreadNotificationsCount,
  counts = {}
}: SharedLayoutMutedProps) {
  const [isSyncing, setIsSyncing] = useState(false);

  const navItems: NavItem[] = [
    { 
      icon: Home, 
      label: 'Today', 
      count: null, 
      color: 'text-slate-600',
      bgColor: 'bg-slate-600',
      isActive: currentPage === 'today',
      page: 'today'
    },
    { 
      icon: Users, 
      label: 'Contacts', 
      count: null, // No count needed per user request
      color: 'text-[#8ba5a8]',
      bgColor: 'bg-[#8ba5a8]',
      isActive: currentPage === 'contacts',
      page: 'contacts'
    },
    { 
      icon: Calendar, 
      label: 'Calendar', 
      count: null, // No count needed per user request
      color: 'text-[#6484a1]',
      bgColor: 'bg-[#6484a1]',
      isActive: currentPage === 'calendar',
      page: 'calendar'
    },
    { 
      icon: CheckSquare, 
      label: 'Tasks', 
      count: counts.tasks ?? 0,
      color: 'text-[#c198ad]',
      bgColor: 'bg-[#c198ad]',
      isActive: currentPage === 'tasks',
      page: 'tasks'
    },
    { 
      icon: Pin, 
      label: 'Content', 
      count: counts.content ?? 0,
      color: 'text-[#e2b7bd]',
      bgColor: 'bg-[#e2b7bd]',
      isActive: currentPage === 'content',
      page: 'content'
    },
    { 
      icon: Target, 
      label: 'Goals', 
      count: counts.goals ?? 0,
      color: 'text-[#a389aa]',
      bgColor: 'bg-[#a389aa]',
      isActive: currentPage === 'goals',
      page: 'goals'
    },
  ];

  return (
    <div className="h-screen flex bg-white app-container">
      {/* Sidebar */}
      <div className="w-[200px] bg-white/90 backdrop-blur-xl border-r border-slate-200/50 flex flex-col py-6 px-3 no-print pdf-exclude app-sidebar relative z-[1000]" data-pdf-exclude="true">
        {/* Logo */}
        <div className="mb-6 px-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
              <SpoonIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-serif font-semibold text-slate-800">SpoonFlow</span>
          </div>
        </div>

        {/* Main Nav */}
        <div className="flex-1 space-y-2">
          {navItems.map((item, idx) => (
            <button 
              key={idx} 
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all relative mr-3 ${
                item.isActive
                  ? `${item.bgColor} text-white shadow-soft` 
                  : 'text-slate-700 hover:bg-slate-100/60'
              }`}
              onClick={() => onNavigate?.(item.page)}
            >
              <div className={`w-7 h-7 rounded-full ${item.bgColor} flex items-center justify-center flex-shrink-0`}>
                <item.icon className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium text-sm">{item.label}</span>
              
              {/* Count always visible for Tasks and Content (only if 1+) */}
              {item.count !== null && item.count > 0 && (item.label === 'Tasks' || item.label === 'Content') && (
                <span className={`ml-auto mr-5 text-xs font-semibold transition-all ${
                  item.isActive ? 'text-white/70' : 'text-slate-500'
                }`}>
                  {item.count}
                </span>
              )}
              
              {/* Count appears on hover for other items (only if 1+) */}
              {item.count !== null && item.count > 0 && item.label !== 'Tasks' && item.label !== 'Content' && (
                <span className={`ml-auto mr-5 text-xs font-semibold transition-all ${
                  item.isActive ? 'text-white/70' : 'text-slate-500'
                }`}>
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Bottom Nav */}
        <div className="space-y-0.5 pt-4 border-t border-slate-200/50">
          {/* Notifications - above Settings */}
          <MutedNotificationBell />
          
          {/* Sync Calendar */}
          <button 
            className="w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100/60 transition-all disabled:opacity-50"
            onClick={async () => {
              if (!onSyncCalendar) return;
              
              setIsSyncing(true);
              toast.loading('Syncing calendar...', { id: 'calendar-sync' });
              
              try {
                await onSyncCalendar();
                toast.success('Calendar synced successfully', {
                  id: 'calendar-sync',
                  description: 'Your Google Calendar events have been synced',
                  duration: 3000,
                });
              } catch (error) {
                console.error('Calendar sync error:', error);
                toast.error('Failed to sync calendar', {
                  id: 'calendar-sync',
                  description: 'Please try again later',
                  duration: 3000,
                });
              } finally {
                setIsSyncing(false);
              }
            }}
            disabled={isSyncing}
            title="Sync your time blocks with Google Calendar"
          >
            <div className="relative">
              <Calendar className="w-4.5 h-4.5" />
              <RefreshCw className={`w-2.5 h-2.5 absolute -bottom-0.5 -right-0.5 text-slate-700 ${isSyncing ? 'animate-spin' : ''}`} />
            </div>
            <span className="font-medium text-sm">Sync Calendar</span>
          </button>
          
          {/* Settings */}
          <button 
            className="w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100/60 transition-all"
            onClick={() => {
              onNavigate('settings');
            }}
          >
            <Settings className="w-4.5 h-4.5" />
            <span className="font-medium text-sm">Settings</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {children}
      </div>
    </div>
  );
}