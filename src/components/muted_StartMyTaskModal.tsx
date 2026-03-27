import React, { useState } from 'react';
import { X, Lightbulb, FileText, Mail, CheckCircle2, Copy, ArrowRight, Sparkles, ExternalLink, Calendar } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { generateStartMyTaskDraft } from '../utils/jamieAI';
import type { TaskType } from '../utils/taskTypes';
import { copyToClipboard } from '../utils/clipboard';

interface Contact {
  id: string;
  name: string;
  email?: string;
  company?: string;
  schedulingUrl?: string;
  linkedinUrl?: string;
}

interface StartMyTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskTitle: string;
  taskType?: TaskType; // The actual task type from task modal
  taskDescription?: string;
  contact?: Contact; // Contact if task is linked to someone
  onApplySuggestion?: (suggestion: string) => void;
}

export function StartMyTaskModal({
  isOpen,
  onClose,
  taskTitle,
  taskType,
  taskDescription,
  contact,
  onApplySuggestion,
}: StartMyTaskModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState<string>('');

  if (!isOpen) return null;

  const handleGenerate = () => {
    setIsGenerating(true);
    
    // Use Jamie's AI to generate draft with context
    setTimeout(() => {
      const draft = generateStartMyTaskDraft(taskTitle, taskType, taskDescription, contact);
      setGeneratedDraft(draft);
      setIsGenerating(false);
    }, 1500);
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(generatedDraft);
    if (success) {
      toast.success('Draft copied to clipboard');
    } else {
      toast.error('Failed to copy draft');
    }
  };

  const handleApply = () => {
    onApplySuggestion?.(generatedDraft);
    toast.success('Draft applied');
    onClose();
  };

  // Check if this is a scheduling task with a link
  const isSchedulingTheirLink = taskType === 'schedule_their_link' && contact?.schedulingUrl;
  const isSchedulingMyLink = taskType === 'schedule_my_link';

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none">
        <div 
          className="pointer-events-auto w-[85vw] h-[90vh] bg-gradient-to-br from-white via-purple-50/30 to-blue-50/30 rounded-3xl shadow-2xl border border-white/60 backdrop-blur-xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-8 pb-6 border-b border-slate-200/60">
            <div className="flex-1 pr-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-[#5e2350]/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-[#5e2350]" fill="currentColor" />
                </div>
                <h2 className="text-slate-900">Start My Task</h2>
              </div>
              <p className="text-slate-600 text-lg">
                Jamie will help you take the first action on this task.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100/60 rounded-xl transition-gentle"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Task Context */}
          <div className="px-8 pt-6 pb-4 bg-white/40 border-b border-slate-200/40">
            <div className="space-y-1">
              <div className="text-sm text-slate-500 uppercase tracking-wide">
                Task
              </div>
              <h3 className="text-slate-800 text-xl">{taskTitle}</h3>
              {contact && (
                <p className="text-slate-600 text-sm mt-2">
                  Contact: {contact.name}
                  {contact.company && ` • ${contact.company}`}
                </p>
              )}
              {taskDescription && (
                <p className="text-slate-600 text-sm mt-2">{taskDescription}</p>
              )}
            </div>
          </div>

          {/* Generated Draft Area */}
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-4xl mx-auto">
              {!generatedDraft ? (
                <div className="flex flex-col items-center justify-center h-full gap-6">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-2xl bg-[#5e2350]/10 flex items-center justify-center mx-auto mb-4">
                      {isSchedulingTheirLink ? (
                        <Calendar className="w-10 h-10 text-[#5e2350]" />
                      ) : (
                        <Sparkles className="w-10 h-10 text-[#5e2350]" fill="currentColor" />
                      )}
                    </div>
                    <h3 className="text-slate-900 mb-2">
                      {isSchedulingTheirLink 
                        ? `Ready to schedule with ${contact?.name || 'them'}`
                        : 'Ready to start your task'}
                    </h3>
                    <p className="text-slate-600 max-w-md">
                      {isSchedulingTheirLink
                        ? `Jamie will show you ${contact?.name}'s scheduling link so you can book a time.`
                        : isSchedulingMyLink
                        ? 'Jamie will draft an email with your scheduling link.'
                        : `Click the button below and Jamie will help you get started on "${taskTitle}".`}
                    </p>
                  </div>
                  
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="px-8 py-4 bg-[#5e2350] hover:bg-[#4a1c3e] text-white rounded-2xl transition-gentle flex items-center justify-center gap-3 text-lg disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" fill="currentColor" />
                        {isSchedulingTheirLink ? 'Show Their Link' : 'Generate Draft'}
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-slate-900">
                        {isSchedulingTheirLink ? 'Scheduling Link' : 'Your Draft'}
                      </h3>
                      {!isSchedulingTheirLink && (
                        <button
                          onClick={handleCopy}
                          className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200/60 transition-gentle flex items-center gap-2 text-sm"
                        >
                          <Copy className="w-4 h-4" />
                          Copy
                        </button>
                      )}
                    </div>
                    <div className="bg-slate-50/60 rounded-xl p-6 border border-slate-200/40">
                      {isSchedulingTheirLink && contact?.schedulingUrl ? (
                        <div className="space-y-4">
                          <p className="text-sm text-slate-700">
                            Click the link below to schedule with {contact.name}:
                          </p>
                          <a
                            href={contact.schedulingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#2f829b] hover:bg-[#2f829b]/90 text-white rounded-xl transition-all text-base font-medium shadow-lg hover:shadow-xl"
                          >
                            <Calendar className="w-5 h-5" />
                            Open {contact.name}'s Scheduling Link
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <p className="text-xs text-slate-500 mt-2">
                            {contact.schedulingUrl}
                          </p>
                        </div>
                      ) : (
                        <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
                          {generatedDraft}
                        </pre>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {!isSchedulingTheirLink && (
                      <>
                        <button
                          onClick={handleGenerate}
                          className="flex-1 px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200/60 transition-gentle"
                        >
                          Regenerate
                        </button>
                        {onApplySuggestion && (
                          <button
                            onClick={handleApply}
                            className="flex-1 px-6 py-3 bg-[#5e2350] hover:bg-[#4a1c3e] text-white rounded-xl transition-gentle flex items-center justify-center gap-2"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                            Use This Draft
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 bg-white/60 border-t border-slate-200/60">
            <p className="text-sm text-slate-600 text-center">
              <span className="text-[#5e2350]">Jamie's doing the work:</span> 
              {isSchedulingTheirLink 
                ? ' Click the link to schedule your meeting.'
                : ' Review, edit, and make it your own.'}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
