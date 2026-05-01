/**
 * Quick Preview Modal
 * Preview content items without opening full editor
 */

import React from 'react';
import { X, ExternalLink } from 'lucide-react';

interface QuickPreviewData {
  title: string;
  source?: string;
  sourceUrl?: string;
  date?: string;
  content?: string;
  snippet?: string;
  summary?: string;
}

interface QuickPreviewModalProps {
  data: QuickPreviewData;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickPreviewModal({ data, isOpen, onClose }: QuickPreviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex-1 pr-4">
            <h2 className="text-xl font-semibold text-slate-900" style={{ fontFamily: 'Lora, serif' }}>{data.title}</h2>
            {(data.source || data.date) && (
              <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                {data.source && <span>{data.source}</span>}
                {data.source && data.date && <span>•</span>}
                {data.date && <span>{data.date}</span>}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {data.summary && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
              <div className="text-xs font-medium text-blue-900 mb-1">Summary</div>
              <p className="text-sm text-blue-800">{data.summary}</p>
            </div>
          )}
          
          {data.content && (
            <div className="prose prose-slate max-w-none">
              <div className="whitespace-pre-wrap text-slate-700">{data.content}</div>
            </div>
          )}
          
          {!data.content && data.snippet && (
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-600">{data.snippet}</p>
            </div>
          )}
          
          {!data.content && !data.snippet && (
            <p className="text-slate-400 italic">No content to preview</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <div>
            {data.sourceUrl && (
              <a
                href={data.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-[#879fb5] hover:text-[#5f7e9a] transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View Original
              </a>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}