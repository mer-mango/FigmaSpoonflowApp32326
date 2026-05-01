import { useEffect, useRef } from 'react';
import { useInteractions } from '../contexts/InteractionsContext';
import { CalendarEvent } from './CalendarPage';

interface CalendarDossierSyncProps {
  calendarEvents: CalendarEvent[];
  contacts: any[];
  contactsLoaded: boolean;
}

/**
 * Auto-creates dossiers for calendar meetings when they are synced
 * This ensures every meeting has an interaction entry in the contact profile
 */
export function CalendarDossierSync({ calendarEvents, contacts, contactsLoaded }: CalendarDossierSyncProps) {
  const { createDossier, getDossierByMeetingId } = useInteractions();
  const previousEventsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!contactsLoaded || calendarEvents.length === 0) return;

    // Track which events we've already processed
    const currentEventIds = new Set(calendarEvents.map(e => e.id));
    const newEventIds = Array.from(currentEventIds).filter(id => !previousEventsRef.current.has(id));

    if (newEventIds.length > 0) {
      console.log('📅 New calendar events detected, creating dossiers...', newEventIds.length);

      newEventIds.forEach(eventId => {
        const event = calendarEvents.find(e => e.id === eventId);
        if (!event) return;

        // Check if dossier already exists
        const existingDossier = getDossierByMeetingId(event.id);
        if (existingDossier) {
          console.log('📝 Dossier already exists for meeting:', event.id);
          return;
        }

        // Find the contact for this meeting (first non-self attendee)
        const attendee = event.attendees?.find((a: any) => !a.self);
        if (!attendee) {
          console.log('⚠️ No attendee found for meeting:', event.id);
          return;
        }

        // Try to match attendee to a contact
        const contact = contacts.find(c => 
          c.email?.toLowerCase() === attendee.email?.toLowerCase() ||
          c.name?.toLowerCase() === attendee.displayName?.toLowerCase()
        );

        const contactName = contact?.name || attendee.displayName || attendee.email?.split('@')[0] || 'Unknown';
        
        // Create dossier for this meeting
        createDossier({
          type: 'meeting',
          meetingId: event.id,
          meetingTitle: contactName, // Just the contact name, not "Me and Contact"
          meetingDate: event.startTime.toLocaleDateString(),
          meetingTime: event.startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          meetingEndTime: event.endTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          contactId: contact?.id || 'unknown',
          contactName: contactName,
          prepCompleted: false,
          taskIds: [],
          postMeetingCompleted: false,
          windDownCompleted: false,
        });

        console.log(`✅ Auto-created dossier for calendar meeting: ${contactName}`);
      });
    }

    // Update the set of processed events
    previousEventsRef.current = currentEventIds;
  }, [calendarEvents, contacts, contactsLoaded, createDossier, getDossierByMeetingId]);

  return null; // This component doesn't render anything
}
