/**
 * Meeting Dossier
 * Displays pre-meeting and post-meeting information with Jamie AI integration
 */

import React, { useState, useEffect, useRef } from 'react';
import { FileText, Link as LinkIcon, Sparkles, Loader2, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import type { CalendarEvent } from '../types/calendar';
import type { Contact } from '../types/contact';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner';

interface MutedMeetingDossierProps {
  // Support both old and new prop patterns
  event?: CalendarEvent;
  contacts?: Contact[];
  // New pattern from PostMeetingWizard
  mode?: 'pre-meeting' | 'post-meeting' | 'prep' | 'review';
  meetingTitle?: string;
  meetingDate?: string;
  meetingTime?: string;
  contact?: { name: string; id?: string; email?: string };
  onGenerateFromFathom?: (fathomUrl: string) => void;
  onConfirmTasks?: (tasks: Array<{ text: string; type?: string }>) => void;
  onPostMeetingNotesChange?: (notes: {
    fathomUrl: string;
    summary: string;
    outcomes: string;
    remainingQuestions: string;
    thingsDiscussed?: Array<{ text: string; completed: boolean }>;
    actionItems?: Array<{ text: string }>;
  }) => void;
  onPrepNotesChange?: (prepNotes: {
    thingsToKnow: string;
    thingsToDiscuss: Array<{ text: string; completed: boolean }>;
    questionsToAsk: Array<{ text: string; completed: boolean }>;
    nextSteps: string;
  }) => void;
  hideHeader?: boolean;
  currentMeetingIndex?: number;
  totalMeetings?: number;
  allowPrepEditing?: boolean; // NEW: Allow editing prep notes in review mode
  initialData?: {
    prepNotes?: {
      thingsToKnow?: string;
      thingsToDiscuss?: Array<{ text: string; completed: boolean }>;
      questionsToAsk?: Array<{ text: string; completed: boolean }>;
      nextSteps?: string;
    };
    postMeetingNotes?: {
      fathomUrl?: string;
      summary?: string;
      outcomes?: string;
      remainingQuestions?: string;
      thingsDiscussed?: Array<{ text: string; completed: boolean }>;
      actionItems?: Array<{ text: string }>;
    };
  };
}

export function MutedMeetingDossier({ 
  event, 
  contacts,
  mode = 'post-meeting',
  meetingTitle,
  meetingDate,
  meetingTime,
  contact,
  onGenerateFromFathom,
  onConfirmTasks,
  onPostMeetingNotesChange,
  onPrepNotesChange,
  hideHeader = false,
  currentMeetingIndex,
  totalMeetings,
  allowPrepEditing = false, // NEW: Default to false
  initialData
}: MutedMeetingDossierProps) {
  const title = meetingTitle || event?.summary || 'Meeting';
  
  // Prep notes state (AM Wizard)
  const [thingsToKnow, setThingsToKnow] = useState(initialData?.prepNotes?.thingsToKnow || '');
  const [thingsToDiscuss, setThingsToDiscuss] = useState<Array<{ text: string; completed: boolean }>>(
    initialData?.prepNotes?.thingsToDiscuss || []
  );
  const [questionsToAsk, setQuestionsToAsk] = useState<Array<{ text: string; completed: boolean }>>(
    initialData?.prepNotes?.questionsToAsk || []
  );
  const [nextSteps, setNextSteps] = useState(initialData?.prepNotes?.nextSteps || '');
  
  // Post-meeting notes state
  const [fathomUrl, setFathomUrl] = useState(initialData?.postMeetingNotes?.fathomUrl || '');
  const [meetingTranscript, setMeetingTranscript] = useState('');
  const [summary, setSummary] = useState(initialData?.postMeetingNotes?.summary || '');
  const [outcomes, setOutcomes] = useState(initialData?.postMeetingNotes?.outcomes || '');
  const [remainingQuestions, setRemainingQuestions] = useState(initialData?.postMeetingNotes?.remainingQuestions || '');
  const [thingsDiscussed, setThingsDiscussed] = useState<Array<{ text: string; completed: boolean }>>(
    initialData?.postMeetingNotes?.thingsDiscussed || []
  );
  const [actionItems, setActionItems] = useState<Array<{ text: string }>>(
    initialData?.postMeetingNotes?.actionItems || []
  );
  
  // Jamie AI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFetchingFathom, setIsFetchingFathom] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false); // For collapsible transcript

  // Use refs to track the latest callbacks without causing re-renders
  const prepNotesCallbackRef = useRef(onPrepNotesChange);
  const postMeetingNotesCallbackRef = useRef(onPostMeetingNotesChange);
  
  useEffect(() => {
    prepNotesCallbackRef.current = onPrepNotesChange;
  }, [onPrepNotesChange]);
  
  useEffect(() => {
    postMeetingNotesCallbackRef.current = onPostMeetingNotesChange;
  }, [onPostMeetingNotesChange]);

  // Notify parent of prep notes changes
  useEffect(() => {
    if (prepNotesCallbackRef.current && mode === 'prep') {
      prepNotesCallbackRef.current({
        thingsToKnow,
        thingsToDiscuss,
        questionsToAsk,
        nextSteps
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thingsToKnow, JSON.stringify(thingsToDiscuss), JSON.stringify(questionsToAsk), nextSteps, mode]);

  // Notify parent of post-meeting changes
  useEffect(() => {
    if (postMeetingNotesCallbackRef.current) {
      postMeetingNotesCallbackRef.current({
        fathomUrl,
        summary,
        outcomes,
        remainingQuestions,
        thingsDiscussed,
        actionItems
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fathomUrl, summary, outcomes, remainingQuestions, JSON.stringify(thingsDiscussed), JSON.stringify(actionItems)]);

  const handleGenerateFromFathom = async () => {
    // Extract from the summary text field instead of Fathom URL
    const hasSummary = summary.trim().length > 0;
    
    if (!hasSummary) {
      toast.error('Please write or paste a meeting summary first');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Always use the extract-from-text endpoint with summary content
      const endpoint = `https://${projectId}.supabase.co/functions/v1/make-server-a89809a8/jamie/extract-from-text`;
      const body = { transcript: summary };
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ Jamie extract failed:', result);
        toast.error('Failed to extract meeting details', {
          description: result.technicalDetails || result.message || 'You can still fill in the fields manually',
        });
        return;
      }

      // Success! Populate the fields with extracted data
      const { data } = result;
      
      setOutcomes(data.outcomes || '');
      setRemainingQuestions(data.remainingQuestions || '');
      setActionItems(data.actionItems || []);
      
      setHasGenerated(true);
      
      toast.success('Meeting details extracted from summary!', {
        description: `Found ${data.actionItems?.length || 0} action items`,
      });
    } catch (error) {
      console.error('Error extracting from summary:', error);
      toast.error('Failed to extract meeting details', {
        description: 'You can still fill in the fields manually',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDebugFathomWebhook = async () => {
    const url = fathomUrl.trim();
    
    if (!url) {
      toast.error('Please enter a Fathom URL first');
      return;
    }

    // Extract meeting ID from URL
    const meetingIdMatch = url.match(/\/share\/([^/?]+)|\/call\/([^/?]+)|\/calls\/([^/?]+)/);
    const meetingId = meetingIdMatch ? (meetingIdMatch[1] || meetingIdMatch[2] || meetingIdMatch[3]) : null;
    
    if (!meetingId) {
      toast.error('Could not extract meeting ID from URL');
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a89809a8/webhooks/fathom/debug`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ meetingId }),
        }
      );

      const result = await response.json();
      console.log('🔍 Webhook Debug Results:', result);
      
      toast.info(`Debug: ${result.webhookLogs.total} webhook logs found`, {
        description: result.webhookLogs.matchingLog 
          ? `✅ Found matching webhook for ID: ${meetingId}` 
          : result.webhookLogs.total === 0
            ? `❌ No webhooks received yet. Configure the webhook in Fathom settings: https://${projectId}.supabase.co/functions/v1/make-server-a89809a8/webhooks/fathom`
            : `❌ No webhook found for ID: ${meetingId}. All IDs: ${result.webhookLogs.allMeetingIds.join(', ') || 'none'}`,
        duration: 15000,
      });
    } catch (error) {
      console.error('Debug error:', error);
      toast.error('Debug failed');
    }
  };

  const handleFetchFromFathom = async () => {
    const url = fathomUrl.trim();
    
    if (!url) {
      toast.error('Please enter a Fathom URL first');
      return;
    }

    // Basic URL validation
    if (!url.includes('fathom.video') && !url.includes('app.fathom')) {
      toast.error('Invalid Fathom URL', {
        description: 'URL should look like: https://app.fathom.video/call/... or https://fathom.video/share/...'
      });
      return;
    }

    setIsFetchingFathom(true);
    
    try {
      const endpoint = `https://${projectId}.supabase.co/functions/v1/make-server-a89809a8/jamie/extract-from-fathom`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fathomUrl: url }),
      });

      const result = await response.json();
      console.log('📥 Fathom extract result:', result);

      if (!response.ok) {
        // Check if it's a webhook pending error
        if (result.webhookPending) {
          // Show detailed debug info
          const debugInfo = result.debugInfo || {};
          console.log('🔍 Webhook Debug Info:', debugInfo);
          
          toast.info('Fathom webhook not received yet', {
            description: debugInfo.totalWebhooks > 0 
              ? `${debugInfo.totalWebhooks} webhook(s) received, but not for this meeting ID (${debugInfo.extractedId}). Check console for available IDs.`
              : 'No webhooks received yet. Make sure webhook is configured in Fathom settings.',
            duration: 10000,
          });
        } else {
          toast.error('Failed to fetch Fathom recording', {
            description: result.message || 'Please check the URL and try again',
            duration: 5000,
          });
        }
        return;
      }

      // Success! Auto-populate all fields
      const { data, source } = result;
      
      setSummary(data.summary || '');
      setMeetingTranscript(data.transcript || ''); // 📝 Store transcript for Jamie
      setOutcomes(data.outcomes || '');
      setRemainingQuestions(data.remainingQuestions || '');
      setThingsDiscussed(data.thingsDiscussed || []);
      setActionItems(data.actionItems || []);
      
      setHasGenerated(true);
      
      toast.success(source === 'webhook' ? 'Loaded from Fathom webhook!' : 'Fathom recording fetched!', {
        description: `Found ${data.actionItems?.length || 0} action items${source === 'webhook' ? ' from webhook data' : ''}`,
        duration: 4000,
      });
    } catch (error) {
      console.error('Error fetching from Fathom:', error);
      toast.error('Failed to connect to Fathom', {
        description: 'Please check your connection and try again',
      });
    } finally {
      setIsFetchingFathom(false);
    }
  };

  const handleConfirmTasks = () => {
    if (actionItems.length === 0) {
      toast.error('No action items to convert to tasks');
      return;
    }

    const tasksToCreate = actionItems.map(item => ({
      text: item.text,
      type: 'to-do' as const
    }));

    if (onConfirmTasks) {
      onConfirmTasks(tasksToCreate);
    }
  };

  if (mode === 'pre-meeting' || mode === 'prep') {
    return (
      <div className="space-y-6">
        {!hideHeader && (
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-5 h-5 text-[#6b2358]" />
            <h3 className="font-serif text-2xl text-slate-800">Meeting Preparation</h3>
          </div>
        )}

        {/* Things I Want to Talk About */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50">
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Things I want to talk about
          </label>
          <div className="space-y-2 mb-3">
            {thingsToDiscuss.map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <button
                  onClick={() => {
                    const newItems = [...thingsToDiscuss];
                    newItems[index].completed = !newItems[index].completed;
                    setThingsToDiscuss(newItems);
                  }}
                  className="flex-shrink-0 mt-0.5"
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    item.completed ? 'bg-[#6b2358] border-[#6b2358]' : 'border-slate-300'
                  }`}>
                    {item.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                </button>
                <input
                  type="text"
                  value={item.text}
                  onChange={(e) => {
                    const newItems = [...thingsToDiscuss];
                    newItems[index].text = e.target.value;
                    setThingsToDiscuss(newItems);
                  }}
                  className={`flex-1 bg-transparent border-none focus:outline-none text-sm ${
                    item.completed ? 'line-through text-slate-400' : 'text-slate-700'
                  }`}
                  placeholder="Topic to discuss..."
                />
                <button
                  onClick={() => {
                    setThingsToDiscuss(prev => prev.filter((_, i) => i !== index));
                  }}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              setThingsToDiscuss(prev => [...prev, { text: '', completed: false }]);
            }}
            className="w-full px-4 py-2 border-2 border-dashed border-slate-300 hover:border-[#6b2358] text-slate-600 hover:text-[#6b2358] rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add topic
          </button>
        </div>

        {/* Questions I Want to Ask */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50">
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Questions I want to ask
          </label>
          <div className="space-y-2 mb-3">
            {questionsToAsk.map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <button
                  onClick={() => {
                    const newItems = [...questionsToAsk];
                    newItems[index].completed = !newItems[index].completed;
                    setQuestionsToAsk(newItems);
                  }}
                  className="flex-shrink-0 mt-0.5"
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    item.completed ? 'bg-[#6b2358] border-[#6b2358]' : 'border-slate-300'
                  }`}>
                    {item.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                </button>
                <input
                  type="text"
                  value={item.text}
                  onChange={(e) => {
                    const newItems = [...questionsToAsk];
                    newItems[index].text = e.target.value;
                    setQuestionsToAsk(newItems);
                  }}
                  className={`flex-1 bg-transparent border-none focus:outline-none text-sm ${
                    item.completed ? 'line-through text-slate-400' : 'text-slate-700'
                  }`}
                  placeholder="Question to ask..."
                />
                <button
                  onClick={() => {
                    setQuestionsToAsk(prev => prev.filter((_, i) => i !== index));
                  }}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              setQuestionsToAsk(prev => [...prev, { text: '', completed: false }]);
            }}
            className="w-full px-4 py-2 border-2 border-dashed border-slate-300 hover:border-[#6b2358] text-slate-600 hover:text-[#6b2358] rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add question
          </button>
        </div>

        {/* Things I Need to Know */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Things I need to know going into this meeting
          </label>
          <textarea
            value={thingsToKnow}
            onChange={(e) => setThingsToKnow(e.target.value)}
            placeholder="What context or information do I need before this meeting?"
            rows={4}
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-[#6b2358] focus:outline-none transition-all resize-none"
          />
        </div>

        {/* Next Steps (Expected) */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Expected next steps from this meeting
          </label>
          <textarea
            value={nextSteps}
            onChange={(e) => setNextSteps(e.target.value)}
            placeholder="What outcomes or next steps do I hope to achieve?"
            rows={4}
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-[#6b2358] focus:outline-none transition-all resize-none"
          />
        </div>
      </div>
    );
  }

  // Post-meeting mode
  return (
    <div className="space-y-6">
      {!hideHeader && (
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-[#6b2358]" />
          <h2 className="font-serif text-3xl text-slate-800">Meeting Notes</h2>
        </div>
      )}

      <div className="space-y-6">
        {/* TWO-TRACK APPROACH: Choose your method */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
          <h3 className="font-medium text-slate-800 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#6b2358]" />
            Add Your Meeting Notes
          </h3>
          
          {/* Path 1: Fathom URL */}
          <div className="bg-white rounded-xl p-5 mb-4 border border-purple-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-full bg-[#6b2358] text-white flex items-center justify-center text-sm font-bold">1</div>
              <label className="text-sm font-medium text-slate-700">
                Have a Fathom URL? Paste it here to auto-load everything
              </label>
            </div>
            <div className="flex gap-2">
              <input
                type="url"
                value={fathomUrl}
                onChange={(e) => setFathomUrl(e.target.value)}
                placeholder="https://app.fathom.video/call/... or https://fathom.video/share/..."
                className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-[#6b2358] focus:outline-none transition-all text-sm"
              />
              <button
                onClick={handleFetchFromFathom}
                disabled={isFetchingFathom || !fathomUrl.trim()}
                className="px-5 py-3 bg-gradient-to-r from-[#6b2358] to-[#8b3068] text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
              >
                {isFetchingFathom ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Auto-Load
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              ✨ This will automatically populate all fields below from the webhook data
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 border-t border-slate-300"></div>
            <span className="text-sm text-slate-500 font-medium">OR</span>
            <div className="flex-1 border-t border-slate-300"></div>
          </div>

          {/* Path 2: Paste Notes */}
          <div className="bg-white rounded-xl p-5 border border-purple-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-full bg-[#6b2358] text-white flex items-center justify-center text-sm font-bold">2</div>
              <label className="text-sm font-medium text-slate-700">
                Or paste your Fathom notes/summary here
              </label>
            </div>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Example:&#10;&#10;Meeting Purpose: To explore potential collaborations across healthcare ventures.&#10;&#10;Key Takeaways:&#10;- Discussed network growth in NC/AZ&#10;- Explored e-outreach strategies&#10;- Decided to follow up on provider partnerships&#10;&#10;Next Steps:&#10;- Marc to review proposal by Friday&#10;- Schedule follow-up for next week"
              rows={8}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-[#6b2358] focus:outline-none transition-all resize-none text-sm font-mono"
            />
            <div className="flex items-center justify-between mt-3">
              <p className="text-xs text-slate-500">
                💡 Paste your meeting summary, notes, or key points. Jamie will extract the details.
              </p>
              <button
                onClick={handleGenerateFromFathom}
                disabled={isGenerating || !summary.trim()}
                className="px-4 py-2 bg-gradient-to-r from-[#6b2358] to-[#8b3068] text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Extracting...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Jamie Extract
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Meeting Summary - Read-only after extraction */}
        {summary && (
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-700">
                Meeting Summary
                {hasGenerated && <span className="ml-2 text-xs text-green-600">✓ Processed by Jamie</span>}
              </label>
            </div>
            <div className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 max-h-40 overflow-y-auto">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{summary}</p>
            </div>
          </div>
        )}

        {/* Things Discussed */}
        {thingsDiscussed.length > 0 && (
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50">
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Topics Discussed
              <span className="ml-2 text-xs text-green-600">(Extracted by Jamie)</span>
            </label>
            <div className="space-y-2">
              {thingsDiscussed.map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-slate-700 flex-1">{item.text}</span>
                  <button
                    onClick={() => {
                      setThingsDiscussed(prev => prev.filter((_, i) => i !== index));
                    }}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Items with Task Creation */}
        {actionItems.length > 0 && (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 backdrop-blur-xl rounded-2xl p-6 border-2 border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-slate-700">
                Action Items
                <span className="ml-2 text-xs text-green-600">(Extracted by Jamie)</span>
              </label>
              <button
                onClick={handleConfirmTasks}
                className="px-4 py-2 bg-[#6b2358] text-white text-sm rounded-lg font-medium hover:bg-[#8b3068] transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create {actionItems.length} Task{actionItems.length !== 1 ? 's' : ''}
              </button>
            </div>
            <div className="space-y-2">
              {actionItems.map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-purple-200">
                  <div className="w-5 h-5 rounded border-2 border-purple-400 flex-shrink-0 mt-0.5" />
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => {
                      const newItems = [...actionItems];
                      newItems[index] = { text: e.target.value };
                      setActionItems(newItems);
                    }}
                    className="flex-1 bg-transparent border-none focus:outline-none text-sm text-slate-700"
                  />
                  <button
                    onClick={() => {
                      setActionItems(prev => prev.filter((_, i) => i !== index));
                    }}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-600 mt-3 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#6b2358]" />
              Edit these items if needed, then click "Create Tasks" to add them to your task list
            </p>
          </div>
        )}

        {/* Outcomes & Decisions */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Outcomes & Decisions
            {hasGenerated && <span className="ml-2 text-xs text-green-600">(Generated by Jamie)</span>}
          </label>
          <textarea
            value={outcomes}
            onChange={(e) => setOutcomes(e.target.value)}
            placeholder="What decisions were made? What are the next steps?"
            rows={4}
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-[#6b2358] focus:outline-none transition-all resize-none"
          />
        </div>

        {/* Remaining Questions */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Remaining Questions or Open Items
          </label>
          <textarea
            value={remainingQuestions}
            onChange={(e) => setRemainingQuestions(e.target.value)}
            placeholder="What questions remain unanswered? What needs follow-up?"
            rows={4}
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-[#6b2358] focus:outline-none transition-all resize-none"
          />
        </div>

        {/* Full Transcript - Collapsible (Hidden by default, available to Jamie) */}
        {meetingTranscript && (
          <div className="bg-slate-50/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50">
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[#6b2358] transition-colors w-full"
            >
              <FileText className="w-4 h-4" />
              <span>Full Transcript</span>
              <span className="text-xs text-slate-400 ml-auto">
                {showTranscript ? '▼ Hide' : '▶ Show'} (Available to Jamie)
              </span>
            </button>
            {showTranscript && (
              <div className="mt-4 p-4 bg-white rounded-xl border border-slate-200 max-h-96 overflow-y-auto">
                <pre className="text-xs text-slate-600 whitespace-pre-wrap font-mono leading-relaxed">
                  {meetingTranscript}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}