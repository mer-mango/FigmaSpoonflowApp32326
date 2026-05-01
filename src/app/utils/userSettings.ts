/**
 * User Settings Utilities
 * Centralized access to user preferences stored in localStorage
 */

const DEFAULT_SCHEDULING_LINK = 'https://calendar.app.google/RYD84SRDRH4U7Y3T6';

/**
 * Get the user's scheduling link from settings
 * Falls back to default if not set
 */
export function getUserSchedulingLink(): string {
  if (typeof localStorage === 'undefined') {
    return DEFAULT_SCHEDULING_LINK;
  }
  
  return localStorage.getItem('user_scheduling_link') || DEFAULT_SCHEDULING_LINK;
}

/**
 * Save the user's scheduling link to settings
 */
export function saveUserSchedulingLink(link: string): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('user_scheduling_link', link);
  }
}
