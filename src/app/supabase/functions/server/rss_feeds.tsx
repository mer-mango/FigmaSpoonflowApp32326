// ========================================
// RSS FEED MANAGEMENT
// Handles fetching content from blogs and Substacks
// ========================================

import * as kv from './kv_store.tsx';

// Convert a blog URL to its RSS feed URL
function getRssFeedUrl(url: string): string {
  // Clean up the URL
  url = url.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  
  // Remove trailing slashes
  url = url.replace(/\/$/, '');
  
  // Handle Substack URLs
  // Format 1: username.substack.com
  if (url.includes('.substack.com')) {
    return `${url}/feed`;
  }
  
  // Format 2: substack.com/@username -> convert to username.substack.com/feed
  const substackMatch = url.match(/substack\.com\/@([^\/]+)/);
  if (substackMatch) {
    const username = substackMatch[1];
    return `https://${username}.substack.com/feed`;
  }
  
  // Common blog platforms - try /feed first
  return `${url}/feed`;
}

// Parse RSS/Atom feed XML
async function parseFeed(xml: string, feedUrl: string) {
  try {
    const posts: any[] = [];
    
    // Simple XML parsing - check if RSS or Atom
    const isAtom = xml.includes('<feed xmlns="http://www.w3.org/2005/Atom"');
    
    if (isAtom) {
      // Parse Atom feed
      const entryMatches = xml.match(/<entry>[\s\S]*?<\/entry>/g) || [];
      
      for (const entry of entryMatches.slice(0, 2)) {
        const title = entry.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/, '$1').trim() || '';
        const linkMatch = entry.match(/<link[^>]*href=["'](.*?)["']/);
        const link = linkMatch?.[1] || '';
        const published = entry.match(/<published>(.*?)<\/published>/)?.[1] || entry.match(/<updated>(.*?)<\/updated>/)?.[1] || '';
        const contentMatch = entry.match(/<content[^>]*>([\s\S]*?)<\/content>/) || entry.match(/<summary[^>]*>([\s\S]*?)<\/summary>/);
        const content = contentMatch?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/, '$1').trim() || '';
        const author = entry.match(/<author>[\s\S]*?<name>(.*?)<\/name>/)?.[1] || '';
        
        if (title && link) {
          posts.push({
            title: title.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'),
            url: link,
            published_at: published ? new Date(published).toISOString() : new Date().toISOString(),
            content: content.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'),
            author: author || '',
            source_url: feedUrl
          });
        }
      }
    } else {
      // Parse RSS feed
      const itemMatches = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
      
      for (const item of itemMatches.slice(0, 2)) {
        const title = item.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/, '$1').trim() || '';
        const link = item.match(/<link[^>]*>([\s\S]*?)<\/link>/)?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/, '$1').trim() || '';
        const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '';
        const contentMatch = item.match(/<content:encoded>([\s\S]*?)<\/content:encoded>/) || 
                           item.match(/<description>([\s\S]*?)<\/description>/);
        const content = contentMatch?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/, '$1').trim() || '';
        const author = item.match(/<dc:creator>([\s\S]*?)<\/dc:creator>/)?.[1]?.replace(/<!\[CDATA\[(.*?)\]\]>/, '$1').trim() || 
                      item.match(/<author>(.*?)<\/author>/)?.[1] || '';
        
        if (title && link) {
          posts.push({
            title: title.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&#x27;/g, "'").replace(/&quot;/g, '"'),
            url: link,
            published_at: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
            content: content.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'),
            author: author,
            source_url: feedUrl
          });
        }
      }
    }
    
    return posts;
  } catch (error) {
    console.error('Error parsing feed:', error);
    return [];
  }
}

// Fetch latest posts from a single RSS feed
async function fetchFeedPosts(feedUrl: string) {
  try {
    console.log(`📡 Fetching RSS feed: ${feedUrl}`);
    
    const response = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'SpoonFlow/1.0 (RSS Reader)',
        'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml'
      }
    });
    
    if (!response.ok) {
      console.error(`❌ Failed to fetch ${feedUrl}: ${response.status}`);
      return { success: false, error: `HTTP ${response.status}` };
    }
    
    const xml = await response.text();
    const posts = await parseFeed(xml, feedUrl);
    
    console.log(`✅ Fetched ${posts.length} posts from ${feedUrl}`);
    return { success: true, posts };
    
  } catch (error) {
    console.error(`❌ Error fetching feed ${feedUrl}:`, error);
    return { success: false, error: String(error) };
  }
}

