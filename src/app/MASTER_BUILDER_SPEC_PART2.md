# Content Ideas Inbox - Builder Spec Part 2
## AI Preferences Modal + Quick Add + Implementation Details + QA Checklist

---

## 🔧 AI PREFERENCES MODAL (REQUIRED)

Full implementation from `/JAMIE_INTEGRATION_ARCHITECTURE.md` - copy the AIPreferencesModal component exactly.

**Key features:**
- Edit focus areas (name, weight, keywords)
- Edit prioritize/avoid keywords
- Toggle learning from published content
- Voice guardrails (read-only or editable)
- Save persists to localStorage + optional Supabase

---

## ➕ QUICK ADD MODAL

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
      const itemInput = {
        id: `quick_add_url_${Date.now()}`,
        title: url,
        source_name: 'Manual',
        date: new Date().toISOString(),
        url: url,
        raw_text: url
      };
      
      const result = await generateSnippetHook(itemInput, aiProfile);
      
      const inboxItem: InboxItem = {
        id: itemInput.id,
        item_fingerprint: createItemFingerprint(result.hook, url, 'quick_add'),
        source_type: 'quick_add_url',
        source_url: url,
        source_name: 'Manual',
        status: 'new',
        relevance_score: result.relevance_score,
        snippet: result.snippet,
        hook: result.hook,
        suggestedTags: result.tags,
        created_at: new Date(),
        extracted_at: new Date(),
        title: result.hook
      };
      
      onAddToInbox(inboxItem);
      onClose();
      setUrl('');
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
      const itemInput = {
        id: `quick_add_text_${Date.now()}`,
        title: text.substring(0, 100),
        source_name: 'Manual',
        date: new Date().toISOString(),
        url: null,
        raw_text: text
      };
      
      const result = await generateSnippetHook(itemInput, aiProfile);
      
      const inboxItem: InboxItem = {
        id: itemInput.id,
        item_fingerprint: createItemFingerprint(result.hook, null, 'quick_add'),
        source_type: 'quick_add_text',
        source_text: text,
        source_name: 'Manual',
        status: 'new',
        relevance_score: result.relevance_score,
        snippet: result.snippet,
        hook: result.hook,
        suggestedTags: result.tags,
        created_at: new Date(),
        extracted_at: new Date(),
        title: result.hook
      };
      
      onAddToInbox(inboxItem);
      onClose();
      setText('');
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
          <DialogDescription>
            Add a URL or paste text to create a new content idea
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={mode} onValueChange={(v) => setMode(v as 'url' | 'text')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url">Add URL</TabsTrigger>
            <TabsTrigger value="text">Paste Text</TabsTrigger>
          </TabsList>
          
          <TabsContent value="url" className="space-y-4">
            <div>
              <label className="text-sm font-medium">Paste URL:</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="w-full mt-1 px-3 py-2 border rounded"
              />
              <p className="text-xs text-gray-500 mt-1">
                Jamie will generate a summary and suggested hook
              </p>
            </div>
            <button 
              onClick={handleQuickAddUrl}
              disabled={!url || loading}
              className="btn-primary bg-[#5e2350] w-full"
            >
              {loading ? 'Creating card...' : 'Add to Inbox'}
            </button>
          </TabsContent>
          
          <TabsContent value="text" className="space-y-4">
            <div>
              <label className="text-sm font-medium">Paste text or notes:</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste article text, notes, or ideas..."
                rows={8}
                className="w-full mt-1 px-3 py-2 border rounded"
              />
              <p className="text-xs text-gray-500 mt-1">
                Jamie will analyze the text and suggest a hook
              </p>
            </div>
            <button 
              onClick={handleQuickAddText}
              disabled={!text || loading}
              className="btn-primary bg-[#5e2350] w-full"
            >
              {loading ? 'Creating card...' : 'Add to Inbox'}
            </button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
```

---

## ⚙️ SETTINGS INTEGRATION

Add to existing Settings page:

```typescript
// In Settings page

<div className="settings-section">
  <h3>Newsletter Inbox</h3>
  
  <div className="gmail-connection">
    {gmailConnected ? (
      <div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full" />
          <span>Connected to Gmail</span>
        </div>
        <button 
          onClick={handleDisconnectGmail}
          className="btn-secondary mt-2"
        >
          Disconnect
        </button>
      </div>
    ) : (
      <div>
        <p className="text-gray-600 mb-2">
          Connect your newsletter Gmail account to pull content ideas
        </p>
        <button 
          onClick={handleConnectGmail}
          className="btn-primary"
        >
          Connect Gmail
        </button>
      </div>
    )}
  </div>
  
  <div className="mt-4">
    <label className="text-sm font-medium">Gmail Label (optional)</label>
    <input
      type="text"
      value={gmailLabel}
      onChange={(e) => setGmailLabel(e.target.value)}
      placeholder="Leave empty to pull from inbox"
      className="w-full mt-1 px-3 py-2 border rounded"
    />
    <p className="text-xs text-gray-500 mt-1">
      If provided, only emails with this label will be pulled
    </p>
  </div>
  
  <p className="text-sm text-gray-600 mt-4">
    This pulls newsletter emails and extracts story items into Content Ideas Inbox.
  </p>
</div>
```

---

## 🔄 COMPLETE IMPLEMENTATION FILES

### **Files to CREATE:**

1. `/types/AIProfile.ts` - AI Profile interface + AI_PROFILE_V1 default
2. `/types/InboxItem.ts` - InboxItem interface
3. `/components/ContentIdeasInbox.tsx` - Main inbox section component
4. `/components/InboxItemCard.tsx` - Card component (Top 5 + compact variants)
5. `/components/InboxItemPreviewModal.tsx` - Preview modal
6. `/components/QuickAddModal.tsx` - Quick add URL/text modal
7. `/components/AIPreferencesModal.tsx` - Edit AI profile modal
8. `/utils/newsletterPreprocessor.ts` - Strip boilerplate, extract blocks
9. `/utils/newsletterExtraction.ts` - AI extraction (blocks → items)
10. `/utils/contentScoring.ts` - Deterministic scoring algorithm
11. `/utils/contentRanking.ts` - Top 5 selection with diversity
12. `/utils/snippetHookGeneration.ts` - Generate snippet/hook/tags
13. `/utils/gmailIntegration.ts` - Gmail OAuth + fetch newsletters
14. `/utils/gmailAuth.ts` - OAuth helpers
15. `/utils/deduplication.ts` - Fingerprint creation
16. `/utils/processNewsletter.ts` - End-to-end pipeline orchestration

### **Files to MODIFY:**

1. `/types/ContentItem.ts` - Add new fields (sourceType, relevanceScore, etc.)
2. `/components/muted_ContentPage_Gallery.tsx` - Add ContentIdeasInbox at top
3. `/App.tsx` - Add aiProfile state, wizard integration
4. Settings page - Add Gmail connection section

---

## 📋 WIZARD PAYLOAD CONTRACT

When "Send to Wizard" is clicked:

```typescript
// Preferred approach:
const handleSendToWizard = (inboxItem: InboxItem) => {
  // 1. Create ContentItem
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
    sourceType: inboxItem.source_type === 'newsletter' ? 'newsletter' : 
                 inboxItem.source_type === 'quick_add_url' ? 'url' : 'quick_text',
    sourceUrl: inboxItem.source_url,
    relevanceScore: inboxItem.relevance_score,
    jamieSnippet: inboxItem.snippet,
    jamieHook: inboxItem.hook,
    workingOn: false,
  };
  
  // 2. Add to content items
  onCreateContent(contentItem);
  
  // 3. Update inbox status
  updateInboxItemStatus(inboxItem.id, 'saved');
  
  // 4. Remove from inbox UI
  setInboxItems(items => items.filter(i => i.id !== inboxItem.id));
  
  // 5. Open wizard with this content
  onOpenWizard(contentItem.id);
};

