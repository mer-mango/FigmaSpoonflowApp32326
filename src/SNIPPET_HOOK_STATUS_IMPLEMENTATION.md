# Snippet, Hook, Tags & Status Flow Implementation
## Batch 2 Chunk 2: Content Enhancement + Status Transitions + Backend

---

## 🎨 STEP C0: GENERATE SNIPPET/HOOK/TAGS (Single Item)

### **Purpose:**
Transform extracted item into actionable content idea with Meredith's voice

### **Implementation:**

```typescript
// /utils/snippetHookGeneration.ts

import OpenAI from 'openai';
import type { AIProfile } from '../types/AIProfile';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

interface ItemInput {
  id: string;
  title: string;
  source_name: string;
  date: string;
  url?: string | null;
  raw_text: string;
}

interface SnippetHookOutput {
  id: string;
  snippet: string;
  hook: string;
  tags: string[];
  relevance_score: number;
}

export async function generateSnippetHook(
  item: ItemInput,
  aiProfile: AIProfile
): Promise<SnippetHookOutput> {
  
  const systemMessage = "You are Jamie. Output valid JSON only.";
  
  const userPrompt = `
You are Jamie. Output valid JSON only.

AI PROFILE:
${JSON.stringify({
  interest_profile: aiProfile.interest_profile,
  voice_profile: aiProfile.voice_profile,
  tagging_rules: aiProfile.tagging_rules,
  audience_default: aiProfile.audience_default
}, null, 2)}

ITEM INPUT:
{
  "id": "${item.id}",
  "title": "${item.title}",
  "source_name": "${item.source_name}",
  "date": "${item.date}",
  "url": ${item.url ? `"${item.url}"` : 'null'},
  "raw_text": "${item.raw_text.replace(/"/g, '\\"')}"
}

TASK:
Create:
1) snippet: 2–3 sentences summarizing the item in plain English, focused on what matters for digital health/patient experience (no hype).
2) hook: ONE strong opening line Meredith could use to start a piece. It should sound human and grounded (no corporate tone).
3) tags: choose 0–3 tags ONLY from these options: ${aiProfile.tagging_rules.tags.join(', ')} that best match the item.
4) relevance_score: 0–100 based on interest_profile alignment.

VOICE RULES:
- No hype. No clichés. No influencer tone.
- Clear, direct, specific.
- Avoid banned phrases: ${aiProfile.voice_profile.banned_phrases.join(', ')}.
- Meredith writes in first person "I" when drafting, but the hook itself can be written as a first-person opener line (preferred) OR a clean statement she can easily adapt.

OUTPUT JSON ONLY:
{
  "id": "...",
  "snippet": "...",
  "hook": "...",
  "tags": ["..."],
  "relevance_score": 0
}
  `.trim();
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.6, // Slightly creative for hooks
      response_format: { type: "json_object" }
    });
    
    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);
    
    return {
      id: parsed.id || item.id,
      snippet: parsed.snippet || '',
      hook: parsed.hook || '',
      tags: parsed.tags || [],
      relevance_score: parsed.relevance_score || 0
    };
    
  } catch (error) {
    console.error('Snippet/hook generation error:', error);
    throw new Error(`Failed to generate snippet/hook: ${error.message}`);
  }
}
```

---

## 🎨 STEP C1: BATCH GENERATION (More Efficient)

### **Purpose:**
Generate snippets/hooks for multiple items in one API call (saves time + cost)

### **Implementation:**

```typescript
// /utils/snippetHookGeneration.ts (continued)

export async function generateSnippetHookBatch(
  items: ItemInput[],
  aiProfile: AIProfile
): Promise<SnippetHookOutput[]> {
  
  const systemMessage = "You are Jamie. Output valid JSON only.";
  
  const userPrompt = `
You are Jamie. Output valid JSON only.

AI PROFILE:
${JSON.stringify({
  interest_profile: aiProfile.interest_profile,
  voice_profile: aiProfile.voice_profile,
  tagging_rules: aiProfile.tagging_rules,
  audience_default: aiProfile.audience_default
}, null, 2)}

ITEMS INPUT:
${JSON.stringify(items, null, 2)}

TASK:
For EACH item, create:
1) snippet: 2–3 sentences summarizing the item in plain English, focused on what matters for digital health/patient experience (no hype).
2) hook: ONE strong opening line Meredith could use to start a piece. It should sound human and grounded (no corporate tone).
3) tags: choose 0–3 tags ONLY from these options: ${aiProfile.tagging_rules.tags.join(', ')} that best match the item.
4) relevance_score: 0–100 based on interest_profile alignment.

