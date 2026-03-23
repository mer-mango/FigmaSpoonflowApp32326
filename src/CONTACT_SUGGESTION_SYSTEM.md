# Contact Suggestion System - Complete Implementation Guide

## Overview

The Contact Suggestion System automatically detects when people in your Google Calendar meetings aren't in your SpoonFlow contacts database and guides you through adding them with intelligent data extraction and a queue-based workflow.

## Architecture

### Core Components

1. **Contact Detection** (`/utils/contactDataExtraction.ts`)
   - Detects missing contacts by comparing calendar attendees to existing contacts
   - Extracts comprehensive data from calendar events:
     - Name, email (from attendees)
     - Company name (from meeting titles)
     - Role/title (from meeting titles)
     - Location (from calendar location field)
     - LinkedIn URL (from meeting descriptions)
     - Notes (generated from meeting context)
     - Next call date (earliest upcoming meeting)
     - All meeting IDs, titles, and dates

2. **Queue Management** (`/utils/contactSuggestionQueue.ts`)
   - Persistent localStorage-based queue system
   - Multi-select contact selection
   - Snooze functionality (5/10/15 minutes)
   - Dismiss functionality (permanent)
   - Deduplication by email
   - Automatic merging of meeting data for same contact

3. **Notification System**
   - **Persistent Banner** (`/components/ContactSuggestionBanner.tsx`)
     - Appears at top of app when contacts pending
     - Shows count of active + snoozed contacts
     - Won't disappear until action taken
   - **Desktop Notifications**
     - Shown when new contacts detected
     - Shown when snooze expires
     - Click to open Jamie panel
   - **In-App Toasts**
     - Progress updates
     - Success messages

4. **User Interface**
   - **Contact Selection Modal** (`/components/ContactSuggestionModal.tsx`)
     - Shows all pending contacts with preview
     - Multi-select with check boxes
     - Pre-selects all contacts by default
     - Shows meeting count and preview
   - **Progress Dialog** (`/components/ContactQueueProgressDialog.tsx`)
     - "Move onto next contact?" flow
     - Snooze options (5/10/15 min)
     - Dismiss with confirmation
   - **Contact Profile Modal**
     - Pre-populated with extracted data
     - Quick save workflow
     - Integration with queue progression

5. **Interaction Entry Sync** (`/utils/calendarInteractionSync.ts`)
   - Creates interaction entries for ALL upcoming meetings
   - Stores calendar event ID with each interaction
   - Auto-deletes interactions when meetings cancelled
   - Updates interactions when meeting details change

## User Flow

### 1. Detection Phase

```
Calendar Sync → Detect Attendees → Extract Data → Add to Queue → Show Notifications
```

- System compares calendar attendees to existing contacts every time calendar syncs
- Missing contacts are automatically added to queue with full data extraction
- Persistent banner appears at top of app
- Desktop notification sent (if permission granted)

### 2. Selection Phase

User clicks "Review Now" on banner:

```
Open Selection Modal → Select Contacts → Click "Add X Contacts" → Start Queue Processing
```

- Modal shows all pending contacts with preview cards
- Each card shows: name, email, company, role, location, meeting count
- User can check/uncheck contacts
- Default: all selected

### 3. Addition Phase

For each contact in queue:

```
Open Contact Modal (pre-filled) → User reviews/edits → Save → Progress Dialog
```

