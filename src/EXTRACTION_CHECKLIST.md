# Content App Extraction Checklist
## Exact Files to Copy from Client Hub → New Content App

Copy these files from your existing client management hub to create the standalone content app.

---

## 📋 COPY CHECKLIST

### ✅ **STEP 1: Main View Components (2 files)**

```
FROM client hub                          TO content app
────────────────────────────────────────────────────────────
/components/muted_ContentPage_Gallery.tsx  →  /components/muted_ContentPage_Gallery.tsx
/components/ContentTableView.tsx           →  /components/ContentTableView.tsx
```

---

### ✅ **STEP 2: Modals & Wizards (8 files)**

```
FROM client hub                                    TO content app
──────────────────────────────────────────────────────────────────────
/components/muted_NewContentModal.tsx              →  /components/muted_NewContentModal.tsx
/components/muted_NewContentWizard.tsx             →  /components/muted_NewContentWizard.tsx
/components/muted_ContentWizard.tsx                →  /components/muted_ContentWizard.tsx
/components/content/ContentDetailModal.tsx         →  /components/content/ContentDetailModal.tsx
/components/muted_ContentModal.tsx                 →  /components/muted_ContentModal.tsx
/components/content/PostMeetingContentWizard.tsx   →  /components/content/PostMeetingContentWizard.tsx
/components/content/ResumeWritingDialog.tsx        →  /components/content/ResumeWritingDialog.tsx
/components/content/ContentGoalReminder.tsx        →  /components/content/ContentGoalReminder.tsx
```

---

### ✅ **STEP 3: Blueprint System (1 file) ⭐ CRITICAL**

```
FROM client hub                                TO content app
─────────────────────────────────────────────────────────────
/components/muted_InlineBlueprintTemplate.tsx  →  /components/muted_InlineBlueprintTemplate.tsx
```

---

### ✅ **STEP 4: AI & Writing Features (5 files)**

```
FROM client hub                                    TO content app
──────────────────────────────────────────────────────────────────────
/components/muted_DraftingFocusMode.tsx            →  /components/muted_DraftingFocusMode.tsx
/components/content/JamieIdeaCard.tsx              →  /components/content/JamieIdeaCard.tsx
/components/muted_BrainDumpModal.tsx               →  /components/muted_BrainDumpModal.tsx
/components/AICopilot.tsx                          →  /components/AICopilot.tsx
/components/GlobalJamiePanel.tsx                   →  /components/GlobalJamiePanel.tsx
```

---

### ✅ **STEP 5: Document Export & Formatting (3 files)**

```
FROM client hub                                    TO content app
──────────────────────────────────────────────────────────────────────
/components/muted_FormattingToolbar.tsx            →  /components/muted_FormattingToolbar.tsx
/components/muted_ImageLibrary.tsx                 →  /components/muted_ImageLibrary.tsx
/components/muted_JamieImageAccessibilityModal.tsx →  /components/muted_JamieImageAccessibilityModal.tsx
```

---

### ✅ **STEP 6: Layout & Navigation (3 files) - REQUIRED**

```
FROM client hub                          TO content app
───────────────────────────────────────────────────────────
/components/SharedLayout_Muted.tsx       →  /components/SharedLayout_Muted.tsx
/components/PageHeader_Muted.tsx         →  /components/PageHeader_Muted.tsx
/components/QuickAddDropdown.tsx         →  /components/QuickAddDropdown.tsx
```

**OR if you have:**
```
/components/QuickAddMenu.tsx             →  /components/QuickAddMenu.tsx
```

---

### ✅ **STEP 7: Supporting Components (Check if needed)**

Some files might import these - only copy if referenced:

```
FROM client hub                          TO content app (if needed)
────────────────────────────────────────────────────────────────────
/components/content/ContentCard.tsx      →  /components/content/ContentCard.tsx
/components/StatusBadge.tsx              →  /components/StatusBadge.tsx
/components/TagBadge.tsx                 →  /components/TagBadge.tsx
/components/PlatformIcon.tsx             →  /components/PlatformIcon.tsx
```

---

### ✅ **STEP 8: UI Components Folder (ENTIRE FOLDER)**

```
FROM client hub               TO content app
─────────────────────────────────────────────
/components/ui/               →  /components/ui/

This includes all primitives:
  - button.tsx
  - input.tsx
  - textarea.tsx
  - dialog.tsx
  - dropdown-menu.tsx
  - select.tsx
  - badge.tsx
  - card.tsx
  - label.tsx
  - switch.tsx
  - checkbox.tsx
  - radio-group.tsx
  - tabs.tsx
  - tooltip.tsx
  - popover.tsx
  - calendar.tsx
  - date-picker.tsx
  - ... (any others)
```

