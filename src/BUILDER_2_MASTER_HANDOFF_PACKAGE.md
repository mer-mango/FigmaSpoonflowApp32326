# 🚀 BUILDER #2 - MASTER HANDOFF PACKAGE
## Complete Specification for "Just Content" Standalone App

---

## 📦 PACKAGE CONTENTS

This handoff package contains **EVERYTHING** you need to build the "Just Content" standalone app with zero missing context.

### **Core Specification Documents:**
1. `INITIAL_INFO_FOR_BUILDER_2.md` - Original 3-batch spec (unedited)
2. `CANONICAL_NAMING_REFERENCE.md` - Exact field names, statuses, entities (DO NOT RENAME)
3. `BUILDER_2_STOP_AND_ASK_PROTOCOL.md` - When to ask questions (READ FIRST!)

### **Implementation Details:**
4. `DEPENDENCY_AUDIT_CURRENT_APP.md` - What exists, what to extract, migration plan
5. `JAMIE_COMPLETE_SPECIFICATION.md` - All AI functions, prompts, UX integration
6. `SETTINGS_TAB_COMPLETE_DESIGN.md` - Complete Settings UI/UX + storage
7. `BACKEND_INTEGRATIONS_SETUP.md` - Gmail, LinkedIn, Substack APIs
8. `CONTENT_BLUEPRINTS_REFERENCE.md` - All 5 families, 25 subtypes

### **Supporting Documents:**
9. This file - Master handoff summary + checklist

---

## 🎯 WHAT YOU'RE BUILDING

**App Name:** "Just Content"  
**User:** Single user (Meredith)  
**Purpose:** Standalone content planning + creation app

**Core Features:**
1. **Content Ideas Inbox** - Pull newsletters via Gmail, AI extraction/ranking
2. **Content Library** - Track content through status workflow (Idea → Published)
3. **Calendar** - Plan publish dates, 1 slot/day, focus shading
4. **Content Wizard** - Guided content creation with blueprints
5. **Settings** - Configure defaults, notifications, blueprints, AI preferences

**Tech Stack (Recommended):**
- Frontend: React + TypeScript + Tailwind CSS
- Backend: Supabase (Postgres + Edge Functions)
- AI: OpenAI GPT-4
- Integrations: Gmail API (v1), LinkedIn/Substack (v2)

---

## 🚨 CRITICAL RULES (Read First)

### **1. Use Exact Names from Canonical Reference**
- ✅ `publishDate` (not dueDate)
- ✅ `"Idea"` (capitalized, not "idea")
- ✅ `ContentItem` (not Content or ContentEntry)
- ✅ `InboxItem` (not ContentSourceCard)

**See:** `CANONICAL_NAMING_REFERENCE.md` for complete list

### **2. Stop and Ask Protocol**
If you have ANY question—even the slightest uncertainty:
- ⛔ **STOP**
- ❓ **ASK** for clarification
- 🚫 **DO NOT** proceed until you get an answer

**See:** `BUILDER_2_STOP_AND_ASK_PROTOCOL.md`

### **3. Global Constraints**
- 1 content slot per day (hard cap)
- No drag-and-drop (all interactions via popovers)
- No CRM, tasks, meetings, finance features
- Standalone app (no dependencies on original system)

---

## 📋 PRE-FLIGHT QUESTIONS ANSWERED

### **Q1: Is the content module cleanly separated from CRM/tasks/calendar?**
**A:** YES ✅  
**Evidence:** Content items stored independently in localStorage with no foreign keys to contacts/tasks. Blueprint system is self-contained. Extraction complexity: **LOW**.  
**See:** `DEPENDENCY_AUDIT_CURRENT_APP.md`

---

### **Q2: Are field names consistent across the content module?**
**A:** Mostly, with some variations that need normalization:
- `scheduledDate` (old) → `publishDate` (new - STANDARDIZED)
- `platform` (old) → `contentType` (new - STANDARDIZED)
- `lastUpdated` (old) → `updatedAt` (new - STANDARDIZED)

