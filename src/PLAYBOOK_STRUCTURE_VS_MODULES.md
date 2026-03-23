# Platform Playbook: `structure` vs `modules` Usage

## Quick Answer

**`structure`** - Currently **NOT USED** anywhere in the app (legacy/future-proofing)
**`modules`** - Actively used for UI generation and ordering in Outline mode

---

## Current Usage Analysis

### ✅ `modules` Array - ACTIVELY USED

The `modules` array is the **primary data structure** used throughout the app.

#### **1. UI Generation in Outline Mode**
**File:** `/components/content/ContentEditor.tsx`

```typescript
{platformData.modules.map((module, index) => (
  <div key={module.key} className="bg-white border-2 border-slate-200 rounded-lg p-5 shadow-sm">
    {/* Module Header */}
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-full bg-[#6b2358] text-white flex items-center justify-center text-xs font-bold">
            {index + 1}
          </div>
          <h4 className="text-base font-semibold text-slate-900">{module.label}</h4>
        </div>
        <p className="text-sm text-slate-600 ml-8">{module.description}</p>
      </div>
    </div>

    {/* Module Textarea */}
    <textarea
      value={moduleDrafts[module.key] || ''}
      onChange={(e) => onModuleChange(module.key, e.target.value)}
      placeholder={module.placeholder || `Write your ${module.label.toLowerCase()} here...`}
      rows={module.key === 'hook' ? 3 : module.key === 'cta' ? 2 : 5}
      className="..."
    />
  </div>
))}
```

**What it does:**
- Renders a numbered card for each module (1. Hook, 2. Context, 3. POV, etc.)
- Shows `module.label` as the heading
- Shows `module.description` as helper text
- Uses `module.placeholder` in the textarea
- Dynamically adjusts textarea rows based on `module.key`

#### **2. Ordering**
**Purpose:** The order of items in the `modules` array determines the visual order in Outline mode

Example for LI Post:
```typescript
modules: [
  { key: "hook", label: "Hook", ... },              // Shows as #1
  { key: "context", label: "Context / Micro-story", ... },  // Shows as #2
  { key: "pov", label: "Your take", ... },          // Shows as #3
  { key: "takeaways", label: "Make it usable", ... },       // Shows as #4
  { key: "cta", label: "CTA", ... }                 // Shows as #5
]
```

#### **3. Draft Consolidation**
**File:** `/components/content/ContentEditor.tsx` - `consolidateModulesToContent()`

```typescript
const consolidateModulesToContent = (): string => {
  if (!editedItem.platform || editedItem.platform === '') return editedItem.content;
  
  const platformData = platformPlaybook.platforms[editedItem.platform];
  if (!platformData || !platformData.modules) return editedItem.content;
  
  // Use single source of truth: prefer editedItem.moduleDraft, fallback to moduleDrafts
  const draftSource = editedItem.moduleDraft ?? moduleDrafts;
  
  const parts: string[] = [];
  platformData.modules.forEach(module => {
    const moduleContent = draftSource[module.key];
    if (moduleContent && moduleContent.trim()) {
      parts.push(moduleContent.trim());
    }
  });
  
  return parts.join('\n\n');
};
```

**What it does:**
- Iterates through `modules` in order
- Grabs content from each module's key (`hook`, `context`, `pov`, etc.)
- Joins them with double line breaks to create final draft
- **Order matters here** - determines the sequence in the final consolidated draft

#### **4. Jamie AI Suggestions**
**File:** `/components/content/ContentEditor.tsx` - `handleGenerateModuleSuggestions()`

```typescript
const handleGenerateModuleSuggestions = async (moduleKey: string) => {
  setActiveModuleHelp(moduleKey);
  
  const platformData = editedItem.platform && platformPlaybook.platforms[editedItem.platform];
  const module = platformData?.modules?.find(m => m.key === moduleKey);
  
  if (!module) return;
  
  // Uses module.description and module.label for context
  // (Currently stubbed, but would pass this to Jamie AI)
};
```

**What it does:**
- Finds the module by `key`
- Uses `module.description` and `module.label` to provide context for AI suggestions

---

### ❌ `structure` Array - NOT CURRENTLY USED

The `structure` array exists in the config but is **not referenced anywhere in the codebase**.

