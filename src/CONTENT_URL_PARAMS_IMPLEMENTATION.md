# Content Page URL Param Focusing - Implementation Summary

## ✅ IMPLEMENTATION COMPLETE

### Files Modified

1. **`/components/muted_ContentPage_Integrated.tsx`** - Main content page
   - Added URL param parser helper
   - Added focused state management
   - Added useEffect for parsing and scrolling
   - Added highlight logic to table rows
   - Passed focused props to kanban view

2. **`/components/muted/content/ContentKanbanView.tsx`** - Kanban view
   - Updated props interface
   - Added highlight logic to cards
   - Added ref forwarding for scroll

---

## 🎯 FEATURES IMPLEMENTED

### 1. URL Param Parsing
**Helper Function**: `parseRepurposeParams(search: string)`
- Parses `?source=<id>&repurposes=<id1,id2,id3>` from URL
- Returns: `{ sourceId?: string; repurposeIds: string[] }`
- Handles comma-separated repurpose IDs

### 2. Focused State Management
**State Variables**:
- `focusedSourceId` - ID of the source item to highlight
- `focusedRepurposeIds` - Array of child IDs to highlight
- `firstFocusedItemRef` - Ref for auto-scrolling to first focused item

### 3. Automatic Scroll Behavior
**Implementation**:
- Waits 300ms after render for DOM to stabilize
- Scrolls first focused item into view with `behavior: 'smooth'` and `block: 'center'`
- Uses ref forwarding to both table rows and kanban cards

### 4. Temporary Highlight with Fade
**Timing**:
- Highlights persist for 7 seconds
- CSS transitions provide smooth fade effect (`duration-500`)
- Console logging for debugging

### 5. Visual Highlight Styling

