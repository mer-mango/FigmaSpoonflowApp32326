/**
 * Content Task Sync Utility
 * 
 * Synchronizes content items with today's publish date to tasks
 * so they appear in the AM/PM wizards as "content" to-dos
 * 
 * Note: This creates task data that should be added to the main task list
 * The actual task creation happens in App.tsx via setAllTasks
 */

import type { ContentItem } from '../types/content';
import type { Task } from '../types/task';

/**
 * Format date string to YYYY-MM-DD in local timezone
 */
function formatDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get today's date in YYYY-MM-DD format (local timezone)
 */
function getTodayLocal(): string {
  return formatDateLocal(new Date());
}

/**
 * Create task data for a content item
 * Returns the task object that should be added to the task list
 */
export function createContentTaskData(contentItem: ContentItem): Partial<Task> | null {
  if (!contentItem.publishDate) {
    return null;
  }
  
  return {
    id: `content-task-${contentItem.id}`,
    title: `Publish: ${contentItem.title}`,
    description: `${contentItem.platform || 'Content'} - ${contentItem.status}`,
    taskType: 'content',
    dueDate: contentItem.publishDate,
    status: contentItem.status === 'Published' ? 'done' : 'toDo',
    createdAt: new Date().toISOString(),
  };
}

/**
 * Get content items that are due today
 */
export function getTodaysContentItems(contentItems: ContentItem[]): ContentItem[] {
  const today = getTodayLocal();
  return contentItems.filter(item => item.publishDate === today);
}

/**
 * Check if a content item should have a task created
 */
export function shouldCreateContentTask(contentItem: ContentItem): boolean {
  return !!contentItem.publishDate && contentItem.status !== 'Published';
}
