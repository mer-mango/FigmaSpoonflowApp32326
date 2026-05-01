# INITIAL INFO FOR BUILDER #2 - RAW SPECS (Unedited)
## Complete 3-Batch Specification + Context

This file contains the ORIGINAL specifications as provided, before any refinements. Use this as a reference to ensure nothing was lost during the polishing process.

---

## BATCH 1 — "JUST CONTENT" APP (STANDALONE) — FRONT-END + UX SPEC

You are building a standalone web app called "Just Content" for a single user (Meredith). This app is a focused extraction of the Content module from a larger productivity platform. Do NOT include CRM, task management, meetings, finance, or any non-content features. The app should feel calm, clean, and low cognitive load.

PRIMARY GOAL
Help Meredith publish consistently by:
1) bringing high-signal content into an "Ideas Inbox" (newsletter pulls + quick add)
2) converting items into Ideas and sending them into an existing Content Wizard flow
3) planning due dates via a simple calendar grid (month + week view)
4) showing "focus lead-up shading" based on lead days + estimated writing time
5) enabling rescheduling via a due date chip (move the scheduled item if the target day is empty)
6) using standalone notification rules configured in this app's Settings (no dependency on the original app)

GLOBAL CONSTRAINTS
- Only 1 scheduled content slot per day (hard cap).
- No drag-and-drop. All interactions happen inside the calendar cell via hover/click + popover.
- Due date chip on a scheduled card is clickable; opens date picker; reschedules/moves the card if the target date is empty.
- Estimated writing time + lead days auto-populate from settings defaults when selecting content type, but can be inline-edited per scheduled item; shading updates instantly.
- This is a standalone app. It can reuse the content wizard concept, but must not rely on the original system's CRM/tasks architecture.

INFORMATION ARCHITECTURE / NAV
Top nav tabs:
1) Content
2) Calendar
3) Settings
Default landing: Content tab.

------------------------------------------------------------
1) CONTENT TAB (main page)
At the top of this page: "Content Ideas Inbox" section (new).
Below it: Content Library (existing content workflow and tracking).

1A) Content Ideas Inbox (top of Content page)
Purpose: show high-signal content opportunities waiting for triage.

Header row:
- Title: "Content Ideas Inbox"
- Buttons on right:
  1) "Pull newsletters" (manual pull)
  2) "Quick Add" (paste URL or paste text)

Inbox card design ("Content Source Card")
Required fields on card:
- Newsletter/source name (sender name)
- Newsletter sent date (sent date only)
- Item title (article title or best-guess heading)
- Snippet (2–3 lines)
- "Why this matters for my wheelhouse" (1 line)
- Suggested pillar tags (0–3 chips, optional)
- Jamie suggestion block:
   - "Suggested blueprint" (family + subtype if applicable)
   - "Why this blueprint fits" (1–2 lines)
   - "Hook direction" (1–2 lines; direction only, not fully polished)

Card actions:
- Primary: "Send to Wizard" (also sets status=Idea AND opens Wizard)
- Secondary: "Save to Ideas" (sets status=Idea, does NOT open Wizard)
- Dismiss: "X" (removes from inbox; allow Undo toast for 15 seconds)

No "approve sender" UI needed; assume only approved senders reach the newsletter mailbox.

Quick Add modal
- Two tabs:
  1) Paste URL
  2) Paste Text
- Submit button: "Create Idea"
Behavior after submit:
- Create an inbox card (or optionally auto-convert to Idea); keep the UX simple and consistent.

1B) Content Library (below inbox)
This is the core tracker for content work.

Provide either:
- A Kanban column view by status, OR
- A list view with filters (preferred if simpler)
Must include:
- Search
- Filters: Status, Blueprint Family, Tags, Content Type
Content item card includes:
- Title
- Status chip
- Due date chip (clickable)
- Blueprint chip (if selected)
- Estimated writing time + lead days (if set)
- CTA: "Open" / "Edit" and context-aware "Start/Continue"
- Optional: "Send to Wizard" if item is still at Idea stage

IMPORTANT:
When an inbox card becomes an Idea (Save to Ideas or Send to Wizard):
- It disappears from the inbox
- It appears in the Content Library under status = Idea.

------------------------------------------------------------
2) CALENDAR TAB (publishing planner)
Goal: plan publish/due dates first, then assign an Idea into the day.

Views:
- Month view (default): big blank "bingo-style" monthly grid
- Week view (zoom in): same interaction model, bigger cells, more readable details