#### **What it contains:**
- Similar to `modules` but with different keys and `guidance` instead of `description`/`placeholder`
- Example (LI Post):
```typescript
structure: [
  { key: "hook", label: "Hook", guidance: "1–2 lines. A sharp truth, a tension..." },
  { key: "context_or_micro_story", label: "Context / Micro-story", guidance: "2–5 short lines..." },
  { key: "takeaway", label: "Your take", guidance: "Name the lesson..." },
  { key: "how_to_apply", label: "Make it usable", guidance: "1–3 bullets..." },
  { key: "cta", label: "CTA", guidance: "Invite comments..." }
]
```

#### **Key differences from `modules`:**
| Field | `structure` | `modules` |
|-------|------------|----------|
| Keys | Different keys (`context_or_micro_story`, `takeaway`) | Standard keys (`context`, `pov`, `takeaways`) |
| Helper text field | `guidance` | `description` + `placeholder` |
| Purpose | Conceptual flow / AI prompting? | UI generation + data storage |

#### **Potential future uses:**
1. **AI prompt context** - Could be passed to Jamie AI as "how to structure this platform"
2. **Validation** - Could validate that draft includes these conceptual sections
3. **Educational content** - Could be shown in a "learn more" section
4. **Alternative view mode** - Could power a different UI view

---

## Why Two Arrays Exist?

### **Theory:**

**`structure`** = Conceptual/educational - "Here's how to THINK about this platform"
- More detailed guidance text
- Conceptual labels (`context_or_micro_story`, `takeaway`, `how_to_apply`)
- Could be used for AI prompting or teaching moments

**`modules`** = Practical/technical - "Here's how to BUILD in outline mode"
- Standardized keys for data storage (`hook`, `context`, `pov`, `takeaways`, `cta`)
- Includes UI-specific fields (`placeholder`, `description`)
- Keys must match the `moduleDraft` object keys in ContentItem type

### **Data Compatibility Note:**

The `modules` array uses keys like `hook`, `context`, `pov`, `takeaways`, `cta` because these match the keys stored in the database:

```typescript
// From ContentItem type
moduleDraft?: {
  hook?: string;
  context?: string;
  pov?: string;
  takeaways?: string;
  cta?: string;
};
```

**Important:** When we updated the playbook, we kept the module keys (`hook`, `context`, `pov`, `takeaways`, `cta`) the same to preserve compatibility with saved `moduleDraft` data, even though we updated the labels and descriptions.

---

## Summary Table

| Aspect | `structure` | `modules` |
|--------|------------|----------|
| **Currently Used?** | ❌ No | ✅ Yes |
| **Purpose** | Unknown/Legacy | UI generation, ordering, consolidation |
| **Keys** | Platform-specific conceptual keys | Standardized data keys |
| **Fields** | `key`, `label`, `guidance` | `key`, `label`, `description`, `placeholder` |
| **Ordering impact** | None (not used) | Determines UI order and consolidation order |
| **Validation** | Could be used (not implemented) | Not used for validation |
| **AI integration** | Could be used (not implemented) | Used for module-specific suggestions |
| **Database compatibility** | Keys don't match `moduleDraft` | Keys match `moduleDraft` exactly |

---

## Recommendation

### **Option A: Keep both (current state)**
- Pros: Future-proof, no breaking changes
- Cons: Confusing, redundant, maintenance burden

### **Option B: Remove `structure` entirely**
- Pros: Cleaner, less confusion, easier to maintain
- Cons: Lose potential future use case

### **Option C: Move `structure` guidance into Jamie AI prompts**
- Convert `structure` into a prompt-only resource (like we did with PromptScheduleSettings)
- Remove from platform_playbook.ts
- Add to Jamie's system prompt when generating platform-specific content
- Pros: Clean separation, single source for UI (`modules`), rich context for AI
- Cons: One-time migration effort

### **My recommendation: Option C**

Create a separate `platformGuidance` constant used only in AI prompts, delete `structure` from the playbook, keep `modules` as the single source of truth for UI/data.

---

## Current Active Code Paths

1. **Outline Mode UI** → uses `platformData.modules`
2. **Draft Consolidation** → iterates `platformData.modules` in order
3. **Module Suggestions** → finds module by key from `platformData.modules`
4. **JamiePanel** → uses `platformData.best_practices` and `platformData.checklist` (NOT structure)

**`structure` is not used in any active code path.**
