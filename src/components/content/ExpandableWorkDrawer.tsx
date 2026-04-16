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
        className="w-full flex items-center justify-between px-4 py-1.5 hover:bg-slate-50/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon && (
            <div className="w-5 h-5 bg-[#6b2358]/10 rounded-md flex items-center justify-center flex-shrink-0">
              {icon}
            </div>
          )}
          <div className="text-left">
            <h3 className="font-medium text-slate-800 text-[14px] leading-tight">{title}</h3>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
        )}
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-slate-200 bg-white">
          {/* Drawer Content */}
          <div className="p-4 bg-[#f7f7f980]">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}