Month/Week toggle:
- Control at top right: Month | Week

2A) Calendar cell behavior (applies to Month + Week)
Empty day cell:
- On hover: show subtle centered "+"
- Click "+" opens an anchored popover (inside the cell, no drag/drop)

Popover flow (in-cell scheduling)
Step 1: Choose content type:
- LinkedIn Post
- LinkedIn Article
- Substack Post

Step 2: Choose the Idea to assign:
- Searchable dropdown of content items with status = Idea
- Option at bottom: "Create new idea (Quick Add)" → opens Quick Add modal then returns

Step 3: Confirm schedule:
- On confirm:
  - Set/Update the Content Item's due date to this day (this becomes the scheduled day)
  - Set content type on the Content Item (if not already set)
  - Day cell now displays a "Scheduled Content Card"

Hard rule:
- If a day already has a scheduled item, the "+" is hidden/disabled.
- If user tries to schedule anyway (edge case), show toast "Only one content slot per day."

2B) Scheduled Content Card (inside the day cell)
Displays:
- Title (truncate)
- Content type chip
- Status chip (Idea/Drafting/Review/Scheduled/Published)
- Due date chip (clickable)
- Mini meta line: "Est: X hrs • Lead: Y days"
- Inline edit:
   - Clicking "Est: X hrs" makes it editable (hours or minutes)
   - Clicking "Lead: Y days" makes it editable
   - Include a small "Reset to default" option in the edit state

2C) Focus shading span ("work-back" overlay)
- Based on lead days: shade the prior N days leading up to due date.
- Keep it simple: soft translucent overlay across those calendar cells.
- Estimated writing time does NOT need to change number of shaded days; it can affect intensity or label, but leadDays determines span length.
- Shading updates instantly when leadDays is edited.
- If shading overlaps another item's span (rare with 1/day), just allow overlap (darker shade).

2D) Due date chip behavior (reschedule + move)
- Clicking due date chip opens date picker.
- When user selects new date:
  - If target day is empty:
     - Move the scheduled card to that day
     - Update the content item's due date
     - Recompute shading span
  - If target day already has a scheduled item:
     - Block and show toast "That day already has a scheduled item."

2E) Status progression on calendar
- Status chip updates as content moves through statuses.
- Published should look "done" (muted styling or check icon) but remain visible as history.

------------------------------------------------------------
3) SETTINGS TAB (standalone Just Content settings)
This app needs its own settings and notification configuration (standalone).

Settings sections:

3A) Defaults: Lead Days + Estimated Writing Time (per content type)
For each content type:
- Default lead days (number)
- Default estimated writing time (hours with decimals OR minutes)
These defaults auto-populate when scheduling content type in the calendar.
User can override inline per scheduled content item.

3B) Notifications (standalone rules UI)
Build a simple rule editor for notifications based on:
- Status
- Due date offset
- Time of day

Allow:
- Toggle which statuses trigger notifications
- Offset options like:
   - "X days before due date"
   - "Day of due date"
- A default notification time (e.g., 9:00 AM)
Keep the UI simple: list of rules with toggles + number inputs.

NOTE: You are only building the settings UI now; backend scheduling logic will be defined in a later batch.

3C) Blueprints Manager (editable)
A settings area where Meredith can:
- View blueprint families (Story, Education, Perspective, Engagement, Announcement)
- View/edit subtypes under each family
- Edit each subtype's template structure (markdown textarea is fine)
- Add a new subtype
- Toggle subtype active/inactive

3D) Topic Preferences (lightweight)
Settings fields:
- Focus topics/keywords (list input)
- Avoid topics (list input)
This will be used for ranking logic later; for now just build the UI.

------------------------------------------------------------
4) CONTENT WIZARD (modal or dedicated page)
Implement the core writing workflow here (standalone).

Wizard needs to:
- Start from an Idea (prefilled from Inbox or from Content Library)
- Choose content type (LinkedIn Post/Article/Substack)
- Choose blueprint family + subtype (highlight Jamie suggestion if provided)
- Generate/Load an outline template (based on blueprint)
- Save progress + move status forward:
   Idea → Drafting → Review → Scheduled → Published

When user clicks "Send to Wizard" from Inbox:
- Create the Content Item with status=Idea
- Open wizard with prefilled:
  - title
  - notes/snippet
  - suggested tags
  - suggested blueprint (highlighted but editable)

