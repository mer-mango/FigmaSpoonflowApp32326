# FIGMA MAKE BUILDER #2 - PHASED PROMPT STRATEGY
## Optimized for AI Builder Understanding

---

## 📋 HOW TO USE THIS FILE

**Copy/paste these prompts IN ORDER into Figma Make's input field.**

Each prompt is designed to:
- Build on previous context
- Avoid overwhelming the AI
- Lock in critical constraints early
- End with "acknowledge and wait" instruction

**Total batches:** 7 prompts (Initial + 5 info batches + Final build instruction)

---

## 🚀 PROMPT 0: INITIAL CONTEXT (START HERE)

```
You're building a standalone web app called "Just Content" for Meredith, 
a solo health tech consultant. This app helps her:

1. Pull newsletter emails via Gmail API
2. Use AI (Jamie) to extract individual articles and rank them by relevance
3. Convert high-value articles into content ideas
4. Plan content with a calendar (1 publish slot per day max)
5. Track content through workflow: Idea → Drafting → Review → Scheduled → Published
6. Manage content creation blueprints (5 families, 25 subtypes)

CRITICAL CONSTRAINTS:
- This is a STANDALONE app (no CRM, tasks, meetings, contacts, calendar integrations)
- Single user only (Meredith)
- 1 content slot per day (hard cap, strictly enforced)
- All interactions via popovers/modals (NO drag-and-drop)
- publishDate field (NOT dueDate - this is critical for consistency)
- Capitalized status values: "Idea", "Drafting", "Review", "Scheduled", "Published"

IMPORTANT: I'm going to give you detailed specifications in 5 batches. 

⛔ DO NOT START BUILDING YET.

After each batch, acknowledge what you received and wait for the next batch.

Only start building when I give you the final "BUILD" instruction.

Acknowledge that you understand and are ready for Batch 1.
```

---

## 📦 PROMPT 1: CRITICAL CONSTRAINTS + NAMING STANDARDS

```
BATCH 1: CRITICAL CONSTRAINTS + NAMING STANDARDS

EXACT FIELD NAMES (use these EXACTLY - do not rename):

ContentItem:
- id: string
- title: string
- notes?: string
- status: "Idea" | "Drafting" | "Review" | "Scheduled" | "Published"
- contentType?: "LinkedIn Post" | "LinkedIn Article" | "Substack Post" | "Substack Podcast"
- publishDate?: string  // YYYY-MM-DD (NOT dueDate, NOT scheduledDate)
- tags: string[]
- blueprintFamily?: "Story" | "Education" | "Perspective" | "Engagement" | "Announcement"
- blueprintSubtype?: string
- leadDays?: number  // Days of prep runway before publishDate
- effortMins?: number  // Estimated writing time in minutes
- sourceType?: "manual" | "newsletter" | "url" | "quick_text" | "idea_inbox"
- sourceUrl?: string
- jamieSnippet?: string  // AI-generated summary
- jamieHook?: string  // AI-generated hook direction
- contentPillarTags?: string[]  // AI-suggested pillar tags
- workingOn?: boolean  // Currently in focus mode
- createdAt: string  // ISO timestamp
- updatedAt: string  // ISO timestamp

InboxItem (newsletter-derived content):
- id: string
- senderName: string
- senderEmail: string
- subject?: string
- sentDateIso: string
- extractedTitle: string
- extractedUrl?: string | null
- extractedExcerpt?: string
- fingerprint: string  // For deduplication
- relevanceScore?: number  // 0-100
- finalScore?: number  // Computed score (relevance + recency + penalties)
- suggestedTags?: string[]
- suggestedBlueprintFamily?: string
- suggestedBlueprintSubtype?: string
- suggestedBlueprintWhy?: string
- snippet?: string  // Jamie's summary
- whyItMatters?: string  // Jamie's relevance explanation
- hookDirection?: string  // Jamie's hook suggestion
- inboxStatus: "new" | "dismissed" | "converted_to_idea"
- createdAt: string

PLATFORM COLORS (exact hex codes):
- LinkedIn Post: #7B96AC (bg) + #FFFFFF (text)
- LinkedIn Article: #3D5A6C (bg) + #FFFFFF (text)
- Substack Post: #D4A5B8 (bg) + #FFFFFF (text)
- Substack Podcast: #9B7A9F (bg) + #FFFFFF (text)

BRAND COLORS:
- Main: #2f829b, #034863
- Neutrals: #f5fafb, #ddecf0
- Accent: #6b2358
- Muted (internal): #a8998f, #a89db0

CRITICAL RULES:
1. Use publishDate (NOT dueDate, NOT scheduledDate, NOT targetDate)
2. Capitalized statuses ("Idea" not "idea", "Drafting" not "draft")
3. ContentItem and InboxItem are separate entities (don't merge)
4. 1 slot per day means: if publishDate = "2025-01-15" exists, 
   no other item can have publishDate = "2025-01-15"
5. No drag-and-drop anywhere (all interactions via popovers/modals)

BANNED WORDS (never use in AI-generated content):
- unlock, game-changing, synergy, leverage, deep dive, 
  low-hanging fruit, circle back

Acknowledge Batch 1 received. Tell me what the most critical 
constraint is. Wait for Batch 2.
```

