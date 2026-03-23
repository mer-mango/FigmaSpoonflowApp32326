# Auto-Sync Next Call Feature

## Overview

The "Next Call" field in contact profiles is now **automatically synced** from Google Calendar. When you have a meeting scheduled with a contact on your calendar, SpoonFlow will automatically detect it and display it in the contact's profile.

## How It Works

### 1. **Email Matching**
- SpoonFlow matches contacts to calendar events using **email addresses**
- When a contact has an email address, the system checks all calendar events for that email in the attendees list
- Matching is **case-insensitive** for reliability

### 2. **Automatic Updates**
- The system finds the **next upcoming meeting** with each contact
- Updates happen automatically when:
  - Calendar syncs (every 30 minutes)
  - You open a contact profile
  - You view the Contacts page
- After a meeting passes, the next meeting automatically becomes the "Next Call"

### 3. **Recurring Meetings**
- Works perfectly with recurring meetings
- After one instance completes, the system automatically shows the next instance
- No manual updates needed

## Where You'll See It

### Contact Profile Modal
- Shows in the "Information" tab
- Displays as a read-only field with calendar icon
- Formatted as: "Mon, Jan 19, 2026, 2:00 PM"
- Shows "No upcoming meetings scheduled" if none found

### Contacts Table View
- Displays in the "Next Call" column
- Shows with calendar icon and blue badge background
- Special formatting for today/tomorrow:
  - Today: "Today, 2:00 PM"
  - Tomorrow: "Tomorrow, 2:00 PM"
  - Future: "Jan 25, 2:00 PM"

### Contacts Grid View
- Shows in each contact card
- Appears below company info
- Includes calendar icon for visual clarity

## Requirements

### For Auto-Sync to Work:
1. ✅ Google Calendar must be connected (Settings > Integrations)
2. ✅ Contact must have an email address
3. ✅ Contact's email must match an attendee email on the calendar event
4. ✅ Meeting must be in the future

### What Gets Synced:
- Meeting date and time
- Only the **next upcoming** meeting (not all meetings)
- Updates automatically as time passes

## Technical Details

### Email Matching Logic
```typescript
// Contact email matches either:
1. event.contact.email (primary contact on event)
   OR
2. Any email in event.attendees[] array
```

### Update Frequency
- Calendar syncs every **30 minutes** automatically
- Manual sync available in Settings > Integrations
- Real-time updates when viewing contact profiles

### Data Flow
1. Google Calendar → SpoonFlow (via OAuth sync)
2. Calendar events stored with attendee emails
3. Contact profiles match against attendees
4. Next upcoming meeting auto-populates "Next Call"

## User Benefits

✅ **No Manual Entry** - Never type meeting dates manually again
✅ **Always Current** - Automatically updates as meetings pass
✅ **Works with Recurring** - Handles weekly/monthly meetings perfectly
✅ **Single Source of Truth** - Google Calendar is the master schedule
✅ **Visual Clarity** - Calendar icons show it's synced from your calendar

## Notes

- This replaces the previous manual date/time picker
- The field is **read-only** - edit meetings in Google Calendar
- Requires contact email to be filled in for matching
- Only shows **future** meetings (past meetings are ignored)