No need for an advanced editor; a clean structured editor with sections is enough.

------------------------------------------------------------
UI / FEEL
- Minimal, calm, scannable
- Soft rounded rectangles
- Chips/badges for status, due date, content type, tags
- Generous whitespace
- Jamie suggestion UI should be visually consistent (label "Jamie" + consistent accent styling)

DELIVERABLE
Generate the full front-end UI for:
- Content tab with Ideas Inbox + Content Library
- Calendar tab with Month + Week views and all in-cell interactions
- Settings tab with Defaults + Notifications rules UI + Blueprint Manager + Topic Preferences
- Content Wizard flow
Include realistic empty states and example cards.

REMINDERS
- 1 slot per day
- No drag/drop
- Due date chip reschedules and moves card if target day empty
- Inline edit leadDays + est writing time updates shading immediately
- Standalone app only (content-focused)

---

## BATCH 2 — INTELLIGENCE + RANKING + PROMPTS + STATUS FLOW + BACKEND REQUIREMENTS
(For "Just Content" standalone app)

BUILDER NEEDS TO IMPLEMENT:
- Newsletter/email extraction into multiple content items per email
- Deterministic Top 5 ranking (least bug-prone)
- Jamie outputs: snippet, why-it-matters, tags, blueprint rec + why, hook direction
- Status transition flows (Inbox → Idea / Wizard)
- Minimal backend + data model + notification job scaffolding

------------------------------------------------------------
A) PROMPT TEMPLATES — NEWSLETTER EXTRACTION (Email → Items)

A1) EMAIL_ITEM_EXTRACTION_PROMPT

INPUT
- sender_name
- sender_email
- subject
- sent_date_iso
- email_plaintext (optional)
- email_html (optional)

OUTPUT (STRICT JSON ONLY)
{
  "source": {
    "sender_name": "...",
    "sender_email": "...",
    "subject": "...",
    "sent_date_iso": "YYYY-MM-DDTHH:MM:SSZ"
  },
  "items": [
    {
      "title": "...",
      "url": "...",                 // null allowed if no link
      "short_excerpt": "...",       // 1–2 sentences max
      "confidence": 0.0,            // 0–1
      "content_type_guess": "article|announcement|research|opinion|event|other"
    }
  ],
  "notes": {
    "extraction_warnings": ["..."]
  }
}

RULES
- Extract only meaningful content links (articles/resources/reports/event pages with substance).
- Exclude boilerplate: unsubscribe, preferences, privacy, "view in browser", social share, generic homepages, ad trackers.
- If multiple articles exist in one email, return one item per article.
- If the email has no meaningful links, return one item with url=null and title derived from the main heading.
- short_excerpt is a paraphrase or brief pull from the email (no long quotes).
- Confidence is higher when title + summary are clear.

PROMPT (verbatim)
"You are an extraction engine. From the following newsletter email, extract the individual content items (articles/resources) worth reading. Return strict JSON only matching the schema. Exclude boilerplate links (unsubscribe, preferences, privacy, view in browser, share links). Each item must have a clear title and a url when available. short_excerpt should be 1–2 sentences max summarizing that item. If the email contains no meaningful links, return a single item with url=null.
Email metadata: {sender_name} {sender_email} {subject} {sent_date_iso}
Email content:
{email_body}"

------------------------------------------------------------
B) PROMPT TEMPLATES — SCORING + TAGS + BLUEPRINT REC (Item → Jamie outputs)

B1) ITEM_SCORING_AND_BLUEPRINT_PROMPT

INPUT
- extracted_item: {title, url, short_excerpt, content_type_guess}
- source: {sender_name, sender_email, subject, sent_date_iso}
- user_topic_profile:
  - focus_topics: [strings]
  - avoid_topics: [strings]
  - pillar_tags_allowed: [
      speaking_patient, fit_real_care_journeys, full_patient_ecosystem, empathy_as_strategy,
      co_design_hcd, participatory_medicine, multi_stakeholder_alignment, what_good_care_looks_like
    ]
- blueprint_catalog (editable in Settings; families + subtypes + templates)
- voice_rules:
  - concise, human, clear
  - no hype, no clichés, no corporate tone
  - avoid banned words like "unlock" and "game-changing"

