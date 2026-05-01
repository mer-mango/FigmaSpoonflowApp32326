import React, { useState, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { DropdownPortal } from './DropdownPortal';

export type TaskStatus = 'to-do' | 'in-progress' | 'awaiting' | 'done';

interface StatusOption {
  value: TaskStatus;
  label: string;
  color: string;
  bgColor: string;
}

interface StatusDropdownProps {
  value: TaskStatus;
  onChange: (status: TaskStatus) => void;
  disabled?: boolean;
}

const statusOptions: StatusOption[] = [
  { 
    value: 'to-do', 
    label: 'To Do', 
    color: '#e2a8b6',
    bgColor: 'rgba(226, 168, 182, 0.15)'
  },
  { 
    value: 'in-progress', 
    label: 'In Progress', 
    color: '#eec9c6',
    bgColor: 'rgba(238, 201, 198, 0.15)'
  },
  { 
    value: 'awaiting', 
    label: 'Awaiting', 
    color: '#9fb8cf',
    bgColor: 'rgba(159, 184, 207, 0.15)'
  },
  { 
    value: 'done', 
    label: 'Done', 
    color: '#a5bfa5',
    bgColor: 'rgba(165, 191, 165, 0.15)'
  },
];

export function StatusDropdown({ value, onChange, disabled = false }: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const currentOption = statusOptions.find(opt => opt.value === value) || statusOptions[0];

  const handleSelect = (status: TaskStatus) => {
    onChange(status);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          px-3 py-1.5 rounded-xl text-sm font-medium
          flex items-center gap-2
          transition-gentle backdrop-blur-sm
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-gentle'}
        `}
        style={{ 
          backgroundColor: currentOption.bgColor,
          border: `1.5px solid ${currentOption.color}`
        }}
      >
        <div 
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: currentOption.color }}
        />
        <span style={{ color: currentOption.color }}>{currentOption.label}</span>
        <ChevronDown 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          style={{ color: currentOption.color }}
        />
      </button>

      <DropdownPortal
        triggerRef={buttonRef}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <div className="w-40 bg-white/90 backdrop-blur-xl rounded-2xl shadow-soft border border-slate-200/50 overflow-hidden">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`
                w-full px-4 py-3.5 flex items-center gap-3
                transition-gentle text-left
                ${option.value === value ? 'bg-white/80' : 'hover:bg-white/60'}
              `}
              style={{ backgroundColor: option.value === value ? option.bgColor : undefined }}
            >
              <div 
                className="w-3 h-3 rounded-full shadow-subtle"
                style={{ backgroundColor: option.color }}
              />
              <span className="text-sm font-medium text-slate-700">{option.label}</span>
            </button>
          ))}
        </div>
      </DropdownPortal>
    </div>
  );
}