**See:** `CANONICAL_NAMING_REFERENCE.md` Section: "Migration Field Mapping"

---

### **Q3: Are status values consistent?**
**A:** NO - needs normalization:
- Old uses lowercase: `"idea"`, `"draft"`, `"scheduled"`
- New uses capitalized: `"Idea"`, `"Drafting"`, `"Scheduled"`

**Mapping provided in:** `DEPENDENCY_AUDIT_CURRENT_APP.md` Section: "Conflict 2: Status normalization"

---

### **Q4: Is there anything confusing about the current content module?**
**A:** Minor inconsistencies:
1. Some content items have `scheduledDate`, others have `target_date` (normalize to `publishDate`)
2. Status values are sometimes lowercase, sometimes capitalized (standardize to capitalized)
3. `workingOn` flag exists in some designs, not others (keep as `workingOn` boolean)

**All addressed in:** `CANONICAL_NAMING_REFERENCE.md`

---

### **Q5: What's the single biggest gotcha?**
**A:** The **1 slot per day** rule has edge cases:
- What if 2 items have same `publishDate` during migration? → Keep first, move others to Idea status
- What if user tries to reschedule to an occupied day? → Block with toast message
- What if Published items occupy slots? → YES, they still count (history)

**Handled in:** `DEPENDENCY_AUDIT_CURRENT_APP.md` Section: "Conflict 1: Multiple items with same scheduledDate"

---

## 🗂️ SYSTEM INVENTORY (What Already Exists)

### **Entities:**

**ContentItem (current app):**
```typescript
interface ContentItem {
  id: string;
  title: string;
  platform: 'LinkedIn Post' | 'LinkedIn Article' | 'Substack';
  length: string;
  blueprintFamily: 'Story' | 'Education' | 'Perspective' | 'Engagement' | 'Announcement';
  blueprintSubtype: string;
  status: 'idea' | 'draft' | 'ready to schedule' | 'scheduled' | 'published';
  tags: string[];
  scheduledDate?: string;
  scheduledTime?: string;
  lastUpdated: Date;
  createdOn?: Date;
  notes?: string;
  content?: string;
  wordCount?: number;
  inWorkingOnNow?: boolean;
}
```

**Storage:** `localStorage.allContentItems`

---

### **Components (Reusable from Current App):**

**1. NewContentWizard** (`/components/muted_NewContentWizard.tsx`)
- 4-step wizard: Idea → Platform → Length → Blueprint
- Returns content data on complete
- **Action:** Copy as-is, add prefill capability for inbox items

**2. Blueprint System** (hardcoded in Wizard)
- 5 families, 25 subtypes
- **Action:** Make editable in Settings

**3. Content Gallery Views** (multiple designs exist)
- Gallery, Kanban, List views
- **Action:** Choose one or build simplified version

**4. Drafting Focus Mode** (`/components/muted_DraftingFocusMode.tsx`)
- Full-screen editor
- **Action:** Copy as-is or simplify

---

### **Current Status Values:**
- `"idea"` → Standardize to `"Idea"`
- `"draft"` → Standardize to `"Drafting"`
- `"ready to schedule"` → Standardize to `"Review"`
- `"scheduled"` → Keep as `"Scheduled"`
- `"published"` → Keep as `"Published"`

---

## 🆕 WHAT'S NEW (Build from Scratch)

### **NEW FEATURES:**

1. **Content Ideas Inbox** (complete new section)
   - Gmail integration
   - Newsletter extraction (Jamie AI)
   - Top 5 ranking (deterministic)
   - Quick Add (URL/text)
   - Save to Ideas / Send to Wizard / Dismiss (15s undo)

2. **InboxItem Entity** (new)
   - Separate from ContentItem
   - Statuses: `new`, `dismissed`, `converted_to_idea`
   - Stores Jamie suggestions

