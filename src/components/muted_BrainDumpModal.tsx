/**
 * Brain Dump Modal
 * Quick capture interface for thoughts and ideas
 */

import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Button } from './ui/button';

interface BrainDumpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (content: string, type: 'task' | 'note' | 'idea') => void;
}

export function BrainDumpModal({ isOpen, onClose, onSave }: BrainDumpModalProps) {
  const [content, setContent] = useState('');
  const [type, setType] = useState<'task' | 'note' | 'idea'>('note');

  if (!isOpen) return null;

  const handleSave = () => {
    if (content.trim()) {
      onSave?.(content, type);
      setContent('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Brain Dump</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => setType('task')}
              className={`px-4 py-2 rounded-lg ${
                type === 'task' ? 'bg-blue-500 text-white' : 'bg-gray-100'
              }`}
            >
              Task
            </button>
            <button
              onClick={() => setType('note')}
              className={`px-4 py-2 rounded-lg ${
                type === 'note' ? 'bg-blue-500 text-white' : 'bg-gray-100'
              }`}
            >
              Note
            </button>
            <button
              onClick={() => setType('idea')}
              className={`px-4 py-2 rounded-lg ${
                type === 'idea' ? 'bg-blue-500 text-white' : 'bg-gray-100'
              }`}
            >
              Idea
            </button>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full h-48 p-4 border rounded-lg resize-none"
            autoFocus
          />

          <div className="flex justify-end gap-2">
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!content.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}