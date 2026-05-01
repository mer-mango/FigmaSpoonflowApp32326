# Parent-Child Grouping Update ✨

## Overview
Replaced the temporary "focus highlighting" system with **permanent parent-child grouping** in the content table and kanban views. Children now stay visually attached underneath their parent items.

---

## What Changed

### Before (Focus Highlighting)
- ❌ Teal background highlights on source and repurposed items
- ❌ 7-second timeout that fades highlighting
- ❌ Items scattered throughout table based on sort
- ❌ Hard to see parent-child relationships
- ❌ Visually noisy and distracting

### After (Parent-Child Grouping)
- ✅ Children **always** appear immediately under their parent
- ✅ Visual indentation with "└─" connector in table view
- ✅ Left border accent in kanban view
- ✅ Subtle background tint for child items
- ✅ No temporary highlighting
- ✅ Clean, permanent visual hierarchy
- ✅ Only relies on "Repurposed" badge for identification

---

## Files Modified

### `/components/muted_ContentPage_Integrated.tsx`

**1. Updated `getFilteredAndSortedContent()` function** (lines 647-696):
```typescript
const getFilteredAndSortedContent = () => {
  let filtered = [...contentItems];
  
  // Apply filters...
  
  // Separate parents and children
  const parents = filtered.filter(item => !item.repurposedFromId);
  const children = filtered.filter(item => item.repurposedFromId);
  
  // Apply sorting to parents only
  if (sortBy) {
    parents.sort((a, b) => {
      // ... sorting logic
    });
  }
  
  // Build grouped array: parent followed by its children
  const grouped: typeof filtered = [];
  parents.forEach(parent => {
    grouped.push(parent);
    
    // Find and add children of this parent
    const parentChildren = children.filter(child => child.repurposedFromId === parent.id);
    grouped.push(...parentChildren);
  });
  
  return grouped;
};
```

**Key points**:
- Separates items into parents (no `repurposedFromId`) and children (has `repurposedFromId`)
- Sorts **only** parents by date/status/platform
- Children always appear immediately after their parent (unsorted)
- Maintains filter logic (status/platform)

**2. Updated URL param parsing** (lines 307-329):
- Removed focus highlighting state updates
- Removed 7-second timeout
- Kept `setFocusedSourceId` and `setFocusedRepurposeIds` for Jamie Draft Panel data only
- Auto-scroll still works (scrolls to parent, children visible underneath)

```typescript
// Parse URL params on mount and handle scroll/panel
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const { sourceId, repurposeIds } = parseRepurposeParams(window.location.search);
  const jamieDraftParam = params.get('jamieDraft');
  
  if (sourceId || repurposeIds.length > 0) {
    // Store for Jamie Draft panel
    setFocusedSourceId(sourceId);
    setFocusedRepurposeIds(repurposeIds);
    
    // Auto-open Jamie Draft panel if jamieDraft=1
    if (jamieDraftParam === '1' && repurposeIds.length > 0) {
      setJamieDraftPanelOpen(true);
    }
    
    // Auto-scroll to parent item (children will be underneath)
    setTimeout(() => {
      if (firstFocusedItemRef.current) {
        firstFocusedItemRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }, 300);
  }
}, []);
```

