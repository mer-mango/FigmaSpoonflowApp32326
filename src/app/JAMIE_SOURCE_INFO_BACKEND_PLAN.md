# Jamie Source Info - Backend Implementation Plan

## Overview
Enhance the Jamie panel in the Content Editor to show intelligent source analysis, including Jamie-generated summaries, key points, and relevant quotes pulled from source material.

---

## 1. Data Structure Updates

### ContentItem Type Extension
Add new field to store Jamie's source analysis:

```typescript
interface ContentItem {
  // ... existing fields ...
  
  // Source material (already exists)
  source?: string;           // Source title/name
  sourceAuthor?: string;     // Author name
  sourceUrl?: string;        // URL to source
  sourceContent?: string;    // Pasted article text/research
  
  // User-written fields (already exist)
  summary?: string;          // User's summary or Jamie-generated summary
  notes?: string;            // User's manual notes
  
  // NEW: Jamie's AI-generated source analysis
  jamieSourceAnalysis?: {
    generatedAt: string;           // ISO timestamp of when analysis was generated
    highlevelSummary: string;      // Jamie's high-level summary of the source
    keyPoints: Array<{
      text: string;                // The key point or quote
      type: 'insight' | 'quote' | 'stat' | 'topic';  // Type of point
      relevanceScore?: number;     // 0-1 score of relevance to user's expertise
    }>;
    relevantTopics: string[];      // Topics that align with user's wheelhouse
    sourceHash?: string;           // Hash of source content to detect changes
  };
}
```

---

## 2. AI Utility Functions

### New function: `analyzeSourceMaterial()`
Location: `/utils/jamieAI.ts`

```typescript
/**
 * Analyzes source material and extracts key insights relevant to user's expertise
 * @param sourceContent - The raw text content from the source
 * @param sourceUrl - Optional URL to fetch content from
 * @param sourceTitle - Title of the source
 * @param sourceAuthor - Author of the source
 * @param userExpertise - User's areas of expertise (from profile or content context)
 * @returns Jamie's analysis with summary, key points, and relevant topics
 */
async function analyzeSourceMaterial(
  sourceContent: string,
  sourceUrl?: string,
  sourceTitle?: string,
  sourceAuthor?: string,
  userExpertise?: string[]
): Promise<{
  highlevelSummary: string;
  keyPoints: Array<{
    text: string;
    type: 'insight' | 'quote' | 'stat' | 'topic';
    relevanceScore?: number;
  }>;
  relevantTopics: string[];
}>
```

**AI Prompt Strategy:**
```
You are Jamie, an AI assistant helping a patient experience strategist analyze source material.

USER'S EXPERTISE AREAS:
- Patient experience design
- Digital health product strategy  
- Healthcare communication
- [other areas from user profile]

SOURCE TO ANALYZE:
Title: {sourceTitle}
Author: {sourceAuthor}
Content: {sourceContent}

YOUR TASK:
1. Write a high-level summary (2-3 sentences) capturing the main thesis
2. Extract 5-8 key points that would be most valuable for this user, prioritizing:
   - Insights about patient behavior, friction points, or experience gaps
   - Statistics or data about healthcare/digital health
   - Quotable statements that align with the user's expertise
   - Framework concepts or strategic insights
3. Identify topics in this source that connect to the user's wheelhouse

Format your response as JSON:
{
  "highlevelSummary": "...",
  "keyPoints": [
    { "text": "...", "type": "insight", "relevanceScore": 0.9 },
    { "text": "...", "type": "quote", "relevanceScore": 0.85 }
  ],
  "relevantTopics": ["patient trust", "onboarding friction", ...]
}
```

---

## 3. When to Generate Source Analysis

### Option A: During Wizard Completion (RECOMMENDED)
**Trigger:** When user clicks "Choose and start drafting" in Step 3
**Flow:**
1. User completes wizard
2. Before navigating to editor, call `analyzeSourceMaterial()` if source exists
3. Store result in `jamieSourceAnalysis` field
4. Navigate to editor with analysis ready

