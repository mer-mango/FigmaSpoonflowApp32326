import { MentionableEntity } from './MentionContext';

/**
 * Smart matching for mentions that handles:
 * - Pluralization (breaks → break, routines → routine)
 * - Case insensitivity
 * - Partial matching
 * - Common abbreviations
 */

function normalizeForMatching(text: string): string[] {
  const normalized = text.toLowerCase().trim();
  const variants = [normalized];

  // Handle plural forms
  if (normalized.endsWith('ies')) {
    variants.push(normalized.slice(0, -3) + 'y'); // activities → activity
  } else if (normalized.endsWith('es')) {
    variants.push(normalized.slice(0, -2)); // breaks → break (though this could also be 'brea')
    variants.push(normalized.slice(0, -1)); // breaks → brake
  } else if (normalized.endsWith('s') && normalized.length > 2) {
    variants.push(normalized.slice(0, -1)); // breaks → break
  }

  return variants;
}

export function fuzzyMatchEntity(
  query: string,
  entity: MentionableEntity
): boolean {
  const queryVariants = normalizeForMatching(query);
  const nameVariants = normalizeForMatching(entity.name);

  // Check if any query variant matches any name variant
  for (const queryVar of queryVariants) {
    for (const nameVar of nameVariants) {
      if (nameVar.includes(queryVar) || queryVar.includes(nameVar)) {
        return true;
      }
    }
  }

  return false;
}

export function smartFilterEntities(
  query: string,
  entities: MentionableEntity[]
): MentionableEntity[] {
  if (!query) return entities;

  return entities.filter(entity => fuzzyMatchEntity(query, entity));
}

/**
 * Find exact or fuzzy match for a mention text
 */
export function findMentionEntity(
  mentionText: string,
  entities: MentionableEntity[]
): MentionableEntity | null {
  const normalized = mentionText.toLowerCase().trim();

  // First try exact match
  const exactMatch = entities.find(
    e => e.name.toLowerCase() === normalized
  );
  if (exactMatch) return exactMatch;

  // Try fuzzy match with pluralization
  const queryVariants = normalizeForMatching(mentionText);
  
  for (const entity of entities) {
    const nameVariants = normalizeForMatching(entity.name);
    
    // Check if any variant matches exactly
    for (const queryVar of queryVariants) {
      for (const nameVar of nameVariants) {
        if (queryVar === nameVar) {
          return entity;
        }
      }
    }
  }

  return null;
}