3. **Calendar Tab** (new)
   - Month + Week views
   - In-cell popover scheduling
   - Focus shading (work-back overlay based on leadDays)
   - Reschedule via clickable publishDate chip

4. **Jamie AI Assistant** (new)
   - Newsletter extraction
   - Scoring + tagging
   - Blueprint recommendations
   - Snippet/hook generation
   - See: `JAMIE_COMPLETE_SPECIFICATION.md`

5. **Settings Tab** (new)
   - Defaults (leadDays + effortMins per content type)
   - Notification rules
   - Blueprints Manager (editable)
   - Topic Preferences
   - AI Preferences
   - See: `SETTINGS_TAB_COMPLETE_DESIGN.md`

6. **Notification System** (standalone)
   - In-app notifications
   - Rule-based triggers
   - Cron job delivery (every 5 min)

---

## 🔄 WHAT'S MODIFIED (Enhance Existing)

**ContentItem (add new fields):**
```typescript
// NEW FIELDS to add:
sourceType?: "manual" | "newsletter" | "url" | "quick_text" | "idea_inbox"
sourceUrl?: string
contentPillarTags?: string[]  // Jamie's suggested tags
jamieSnippet?: string
jamieHook?: string
leadDays?: number  // Override defaults from settings
effortMins?: number  // Override defaults from settings
```

**NewContentWizard (enhance):**
- Accept `initialContent` prop for prefilling from inbox
- Highlight Jamie-suggested blueprint with badge
- Generate hooks on-demand in wizard

---

## ❌ WHAT'S DELETED (Not in Standalone App)

**DO NOT INCLUDE:**
- ❌ Tasks/TasksPage
- ❌ Contacts/ContactsPage
- ❌ Calendar integrations (Google Calendar sync)
- ❌ Meetings/MeetingDossier
- ❌ CRM features
- ❌ Client flows/forms
- ❌ Finance/invoices
- ❌ Documents page
- ❌ Today page playlists
- ❌ Nurture todos
- ❌ Any non-content features

---

## 🎨 DESIGN SYSTEM

### **Platform Colors (Exact Hex Codes):**
- **LinkedIn Post:** `#7B96AC` (bg) + `#FFFFFF` (text)
- **LinkedIn Article:** `#3D5A6C` (bg) + `#FFFFFF` (text)
- **Substack Post:** `#D4A5B8` (bg) + `#FFFFFF` (text)

### **Brand Colors:**
- Main: `#2f829b`, `#034863`
- Neutrals: `#f5fafb`, `#ddecf0`
- Accent: `#6b2358`
- Muted (internal tools): `#a8998f`, `#a89db0`

### **UI Feel:**
- Minimal, calm, scannable
- Soft rounded rectangles
- Generous whitespace
- "Mindful productivity with soft modernism"

---

## 💾 DATA MODELS (TypeScript Interfaces)

