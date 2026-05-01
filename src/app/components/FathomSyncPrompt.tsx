import React, { useState } from 'react';
import { X, FileText, Clock, ChevronDown, Sparkles, Edit, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';

interface Meeting {
  id: string;
  title: string;
  contactName?: string;
  contactId?: string;
  startTime: string;
  endTime: string;
}

interface FathomSyncPromptProps {
  meeting: Meeting;
  onSyncAndStartWizard: (meeting: Meeting) => void;
  onSkipSyncAndStartWizard: (meeting: Meeting) => void;
  onDismissAndCreateMinimalInteraction: (meeting: Meeting) => void;
  onSnooze: (meeting: Meeting, minutes: number) => void;
  onClose: () => void;
}

export function FathomSyncPrompt({
  meeting,
  onSyncAndStartWizard,
  onSkipSyncAndStartWizard,
  onDismissAndCreateMinimalInteraction,
  onSnooze,
  onClose
}: FathomSyncPromptProps) {
  const [showSnoozeOptions, setShowSnoozeOptions] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#a8988f] to-[#938aa9] px-6 py-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-serif text-white mb-1">
                Meeting Just Ended
              </h2>
              <p className="text-white/80 text-sm">
                Would you like to capture notes?
              </p>
            </div>
          </div>
        </div>

        {/* Meeting Info */}
        <div className="px-6 pt-5 pb-4">
          <div className="bg-[#f7f7fb] rounded-2xl p-4 mb-5">
            <h3 className="font-semibold text-slate-800 mb-1">
              {meeting.title}
            </h3>
            {meeting.contactName && (
              <p className="text-sm text-slate-600">
                with {meeting.contactName}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Sync and Start Wizard */}
            <button
              onClick={() => onSyncAndStartWizard(meeting)}
              className="w-full flex items-center gap-3 px-4 py-3.5 bg-gradient-to-br from-[#a8988f] to-[#938aa9] text-white rounded-2xl hover:shadow-lg transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium">Sync and Start Wizard</div>
                <div className="text-xs text-white/80">Import Fathom notes & capture details</div>
              </div>
            </button>

            {/* Don't Sync and Start Wizard */}
            <button
              onClick={() => onSkipSyncAndStartWizard(meeting)}
              className="w-full flex items-center gap-3 px-4 py-3.5 bg-white border-2 border-slate-200 rounded-2xl hover:border-slate-300 hover:bg-slate-50 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-slate-200 transition-colors">
                <Edit className="w-5 h-5 text-slate-600" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-slate-800">Don't Sync and Start Wizard</div>
                <div className="text-xs text-slate-600">Capture notes manually</div>
              </div>
            </button>

            {/* Don't Sync and Dismiss */}
            <button
              onClick={() => onDismissAndCreateMinimalInteraction(meeting)}
              className="w-full flex items-center gap-3 px-4 py-3.5 bg-white border border-slate-200 rounded-2xl hover:border-slate-300 hover:bg-slate-50 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0 group-hover:bg-green-100 transition-colors">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-slate-800">Don't Sync and Dismiss Wizard</div>
                <div className="text-xs text-slate-600">Just log that meeting happened</div>
              </div>
            </button>

            {/* Snooze */}
            <div className="relative">
              <button
                onClick={() => setShowSnoozeOptions(!showSnoozeOptions)}
                className="w-full flex items-center gap-3 px-4 py-3.5 bg-white border border-slate-200 rounded-2xl hover:border-slate-300 hover:bg-slate-50 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-100 transition-colors">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-slate-800">Snooze</div>
                  <div className="text-xs text-slate-600">Remind me in a few minutes</div>
                </div>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showSnoozeOptions ? 'rotate-180' : ''}`} />
              </button>

              {/* Snooze Dropdown */}
              {showSnoozeOptions && (
                <div className="mt-2 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-lg">
                  {[5, 10, 15].map((minutes) => (
                    <button
                      key={minutes}
                      onClick={() => {
                        onSnooze(meeting, minutes);
                        setShowSnoozeOptions(false);
                      }}
                      className="w-full px-4 py-3 text-left text-slate-700 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
                    >
                      <span className="font-medium">{minutes} minutes</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer hint */}
        <div className="px-6 pb-5">
          <p className="text-xs text-slate-500 text-center">
            You can always add notes later from the contact's Interactions tab
          </p>
        </div>
      </div>
    </div>
  );
}
