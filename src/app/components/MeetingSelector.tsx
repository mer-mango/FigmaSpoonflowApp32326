import React from 'react';
import { X, Calendar, Clock } from 'lucide-react';
import { CalendarEvent } from './CalendarPage';

interface MeetingSelectorProps {
  meetings: CalendarEvent[];
  onSelect: (meeting: CalendarEvent) => void;
  onClose: () => void;
}

export function MeetingSelector({ meetings, onSelect, onClose }: MeetingSelectorProps) {
  // Filter meetings for today
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  
  console.log('🔍 MeetingSelector Debug:', {
    totalMeetings: meetings.length,
    todayStart: todayStart.toISOString(),
    todayEnd: todayEnd.toISOString(),
    meetings: meetings.map(m => ({
      id: m.id,
      title: m.title,
      startTime: m.startTime instanceof Date ? m.startTime.toISOString() : m.startTime,
      endTime: m.endTime instanceof Date ? m.endTime.toISOString() : m.endTime
    }))
  });
  
  // Deduplicate meetings by ID first
  const uniqueMeetings = Array.from(
    new Map(meetings.map(m => [m.id, m])).values()
  );
  
  console.log(`📊 Deduplication: ${meetings.length} total → ${uniqueMeetings.length} unique meetings`);
  
  const todayMeetings = uniqueMeetings.filter(meeting => {
    if (!meeting.startTime) {
      console.log('  ❌ No startTime for meeting:', meeting.id);
      return false;
    }
    const meetingDate = new Date(meeting.startTime);
    const isToday = meetingDate >= todayStart && meetingDate < todayEnd;
    console.log(`  ${isToday ? '✅' : '❌'} Meeting "${meeting.title}" at ${meetingDate.toISOString()}`);
    return isToday;
  });
  
  console.log('📊 Filtered todayMeetings:', todayMeetings.length);

  // Format time
  const formatTime = (time: Date) => {
    if (!time) return '';
    const date = new Date(time);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  // Get contact name from meeting
  const getContactName = (meeting: CalendarEvent) => {
    return meeting.contact?.name || meeting.contactDetails?.name || null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-6">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-800" style={{ fontFamily: 'Lora, serif' }}>
              Select Meeting
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Choose which meeting to capture notes for
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Meeting List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {todayMeetings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No meetings scheduled for today</p>
            </div>
          ) : (
            todayMeetings.map((meeting) => {
              const contactName = getContactName(meeting);
              const startTime = formatTime(meeting.startTime);
              const endTime = formatTime(meeting.endTime);

              return (
                <button
                  key={meeting.id}
                  onClick={() => {
                    onSelect(meeting);
                    onClose();
                  }}
                  className="w-full text-left p-5 rounded-2xl border-2 border-slate-200 hover:border-[#2f829b] hover:bg-[#f5fafb] transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#2f829b]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#2f829b]/20 transition-colors">
                      <Calendar className="w-5 h-5 text-[#2f829b]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-800 mb-1">
                        {meeting.title || 'Untitled Meeting'}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          <span>{startTime} - {endTime}</span>
                        </div>
                        {contactName && (
                          <span className="text-slate-500">
                            with {contactName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}