### **ContentItem (NEW standard):**
```typescript
interface ContentItem {
  id: string;
  title: string;
  notes?: string;
  status: "Idea" | "Drafting" | "Review" | "Scheduled" | "Published";
  contentType?: "LinkedIn Post" | "LinkedIn Article" | "Substack Post";
  publishDate?: string; // YYYY-MM-DD
  tags: string[];
  blueprintFamily?: string;
  blueprintSubtype?: string;
  leadDays?: number;
  effortMins?: number;
  sourceType?: "manual" | "newsletter" | "url" | "quick_text" | "idea_inbox";
  sourceUrl?: string;
  jamieSnippet?: string;
  jamieHook?: string;
  contentPillarTags?: string[];
  workingOn?: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### **InboxItem (NEW):**
```typescript
interface InboxItem {
  id: string;
  senderName: string;
  senderEmail: string;
  subject?: string;
  sentDateIso: string;
  extractedTitle: string;
  extractedUrl?: string | null;
  extractedExcerpt?: string;
  fingerprint: string; // For deduplication
  relevanceScore?: number;
  finalScore?: number;
  suggestedTags?: string[];
  suggestedBlueprintFamily?: string;
  suggestedBlueprintSubtype?: string;
  suggestedBlueprintWhy?: string;
  snippet?: string;
  whyItMatters?: string;
  hookDirection?: string;
  inboxStatus: "new" | "dismissed" | "converted_to_idea";
  createdAt: string;
}
```

### **Settings:**
See `SETTINGS_TAB_COMPLETE_DESIGN.md` Section: "Complete Settings Storage Schema"

---

## 🔧 API ENDPOINTS (Minimal Set)

**Settings:**
- `GET /api/settings`
- `PUT /api/settings`

**Inbox:**
- `POST /api/inbox/pull` (Gmail fetch + AI processing)
- `GET /api/inbox?status=new`
- `POST /api/inbox/:id/dismiss`
- `POST /api/inbox/:id/undoDismiss`
- `POST /api/inbox/:id/convertToIdea`
- `POST /api/inbox/quickAdd`

**Content:**
- `GET /api/content?status=...&search=...`
- `POST /api/content`
- `PUT /api/content/:id`

**Calendar:**
- `GET /api/calendar?start=YYYY-MM-DD&end=YYYY-MM-DD`

**Notifications:**
- `GET /api/notifications?status=unread|all`
- `POST /api/notifications/:id/markRead`

**Jamie (AI):**
- `POST /api/jamie/extractNewsletter`
- `POST /api/jamie/scoreAndTag`
- `POST /api/jamie/generateHooks`

---

## 📅 CALENDAR SHADING ALGORITHM (Exact Rules)

```typescript
function getShadingSpan(publishDate: string, leadDays: number) {
  if (!publishDate || leadDays <= 0) return null;
  
  const endDate = addDays(parseDate(publishDate), -1); // Day before publish
  const startDate = addDays(parseDate(publishDate), -leadDays);
  
  return { startDate, endDate }; // Inclusive range
}

// Example:
// publishDate: "2025-01-20"
// leadDays: 5
// shading: Jan 15-19 (5 days)
```

**Inline edit behavior:**
- Edit `leadDays` → instant shading recalculation
- Edit `effortMins` → NO change to shading span (v1)

---

## 🔔 NOTIFICATION SYSTEM

**When to generate jobs:**
- ContentItem created/updated AND (`publishDate` OR `status` OR `leadDays` changes)

**Algorithm:**
```typescript
function recomputeJobsForContentItem(itemId: string) {
  // 1. Cancel all pending jobs for this item
  await cancelPendingJobs(itemId);
  
  // 2. If status = Published, skip (no future jobs)
  if (item.status === 'Published') return;
  
  // 3. For each enabled notification rule:
  for (const rule of settings.notificationRules) {
    if (!rule.enabled) continue;
    if (!rule.appliesToStatuses.includes(item.status)) continue;
    
    const fireDate = addDays(item.publishDate, rule.offsetDays);
    const fireAt = combineDateTime(fireDate, rule.timeOfDay);
    
    if (fireAt < now()) continue; // Skip past dates
    
    await createJob({
      contentItemId: itemId,
      fireAt: fireAt,
      ruleId: rule.id,
      title: rule.titleTemplate.replace('{title}', item.title),
      message: rule.messageTemplate.replace('{title}', item.title)
    });
  }
}
```

**Cron job (runs every 5 minutes):**
```typescript
// Select pending jobs where fireAt <= now
const jobs = await getPendingJobs();