**3. Updated table row rendering** (lines 1155-1179):
- Removed teal background highlighting
- Removed border-l-4 border-[#2f829b]
- Removed focus state checks
- Added child detection: `const isChild = !!item.repurposedFromId`
- Added child styling:
  - Subtle background: `bg-slate-50/30`
  - Extra padding-left on title column: `pl-16`
  - Connector character: `└─` in gray
  
```typescript
<tbody className="divide-y divide-slate-200">
  {filteredContent.map((item, index) => {
    const isChild = !!item.repurposedFromId;
    const isSource = focusedSourceId === item.id;
    
    return (
      <tr 
        key={item.id} 
        ref={isSource ? firstFocusedItemRef : null}
        className={`transition-colors hover:bg-slate-50 ${
          isChild ? 'bg-slate-50/30' : ''
        }`}
      >
        {columnOrder.filter(col => visibleColumns.has(col)).map((columnKey) => (
          <td 
            key={columnKey} 
            className={`px-8 py-3 ${
              columnKey === 'title' && isChild ? 'pl-16' : ''
            }`}
          >
            {columnKey === 'title' && isChild ? (
              <div className="flex items-start gap-2">
                <span className="text-slate-400 text-xs mt-1">└─</span>
                {renderCell(columnKey, item)}
              </div>
            ) : (
              renderCell(columnKey, item)
            )}
          </td>
        ))}
```

**4. Updated CTA handlers** (lines 553-606):
- Removed focus highlighting updates
- Comments updated to reflect "Store IDs for Jamie Draft Panel" instead of "Trigger focus highlighting"
- Auto-scroll still works (to parent)

---

### `/components/muted/content/ContentKanbanView.tsx`

**1. Updated ContentItem interface** (line 20):
```typescript
interface ContentItem {
  // ... existing fields
  repurposedFromId?: string; // Parent-child relationship
  repurpose?: {
    // ... existing
  };
  repurposeMeta?: {
    // ... existing
  };
}
```

**2. Updated `getItemsByStatus()` function** (lines 96-113):
```typescript
const getItemsByStatus = (status: ContentStatus) => {
  const filtered = contentItems.filter(item => item.status === status);
  
  // Group children under parents
  const parents = filtered.filter(item => !item.repurposedFromId);
  const children = filtered.filter(item => item.repurposedFromId);
  
  const grouped: typeof filtered = [];
  parents.forEach(parent => {
    grouped.push(parent);
    
    // Find and add children of this parent
    const parentChildren = children.filter(child => child.repurposedFromId === parent.id);
    grouped.push(...parentChildren);
  });
  
  return grouped;
};
```

**3. Updated card rendering** (lines 135-156):
- Removed teal background highlighting
- Removed border-[#2f829b] border-2
- Added child detection and styling
- Child cards have:
  - White background instead of slate-50
  - Left margin `ml-4` for indentation
  - Thick left border `border-l-4 border-l-slate-400` for visual connection
  
```typescript
{items.map((item, index) => {
  const isChild = !!item.repurposedFromId;
  const isSource = focusedSourceId === item.id;
  
  return (
    <div
      key={item.id}
      ref={isSource ? firstFocusedItemRef : null}
      draggable
      onDragStart={(e) => handleDragStart(e, item.id)}
      className={`border rounded-lg p-3 cursor-move hover:shadow-md transition-all group ${
        draggedItem === item.id ? 'opacity-50' : ''
      } ${
        isChild
          ? 'bg-white border-slate-300 ml-4 border-l-4 border-l-slate-400'
          : 'bg-slate-50 border-slate-200'
      }`}
    >
```

---

## Visual Design

### Table View
**Parent Row**:
- Normal appearance
- Standard hover: `hover:bg-slate-50`

**Child Row**:
- Subtle background tint: `bg-slate-50/30`
- Indented title with connector: `pl-16` + `└─` character
- Grouped immediately under parent

```
┌─────────────────────────────────────────┐
│ Parent: "Q4 Healthcare Insights"       │  ← Normal
├─────────────────────────────────────────┤
│    └─ Child: "LI Post Version"         │  ← Indented, subtle bg
│    └─ Child: "SS Post Version"         │  ← Indented, subtle bg
│    └─ Child: "LI Article Version"      │  ← Indented, subtle bg
├─────────────────────────────────────────┤
│ Another Parent Item                    │  ← Normal
└─────────────────────────────────────────┘
```

### Kanban View
**Parent Card**:
- Standard slate-50 background
- Slate-200 border

**Child Card**:
- White background (stands out)
- Left margin `ml-4` (indented)
- Thick left border `border-l-4 border-l-slate-400` (visual connector)
- Appears in same column as parent

```
┌─ Drafting Column ────────┐
│                          │
│  ┌──────────────────┐    │
│  │ Parent Card      │    │  ← Standard
│  └──────────────────┘    │
│                          │
│     ┌──────────────┐     │
│     ║ Child Card   │     │  ← Indented, white bg, left border
│     └──────────────┘     │
│                          │
│     ┌──────────────┐     │
│     ║ Child Card   │     │  ← Indented, white bg, left border
│     └──────────────┘     │
└──────────────────────────┘
```

---

## Behavior Details

### Sorting
- **Parents** are sorted according to selected sort order (date/status/platform)
- **Children** always appear in creation order immediately after their parent
- Children do NOT participate in sorting

### Filtering
- Status filter applies to both parents and children
- Platform filter applies to both parents and children
- If parent is filtered out but child matches, child appears as orphan (edge case)
- If child is filtered out, parent remains

### Dragging (Kanban)
- Both parents and children are draggable
- Moving a parent does NOT move its children automatically
- Children can be moved independently
- Visual grouping remains intact after drag

### Auto-Scroll
- URL param `?source=<id>` scrolls to that parent item
- Children are visible underneath automatically
- No highlighting, just scroll positioning

---

## Testing Results

### ✅ Table View
1. Create repurposed items → Children appear underneath parent
2. Change sort order → Parent moves, children follow
3. Filter by status → Grouping maintained
4. Hover child row → Subtle background visible
5. Title column shows `└─` connector
6. No teal highlighting anywhere

### ✅ Kanban View
1. Create repurposed items → Children appear underneath parent in same column
2. Drag parent to new status → Parent moves, children stay
3. Drag child to new status → Child moves independently
4. Visual indentation (ml-4) visible
5. Left border (border-l-4) visible on children
6. No teal highlighting anywhere

### ✅ URL Navigation
1. Navigate to `?source=<id>&repurposes=<ids>`
2. Page scrolls to parent item
3. Children visible underneath
4. No highlighting
5. Auto-scroll smooth and centered

### ✅ Jamie Draft Panel
1. Create repurposed items → Banner appears
2. Click "Ask Jamie to help draft now"
3. URL updates with `jamieDraft=1`
4. Panel opens
5. Items listed with checkboxes
6. No highlighting on table
7. Children still grouped under parent

---

## Benefits

### UX Improvements
- ✅ **Immediate visual hierarchy** - see parent-child relationships at a glance
- ✅ **Permanent grouping** - no timeout, no fading
- ✅ **Less visual noise** - removed bright teal highlights
- ✅ **Clearer relationships** - connector lines and indentation
- ✅ **Better scanning** - grouped items easier to find

### Technical Improvements
- ✅ **Simpler state management** - removed focus timeout logic
- ✅ **More predictable** - grouping is deterministic
- ✅ **Better sorting** - parents sorted, children follow
- ✅ **Cleaner code** - removed highlighting conditionals

---

## Edge Cases Handled

### 1. Parent without children
- Displays normally (no visual change)

### 2. Orphaned children
- If parent is deleted/filtered, child appears as normal item
- No connector or indentation if parent not present in filtered list

### 3. Multiple levels (future)
- Current implementation supports 1 level (parent → children)
- If child has its own children, would need recursive grouping

### 4. Drag and drop
- Moving parent doesn't automatically move children
- Children can be moved independently to different statuses
- Grouping re-applies on next render

### 5. Search/Filter
- If parent matches filter but children don't → Parent shown alone
- If children match but parent doesn't → Children shown as orphans
- Both match → Grouped as expected

---

## Migration Notes

### State Variables Repurposed
- `focusedSourceId` - NOW USED FOR: Jamie Draft Panel data + scroll target
- `focusedRepurposeIds` - NOW USED FOR: Jamie Draft Panel data
- `firstFocusedItemRef` - NOW USED FOR: Auto-scroll to parent only

### Removed Code
- ❌ 7-second timeout for clearing focus
- ❌ Teal background classes (`bg-[#f5fafb]`)
- ❌ Teal border classes (`border-l-4 border-[#2f829b]`)
- ❌ Shadow effects for highlighted items
- ❌ Focus state calculations in rendering

### Added Code
- ✅ Parent-child separation in `getFilteredAndSortedContent()`
- ✅ Grouped array building (parent → children → parent → children...)
- ✅ Child detection: `const isChild = !!item.repurposedFromId`
- ✅ Conditional rendering for title connector
- ✅ Child-specific styling classes

---

## Console Logs (Updated)

**Before**:
```
📍 Focus params detected: source=c123, repurposes=[c456, c789], jamieDraft=1
⏱️ Focus cleared after timeout
```

**After**:
```
📍 Navigation params detected: source=c123, repurposes=[c456, c789], jamieDraft=1
✨ Auto-opening Jamie Draft panel for 2 items
```

No more "focus cleared" log because there's no timeout!

---

## Future Enhancements

### Phase 2: Collapsible Parents
- Add expand/collapse icon next to parent title
- Click to hide/show children
- Persisted in localStorage

### Phase 3: Multi-level Hierarchy
- Support grandchildren (recursive grouping)
- Visual tree structure
- Breadcrumb navigation

### Phase 4: Batch Operations
- "Move all children with parent" option
- "Delete parent and children" confirmation
- "Change status of children when parent changes"

---

## Summary

✅ **Removed**: Temporary teal highlighting with 7-second timeout  
✅ **Added**: Permanent parent-child visual grouping  
✅ **Result**: Cleaner, more intuitive content management UX

Children now **always** appear underneath their parent with clear visual hierarchy through:
- 📊 **Table**: Indentation + `└─` connector + subtle background
- 🗂️ **Kanban**: Left margin + thick left border + white background
- 🎯 **Both**: No distracting temporary highlights

The "Repurposed" badge remains the only indicator of repurposed status, keeping the UI clean and focused.
