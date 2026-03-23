import { useState, useEffect } from 'react';
import { Rss, Plus, X, Loader2, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface RssFeed {
  id: string;
  url: string;
  rssFeedUrl: string;
  name: string;
  addedAt: string;
  lastFetchedAt: string | null;
}

export function RssFeedSettings() {
  const [feeds, setFeeds] = useState<RssFeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newFeedUrl, setNewFeedUrl] = useState('');
  const [newFeedName, setNewFeedName] = useState('');
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);
  const [fetchResults, setFetchResults] = useState<any>(null);

  const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-a89809a8`;

  useEffect(() => {
    loadFeeds();
  }, []);

  const loadFeeds = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${serverUrl}/rss-feeds`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFeeds(data.feeds || []);
        setLastFetchedAt(data.lastFetchedAt);
      }
    } catch (error) {
      console.error('Failed to load RSS feeds:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFeed = async () => {
    if (!newFeedUrl.trim()) return;

    try {
      setAdding(true);
      const response = await fetch(`${serverUrl}/rss-feeds/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: newFeedUrl.trim(),
          name: newFeedName.trim() || undefined
        })
      });

      if (response.ok) {
        const data = await response.json();
        setFeeds(data.feeds || []);
        setNewFeedUrl('');
        setNewFeedName('');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add feed');
      }
    } catch (error) {
      console.error('Failed to add feed:', error);
      alert('Failed to add feed. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveFeed = async (feedId: string) => {
    try {
      const response = await fetch(`${serverUrl}/rss-feeds/remove`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: feedId })
      });

      if (response.ok) {
        const data = await response.json();
        setFeeds(data.feeds || []);
      }
    } catch (error) {
      console.error('Failed to remove feed:', error);
    }
  };

  const handleFetchAll = async () => {
    try {
      setFetching(true);
      setFetchResults(null);
      
      const response = await fetch(`${serverUrl}/rss-feeds/fetch`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFetchResults(data);
        setLastFetchedAt(data.lastFetchedAt);
        
        // Reload feeds to get updated lastFetchedAt times
        await loadFeeds();
        
        // Show success message
        const totalPosts = data.posts?.length || 0;
        alert(`✅ Fetched ${totalPosts} posts from ${feeds.length} feeds! Check your Content Ideas Inbox.`);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to fetch feeds');
      }
    } catch (error) {
      console.error('Failed to fetch feeds:', error);
      alert('Failed to fetch feeds. Please try again.');
    } finally {
      setFetching(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-50">
              <Rss className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">RSS Feed Manager</h3>
              <p className="text-sm text-gray-500 mt-0.5">
                {feeds.length === 0 ? 'No feeds added yet' : `${feeds.length} feed${feeds.length === 1 ? '' : 's'} configured`}
              </p>
            </div>
          </div>

          {feeds.length > 0 && (
            <Button
              onClick={handleFetchAll}
              disabled={fetching}
              className="bg-[#2f829b] hover:bg-[#034863] text-white"
            >
              {fetching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Fetching...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Fetch Latest Posts
                </>
              )}
            </Button>
          )}
        </div>

        <p className="text-sm text-gray-600">
          Add your favorite Substack newsletters and blogs. Click "Fetch Latest Posts" to pull the 2 most recent articles from each feed into your Content Ideas Inbox.
        </p>

        {lastFetchedAt && (
          <p className="text-xs text-gray-400 mt-3">
            Last fetched: {new Date(lastFetchedAt).toLocaleString()}
          </p>
        )}
      </div>

      {/* Add New Feed */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="font-medium text-gray-900 mb-3">Add New Feed</h4>
        
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Blog or Substack URL
            </label>
            <Input
              value={newFeedUrl}
              onChange={(e) => setNewFeedUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddFeed()}
              placeholder="michaelmillenson.substack.com or waitbutwhy.com"
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              💡 For Substack: use username.substack.com (not substack.com/@username)
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Name (optional)
            </label>
            <Input
              value={newFeedName}
              onChange={(e) => setNewFeedName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddFeed()}
              placeholder="e.g., Wait But Why"
              className="w-full"
            />
          </div>

          <Button
            onClick={handleAddFeed}
            disabled={!newFeedUrl.trim() || adding}
            className="w-full"
          >
            {adding ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add Feed
              </>
            )}
          </Button>
        </div>

        {/* Example feeds */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs font-medium text-blue-900 mb-2">💡 Popular examples:</p>
          <div className="space-y-1 text-xs text-blue-800">
            <div>• <strong>Substack:</strong> anyname.substack.com</div>
            <div>• <strong>Wait But Why:</strong> waitbutwhy.com</div>
            <div>• <strong>James Clear:</strong> jamesclear.com</div>
            <div>• <strong>Seth Godin:</strong> seths.blog</div>
          </div>
        </div>
      </div>

      {/* Feed List */}
      {feeds.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="font-medium text-gray-900 mb-4">Your Feeds</h4>
          
          <div className="space-y-2">
            {feeds.map((feed) => (
              <div
                key={feed.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Rss className="w-4 h-4 text-orange-600 flex-shrink-0" />
                    <span className="font-medium text-gray-900 truncate">
                      {feed.name}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {feed.url}
                  </p>
                  {feed.lastFetchedAt && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Last fetched: {new Date(feed.lastFetchedAt).toLocaleString()}
                    </p>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFeed(feed.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fetch Results */}
      {fetchResults && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="font-medium text-gray-900 mb-3">Latest Fetch Results</h4>
          
          <div className="space-y-2">
            {fetchResults.results?.map((result: any, idx: number) => (
              <div
                key={idx}
                className={`flex items-center gap-2 p-2 rounded ${
                  result.success ? 'bg-green-50' : 'bg-red-50'
                }`}
              >
                {result.success ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-700">
                      <strong>{result.feedName}:</strong> {result.count} post{result.count === 1 ? '' : 's'}
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-gray-700">
                      <strong>{result.feedName}:</strong> {result.error}
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              ✅ <strong>{fetchResults.posts?.length || 0} posts</strong> added to your Content Ideas Inbox
            </p>
          </div>
        </div>
      )}
    </div>
  );
}