**Table View**:
```tsx
className={`transition-all duration-500 ${
  isFocused 
    ? 'bg-[#f5fafb] border-l-4 border-[#2f829b] shadow-md' 
    : 'hover:bg-slate-50'
}`}
```
- Light teal background (#f5fafb)
- 4px left border in brand color (#2f829b)
- Elevated shadow

**Kanban View**:
```tsx
className={`... transition-all duration-500 group ${
  isFocused 
    ? 'bg-[#f5fafb] border-[#2f829b] border-2 shadow-lg' 
    : 'bg-slate-50 border-slate-200'
}`}
```
- Light teal background (#f5fafb)
- 2px border in brand color (#2f829b)
- Large shadow for emphasis

---

## 🧪 HOW TO TEST

### Test 1: Single Repurposed Child Focus
**URL**:
```
http://localhost:3000/content?source=c3&repurposes=c7
```

**Expected Behavior**:
1. ✅ Page loads to Content view (table mode by default)
2. ✅ Row for item `c7` ("Key Insights: Care Transitions") is highlighted with teal background + left border
3. ✅ Page auto-scrolls to center `c7` in viewport after 300ms
4. ✅ Highlight fades after 7 seconds
5. ✅ Console shows: `📍 Focus params detected: source=c3, repurposes=[c7]`
6. ✅ After 7s, console shows: `⏱️ Focus cleared after timeout`

### Test 2: Multiple Repurposed Children Focus
**URL**:
```
http://localhost:3000/content?source=c3&repurposes=c7,c8
```

**Expected Behavior**:
1. ✅ Two rows highlighted: `c7` and `c8`
2. ✅ Scrolls to whichever appears first in the filtered list
3. ✅ Both remain highlighted for 7 seconds

### Test 3: Source Item Focus (Future Use)
**URL**:
```
http://localhost:3000/content?source=c3
```

**Expected Behavior**:
1. ✅ Row for item `c3` ("Designing for Care Transitions") is highlighted
2. ✅ Scrolls to `c3`
3. ✅ Highlight persists for 7 seconds

### Test 4: Kanban View Highlighting
**Steps**:
1. Navigate to: `http://localhost:3000/content?source=c3&repurposes=c7,c8`
2. Click "Kanban" view toggle button

**Expected Behavior**:
1. ✅ Switches to kanban view
2. ✅ Cards `c7` and `c8` are highlighted (assuming they're in "Idea" column based on initial data)
3. ✅ Teal background + brand-colored border on both cards
4. ✅ Highlight fades after 7 seconds

### Test 5: No Params (Normal Page Load)
**URL**:
```
http://localhost:3000/content
```

**Expected Behavior**:
1. ✅ Page loads normally
2. ✅ No items highlighted
3. ✅ No console messages about focus params
4. ✅ Normal hover effects work

### Test 6: Invalid IDs
**URL**:
```
http://localhost:3000/content?source=invalid&repurposes=fake1,fake2
```

**Expected Behavior**:
1. ✅ Page loads normally (no errors)
2. ✅ No items highlighted (IDs don't match)
3. ✅ No scrolling occurs
4. ✅ Console shows focus params but nothing happens visually

### Test 7: Table → Kanban → Table Persistence
**Steps**:
1. Navigate to: `http://localhost:3000/content?source=c3&repurposes=c7`
2. Wait 2 seconds (highlight still active)
3. Switch to Kanban view
4. Switch back to Table view

**Expected Behavior**:
1. ✅ Highlight persists across view mode changes (state is preserved)
2. ✅ No re-scrolling occurs (only on initial mount)
3. ✅ After original 7s timeout, highlight clears in both views

---

## 📋 IMPLEMENTATION DETAILS

### Code Changes

**`/components/muted_ContentPage_Integrated.tsx`** (Lines added):

1. **Helper Function** (after `makeId()` function):
```typescript
// Parse repurpose URL params: ?source=<id>&repurposes=<id1,id2,id3>
const parseRepurposeParams = (search: string): { sourceId?: string; repurposeIds: string[] } => {
  const params = new URLSearchParams(search);
  const sourceId = params.get('source') || undefined;
  const repurposesParam = params.get('repurposes') || '';
  const repurposeIds = repurposesParam ? repurposesParam.split(',').filter(Boolean) : [];
  
  return { sourceId, repurposeIds };
};
```

2. **State Variables** (after `viewMode` state):
```typescript
// URL param focusing state
const [focusedSourceId, setFocusedSourceId] = useState<string | undefined>();
const [focusedRepurposeIds, setFocusedRepurposeIds] = useState<string[]>([]);
const firstFocusedItemRef = useRef<HTMLDivElement | null>(null);
```

3. **useEffect Hook** (after state declarations):
```typescript
// Parse URL params on mount and handle focus/scroll
useEffect(() => {
  const { sourceId, repurposeIds } = parseRepurposeParams(window.location.search);
  
  if (sourceId || repurposeIds.length > 0) {
    setFocusedSourceId(sourceId);
    setFocusedRepurposeIds(repurposeIds);
    
    console.log(`📍 Focus params detected: source=${sourceId}, repurposes=[${repurposeIds.join(', ')}]`);
    
    // Auto-scroll to first focused item after render
    setTimeout(() => {
      if (firstFocusedItemRef.current) {
        firstFocusedItemRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }, 300);
    
    // Clear focus state after 7 seconds (fade effect handled by CSS transition)
    setTimeout(() => {
      setFocusedSourceId(undefined);
      setFocusedRepurposeIds([]);
      console.log(`⏱️ Focus cleared after timeout`);
    }, 7000);
  }
}, []); // Run only on mount
```

4. **Table Row Highlight Logic** (in `filteredContent.map()`):
```typescript
{filteredContent.map((item, index) => {
  const isFocusedSource = focusedSourceId === item.id;
  const isFocusedRepurpose = focusedRepurposeIds.includes(item.id);
  const isFocused = isFocusedSource || isFocusedRepurpose;
  const isFirstFocused = isFocused && index === filteredContent.findIndex(i => 
    i.id === focusedSourceId || focusedRepurposeIds.includes(i.id)
  );
  
  return (
    <tr 
      key={item.id} 
      ref={isFirstFocused ? firstFocusedItemRef : null}
      className={`transition-all duration-500 ${
        isFocused 
          ? 'bg-[#f5fafb] border-l-4 border-[#2f829b] shadow-md' 
          : 'hover:bg-slate-50'
      }`}
    >
      {/* ... cells ... */}
    </tr>
  );
})}
```

5. **Kanban View Props** (passing focused state):
```typescript
<ContentKanbanView
  contentItems={filteredContent}
  onItemClick={handleTitleClick}
  onUpdateItem={updateContentItem}
  focusedSourceId={focusedSourceId}
  focusedRepurposeIds={focusedRepurposeIds}
  firstFocusedItemRef={firstFocusedItemRef}
/>
```

**`/components/muted/content/ContentKanbanView.tsx`** (Lines modified):

1. **Props Interface**:
```typescript
interface ContentKanbanViewProps {
  contentItems: ContentItem[];
  onItemClick: (itemId: string) => void;
  onUpdateItem: (id: string, field: string, value: any) => void;
  focusedSourceId?: string;
  focusedRepurposeIds?: string[];
  firstFocusedItemRef?: React.MutableRefObject<HTMLDivElement | null>;
}
```

2. **Function Signature**:
```typescript
export default function ContentKanbanView({ 
  contentItems, 
  onItemClick, 
  onUpdateItem,
  focusedSourceId,
  focusedRepurposeIds = [],
  firstFocusedItemRef
}: ContentKanbanViewProps) {
```

3. **Card Highlight Logic** (in `items.map()`):
```typescript
{items.map((item, index) => {
  const isFocusedSource = focusedSourceId === item.id;
  const isFocusedRepurpose = focusedRepurposeIds.includes(item.id);
  const isFocused = isFocusedSource || isFocusedRepurpose;
  const isFirstFocused = isFocused && firstFocusedItemRef && index === items.findIndex(i => 
    i.id === focusedSourceId || focusedRepurposeIds.includes(i.id)
  );
  
  return (
    <div
      key={item.id}
      ref={isFirstFocused ? firstFocusedItemRef : null}
      draggable
      onDragStart={(e) => handleDragStart(e, item.id)}
      className={`border rounded-lg p-3 cursor-move hover:shadow-md transition-all duration-500 group ${
        draggedItem === item.id ? 'opacity-50' : ''
      } ${
        isFocused 
          ? 'bg-[#f5fafb] border-[#2f829b] border-2 shadow-lg' 
          : 'bg-slate-50 border-slate-200'
      }`}
    >
      {/* ... card content ... */}
    </div>
  );
})}
```

---

## ✅ REQUIREMENTS CHECKLIST

- [x] Parse `?source=<id>&repurposes=<ids>` query params
- [x] Store focused state (`focusedSourceId`, `focusedRepurposeIds`)
- [x] Helper function: `parseRepurposeParams()` implemented
- [x] Highlight items in **table view** (teal background + left border)
- [x] Highlight items in **kanban view** (teal background + thicker border)
- [x] Auto-scroll first focused item into view (smooth, centered)
- [x] Temporary focus state (7 seconds)
- [x] Smooth CSS transitions (`duration-500`)
- [x] No new notifications (UI-only feature)
- [x] Console logging for debugging
- [x] Works with existing filters/sorting

---

## 🎉 READY FOR STEP 2

**Next Step**: Wire this URL param behavior into the repurposing completion handler to actually generate these deep links when children are created.

**Future Enhancement**: Could add click handler on source item's "X repurposes created" text to trigger this focus behavior without navigating to a new URL (using `window.history.pushState` + state update).
