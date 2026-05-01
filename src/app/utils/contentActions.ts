/**
 * Content Actions
 * Utilities for managing content status changes and workflows
 */

import type { ContentItem, ContentStatus } from '../types/content';

export interface RepurposeDecision {
  sourceId: string;
  repurposeIds: string[];
  action: 'approve' | 'reject' | 'edit';
}

export interface StatusChangeRequest {
  itemId: string;
  currentStatus: ContentStatus;
  newStatus: ContentStatus;
  reason?: string;
}

/**
 * Request a content status change with validation
 */
export async function requestContentStatusChange(
  item: ContentItem,
  newStatus: ContentStatus
): Promise<{ success: boolean; error?: string }> {
  // Validate status transition
  const validTransitions: Record<ContentStatus, ContentStatus[]> = {
    'Idea': ['Drafting', 'Archived'],
    'Drafting': ['Review', 'Idea', 'Archived'],
    'Review': ['Scheduled', 'Drafting', 'Archived'],
    'Scheduled': ['Published', 'Review', 'Archived'],
    'Published': ['Archived'],
    'Repurposing': ['Review', 'Archived'],
    'Archived': ['Idea', 'Drafting']
  };

  const allowedTransitions = validTransitions[item.status] || [];
  
  if (!allowedTransitions.includes(newStatus)) {
    return {
      success: false,
      error: `Cannot transition from ${item.status} to ${newStatus}`
    };
  }

  // Additional validation based on status
  if (newStatus === 'Scheduled' && !item.scheduledDate) {
    return {
      success: false,
      error: 'Scheduled date required to move to Scheduled status'
    };
  }

  if (newStatus === 'Published' && !item.publishDate) {
    return {
      success: false,
      error: 'Publish date required to move to Published status'
    };
  }

  return { success: true };
}

/**
 * Check if content is ready for status change
 */
export function canChangeStatus(
  item: ContentItem,
  newStatus: ContentStatus
): boolean {
  const validTransitions: Record<ContentStatus, ContentStatus[]> = {
    'Idea': ['Drafting', 'Archived'],
    'Drafting': ['Review', 'Idea', 'Archived'],
    'Review': ['Scheduled', 'Drafting', 'Archived'],
    'Scheduled': ['Published', 'Review', 'Archived'],
    'Published': ['Archived'],
    'Repurposing': ['Review', 'Archived'],
    'Archived': ['Idea', 'Drafting']
  };

  const allowedTransitions = validTransitions[item.status] || [];
  return allowedTransitions.includes(newStatus);
}

/**
 * Get next logical status for content
 */
export function getNextStatus(currentStatus: ContentStatus): ContentStatus | null {
  const statusFlow: Record<ContentStatus, ContentStatus | null> = {
    'Idea': 'Drafting',
    'Drafting': 'Review',
    'Review': 'Scheduled',
    'Scheduled': 'Published',
    'Published': null,
    'Repurposing': 'Review',
    'Archived': null
  };

  return statusFlow[currentStatus];
}

/**
 * Validate content completeness for status
 */
export function validateContentForStatus(
  item: ContentItem,
  status: ContentStatus
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  switch (status) {
    case 'Drafting':
      if (!item.title) errors.push('Title is required');
      break;
    case 'Review':
      if (!item.title) errors.push('Title is required');
      if (!item.content || item.content.trim() === '') {
        errors.push('Content is required');
      }
      break;
    case 'Scheduled':
      if (!item.title) errors.push('Title is required');
      if (!item.content) errors.push('Content is required');
      if (!item.scheduledDate) errors.push('Scheduled date is required');
      if (!item.platform) errors.push('Platform is required');
      break;
    case 'Published':
      if (!item.title) errors.push('Title is required');
      if (!item.content) errors.push('Content is required');
      if (!item.publishDate) errors.push('Publish date is required');
      if (!item.platform) errors.push('Platform is required');
      break;
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
