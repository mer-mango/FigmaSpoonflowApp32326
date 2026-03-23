/**
 * E5B: NotificationSchedulerBridge
 * 
 * Purpose:
 * - Safely wire the notification scheduler into the app lifecycle
 * - Uses hooks to access contexts (NotificationContext, App state)
 * - Uses refs to always provide fresh data to scheduler (no stale closures)
 * - Starts scheduler exactly ONCE and cleans up on unmount
 * 
 * Architecture:
 * - Component rendered inside App.tsx (after all providers are available)
 * - Uses dependency injection to avoid circular imports
 * - Scheduler reads from refs (always gets latest data)
 */

import { useEffect, useRef } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { startNotificationScheduler } from '../utils/notificationScheduler';
import type { Task } from '../components/TasksPage';
import type { NurtureToDo } from '../components/muted_NurturesView';

interface NotificationSchedulerBridgeProps {
  tasks: Task[];
  contentItems: any[];
  calendarEvents: any[];
  nurtureItems: NurtureToDo[];
}

export function NotificationSchedulerBridge({
  tasks,
  contentItems,
  calendarEvents,
  nurtureItems,
}: NotificationSchedulerBridgeProps) {
  const { preferences, addNotification, notifications } = useNotifications();
  
  // Store data in refs so scheduler always reads latest values
  // (avoids stale closures from interval)
  const tasksRef = useRef(tasks);
  const contentItemsRef = useRef(contentItems);
  const calendarEventsRef = useRef(calendarEvents);
  const nurtureItemsRef = useRef(nurtureItems);
  const notificationsRef = useRef(notifications);
  
  // E5C PROMPT 11.10: Store preferences and addNotification in refs
  // This allows scheduler to access fresh values without restarting
  const preferencesRef = useRef(preferences);
  const addNotificationRef = useRef(addNotification);
  
  // E5C PROMPT 11.15: Collapsed ref-sync effects (reduced from 7 separate effects)
  // Update all data refs when props/context change
  useEffect(() => {
    tasksRef.current = tasks;
    contentItemsRef.current = contentItems;
    calendarEventsRef.current = calendarEvents;
    nurtureItemsRef.current = nurtureItems;
    notificationsRef.current = notifications;
  }, [tasks, contentItems, calendarEvents, nurtureItems, notifications]);
  
  // Update context refs separately (different dependency timing)
  useEffect(() => {
    preferencesRef.current = preferences;
    addNotificationRef.current = addNotification;
  }, [preferences, addNotification]);
  
  // E5C PROMPT 11.7: Start scheduler once on mount (StrictMode-safe)
  // E5C PROMPT 11.10: Dependency array is [] so scheduler starts ONCE
  // StrictMode behavior:
  //   1st mount: start() → cleanup()
  //   2nd mount: start() again
  // Result: Only one scheduler runs due to module-level guard
  useEffect(() => {
    console.log('[E5C 11.7 Bridge] 🟢 Mounting NotificationSchedulerBridge - will start scheduler');
    
    // E5C PROMPT 11.11: Dev-only debug logs (removed from production)
    // Safe check for import.meta.env existence
    // NOTE: Reading from refs (not props) to avoid eslint exhaustive-deps warnings
    if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📊 E5C DATA STRUCTURE SAMPLES FOR SCHEDULER');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('TASK sample:', tasksRef.current?.[0] || 'No tasks available');
      console.log('CONTENT sample:', contentItemsRef.current?.[0] || 'No content items available');
      console.log('EVENT sample:', calendarEventsRef.current?.[0] || 'No calendar events available');
      console.log('NURTURE sample:', nurtureItemsRef.current?.[0] || 'No nurture items available');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
    
    const cleanup = startNotificationScheduler({
      // Provide getter functions that read from refs (always fresh data)
      getTasks: () => tasksRef.current,
      getContentItems: () => contentItemsRef.current,
      getCalendarEvents: () => calendarEventsRef.current,
      getNurtureItems: () => nurtureItemsRef.current,
      getNotifications: () => notificationsRef.current, // E5D: For snooze checks
      // E5C PROMPT 11.10: Pass getter functions for preferences and addNotification
      // This allows scheduler to always use latest values without restarting
      addNotification: (n) => addNotificationRef.current(n),
      // NOTE: getPreferences is future-proofing - scheduler doesn't read prefs directly
      // (delivery gating happens inside NotificationContext.addNotification)
      getPreferences: () => preferencesRef.current,
    });
    
    // Cleanup on unmount
    return () => {
      console.log('[E5C 11.7 Bridge] 🔴 Unmounting NotificationSchedulerBridge - will stop scheduler');
      cleanup();
    };
  }, []); // E5C PROMPT 11.10: Empty deps = start once on mount, never restart
  
  // This component doesn't render anything
  return null;
}