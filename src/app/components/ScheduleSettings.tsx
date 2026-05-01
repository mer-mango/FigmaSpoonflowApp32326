import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Clock, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface MeetingType {
  id: string;
  name: string;
  preBuffer: number; // minutes before meeting
  postBuffer: number; // minutes after meeting
  color: string;
}

const DEFAULT_MEETING_TYPES: MeetingType[] = [
  {
    id: 'default',
    name: 'Default Meeting',
    preBuffer: 5,
    postBuffer: 10,
    color: '#14b8a6'
  },
  {
    id: 'client-call',
    name: 'Client Call',
    preBuffer: 10,
    postBuffer: 15,
    color: '#3b82f6'
  },
  {
    id: 'strategy-session',
    name: 'Strategy Session',
    preBuffer: 15,
    postBuffer: 20,
    color: '#8b5cf6'
  },
  {
    id: 'internal-meeting',
    name: 'Internal Meeting',
    preBuffer: 0,
    postBuffer: 5,
    color: '#64748b'
  }
];

export function ScheduleSettings() {
  const [meetingTypes, setMeetingTypes] = useState<MeetingType[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    // Load from localStorage
    const stored = localStorage.getItem('meeting_types_settings');
    if (stored) {
      try {
        setMeetingTypes(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse meeting types', e);
        setMeetingTypes(DEFAULT_MEETING_TYPES);
      }
    } else {
      setMeetingTypes(DEFAULT_MEETING_TYPES);
    }
  }, []);

  useEffect(() => {
    // Save to localStorage whenever meeting types change
    if (meetingTypes.length > 0) {
      localStorage.setItem('meeting_types_settings', JSON.stringify(meetingTypes));
    }
  }, [meetingTypes]);

  const handleAddMeetingType = () => {
    const newType: MeetingType = {
      id: `meeting-type-${Date.now()}`,
      name: 'New Meeting Type',
      preBuffer: 5,
      postBuffer: 10,
      color: '#14b8a6'
    };
    setMeetingTypes([...meetingTypes, newType]);
    setEditingId(newType.id);
  };

  const handleUpdateMeetingType = (id: string, updates: Partial<MeetingType>) => {
    setMeetingTypes(prev =>
      prev.map(mt => (mt.id === id ? { ...mt, ...updates } : mt))
    );
  };

  const handleDeleteMeetingType = (id: string) => {
    // Don't allow deleting the default type
    if (id === 'default') {
      return;
    }
    setMeetingTypes(prev => prev.filter(mt => mt.id !== id));
  };

  const handleResetToDefaults = () => {
    if (confirm('Reset all meeting types to defaults? This cannot be undone.')) {
      setMeetingTypes(DEFAULT_MEETING_TYPES);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h2 className="font-['Lora'] text-3xl text-slate-800 mb-2">Schedule Settings</h2>
        <p className="text-slate-600">
          Configure meeting buffer times for different meeting types. Jamie will automatically add these buffers when populating your timeline.
        </p>
      </div>

      {/* Meeting Types */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900">Meeting Types & Buffers</h3>
          <p className="text-sm text-slate-500 mt-1">
            Define how much prep and wrap-up time you need for different types of meetings
          </p>
        </div>

        <div className="divide-y divide-slate-200">
          {meetingTypes.map((type) => (
            <div key={type.id} className="p-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-start gap-4">
                {/* Color indicator */}
                <div
                  className="w-4 h-4 rounded-full mt-2 flex-shrink-0"
                  style={{ backgroundColor: type.color }}
                />

                {/* Meeting type details */}
                <div className="flex-1 grid grid-cols-3 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Meeting Type
                    </label>
                    <Input
                      value={type.name}
                      onChange={(e) => handleUpdateMeetingType(type.id, { name: e.target.value })}
                      className="h-9"
                      placeholder="e.g., Client Call"
                    />
                  </div>

                  {/* Pre-buffer */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Pre-Meeting Buffer (min)
                    </label>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <Input
                        type="number"
                        min="0"
                        max="60"
                        step="5"
                        value={type.preBuffer}
                        onChange={(e) =>
                          handleUpdateMeetingType(type.id, {
                            preBuffer: parseInt(e.target.value) || 0
                          })
                        }
                        className="h-9"
                      />
                    </div>
                  </div>

                  {/* Post-buffer */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Post-Meeting Buffer (min)
                    </label>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <Input
                        type="number"
                        min="0"
                        max="60"
                        step="5"
                        value={type.postBuffer}
                        onChange={(e) =>
                          handleUpdateMeetingType(type.id, {
                            postBuffer: parseInt(e.target.value) || 0
                          })
                        }
                        className="h-9"
                      />
                    </div>
                  </div>
                </div>

                {/* Delete button */}
                {type.id !== 'default' && (
                  <button
                    onClick={() => handleDeleteMeetingType(type.id)}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors mt-6"
                    title="Delete meeting type"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Buffer preview */}
              <div className="mt-3 ml-8 flex items-center gap-2 text-xs text-slate-500">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  Example: {type.preBuffer}min prep → Meeting → {type.postBuffer}min wrap-up
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Add new type button */}
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <Button
              onClick={handleAddMeetingType}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Meeting Type
            </Button>

            <Button
              onClick={handleResetToDefaults}
              variant="ghost"
              size="sm"
              className="text-slate-500 hover:text-slate-700"
            >
              Reset to Defaults
            </Button>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <h4 className="font-medium text-blue-900 mb-2">How It Works</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Jamie automatically detects meeting types from calendar event titles</li>
          <li>• Pre-meeting buffers give you time to prepare and get focused</li>
          <li>• Post-meeting buffers give you time for notes and task creation</li>
          <li>• Buffers are automatically added when meetings appear on your timeline</li>
          <li>• You can still manually adjust buffers on your Today page</li>
        </ul>
      </div>
    </div>
  );
}
