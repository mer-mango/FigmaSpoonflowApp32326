/**
 * Strip legacy blueprint system fields from content items
 * 
 * Removes deprecated fields that were part of the old blueprint system:
 * - blueprint
 * - starterMeta
 * - blueprintDraftContent
 * 
 * This is idempotent and safe for any input type.
 */
export function stripLegacyContentFields<T extends Record<string, any>>(
  item: T
): Omit<T, 'blueprint' | 'starterMeta' | 'blueprintDraftContent'> {
  // Guard against null, undefined, or non-object inputs
  if (!item || typeof item !== 'object') {
    return item as any;
  }

  const cleanItem = { ...item };
  delete (cleanItem as any).blueprint;
  delete (cleanItem as any).starterMeta;
  delete (cleanItem as any).blueprintDraftContent;
  return cleanItem as any;
}