OUTPUT (STRICT JSON ONLY)
{
  "relevance_score": 0,
  "relevance_reason": "1 sentence",
  "suggested_pillar_tags": ["tag1","tag2"],         // 0–3
  "suggested_blueprint": {
    "family": "Story|Education|Perspective|Engagement|Announcement",
    "subtype": "string",
    "why": "1–2 sentences"
  },
  "snippet": "2–3 sentences max; summarize the underlying idea",
  "why_it_matters": "1 sentence; tie to Meredith's wheelhouse",
  "hook_direction": "1–2 sentences; direction only, not a polished hook"
}

SCORING RUBRIC (used by Jamie)
- 90–100: directly in wheelhouse; strong PX/health tech implications
- 70–89: relevant; easy to turn into content with a clear angle
- 40–69: adjacent; usable only with a sharp Meredith-specific POV
- 0–39: off-topic or too generic

BLUEPRINT HEURISTICS (Jamie should follow unless strong reason not to)
- speaking_patient OR empathy_as_strategy → Perspective (often "What Patients Wish You Knew" or "Truthism")
- full_patient_ecosystem OR fit_real_care_journeys → Story (Insight Story / Mini Case Story)
- co_design_hcd OR participatory_medicine → Education (Tips for Innovators / Analysis)
- need community input → Engagement (Question Post / Market Research Ask)
- only Meredith update → Announcement

PROMPT (verbatim)
"You are Jamie, helping Meredith decide what to write. Analyze the content item below and produce strict JSON matching the schema. Be concise, human, and specific. No hype. No clichés. Avoid banned words like 'unlock' and 'game-changing'. Suggest 0–3 pillar tags from the allowed list. Recommend the best blueprint family + subtype from the provided blueprint catalog and explain why in 1–2 sentences.
Return:
- relevance score 0–100 with a 1-sentence reason
- snippet (2–3 sentences)
- why_it_matters (1 sentence)
- hook_direction (1–2 sentences direction, not a fully polished hook)
Item: {extracted_item}
Source: {source}
Meredith topic profile: {user_topic_profile}
Blueprint catalog: {blueprint_catalog}"

------------------------------------------------------------
C) TOP 5 RANKING LOGIC (Deterministic; least potential for bugs)

DO NOT ask the LLM to "pick Top 5." Use code:
- LLM returns relevance_score + tags + blueprint outputs.
- App computes final_score deterministically.

final_score =
  relevance_score
  + recency_bonus
  + source_quality_bonus (optional)
  - avoid_penalty
  - duplicate_penalty

C1) Recency bonus (based on newsletter sent_date only)
- <= 3 days old: +12
- 4–7 days: +8
- 8–14 days: +4
- older: +0

C2) Avoid penalty
- If title/excerpt contains avoid_topics keywords: -30 (or drop entirely)

C3) Duplicate logic
- If fingerprint matches an existing inbox item OR already-converted content item → do not insert.
- If same domain + very similar normalized title exists → apply -20 (or drop).

C4) Optional source diversity rule
- Max 2 items per sender in Top 5 (optional; easy toggle)

PSEUDOCODE
items = items.filter(not dismissed, not converted_to_idea, not duplicate)
items.forEach(i => i.final_score = score(i))
sorted = sortDesc(items, final_score)
top5 = []
senderCounts = {}
for i in sorted:
  if top5.length == 5: break
  if senderCounts[i.sender] >= 2: continue  // optional
  top5.push(i)
  senderCounts[i.sender] = (senderCounts[i.sender] || 0) + 1

UI
- Pin a "Top 5 for you" section at top of inbox (same cards, just highlighted)

------------------------------------------------------------
D) SNIPPET/HOOK GENERATION — IMPORTANT UX RULE

Inbox should show:
- snippet
- why_it_matters
- blueprint recommendation + why
- hook_direction (direction only)

Wizard can generate actual hooks (2–3 options) ON DEMAND after Meredith confirms content type + blueprint.

Optional wizard hook prompt (on-demand only)
INPUT: content item + selected blueprint + content type
OUTPUT: 3 hook options (each 1–2 lines), Meredith voice, no hype.

------------------------------------------------------------
E) STATUS TRANSITIONS + FLOWS (Inbox → Idea → Wizard → Calendar)

ENTITIES
1) InboxItem (newsletter-derived or quick-add)
2) ContentItem (the actual item that moves through statuses and can be scheduled)

INBOX ACTIONS
E1) Save to Ideas
- Create ContentItem:
  - title = inbox title (or fallback)
  - notes = snippet + why_it_matters + source URL
  - tags = suggested_pillar_tags
  - blueprint_suggestion stored (family/subtype/why)
  - status = "Idea"
  - contentType = null unless already chosen
