/**
 * Canonical Notification Type
 * Single source of truth for notification data structure
 */

export type NotificationType = 
  | 'status_change' 
  | 'action_required' 
  | 'deadline_approaching' 
  | 'form_completed' 
  | 'content_scheduled'
  | 'content_published'
  | 'content_idea'
  | 'content_review'
  | 'task_due'
  | 'task_overdue'
  | 'meeting_starting'
  | 'meeting_canceled'
  | 'nurture_due'
  | 'jamie_suggestion'
  | 'system_update'
  | 'block_starting'      // Timeline block is starting
  | 'block_ending_soon'   // 5 minutes left in block
  | 'block_ended';        // Block timer reached 0:00

export type NotificationPriority = 'urgent' | 'normal' | 'low';

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  
  // Contact-related (optional for content/system notifications)
  contactId?: string;
  contactName?: string;
  
  // Content-related (optional for contact/system notifications)
  contentId?: string;
  contentTitle?: string;
  
  // Task-related (optional)
  taskId?: string;
  taskTitle?: string;
  
  // Meeting-related (optional)
  meetingId?: string;
  meetingTitle?: string;
  
  // Core notification data
  title: string;
  message: string;
  fullStatus: string; // e.g., "Scheduled for 2PM" or "Drafting - In Progress"
  whoseMove: 'my_move' | 'their_move' | 'waiting';
  timestamp: Date;
  read: boolean;
  deepLink: string; // URL to navigate when clicked
  
  // Policy control - determines if notification is saved to bell list
  requiresAction?: boolean; // If false, only shows as toast/desktop, not in bell list
  
  // E4B: Snooze and dismiss state
  snoozedUntil?: string | null; // ISO timestamp - when the snooze should end
  dismissedAt?: string | null; // ISO timestamp - when notification was dismissed (optional)
  
  // E4C: Resurfaced tracking
  resurfacedAt?: string | null; // ISO timestamp - when notification was auto-unsnoozed after expiry
}