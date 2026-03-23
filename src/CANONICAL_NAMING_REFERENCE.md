# CANONICAL NAMING REFERENCE - "Just Content" App
## Builder #2: Use ONLY These Exact Names (Do Not Rename)

---

## 🚨 CRITICAL: INCONSISTENCIES FOUND IN CURRENT APP

The existing app uses **MULTIPLE DIFFERENT NAMES** for the same concepts. For the standalone "Just Content" app, we are **STANDARDIZING** on these canonical names.

---

## 📅 **DATE FIELD: publishDate** (CANONICAL)

### ❌ CURRENT APP USES (inconsistent):
- `dueDate` (in tasks)
- `scheduledDate` (in some content items)
- `target_date` (in other content items)

### ✅ NEW APP USES (standardized):
- **`publishDate`** - The date content is scheduled to publish
- Format: `YYYY-MM-DD` (ISO date string)
- TypeScript: `publishDate?: string;`

### Why "publishDate"?
- More accurate than "dueDate" (content isn't "due", it's being published)
- More specific than "scheduledDate" (scheduled for what?)
- Clearer intent for content publishing workflow

---

## 📊 **STATUS VALUES - ContentItem** (CANONICAL)

### ❌ CURRENT APP USES (inconsistent across components):
- `"idea"` in some places
- `"draft"` in some places
- `"in_progress"` in some places
- `"in_review"` in some places
- `"scheduled"` in some places
- `"published"` in some places

### ✅ NEW APP USES (standardized):
**ContentItem status values (exact strings):**
- `"Idea"` ← capitalized, singular
- `"Drafting"` ← gerund form (active work happening)
- `"Review"` ← short form
- `"Scheduled"` ← capitalized
- `"Published"` ← capitalized

**TypeScript:**
```typescript
type ContentStatus = "Idea" | "Drafting" | "Review" | "Scheduled" | "Published";
```

**Why these specific values?**
- Capitalized = more formal, consistent with UI display
- "Drafting" not "Draft" = active work in progress
- "Review" not "In Review" = shorter, cleaner
- No "in_progress" = redundant with "Drafting"

---

## 📥 **INBOX STATUS VALUES - InboxItem** (CANONICAL)

### ✅ NEW APP USES (lowercase, underscores):
- `"new"` ← just arrived, not yet triaged
- `"dismissed"` ← user dismissed from inbox
- `"converted_to_idea"` ← moved to content library as Idea

**TypeScript:**
```typescript
type InboxStatus = "new" | "dismissed" | "converted_to_idea";
```

**Why lowercase for inbox?**
- Inbox items are "staging" (not final content)
- Lowercase = internal state, not user-facing label
- Underscores = multi-word values (converted_to_idea)

---

## 🏷️ **ENTITY NAMES** (CANONICAL)

### ✅ EXACT ENTITY NAMES (do not rename):
- **`ContentItem`** (not: Content, Article, Post, ContentEntry)
- **`InboxItem`** (not: ContentSourceCard, NewsletterItem, StagingItem, InboxCard)
- **`BlueprintCatalog`** (not: TemplateLibrary, BlueprintLibrary)
- **`JustContentSettings`** (not: AppSettings, UserSettings, ContentSettings)

---

## 📝 **FIELD NAMES - ContentItem** (CANONICAL)

### ✅ EXACT FIELD NAMES (do not rename):

**Core fields:**
- `id: string` (not: contentId, itemId)
- `title: string` (not: heading, name)
- `notes?: string` (not: description, body, content)
- `status: ContentStatus` (not: state, stage)
- `contentType?: ContentType` (not: platform, channel, type)
- `publishDate?: string` (not: dueDate, scheduledDate, targetDate)
- `tags: string[]` (not: labels, categories)
- `createdAt: string` (not: createdOn, dateCreated, created_at)
- `updatedAt: string` (not: lastUpdated, modifiedAt, updated_at)

**Blueprint fields:**
- `blueprintFamily?: string` (not: blueprintType, templateType, contentFamily)
- `blueprintSubtype?: string` (not: blueprintVariant, templateSubtype)

**Scheduling fields:**
- `leadDays?: number` (not: prepDays, runwayDays, lead_days)
- `effortMins?: number` (not: estimatedTime, writingTime, effort_mins)

