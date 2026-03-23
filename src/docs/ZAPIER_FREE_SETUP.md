# ⚡ Zapier Free Plan Setup - No Reformatting Needed!

## Perfect for Zapier Free (100 tasks/month, single-step Zaps)

This integration is **optimized for Zapier Free** - no Formatter steps, no multi-step Zaps, just works! 🎉

---

## The 2-Step Setup

### Step 1: Trigger (Fathom)

1. Create new Zap
2. Search for **"Fathom"**
3. Choose **"New Recording"** trigger
4. Connect your Fathom account
5. **Test the trigger** ✅

### Step 2: Action (Webhook)

1. Search for **"Webhooks by Zapier"**
2. Choose **"POST"** action
3. **URL**: Copy from SpoonFlow Settings
4. **Payload Type**: Choose `form` or `json` (either works!)
5. **Data**: Map ALL Fathom fields (see below)
6. **Test the action** ✅

---

## What Fields to Map

### The Smart Way (Recommended)
Just map **EVERYTHING** Fathom gives you! The backend is smart enough to figure it out.

Click "Add a field" for each one you see:
- ✅ Any ID field (`video_id`, `id`, `recording_id`)
- ✅ Title/Name
- ✅ Summary/Notes
- ✅ Transcript
- ✅ Action Items
- ✅ Recording URL
- ✅ Start Time
- ✅ Duration
- ✅ Participants

### Don't Worry About:
- ❌ Renaming fields
- ❌ Formatting data
- ❌ Creating arrays
- ❌ JSON formatting

**Just pass it through as-is!** The system handles all variations automatically.

---

## Example Zapier Webhook Configuration

```
Webhook URL:
https://[your-id].supabase.co/functions/v1/make-server-a89809a8/fathom/zapier-sync

Payload Type:
Form (or JSON - either works)

Data (map whatever you see):
video_id         → Video ID
title            → Meeting Title  
summary          → Summary
transcript       → Transcript
action_items     → Action Items
recording_url    → Share URL
start_time       → Created At
duration         → Duration
participants     → Participants
```

**That's it!** No reformatting, no Formatter step, just straight mapping.

---

## What the Backend Auto-Detects

The SpoonFlow backend automatically handles these field name variations:

### ID Field (for duplicate prevention)
- `video_id` ← **Most common from Fathom**
- `id`
- `recording_id`
- `fathom_id`

### Title
- `title`
- `name`
- `meeting_title`
- `Meeting Title`

### Time
- `start_time`
- `startTime`
- `created_at`
- `createdAt`
- `date`

### Summary/Notes
- `summary`
- `notes`
- `description`
- `Summary`

### Action Items (automatically parses bullets!)
- `action_items`
- `actionItems`
- `tasks`
- `Action Items`

Handles these formats:
```
- Task 1
- Task 2

or

Task 1
Task 2

or

1. Task 1
2. Task 2

or

[ ] Task 1
[x] Task 2
```

All automatically cleaned up! ✨

### Recording URL
- `recording_url`
- `recordingUrl`
- `url`
- `link`
- `share_url`

### Participants (comma or array)
- `participants`
- `attendees`
- `Participants`

---

## Troubleshooting

### "Missing Fathom ID" Error

The error will tell you what fields ARE available:
```json
{
  "error": "Missing Fathom ID. Please map: video_id, recording_id, or id",
  "availableFields": ["title", "summary", "created_at", ...]
}
```

Just map one of those ID fields!

### Testing Your Setup

1. **Test in Zapier**: Click "Test action"
2. **Check SpoonFlow**: Settings → Integrations → Refresh sync log
3. **Look for**: Your test recording in "Recent Syncs"
4. **Success!** Green checkmark = it worked ✅

### Common Issues

**Issue**: Fields not showing up
- **Fix**: Make sure you tested the Fathom trigger first - this loads the available fields

**Issue**: Duplicate recordings
- **Fix**: This is normal! The system prevents duplicates automatically

**Issue**: Action items showing weird characters
- **Fix**: The system auto-removes bullets (-, *, •, numbers, checkboxes)

---

## Zapier Free Limits

- ✅ **100 tasks/month**: Each Fathom recording = 1 task
- ✅ **5 Zaps**: You only need 1 Zap for this
- ✅ **Single-step**: This is 1 trigger + 1 action = perfect!
- ✅ **15-minute intervals**: Recordings sync within 15 minutes

**Translation**: Record ~3 meetings/day = ~90/month = fits perfectly in free tier! 🎯

---

## After Setup

Once your Zap is live:

1. Record a meeting in Fathom
2. Wait up to 15 minutes (Zapier Free polling interval)
3. Check SpoonFlow Settings → Integrations
4. See your recording in the sync log! 🎉

The system automatically:
- ✅ Prevents duplicates
- ✅ Matches to calendar events
- ✅ Parses action items
- ✅ Stores full transcript
- ✅ Logs everything for debugging

---

## Pro Tips

💡 **Map more fields = better matching**
Even if you're not sure what a field is, map it! The backend stores everything in `rawData` for debugging.

💡 **Don't rename fields**
Just map them exactly as Fathom provides them. The backend handles all variations.

💡 **Check the sync log**
Every sync is logged with success/error status. Your first stop for debugging!

💡 **Raw data is saved**
Every recording includes the original Zapier payload in `rawData` - perfect for troubleshooting.

---

## You're Done! 🎉

No Formatter steps. No field transformation. No multi-step Zaps.

Just **Fathom → Webhook** and you're syncing! 

The smart backend does all the heavy lifting for you. 💪
