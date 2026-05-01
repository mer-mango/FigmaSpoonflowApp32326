import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Calendar,
  Clock,
  Bell,
  CheckCircle2,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import type { ContentItem, BrainDump, JamieSourceAnalysis } from '../../types/content';
import { BrainDumpModal } from './BrainDumpModal';
import { analyzeSourceMaterial, checkVoiceGuidelines } from '../../utils/jamieAI';
import { platformPlaybook } from '../../config/platform_playbook';
import { copyToClipboard } from '../../utils/clipboard';

type CheckStatus = 'pass' | 'warn' | 'fail';

interface DraftCheckResult {
  key: string;
  label: string;
  status: CheckStatus;
  message: string;
}

interface JamiePanelProps {
  contentItem: ContentItem;
  onUpdate: (field: keyof ContentItem, value: any) => void;
  onAnalyzeSource?: () => void;
  onGenerateSEO?: () => void;
  onPublish?: () => void;
}

export function JamiePanel({
  contentItem,
  onUpdate,
  onAnalyzeSource,
  onGenerateSEO,
  onPublish
}: JamiePanelProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [showBrainDumpModal, setShowBrainDumpModal] = useState(false);
  const [isAnalyzingSource, setIsAnalyzingSource] = useState(false);
  const [sourceAnalysisError, setSourceAnalysisError] = useState<string | null>(null);
  const [draftCheckResults, setDraftCheckResults] = useState<DraftCheckResult[] | null>(null);
  const [isRunningDraftCheck, setIsRunningDraftCheck] = useState(false);

  // Toggle section expansion
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const isSectionExpanded = (sectionId: string) => expandedSections.includes(sectionId);

  // Handle brain dump approval
  const handleBrainDumpApprove = (brainDump: Omit<BrainDump, 'id' | 'timestamp'>) => {
    const newBrainDump: BrainDump = {
      id: `bd-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...brainDump
    };

    const updatedBrainDumps = [...(contentItem.brainDumps || []), newBrainDump];
    onUpdate('brainDumps', updatedBrainDumps);
    setShowBrainDumpModal(false);
  };

  // Generate source analysis if missing
  useEffect(() => {
    const hasSourceMaterial = contentItem.sourceContent || contentItem.sourceUrl;
    const hasAnalysis = contentItem.jamieSourceAnalysis;

    if (hasSourceMaterial && !hasAnalysis && !isAnalyzingSource) {
      handleGenerateSourceAnalysis();
    }
  }, [contentItem.id]);

  const handleGenerateSourceAnalysis = async () => {
    // Only analyze if we have actual content (not just a URL)
    if (!contentItem.sourceContent || contentItem.sourceContent.trim().length === 0) {
      return;
    }

    setIsAnalyzingSource(true);
    setSourceAnalysisError(null);

    try {
      const analysis = await analyzeSourceMaterial(
        contentItem.sourceContent,
        contentItem.sourceUrl,
        contentItem.source,
        contentItem.sourceAuthor
      );

      const sourceAnalysis: JamieSourceAnalysis = {
        generatedAt: new Date().toISOString(),
        highlevelSummary: analysis.highlevelSummary,
        keyPoints: analysis.keyPoints,
        sourceHash: hashString(contentItem.sourceContent)
      };

      onUpdate('jamieSourceAnalysis', sourceAnalysis);
    } catch (error) {
      console.error('Failed to analyze source:', error);
      setSourceAnalysisError(error instanceof Error ? error.message : 'Failed to analyze source');
    } finally {
      setIsAnalyzingSource(false);
    }
  };

  // Simple hash function for detecting source changes
  function hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString();
  }

  const hasSourceChanged = () => {
    if (!contentItem.jamieSourceAnalysis) return false;
    const currentHash = hashString(contentItem.sourceContent || '');
    return currentHash !== contentItem.jamieSourceAnalysis.sourceHash;
  };

  // Draft Check functionality
  const handleRunDraftCheck = () => {
    const draftText = contentItem.content || '';
    const platform = contentItem.platform;

    // Edge case: empty draft
    if (!draftText || draftText.trim().length === 0) {
      setDraftCheckResults([
        {
          key: 'empty_draft',
          label: 'Empty draft',
          status: 'warn',
          message: 'No content to check'
        }
      ]);
      return;
    }

    // Platform not selected or not found
    if (!platform || !Object.prototype.hasOwnProperty.call(platformPlaybook.platforms, platform)) {
      setDraftCheckResults([
        {
          key: 'no_platform',
          label: 'Select a platform to run draft checks',
          status: 'warn',
          message: 'Choose LI Post, LI Article, SS Post, or SS Audio.'
        }
      ]);
      return;
    }

    setIsRunningDraftCheck(true);

    setTimeout(() => {
      const results: DraftCheckResult[] = [];
      const platformKey = platform as keyof typeof platformPlaybook.platforms;
      const checklist = platformPlaybook.platforms[platformKey].checklist;

      // Run platform checks in order
      checklist.forEach((checkItem) => {
        if (checkItem.key === 'has_hook_early') {
          const first220 = draftText.trimStart().substring(0, 220);
          const hasHookSignal =
            first220.includes('?') ||
            draftText.trimStart().startsWith('If ') ||
            draftText.trimStart().startsWith('Most ') ||
            draftText.trimStart().startsWith('Stop ') ||
            draftText.trimStart().startsWith('Here\'s ') ||
            draftText.trimStart().startsWith('I ') ||
            draftText.trimStart().startsWith('What ') ||
            draftText.trimStart().startsWith('Why ');

          results.push({
            key: checkItem.key,
            label: checkItem.label,
            status: hasHookSignal ? 'pass' : 'fail',
            message: hasHookSignal ? 'Opening feels sharp' : 'Add a sharper opening line'
          });
        } else if (checkItem.key === 'scannable') {
          const lineBreaks = (draftText.match(/\n/g) || []).length;
          let status: CheckStatus;
          let message: string;

          if (lineBreaks >= 3) {
            status = 'pass';
            message = 'Good use of line breaks';
          } else if (lineBreaks >= 1) {
            status = 'warn';
            message = 'Add more line breaks';
          } else {
            status = 'fail';
            message = 'No line breaks found';
          }

          results.push({
            key: checkItem.key,
            label: checkItem.label,
            status,
            message
          });
        } else if (checkItem.key === 'one_idea') {
          const first400 = draftText.substring(0, 400).toLowerCase();
          const conjunctions = (first400.match(/\band\b|\bbut\b|\balso\b/g) || []).length;
          const hasNumberedSections = /\n1\.|2\./i.test(draftText);

          const hasMultipleIdeas = conjunctions >= 6 || hasNumberedSections;

          results.push({
            key: checkItem.key,
            label: checkItem.label,
            status: hasMultipleIdeas ? 'warn' : 'pass',
            message: hasMultipleIdeas
              ? 'Might be covering too many ideas'
              : 'Focused on one core idea'
          });
        } else if (checkItem.key === 'has_cta') {
          const trimmedText = draftText.trim().toLowerCase();
          const hasCTA =
            draftText.trim().endsWith('?') ||
            trimmedText.includes(' dm') ||
            trimmedText.includes('dm me') ||
            trimmedText.includes('comment') ||
            trimmedText.includes('reply') ||
            trimmedText.includes('message me');

          results.push({
            key: checkItem.key,
            label: checkItem.label,
            status: hasCTA ? 'pass' : 'warn',
            message: hasCTA ? 'CTA found' : 'Consider adding a CTA'
          });
        }
      });

      // Voice check
      const voiceCheck = checkVoiceGuidelines(draftText);
      if (voiceCheck.hasBannedPhrases) {
        results.push({
          key: 'voice_flags',
          label: 'Voice flags',
          status: 'warn',
          message: voiceCheck.bannedPhrasesFound.join(', ')
        });
      } else {
        results.push({
          key: 'voice_clean',
          label: 'Voice',
          status: 'pass',
          message: 'clean'
        });
      }

      setDraftCheckResults(results);
      setIsRunningDraftCheck(false);
    }, 300);
  };

  return (
    <>
      <div className="w-96 bg-white border-l border-slate-200 flex flex-col overflow-y-auto">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-full bg-[#6b2358] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Jamie</h3>
              <p className="text-xs text-slate-500">Content Assistant</p>
            </div>
          </div>
        </div>

        {/* Main Info Section */}
        <div className="p-5 border-b border-slate-200 space-y-4">
          
          {/* Title + Author + Source URL */}
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Content Title</p>
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm text-slate-900 font-medium flex-1">{contentItem.title || 'Untitled'}</p>
              {contentItem.sourceUrl && (
                <a
                  href={contentItem.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Open source in new tab"
                >
                  <ExternalLink className="w-4 h-4 text-slate-500" />
                </a>
              )}
            </div>
            {contentItem.sourceAuthor && (
              <p className="text-xs text-slate-500 mt-1">by {contentItem.sourceAuthor}</p>
            )}
          </div>

          {/* Platform */}
          <div>
            <button
              onClick={() => toggleSection('platform')}
              className="w-full flex items-center justify-between text-left"
            >
              <p className="text-xs font-medium text-slate-500">Platform</p>
              {isSectionExpanded('platform') ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </button>
            <p className="text-sm text-slate-900 mt-1">{contentItem.platform || 'Not specified'}</p>
            
            {/* Platform best practices - collapsible */}
            {isSectionExpanded('platform') && contentItem.platform && (() => {
              const platform = contentItem.platform as keyof typeof platformPlaybook.platforms;
              const hasPlaybook = Object.prototype.hasOwnProperty.call(platformPlaybook.platforms, platform);
              const bullets = hasPlaybook ? platformPlaybook.platforms[platform].best_practices : [];
              
              return (
                <div className="mt-3 p-3 bg-slate-50 rounded-lg text-xs text-slate-600 space-y-1">
                  <p className="font-medium text-slate-700 mb-2">Best Practices for {contentItem.platform}:</p>
                  {hasPlaybook ? (
                    bullets.map((practice, index) => (
                      <p key={index}>• {practice}</p>
                    ))
                  ) : (
                    <p className="text-slate-500 italic">Select a platform to see best practices.</p>
                  )}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Drafting Help Section */}
        <div className="border-b border-slate-200">
          <div className="p-4 bg-slate-50">
            <h4 className="text-xs font-semibold text-slate-700">Drafting Help</h4>
          </div>

          {/* Brain Dump */}
          <div className="p-4 border-b border-slate-100">
            <button
              onClick={() => setShowBrainDumpModal(true)}
              className="w-full px-4 py-2.5 bg-[#6b2358] hover:bg-[#5e2350] text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Brain Dump
            </button>

            {/* Show brain dumps if any exist */}
            {contentItem.brainDumps && contentItem.brainDumps.length > 0 && (
              <div className="mt-3">
                <button
                  onClick={() => toggleSection('brain-dumps')}
                  className="w-full flex items-center justify-between text-left mb-2"
                >
                  <p className="text-xs font-medium text-slate-600">
                    {contentItem.brainDumps.length} Brain Dump{contentItem.brainDumps.length > 1 ? 's' : ''}
                  </p>
                  {isSectionExpanded('brain-dumps') ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {isSectionExpanded('brain-dumps') && (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {contentItem.brainDumps.map((dump) => (
                      <div key={dump.id} className="bg-white border border-slate-200 rounded-lg p-3">
                        <p className="text-xs text-slate-500 mb-2">
                          {new Date(dump.timestamp).toLocaleString()}
                        </p>
                        <div
                          className="prose prose-xs max-w-none"
                          dangerouslySetInnerHTML={{ __html: dump.jamieOutline }}
                        />
                        <details className="mt-2">
                          <summary className="text-xs font-medium text-[#6b2358] cursor-pointer">
                            Jamie's thoughts
                          </summary>
                          <div
                            className="mt-2 prose prose-xs max-w-none text-slate-600"
                            dangerouslySetInnerHTML={{ __html: dump.jamieThoughts }}
                          />
                        </details>
                        
                        {/* Jamie's Draft (if generated) */}
                        {dump.jamieDraft && (
                          <details className="mt-2">
                            <summary className="text-xs font-medium text-[#6b2358] cursor-pointer">
                              Jamie's draft
                            </summary>
                            <div
                              className="mt-2 prose prose-xs max-w-none text-slate-700 bg-slate-50 p-3 rounded-lg"
                              dangerouslySetInnerHTML={{ __html: dump.jamieDraft }}
                            />
                            <button
                              onClick={async () => {
                                // Copy draft to clipboard
                                const tempDiv = document.createElement('div');
                                tempDiv.innerHTML = dump.jamieDraft || '';
                                const success = await copyToClipboard(tempDiv.innerText);
                                // Show toast notification
                                const { toast } = await import('sonner');
                                if (success) {
                                  toast.success('Draft copied to clipboard');
                                } else {
                                  toast.error('Failed to copy draft');
                                }
                              }}
                              className="mt-2 text-xs text-[#6b2358] hover:text-[#5e2350] transition-colors"
                            >
                              📋 Copy to clipboard
                            </button>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* High Level Summary - Collapsible */}
          {contentItem.jamieSourceAnalysis && (
            <CollapsibleSection
              id="high-level-summary"
              title="High Level Summary"
              isExpanded={isSectionExpanded('high-level-summary')}
              onToggle={() => toggleSection('high-level-summary')}
            >
              <p className="text-xs text-slate-700 leading-relaxed">
                {contentItem.jamieSourceAnalysis.highlevelSummary}
              </p>
              {hasSourceChanged() && (
                <button
                  onClick={handleGenerateSourceAnalysis}
                  className="mt-2 text-xs text-[#6b2358] hover:text-[#5e2350] transition-colors"
                >
                  ↻ Refresh (source changed)
                </button>
              )}
            </CollapsibleSection>
          )}

          {/* Important Points/Takeaways - Collapsible */}
          {contentItem.jamieSourceAnalysis && contentItem.jamieSourceAnalysis.keyPoints.length > 0 && (
            <CollapsibleSection
              id="important-points"
              title="Important Points & Takeaways"
              isExpanded={isSectionExpanded('important-points')}
              onToggle={() => toggleSection('important-points')}
            >
              <ul className="space-y-2">
                {contentItem.jamieSourceAnalysis.keyPoints.map((point, index) => (
                  <li key={index} className="text-xs text-slate-700">
                    {point.isQuote ? (
                      <span className="italic">"{point.text}"</span>
                    ) : (
                      <span>{point.text}</span>
                    )}
                    <span className="ml-2 px-1.5 py-0.5 bg-slate-100 text-[10px] text-slate-500 rounded">
                      {point.type}
                    </span>
                  </li>
                ))}
              </ul>
            </CollapsibleSection>
          )}

          {/* My Notes - Collapsible */}
          {contentItem.notes && (
            <CollapsibleSection
              id="my-notes"
              title="My Notes"
              isExpanded={isSectionExpanded('my-notes')}
              onToggle={() => toggleSection('my-notes')}
            >
              <p className="text-xs text-slate-700 whitespace-pre-wrap">{contentItem.notes}</p>
            </CollapsibleSection>
          )}

          {/* Source analysis loading/error states */}
          {isAnalyzingSource && (
            <div className="p-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Sparkles className="w-4 h-4 animate-pulse text-[#6b2358]" />
                <span>Analyzing source material...</span>
              </div>
            </div>
          )}
          
          {sourceAnalysisError && (
            <div className="p-4 border-b border-slate-100">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-xs text-red-600">{sourceAnalysisError}</p>
                <button
                  onClick={handleGenerateSourceAnalysis}
                  className="mt-2 text-xs text-red-700 hover:text-red-800 font-medium"
                >
                  Try again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Draft Check Section */}
        <div className="border-b border-slate-200">
          <div className="p-4 bg-slate-50">
            <h4 className="text-xs font-semibold text-slate-700">Draft Check</h4>
            <p className="text-[10px] text-slate-500 mt-1">Goal: clean, scannable, one idea, one ask.</p>
          </div>
          <div className="p-4">
            <button
              onClick={handleRunDraftCheck}
              disabled={isRunningDraftCheck}
              className="w-full px-4 py-2.5 bg-[#6b2358] hover:bg-[#5e2350] disabled:bg-slate-300 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isRunningDraftCheck ? (
                <>
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  Checking...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Check draft
                </>
              )}
            </button>

            {/* Draft Check Results */}
            {draftCheckResults && draftCheckResults.length > 0 && (
              <div className="mt-4 space-y-2">
                {draftCheckResults.map((result) => (
                  <div
                    key={result.key}
                    className="flex items-start gap-2 p-2 rounded-lg bg-slate-50"
                  >
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      {result.status === 'pass' && (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      )}
                      {result.status === 'warn' && (
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      )}
                      {result.status === 'fail' && (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-900">
                        {result.label}
                      </p>
                      {result.message && (
                        <p className="text-xs text-slate-600 mt-0.5">
                          {result.message}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Review + Polish Section */}
        <div className="border-b border-slate-200">
          <div className="p-4 bg-slate-50">
            <h4 className="text-xs font-semibold text-slate-700">Review + Polish</h4>
          </div>
          <div className="p-4 space-y-2">
            {/* Only show SEO button for Substack posts */}
            {(contentItem.platform === 'SS Post' || contentItem.platform === 'SS Audio') && onGenerateSEO && (
              <button 
                onClick={onGenerateSEO}
                className="w-full px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Generate SEO info
              </button>
            )}
          </div>
        </div>

        {/* Publish Content Section */}
        <div className="p-5 space-y-3">
          <h4 className="text-xs font-semibold text-slate-700 mb-3">Publish Content</h4>
          <p className="text-[10px] text-slate-500 italic mb-3">
            Make sure these are connected to calendar
          </p>

          {/* Publish Date */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Publish Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={contentItem.scheduledDate || ''}
                onChange={(e) => onUpdate('scheduledDate', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b2358] focus:border-transparent"
              />
              <Calendar className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Publish Time */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Publish Time
            </label>
            <div className="relative">
              <input
                type="time"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b2358] focus:border-transparent"
              />
              <Clock className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Set Publish Reminder */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Set Publish Reminder
            </label>
            <div className="relative">
              <select className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b2358] focus:border-transparent appearance-none">
                <option>15 minutes before</option>
                <option>30 minutes before</option>
                <option>1 hour before</option>
                <option>1 day before</option>
              </select>
              <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Publish Button */}
          <button
            onClick={onPublish}
            className="w-full px-4 py-3 bg-[#6b2358] hover:bg-[#5e2350] text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 mt-4"
          >
            <Sparkles className="w-4 h-4" />
            Publish to {contentItem.platform || 'Platform'}
          </button>
        </div>
      </div>

      {/* Brain Dump Modal */}
      <BrainDumpModal
        isOpen={showBrainDumpModal}
        onClose={() => setShowBrainDumpModal(false)}
        onApprove={handleBrainDumpApprove}
        existingBrainDumps={contentItem.brainDumps}
        contentContext={{
          title: contentItem.title,
          platform: contentItem.platform,
          summary: contentItem.summary,
          goals: contentItem.goals,
          audiences: contentItem.audiences,
          length: contentItem.length,
          tone: contentItem.tone
        }}
      />
    </>
  );
}

// Helper component for collapsible sections
interface CollapsibleSectionProps {
  id: string;
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function CollapsibleSection({
  id,
  title,
  isExpanded,
  onToggle,
  children
}: CollapsibleSectionProps) {
  return (
    <div className="p-4 border-b border-slate-100">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between text-left mb-2"
      >
        <h5 className="text-xs font-medium text-slate-700">{title}</h5>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-400" />
        )}
      </button>
      {isExpanded && <div className="mt-2">{children}</div>}
    </div>
  );
}
