import React, { useRef, TextareaHTMLAttributes } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useDictation } from '../../hooks/useDictation';

interface DictationTextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  showDictationButton?: boolean;
  dictationButtonPosition?: 'top-right' | 'bottom-right';
  onDictationStart?: () => void;
  onDictationEnd?: () => void;
}

export function DictationTextarea({
  value,
  onChange,
  showDictationButton = true,
  dictationButtonPosition = 'top-right',
  onDictationStart,
  onDictationEnd,
  className = '',
  ...textareaProps
}: DictationTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cursorPositionRef = useRef<number>(0);

  const { isListening, isSupported, toggleListening } = useDictation({
    onTranscript: (transcript, isFinal) => {
      if (isFinal) {
        // Insert transcript at cursor position
        const cursorPos = cursorPositionRef.current;
        const textBeforeCursor = value.substring(0, cursorPos);
        const textAfterCursor = value.substring(cursorPos);
        
        const newValue = textBeforeCursor + (textBeforeCursor && !textBeforeCursor.endsWith(' ') ? ' ' : '') + transcript + ' ' + textAfterCursor;
        onChange(newValue);
        
        // Update cursor position
        cursorPositionRef.current = cursorPos + transcript.length + 1;
        
        // Focus textarea and set cursor position
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(cursorPositionRef.current, cursorPositionRef.current);
          }
        }, 10);
      }
    },
  });

  // Track cursor position
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    cursorPositionRef.current = e.target.selectionStart || 0;
  };

  const handleTextareaClick = () => {
    if (textareaRef.current) {
      cursorPositionRef.current = textareaRef.current.selectionStart || 0;
    }
  };

  const handleDictationToggle = () => {
    if (!isListening && onDictationStart) {
      onDictationStart();
    } else if (isListening && onDictationEnd) {
      onDictationEnd();
    }
    
    // Update cursor position before starting
    if (textareaRef.current && !isListening) {
      cursorPositionRef.current = textareaRef.current.selectionStart || value.length;
    }
    
    toggleListening();
  };

  const positionClasses = {
    'top-right': 'top-3 right-3',
    'bottom-right': 'bottom-3 right-3',
  };

  return (
    <div className="relative group">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleTextareaChange}
        onClick={handleTextareaClick}
        onKeyUp={handleTextareaClick}
        className={className}
        {...textareaProps}
      />
      
      {showDictationButton && isSupported && (
        <button
          type="button"
          onClick={handleDictationToggle}
          className={`
            absolute ${positionClasses[dictationButtonPosition]}
            w-8 h-8 rounded-lg
            flex items-center justify-center
            transition-all
            ${isListening 
              ? 'bg-red-500 text-white animate-pulse shadow-soft' 
              : 'bg-white/80 backdrop-blur-sm text-slate-500 hover:bg-[#6b2358]/10 hover:text-[#6b2358] opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 shadow-subtle'
            }
          `}
          title={isListening ? 'Stop dictation (click or pause speaking)' : 'Start dictation'}
        >
          {isListening ? (
            <MicOff className="w-4 h-4" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </button>
      )}
    </div>
  );
}
