# Jamie Web Search - Integration Example

## Quick Integration for Content Pages

Here's exactly how to wire up the web search "Add to Inbox" functionality in your content page.

## Option 1: Using MutedContentPageIntegrated (Current Setup)

If you're using the `MutedContentPageIntegrated` component from App.tsx:

### Step 1: Import GlobalJamiePanel
```typescript
// In App.tsx
import { GlobalJamiePanel } from './components/GlobalJamiePanel';
```

### Step 2: Add State for Jamie Panel
```typescript
// In App.tsx, add near other state declarations:
const [globalJamiePanelOpen, setGlobalJamiePanelOpen] = useState(false);
```

### Step 3: Create the Add to Inbox Handler
```typescript
// In App.tsx, add this handler function:
const handleAddSearchResultToInbox = (result: {
  title: string;
  url: string;
  description: string;
  siteName?: string;
  age?: string;
}) => {
  // Create a new inbox item from the search result
  const newInboxItem = {
    id: `search-${Date.now()}`,
    title: result.title,
    source: result.siteName || 'Web Search',
    sourceUrl: result.url,
    date: result.age || new Date().toLocaleDateString(),
    snippet: result.description,
    // Leave platform and blueprint empty - user decides during planning
    suggestedPlatform: '',
    suggestedBlueprint: '',
    score: 85, // Default score for web search results
  };

  // This would need to be added to your inbox state
  // You'll need to expose setInboxItems from MutedContentPageIntegrated
  // or store inbox items in App.tsx state
  
  console.log('📥 Adding search result to inbox:', newInboxItem);
  
  // Show success message
  toast.success(`Added "${result.title}" to Idea Inbox!`);
};
```

### Step 4: Add GlobalJamiePanel to Render
```typescript
// In App.tsx, add before the closing </div>:
<GlobalJamiePanel
  isMinimized={!globalJamiePanelOpen}
  onToggleMinimize={() => setGlobalJamiePanelOpen(!globalJamiePanelOpen)}
  currentPage={currentPage}
  tasks={allTasks}
  contacts={allContacts}
  onAddSearchToInbox={handleAddSearchResultToInbox}
/>
```

### Step 5: Add Toggle Button (Optional)
```typescript
// Add a floating button to open Jamie, or use existing Jamie chat button
<button
  onClick={() => setGlobalJamiePanelOpen(true)}
  className="fixed right-8 bottom-8 z-40 bg-[#6b2358] hover:bg-[#6b2358]/90 text-white p-4 rounded-2xl shadow-2xl"
>
  <Sparkles className="w-5 h-5" />
  Ask Jamie
</button>
```

## Option 2: Direct Integration in ContentPage_SimpleTable

If you want to add search directly to ContentPage_SimpleTable:

### Step 1: Import Necessary Components
```typescript
// At top of ContentPage_SimpleTable.tsx
import { GlobalJamiePanel } from './components/GlobalJamiePanel';
import { toast } from 'sonner@2.0.3';
```

### Step 2: Add Jamie Panel State
```typescript
// Inside ContentPage_SimpleTable component:
const [jamiePanelOpen, setJamiePanelOpen] = useState(false);
```

### Step 3: Create Add to Inbox Handler
```typescript
const handleAddSearchToInbox = (result: {
  title: string;
  url: string;
  description: string;
  siteName?: string;
  age?: string;
}) => {
  const newInboxItem = {
    id: `search-${Date.now()}`,
    title: result.title,
    source: result.siteName || 'Web Search',
    sourceUrl: result.url,
    date: result.age || new Date().toLocaleDateString(),
    score: 85,
    snippet: result.description,
    suggestedPlatform: '',
    suggestedBlueprint: '',
  };

  // Add to your existing inbox items state
  setInboxItems(prev => [newInboxItem, ...prev]);
  
  toast.success(`Added "${result.title}" to Idea Inbox!`);
};
```

### Step 4: Add GlobalJamiePanel to JSX
```typescript
// At the end of your component's return statement:
return (
  <div>
    {/* ...existing content page JSX... */}
    
    {/* Jamie Panel with Web Search */}
    <GlobalJamiePanel
      isMinimized={!jamiePanelOpen}
      onToggleMinimize={() => setJamiePanelOpen(!jamiePanelOpen)}
      currentPage="content"
      tasks={[]} // Pass tasks if available
      contacts={[]} // Pass contacts if available
      onAddSearchToInbox={handleAddSearchToInbox}
    />
  </div>
);
```

