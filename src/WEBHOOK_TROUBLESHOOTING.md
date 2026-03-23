# 🔧 Webhook Troubleshooting Guide

## ✅ What I Just Fixed

### 1. **Added Super Obvious Logging**
Every request now logs:
```
📥 INCOMING REQUEST: POST /make-server-a89809a8
==========================================
🚨 FATHOM WEBHOOK HIT - POST REQUEST RECEIVED
==========================================
🎯 Processing webhook...
📋 Headers: {...}
📦 Raw Body: {...}
✅ Saved webhook payload: webhook-123456
📤 RESPONSE SENT: POST /make-server-a89809a8
```

### 2. **Added GET Endpoint**
You can now test with browser by visiting:
```
https://cthtyfkutjfjawnkuucf.supabase.co/functions/v1/make-server-a89809a8
```

### 3. **Enhanced Health Check**
Visit:
```
https://cthtyfkutjfjawnkuucf.supabase.co/functions/v1/make-server-a89809a8/health
```
Shows all available endpoints.

### 4. **Request/Response Logging**
Every single request is now logged with:
- `📥 INCOMING REQUEST` at the start
- `📤 RESPONSE SENT` at the end

---

## 🧪 Quick Testing Steps

### **Step 1: Open Test Page**
Open `/webhook-test.html` in your browser and click the buttons to test.

### **Step 2: Use curl** 
```bash
# Test GET
curl https://cthtyfkutjfjawnkuucf.supabase.co/functions/v1/make-server-a89809a8

# Test POST
curl -X POST https://cthtyfkutjfjawnkuucf.supabase.co/functions/v1/make-server-a89809a8 \
  -H "Content-Type: application/json" \
  -d '{"test": "hello", "video_id": "test-123"}'
```

### **Step 3: Check Supabase Logs**
1. Go to Supabase Dashboard
2. Navigate to: **Edge Functions** → **make-server-a89809a8** → **Logs**
3. Look for:
   - `📥 INCOMING REQUEST: POST /make-server-a89809a8`
   - `🚨 FATHOM WEBHOOK HIT - POST REQUEST RECEIVED`

---

## 🔍 Diagnostic Checklist

### ✅ Is the function deployed?
**Test:** Visit health endpoint in browser
```
https://cthtyfkutjfjawnkuucf.supabase.co/functions/v1/make-server-a89809a8/health
```

**Expected:** JSON response with `status: "ok"`

**If fails:** Function not deployed or wrong project ID

---

### ✅ Can the function receive GET requests?
**Test:** Visit base endpoint in browser
```
https://cthtyfkutjfjawnkuucf.supabase.co/functions/v1/make-server-a89809a8
```

**Expected:** JSON with `message: "SpoonFlow webhook endpoint is live!"`

**What to check in logs:**
```
✅ GET REQUEST RECEIVED AT BASE ENDPOINT
```

---

### ✅ Can the function receive POST requests?
**Test:** Use curl or test HTML page

**Expected response:**
```json
{
  "success": true,
  "message": "Webhook received and logged",
  "webhookId": "webhook-1234567890",
  "timestamp": "2026-03-12T..."
}
```

**What to check in logs:**
```
📥 INCOMING REQUEST: POST /make-server-a89809a8
==========================================
🚨 FATHOM WEBHOOK HIT - POST REQUEST RECEIVED
==========================================
🎯 Processing webhook...
📋 Headers: { "content-type": "application/json", ... }
📦 Raw Body: {"test": "hello", "video_id": "test-123"}
✅ Saved webhook payload: webhook-1234567890
📤 RESPONSE SENT: POST /make-server-a89809a8
```

---

### ✅ Is data being saved to KV store?
**Test:** After successful POST, check saved data

**Endpoint:**
```
https://cthtyfkutjfjawnkuucf.supabase.co/functions/v1/make-server-a89809a8/fathom/webhook-test-log
```

**Auth required:** Add header `Authorization: Bearer YOUR_ANON_KEY`

**Expected:** List of webhook tests with timestamps

---

### ✅ Are logs appearing in Supabase?
**Location:** Supabase Dashboard → Edge Functions → Logs

