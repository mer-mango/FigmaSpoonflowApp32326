# Jamie AI Integration Architecture
## How the "Head" (AI Profile + Content Inbox) Connects to the "Body" (Content Creation App)

---

## 🧠 WHAT JAMIE IS (Now I Understand!)

Jamie is **TWO interconnected systems**:

### **System 1: Content Ideas Inbox** (NEW - from ChatGPT)
- Ingests newsletters, URLs, quick text
- Ranks by relevance to Meredith's expertise
- Generates snippets + hooks in Meredith's voice
- Tags with content pillars
- Status: new → ideas → dismissed (with undo)

### **System 2: Writing Assistant** (EXISTING - what we planned)
- Helps write posts using blueprints
- Section-by-section guidance
- Uses Meredith's voice profile
- Platform-aware (LinkedIn/Substack)

**BOTH use the same AI_PROFILE_V1 for:**
- Voice rules (POV, tone, banned phrases)
- Focus areas (expertise profile)
- Tagging rules (content pillars)

---

## 🏗️ INTEGRATION ARCHITECTURE

### **New App Structure:**

```
App.tsx
├── AI Profile State (global)
│   ├── aiProfile (AI_PROFILE_V1 JSON)
│   └── updateAIProfile()
│
├── Content Items State (existing)
│   ├── allContentItems
│   ├── publishedContent
│   └── ideaItems (NEW - from inbox)
│
├── Main Navigation
│   ├── Ideas Inbox (NEW) ← System 1
│   ├── Content (existing) ← System 2
│   └── Settings
│
└── Shared Jamie Components
    ├── AIPreferencesModal (edit profile)
    └── AIKnowledgePanel (show what Jamie knows)
```

---

## 📊 DATA FLOW

### **Flow 1: Newsletter → Content Ideas Inbox → New Content**

```
1. User forwards newsletter to inbox
   ↓
2. Jamie extracts items using AI_PROFILE_V1.interest_profile
   ↓
3. Jamie ranks Top 5 by relevance scores
   ↓
4. Jamie generates snippet + hook using AI_PROFILE_V1.voice_profile
   ↓
5. Jamie tags using AI_PROFILE_V1.tagging_rules
   ↓
6. Items appear in "Ideas Inbox" view (status: new)
   ↓
7. User actions:
   - "Save to Ideas" → adds to Content Items (status: idea)
   - "Send to Wizard" → opens NewContentModal with pre-filled data
   - "Dismiss" → marks dismissed (15s undo window)
```

### **Flow 2: Content Item → Writing with Jamie**

```
1. User creates/edits content item
   ↓
2. In editor, Jamie provides writing help
   ↓
3. Jamie uses AI_PROFILE_V1.voice_profile for suggestions
   ↓
4. Jamie references AI_PROFILE_V1.focus_areas for relevance
   ↓
5. Content saved with tags from AI_PROFILE_V1.tagging_rules
```

---

## 🔌 INTEGRATION POINTS (Where Head Meets Body)

### **Point 1: Shared AI Profile State**

```typescript
// App.tsx - Global state for AI Profile

interface AIProfile {
  profile_id: string;
  owner_name: string;
  assistant_name: string;
  last_updated: string;
  audience_default: string;
  ranking_intent: string;
  interest_profile: InterestProfile;
  voice_profile: VoiceProfile;
  tagging_rules: TaggingRules;
  learning_settings: LearningSettings;
}

const [aiProfile, setAIProfile] = useState<AIProfile>(() => {
  const saved = localStorage.getItem('aiProfile');
  if (saved) return JSON.parse(saved);
  return AI_PROFILE_V1; // Default from batch 1
});

// Persist changes
useEffect(() => {
  localStorage.setItem('aiProfile', JSON.stringify(aiProfile));
}, [aiProfile]);
```