**Source/tracking fields:**
- `sourceType?: "manual" | "newsletter" | "url" | "quick_text" | "idea_inbox"` (not: origin, createdFrom)
- `sourceUrl?: string` (not: referenceUrl, linkUrl)

**Jamie AI fields:**
- `jamieSnippet?: string` (not: aiSummary, generatedSnippet, snippet)
- `jamieHook?: string` (not: aiHook, generatedHook, opener)
- `contentPillarTags?: string[]` (not: topicTags, themeTags, aiTags)

**Full TypeScript interface:**
```typescript
interface ContentItem {
  id: string;
  title: string;
  notes?: string;
  status: ContentStatus;
  contentType?: ContentType;
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
  createdAt: string;
  updatedAt: string;
}
```

---

## 📥 **FIELD NAMES - InboxItem** (CANONICAL)

### ✅ EXACT FIELD NAMES (do not rename):

**Core fields:**
- `id: string` (not: inboxId, itemId)
- `senderName: string` (not: sender, from, source_name)
- `senderEmail: string` (not: email, fromEmail, sender_email)
- `subject?: string` (not: emailSubject, title)
- `sentDateIso: string` (not: sentDate, receivedAt, sent_date)

**Extracted content:**
- `extractedTitle: string` (not: title, heading, article_title)
- `extractedUrl?: string | null` (not: url, link, articleUrl)
- `extractedExcerpt?: string` (not: excerpt, summary, description)

**Scoring/ranking:**
- `relevanceScore?: number` (not: score, ranking, match_score)
- `finalScore?: number` (not: totalScore, computedScore, final_score)
- `fingerprint: string` (not: hash, dedupeKey, uniqueId)

**Jamie suggestions:**
- `suggestedTags?: string[]` (not: tags, recommendedTags, ai_tags)
- `suggestedBlueprintFamily?: string` (not: blueprintFamily, suggested_blueprint)
- `suggestedBlueprintSubtype?: string` (not: blueprintSubtype)
- `suggestedBlueprintWhy?: string` (not: blueprintReason, why_blueprint)
- `snippet?: string` (not: summary, jamie_snippet)
- `whyItMatters?: string` (not: relevance, why_relevant)
- `hookDirection?: string` (not: hook, hook_idea, suggested_hook)

**Status:**
- `inboxStatus: InboxStatus` (not: status, state)
- `createdAt: string` (not: addedAt, created_at)

**Full TypeScript interface:**
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
  fingerprint: string;
  relevanceScore?: number;
  finalScore?: number;
  suggestedTags?: string[];
  suggestedBlueprintFamily?: string;
  suggestedBlueprintSubtype?: string;
  suggestedBlueprintWhy?: string;
  snippet?: string;
  whyItMatters?: string;
  hookDirection?: string;
  inboxStatus: InboxStatus;
  createdAt: string;
}
```

---

## 🎨 **CONTENT TYPE / PLATFORM VALUES** (CANONICAL)

### ✅ EXACT VALUES (exact case, exact spacing):
- `"LinkedIn Post"` (not: "linkedin-post", "LinkedInPost", "LinkedIn post")
- `"LinkedIn Article"` (not: "linkedin-article", "LinkedInArticle", "LinkedIn article")
- `"Substack Post"` (not: "substack", "Substack", "substack-post")

**TypeScript:**
```typescript
type ContentType = "LinkedIn Post" | "LinkedIn Article" | "Substack Post";
```

**Platform Colors (exact hex codes):**
- **LinkedIn Post**: `#7B96AC` (medium slate blue) + white text
- **LinkedIn Article**: `#3D5A6C` (dark slate blue) + white text
- **Substack Post**: `#D4A5B8` (dusty rose/pink) + white text

---

## 🎯 **BLUEPRINT FAMILY VALUES** (CANONICAL)

### ✅ EXACT VALUES (exact case):
- `"Story"` (not: "story", "Stories", "STORY")
- `"Education"` (not: "educational", "Teaching", "Learn")
- `"Perspective"` (not: "opinion", "Viewpoint", "POV")
- `"Engagement"` (not: "Interactive", "Question", "Engage")
- `"Announcement"` (not: "News", "Update", "Announce")

