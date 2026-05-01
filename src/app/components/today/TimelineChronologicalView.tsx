import React, { useState } from 'react';
import { Routine, Meeting } from './types';
import { MessageSquare, ExternalLink, ChevronDown, ChevronUp, GripVertical, ArrowDown, ArrowUp, CheckCircle2 } from 'lucide-react';
import { Sun, Mail, Smile, Utensils, Pencil, Lightbulb, Bike, Moon, Pin, Sprout, Sparkles, Calendar, Video, Plus } from 'lucide-react';
import { ContactBadge } from '../tasks/ContactBadge';

interface TimelineItem {
  id: string;
  type: 'routine' | 'meeting' | 'buffer';
  subtype?: 'medical' | 'virtual-medical' | 'regular';
  bufferType?: 'pre' | 'post'; // pre = before event, post = after event
  routine?: Routine;
  meeting?: Meeting;
  startTime: string;
  duration: number;
  name: string;
  isLocked?: boolean;
  contacts?: Array<{ id: string; name: string; color?: string }>;
  hasPrep?: boolean;
  hasCallLink?: boolean;
}

interface TimelineChronologicalViewProps {
  selectedRoutines: Routine[];
  meetings: Meeting[];
}

// Icon mapping for routines
const getRoutineIcon = (routineName: string) => {
  const iconClass = "w-5 h-5";
  
  switch (routineName) {
    case 'AM Plan My Day Wizard':
    case 'Plan My Day':
      return <Sun className={iconClass} />;
    case 'AM Admin':
    case 'PM Admin':
      return <Mail className={iconClass} />;
    case 'Break':
      return <Smile className={iconClass} />;
    case 'Lunch':
      return <Utensils className={iconClass} />;
    case 'Task Time':
      return <Pencil className={iconClass} />;
    case 'Professional Development':
      return <Lightbulb className={iconClass} />;
    case 'PT':
      return <Bike className={iconClass} />;
    case 'PM Wind Down Wizard':
      return <Moon className={iconClass} />;
    case 'Content':
      return <Pin className={iconClass} />;
    case 'Nurtures':
      return <Sprout className={iconClass} />;
    default:
      return <Sparkles className={iconClass} />;
  }
};

// Get meeting icon based on type
const getMeetingIcon = (subtype?: string) => {
  const iconClass = "w-5 h-5";
  
  if (subtype === 'medical') return <Plus className={iconClass} />;
  if (subtype === 'virtual-medical') return <Video className={iconClass} />;
  return <Calendar className={iconClass} />;
};

// Get color scheme based on item type
const getItemColors = (item: TimelineItem) => {
  if (item.type === 'buffer') {
    return {
      bg: 'bg-slate-200/40',
      border: 'border-slate-300/30',
      icon: 'bg-slate-300/50',
      iconColor: 'text-slate-500',
      text: 'text-slate-500',
      timeText: 'text-slate-400',
    };
  }
  
  if (item.type === 'meeting') {
    // Medical appointment - muted red
    if (item.subtype === 'medical') {
      return {
        bg: 'bg-white/90',
        border: 'border-[#c6686d]/30',
        icon: 'bg-[#c6686d]/20',
        iconColor: 'text-[#c6686d]',
        text: 'text-slate-800',
        timeText: 'text-slate-600',
      };
    }
    // Virtual medical - muted orange/peach
    if (item.subtype === 'virtual-medical') {
      return {
        bg: 'bg-white/90',
        border: 'border-[#e09470]/30',
        icon: 'bg-[#e09470]/20',
        iconColor: 'text-[#e09470]',
        text: 'text-slate-800',
        timeText: 'text-slate-600',
      };
    }
    // Regular meeting - muted blue
    return {
      bg: 'bg-white/90',
      border: 'border-[#6484a1]/30',
      icon: 'bg-[#6484a1]/20',
      iconColor: 'text-[#6484a1]',
      text: 'text-slate-800',
      timeText: 'text-slate-600',
    };
  }
  
  // Routines - muted lavender
  return {
    bg: 'bg-white/90',
    border: 'border-[#a89bb4]/30',
    icon: 'bg-[#a89bb4]/20',
    iconColor: 'text-[#a89bb4]',
    text: 'text-slate-800',
    timeText: 'text-slate-600',
  };
};

