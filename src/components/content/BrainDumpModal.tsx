import React, { useState } from 'react';
import { X } from 'lucide-react';

interface BrainDumpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (brainDump: { id: string; content: string; timestamp: string; tags?: string[] }) => void;
}

export function BrainDumpModal({ isOpen, onClose, onSave }: BrainDumpModalProps) {
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    if (content.trim()) {
      const brainDump = {
        id: `bd_${Date.now()}`,
        content: content.trim(),
        timestamp: new Date().toISOString(),
        tags: tags.split(',').map(t => t.trim()).filter(Boolean)
      };
      onSave(brainDump);
      setContent('');
      setTags('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Brain Dump</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your thoughts
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind? Capture ideas, snippets, or inspiration..."
              className="w-full h-48 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (optional, comma-separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. patient-care, innovation, leadership"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!content.trim()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
