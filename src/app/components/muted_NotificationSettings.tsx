/**
 * Notification Settings
 * Configure notification preferences with granular control
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Bell, Clock, Mail, Smartphone, Monitor } from 'lucide-react';

interface NotificationDeliveryMethods {
  enabled: boolean;
  email: boolean;
  inApp: boolean;
  push: boolean;
}

interface NotificationPreferences {
  // Tasks
  taskDueSoon: NotificationDeliveryMethods & { hours: number };
  taskOverdue: NotificationDeliveryMethods;
  
  // Content
  contentScheduledSoon: NotificationDeliveryMethods & { hours: number };
  contentReadyToSchedule: NotificationDeliveryMethods;
  contentPublished: NotificationDeliveryMethods;
  contentReminderSet: NotificationDeliveryMethods;
  contentDeadlineApproaching: NotificationDeliveryMethods;
  
  // Calendar & Meetings
  meetingStartsSoon: NotificationDeliveryMethods & { minutes: number };
  meetingCanceled: NotificationDeliveryMethods;
  meetingRescheduled: NotificationDeliveryMethods;
  newMeetingAdded: NotificationDeliveryMethods;
  meetingDossierReady: NotificationDeliveryMethods;
  postMeetingTasksCreated: NotificationDeliveryMethods;
  
  // Contacts & Nurtures
  nurtureEmailDue: NotificationDeliveryMethods & { days: number };
  nurtureResponseReceived: NotificationDeliveryMethods;
  contactBirthdayUpcoming: NotificationDeliveryMethods & { days: number };
  
  // Jamie AI
  jamieSuggestionAvailable: NotificationDeliveryMethods;
  jamieDailyBriefing: NotificationDeliveryMethods & { time: string };
  jamieWeeklyReview: NotificationDeliveryMethods & { day: string };
  jamieTaskRecommendation: NotificationDeliveryMethods;
  jamieContentIdea: NotificationDeliveryMethods;
  
  // System & Digests
  systemUpdates: NotificationDeliveryMethods;
  weeklyDigest: NotificationDeliveryMethods & { day: string };
  monthlyReport: NotificationDeliveryMethods;
  
  // Quiet Hours
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

interface MutedNotificationSettingsProps {
  preferences?: NotificationPreferences;
  onSave: (preferences: NotificationPreferences) => void;
}

// Helper to create default delivery settings
const createDefaultDelivery = (
  enabled = true, 
  email = true, 
  inApp = true, 
  push = true
): NotificationDeliveryMethods => ({
  enabled,
  email,
  inApp,
  push,
});

// Default preferences
const defaultNotificationPreferences: NotificationPreferences = {
  // Tasks
  taskDueSoon: { ...createDefaultDelivery(), hours: 24 },
  taskOverdue: createDefaultDelivery(),
  
  // Content
  contentScheduledSoon: { ...createDefaultDelivery(), hours: 2 },
  contentReadyToSchedule: createDefaultDelivery(),
  contentPublished: createDefaultDelivery(true, true, true, false),
  contentReminderSet: createDefaultDelivery(),
  contentDeadlineApproaching: createDefaultDelivery(),
  
  // Calendar & Meetings
  meetingStartsSoon: { ...createDefaultDelivery(), minutes: 15 },
  meetingCanceled: createDefaultDelivery(),
  meetingRescheduled: createDefaultDelivery(),
  newMeetingAdded: createDefaultDelivery(),
  meetingDossierReady: createDefaultDelivery(),
  postMeetingTasksCreated: createDefaultDelivery(true, false, true, false),
  
  // Contacts & Nurtures
  nurtureEmailDue: { ...createDefaultDelivery(), days: 1 },
  nurtureResponseReceived: createDefaultDelivery(),
  contactBirthdayUpcoming: { ...createDefaultDelivery(), days: 7 },
  
  // Jamie AI
  jamieSuggestionAvailable: createDefaultDelivery(),
  jamieDailyBriefing: { ...createDefaultDelivery(), time: '08:00' },
  jamieWeeklyReview: { ...createDefaultDelivery(), day: 'Monday' },
  jamieTaskRecommendation: createDefaultDelivery(),
  jamieContentIdea: createDefaultDelivery(),
  
  // System & Digests
  systemUpdates: createDefaultDelivery(),
  weeklyDigest: { ...createDefaultDelivery(), day: 'Monday' },
  monthlyReport: createDefaultDelivery(true, true, false, false),
  
  // Quiet Hours
  quietHoursEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
};

export function MutedNotificationSettings({ preferences, onSave }: MutedNotificationSettingsProps) {
  const [localPrefs, setLocalPrefs] = useState<NotificationPreferences>(preferences || defaultNotificationPreferences);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const updateNotificationPref = <K extends keyof NotificationPreferences>(
    key: K,
    updates: Partial<NotificationPreferences[K]>
  ) => {
    const newPrefs = {
      ...localPrefs,
      [key]: {
        ...localPrefs[key],
        ...updates
      }
    };
    setLocalPrefs(newPrefs);
    onSave(newPrefs);
  };

  const NotificationRow = ({ 
    title, 
    description, 
    prefKey,
    timing 
  }: { 
    title: string; 
    description: string; 
    prefKey: keyof NotificationPreferences;
    timing?: { type: 'hours' | 'minutes' | 'days', value: number, options: number[] } | { type: 'time', value: string } | { type: 'day', value: string, options: string[] };
  }) => {
    const pref = localPrefs[prefKey] as NotificationDeliveryMethods;
    const isExpanded = expandedSections.has(prefKey);

    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-slate-200/50">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={() => toggleSection(prefKey)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              <h4 className="font-medium text-slate-800">{title}</h4>
            </div>
            <p className="text-sm text-slate-600 ml-6">{description}</p>
            
            {/* Timing Display */}
            {timing && pref.enabled && (
              <div className="ml-6 mt-2 text-sm text-slate-500 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                {timing.type === 'hours' && `${timing.value} hour${timing.value !== 1 ? 's' : ''} before`}
                {timing.type === 'minutes' && `${timing.value} minute${timing.value !== 1 ? 's' : ''} before`}
                {timing.type === 'days' && `${timing.value} day${timing.value !== 1 ? 's' : ''} before`}
                {timing.type === 'time' && `at ${timing.value}`}
                {timing.type === 'day' && `on ${timing.value}s`}
              </div>
            )}
          </div>
          
          {/* Master Toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={pref.enabled}
              onChange={(e) => updateNotificationPref(prefKey, { enabled: e.target.checked })}
              className="w-4 h-4 text-[#6b2358] border-slate-300 rounded focus:ring-[#6b2358]"
            />
          </label>
        </div>

        {/* Expanded Controls */}
        {isExpanded && pref.enabled && (
          <div className="ml-6 mt-4 space-y-4 pt-4 border-t border-slate-200">
            {/* Timing Control */}
            {timing && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-2">When to notify:</label>
                {(timing.type === 'hours' || timing.type === 'minutes' || timing.type === 'days') && (
                  <select
                    value={(localPrefs[prefKey] as any)[timing.type]}
                    onChange={(e) => updateNotificationPref(prefKey, { [timing.type]: parseInt(e.target.value) } as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6b2358]/30"
                  >
                    {timing.options.map(opt => (
                      <option key={opt} value={opt}>
                        {opt} {timing.type}{opt !== 1 ? '' : timing.type === 'hours' ? '' : timing.type === 'minutes' ? '' : ''} before
                      </option>
                    ))}
                  </select>
                )}
                {timing.type === 'time' && (
                  <input
                    type="time"
                    value={(localPrefs[prefKey] as any).time}
                    onChange={(e) => updateNotificationPref(prefKey, { time: e.target.value } as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6b2358]/30"
                  />
                )}
                {timing.type === 'day' && (
                  <select
                    value={(localPrefs[prefKey] as any).day}
                    onChange={(e) => updateNotificationPref(prefKey, { day: e.target.value } as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6b2358]/30"
                  >
                    {timing.options.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Delivery Methods */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-3">How to notify:</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pref.inApp}
                    onChange={(e) => updateNotificationPref(prefKey, { inApp: e.target.checked })}
                    className="w-4 h-4 text-[#6b2358] border-slate-300 rounded focus:ring-[#6b2358]"
                  />
                  <Bell className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-700">In-app notification (Toast)</span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pref.push}
                    onChange={(e) => updateNotificationPref(prefKey, { push: e.target.checked })}
                    className="w-4 h-4 text-[#6b2358] border-slate-300 rounded focus:ring-[#6b2358]"
                  />
                  <Smartphone className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-700">Push notification</span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pref.push}
                    onChange={(e) => updateNotificationPref(prefKey, { push: e.target.checked })}
                    className="w-4 h-4 text-[#6b2358] border-slate-300 rounded focus:ring-[#6b2358]"
                  />
                  <Monitor className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-700">Desktop notification</span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pref.email}
                    onChange={(e) => updateNotificationPref(prefKey, { email: e.target.checked })}
                    className="w-4 h-4 text-[#6b2358] border-slate-300 rounded focus:ring-[#6b2358]"
                  />
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-700">Email notification</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-slate-200/50">
        <h3 className="font-['Lora'] text-xl text-slate-800 mb-1">Notification Preferences</h3>
        <p className="text-sm text-slate-600">
          Configure how and when you receive notifications
        </p>
      </div>

      {/* Quiet Hours */}
      <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-slate-200/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-medium text-slate-800">Quiet Hours</h4>
            <p className="text-sm text-slate-600">
              {localPrefs.quietHoursEnabled 
                ? `Active from ${localPrefs.quietHoursStart} to ${localPrefs.quietHoursEnd}`
                : 'Mute all notifications during specific hours'
              }
            </p>
          </div>
          <input 
            type="checkbox"
            checked={localPrefs.quietHoursEnabled}
            onChange={(e) => {
              const newPrefs = { ...localPrefs, quietHoursEnabled: e.target.checked };
              setLocalPrefs(newPrefs);
              onSave(newPrefs);
            }}
            className="w-4 h-4 text-[#6b2358] border-slate-300 rounded focus:ring-[#6b2358]"
          />
        </div>
        
        {localPrefs.quietHoursEnabled && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">Start Time</label>
              <input
                type="time"
                value={localPrefs.quietHoursStart}
                onChange={(e) => {
                  const newPrefs = { ...localPrefs, quietHoursStart: e.target.value };
                  setLocalPrefs(newPrefs);
                  onSave(newPrefs);
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6b2358]/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">End Time</label>
              <input
                type="time"
                value={localPrefs.quietHoursEnd}
                onChange={(e) => {
                  const newPrefs = { ...localPrefs, quietHoursEnd: e.target.value };
                  setLocalPrefs(newPrefs);
                  onSave(newPrefs);
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6b2358]/30"
              />
            </div>
          </div>
        )}
      </div>

      {/* Task Notifications */}
      <div className="space-y-3">
        <h4 className="font-['Lora'] text-lg text-slate-800 px-1">Task Notifications</h4>
        <NotificationRow 
          title="Task Due Soon"
          description="Get notified about task deadlines"
          prefKey="taskDueSoon"
          timing={{ type: 'hours', value: localPrefs.taskDueSoon.hours, options: [1, 2, 4, 8, 12, 24, 48] }}
        />
        <NotificationRow 
          title="Task Overdue"
          description="Get notified when a task becomes overdue"
          prefKey="taskOverdue"
        />
      </div>

      {/* Meeting Notifications */}
      <div className="space-y-3">
        <h4 className="font-['Lora'] text-lg text-slate-800 px-1">Meeting Notifications</h4>
        <NotificationRow 
          title="Meeting Starts Soon"
          description="Get notified before meetings start"
          prefKey="meetingStartsSoon"
          timing={{ type: 'minutes', value: localPrefs.meetingStartsSoon.minutes, options: [5, 10, 15, 30, 60] }}
        />
        <NotificationRow 
          title="Meeting Canceled"
          description="Get notified when a meeting is canceled"
          prefKey="meetingCanceled"
        />
        <NotificationRow 
          title="Meeting Rescheduled"
          description="Get notified when a meeting is rescheduled"
          prefKey="meetingRescheduled"
        />
        <NotificationRow 
          title="New Meeting Added"
          description="Get notified when a new meeting is added to your calendar"
          prefKey="newMeetingAdded"
        />
        <NotificationRow 
          title="Meeting Dossier Ready"
          description="Get notified when Jamie prepares your meeting dossier"
          prefKey="meetingDossierReady"
        />
        <NotificationRow 
          title="Post-Meeting Tasks Created"
          description="Get notified when Jamie creates tasks after a meeting"
          prefKey="postMeetingTasksCreated"
        />
      </div>

      {/* Content Notifications */}
      <div className="space-y-3">
        <h4 className="font-['Lora'] text-lg text-slate-800 px-1">Content Notifications</h4>
        <NotificationRow 
          title="Content Publishing Soon"
          description="Get notified about upcoming content publish dates"
          prefKey="contentScheduledSoon"
          timing={{ type: 'hours', value: localPrefs.contentScheduledSoon.hours, options: [1, 2, 4, 8, 12, 24] }}
        />
        <NotificationRow 
          title="Content Ready to Schedule"
          description="Get notified when content is ready to be scheduled"
          prefKey="contentReadyToSchedule"
        />
        <NotificationRow 
          title="Content Published"
          description="Get notified when content is published"
          prefKey="contentPublished"
        />
        <NotificationRow 
          title="Content Reminder Set"
          description="Get notified about content reminders you've set"
          prefKey="contentReminderSet"
        />
        <NotificationRow 
          title="Content Deadline Approaching"
          description="Get notified when content deadlines are approaching"
          prefKey="contentDeadlineApproaching"
        />
      </div>

      {/* Contact Notifications */}
      <div className="space-y-3">
        <h4 className="font-['Lora'] text-lg text-slate-800 px-1">Contact Notifications</h4>
        <NotificationRow 
          title="Nurture Email Due"
          description="Get notified when it's time to send a nurture email"
          prefKey="nurtureEmailDue"
          timing={{ type: 'days', value: localPrefs.nurtureEmailDue.days, options: [1, 2, 3, 7] }}
        />
        <NotificationRow 
          title="Nurture Response Received"
          description="Get notified when a contact responds to your nurture email"
          prefKey="nurtureResponseReceived"
        />
        <NotificationRow 
          title="Contact Birthday Upcoming"
          description="Get notified about upcoming contact birthdays"
          prefKey="contactBirthdayUpcoming"
          timing={{ type: 'days', value: localPrefs.contactBirthdayUpcoming.days, options: [1, 3, 7, 14] }}
        />
      </div>

      {/* Jamie AI Notifications */}
      <div className="space-y-3">
        <h4 className="font-['Lora'] text-lg text-slate-800 px-1">Jamie AI Notifications</h4>
        <NotificationRow 
          title="Jamie Suggestion Available"
          description="Get notified when Jamie has a suggestion for you"
          prefKey="jamieSuggestionAvailable"
        />
        <NotificationRow 
          title="Daily Briefing"
          description="Get Jamie's daily briefing each morning"
          prefKey="jamieDailyBriefing"
          timing={{ type: 'time', value: localPrefs.jamieDailyBriefing.time }}
        />
        <NotificationRow 
          title="Weekly Review"
          description="Get Jamie's weekly review"
          prefKey="jamieWeeklyReview"
          timing={{ type: 'day', value: localPrefs.jamieWeeklyReview.day, options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] }}
        />
        <NotificationRow 
          title="Task Recommendation"
          description="Get notified when Jamie recommends a task"
          prefKey="jamieTaskRecommendation"
        />
        <NotificationRow 
          title="Content Idea"
          description="Get notified when Jamie has a content idea"
          prefKey="jamieContentIdea"
        />
      </div>

      {/* System Notifications */}
      <div className="space-y-3">
        <h4 className="font-['Lora'] text-lg text-slate-800 px-1">System & Digests</h4>
        <NotificationRow 
          title="System Updates"
          description="Get notified about SpoonFlow updates and features"
          prefKey="systemUpdates"
        />
        <NotificationRow 
          title="Weekly Digest"
          description="Get a weekly summary of your activity"
          prefKey="weeklyDigest"
          timing={{ type: 'day', value: localPrefs.weeklyDigest.day, options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] }}
        />
        <NotificationRow 
          title="Monthly Report"
          description="Get a monthly report of your progress"
          prefKey="monthlyReport"
        />
      </div>
    </div>
  );
}