export function TimelineChronologicalView({ selectedRoutines, meetings }: TimelineChronologicalViewProps) {
  const [jamieInput, setJamieInput] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [items, setItems] = useState<TimelineItem[]>([
    {
      id: 'routine-1',
      type: 'routine',
      routine: { id: '1', name: 'Plan My Day', duration: 15 } as Routine,
      startTime: '11:00 AM',
      duration: 15,
      name: 'Plan My Day',
    },
    {
      id: 'routine-2',
      type: 'routine',
      routine: { id: '2', name: 'AM Admin', duration: 30 } as Routine,
      startTime: '11:15 AM',
      duration: 30,
      name: 'AM Admin',
    },
    {
      id: 'buffer-1',
      type: 'buffer',
      bufferType: 'pre',
      startTime: '11:45 AM',
      duration: 15,
      name: 'Mtg Prep',
    },
    {
      id: 'meeting-1',
      type: 'meeting',
      subtype: 'regular',
      meeting: meetings[0],
      startTime: '12:00 PM',
      duration: 30,
      name: 'Onboarding Meeting',
      isLocked: true,
      contacts: [{ id: 'c1', name: 'Mary Jane', color: '#6b7b98' }],
      hasPrep: true,
      hasCallLink: true,
    },
    {
      id: 'buffer-2',
      type: 'buffer',
      bufferType: 'post',
      startTime: '12:30 PM',
      duration: 15,
      name: 'Post-Mtg Notes',
    },
    {
      id: 'routine-3',
      type: 'routine',
      routine: { id: '3', name: 'Lunch', duration: 30 } as Routine,
      startTime: '12:00 PM',
      duration: 30,
      name: 'Lunch',
    },
    {
      id: 'buffer-3',
      type: 'buffer',
      bufferType: 'pre',
      startTime: '12:30 PM',
      duration: 45,
      name: 'Travel Time',
    },
    {
      id: 'meeting-2',
      type: 'meeting',
      subtype: 'medical',
      startTime: '1:15 PM',
      duration: 45,
      name: 'Medical Appt',
      isLocked: true,
    },
    {
      id: 'buffer-4',
      type: 'buffer',
      bufferType: 'post',
      startTime: '2:00 PM',
      duration: 45,
      name: 'Travel Time',
    },
  ]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [currentItemId, setCurrentItemId] = useState<string>('routine-1'); // First incomplete item

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetId) return;

    const draggedIndex = items.findIndex(item => item.id === draggedItem);
    const targetIndex = items.findIndex(item => item.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newItems = [...items];
    const [removed] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, removed);

    setItems(newItems);
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const toggleComplete = (itemId: string) => {
    const newCompleted = new Set(completedItems);
    if (newCompleted.has(itemId)) {
      newCompleted.delete(itemId);
    } else {
      newCompleted.add(itemId);
    }
    setCompletedItems(newCompleted);
    
    // Auto-advance current item to next incomplete item
    const nextIncomplete = items.find(item => !newCompleted.has(item.id));
    if (nextIncomplete) {
      setCurrentItemId(nextIncomplete.id);
    }
  };

  const handleContactClick = (contactId: string) => {
    console.log('Navigate to contact profile:', contactId);
    // TODO: Navigate to contact profile page
  };

  const handlePrepClick = (meetingId: string) => {
    console.log('Open prep notes for meeting:', meetingId);
    // TODO: Open prep notes modal or page
  };

  const handleCallLinkClick = (meetingLink: string) => {
    console.log('Open meeting link:', meetingLink);
    // TODO: Open meeting link in new tab
    window.open('https://meet.google.com/example', '_blank');
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <div className="space-y-6">
      {/* Day Overview */}
      <div className="rounded-3xl bg-gradient-to-br from-[#a89bb4]/5 to-[#c4a8b8]/5 border border-slate-200/50 p-6 backdrop-blur-sm">
        <h3 className="font-serif font-semibold text-slate-800 mb-2">Your Schedule</h3>
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-lg bg-[#a89bb4]"></div>
            <span className="text-slate-600">{timelineItems.filter(i => i.type === 'routine').length} Routines</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-lg bg-[#6b7b98]"></div>
            <span className="text-slate-600">{timelineItems.filter(i => i.type === 'meeting').length} Meetings</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-lg bg-slate-300"></div>
            <span className="text-slate-600">{timelineItems.filter(i => i.type === 'buffer').length} Buffers</span>
          </div>
        </div>
      </div>

      {/* Chronological Timeline */}
      <div className="rounded-3xl bg-white/60 backdrop-blur-sm border border-slate-200/50 shadow-gentle overflow-hidden">
        <div className="p-6 pb-4 border-b border-slate-200/50 bg-white/40">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-semibold text-slate-800">
              Timeline View
            </h3>
            <p className="text-xs text-slate-500">
              Chronological order with buffers
            </p>
          </div>
        </div>
        
        <div className="p-4 space-y-2 bg-white/20 overflow-auto" style={{ maxHeight: '600px' }}>
          {items.map((item) => {
            const colors = getItemColors(item);
            const isBuffer = item.type === 'buffer';
            const isMeeting = item.type === 'meeting';
            const isExpanded = expandedItems.has(item.id);
            const isCollapsible = isMeeting && item.contacts && item.contacts.length > 0;
            const isCompleted = completedItems.has(item.id);
            const isCurrent = currentItemId === item.id && !isCompleted;
            const isDragging = draggedItem === item.id;

            return (
              <div
                key={item.id}
                className={`
                  rounded-3xl transition-all backdrop-blur-sm border-2 relative
                  ${colors.bg} ${colors.border}
                  ${isBuffer ? 'py-3 px-5' : 'p-5'}
                  ${!item.isLocked && !isBuffer ? 'cursor-move hover:shadow-soft' : ''}
                  ${isBuffer ? '' : 'shadow-gentle'}
                  ${isCompleted ? 'opacity-50' : ''}
                  ${isCurrent ? 'ring-2 ring-[#a89bb4]/40 ring-offset-2' : ''}
                  ${isDragging ? 'opacity-30' : ''}
                  group
                `}
                draggable={!item.isLocked && !isBuffer}
                onDragStart={(e) => handleDragStart(e, item.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, item.id)}
                onDragEnd={handleDragEnd}
              >
                {/* Completion checkmark overlay */}
                {isCompleted && !isBuffer && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                )}

                {/* "Now" indicator for current item */}
                {isCurrent && !isBuffer && (
                  <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-3/4 bg-gradient-to-b from-[#a89bb4] to-[#c4a8b8] rounded-full animate-pulse" />
                )}

                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-2xl ${colors.icon} flex items-center justify-center flex-shrink-0 ${colors.iconColor}`}>
                    {isBuffer 
                      ? (item.bufferType === 'pre' ? <ArrowDown className="w-5 h-5" /> : <ArrowUp className="w-5 h-5" />)
                      : isMeeting 
                        ? getMeetingIcon(item.subtype) 
                        : getRoutineIcon(item.name)
                    }
                  </div>

                  {/* Time & Name */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className={`font-semibold ${isBuffer ? 'text-sm' : 'text-base'} ${colors.timeText} flex-shrink-0`}>
                      {item.startTime}
                    </span>
                    <span className={`font-semibold ${isBuffer ? 'text-sm' : 'text-base'} ${colors.text} truncate`}>
                      {item.name}
                    </span>
                    <span className={`${isBuffer ? 'text-sm' : 'text-base'} ${colors.timeText} flex-shrink-0`}>
                      ({item.duration}min)
                    </span>
                    
                    {/* Contact badge inline for meetings */}
                    {isMeeting && item.contacts && item.contacts.length > 0 && (
                      <div className="flex items-center gap-2">
                        {item.contacts.slice(0, 1).map((contact) => (
                          <ContactBadge
                            key={contact.id}
                            name={contact.name}
                            color={contact.color}
                            onClick={() => handleContactClick(contact.id)}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Expand/Collapse for meetings with details */}
                  {isCollapsible && (
                    <button
                      onClick={() => toggleExpand(item.id)}
                      className="w-8 h-8 rounded-xl bg-slate-100/50 hover:bg-slate-100 flex items-center justify-center transition-all flex-shrink-0"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-600" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-600" />
                      )}
                    </button>
                  )}

                  {/* Drag handle */}
                  {!item.isLocked && !isBuffer && (
                    <GripVertical className="w-5 h-5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  )}
                </div>

                {/* Expanded meeting details */}
                {isExpanded && isMeeting && (
                  <div className="mt-4 pt-4 border-t border-slate-200/50 flex items-center gap-3 flex-wrap">
                    {/* Contacts */}
                    {item.contacts && item.contacts.length > 0 && (
                      <div className="flex items-center gap-2">
                        {item.contacts.map((contact) => (
                          <div
                            key={contact.id}
                            className="px-3 py-1.5 rounded-full text-white text-sm font-medium"
                            style={{ backgroundColor: contact.color || '#6b7b98' }}
                            onClick={() => handleContactClick(contact.id)}
                          >
                            {contact.name}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Prep notes link */}
                    {item.hasPrep && (
                      <button 
                        onClick={() => handlePrepClick(item.id)}
                        className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-all flex items-center gap-1.5"
                      >
                        Mtg Prep Notes
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Call link */}
                    {item.hasCallLink && (
                      <button 
                        onClick={() => handleCallLinkClick('meeting-link')}
                        className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-all flex items-center gap-1.5"
                      >
                        Call Link
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Jamie Command Input */}
      <div className="rounded-3xl bg-white/60 backdrop-blur-sm border border-slate-200/50 shadow-gentle p-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#6b2358]/10 flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-5 h-5 text-[#6b2358]" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Ask Jamie to adjust
            </label>
            <input
              type="text"
              value={jamieInput}
              onChange={(e) => setJamieInput(e.target.value)}
              placeholder='e.g., "Move lunch to 1pm" or "Swap task time and professional development"'
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#6b2358]/20 text-sm transition-all"
            />
          </div>
        </div>
      </div>

      {/* Approve Button */}
      <button className="w-full py-4 px-6 rounded-2xl font-semibold bg-[#a89bb4] hover:bg-[#a89bb4]/90 text-white transition-all shadow-gentle hover:shadow-soft">
        Approve & Lock In Schedule →
      </button>
    </div>
  );
}