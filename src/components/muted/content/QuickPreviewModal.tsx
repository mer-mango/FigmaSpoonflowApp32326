/**
 * Quick Preview Modal
 * Preview content items without opening full editor
 */

import React from 'react';
import { X } from 'lucide-react';
import type { ContentItem } from '../../../types/content';

interface QuickPreviewModalProps {
  item: ContentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (item: ContentItem) => void;
}

export function QuickPreviewModal({ item, isOpen, onClose, onEdit }: QuickPreviewModalProps) {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold">{item.title}</h2>
            <div className="flex gap-2 mt-2">
              {item.platform && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                  {item.platform}
                </span>
              )}
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                {item.status}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="prose max-w-none">
          {item.content ? (
            <div dangerouslySetInnerHTML={{ __html: item.content }} />
          ) : (
            <p className="text-gray-500 italic">No content yet</p>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Close
          </button>
          {onEdit && (
            <button
              onClick={() => {
                onEdit(item);
                onClose();
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}