// In App.tsx:
const [wizardContentId, setWizardContentId] = useState<string | null>(null);

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

**Wizard receives:**
- `content_entry_id` (the ContentItem.id)
- Pre-filled fields: title (hook), notes (snippet), tags (content pillar tags), sourceUrl

---

## 🚫 DO NOT BUILD

- ❌ Separate page for Content Ideas
- ❌ Platform selection in inbox (happens in wizard)
- ❌ Archive tab
- ❌ Approved sender management
- ❌ Fetch article publish dates from web
- ❌ Background/automated newsletter pulls (manual only for v1)

---

## 📱 RESPONSIVE DESIGN

**Desktop (>1024px):**
- Top 5 cards in horizontal row (5 columns)
- Inbox cards in 3-column grid
- Filters in horizontal row

**Tablet (768px - 1024px):**
- Top 5 cards in 2-column grid
- Inbox cards in 2-column grid
- Filters stay horizontal

**Mobile (<768px):**
- Top 5 cards stacked vertically
- Inbox cards stacked vertically
- Filters collapse into drawer/dropdown
- Search full-width

---

## 🎨 LOADING & ERROR STATES

### **Loading States:**

```typescript
// Pulling newsletters
{pulling && (
  <div className="loading-state">
    <div className="skeleton-cards grid grid-cols-5 gap-4">
      {[1,2,3,4,5].map(i => (
        <div key={i} className="skeleton h-64 bg-gray-200 animate-pulse rounded" />
      ))}
    </div>
    <p className="text-center text-gray-600 mt-4">
      Scanning newsletters...
    </p>
  </div>
)}

// Quick add processing
{loading && (
  <div className="flex items-center justify-center py-8">
    <div className="spinner" />
    <span className="ml-2">Creating card...</span>
  </div>
)}
```

