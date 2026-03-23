import React, { useState, useRef } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { DropdownPortal } from './DropdownPortal';

interface DueDatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  disabled?: boolean;
}

export function DueDatePicker({ value, onChange, disabled = false }: DueDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const quickOptions = [
    { label: 'Today', getValue: () => new Date() },
    { label: 'Tomorrow', getValue: () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }},
    { label: 'In 3 days', getValue: () => {
      const future = new Date();
      future.setDate(future.getDate() + 3);
      return future;
    }},
    { label: 'Next week', getValue: () => {
      const future = new Date();
      future.setDate(future.getDate() + 7);
      return future;
    }},
  ];

  const handleCustomDate = () => {
    const dateInput = document.createElement('input');
    dateInput.type = 'date';
    dateInput.style.position = 'absolute';
    dateInput.style.opacity = '0';
    dateInput.style.pointerEvents = 'none';
    
    if (value) {
      // Format date as YYYY-MM-DD in local timezone
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, '0');
      const day = String(value.getDate()).padStart(2, '0');
      dateInput.value = `${year}-${month}-${day}`;
    }
    
    dateInput.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      if (target.value) {
        // Parse YYYY-MM-DD as local date, not UTC
        const [year, month, day] = target.value.split('-').map(Number);
        onChange(new Date(year, month - 1, day));
      }
      setIsOpen(false);
      document.body.removeChild(dateInput);
    });
    
    document.body.appendChild(dateInput);
    dateInput.showPicker();
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center gap-1.5 text-xs text-slate-600
          px-2 py-1 rounded-lg
          transition-gentle
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-white/60 hover:shadow-subtle'}
        `}
      >
        <Calendar className="w-3.5 h-3.5" />
        <span>{value ? formatDate(value) : 'Set date'}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <DropdownPortal
        triggerRef={buttonRef}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <div className="w-36 bg-white/90 backdrop-blur-xl rounded-2xl shadow-soft border border-slate-200/50 overflow-hidden">
          {quickOptions.map((option, index) => (
            <button
              key={index}
              onClick={() => {
                onChange(option.getValue());
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-white/80 transition-gentle"
            >
              {option.label}
            </button>
          ))}
          <button
            onClick={handleCustomDate}
            className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-white/80 transition-gentle border-t border-slate-200/30"
          >
            Custom date...
          </button>
          {value && (
            <button
              onClick={() => {
                onChange(undefined);
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left text-sm text-slate-400 hover:bg-white/80 transition-gentle border-t border-slate-200/30"
            >
              Clear
            </button>
          )}
        </div>
      </DropdownPortal>
    </div>
  );
}