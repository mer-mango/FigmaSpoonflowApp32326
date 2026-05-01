import type { NotificationType } from '../types/notification';

/**
 * Determines if a notification type should be persistent (requiresAction = true)
 * or ephemeral (requiresAction = false)
 */
export function getNotificationPolicy(type: NotificationType): boolean {
  switch (type) {
    // PERSISTENT NOTIFICATIONS - saved to bell, require action
    case 'nurture_due':
    case 'content_scheduled':
      return true; // Persistent - requires action

    // EPHEMERAL NOTIFICATIONS - toast/desktop only, FYI
    case 'action_required':
    case 'task_due':
    case 'meeting_starting':
    case 'form_completed':
    case 'status_change':
    case 'content_published':
    case 'content_idea':
    case 'content_review':
    case 'system_update':
    case 'task_overdue':
    case 'meeting_canceled':
    case 'jamie_suggestion':
    case 'block_starting':
    case 'block_ending_soon':
    case 'block_ended':
      return false; // Ephemeral - FYI only

    default:
      return false; // Default to ephemeral
  }
}