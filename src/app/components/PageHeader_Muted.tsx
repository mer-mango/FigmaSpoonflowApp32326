import React, { useState, useRef, useEffect } from 'react';
import { Plus, ArrowLeft, Sparkles, ChevronDown, CheckSquare, Users, Pin, Sunrise, Moon, ClipboardList, MessageCircle } from 'lucide-react';

interface PageHeaderMutedProps {
  title: string;
  subtitle?: string;
  newButtonLabel?: string;
  newButtonColor?: string;
  backgroundColor?: string;
  onNewClick?: () => void;
  customActions?: React.ReactNode;
  onBack?: () => void; // Back navigation handler
  showBackButton?: boolean; // Whether to show back button
  onQuickAddSelect?: (type: 'task' | 'contact' | 'content') => void; // Quick Add handler
  onJamieAction?: (type: 'plan-day' | 'wind-down' | 'post-meeting' | 'chat' | 'dev-skip-to-timeline') => void; // Ask Jamie handler
}

export function PageHeader_Muted({ 
  title, 
  subtitle, 
  newButtonLabel,
  newButtonColor = '#c198ad',
  backgroundColor = '#f7f7f9',
  onNewClick,
  customActions,
  onBack,
  showBackButton,
  onQuickAddSelect,
  onJamieAction
}: PageHeaderMutedProps) {
  const [showJamieDropdown, setShowJamieDropdown] = useState(false);
  const [showQuickAddDropdown, setShowQuickAddDropdown] = useState(false);
  const jamieDropdownRef = useRef<HTMLDivElement>(null);
  const quickAddDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (jamieDropdownRef.current && !jamieDropdownRef.current.contains(event.target as Node)) {
        setShowJamieDropdown(false);
      }
      if (quickAddDropdownRef.current && !quickAddDropdownRef.current.contains(event.target as Node)) {
        setShowQuickAddDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format today's date when title is "Today"
  const getTodayDate = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return now.toLocaleDateString('en-US', options);
  };

  // Use the formatted date as subtitle if title is "Today" and no subtitle provided
  const displaySubtitle = title === 'Today' && !subtitle ? getTodayDate() : subtitle;

  return (
    <div className="border-b border-slate-200/50 pt-[50px] pr-[50px] pb-[10px] pl-[50px]" style={{ backgroundColor: '#f7f7f9' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[50px]" style={{ maxWidth: 'calc(100% - 200px)' }}>
          <div style={{ maxWidth: '100%' }}>
            <h1 className="text-slate-900" style={{ fontFamily: 'Lora, serif', fontSize: '34px', fontWeight: 600, marginRight: '20px' }}>{title}</h1>
            {displaySubtitle && (
              <p className="text-slate-500 mt-1" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14pt', fontWeight: 400 }}>
                {displaySubtitle}
              </p>
            )}
          </div>
          
          {/* Page-specific New Button (next to header) */}
          {newButtonLabel && onNewClick && (
            <button 
              className="flex items-center gap-2 px-4 py-2.5 h-10 rounded-[20px] text-white hover:opacity-90 shadow-soft transition-all"
              style={{ backgroundColor: newButtonColor }}
              onClick={onNewClick}
            >
              <Plus className="w-4 h-4" />
              <span className="font-medium">{newButtonLabel}</span>
            </button>
          )}
          
          {/* Custom Actions (for documents page) */}
          {customActions}
        </div>
        
        <div className="flex items-center gap-3">
          {/* Ask Jamie Dropdown */}
          {onJamieAction && (
            <div className="relative" ref={jamieDropdownRef}>
              <button
                onClick={() => setShowJamieDropdown(!showJamieDropdown)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-[#6b2358] hover:bg-[#541c45] rounded-lg transition-colors shadow-sm"
                title="Ask Jamie"
              >
                <Sparkles className="w-4 h-4" />
                <span>Ask Jamie</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              {showJamieDropdown && (
                <div className="absolute right-0 mt-2 w-60 bg-white border border-gray-200 rounded-lg shadow-lg z-[100]">
                  <button
                    onClick={() => {
                      onJamieAction('plan-day');
                      setShowJamieDropdown(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#6b2358] flex items-center justify-center flex-shrink-0">
                      <Sunrise className="w-4 h-4 text-white" />
                    </div>
                    <span>Plan Your Day</span>
                  </button>
                  <button
                    onClick={() => {
                      onJamieAction('post-meeting');
                      setShowJamieDropdown(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#6b2358] flex items-center justify-center flex-shrink-0">
                      <ClipboardList className="w-4 h-4 text-white" />
                    </div>
                    <span>Post-Meeting Debrief</span>
                  </button>
                  <button
                    onClick={() => {
                      onJamieAction('wind-down');
                      setShowJamieDropdown(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#6b2358] flex items-center justify-center flex-shrink-0">
                      <Moon className="w-4 h-4 text-white" />
                    </div>
                    <span>Wind Down</span>
                  </button>
                  <button
                    onClick={() => {
                      onJamieAction('chat');
                      setShowJamieDropdown(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 last:rounded-b-lg transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#6b2358] flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-4 h-4 text-white" />
                    </div>
                    <span>Open Chat</span>
                  </button>
                </div>
              )}
            </div>
          )}
          
          {/* Quick Add Dropdown */}
          {onQuickAddSelect && (
            <div className="relative" ref={quickAddDropdownRef}>
              <button
                onClick={() => setShowQuickAddDropdown(!showQuickAddDropdown)}
                className="flex items-center justify-center w-9 h-9 text-white bg-[#c198ad] hover:bg-[#a77e93] rounded-full transition-colors shadow-sm"
                title="Quick Add"
              >
                <Plus className="w-5 h-5" />
              </button>
              {showQuickAddDropdown && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-[100]">
                  <button
                    onClick={() => {
                      onQuickAddSelect('task');
                      setShowQuickAddDropdown(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#c198ad] flex items-center justify-center flex-shrink-0">
                      <CheckSquare className="w-4 h-4 text-white" />
                    </div>
                    <span>Tasks</span>
                  </button>
                  <button
                    onClick={() => {
                      onQuickAddSelect('contact');
                      setShowQuickAddDropdown(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#8BA5A8] flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <span>Contacts</span>
                  </button>
                  <button
                    onClick={() => {
                      onQuickAddSelect('content');
                      setShowQuickAddDropdown(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 last:rounded-b-lg transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#deb0ad] flex items-center justify-center flex-shrink-0">
                      <Pin className="w-4 h-4 text-white" />
                    </div>
                    <span>Content</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Back Button - Subheader */}
      {showBackButton && onBack && (
        <div className="mt-2">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors"
            title="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>
      )}
    </div>
  );
}