VOICE RULES:
- No hype. No clichés. No influencer tone.
- Clear, direct, specific.
- Avoid banned phrases: ${aiProfile.voice_profile.banned_phrases.join(', ')}.
- Meredith writes in first person "I" when drafting, but the hook itself can be written as a first-person opener line (preferred) OR a clean statement she can easily adapt.

OUTPUT JSON ONLY (array):
{
  "results": [
    {
      "id": "...",
      "snippet": "...",
      "hook": "...",
      "tags": ["..."],
      "relevance_score": 0
    }
  ]
}
  `.trim();
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.6,
      response_format: { type: "json_object" }
    });
    
    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);
    
    return parsed.results || [];
    
  } catch (error) {
    console.error('Batch snippet/hook generation error:', error);
    throw new Error(`Failed to generate batch snippets/hooks: ${error.message}`);
  }
}
```

---

## 🔄 STEP D: STATUS TRANSITIONS

### **Status Definitions:**

```typescript
// /types/InboxItem.ts (add to existing)

export type InboxItemStatus = 
  | 'new'       // Appears in Content Ideas Inbox (staging)
  | 'saved'     // Moved to content system with status='idea'
  | 'dismissed' // Hidden from inbox, not deleted from source
  | 'pending_dismiss'; // Optional: 15s undo window active
```

---

## 📥 STEP D0: SAVE TO IDEAS

### **Purpose:**
Move inbox item to main content system as an "idea"

### **Implementation:**

```typescript
// /components/ContentIdeasInbox.tsx

const handleSaveToIdeas = (inboxItem: InboxItem) => {
  // Create ContentItem from InboxItem
  const contentItem: ContentItem = {
    id: Date.now().toString(),
    title: inboxItem.hook, // Use hook as title
    platform: 'LinkedIn Post', // Default
    length: 'Standard (250-500 words)',
    blueprintFamily: suggestBlueprint(inboxItem.suggestedTags), // Auto-suggest based on tags
    blueprintSubtype: '',
    status: 'idea', // ← Key: moves to ideas
    tags: [], // User tags (separate from content pillar tags)
    contentPillarTags: inboxItem.suggestedTags, // Jamie's tags
    createdOn: new Date(),
    lastUpdated: new Date(),
    wordCount: 0,
    content: '',
    notes: inboxItem.snippet, // Use snippet as initial notes
    
    // Track source
    sourceType: inboxItem.sourceType,
    sourceUrl: inboxItem.sourceUrl,
    relevanceScore: inboxItem.relevanceScore,
    jamieSnippet: inboxItem.snippet,
    jamieHook: inboxItem.hook,
    
    workingOn: false,
  };
  
  // Add to content items
  onCreateContent(contentItem);
  
  // Update inbox item status
  updateInboxItemStatus(inboxItem.id, 'saved');
  
  // Remove from inbox UI immediately
  setInboxItems(items => items.filter(i => i.id !== inboxItem.id));
  
  // Show confirmation
  toast.success('Added to Ideas', {
    description: 'You can find it in your Content view'
  });
};

// Helper: Suggest blueprint based on tags
function suggestBlueprint(tags: string[]): ContentItem['blueprintFamily'] {
  // Map content pillar tags to likely blueprints
  if (tags.includes('speaking_patient') || tags.includes('empathy_as_strategy')) {
    return 'Perspective';
  }
  if (tags.includes('full_patient_ecosystem') || tags.includes('fit_real_care_journeys')) {
    return 'Story';
  }
  if (tags.includes('co_design_hcd') || tags.includes('participatory_medicine')) {
    return 'Education';
  }
  return 'Perspective'; // Default
}
```

---

## 🚀 STEP D1: SEND TO WIZARD

### **Purpose:**
Move to ideas AND open creation wizard with pre-filled data

### **Implementation:**

