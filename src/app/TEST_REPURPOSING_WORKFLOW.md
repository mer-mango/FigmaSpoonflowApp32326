# Repurposing Workflow Test Script

**Duration:** ~5 minutes  
**Purpose:** Verify canonical repurposing workflow in both Table and Kanban views

---

## Test Data Setup

The app now includes 3 test cases at the top of the content list:

1. **[TEST 1] Clean Published Item - Should Prompt**
   - Status: `Scheduled`
   - No `repurpose` field
   - **Expected:** Will prompt modal when moved to Published

2. **[TEST 2] Already Skipped - Should NOT Prompt**
   - Status: `Published`
   - Has `repurpose.skippedAtISO`
   - **Expected:** Will NOT prompt modal when re-published

3. **[TEST 3] Already Has Children - Should NOT Prompt**
   - Status: `Repurposing`
   - Has `repurpose.childrenIds` with 2 children
   - **Expected:** Will NOT prompt modal when moved to Published

---

## Test Sequence 1: Skip Flow (Table View)

### Steps:
1. **Navigate to Content page** (should default to Table view)
2. **Find TEST 1** (`[TEST 1] Clean Published Item - Should Prompt`)
3. **Click the Status dropdown** (currently shows "Scheduled")
4. **Select "Published"**

### Expected Results:
✅ **Repurposing Modal appears**  
✅ Modal shows 5 repurpose options (LI Post, LI Article, SS Post, SS Audio, Thread)  
✅ Modal has "Create", "Skip", and close button

5. **Click "Skip"**

### Expected Results:
✅ Modal closes  
✅ TEST 1 status changes to **"Published"** (purple pill)  
✅ Console log: `✅ Skipped repurposing for "[TEST 1] Clean Published Item - Should Prompt" (won't prompt again)`

6. **Re-test: Change TEST 1 status to "Scheduled"**
7. **Change back to "Published"**

### Expected Results:
✅ **Modal does NOT appear**  
✅ Status changes directly to "Published"  
✅ Item now has `repurpose.skippedAtISO` set (internal - not visible in UI)

---

## Test Sequence 2: Create Flow (Table View)

### Steps:
1. **Find TEST 2** (`[TEST 2] Already Skipped - Should NOT Prompt`)
2. **Change status from "Published" to "Scheduled"**
3. **Delete the `repurpose.skippedAtISO` field** (dev tools or reset state)
   - *Note: For quick testing, just use TEST 1 again after resetting*
4. **Change status to "Published"**

### Expected Results:
✅ **Repurposing Modal appears**

5. **Select 2 options:**
   - ✅ Check "LinkedIn Post"
   - ✅ Check "Substack Audio"
6. **Click "Create"**

### Expected Results:
✅ Modal closes  
✅ TEST 2 status changes to **"Repurposing"** (gray pill)  
✅ Console logs:
   - `✅ Created 2 repurposed items from "[TEST 2]..."`
   - `✅ Moved "[TEST 2]..." to Repurposing status`
   - `✅ createdFromPublish: true`
✅ **Notification appears** (bell icon): "Created 2 new ideas from..."  
✅ **2 new items appear** in content list:
   - Status: "Idea" (pink pills)
   - Titles: `[Repurpose] [TEST 2]...`
   - Each has blue badge: "Repurposed from: [TEST 2]..."
✅ **TEST 2 shows**: "2 repurposes created" (clickable gray text)

7. **Re-test: Change TEST 2 status to "Scheduled"**
8. **Change back to "Published"**

### Expected Results:
✅ **Modal does NOT appear**  
✅ Status changes directly to "Published"  
✅ Children still exist, parent still shows "2 repurposes created"

---

## Test Sequence 3: Guards Test (Table View)

### Test 3A: Already Skipped Item
1. **Find TEST 2** (now has `skippedAtISO` from Sequence 1)
2. **Change status to "Scheduled"**
3. **Change status to "Published"**

**Expected:** ✅ Modal does NOT appear

### Test 3B: Already Has Children
1. **Find TEST 3** (`[TEST 3] Already Has Children`)
2. **Verify it shows "2 repurposes created"**
3. **Change status from "Repurposing" to "Scheduled"**
4. **Change status to "Published"**

**Expected:** ✅ Modal does NOT appear

---

## Test Sequence 4: Kanban View Tests

### Steps:
1. **Click "Kanban" view toggle** (top of content table)
2. **Wait for Kanban board to render** (6 columns: Idea, Drafting, Review, Scheduled, Published, Repurposing)

### Test 4A: Skip Flow (Kanban)
1. **Find TEST 1** in the "Scheduled" column
2. **Drag to "Published" column**

**Expected:**
✅ Repurposing Modal appears  
✅ Click "Skip"  
✅ TEST 1 card moves to "Published" column  
✅ No modal on re-drag to Published

### Test 4B: Create Flow (Kanban)
1. **Reset TEST 1** (remove `skippedAtISO` or use a fresh item)
2. **Drag to "Published" column**
3. **Select 2 options, click "Create"**

