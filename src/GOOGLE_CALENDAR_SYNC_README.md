# Google Calendar Dual Sync

## Overview

SpoonFlow now supports **bidirectional sync** between your timeline time blocks and Google Calendar. This means you can manage your schedule in either SpoonFlow or Google Calendar, and changes will sync automatically.

## How It Works

### 1. **SpoonFlow → Google Calendar**
When you arrange time blocks in your SpoonFlow timeline, they are automatically created as events in a dedicated "SpoonFlow Time Blocks" calendar in your Google account.

**What Gets Synced:**
- ✅ Routine blocks (Task Time, Content, Nurture, etc.)
- ✅ Custom time blocks you create
- ✅ General buffer blocks
- ❌ Meetings (already in Google Calendar)
- ❌ Pre/post meeting buffers (managed automatically)

### 2. **Google Calendar → SpoonFlow**
If you move or reschedule a SpoonFlow event in Google Calendar, those changes will sync back to your timeline when you click "Sync Google Calendar."

## Features

### Manual Sync
Click the "Sync Google Calendar" button in your Today page to:
- Push all current time blocks to Google Calendar
- Pull any changes made in Google Calendar back to SpoonFlow
- See a confirmation of how many blocks were synced

### Auto-Sync (Optional)
Enable auto-sync in Calendar Sync Settings to automatically sync changes at regular intervals:
- Every 1, 5, 15, 30, or 60 minutes
- Runs in the background while SpoonFlow is open
- Can be toggled on/off anytime

### Dedicated Calendar
SpoonFlow creates a separate "SpoonFlow Time Blocks" calendar in your Google account to keep your time blocks organized and easy to identify. All synced events are prefixed with `[SpoonFlow]`.

## Setup

### Prerequisites
1. Connect your Google Calendar in Settings
2. Make sure you have calendar permissions enabled

### Enable Sync
1. Go to your Today page
2. Click the Settings icon (⚙️) next to "Sync Google Calendar"
3. Toggle "Auto-sync" if you want automatic syncing
4. Choose your preferred sync interval
5. Click "Save Settings"

### Manual Sync
Simply click the "Sync Google Calendar" button whenever you want to sync:
- After rearranging your timeline
- After making changes in Google Calendar
- Anytime you want to ensure both are in sync

## Event Properties

Each synced time block includes:
- **Summary**: `[SpoonFlow] {Block Name}`
- **Description**: Block type and playlist information
- **Time**: Start time and duration from your timeline
- **Color**: Color-coded by block type:
  - 🔵 Blue: Routines
  - 🟢 Green: Content blocks
  - 🟡 Yellow: Task blocks
  - 🔴 Red: Nurture blocks
  - 🔷 Cyan: Custom blocks
- **Extended Properties**: Hidden metadata linking the event back to SpoonFlow

## API Integration

### Server Endpoints
The sync functionality uses these server endpoints:

- `POST /calendar/create-event` - Create a new time block event
- `PATCH /calendar/update-event/:eventId` - Update existing event
- `DELETE /calendar/delete-event/:eventId` - Delete event
- `GET /calendar/events` - Fetch all calendar events

### Frontend Utilities
Import from `/utils/googleCalendarTimeBlockSync.ts`:

```typescript
import { 
  syncTimeBlocksToGoogleCalendar,
  syncTimeBlocksFromGoogleCalendar,
  deleteTimeBlockFromGoogleCalendar,
  enableAutoSync,
  disableAutoSync
} from '../utils/googleCalendarTimeBlockSync';
```

## Troubleshooting

### Sync Not Working
1. Make sure you're connected to Google Calendar
2. Check that your calendar permissions are enabled
3. Try disconnecting and reconnecting your calendar
4. Make sure you have internet connectivity

### Duplicate Events
- SpoonFlow avoids duplicates by tracking Google event IDs
- If you see duplicates, try:
  1. Disable auto-sync
  2. Delete duplicate events in Google Calendar
  3. Re-sync from SpoonFlow

### Events Not Appearing
- Check that "Show Calendar Events" is enabled in sync settings
- Make sure the "SpoonFlow Time Blocks" calendar is visible in Google Calendar
- Verify that events have the `[SpoonFlow]` prefix

## Best Practices

1. **Use One Source of Truth**: While dual sync is supported, try to primarily manage your time blocks in one place (SpoonFlow or Google Calendar) to avoid confusion

2. **Sync Regularly**: Click manual sync after making major changes to your timeline

3. **Enable Auto-Sync**: For seamless integration, enable auto-sync with a 5-15 minute interval

4. **Check Conflicts**: If you make changes in both places between syncs, the most recent sync will overwrite previous changes

5. **Color Coding**: Use the color-coded events in Google Calendar to quickly identify different types of blocks

## Privacy & Security

- All sync operations use your existing Google Calendar OAuth token
- Events are stored in your personal Google Calendar account
- SpoonFlow never stores your Google credentials
- All communication uses HTTPS encryption
- You can disconnect at any time from Settings

## Future Enhancements

Planned features:
- [ ] Conflict detection and resolution UI
- [ ] Selective sync (choose which block types to sync)
- [ ] Multiple calendar support
- [ ] Webhook-based real-time sync
- [ ] Sync history and audit log
