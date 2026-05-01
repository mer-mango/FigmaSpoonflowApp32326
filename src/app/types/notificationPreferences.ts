/**
 * Canonical Notification Preferences Types
 * Single source of truth for notification preference configuration
 */

// Each notification has granular delivery method control
export interface NotificationDeliveryMethods {
  enabled: boolean;
  email: boolean;
  inApp: boolean;
  push: boolean;
}

// Complete notification preferences with granular control per notification type
export interface NotificationPreferences {
  // Tasks
  taskDueSoon: NotificationDeliveryMethods & { hours: number };
  taskOverdue: NotificationDeliveryMethods;
  
  // Content
  contentScheduledSoon: NotificationDeliveryMethods & { hours: number };
  contentReadyToSchedule: NotificationDeliveryMethods;
  contentPublished: NotificationDeliveryMethods;
  contentReminderSet: NotificationDeliveryMethods;
  contentDeadlineApproaching: NotificationDeliveryMethods;
  
  // Calendar & Meetings
  meetingStartsSoon: NotificationDeliveryMethods & { minutes: number };
  meetingCanceled: NotificationDeliveryMethods;
  meetingRescheduled: NotificationDeliveryMethods;
  newMeetingAdded: NotificationDeliveryMethods;
  meetingDossierReady: NotificationDeliveryMethods;
  postMeetingTasksCreated: NotificationDeliveryMethods;
  
  // Contacts & Nurtures
  nurtureEmailDue: NotificationDeliveryMethods & { days: number };
  nurtureResponseReceived: NotificationDeliveryMethods;
  contactBirthdayUpcoming: NotificationDeliveryMethods & { days: number };
  
  // Jamie AI
  jamieSuggestionAvailable: NotificationDeliveryMethods;
  jamieDailyBriefing: NotificationDeliveryMethods & { time: string };
  jamieWeeklyReview: NotificationDeliveryMethods & { day: string };
  jamieTaskRecommendation: NotificationDeliveryMethods;
  jamieContentIdea: NotificationDeliveryMethods;
  
  // System & Digests
  systemUpdates: NotificationDeliveryMethods;
  weeklyDigest: NotificationDeliveryMethods & { day: string };
  monthlyReport: NotificationDeliveryMethods;
  
  // Quiet Hours (global)
  quietHoursEnabled: boolean;
  quietHoursStart: string; // HH:MM format
  quietHoursEnd: string; // HH:MM format
  
  // LEGACY fields for backward compatibility during transition
  // These will be removed in Phase E2 when we fully migrate to granular controls
  desktopNotifications?: boolean;
  emailNotifications?: boolean;
  soundEnabled?: boolean;
  urgentOnly?: boolean;
  muteUntil?: Date;
  inAppNotifications?: boolean;
  pushNotifications?: boolean;
}

// Helper to create default delivery settings
const createDefaultDelivery = (
  enabled = true, 
  email = true, 
  inApp = true, 
  push = true
): NotificationDeliveryMethods => ({
  enabled,
  email,
  inApp,
  push,
});

// Default preferences - content-management focused
export const defaultNotificationPreferences: NotificationPreferences = {
  // Tasks
  taskDueSoon: { ...createDefaultDelivery(), hours: 24 },
  taskOverdue: createDefaultDelivery(),
  
  // Content
  contentScheduledSoon: { ...createDefaultDelivery(), hours: 2 },
  contentReadyToSchedule: createDefaultDelivery(),
  contentPublished: createDefaultDelivery(true, true, true, false),
  contentReminderSet: createDefaultDelivery(),
  contentDeadlineApproaching: createDefaultDelivery(),
  
  // Calendar & Meetings
  meetingStartsSoon: { ...createDefaultDelivery(), minutes: 15 },
  meetingCanceled: createDefaultDelivery(),
  meetingRescheduled: createDefaultDelivery(),
  newMeetingAdded: createDefaultDelivery(),
  meetingDossierReady: createDefaultDelivery(),
  postMeetingTasksCreated: createDefaultDelivery(true, false, true, false),
  
  // Contacts & Nurtures
  nurtureEmailDue: { ...createDefaultDelivery(), days: 1 },
  nurtureResponseReceived: createDefaultDelivery(),
  contactBirthdayUpcoming: { ...createDefaultDelivery(), days: 7 },
  
  // Jamie AI
  jamieSuggestionAvailable: createDefaultDelivery(),
  jamieDailyBriefing: { ...createDefaultDelivery(), time: '08:00' },
  jamieWeeklyReview: { ...createDefaultDelivery(), day: 'Monday' },
  jamieTaskRecommendation: createDefaultDelivery(),
  jamieContentIdea: createDefaultDelivery(),
  
  // System & Digests
  systemUpdates: createDefaultDelivery(),
  weeklyDigest: { ...createDefaultDelivery(), day: 'Monday' },
  monthlyReport: createDefaultDelivery(true, true, false, false), // Email only
  
  // Quiet Hours
  quietHoursEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
};