import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import type { Notification } from '../types/notification';
import type { NotificationPreferences } from '../types/notificationPreferences';
import { defaultNotificationPreferences } from '../types/notificationPreferences';
import { getNotificationPolicy } from '../utils/notificationPolicy';
import { isInQuietHours, getQuietHoursStatus } from '../utils/quietHours';
import { shouldShowToast, shouldShowDesktop, shouldPlaySound, isAnyPushEnabled } from '../utils/notificationDelivery';
import {
  loadNotifications,
  saveNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadNotificationCount,
  showDesktopNotification,
  playNotificationSound,
  requestDesktopNotificationPermission,
  createStatusChangeNotification,
  createActionRequiredNotification,
  createFormCompletedNotification,
  createContentScheduledNotification,
  createContentPublishedNotification,
  createContentIdeaNotification,
  createContentReviewNotification,
  loadNotificationPreferences,
  saveNotificationPreferences,
} from '../utils/notificationHelpers';

interface NotificationContextType {
  notifications: Notification[];
  preferences: NotificationPreferences;
  unreadCount: number;
  
  // Notification actions
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  
  // E4B: Snooze and dismiss actions
  snoozeNotification: (notificationId: string, snoozedUntilISO: string) => void;
  unsnoozeNotification: (notificationId: string) => void;
  dismissNotification: (notificationId: string) => void;
  
  // Preferences actions
  updatePreferences: (preferences: NotificationPreferences) => void;
  
  // Helper functions to create notifications (contacts/journey)
  notifyStatusChange: (contactId: string, contactName: string, oldStatus: string, newStatus: string, whoseMove: 'my_move' | 'their_move' | 'waiting') => void;
  notifyActionRequired: (contactId: string, contactName: string, actionDescription: string, fullStatus: string, whoseMove: 'my_move' | 'their_move' | 'waiting') => void;
  notifyFormCompleted: (contactId: string, contactName: string, formName: string, fullStatus: string) => void;
  
  // Helper functions to create notifications (content)
  notifyContentScheduled: (contentId: string, contentTitle: string, publishDate: string, platform: string) => void;
  notifyContentPublished: (contentId: string, contentTitle: string, platform: string) => void;
  notifyContentIdea: (contentId: string, contentTitle: string) => void;
  notifyContentReview: (contentId: string, contentTitle: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultNotificationPreferences);
  const [unreadCount, setUnreadCount] = useState(0);

  // E5C PROMPT 11.13: Use ref for preferences to avoid restarting snooze watcher interval
  const preferencesRef = useRef<NotificationPreferences>(preferences);

  // Keep ref in sync with state
  useEffect(() => {
    preferencesRef.current = preferences;
  }, [preferences]);

  // Load notifications and preferences on mount
  useEffect(() => {
    const loadedNotifications = loadNotifications();
    const loadedPreferences = loadNotificationPreferences();
    
    setNotifications(loadedNotifications);
    setPreferences(loadedPreferences);
    setUnreadCount(getUnreadNotificationCount(loadedNotifications));
  }, []);

  // Save notifications when they change
  useEffect(() => {
    saveNotifications(notifications);
    setUnreadCount(getUnreadNotificationCount(notifications));
  }, [notifications]);

  // E5C 11.2: Request desktop notification permission when any push is enabled
  // E5C PROMPT 11.13: Only request if browser hasn't decided yet (avoids spam on every pref change)
  // E5C PROMPT 11.14: Depend on computed anyPushEnabled (not raw preferences) to minimize effect runs
  const anyPushEnabled = isAnyPushEnabled(preferences);
  
  useEffect(() => {
    if (!anyPushEnabled) return;
    if (typeof Notification === 'undefined') return;

    // Only request if the browser hasn't decided yet
    if (Notification.permission === 'default') {
      requestDesktopNotificationPermission();
      console.log('[E5C 11.2] Desktop permission requested (default state)');
    }
  }, [anyPushEnabled]); // E5C PROMPT 11.14: Only runs when push enablement changes (not on every pref)