```typescript
// /components/ContentIdeasInbox.tsx

const handleSendToWizard = (inboxItem: InboxItem) => {
  // First, save to ideas (same as above)
  const contentItem: ContentItem = {
    id: Date.now().toString(),
    title: inboxItem.hook,
    platform: 'LinkedIn Post',
    length: 'Standard (250-500 words)',
    blueprintFamily: suggestBlueprint(inboxItem.suggestedTags),
    status: 'idea',
    tags: [],
    contentPillarTags: inboxItem.suggestedTags,
    createdOn: new Date(),
    lastUpdated: new Date(),
    wordCount: 0,
    content: '',
    notes: inboxItem.snippet,
    sourceType: inboxItem.sourceType,
    sourceUrl: inboxItem.sourceUrl,
    relevanceScore: inboxItem.relevanceScore,
    jamieSnippet: inboxItem.snippet,
    jamieHook: inboxItem.hook,
    workingOn: false,
  };
  
  // Add to content items
  onCreateContent(contentItem);
  
  // Update inbox status
  updateInboxItemStatus(inboxItem.id, 'saved');
  
  // Remove from inbox UI
  setInboxItems(items => items.filter(i => i.id !== inboxItem.id));
  
  // Open wizard with this content
  onOpenWizard(contentItem.id);
  
  toast.success('Opening wizard...');
};
```

**In App.tsx:**

```typescript
// App.tsx

const [wizardContentId, setWizardContentId] = useState<string | null>(null);

const handleOpenWizard = (contentId: string) => {
  setWizardContentId(contentId);
};

// In render:
{wizardContentId && (
  <NewContentWizard
    isOpen={!!wizardContentId}
    onClose={() => setWizardContentId(null)}
    initialContent={allContentItems.find(c => c.id === wizardContentId)}
    onSave={(updatedContent) => {
      handleUpdateContent(updatedContent);
      setWizardContentId(null);
    }}
  />
)}
```

---

## ❌ STEP D2: DISMISS WITH 15-SECOND UNDO

### **Purpose:**
Allow quick dismissal with safety net to undo

### **Implementation:**

```typescript
// /components/ContentIdeasInbox.tsx

// State for undo timers
const [undoTimers, setUndoTimers] = useState<Map<string, NodeJS.Timeout>>(new Map());

const handleDismiss = (inboxItem: InboxItem) => {
  const itemId = inboxItem.id;
  
  // Immediately remove from UI
  setInboxItems(items => items.filter(i => i.id !== itemId));
  
  // Immediately set status to dismissed (backend)
  updateInboxItemStatus(itemId, 'dismissed');
  
  // Store dismissed item temporarily for undo
  const dismissedItem = inboxItem;
  
  // Show toast with undo button
  const toastId = toast('Dismissed', {
    description: 'Item removed from inbox',
    action: {
      label: 'Undo',
      onClick: () => handleUndo(dismissedItem, timerId)
    },
    duration: 15000 // 15 seconds
  });
  
  // Start 15-second timer
  const timerId = setTimeout(() => {
    // After 15s, dismissal is final
    finalizeDismissal(itemId);
    undoTimers.delete(itemId);
  }, 15000);
  
  // Store timer for cleanup
  setUndoTimers(prev => new Map(prev).set(itemId, timerId));
};

const handleUndo = (
  dismissedItem: InboxItem,
  timerId: NodeJS.Timeout
) => {
  // Cancel the timer
  clearTimeout(timerId);
  undoTimers.delete(dismissedItem.id);
  
  // Restore item to inbox
  setInboxItems(items => [dismissedItem, ...items]);
  
  // Revert status back to 'new'
  updateInboxItemStatus(dismissedItem.id, 'new');
  
  toast.success('Restored to inbox');
};

const finalizeDismissal = (itemId: string) => {
  // After 15s, keep record for history/analytics but don't show in UI
  console.log(`Dismissal finalized for item ${itemId}`);
  
  // Optional: Send to analytics
  // trackEvent('inbox_item_dismissed', { itemId });
};

// Cleanup timers on unmount
useEffect(() => {
  return () => {
    undoTimers.forEach(timer => clearTimeout(timer));
  };
}, []);
```

**Status Update Function:**

```typescript
// /components/ContentIdeasInbox.tsx

const updateInboxItemStatus = (itemId: string, newStatus: InboxItemStatus) => {
  // Update in localStorage
  const saved = localStorage.getItem('inboxItems');
  if (saved) {
    const items: InboxItem[] = JSON.parse(saved);
    const updated = items.map(item => 
      item.id === itemId 
        ? { ...item, status: newStatus, dismissedAt: newStatus === 'dismissed' ? new Date() : undefined }
        : item
    );
    localStorage.setItem('inboxItems', JSON.stringify(updated));
  }
  
  // Optional: Also sync to backend if using Supabase
  // await supabase.from('inbox_items').update({ status: newStatus }).eq('id', itemId);
};
```

---

## 🖥️ STEP E: BACKEND REQUIREMENTS

### **E0: Gmail Integration**