**Pass to all Jamie components:**
```typescript
<ContentIdeasInbox aiProfile={aiProfile} onUpdateProfile={setAIProfile} />
<AIWritingAssistant aiProfile={aiProfile} />
<AIPreferencesModal aiProfile={aiProfile} onSave={setAIProfile} />
```

---

### **Point 2: ContentItem Interface (Modified)**

```typescript
// Add these fields to existing ContentItem interface

export interface ContentItem {
  // EXISTING FIELDS (keep all of these)
  id: string;
  title: string;
  platform: 'LinkedIn Post' | 'LinkedIn Article' | 'Substack Post';
  length: string;
  blueprintFamily: 'Story' | 'Education' | 'Perspective' | 'Engagement' | 'Announcement';
  blueprintSubtype: string;
  status: 'idea' | 'outlining' | 'drafting' | 'editing' | 'ready to schedule' | 'scheduled' | 'published' | 'archived';
  tags: string[];
  scheduledDate?: string;
  scheduledTime?: string;
  lastUpdated: Date;
  createdOn: Date;
  wordCount: number;
  content: string;
  outline?: string;
  notes?: string;
  workingOn?: boolean;
  workingOnOrder?: number;
  
  // NEW FIELDS for Jamie integration
  sourceType?: 'manual' | 'newsletter' | 'url' | 'quick_text' | 'idea_inbox'; // Where it came from
  sourceUrl?: string; // Original newsletter/URL if from inbox
  relevanceScore?: number; // 0-100 score from Jamie
  jamieSnippet?: string; // AI-generated snippet
  jamieHook?: string; // AI-generated hook
  contentPillarTags?: string[]; // Tags from AI_PROFILE_V1.tagging_rules (separate from user tags)
}
```

---

### **Point 3: New "Ideas Inbox" View**

```typescript
// /components/ContentIdeasInbox.tsx (NEW component)

interface InboxItem {
  id: string;
  sourceType: 'newsletter' | 'url' | 'quick_text';
  sourceUrl?: string;
  sourceText?: string;
  status: 'new' | 'saved' | 'dismissed';
  relevanceScore: number; // 0-100
  snippet: string; // AI-generated
  hook: string; // AI-generated  
  suggestedTags: string[]; // From AI_PROFILE_V1.tagging_rules
  extractedAt: Date;
  dismissedAt?: Date; // For 15s undo window
}

export function ContentIdeasInbox({ 
  aiProfile, 
  onCreateContent // Callback to create ContentItem
}: {
  aiProfile: AIProfile;
  onCreateContent: (item: Partial<ContentItem>) => void;
}) {
  const [inboxItems, setInboxItems] = useState<InboxItem[]>([]);
  
  // Actions
  const handleSaveToIdeas = (item: InboxItem) => {
    // Create ContentItem from InboxItem
    onCreateContent({
      title: item.hook,
      status: 'idea',
      sourceType: 'idea_inbox',
      sourceUrl: item.sourceUrl,
      relevanceScore: item.relevanceScore,
      jamieSnippet: item.snippet,
      jamieHook: item.hook,
      contentPillarTags: item.suggestedTags,
      notes: item.snippet,
    });
    
    // Mark inbox item as saved
    updateInboxItem(item.id, { status: 'saved' });
  };
  
  const handleSendToWizard = (item: InboxItem) => {
    // Same as above but also open NewContentModal
    onCreateContent({...});
    setShowWizard(true);
  };
  
  const handleDismiss = (item: InboxItem) => {
    updateInboxItem(item.id, { 
      status: 'dismissed',
      dismissedAt: new Date()
    });
    
    // Start 15s undo timer
    setTimeout(() => {
      if (item.status === 'dismissed') {
        // Permanently remove
        removeInboxItem(item.id);
      }
    }, 15000);
  };
  
  return (
    <div className="ideas-inbox">
      {/* UI for inbox items */}
    </div>
  );
}
```