---

## 📦 PROMPT 2: APP STRUCTURE + NAVIGATION

```
BATCH 2: APP STRUCTURE + NAVIGATION

TOP-LEVEL NAVIGATION (3 tabs):
1. Content
2. Calendar  
3. Settings

DEFAULT VIEW: Content tab

---

CONTENT TAB (2 sections):

Section A: Content Ideas Inbox (top of page)
- Header: "Content Ideas Inbox"
- Buttons: "Pull newsletters" | "Quick Add"
- Shows inbox items with status = "new"
- Each card displays:
  * Newsletter sender name + sent date
  * Extracted article title
  * Snippet (2-3 lines)
  * "Why this matters" (1 line)
  * Suggested pillar tags (0-3 chips)
  * Jamie suggestion box:
    - Suggested blueprint (family + subtype)
    - Why this blueprint fits
    - Hook direction
  * Actions:
    - Primary button: "Send to Wizard" (converts to Idea + opens wizard)
    - Secondary button: "Save to Ideas" (converts to Idea, no wizard)
    - Dismiss X (with 15-second undo toast)
- Top 5 section: Pin highest-scoring 5 items at top

Section B: Content Library (below inbox)
- List or Kanban view of ContentItems
- Filters: Status, Blueprint Family, Tags, Content Type
- Search bar
- Each card shows:
  * Title
  * Status chip
  * publishDate chip (clickable)
  * Blueprint chip
  * leadDays + effortMins (if set)
  * Actions: "Open" / "Edit" / "Start" (if Idea) / "Continue" (if Drafting/Review)

---

CALENDAR TAB:

Month view (default):
- Bingo-style monthly grid
- Each day cell shows:
  * Date
  * If empty: hover shows "+", click opens scheduling popover
  * If occupied: shows Scheduled Content Card

Week view (toggle):
- Same as month, just 7 days in larger cells

Scheduling popover (appears IN-CELL, not overlay):
Step 1: Choose content type (LinkedIn Post | LinkedIn Article | Substack Post)
Step 2: Choose Idea (searchable dropdown of status = "Idea" items)
        OR "Create new idea (Quick Add)"
Step 3: Confirm → item now has publishDate = this date

Scheduled Content Card (inside day cell):
- Title (truncated)
- Content type chip
- Status chip
- publishDate chip (clickable → reschedule)
- "Est: X mins • Lead: Y days" (inline editable)

Focus shading:
- Shade N days before publishDate (where N = leadDays)
- Example: publishDate Jan 20, leadDays 5 → shade Jan 15-19
- Shading updates instantly when leadDays edited inline

Reschedule (via publishDate chip):
- Click publishDate chip → date picker
- Select new date:
  * If new date empty → move card to new date
  * If new date occupied → block with toast "Only one slot per day"

---

SETTINGS TAB (5 sections):

1. Defaults: Lead Days + Effort Estimates
   - Per content type, set default leadDays + effortMins
   - Auto-populate when scheduling, but editable per item

2. Notifications
   - Rule builder: trigger (due_date), offset days, time, applies to statuses
   - Toggle rules on/off
   - Message templates with {title}, {publishDate} variables

3. Blueprints Manager
   - Edit/add blueprint subtypes
   - Edit templates (markdown textarea)
   - Toggle active/inactive

4. Topic Preferences
   - Focus topics (string array)
   - Avoid topics (string array)

5. AI Preferences (Jamie)
   - Voice guidelines (tone, banned words, preferred phrases)
   - Writing examples (paste URL or text)
   - Feedback stats (thumbs up/down counts)

Acknowledge Batch 2 received. Tell me how many content slots 
are allowed per day. Wait for Batch 3.
```