---

### ✅ **STEP 9: Shared Components Folder (ENTIRE FOLDER)**

```
FROM client hub               TO content app
─────────────────────────────────────────────
/components/shared/           →  /components/shared/

This includes reusable components like:
  - EmptyState.tsx
  - LoadingSpinner.tsx
  - SearchBar.tsx
  - FilterDropdown.tsx
  - SortDropdown.tsx
  - ... (any others)
```

---

### ✅ **STEP 10: Styles (1 file) - CRITICAL**

```
FROM client hub          TO content app
──────────────────────────────────────────
/styles/globals.css      →  /styles/globals.css
```

This file contains:
- All design tokens
- Empower Health Strategies brand colors
- Lora + Poppins fonts
- Base typography styles
- Tailwind setup

---

### ✅ **STEP 11: Types/Interfaces (If separate file)**

If you have a types file, copy it:

```
FROM client hub                TO content app
─────────────────────────────────────────────
/types/content.ts              →  /types/content.ts
/types/index.ts                →  /types/index.ts
```

Otherwise, the ContentItem interface is in App.tsx (provided in the guide).

---

### ✅ **STEP 12: Utilities (If needed)**

Check if any components import utility functions:

```
FROM client hub                TO content app
─────────────────────────────────────────────
/utils/formatDate.ts           →  /utils/formatDate.ts
/utils/wordCount.ts            →  /utils/wordCount.ts
/utils/localStorage.ts         →  /utils/localStorage.ts
/utils/export.ts               →  /utils/export.ts
```

---

## 🎯 **SIMPLIFIED EXTRACTION PROCESS**

### **Option A: Copy Everything (Safest)**

1. Create new Figma Make file: "Content Management Hub"
2. Copy entire `/components/ui/` folder
3. Copy entire `/components/shared/` folder
4. Copy all 22 individual files listed above
5. Copy `/styles/globals.css`
6. Copy `/utils/` folder (if it exists)
7. Create new `/App.tsx` with the code from CONTENT_APP_CUSTOM_BUILD.md

### **Option B: Minimal Approach (Requires debugging)**

Copy only the 22 core files + ui/ folder, then add missing dependencies as errors appear.

---

## 📦 **FILE COUNT SUMMARY**

```
Core Components:        22 files
UI Components:          ~15 files (entire ui/ folder)
Shared Components:      ~5 files (entire shared/ folder)
Styles:                 1 file (globals.css)
Utils:                  ~3 files (if needed)
App.tsx:                1 file (NEW - create from guide)
────────────────────────────────────────
TOTAL:                  ~47 files
```

---

## 🔧 **MODIFICATIONS NEEDED**

### **After copying files, make these changes:**

#### **1. Remove Client Hub Dependencies**

Search all copied files for imports like:
```typescript
import { useContacts } from '../hooks/useContacts'  ❌ DELETE
import { useClients } from '../hooks/useClients'    ❌ DELETE
import { useTasks } from '../hooks/useTasks'        ❌ DELETE
```

#### **2. Update SharedLayout_Muted.tsx**

Remove navigation items you don't need:

```typescript
// BEFORE (in client hub)
const navItems = [
  { label: 'Calendar', page: 'calendar' },
  { label: 'Tasks', page: 'tasks' },
  { label: 'Contacts', page: 'contacts' },
  { label: 'Content', page: 'content' },     ← Keep only this
  { label: 'Forms', page: 'forms' },
];

// AFTER (in content app)
const navItems = [
  { label: 'Content', page: 'content' },
  { label: 'Analytics', page: 'analytics' }, // Optional: add later
];
```

#### **3. Simplify Stats in Layout**

```typescript
// BEFORE (in client hub)
stats={{
  calendar: 5,
  tasks: 12,
  contacts: 48,
  content: 24,
}}

// AFTER (in content app)
stats={{
  content: allContentItems.filter(c => c.status !== 'archived').length,
}}
```

#### **4. Remove PostMeetingContentWizard Dependencies**

If this component references meetings/calendar:
- Either remove the meeting-specific logic
- OR skip copying this file entirely

---

## 🚀 **SETUP INSTRUCTIONS**

