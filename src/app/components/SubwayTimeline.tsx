import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Check, Plus, X, Pencil, Utensils, Pause, Bike, Calendar, CheckSquare, Pin, Sprout, Stethoscope, Activity, Book, Mail, Moon, RefreshCw, Settings, FileText } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { brandColors, activityColors, calendarColors, mutedRainbow } from '../lib/colors';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner';
import { useInteractions } from '../contexts/InteractionsContext';
import { MeetingNotesDossier, MeetingDossierData } from './MeetingNotesDossier';
import { ActivityNotification } from './ActivityNotification';
import { sortContactsByLastName } from '../utils/contactSorting';

// Activity types
type ActivityType = 'task' | 'content' | 'nurture' | 'break' | 'email' | 'pt' | 'professional-dev' | 'lunch' | 'wind-down' | 'custom' | 'meeting' | 'medical' | 'virtual';

interface TimelineActivity {
  id: string;
  type: ActivityType;
  title: string;
  startTime: string; // "09:00"
  duration: number; // minutes
  isCompleted: boolean;
  isJamieAdded?: boolean; // Auto-populated meetings
  customLabel?: string; // For custom type
  calendarEventId?: string; // Link to Google Calendar event
  manualContactName?: string; // Manually assigned contact name
  contactName?: string; // Contact name from enriched calendar event
  contactId?: string; // Contact ID for navigation
  contactColor?: string; // Contact color from enriched calendar event
  contactImageUrl?: string; // Contact avatar from enriched calendar event
  contactInitials?: string; // Contact initials for fallback display
}

// DEFAULT BUFFER CONFIGURATION
// All meetings get 15-minute prep buffers by default, except calendars in the exclusion list
const DEFAULT_BUFFER_CONFIG = { duration: 15, type: 'prep' as const };

// Calendar-specific buffer overrides (for medical appointments with travel time)
const CALENDAR_BUFFER_OVERRIDES: Record<string, { duration: number; type: 'prep' | 'travel' }> = {
  // Medical Appointments - 45 min travel buffers (before and after)
  'c_a180db3bb003b2be8eaebb1e9f7d6c347b424b9dd139e634de4962fa1329e5c5@group.calendar.google.com': { duration: 45, type: 'travel' },
};

// Calendars that should NOT have any buffers
const NO_BUFFER_CALENDARS = [
  'c_63de4d845029e69906675f62e92609302f7fbd4aea58aaa3da8834fb1e7e033c@group.calendar.google.com', // Gildergold Family
  'c_db8c7da6c97cceca59f02acc7b2f85d3bd4606dcf8e32e39a78149e74ca81ea1@group.calendar.google.com', // Common Grounds
  '3vdm7g8e0c8sr9l58nvgvi4jqv8jl1r5@import.calendar.google.com', // Life
  'c_c335af726b18d27166b2f36c1c5d9fbb1fd92649a49eacfc0816adf890038992@group.calendar.google.com', // Virtual Medical Appointments (no buffers needed for virtual)
  // Add CBC and other personal calendars here when you identify their IDs
];

interface SubwayTimelineProps {
  calendarEvents?: any[];
  onNavigateToContact?: (contactId: string) => void;
  contacts?: Array<{ id: string; name: string; color?: string; imageUrl?: string; initials?: string }>;
  onAssignContact?: (eventId: string, contactId: string | null) => Promise<void>;
  onCreateTask?: (task: any) => void; // Create task from action items
}

// Activity type configuration
const ACTIVITY_TYPES = [
  { type: 'task' as ActivityType, label: 'Tasks', color: '#c198ad' },
  { type: 'content' as ActivityType, label: 'Content', color: '#e2b7be' },
  { type: 'nurture' as ActivityType, label: 'Nurture', color: '#8fa790' },
  { type: 'break' as ActivityType, label: 'Break', color: '#dee1e7' },
  { type: 'email' as ActivityType, label: 'Email', color: mutedRainbow.dustyBlue },
  { type: 'pt' as ActivityType, label: 'PT', color: '#bcd1d5' },
  { type: 'professional-dev' as ActivityType, label: 'Professional Development', color: '#93738e' },
  { type: 'lunch' as ActivityType, label: 'Lunch', color: '#b0afa8' },
  { type: 'wind-down' as ActivityType, label: 'Wind Down', color: mutedRainbow.mauve },
  { type: 'custom' as ActivityType, label: 'Custom', color: mutedRainbow.mauve },
];

function getActivityColor(type: ActivityType): string {
  const config = ACTIVITY_TYPES.find(a => a.type === type);
  if (type === 'meeting') return '#6484a1';
  if (type === 'medical') return calendarColors.medical;
  if (type === 'virtual') return calendarColors.virtual;
  return config?.color || mutedRainbow.lavender;
}

function getActivityIcon(type: ActivityType) {
  const iconProps = { className: 'w-4 h-4 text-white' };
  switch (type) {
    case 'lunch':
      return <Utensils {...iconProps} />;
    case 'break':
      return <Pause {...iconProps} />;
    case 'pt':
      return <Bike {...iconProps} />;
    case 'meeting':
      return <Calendar {...iconProps} />;
    case 'task':
      return <CheckSquare {...iconProps} />;
    case 'content':
      return <Pin {...iconProps} />;
    case 'nurture':
      return <Sprout {...iconProps} />;
    case 'medical':
      return <Stethoscope {...iconProps} />;
    case 'virtual':
      return <Activity {...iconProps} />;
    case 'professional-dev':
      return <Book {...iconProps} />;
    case 'email':
      return <Mail {...iconProps} />;
    case 'wind-down':
      return <Moon {...iconProps} />;
    default:
      return null;
  }
}