---

## 📦 PROMPT 3: CONTENT WIZARD + JAMIE AI BASICS

```
BATCH 3: CONTENT WIZARD + JAMIE AI BASICS

CONTENT WIZARD (modal or dedicated page):

4-step flow:

Step 1: Idea
- Title field (prefilled if from inbox)
- Notes textarea (prefilled with snippet + whyItMatters if from inbox)
- Tags (prefilled with suggestedTags if from inbox)

Step 2: Platform
- Radio buttons: LinkedIn Post | LinkedIn Article | Substack Post

Step 3: Length
- Short, Medium, Long (or skip - not critical)

Step 4: Blueprint
- Choose family: Story | Education | Perspective | Engagement | Announcement
- Choose subtype (dropdown per family)
- If from inbox: highlight Jamie's suggested blueprint with "✨ Jamie suggested" badge
- Load template structure when blueprint selected
- Button: "Generate hook options (Jamie)" → shows 3 hook options

On wizard complete:
- Save ContentItem
- Set status based on how far user got:
  * Completed all steps → "Drafting"
  * Saved early → "Idea"

---

JAMIE AI FUNCTIONS (overview - detailed prompts in Batch 4):

Function 1: Newsletter Extraction
- Input: Gmail email (HTML + text)
- Output: Array of extracted items (title, URL, excerpt per article)
- Exclude boilerplate (unsubscribe, preferences, social share links)

Function 2: Scoring + Tagging
- Input: Extracted item + user topic profile
- Output: relevanceScore (0-100), suggestedTags (0-3), reason

Scoring rubric:
- 90-100: Directly in wheelhouse
- 70-89: Relevant, easy angle
- 40-69: Adjacent, needs sharp POV
- 0-39: Off-topic

Function 3: Blueprint Recommendation
- Input: Item + tags
- Output: suggestedBlueprintFamily, suggestedBlueprintSubtype, why (1-2 sentences)

Heuristics:
- speaking_patient OR empathy_as_strategy → Perspective
- full_patient_ecosystem OR fit_real_care_journeys → Story
- co_design_hcd OR participatory_medicine → Education
- Needs community input → Engagement
- Meredith update → Announcement

Function 4: Snippet Generation
- Input: Item
- Output: 2-3 sentence summary in Meredith's voice (concise, human, clear)

Function 5: "Why It Matters" Generation
- Input: Item + topic profile
- Output: 1 sentence connecting to Meredith's wheelhouse

Function 6: Hook Direction (inbox)
- Input: Item + blueprint
- Output: 1-2 sentences of direction (NOT polished hook)
- Example: "Lead with the patient quote, then the stat"

Function 7: Hook Options (wizard, on-demand)
- Input: ContentItem + blueprint + contentType
- Output: 3 hook options (1-2 lines each)
- Meredith's voice, optimized for platform

Top 5 Ranking (DETERMINISTIC - use code, not AI):
```
finalScore = relevanceScore 
           + recencyBonus 
           - avoidPenalty 
           - duplicatePenalty

recencyBonus:
  <= 3 days old: +12
  4-7 days: +8
  8-14 days: +4
  older: +0

avoidPenalty:
  matches avoid topics: -30

duplicatePenalty:
  fingerprint match: skip entirely
  same domain + similar title: -20

Sort by finalScore descending, take top 5
```

Acknowledge Batch 3 received. Tell me: should Jamie pick the 
Top 5, or should code compute finalScore and pick Top 5? 
Wait for Batch 4.
```

---

## 📦 PROMPT 4: BACKEND + DATA STORAGE

