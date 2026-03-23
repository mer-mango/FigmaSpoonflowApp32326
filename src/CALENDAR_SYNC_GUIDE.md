# Calendar Sync: Next Call Date & Interaction Entries

## How Calendar Sync Works

### Next Call Date Field

**Auto-Sync (Default Mode)**
- Automatically finds the **earliest upcoming meeting** with this contact
- Checks every time you open the contact's profile
- Updates in real-time based on current calendar events
- Shows "(auto-synced from calendar)" label

**When Meetings Change:**
- ✅ Meeting moved from today to tomorrow → Next call date updates to tomorrow
- ✅ Meeting cancelled → Next call date shows next meeting (or "No upcoming meetings")
- ✅ New meeting added sooner → Next call date updates to the earlier meeting
- ✅ All meetings cancelled → Shows "No upcoming meetings scheduled"

**Sync Frequency:**
- Calendar syncs every 30 minutes automatically
- Can also manually sync by refreshing the calendar page
- Next call date updates every time you open the contact profile modal

### Manual Override Mode

**When to Use:**
- You want to manually set a next call date
- The auto-synced date is incorrect
- You want to clear the date entirely
- You have a planned call that's not yet on calendar

**How to Access:**
1. **When date exists:** Click "Edit" button next to the date
2. **When no date:** Click "Set Date" button
3. **To clear:** Click X button (in auto-sync mode) or clear + switch back to auto-sync

**In Manual Mode:**
- Shows "(manual override)" label in amber
- Provides datetime picker to set custom date
- X button clears the date
- "Auto-sync" button switches back to calendar sync

**To Return to Auto-Sync:**
- Click "Auto-sync" button
- System immediately finds next calendar event
- Manual date is discarded

## Interaction Entries Sync

### Automatic Creation
When you add a contact from the calendar suggestion queue:
- Creates ONE interaction entry for EACH upcoming scheduled meeting
- Each entry stores the calendar event ID

Example:
```
Contact: Mary Chen
Upcoming meetings:
- "Strategy Session" on Feb 15 → Creates interaction entry with meetingId: "cal-123"
- "Follow-up" on Feb 22 → Creates interaction entry with meetingId: "cal-456"
```

### Automatic Deletion
Every calendar sync (every 30 mins or manual):
- Compares previous calendar events to current events
- Detects cancelled meetings
- Finds interaction entries with matching `meetingId`
- Auto-deletes those entries
- Shows toast: "Removed 2 interaction entries for cancelled meetings"

Example:
```
Mary cancels "Follow-up" meeting in Google Calendar
↓
SpoonFlow syncs calendar (30 min later or manual)
↓
Detects "cal-456" was deleted
↓
Finds interaction entry with meetingId: "cal-456"
↓
Auto-deletes that interaction entry
↓
Shows toast notification
```

### Automatic Updates
When meeting details change:
- Meeting title changes → Interaction title updates
- Meeting time changes → Interaction time updates
- Meeting date changes → Interaction date updates

**Note:** The next call date field pulls from live calendar, so it updates immediately when you open the profile. The interaction entries update every calendar sync.

## Example Scenarios

### Scenario 1: Meeting Moved
```
Initial State:
- Mary's profile shows: "Next Call: Today at 2:00 PM"
- Interaction entry exists for today's meeting

You move the meeting to tomorrow in Google Calendar:

After Sync:
- Mary's profile shows: "Next Call: Tomorrow at 2:00 PM" (when you open it)
- Interaction entry date updated to tomorrow
```

### Scenario 2: Meeting Cancelled
```
Initial State:
- Mary's profile shows: "Next Call: Today at 2:00 PM"
- Interaction entry exists for today's meeting

You cancel the meeting in Google Calendar:

After Sync:
- Mary's profile shows: "No upcoming meetings scheduled" (when you open it)
- Interaction entry auto-deleted
- Toast: "Removed 1 interaction entry for cancelled meetings"
```

### Scenario 3: Earlier Meeting Added
```
Initial State:
- Mary's profile shows: "Next Call: Friday at 3:00 PM"

You add a new meeting for Wednesday at 10:00 AM:

After Sync:
- Mary's profile shows: "Next Call: Wednesday at 10:00 AM" (when you open it)
- New interaction entry created for Wednesday meeting
- Friday meeting entry still exists
```

### Scenario 4: Manual Override Needed
```
Situation: You scheduled a call with Mary off-calendar (phone call)

Solution:
1. Open Mary's profile
2. Click "Edit" button next to next call date
3. Set custom date/time
4. System shows "(manual override)" in amber
5. This date won't change until you click "Auto-sync"
```

## Technical Details

### Calendar Sync Timing
- **Automatic:** Every 30 minutes (configurable in settings)
- **Manual:** Click refresh on calendar page
- **On Profile Open:** Next call date recalculated live

### Data Storage
- **Next Call Date:** Stored on contact record in `nextCallDate` field
- **Interaction Entries:** Stored in `meeting_dossiers` localStorage
- **Calendar Events:** Cached in `googleCalendarEvents` localStorage

### Matching Logic
**How contacts are matched to calendar events:**
1. Exact email match (primary method)
2. Attendee email match
3. Contact name in meeting title (fallback)

**How interactions are matched to calendar events:**
- By `meetingId` field (calendar event ID)
- Stored when interaction created
- Used for sync/deletion

## Troubleshooting

**Q: Why isn't the next call date updating?**
- Check if manual override is enabled (amber label)
- Try clicking "Auto-sync" button
- Manually sync calendar
- Check if contact's email matches calendar attendee email

**Q: Why did my interaction entry disappear?**
- Was the meeting cancelled in Google Calendar?
- Check console for: "🗑️ Auto-deleted X interaction entries"
- This is expected behavior for cancelled meetings

**Q: Can I prevent interaction entries from being deleted?**
- Not automatically - they're tied to calendar events
- If you want to keep a record, add notes to the interaction before it's deleted
- Or create a custom "past interaction" entry not tied to calendar

**Q: What if I want both manual and auto-sync dates?**
- Use manual override for off-calendar calls
- Auto-sync will show the calendar date when you switch back
- Consider adding off-calendar calls to your calendar for consistency

## Best Practices

1. **Let auto-sync do its job** - Most accurate and lowest maintenance
2. **Use manual override sparingly** - Only when calendar can't reflect reality
3. **Add important calls to calendar** - Keeps everything in sync
4. **Regular syncs** - Don't rely only on 30-min auto-sync for time-sensitive changes
5. **Check interaction timeline** - Verify meetings are properly tracked
