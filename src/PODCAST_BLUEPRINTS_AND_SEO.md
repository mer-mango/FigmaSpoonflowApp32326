# 🎙️ SUBSTACK PODCAST FEATURE - COMPLETE SPECIFICATION

**NEW CONTENT TYPE ADDED:** Substack Podcast

This document contains all podcast-related features, blueprints, and SEO functionality for Builder #2.

---

## 📋 NEW CONTENT TYPE: SUBSTACK PODCAST

### **Platform Details:**
- **Name:** "Substack Podcast"
- **Color:** `#9B7A9F` (bg) + `#FFFFFF` (text)
- **Format:** Audio (recorded externally, app helps with scripting/planning)
- **Default Length:** "Nugget (3-5 minutes / 500-700 words)"
- **Default Lead Days:** 7 days (outline → record → edit → publish)
- **Default Effort:** 90 minutes (outlining 30m + recording 30m + light editing 30m)

### **Workflow Clarification:**
- App is for **PLANNING + SCRIPTING**, not recording audio
- User writes script/outline using blueprints in the app
- On publish date: User records externally (Substack audio tool, Riverside, etc.)
- App helps structure thoughts, not capture actual audio

---

## 🎯 PODCAST-SPECIFIC BLUEPRINTS

All 5 blueprint families apply to podcasts, with podcast-optimized subtypes:

### **1. STORY Family**
*Maps to "The moment patients wish you saw"*

**Subtypes:**
- **Waiting Room Moment** - Scene → what patients carry → insight → moves
- **Overheard Conversation** - Dialogue-driven story with lesson
- **Before/After** - What I expected vs what actually happened
- **The Quiet Part Out Loud** - Naming what patients don't say

**Podcast Structure Template (5 parts):**
```
1. Cold open (30-50 words / 10-20 sec)
   - Drop us into a scene fast
   - Options: scene-drop, detail, dialogue

2. The scene (150-200 words / 45-75 sec)
   - What happened, who was there, tension
   - Keep it tight: one setting, one moment

3. What patients are carrying (75-100 words / 45-60 sec)
   - Name the invisible load (fear, confusion, cost, shame, etc.)
   - This is where your perspective becomes the value

4. The insight (75-100 words / 45-60 sec)
   - The lesson in plain language
   - No jargon, one clean claim

5. Practical moves (150-200 words / 45-60 sec)
   - 2-3 actionable moves for teams
   - Wording swaps, workflow tweaks, UI patterns, handoff scripts
   
6. Close (30-50 words / 10-20 sec)
   - Memorable line + listener prompt
   - "If you've experienced this, what helped?"
```

**Total word count:** 500-700 words (3-5 minutes spoken)

---

### **2. PERSPECTIVE Family**
*Maps to "Translation" + general insights*

**Subtypes:**
- **Lost in Translation** - What patients hear vs what teams mean
- **Patient Culture Spotlight** - Unwritten rules and norms
- **What They're Really Asking** - Decoding patient questions
- **The Invisible Load** - Naming emotional/admin burdens

**Podcast Structure Template:**
```
1. Cold open with contrast (30-50 words)
2. The gap/disconnect (100-150 words)
3. Why it matters emotionally (75-100 words)
4. Reframe or rewording (100-150 words)
5. 2-3 language swaps or mindset shifts (100-150 words)
6. Close (30-50 words)
```

---

### **3. EDUCATION Family**
*Maps to "Design note"*

**Subtypes:**
- **Product Pattern Teardown** - One UI/UX pattern + impact + fix
- **Workflow Audit** - One broken process + downstream effects + redesign
- **Default Setting Deep Dive** - One default choice + consequences + alternatives
- **Friction Spotlight** - One admin barrier + ripple effects + solutions

**Podcast Structure Template:**
```
1. Cold open with the pattern/friction (30-50 words)
2. How it shows up (100-150 words)
3. What it costs patients (75-100 words)
4. Why it exists [optional context] (50-75 words)
5. 3 design moves to fix it (150-200 words)
6. Close (30-50 words)
```

---

### **4. ENGAGEMENT Family**
*Listener-driven content*

**Subtypes:**
- **Reader Question Response** - Answer listener submission
- **Crowdsource Wisdom** - Pose scenario, invite solutions
- **Field Report** - Share listener story with your layer of insight
- **Ask Me Anything Nugget** - Short Q&A format

**Podcast Structure Template:**
```
1. Cold open with the question/scenario (30-50 words)
2. Why this matters (75-100 words)
3. Your take or examples (150-250 words)
4. Invitation for more voices (50-75 words)
5. Close (30-50 words)
```

