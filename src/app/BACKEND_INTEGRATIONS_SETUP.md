# BACKEND INTEGRATIONS - COMPLETE SETUP GUIDE
## Gmail, LinkedIn, Substack APIs + Implementation

---

## 🎯 INTEGRATION OVERVIEW

The "Just Content" app needs 3 backend integrations:

1. **Gmail API** - Pull newsletters from dedicated inbox (v1 - REQUIRED)
2. **LinkedIn API** - Publish posts directly (v2 - OPTIONAL)
3. **Substack API** - Publish posts directly (v2 - OPTIONAL)

**Priority for v1:**
- ✅ Gmail (CRITICAL - needed for newsletter inbox feature)
- ⏸️ LinkedIn (nice-to-have; manual copy/paste is acceptable)
- ⏸️ Substack (nice-to-have; manual copy/paste is acceptable)

---

## 📧 INTEGRATION 1: GMAIL API (Newsletter Pull)

### **Purpose:**
Pull emails from a dedicated Gmail account (e.g., `newsletters@empowerhealthstrategies.com`) to populate the Content Ideas Inbox.

---

### **1A) Gmail API Setup**

**Step 1: Create Google Cloud Project**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project: "Just Content Newsletter Puller"
3. Enable Gmail API:
   - Navigate to "APIs & Services" → "Library"
   - Search "Gmail API"
   - Click "Enable"

**Step 2: Create OAuth 2.0 Credentials**
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Configure consent screen:
   - User type: External (or Internal if using Google Workspace)
   - App name: "Just Content"
   - Scopes: `https://www.googleapis.com/auth/gmail.readonly`
4. Create OAuth client ID:
   - Application type: Web application
   - Name: "Just Content Backend"
   - Authorized redirect URIs: `https://your-app.com/api/auth/google/callback`
5. Download credentials JSON → save as `google-credentials.json`

**Step 3: Store Credentials Securely**
```bash
# Environment variables (Supabase Edge Functions)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REFRESH_TOKEN=your_refresh_token # (obtained after OAuth flow)
```

---

### **1B) Gmail OAuth Flow (One-Time Setup)**

**Initial OAuth (Run once to get refresh token):**

```typescript
// /api/auth/google/init
import { OAuth2Client } from 'google-auth-library';

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `https://your-app.com/api/auth/google/callback`
);

const scopes = [
  'https://www.googleapis.com/auth/gmail.readonly'
];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
  prompt: 'consent' // Force to get refresh token
});

// Redirect user to authUrl
```

**Callback handler (Receives authorization code):**

```typescript
// /api/auth/google/callback
import { OAuth2Client } from 'google-auth-library';

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `https://your-app.com/api/auth/google/callback`
);

async function handleCallback(code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  
  // IMPORTANT: Save refresh_token to database
  // This is the ONLY time you get it
  console.log('Refresh token:', tokens.refresh_token);
  
  // Store in settings table:
  await supabase
    .from('settings')
    .update({ google_refresh_token: tokens.refresh_token })
    .eq('id', 1);
  
  return { success: true };
}
```

**After initial setup, use refresh token to get access tokens:**

```typescript
async function getGmailAccessToken() {
  const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  
  // Get refresh token from database
  const { data: settings } = await supabase
    .from('settings')
    .select('google_refresh_token')
    .single();
  
  oauth2Client.setCredentials({
    refresh_token: settings.google_refresh_token
  });
  
  const { credentials } = await oauth2Client.refreshAccessToken();
  return credentials.access_token;
}
```

---

### **1C) Gmail API Implementation**

**Pull newsletters endpoint:**

```typescript
// POST /api/inbox/pull
import { google } from 'googleapis';