for (const job of jobs) {
  await createInAppNotification(job);
  await markJobAsSent(job.id);
}
```

---

## 🧪 TESTING REQUIREMENTS

### **Critical Paths to Test:**

1. **Newsletter Pull → Inbox → Idea → Wizard → Scheduled**
   - Pull 3 newsletters
   - Verify items appear in inbox with Jamie suggestions
   - Click "Send to Wizard" on one item
   - Verify prefilled title/notes/tags/blueprint
   - Complete wizard → verify appears in Content Library as Idea
   - Schedule on calendar → verify appears on correct date

2. **Calendar Scheduling (1 Slot/Day Rule)**
   - Schedule item for Jan 15
   - Try to schedule another for Jan 15 → should block
   - Reschedule first item to Jan 16 → should move card
   - Verify shading updates correctly

3. **Inline Edit leadDays → Shading Update**
   - Schedule item with 5 leadDays → verify 5-day shading
   - Edit to 7 leadDays → verify shading expands instantly
   - Edit to 0 leadDays → verify shading disappears

4. **Dismiss with Undo**
   - Dismiss inbox item → verify disappears
   - Click Undo within 15s → verify reappears
   - Dismiss again, wait 15s → Undo should be gone

5. **Notification Rules**
   - Create item with publishDate 3 days from now
   - Verify pending notification job created
   - Wait for cron (or trigger manually)
   - Verify in-app notification appears

---

## ✅ "DONE WHEN" ACCEPTANCE CRITERIA

**The app is complete when:**

- [ ] Inbox pulls newsletters and splits multi-article emails into separate cards ✅
- [ ] Top 5 section uses deterministic scoring (code, not LLM) ✅
- [ ] "Save to Ideas" converts inbox item → content item, removes from inbox ✅
- [ ] "Send to Wizard" does Save to Ideas + opens wizard with prefills ✅
- [ ] Calendar month + week views exist ✅
- [ ] In-cell popover scheduling works (choose type → choose idea → confirm) ✅
- [ ] 1 slot/day enforced (blocks scheduling if day occupied) ✅
- [ ] publishDate chip reschedules and moves card (if target empty) ✅
- [ ] Lead days + effort default from settings, inline editable per item ✅
- [ ] Shading updates instantly when leadDays edited ✅
- [ ] Notification rules UI exists in Settings ✅
- [ ] Cron sends in-app notifications on schedule ✅
- [ ] Settings includes blueprint manager (edit/add templates) ✅
- [ ] Migration path defined + tested with sample data ✅

---

## 📦 MIGRATION PLAN

**Export from current app:**
```javascript
// Run in browser console on current app
const contentItems = JSON.parse(localStorage.getItem('allContentItems') || '[]');
const exportData = {
  contentItems: contentItems,
  exportDate: new Date().toISOString(),
  totalItems: contentItems.length
};
console.log(JSON.stringify(exportData, null, 2));
// Copy output, save as content-export.json
```

**Import to new app:**
```
POST /api/migrate/importContent
{
  "items": [...], // From export file
  "options": {
    "normalizeStatuses": true,
    "normalizePlatforms": true,
    "handleConflicts": "keep_first" // For duplicate publishDates
  }
}
```

**Backend handles:**
- Status normalization (idea → Idea, draft → Drafting)
- Platform normalization (Substack → Substack Post)
- Field renaming (scheduledDate → publishDate)
- Conflict resolution (2 items same publishDate → keep first, others → Idea)

**See:** `DEPENDENCY_AUDIT_CURRENT_APP.md` Section: "Migration Plan"

---

## 🔐 TECHNICAL ASSUMPTIONS

**Auth:** Single-user magic link OR simple email/password  
**Database:** Supabase Postgres (recommended)  
**Storage:** Supabase Storage for any file uploads (optional)  
**AI:** OpenAI GPT-4 API  
**Scheduler:** Supabase cron job (or serverless cron)  
**Gmail:** OAuth 2.0 + refresh token  
**LinkedIn/Substack:** v2 feature (manual copy/paste in v1)  

---

## 📚 DOCUMENT NAVIGATION

**Start here:**
1. Read `BUILDER_2_STOP_AND_ASK_PROTOCOL.md` (critical!)
2. Read `CANONICAL_NAMING_REFERENCE.md` (reference while coding)
3. Skim `INITIAL_INFO_FOR_BUILDER_2.md` (original spec)

**Refer as needed:**
4. `DEPENDENCY_AUDIT_CURRENT_APP.md` - When building migration
5. `JAMIE_COMPLETE_SPECIFICATION.md` - When implementing AI features
6. `SETTINGS_TAB_COMPLETE_DESIGN.md` - When building Settings
7. `BACKEND_INTEGRATIONS_SETUP.md` - When setting up Gmail API
8. `CONTENT_BLUEPRINTS_REFERENCE.md` - For blueprint details

---

## 🚀 RECOMMENDED BUILD ORDER

### **Phase 1: Foundation (Week 1)**
1. Set up project (React + TypeScript + Supabase)
2. Create database schema (content_items, inbox_items, settings, notifications_queue)
3. Build Settings API (GET/PUT /api/settings)
4. Build basic Settings UI (Defaults section only)

### **Phase 2: Content Library (Week 2)**
5. Build Content Library view (list/gallery of content items)
6. Build GET /api/content endpoint
7. Build POST /api/content endpoint
8. Implement status filtering
9. Copy NewContentWizard component from current app

### **Phase 3: Calendar (Week 3)**
10. Build Calendar view (month grid)
11. Build in-cell scheduling popover
12. Implement 1-slot/day logic
13. Implement shading algorithm
14. Build reschedule (clickable publishDate chip)

### **Phase 4: Inbox + Jamie (Week 4)**
15. Set up Gmail OAuth + API integration
16. Build POST /api/inbox/pull endpoint
17. Implement newsletter extraction (Jamie)
18. Implement scoring + tagging (Jamie)
19. Build Inbox UI with Top 5
20. Build Quick Add modal

### **Phase 5: Notifications + Polish (Week 5)**
21. Build notification rules UI in Settings
22. Implement notification job generation logic
23. Set up cron job (every 5 min)
24. Build in-app notification center
25. Testing + bug fixes
26. Migration script + test migration

---

## 🆘 SUPPORT

**If you get stuck:**
1. Check this handoff package (likely answered)
2. Check `BUILDER_2_STOP_AND_ASK_PROTOCOL.md` (should you ask?)
3. Ask specific question with context + options

**Good question example:**
```
QUESTION: Should the "Save to Ideas" button be styled as 
primary (blue solid) or secondary (outline)?