  // E4C: Snooze expiry watcher - runs every 30 seconds
  // E5C PROMPT 11.13: Stable interval using ref pattern (no restart on preferences change)
  useEffect(() => {
    const checkExpiredSnoozes = () => {
      const now = new Date();
      // E5C PROMPT 11.13: Read preferences from ref to avoid interval dependency
      // E5C PROMPT 11.14: Use currentPreferences consistently throughout snooze watcher
      const currentPreferences = preferencesRef.current;
      
      setNotifications(prev => {
        const updated = prev.map(n => {
          // Check if notification is snoozed AND has expired
          if (n.snoozedUntil) {
            const snoozedUntilDate = new Date(n.snoozedUntil);
            
            if (snoozedUntilDate <= now) {
              // Snooze has expired!
              console.log(`[E4C Wake-Up] Snooze expired for: \"${n.title}\"`);
              
              // Mark as unread (so it counts toward badge again)
              const unsnoozed = { 
                ...n, 
                snoozedUntil: null, 
                read: false,
                resurfacedAt: now.toISOString() // Track when it was auto-unsnoozed
              };
              
              // E5C PROMPT 11.14: Toast gating for resurfaced notifications
              // Design choice: Show subtle toast reminder that notification has resurfaced
              if (shouldShowToast(n.type, currentPreferences)) {
                toast.info(`⏰ Reminder: ${unsnoozed.title}`, {
                  description: unsnoozed.message,
                  duration: 5000,
                  action: {
                    label: 'View',
                    onClick: () => window.location.href = unsnoozed.deepLink,
                  },
                });
                console.log(`[E4C Wake-Up] Toast reminder shown: \"${n.title}\"`);
              }
              
              // E5C 11.2: Fire desktop notification (respecting granular push settings + quiet hours)
              if (shouldShowDesktop(n.type, currentPreferences)) {
                const inQuietHours = isInQuietHours(currentPreferences);
                
                if (inQuietHours) {
                  console.log(`[E4C Wake-Up] Desktop suppressed (quiet hours): \"${n.title}\"`);
                } else {
                  console.log(`[E4C Wake-Up] Firing desktop re-alert: \"${n.title}\"`);
                  // Use existing desktop notification function
                  // Tag with notification.id for deduplication
                  showDesktopNotification(unsnoozed, currentPreferences);
                }
              }
              
              // E5C PROMPT 11.14: Sound gating for resurfaced notifications (optional)
              // Design choice: Play gentle sound for resurfaced urgent notifications only
              if (unsnoozed.priority === 'urgent' && shouldPlaySound(n.type, unsnoozed.priority, currentPreferences)) {
                playNotificationSound(currentPreferences, unsnoozed.priority);
                console.log(`[E4C Wake-Up] Sound played (urgent): \"${n.title}\"`);
              }
              
              return unsnoozed;
            }
          }
          
          return n;
        });
        
        return updated;
      });
    };
    
    // Check immediately on mount
    checkExpiredSnoozes();
    
    // Then check every 30 seconds
    const interval = setInterval(checkExpiredSnoozes, 30000);
    
    return () => clearInterval(interval);
  }, []); // E5C PROMPT 11.13: Empty deps - interval never restarts