### **Step 1: Create New Project**
In Figma Make, create a new file called "Content Management Hub"

### **Step 2: Copy Files**
Copy all files listed above from your client hub

### **Step 3: Create App.tsx**
Use the complete App.tsx code from `/CONTENT_APP_CUSTOM_BUILD.md`

### **Step 4: Test**
Run the app and check for:
- Missing imports (copy the missing files)
- Broken references to client/contact/task data (remove them)
- UI component errors (make sure you copied entire ui/ folder)

### **Step 5: Clean Up**
Remove any unused imports or dead code

---

## 📁 **FINAL FOLDER STRUCTURE**

```
content-app/
├── App.tsx                              ← NEW (from guide)
├── styles/
│   └── globals.css                      ← COPIED
├── components/
│   ├── ui/                              ← COPIED (entire folder)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   └── ... (all UI primitives)
│   ├── shared/                          ← COPIED (entire folder)
│   │   ├── EmptyState.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── ...
│   ├── content/                         ← COPIED (4 files)
│   │   ├── ContentDetailModal.tsx
│   │   ├── PostMeetingContentWizard.tsx
│   │   ├── ResumeWritingDialog.tsx
│   │   └── ContentGoalReminder.tsx
│   ├── SharedLayout_Muted.tsx           ← COPIED (modified)
│   ├── PageHeader_Muted.tsx             ← COPIED
│   ├── QuickAddDropdown.tsx             ← COPIED
│   ├── muted_ContentPage_Gallery.tsx    ← COPIED
│   ├── ContentTableView.tsx             ← COPIED
│   ├── muted_NewContentModal.tsx        ← COPIED
│   ├── muted_NewContentWizard.tsx       ← COPIED
│   ├── muted_ContentWizard.tsx          ← COPIED
│   ├── muted_ContentModal.tsx           ← COPIED
│   ├── muted_InlineBlueprintTemplate.tsx ← COPIED (⭐ CRITICAL)
│   ├── muted_DraftingFocusMode.tsx      ← COPIED
│   ├── JamieIdeaCard.tsx                ← COPIED
│   ├── muted_BrainDumpModal.tsx         ← COPIED
│   ├── AICopilot.tsx                    ← COPIED
│   ├── GlobalJamiePanel.tsx             ← COPIED
│   ├── muted_FormattingToolbar.tsx      ← COPIED
│   ├── muted_ImageLibrary.tsx           ← COPIED
│   └── muted_JamieImageAccessibilityModal.tsx ← COPIED
└── utils/                               ← COPIED (if exists)
    ├── formatDate.ts
    ├── wordCount.ts
    └── export.ts
```

---

## ✅ **CHECKLIST FOR BUILDER**

Give your builder this exact list:

```
☐ Copy /components/ui/ folder (entire folder)
☐ Copy /components/shared/ folder (entire folder)  
☐ Copy /styles/globals.css
☐ Copy 22 core component files (see Step 1-6 above)
☐ Copy /utils/ folder (if it exists)
☐ Create new /App.tsx from CONTENT_APP_CUSTOM_BUILD.md
☐ Remove client/contact/task imports from all files
☐ Simplify SharedLayout_Muted navigation
☐ Test and fix any missing dependencies
```

---

## 🎯 **WHAT TO TELL YOUR BUILDER**

> "I need to extract the content management features from my client hub into a standalone app. 
> 
> Please copy:
> - All files listed in EXTRACTION_CHECKLIST.md
> - The entire /components/ui/ folder
> - The entire /components/shared/ folder
> - /styles/globals.css
> 
> Then create a new /App.tsx using the code from CONTENT_APP_CUSTOM_BUILD.md.
> 
> After copying, remove any imports related to contacts, clients, tasks, or calendar from the content files.
> 
> The app should be standalone and only manage content (blog posts, LinkedIn posts, etc.) with no dependencies on the client management system."

---

## 💡 **OPTIONAL: Add Later**

After the core app works, you can add:

```
☐ LinkedIn integration (separate file)
☐ Substack integration (separate file)
☐ Analytics dashboard
☐ Publishing calendar
☐ Version history
☐ Content templates library
```

---

## ❓ **NEED THE ACTUAL FILES?**

I can:
1. ✅ Check your current client hub for these exact files
2. ✅ Create a zip/bundle of all the files you need
3. ✅ Generate any missing components
4. ✅ Walk through the extraction step-by-step

Let me know if you want me to help extract the actual files from your client hub!
