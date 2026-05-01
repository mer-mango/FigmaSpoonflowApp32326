# JAMIE - COMPLETE AI ASSISTANT SPECIFICATION
## All Functions, Flows, UX Integration, and Implementation Requirements

---

## 🤖 WHO IS JAMIE?

**Jamie** is the AI assistant embedded in the "Just Content" app.

**Jamie's Role:**
- Analyze newsletter content for relevance
- Extract individual articles from newsletters
- Generate snippets and hooks in Meredith's voice
- Suggest blueprints based on content pillars
- Help with content creation (on-demand)
- Learn from user feedback (thumbs up/down)

**Jamie's Voice:**
- Concise, human, clear
- No hype, no clichés, no corporate speak
- Banned words: "unlock", "game-changing", "synergy", "leverage"
- Sounds like a smart colleague, not a marketing robot

---

## 📋 JAMIE FUNCTIONS - COMPLETE LIST

### **FUNCTION 1: Newsletter Extraction**
**Trigger:** User clicks "Pull newsletters" button  
**Input:** Raw email (HTML + plaintext)  
**Output:** Array of extracted content items  

**What Jamie does:**
1. Parse email structure
2. Identify individual articles/resources (exclude boilerplate)
3. Extract title, URL, brief excerpt for each
4. Assign confidence score (0-1)
5. Guess content type (article, research, opinion, event, etc.)

**Prompt:** `EMAIL_ITEM_EXTRACTION_PROMPT` (see Batch 2)

**UX:**
- Loading state: "Jamie is reading your newsletters..."
- Success: "Jamie found 8 items from 3 newsletters"
- Error: "Jamie couldn't process this email. Try again or paste the URL manually."

---

### **FUNCTION 2: Item Scoring & Tagging**
**Trigger:** After extraction, for each item  
**Input:** Extracted item + user topic profile  
**Output:** Relevance score, suggested tags, reason  

**What Jamie does:**
1. Analyze content against Meredith's focus topics
2. Check for avoid topics (apply penalty)
3. Suggest 0-3 content pillar tags from allowed list
4. Generate relevance score (0-100)
5. Write 1-sentence reason for score

**Scoring rubric:**
- 90-100: Directly in wheelhouse; strong PX/health tech
- 70-89: Relevant; easy angle
- 40-69: Adjacent; needs sharp POV
- 0-39: Off-topic or too generic

**Prompt:** `ITEM_SCORING_AND_BLUEPRINT_PROMPT` (see Batch 2)

**UX:**
- Inline display on inbox card
- Color-coded score badge:
  - 90-100: Green
  - 70-89: Blue
  - 40-69: Yellow
  - 0-39: Gray (likely dismissed)

---

### **FUNCTION 3: Blueprint Recommendation**
**Trigger:** After scoring, for each item  
**Input:** Item + content pillar tags + blueprint catalog  
**Output:** Suggested blueprint family/subtype + why  

**What Jamie does:**
1. Apply heuristics based on tags:
   - `speaking_patient` OR `empathy_as_strategy` → **Perspective**
   - `full_patient_ecosystem` OR `fit_real_care_journeys` → **Story**
   - `co_design_hcd` OR `participatory_medicine` → **Education**
   - Needs community input → **Engagement**
   - Meredith update only → **Announcement**
2. Choose specific subtype (e.g., "What Patients Wish You Knew")
3. Write 1-2 sentence explanation

**Prompt:** Part of `ITEM_SCORING_AND_BLUEPRINT_PROMPT`

**UX:**
- "Jamie suggests" section on inbox card
- Blueprint chip with family color
- Expandable "Why this blueprint" explanation

---

### **FUNCTION 4: Snippet Generation**
**Trigger:** After scoring, for each item  
**Input:** Item + extracted excerpt  
**Output:** 2-3 sentence summary in Meredith's voice  

**What Jamie does:**
1. Distill the core idea (not just copy/paste excerpt)
2. Write in Meredith's voice (concise, human, clear)
3. Focus on the "so what" not just the "what"
4. Max 3 sentences