// Get RSS feeds list
export async function getRssFeeds(c: any) {
  try {
    console.log('📋 Getting RSS feeds list...');
    const rssData = await kv.get('rss_feeds') || { feeds: [] };
    return c.json(rssData);
  } catch (error) {
    console.error('❌ Error getting RSS feeds:', error);
    return c.json({ error: String(error) }, 500);
  }
}

// Add RSS feed
export async function addRssFeed(c: any) {
  try {
    const { url, name } = await c.req.json();
    
    if (!url) {
      return c.json({ error: 'URL is required' }, 400);
    }
    
    console.log(`➕ Adding RSS feed: ${url}`);
    
    const rssFeedUrl = getRssFeedUrl(url);
    console.log(`🔗 RSS feed URL: ${rssFeedUrl}`);
    
    // Verify the feed works
    const testResult = await fetchFeedPosts(rssFeedUrl);
    if (!testResult.success) {
      return c.json({ 
        error: 'Could not fetch feed. Please check the URL.', 
        details: testResult.error 
      }, 400);
    }
    
    const rssData = await kv.get('rss_feeds') || { feeds: [] };
    
    // Check if already exists
    const exists = rssData.feeds.some((f: any) => f.url === url || f.rssFeedUrl === rssFeedUrl);
    if (exists) {
      return c.json({ error: 'This feed is already in your list' }, 400);
    }
    
    // Determine name from first post if not provided
    const feedName = name || testResult.posts[0]?.author || new URL(url).hostname;
    
    rssData.feeds.push({
      id: `rss_${Date.now()}`,
      url: url,
      rssFeedUrl: rssFeedUrl,
      name: feedName,
      addedAt: new Date().toISOString(),
      lastFetchedAt: null
    });
    
    await kv.set('rss_feeds', rssData);
    
    console.log(`✅ Added RSS feed: ${feedName}`);
    return c.json({ success: true, feeds: rssData.feeds });
    
  } catch (error) {
    console.error('❌ Error adding RSS feed:', error);
    return c.json({ error: String(error) }, 500);
  }
}

// Remove RSS feed
export async function removeRssFeed(c: any) {
  try {
    const { id } = await c.req.json();
    
    console.log(`➖ Removing RSS feed: ${id}`);
    
    const rssData = await kv.get('rss_feeds') || { feeds: [] };
    rssData.feeds = rssData.feeds.filter((f: any) => f.id !== id);
    
    await kv.set('rss_feeds', rssData);
    
    console.log('✅ RSS feed removed');
    return c.json({ success: true, feeds: rssData.feeds });
    
  } catch (error) {
    console.error('❌ Error removing RSS feed:', error);
    return c.json({ error: String(error) }, 500);
  }
}

// Fetch latest posts from all RSS feeds
export async function fetchAllRssFeeds(c: any) {
  try {
    console.log('🔄 Fetching all RSS feeds...');
    
    const rssData = await kv.get('rss_feeds') || { feeds: [] };
    
    if (rssData.feeds.length === 0) {
      return c.json({ posts: [], message: 'No feeds configured' });
    }
    
    const allPosts: any[] = [];
    const results: any[] = [];
    
    // Fetch from each feed
    for (const feed of rssData.feeds) {
      const result = await fetchFeedPosts(feed.rssFeedUrl);
      
      if (result.success) {
        // Add feed info to each post
        const postsWithFeedInfo = result.posts.map((post: any) => ({
          ...post,
          feed_name: feed.name,
          feed_id: feed.id
        }));
        allPosts.push(...postsWithFeedInfo);
        results.push({ feedId: feed.id, feedName: feed.name, success: true, count: result.posts.length });
        
        // Update last fetched time
        feed.lastFetchedAt = new Date().toISOString();
      } else {
        results.push({ feedId: feed.id, feedName: feed.name, success: false, error: result.error });
      }
    }
    
    // Save updated feed list with last fetched times
    await kv.set('rss_feeds', rssData);
    
    // Save last fetch time
    rssData.lastFetchedAt = new Date().toISOString();
    await kv.set('rss_feeds', rssData);
    
    console.log(`✅ Fetched ${allPosts.length} total posts from ${rssData.feeds.length} feeds`);
    
    return c.json({ 
      posts: allPosts,
      results: results,
      lastFetchedAt: rssData.lastFetchedAt
    });
    
  } catch (error) {
    console.error('❌ Error fetching RSS feeds:', error);
    return c.json({ error: String(error) }, 500);
  }
}