import React, { useState, useEffect } from 'react';
import { X, Target } from 'lucide-react';
import { Goal } from './GoalsPage';

const GOALS_COLOR = '#a389aa';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: Partial<Goal>) => void;
  goal?: Goal; // If editing existing goal
}

export function GoalModal({ isOpen, onClose, onSave, goal }: GoalModalProps) {
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<'toDo' | 'inProgress' | 'done'>('toDo');

  useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setStatus(goal.status);
    } else {
      setTitle('');
      setStatus('toDo');
    }
  }, [goal, isOpen]);

  const handleSave = () => {
    if (!title.trim()) return;

    onSave({
      ...(goal || {}),
      title: title.trim(),
      status,
      updatedAt: new Date().toISOString(),
      ...(goal ? {} : { 
        createdAt: new Date().toISOString(),
        timelineEntries: []
      })
    });

    setTitle('');
    setStatus('toDo');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1100] p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full">
        {/* Header */}
        <div 
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{ borderBottomColor: GOALS_COLOR }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: GOALS_COLOR }}
            >
              <Target className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-medium">
              {goal ? 'Edit Goal' : 'New Goal'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Goal Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Goal Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Get Interview with iHarbor"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-opacity-50"
              style={{ focusRingColor: GOALS_COLOR }}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') onClose();
              }}
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Initial Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-opacity-50"
              style={{ focusRingColor: GOALS_COLOR }}
            >
              <option value="toDo">To Do</option>
              <option value="inProgress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          {!goal && (
            <p className="text-sm text-gray-500 italic">
              You can add timeline entries after creating the goal
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 rounded-b-2xl flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="px-4 py-2 text-white rounded-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: GOALS_COLOR }}
          >
            {goal ? 'Save Changes' : 'Create Goal'}
          </button>
        </div>
      </div>
    </div>
  );
}