**Pros:**
- Analysis is ready when editor opens
- Better UX - no waiting in editor
- Can show progress/loading in wizard

**Cons:**
- Slightly delays transition to editor (but shows progress)

### Option B: On-Demand in Editor (FALLBACK)
**Trigger:** When editor loads and no analysis exists yet
**Flow:**
1. Editor checks if `jamieSourceAnalysis` exists
2. If not, and source material exists, show "Analyzing source..." 
3. Call `analyzeSourceMaterial()` in background
4. Update UI when complete

**Pros:**
- Faster wizard completion
- Only generate if user actually uses editor

**Cons:**
- User waits in editor
- More complex loading states

### Recommended Approach: 
**Hybrid** - Try during wizard (Option A), but gracefully handle in editor if it wasn't generated (Option B fallback)

---

## 4. Content Editor Integration

### Jamie Panel Structure
```typescript
// In ContentEditor.tsx or JamiePanel.tsx

interface JamiePanelProps {
  contentItem: ContentItem;
  onRegenerateAnalysis?: () => void;
}

// Panel sections:
// 1. Source Info (NEW)
//    - Source title + author
//    - Jamie's high-level summary
//    - Key points/quotes (expandable list)
//    - User's manual notes
//    - Refresh button to regenerate analysis
// 2. Blueprint Scaffolding (existing)
// 3. Voice & Tone Guidelines (existing)
// 4. Writing Assistance (existing)
```

### Source Info Section Data Flow
```typescript
// Check if analysis exists
const hasSourceAnalysis = contentItem.jamieSourceAnalysis;
const hasSourceMaterial = contentItem.sourceContent || contentItem.sourceUrl;

// States needed:
const [isAnalyzing, setIsAnalyzing] = useState(false);
const [analysisError, setAnalysisError] = useState<string | null>(null);

// Generate analysis if missing
useEffect(() => {
  if (hasSourceMaterial && !hasSourceAnalysis && !isAnalyzing) {
    handleGenerateAnalysis();
  }
}, [contentItem.id]);

async function handleGenerateAnalysis() {
  setIsAnalyzing(true);
  try {
    const analysis = await analyzeSourceMaterial(
      contentItem.sourceContent || '',
      contentItem.sourceUrl,
      contentItem.source,
      contentItem.sourceAuthor,
      getUserExpertiseAreas() // From user profile or defaults
    );
    
    // Save to content item
    await updateContentItem(contentItem.id, {
      jamieSourceAnalysis: {
        ...analysis,
        generatedAt: new Date().toISOString(),
        sourceHash: hashString(contentItem.sourceContent || '')
      }
    });
  } catch (error) {
    setAnalysisError(error.message);
  } finally {
    setIsAnalyzing(false);
  }
}

// Regenerate if source content changed
function hasSourceChanged() {
  if (!contentItem.jamieSourceAnalysis) return false;
  const currentHash = hashString(contentItem.sourceContent || '');
  return currentHash !== contentItem.jamieSourceAnalysis.sourceHash;
}
```

---

## 5. API Considerations

### If using backend server for AI:
**New endpoint:** `POST /make-server-a89809a8/analyze-source`

```typescript
// Request body:
{
  sourceContent: string;
  sourceUrl?: string;
  sourceTitle?: string;
  sourceAuthor?: string;
  userExpertise?: string[];
}

// Response:
{
  highlevelSummary: string;
  keyPoints: Array<{
    text: string;
    type: 'insight' | 'quote' | 'stat' | 'topic';
    relevanceScore?: number;
  }>;
  relevantTopics: string[];
}
```

### Rate limiting / Caching:
- Cache analysis results keyed by source content hash
- Don't regenerate if source hasn't changed
- Implement exponential backoff for API failures

---

## 6. User Expertise Profile

