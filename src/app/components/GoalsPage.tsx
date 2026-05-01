import React, { useState } from 'react';
import { Target, Plus, ChevronDown, Check, StickyNote, Pencil } from 'lucide-react';
import { brandColors } from '../lib/colors';

const GOALS_COLOR = '#a389aa';

export interface TimelineEntry {
  id: string;
  text: string;
  dateStamped: string;
  parentId?: string; // For nested entries
  notes?: string; // Detailed notes for the entry
}

export interface Goal {
  id: string;
  title: string;
  status: 'toDo' | 'inProgress' | 'done';
  timelineEntries: TimelineEntry[];
  createdAt: string;
  updatedAt: string;
  notes?: string; // Detailed notes for the goal
}

interface GoalsPageProps {
  goals: Goal[];
  onGoalsChange: (goals: Goal[]) => void;
  onAddGoal: () => void;
}

export function GoalsPage({ goals, onGoalsChange, onAddGoal }: GoalsPageProps) {
  const [filterStatus, setFilterStatus] = useState<'active' | 'all'>('active'); // active = to do + in progress
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editingEntryText, setEditingEntryText] = useState('');
  const [notesModalEntry, setNotesModalEntry] = useState<{ goalId: string; entryId: string } | null>(null);
  const [notesModalGoalId, setNotesModalGoalId] = useState<string | null>(null);
  const [notesText, setNotesText] = useState('');
  const [statusDropdownGoalId, setStatusDropdownGoalId] = useState<string | null>(null);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editingGoalTitle, setEditingGoalTitle] = useState('');
  const [hoveredGoalId, setHoveredGoalId] = useState<string | null>(null);

  // Filter goals based on status
  const filteredGoals = goals.filter(goal => {
    if (filterStatus === 'active') {
      return goal.status === 'toDo' || goal.status === 'inProgress';
    }
    return true;
  });

  const updateGoalStatus = (goalId: string, newStatus: 'toDo' | 'inProgress' | 'done') => {
    onGoalsChange(goals.map(g => 
      g.id === goalId 
        ? { ...g, status: newStatus, updatedAt: new Date().toISOString() }
        : g
    ));
  };

  const updateGoalTitle = (goalId: string, newTitle: string) => {
    onGoalsChange(goals.map(g => 
      g.id === goalId 
        ? { ...g, title: newTitle, updatedAt: new Date().toISOString() }
        : g
    ));
  };

  const addTimelineEntry = (goalId: string, parentId?: string) => {
    const newEntry: TimelineEntry = {
      id: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: '',
      dateStamped: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      parentId
    };

    onGoalsChange(goals.map(g => 
      g.id === goalId 
        ? { 
            ...g, 
            timelineEntries: [...g.timelineEntries, newEntry],
            updatedAt: new Date().toISOString()
          }
        : g
    ));

    // Auto-focus on the new entry
    setEditingEntryId(newEntry.id);
    setEditingEntryText('');
  };

  const updateTimelineEntry = (goalId: string, entryId: string, newText: string) => {
    onGoalsChange(goals.map(g => 
      g.id === goalId 
        ? { 
            ...g, 
            timelineEntries: g.timelineEntries.map(e => 
              e.id === entryId ? { ...e, text: newText } : e
            ),
            updatedAt: new Date().toISOString()
          }
        : g
    ));
  };

  const updateTimelineEntryNotes = (goalId: string, entryId: string, notes: string) => {
    onGoalsChange(goals.map(g => 
      g.id === goalId 
        ? { 
            ...g, 
            timelineEntries: g.timelineEntries.map(e => 
              e.id === entryId ? { ...e, notes } : e
            ),
            updatedAt: new Date().toISOString()
          }
        : g
    ));
  };

  const updateGoalNotes = (goalId: string, notes: string) => {
    onGoalsChange(goals.map(g => 
      g.id === goalId 
        ? { ...g, notes, updatedAt: new Date().toISOString() }
        : g
    ));
  };

  const openNotesModal = (goalId: string, entryId: string) => {
    const goal = goals.find(g => g.id === goalId);
    const entry = goal?.timelineEntries.find(e => e.id === entryId);
    setNotesModalEntry({ goalId, entryId });
    setNotesText(entry?.notes || '');
  };

  const openGoalNotesModal = (goalId: string) => {
    const goal = goals.find(g => g.id === goalId);
    setNotesModalGoalId(goalId);
    setNotesText(goal?.notes || '');
  };

  const saveNotes = () => {
    if (notesModalEntry) {
      updateTimelineEntryNotes(notesModalEntry.goalId, notesModalEntry.entryId, notesText);
      setNotesModalEntry(null);
      setNotesText('');
    }
  };

  const saveGoalNotes = () => {
    if (notesModalGoalId) {
      updateGoalNotes(notesModalGoalId, notesText);
      setNotesModalGoalId(null);
      setNotesText('');
    }
  };

  const deleteTimelineEntry = (goalId: string, entryId: string) => {
    onGoalsChange(goals.map(g => 
      g.id === goalId 
        ? { 
            ...g, 
            timelineEntries: g.timelineEntries.filter(e => e.id !== entryId && e.parentId !== entryId),
            updatedAt: new Date().toISOString()
          }
        : g
    ));
  };

  const getStatusLabel = (status: 'toDo' | 'inProgress' | 'done') => {
    switch (status) {
      case 'toDo': return 'To Do';
      case 'inProgress': return 'In Progress';
      case 'done': return 'Done';
    }
  };

  const getStatusColor = (status: 'toDo' | 'inProgress' | 'done') => {
    switch (status) {
      case 'toDo': return 'bg-gray-100 text-gray-700';
      case 'inProgress': return 'bg-purple-100 text-purple-700';
      case 'done': return 'bg-white text-gray-700';
    }
  };

  // Group entries by parent
  const getTopLevelEntries = (entries: TimelineEntry[]) => 
    entries.filter(e => !e.parentId);
  
  const getChildEntries = (entries: TimelineEntry[], parentId: string) => 
    entries.filter(e => e.parentId === parentId);

  return (
    <div className="h-full flex flex-col overflow-y-auto" style={{ backgroundColor: '#F7F7F9' }}>
      {/* Filter and Sort */}
      <div className="p-6 pb-4 flex items-center gap-2 text-sm text-gray-600">
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as 'active' | 'all')}
          className="bg-transparent border-none outline-none cursor-pointer"
        >
          <option value="active">Filter and Sort - To Do & In Progress only</option>
          <option value="all">Show All Goals</option>
        </select>
      </div>

      {/* Goals List */}
      <div className="px-6 pb-6 space-y-4">
        {filteredGoals.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No goals yet. Click "+ New Goal" to get started!</p>
          </div>
        ) : (
          filteredGoals.map(goal => (
            <div
              key={goal.id}
              className="rounded-xl overflow-hidden border-2"
              style={{ borderColor: GOALS_COLOR }}
            >
              {/* Goal Header */}
              <div 
                className="p-4 flex items-start justify-between"
                style={{ backgroundColor: GOALS_COLOR }}
                onMouseEnter={() => setHoveredGoalId(goal.id)}
                onMouseLeave={() => setHoveredGoalId(null)}
              >
                <div className="flex-1">
                  {editingGoalId === goal.id ? (
                    <div className="mb-2">
                      <input
                        type="text"
                        value={editingGoalTitle}
                        onChange={(e) => setEditingGoalTitle(e.target.value)}
                        onBlur={() => {
                          if (editingGoalTitle.trim()) {
                            updateGoalTitle(goal.id, editingGoalTitle);
                          }
                          setEditingGoalId(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (editingGoalTitle.trim()) {
                              updateGoalTitle(goal.id, editingGoalTitle);
                            }
                            setEditingGoalId(null);
                          }
                          if (e.key === 'Escape') {
                            setEditingGoalId(null);
                          }
                        }}
                        autoFocus
                        className="text-xl font-medium text-white bg-transparent border-b border-white/50 outline-none focus:border-white w-full"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mb-2 group">
                      <h3 className="text-xl font-medium text-white">{goal.title}</h3>
                      {hoveredGoalId === goal.id && (
                        <button
                          onClick={() => {
                            setEditingGoalId(goal.id);
                            setEditingGoalTitle(goal.title);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/20 rounded"
                          title="Edit goal name"
                        >
                          <Pencil className="w-4 h-4 text-white" />
                        </button>
                      )}
                    </div>
                  )}
                  
                  {/* Status Badge and Dropdown */}
                  <div className="flex items-center gap-3 relative">
                    <button
                      onClick={() => setStatusDropdownGoalId(statusDropdownGoalId === goal.id ? null : goal.id)}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(goal.status)} hover:opacity-80 transition-opacity`}
                    >
                      {getStatusLabel(goal.status)}
                    </button>
                    
                    {/* Status Dropdown */}
                    {statusDropdownGoalId === goal.id && (
                      <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                        <button
                          onClick={() => {
                            updateGoalStatus(goal.id, 'toDo');
                            setStatusDropdownGoalId(null);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 whitespace-nowrap"
                        >
                          To Do
                        </button>
                        <button
                          onClick={() => {
                            updateGoalStatus(goal.id, 'inProgress');
                            setStatusDropdownGoalId(null);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 whitespace-nowrap"
                        >
                          In Progress
                        </button>
                        <button
                          onClick={() => {
                            updateGoalStatus(goal.id, 'done');
                            setStatusDropdownGoalId(null);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 whitespace-nowrap"
                        >
                          Done
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Goal Notes Button and Checkmark indicator */}
                <div className="ml-4 flex items-start gap-2">
                  <button
                    onClick={() => openGoalNotesModal(goal.id)}
                    className="p-2 hover:bg-white/20 rounded transition-colors"
                    title="Goal notes"
                  >
                    <StickyNote 
                      className="w-5 h-5 text-white"
                    />
                  </button>
                  
                  {goal.status === 'done' && (
                    <div>
                      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                        <Check className="w-6 h-6" style={{ color: GOALS_COLOR }} />
                      </div>
                      <div className="text-xs text-white text-center mt-1">Done</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline Content Area */}
              <div className="bg-white p-6">
                {goal.timelineEntries.length === 0 ? (
                  <p className="text-gray-400 text-sm italic mb-4">No timeline entries yet</p>
                ) : (
                  <ul className="space-y-3 mb-4">
                    {getTopLevelEntries(goal.timelineEntries).map(entry => (
                      <li key={entry.id}>
                        {editingEntryId === entry.id ? (
                          <div className="flex items-start gap-2">
                            <span className="text-sm text-gray-500 mt-1">{entry.dateStamped}:</span>
                            <input
                              type="text"
                              value={editingEntryText}
                              onChange={(e) => setEditingEntryText(e.target.value)}
                              onBlur={() => {
                                if (editingEntryText.trim()) {
                                  updateTimelineEntry(goal.id, entry.id, editingEntryText);
                                } else {
                                  deleteTimelineEntry(goal.id, entry.id);
                                }
                                setEditingEntryId(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  if (editingEntryText.trim()) {
                                    updateTimelineEntry(goal.id, entry.id, editingEntryText);
                                  } else {
                                    deleteTimelineEntry(goal.id, entry.id);
                                  }
                                  setEditingEntryId(null);
                                }
                                if (e.key === 'Escape') {
                                  setEditingEntryId(null);
                                }
                              }}
                              autoFocus
                              className="flex-1 border-b border-gray-300 outline-none focus:border-gray-500"
                              placeholder="Type your update..."
                            />
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-start gap-2">
                              <div
                                className="flex-1 flex items-start gap-2 cursor-pointer hover:bg-gray-50 -mx-2 px-2 py-1 rounded"
                                onClick={() => {
                                  setEditingEntryId(entry.id);
                                  setEditingEntryText(entry.text);
                                }}
                              >
                                <span className="text-sm font-semibold">{entry.dateStamped}:</span>
                                <span className="text-sm">{entry.text}</span>
                              </div>
                              <button
                                onClick={() => openNotesModal(goal.id, entry.id)}
                                className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition-colors"
                                title="Add notes"
                              >
                                <StickyNote 
                                  className="w-4 h-4"
                                  style={{ color: entry.notes ? GOALS_COLOR : '#9ca3af' }}
                                />
                              </button>
                            </div>
                            
                            {/* Child entries (indented) */}
                            {getChildEntries(goal.timelineEntries, entry.id).length > 0 && (
                              <ul className="ml-8 mt-2 space-y-2">
                                {getChildEntries(goal.timelineEntries, entry.id).map(childEntry => (
                                  <li key={childEntry.id}>
                                    {editingEntryId === childEntry.id ? (
                                      <div className="flex items-start gap-2">
                                        <span className="text-sm text-gray-500 mt-1">{childEntry.dateStamped}:</span>
                                        <input
                                          type="text"
                                          value={editingEntryText}
                                          onChange={(e) => setEditingEntryText(e.target.value)}
                                          onBlur={() => {
                                            if (editingEntryText.trim()) {
                                              updateTimelineEntry(goal.id, childEntry.id, editingEntryText);
                                            } else {
                                              deleteTimelineEntry(goal.id, childEntry.id);
                                            }
                                            setEditingEntryId(null);
                                          }}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                              if (editingEntryText.trim()) {
                                                updateTimelineEntry(goal.id, childEntry.id, editingEntryText);
                                              } else {
                                                deleteTimelineEntry(goal.id, childEntry.id);
                                              }
                                              setEditingEntryId(null);
                                            }
                                            if (e.key === 'Escape') {
                                              setEditingEntryId(null);
                                            }
                                          }}
                                          autoFocus
                                          className="flex-1 border-b border-gray-300 outline-none focus:border-gray-500"
                                          placeholder="Type your update..."
                                        />
                                      </div>
                                    ) : (
                                      <div className="flex items-start gap-2">
                                        <div
                                          className="flex-1 flex items-start gap-2 cursor-pointer hover:bg-gray-50 -mx-2 px-2 py-1 rounded"
                                          onClick={() => {
                                            setEditingEntryId(childEntry.id);
                                            setEditingEntryText(childEntry.text);
                                          }}
                                        >
                                          <span className="text-sm text-gray-500">{childEntry.dateStamped}:</span>
                                          <span className="text-sm text-gray-600">{childEntry.text}</span>
                                        </div>
                                        <button
                                          onClick={() => openNotesModal(goal.id, childEntry.id)}
                                          className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition-colors"
                                          title="Add notes"
                                        >
                                          <StickyNote 
                                            className="w-4 h-4"
                                            style={{ color: childEntry.notes ? GOALS_COLOR : '#9ca3af' }}
                                          />
                                        </button>
                                      </div>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Add Entry Button */}
                <button
                  onClick={() => addTimelineEntry(goal.id)}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: GOALS_COLOR }}
                  >
                    <Plus className="w-4 h-4 text-white" />
                  </div>
                  
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Notes Modal */}
      {notesModalEntry && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-[10000]"
          style={{ backgroundColor: '#F7F7F9' }}
          onClick={() => setNotesModalEntry(null)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              className="px-6 py-4 border-b flex items-center gap-2"
              style={{ borderColor: GOALS_COLOR }}
            >
              <StickyNote className="w-5 h-5" style={{ color: GOALS_COLOR }} />
              <h3 className="text-lg font-medium">Notes</h3>
            </div>
            
            <div className="p-6">
              <textarea
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                className="w-full h-48 border border-gray-300 rounded-lg p-3 outline-none focus:border-gray-500 resize-none"
                placeholder="Type your detailed notes here..."
                autoFocus
              />
            </div>

            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <button
                onClick={() => setNotesModalEntry(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveNotes}
                className="px-4 py-2 text-sm text-white rounded-lg hover:opacity-90 transition-opacity"
                style={{ backgroundColor: GOALS_COLOR }}
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Goal Notes Modal */}
      {notesModalGoalId && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-[10000]"
          style={{ backgroundColor: '#F7F7F9' }}
          onClick={() => setNotesModalGoalId(null)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              className="px-6 py-4 border-b flex items-center gap-2"
              style={{ borderColor: GOALS_COLOR }}
            >
              <StickyNote className="w-5 h-5" style={{ color: GOALS_COLOR }} />
              <h3 className="text-lg font-medium">Notes</h3>
            </div>
            
            <div className="p-6">
              <textarea
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                className="w-full h-48 border border-gray-300 rounded-lg p-3 outline-none focus:border-gray-500 resize-none"
                placeholder="Type your detailed notes here..."
                autoFocus
              />
            </div>

            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <button
                onClick={() => setNotesModalGoalId(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveGoalNotes}
                className="px-4 py-2 text-sm text-white rounded-lg hover:opacity-90 transition-opacity"
                style={{ backgroundColor: GOALS_COLOR }}
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}