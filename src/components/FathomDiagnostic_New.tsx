import { useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function FathomDiagnostic() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [webhookTestResult, setWebhookTestResult] = useState<any>(null);
  const [webhookMeetings, setWebhookMeetings] = useState<any>(null);
  const [loadingMeetings, setLoadingMeetings] = useState(false);
  const [debugData, setDebugData] = useState<any>(null);
  const [loadingDebug, setLoadingDebug] = useState(false);

  const runTest = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a89809a8/fathom/test`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Test failed:', error);
      setResults({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testWebhook = async () => {
    setTestingWebhook(true);
    setWebhookTestResult(null);
    try {
      // Send a test webhook payload
      const testPayload = {
        id: 'test_' + Date.now(),
        title: 'Test Meeting from Diagnostic',
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 3600000).toISOString(),
        summary: 'This is a test meeting to verify webhook integration is working.',
        action_items: [
          { text: 'Test action item 1' },
          { text: 'Test action item 2' }
        ],
        participants: [{ name: 'Test User', email: 'test@example.com' }],
        share_url: 'https://app.fathom.video/call/test123'
      };

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a89809a8/webhooks/fathom`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify(testPayload)
        }
      );

      const data = await response.json();
      setWebhookTestResult({
        success: response.ok,
        data,
        message: response.ok 
          ? '✅ Webhook processed successfully! Meeting notes were auto-created.' 
          : '❌ Webhook processing failed.'
      });
    } catch (error) {
      console.error('Webhook test failed:', error);
      setWebhookTestResult({
        success: false,
        error: error.message,
        message: '❌ Failed to send test webhook.'
      });
    } finally {
      setTestingWebhook(false);
    }
  };

  const loadWebhookMeetings = async () => {
    setLoadingMeetings(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a89809a8/webhooks/fathom/meetings`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      const data = await response.json();
      setWebhookMeetings(data);
    } catch (error) {
      console.error('Failed to load meetings:', error);
      setWebhookMeetings({ error: error.message });
    } finally {
      setLoadingMeetings(false);
    }
  };

  const loadDebugData = async () => {
    setLoadingDebug(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a89809a8/webhooks/fathom/debug/all`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      const data = await response.json();
      console.log('🔍 Debug data received:', data);
      setDebugData(data);
    } catch (error) {
      console.error('Failed to load debug data:', error);
      setDebugData({ error: error.message });
    } finally {
      setLoadingDebug(false);
    }
  };

  const webhookUrl = `https://${projectId}.supabase.co/functions/v1/make-server-a89809a8/webhooks/fathom`;

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* How It Works Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
        <h2 className="text-xl font-serif font-semibold text-blue-900 mb-3">
          ℹ️ How Fathom Integration Works
        </h2>
        <div className="text-sm text-slate-700 leading-relaxed">
          SpoonFlow integrates with Fathom to automatically capture meeting notes using webhooks.
          <br /><br />
          <strong>How it works:</strong>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Fathom processes your meeting recording</li>
            <li>Fathom sends the transcript, summary, and action items to SpoonFlow via webhook</li>
            <li>SpoonFlow stores this data and makes it available instantly in your Meeting Dossier</li>
            <li>You can click "Fetch Fathom Notes" to populate your meeting notes automatically</li>
          </ol>
          <br />
          <strong className="text-amber-700">Note:</strong> This integration relies entirely on webhooks. 
          If the webhook hasn't arrived yet (usually 30-60 seconds after meeting ends), you can manually paste notes instead.
        </div>
      </div>

      {/* Webhook Setup Instructions */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl shadow-lg border border-purple-200 p-8 mb-6">
        <h2 className="text-2xl font-serif font-semibold text-slate-800 mb-4">
          ✅ Recommended: Fathom Webhook Integration
        </h2>
        <p className="text-slate-700 mb-4">
          Fathom works best with <strong>webhooks</strong>, not REST API. Set up auto-import in 3 easy steps:
        </p>

        <div className="bg-white rounded-xl p-6 mb-4 border border-purple-200">
          <h3 className="font-semibold text-slate-800 mb-3">Setup Instructions:</h3>
          <ol className="space-y-3 text-sm text-slate-700">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">1</span>
              <div className="flex-1">
                <strong>Open Fathom Settings</strong>
                <p className="text-slate-600 mt-1">Go to your Fathom account → Settings → Integrations → Webhooks</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">2</span>
              <div className="flex-1">
                <strong>Add Webhook URL</strong>
                <div className="mt-2 p-3 bg-slate-100 rounded-lg font-mono text-xs break-all border border-slate-200">
                  {webhookUrl}
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(webhookUrl);
                    alert('Copied to clipboard!');
                  }}
                  className="mt-2 text-xs text-purple-600 hover:text-purple-800 font-medium"
                >
                  📋 Copy URL
                </button>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">3</span>
              <div className="flex-1">
                <strong>Configure Webhook Secret</strong>
                <p className="text-slate-600 mt-1">
                  Your <code className="bg-purple-100 px-1 rounded text-xs">CURRENT_FATHOM_WEBHOOK_SECRET</code> is already configured in Supabase. 
                  Copy this same secret into Fathom's webhook settings for security.
                </p>
              </div>
            </li>
          </ol>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800">
            <strong>✨ Once configured:</strong> After each meeting, Fathom will automatically send meeting data to SpoonFlow, 
            and your meeting notes will be auto-created with summary, action items, and transcript!
          </p>
        </div>

        {/* Test Webhook Button */}
        <div className="mt-4">
          <button
            onClick={testWebhook}
            disabled={testingWebhook}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {testingWebhook ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Testing webhook...
              </>
            ) : (
              '🧪 Test Webhook (Send Test Meeting)'
            )}
          </button>
        </div>

        {webhookTestResult && (
          <div className={`mt-4 p-4 rounded-lg border ${
            webhookTestResult.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <p className={`font-medium ${
              webhookTestResult.success ? 'text-green-900' : 'text-red-900'
            }`}>
              {webhookTestResult.message}
            </p>
            {webhookTestResult.data && (
              <details className="mt-2">
                <summary className="text-xs text-slate-600 cursor-pointer hover:text-slate-800">
                  View response details
                </summary>
                <pre className="text-xs text-slate-700 mt-2 p-3 bg-white rounded border overflow-auto">
                  {JSON.stringify(webhookTestResult.data, null, 2)}
                </pre>
              </details>
            )}
            {webhookTestResult.error && (
              <p className="text-xs text-red-600 mt-2 font-mono">
                {webhookTestResult.error}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Debug Data - Comprehensive View */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-6">
        <h2 className="text-2xl font-serif font-semibold text-slate-800 mb-4">
          🔍 Comprehensive Webhook Debug Data
        </h2>
        <p className="text-slate-600 mb-6">
          View all webhook data stored in SpoonFlow. This shows exactly what webhooks have been received and what Jamie can access.
        </p>

        <button
          onClick={loadDebugData}
          disabled={loadingDebug}
          className="px-6 py-3 bg-[#6b2358] hover:bg-[#6b2358]/90 text-white rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {loadingDebug ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading...
            </>
          ) : (
            'Load All Webhook Data'
          )}
        </button>

        {debugData && (
          <div className="mt-6 space-y-6">
            {debugData.error ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-700">{debugData.error}</p>
              </div>
            ) : (
              <>
                {/* Summary Box */}
                <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl">
                  <h3 className="font-semibold text-slate-900 mb-3">📊 Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-slate-600">Webhook Logs</p>
                      <p className="text-2xl font-bold text-purple-600">{debugData.summary?.totalWebhookLogs || 0}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Jamie Keys</p>
                      <p className="text-2xl font-bold text-blue-600">{debugData.summary?.totalJamieKeys || 0}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Meeting Dossiers</p>
                      <p className="text-2xl font-bold text-green-600">{debugData.summary?.totalMeetingDossiers || 0}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Last Webhook</p>
                      <p className="text-xs font-medium text-slate-700">
                        {debugData.summary?.lastWebhookReceived !== 'Never' 
                          ? new Date(debugData.summary.lastWebhookReceived).toLocaleString()
                          : 'Never'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Jamie Webhook Data (What the "Fetch Fathom Notes" button looks for) */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">🤖 Jamie Webhook Data (fathom:webhook:* keys)</h3>
                  <p className="text-sm text-slate-600 mb-3">
                    These are the keys Jamie looks for when you paste a Fathom URL and click "Fetch Fathom Notes"
                  </p>
                  {debugData.jamieWebhookData && debugData.jamieWebhookData.length > 0 ? (
                    <div className="space-y-3">
                      {debugData.jamieWebhookData.map((webhook: any, index: number) => (
                        <div key={index} className="p-4 bg-green-50 border border-green-200 rounded-xl">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium text-slate-900">{webhook.title || 'Untitled'}</h4>
                              <p className="text-xs font-mono text-slate-600 mt-1">ID: {webhook.meetingId}</p>
                            </div>
                            <span className="text-xs text-slate-500">
                              {webhook.startTime ? new Date(webhook.startTime).toLocaleString() : 'No date'}
                            </span>
                          </div>
                          <div className="flex gap-4 text-xs text-slate-600 mt-2">
                            <span>📝 {webhook.actionItemsCount} action items</span>
                            <span className={webhook.hasTranscript ? 'text-green-600' : 'text-amber-600'}>
                              {webhook.hasTranscript ? '✓ Has transcript' : '✗ No transcript'}
                            </span>
                            <span className={webhook.hasSummary ? 'text-green-600' : 'text-amber-600'}>
                              {webhook.hasSummary ? '✓ Has summary' : '✗ No summary'}
                            </span>
                          </div>
                          {webhook.shareUrl && (
                            <a
                              href={webhook.shareUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-purple-600 hover:text-purple-800 mt-2 inline-block"
                            >
                              Open in Fathom →
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <p className="text-sm text-amber-800">
                        ⚠️ No Jamie webhook keys found. When Fathom sends a webhook, it will appear here.
                      </p>
                    </div>
                  )}
                </div>

                {/* Webhook Logs */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">📬 Webhook Logs (fathom_webhook_log_* keys)</h3>
                  <p className="text-sm text-slate-600 mb-3">
                    These are logs of all webhook POST requests received from Fathom
                  </p>
                  {debugData.webhookLogs && debugData.webhookLogs.length > 0 ? (
                    <div className="space-y-3">
                      {debugData.webhookLogs.map((log: any, index: number) => (
                        <div key={index} className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium text-slate-900">{log.meetingTitle || 'Untitled'}</h4>
                              <p className="text-xs font-mono text-slate-600 mt-1">ID: {log.meetingId}</p>
                            </div>
                            <span className="text-xs text-slate-500">
                              {new Date(log.receivedAt).toLocaleString()}
                            </span>
                          </div>
                          {log.shareUrl && (
                            <a
                              href={log.shareUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-purple-600 hover:text-purple-800"
                            >
                              View in Fathom →
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                      <p className="text-sm text-slate-600">
                        No webhook logs yet. Configure the webhook in Fathom to start receiving data.
                      </p>
                    </div>
                  )}
                </div>

                {/* Instructions */}
                {debugData.instructions && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <h4 className="font-medium text-slate-900 mb-2">💡 How This Works</h4>
                    <p className="text-sm text-slate-700 mb-2">{debugData.instructions.message}</p>
                    <ul className="text-xs text-slate-600 space-y-1 list-disc ml-5">
                      <li><strong>jamieWebhookKeys:</strong> {debugData.instructions.jamieWebhookKeys}</li>
                      <li><strong>webhookLogs:</strong> {debugData.instructions.webhookLogs}</li>
                      <li><strong>To test:</strong> {debugData.instructions.howToTest}</li>
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