### **Error States:**

```typescript
// Gmail not connected
{!gmailConnected && (
  <div className="error-state bg-yellow-50 border border-yellow-200 rounded-lg p-6">
    <h3 className="text-lg font-semibold mb-2">Gmail Not Connected</h3>
    <p className="text-gray-700 mb-4">
      Connect your newsletter Gmail account to start pulling content ideas.
    </p>
    <Link to="/settings" className="btn-primary">
      Go to Settings →
    </Link>
  </div>
)}

// Pull failed
{pullError && (
  <div className="error-state bg-red-50 border border-red-200 rounded-lg p-4">
    <p className="text-red-700">{pullError}</p>
    <button 
      onClick={handleRetry}
      className="btn-secondary mt-2"
    >
      Retry
    </button>
  </div>
)}

// No items found
{inboxItems.length === 0 && !pulling && (
  <div className="empty-state text-center py-12">
    <p className="text-gray-600 mb-4">
      No items in inbox. Pull newsletters to get started.
    </p>
    <button onClick={handlePullNewsletters} className="btn-primary bg-[#5e2350]">
      Pull Newsletters
    </button>
  </div>
)}
```

---

## ✅ QA CHECKLIST

### **1. Newsletter Pull**
- [ ] "Pull newsletters" button triggers Gmail fetch
- [ ] Toggle "Include last 7 days" correctly filters emails
- [ ] Scan limit dropdown (50/100/200) is respected
- [ ] Loading skeleton cards appear while processing
- [ ] Status line shows "Last pull: X min ago. Imported: Y items"
- [ ] No duplicate items created (fingerprint dedup works)
- [ ] Gmail not connected shows error with link to Settings

### **2. Content Extraction**
- [ ] Newsletter with 3 articles extracts 3 separate items
- [ ] Newsletter with 1 article extracts 1 item
- [ ] Unsubscribe/privacy/social links are ignored
- [ ] Article titles extracted correctly
- [ ] URLs captured correctly
- [ ] Excerpt text is 1-4 lines (not full email)

### **3. Scoring & Ranking**
- [ ] Top 5 shows highest relevance scores
- [ ] Items matching HIGH focus areas score higher
- [ ] Items with avoid keywords ("crypto", "NFT") score very low or excluded
- [ ] Relevance score displays as percentage (0-100%)
- [ ] "Why this was chosen" shows AI reasoning (if available)
- [ ] Max 2 items per source in Top 5

### **4. Snippet/Hook Generation**
- [ ] Snippet is 2-3 sentences, no hype language
- [ ] Hook is ONE strong opener line
- [ ] No banned phrases appear ("game-changing", "unlock", etc.)
- [ ] Voice matches Meredith's style (first person "I", clear, grounded)
- [ ] Tags are 0-3 from content pillar list only
- [ ] Tags match the content relevantly

