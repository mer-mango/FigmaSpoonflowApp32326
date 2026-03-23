/**
 * Notification Scheduler
 * Handles scheduled notifications for tasks, content, and meetings
 */

import type { Task } from '../types/task';
import type { ContentItem } from '../types/content';
import type { CalendarEvent } from '../types/calendar';
import type { Notification } from '../types/notification';
import type { NurtureToDo } from '../components/muted_NurturesView';

export interface SchedulerDeps {
  getTasks: () => Task[];
  getContentItems: () => ContentItem[];
  getCalendarEvents: () => CalendarEvent[];
  getNurtureItems: () => NurtureToDo[];
  getNotifications: () => Notification[];
  addNotification: (notification: Notification) => void;
  getPreferences: () => any;
}

// Module-level guard to prevent multiple schedulers
let schedulerRunning = false;

// Track which items have already been notified to prevent duplicates
const notifiedContentIds = new Set<string>();
const notifiedContentDayBeforeIds = new Set<string>(); // For day-before notifications
const notifiedNurtureIds = new Set<string>();

/**
 * Start the notification scheduler
 * Checks for upcoming items and schedules notifications
 */
export function startNotificationScheduler(deps: SchedulerDeps): () => void {
  // E5C 11.7: Module-level guard prevents multiple schedulers (StrictMode-safe)
  if (schedulerRunning) {
    console.log('[E5C Scheduler] ⚠️ Scheduler already running - skipping duplicate start');
    return () => {}; // Return no-op cleanup
  }
  
  schedulerRunning = true;
  console.log('[E5C Scheduler] ✅ Starting notification scheduler');
  
  // Main scheduler function
  const runSchedulerChecks = () => {
    const now = new Date();
    
    // Check for content ready to publish (5 minutes before)
    checkContentReadyToPublish(deps, now);
    
    // Check for content due tomorrow (one day before)
    checkContentDueTomorrow(deps, now);
    
    // Check for nurtures due today
    checkNurturesDue(deps, now);
  };
  
  // Run immediately on start
  runSchedulerChecks();
  
  // Then run every minute
  const intervalId = setInterval(runSchedulerChecks, 60000);
  
  // Return cleanup function
  return () => {
    console.log('[E5C Scheduler] 🛑 Stopping notification scheduler');
    clearInterval(intervalId);
    schedulerRunning = false;
  };
}

/**
 * Check for content scheduled to publish in the next 5 minutes
 */
function checkContentReadyToPublish(deps: SchedulerDeps, now: Date) {
  const contentItems = deps.getContentItems();
  if (!contentItems || contentItems.length === 0) return;
  
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
  
  // Find content scheduled to be published in the next 5 minutes
  const readyToPublish = contentItems.filter(item => {
    if (item.status !== 'Scheduled' || !item.scheduledDate) return false;
    
    const scheduledTime = new Date(item.scheduledDate);
    const isReady = scheduledTime <= fiveMinutesFromNow && scheduledTime > now;
    const notYetNotified = !notifiedContentIds.has(item.id);
    
    return isReady && notYetNotified;
  });
  
  readyToPublish.forEach(item => {
    const scheduledTime = new Date(item.scheduledDate!);
    const minutesUntil = Math.round((scheduledTime.getTime() - now.getTime()) / 60000);
    
    const notification: Notification = {
      id: `content-publish-${item.id}-${Date.now()}`,
      type: 'content_scheduled',
      priority: 'normal',
      contentId: item.id,
      contentTitle: item.title,
      title: 'Time to Publish Content',
      message: `"${item.title}" is scheduled to publish ${minutesUntil <= 0 ? 'now' : `in ${minutesUntil} minute${minutesUntil === 1 ? '' : 's'}`}`,
      fullStatus: `Scheduled for ${scheduledTime.toLocaleString()}`,
      whoseMove: 'my_move',
      timestamp: now,
      read: false,
      deepLink: `/content?id=${item.id}`,
      requiresAction: true, // This should persist in the notification bell
    };
    
    deps.addNotification(notification);
    notifiedContentIds.add(item.id);
    
    console.log(`[Scheduler] 📢 Content ready to publish: "${item.title}" in ${minutesUntil} minutes`);
  });
}

