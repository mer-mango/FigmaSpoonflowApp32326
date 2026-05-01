/**
 * Formatting Toolbar
 * Rich text formatting controls
 */

import React from 'react';
import { Bold, Italic, Underline, List, ListOrdered } from 'lucide-react';

interface FormattingToolbarProps {
  onFormat?: (format: string) => void;
}

export function FormattingToolbar({ onFormat }: FormattingToolbarProps) {
  return (
    <div className="flex gap-2 p-2 border-b">
      <button 
        className="p-2 hover:bg-gray-100 rounded"
        onClick={() => onFormat?.('bold')}
      >
        <Bold className="h-4 w-4" />
      </button>
      <button 
        className="p-2 hover:bg-gray-100 rounded"
        onClick={() => onFormat?.('italic')}
      >
        <Italic className="h-4 w-4" />
      </button>
      <button 
        className="p-2 hover:bg-gray-100 rounded"
        onClick={() => onFormat?.('underline')}
      >
        <Underline className="h-4 w-4" />
      </button>
      <button 
        className="p-2 hover:bg-gray-100 rounded"
        onClick={() => onFormat?.('bulletList')}
      >
        <List className="h-4 w-4" />
      </button>
      <button 
        className="p-2 hover:bg-gray-100 rounded"
        onClick={() => onFormat?.('orderedList')}
      >
        <ListOrdered className="h-4 w-4" />
      </button>
    </div>
  );
}