## Full Example: Complete Integration

Here's a complete minimal example:

```typescript
import React, { useState } from 'react';
import { GlobalJamiePanel } from './components/GlobalJamiePanel';
import { toast } from 'sonner@2.0.3';

export function ContentPage() {
  const [inboxItems, setInboxItems] = useState([]);
  const [jamiePanelOpen, setJamiePanelOpen] = useState(false);

  const handleAddSearchToInbox = (result) => {
    const newInboxItem = {
      id: `search-${Date.now()}`,
      title: result.title,
      source: result.siteName || 'Web Search',
      sourceUrl: result.url,
      date: result.age || new Date().toLocaleDateString(),
      snippet: result.description,
      suggestedPlatform: '',
      suggestedBlueprint: '',
      score: 85,
    };

    setInboxItems(prev => [newInboxItem, ...prev]);
    toast.success(`Added to Idea Inbox!`);
  };

  return (
    <div>
      {/* Your content page UI */}
      
      {/* Idea Inbox */}
      <div className="inbox-section">
        <h2>Idea Inbox ({inboxItems.length})</h2>
        {inboxItems.map(item => (
          <div key={item.id} className="inbox-item">
            <h3>{item.title}</h3>
            <p>{item.snippet}</p>
            <a href={item.sourceUrl} target="_blank">View Source</a>
          </div>
        ))}
      </div>

      {/* Jamie Panel */}
      <GlobalJamiePanel
        isMinimized={!jamiePanelOpen}
        onToggleMinimize={() => setJamiePanelOpen(!jamiePanelOpen)}
        currentPage="content"
        onAddSearchToInbox={handleAddSearchToInbox}
      />
    </div>
  );
}
```

## Testing the Integration

Once integrated, test with these queries:

1. Open Jamie panel (click the floating button or existing Jamie chat)
2. Type: **"Find me 5 recent articles on patient engagement"**
3. Jamie will search and display results
4. Click the **+** button on any result
5. Verify the item appears in your Idea Inbox
6. Check the success toast appears

## TypeScript Types

If you need type definitions:

```typescript
interface SearchResult {
  title: string;
  url: string;
  description: string;
  age?: string;
  siteName?: string;
}

interface InboxItem {
  id: string;
  title: string;
  source: string;
  sourceUrl: string;
  date: string;
  snippet: string;
  suggestedPlatform?: string;
  suggestedBlueprint?: string;
  score?: number;
}
```

## Next Steps

After basic integration:

1. **Persist inbox items** - Save to localStorage or backend
2. **Sync with existing inbox** - Merge with Gmail newsletter items
3. **Add search history** - Track successful searches
4. **Customize scoring** - Add relevance scores based on keywords
5. **Bulk actions** - Add multiple results at once

## Troubleshooting

**Search results not showing?**
- Check browser console for errors
- Verify BRAVE_SEARCH_API_KEY is set in Supabase
- Test the backend endpoint directly

**Add to Inbox not working?**
- Verify `onAddSearchToInbox` callback is passed to GlobalJamiePanel
- Check that the callback is creating the inbox item correctly
- Ensure toast library is imported

**Jamie not detecting search intent?**
- Use trigger words: "find", "search", "show me", "get me"
- Include content type: "articles", "posts", "content"
- Be specific about the topic

## Alternative: Replace Existing Jamie Chat

If you want to replace the existing `MutedJamieChatPanel` with the new GlobalJamiePanel that has search:

```typescript
// In App.tsx, replace:
<MutedJamieChatPanel ... />

// With:
<GlobalJamiePanel
  isMinimized={!jamieChatOpen}
  onToggleMinimize={() => setJamieChatOpen(!jamieChatOpen)}
  currentPage={currentPage}
  tasks={allTasks}
  contacts={allContacts}
  onAddSearchToInbox={handleAddSearchResultToInbox}
/>
```

This gives you all Jamie's existing features PLUS web search in one unified interface.