- Mark InboxItem inbox_status = "converted_to_idea"
- Remove from inbox UI immediately

E2) Send to Wizard
- Performs Save to Ideas
- Opens Wizard with prefilled:
  - title, notes/snippet, tags
  - suggested blueprint family/subtype highlighted as "Jamie suggested"
  - Meredith can change blueprint before generating outline

E3) Dismiss
- Set inbox_status = "dismissed"
- Hide immediately
- Allow Undo toast for 15 sec:
   - if undo, restore inbox_status = "new"
- Dismissed items never reappear on future pulls.

CONTENT ITEM STATUSES (keep stable)
- Idea
- Drafting
- Review
- Scheduled
- Published

CALENDAR INTEGRATION NOTE
Scheduling is based on ContentItem.dueDate (and contentType).
When a ContentItem becomes Idea, it can be scheduled on calendar.

------------------------------------------------------------
F) BACKEND REQUIREMENTS (Minimal, complete for standalone app)

This is a standalone app; implement a small backend that supports:
1) Gmail pull endpoint (manual)
2) AI processing endpoints (extraction + scoring)
3) Persistent database for inbox_items, content_items, settings, notification jobs
4) Notification scheduler (standalone; not dependent on original app)

RECOMMENDED TABLES

F1) settings (single user)
- id
- focus_topics (string array)
- avoid_topics (string array)
- default_lead_days_li_post (number)
- default_effort_mins_li_post (number)
- default_lead_days_li_article
- default_effort_mins_li_article
- default_lead_days_substack
- default_effort_mins_substack
- notification_rules (json)
- blueprints_catalog (json) // editable; families/subtypes/templates

F2) inbox_items
- id
- sender_name
- sender_email
- subject
- sent_date_iso
- extracted_title
- extracted_url (nullable)
- extracted_excerpt
- fingerprint (unique)
- relevance_score
- final_score
- suggested_tags (array)
- suggested_blueprint_family
- suggested_blueprint_subtype
- suggested_blueprint_why
- snippet
- why_it_matters
- hook_direction
- inbox_status: new | dismissed | converted_to_idea
- created_at

F3) content_items
- id
- title
- notes
- status (Idea/Drafting/Review/Scheduled/Published)
- content_type (LinkedIn Post/LinkedIn Article/Substack Post)
- due_date (date)
- tags (array)
- blueprint_family
- blueprint_subtype
- lead_days (number)   // final value (default or override)
- effort_mins (number) // final value (default or override)
- source_url (optional)
- created_at
- updated_at

F4) notifications_queue (scheduled jobs)
- id
- content_item_id
- fire_at_iso
- kind (outline_reminder | draft_reminder | review_reminder | publish_reminder | custom)
- status (pending | sent | canceled)
- channel (in_app | email optional)
- payload (json)

NOTIFICATION ENGINE (standalone)
- When due_date or status changes: regenerate future notification jobs based on settings.notification_rules.
- Also run a periodic job (cron) to catch anything missed.
- v1 delivery: in-app notification center + optional email later.

GMAIL PULL MECHANICS (manual button)
- Fetch emails from a dedicated newsletter inbox account
- For each email:
  - run EMAIL_ITEM_EXTRACTION_PROMPT
  - for each extracted item:
     - compute fingerprint and dedupe
     - run ITEM_SCORING_AND_BLUEPRINT_PROMPT
     - compute final_score with deterministic rules
     - insert into inbox_items (status=new)

FINGERPRINT (dedupe)
fingerprint = hash(
  normalize(sender_email) + "|" +
  normalize(url OR (title + subject)) + "|" +
  sent_date_iso.substring(0,10)
)
Unique index on fingerprint.

------------------------------------------------------------
G) BLUEPRINT INTEGRATION REQUIREMENT (critical)
Inbox should recommend blueprint + why + hook direction.
Wizard can generate actual hook options only after user chooses content type + blueprint.

END OF BATCH 2

---

## BATCH 3 — IMPLEMENTATION DETAILS (APIs + NOTIFICATIONS + CALENDAR LOGIC + SCHEMAS + MIGRATION)

GOAL
Make the "Just Content" app fully functional with:
- content ideas inbox population
- content scheduling + shading
- due date rescheduling with move rules
- standalone notifications
- blueprint management
- migration path from old app's content module