**Connect in App.tsx:**
```typescript
const handleCreateFromInbox = (newContent: Partial<ContentItem>) => {
  const contentItem: ContentItem = {
    id: Date.now().toString(),
    title: newContent.title || 'Untitled',
    platform: 'LinkedIn Post', // Default
    length: 'Standard (250-500 words)',
    blueprintFamily: 'Perspective', // Could be suggested by Jamie
    status: 'idea',
    tags: [],
    contentPillarTags: newContent.contentPillarTags || [],
    createdOn: new Date(),
    lastUpdated: new Date(),
    wordCount: 0,
    content: '',
    notes: newContent.jamieSnippet || '',
    sourceType: newContent.sourceType,
    sourceUrl: newContent.sourceUrl,
    relevanceScore: newContent.relevanceScore,
    jamieSnippet: newContent.jamieSnippet,
    jamieHook: newContent.jamieHook,
    workingOn: false,
  };
  
  setAllContentItems([contentItem, ...allContentItems]);
};

// In render:
{currentPage === 'inbox' && (
  <ContentIdeasInbox 
    aiProfile={aiProfile}
    onCreateContent={handleCreateFromInbox}
  />
)}
```

---

### **Point 4: Modified ContentDetailModal (Inject Jamie)**

```typescript
// /components/content/ContentDetailModal.tsx

export function ContentDetailModal({
  content,
  isOpen,
  onClose,
  onSave,
  onDelete,
  aiProfile, // ← NEW prop
}: {
  content: ContentItem;
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: ContentItem) => void;
  onDelete: (id: string) => void;
  aiProfile: AIProfile; // ← NEW
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        {/* Existing content editor UI */}
        
        {/* NEW: Show Jamie's context if from inbox */}
        {content.sourceType === 'idea_inbox' && (
          <div className="jamie-context">
            <h4>Jamie's Take</h4>
            <div className="relevance-score">
              Relevance: {content.relevanceScore}/100
            </div>
            <div className="snippet">
              <strong>Why this matters:</strong>
              <p>{content.jamieSnippet}</p>
            </div>
            <div className="suggested-hook">
              <strong>Suggested hook:</strong>
              <p>{content.jamieHook}</p>
            </div>
            <div className="tags">
              <strong>Content pillars:</strong>
              {content.contentPillarTags?.map(tag => (
                <span className="badge">{tag}</span>
              ))}
            </div>
          </div>
        )}
        
        {/* NEW: AI Writing Assistant */}
        <AIWritingAssistant
          content={content}
          aiProfile={aiProfile}
          onSuggestion={(text) => {
            // Insert suggestion into editor
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
```

---

### **Point 5: AI Writing Assistant (Uses Profile)**

```typescript
// /components/AIWritingAssistant.tsx

export function AIWritingAssistant({
  content,
  aiProfile,
  currentSection,
  onSuggestion,
}: {
  content: ContentItem;
  aiProfile: AIProfile;
  currentSection?: string;
  onSuggestion: (text: string) => void;
}) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  
  const getAIHelp = async () => {
    setLoading(true);
    
    // Build system prompt from aiProfile
    const systemPrompt = buildSystemPrompt(aiProfile, content);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { 
          role: "user", 
          content: `Help me write the ${currentSection} section. Context: ${prompt}`
        }
      ],
      temperature: 0.7,
    });
    
    onSuggestion(response.choices[0].message.content);
    setLoading(false);
  };
  
  return (
    <div className="ai-assistant">
      <h4>✨ Jamie's Writing Help</h4>
      <textarea 
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="What do you want to write about?"
      />
      <button onClick={getAIHelp} disabled={loading}>
        {loading ? 'Jamie is thinking...' : 'Get Suggestion'}
      </button>
    </div>
  );
}

// Helper function
function buildSystemPrompt(aiProfile: AIProfile, content: ContentItem): string {
  const { voice_profile, interest_profile } = aiProfile;
  
  return `
You are ${aiProfile.assistant_name}, AI writing assistant for ${aiProfile.owner_name}.

AUDIENCE:
${aiProfile.audience_default}

