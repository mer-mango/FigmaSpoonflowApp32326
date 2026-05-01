# Fathom Webhook Testing Guide

## Your Webhook URL
```
https://cthtyfkutjfjawnkuucf.supabase.co/functions/v1/make-server-a89809a8
```

## 🚨 IMPORTANT: Auth Header Required

Supabase Edge Functions require an Authorization header. Use your **anon key**:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0aHR5ZmtrdGpmanF3bmt1dWNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk4MzE2MDUsImV4cCI6MjA1NTQwNzYwNX0.v1JcQU_-U5iqFnE6J6pJ8BQPVx11_AY0MzR5lC3kKew
```

---

## Test 1: Simple GET Request (Confirm Endpoint is Live)

### Using curl:
```bash
curl https://cthtyfkutjfjawnkuucf.supabase.co/functions/v1/make-server-a89809a8 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0aHR5ZmtrdGpmanF3bmt1dWNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk4MzE2MDUsImV4cCI6MjA1NTQwNzYwNX0.v1JcQU_-U5iqFnE6J6pJ8BQPVx11_AY0MzR5lC3kKew"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "SpoonFlow webhook endpoint is live!",
  "endpoint": "/make-server-a89809a8",
  "methods": ["GET", "POST"],
  "timestamp": "2026-03-12T..."
}
```

---

## Test 2: Simple POST Request (Simulate Fathom)

### Using curl:
```bash
curl -X POST https://cthtyfkutjfjawnkuucf.supabase.co/functions/v1/make-server-a89809a8 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0aHR5ZmtrdGpmanF3bmt1dWNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk4MzE2MDUsImV4cCI6MjA1NTQwNzYwNX0.v1JcQU_-U5iqFnE6J6pJ8BQPVx11_AY0MzR5lC3kKew" \
  -d '{"test": "hello from manual test", "video_id": "test-123"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Webhook received and logged",
  "webhookId": "webhook-1234567890",
  "timestamp": "2026-03-12T..."
}
```

**Expected Console Logs:**
```
==========================================
🚨 FATHOM WEBHOOK HIT - POST REQUEST RECEIVED
==========================================
🎯 Processing webhook...
📋 Headers: { ... }
📦 Raw Body: {"test": "hello from manual test", "video_id": "test-123"}
✅ Saved webhook payload: webhook-1234567890
```

---

## Test 3: More Realistic Fathom Data

```bash
curl -X POST https://cthtyfkutjfjawnkuucf.supabase.co/functions/v1/make-server-a89809a8 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0aHR5ZmtrdGpmanF3bmt1dWNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk4MzE2MDUsImV4cCI6MjA1NTQwNzYwNX0.v1JcQU_-U5iqFnE6J6pJ8BQPVx11_AY0MzR5lC3kKew" \
  -d '{
    "video_id": "fathom-test-456",
    "title": "Team Standup",
    "start_time": "2026-03-12T10:00:00Z",
    "duration": 1800,
    "summary": "Discussed Q1 goals and deliverables",
    "action_items": ["Follow up with design team", "Review budget proposal"],
    "transcript": "Full transcript here...",
    "recording_url": "https://app.fathom.video/share/test-123",
    "participants": ["John Doe", "Jane Smith"]
  }'
```

---

## Test 4: Using Postman or Insomnia

**Method:** POST  
**URL:** `https://cthtyfkutjfjawnkuucf.supabase.co/functions/v1/make-server-a89809a8`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0aHR5ZmtrdGpmanF3bmt1dWNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk4MzE2MDUsImV4cCI6MjA1NTQwNzYwNX0.v1JcQU_-U5iqFnE6J6pJ8BQPVx11_AY0MzR5lC3kKew
```
**Body (raw JSON):**
```json
{
  "video_id": "test-789",
  "title": "Test Meeting",
  "summary": "Testing webhook"
}
```

---

## Troubleshooting Checklist

### ✅ Step 1: Can you reach the endpoint at all?
- [ ] Visit the URL in your browser (GET request)
- [ ] Should see JSON response with "SpoonFlow webhook endpoint is live!"
- [ ] If you see error or nothing, the function isn't deployed

### ✅ Step 2: Can you POST to the endpoint?
- [ ] Run the curl command above (Test 2)
- [ ] Should see success response
- [ ] Check Supabase logs for "🚨 FATHOM WEBHOOK HIT"

### ✅ Step 3: Check Supabase Function Logs
Go to: Supabase Dashboard → Edge Functions → `make-server-a89809a8` → Logs

**What to look for:**
- `✅ GET REQUEST RECEIVED` (if you hit GET endpoint)
- `🚨 FATHOM WEBHOOK HIT - POST REQUEST RECEIVED` (if you POST)
- `📋 Headers:` (all HTTP headers)
- `📦 Raw Body:` (the payload you sent)

### ✅ Step 4: If nothing appears in logs:
1. Function might not be deployed
2. Wrong URL (check project ID)
3. CORS/network issue
4. Function crashed on startup (check for earlier errors in logs)

### ✅ Step 5: View Captured Webhooks
After successful POST, check what was saved:

**Get webhook test log:**
```bash
curl https://cthtyfkutjfjawnkuucf.supabase.co/functions/v1/make-server-a89809a8/fathom/webhook-test-log \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY"
```

---

## Common Issues

### Issue: "Function not found" or 404
**Problem:** Function isn't deployed or wrong URL  
**Solution:** 
1. Check your Supabase project ID is correct
2. Redeploy the function if needed

### Issue: GET works but POST doesn't
**Problem:** Routing issue or CORS  
**Solution:** Check CORS headers in function (already set to allow all)

### Issue: POST returns 200 but no logs appear
**Problem:** Console logs might be delayed  
**Solution:** 
1. Wait 10-30 seconds
2. Refresh logs page
3. Check "Real-time" toggle is on

### Issue: Fathom webhook says "delivered" but nothing in logs
**Problem:** Fathom might be hitting wrong URL or function crashed  
**Solution:**
1. Confirm exact URL in Fathom settings
2. Test with curl first to confirm endpoint works
3. Check for any startup errors in function logs

---

## Next Steps After Testing

Once curl test works:
1. ✅ Endpoint is reachable and processing requests
2. ✅ Logs are being written
3. ✅ Data is being saved to KV store
4. → Now add the webhook URL to Fathom settings
5. → Record a test meeting
6. → Wait for Fathom to process (~5-10 min)
7. → Check logs for webhook delivery

---

## Expected Fathom Webhook Behavior

**When Fathom sends webhook:**
1. Fathom finishes processing recording
2. Fathom POSTs to your webhook URL
3. Your function logs: `🚨 FATHOM WEBHOOK HIT`
4. Function logs headers and body
5. Function saves to KV store
6. Function returns 200 OK
7. Fathom marks webhook as "delivered"

**Timeline:**
- Meeting ends: 2:00 PM
- Fathom processing: 2:00 PM - 2:10 PM
- Webhook sent: ~2:10 PM
- Your logs show delivery: 2:10 PM