### Where to store user's expertise areas:
**Option 1:** Hardcoded defaults based on known user profile
```typescript
const DEFAULT_USER_EXPERTISE = [
  'Patient experience design',
  'Digital health product strategy',
  'Healthcare communication',
  'Patient journey mapping',
  'Healthcare friction points',
  'Trust and credibility in healthcare',
  'Patient engagement strategies'
];
```

**Option 2:** Store in user profile (future enhancement)
- Add `expertiseAreas: string[]` to user profile
- Let user customize their areas of expertise
- Use for better AI personalization

**Recommended:** Start with Option 1 (hardcoded), plan for Option 2 later

---

## 7. Regeneration & Refresh Logic

### When to allow manual regeneration:
1. Source content/URL changed since last analysis
2. User explicitly clicks "Refresh analysis" button
3. Analysis is > 7 days old (optional staleness check)

### UI for regeneration:
```typescript
<button 
  onClick={handleRegenerateAnalysis}
  disabled={isAnalyzing}
  className="text-xs text-slate-500 hover:text-[#6b2358]"
>
  {isAnalyzing ? 'Analyzing...' : '↻ Refresh analysis'}
</button>
```

---

## 8. Error Handling

### Graceful degradation:
- If analysis fails, still show source title/author/notes
- Show error message with retry option
- Don't block user from using editor

### Error states:
```typescript
{
  NO_SOURCE: "No source material to analyze",
  API_ERROR: "Failed to analyze source. Click to retry.",
  RATE_LIMIT: "Too many requests. Try again in a moment.",
  INVALID_CONTENT: "Source content is too short to analyze"
}
```

---

## 9. Performance Considerations

### Optimization strategies:
1. **Lazy loading:** Only analyze when Jamie panel is opened (if not done in wizard)
2. **Debouncing:** If source content is edited, debounce analysis regeneration
3. **Caching:** Store analysis results, don't regenerate unnecessarily
4. **Progressive enhancement:** Show source info immediately, then enhance with analysis

### Loading states:
```
┌─────────────────────────────────┐
│ 📄 Source Info                  │
│                                 │
│ Title: [source title]           │
│ Author: [author name]           │
│                                 │
│ ✨ Analyzing source...          │
│ [progress indicator]            │
│                                 │
│ 📝 Your Notes:                  │
│ [user notes if any]             │
└─────────────────────────────────┘
```

---

## 10. Implementation Checklist

### Phase 1: Data & Core Functions
- [ ] Update ContentItem type with `jamieSourceAnalysis` field
- [ ] Create `analyzeSourceMaterial()` function in `/utils/jamieAI.ts`
- [ ] Add source content hashing utility
- [ ] Test AI prompt and response parsing

### Phase 2: Wizard Integration  
- [ ] Add analysis generation to wizard completion flow
- [ ] Show loading state during analysis
- [ ] Handle errors gracefully
- [ ] Save analysis to ContentItem

### Phase 3: Content Editor Panel (waiting for mockup)
- [ ] Redesign Jamie panel based on mockup
- [ ] Add Source Info section with all components
- [ ] Implement fallback generation if missing
- [ ] Add regeneration button
- [ ] Handle loading/error states

### Phase 4: Polish
- [ ] Add source change detection
- [ ] Implement caching strategy
- [ ] Add user expertise configuration
- [ ] Performance testing
- [ ] Error handling edge cases

---

## 11. Future Enhancements

### Possible additions:
- **Smart highlighting:** Highlight quotes in source content that Jamie extracted
- **Related content suggestions:** "Based on this source, you might also explore..."
- **Citation helper:** Auto-generate citation text for quotes
- **Source comparison:** Compare multiple sources side-by-side
- **Expertise matching score:** Show how well source aligns with user's expertise
- **Interactive quotes:** Click to insert quote into draft with proper attribution

---

## Next Steps
1. ✅ Review this plan
2. ⏳ Get mockup from user for Jamie panel design
3. ⏳ Implement Phase 1 (data structures + AI function)
4. ⏳ Implement Phase 2 (wizard integration)
5. ⏳ Implement Phase 3 (content editor panel based on mockup)