**TypeScript:**
```typescript
type BlueprintFamily = "Story" | "Education" | "Perspective" | "Engagement" | "Announcement";
```

**Blueprint Subtypes (exact strings per family):**

**Story:**
- "Personal Story"
- "Insight Story"
- "Mini Case Story"
- "Origin Story"
- "Other"

**Education:**
- "Listicle"
- "Analysis"
- "Tips for Innovators"
- "Resource Share"
- "Other"

**Perspective:**
- "Myth vs Reality"
- "Hot Take"
- "Truthism"
- "What Patients Wish You Knew"
- "Other"

**Engagement:**
- "Question Post"
- "Poll Setup"
- "Market Research Ask"
- "Short Video Script"
- "Other"

**Announcement:**
- "Launch"
- "Shoutout"
- "Speaking Announcement"
- "Program/Resource Update"
- "Other"

---

## 🔔 **NOTIFICATION FIELD NAMES** (CANONICAL)

### ✅ NotificationRule:
- `id: string` (not: ruleId, rule_id)
- `enabled: boolean` (not: active, isEnabled)
- `trigger: "due_date"` (not: triggerType, event)
- `offsetDays: number` (not: offset, days_before)
- `timeOfDay: string` (not: time, notifyAt)
- `appliesToStatuses: ContentStatus[]` (not: statuses, applies_to)
- `titleTemplate: string` (not: title, heading)
- `messageTemplate: string` (not: message, body)

### ✅ NotificationJob (in queue):
- `id: string`
- `contentItemId: string` (not: itemId, content_id)
- `fireAt: string` (not: fireAtIso, scheduled_for, trigger_time)
- `ruleId: string` (not: rule, notification_rule_id)
- `status: "pending" | "sent" | "canceled"` (not: state, jobStatus)
- `channel: "in_app" | "email"` (not: deliveryMethod, notify_via)
- `title: string`
- `message: string`
- `createdAt: string`

---

## 🔧 **ACTION/BUTTON LABELS** (CANONICAL)

### ✅ INBOX ACTIONS (exact strings):
- "Send to Wizard" (not: "Open Wizard", "Edit", "Create Content")
- "Save to Ideas" (not: "Save", "Add to Ideas", "Convert")
- "Dismiss" (not: "Remove", "Delete", "Hide")
- "Undo" (not: "Undo Dismiss", "Restore")

### ✅ CONTENT ACTIONS (exact strings):
- "Open" (not: "View", "Open Item")
- "Edit" (not: "Update", "Modify")
- "Start" (when status = Idea) (not: "Begin", "Start Drafting")
- "Continue" (when status = Drafting/Review) (not: "Resume", "Keep Going")
- "Schedule" (when no publishDate) (not: "Set Date", "Plan")
- "Reschedule" (when publishDate exists) (not: "Change Date", "Move")

### ✅ WIZARD STEPS (exact order):
1. "Idea" (not: "Title", "Start")
2. "Platform" (not: "Channel", "Type")
3. "Length" (not: "Word Count", "Size")
4. "Blueprint" (not: "Template", "Type")

---

## 📐 **LENGTH/EFFORT FIELD NAMES** (CANONICAL)

### ✅ EXACT NAMES:
- `leadDays` (not: prepDays, runwayDays, lead_days, leadTime)
- `effortMins` (not: estimatedTime, writingTime, effort_mins, durationMins)

**Why these?**
- `leadDays` = industry-standard term for "runway before deadline"
- `effortMins` = minutes (not hours) for precision; "effort" (not "time") because it's estimated work

---

## 🗂️ **COMPONENT NAMES** (CANONICAL)

### ✅ EXACT COMPONENT NAMES (do not rename):
- `NewContentWizard` (not: ContentWizard, CreateContentModal, WizardModal)
- `ContentIdeasInbox` (not: InboxSection, NewsletterInbox, IdeasInbox)
- `InboxItemCard` (not: NewsletterCard, ContentCard, InboxCard)
- `ContentLibrary` (not: ContentList, ContentGrid, ContentSection)
- `ContentItemCard` (not: ContentCard, ItemCard)
- `CalendarView` (not: Calendar, PublishCalendar, ScheduleView)
- `SettingsPage` (not: Settings, AppSettings, Preferences)
- `BlueprintManager` (not: TemplateEditor, BlueprintEditor)
- `AIPreferencesModal` (not: JamieSettings, AISettings)