**Prompt:** Part of `ITEM_SCORING_AND_BLUEPRINT_PROMPT`

**UX:**
- Display directly on inbox card
- Truncate with "Read more" if needed
- Use in notes field when converting to Idea

---

### **FUNCTION 5: "Why It Matters" Generation**
**Trigger:** After scoring, for each item  
**Input:** Item + Meredith's topic profile  
**Output:** 1 sentence connecting to wheelhouse  

**What Jamie does:**
1. Tie the content to Meredith's expertise
2. Answer "Why should I care about this?"
3. Make it specific (not generic)
4. Max 1 sentence

**Prompt:** Part of `ITEM_SCORING_AND_BLUEPRINT_PROMPT`

**UX:**
- Display on inbox card with icon (💡 or similar)
- Use as rationale for "Send to Wizard"

---

### **FUNCTION 6: Hook Direction (Inbox)**
**Trigger:** After scoring, for each item  
**Input:** Item + suggested blueprint  
**Output:** 1-2 sentences of hook direction (NOT polished hook)  

**What Jamie does:**
1. Suggest the angle/approach for the hook
2. Give direction, not final copy
3. Example: "Lead with the patient quote, then the stat"
4. Max 2 sentences

**Prompt:** Part of `ITEM_SCORING_AND_BLUEPRINT_PROMPT`

**UX:**
- Display on inbox card (collapsed by default)
- Expand on click: "See Jamie's hook direction"
- Use as starting point in Wizard

---

### **FUNCTION 7: Hook Options (Wizard, On-Demand)**
**Trigger:** User clicks "Generate hooks" in Wizard  
**Input:** Content item + selected blueprint + content type  
**Output:** 3 hook options (1-2 lines each)  

**What Jamie does:**
1. Generate 3 different opening hooks
2. Each in Meredith's voice
3. Each optimized for selected platform (LinkedIn Post vs Article vs Substack)
4. No hype, no clichés
5. Actionable (user can pick one and refine)

**Prompt:** (New, on-demand only)
```
"You are Jamie. Generate 3 opening hooks for this content in Meredith's voice. 
Content: {title + notes}
Blueprint: {family + subtype}
Platform: {contentType}
Voice: Concise, human, clear. No hype. No clichés. No 'unlock' or 'game-changing'.
Return 3 options (1-2 lines each), numbered."
```

**UX:**
- Button in Wizard: "Generate hook options (Jamie)"
- Shows 3 radio button options
- User selects one → inserts into draft

---

### **FUNCTION 8: Outline/Template Generation**
**Trigger:** User selects blueprint in Wizard  
**Input:** Blueprint family + subtype  
**Output:** Structured outline/template  

**What Jamie does:**
1. Load template from blueprint catalog (editable in Settings)
2. If no template exists, generate generic structure
3. Include section headings + guidance for each
4. Placeholder text for user to fill in

**Prompt:** (Optional, if generating dynamic templates)
```
"Create a structured outline for a {blueprintFamily} - {blueprintSubtype} piece.
Platform: {contentType}
Include 4-5 sections with headings and 1-sentence guidance per section.
Make it specific to Meredith's patient experience + digital health focus."
```

**UX:**
- Loads automatically when blueprint selected
- Editable sections in Wizard
- Save progress as user fills in

---

### **FUNCTION 9: Lead Day Breakdown (Settings Helper)**
**Trigger:** User sets leadDays for a content type in Settings  
**Input:** leadDays (number), contentType  
**Output:** Suggested daily milestones  

**What Jamie does:**
1. Break down prep work into daily goals
2. Example: 5 lead days for LinkedIn Article:
   - Day 1: Outline + research
   - Day 2: First draft (sections 1-3)
   - Day 3: Finish draft + edit
   - Day 4: Final review + polish
   - Day 5: Format + schedule

**Prompt:** (New)
```
"Create a {leadDays}-day work plan for writing a {contentType}.
Break it into daily milestones.
Keep it realistic for a solo consultant.
Return as bullet list."
```