VOICE RULES:
- POV: ${voice_profile.pov_rules.default_pov}
${voice_profile.pov_rules.avoid_we_language ? '- NEVER use "we" language - always use "I"' : ''}
- Tone: ${voice_profile.tone_rules.join(' ')}
- Style: ${voice_profile.style_preferences.join(' ')}

BANNED PHRASES: ${voice_profile.banned_phrases.join(', ')}
BANNED TONES: ${voice_profile.banned_tones.join(', ')}

PREFERRED VERBS: ${voice_profile.verbs_preferred.join(', ')}

FOCUS AREAS (your expertise):
${interest_profile.focus_areas
  .filter(f => f.weight === 'HIGH')
  .map(f => `- ${f.name}`)
  .join('\n')}

CURRENT CONTENT CONTEXT:
- Platform: ${content.platform}
- Blueprint: ${content.blueprintFamily}
${content.jamieSnippet ? `- Core idea: ${content.jamieSnippet}` : ''}
${content.contentPillarTags ? `- Content pillars: ${content.contentPillarTags.join(', ')}` : ''}

Write in Meredith's voice - clear, unfussy, human, and strategic.
  `;
}
```

---

### **Point 6: AI Preferences Modal (Edit Profile)**

```typescript
// /components/AIPreferencesModal.tsx

export function AIPreferencesModal({
  aiProfile,
  isOpen,
  onClose,
  onSave,
}: {
  aiProfile: AIProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: AIProfile) => void;
}) {
  const [localProfile, setLocalProfile] = useState(aiProfile);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Jamie's AI Preferences</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="focus">
          <TabsList>
            <TabsTrigger value="focus">Focus Areas</TabsTrigger>
            <TabsTrigger value="voice">Voice & Tone</TabsTrigger>
            <TabsTrigger value="keywords">Keywords</TabsTrigger>
            <TabsTrigger value="learning">Learning</TabsTrigger>
          </TabsList>
          
          {/* Focus Areas Tab */}
          <TabsContent value="focus">
            <div className="space-y-4">
              {localProfile.interest_profile.focus_areas.map((area, i) => (
                <div key={area.id} className="border p-4 rounded">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={area.name}
                        onChange={(e) => {
                          const updated = [...localProfile.interest_profile.focus_areas];
                          updated[i].name = e.target.value;
                          setLocalProfile({
                            ...localProfile,
                            interest_profile: {
                              ...localProfile.interest_profile,
                              focus_areas: updated
                            }
                          });
                        }}
                        className="text-lg font-semibold w-full"
                      />
                      
                      <select
                        value={area.weight}
                        onChange={(e) => {
                          const updated = [...localProfile.interest_profile.focus_areas];
                          updated[i].weight = e.target.value;
                          setLocalProfile({...});
                        }}
                        className="mt-2"
                      >
                        <option value="HIGH">High Priority</option>
                        <option value="MEDIUM_HIGH">Medium-High</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="LOW">Low</option>
                      </select>
                      
                      <div className="mt-2">
                        <label className="text-sm">Keywords (comma-separated):</label>
                        <textarea
                          value={area.keywords.join(', ')}
                          onChange={(e) => {
                            const updated = [...localProfile.interest_profile.focus_areas];
                            updated[i].keywords = e.target.value.split(',').map(k => k.trim());
                            setLocalProfile({...});
                          }}
                          rows={3}
                          className="w-full mt-1"
                        />
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        const updated = localProfile.interest_profile.focus_areas.filter((_, idx) => idx !== i);
                        setLocalProfile({
                          ...localProfile,
                          interest_profile: {
                            ...localProfile.interest_profile,
                            focus_areas: updated
                          }
                        });
                      }}
                      className="text-red-500 ml-4"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              
              <button
                onClick={() => {
                  const newArea = {
                    id: `area_${Date.now()}`,
                    name: 'New Focus Area',
                    weight: 'MEDIUM',
                    keywords: []
                  };
                  setLocalProfile({
                    ...localProfile,
                    interest_profile: {
                      ...localProfile.interest_profile,
                      focus_areas: [...localProfile.interest_profile.focus_areas, newArea]
                    }
                  });
                }}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-[#2f829b]"
              >
                + Add Focus Area
              </button>
            </div>
          </TabsContent>
          
          {/* Voice & Tone Tab */}
          <TabsContent value="voice">
            <div className="space-y-4">
              <div>
                <label>Default POV:</label>
                <select
                  value={localProfile.voice_profile.pov_rules.default_pov}
                  onChange={(e) => {
                    setLocalProfile({
                      ...localProfile,
                      voice_profile: {
                        ...localProfile.voice_profile,
                        pov_rules: {
                          ...localProfile.voice_profile.pov_rules,
                          default_pov: e.target.value
                        }
                      }
                    });
                  }}
                >
                  <option value="first_person_singular">First person (I/me)</option>
                  <option value="first_person_plural">First person plural (we/us)</option>
                  <option value="second_person">Second person (you)</option>
                </select>
              </div>
              
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={localProfile.voice_profile.pov_rules.avoid_we_language}
                    onChange={(e) => {
                      setLocalProfile({
                        ...localProfile,
                        voice_profile: {
                          ...localProfile.voice_profile,
                          pov_rules: {
                            ...localProfile.voice_profile.pov_rules,
                            avoid_we_language: e.target.checked
                          }
                        }
                      });
                    }}
                  />
                  Avoid "we" language (solo practice)
                </label>
              </div>
              
              <div>
                <label>Tone Rules (one per line):</label>
                <textarea
                  value={localProfile.voice_profile.tone_rules.join('\n')}
                  onChange={(e) => {
                    setLocalProfile({
                      ...localProfile,
                      voice_profile: {
                        ...localProfile.voice_profile,
                        tone_rules: e.target.value.split('\n')
                      }
                    });
                  }}
                  rows={5}
                  className="w-full"
                />
              </div>
              
              <div>
                <label>Banned Phrases (comma-separated):</label>
                <textarea
                  value={localProfile.voice_profile.banned_phrases.join(', ')}
                  onChange={(e) => {
                    setLocalProfile({
                      ...localProfile,
                      voice_profile: {
                        ...localProfile.voice_profile,
                        banned_phrases: e.target.value.split(',').map(p => p.trim())
                      }
                    });
                  }}
                  rows={3}
                  className="w-full"
                />
              </div>
            </div>
          </TabsContent>
          
          {/* Keywords Tab */}
          <TabsContent value="keywords">
            <div className="space-y-4">
              <div>
                <label>Prioritize Keywords (for content ranking):</label>
                <textarea
                  value={localProfile.interest_profile.prioritize_keywords.join(', ')}
                  onChange={(e) => {
                    setLocalProfile({
                      ...localProfile,
                      interest_profile: {
                        ...localProfile.interest_profile,
                        prioritize_keywords: e.target.value.split(',').map(k => k.trim())
                      }
                    });
                  }}
                  rows={3}
                  className="w-full"
                  placeholder="patient experience, digital health, care coordination..."
                />
              </div>
              
              <div>
                <label>Avoid Keywords (auto-filter out):</label>
                <textarea
                  value={localProfile.interest_profile.avoid_keywords.join(', ')}
                  onChange={(e) => {
                    setLocalProfile({
                      ...localProfile,
                      interest_profile: {
                        ...localProfile.interest_profile,
                        avoid_keywords: e.target.value.split(',').map(k => k.trim())
                      }
                    });
                  }}
                  rows={3}
                  className="w-full"
                  placeholder="crypto, web3, NFT, sports betting..."
                />
              </div>
            </div>
          </TabsContent>
          
          {/* Learning Tab */}
          <TabsContent value="learning">
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={localProfile.learning_settings.use_recent_published_content_for_style}
                    onChange={(e) => {
                      setLocalProfile({
                        ...localProfile,
                        learning_settings: {
                          ...localProfile.learning_settings,
                          use_recent_published_content_for_style: e.target.checked
                        }
                      });
                    }}
                  />
                  Learn writing style from recent published content
                </label>
              </div>
              
              {localProfile.learning_settings.use_recent_published_content_for_style && (
                <div>
                  <label>Number of recent posts to analyze:</label>
                  <input
                    type="number"
                    value={localProfile.learning_settings.recent_published_lookback_count}
                    onChange={(e) => {
                      setLocalProfile({
                        ...localProfile,
                        learning_settings: {
                          ...localProfile.learning_settings,
                          recent_published_lookback_count: parseInt(e.target.value)
                        }
                      });
                    }}
                    min={5}
                    max={50}
                    className="w-32"
                  />
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button 
            onClick={() => {
              onSave({
                ...localProfile,
                last_updated: new Date().toISOString().split('T')[0]
              });
              onClose();
            }}
            className="btn-primary"
          >
            Save Preferences
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 📁 MODIFIED FILE STRUCTURE

```
content-app/
├── App.tsx                                  ← MODIFIED (add aiProfile state + inbox page)
├── components/
│   ├── content/
│   │   ├── ContentDetailModal.tsx           ← MODIFIED (add aiProfile prop + Jamie context)
│   │   └── ... (rest unchanged)
│   │
│   ├── ContentIdeasInbox.tsx                ← NEW (System 1)
│   ├── InboxItemCard.tsx                    ← NEW
│   ├── AIWritingAssistant.tsx               ← NEW (System 2)
│   ├── AIPreferencesModal.tsx               ← NEW (edit profile)
│   ├── AIKnowledgePanel.tsx                 ← NEW (show what Jamie knows)
│   │
│   ├── muted_ContentPage_Gallery.tsx        ← KEEP (unchanged)
│   ├── ContentTableView.tsx                 ← KEEP (unchanged)
│   └── ... (all other files unchanged)
│
├── types/
│   ├── AIProfile.ts                         ← NEW (interfaces for AI_PROFILE_V1)
│   └── ContentItem.ts                       ← MODIFIED (add new fields)
│
├── utils/
│   ├── aiPrompts.ts                         ← NEW (waiting for Batch 2)
│   └── buildSystemPrompt.ts                 ← NEW
│
└── data/
    └── AI_PROFILE_V1.json                   ← NEW (default profile from Batch 1)
