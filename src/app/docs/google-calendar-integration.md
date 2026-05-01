# Google Calendar Integration for Post-Meeting Notes

## Overview

The Post-Meeting Notes system automatically triggers Jamie notifications when meetings end, allowing you to capture meeting insights while they're fresh.

## How It Works

### 1. **Meeting Tracker Hook** (`/hooks/useMeetingTracker.tsx`)

The `useMeetingTracker` hook monitors your calendar and triggers notifications at key moments:

- **5 minutes before meeting ends**: "Heads-up" notification
- **At meeting end**: "Ready to capture notes?" notification with Start/Snooze options

The hook checks for meeting changes **every 1 minute** to minimize API requests while staying responsive.

Currently uses **mock data** for development. To integrate with Google Calendar:

```typescript
// Replace this function in useMeetingTracker.tsx:
const fetchMeetingsFromCalendar = useCallback(async (): Promise<Meeting[]> => {
  // TODO: Integrate with Google Calendar API
  // Example implementation:
  
  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      params: {
        timeMin: new Date().toISOString(),
        timeMax: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      }
    }
  );
  
  const data = await response.json();
  
  return data.items.map(event => ({
    id: event.id,
    title: event.summary,
    start: new Date(event.start.dateTime || event.start.date),
    end: new Date(event.end.dateTime || event.end.date),
    attendees: event.attendees?.map(a => a.email) || [],
    contact: extractContactFromAttendees(event.attendees) // Custom logic
  }));
}, [accessToken]);
```

### 2. **Jamie Notification** (`/components/JamiePostMeetingNotification.tsx`)

Two types of notifications:

#### Heads-Up (5 mins before end)
- Simple informational message
- Auto-dismisses after 10 seconds
- Prepares user for upcoming capture

#### Ready to Capture (at meeting end)
- Primary call-to-action: "Start Now"
- Snooze options: 5, 10, 15, 30 minutes
- Stays visible until user takes action

### 3. **Post-Meeting Notes Wizard** (`/components/muted_PostMeetingNotesWizard.tsx`)

7-step wizard for capturing meeting insights:

1. **Welcome** - Meeting overview
2. **Summary** - Quick 1-2 sentence recap (Jamie can generate)
3. **Key Discussions** - Optional deeper notes
4. **Decisions** - Commitments and agreements
5. **Action Items** - Follow-up tasks
6. **Follow-Up** - Need another meeting?
7. **Reflection** - Mood check (Productive/Neutral/Challenging)

### 4. **Flow Orchestration** (`/components/PostMeetingNotesFlow.tsx`)

Coordinates the entire experience:
- Receives meeting events from tracker
- Shows appropriate notifications
- Launches wizard when ready
- Handles snoozing and completion

## Current Status

✅ **Implemented:**
- Complete wizard UI with muted design system
- Jamie notification system
- Snooze functionality (5, 10, 15, 30 min)
- Meeting tracker hook architecture
- Demo page (`?demo=postmeeting`)

⏳ **Needs Implementation:**
- Google Calendar API authentication
- Real-time meeting fetching
- OAuth flow for calendar access
- Persistent storage of captured notes
- Integration with contact records

## Testing

### Mock Meeting Mode
The system currently runs with mock data that simulates:
- A meeting ending in 5 minutes (triggers heads-up)
- A meeting ending now (triggers capture prompt)
- Upcoming meetings for tomorrow

### Demo Page
Visit `?demo=postmeeting` to see the wizard in action

## Setup Instructions

### 1. Enable Google Calendar API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs

### 2. Configure Environment Variables

```bash
VITE_GOOGLE_CALENDAR_CLIENT_ID=your_client_id
VITE_GOOGLE_CALENDAR_API_KEY=your_api_key
```

### 3. Implement OAuth Flow

Add to your app:
```typescript
import { gapi } from 'gapi-script';

const initGoogleCalendar = () => {
  gapi.load('client:auth2', () => {
    gapi.client.init({
      apiKey: import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY,
      clientId: import.meta.env.VITE_GOOGLE_CALENDAR_CLIENT_ID,
      discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
      scope: 'https://www.googleapis.com/auth/calendar.readonly'
    });
  });
};
```

### 4. Replace Mock Data

Update `useMeetingTracker.tsx` with real Google Calendar API calls (see example above)

## Data Flow

```
Google Calendar
    ↓
useMeetingTracker Hook
    ↓
PostMeetingNotesFlow
    ↓
┌─────────────────────┬──────────────────────────┐
│   Jamie Notification │  Post-Meeting Wizard     │
│   (5 min heads-up)   │                          │
│                      │  1. Welcome              │
│   Jamie Notification │  2. Summary              │
│   (Meeting ended)    │  3. Discussions          │
│   • Start Now        │  4. Decisions            │
│   • Snooze (5-30min) │  5. Action Items         │
│                      │  6. Follow-Up            │
│                      │  7. Reflection           │
└─────────────────────┴──────────────────────────┘
    ↓
Captured Notes Data
    ↓
└─→ Contact Profile
└─→ Meeting History
└─→ Backend Storage
```

## Notification Behavior

### Snooze Logic
- When snoozed, notification is suppressed until snooze time expires
- After snooze expires, notification reappears automatically
- Multiple snoozes allowed
- Meeting can be snoozed for up to 30 minutes after it ends

### Completion Logic
- Once wizard is completed, no more notifications for that meeting
- Meeting marked as "notes captured"
- Data saved to backend/localStorage

### Auto-Dismiss
- Heads-up notifications auto-dismiss after 10 seconds
- Ready-to-capture notifications stay until user takes action
- User can manually dismiss any notification

## Future Enhancements

- [ ] Calendar sync status indicator
- [ ] Multiple calendar support
- [ ] Meeting series detection
- [ ] Auto-link action items to tasks
- [ ] Voice-to-text for notes
- [ ] Meeting recording integration
- [ ] AI-powered summary from transcript
- [ ] Sentiment analysis
- [ ] Meeting effectiveness tracking over time