**Expected:**
✅ TEST 1 card moves to **"Repurposing"** column  
✅ 2 new cards appear in **"Idea"** column  
✅ Parent card shows "2 repurposes created"  
✅ Notification appears

---

## Verification Checklist

### Core Workflow
- [ ] Modal appears for clean Published items
- [ ] Modal does NOT appear for items with `skippedAtISO`
- [ ] Modal does NOT appear for items with `childrenIds`
- [ ] Skip button sets status to "Published" and adds `skippedAtISO`
- [ ] Create button sets status to "Repurposing" and creates children
- [ ] Children have status "Idea" with correct `repurposeMeta`
- [ ] Re-publishing skipped/completed items does NOT re-prompt

### UI Feedback
- [ ] Notification appears after creating repurposes
- [ ] Console logs show correct information
- [ ] Parent items show "X repurposes created" text
- [ ] Child items show "Repurposed from: [Parent]" badge (clickable)
- [ ] Badges are blue (#2f829b) and clickable

### Kanban Consistency
- [ ] Drag-to-Published triggers same modal logic
- [ ] Skip moves card to Published column
- [ ] Create moves card to Repurposing column
- [ ] New children appear in Idea column

---

## Console Verification

Open browser console (F12) and verify these logs appear:

**On Create:**
```
✅ Created 2 repurposed items from "[TEST 1] Clean Published Item - Should Prompt"
✅ Moved "[TEST 1] Clean Published Item - Should Prompt" to Repurposing status
✅ createdFromPublish: true
```

**On Skip:**
```
✅ Skipped repurposing for "[TEST 1] Clean Published Item - Should Prompt" (won't prompt again)
```

---

## Edge Cases to Verify

1. **Empty selection** (0 outputs):
   - Open modal
   - Click "Create" without selecting any options
   - **Expected:** Same as clicking "Skip"

2. **Close without action**:
   - Open modal
   - Click X or click outside
   - **Expected:** Status unchanged, modal closes

3. **Manual repurposing** (from Published item):
   - Find a Published item with no children
   - Click ⋮ menu → "Start Repurposing"
   - **Expected:** Modal opens with same flow

---

## Data Verification (Dev Tools)

After creating repurposes, inspect state in React DevTools:

**Parent item:**
```typescript
{
  id: 'test-clean-1',
  status: 'Repurposing',
  repurpose: {
    initiatedAtISO: '2025-01-07T...',
    childrenIds: ['uuid-1', 'uuid-2']
  }
}
```

**Child item:**
```typescript
{
  id: 'uuid-1',
  status: 'Idea',
  repurposeMeta: {
    sourceId: 'test-clean-1',
    createdFromPublish: true,
    createdAtISO: '2025-01-07T...'
  }
}
```

---

## Known Test Data

- **TEST 1:** Fresh item, will prompt
- **TEST 2:** Already skipped (has `skippedAtISO`)
- **TEST 3:** Already has children (has `childrenIds`)

---

## Success Criteria

✅ **All 3 test cases behave correctly**  
✅ **Modal logic identical in Table and Kanban views**  
✅ **No double-prompts on re-publish**  
✅ **Idempotency: creating repurposes twice does nothing**  
✅ **Children always created with correct metadata**  
✅ **Console logs confirm flow**  
✅ **Notifications appear**  

---

## requestContentStatusChange() Logic Reference

```typescript
export function requestContentStatusChange(
  item: ContentItem,
  nextStatus: ContentStatus
): RepurposeDecision {
  // Non-publish transitions: always allow
  if (nextStatus !== 'Published') {
    return { action: 'apply-status', newStatus: nextStatus };
  }

  // Publishing transition: check repurpose guards
  const alreadyHasChildren = !!item.repurpose?.childrenIds?.length;
  const alreadySkipped = !!item.repurpose?.skippedAtISO;

  // If repurposing is already resolved, don't prompt again
  if (alreadyHasChildren || alreadySkipped) {
    return { action: 'apply-status', newStatus: 'Published' };
  }

  // Otherwise, prompt before finalizing publish
  return { action: 'prompt-repurpose', item };
}
```

**Guards:**
- ✅ `alreadyHasChildren`: Checks `item.repurpose?.childrenIds?.length`
- ✅ `alreadySkipped`: Checks `item.repurpose?.skippedAtISO`
- ✅ Both use optional chaining and double-negation for safe boolean conversion

---

## Time Estimate

- **Test Sequence 1 (Skip):** 1 minute
- **Test Sequence 2 (Create):** 1.5 minutes
- **Test Sequence 3 (Guards):** 1 minute
- **Test Sequence 4 (Kanban):** 1.5 minutes
- **Total:** ~5 minutes

---

## Pass/Fail

**PASS:** All checkboxes checked, all expected results match actual behavior  
**FAIL:** Any modal appears when it shouldn't, or doesn't appear when it should
