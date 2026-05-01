import React, { useState, useEffect } from 'react';
import { Copy, Check, RefreshCw, ExternalLink, AlertCircle, CheckCircle, XCircle, Calendar, User } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { toast } from 'sonner';
import { copyToClipboard } from '../../utils/clipboard';

interface SyncLogEntry {
  id: string;
  fathomId: string;
  title: string;
  syncedAt: string;
  status: 'success' | 'error';
  error?: string;
  matched: boolean;
  matchedMeetingId?: string;
  actionItemCount?: number;
}

interface FathomRecording {
  fathomId: string;
  title: string;
  startTime: string;
  duration: number;
  summary: string;
  actionItems: Array<{ text: string; assignee?: string }>;
  transcript: string;
  recordingUrl: string;
  syncedAt: string;
  matchedMeetingId?: string;
  matchedContactId?: string;
  source: string;
}

export function FathomZapierSettings() {
  const [copied, setCopied] = useState(false);
  const [syncLog, setSyncLog] = useState<SyncLogEntry[]>([]);
  const [recordings, setRecordings] = useState<FathomRecording[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const webhookUrl = `https://${projectId}.supabase.co/functions/v1/make-server-a89809a8`;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch sync log
      const logResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a89809a8/fathom/sync-log`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      
      if (logResponse.ok) {
        const logData = await logResponse.json();
        setSyncLog(logData.syncs || []);
      }
      
      // Fetch recordings
      const recordingsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a89809a8/fathom/recordings`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      
      if (recordingsResponse.ok) {
        const recordingsData = await recordingsResponse.json();
        setRecordings(recordingsData.recordings || []);
      }
    } catch (error) {
      console.error('Error fetching Fathom data:', error);
      toast.error('Failed to load Fathom data');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUrl = async () => {
    const success = await copyToClipboard(webhookUrl);
    if (success) {
      setCopied(true);
      toast.success('Webhook URL copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Failed to copy. Please manually select and copy the URL.');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    toast.success('Refreshed sync log');
  };

  const handleDeleteRecording = async (fathomId: string) => {
    if (!confirm('Are you sure you want to delete this recording?')) return;
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a89809a8/fathom/recordings/${fathomId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      
      if (response.ok) {
        toast.success('Recording deleted');
        fetchData();
      } else {
        toast.error('Failed to delete recording');
      }
    } catch (error) {
      console.error('Error deleting recording:', error);
      toast.error('Failed to delete recording');
    }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-lg font-semibold text-gray-900">Fathom Integration</h3>
          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
            100% Free
          </span>
        </div>
        <p className="text-sm text-gray-600">
          Sync your Fathom meeting recordings automatically using Fathom's native webhook feature
        </p>
      </div>

      {/* Webhook URL */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
            <ExternalLink className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 mb-1">Webhook URL for Fathom</h4>
            <p className="text-xs text-gray-600 mb-2">
              Add this URL to Fathom's webhook settings (or use with Zapier/Make.com)
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={webhookUrl}
                readOnly
                className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-mono text-gray-700"
              />
              <button
                onClick={handleCopyUrl}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Setup Instructions */}
        <div className="mt-3 pt-3 border-t border-blue-200">
          <p className="text-xs font-semibold text-gray-900 mb-2">3 Setup Options (Pick What Works for You!):</p>
          
          {/* Option 1: Fathom Native */}
          <div className="mb-3 p-2 bg-white rounded-lg border border-gray-200">
            <p className="text-xs font-bold text-green-700 mb-1">✅ Option 1: Fathom Native Webhooks (FREE & BEST)</p>
            <ol className="text-xs text-gray-700 space-y-0.5 list-decimal list-inside ml-2">
              <li>Go to Fathom Settings → Integrations/Webhooks</li>
              <li>Add webhook URL above</li>
              <li>Select "Recording Completed" event</li>
              <li>Done! Real-time sync, no middleman</li>
            </ol>
          </div>

          {/* Option 2: Make.com */}
          <div className="mb-3 p-2 bg-white rounded-lg border border-gray-200">
            <p className="text-xs font-bold text-blue-700 mb-1">Option 2: Make.com (FREE tier works!)</p>
            <ol className="text-xs text-gray-700 space-y-0.5 list-decimal list-inside ml-2">
              <li>Trigger: Fathom → "Watch Recordings"</li>
              <li>Action: HTTP → "Make a Request" (POST)</li>
              <li>Paste webhook URL above</li>
              <li>Map all Fathom fields</li>
            </ol>
          </div>

          {/* Option 3: Zapier Premium */}
          <div className="p-2 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs font-bold text-gray-600 mb-1">Option 3: Zapier (Requires Premium for Webhooks)</p>
            <p className="text-xs text-gray-500">Webhooks feature requires Zapier paid plan ($20/mo)</p>
          </div>
          
          <div className="mt-2 p-2 bg-blue-100 rounded text-xs text-blue-800">
            💡 <strong>Recommendation:</strong> Try Option 1 (Fathom native) first! If Fathom doesn't have webhooks, use Make.com (Option 2).
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-2xl font-bold text-gray-900">{recordings.length}</div>
          <div className="text-xs text-gray-600 mt-1">Total Recordings</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-2xl font-bold text-green-600">
            {recordings.filter(r => r.matchedMeetingId).length}
          </div>
          <div className="text-xs text-gray-600 mt-1">Matched to Meetings</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-2xl font-bold text-blue-600">
            {recordings.reduce((sum, r) => sum + (r.actionItems?.length || 0), 0)}
          </div>
          <div className="text-xs text-gray-600 mt-1">Action Items</div>
        </div>
      </div>

      {/* Sync Log */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-900">Recent Syncs</h4>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
        
        <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="px-4 py-8 text-center text-sm text-gray-500">
              Loading...
            </div>
          ) : syncLog.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-500">
              No syncs yet. Set up your Zapier integration to get started.
            </div>
          ) : (
            syncLog.map((entry) => (
              <div key={entry.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {entry.status === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {entry.title}
                        </p>
                        {entry.matched && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                            <Calendar className="w-3 h-3" />
                            Matched
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{formatDate(entry.syncedAt)}</span>
                        {entry.actionItemCount !== undefined && entry.actionItemCount > 0 && (
                          <span>{entry.actionItemCount} action items</span>
                        )}
                      </div>
                      {entry.error && (
                        <p className="text-xs text-red-600 mt-1">{entry.error}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recordings List */}
      {recordings.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900">All Recordings</h4>
          </div>
          
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {recordings.map((recording) => (
              <div key={recording.fathomId} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-900">{recording.title}</p>
                      {recording.matchedMeetingId && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                          <Calendar className="w-3 h-3" />
                          Matched
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                      <span>{formatDate(recording.startTime)}</span>
                      {recording.duration > 0 && (
                        <span>{Math.round(recording.duration / 60)} min</span>
                      )}
                      {recording.actionItems?.length > 0 && (
                        <span>{recording.actionItems.length} action items</span>
                      )}
                    </div>
                    {recording.summary && (
                      <p className="text-xs text-gray-600 line-clamp-2">{recording.summary}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {recording.recordingUrl && (
                      <a
                        href={recording.recordingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        View
                      </a>
                    )}
                    <button
                      onClick={() => handleDeleteRecording(recording.fathomId)}
                      className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}