```

---

## 🎯 WHAT BUILDER NEEDS TO IMPLEMENT

### **Phase 1: Profile Infrastructure (Foundation)**
✅ Create AIProfile TypeScript interfaces  
✅ Add AI_PROFILE_V1.json default data  
✅ Add aiProfile state to App.tsx  
✅ Create AIPreferencesModal component  
✅ Add navigation item for "Settings"  

### **Phase 2: Writing Assistant (System 2)**
✅ Create AIWritingAssistant component  
✅ Modify ContentDetailModal to accept aiProfile prop  
✅ Implement buildSystemPrompt utility  
✅ Add Jamie's context display for inbox items  
✅ Create AIKnowledgePanel component  

### **Phase 3: Ideas Inbox (System 1)** 
⏳ Waiting for Batch 2 (prompt templates + flow)  
⏳ Create ContentIdeasInbox component  
⏳ Create InboxItemCard component  
⏳ Implement newsletter extraction AI calls  
⏳ Implement ranking + snippet/hook generation  
⏳ Status transitions + 15s undo  

---

## ✅ READY FOR BATCH 2

I'm now ready to receive:
1. Exact AI prompt templates for newsletter extraction
2. Ranking algorithm (Top 5 selection)
3. Snippet/hook generation prompts
4. Status transition logic
5. Any backend/API requirements

The architecture is ready - the new "head" will plug cleanly into the prepared "body"! 🎯
