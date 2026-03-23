# DEPENDENCY AUDIT - Current App Content Module
## Identifying CRM/Task/Calendar Entanglements

---

## 🔍 AUDIT SUMMARY

**Current State:** The content module in the existing app is **CLEANLY SEPARATED** from CRM/tasks/calendar.

**Good News:** Content items are stored independently in `localStorage` with minimal cross-dependencies.

**Extraction Complexity:** **LOW** ✅

---

## 📊 CURRENT CONTENT MODULE ARCHITECTURE

### **Storage (localStorage keys):**
```
allContentItems          ← Content items array
todayPagePlaylists       ← Used by Today page (may include content items)
jamieChatMessages        ← Jamie chat history (may reference content)
```

### **Content Item Structure (Current App):**
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
  scheduledDate?: string;  // ← This will become publishDate
  scheduledTime?: string;  // ← Not needed in new app
  lastUpdated: Date;
  createdOn?: Date;
  notes?: string;
  content?: string;        // ← Draft content/body
  wordCount?: number;
  inWorkingOnNow?: boolean; // ← "Working On Now" flag
}
```

---

## ✅ WHAT'S CLEAN (No Dependencies)

### **1. Blueprint System**
- **Location:** `/components/muted_NewContentWizard.tsx`
- **Storage:** Hardcoded in component (array of blueprint families/subtypes)
- **Dependencies:** NONE ✅
- **Action:** Copy as-is, make editable in Settings

### **2. Content Status System**
- **Current statuses:** `"idea"`, `"draft"`, `"ready to schedule"`, `"scheduled"`, `"published"`
- **Dependencies:** NONE ✅
- **Action:** Standardize to capitalized versions: `"Idea"`, `"Drafting"`, `"Review"`, `"Scheduled"`, `"Published"`

### **3. Content Wizard**
- **Location:** `/components/muted_NewContentWizard.tsx`
- **Dependencies:** NONE (self-contained modal)
- **Action:** Copy as-is, add prefill capability for inbox items

### **4. Content Gallery/List Views**
- **Location:** Multiple designs exist:
  - `/components/muted_ContentPage_Gallery.tsx`
  - `/components/muted_ContentPage_DesignA.tsx` (Platform-First View)
  - `/components/muted_ContentPage_DesignB.tsx` (Kanban-Style)
  - `/components/muted_ContentPage_DesignC.tsx` (Workflow-Centric)
- **Dependencies:** NONE (just render content items)
- **Action:** Choose one design or build simplified version

### **5. Content Editor/Drafting Mode**
- **Location:** `/components/muted_Content_Editor.tsx`, `/components/muted_DraftingFocusMode.tsx`
- **Dependencies:** NONE (self-contained)
- **Action:** Copy as-is or simplify

---

## ⚠️ MINOR ENTANGLEMENTS (Easy to Remove)

### **1. Contact References**
**Current issue:** Content items MAY have `contact_ids` field (for linking to clients)

**Evidence from code:**
```typescript
// From BusinessFileItem interface (App.tsx:73)
contact_ids?: string[];
primaryContactId?: string;
```

**BUT:** Actual ContentItem interface in content components does NOT include contact fields ✅

**Action:** 
- ✅ No action needed - content items are already clean
- ❌ Do NOT include `contact_ids` or `primaryContactId` in new app

---

### **2. "Working On Now" Feature**
**Current issue:** Content items have `inWorkingOnNow` boolean flag

**Used by:** "Today Page" to show content currently being worked on

**Action:**
- ✅ Keep the concept (useful for focus mode)
- ✅ Rename to `workingOn` (shorter, clearer)
- ✅ Use for "Continue" button logic in new app

---

### **3. Scheduled Date + Time**
**Current issue:** Content has both `scheduledDate` AND `scheduledTime`

**Why this exists:** Integration with calendar page to show time slots

**Action:**
- ✅ Keep `publishDate` (date only, YYYY-MM-DD)
- ❌ Remove `scheduledTime` (not needed; new app doesn't manage time slots)

---

## 🔗 CROSS-REFERENCES (Not Dependencies)

### **1. Jamie Chat References**
**Current:** Jamie chat may reference content items by ID

**Storage:** `jamieChatMessages` in localStorage

**Example:**
```typescript
{
  role: 'assistant',
  content: 'I noticed you have a draft about prior auth...',
  metadata: { contentItemId: 'abc123' }
}
```

**Action for migration:**
- ✅ Migrate content items independently
- ✅ Jamie chat history is separate (not critical to migrate)
- ✅ New app will have fresh Jamie context

---

### **2. Today Page Playlists**
**Current:** "Today Page" can show content items in "Working On Now" section

**Storage:** `todayPagePlaylists` in localStorage

**Action:**
- ✅ New app doesn't have "Today Page"
- ✅ Use `workingOn` flag for similar "focus" concept
- ✅ No migration needed

---

## 🗄️ CURRENT STORAGE STRUCTURE

### **localStorage.allContentItems** (example):
```json
[
  {
    "id": "content_001",
    "title": "What Patients Wish Providers Knew About Prior Auth",
    "platform": "LinkedIn Post",
    "length": "Standard (250-500 words)",
    "blueprintFamily": "Perspective",
    "blueprintSubtype": "What Patients Wish You Knew",
    "status": "scheduled",
    "tags": ["#prior_auth", "#PX", "#digital_health"],
    "scheduledDate": "2025-12-15",
    "scheduledTime": "12:00 PM",
    "lastUpdated": "2025-12-11T10:30:00.000Z",
    "createdOn": "2025-12-01T08:00:00.000Z",
    "notes": "Focus on the emotional burden, not just the logistics",
    "content": "[draft content here...]",
    "wordCount": 487,
    "inWorkingOnNow": false
  }
]
```

---

## 📋 MIGRATION FIELD MAPPING

### **From OLD app → NEW app:**

| OLD Field | NEW Field | Notes |
|-----------|-----------|-------|
| `id` | `id` | Keep as-is |
| `title` | `title` | Keep as-is |
| `platform` | `contentType` | **Rename** (more specific) |
| `length` | ❌ Remove | Not stored as field; use blueprint default |
| `blueprintFamily` | `blueprintFamily` | Keep as-is |
| `blueprintSubtype` | `blueprintSubtype` | Keep as-is |
| `status` | `status` | **Capitalize**: "idea" → "Idea" |
| `tags` | `tags` | Keep as-is (user tags) |
| `scheduledDate` | `publishDate` | **Rename** |
| `scheduledTime` | ❌ Remove | Not needed |
| `lastUpdated` | `updatedAt` | **Rename** for consistency |
| `createdOn` | `createdAt` | **Rename** for consistency |
| `notes` | `notes` | Keep as-is |
| `content` | `notes` or new `draftContent` field | **Merge** or keep separate |
| `wordCount` | ❌ Remove | Compute on-demand |
| `inWorkingOnNow` | `workingOn` | **Rename** |

### **NEW fields to ADD during migration:**
```typescript
sourceType: "manual"         // Default for all migrated items
contentPillarTags: []        // Empty for now
leadDays: undefined          // Will use defaults from settings
effortMins: undefined        // Will use defaults from settings
```

---

## 🚨 POTENTIAL CONFLICTS DURING MIGRATION

### **Conflict 1: Multiple items with same scheduledDate**
**Problem:** Old app allowed multiple content items on same day

**New app rule:** 1 slot per day

**Solution:**
```
- Keep the FIRST item with that publishDate as Scheduled
- Set all OTHER items with same publishDate to status="Idea" with publishDate=null
- Generate conflict report:
  "Conflicts found: 3 items scheduled for 2025-12-15. Kept 'What Patients Wish...', moved others to Ideas."
