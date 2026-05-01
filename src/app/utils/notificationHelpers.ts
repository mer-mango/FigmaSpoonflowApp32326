import type { Notification, NotificationType, NotificationPriority } from '../types/notification';
import type { NotificationPreferences } from '../types/notificationPreferences';
import { defaultNotificationPreferences } from '../types/notificationPreferences';

// Storage keys
const NOTIFICATIONS_STORAGE_KEY = 'spoonflow_notifications';
const NOTIFICATION_PREFERENCES_KEY = 'spoonflow_notification_preferences';

/**
 * Load notifications from localStorage
 */
export function loadNotifications(): Notification[] {
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as Notification[];
  } catch (error) {
    console.error('Error loading notifications:', error);
    return [];
  }
}

/**
 * Save notifications to localStorage
 */
export function saveNotifications(notifications: Notification[]): void {
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
  } catch (error) {
    console.error('Error saving notifications:', error);
  }
}

/**
 * Mark a notification as read
 */
export function markNotificationAsRead(notifications: Notification[], notificationId: string): Notification[] {
  return notifications.map(n =>
    n.id === notificationId ? { ...n, read: true } : n
  );
}

/**
 * Mark all notifications as read
 */
export function markAllNotificationsAsRead(notifications: Notification[]): Notification[] {
  return notifications.map(n => ({ ...n, read: true }));
}

/**
 * Delete a notification
 */
export function deleteNotification(notifications: Notification[], notificationId: string): Notification[] {
  return notifications.filter(n => n.id !== notificationId);
}

/**
 * Get unread notification count
 */
export function getUnreadNotificationCount(notifications: Notification[]): number {
  return notifications.filter(n => !n.read && !n.snoozedUntil).length;
}

/**
 * Show desktop notification (browser API)
 */
export function showDesktopNotification(notification: Notification, preferences: NotificationPreferences): void {
  if (typeof Notification === 'undefined') return;
  if (Notification.permission !== 'granted') return;

  try {
    new Notification(notification.title, {
      body: notification.message,
      icon: '/spoon-icon.png', // Add your app icon
      tag: notification.id, // Prevents duplicates
      requireInteraction: notification.priority === 'urgent',
    });
  } catch (error) {
    console.error('Error showing desktop notification:', error);
  }
}

/**
 * Play notification sound
 */
export function playNotificationSound(preferences: NotificationPreferences, priority: NotificationPriority): void {
  if (!preferences.soundEnabled) return;

  try {
    const audio = new Audio(priority === 'urgent' ? '/sounds/urgent.mp3' : '/sounds/notification.mp3');
    audio.volume = 0.5;
    audio.play().catch(err => console.log('Could not play notification sound:', err));
  } catch (error) {
    console.error('Error playing notification sound:', error);
  }
}

/**
 * Request desktop notification permission
 */
export function requestDesktopNotificationPermission(): void {
  if (typeof Notification === 'undefined') return;
  if (Notification.permission === 'default') {
    Notification.requestPermission().then(permission => {
      console.log('Notification permission:', permission);
    });
  }
}

/**
 * Load notification preferences from localStorage
 */
export function loadNotificationPreferences(): NotificationPreferences {
  try {
    const stored = localStorage.getItem(NOTIFICATION_PREFERENCES_KEY);
    if (!stored) return defaultNotificationPreferences;
    return JSON.parse(stored) as NotificationPreferences;
  } catch (error) {
    console.error('Error loading notification preferences:', error);
    return defaultNotificationPreferences;
  }
}

/**
 * Save notification preferences to localStorage
 */
