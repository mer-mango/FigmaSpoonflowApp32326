# Fathom → Zapier → SpoonFlow Integration

## Overview

This integration uses Zapier as a reliable middleware to sync Fathom meeting recordings into SpoonFlow. It replaces the buggy direct webhook approach with a more stable solution.

**✅ Works perfectly with Zapier Free plan!** No Formatter steps or multi-step Zaps needed.

## Architecture

```
Fathom → Zapier → SpoonFlow Webhook Endpoint → KV Storage → UI
```

### Key Features
- ✅ **Duplicate Prevention**: Uses Fathom recording ID to prevent duplicate syncs
- ✅ **Auto-Matching**: Automatically matches recordings to calendar events by title and time
- ✅ **Sync Log**: Tracks all syncs with success/error status for easy debugging
- ✅ **Action Items Storage**: Stores all action items for future task creation
- ✅ **Simple Debugging**: View sync history and recording details in Settings

## Zapier Setup Instructions

### 1. Create a New Zap

Go to [Zapier](https://zapier.com) and create a new Zap.

### 2. Set Up the Trigger

- **App**: Fathom
- **Trigger Event**: "New Recording"
- Connect your Fathom account
- Test the trigger to ensure it works

### 3. Set Up the Action

- **App**: Webhooks by Zapier
- **Action Event**: POST
- **URL**: Copy from SpoonFlow Settings → Integrations → Fathom via Zapier
  - Format: `https://[your-project-id].supabase.co/functions/v1/make-server-a89809a8/fathom/zapier-sync`

### 4. Map the Data Fields

**Good news for Zapier Free users!** Just map ALL Fathom fields as-is. No renaming or reformatting needed!

The system auto-detects these field name variations:
- ID: `video_id`, `id`, `recording_id` (at least one required)
- Title: `title`, `name`, `meeting_title`
- Summary: `summary`, `notes`, `description`
- Transcript: `transcript`, `Transcript`
- Action Items: `action_items`, `tasks`, `Action Items`
- URL: `recording_url`, `share_url`, `url`
- Time: `start_time`, `created_at`, `startTime`
- Duration: `duration`, `length`
- Participants: `participants`, `attendees`

**Just map whatever Fathom gives you!** The backend is smart enough to figure it out. ✨

**Zapier Free Tip**: Set Payload Type to `form` or `json` and map all fields directly - no Formatter step needed!

### 5. Test the Zap

- Click "Test & Continue" in Zapier
- Check SpoonFlow Settings → Integrations → Fathom via Zapier
- You should see the test recording in the sync log

### 6. Turn On the Zap

Once tested successfully, turn on your Zap. New Fathom recordings will now automatically sync to SpoonFlow!

## Data Schema

### Stored Recording Format
```typescript
{
  fathomId: string;           // Unique Fathom recording ID
  title: string;              // Meeting title
  startTime: string;          // ISO timestamp
  duration: number;           // Duration in seconds
  summary: string;            // Meeting summary/notes
  actionItems: Array<{        // Action items from meeting
    text: string;
    assignee?: string;
  }>;
  transcript: string;         // Full transcript
  recordingUrl: string;       // Link to Fathom recording
  syncedAt: string;           // When synced to SpoonFlow
  matchedMeetingId?: string;  // Matched calendar event ID
  matchedContactId?: string;  // Matched contact ID
  source: 'zapier';           // Source of sync
}
```

### Storage Locations

- **Recordings**: `fathom_recording_{fathomId}` in KV store
- **Sync Log**: `fathom_sync_log` in KV store (last 100 syncs)

## API Endpoints

### POST `/fathom/zapier-sync`
Receives Fathom data from Zapier and stores it.

**Returns**:
```json
{
  "success": true,
  "fathomId": "abc123",
  "matched": true,
  "matchedMeetingId": "cal-event-456",
  "actionItemCount": 3
}
```

### GET `/fathom/recordings`
Returns all stored recordings.

### GET `/fathom/sync-log`
Returns sync history (last 100 syncs).

### POST `/fathom/recordings/:fathomId/match`
Manually match a recording to a meeting/contact.

### DELETE `/fathom/recordings/:fathomId`
Delete a stored recording.

## Auto-Matching Logic

Recordings are automatically matched to calendar events if:
1. **Time proximity**: Event start time is within 2 hours of recording time
2. **Title similarity**: Event title contains recording title (or vice versa)

When matched:
- `matchedMeetingId` is set to the calendar event ID
- `matchedContactId` is set if the event has an associated contact
- Sync log entry is marked as "Matched"

## Debugging

### View Sync Status
1. Go to Settings → Integrations
2. Scroll to "Fathom via Zapier"
3. Check the "Recent Syncs" table for success/error status

### Common Issues

**Issue**: "No Fathom ID provided" error
- **Solution**: Make sure `recording_id` is mapped in Zapier webhook

**Issue**: Recordings not matching calendar events
- **Solution**: Check that meeting titles in Fathom match those in Google Calendar

**Issue**: Duplicate recordings
- **Solution**: The system prevents duplicates automatically. If you see this, it's working correctly!

## Future Enhancements

Ready for implementation:
- ✅ Convert action items to tasks with one click
- ✅ Link recordings directly to contact profiles
- ✅ Search transcripts across all recordings
- ✅ Export meeting notes and action items

## Migration from Old Webhook

The old Fathom webhook endpoint is still available at `/webhooks/fathom` but is deprecated. This Zapier integration is the recommended approach going forward.

To migrate:
1. Set up the Zapier integration as described above
2. Test with a few recordings
3. Once confirmed working, you can disable the old Fathom webhook
