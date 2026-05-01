# Content Ideas Inbox - Complete Builder Specification
## Copy/Paste to Figma Builder - Everything in One Document

---

## 🎯 PROJECT OVERVIEW

**BUILD:** "Content Ideas Inbox" section at the TOP of the existing Content page.

**PURPOSE:** 
- Pull newsletter emails from dedicated Gmail account on demand
- Extract individual story items from each newsletter
- Rank by relevance to Meredith's expertise (digital health/patient experience)
- Generate snippet (2-3 sentences) + hook (1 strong opener line) for each
- Push items into existing content workflow as "ideas"

**CRITICAL:** 
- This is NOT a separate page - it's a section at the top of the existing Content page
- Everything else on Content page remains unchanged
- AI assistant is named "Jamie" - uses plum color (#5e2350) for all Jamie-specific UI

---

## ✅ V1 ACCEPTANCE CRITERIA (10 MUST-PASS)

### **1. Inbox is on the existing Content page**
"Content Ideas Inbox" renders at the **top** of the existing Content page (not a new page).

### **2. Gmail connection gating**
- If Gmail isn't connected: clear empty state + "Connect Gmail" CTA.
- Pull cannot run without a connection; errors are readable.

### **3. Manual pull works**
Clicking "Pull newsletters" fetches emails based on:
- Last 7 days toggle (if on)
- Scan limit dropdown
- UI shows: "Last pull: {time}. Imported: {count} items."

### **4. Multi-item extraction from one newsletter**
A newsletter email with multiple links produces **multiple content cards** (not just one blob).

### **5. Top 5 ranked list appears**
"Top 5 for you" shows up to 5 items ranked by relevance.
- Each Top 5 card displays: title, source, date (received), snippet, hook, tags.

### **6. Idempotency / no duplicates**
Pulling twice with the same emails in scope does **not** create duplicate cards.

### **7. Save to Ideas works end-to-end**
Clicking "Save to Ideas":
- Removes the card from staging inbox immediately
- Sets status to `ideas`
- Creates/links an item in the existing system's Ideas status with carried fields (title, date, url, snippet, hook, tags).

### **8. Send to Wizard works end-to-end**
Clicking "Send to Wizard":
- Performs the same "Save to Ideas" transition
- Then opens the existing wizard with payload prefilled.

### **9. Dismiss + Undo is correct**
Clicking "X" dismiss:
- Card disappears immediately
- Toast with "Undo" appears for **exactly 15 seconds**
- Undo restores the card and status to `new`
- After 15 seconds, dismissed items stay dismissed (including after refresh).

### **10. Quick Add creates usable cards**
Quick Add URL and Quick Add Text both:
- Create a new staging card (status=`new`)
- Generate snippet/hook/tags
- Appear in inbox immediately.

---

## 📊 ARCHITECTURE INTEGRATION

### **Where This Fits:**

```
Content Page (existing)
├── Content Ideas Inbox (NEW - top section)
│   ├── Top 5 for you
│   ├── Inbox (remaining items)
│   └── Quick Add modal
├── Gallery View (existing - unchanged)
└── Table View (existing - unchanged)
```

### **Data Flow:**

```
Gmail Newsletter
    ↓
Manual Pull (user clicks button)
    ↓
Extract items → Score → Rank → Generate snippet/hook
    ↓
Content Ideas Inbox (status: new)
    ↓
User Actions:
├─ Save to Ideas → ContentItem (status: idea) → Main Gallery
├─ Send to Wizard → Save as idea + Open wizard with pre-filled data
└─ Dismiss → 15s undo → Final dismissal
```

---

## 🗂️ DATA MODEL

### **AI Profile (Store in localStorage + optional Supabase)**

```typescript
// /types/AIProfile.ts

export interface AIProfile {
  profile_id: string;
  owner_name: string;
  assistant_name: string;
  last_updated: string; // YYYY-MM-DD
  audience_default: string;
  ranking_intent: string;
  interest_profile: {
    focus_areas: Array<{
      id: string;
      name: string;
      weight: 'HIGH' | 'MEDIUM_HIGH' | 'MEDIUM' | 'LOW';
      keywords: string[];
    }>;
    prioritize_keywords: string[];
    avoid_keywords: string[];
  };
  voice_profile: {
    pov_rules: {
      default_pov: string;
      avoid_we_language: boolean;
    };
    tone_rules: string[];
    style_preferences: string[];
    banned_phrases: string[];
    banned_tones: string[];
    verbs_preferred: string[];
  };
  tagging_rules: {
    tag_namespace: string;
    max_tags: number;
    tags: string[];
  };
  learning_settings: {
    use_recent_published_content_for_style: boolean;
    recent_published_lookback_count: number;
  };
}

// Default profile to seed on first load:
export const AI_PROFILE_V1: AIProfile = {
  "profile_id": "AI_PROFILE_V1",
  "owner_name": "Meredith",
  "assistant_name": "Jamie",
  "last_updated": "2024-12-01",
  "audience_default": "Digital health and health tech teams building patient-centered solutions (founders, product, design, clinical, ops).",
  "ranking_intent": "Rank newsletter/story items by relevance to Meredith's wheelhouse and current priorities, then generate a short snippet + a hook that matches Meredith's voice.",
  "interest_profile": {
    "focus_areas": [
      {
        "id": "speaking_patient",
        "name": "Speaking \"Patient\" (language, communication, tone)",
        "weight": "HIGH",
        "keywords": [
          "patient communication",
          "tone",
          "language",
          "plain language",
          "health literacy",
          "patient instructions",
          "messaging",
          "friction in communication",
          "clinical communication",
          "trust"
        ]
      },
      {
        "id": "fit_real_care_journeys",
        "name": "Fit health tech into real care journeys",
        "weight": "HIGH",
        "keywords": [
          "care journey",
          "care continuum",
          "workflow",
          "patient routines",
          "care coordination",
          "navigation",
          "portals",
          "handoffs",
          "referrals",
          "follow-up",
          "patient burden",
          "adoption",
          "retention"
        ]
      },
      {
        "id": "full_patient_ecosystem",
        "name": "The full patient experience ecosystem (hidden work + lived reality)",
        "weight": "HIGH",
        "keywords": [
          "administrative burden",
          "prior authorization",
          "insurance",
          "paperwork",
          "appointments",
          "scheduling",
          "access",
          "fragmentation",
          "self-advocacy",
          "tracking",
          "caregiver",
          "fatigue",
          "brain fog",
          "logistics",
          "financial stress"
        ]
      },
      {
        "id": "empathy_as_strategy",
        "name": "Empathy as strategy (trust, engagement, retention)",
        "weight": "HIGH",
        "keywords": [
          "trust",
          "engagement",
          "activation",
          "behavior change",
          "adherence",
          "retention",
          "patient confidence",
          "emotional context",
          "patient fear",
          "patient stress",
          "relationship"
        ]
      },
      {
        "id": "co_design_hcd",
        "name": "Co-design & human-centered design in health tech",
        "weight": "MEDIUM_HIGH",
        "keywords": [
          "co-design",
          "human-centered design",
          "HCD",
          "UX research",
          "patient interviews",
          "workshops",
          "prototype testing",
          "patient advisory board",
          "feedback loops"
        ]
      },
      {
        "id": "participatory_medicine",
        "name": "Patients as equal partners / participatory medicine",
        "weight": "MEDIUM_HIGH",
        "keywords": [
          "participatory medicine",
          "shared decision-making",
          "patient partnership",
          "patient advisor",
          "patient voice",
          "co-creation",
          "patient governance"
        ]
      },
      {
        "id": "multi_stakeholder_alignment",
        "name": "Multi-stakeholder collaboration & alignment",
        "weight": "MEDIUM",
        "keywords": [
          "cross-functional",
          "clinical",
          "product",
          "design",
          "operations",
          "alignment",
          "handoffs",
          "communication breakdowns",
          "stakeholder incentives"
        ]
      },
      {
        "id": "what_good_care_looks_like",
        "name": "What good patient care looks like (and what it doesn't)",
        "weight": "MEDIUM",
        "keywords": [
          "patient experience",
          "respect",
          "dismissal",
          "safety",
          "support",
          "care quality",
          "compassion",
          "relationship-based care"
        ]
      }
    ],
    "prioritize_keywords": [
      "patient experience",
      "patient engagement",
      "digital health",
      "health tech",
      "care coordination",
      "navigation",
      "trust",
      "adoption",
      "retention",
      "human-centered design",
      "co-design"
    ],
    "avoid_keywords": [
      "crypto",
      "web3",
      "metaverse",
      "NFT",
      "sports betting",
      "generic AI hype",
      "unrelated biotech finance"
    ]
  },
  "voice_profile": {
    "pov_rules": {
      "default_pov": "first_person_singular",
      "avoid_we_language": true
    },
    "tone_rules": [
      "Clear and unfussy.",
      "Human and grounded.",
      "Strategic, not salesy.",
      "Warm without melodrama.",
      "Short and direct by default; expand only when asked."
    ],
    "style_preferences": [
      "Scannable formatting: short paragraphs, lists when helpful.",
      "Openers should feel like Meredith's voice (not generic thought-leadership).",
      "Concrete, specific language over vague generalities."
    ],
    "banned_phrases": [
      "game-changing",
      "unlock",
      "fast-evolving landscape",
      "transforming healthcare at scale"
    ],
    "banned_tones": [
      "motivational",
      "hype-y",
      "corporate jargon",
      "influencer tone",
      "cutesy",
      "patronizing",
      "dramatic"
    ],
    "verbs_preferred": [
      "help",
      "support",
      "align",
      "sharpen",
      "strengthen",
      "clarify",
      "translate"
    ]
  },
  "tagging_rules": {
    "tag_namespace": "content_pillars",
    "max_tags": 3,
    "tags": [
      "speaking_patient",
      "fit_real_care_journeys",
      "full_patient_ecosystem",
      "empathy_as_strategy",
      "co_design_hcd",
      "participatory_medicine",
      "multi_stakeholder_alignment",
      "what_good_care_looks_like"
    ]
  },
  "learning_settings": {
    "use_recent_published_content_for_style": false,
    "recent_published_lookback_count": 20
  }
};
```

### **InboxItem (Staging items)**

```typescript
// /types/InboxItem.ts

export interface InboxItem {
  // Identity
  id: string;
  item_fingerprint: string; // SHA-256 for deduplication
  
  // Source
  source_type: 'newsletter' | 'quick_add_url' | 'quick_add_text';
  source_name: string; // Newsletter sender name or "Manual"
  source_url?: string;
  source_text?: string; // For quick_add_text
  parent_email_id?: string; // Gmail message ID
  
  // Dates
  received_at?: Date; // For newsletters
  created_at: Date; // All items
  extracted_at: Date; // When processed
  
  // Status
  status: 'new' | 'saved' | 'dismissed';
  dismissed_at?: Date; // For 15s undo tracking
  
  // AI-generated content
  snippet: string; // 2-3 sentences
  hook: string; // 1 strong opener line
  suggestedTags: string[]; // 0-3 content pillar tags
  relevance_score: number; // 0-100
  
  // Original extracted content
  title: string;
  extracted_excerpt?: string; // Original text from newsletter
  
  // Debug/analytics
  matched_focus_areas?: string[];
  matched_keywords?: string[];
  scoring_breakdown?: {
    high_focus_hits: number;
    medium_high_hits: number;
    medium_hits: number;
    prioritize_hits: number;
    avoid_hits: number;
    penalties: number;
  };
  ai_reason?: string; // One-sentence explanation from AI rerank
}
```

### **Modified ContentItem (existing interface - ADD these fields)**

```typescript
// /types/ContentItem.ts (ADD to existing)

export interface ContentItem {
  // ... ALL EXISTING FIELDS (keep unchanged)
  
  // NEW FIELDS for inbox integration:
  sourceType?: 'manual' | 'newsletter' | 'url' | 'quick_text' | 'idea_inbox';
  sourceUrl?: string;
  relevanceScore?: number; // 0-100 from Jamie
  jamieSnippet?: string; // AI-generated snippet
  jamieHook?: string; // AI-generated hook
  contentPillarTags?: string[]; // Separate from user tags
}
```

---

## 🎨 UI SPECIFICATION

### **Content Page Layout (Modified)**

```
┌────────────────────────────────────────────────────────────┐
│ CONTENT PAGE                                               │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ ┌─ CONTENT IDEAS INBOX ─────────────────────────────────┐ │
│ │  [Pull newsletters] [Quick Add]     [AI Preferences]  │ │
│ │  Last pull: 2 min ago. Imported: 12 items.            │ │
│ │                                                        │ │
│ │  ── Top 5 for you ──                                  │ │
│ │  [Card] [Card] [Card] [Card] [Card]                   │ │
│ │                                                        │ │
│ │  ── Inbox (7 more) ──                                 │ │
│ │  Search: [...] Filter: [Source▼] [Tag▼] Sort: [▼]    │ │
│ │  [Card] [Card] [Card] ...                             │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                            │
│ [Gallery View / Table View toggle]                        │
│                                                            │
│ ┌─ EXISTING CONTENT GALLERY ────────────────────────────┐ │
│ │  [Content cards...]                                    │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### **Inbox Section Header**

```typescript
// /components/ContentIdeasInbox.tsx

<div className="content-ideas-inbox">
  {/* Header */}
  <div className="inbox-header">
    <h2 className="text-2xl">Content Ideas Inbox</h2>
    
    <div className="actions flex gap-2">
      <button 
        onClick={handlePullNewsletters}
        className="btn-primary bg-[#5e2350]"
        disabled={pulling}
      >
        {pulling ? 'Scanning newsletters...' : 'Pull newsletters'}
      </button>
      
      <button 
        onClick={() => setShowQuickAdd(true)}
        className="btn-secondary"
      >
        Quick Add
      </button>
      
      <button 
        onClick={() => setShowAIPreferences(true)}
        className="btn-link text-[#5e2350]"
      >
        ⚙️ AI Preferences
      </button>
    </div>
  </div>
  
  {/* Optional controls */}
  <div className="controls flex gap-4 items-center mt-2">
    <label className="flex items-center gap-2">
      <input 
        type="checkbox" 
        checked={includeLast7Days}
        onChange={(e) => setIncludeLast7Days(e.target.checked)}
      />
      Include last 7 days
    </label>
    
    <select 
      value={scanLimit}
      onChange={(e) => setScanLimit(parseInt(e.target.value))}
    >
      <option value={50}>Scan limit: 50</option>
      <option value={100}>Scan limit: 100</option>
      <option value={200}>Scan limit: 200</option>
    </select>
  </div>
  
  {/* Status line */}
  {lastPullTime && (
    <div className="status-line text-sm text-gray-600 mt-2">
      Last pull: {formatRelativeTime(lastPullTime)}. 
      Imported: {lastPullCount} items.
    </div>
  )}
</div>
```

### **Top 5 Card (Full-Featured)**

```typescript
// /components/InboxItemCard.tsx

interface InboxItemCardProps {
  item: InboxItem;
  variant: 'top5' | 'compact';
  onSaveToIdeas: () => void;
  onSendToWizard: () => void;
  onDismiss: () => void;
  onOpenOriginal?: () => void;
}

export function InboxItemCard({ 
  item, 
  variant,
  onSaveToIdeas,
  onSendToWizard,
  onDismiss,
  onOpenOriginal
}: InboxItemCardProps) {
  const [showReason, setShowReason] = useState(false);
  
  return (
    <div className={`inbox-card ${variant === 'top5' ? 'p-6' : 'p-4'} border rounded-lg bg-white`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className={variant === 'top5' ? 'text-lg font-semibold' : 'text-base font-medium'}>
            {item.title}
          </h3>
          <div className="flex gap-3 text-sm text-gray-600 mt-1">
            <span className="flex items-center gap-1">
              📧 {item.source_name}
            </span>
            <span>
              {formatDate(item.received_at || item.created_at)}
            </span>
          </div>
        </div>
        
        <button 
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
      
      {/* Snippet */}
      <div className="snippet text-gray-700 mb-3">
        {item.snippet}
      </div>
      
      {/* Hook */}
      <div className="hook bg-[#f5fafb] border-l-4 border-[#5e2350] p-3 mb-3">
        <div className="text-xs text-[#5e2350] uppercase tracking-wide mb-1">
          Suggested Hook
        </div>
        <div className="text-gray-900 italic">
          "{item.hook}"
        </div>
      </div>
      
      {/* Tags */}
      {item.suggestedTags.length > 0 && (
        <div className="tags flex gap-2 mb-3">
          {item.suggestedTags.map(tag => (
            <span 
              key={tag}
              className="px-2 py-1 bg-[#5e2350]/10 text-[#5e2350] rounded text-xs"
            >
              {tag.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      )}
      
      {/* Relevance score (Top 5 only) */}
      {variant === 'top5' && (
        <div className="relevance mb-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-[#5e2350] h-2 rounded-full"
                style={{ width: `${item.relevance_score}%` }}
              />
            </div>
            <span className="text-sm text-gray-600">
              {item.relevance_score}% match
            </span>
          </div>
        </div>
      )}
      
      {/* Why this was chosen (collapsible) */}
      {variant === 'top5' && item.ai_reason && (
        <button 
          onClick={() => setShowReason(!showReason)}
          className="text-sm text-[#5e2350] mb-3"
        >
          {showReason ? '▼' : '▶'} Why this was chosen
        </button>
      )}
      {showReason && item.ai_reason && (
        <div className="reason text-sm text-gray-600 italic mb-3">
          {item.ai_reason}
        </div>
      )}
      
      {/* Actions */}
      <div className="actions flex gap-2">
        <button 
          onClick={onSendToWizard}
          className="btn-primary bg-[#5e2350] flex-1"
        >
          Send to Wizard
        </button>
        
        <button 
          onClick={onSaveToIdeas}
          className="btn-secondary flex-1"
        >
          Save to Ideas
        </button>
        
        {item.source_url && onOpenOriginal && (
          <button 
            onClick={onOpenOriginal}
            className="btn-tertiary"
            title="Open original"
          >
            🔗
          </button>
        )}
      </div>
    </div>
  );
}
```

### **Inbox Section (Remaining Items)**

```typescript
// /components/ContentIdeasInbox.tsx (continued)

<div className="inbox-section mt-8">
  <div className="flex justify-between items-center mb-4">
    <h3 className="text-xl">
      Inbox ({remainingItems.length} more)
    </h3>
    
    <div className="controls flex gap-2">
      {/* Search */}
      <input
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-64 px-3 py-2 border rounded"
      />
      
      {/* Filter by source */}
      <select
        value={filterSource}
        onChange={(e) => setFilterSource(e.target.value)}
        className="px-3 py-2 border rounded"
      >
        <option value="">All sources</option>
        {uniqueSources.map(source => (
          <option key={source} value={source}>{source}</option>
        ))}
      </select>
      
      {/* Filter by tag */}
      <select
        value={filterTag}
        onChange={(e) => setFilterTag(e.target.value)}
        className="px-3 py-2 border rounded"
      >
        <option value="">All tags</option>
        {aiProfile.tagging_rules.tags.map(tag => (
          <option key={tag} value={tag}>
            {tag.replace(/_/g, ' ')}
          </option>
        ))}
      </select>
      
      {/* Filter by type */}
      <select
        value={filterType}
        onChange={(e) => setFilterType(e.target.value)}
        className="px-3 py-2 border rounded"
      >
        <option value="">All types</option>
        <option value="newsletter">Newsletter</option>
        <option value="quick_add_url">Quick Add URL</option>
        <option value="quick_add_text">Quick Add Text</option>
      </select>
      
      {/* Sort */}
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="px-3 py-2 border rounded"
      >
        <option value="relevance">Sort: Relevance</option>
        <option value="newest">Sort: Newest</option>
      </select>
    </div>
  </div>
  
  {/* Compact cards grid */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {filteredItems.map(item => (
      <div 
        key={item.id}
        onClick={() => setPreviewItem(item)}
        className="cursor-pointer"
      >
        <InboxItemCard
          item={item}
          variant="compact"
          onSaveToIdeas={() => handleSaveToIdeas(item)}
          onSendToWizard={() => handleSendToWizard(item)}
          onDismiss={() => handleDismiss(item)}
          onOpenOriginal={item.source_url ? () => window.open(item.source_url, '_blank') : undefined}
        />
      </div>
    ))}
  </div>
</div>
```

### **Preview Modal**

```typescript
// /components/InboxItemPreviewModal.tsx

export function InboxItemPreviewModal({
  item,
  isOpen,
  onClose,
  onSaveToIdeas,
  onSendToWizard,
  onDismiss
}: {
  item: InboxItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveToIdeas: () => void;
  onSendToWizard: () => void;
  onDismiss: () => void;
}) {
  if (!item) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{item.title}</DialogTitle>
          <div className="flex gap-3 text-sm text-gray-600">
            <span>📧 {item.source_name}</span>
            <span>{formatDate(item.received_at || item.created_at)}</span>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Snippet */}
          <div>
            <h4 className="text-sm uppercase tracking-wide text-[#5e2350] mb-2">
              Jamie's Summary
            </h4>
            <p className="text-gray-700">{item.snippet}</p>
          </div>
          
          {/* Hook */}
          <div className="bg-[#f5fafb] border-l-4 border-[#5e2350] p-4">
            <h4 className="text-sm uppercase tracking-wide text-[#5e2350] mb-2">
              Suggested Hook
            </h4>
            <p className="italic">"{item.hook}"</p>
          </div>
          
          {/* Original content */}
          {item.source_type === 'newsletter' && item.extracted_excerpt && (
            <div>
              <h4 className="text-sm uppercase tracking-wide text-gray-600 mb-2">
                From Newsletter
              </h4>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                {item.extracted_excerpt}
              </p>
            </div>
          )}
          
          {item.source_type === 'quick_add_text' && item.source_text && (
            <div>
              <h4 className="text-sm uppercase tracking-wide text-gray-600 mb-2">
                Pasted Text
              </h4>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded whitespace-pre-wrap">
                {item.source_text}
              </p>
            </div>
          )}
          
          {/* Link */}
          {item.source_url && (
            <div>
              <a 
                href={item.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#5e2350] hover:underline text-sm"
              >
                🔗 Open original →
              </a>
            </div>
          )}
          
          {/* Tags */}
          {item.suggestedTags.length > 0 && (
            <div>
              <h4 className="text-sm uppercase tracking-wide text-gray-600 mb-2">
                Content Pillars
              </h4>
              <div className="flex gap-2">
                {item.suggestedTags.map(tag => (
                  <span 
                    key={tag}
                    className="px-3 py-1 bg-[#5e2350]/10 text-[#5e2350] rounded-full text-sm"
                  >
                    {tag.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex gap-2">
          <button onClick={onDismiss} className="btn-tertiary">
            Dismiss
          </button>
          <button onClick={onSaveToIdeas} className="btn-secondary">
            Save to Ideas
          </button>
          <button onClick={onSendToWizard} className="btn-primary bg-[#5e2350]">
            Send to Wizard
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

## (Continuing in next message due to length...)