---

## 🔐 **API ENDPOINT NAMING** (CANONICAL)

### ✅ EXACT ENDPOINT PATHS:
- `POST /api/inbox/pull` (not: /api/newsletter/fetch, /api/gmail/pull)
- `GET /api/inbox` (not: /api/inbox-items, /api/newsletter-items)
- `POST /api/inbox/:id/convertToIdea` (not: /api/inbox/:id/save, /api/inbox/:id/convert)
- `POST /api/inbox/:id/dismiss` (not: /api/inbox/:id/delete, /api/inbox/:id/remove)
- `GET /api/content` (not: /api/content-items, /api/items)
- `POST /api/content` (not: /api/content/create)
- `PUT /api/content/:id` (not: /api/content/:id/update, PATCH /api/content/:id)
- `GET /api/calendar` (not: /api/schedule, /api/calendar-view)
- `GET /api/settings` (not: /api/user-settings, /api/preferences)
- `PUT /api/settings` (not: /api/settings/update)

---

## ⚠️ **BANNED WORDS/PHRASES** (Do Not Use)

### ❌ NEVER USE THESE:
- "unlock" (banned in Jamie voice)
- "game-changing" (banned in Jamie voice)
- "leverage" (corporate speak)
- "synergy" (corporate speak)
- "deep dive" (overused)
- "low-hanging fruit" (cliché)
- "circle back" (corporate speak)

### ❌ AVOID THESE VARIATIONS:
- "item" as a standalone variable name (too generic; use `contentItem` or `inboxItem`)
- "data" as a variable name (use specific: `contentData`, `inboxData`)
- "info" as a variable name (use specific: `contentInfo`, `userInfo`)

---

## 📚 **SUMMARY TABLE**

| Concept | Current App Uses | New App Uses (CANONICAL) |
|---------|------------------|--------------------------|
| **Date field** | dueDate, scheduledDate, target_date | `publishDate` |
| **Content status** | idea, draft, in_progress, in_review, scheduled, published | `"Idea"`, `"Drafting"`, `"Review"`, `"Scheduled"`, `"Published"` |
| **Inbox status** | N/A (new feature) | `"new"`, `"dismissed"`, `"converted_to_idea"` |
| **Platform** | LinkedIn Post, LinkedIn Article, Substack (inconsistent case) | `"LinkedIn Post"`, `"LinkedIn Article"`, `"Substack Post"` |
| **Blueprint families** | Story, Education, etc. (mostly consistent) | `"Story"`, `"Education"`, `"Perspective"`, `"Engagement"`, `"Announcement"` |
| **Lead days field** | N/A (new feature) | `leadDays` |
| **Effort field** | N/A (new feature) | `effortMins` |
| **Timestamp fields** | createdAt, lastUpdated, createdOn (mixed) | `createdAt`, `updatedAt` |

---

## 🚨 **BUILDER #2: IF IN DOUBT, ASK!**

If you encounter ANY naming choice not covered in this document:

1. **STOP** ⛔
2. **ASK** for clarification before proceeding
3. **DO NOT** invent your own name or "make it consistent"
4. **DO NOT** rename things to match your preferences

**Even if something seems like "obviously it should be X"—ASK FIRST.**

Examples of when to ask:
- "Should I call it `contentItems` or `items`?"
- "Should notification templates use `{title}` or `{contentTitle}`?"
- "Should the dismiss button say 'Dismiss' or 'Remove'?"
- "Should I use camelCase or snake_case for database columns?"

**No question is too small. Consistency matters more than perfection.**

---

## ✅ **CHANGE LOG**

**2025-12-28:**
- Initial canonical naming reference created
- Standardized on `publishDate` (not dueDate)
- Standardized on capitalized ContentStatus values ("Idea" not "idea")
- Standardized on lowercase InboxStatus values ("new" not "New")
- Defined all field names for ContentItem and InboxItem
- Locked down platform colors (exact hex codes)
- Banned problematic words from Jamie voice

---

**END OF CANONICAL NAMING REFERENCE**