/**
 * Check for content scheduled for tomorrow (at 12 PM noon)
 */
function checkContentDueTomorrow(deps: SchedulerDeps, now: Date) {
  const contentItems = deps.getContentItems();
  if (!contentItems || contentItems.length === 0) return;
  
  const currentHour = now.getHours();
  
  // Only fire notifications at 12 PM noon (to avoid spamming throughout the day)
  if (currentHour !== 12) return;
  
  // Get tomorrow's date in YYYY-MM-DD format
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  
  // Find content scheduled for tomorrow
  const dueTomorrow = contentItems.filter(item => {
    if (item.status !== 'Scheduled' || !item.scheduledDate) return false;
    
    const scheduledDate = new Date(item.scheduledDate);
    const scheduledDateStr = scheduledDate.toISOString().split('T')[0];
    const isDueTomorrow = scheduledDateStr === tomorrowStr;
    const notYetNotified = !notifiedContentDayBeforeIds.has(item.id);
    
    return isDueTomorrow && notYetNotified;
  });
  
  dueTomorrow.forEach(item => {
    const scheduledTime = new Date(item.scheduledDate!);
    
    const notification: Notification = {
      id: `content-tomorrow-${item.id}-${Date.now()}`,
      type: 'content_scheduled',
      priority: 'normal',
      contentId: item.id,
      contentTitle: item.title,
      title: 'Content Publishing Tomorrow',
      message: `\"${item.title}\" is scheduled to publish tomorrow at ${scheduledTime.toLocaleTimeString()}`,
      fullStatus: `Scheduled for ${scheduledTime.toLocaleString()}`,
      whoseMove: 'my_move',
      timestamp: now,
      read: false,
      deepLink: `/content?id=${item.id}`,
      requiresAction: true, // This should persist in the notification bell
    };
    
    deps.addNotification(notification);
    notifiedContentDayBeforeIds.add(item.id);
    
    console.log(`[Scheduler] 📅 Content due tomorrow: \"${item.title}\"`);
  });
}

/**
 * Check for nurtures due today (at 12 PM noon)
 */
function checkNurturesDue(deps: SchedulerDeps, now: Date) {
  const nurtures = deps.getNurtureItems();
  if (!nurtures || nurtures.length === 0) return;
  
  const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const currentHour = now.getHours();
  
  // Only fire notifications at 12 PM noon (to avoid spamming throughout the day)
  if (currentHour !== 12) return;
  
  // Find nurtures due today
  const dueToday = nurtures.filter(nurture => {
    if (nurture.status !== 'pending' && nurture.status !== 'toDo') return false;
    
    const dueDate = nurture.dueDate; // Already in YYYY-MM-DD format
    const isDueToday = dueDate === today;
    const notYetNotified = !notifiedNurtureIds.has(nurture.id);
    
    return isDueToday && notYetNotified;
  });
  
  dueToday.forEach(nurture => {
    const notification: Notification = {
      id: `nurture-due-${nurture.id}-${Date.now()}`,
      type: 'nurture_due',
      priority: 'normal',
      contactId: nurture.contactId,
      contactName: nurture.contactName,
      title: 'Nurture Contact Today',
      message: `Time to reach out to ${nurture.contactName}`,
      fullStatus: `Due today`,
      whoseMove: 'my_move',
      timestamp: now,
      read: false,
      deepLink: `/contacts?id=${nurture.contactId}`,
      requiresAction: true, // This should persist in the notification bell
    };
    
    deps.addNotification(notification);
    notifiedNurtureIds.add(nurture.id);
    
    console.log(`[Scheduler] 🌱 Nurture due today: ${nurture.contactName}`);
  });
}

/**
 * Reset notified IDs at midnight (new day)
 */
export function resetNotificationTracking() {
  notifiedContentIds.clear();
  notifiedContentDayBeforeIds.clear();
  notifiedNurtureIds.clear();
  console.log('[Scheduler] 🔄 Reset notification tracking for new day');
}