```
BATCH 4: BACKEND + DATA STORAGE

TECH STACK (recommended):
- Frontend: React + TypeScript + Tailwind CSS (Figma Make default)
- Backend: Supabase (Postgres database + Edge Functions)
- AI: OpenAI GPT-4 API
- Scheduler: Supabase cron (or serverless cron)
- Gmail: OAuth 2.0 + refresh token stored encrypted

---

DATABASE TABLES:

settings (single row, user ID = 1):
- id
- focus_topics (text array)
- avoid_topics (text array)
- default_lead_days_linkedin_post (integer)
- default_effort_mins_linkedin_post (integer)
- default_lead_days_linkedin_article (integer)
- default_effort_mins_linkedin_article (integer)
- default_lead_days_substack (integer)
- default_effort_mins_substack (integer)
- notification_rules (jsonb)
- blueprint_catalog (jsonb)
- google_refresh_token (text, encrypted)
- updated_at (timestamp)

inbox_items:
- id (uuid)
- sender_name (text)
- sender_email (text)
- subject (text)
- sent_date_iso (timestamp)
- extracted_title (text)
- extracted_url (text nullable)
- extracted_excerpt (text)
- fingerprint (text unique)  ← for deduplication
- relevance_score (integer)
- final_score (integer)
- suggested_tags (text array)
- suggested_blueprint_family (text)
- suggested_blueprint_subtype (text)
- suggested_blueprint_why (text)
- snippet (text)
- why_it_matters (text)
- hook_direction (text)
- inbox_status (text: new|dismissed|converted_to_idea)
- created_at (timestamp)

content_items:
- id (uuid)
- title (text)
- notes (text)
- status (text: Idea|Drafting|Review|Scheduled|Published)
- content_type (text: LinkedIn Post|LinkedIn Article|Substack Post)
- publish_date (date)  ← CRITICAL: NOT due_date
- tags (text array)
- blueprint_family (text)
- blueprint_subtype (text)
- lead_days (integer)
- effort_mins (integer)
- source_type (text)
- source_url (text)
- jamie_snippet (text)
- jamie_hook (text)
- content_pillar_tags (text array)
- working_on (boolean)
- created_at (timestamp)
- updated_at (timestamp)

notifications_queue:
- id (uuid)
- content_item_id (uuid foreign key)
- fire_at (timestamp)
- rule_id (text)
- status (text: pending|sent|canceled)
- channel (text: in_app|email)
- title (text)
- message (text)
- created_at (timestamp)

notifications_in_app:
- id (uuid)
- content_item_id (uuid foreign key)
- created_at (timestamp)
- title (text)
- message (text)
- is_read (boolean)

---

API ENDPOINTS (minimal set):

Settings:
GET  /api/settings
PUT  /api/settings

Inbox:
POST /api/inbox/pull  ← triggers Gmail fetch + AI processing
GET  /api/inbox?status=new
POST /api/inbox/:id/dismiss
POST /api/inbox/:id/convertToIdea
POST /api/inbox/quickAdd

Content:
GET  /api/content?status=...&search=...
POST /api/content
PUT  /api/content/:id

Calendar:
GET  /api/calendar?start=YYYY-MM-DD&end=YYYY-MM-DD

Notifications:
GET  /api/notifications?status=unread
POST /api/notifications/:id/markRead

Jamie AI:
POST /api/jamie/extractNewsletter
POST /api/jamie/scoreAndTag
POST /api/jamie/generateHooks

---

NOTIFICATION SYSTEM:

When ContentItem created/updated AND (publishDate OR status OR leadDays changes):
→ Run recomputeJobsForContentItem(itemId)

recomputeJobsForContentItem:
1. Cancel all pending jobs for this item
2. If status = Published, skip (no future jobs)
3. For each enabled notification rule:
   - Check if status matches rule.appliesToStatuses
   - Compute fireDate = publishDate + offsetDays
   - Compute fireAt = combineDateTime(fireDate, rule.timeOfDay)
   - If fireAt < now, skip
   - Create pending job

Cron job (runs every 5 minutes):
1. Select notifications_queue where status=pending AND fire_at <= now
2. For each: insert into notifications_in_app
3. Update job status = sent

---

GMAIL INTEGRATION (v1 - REQUIRED):

Setup (one-time):
1. Create Google Cloud project
2. Enable Gmail API
3. Create OAuth 2.0 credentials
4. Run OAuth flow to get refresh_token
5. Store refresh_token encrypted in settings table

Pull newsletters (manual button):
1. Use refresh_token to get access_token
2. Fetch unread emails from inbox (or label:newsletters)
3. Parse each email (sender, subject, date, HTML body)
4. Call Jamie AI to extract items
5. Call Jamie AI to score/tag each item
6. Compute finalScore deterministically
7. Insert into inbox_items table
8. Mark email as read (optional)

Acknowledge Batch 4 received. Tell me: what field name do we use 
for the publish date? Wait for Batch 5 (final info batch).
```

---

## 📦 PROMPT 5: JAMIE AI PROMPTS + MIGRATION

