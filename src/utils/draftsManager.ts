/**
 * Drafts Manager
 * Handles saving and retrieving form drafts
 */

export interface Draft {
  id: string;
  type: 'intake' | 'discovery' | 'feedback';
  contactId: string;
  contactName: string;
  formData: any;
  lastModified: string;
  createdAt: string;
}

const DRAFTS_STORAGE_KEY = 'spoonflow_form_drafts';

/**
 * Save a draft
 */
export function saveDraft(draft: Omit<Draft, 'id' | 'createdAt' | 'lastModified'>): void {
  try {
    const drafts = getAllDrafts();
    const newDraft: Draft = {
      ...draft,
      id: `draft_${Date.now()}`,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };
    drafts.push(newDraft);
    localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
  } catch (error) {
    console.error('Error saving draft:', error);
  }
}

/**
 * Get all drafts
 */
export function getAllDrafts(): Draft[] {
  try {
    const stored = localStorage.getItem(DRAFTS_STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error loading drafts:', error);
    return [];
  }
}

/**
 * Delete a draft
 */
export function deleteDraft(draftId: string): void {
  try {
    const drafts = getAllDrafts();
    const filtered = drafts.filter(d => d.id !== draftId);
    localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting draft:', error);
  }
}

/**
 * Format last modified date
 */
export function formatLastModified(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString();
}