```

---

### **Conflict 2: Status normalization**
**Problem:** Old app uses lowercase statuses; new app uses capitalized

**Solution:**
```javascript
const statusMap = {
  'idea': 'Idea',
  'draft': 'Drafting',
  'ready to schedule': 'Review',
  'scheduled': 'Scheduled',
  'published': 'Published',
  'ready_for_review': 'Review',
  'under_review': 'Review',
  'ready_to_schedule': 'Review'
};

migratedStatus = statusMap[oldStatus] || 'Idea';
```

---

### **Conflict 3: Platform name variations**
**Problem:** Old app may have inconsistent platform names

**Solution:**
```javascript
const platformMap = {
  'LinkedIn Post': 'LinkedIn Post',
  'linkedin-post': 'LinkedIn Post',
  'LinkedInPost': 'LinkedIn Post',
  'LinkedIn Article': 'LinkedIn Article',
  'linkedin-article': 'LinkedIn Article',
  'LinkedInArticle': 'LinkedIn Article',
  'Substack': 'Substack Post',
  'substack': 'Substack Post',
  'Substack Post': 'Substack Post'
};

migratedContentType = platformMap[oldPlatform] || 'LinkedIn Post';
```

---

## 🔧 EXTRACTION ACTION PLAN

### **Phase 1: Export from Current App**

**Export script (run in current app's console):**
```javascript
// Export content items
const contentItems = JSON.parse(localStorage.getItem('allContentItems') || '[]');
const exportData = {
  contentItems: contentItems,
  exportDate: new Date().toISOString(),
  totalItems: contentItems.length
};
console.log('Export data:', JSON.stringify(exportData, null, 2));
// Copy output to file
```

**Also export:**
- Blueprint catalog (if customized)
- Any content-specific settings

---

### **Phase 2: Transform Data**

**Transformation script:**
```javascript
function transformContentItem(oldItem) {
  // Status mapping
  const statusMap = {
    'idea': 'Idea',
    'draft': 'Drafting',
    'ready to schedule': 'Review',
    'scheduled': 'Scheduled',
    'published': 'Published'
  };
  
  // Platform mapping
  const platformMap = {
    'LinkedIn Post': 'LinkedIn Post',
    'LinkedIn Article': 'LinkedIn Article',
    'Substack': 'Substack Post'
  };
  
  return {
    id: oldItem.id,
    title: oldItem.title,
    notes: oldItem.notes || oldItem.content || '', // Merge content into notes
    status: statusMap[oldItem.status] || 'Idea',
    contentType: platformMap[oldItem.platform] || 'LinkedIn Post',
    publishDate: oldItem.scheduledDate || undefined,
    tags: oldItem.tags || [],
    blueprintFamily: oldItem.blueprintFamily,
    blueprintSubtype: oldItem.blueprintSubtype,
    leadDays: undefined, // Will use defaults
    effortMins: undefined, // Will use defaults
    sourceType: 'manual',
    contentPillarTags: [],
    createdAt: oldItem.createdOn || new Date().toISOString(),
    updatedAt: oldItem.lastUpdated || new Date().toISOString()
  };
}
```

---

### **Phase 3: Import to New App**

**API endpoint:**
```
POST /api/migrate/importContent
{
  "items": [...transformed items...],
  "options": {
    "handleConflicts": "keep_first", // or "ask_user"
    "normalizeStatuses": true,
    "normalizePlatforms": true
  }
}
```

**Backend logic:**
1. Validate all items
2. Check for publishDate conflicts
3. Normalize statuses/platforms
4. Insert into database
5. Return conflict report

---

## ✅ FINAL VERDICT

### **Extraction Difficulty: LOW** 🟢

**Why it's easy:**
- ✅ Content items are self-contained (no foreign keys to contacts/tasks)
- ✅ No shared state between content and CRM
- ✅ Blueprint system is independent
- ✅ Status system is clean
- ✅ Simple localStorage → database migration

**Only actions needed:**
1. Export content items from localStorage
2. Transform field names (scheduledDate → publishDate, etc.)
3. Normalize statuses (lowercase → capitalized)
4. Handle publishDate conflicts (1 per day rule)
5. Import into new database

**No refactoring required.** ✅

---

## 📝 MIGRATION CHECKLIST

- [ ] Export `allContentItems` from localStorage
- [ ] Transform field names (scheduledDate → publishDate, platform → contentType)
- [ ] Normalize statuses (idea → Idea, draft → Drafting, etc.)
- [ ] Normalize platform names (Substack → Substack Post)
- [ ] Handle publishDate conflicts (keep first, move others to Idea)
- [ ] Add default values for new fields (sourceType, contentPillarTags, etc.)
- [ ] Import into new app database
- [ ] Verify all items appear in Content Library
- [ ] Verify scheduled items appear on Calendar
- [ ] Spot-check 5-10 items for accuracy

---

## 🚫 WHAT TO LEAVE BEHIND

**DO NOT MIGRATE:**
- ❌ Tasks (allTasks)
- ❌ Contacts (allContacts)
- ❌ Meetings (upcomingMeetings)
- ❌ Today Page playlists (todayPagePlaylists)
- ❌ Jamie chat history (jamieChatMessages) - start fresh
- ❌ Nurture todos (allNurtureToDos)
- ❌ Calendar integrations (googleCalendarAutoSync)
- ❌ Business files/documents
- ❌ Client flows/forms

**ONLY MIGRATE:**
- ✅ Content items (allContentItems)
- ✅ Blueprint catalog (if customized from defaults)

---

**END OF DEPENDENCY AUDIT**

**Summary:** Content module is **cleanly extractable** with minimal transformation needed. No blocker dependencies on CRM/tasks/calendar.