CONTEXT: The spec says "Primary: Send to Wizard, Secondary: 
Save to Ideas" but I want to confirm if "secondary" means 
visual hierarchy or just importance.

OPTIONS:
1. Blue solid for both, but Send to Wizard is larger
2. Blue solid for Send to Wizard, outline for Save to Ideas
3. Different colors (blue for Send, green for Save)

RECOMMENDATION: Option 2 (visual hierarchy matches importance)
```

---

## ✅ FINAL CHECKLIST BEFORE STARTING

- [ ] I have read `BUILDER_2_STOP_AND_ASK_PROTOCOL.md` ⚠️ REQUIRED
- [ ] I have read `CANONICAL_NAMING_REFERENCE.md` ⚠️ REQUIRED
- [ ] I understand the "1 slot per day" constraint
- [ ] I understand publishDate (not dueDate)
- [ ] I understand capitalized statuses ("Idea" not "idea")
- [ ] I understand what NOT to build (no CRM/tasks/calendar integrations)
- [ ] I have access to OpenAI API key (for Jamie)
- [ ] I have access to Google Cloud Console (for Gmail API)
- [ ] I will ask questions if ANYTHING is unclear

---

**🎯 YOU'RE READY TO BUILD!**

This handoff package contains everything needed. Follow the recommended build order, use exact names from the canonical reference, and ASK if anything is unclear.

**Good luck! 🚀**

---

**END OF MASTER HANDOFF PACKAGE**
