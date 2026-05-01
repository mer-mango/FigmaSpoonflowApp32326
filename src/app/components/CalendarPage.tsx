// Type definitions for Calendar Events and Sources
// Used across calendar components

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  calendarId: string;
  calendarName: string;
  color: string;
  contact?: {
    name: string;
    initials: string;
    email?: string;
  };
  attendees?: string[]; // Email addresses of attendees
  description?: string;
  location?: string;
  link?: string;
  // Enriched contact details from allContacts (added by contactCalendarSync)
  contactDetails?: {
    id: string;
    name: string;
    initials: string;
    email?: string;
    color?: string;
    imageUrl?: string;
    company?: string;
    role?: string;
  };
  // Flag to identify demo/sample data (should not trigger notifications)
  isDemoData?: boolean;
}

export interface CalendarSource {
  id: string;
  name: string;
  color: string;
  enabled: boolean;
  synced: boolean;
  type: 'google' | 'outlook' | 'other';
}

// Placeholder component (actual calendar page is muted_CalendarPage.tsx)
export function CalendarPage() {
  return null;
}