ASSUMPTIONS (choose simplest; single user)
- Single-user app (Meredith); no team features.
- Auth can be "magic link" or a single local account; simplest is fine.
- Database: Supabase Postgres recommended (or Firebase; pick one and stay consistent).
- Scheduler: one cron job every 5 minutes (server) to send in-app notifications (v1) and optionally email later (v2).

------------------------------------------------------------
1) API ENDPOINTS (minimal)

1A) Settings
GET  /api/settings
PUT  /api/settings
- returns/updates defaults, notification rules, blueprint catalog, topic prefs

1B) Inbox (newsletter-derived + manual)
POST /api/inbox/pull
- triggers Gmail fetch (manual pull), extraction + scoring pipeline

GET  /api/inbox?status=new
POST /api/inbox/:id/dismiss
POST /api/inbox/:id/undoDismiss (only within 15 seconds client-side; server may just flip status)
POST /api/inbox/:id/convertToIdea
- body: { openWizard: boolean }

POST /api/inbox/quickAdd
- body: { mode: "url"|"text", url?: string, text?: string }
- creates an inbox item (processed similarly, or at minimum stores as new inbox item with snippet)

1C) Content items
GET  /api/content?status=Idea|Drafting|Review|Scheduled|Published&search=...
POST /api/content
PUT  /api/content/:id
- includes due_date changes, lead_days, effort_mins overrides, tags, blueprint, status

POST /api/content/:id/openWizardContext
- optional helper endpoint if wizard needs prefetched blueprint template + AI hook options

1D) Calendar
GET /api/calendar?start=YYYY-MM-DD&end=YYYY-MM-DD
- returns scheduled content items (due_date within range) + derived shading spans OR raw values for client to compute

1E) Notifications
GET  /api/notifications?status=unread|all
POST /api/notifications/:id/markRead
POST /api/notifications/recompute
- recompute future notification jobs for all items (admin button; optional)

------------------------------------------------------------
2) NOTIFICATION SYSTEM (standalone, low-bug)

2A) Storage
Table: notifications_queue (scheduled jobs)
- id
- content_item_id
- fire_at_iso
- rule_id (string)
- status: pending|sent|canceled
- channel: in_app (v1) | email (v2)
- title
- message
- created_at

Table: notifications_in_app
- id
- content_item_id
- created_at
- title
- message
- is_read boolean

2B) Notification rules (in settings) — JSON schema
settings.notification_rules = [
  {
    "id": "rule_due_3days",
    "enabled": true,
    "trigger": "due_date",
    "offset_days": -3,
    "time_of_day": "09:00",
    "applies_to_statuses": ["Idea","Drafting","Review","Scheduled"],
    "title_template": "Content coming up",
    "message_template": "\"{title}\" is due in 3 days. Want to open the wizard?"
  },
  {
    "id": "rule_due_dayof",
    "enabled": true,
    "trigger": "due_date",
    "offset_days": 0,
    "time_of_day": "09:00",
    "applies_to_statuses": ["Idea","Drafting","Review","Scheduled"],
    "title_template": "Due today",
    "message_template": "\"{title}\" is due today."
  }
]

2C) When to generate notification jobs
Whenever a content item is created or updated, if any of these change:
- due_date
- status
- content_type (optional)
- lead_days (optional if rules depend on it later)

Run:
recomputeJobsForContentItem(contentItemId)

2D) recomputeJobsForContentItem algorithm (deterministic)
- Cancel all pending jobs for that content_item_id (set status=canceled)
- If content item status is Published: do not create future jobs
- For each enabled rule:
   - If contentItem.status NOT IN rule.applies_to_statuses: continue
   - If trigger = due_date and due_date exists:
        fire_date = due_date + offset_days
        fire_at = combineDateTime(fire_date, rule.time_of_day, user_timezone)
        If fire_at is in the past: skip
        Create pending job with resolved title/message templates using {title}, {due_date}

2E) Delivery job (cron)
Every 5 minutes:
- select notifications_queue where status=pending and fire_at <= now
- for each:
   - insert into notifications_in_app
   - set notifications_queue.status=sent

UI notification center:
- bell icon in nav
- list unread first
- clicking a notif opens the content item or wizard

------------------------------------------------------------
3) CALENDAR SHADING + RESCHEDULING LOGIC (exact rules)

