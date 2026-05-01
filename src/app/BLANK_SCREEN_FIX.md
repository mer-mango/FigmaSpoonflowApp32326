# Blank Screen Fix - Navigation Issue

## ✅ ISSUE RESOLVED

### Problem
When clicking "Ask Jamie to help draft now" button, the screen went blank.

**Root Cause**: The navigation handlers were using `window.location.href = '/content?...'` which tried to navigate to an absolute path. In the Figma Make environment, the app runs at a nested path like `/make/{projectId}/`, so navigating to `/content` was going to the wrong URL and causing a blank screen.

### Solution
Changed from full page navigation to URL state update without reload:

**Before**:
```typescript
const handleJamieDraftYes = () => {
  const url = `/content?source=${jamieDraftSourceId}&repurposes=${jamieDraftChildIds.join(',')}&jamieDraft=1`;
  setShowJamieDraftCTA(false);
  window.location.href = url; // ❌ Navigates away, causes blank screen
};
```

**After**:
```typescript
const handleJamieDraftYes = () => {
  const params = new URLSearchParams();
  params.set('source', jamieDraftSourceId);
  params.set('repurposes', jamieDraftChildIds.join(','));
  params.set('jamieDraft', '1');
  
  setShowJamieDraftCTA(false);
  
  // ✅ Update URL without page reload (keeps us on content page)
  window.history.pushState({}, '', `?${params.toString()}`);
  
  // ✅ Trigger the focus highlighting by updating state
  setFocusedSourceId(jamieDraftSourceId);
  setFocusedRepurposeIds(jamieDraftChildIds);
  
  // ✅ Auto-scroll to first focused item after render
  setTimeout(() => {
    if (firstFocusedItemRef.current) {
      firstFocusedItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, 100);
};
```

### Changes Made

**File**: `/components/muted_ContentPage_Integrated.tsx`

**Lines Modified**: Jamie Draft CTA Handlers (around lines 540-552)

**Key Changes**:
1. ✅ Use `window.history.pushState()` instead of `window.location.href`
2. ✅ Manually update focus state (`setFocusedSourceId`, `setFocusedRepurposeIds`)
3. ✅ Manually trigger scroll after state update
4. ✅ Keep URL params relative (no absolute paths)

### Why This Works

**Original Approach** (full navigation):
- Changes URL to `/content?...`
- Browser tries to navigate to that path
- In Figma Make environment, `/content` doesn't exist (needs `/make/{id}/content`)
- Results in 404 or blank screen

**Fixed Approach** (state update):
- Uses `pushState` to update URL in address bar without navigation
- Keeps current page loaded
- Manually triggers the same focus/highlight behavior from Step 1
- Works regardless of base path

### Testing

**Test Case 1: Click "Ask Jamie to help draft now"**
1. Create repurposed children
2. Banner appears with CTA
3. Click "Ask Jamie to help draft now"
4. ✅ Banner disappears
5. ✅ URL updates to: `?source=<id>&repurposes=<ids>&jamieDraft=1`
6. ✅ Page stays loaded (no blank screen)
7. ✅ Child items are highlighted (teal background)
8. ✅ Page auto-scrolls to first child

**Test Case 2: Click "Not now"**
1. Create repurposed children
2. Banner appears with CTA
3. Click "Not now"
4. ✅ Banner disappears
5. ✅ URL updates to: `?source=<id>&repurposes=<ids>`
6. ✅ Page stays loaded
7. ✅ Child items are highlighted
8. ✅ Page auto-scrolls to first child

### Additional Notes

- The app uses **state-based navigation** (`setCurrentPage('content')`) rather than URL routing
- This is common in single-page Figma Make apps where the entire app lives at one path
- URL params are used for state (like focus highlighting), not for routing
- `window.history.pushState()` is perfect for updating URL state without triggering navigation
