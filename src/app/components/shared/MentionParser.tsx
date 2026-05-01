import { MentionableEntity } from './MentionContext';
import { findMentionEntity } from './MentionMatcher';

export interface ParsedMention {
  text: string; // e.g., "@PT"
  entity: MentionableEntity | null;
  startIndex: number;
  endIndex: number;
}

export function parseMentions(
  text: string,
  entities: MentionableEntity[]
): ParsedMention[] {
  const mentions: ParsedMention[] = [];
  const mentionRegex = /@(\w+(?:\s+\w+)*)/g;
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    const mentionText = match[1]; // Text after @
    const fullMatch = match[0]; // Including @
    
    // Find matching entity with smart pluralization
    const entity = findMentionEntity(mentionText, entities);

    mentions.push({
      text: fullMatch,
      entity: entity || null,
      startIndex: match.index,
      endIndex: match.index + fullMatch.length,
    });
  }

  return mentions;
}

export function highlightMentions(
  text: string,
  entities: MentionableEntity[]
): React.ReactNode[] {
  const parsed = parseMentions(text, entities);
  
  if (parsed.length === 0) {
    return [text];
  }

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  parsed.forEach((mention, idx) => {
    // Add text before mention
    if (mention.startIndex > lastIndex) {
      parts.push(text.substring(lastIndex, mention.startIndex));
    }

    // Add styled mention
    if (mention.entity) {
      parts.push(
        <span
          key={`mention-${idx}`}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg font-medium"
          style={{
            backgroundColor: `${mention.entity.color}20`,
            color: mention.entity.color,
          }}
        >
          {mention.text}
        </span>
      );
    } else {
      // Unrecognized mention
      parts.push(
        <span
          key={`mention-${idx}`}
          className="text-slate-400"
        >
          {mention.text}
        </span>
      );
    }

    lastIndex = mention.endIndex;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts;
}