**Contact Modal Pre-population:**
- Name, email (required)
- Company, role, location (if detected)
- LinkedIn URL (if found in description)
- Notes (generated meeting context)
- Scheduling link (user's default)
- Next Call Date (earliest meeting)

**After Save:**
- Creates interaction entries for ALL upcoming meetings
- Stores calendar event ID with each interaction
- Shows progress dialog for next contact

### 4. Progress Dialog Options

**"Yes, add them now"**
- Immediately opens next contact's modal

**"Snooze"**
- Choose 5, 10, or 15 minutes
- Contact moves to snoozed list
- Timer runs in background
- Desktop notification + banner when time expires

**"Dismiss"**
- Shows confirmation dialog
- Permanently removes from suggestions
- Won't be suggested again

### 5. Completion

```
All Contacts Added → Success Toast → Banner Disappears → Queue Empty
```

## Calendar Sync Integration

### Interaction Entry Creation

When a contact is saved from the queue:

```javascript
// For each meeting with this contact
{
  id: 'dossier-...',
  type: 'meeting',
  meetingId: 'calendar-event-id', // Stored for sync
  meetingTitle: 'Strategy Session',
  meetingDate: '2026-02-15',
  contactId: 'contact-123',
  contactName: 'Sarah Chen',
  prepCompleted: false,
  postMeetingCompleted: false,
  windDownCompleted: false,
  taskIds: [],
  createdAt: '2026-01-28T...',
  updatedAt: '2026-01-28T...'
}
```

### Automatic Deletion on Cancellation

```
Calendar Sync → Detect Deleted Events → Find Matching Interactions → Auto-Delete
```

Every calendar sync:
1. Compares previous event IDs to current event IDs
2. Detects deletions
3. Finds interactions with matching `meetingId`
4. Auto-deletes those interactions from localStorage
5. Shows toast: "Removed 2 interaction entries for cancelled meetings"

This ensures the interaction timeline stays perfectly in sync with calendar.

## Technical Implementation

### App.tsx Integration

**State Variables:**
```typescript
const [contactSuggestionModalOpen, setContactSuggestionModalOpen] = useState(false);
const [contactQueueProgressOpen, setContactQueueProgressOpen] = useState(false);
const [isAddingContactFromQueue, setIsAddingContactFromQueue] = useState(false);
```

**Key Effects:**

1. **Contact Detection Effect:**
```typescript
useEffect(() => {
  const missingContacts = detectMissingContacts(calendarEvents, allContacts);
  addPendingContacts(missingContacts);
  // Show desktop notification
}, [calendarEvents, allContacts, contactsLoaded]);
```

2. **Snooze Watcher Effect:**
```typescript
useEffect(() => {
  const cleanup = startSnoozeWatcher((unsnoozedContacts) => {
    // Show notification and toast
  });
  return cleanup;
}, []);
```

3. **Calendar Deletion Sync Effect:**
```typescript
useEffect(() => {
  const deletedEventIds = detectDeletedEvents(previousCalendarEvents, calendarEvents);
  deleteMatchingInteractions(deletedEventIds);
}, [calendarEvents]);
```

### localStorage Schema

**Queue State:**
```json
{
  "pending": [
    {
      "email": "sarah@example.com",
      "name": "Sarah Chen",
      "company": "HealthTech Inc",
      "role": "Director of Product",
      "location": "San Francisco, CA",
      "linkedinUrl": "https://linkedin.com/in/sarahchen",
      "notes": "Met via 'Strategy Session' on February 15, 2026\n2 upcoming meetings scheduled",
      "schedulingLink": "https://calendly.com/meredith",
      "nextCallDate": "2026-02-15",
      "meetingIds": ["cal-123", "cal-456"],
      "meetingTitles": ["Strategy Session", "Follow-up"],
      "meetingDates": ["2026-02-15", "2026-02-22"],
      "detectedAt": "2026-01-28T..."
    }
  ],
  "currentIndex": 0,
  "snoozed": [
    {
      "contactEmail": "john@example.com",
      "snoozedUntil": "2026-01-28T15:30:00Z"
    }
  ],
  "dismissed": ["spam@example.com"],
  "processing": true
}
```

**Meeting Dossiers (Interactions):**
```json
[
  {
    "id": "dossier-abc123",
    "type": "meeting",
    "meetingId": "cal-123",
    "meetingTitle": "Strategy Session",
    "meetingDate": "2026-02-15",
    "contactId": "contact-789",
    "contactName": "Sarah Chen",
    "prepCompleted": false,
    "postMeetingCompleted": false,
    "windDownCompleted": false,
    "taskIds": [],
    "createdAt": "2026-01-28T...",
    "updatedAt": "2026-01-28T..."
  }
]
```

## Jamie Integration

Jamie is aware of pending contact suggestions through her system prompt:

```typescript
// In jamieAI.ts
const contextString = `
...
## Network
- Total contacts: ${contacts.length}
${(() => {
  const stored = localStorage.getItem('contact_suggestion_queue');
  if (stored) {
    const queue = JSON.parse(stored);
    if (queue.pending.length > 0) {
      return `\n⚠️ PENDING: ${queue.pending.length} calendar attendees not in contacts. 
      If asked, offer to help add them.`;
    }
  }
})()}
`;
```

When user asks Jamie to "add contacts from calendar", Jamie can:
1. Detect the intent
2. Respond with the count of pending contacts
3. Provide guidance on clicking the banner to start

## Error Handling

**Graceful Degradation:**
- If data extraction fails, contact is still added with email only
- If desktop notifications blocked, banner still works
- If localStorage quota exceeded, shows error toast
- If calendar sync fails, uses cached data

**User Feedback:**
- All operations show toast notifications
- Errors logged to console with context
- Loading states in modals
- Progress indicators

## Testing Checklist

### Basic Flow
- [ ] Calendar event with new attendee triggers detection
- [ ] Banner appears with correct count
- [ ] Desktop notification appears (if permission granted)
- [ ] Click banner opens selection modal
- [ ] All contacts pre-selected by default
- [ ] Can uncheck contacts
- [ ] Can select all/none
- [ ] Click "Add X Contacts" starts queue
- [ ] Contact modal opens with pre-filled data
- [ ] Save adds contact and shows progress dialog
- [ ] Progress dialog shows next contact name
- [ ] "Yes" opens next contact immediately
- [ ] All contacts added shows success message
- [ ] Banner disappears when queue empty

### Snooze Flow
- [ ] Click "Snooze" shows time options
- [ ] Select 5/10/15 minutes
- [ ] Contact removed from active queue
- [ ] Banner count decrements
- [ ] After timeout, desktop notification appears
- [ ] After timeout, banner count increments
- [ ] Contact reappears in queue

### Dismiss Flow
- [ ] Click "Dismiss" shows confirmation
- [ ] Confirmation shows contact details
- [ ] Cancel returns to progress dialog
- [ ] Confirm removes contact permanently
- [ ] Dismissed contact won't reappear in future syncs

### Interaction Sync
- [ ] Saving contact creates interaction entries
- [ ] One entry per upcoming meeting
- [ ] Each entry has calendar event ID
- [ ] Cancelling meeting in Google Calendar
- [ ] Next sync detects deletion
- [ ] Matching interaction auto-deleted
- [ ] Toast shows deletion count

### Edge Cases
- [ ] Contact with no name (uses email)
- [ ] Contact with no company/role
- [ ] Meeting with no location
- [ ] Meeting with no description (no LinkedIn)
- [ ] Same person in multiple meetings (data merges)
- [ ] Already-added contact not re-suggested
- [ ] Dismissed contact stays dismissed
- [ ] Queue persists across page reloads
- [ ] Snoozed contacts persist across reloads
- [ ] Multiple browser tabs stay in sync

## Future Enhancements

### Potential Additions
1. **Bulk Actions** - "Add all" / "Dismiss all" buttons
2. **Smart Sorting** - Most meetings first, or soonest meeting first
3. **Contact Previews** - Show LinkedIn profile picture
4. **Meeting Preview** - Show calendar event details in modal
5. **Duplicate Detection** - Warn if similar contact exists
6. **Import from Other Sources** - Email signatures, Zoom participants
7. **Auto-Add Rules** - "Always add people from @company.com"
8. **Analytics** - Track how many contacts added from calendar

### Integration Opportunities
1. **Email Integration** - Extract contacts from Gmail
2. **Zoom Integration** - Extract from meeting participants
3. **Slack Integration** - Extract from DM partners
4. **CRM Sync** - Two-way sync with Salesforce, HubSpot, etc.

## Maintenance

### Monitoring
- Check console for detection logs: "📧 Found calendar attendees not in contacts"
- Monitor localStorage size (quota: ~5-10MB)
- Track notification permission state
- Watch for calendar sync failures

### Data Cleanup
```javascript
// Clear all dismissed contacts (for testing)
import { clearDismissed } from './utils/contactSuggestionQueue';
clearDismissed();

// Reset entire queue (for testing)
import { resetQueue } from './utils/contactSuggestionQueue';
resetQueue();
```

### Debugging
```javascript
// View current queue state
const state = loadQueueState();
console.log('Pending:', state.pending);
console.log('Snoozed:', state.snoozed);
console.log('Dismissed:', state.dismissed);

// Check interaction entries
const dossiers = JSON.parse(localStorage.getItem('meeting_dossiers'));
console.log('Interactions:', dossiers);
```

## Summary

The Contact Suggestion System provides a seamless, intelligent workflow for keeping your SpoonFlow contacts in sync with your Google Calendar. With automatic detection, smart data extraction, flexible queue management, and robust calendar sync, it ensures your contact database is always up-to-date with minimal manual effort.

Key Benefits:
- ✅ **Automatic Detection** - No manual checking required
- ✅ **Smart Data Extraction** - Company, role, LinkedIn, notes auto-filled
- ✅ **Flexible Queue** - Snooze, dismiss, or add immediately
- ✅ **Persistent Notifications** - Banner + desktop + in-app
- ✅ **Calendar Sync** - Interaction entries stay in sync automatically
- ✅ **Jamie Integration** - AI assistant aware of pending contacts
- ✅ **Multi-Meeting Support** - Handles same person across multiple events
- ✅ **Graceful UX** - Clear progress, confirmations, success states