async function pullNewsletters() {
  const accessToken = await getGmailAccessToken();
  
  const gmail = google.gmail({
    version: 'v1',
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  
  // Query for unread emails in inbox (or specific label)
  const response = await gmail.users.messages.list({
    userId: 'me',
    q: 'is:unread in:inbox', // Or: 'label:newsletters'
    maxResults: 50 // Adjust as needed
  });
  
  const messages = response.data.messages || [];
  
  // Fetch full message details
  const emailPromises = messages.map(async (msg) => {
    const fullMessage = await gmail.users.messages.get({
      userId: 'me',
      id: msg.id,
      format: 'full'
    });
    
    return parseGmailMessage(fullMessage.data);
  });
  
  const emails = await Promise.all(emailPromises);
  
  // Process each email with Jamie
  for (const email of emails) {
    await processNewsletter(email);
    
    // Mark as read (optional)
    await gmail.users.messages.modify({
      userId: 'me',
      id: email.id,
      requestBody: {
        removeLabelIds: ['UNREAD']
      }
    });
  }
  
  return { processed: emails.length };
}
```

**Parse Gmail message:**

```typescript
function parseGmailMessage(message: any) {
  const headers = message.payload.headers;
  
  const getHeader = (name: string) =>
    headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';
  
  const senderName = getHeader('From').replace(/<.*>/, '').trim();
  const senderEmail = getHeader('From').match(/<(.+)>/)?.[1] || getHeader('From');
  const subject = getHeader('Subject');
  const sentDate = new Date(parseInt(message.internalDate)).toISOString();
  
  // Extract body (HTML + plaintext)
  let htmlBody = '';
  let textBody = '';
  
  function extractBody(part: any) {
    if (part.mimeType === 'text/html' && part.body?.data) {
      htmlBody = Buffer.from(part.body.data, 'base64').toString('utf-8');
    }
    if (part.mimeType === 'text/plain' && part.body?.data) {
      textBody = Buffer.from(part.body.data, 'base64').toString('utf-8');
    }
    if (part.parts) {
      part.parts.forEach(extractBody);
    }
  }
  
  if (message.payload.parts) {
    message.payload.parts.forEach(extractBody);
  } else if (message.payload.body?.data) {
    // Single-part message
    const body = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
    if (message.payload.mimeType === 'text/html') {
      htmlBody = body;
    } else {
      textBody = body;
    }
  }
  
  return {
    id: message.id,
    senderName,
    senderEmail,
    subject,
    sentDateIso: sentDate,
    emailHtml: htmlBody,
    emailText: textBody
  };
}
```

---

### **1D) Gmail API Error Handling**

```typescript
try {
  const result = await pullNewsletters();
  return { success: true, processed: result.processed };
} catch (error) {
  console.error('Gmail API error:', error);
  
  if (error.code === 401) {
    return { error: "Gmail connection expired. Please reconnect." };
  }
  if (error.code === 403) {
    return { error: "Gmail API access denied. Check permissions." };
  }
  if (error.code === 429) {
    return { error: "Too many requests. Try again in a few minutes." };
  }
  
  return { error: "Failed to pull newsletters. Please try again." };
}
```

---

### **1E) Gmail Setup Checklist**

- [ ] Create Google Cloud project
- [ ] Enable Gmail API
- [ ] Create OAuth 2.0 credentials
- [ ] Run OAuth flow to get refresh token
- [ ] Store refresh token securely in database
- [ ] Implement `getGmailAccessToken()` function
- [ ] Implement `pullNewsletters()` endpoint
- [ ] Implement `parseGmailMessage()` helper
- [ ] Test with real newsletters (3-5 examples)
- [ ] Handle errors gracefully (expired token, rate limits, etc.)
- [ ] Add "Connect Gmail" button in Settings (optional)
- [ ] Add "Last synced: X minutes ago" indicator

---

## 💼 INTEGRATION 2: LINKEDIN API (Publishing - Optional v2)

### **Purpose:**
Publish LinkedIn Posts and Articles directly from the app (bypass copy/paste).

**Note:** This is **optional** for v1. Manual copy/paste is acceptable initially.

---

### **2A) LinkedIn API Setup**

**Step 1: Create LinkedIn App**
1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Create new app:
   - App name: "Just Content"
   - LinkedIn Page: (your business page)
3. Request access to "Share on LinkedIn" and "Sign In with LinkedIn" products
4. Add OAuth 2.0 redirect URLs: `https://your-app.com/api/auth/linkedin/callback`

**Step 2: Get API Credentials**
1. Navigate to "Auth" tab
2. Copy Client ID and Client Secret
3. Store in environment variables:
   ```
   LINKEDIN_CLIENT_ID=your_client_id
   LINKEDIN_CLIENT_SECRET=your_client_secret
   ```

**Step 3: Request User Authorization (OAuth 2.0)**
Similar to Gmail, implement OAuth flow to get access token.

---

### **2B) LinkedIn Publishing Implementation**

**Create a LinkedIn Post:**

```typescript
// POST /api/linkedin/createPost
async function publishToLinkedIn(contentItem: ContentItem) {
  const accessToken = await getLinkedInAccessToken();
  
  // Get user's LinkedIn ID (person URN)
  const profileResponse = await fetch('https://api.linkedin.com/v2/me', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const profile = await profileResponse.json();
  const personUrn = `urn:li:person:${profile.id}`;
  
  // Create post
  const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0'
    },
    body: JSON.stringify({
      author: personUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: contentItem.notes // Post content
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    })
  });
  
  const result = await response.json();
  return { success: true, postId: result.id };
}
```

**Create a LinkedIn Article:**

LinkedIn doesn't support publishing articles via API directly. Options:
1. Use "Share on LinkedIn" button (opens LinkedIn in browser with pre-filled text)
2. Use LinkedIn's Publishing API (limited access, requires approval)
3. Manual copy/paste (acceptable for v1)

**Recommendation:** For v1, provide a "Copy to LinkedIn" button that copies formatted text to clipboard. User pastes manually.

---

### **2C) LinkedIn Integration Checklist**

- [ ] Create LinkedIn app
- [ ] Request "Share on LinkedIn" product access
- [ ] Implement OAuth flow
- [ ] Store access token securely
- [ ] Implement `publishToLinkedIn()` function
- [ ] Test with real LinkedIn account
- [ ] Handle errors (expired token, API limits)
- [ ] Add "Connect LinkedIn" button in Settings
- [ ] OR: Add "Copy to LinkedIn" button (simpler v1)

---

## 📝 INTEGRATION 3: SUBSTACK API (Publishing - Optional v2)

### **Purpose:**
Publish Substack posts directly from the app.

**Note:** This is **optional** for v1. Manual copy/paste is acceptable initially.

---

### **3A) Substack API Setup**

**Good news:** Substack provides a simple API for publishers.

**Step 1: Get Substack API Key**
1. Log into Substack
2. Go to Settings → API Keys (or similar - Substack's settings may vary)
3. Generate new API key
4. Store securely:
   ```
   SUBSTACK_API_KEY=your_api_key
   ```

**Note:** Substack's API is less documented than Gmail/LinkedIn. May need to reverse-engineer or use unofficial endpoints.

---

### **3B) Substack Publishing Implementation**

**Create a Substack draft:**

```typescript
// POST /api/substack/createPost
async function publishToSubstack(contentItem: ContentItem) {
  const apiKey = process.env.SUBSTACK_API_KEY;
  
  // Substack API endpoint (may vary)
  const response = await fetch('https://your-publication.substack.com/api/v1/posts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: contentItem.title,
      body: contentItem.notes, // HTML content
      status: 'draft', // or 'published'
      publishAt: contentItem.publishDate ? new Date(contentItem.publishDate).toISOString() : null
    })
  });
  
  const result = await response.json();
  return { success: true, postId: result.id, draftUrl: result.url };
}
```

**Alternative: Substack Email Import**

Substack allows publishing via email:
1. Substack provides a unique email address (e.g., `publish-abc123@substack.com`)
2. Send formatted email with subject = title, body = content
3. Substack creates draft automatically

**Recommendation:** For v1, provide "Copy to Substack" button. User pastes into Substack editor manually.

---

### **3C) Substack Integration Checklist**

- [ ] Get Substack API key (or research API endpoints)
- [ ] Implement `publishToSubstack()` function
- [ ] Test with real Substack account
- [ ] Handle errors (invalid API key, etc.)
- [ ] Add "Connect Substack" button in Settings
- [ ] OR: Add "Copy to Substack" button (simpler v1)

---

## 🏗️ RECOMMENDED V1 IMPLEMENTATION

**For launch (v1), implement:**

### **✅ REQUIRED:**
1. **Gmail API** - Full implementation (OAuth + pull newsletters)
   - This is CRITICAL for Content Ideas Inbox feature
   - Without this, the core value prop is missing

### **⏸️ OPTIONAL (manual workarounds acceptable):**
2. **LinkedIn** - "Copy to clipboard" button only
   - User clicks "Publish to LinkedIn" → text copied → paste manually
   - Add LinkedIn API in v2 after validating demand

3. **Substack** - "Copy to clipboard" button only
   - User clicks "Publish to Substack" → text copied → paste manually
   - Add Substack API in v2 after validating demand

**Rationale:**
- Gmail is the only integration that UNLOCKS new capability (automated newsletter processing)
- LinkedIn/Substack are "convenience" features - manual copy/paste is 10 seconds
- Ship v1 faster, add publishing APIs based on user feedback

---

## 🔐 SECURITY BEST PRACTICES

### **1. Store Tokens Securely**

**DO:**
- ✅ Encrypt tokens in database using AES-256
- ✅ Use environment variables for API keys
- ✅ Use HTTPS only (no HTTP)
- ✅ Implement token refresh logic (don't hardcode access tokens)
- ✅ Log token usage (audit trail)

**DON'T:**
- ❌ Store tokens in localStorage (frontend)
- ❌ Commit tokens to git
- ❌ Log tokens in console/errors
- ❌ Share tokens between users

### **2. Token Encryption Example**

```typescript
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32-byte key
const ALGORITHM = 'aes-256-cbc';

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text: string): string {
  const [ivHex, encryptedHex] = text.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Usage:
const encryptedToken = encrypt(refreshToken);
await supabase.from('settings').update({ google_refresh_token: encryptedToken });

// Later:
const { data } = await supabase.from('settings').select('google_refresh_token').single();
const refreshToken = decrypt(data.google_refresh_token);
```

---

## 📊 API RATE LIMITS & QUOTAS

**Gmail API:**
- Free tier: 1 billion quota units/day
- Each read = 5 units
- Typical pull (50 emails) = 250 units → can pull ~200,000 times/day (more than enough)

**LinkedIn API:**
- 500 requests/day per user
- 100 posts/day per user
- Typical usage: 1-3 posts/day → well within limits

**Substack API:**
- No official public limits
- Likely: 100-1000 requests/day (reasonable for single user)

**Mitigation:**
- Cache results (don't refetch same email twice)
- Implement exponential backoff on errors
- Show user-friendly error if rate limited

---

## ✅ BACKEND INTEGRATIONS CHECKLIST

### **Gmail (v1 - REQUIRED):**
- [ ] Create Google Cloud project + enable Gmail API
- [ ] Implement OAuth flow + get refresh token
- [ ] Store refresh token encrypted in database
- [ ] Implement `pullNewsletters()` endpoint
- [ ] Implement `parseGmailMessage()` helper
- [ ] Test with 5 real newsletters
- [ ] Handle errors (expired token, rate limits)
- [ ] Add "Last synced" indicator in UI

### **LinkedIn (v2 - OPTIONAL):**
- [ ] Add "Copy to LinkedIn" button (v1 manual workaround)
- [ ] (Later) Create LinkedIn app + OAuth
- [ ] (Later) Implement `publishToLinkedIn()` endpoint

### **Substack (v2 - OPTIONAL):**
- [ ] Add "Copy to Substack" button (v1 manual workaround)
- [ ] (Later) Get Substack API key
- [ ] (Later) Implement `publishToSubstack()` endpoint

---

**END OF BACKEND INTEGRATIONS SETUP**

**Summary:** Gmail API is critical for v1 (newsletter processing). LinkedIn and Substack can use manual copy/paste initially, with API publishing added in v2 based on user demand.