```typescript
// /utils/gmailIntegration.ts

interface GmailMessage {
  id: string;
  threadId: string;
  internalDate: string;
  snippet: string;
  payload: {
    headers: Array<{ name: string; value: string }>;
    parts?: Array<{ mimeType: string; body: { data?: string } }>;
    body?: { data?: string };
  };
}

export async function fetchNewsletters(
  accessToken: string,
  daysBack: number = 7,
  maxResults: number = 20
): Promise<NewsletterEmail[]> {
  
  const query = `newer_than:${daysBack}d`;
  
  // Fetch message list
  const listResponse = await fetch(
    `https://www.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=${maxResults}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );
  
  const listData = await listResponse.json();
  
  if (!listData.messages) {
    return [];
  }
  
  // Fetch full message details
  const newsletters: NewsletterEmail[] = [];
  
  for (const msg of listData.messages) {
    try {
      const messageResponse = await fetch(
        `https://www.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      
      const messageData: GmailMessage = await messageResponse.json();
      
      // Extract headers
      const headers = messageData.payload.headers;
      const from = headers.find(h => h.name === 'From')?.value || '';
      const subject = headers.find(h => h.name === 'Subject')?.value || '';
      
      // Extract sender name and email
      const fromMatch = from.match(/^(.+?)\s*<(.+?)>$/);
      const sender_name = fromMatch ? fromMatch[1].replace(/"/g, '') : from;
      const sender_email = fromMatch ? fromMatch[2] : from;
      
      // Extract body (HTML preferred, fallback to plain text)
      const email_html = extractHtmlBody(messageData.payload);
      const email_text = extractPlainTextBody(messageData.payload);
      
      newsletters.push({
        email_id: messageData.id,
        sender_name,
        sender_email,
        subject,
        received_at: new Date(parseInt(messageData.internalDate)).toISOString(),
        email_html,
        email_text
      });
      
    } catch (error) {
      console.error(`Failed to fetch message ${msg.id}:`, error);
    }
  }
  
  return newsletters;
}

// Extract HTML body from Gmail payload
function extractHtmlBody(payload: any): string {
  if (payload.mimeType === 'text/html' && payload.body?.data) {
    return base64Decode(payload.body.data);
  }
  
  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/html' && part.body?.data) {
        return base64Decode(part.body.data);
      }
      
      // Recursively check nested parts
      if (part.parts) {
        const html = extractHtmlBody(part);
        if (html) return html;
      }
    }
  }
  
  return '';
}

// Extract plain text body
function extractPlainTextBody(payload: any): string {
  if (payload.mimeType === 'text/plain' && payload.body?.data) {
    return base64Decode(payload.body.data);
  }
  
  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return base64Decode(part.body.data);
      }
      
      if (part.parts) {
        const text = extractPlainTextBody(part);
        if (text) return text;
      }
    }
  }
  
  return '';
}

// Base64 decode Gmail data
function base64Decode(data: string): string {
  return atob(data.replace(/-/g, '+').replace(/_/g, '/'));
}
```

**OAuth Setup (minimal):**

```typescript
// /utils/gmailAuth.ts

export function initiateGmailOAuth() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const redirectUri = window.location.origin + '/oauth/callback';
  const scope = 'https://www.googleapis.com/auth/gmail.readonly';
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=token&` +
    `scope=${encodeURIComponent(scope)}`;
  
  window.location.href = authUrl;
}

export function extractAccessTokenFromUrl(): string | null {
  const hash = window.location.hash;
  const match = hash.match(/access_token=([^&]+)/);
  return match ? match[1] : null;
}
```

---

### **E1: Idempotency / Deduplication**

```typescript
// /utils/deduplication.ts

import crypto from 'crypto';

export function createItemFingerprint(
  title: string,
  url: string | null,
  parentEmailId: string
): string {
  const normalizedTitle = title.toLowerCase().trim().replace(/\s+/g, ' ');
  const normalizedUrl = url ? url.toLowerCase().trim() : 'no-url';
  
  const composite = `${normalizedTitle}|${normalizedUrl}|${parentEmailId}`;
  
  return crypto
    .createHash('sha256')
    .update(composite)
    .digest('hex');
}

export function isDuplicate(
  fingerprint: string,
  existingFingerprints: Set<string>
): boolean {
  return existingFingerprints.has(fingerprint);
}

// Usage in processNewsletter:
const processedFingerprints = new Set<string>(
  existingInboxItems.map(item => item.fingerprint).filter(Boolean)
);

const deduped = extractedItems.filter(item => {
  const fp = createItemFingerprint(item.title, item.url, item.parent_email_id);
  
  if (isDuplicate(fp, processedFingerprints)) {
    console.log(`Skipping duplicate: ${item.title}`);
    return false;
  }
  
  processedFingerprints.add(fp);
  return true;
});
```

**Update InboxItem interface:**

```typescript
// /types/InboxItem.ts (add)

export interface InboxItem {
  // ... existing fields
  fingerprint?: string; // SHA-256 hash for deduplication
}
```

---

### **E2: ContentItem Creation Pipeline**

```typescript
// /utils/processNewsletter.ts (update final step)

export async function processNewsletter(
  email: NewsletterEmail,
  aiProfile: AIProfile,
  existingInboxItems: InboxItem[],
  useAIRerank: boolean = false
): Promise<InboxItem[]> {
  
  // ... existing steps (preprocess, extract, score, rank)
  
  // STEP 6: Generate snippets/hooks for Top 5
  console.log('✨ Generating snippets and hooks...');
  
  const itemInputs: ItemInput[] = top5.map(item => ({
    id: `${email.email_id}_${item.url || item.title}`,
    title: item.title,
    source_name: item.source_name,
    date: item.received_at,
    url: item.url,
    raw_text: item.extracted_excerpt
  }));
  
  // Batch generation (more efficient)
  const snippetHookResults = await generateSnippetHookBatch(itemInputs, aiProfile);
  
  // STEP 7: Create InboxItems with deduplication
  const processedFingerprints = new Set(
    existingInboxItems.map(i => i.fingerprint).filter(Boolean)
  );
  
  const inboxItems: InboxItem[] = top5
    .map((item, index) => {
      const fingerprint = createItemFingerprint(
        item.title,
        item.url || null,
        email.email_id
      );
      
      // Skip duplicates
      if (isDuplicate(fingerprint, processedFingerprints)) {
        return null;
      }
      
      const snippetHook = snippetHookResults.find(r => 
        r.id === `${email.email_id}_${item.url || item.title}`
      );
      
      return {
        id: `${email.email_id}_${index}_${Date.now()}`,
        sourceType: 'newsletter' as const,
        sourceUrl: item.url || undefined,
        sourceText: item.extracted_excerpt,
        sourceName: item.source_name,
        status: 'new' as const,
        relevanceScore: snippetHook?.relevance_score || item.relevance_score || 0,
        snippet: snippetHook?.snippet || item.extracted_excerpt,
        hook: snippetHook?.hook || item.title,
        suggestedTags: snippetHook?.tags || [],
        extractedAt: new Date(item.received_at),
        matchedFocusAreas: item.matched_focus_areas,
        matchedKeywords: item.matched_keywords,
        scoringBreakdown: item.scoring_breakdown,
        fingerprint
      };
    })
    .filter(Boolean) as InboxItem[];
  
  console.log(`✅ Created ${inboxItems.length} new inbox items (${top5.length - inboxItems.length} were duplicates)`);
  
  return inboxItems;
}
```

---

### **E3: Quick Add Pipeline**

```typescript
// /components/QuickAddModal.tsx

export function QuickAddModal({ 
  isOpen, 
  onClose,
  aiProfile,
  onAddToInbox 
}: {
  isOpen: boolean;
  onClose: () => void;
  aiProfile: AIProfile;
  onAddToInbox: (item: InboxItem) => void;
}) {
  const [mode, setMode] = useState<'url' | 'text'>('url');
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleQuickAddUrl = async () => {
    setLoading(true);
    
    try {
      // Create item input
      const itemInput: ItemInput = {
        id: `quick_add_url_${Date.now()}`,
        title: url, // Will be enhanced by AI
        source_name: 'Manual',
        date: new Date().toISOString(),
        url: url,
        raw_text: url // AI will work with just the URL
      };
      
      // Generate snippet/hook
      const result = await generateSnippetHook(itemInput, aiProfile);
      
      // Create inbox item
      const inboxItem: InboxItem = {
        id: itemInput.id,
        sourceType: 'url',
        sourceUrl: url,
        sourceName: 'Quick Add',
        status: 'new',
        relevanceScore: result.relevance_score,
        snippet: result.snippet,
        hook: result.hook,
        suggestedTags: result.tags,
        extractedAt: new Date(),
        fingerprint: createItemFingerprint(result.hook, url, 'quick_add')
      };
      
      onAddToInbox(inboxItem);
      onClose();
      toast.success('Added to inbox');
      
    } catch (error) {
      toast.error('Failed to add URL');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleQuickAddText = async () => {
    setLoading(true);
    
    try {
      const itemInput: ItemInput = {
        id: `quick_add_text_${Date.now()}`,
        title: text.substring(0, 100), // First 100 chars as title
        source_name: 'Manual',
        date: new Date().toISOString(),
        url: null,
        raw_text: text
      };
      
      const result = await generateSnippetHook(itemInput, aiProfile);
      
      const inboxItem: InboxItem = {
        id: itemInput.id,
        sourceType: 'quick_text',
        sourceText: text,
        sourceName: 'Quick Add',
        status: 'new',
        relevanceScore: result.relevance_score,
        snippet: result.snippet,
        hook: result.hook,
        suggestedTags: result.tags,
        extractedAt: new Date(),
        fingerprint: createItemFingerprint(result.hook, null, 'quick_add')
      };
      
      onAddToInbox(inboxItem);
      onClose();
      toast.success('Added to inbox');
      
    } catch (error) {
      toast.error('Failed to add text');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Quick Add to Inbox</DialogTitle>
        </DialogHeader>
        
        <Tabs value={mode} onValueChange={(v) => setMode(v as 'url' | 'text')}>
          <TabsList>
            <TabsTrigger value="url">Add URL</TabsTrigger>
            <TabsTrigger value="text">Add Text</TabsTrigger>
          </TabsList>
          
          <TabsContent value="url">
            <div className="space-y-4">
              <div>
                <label>Paste URL:</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full"
                />
              </div>
              <button 
                onClick={handleQuickAddUrl}
                disabled={!url || loading}
                className="btn-primary w-full"
              >
                {loading ? 'Processing...' : 'Add to Inbox'}
              </button>
            </div>
          </TabsContent>
          
          <TabsContent value="text">
            <div className="space-y-4">
              <div>
                <label>Paste text or notes:</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste article text, notes, or ideas..."
                  rows={6}
                  className="w-full"
                />
              </div>
              <button 
                onClick={handleQuickAddText}
                disabled={!text || loading}
                className="btn-primary w-full"
              >
                {loading ? 'Processing...' : 'Add to Inbox'}
              </button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
```

---

### **E4: AI Preferences Modal Storage**

Already implemented in `/JAMIE_INTEGRATION_ARCHITECTURE.md` → AIPreferencesModal component

**Storage in localStorage:**

```typescript
// App.tsx

const [aiProfile, setAIProfile] = useState<AIProfile>(() => {
  const saved = localStorage.getItem('aiProfile');
  if (saved) return JSON.parse(saved);
  return AI_PROFILE_V1; // Default
});

useEffect(() => {
  localStorage.setItem('aiProfile', JSON.stringify(aiProfile));
}, [aiProfile]);
```

**Optional: Sync to backend (Supabase):**

```typescript
// /utils/syncAIProfile.ts

export async function saveAIProfileToBackend(
  userId: string,
  profile: AIProfile
) {
  await supabase
    .from('ai_profiles')
    .upsert({
      user_id: userId,
      profile_id: profile.profile_id,
      profile_json: profile,
      updated_at: new Date().toISOString()
    });
}

export async function loadAIProfileFromBackend(
  userId: string
): Promise<AIProfile | null> {
  const { data } = await supabase
    .from('ai_profiles')
    .select('profile_json')
    .eq('user_id', userId)
    .single();
  
  return data?.profile_json || null;
}
```

---

## ✅ COMPLETE SYSTEM SUMMARY

### **Files Created:**

1. `/utils/snippetHookGeneration.ts` - Single + batch snippet/hook generation
2. `/utils/gmailIntegration.ts` - Gmail OAuth + fetch newsletters
3. `/utils/gmailAuth.ts` - OAuth flow helpers
4. `/utils/deduplication.ts` - Fingerprint-based dedup
5. `/utils/processNewsletter.ts` - Updated with snippet/hook step
6. `/components/QuickAddModal.tsx` - Quick add URL/text UI
7. `/utils/syncAIProfile.ts` - Optional backend sync

### **Updated Files:**

1. `/components/ContentIdeasInbox.tsx` - Add status transitions (save/dismiss/undo)
2. `/types/InboxItem.ts` - Add fingerprint field
3. `/App.tsx` - Add wizard state, quick add modal

---

## 🎯 READY FOR BATCH 3!

Send me Batch 3 for:
1. **Full updated builder prompt** (clean copy/paste)
2. **UI requirements** for AI Preferences modal
3. **Exact data model fields** to add

The backend + status flow is complete! 🚀
