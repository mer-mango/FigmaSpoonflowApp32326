import React, { useState, useRef, useEffect, KeyboardEvent, ChangeEvent } from 'react';
import { useMentions, MentionableEntity } from './MentionContext';
import { smartFilterEntities } from './MentionMatcher';
import * as LucideIcons from 'lucide-react';
import { parseMentions } from './MentionParser';

interface MentionInputProps {
  value: string;
  onChange: (value: string, mentions?: MentionableEntity[]) => void;
  placeholder?: string;
  className?: string;
  type?: string;
}

export function MentionInput({ 
  value, 
  onChange, 
  placeholder, 
  className = '',
  type = 'text',
}: MentionInputProps) {
  const { entities } = useMentions();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<MentionableEntity[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionStart, setMentionStart] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Extract current @ query
  const getCurrentMentionQuery = (text: string, cursorPos: number): { query: string; start: number } | null => {
    const beforeCursor = text.substring(0, cursorPos);
    const atIndex = beforeCursor.lastIndexOf('@');
    
    if (atIndex === -1) return null;
    
    const afterAt = beforeCursor.substring(atIndex + 1);
    // Check if there's a space after @ (which would end the mention)
    if (afterAt.includes(' ')) return null;
    
    return {
      query: afterAt,
      start: atIndex,
    };
  };

  const handleTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart || 0;
    
    onChange(newValue);

    // Check for @ mentions
    const mentionQuery = getCurrentMentionQuery(newValue, cursorPos);
    
    if (mentionQuery) {
      setMentionStart(mentionQuery.start);
      const filtered = smartFilterEntities(mentionQuery.query, entities);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setSelectedIndex(0);
    } else {
      setShowSuggestions(false);
      setMentionStart(null);
    }
  };

  const insertMention = (entity: MentionableEntity) => {
    if (mentionStart === null) return;

    const before = value.substring(0, mentionStart);
    const after = value.substring(inputRef.current?.selectionStart || value.length);
    const newValue = `${before}@${entity.name} ${after}`;
    
    onChange(newValue);
    setShowSuggestions(false);
    setMentionStart(null);

    // Focus back on input
    setTimeout(() => {
      if (inputRef.current) {
        const newCursorPos = mentionStart + entity.name.length + 2;
        inputRef.current.focus();
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter' && suggestions.length > 0) {
      e.preventDefault();
      insertMention(suggestions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    if (dropdownRef.current && showSuggestions) {
      const selectedElement = dropdownRef.current.children[selectedIndex] as HTMLElement;
      selectedElement?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex, showSuggestions]);

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      routine: '#2f829b',
      task: '#6b2358',
      contact: '#6b7b98',
      playlist: '#034863',
      tag: '#a89bb4',
    };
    return colors[type] || '#6b7b98';
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      routine: 'Routine',
      task: 'Task',
      contact: 'Contact',
      playlist: 'Playlist',
      tag: 'Tag',
    };
    return labels[type] || type;
  };

  const renderIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName.split('-').map((word: string) => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('')];
    
    return IconComponent ? <IconComponent className="w-4 h-4" /> : null;
  };

  // Render text with colored mentions
  const renderStyledText = () => {
    const mentions = parseMentions(value, entities);
    
    if (mentions.length === 0) return null;
    
    // Extract padding from className
    let paddingX = 'px-4';
    let paddingY = 'py-3';
    if (className.includes('!px-5')) paddingX = 'px-5';
    if (className.includes('!py-4')) paddingY = 'py-4';
    
    // Build text parts (mix of mentions and regular text)
    const parts: { text: string; isMention: boolean; hasEntity: boolean }[] = [];
    let lastIndex = 0;
    
    mentions.forEach(mention => {
      // Add text before mention
      if (mention.startIndex > lastIndex) {
        parts.push({
          text: value.substring(lastIndex, mention.startIndex),
          isMention: false,
          hasEntity: false,
        });
      }
      
      // Add mention
      parts.push({
        text: mention.text,
        isMention: true,
        hasEntity: mention.entity !== null,
      });
      
      lastIndex = mention.endIndex;
    });
    
    // Add remaining text
    if (lastIndex < value.length) {
      parts.push({
        text: value.substring(lastIndex),
        isMention: false,
        hasEntity: false,
      });
    }
    
    return (
      <div 
        className={`absolute top-0 left-0 right-0 pointer-events-none whitespace-nowrap overflow-hidden ${paddingX} ${paddingY} flex items-center`}
        style={{ 
          fontSize: className.includes('!text-lg') ? '1.125rem' : 'inherit',
          height: '100%',
        }}
      >
        {parts.map((part, index) => {
          if (part.isMention && part.hasEntity) {
            return (
              <span 
                key={index} 
                style={{ 
                  textDecoration: 'underline',
                  textDecorationColor: '#6b2358',
                  textDecorationThickness: '2px',
                  textUnderlineOffset: '2px',
                  fontWeight: '600',
                  color: '#1e293b',
                }}
              >
                {part.text}
              </span>
            );
          }
          return <span key={index} style={{ color: '#1e293b' }}>{part.text}</span>;
        })}
      </div>
    );
  };

  const hasMentions = () => {
    const parsed = parseMentions(value, entities);
    return parsed.some(p => p.entity !== null);
  };

  return (
    <div className="relative">
      {/* Styled text overlay - shows colored mentions */}
      {hasMentions() && !showSuggestions && renderStyledText()}
      
      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`
          w-full px-4 py-3 
          bg-white/60 rounded-2xl
          border border-slate-200/50
          placeholder-slate-400
          focus:outline-none focus:ring-2 focus:ring-[#6b2358]/30 focus:border-[#6b2358]/30
          transition-gentle
          ${hasMentions() && !showSuggestions ? 'text-transparent caret-slate-800' : 'text-slate-800'}
          ${className}
        `}
        style={hasMentions() && !showSuggestions ? { caretColor: '#1e293b' } : {}}
      />

      {/* Autocomplete Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="
            absolute z-50 mt-2 w-full max-w-md
            bg-white/95 backdrop-blur-xl
            border border-slate-200/50
            rounded-2xl shadow-soft
            max-h-64 overflow-y-auto
          "
        >
          {suggestions.map((entity, index) => (
            <button
              key={entity.id}
              onClick={() => insertMention(entity)}
              className={`
                w-full px-4 py-3 text-left
                flex items-center gap-3
                transition-gentle
                ${index === selectedIndex 
                  ? 'bg-slate-100/80' 
                  : 'hover:bg-slate-50/50'
                }
                ${index === 0 ? 'rounded-t-2xl' : ''}
                ${index === suggestions.length - 1 ? 'rounded-b-2xl' : ''}
              `}
            >
              {/* Icon */}
              {entity.icon && (
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${entity.color}20` }}
                >
                  <div style={{ color: entity.color }}>
                    {renderIcon(entity.icon)}
                  </div>
                </div>
              )}

              {/* Name and Type */}
              <div className="flex-1">
                <div className="font-medium text-slate-800">{entity.name}</div>
                <div className="text-xs text-slate-500">{getTypeLabel(entity.type)}</div>
              </div>

              {/* Type Badge */}
              <div
                className="px-2 py-1 rounded-full text-xs font-medium"
                style={{ 
                  backgroundColor: `${getTypeColor(entity.type)}20`,
                  color: getTypeColor(entity.type),
                }}
              >
                @{entity.type}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Hint text */}
      {!showSuggestions && !value.includes('@') && (
        <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
        </div>
      )}
    </div>
  );
}