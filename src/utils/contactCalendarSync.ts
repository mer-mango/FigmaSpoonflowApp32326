/**
 * Contact Calendar Sync Utility
 * 
 * Automatically syncs contact "nextCallDate" fields with upcoming calendar events
 * Matches contacts to calendar events by email
 */

import { Contact } from '../components/ContactsPage';
import { CalendarEvent } from '../components/CalendarPage';

/**
 * Update all contacts with their next scheduled meeting from calendar
 * 
 * @param contacts - Array of contacts to update
 * @param calendarEvents - Array of calendar events to match against
 * @returns Updated contacts array with nextCallDate synced from calendar
 */
export function syncContactsWithCalendar(
  contacts: Contact[],
  calendarEvents: CalendarEvent[]
): Contact[] {
  const now = new Date();
  
  return contacts.map(contact => {
    // Skip if contact doesn't have an email or name
    if (!contact.email && !contact.name) {
      return contact;
    }
    
    // Find all upcoming events for this contact (by email or name)
    const upcomingEvents = calendarEvents
      .filter(event => {
        // Check if event is in the future
        if (new Date(event.startTime) <= now) return false;
        
        // Match by email (case-insensitive) if both have emails
        if (contact.email) {
          const contactEmail = contact.email.toLowerCase();
          const hasContactEmail = 
            event.contact?.email?.toLowerCase() === contactEmail ||
            event.attendees?.some((email: string) => email.toLowerCase() === contactEmail);
          
          if (hasContactEmail) {
            console.log('📧 Matched event by email:', {
              contact: contact.name,
              email: contactEmail,
              event: event.title,
              attendees: event.attendees
            });
            return true;
          }
        }
        
        // Also match by name (case-insensitive) if email match failed
        if (contact.name) {
          const contactName = contact.name.toLowerCase();
          const hasContactName = 
            event.contact?.name?.toLowerCase() === contactName ||
            event.title?.toLowerCase().includes(contactName);
          
          if (hasContactName) {
            console.log('👤 Matched event by name:', {
              contact: contact.name,
              event: event.title
            });
            return true;
          }
        }
        
        return false;
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    
    // Update nextCallDate if we found upcoming events
    if (upcomingEvents.length > 0) {
      const nextEvent = upcomingEvents[0];
      console.log('✅ Setting nextCallDate for', contact.name, ':', new Date(nextEvent.startTime).toISOString());
      return {
        ...contact,
        nextCallDate: new Date(nextEvent.startTime).toISOString(),
        upcomingMeetings: upcomingEvents.length,
      };
    }
    
    // No upcoming events - clear nextCallDate if it was set
    if (contact.nextCallDate) {
      console.log('❌ Clearing nextCallDate for', contact.name, '(no upcoming events)');
    }
    return {
      ...contact,
      nextCallDate: undefined,
      upcomingMeetings: 0,
    };
  });
}

/**
 * Match a calendar event to a contact by email or name
 * 
 * @param event - Calendar event to match
 * @param contacts - Array of contacts to search
 * @returns Matching contact or null
 */
export function findContactForEvent(
  event: CalendarEvent,
  contacts: Contact[]
): Contact | null {
  // Check if event has contact email
  const eventEmail = event.contact?.email?.toLowerCase();
  if (eventEmail) {
    const match = contacts.find(c => 
      c.email?.toLowerCase() === eventEmail
    );
    if (match) return match;
  }
  
  // Try to match by attendees email
  if (event.attendees && event.attendees.length > 0) {
    for (const attendeeEmail of event.attendees) {
      if (typeof attendeeEmail === 'string') {
        const match = contacts.find(c => 
          c.email?.toLowerCase() === attendeeEmail.toLowerCase()
        );
        if (match) return match;
      }
    }
  }
  
  // Try to match by name
  const eventContactName = event.contact?.name?.toLowerCase();
  if (eventContactName) {
    const match = contacts.find(c => 
      c.name.toLowerCase() === eventContactName
    );
    if (match) return match;
  }
  
  // Try to match by event title containing contact name
  if (event.title) {
    const eventTitle = event.title.toLowerCase();
    const match = contacts.find(c => 
      eventTitle.includes(c.name.toLowerCase())
    );
    if (match) return match;
  }
  
  return null;
}

/**
 * Enrich calendar events with full contact details from contacts array
 * Adds color, avatar, and other contact metadata to calendar events
 * 
 * @param calendarEvents - Array of calendar events
 * @param contacts - Array of contacts with full details
 * @returns Calendar events enriched with contact details
 */
export function enrichCalendarEventsWithContacts(
  calendarEvents: CalendarEvent[],
  contacts: Contact[],
  manualAssignments: Record<string, string> = {}
): CalendarEvent[] {
  console.log('🔍 ENRICHMENT DEBUG: Starting enrichment process');
  console.log('  📅 Calendar Events:', calendarEvents.length);
  console.log('  👥 Contacts:', contacts.length);
  console.log('  ✍️ Manual Assignments:', Object.keys(manualAssignments).length);
  
  // Debug: Show sample event and contact
  if (calendarEvents.length > 0) {
    const sampleEvent = calendarEvents[0];
    console.log('  📋 Sample Event:', {
      title: sampleEvent.title,
      attendees: sampleEvent.attendees,
      contact: sampleEvent.contact
    });
  }
  
  if (contacts.length > 0) {
    const sampleContact = contacts[0];
    console.log('  📋 Sample Contact:', {
      name: sampleContact.name,
      email: sampleContact.email
    });
  }
  
  return calendarEvents.map(event => {
    // First, check if there's a manual contact assignment
    const manualContactId = manualAssignments[event.id];
    let contact: Contact | null = null;
    
    if (manualContactId) {
      contact = contacts.find(c => c.id === manualContactId) || null;
      if (contact) {
        console.log('✅ Using MANUAL contact assignment for event:', {
          event: event.title,
          contact: contact.name
        });
      }
    }
    
    // If no manual assignment, find matching contact automatically
    if (!contact) {
      contact = findContactForEvent(event, contacts);
    }
    
    if (!contact) {
      console.log('⚠️ No contact match for event:', {
        title: event.title,
        attendees: event.attendees,
        eventContact: event.contact
      });
      return event;
    }
    
    console.log('✅ Enriching event with contact:', {
      event: event.title,
      contact: contact.name,
      email: contact.email,
      color: contact.color,
      imageUrl: contact.imageUrl
    });
    
    // Enrich event with full contact details
    return {
      ...event,
      contact: {
        ...event.contact,
        name: contact.name,
        initials: contact.initials,
        email: contact.email || event.contact?.email,
      },
      // Add contact metadata for UI display
      contactDetails: {
        id: contact.id,
        name: contact.name,
        initials: contact.initials,
        email: contact.email,
        color: contact.color,
        imageUrl: contact.imageUrl,
        company: contact.company,
        role: contact.role,
      },
    };
  });
}

/**
 * Get all contacts that have upcoming meetings
 * 
 * @param contacts - Array of contacts
 * @param calendarEvents - Array of calendar events
 * @returns Array of contacts with upcoming meetings
 */
export function getContactsWithUpcomingMeetings(
  contacts: Contact[],
  calendarEvents: CalendarEvent[]
): Contact[] {
  const now = new Date();
  
  return contacts.filter(contact => {
    if (!contact.email && !contact.name) return false;
    
    const hasUpcomingEvent = calendarEvents.some(event => {
      if (new Date(event.startTime) <= now) return false;
      
      const contactEmail = contact.email?.toLowerCase();
      const contactName = contact.name.toLowerCase();
      
      return event.contact?.email?.toLowerCase() === contactEmail ||
             event.attendees?.some((email: string) => email.toLowerCase() === contactEmail) ||
             event.contact?.name?.toLowerCase() === contactName ||
             event.title?.toLowerCase().includes(contactName);
    });
    
    return hasUpcomingEvent;
  });
}

/**
 * Check if a contact has a meeting today
 * 
 * @param contact - Contact to check
 * @param calendarEvents - Array of calendar events
 * @returns true if contact has a meeting today
 */
export function contactHasMeetingToday(
  contact: Contact,
  calendarEvents: CalendarEvent[]
): boolean {
  if (!contact.email && !contact.name) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const contactEmail = contact.email?.toLowerCase();
  const contactName = contact.name.toLowerCase();
  
  return calendarEvents.some(event => {
    const eventDate = new Date(event.startTime);
    const isToday = eventDate >= today && eventDate < tomorrow;
    
    if (!isToday) return false;
    
    return event.contact?.email?.toLowerCase() === contactEmail ||
           event.attendees?.some((email: string) => email.toLowerCase() === contactEmail) ||
           event.contact?.name?.toLowerCase() === contactName ||
           event.title?.toLowerCase().includes(contactName);
  });
}