**UX:**
- Show as helper tooltip in Settings
- Optional: Show on calendar when hovering shading span
- Help user understand what leadDays means practically

---

### **FUNCTION 10: Content Idea Expansion (Future)**
**Trigger:** User clicks "Expand this idea" in Content Library  
**Input:** Content item (Idea status)  
**Output:** Expanded notes, research angles, related topics  

**What Jamie does:**
1. Take a brief idea
2. Suggest 3-5 angles to explore
3. Suggest related topics/tags
4. Provide starter questions to answer

**Prompt:** (Future feature)
```
"Expand this content idea: {title + notes}
Suggest 3-5 angles to explore.
Suggest 3-5 research questions.
Suggest related topics from Meredith's wheelhouse."
```

**UX:**
- Button on Idea card: "Ask Jamie to expand"
- Modal with expansion suggestions
- User can copy/paste into notes

---

## 🎨 JAMIE UX INTEGRATION POINTS

### **1. Content Ideas Inbox**
**Where Jamie appears:**
- Each inbox card has "Jamie suggests" section
- Shows: blueprint, why, hook direction
- Top 5 section powered by Jamie's scoring

**Visual design:**
- Jamie badge/icon (🤖 or "J" monogram)
- Soft background color for Jamie sections (#f0f4ff or similar)
- Consistent "Jamie suggests:" label

---

### **2. Quick Add Modal**
**Where Jamie appears:**
- After pasting URL: "Jamie is analyzing..."
- Shows extracted title, snippet, tags
- User can edit before saving

**Visual design:**
- Loading spinner while Jamie processes
- Same card design as inbox items

---

### **3. Content Wizard**
**Where Jamie appears:**
- Pre-filled title, notes, tags from inbox
- Suggested blueprint highlighted with "Jamie suggested" badge
- "Generate hook options" button
- Template loaded based on blueprint

**Visual design:**
- Jamie badge next to pre-filled fields
- "✨ Jamie-powered" indicator on buttons

---

### **4. Calendar (Future)**
**Where Jamie might appear:**
- Hover tooltip on shading: "Jamie suggests: Day 1 - Outline, Day 2 - Draft..."
- Smart scheduling: "Jamie noticed you usually post on Tuesdays"

---

### **5. Settings - AI Preferences**
**Where Jamie appears:**
- Edit focus topics, avoid topics
- Edit voice guidelines
- Edit blueprint heuristics
- Paste example writing samples

**Visual design:**
- Dedicated "Jamie AI Settings" section
- Toggle for "Enable Jamie suggestions"
- Feedback: "Jamie learns from your thumbs up/down"

---

## 🏗️ JAMIE IMPLEMENTATION REQUIREMENTS

### **FRONTEND NEEDS:**

#### **1. Components:**
- `<JamieSuggestionBox>` - Reusable container for Jamie outputs
- `<JamieBadge>` - Small "Jamie" indicator
- `<JamieLoadingState>` - Spinner with "Jamie is [verb]..." message
- `<JamieHookGenerator>` - Wizard hook generation UI
- `<JamiePreferences>` - Settings modal for AI config

#### **2. State Management:**
- `jamieProcessing: boolean` - Is Jamie currently running?
- `jamieError: string | null` - Any errors from Jamie
- `jamieCache: Map<string, JamieOutput>` - Cache results to avoid re-processing

#### **3. Loading States:**
- "Jamie is reading your newsletters..." (newsletter pull)
- "Jamie is analyzing..." (Quick Add URL)
- "Jamie is generating hooks..." (Wizard hook generation)
- "Jamie is learning..." (After thumbs up/down feedback)

---

### **BACKEND NEEDS:**

#### **1. API Endpoints:**
```
POST /api/jamie/extractNewsletter
  Input: { emailHtml, emailText, senderName, senderEmail, subject, sentDate }
  Output: { items: [...extracted items...] }

POST /api/jamie/scoreAndTag
  Input: { item, userProfile, blueprintCatalog }
  Output: { relevanceScore, tags, blueprint, snippet, whyItMatters, hookDirection }

POST /api/jamie/generateHooks
  Input: { contentItem, blueprint, contentType }
  Output: { hooks: [hook1, hook2, hook3] }

POST /api/jamie/generateOutline
  Input: { blueprintFamily, blueprintSubtype, contentType }
  Output: { outline: "..." }

POST /api/jamie/feedback
  Input: { inboxItemId, feedbackType: "thumbs_up" | "thumbs_down", reason?: string }
  Output: { success: true }
```

#### **2. Prompt Management:**
- Store prompts in environment variables or config file
- Version prompts (v1, v2, etc.) for A/B testing
- Log prompt inputs/outputs for debugging

#### **3. AI Service Integration:**
**Recommended: OpenAI GPT-4**
- Use `gpt-4-turbo` or `gpt-4` for newsletter extraction
- Use `gpt-4` for scoring/tagging (needs reasoning)
- Use `gpt-3.5-turbo` for hook generation (faster, cheaper)

**Configuration:**
```javascript
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function callJamie(prompt, systemMessage, options = {}) {
  const response = await openai.chat.completions.create({
    model: options.model || 'gpt-4-turbo',
    messages: [
      { role: 'system', content: systemMessage },
      { role: 'user', content: prompt }
    ],
    temperature: options.temperature || 0.7,
    max_tokens: options.maxTokens || 1000,
    response_format: options.jsonMode ? { type: 'json_object' } : undefined
  });
  
  return response.choices[0].message.content;
}
```

#### **4. Error Handling:**
```javascript
try {
  const result = await callJamie(prompt, systemMessage);
  return JSON.parse(result);
} catch (error) {
  console.error('Jamie error:', error);
  
  // User-friendly error messages
  if (error.code === 'rate_limit_exceeded') {
    return { error: "Jamie is taking a quick break. Try again in a moment." };
  }
  if (error.code === 'context_length_exceeded') {
    return { error: "This newsletter is too long for Jamie to process. Try pasting just the article URL." };
  }
  
  return { error: "Jamie encountered an issue. Please try again." };
}
```

#### **5. Caching Strategy:**
```javascript
// Cache extraction results by fingerprint
const cacheKey = `jamie:extract:${fingerprint}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const result = await callJamie(...);
await redis.set(cacheKey, JSON.stringify(result), 'EX', 86400); // 24hr TTL
return result;
```

---

### **DATABASE NEEDS:**

#### **1. Store Jamie Outputs:**
All Jamie outputs are stored in `inbox_items` table:
```sql
CREATE TABLE inbox_items (
  ...
  relevance_score INTEGER,
  suggested_tags TEXT[],
  suggested_blueprint_family TEXT,
  suggested_blueprint_subtype TEXT,
  suggested_blueprint_why TEXT,
  snippet TEXT,
  why_it_matters TEXT,
  hook_direction TEXT,
  ...
);
```

#### **2. Store User Feedback:**
```sql
CREATE TABLE jamie_feedback (
  id UUID PRIMARY KEY,
  inbox_item_id UUID REFERENCES inbox_items(id),
  feedback_type TEXT, -- 'thumbs_up' or 'thumbs_down'
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Use feedback for:**
- Analytics: "Jamie's suggestions have 73% thumbs up rate"
- Future: Fine-tune prompts based on what works
- Future: Personalize Jamie's suggestions per user

---

## ✅ JAMIE IMPLEMENTATION CHECKLIST

### **Phase 1: Newsletter Processing**
- [ ] Build `POST /api/jamie/extractNewsletter` endpoint
- [ ] Implement `EMAIL_ITEM_EXTRACTION_PROMPT`
- [ ] Test with 5 real newsletters
- [ ] Handle edge cases (no links, all boilerplate, etc.)
- [ ] Display extracted items in inbox

### **Phase 2: Scoring & Tagging**
- [ ] Build `POST /api/jamie/scoreAndTag` endpoint
- [ ] Implement `ITEM_SCORING_AND_BLUEPRINT_PROMPT`
- [ ] Test scoring accuracy (compare to manual scores)
- [ ] Display scores/tags on inbox cards
- [ ] Implement deterministic Top 5 ranking (code, not AI)

### **Phase 3: Blueprint Suggestions**
- [ ] Implement blueprint heuristics (tag → family mapping)
- [ ] Test blueprint accuracy (80%+ match to manual choice?)
- [ ] Display suggested blueprint on inbox cards
- [ ] Allow user to override in Wizard

### **Phase 4: Snippet & Hook Direction**
- [ ] Generate snippets in Meredith's voice
- [ ] Generate "why it matters" statements
- [ ] Generate hook direction (not full hooks)
- [ ] Display all 3 on inbox cards
- [ ] Prefill into Wizard when "Send to Wizard"

### **Phase 5: On-Demand Hook Generation (Wizard)**
- [ ] Build `POST /api/jamie/generateHooks` endpoint
- [ ] Add "Generate hooks" button in Wizard
- [ ] Display 3 hook options as radio buttons
- [ ] Insert selected hook into draft
- [ ] Test hooks for voice consistency

### **Phase 6: Feedback System**
- [ ] Add thumbs up/down buttons on inbox cards
- [ ] Build `POST /api/jamie/feedback` endpoint
- [ ] Store feedback in database
- [ ] Show feedback stats in Settings
- [ ] (Future) Use feedback to improve prompts

### **Phase 7: Settings/Preferences**
- [ ] Build "AI Preferences" section in Settings
- [ ] Allow edit focus topics, avoid topics
- [ ] Allow edit voice guidelines (banned words, style)
- [ ] Allow edit blueprint heuristics
- [ ] (Future) Allow paste example writing samples

---

## 🧪 JAMIE TESTING REQUIREMENTS

### **Test 1: Newsletter Extraction Accuracy**
**Sample:** 10 real newsletters from different sources  
**Expected:** 90%+ correct extraction (title, URL, excerpt)  
**Fail condition:** Missing articles, extracting boilerplate  

### **Test 2: Scoring Accuracy**
**Sample:** 20 items (10 high relevance, 10 low relevance)  
**Expected:** High relevance items score 70+, low score <50  
**Fail condition:** Inverted scores (low relevance gets high score)  

### **Test 3: Blueprint Suggestion Accuracy**
**Sample:** 15 items with known "correct" blueprint  
**Expected:** 80%+ match to manual choice  
**Fail condition:** <70% match  

### **Test 4: Voice Consistency (Snippets & Hooks)**
**Sample:** 10 generated snippets + 10 hook sets  
**Expected:** No banned words, no hype, sounds human  
**Fail condition:** Contains "unlock", "game-changing", etc.  

### **Test 5: Edge Cases**
- Newsletter with no links → Should return 1 item with url=null
- Newsletter with 20+ links → Should filter to meaningful ones
- Newsletter in different language → Should detect and skip or translate
- Corrupted HTML → Should fallback to plaintext

---

## 🚀 JAMIE FUTURE ENHANCEMENTS (v2)

### **Learning & Personalization:**
- Fine-tune prompts based on thumbs up/down feedback
- Learn which blueprints Meredith actually uses (vs suggested)
- Adjust scoring based on what she converts to Ideas

### **Proactive Suggestions:**
- "Jamie noticed you haven't posted in 10 days. Want to schedule something?"
- "Jamie found 3 high-scoring items this week. Should we promote one?"
- "Jamie suggests writing about {topic} - it's trending and in your wheelhouse"

### **Content Analysis:**
- Analyze published content performance
- Suggest what's working: "Your 'What Patients Wish' posts get 2x engagement"
- Suggest improvements: "Try shorter hooks on LinkedIn Posts"

### **Voice Learning:**
- Upload past writing samples (blogs, articles)
- Jamie learns specific phrases, sentence structure
- Generated content sounds MORE like Meredith over time

---

**END OF JAMIE COMPLETE SPECIFICATION**

**Summary:** Jamie has 10 core functions spanning newsletter processing, scoring, blueprint suggestions, and on-demand content help. All functions are scoped, prompted, and integrated into UX. Implementation checklist ensures nothing is missed.