---

### **5. ANNOUNCEMENT Family**
*Your work/updates*

**Subtypes:**
- **Behind the Scenes** - What you're working on + why it matters
- **Seasonal Shift** - Topic focus change, new format, etc.
- **Collaboration Spotlight** - Guest intro or partnership
- **What I'm Learning** - Sharing WIP thinking

**Podcast Structure Template:**
```
1. Cold open with the news (30-50 words)
2. Context (100-150 words)
3. Why you're excited/what it means (75-100 words)
4. What listeners can expect (75-100 words)
5. Close (30-50 words)
```

---

## ✨ JAMIE AI FUNCTIONS FOR PODCAST

### **Function 8: Generate Cold Open Options**
**When:** User clicks "Generate cold open (Jamie)" in podcast wizard

**Input:**
- ContentItem (title, notes, blueprintFamily)

**Output:**
- 3 cold open options (30-50 words each)
- Labeled as: "Scene-drop", "Detail", "Dialogue"

**Example:**
```
Scene-drop: "The waiting room was packed. Nobody was talking, 
but everyone was communicating."

Detail: "The same question kept getting asked—quietly—like 
people didn't want to be 'difficult.'"

Dialogue: "'How long have you been waiting?' became the 
icebreaker. And also… the coping mechanism."
```

---

### **Function 9: Generate Listener Prompt**
**When:** User clicks "Generate listener prompt (Jamie)" at end of podcast outline

**Input:**
- ContentItem (title, notes, blueprintFamily)

**Output:**
- 2-3 listener prompt options (1 sentence each)

**Example:**
```
Option 1: "If you've experienced this, what helped?"
Option 2: "What's one waiting room moment you'll never forget?"
Option 3: "If you build in this space, where do you see this show up?"
```

---

### **Function 10: Audio Length Estimator**
**When:** Real-time in podcast editor

**Input:**
- Current word count

**Output:**
- Estimated spoken time (based on 150 words/minute average)
- Visual indicator: "✅ Perfect length (3-5 min)" or "⚠️ Too long (6+ min)"

**Formula:**
```
spokenMinutes = wordCount / 150
spokenSeconds = (wordCount % 150) / 2.5

If 500-700 words → "✅ Perfect length (3-5 min)"
If 400-499 words → "⚠️ Might be short (2-3 min)"
If 701-900 words → "⚠️ Running long (5-6 min)"
If 900+ words → "❌ Too long (6+ min) - consider trimming"
```

---

## 📝 SEO & SOCIAL COPY GENERATION (SUBSTACK POST + PODCAST)

### **New Jamie Function: Generate SEO Copy**

**When it appears:**
- Bottom of Drafting Focus Mode editor (for Substack Post/Podcast only)
- Content card action menu (when status = "Review" or "Scheduled")

**Button:** "Generate SEO Copy with Jamie" (sparkle icon)

### **Function 11: Generate SEO & Social Copy**

**Input:**
- ContentItem (title, content, blueprintFamily, tags, contentType)

**Output (in copyable popover/modal):**

```
📋 SEO & Social Copy (Generated by Jamie)

✏️ Meta Description (150-160 chars):
"Waiting rooms have their own culture—and if you build health tech 
without understanding it, you'll miss what patients need most."

🔗 URL Slug:
waiting-room-patient-culture

📱 Social Preview Text:
Waiting rooms teach you more about patient needs than any survey. 
Here's what I learned sitting with strangers for an hour—and what 
product teams should do differently.

📧 Email Subject Line Option 1:
The unspoken rules of waiting rooms (and what they mean for your product)

📧 Email Subject Line Option 2:
Patient culture is real—here's what it looks like

📊 Suggested Substack Tags:
patient experience, healthcare design, UX research, care delivery
```

**User workflow:**
1. Click "Generate SEO Copy with Jamie"
2. Jamie analyzes content
3. Modal pops up with all SEO fields pre-filled
4. User copies/pastes into Substack's "Post Settings" panel
5. User can edit as needed
6. User publishes on Substack

---

## 🤖 JAMIE AI PROMPT TEMPLATE FOR SEO

**System message:**
```
You are Jamie, Meredith's AI assistant. Generate SEO and social copy 
for Substack content. Be concise, human, clear. No hype. No jargon. 
No banned words (unlock, game-changing, synergy, leverage, deep dive, 
low-hanging fruit, circle back).
```

