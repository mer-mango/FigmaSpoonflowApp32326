import React from 'react';
import { Flag } from 'lucide-react';

interface FlagToggleProps {
  flagged: boolean;
  onChange: (flagged: boolean) => void;
  disabled?: boolean;
}

export function FlagToggle({ flagged, onChange, disabled = false }: FlagToggleProps) {
  return (
    <button
      onClick={() => !disabled && onChange(!flagged)}
      disabled={disabled}
      className={`
        w-9 h-9 rounded-xl transition-gentle
        flex items-center justify-center
        ${flagged 
          ? 'bg-gradient-to-br from-[#e2a8b6] to-[#d8a5b8] shadow-subtle' 
          : 'bg-white/40 hover:bg-white/60 backdrop-blur-sm'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-gentle'}
      `}
      aria-label={flagged ? 'Remove flag' : 'Add flag'}
    >
      <Flag 
        className={`w-4 h-4 transition-gentle ${flagged ? 'text-white fill-white' : 'text-slate-400'}`}
        strokeWidth={2}
      />
    </button>
  );
}
