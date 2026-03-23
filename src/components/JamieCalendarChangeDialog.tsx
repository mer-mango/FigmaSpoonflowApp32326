import { X, Calendar, Clock, AlertCircle, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { useState } from 'react';

export interface CalendarChange {
  id: string;
  type: 'new' | 'modified' | 'cancelled';
  meeting: {
    id: string;
    title: string;
    startTime: string; // HH:MM format
    endTime: string;   // HH:MM format
    date: string;      // YYYY-MM-DD format
  };
  previousTime?: {
    startTime: string;
    endTime: string;
  };
}

export interface TimeBlock {
  id: string;
  type: 'buffer' | 'focus' | 'meeting';
  title: string;
  startTime: string; // HH:MM format
  endTime: string;   // HH:MM format
  color?: string;
  meetingId?: string; // If type is 'meeting', link to the meeting
}

export interface ScheduleProposal {
  date: string;
  changes: CalendarChange[];
  currentBlocks: TimeBlock[];
  proposedBlocks: TimeBlock[];
  reason: string;
}

interface JamieCalendarChangeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: ScheduleProposal;
  onAccept: (acceptedBlocks: TimeBlock[]) => void;
  onReject: () => void;
}

export function JamieCalendarChangeDialog({
  isOpen,
  onClose,
  proposal,
  onAccept,
  onReject
}: JamieCalendarChangeDialogProps) {
  const [isAccepting, setIsAccepting] = useState(false);

  if (!isOpen) return null;

  const handleAccept = () => {
    setIsAccepting(true);
    setTimeout(() => {
      onAccept(proposal.proposedBlocks);
      setIsAccepting(false);
      onClose();
    }, 300);
  };

  const handleReject = () => {
    onReject();
    onClose();
  };

  const formatTime = (time: string) => {
    // Convert 24hr to 12hr format
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const getBlockColor = (type: string) => {
    switch (type) {
      case 'buffer':
        return 'bg-[#a8988f]/10 border-[#a8988f]/30 text-[#a8988f]';
      case 'focus':
        return 'bg-[#938aa9]/10 border-[#938aa9]/30 text-[#938aa9]';
      case 'meeting':
        return 'bg-[#6484a1]/10 border-[#6484a1]/30 text-[#6484a1]';
      default:
        return 'bg-slate-100 border-slate-300 text-slate-700';
    }
  };

  const getChangeIcon = (type: string) => {
    switch (type) {
      case 'new':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'modified':
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      case 'cancelled':
        return <X className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getChangeLabel = (type: string) => {
    switch (type) {
      case 'new':
        return 'New Meeting';
      case 'modified':
        return 'Time Changed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100000] p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-200/50 flex items-center justify-between bg-white/60 backdrop-blur-xl flex-shrink-0 rounded-t-3xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#938aa9]/10 flex items-center justify-center shadow-lg">
              <Sparkles className="w-7 h-7 text-[#938aa9]" />
            </div>
            <div>
              <h1 className="font-serif font-medium text-slate-800 text-2xl">Jamie Suggests Schedule Changes</h1>
              <p className="text-slate-600 text-sm">{formatDate(proposal.date)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-all"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {/* What Changed Section */}
          <div>
            <h2 className="font-medium text-slate-800 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#2f829b]" />
              Calendar Changes Detected
            </h2>
            <div className="space-y-3">
              {proposal.changes.map((change) => (
                <div
                  key={change.id}
                  className="bg-white/70 backdrop-blur-xl rounded-xl p-4 border border-slate-200/50 flex items-start gap-4"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white flex items-center justify-center border border-slate-200">
                    {getChangeIcon(change.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        {getChangeLabel(change.type)}
                      </span>
                    </div>
                    <p className="font-medium text-slate-800 mb-1">{change.meeting.title}</p>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      {change.type === 'modified' && change.previousTime ? (
                        <>
                          <span className="line-through text-slate-400">
                            {formatTime(change.previousTime.startTime)} - {formatTime(change.previousTime.endTime)}
                          </span>
                          <ArrowRight className="w-3 h-3" />
                          <span className="text-[#2f829b] font-medium">
                            {formatTime(change.meeting.startTime)} - {formatTime(change.meeting.endTime)}
                          </span>
                        </>
                      ) : change.type === 'cancelled' ? (
                        <span className="text-red-600">
                          Meeting cancelled: {formatTime(change.meeting.startTime)} - {formatTime(change.meeting.endTime)}
                        </span>
                      ) : (
                        <span>
                          {formatTime(change.meeting.startTime)} - {formatTime(change.meeting.endTime)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Jamie's Reasoning */}
          <div className="bg-gradient-to-br from-[#938aa9]/5 to-[#a8988f]/5 rounded-2xl p-6 border border-[#938aa9]/20">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#938aa9]/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#938aa9]" />
              </div>
              <div>
                <h3 className="font-medium text-slate-800 mb-2">Jamie's Suggestion</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{proposal.reason}</p>
              </div>
            </div>
          </div>

          {/* Schedule Comparison */}
          <div>
            <h2 className="font-medium text-slate-800 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#938aa9]" />
              Proposed Schedule Adjustments
            </h2>
            
            <div className="grid grid-cols-2 gap-6">
              {/* Current Schedule */}
              <div>
                <h3 className="text-sm font-medium text-slate-600 mb-3">Current Schedule</h3>
                <div className="space-y-2">
                  {proposal.currentBlocks.length === 0 ? (
                    <p className="text-sm text-slate-400 italic">No schedule blocks</p>
                  ) : (
                    proposal.currentBlocks.map((block) => (
                      <div
                        key={block.id}
                        className={`rounded-lg px-3 py-2 border ${getBlockColor(block.type)}`}
                      >
                        <div className="text-xs font-medium mb-0.5">{block.title}</div>
                        <div className="text-xs opacity-75">
                          {formatTime(block.startTime)} - {formatTime(block.endTime)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Proposed Schedule */}
              <div>
                <h3 className="text-sm font-medium text-slate-600 mb-3">Proposed Schedule</h3>
                <div className="space-y-2">
                  {proposal.proposedBlocks.map((block) => (
                    <div
                      key={block.id}
                      className={`rounded-lg px-3 py-2 border ${getBlockColor(block.type)}`}
                    >
                      <div className="text-xs font-medium mb-0.5">{block.title}</div>
                      <div className="text-xs opacity-75">
                        {formatTime(block.startTime)} - {formatTime(block.endTime)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-slate-200/50 flex items-center justify-between bg-white/60 backdrop-blur-xl flex-shrink-0 rounded-b-3xl">
          <p className="text-sm text-slate-500">
            These changes will only affect your internal schedule, not Google Calendar
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleReject}
              className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
            >
              Keep Current Schedule
            </button>
            <button
              onClick={handleAccept}
              disabled={isAccepting}
              className="px-6 py-3 rounded-xl bg-[#938aa9] hover:bg-[#938aa9]/90 text-white transition-all shadow-lg shadow-[#938aa9]/20 disabled:opacity-50 flex items-center gap-2"
            >
              {isAccepting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Applying...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Accept Jamie's Suggestion
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}