  // Add a new notification
  // E5C PROMPT 11.14: Make addNotification stable by reading preferences from ref
  const addNotification = useCallback((notification: Notification) => {
    // E5C PROMPT 11.14: Read latest preferences from ref (not closure capture)
    const prefs = preferencesRef.current;
    
    // Apply default requiresAction policy if not explicitly set
    const requiresAction = notification.requiresAction ?? getNotificationPolicy(notification.type);
    
    // Update notification with the policy decision
    const notificationWithPolicy = { ...notification, requiresAction };
    
    // POLICY ROUTING (E2):
    // If requiresAction = true: Save to bell list (persistent notification)
    // If requiresAction = false: Toast + Desktop only (FYI, not saved)
    
    if (requiresAction) {
      // Save to notifications array (shows in bell badge/panel)
      // NOTE: This happens REGARDLESS of quiet hours - bell storage is not affected
      setNotifications(prev => [notificationWithPolicy, ...prev]);
      console.log(`[E2 Bell Storage] Saved to bell: \"${notification.title}\" | requiresAction: true`);
    }
    
    // Always show toast notification (if enabled)
    // NOTE: Toasts are not affected by quiet hours
    if (shouldShowToast(notification.type, prefs)) {
      if (notification.priority === 'urgent' || notification.whoseMove === 'my_move') {
        // Urgent toast with red styling
        toast.error(notification.title, {
          description: notification.message,
          duration: 8000,
          action: {
            label: 'View',
            onClick: () => window.location.href = notification.deepLink,
          },
        });
      } else {
        // Normal toast
        toast.success(notification.title, {
          description: notification.message,
          duration: 5000,
          action: {
            label: 'View',
            onClick: () => window.location.href = notification.deepLink,
          },
        });
      }
    }
    
    // QUIET HOURS ENFORCEMENT (E3):
    // Desktop notifications are suppressed during quiet hours
    // Bell storage (above) and toasts (above) are NOT affected by quiet hours
    if (shouldShowDesktop(notification.type, prefs)) {
      const inQuietHours = isInQuietHours(prefs);
      
      if (inQuietHours) {
        // Suppress desktop notification during quiet hours
        // BUT: Bell storage already happened above if requiresAction=true
        console.log(`[E3 Quiet Hours] Desktop suppressed (bell storage still active): \"${notification.title}\" | ${getQuietHoursStatus(prefs)}`);
      } else {
        // Show desktop notification outside quiet hours
        console.log(`[E3 Quiet Hours] Desktop allowed: \"${notification.title}\" | ${getQuietHoursStatus(prefs)}`);
        showDesktopNotification(notificationWithPolicy, prefs);
      }
    }
    
    // Play sound (respects delivery gating and priority)
    if (shouldPlaySound(notification.type, notification.priority, prefs)) {
      playNotificationSound(prefs, notification.priority);
    }
  }, []); // E5C PROMPT 11.14: Empty deps - stable identity, always uses fresh prefs from ref

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    console.log(`[NotificationContext] markAsRead called for: ${notificationId}`);
    setNotifications(prev => {
      const updated = markNotificationAsRead(prev, notificationId);
      console.log(`[NotificationContext] Notification marked as read, new count: ${updated.filter(n => !n.read).length}`);
      return updated;
    });
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => markAllNotificationsAsRead(prev));
  }, []);

  // Remove a notification
  const removeNotification = useCallback((notificationId: string) => {
    setNotifications(prev => deleteNotification(prev, notificationId));
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // E4B: Snooze a notification
  const snoozeNotification = useCallback((notificationId: string, snoozedUntilISO: string) => {
    setNotifications(prev => {
      return prev.map(n => {
        if (n.id === notificationId) {
          // Mark as read AND set snooze time
          // Snoozed notifications don't count toward unread badge
          return { 
            ...n, 
            snoozedUntil: snoozedUntilISO, 
            read: true 
          };
        }
        return n;
      });
    });
    
    // Show toast feedback
    const snoozeDate = new Date(snoozedUntilISO);
    const timeStr = snoozeDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const dateStr = snoozeDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    toast.success(`Snoozed until ${dateStr} at ${timeStr}`);
    
    console.log(`[E4B Snooze] Notification snoozed until ${snoozedUntilISO}`);
  }, []);

  // E4B: Unsnooze a notification
  const unsnoozeNotification = useCallback((notificationId: string) => {
    setNotifications(prev => {
      return prev.map(n => {
        if (n.id === notificationId) {
          // Clear snooze AND mark as unread (returns to Unread tab)
          return { 
            ...n, 
            snoozedUntil: null, 
            read: false 
          };
        }
        return n;
      });
    });
    
    toast.success('Notification unsnoozed');
    console.log(`[E4B Unsnooze] Notification unsnoozed`);
  }, []);

  // E4B: Dismiss a notification
  const dismissNotification = useCallback((notificationId: string) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      if (notification) {
        toast.success('Notification dismissed');
        console.log(`[E4B Dismiss] Notification "${notification.title}" dismissed`);
      }
      // Remove completely from the list
      return deleteNotification(prev, notificationId);
    });
  }, []);

  // Update preferences
  const updatePreferences = useCallback((newPreferences: NotificationPreferences) => {
    setPreferences(newPreferences);
    saveNotificationPreferences(newPreferences);
  }, []);

  // Helper: Notify status change
  const notifyStatusChange = useCallback((
    contactId: string,
    contactName: string,
    oldStatus: string,
    newStatus: string,
    whoseMove: 'my_move' | 'their_move' | 'waiting'
  ) => {
    // Check if system updates are enabled
    if (!preferences.systemUpdates?.enabled) {
      return; // User has disabled system update notifications
    }

    const notification = createStatusChangeNotification(
      contactId,
      contactName,
      oldStatus,
      newStatus,
      whoseMove
    );
    addNotification(notification);
  }, [preferences, addNotification]);

  // Helper: Notify action required
  const notifyActionRequired = useCallback((
    contactId: string,
    contactName: string,
    actionDescription: string,
    fullStatus: string,
    whoseMove: 'my_move' | 'their_move' | 'waiting'
  ) => {
    // Check if system updates are enabled
    if (!preferences.systemUpdates?.enabled) {
      return; // User has disabled system update notifications
    }

    const notification = createActionRequiredNotification(
      contactId,
      contactName,
      actionDescription,
      fullStatus,
      whoseMove
    );
    addNotification(notification);
  }, [preferences, addNotification]);

  // Helper: Notify form completed
  const notifyFormCompleted = useCallback((
    contactId: string,
    contactName: string,
    formName: string,
    fullStatus: string
  ) => {
    // Check if system updates are enabled
    if (!preferences.systemUpdates?.enabled) {
      return; // User has disabled system update notifications
    }

    const notification = createFormCompletedNotification(
      contactId,
      contactName,
      formName,
      fullStatus
    );
    addNotification(notification);
  }, [preferences, addNotification]);

  // Helper: Notify content scheduled
  const notifyContentScheduled = useCallback((
    contentId: string,
    contentTitle: string,
    publishDate: string,
    platform: string
  ) => {
    // Check if content scheduled notifications are enabled
    if (!preferences.contentScheduledSoon?.enabled) {
      return; // User has disabled content scheduled notifications
    }

    const notification = createContentScheduledNotification(
      contentId,
      contentTitle,
      publishDate,
      platform
    );
    addNotification(notification);
  }, [preferences, addNotification]);

  // Helper: Notify content published
  const notifyContentPublished = useCallback((
    contentId: string,
    contentTitle: string,
    platform: string
  ) => {
    // Check if content published notifications are enabled
    if (!preferences.contentPublished?.enabled) {
      return; // User has disabled content published notifications
    }

    const notification = createContentPublishedNotification(
      contentId,
      contentTitle,
      platform
    );
    addNotification(notification);
  }, [preferences, addNotification]);

  // Helper: Notify content idea
  const notifyContentIdea = useCallback((
    contentId: string,
    contentTitle: string
  ) => {
    // Check if Jamie content idea notifications are enabled
    if (!preferences.jamieContentIdea?.enabled) {
      return; // User has disabled Jamie content idea notifications
    }

    const notification = createContentIdeaNotification(
      contentId,
      contentTitle
    );
    addNotification(notification);
  }, [preferences, addNotification]);

  // Helper: Notify content review
  const notifyContentReview = useCallback((
    contentId: string,
    contentTitle: string
  ) => {
    // Check if content ready to schedule notifications are enabled
    if (!preferences.contentReadyToSchedule?.enabled) {
      return; // User has disabled content ready to schedule notifications
    }

    const notification = createContentReviewNotification(
      contentId,
      contentTitle
    );
    addNotification(notification);
  }, [preferences, addNotification]);

  const value: NotificationContextType = {
    notifications,
    preferences,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    updatePreferences,
    notifyStatusChange,
    notifyActionRequired,
    notifyFormCompleted,
    notifyContentScheduled,
    notifyContentPublished,
    notifyContentIdea,
    notifyContentReview,
    snoozeNotification,
    unsnoozeNotification,
    dismissNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

// Custom hook to use notifications
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}