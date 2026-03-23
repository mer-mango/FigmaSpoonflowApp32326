import React from 'react';
import { Sparkles } from 'lucide-react';
import { useMentions } from './MentionContext';
import { parseMentions, ParsedMention } from './MentionParser';
import * as LucideIcons from 'lucide-react';

interface MentionSummaryProps {
  text: string;
  className?: string;
}

export function MentionSummary({ text, className = '' }: MentionSummaryProps) {
  const { entities } = useMentions();
  const parsed = parseMentions(text, entities);
  const validMentions = parsed.filter(m => m.entity !== null);

  if (validMentions.length === 0) {
    return null;
  }

  // Count mentions by entity
  const mentionCounts = validMentions.reduce((acc, mention) => {
    if (!mention.entity) return acc;
    const key = mention.entity.id;
    if (!acc[key]) {
      acc[key] = { entity: mention.entity, count: 0 };
    }
    acc[key].count++;
    return acc;
  }, {} as Record<string, { entity: any; count: number }>);

  const renderIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName.split('-').map((word: string) => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('')];
    
    return IconComponent ? <IconComponent className="w-3.5 h-3.5" /> : null;
  };

  return (
    <div className={`
      mt-3 px-4 py-3 
      bg-[#6b2358]/5 
      border border-[#6b2358]/10
      rounded-2xl
      ${className}
    `}>
      <div className="flex items-start gap-2">
        <Sparkles className="w-4 h-4 text-[#6b2358] mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <div className="text-xs font-medium text-[#6b2358] mb-2">
            Jamie understood:
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.values(mentionCounts).map(({ entity, count }) => (
              <div
                key={entity.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium"
                style={{
                  backgroundColor: `${entity.color}15`,
                  color: entity.color,
                  border: `1px solid ${entity.color}30`,
                }}
              >
                {entity.icon && (
                  <div style={{ color: entity.color }}>
                    {renderIcon(entity.icon)}
                  </div>
                )}
                {count > 1 && <span className="font-semibold">{count}×</span>}
                <span>{entity.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