```
BATCH 5: JAMIE AI PROMPTS + MIGRATION PLAN

JAMIE AI PROMPT TEMPLATES:

---

PROMPT 1: EMAIL_ITEM_EXTRACTION

System message:
"You are an extraction engine. Extract individual content items 
(articles, resources) from newsletter emails. Return strict JSON only. 
Exclude boilerplate (unsubscribe, preferences, privacy, view in browser, 
social share links, ad trackers)."

User message:
"From this newsletter email, extract the individual content items worth reading.

Email metadata:
Sender: {sender_name} <{sender_email}>
Subject: {subject}
Sent: {sent_date_iso}

Email content:
{email_html or email_text}

Return JSON:
{
  "items": [
    {
      "title": "...",
      "url": "..." or null,
      "short_excerpt": "1-2 sentences max",
      "confidence": 0.0-1.0,
      "content_type_guess": "article|research|opinion|event|other"
    }
  ]
}"

---

PROMPT 2: ITEM_SCORING_AND_BLUEPRINT

System message:
"You are Jamie, Meredith's AI assistant. Help decide what content is worth 
writing about. Be concise, human, and specific. No hype. No clichés. 
Banned words: unlock, game-changing, synergy, leverage, deep dive, 
low-hanging fruit."

User message:
"Analyze this content item and return strict JSON.

Item:
Title: {title}
URL: {url}
Excerpt: {short_excerpt}

Source:
Sender: {sender_name}
Newsletter: {subject}
Date: {sent_date_iso}

Meredith's focus topics:
{focus_topics array}

Meredith's avoid topics:
{avoid_topics array}

Allowed pillar tags:
speaking_patient, fit_real_care_journeys, full_patient_ecosystem, 
empathy_as_strategy, co_design_hcd, participatory_medicine, 
multi_stakeholder_alignment, what_good_care_looks_like

Blueprint catalog (families + subtypes):
{blueprint_catalog json}

Return JSON:
{
  "relevance_score": 0-100,
  "relevance_reason": "1 sentence",
  "suggested_pillar_tags": ["tag1", "tag2"],  // 0-3 tags max
  "suggested_blueprint": {
    "family": "Story|Education|Perspective|Engagement|Announcement",
    "subtype": "string",
    "why": "1-2 sentences"
  },
  "snippet": "2-3 sentences summarizing the core idea",
  "why_it_matters": "1 sentence tying to Meredith's wheelhouse",
  "hook_direction": "1-2 sentences of direction, not a polished hook"
}"

---

PROMPT 3: GENERATE_HOOKS (on-demand in wizard)

System message:
"You are Jamie. Generate opening hooks for content in Meredith's voice. 
Concise, human, clear. No hype. No clichés. No banned words."

User message:
"Generate 3 opening hooks for this content.

Content:
Title: {title}
Notes: {notes}

Blueprint: {family} - {subtype}
Platform: {contentType}

Return 3 hook options (1-2 lines each), numbered 1-3."

---

MIGRATION PLAN (from current app to new app):

Export from current app (run in browser console):
```javascript
const contentItems = JSON.parse(localStorage.getItem('allContentItems') || '[]');
console.log(JSON.stringify({ items: contentItems }, null, 2));
// Copy output, save as content-export.json
```

Transform data:
- scheduledDate → publishDate
- platform → contentType
- lastUpdated → updatedAt
- createdOn → createdAt
- status: lowercase → Capitalized
  * idea → Idea
  * draft → Drafting
  * ready to schedule → Review
  * scheduled → Scheduled
  * published → Published
- platform normalization:
  * Substack → Substack Post
  * (others already correct)

Conflict handling:
- If 2+ items have same publishDate:
  * Keep first item as Scheduled
  * Set others to status=Idea, publishDate=null
  * Generate conflict report

Import endpoint:
POST /api/migrate/importContent
{
  "items": [...transformed items...],
  "options": {
    "normalizeStatuses": true,
    "normalizePlatforms": true,
    "handleConflicts": "keep_first"
  }
}

---

Acknowledge Batch 5 received. Confirm: are you ready for the 
final BUILD instruction?
```

---

## 🚀 PROMPT 6: BUILD INSTRUCTION (FINAL)