### **5. Top 5 Cards**
- [ ] Shows title, source, date, snippet, hook, tags
- [ ] Relevance bar displays correctly (0-100%)
- [ ] "Why this was chosen" collapses/expands
- [ ] "Send to Wizard" button works
- [ ] "Save to Ideas" button works
- [ ] "Open original" link opens URL (if present)
- [ ] Dismiss "X" removes card immediately

### **6. Inbox Section (Remaining Items)**
- [ ] Shows all items not in Top 5 with status=new
- [ ] Search filters by title/snippet/tags/source
- [ ] Filter by Source dropdown works
- [ ] Filter by Tag dropdown works
- [ ] Filter by Type (Newsletter/URL/Text) works
- [ ] Sort by Relevance shows high scores first
- [ ] Sort by Newest shows recent dates first
- [ ] Clicking card opens preview modal
- [ ] Compact cards show all essential info

### **7. Preview Modal**
- [ ] Shows full title, source, date
- [ ] Jamie's summary (snippet) displayed
- [ ] Suggested hook in highlighted box
- [ ] Original excerpt shown (for newsletters)
- [ ] Pasted text shown (for quick_add_text)
- [ ] Link opens original URL
- [ ] Content pillar tags displayed
- [ ] "Dismiss" button closes modal + dismisses item
- [ ] "Save to Ideas" closes modal + saves item
- [ ] "Send to Wizard" closes modal + opens wizard

### **8. Quick Add - URL**
- [ ] Modal opens from "Quick Add" button
- [ ] URL tab active by default
- [ ] Paste URL field accepts valid URLs
- [ ] "Add to Inbox" disabled if URL empty
- [ ] Loading state shows "Creating card..."
- [ ] AI generates snippet/hook/tags from URL
- [ ] New card appears in inbox with "Manual" source
- [ ] Modal closes after successful add
- [ ] Toast confirms "Added to inbox"

### **9. Quick Add - Text**
- [ ] Text tab switch works
- [ ] Textarea accepts pasted text
- [ ] "Add to Inbox" disabled if text empty
- [ ] AI generates snippet/hook/tags from text
- [ ] Source text preserved in item
- [ ] Preview modal shows pasted text
- [ ] Modal closes after add
- [ ] Toast confirms success

### **10. Save to Ideas**
- [ ] Item status changes from 'new' to 'saved'
- [ ] ContentItem created with status='idea'
- [ ] Item disappears from inbox immediately
- [ ] Item appears in main Gallery view
- [ ] All fields populated: title(hook), notes(snippet), tags, sourceUrl, etc.
- [ ] Toast shows "Added to Ideas"

### **11. Send to Wizard**
- [ ] Item saved to ideas (status='idea')
- [ ] Item removed from inbox
- [ ] Wizard modal opens
- [ ] Wizard pre-filled with: title(hook), notes(snippet), tags
- [ ] Source URL passed to wizard
- [ ] Blueprint auto-suggested based on tags
- [ ] Saving wizard updates the ContentItem
- [ ] Wizard close returns to Content page

### **12. Dismiss + Undo**
- [ ] Click "X" removes card immediately
- [ ] Toast shows "Dismissed" with "Undo" button
- [ ] Toast lasts exactly 15 seconds
- [ ] Clicking "Undo" within 15s restores card
- [ ] Card status reverts to 'new' on undo
- [ ] After 15s, dismissal is final (no restore)
- [ ] Item status in backend = 'dismissed'
- [ ] Gmail email NOT deleted

### **13. AI Preferences Modal**
- [ ] Modal opens from "AI Preferences" link
- [ ] Focus Areas tab shows all 8 focus areas
- [ ] Can edit focus area names
- [ ] Can change weight (HIGH/MEDIUM_HIGH/MEDIUM/LOW)
- [ ] Can edit keywords (comma-separated)
- [ ] Can add/remove focus areas
- [ ] Voice & Tone tab shows POV, tone rules, banned phrases
- [ ] Keywords tab shows prioritize/avoid lists
- [ ] Learning tab shows toggle + lookback count
- [ ] Save button persists to localStorage
- [ ] Changes immediately affect next pull