**User message:**
```
Generate SEO and social copy for this Substack content.

Title: {title}
Content Type: {contentType}
Blueprint: {blueprintFamily} - {blueprintSubtype}
Content preview: {first 500 words}

Generate:
1. Meta description (150-160 chars, compelling, includes key insight)
2. URL slug (lowercase, hyphens, readable, SEO-friendly)
3. Social preview text (1-2 sentences, curiosity-driven, hook-based)
4. Email subject line options (2 versions):
   - Option 1: Direct and clear
   - Option 2: Curiosity-driven
5. Substack tags (4-6 tags, specific to health tech/patient experience)

Meredith's voice: concise, human, clear. No hype. No clichés.

Return as formatted text (not JSON) with emoji section headers 
for easy copy/paste.
```

---

## 🗂️ UPDATED SETTINGS TAB

### **Section 1: Defaults (Lead Days + Effort Estimates)**

Add row for Substack Podcast:

| Content Type | Default Lead Days | Default Effort (mins) |
|---|---|---|
| LinkedIn Post | 3 | 45 |
| LinkedIn Article | 5 | 120 |
| Substack Post | 7 | 90 |
| **Substack Podcast** | **7** | **90** |

**Breakdown for podcast:**
- Outlining: 30 minutes
- Recording: 30 minutes
- Light editing: 30 minutes
- Total: 90 minutes

---

## 📊 UPDATED CALENDAR TAB

### **Scheduling Popover - Step 1: Choose Content Type**

Radio buttons:
- ⚪ LinkedIn Post
- ⚪ LinkedIn Article
- ⚪ Substack Post
- ⚪ **Substack Podcast** ← NEW

When "Substack Podcast" selected:
- Step 2: Choose existing Idea OR create new
- Step 3: Confirm scheduling
- Card shows podcast icon 🎙️ on calendar

---

## 🎨 UI/UX DETAILS

### **Podcast Icon:**
Use `🎙️` or `<Mic />` from Lucide React

### **Platform Chip Color:**
Background: `#9B7A9F`  
Text: `#FFFFFF`

### **Podcast-Specific Badges:**
- "3-5 min" length badge (for podcast cards)
- "Script ready" status indicator (when outline complete)
- "🎙️ Record by [date]" reminder (leadDays countdown)

---

## 🚀 IMPLEMENTATION CHECKLIST FOR BUILDER #2

### **Phase 1: Add Podcast Type**
- [ ] Add "Substack Podcast" to contentType enum
- [ ] Add platform color `#9B7A9F` to color constants
- [ ] Update scheduling popover to include podcast option
- [ ] Add podcast default settings (7 days, 90 mins)

### **Phase 2: Podcast Blueprints**
- [ ] Add podcast-specific subtypes to blueprint catalog
- [ ] Create 5-part structure template for each family
- [ ] Add word count targets per section

### **Phase 3: Jamie Functions**
- [ ] Build "Generate cold open" function (3 options)
- [ ] Build "Generate listener prompt" function (2-3 options)
- [ ] Build audio length estimator (real-time word count → minutes)

### **Phase 4: SEO Generator**
- [ ] Build "Generate SEO Copy" button (Substack Post + Podcast only)
- [ ] Create modal/popover with formatted output
- [ ] Enable copy-to-clipboard for each field
- [ ] Add SEO generation to Jamie API endpoints

### **Phase 5: UI Polish**
- [ ] Add podcast icon to calendar cards
- [ ] Style podcast chips with purple color
- [ ] Add "Script ready" status indicator
- [ ] Test full podcast workflow (idea → outline → schedule → publish)

---

## 📝 NOTES FOR BUILDER #2

### **Recording Clarification:**
The app does NOT record audio. It helps with:
1. Planning (idea inbox → wizard)
2. Outlining (structured script writing)
3. Scheduling (calendar management)

User records audio externally on publish date.

### **SEO Copy Usage:**
User must manually copy/paste generated SEO fields into Substack's post settings. This is intentional—keeps the app simple, no Substack API integration needed.

### **Word Count Targets:**
- Podcast: 500-700 words = 3-5 minutes spoken
- Substack Post: varies (no strict limit)
- LinkedIn Post: 250-500 words
- LinkedIn Article: 900-1,300 words

---

## ✅ SUMMARY

**New content type:** Substack Podcast  
**Platform color:** `#9B7A9F`  
**Default settings:** 7 days lead, 90 mins effort  
**New Jamie functions:** Cold opens, listener prompts, audio length estimator, SEO generator  
**Applies to:** Substack Post AND Substack Podcast  

All specs ready for Builder #2 implementation! 🎯