**Enable Real-time:** Toggle "Real-time" on

**Refresh:** Logs may take 10-30 seconds to appear

**If no logs:** Check "Severity" filter isn't hiding info logs

---

## 🚨 Common Issues & Solutions

### Issue: Nothing in logs, not even "INCOMING REQUEST"
**Diagnosis:** Function not receiving request at all

**Possible causes:**
1. Wrong URL (check project ID)
2. Function not deployed
3. Network/firewall blocking request
4. Wrong region/endpoint

**Solution:**
1. Double-check URL matches exactly
2. Redeploy function
3. Try from different network
4. Check Supabase project is active

---

### Issue: GET works but POST doesn't
**Diagnosis:** Routing or CORS issue

**Check:**
1. Content-Type header is `application/json`
2. CORS is enabled (already done)
3. Request body is valid JSON

**Solution:**
- Use exact curl command from test guide
- Verify JSON is valid

---

### Issue: POST returns 200 but no logs
**Diagnosis:** Logging issue or delay

**Check:**
1. Wait 30 seconds and refresh
2. Check "Real-time" is enabled
3. Check severity filter
4. Try different time range

**Solution:**
- Supabase logs can be delayed
- Function still works if you get 200 response
- Check KV store directly

---

### Issue: Error in logs about KV store
**Diagnosis:** Database connection issue

**Check health/db endpoint:**
```
https://cthtyfkutjfjawnkuucf.supabase.co/functions/v1/make-server-a89809a8/health/db
```

**Expected:** `status: "ok", database: "connected"`

**If fails:** Environment variables not set

---

### Issue: Fathom says "delivered" but nothing in logs
**Diagnosis:** Fathom hitting different URL or timing issue

**Verify:**
1. Exact URL in Fathom settings
2. No extra slashes or paths
3. Fathom webhook is enabled
4. Meeting was recorded and processed

**Solution:**
1. Test with curl first
2. Copy exact working URL to Fathom
3. Check Fathom webhook delivery logs
4. Wait 5-10 min after meeting for processing

---

## 📊 Success Indicators

### ✅ Function is Working If:
- [x] Health endpoint returns 200
- [x] GET request returns "endpoint is live"
- [x] POST request returns success with webhookId
- [x] Logs show "🚨 FATHOM WEBHOOK HIT"
- [x] Logs show headers and body
- [x] Logs show "✅ Saved webhook payload"
- [x] webhook-test-log API returns saved webhooks

### ✅ Ready for Fathom If:
- [x] curl POST test works
- [x] Test HTML page works
- [x] All logs appear correctly
- [x] Data is saved to KV store
- [x] No errors in any test

---

## 🎯 Next Steps

### After Confirming Endpoint Works:
1. Add webhook URL to Fathom settings
2. Record test meeting with Fathom
3. Wait for Fathom to process (~5-10 min)
4. Check logs for webhook delivery
5. Verify data in webhook-test-log

### If Fathom Doesn't Send Webhook:
1. Verify Fathom has webhook feature (check docs)
2. Check Fathom webhook settings are saved
3. Look at Fathom's webhook delivery logs
4. Try Make.com or Zapier as intermediary
5. Contact Fathom support about webhook feature

---

## 📞 Getting Help

### Information to Provide:
1. Result of GET request (browser test)
2. Result of POST request (curl test)
3. Screenshot of Supabase logs
4. Fathom webhook configuration (screenshot)
5. Fathom delivery status (if available)

### Logs to Check:
- Supabase Edge Functions → Logs (last 1 hour)
- Fathom webhook delivery status
- Network tab in browser (for HTML test)

---

## 🔗 Quick Reference

| Test Type | URL | Expected |
|-----------|-----|----------|
| Health | `/health` | `status: "ok"` |
| GET Test | `/make-server-a89809a8` | "endpoint is live" |
| POST Test | `/make-server-a89809a8` | `success: true` + webhookId |
| Webhook Log | `/fathom/webhook-test-log` | List of webhooks |
| DB Health | `/health/db` | `database: "connected"` |

All paths relative to:
```
https://cthtyfkutjfjawnkuucf.supabase.co/functions/v1
```
