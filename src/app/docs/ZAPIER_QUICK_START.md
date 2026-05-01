# ⚡ Fathom → Zapier Quick Start Guide

## What You Get

✅ **Reliable Sync**: No more webhook failures  
✅ **Duplicate Prevention**: Smart deduplication by recording ID  
✅ **Auto-Matching**: Recordings automatically link to calendar meetings  
✅ **Easy Debugging**: Visual sync log in Settings  
✅ **Action Items Ready**: Store all action items for future task creation

---

## 5-Minute Setup

### Step 1: Get Your Webhook URL

1. Open SpoonFlow
2. Go to **Settings** → **Integrations**
3. Scroll to **"Fathom via Zapier"**
4. Click **Copy** next to the webhook URL
5. Keep this tab open - you'll need it!

### Step 2: Create Your Zap

1. Go to [zapier.com](https://zapier.com)
2. Click **"Create Zap"**
3. **Trigger App**: Search for "Fathom"
   - Event: **"New Recording"**
   - Connect your Fathom account
   - Click **Test trigger**
4. **Action App**: Search for "Webhooks by Zapier"
   - Event: **"POST"**
   - **URL**: Paste your webhook URL from Step 1
   - **Payload Type**: `form` or `json` (either works)

### Step 3: Map the Fields

**Good news!** With Zapier Free (no Formatter steps needed), just pass through ALL Fathom fields:

1. In the Webhooks action, set **Payload Type** to `form` or `json`
2. Click **"Add a field"** and map **ALL** the Fathom fields you see
3. Just map them as-is - no renaming needed!

**Common Fathom fields**:
- `video_id` or `id` (the ID field - important for duplicate prevention!)
- `title` or `name`
- `summary`
- `transcript`
- `action_items` or `tasks`
- `recording_url` or `share_url`
- `start_time` or `created_at`
- `duration`

**The system auto-detects field names**, so just map whatever you see! ✨

### Step 4: Test & Enable

1. Click **Test action** in Zapier
2. Go back to SpoonFlow Settings
3. Click **Refresh** in the sync log
4. You should see your test recording! ✨
5. Turn on your Zap in Zapier

---

## What Happens Next?

Every time you finish a Fathom recording:

1. **Fathom** processes the recording
2. **Zapier** detects the new recording
3. **SpoonFlow** receives and stores it
4. **Auto-matching** tries to link it to your calendar
5. **You** see it in Settings with all the details!

---

## Viewing Your Synced Recordings

### In Settings

**Settings → Integrations → Fathom via Zapier**

You'll see:
- 📊 **Stats**: Total recordings, matched meetings, action items
- 📋 **Recent Syncs**: Last 100 syncs with status indicators
- 🎬 **All Recordings**: Full list with details and actions

### Status Indicators

- ✅ **Green check**: Successfully synced
- ❌ **Red X**: Sync failed (see error message)
- 📅 **"Matched"**: Auto-linked to calendar event

---

## Troubleshooting

### "No recordings showing up"

1. Check Zapier Zap is **ON** (toggle at top of Zap)
2. Click "Test" in Zapier to send a test recording
3. Check Zap History for errors
4. Verify webhook URL is correct

### "Recording not matching calendar events"

This is OK! Auto-matching only works if:
- Meeting titles are similar
- Times are within 2 hours

You can still manually match recordings later.

### "Duplicate prevention not working"

Make sure you're mapping `recording_id` in Zapier. This field is REQUIRED for deduplication.

### "Action items not showing"

Try formatting action items as:
```
Task 1
Task 2
Task 3
```

Or as JSON:
```json
[
  {"text": "Task 1"},
  {"text": "Task 2"}
]
```

---

## Advanced: Testing the Endpoint

Want to test the webhook directly? Use this test endpoint:

**URL**: `https://[your-project-id].supabase.co/functions/v1/make-server-a89809a8/fathom/test-zapier`

Send a POST request with any JSON data to verify the endpoint is reachable.

---

## Next Steps

Once your recordings are syncing:

🎯 **Future Features** (coming soon):
- Convert action items to tasks with one click
- View recordings directly in contact profiles
- Search transcripts across all meetings
- Bulk export meeting notes

---

## Need Help?

- Check the [Full Documentation](./FATHOM_ZAPIER_SETUP.md)
- View sync logs in Settings for detailed error messages
- Check Zapier Zap History for failed triggers

**Pro Tip**: The sync log shows the last 100 syncs with timestamps, status, and error messages. This is your first stop for debugging!
