import type { NotificationType, NotificationPriority } from '../types/notification';
import type { NotificationPreferences } from '../types/notificationPreferences';

/**
 * Determines if a toast should be shown for a given notification type
 */
export function shouldShowToast(type: NotificationType, preferences: NotificationPreferences): boolean {
  // Map notification types to preference fields
  // For now, default to showing toasts for most notifications
  return true; // Simplified - can be made more granular based on preferences.inApp
}

/**
 * Determines if a desktop notification should be shown for a given notification type
 */
export function shouldShowDesktop(type: NotificationType, preferences: NotificationPreferences): boolean {
  switch (type) {
    case 'action_required':
    case 'task_due':
      return preferences.taskDueSoon?.push ?? true;
    case 'meeting_starting':
      return preferences.meetingStartsSoon?.push ?? true;
    case 'status_change':
    case 'system_update':
      return preferences.systemUpdates?.push ?? true;
    case 'content_scheduled':
      return preferences.contentScheduledSoon?.push ?? true;
    case 'content_published':
      return preferences.contentPublished?.push ?? true;
    case 'content_idea':
      return preferences.jamieContentIdea?.push ?? true;
    case 'content_review':
      return preferences.contentReadyToSchedule?.push ?? true;
    case 'nurture_due':
      return true; // Always show desktop notifications for nurture reminders
    case 'form_completed':
      return preferences.systemUpdates?.push ?? true;
    default:
      return false;
  }
}

/**
 * Determines if a sound should be played for a given notification
 */
export function shouldPlaySound(
  type: NotificationType,
  priority: NotificationPriority,
  preferences: NotificationPreferences
): boolean {
  // Legacy support for soundEnabled
  if (preferences.soundEnabled === false) {
    return false;
  }

  // Only play sound for urgent notifications
  if (priority === 'urgent') {
    return shouldShowToast(type, preferences) || shouldShowDesktop(type, preferences);
  }

  return false;
}

/**
 * Checks if any push notification type is enabled
 */
export function isAnyPushEnabled(preferences: NotificationPreferences): boolean {
  return (
    preferences.taskDueSoon?.push ||
    preferences.taskOverdue?.push ||
    preferences.contentScheduledSoon?.push ||
    preferences.contentReadyToSchedule?.push ||
    preferences.contentPublished?.push ||
    preferences.meetingStartsSoon?.push ||
    preferences.meetingCanceled?.push ||
    preferences.systemUpdates?.push ||
    preferences.jamieContentIdea?.push ||
    false
  );
}