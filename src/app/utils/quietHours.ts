import type { NotificationPreferences } from '../types/notificationPreferences';

/**
 * Checks if current time is within quiet hours
 */
export function isInQuietHours(preferences: NotificationPreferences): boolean {
  if (!preferences.quietHoursEnabled) {
    return false;
  }

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;

  const [startHour, startMinute] = preferences.quietHoursStart.split(':').map(Number);
  const [endHour, endMinute] = preferences.quietHoursEnd.split(':').map(Number);

  const startTimeInMinutes = startHour * 60 + startMinute;
  const endTimeInMinutes = endHour * 60 + endMinute;

  // Handle quiet hours that span midnight
  if (startTimeInMinutes > endTimeInMinutes) {
    return currentTimeInMinutes >= startTimeInMinutes || currentTimeInMinutes < endTimeInMinutes;
  } else {
    return currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes < endTimeInMinutes;
  }
}

/**
 * Gets a human-readable status of quiet hours
 */
export function getQuietHoursStatus(preferences: NotificationPreferences): string {
  if (!preferences.quietHoursEnabled) {
    return 'Quiet hours disabled';
  }

  if (isInQuietHours(preferences)) {
    return `In quiet hours (${preferences.quietHoursStart} - ${preferences.quietHoursEnd})`;
  } else {
    return `Outside quiet hours (${preferences.quietHoursStart} - ${preferences.quietHoursEnd})`;
  }
}