### **14. Settings Integration**
- [ ] Settings page shows "Newsletter Inbox" section
- [ ] Gmail connection status displays correctly
- [ ] "Connect Gmail" initiates OAuth flow
- [ ] After OAuth, status shows "Connected"
- [ ] "Disconnect" button clears connection
- [ ] Optional label field saves to settings
- [ ] Helper text explains feature

### **15. Integration with Existing Content**
- [ ] Inbox section appears ABOVE Gallery/Table views
- [ ] Gallery view still shows all content items
- [ ] Table view still works unchanged
- [ ] View switcher (Gallery/Table) still works
- [ ] New content wizard works for both inbox and manual creates
- [ ] Status filter includes "idea" items from inbox
- [ ] Content pillar tags display alongside user tags

### **16. Mobile Responsive**
- [ ] Top 5 stacks vertically on mobile
- [ ] Inbox cards stack vertically
- [ ] Filters collapse/work in mobile view
- [ ] Cards readable and tappable (min 44px touch targets)
- [ ] Preview modal scrollable on small screens
- [ ] Quick Add modal usable on mobile

### **17. Performance**
- [ ] Pulling 50 emails completes in <30s
- [ ] No UI freezing during processing
- [ ] Smooth scrolling with 50+ inbox items
- [ ] Search/filter instant (<100ms)
- [ ] AI calls happen in background (no blocking)

### **18. Error Handling**
- [ ] Gmail API errors show user-friendly message
- [ ] AI API errors don't crash app
- [ ] Network errors show retry option
- [ ] Invalid URLs in Quick Add show validation
- [ ] Duplicate detection prevents identical cards
- [ ] Console logs errors for debugging

---

## 🎯 PRIORITY ORDER (For Builder)

**Phase 1 - Core Foundation (Week 1):**
1. ✅ AI Profile types + storage
2. ✅ InboxItem types
3. ✅ ContentIdeasInbox component (UI shell)
4. ✅ InboxItemCard component
5. ✅ Basic state management

**Phase 2 - Gmail Integration (Week 2):**
6. ✅ Gmail OAuth setup
7. ✅ Newsletter fetch logic
8. ✅ Preprocessing (strip boilerplate)
9. ✅ AI extraction (blocks → items)
10. ✅ Deduplication

**Phase 3 - Scoring & Ranking (Week 2):**
11. ✅ Deterministic scoring algorithm
12. ✅ Top 5 selection logic
13. ✅ Snippet/hook generation
14. ✅ Display in UI

**Phase 4 - Actions & Modals (Week 3):**
15. ✅ Preview modal
16. ✅ Quick Add modal
17. ✅ AI Preferences modal
18. ✅ Save to Ideas
19. ✅ Send to Wizard
20. ✅ Dismiss + undo

**Phase 5 - Polish (Week 3-4):**
21. ✅ Settings integration
22. ✅ Responsive design
23. ✅ Loading/error states
24. ✅ QA testing
25. ✅ Performance optimization

---

## 🔗 REFERENCE DOCUMENTS

All implementation details are in these files:
1. `/JAMIE_INTEGRATION_ARCHITECTURE.md` - Overall architecture
2. `/NEWSLETTER_EXTRACTION_IMPLEMENTATION.md` - Extraction + scoring
3. `/SNIPPET_HOOK_STATUS_IMPLEMENTATION.md` - Generation + status flows
4. `/MASTER_BUILDER_SPEC.md` - This document

---

## ✅ BUILDER ACCEPTANCE CRITERIA

**This feature is DONE when:**

1. ✅ I can click "Pull newsletters" and see Top 5 + Inbox populate
2. ✅ Each card shows snippet + hook in Meredith's voice
3. ✅ I can click "Send to Wizard" and it opens pre-filled
4. ✅ I can click "Save to Ideas" and it appears in Gallery
5. ✅ I can dismiss items with 15s undo
6. ✅ I can Quick Add a URL or text
7. ✅ I can edit AI Preferences and see ranking change
8. ✅ Inbox section sits cleanly above existing Content page
9. ✅ All QA checklist items pass
10. ✅ No existing Content page features broken

---

**END OF MASTER BUILDER SPEC** 🎉

Copy this entire document + Part 1 to Figma Builder for implementation.