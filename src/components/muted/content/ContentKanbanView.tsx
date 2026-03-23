/**
 * Content Kanban View
 * Kanban board view for content management
 */

import React from 'react';
import type { ContentItem } from '../../../types/content';

interface ContentKanbanViewProps {
  items: ContentItem[];
  onItemClick?: (item: ContentItem) => void;
}

export default function ContentKanbanView({ items, onItemClick }: ContentKanbanViewProps) {
  const columns = ['Idea', 'Drafting', 'Review', 'Scheduled', 'Published'];

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((column) => {
        const columnItems = items.filter((item) => item.status === column);
        
        return (
          <div key={column} className="flex-shrink-0 w-80">
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">{column}</h3>
                <span className="text-sm text-gray-600">{columnItems.length}</span>
              </div>
              
              <div className="space-y-3">
                {columnItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md cursor-pointer"
                    onClick={() => onItemClick?.(item)}
                  >
                    <h4 className="font-medium mb-2">{item.title}</h4>
                    {item.platform && (
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        {item.platform}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}