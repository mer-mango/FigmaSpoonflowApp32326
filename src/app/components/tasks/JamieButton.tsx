import React from 'react';
import { Sparkles } from 'lucide-react';

interface JamieButtonProps {
  onAskJamie: () => void;
  disabled?: boolean;
  showLabel?: boolean;
}

export function JamieButton({ onAskJamie, disabled = false, showLabel = false }: JamieButtonProps) {
  return (
    <button
      onClick={onAskJamie}
      disabled={disabled}
      className={`
        ${showLabel ? 'px-3 py-2 gap-2' : 'w-9 h-9'} 
        rounded-xl transition-gentle
        flex items-center justify-center
        bg-white/40 hover:bg-[#5e2350]/10 backdrop-blur-sm
        ${showLabel ? '' : 'opacity-0 group-hover:opacity-100'}
        ${disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:shadow-subtle'}
      `}
      aria-label="Ask Jamie for help"
      title="Get Me Started"
    >
      <Sparkles 
        className={`${showLabel ? 'w-4 h-4' : 'w-4 h-4'} transition-gentle ${disabled ? 'text-slate-300' : 'text-[#5e2350] hover:text-[#5e2350]/80'}`}
        strokeWidth={2}
        fill="currentColor"
      />
      {showLabel && (
        <span className={`text-sm ${disabled ? 'text-slate-300' : 'text-[#5e2350]'}`}>
          Start My Task
        </span>
      )}
    </button>
  );
}