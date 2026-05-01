/**
 * Published Content Viewer
 * View and manage published content
 */

import React from 'react';
import type { ContentItem } from '../../types/content';

interface PublishedContentViewerProps {
  items: ContentItem[];
  onItemClick?: (item: ContentItem) => void;
}

export function PublishedContentViewer({ items, onItemClick }: PublishedContentViewerProps) {
  const publishedItems = items.filter(item => item.status === 'Published');

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Published Content</h3>
      
      {publishedItems.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No published content yet
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {publishedItems.map((item) => (
            <div
              key={item.id}
              className="p-4 border rounded-lg hover:shadow-md cursor-pointer"
              onClick={() => onItemClick?.(item)}
            >
              <h4 className="font-medium mb-2">{item.title}</h4>
              {item.platform && (
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                  {item.platform}
                </span>
              )}
              {item.publishDate && (
                <p className="text-sm text-gray-500 mt-2">
                  Published: {new Date(item.publishDate).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
