/**
 * Repurposing Modal
 * Handles content repurposing workflow
 */

import React from 'react';

interface RepurposingModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentId?: string;
}

export function RepurposingModal({ isOpen, onClose, contentId }: RepurposingModalProps) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
        <h2 className="text-2xl font-bold mb-4">Repurpose Content</h2>
        <p className="text-sm text-gray-600 mb-4">Repurposing modal coming soon...</p>
        <button 
          onClick={onClose}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg"
        >
          Close
        </button>
      </div>
    </div>
  );
}