export function saveNotificationPreferences(preferences: NotificationPreferences): void {
  try {
    localStorage.setItem(NOTIFICATION_PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving notification preferences:', error);
  }
}

// ============================================================================
// NOTIFICATION CREATORS
// ============================================================================

/**
 * Create a status change notification
 */
export function createStatusChangeNotification(
  contactId: string,
  contactName: string,
  oldStatus: string,
  newStatus: string,
  whoseMove: 'my_move' | 'their_move' | 'waiting'
): Notification {
  return {
    id: `status-${contactId}-${Date.now()}`,
    type: 'status_change',
    title: `${contactName} status changed`,
    message: `Status changed from "${oldStatus}" to "${newStatus}"`,
    timestamp: new Date().toISOString(),
    read: false,
    priority: 'normal',
    deepLink: `/contacts/${contactId}`,
    requiresAction: false,
    whoseMove,
  };
}

/**
 * Create an action required notification
 */
export function createActionRequiredNotification(
  contactId: string,
  contactName: string,
  actionDescription: string,
  fullStatus: string,
  whoseMove: 'my_move' | 'their_move' | 'waiting'
): Notification {
  return {
    id: `action-${contactId}-${Date.now()}`,
    type: 'action_required',
    title: `Action required: ${contactName}`,
    message: actionDescription,
    timestamp: new Date().toISOString(),
    read: false,
    priority: whoseMove === 'my_move' ? 'urgent' : 'normal',
    deepLink: `/contacts/${contactId}`,
    requiresAction: true,
    whoseMove,
  };
}

/**
 * Create a form completed notification
 */
export function createFormCompletedNotification(
  contactId: string,
  contactName: string,
  formName: string,
  fullStatus: string
): Notification {
  return {
    id: `form-${contactId}-${Date.now()}`,
    type: 'form_completed',
    title: `${contactName} completed ${formName}`,
    message: `Status: ${fullStatus}`,
    timestamp: new Date().toISOString(),
    read: false,
    priority: 'urgent',
    deepLink: `/contacts/${contactId}`,
    requiresAction: true,
    whoseMove: 'my_move',
  };
}

/**
 * Create a content scheduled notification
 */
export function createContentScheduledNotification(
  contentId: string,
  contentTitle: string,
  publishDate: string,
  platform: string
): Notification {
  return {
    id: `content-scheduled-${contentId}-${Date.now()}`,
    type: 'content_scheduled',
    title: 'Content scheduled',
    message: `"${contentTitle}" scheduled for ${publishDate} on ${platform}`,
    timestamp: new Date().toISOString(),
    read: false,
    priority: 'normal',
    deepLink: `/content/${contentId}`,
    requiresAction: false,
  };
}

/**
 * Create a content published notification
 */
export function createContentPublishedNotification(
  contentId: string,
  contentTitle: string,
  platform: string
): Notification {
  return {
    id: `content-published-${contentId}-${Date.now()}`,
    type: 'content_published',
    title: 'Content published',
    message: `"${contentTitle}" published on ${platform}`,
    timestamp: new Date().toISOString(),
    read: false,
    priority: 'normal',
    deepLink: `/content/${contentId}`,
    requiresAction: false,
  };
}

/**
 * Create a content idea notification
 */
export function createContentIdeaNotification(
  contentId: string,
  contentTitle: string
): Notification {
  return {
    id: `content-idea-${contentId}-${Date.now()}`,
    type: 'content_idea',
    title: 'Jamie has a content idea',
    message: `"${contentTitle}"`,
    timestamp: new Date().toISOString(),
    read: false,
    priority: 'low',
    deepLink: `/content/${contentId}`,
    requiresAction: false,
  };
}

/**
 * Create a content review notification
 */
export function createContentReviewNotification(
  contentId: string,
  contentTitle: string
): Notification {
  return {
    id: `content-review-${contentId}-${Date.now()}`,
    type: 'content_review',
    title: 'Content ready for review',
    message: `"${contentTitle}" is ready to schedule`,
    timestamp: new Date().toISOString(),
    read: false,
    priority: 'normal',
    deepLink: `/content/${contentId}`,
    requiresAction: false,
  };
}

/**
 * Create a nurture due notification
 */
export function createNurtureDueNotification(
  contactId: string,
  contactName: string
): Notification {
  return {
    id: `nurture-due-${contactId}-${Date.now()}`,
    type: 'nurture_due',
    title: 'Nurture Contact Today',
    message: `Time to reach out to ${contactName}`,
    timestamp: new Date().toISOString(),
    read: false,
    priority: 'normal',
    contactId,
    contactName,
    deepLink: `/contacts?id=${contactId}`,
    fullStatus: 'Due today',
    whoseMove: 'my_move',
    requiresAction: true, // Persistent in notification bell
  };
}
