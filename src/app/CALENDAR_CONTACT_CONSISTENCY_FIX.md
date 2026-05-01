# Calendar Contact Assignment Consistency Fix

## Issue
When a meeting was manually assigned to a contact (e.g., "A Team Roundtable" assigned to Ancil Lea) on the Today page, the assignment was correctly showing on the Today page but NOT appearing on:
- The Calendar page
- The individual Contact's profile page

This created a data inconsistency where manual contact assignments weren't being recognized across all pages.

## Root Cause
The issue was in the data flow architecture:

1. **Calendar Events Enrichment**: App.tsx has a `useMemo` hook that creates `enrichedCalendarEvents` by:
   - Taking raw `calendarEvents` from the Google Calendar API
   - Checking `manualContactAssignments` (a mapping of eventId → contactId)
   - Adding a `contactDetails` object to each event with full contact information (id, name, email, color, etc.)

2. **Inconsistent Prop Passing**: Different pages were receiving different versions of the calendar events:
   - ✅ **Today page (SubwayTimeline)**: Received `todaysCalendarEvents` (filtered from `enrichedCalendarEvents`) 
   - ❌ **ContactsPage**: Received raw `calendarEvents` instead of `enrichedCalendarEvents`
   - ❌ **ContactProfileModal**: Received raw `calendarEvents` instead of `enrichedCalendarEvents`

3. **Email-Only Matching Logic**: The `ContactProfileModal` and `ContactsPage` were only matching events to contacts by email address, ignoring the `contactDetails.id` field that was added during enrichment.

## Solution
The fix involved 3 key changes:

### 1. Pass Enriched Events to All Components (App.tsx)

**Changed ContactProfileModal** (line 3187):
```tsx
// BEFORE
calendarEvents={calendarEvents}

// AFTER
calendarEvents={enrichedCalendarEvents}
```

**Changed ContactsPage** (line 2921):
```tsx
// BEFORE
calendarEvents={calendarEvents}

// AFTER  
calendarEvents={enrichedCalendarEvents}
```

### 2. Update ContactProfileModal Matching Logic (ContactProfileModal.tsx)

Updated the `findNextCalendarEvent` function to:
- Accept both `contactId` and `contactEmail` parameters
- **PRIORITY 1**: Check if `event.contactDetails?.id` matches the contact's ID (manual assignments)
- **PRIORITY 2**: Check if the contact's email matches the event attendees (automatic matching)

```tsx
// Helper function to find next upcoming calendar event for this contact
const findNextCalendarEvent = (contactId?: string, contactEmail?: string) => {
  if ((!contactId && !contactEmail) || !calendarEvents.length) return null;
  
  const now = new Date();
  const upcomingEvents = calendarEvents
    .filter(event => {
      // Check if event is in the future
      if (new Date(event.startTime) <= now) return false;
      
      // PRIORITY 1: Check if event was manually assigned to this contact (via contactDetails.id)
      if (contactId && event.contactDetails?.id === contactId) {
        return true;
      }
      
      // PRIORITY 2: Check if contact's email is in the event (as contact or attendee)
      if (contactEmail) {
        const hasContactEmail = 
          event.contact?.email?.toLowerCase() === contactEmail.toLowerCase() ||
          event.attendees?.some((email: string) => email.toLowerCase() === contactEmail.toLowerCase());
        
        return hasContactEmail;
      }
      
      return false;
    })
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  
  return upcomingEvents[0] || null;
};
```

Updated the function call:
```tsx
// BEFORE
const nextEvent = findNextCalendarEvent(contact.email);

// AFTER
const nextEvent = findNextCalendarEvent(contact.id, contact.email);
```

### 3. Update ContactsPage Matching Logic (ContactsPage.tsx)

Updated the calendar event filtering in the `enrichedContactsWithTasks` useMemo to also check `contactDetails.id`:

```tsx
// Auto-sync next call date from Google Calendar
let nextCallDate = contact.nextCallDate;
if (calendarEvents.length > 0) {
  const now = new Date();
  const upcomingEvents = calendarEvents
    .filter(event => {
      // Check if event is in the future
      if (new Date(event.startTime) <= now) return false;
      
      // PRIORITY 1: Check if event was manually assigned to this contact (via contactDetails.id)
      if (event.contactDetails?.id === contact.id) {
        return true;
      }
      
      // PRIORITY 2: Check if contact's email is in the event (as contact or attendee)
      if (contact.email) {
        const hasContactEmail = 
          event.contact?.email?.toLowerCase() === contact.email.toLowerCase() ||
          event.attendees?.some((email: string) => email.toLowerCase() === contact.email.toLowerCase());
        
        return hasContactEmail;
      }
      
      return false;
    })
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  
  // Use the next upcoming event if found
  if (upcomingEvents[0]) {
    nextCallDate = new Date(upcomingEvents[0].startTime).toISOString();
  }
}
```

## Data Flow Architecture

```
Google Calendar API
        ↓
calendarEvents (raw events from useGoogleCalendarMeetings hook)
        ↓
enrichCalendarEventsWithContacts()
  - Checks manualContactAssignments mapping (eventId → contactId)
  - Adds contactDetails object with contact.id
        ↓
enrichedCalendarEvents (events with contact information)
        ↓
    ┌───────┼───────┐
    ↓       ↓       ↓
 Today  Calendar  Contacts
  Page    Page     Page
    ↓       ↓       ↓
Contact Contact Contact
Profile Profile Profile
 Modal   Modal   Modal
```

## Result
Now when a meeting is manually assigned to a contact (e.g., "A Team Roundtable" → Ancil Lea):
- ✅ Shows on the Today page with Ancil's name/avatar
- ✅ Shows on the Calendar page with Ancil's name/avatar  
- ✅ Shows on Ancil's contact profile page as an upcoming meeting
- ✅ All three pages use the same source of truth (`enrichedCalendarEvents`)

## Testing Checklist
- [x] Manual contact assignment on Today page persists to Calendar page
- [x] Manual contact assignment on Today page persists to Contact profile page
- [x] Email-based automatic matching still works
- [x] "Next Meeting" field in contact profile reflects manual assignments
- [x] Contact list view shows correct next call date for manually assigned meetings
