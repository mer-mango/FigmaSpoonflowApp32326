/**
 * Date utility functions to handle timezone-safe date comparisons
 */

/**
 * Converts a date picker string (YYYY-MM-DD) to an ISO string at midnight UTC
 * This prevents timezone offset issues where "2025-12-01" becomes different days in different timezones
 */
export function datePickerToISO(dateString: string): string {
  if (!dateString) return "";
  
  // Parse the date string and create a UTC date at midnight
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0)); // Month is 0-indexed
  
  return date.toISOString();
}

/**
 * Converts an ISO string to a date picker string (YYYY-MM-DD)
 * Uses UTC methods to avoid timezone issues
 */
export function isoToDatePicker(isoString: string): string {
  if (!isoString) return "";
  
  const date = new Date(isoString);
  // Use UTC methods to avoid timezone shifts
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Get today's date at midnight UTC
 */
export function getTodayAtMidnight(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
}

/**
 * Get a date's midnight UTC time (strips time portion)
 */
export function getDateAtMidnight(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
}

/**
 * Check if two dates are the same day (ignoring time) - using UTC
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getUTCFullYear() === date2.getUTCFullYear() &&
    date1.getUTCMonth() === date2.getUTCMonth() &&
    date1.getUTCDate() === date2.getUTCDate()
  );
}

/**
 * Calculate difference in days between two dates
 */
export function daysDifference(date1: Date, date2: Date): number {
  const d1 = getDateAtMidnight(date1);
  const d2 = getDateAtMidnight(date2);
  const diffTime = d1.getTime() - d2.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Format a due date string in a human-readable way (Today, Tomorrow, Yesterday, etc.)
 * This function is timezone-safe and works correctly across all timezones
 */
export function formatDueDate(isoString: string): string {
  if (!isoString) return "No due date";
  
  const date = new Date(isoString);
  const today = getTodayAtMidnight();
  const taskDay = getDateAtMidnight(date);
  
  const diffDays = daysDifference(taskDay, today);
  
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays > 1 && diffDays < 7) return `In ${diffDays} days`;
  if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;
  
  return date.toLocaleDateString("en-US", { 
    weekday: 'short',
    month: "short", 
    day: "numeric",
    year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined
  });
}

/**
 * Check if a date is overdue (before today)
 */
export function isOverdue(isoString?: string): boolean {
  if (!isoString) return false;
  const date = new Date(isoString);
  const today = getTodayAtMidnight();
  const taskDay = getDateAtMidnight(date);
  return taskDay < today;
}

/**
 * Get today's date in YYYY-MM-DD format using LOCAL timezone
 * This is critical for UI displays that need to match user's local date
 */
export function getTodayLocal(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get tomorrow's date in YYYY-MM-DD format using LOCAL timezone
 */
export function getTomorrowLocal(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Convert a Date object to YYYY-MM-DD format using LOCAL timezone
 */
export function dateToLocalString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Convert a UTC ISO string to YYYY-MM-DD format using LOCAL timezone
 * This is critical for calendar events which come from Google Calendar in UTC
 * Example: "2026-03-11T01:00:00.000Z" (9pm EST on March 10) -> "2026-03-10"
 */
export function isoStringToLocalDate(isoString: string): string {
  const date = new Date(isoString);
  return dateToLocalString(date);
}