// Add Activity Modal
function AddActivityModal({ 
  onClose, 
  onAdd, 
  insertAfterTime 
}: { 
  onClose: () => void; 
  onAdd: (activities: { type: ActivityType; duration: number; customLabel?: string }[], startTime: string) => void;
  insertAfterTime: string;
}) {
  const [selectedActivities, setSelectedActivities] = useState<{
    type: ActivityType;
    duration: string;
    customLabel?: string;
  }[]>([]);
  const [startTime, setStartTime] = useState(insertAfterTime);

  const toggleActivity = (type: ActivityType) => {
    const exists = selectedActivities.find(a => a.type === type);
    if (exists) {
      setSelectedActivities(selectedActivities.filter(a => a.type !== type));
    } else {
      setSelectedActivities([...selectedActivities, { type, duration: '' }]);
    }
  };

  const updateDuration = (type: ActivityType, duration: string) => {
    setSelectedActivities(
      selectedActivities.map(a => 
        a.type === type ? { ...a, duration } : a
      )
    );
  };

  const updateCustomLabel = (type: ActivityType, label: string) => {
    setSelectedActivities(
      selectedActivities.map(a => 
        a.type === type ? { ...a, customLabel: label } : a
      )
    );
  };

  const handleAdd = () => {
    const validActivities = selectedActivities
      .filter(a => a.duration && parseInt(a.duration) > 0)
      .map(a => ({
        type: a.type,
        duration: parseInt(a.duration),
        customLabel: a.customLabel
      }));
    
    if (validActivities.length > 0) {
      onAdd(validActivities, startTime);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Add Activities</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Select activities and set durations
          </p>
          
          {/* Start Time Input */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Time
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>

        {/* Activity List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {ACTIVITY_TYPES.map((activity) => {
            const isSelected = selectedActivities.some(a => a.type === activity.type);
            const selectedActivity = selectedActivities.find(a => a.type === activity.type);

            return (
              <div key={activity.type} className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleActivity(activity.type)}
                    className="w-4 h-4 rounded"
                    style={{ accentColor: activity.color }}
                  />
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: activity.color }}
                  />
                  <span className="font-medium text-gray-900 group-hover:text-gray-700">
                    {activity.label}
                  </span>
                </label>

                {isSelected && (
                  <div className="ml-11 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Minutes"
                        value={selectedActivity?.duration || ''}
                        onChange={(e) => updateDuration(activity.type, e.target.value)}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        min="1"
                      />
                      <span className="text-sm text-gray-500">minutes</span>
                    </div>
                    
                    {activity.type === 'custom' && (
                      <input
                        type="text"
                        placeholder="Custom label"
                        value={selectedActivity?.customLabel || ''}
                        onChange={(e) => updateCustomLabel(activity.type, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={selectedActivities.filter(a => a.duration && parseInt(a.duration) > 0).length === 0}
            className="flex-1 px-4 py-2 rounded-lg font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              backgroundColor: brandColors.primary,
              opacity: selectedActivities.filter(a => a.duration && parseInt(a.duration) > 0).length === 0 ? 0.5 : 1
            }}
          >
            Add Activities
          </button>
        </div>
      </div>
    </div>
  );
}

// Edit Activity Modal
function EditActivityModal({ 
  onClose, 
  onSave, 
  currentActivity
}: { 
  onClose: () => void; 
  onSave: (type: ActivityType, duration: number, startTime: string, customLabel?: string) => void;
  currentActivity: TimelineActivity;
}) {
  const [selectedType, setSelectedType] = useState<ActivityType>(currentActivity.type);
  const [duration, setDuration] = useState<string>(currentActivity.duration.toString());
  const [startTime, setStartTime] = useState<string>(currentActivity.startTime);
  const [customLabel, setCustomLabel] = useState<string>(currentActivity.customLabel || '');

  const handleSave = () => {
    const parsedDuration = parseInt(duration);
    if (parsedDuration > 0 && startTime) {
      onSave(selectedType, parsedDuration, startTime, selectedType === 'custom' ? customLabel : undefined);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Edit Activity</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Change activity type, start time, and duration
          </p>
        </div>

        {/* Activity Type Selection */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {ACTIVITY_TYPES.map((activity) => {
            const isSelected = selectedType === activity.type;

            return (
              <div key={activity.type} className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    checked={isSelected}
                    onChange={() => setSelectedType(activity.type)}
                    className="w-4 h-4"
                    style={{ accentColor: activity.color }}
                  />
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: activity.color }}
                  />
                  <span className="font-medium text-gray-900 group-hover:text-gray-700">
                    {activity.label}
                  </span>
                </label>
              </div>
            );
          })}

          {/* Start Time Input */}
          <div className="pt-4 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Time
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>

          {/* Duration Input */}
          <div className="pt-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Minutes"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                min="1"
              />
              <span className="text-sm text-gray-500">minutes</span>
            </div>
          </div>

          {/* Custom Label Input */}
          {selectedType === 'custom' && (
            <div className="pt-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Label
              </label>
              <input
                type="text"
                placeholder="Custom label"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!duration || parseInt(duration) <= 0 || !startTime}
            className="flex-1 px-4 py-2 rounded-lg font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              backgroundColor: brandColors.primary,
              opacity: (!duration || parseInt(duration) <= 0 || !startTime) ? 0.5 : 1
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// Timeline Activity Block
function TimelineBlock({ 
  activity, 
  onToggleComplete, 
  onDelete, 
  onUpdateDuration,
  onEdit,
  onRenameMeeting,
  onNavigateToContact,
  onOpenDossier,
  contacts,
  onAssignContact,
  showConnector = true,
  isCurrentActivity = false
}: { 
  activity: TimelineActivity; 
  onToggleComplete: () => void;
  onDelete: () => void;
  onUpdateDuration: (duration: number) => void;
  onEdit: () => void;
  onRenameMeeting?: (newTitle: string) => void;
  onNavigateToContact?: (contactId: string) => void;
  onOpenDossier?: (activity: TimelineActivity) => void;
  contacts?: Array<{ id: string; name: string; color?: string; imageUrl?: string; initials?: string }>;
  onAssignContact?: (eventId: string, contactId: string | null) => Promise<void>;
  showConnector?: boolean;
  isCurrentActivity?: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditingDuration, setIsEditingDuration] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [durationInput, setDurationInput] = useState(activity.duration.toString());
  const [titleInput, setTitleInput] = useState(activity.title);

  const color = getActivityColor(activity.type);
  const displayTitle = activity.customLabel || activity.title;

  const handleDurationSave = () => {
    const newDuration = parseInt(durationInput);
    if (newDuration > 0) {
      onUpdateDuration(newDuration);
    }
    setIsEditingDuration(false);
  };

  const handleTitleSave = () => {
    if (titleInput.trim() && onRenameMeeting) {
      onRenameMeeting(titleInput.trim());
    }
    setIsEditingTitle(false);
  };

  // Format time to 12-hour format
  const formatTime12Hour = (time24: string): string => {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Check if this is a meeting type (meeting, medical, or virtual)
  const isMeeting = activity.type === 'meeting' || activity.type === 'medical' || activity.type === 'virtual';
  
  // Check if this is a buffer (Meeting Prep, Post-Meeting Notes, Travel Time)
  const isBuffer = activity.isJamieAdded && activity.type === 'break' && 
    (activity.customLabel === 'Meeting Prep' || 
     activity.customLabel === 'Post-Meeting Notes' || 
     activity.customLabel === 'Travel Time');

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-4">
        {/* Time */}
        <div className="w-24 text-right pt-1.5">
          <span className={`text-base font-semibold ${
            isCurrentActivity 
              ? 'text-gray-900' 
              : isBuffer 
                ? 'text-gray-400' 
                : 'text-gray-700'
          }`}>
            {formatTime12Hour(activity.startTime)}
          </span>
        </div>

        {/* Circle + Connector */}
        <div className="relative flex flex-col items-center">
          {/* Pulsing ring for current activity */}
          {isCurrentActivity && (
            <div 
              className="absolute inset-0 w-10 h-10 rounded-full animate-pulse-ring"
              style={{ 
                boxShadow: '0 0 0 3px #6b235840'
              }}
            />
          )}
          
          {/* Circle */}
          <button
            onClick={onToggleComplete}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 relative z-10 ${
              isCurrentActivity ? 'ring-2 ring-[#6b2358] ring-offset-2' : ''
            }`}
            style={{ 
              backgroundColor: color,
              opacity: activity.isCompleted ? 0.6 : 1
            }}
          >
            {activity.isCompleted ? (
              <Check className="w-5 h-5 text-white" strokeWidth={3} />
            ) : (
              getActivityIcon(activity.type)
            )}
          </button>

          {/* Vertical Connector */}
          {showConnector && (
            <div 
              className="w-0.5 h-16 -mt-1"
              style={{ backgroundColor: `${color}40` }}
            />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 pb-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {isEditingTitle ? (
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleTitleSave();
                    if (e.key === 'Escape') {
                      setTitleInput(activity.title);
                      setIsEditingTitle(false);
                    }
                  }}
                  className="text-lg font-semibold text-gray-900 px-2 py-1 border border-gray-300 rounded w-full max-w-md"
                  autoFocus
                />
              ) : (
                <button
                  onClick={() => {
                    if (isMeeting && activity.isJamieAdded) {
                      setIsEditingTitle(true);
                    } else if (!activity.isJamieAdded) {
                      onEdit();
                    }
                  }}
                  disabled={!isMeeting && activity.isJamieAdded}
                  className={`text-left group/title ${
                    (isMeeting && activity.isJamieAdded) || !activity.isJamieAdded 
                      ? 'cursor-pointer' 
                      : 'cursor-default'
                  }`}
                >
                  <h4 
                    className={`text-lg font-semibold inline-flex items-center gap-2 ${
                      activity.isCompleted 
                        ? 'line-through opacity-60' 
                        : isBuffer 
                          ? 'text-gray-400' 
                          : 'text-gray-900'
                    }`}
                  >
                    {displayTitle}
                    {((isMeeting && activity.isJamieAdded) || !activity.isJamieAdded) && isHovered && (
                      <Pencil className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover/title:opacity-100 transition-opacity" />
                    )}
                  </h4>
                </button>
              )}
              <div className="flex items-center gap-2 mt-1.5">
                {isEditingDuration ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={durationInput}
                      onChange={(e) => setDurationInput(e.target.value)}
                      onBlur={handleDurationSave}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleDurationSave();
                        if (e.key === 'Escape') {
                          setDurationInput(activity.duration.toString());
                          setIsEditingDuration(false);
                        }
                      }}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                      autoFocus
                      min="1"
                    />
                    <span className="text-sm text-gray-500">min</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditingDuration(true)}
                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                  >
                    {activity.duration}m
                    {isHovered && <Pencil className="w-3 h-3" />}
                  </button>
                )}
                {/* Contact badge - avatar with contact info */}
                {isMeeting && !isEditingContact && activity.contactName && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => activity.contactId && onNavigateToContact && onNavigateToContact(activity.contactId)}
                      className="flex items-center gap-1.5 hover:bg-gray-100 rounded-full pr-2 transition-colors"
                      disabled={!activity.contactId || !onNavigateToContact}
                    >
                      <Avatar className="w-5 h-5">
                        {activity.contactImageUrl ? (
                          <img src={activity.contactImageUrl} alt={activity.contactName} className="w-full h-full object-cover" />
                        ) : (
                          <AvatarFallback 
                            className="text-[10px] font-medium"
                            style={{ 
                              backgroundColor: activity.contactColor || '#6b7b98',
                              color: 'white'
                            }}
                          >
                            {activity.contactInitials || activity.contactName?.slice(0, 2).toUpperCase() || '?'}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <span className="text-xs text-gray-700">{activity.contactName}</span>
                    </button>
                    {isHovered && onAssignContact && activity.calendarEventId && (
                      <button
                        onClick={() => setIsEditingContact(true)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                        title="Change contact"
                      >
                        <Pencil className="w-3 h-3 text-gray-600" />
                      </button>
                    )}
                  </div>
                )}
                
                {/* "+ Contact" button when no contact assigned */}
                {isMeeting && !isEditingContact && !activity.contactName && onAssignContact && activity.calendarEventId && (
                  <button
                    onClick={() => setIsEditingContact(true)}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Contact</span>
                  </button>
                )}
                
                {/* Contact selector - show when editing */}
                {isMeeting && isEditingContact && activity.calendarEventId && onAssignContact && contacts && (
                  <div className="flex items-center gap-2">
                    <select
                      value={activity.contactId || ''}
                      onChange={async (e) => {
                        const contactId = e.target.value || null;
                        if (activity.calendarEventId && onAssignContact) {
                          await onAssignContact(activity.calendarEventId, contactId);
                          setIsEditingContact(false);
                        }
                      }}
                      className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    >
                      <option value="">Select contact...</option>
                      {sortContactsByLastName(contacts).map(contact => (
                        <option key={contact.id} value={contact.id}>{contact.name}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => setIsEditingContact(false)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                      title="Cancel"
                    >
                      <X className="w-3 h-3 text-gray-600" />
                    </button>
                  </div>
                )}
              </div>
              
              {/* Meeting dossier link - show for meetings only */}
              {isMeeting && activity.calendarEventId && onOpenDossier && (
                <button
                  onClick={() => onOpenDossier(activity)}
                  className="flex items-center gap-1.5 text-xs text-[#8ba5a8] hover:text-[#6b7b98] transition-colors mt-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>See notes dossier</span>
                </button>
              )}
            </div>

            {/* Delete button */}
            {!activity.isJamieAdded && isHovered && (
              <button
                onClick={onDelete}
                className="p-1 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-red-500" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Add button between blocks (more subtle design)
function AddButton({ onClick, time, beforeTime }: { onClick: () => void; time: string; beforeTime?: string }) {
  const [isHovered, setIsHovered] = useState(false);

  // Format time to 12-hour format
  const formatTime12Hour = (time24: string): string => {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Format duration in a human-readable way
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0 && mins > 0) {
      return `${hours}h${mins}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}m`;
    }
  };

  // Calculate available time between afterTime and beforeTime
  const getAvailableTime = (): string | null => {
    if (!beforeTime) return null;
    
    // Special cases
    if (time === 'start of day' || time === 'end of day') {
      const startMinutes = time === 'start of day' ? timeToMinutes('07:00') : timeToMinutes(time);
      const endMinutes = timeToMinutes(beforeTime);
      const duration = endMinutes - startMinutes;
      if (duration > 0) {
        return `${formatDuration(duration)} available until ${formatTime12Hour(beforeTime)}`;
      }
      return null;
    }
    
    // Normal case - afterTime is an actual time
    const endMinutes = timeToMinutes(beforeTime);
    const startMinutes = timeToMinutes(time);
    const duration = endMinutes - startMinutes;
    
    if (duration > 0) {
      return `${formatDuration(duration)} available until ${formatTime12Hour(beforeTime)}`;
    }
    return null;
  };

  // Check if time is a special label (start/end of day) or actual time
  const displayTime = (time === 'start of day' || time === 'end of day') 
    ? time 
    : formatTime12Hour(time);

  const availableTime = getAvailableTime();

  return (
    <div 
      className="flex items-center gap-4 py-3"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Empty time column */}
      <div className="w-24" />
      
      {/* Plus button - same width as activity circle */}
      <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
        <button
          onClick={onClick}
          className="w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-125"
          style={{ 
            backgroundColor: isHovered ? '#d1d5db' : '#f3f4f6',
            border: `1.5px dashed ${isHovered ? '#9ca3af' : '#d1d5db'}`
          }}
        >
          <Plus className="w-3.5 h-3.5" style={{ color: isHovered ? '#6b7280' : '#9ca3af' }} />
        </button>
      </div>
      
      {/* Label on hover */}
      <div className="flex-1">
        {isHovered && (
          <span className="text-xs text-gray-400">
            Add activity after {displayTime}
            {availableTime && <span className="font-medium text-gray-500"> ({availableTime})</span>}
          </span>
        )}
      </div>
    </div>
  );
}

function getActivityLabel(type: ActivityType): string {
  const config = ACTIVITY_TYPES.find(a => a.type === type);
  return config?.label || type;
}

// Helper to convert time string to minutes
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// Helper to convert minutes to time string
function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Memoize the component to prevent unnecessary re-renders
const SubwayTimelineComponent = ({ calendarEvents = [], onNavigateToContact, contacts = [], onAssignContact, onCreateTask }: SubwayTimelineProps) => {
  // Demo data showing all activity types with realistic chronological times
  const [activities, setActivities] = useState<TimelineActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [insertAfterTime, setInsertAfterTime] = useState<string>('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<TimelineActivity | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Meeting dossier modal state
  const [showDossierModal, setShowDossierModal] = useState(false);
  const [selectedMeetingForDossier, setSelectedMeetingForDossier] = useState<TimelineActivity | null>(null);
  
  // Notification state
  const [activeNotification, setActiveNotification] = useState<TimelineActivity | null>(null);
  const notifiedActivitiesRef = React.useRef<Set<string>>(new Set());
  const [notificationsPermission, setNotificationsPermission] = useState<NotificationPermission>('default');
  
  // Use ref to track synced events (doesn't trigger re-renders)
  const lastSyncedEventIdsRef = React.useRef<string>('');
  const lastSyncedDateRef = React.useRef<string>(''); // Track the last synced date
  const isSyncingRef = React.useRef<boolean>(false);
  
  // Get interactions context
  const { getDossierByMeetingId, updateDossier } = useInteractions();

  // Load activities from localStorage first, then backend on mount
  useEffect(() => {
    const loadActivities = async () => {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      
      // FIRST: Try localStorage (primary storage)
      try {
        const localData = localStorage.getItem('timeline_activities');
        if (localData) {
          const parsed = JSON.parse(localData);
          if (parsed.date === today && Array.isArray(parsed.activities)) {
            console.log('✅ Loaded timeline from localStorage:', parsed.activities.length, 'activities');
            setActivities(parsed.activities);
            setIsLoading(false);
            return; // Success! Don't need to check backend
          } else {
            console.log('🗓️ LocalStorage activities are from', parsed.date, '- clearing for new day');
          }
        }
      } catch (error) {
        console.warn('⚠️ Failed to load from localStorage:', error);
      }
      
      // SECOND: Try backend as fallback
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-a89809a8/kv/timeline_activities`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          
          if (data.value && typeof data.value === 'object' && data.value.date && Array.isArray(data.value.activities)) {
            // Check if saved activities are from today
            if (data.value.date === today) {
              console.log('✅ Loaded timeline from backend:', data.value.activities.length, 'activities');
              setActivities(data.value.activities);
            } else {
              console.log('🗓️ Backend activities are from', data.value.date, '- clearing for new day');
              setActivities([]);
            }
          } else {
            console.log('Starting with empty timeline');
            setActivities([]);
          }
        } else {
          console.log('Server returned error, starting fresh');
          setActivities([]);
        }
      } catch (error) {
        console.log('Using empty timeline (backend not available)');
        setActivities([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadActivities();
  }, []);

  // Sync calendar events into activities
  useEffect(() => {
    console.log('🔵 [SubwayTimeline] useEffect triggered', {
      calendarEventsCount: calendarEvents?.length,
      isLoading
    });
    
    if (isLoading) return;

    // Create a unique fingerprint of calendar events to detect changes
    // IMPORTANT: Include today's date so activities clear when day changes
    // IMPORTANT: Include contact ID to detect contact assignment changes
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const eventFingerprint = `${today}|${(calendarEvents || [])
      .map(e => `${e.id}-${e.title}-${e.startTime}-${e.endTime}-${e.contactDetails?.id || e.contact?.id || 'none'}`)
      .sort()
      .join('|')}`;

    console.log('🔍 [SubwayTimeline] Fingerprint check:', {
      currentFull: eventFingerprint,
      previousFull: lastSyncedEventIdsRef.current || '',
      isMatch: eventFingerprint === lastSyncedEventIdsRef.current,
      calendarEventsCount: calendarEvents?.length || 0,
      allEventContactIds: (calendarEvents || []).map(e => ({ 
        id: e.id?.substring(0, 10),
        title: e.title, 
        contactId: e.contactDetails?.id || e.contact?.id,
        contactName: e.contactDetails?.name || e.contact?.name
      }))
    });

    // Skip sync if events haven't changed
    if (eventFingerprint === lastSyncedEventIdsRef.current && today === lastSyncedDateRef.current) {
      console.log('⏭️ [SubwayTimeline] Skipping sync - fingerprint matches');
      return; // Silent skip - no logs to avoid console spam
    }

    console.log('🔄 [SubwayTimeline] Syncing calendar events:', calendarEvents?.length || 0);
    console.log('  📅 Today:', today);
    
    // Check if date changed BEFORE updating the ref
    const dateChanged = today !== lastSyncedDateRef.current && lastSyncedDateRef.current !== '';
    
    lastSyncedEventIdsRef.current = eventFingerprint; // Update fingerprint
    lastSyncedDateRef.current = today; // Update last synced date

    // Convert calendar events to timeline activities WITH appropriate buffers based on calendar type
    // Note: calendarEvents are already transformed with startTime/endTime as Date objects
    const meetingActivitiesWithBuffers: TimelineActivity[] = [];
    
    // Deduplicate calendar events by ID AND filter out demo data to prevent notifications for fake events
    const uniqueEvents = new Map<string, typeof calendarEvents[0]>();
    (calendarEvents || []).forEach(event => {
      // Skip demo data events - they should never create timeline activities or trigger notifications
      if (event?.isDemoData) {
        return;
      }
      if (event?.id && !uniqueEvents.has(event.id)) {
        uniqueEvents.set(event.id, event);
      }
    });
    const deduplicatedEvents = Array.from(uniqueEvents.values());
    
    const demoEventsCount = (calendarEvents || []).filter(e => e?.isDemoData).length;
    const duplicatesCount = (calendarEvents || []).length - deduplicatedEvents.length - demoEventsCount;
    
    if (demoEventsCount > 0) {
      console.log(`🚫 Filtered out ${demoEventsCount} demo calendar events (no notifications will be created)`);
    }
    if (duplicatesCount > 0) {
      console.log(`✅ Removed ${duplicatesCount} duplicate calendar event(s) - deduplication working correctly`);
    }
    
    // Log unique calendar IDs to help with configuration
    const uniqueCalendarIds = new Set<string>();
    deduplicatedEvents.forEach(event => {
      if (event?.calendarId) {
        uniqueCalendarIds.add(event.calendarId);
      }
    });
    
    if (uniqueCalendarIds.size > 0) {
      console.log('📋 Calendar Buffer Configuration:');
      uniqueCalendarIds.forEach(id => {
        const eventWithThisId = deduplicatedEvents.find(e => e.calendarId === id);
        const calendarName = eventWithThisId?.calendarName || 'Unknown';
        const isExcluded = NO_BUFFER_CALENDARS.includes(id);
        const override = CALENDAR_BUFFER_OVERRIDES[id];
        
        if (isExcluded) {
          console.log(`  - "${calendarName}": ${id} ❌ EXCLUDED (no buffers)`);
        } else if (override) {
          console.log(`  - "${calendarName}": ${id} ✅ OVERRIDE (${override.duration}min ${override.type} buffers)`);
        } else {
          console.log(`  - "${calendarName}": ${id} ✅ DEFAULT (15min prep buffers)`);
        }
      });
    }
    
    deduplicatedEvents
      .filter(event => event?.startTime && event?.endTime) // Use transformed format (not start.dateTime)
      .forEach(event => {
        const startDate = new Date(event.startTime); // Already a Date or can be converted
        const endDate = new Date(event.endTime);
        const startTime = `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`;
        const duration = Math.round((endDate.getTime() - startDate.getTime()) / 60000); // minutes
        
        // Determine buffer configuration based on calendar ID
        const calendarId = event.calendarId || '';
        
        // Check if this calendar is excluded from buffers
        const isExcluded = NO_BUFFER_CALENDARS.includes(calendarId);
        
        // Get buffer config: override, default, or none if excluded
        let bufferConfig = null;
        if (!isExcluded) {
          bufferConfig = CALENDAR_BUFFER_OVERRIDES[calendarId] || DEFAULT_BUFFER_CONFIG;
        }
        
        let needsBuffers = bufferConfig !== null;
        let bufferDuration = bufferConfig?.duration || 0;
        let bufferType: 'prep' | 'travel' = bufferConfig?.type || 'prep';
        let meetingType: ActivityType = 'meeting';
        
        // Determine meeting type based on calendar ID
        if (calendarId === 'c_c335af726b18d27166b2f36c1c5d9fbb1fd92649a49eacfc0816adf890038992@group.calendar.google.com') {
          // Virtual Medical Appointments
          meetingType = 'virtual';
        } else if (calendarId === 'c_a180db3bb003b2be8eaebb1e9f7d6c347b424b9dd139e634de4962fa1329e5c5@group.calendar.google.com') {
          // Medical Appointments (in-person with travel)
          meetingType = 'medical';
        } else if (needsBuffers) {
          // Standard meetings with prep buffers
          meetingType = 'meeting';
        }

        console.log(`  📅 "${event.calendarName || 'Unknown'}": "${event.title}" at ${startTime} for ${duration}min${needsBuffers ? ` with ${bufferDuration}min ${bufferType} buffers` : ' (no buffers)'}`);

        // Calculate buffer times
        const startMinutes = timeToMinutes(startTime);
        const prepStartMinutes = startMinutes - bufferDuration;
        const postStartMinutes = startMinutes + duration;
        
        // Add pre-meeting buffer if needed (if not too early in the day)
        if (needsBuffers && prepStartMinutes >= 360) { // Don't add buffers before 6:00 AM
          const bufferTitle = bufferType === 'travel' 
            ? `Travel to: ${event.title || 'Appointment'}`
            : `Prep: ${event.title || 'Meeting'}`;
          const bufferLabel = bufferType === 'travel' ? 'Travel Time' : 'Meeting Prep';
          
          meetingActivitiesWithBuffers.push({
            id: `prep-${event.id}`,
            type: 'break' as ActivityType,
            title: bufferTitle,
            startTime: minutesToTime(prepStartMinutes),
            duration: bufferDuration,
            isCompleted: false,
            isJamieAdded: true,
            customLabel: bufferLabel
          });
        }

        // Add the actual meeting
        meetingActivitiesWithBuffers.push({
          id: event.id,
          type: meetingType,
          title: event.title || 'Meeting',
          startTime,
          duration,
          isCompleted: false,
          isJamieAdded: true,
          calendarEventId: event.id,
          contactName: event.contact?.name || event.contactName,
          contactId: event.contactDetails?.id || event.contactId,
          contactColor: event.contactDetails?.color || event.contactColor,
          contactImageUrl: event.contactDetails?.imageUrl || event.contactImageUrl,
          contactInitials: event.contactDetails?.initials || event.contactInitials
        });

        // Add post-meeting buffer if needed (if not too late in the day)
        if (needsBuffers && postStartMinutes + bufferDuration <= 1380) { // Don't add buffers after 11:00 PM
          const bufferTitle = bufferType === 'travel'
            ? `Travel from: ${event.title || 'Appointment'}`
            : `Post-Meeting Notes: ${event.title || 'Meeting'}`;
          const bufferLabel = bufferType === 'travel' ? 'Travel Time' : 'Post-Meeting Notes';
          
          meetingActivitiesWithBuffers.push({
            id: `post-${event.id}`,
            type: 'break' as ActivityType,
            title: bufferTitle,
            startTime: minutesToTime(postStartMinutes),
            duration: bufferDuration,
            isCompleted: false,
            isJamieAdded: true,
            customLabel: bufferLabel
          });
        }
      });

    console.log(`  ✅ Converted ${deduplicatedEvents.length} calendar events to ${meetingActivitiesWithBuffers.length} activities (with appropriate buffers)`);

    // Merge with existing activities
    setActivities(prev => {
      // If the date changed, clear everything and start fresh
      if (dateChanged) {
        console.log(`  🗓️ Date changed - clearing all activities and starting fresh`);
        // Only keep Jamie-added activities from today's calendar events
        const combined = [...meetingActivitiesWithBuffers];
        combined.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
        return combined;
      } else {
        // Same day - keep manual activities, replace Jamie-added ones
        const manualActivities = prev.filter(a => !a.isJamieAdded);
        
        console.log(`  🔧 Keeping ${manualActivities.length} manual activities, adding ${meetingActivitiesWithBuffers.length} Jamie-added activities`);
        
        // Preserve isCompleted status from previous Jamie-added activities
        const previousCompletionStatus = new Map(
          prev.filter(a => a.isJamieAdded).map(a => [a.id, a.isCompleted])
        );
        
        const updatedMeetingActivities = meetingActivitiesWithBuffers.map(activity => {
          const wasCompleted = previousCompletionStatus.get(activity.id);
          return wasCompleted !== undefined ? { ...activity, isCompleted: wasCompleted } : activity;
        });
        
        // Combine and sort by time
        const combined = [...manualActivities, ...updatedMeetingActivities];
        combined.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
        
        return combined;
      }
    });
  }, [calendarEvents, isLoading]);

  // Auto-save activities to localStorage and backend when they change
  React.useEffect(() => {
    if (isLoading) return; // Don't save while loading

    const saveActivities = async () => {
      const today = new Date().toISOString().split('T')[0];
      const dataToSave = { date: today, activities };
      
      // ALWAYS save to localStorage first (primary storage)
      try {
        localStorage.setItem('timeline_activities', JSON.stringify(dataToSave));
        console.log('💾 Timeline activities saved to localStorage');
      } catch (error) {
        console.error('❌ Failed to save to localStorage:', error);
      }
      
      // ALSO try to save to backend (secondary backup)
      if (!projectId || !publicAnonKey) {
        console.log('⚠️ Supabase credentials not available, skipping backend save');
        return;
      }
      
      // Check data size to avoid WORKER_LIMIT errors
      const dataSize = JSON.stringify(dataToSave).length;
      const MAX_BACKUP_SIZE = 200000; // 200KB limit for backend backup
      
      if (dataSize > MAX_BACKUP_SIZE) {
        console.warn(`⚠️ Timeline data too large (${(dataSize / 1024).toFixed(1)}KB), skipping backend backup. localStorage is your primary storage.`);
        return;
      }
      
      try {
        const url = `https://${projectId}.supabase.co/functions/v1/make-server-a89809a8/kv/timeline_activities`;
        
        const response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ value: dataToSave })
        });
        
        if (!response.ok) {
          // Only log warnings for non-404/503 responses (404 = not configured, 503 = service unavailable)
          if (response.status !== 404 && response.status !== 503) {
            const errorData = await response.json().catch(() => ({}));
            // Only log warning if it's not a WORKER_LIMIT error (which we prevent with size check)
            if (errorData.code !== 'WORKER_LIMIT') {
              console.warn('⚠️ Timeline backup failed (localStorage still safe):', errorData);
            }
          }
        } else {
          console.log('✅ Timeline activities also backed up to cloud');
        }
      } catch (error) {
        // Silently handle network errors - localStorage is primary storage
      }
    };

    // Debounce saves to avoid too many requests
    const timeoutId = setTimeout(saveActivities, 1000);
    return () => clearTimeout(timeoutId);
  }, [activities, isLoading]);

  // Update current time every minute
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Request notification permission on mount
  React.useEffect(() => {
    // Skip in Figma editor environment to avoid iframe issues
    if (window.location.hostname.includes('figma.com')) {
      return;
    }
    
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        setNotificationsPermission(permission);
        if (permission === 'granted') {
          console.log('✅ Browser notifications enabled');
        }
      }).catch((error) => {
        console.warn('Notification permission request failed:', error);
      });
    } else if ('Notification' in window) {
      setNotificationsPermission(Notification.permission);
    }
  }, []);

  // Check for activities starting and trigger notifications
  React.useEffect(() => {
    const checkAndNotify = () => {
      const now = new Date();
      const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      activities.forEach((activity) => {
        // Check if this activity is starting now (within the current minute)
        if (activity.startTime === currentTimeStr && !notifiedActivitiesRef.current.has(activity.id)) {
          // Mark as notified
          notifiedActivitiesRef.current.add(activity.id);
          
          // Format notification content
          const timeFormatted = new Date(`2000-01-01T${activity.startTime}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          });
          
          const notificationTitle = `${timeFormatted} ${activity.title}`;
          const notificationBody = `(${activity.duration}m)\nstarting now`;
          
          // Show in-app notification
          setActiveNotification(activity);
          
          // Show desktop notification if permission granted (skip in Figma editor)
          if (notificationsPermission === 'granted' && !window.location.hostname.includes('figma.com')) {
            try {
              const notification = new Notification(notificationTitle, {
                body: notificationBody,
                icon: '/favicon.ico',
                requireInteraction: true, // Keeps notification visible until dismissed
                tag: `activity-${activity.id}`, // Prevents duplicates
              });
              
              // Auto-close desktop notification when user clicks it
              notification.onclick = () => {
                notification.close();
                window.focus();
              };
            } catch (error) {
              console.error('Failed to show desktop notification:', error);
            }
          }
          
          console.log(`🔔 Notification triggered for: ${activity.title} at ${timeFormatted}`);
        }
      });
    };

    // Check immediately
    checkAndNotify();
    
    // Check every 30 seconds for better accuracy
    const interval = setInterval(checkAndNotify, 30000);

    return () => clearInterval(interval);
  }, [activities, notificationsPermission]); // Removed currentTime - it's not used in checkAndNotify()

  // Reset notified activities when date changes (new day)
  React.useEffect(() => {
    const checkDateChange = () => {
      const today = new Date().toDateString();
      const lastDate = localStorage.getItem('lastNotificationDate');
      
      if (lastDate !== today) {
        notifiedActivitiesRef.current.clear();
        localStorage.setItem('lastNotificationDate', today);
      }
    };
    
    // Check on mount
    checkDateChange();
    
    // Check every minute (aligned with currentTime updates)
    const interval = setInterval(checkDateChange, 60000);
    
    return () => clearInterval(interval);
  }, []); // Empty dependency array - runs once and sets up interval

  // Format today's date
  const todayFormatted = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  // Check if an activity is currently happening
  const isActivityHappeningNow = (activity: TimelineActivity): boolean => {
    const now = currentTime;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const activityStartMinutes = timeToMinutes(activity.startTime);
    const activityEndMinutes = activityStartMinutes + activity.duration;
    
    return currentMinutes >= activityStartMinutes && currentMinutes < activityEndMinutes;
  };

  // Calculate time gaps between activities
  const calculateTimeGaps = () => {
    const DAY_START = '07:00'; // 7 AM
    const DAY_END = '23:59';   // 11:59 PM (no time limit on timeline)
    const gaps: Array<{ afterTime: string; beforeTime: string; label: string }> = [];

    // Sort activities by time
    const sortedActivities = [...activities].sort((a, b) => 
      timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
    );

    // Gap at start of day
    if (sortedActivities.length === 0 || timeToMinutes(sortedActivities[0].startTime) > timeToMinutes(DAY_START)) {
      gaps.push({
        afterTime: DAY_START,
        beforeTime: sortedActivities[0]?.startTime || DAY_END,
        label: 'start of day'
      });
    }

    // Gaps between activities
    for (let i = 0; i < sortedActivities.length - 1; i++) {
      const currentActivity = sortedActivities[i];
      const nextActivity = sortedActivities[i + 1];
      
      const currentEndMinutes = timeToMinutes(currentActivity.startTime) + currentActivity.duration;
      const currentEndTime = minutesToTime(currentEndMinutes);
      const nextStartMinutes = timeToMinutes(nextActivity.startTime);
      
      // If there's a gap of at least 15 minutes
      if (nextStartMinutes - currentEndMinutes >= 15) {
        gaps.push({
          afterTime: currentActivity.startTime,
          beforeTime: nextActivity.startTime,
          label: currentEndTime
        });
      }
    }

    // Gap at end of day
    if (sortedActivities.length > 0) {
      const lastActivity = sortedActivities[sortedActivities.length - 1];
      const lastEndMinutes = timeToMinutes(lastActivity.startTime) + lastActivity.duration;
      const lastEndTime = minutesToTime(lastEndMinutes);
      
      if (timeToMinutes(DAY_END) - lastEndMinutes >= 15) {
        gaps.push({
          afterTime: lastActivity.startTime,
          beforeTime: DAY_END,
          label: 'end of day'
        });
      }
    }

    return gaps;
  };

  const timeGaps = calculateTimeGaps();

  // Sort activities by time for display
  const sortedActivities = [...activities].sort((a, b) => 
    timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );

  // Calculate time after an activity
  const calculateEndTime = (startTime: string, duration: number): string => {
    // Validate and ensure startTime is a string in HH:MM format
    if (!startTime || typeof startTime !== 'string') {
      startTime = '09:00';
    }
    
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
  };

  const handleAddActivities = (newActivities: { type: ActivityType; duration: number; customLabel?: string }[], startTime: string) => {
    let currentTime = startTime;

    const activitiesToAdd: TimelineActivity[] = newActivities.map((act, index) => {
      const activity: TimelineActivity = {
        id: `activity-${Date.now()}-${index}`,
        type: act.type,
        title: act.customLabel || getActivityLabel(act.type),
        startTime: currentTime,
        duration: act.duration,
        isCompleted: false,
        customLabel: act.customLabel
      };
      
      currentTime = calculateEndTime(currentTime, act.duration);
      return activity;
    });

    setActivities([...activities, ...activitiesToAdd]);
  };

  const handleToggleComplete = (id: string) => {
    setActivities(activities.map(a => 
      a.id === id ? { ...a, isCompleted: !a.isCompleted } : a
    ));
  };

  const handleDelete = (id: string) => {
    setActivities(activities.filter(a => a.id !== id));
  };

  const handleUpdateDuration = (id: string, newDuration: number) => {
    setActivities(activities.map(a => 
      a.id === id ? { ...a, duration: newDuration } : a
    ));
  };

  const handleRenameMeeting = (id: string, newTitle: string) => {
    setActivities(activities.map(a => 
      a.id === id ? { ...a, title: newTitle } : a
    ));
  };

  const openAddModal = (afterTime: string) => {
    setInsertAfterTime(afterTime);
    setShowAddModal(true);
  };

  const openEditModal = (activity: TimelineActivity) => {
    setEditingActivity(activity);
    setShowEditModal(true);
  };

  const handleEditSave = (type: ActivityType, duration: number, startTime: string, customLabel?: string) => {
    if (editingActivity) {
      // Get the new title based on the type
      const newTitle = customLabel || getActivityLabel(type);
      
      setActivities(activities.map(a => 
        a.id === editingActivity.id ? { ...a, type, duration, startTime, customLabel, title: newTitle } : a
      ));
    }
    setShowEditModal(false);
  };
  
  // Handle opening dossier for a meeting
  const handleOpenDossier = (activity: TimelineActivity) => {
    setSelectedMeetingForDossier(activity);
    setShowDossierModal(true);
  };

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#f7f7f9' }}>
      <div className="max-w-4xl mx-auto">
        {/* Timeline */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-h-[calc(100vh-12rem)] overflow-y-auto">
          {sortedActivities.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3" style={{ color: brandColors.ai }} />
              <p className="mb-4">No activities yet. Click + to start building your day!</p>
              <button
                onClick={() => openAddModal('09:00')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-all shadow-sm"
                style={{ backgroundColor: '#6b2358' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5a1d49'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6b2358'}
              >
                <Plus className="w-4 h-4" />
                Add Time Block
              </button>
            </div>
          ) : (
            <>
              {/* Show plus button at start of day if there's a gap */}
              {timeGaps.find(g => g.label === 'start of day') && (() => {
                const startGap = timeGaps.find(g => g.label === 'start of day')!;
                return (
                  <AddButton 
                    onClick={() => openAddModal(startGap.afterTime)} 
                    time="start of day" 
                    beforeTime={startGap.beforeTime}
                  />
                );
              })()}

              {/* Activities with gaps */}
              {sortedActivities.map((activity, index) => {
                const gap = timeGaps.find(g => g.afterTime === activity.startTime && g.label !== 'start of day');
                
                return (
                  <div key={activity.id}>
                    <TimelineBlock
                      activity={activity}
                      onToggleComplete={() => handleToggleComplete(activity.id)}
                      onDelete={() => handleDelete(activity.id)}
                      onUpdateDuration={(duration) => handleUpdateDuration(activity.id, duration)}
                      onEdit={() => openEditModal(activity)}
                      onRenameMeeting={(newTitle) => handleRenameMeeting(activity.id, newTitle)}
                      onNavigateToContact={onNavigateToContact}
                      onOpenDossier={handleOpenDossier}
                      contacts={contacts}
                      onAssignContact={onAssignContact}
                      showConnector={index < sortedActivities.length - 1 || gap !== undefined}
                      isCurrentActivity={isActivityHappeningNow(activity)} // Highlight activity if it's happening now
                    />
                    
                    {/* Show plus button in gap after this activity */}
                    {gap && (
                      <AddButton 
                        onClick={() => openAddModal(gap.afterTime)} 
                        time={gap.label === 'end of day' ? 'end of day' : gap.label}
                        beforeTime={gap.beforeTime}
                      />
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* Add Activity Modal */}
      {showAddModal && (
        <AddActivityModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddActivities}
          insertAfterTime={insertAfterTime}
        />
      )}

      {/* Edit Activity Modal */}
      {showEditModal && editingActivity && (
        <EditActivityModal
          onClose={() => setShowEditModal(false)}
          onSave={handleEditSave}
          currentActivity={editingActivity}
        />
      )}
      
      {/* Meeting Notes Dossier Modal */}
      {showDossierModal && selectedMeetingForDossier && selectedMeetingForDossier.calendarEventId && (() => {
        // Get the dossier for this meeting
        const dossier = getDossierByMeetingId(selectedMeetingForDossier.calendarEventId);
        
        // Convert to unified format
        const dossierData: MeetingDossierData = {
          agenda: dossier?.prepNotes?.thingsToDiscuss || [],
          questions: dossier?.prepNotes?.questionsToAsk || [],
          thingsToKnow: dossier?.prepNotes?.thingsToKnow || '',
          nextStepsExpected: dossier?.prepNotes?.nextSteps || '',
          duringNotes: dossier?.duringMeetingNotes || '',
          fathomUrl: dossier?.fathomUrl || '',
          summary: dossier?.summary || '',
          transcript: dossier?.transcript || '',
          outcomes: dossier?.postMeetingNotes?.outcomes || '',
          actionItems: dossier?.actionItems || [],
          tasksCreated: dossier?.taskIds && dossier.taskIds.length > 0 || false,
        };
        
        return (
          <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden w-[85vw] h-[90vh]">
              {/* Header */}
              <div className="flex items-center justify-between px-8 py-6 border-b border-slate-200 bg-white">
                <div className="flex items-center gap-4">
                  <h2 className="font-serif text-2xl text-slate-800">
                    {selectedMeetingForDossier.title}
                  </h2>
                  {selectedMeetingForDossier.contactName && (
                    <span className="text-sm text-slate-500">
                      with {selectedMeetingForDossier.contactName}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    setShowDossierModal(false);
                    setSelectedMeetingForDossier(null);
                  }}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              {/* Dossier Content */}
              <div className="flex-1 overflow-y-auto p-8">
                <MeetingNotesDossier
                  context="timeline"
                  meetingId={selectedMeetingForDossier.calendarEventId}
                  meetingTitle={selectedMeetingForDossier.title}
                  meetingDate={new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  meetingTime={selectedMeetingForDossier.startTime}
                  contact={selectedMeetingForDossier.contactId && selectedMeetingForDossier.contactName ? {
                    id: selectedMeetingForDossier.contactId,
                    name: selectedMeetingForDossier.contactName,
                  } : undefined}
                  hideHeader={true}
                  initialData={dossierData}
                  onDataChange={(data) => {
                    // Auto-save changes to dossier
                    if (dossier) {
                      updateDossier(dossier.id, {
                        prepNotes: {
                          thingsToKnow: data.thingsToKnow,
                          thingsToDiscuss: data.agenda,
                          questionsToAsk: data.questions,
                          nextSteps: data.nextStepsExpected,
                        },
                        duringMeetingNotes: data.duringNotes,
                        fathomUrl: data.fathomUrl,
                        summary: data.summary,
                        transcript: data.transcript,
                        postMeetingNotes: {
                          ...dossier.postMeetingNotes,
                          outcomes: data.outcomes,
                        },
                        actionItems: data.actionItems,
                      });
                    }
                  }}
                  onCreateTasks={(tasks) => {
                    // Create tasks from action items
                    tasks.forEach(task => {
                      if (onCreateTask) {
                        onCreateTask({
                          title: task.text,
                          description: `From meeting: ${selectedMeetingForDossier.title}`,
                          dueDate: task.dueDate,
                          contact: {
                            id: selectedMeetingForDossier.contactId,
                            name: selectedMeetingForDossier.contactName,
                          },
                          estimatedTime: task.duration,
                          status: 'toDo',
                        });
                      }
                    });
                    
                    toast.success(`Created ${tasks.length} task${tasks.length !== 1 ? 's' : ''}!`, {
                      description: 'View them in the Tasks page',
                    });
                  }}
                />
              </div>

              {/* Footer with Close Button */}
              <div className="flex items-center justify-end gap-3 px-8 py-4 border-t border-slate-200 bg-white">
                <button
                  onClick={() => {
                    setShowDossierModal(false);
                    setSelectedMeetingForDossier(null);
                  }}
                  className="px-6 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 transition-colors text-slate-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}
      
      {/* Activity Notification */}
      {activeNotification && (
        <ActivityNotification
          title={activeNotification.title}
          startTime={new Date(`2000-01-01T${activeNotification.startTime}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          })}
          duration={activeNotification.duration}
          onDismiss={() => setActiveNotification(null)}
        />
      )}
    </div>
  );
};

// React.memo removed - was preventing re-renders when contact assignments changed
export const SubwayTimeline = SubwayTimelineComponent;