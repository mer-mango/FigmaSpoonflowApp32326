# RSS Content Ideas - Quick Reference

## 🎯 User Flow

```
Settings > Content Ideas
    ↓
Add RSS Feed URL
    ↓
Click "Fetch Latest Posts"
    ↓
Content Page > Idea Inbox
    ↓
Review, Preview, Create, or Dismiss
```

---

## 📍 Where Everything Is

| Feature | Location | File |
|---------|----------|------|
| **Add/Remove Feeds** | Settings > Content Ideas | `/components/RssFeedSettings.tsx` |
| **View Ideas** | Content > Idea Inbox | `/components/muted_ContentPage_Integrated.tsx` |
| **RSS Logic** | Backend | `/supabase/functions/server/rss_feeds.tsx` |
| **RSS Routes** | Server | `/supabase/functions/server/index.tsx` |

---

## 🔧 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/rss-feeds` | Get all configured feeds |
| POST | `/rss-feeds/add` | Add new feed |
| POST | `/rss-feeds/remove` | Remove feed |
| POST | `/rss-feeds/fetch` | Fetch latest posts |

---

## 💾 Data Storage

**Feeds:** Stored in KV store under `rss_feeds` key
```json
{
  "feeds": [
    {
      "id": "rss_1707123456789",
      "url": "original URL",
      "rssFeedUrl": "actual feed URL",
      "name": "Feed Name",
      "addedAt": "timestamp",
      "lastFetchedAt": "timestamp"
    }
  ],
  "lastFetchedAt": "timestamp"
}
```

**Inbox Items:** Stored in browser localStorage
```javascript
{
  id: 'unique_id',
  title: 'Post Title',
  source: 'Feed Name',
  sourceUrl: 'Original post URL',
  date: 'ISO timestamp',
  snippet: 'First 300 chars',
  fullBody: 'Complete content',
  postUrl: 'Original post URL'
}
```

---

## ✨ Key Features

### In Settings
- ✅ Add feed by URL (auto-detects RSS)
- ✅ Custom name (optional)
- ✅ Validates feed before adding
- ✅ Shows last fetched time
- ✅ Remove feeds
- ✅ Fetch button

### In Idea Inbox
- ✅ Collapsible section
- ✅ Horizontal scroll
- ✅ Preview button (👁️)
- ✅ Create button (✨)
- ✅ Visit button (🔗)
- ✅ Dismiss button (✖️)
- ✅ Auto-expand on new items

---

## 🎨 UI Components

### Settings Page
```tsx
<RssFeedSettings />
  - Input: URL + Name
  - Button: Add Feed
  - Button: Fetch Latest Posts
  - List: All feeds with Remove buttons
```

### Content Page Inbox
```tsx
<div className="Idea Inbox">
  - Header with collapse/expand
  - Fetch Latest Posts button
  - Horizontal card carousel
  - Each card:
    - Icon (based on source)
    - Title
    - Source
    - Date
    - Snippet
    - Actions menu
</div>
```

---

## 🔄 Fetch Process

1. User clicks "Fetch Latest Posts"
2. Frontend calls `/rss-feeds/fetch`
3. Backend loops through all feeds
4. For each feed:
   - Fetch RSS XML
   - Parse feed (RSS 2.0 or Atom)
   - Extract 2 most recent posts
   - Return post data
5. Frontend converts to inbox items
6. Display in Idea Inbox
7. Toast notification shows count

---

## 🛠️ Supported Feed Types

| Type | URL Format | RSS URL |
|------|------------|---------|
| **Substack** | `username.substack.com` | `https://username.substack.com/feed` |
| **WordPress** | `example.com` | `https://example.com/feed` |
| **Generic** | Any URL | Tries `/feed` endpoint |
| **Custom** | Full RSS URL | Uses as-is |

---

## 🐛 Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| "Could not fetch feed" | Invalid URL or no RSS | Try adding `/feed` to URL |
| "No new posts found" | No recent updates | Normal - check back later |
| Empty inbox | Haven't fetched yet | Click "Fetch Latest Posts" |
| 401/404 errors | (OLD ISSUE - RESOLVED) | N/A - RSS doesn't use OAuth |

---

## 📝 Example Feeds

Copy-paste ready:
```
michaelmillenson.substack.com
waitbutwhy.com
jamesclear.com
seths.blog
lennysnewsletter.substack.com
```

---

## 🎯 Quick Actions

### Add Feed
1. Settings > Content Ideas
2. Paste URL
3. Add Feed

### Fetch Posts
- Option A: Settings > "Fetch Latest Posts"
- Option B: Content > Idea Inbox > "Fetch Latest Posts"

### Create Content
1. Hover over inbox card
2. Click ✨ Create
3. Content item appears in table

### Preview Post
1. Hover over inbox card
2. Click 👁️ Preview
3. Read full content in modal

---

## 📊 What Gets Fetched

Per feed:
- **2 most recent posts** (configurable in backend)
- **Within last 7 days** (filter applied)
- **Title, author, content, date, URL**
- **HTML stripped for snippet**

Total across all feeds:
- Unlimited feeds supported
- All posts combined in one inbox
- Sorted by date (newest first)

---

## 🔐 Security

- ✅ No OAuth - no tokens to expire
- ✅ No email account access
- ✅ Public RSS feeds only
- ✅ No user credentials stored
- ✅ Data stays in your browser/KV store
- ✅ No external services (except RSS sources)

---

## 🚀 Performance

- **Fast:** Simple HTTP GET requests
- **Reliable:** No complex auth flows
- **Scalable:** Add unlimited feeds
- **Efficient:** Fetches on-demand, not constant polling
- **Lightweight:** Minimal backend processing

---

## 💡 Pro Tips

1. **Start small:** Add 3-5 feeds first
2. **Test fetch:** Verify each feed works
3. **Weekly routine:** Fetch Monday morning
4. **Be selective:** Only add high-value sources
5. **Clean inbox:** Dismiss non-relevant posts quickly
6. **Create fast:** Turn ideas into content items immediately

---

## 📚 Full Documentation

- **Technical:** `/RSS_CONTENT_IDEAS_COMPLETE.md`
- **User Guide:** `/CONTENT_IDEAS_USER_GUIDE.md`
- **Cleanup:** `/CLEANUP_SUMMARY_GMAIL_NEWSLETTERS_REMOVED.md`

---

## ✅ Status: COMPLETE & WORKING

No known issues. System is production-ready! 🎉