```
BATCH 6: BUILD INSTRUCTION

You now have all the information needed to build "Just Content".

BUILD THIS APP with the following priorities:

PHASE 1: Core Structure (build first)
1. Set up Supabase database with tables from Batch 4
2. Create Settings page with Defaults section only
3. Build GET/PUT /api/settings endpoints
4. Create Content Library view (list of ContentItems)
5. Build GET /api/content and POST /api/content endpoints
6. Create basic ContentItem cards with status filtering

PHASE 2: Calendar (build second)
7. Build Calendar tab with month view grid
8. Implement in-cell scheduling popover (choose type → choose idea → confirm)
9. Enforce 1-slot-per-day rule (block if publishDate occupied)
10. Build publishDate chip with reschedule (click → date picker → move if empty)
11. Implement focus shading algorithm (shade leadDays before publishDate)
12. Make leadDays + effortMins inline editable, shading updates instantly

PHASE 3: Inbox + Jamie (build third)
13. Set up Gmail OAuth + API integration (Batch 4 instructions)
14. Build POST /api/inbox/pull endpoint
15. Implement Jamie AI newsletter extraction (Prompt 1 from Batch 5)
16. Implement Jamie AI scoring/tagging (Prompt 2 from Batch 5)
17. Compute finalScore deterministically (Batch 3 formula)
18. Build Content Ideas Inbox UI with Top 5 section
19. Build Quick Add modal (paste URL or text)
20. Build inbox card actions: Save to Ideas, Send to Wizard, Dismiss (15s undo)

PHASE 4: Wizard + Notifications (build fourth)
21. Build Content Wizard (4 steps from Batch 3)
22. Implement prefilling from inbox items
23. Build Jamie hook generation (Prompt 3 from Batch 5, on-demand button)
24. Build notification rules UI in Settings
25. Implement notification job generation (recomputeJobsForContentItem)
26. Set up cron job (every 5 min) to send pending notifications
27. Build in-app notification center (bell icon in nav)

PHASE 5: Settings + Polish (build fifth)
28. Complete Settings tab (all 5 sections from Batch 2)
29. Build Blueprints Manager (edit subtypes, edit templates)
30. Build Topic Preferences UI
31. Build AI Preferences UI
32. Add migration endpoint + test with sample data
33. Polish UI (spacing, colors, empty states)
34. Test all critical paths

---

ACCEPTANCE CRITERIA (app is done when):

✅ Inbox pulls newsletters, extracts items, shows Jamie suggestions
✅ Top 5 uses deterministic finalScore (not AI picking)
✅ "Save to Ideas" converts inbox → content item (status=Idea)
✅ "Send to Wizard" opens wizard with prefilled title/notes/tags/blueprint
✅ Calendar month view exists, in-cell scheduling works
✅ 1-slot-per-day enforced (blocks scheduling conflicts)
✅ publishDate chip reschedules (moves card if target empty)
✅ leadDays inline editable, shading updates instantly
✅ Notification rules configurable in Settings
✅ Cron sends in-app notifications
✅ Blueprints Manager allows editing templates
✅ Migration tested with sample data

---

CRITICAL REMINDERS:

🔒 Use EXACT field names from Batch 1 (publishDate not dueDate!)
🔒 Use EXACT status values from Batch 1 ("Idea" not "idea")
🔒 1 slot per day = hard constraint everywhere
🔒 No drag-and-drop (all interactions via popovers)
🔒 Jamie = OpenAI GPT-4 API calls with prompts from Batch 5
🔒 Gmail = OAuth 2.0, store refresh_token encrypted

---

If ANYTHING is unclear, ASK before building.
Examples of when to ask:
- "Should the Save to Ideas button be blue or outlined?"
- "Should dismissed items stay in database or be deleted?"
- "Should notification templates support HTML or just plain text?"

No question is too small. Clarity > speed.

Now: BUILD "Just Content" following Phase 1-5 order above.
Start with Phase 1 (Core Structure).
```

---

## ✅ END OF PHASED PROMPT STRATEGY

**Total prompts:** 7 (Initial + 5 info batches + Final build)

**Estimated time for Builder #2:**
- Reading/acknowledging batches: 15 minutes
- Building Phase 1-5: 4-5 weeks

**Key benefits of this approach:**
1. ✅ Prevents information overload
2. ✅ Locks in critical constraints early (naming, 1-slot rule)
3. ✅ Builds context progressively
4. ✅ Clear "wait" instructions between batches
5. ✅ Final prompt has complete context to reference
6. ✅ Each batch has verification question (confirms understanding)

---

**USE THIS FILE:** Copy/paste prompts 0-6 in order into Figma Make.