3A) Definitions
- due_date = the scheduled publish day (the day the card sits on)
- lead_days = number of days of "prep runway" before due_date
- shading_span = [start_date, end_date] inclusive
   - end_date = due_date - 1 day
   - start_date = due_date - lead_days days

Example:
due_date Jan 20, lead_days 5
shading covers Jan 15–Jan 19 (5 days)

3B) Shading compute function
function getShadingSpan(dueDate, leadDays):
  if !dueDate or leadDays <= 0: return null
  start = dueDate - leadDays
  end = dueDate - 1
  return {start, end}

3C) Editing leadDays / effortMins
- leadDays edits recompute shading span immediately
- effortMins edits do NOT change span length (v1); optional: adjust overlay intensity label only

3D) One-slot-per-day enforcement
- Calendar day is occupied if there is a content_item with due_date == that date AND status != Published (optional: published can still occupy as history; choose one)
Recommended:
- Published still occupies the slot visually but counts as occupied for scheduling to keep the rule simple.
Alternative:
- Allow scheduling on top of published days (but can get messy). Keep it strict in v1.

3E) Reschedule via due date chip
User picks new date:
- If target date already has ANY content item with due_date == target (regardless of status) → block + toast.
- Else:
   - update content_item.due_date = target
   - recompute shading span
   - recompute notification jobs
   - UI moves card to new date

3F) Week view
Week view is just a different date range and cell layout.
All scheduling interactions identical.

------------------------------------------------------------
4) DATA SCHEMAS (TypeScript-friendly)

4A) ContentType enum
type ContentType = "LinkedIn Post" | "LinkedIn Article" | "Substack Post";

4B) Status enum
type ContentStatus = "Idea" | "Drafting" | "Review" | "Scheduled" | "Published";

4C) ContentItem
interface ContentItem {
  id: string;
  title: string;
  notes?: string;
  status: ContentStatus;
  contentType?: ContentType;
  dueDate?: string; // YYYY-MM-DD
  tags: string[];
  blueprint?: { family: string; subtype: string };
  leadDays?: number;
  effortMins?: number;
  sourceUrl?: string;
  createdAt: string;
  updatedAt: string;
}

4D) InboxItem
interface InboxItem {
  id: string;
  senderName: string;
  senderEmail: string;
  subject?: string;
  sentDateIso: string;
  extractedTitle: string;
  extractedUrl?: string | null;
  extractedExcerpt?: string;
  relevanceScore?: number;
  finalScore?: number;
  suggestedTags?: string[];
  suggestedBlueprint?: { family: string; subtype: string; why: string };
  snippet?: string;
  whyItMatters?: string;
  hookDirection?: string;
  inboxStatus: "new" | "dismissed" | "converted_to_idea";
  createdAt: string;
}

4E) Blueprint catalog
interface BlueprintCatalog {
  families: Array<{
    name: "Story"|"Education"|"Perspective"|"Engagement"|"Announcement";
    subtypes: Array<{
      name: string;
      isActive: boolean;
      template: string; // markdown / structured text
    }>;
  }>;
}

4F) Settings
interface JustContentSettings {
  focusTopics: string[];
  avoidTopics: string[];
  defaults: Record<ContentType, { leadDays: number; effortMins: number }>;
  notificationRules: NotificationRule[];
  blueprintCatalog: BlueprintCatalog;
}

interface NotificationRule {
  id: string;
  enabled: boolean;
  trigger: "due_date";
  offsetDays: number; // negative = before
  timeOfDay: string;  // "09:00"
  appliesToStatuses: ContentStatus[];
  titleTemplate: string;
  messageTemplate: string;
}

------------------------------------------------------------
5) MIGRATION PLAN (extract content-only from the bigger app)

5A) What to bring over
- All existing Content Items (titles, notes, statuses, tags, due dates)
- Blueprint catalog + templates
- Any content-specific settings (defaults/lead days/effort estimates if they exist)
- No CRM, tasks, meetings, contacts, etc.

5B) Mapping checklist
From OLD app fields → NEW app fields:
- content.title → title
- content.notes/body → notes
- content.status → status (normalize names)
- content.platform/type → contentType
- content.dueDate/publishDate → dueDate
- content.tags/pillars → tags
- blueprint.family/subtype → blueprint
- estimatedWritingTime → effortMins
- leadDays → leadDays

5C) Export/import approach (least bugs)
Option 1 (best): export JSON from old app content module and import into new app via:
POST /api/migrate/importContent
POST /api/migrate/importBlueprints
Option 2: manual CSV export/import (more friction, more edge cases)

