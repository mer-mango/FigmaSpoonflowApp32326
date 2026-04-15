import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ExpandableWorkDrawerProps {
  title: string;
  summary: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export function ExpandableWorkDrawer({ 
  title, 
  summary, 
  isExpanded, 
  onToggle, 
  children,
  icon 
}: ExpandableWorkDrawerProps) {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      {/* Collapsed Header - Always Visible */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-2.5 hover:bg-slate-50/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-7 h-7 bg-[#6b2358]/10 rounded-lg flex items-center justify-center flex-shrink-0">
              {icon}
            </div>
          )}
          <div className="text-left">
            <h3 className="font-medium text-slate-800 text-[16px]">{title}</h3>
            {!isExpanded && (
              <p className="text-sm text-slate-500">{summary}</p>
            )}
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
        )}
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-slate-200 bg-white">
          {/* Expanded Header with Collapse Button */}
          <div className="px-6 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <p className="text-sm text-slate-600">{summary}</p>
            <button
              onClick={onToggle}
              className="text-xs text-[#6b2358] hover:text-[#6b2358]/80 font-medium transition-colors"
            >
              Collapse
            </button>
          </div>
          
          {/* Drawer Content */}
          <div className="p-6 bg-[#f7f7f980]">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
