# Jamie Web Search Feature

## Overview
Jamie can now search the web for articles and content using the Brave Search API. Search results can be added directly to your Content Ideas Inbox for later use.

## How It Works

### 1. Ask Jamie to Search
Simply chat with Jamie using natural language:

**Examples:**
- "Find me 5 recent articles on AI in diabetes management"
- "Search for posts about wearable tech in mental health from the last month"  
- "Show me articles on digital therapeutics"
- "What's new about patient portals this week?"
- "Get me 10 pieces on co-design in healthcare"

### 2. Jamie Detects the Intent
Jamie automatically detects when you're requesting a search based on trigger words like:
- find, search, look for, get me, show me
- articles, posts, pieces, content, research, news
- recent, latest, what's new

### 3. Extract Search Parameters
Jamie intelligently extracts:
- **Count**: Number of results (e.g., "5 articles" → 5 results, max 10)
- **Time filter**: 
  - "today" or "past day" → Last 24 hours
  - "this week" or "past week" → Last 7 days
  - "this month" or "recent" → Last 30 days
- **Search query**: The actual topic to search for

### 4. Display Results
Jamie shows search results in the chat with:
- **Title** (clickable to open in new tab)
- **Description/snippet** from the article
- **Source** (website name)
- **Age** (e.g., "2 days ago")
- **+ Button** to add to your Idea Inbox

## Integration Points

### Backend API (`/supabase/functions/server/index.tsx`)
```typescript
// POST /make-server-a89809a8/web-search
{
  query: string;
  count?: number;  // default: 5, max: 10
  freshness?: 'pd' | 'pw' | 'pm';  // past day/week/month
}
```

Response:
```typescript
{
  results: Array<{
    title: string;
    url: string;
    description: string;
    age?: string;
    siteName?: string;
  }>;
  total: number;
}
```

### Frontend Functions (`/utils/jamieAI.ts`)

**`detectWebSearchIntent(message: string)`**
- Detects if a message is requesting a web search
- Extracts search parameters (query, count, freshness)

**`performWebSearch(query, count, freshness)`**
- Calls the backend web search API
- Returns formatted search results

### UI Component (`/components/GlobalJamiePanel.tsx`)

Updated to:
- Detect search intent in user messages
- Show loading state while searching
- Display search results with clean cards
- Include "+ Add to Inbox" button for each result

## Adding Results to Idea Inbox

The GlobalJamiePanel accepts an `onAddSearchToInbox` callback prop:

```typescript
interface GlobalJamiePanelProps {
  // ... existing props
  onAddSearchToInbox?: (result: SearchResult) => void;
}
```

When implementing in your Content page:
1. Pass a callback that adds the search result to your inbox state
2. Create a new inbox item from the search result data
3. Show a success toast to the user

**Example implementation:**
```typescript
const handleAddSearchToInbox = (result: SearchResult) => {
  const newInboxItem = {
    id: `search-${Date.now()}`,
    title: result.title,
    source: result.siteName || 'Web Search',
    sourceUrl: result.url,
    date: new Date().toLocaleDateString(),
    snippet: result.description,
    platform: '', // User decides later
    blueprint: '', // User decides later
  };
  
  setInboxItems(prev => [newInboxItem, ...prev]);
  toast.success(`Added "${result.title}" to Idea Inbox`);
};
```

## API Key Setup

**Brave Search API** (Free tier: 2,000 queries/month)
1. Get free API key at: https://brave.com/search/api/
2. Add to Supabase secrets as: `BRAVE_SEARCH_API_KEY`
3. The app will prompt you if not configured

## Search Quality Tips

**Good searches:**
- "Find 5 articles on remote patient monitoring" ✅
- "Recent posts about health equity in digital health" ✅
- "Show me research on AI chatbots for mental health" ✅

**Less effective:**
- "Find stuff" ❌ (too vague)
- "Search" ❌ (no topic)
- Overly specific questions that require analysis ❌

## Future Enhancements

Potential additions:
- Save search queries as templates
- Auto-schedule periodic searches
- AI-powered relevance scoring
- Automatic topic extraction from search results
- Direct content creation from search results