5D) Migration rules
- If old items have due dates that collide (2 items same day), migration should:
   - keep the earliest/most important as scheduled
   - set the others to status=Idea with no dueDate
   - produce a migration report list of conflicts

------------------------------------------------------------
6) "DONE WHEN" ACCEPTANCE CHECKLIST (for Builder #2)
- Inbox pulls newsletters and splits multi-article emails into separate cards
- Top 5 section uses deterministic scoring, not LLM picking
- Save to Ideas converts inbox item → content item and removes from inbox
- Send to Wizard does Save to Ideas + opens wizard prefilled
- Calendar month + week views exist; + scheduling inside cell; 1/day enforced
- Due date chip reschedules and moves card, blocking conflicts
- Lead days + effort are defaulted from settings and inline editable; shading updates instantly
- Notification rules UI exists + cron sends in-app notifications on schedule
- Settings includes blueprint manager (edit/add templates)
- Migration path defined + import endpoint or documented manual import

END BATCH 3

---

## PLATFORM COLORS (exact hex codes)

📘 LinkedIn Post:
   Background: #7B96AC (medium slate blue)
   Text: #FFFFFF (white)

📙 LinkedIn Article:
   Background: #3D5A6C (dark slate blue)
   Text: #FFFFFF (white)

📕 Substack Post:
   Background: #D4A5B8 (dusty rose/pink)
   Text: #FFFFFF (white)

---

## KEY CONTEXT FROM CONVERSATION

**User background:**
- Solo consultant (Empower Health Strategies)
- Brand colors: #2f829b, #034863 (main), #f5fafb, #ddecf0 (neutrals), #6b2358 (accent)
- Internal tools use muted palette: #a8998f, #a89db0
- Focus: patient experience (PX) + digital health
- Has 8 content pillar tags (speaking_patient, fit_real_care_journeys, etc.)

**Design philosophy:**
- "Mindful productivity with soft modernism"
- Calm, clean, low cognitive load
- No hype, no clichés, no corporate speak

**Jamie (AI assistant):**
- Voice: concise, human, clear
- Banned words: "unlock", "game-changing"
- Helps with newsletter extraction, scoring, blueprint suggestions, hook generation

**Content workflow:**
- Newsletters → Inbox → Ideas → Drafting → Review → Scheduled → Published
- 1 content slot per day (hard constraint)
- Focus shading = visual "work-back" runway before publish date

---

## BLUEPRINT FAMILIES (5 total, 25 subtypes)

**Story:** Personal Story, Insight Story, Mini Case Story, Origin Story, Other
**Education:** Listicle, Analysis, Tips for Innovators, Resource Share, Other
**Perspective:** Myth vs Reality, Hot Take, Truthism, What Patients Wish You Knew, Other
**Engagement:** Question Post, Poll Setup, Market Research Ask, Short Video Script, Other
**Announcement:** Launch, Shoutout, Speaking Announcement, Program/Resource Update, Other

---

## CONTENT PILLAR TAGS (from AI_PROFILE_V1)

1. speaking_patient - Language, tone, communication
2. fit_real_care_journeys - Workflow, care continuum
3. full_patient_ecosystem - Admin burden, hidden work
4. empathy_as_strategy - Trust, engagement, activation
5. co_design_hcd - Human-centered design, co-creation
6. participatory_medicine - Patient partnership
7. multi_stakeholder_alignment - Cross-functional collaboration
8. what_good_care_looks_like - Care quality, respect

---

## IMPORTANT NOTES FOR BUILDER #2

1. **This is a STANDALONE app** - no dependencies on the original CRM/task/calendar system
2. **Single user** (Meredith) - no multi-user features needed
3. **1 slot per day** - hard constraint, enforce everywhere
4. **No drag-and-drop** - all interactions via popovers/modals
5. **Jamie = AI assistant** - consistent branding/styling for all AI features
6. **publishDate not dueDate** - content isn't "due", it's being published
7. **Deterministic ranking** - use code, not LLM, for Top 5
8. **15-second undo** - for dismiss action only
9. **Inline edits update instantly** - leadDays/effortMins changes → instant shading recalc
10. **Notification rules configurable** - standalone system, not dependent on original app

---

**END OF INITIAL INFO FILE**

This file preserves the original specs before any refinement. Use it as a cross-reference when reviewing the final polished handoff package to ensure nothing critical was lost.
