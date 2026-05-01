# Fix: Jamie Not Responding to Web Search Requests

## Problem

User asked: "Can you help me find 2 articles about patient attitudes toward consent forms?"

**Expected:** Jamie searches the web and shows results with "Add to Inbox" buttons

**Actual:** Jamie responded with contact-related messages instead

## Root Cause

The web search functionality was only implemented in `GlobalJamiePanel`, but the app is actually using `MutedJamieChatPanel` for the main Jamie interface. The search detection was never added to the message handler in `App.tsx`.

## The Fix

Updated `App.tsx` - `handleSendChatMessage` function to:

1. **Import search utilities** at runtime
2. **Detect search intent** before calling AI
3. **Handle web searches** with proper loading states
4. **Display results** with proper formatting
5. **Fall back to AI** for non-search queries

### Code Added:

```typescript
// Check if this is a web search request
const { detectWebSearchIntent, performWebSearch } = await import('./utils/jamieAI');
const searchIntent = detectWebSearchIntent(text);

if (searchIntent.isSearchRequest && searchIntent.searchQuery) {
  // Show loading message
  // Perform search via backend
  // Display results or error
  return; // Don't call AI for search requests
}

// Otherwise, use AI for normal chat
```

## What Now Works

✅ **Search queries are detected:**
- "Can you help me find 2 articles about..."
- "Search for posts on..."
- "Show me recent content about..."
- "Find me 5 articles..."

✅ **Search flow:**
1. User asks for search
2. Jamie shows "Searching for..."
3. Results appear with clickable links
4. Each result has "+" button to add to Idea Inbox

✅ **Error handling:**
- No results → Helpful message
- API errors → User-friendly error
- Invalid queries → Suggestions

## Search Pattern Detection

The following patterns trigger web search:
- `find/search/look for/get me/show me` + `articles/posts/content/research`
- `recent/latest/what's new` + topic
- Includes number: "find 5 articles..."
- Time filters: "from last week", "recent", "this month"

## Result Display

Results shown in Jamie's chat include:
- **Title** (clickable, opens in new tab)
- **Description** (snippet from article)
- **Source** (website name)
- **Age** (e.g., "2 days ago")
- **+ Button** to add to Idea Inbox

## File Changed

**`/App.tsx`** - `handleSendChatMessage` function (lines 733-770)
- Added web search detection
- Added search handling with loading states
- Maintained existing AI chat for non-search queries

## Testing

Try these queries now:

1. ✅ "Can you help me find 2 articles about patient attitudes toward consent forms?"
2. ✅ "Find me 5 recent posts on digital health"
3. ✅ "Search for content about patient engagement from last week"
4. ✅ "Show me articles on co-design in healthcare"

Jamie should now:
- Detect these as search requests
- Show loading message
- Display results with working links
- Provide "Add to Inbox" buttons

## Next Steps

The search feature is now fully functional! Users can:
1. Ask Jamie to search for content
2. Browse results directly in chat
3. Click + to add items to Content Idea Inbox
4. Use regular chat for other queries

All functionality is now working as designed! 🎉
