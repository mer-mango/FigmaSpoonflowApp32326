/**
 * Date Index Utility
 * 
 * Provides a unified "time-based spine" for the app.
 * All date-based items (meetings, tasks, content, nurtures) flow through here.
 * 
 * Design Principles:
 * - Google Calendar is source of truth for meetings ONLY
 * - App state (localStorage) is source of truth for tasks/content/nurtures
 * - Dates are normalized to YYYY-MM-DD for consistent comparison
 * - Each item type has a clear date field mapping
 */

import { Task } from '../components/TasksPage';
import { ContentItem } from '../types/content';
import { NurtureToDo } from '../components/muted_NurturesView';
import { CalendarEvent } from '../components/CalendarPage';

/**
 * Unified time-based item type
 * Wraps all date-based items with a common interface
 */
export interface TimeBasedItem {
  id: string;
  type: 'meeting' | 'task' | 'content' | 'nurture';
  date: string; // YYYY-MM-DD format
  time?: string; // HH:MM format for meetings
  title: string;
  
  // Original item data (for navigation to detail views)
  meeting?: CalendarEvent;
  task?: Task;
  content?: ContentItem;
  nurture?: NurtureToDo;
  
  // Display metadata
  status?: string;
  priority?: boolean;
  color?: string;
  contact?: {
    id?: string;
    name: string;
    initials?: string;
  };
}

/**
 * Date normalization utilities
 */

/**
 * Convert any date to YYYY-MM-DD format
 */
export function normalizeDate(date: Date | string): string {
  if (typeof date === 'string') {
    // If already in YYYY-MM-DD format, return as-is
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    // Otherwise parse and normalize
    date = new Date(date);
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDate(): string {
  return normalizeDate(new Date());
}

/**
 * Check if two dates are the same day
 */
export function isSameDate(date1: string | Date, date2: string | Date): boolean {
  return normalizeDate(date1) === normalizeDate(date2);
}

/**
 * Alias for isSameDate (for consistency with naming convention)
 */
export function sameDay(a: Date, b: Date): boolean {
  return normalizeDate(a) === normalizeDate(b);
}

/**
 * Alias for normalizeDate (returns YYYY-MM-DD string)
 */
export function toDateKey(date: Date): string {
  return normalizeDate(date);
}

/**
 * Get HH:MM format from Date
 */
export function extractTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Type-specific query functions
 */

/**
 * Get all meetings for a specific date
 */
export function getMeetingsForDay(meetings: CalendarEvent[], date: Date | string): CalendarEvent[] {
  const targetDate = normalizeDate(date);
  const filteredMeetings = meetings.filter(meeting => {
    if (!meeting.startTime) return false;
    return normalizeDate(meeting.startTime) === targetDate;
  });
  
  // Sort by start time (chronological order: morning to night)
  return filteredMeetings.sort((a, b) => {
    if (!a.startTime || !b.startTime) return 0;
    return a.startTime.getTime() - b.startTime.getTime();
  });
}

/**
 * Get all tasks for a specific date
 * Includes tasks due on that date AND overdue tasks (due before but not completed)
 * @param tasks - Array of tasks to filter
 * @param date - Target date to filter by
 * @param includeOverdue - Whether to include overdue tasks (default: true for backward compatibility)
 */
export function getTasksForDay(tasks: Task[], date: Date | string, includeOverdue: boolean = true): Task[] {
  const targetDate = normalizeDate(date);
  return tasks.filter(task => {
    if (!task.dueDate) return false;
    
    // Exclude archived tasks
    if (task.archived || task.status === 'archived') return false;
    
    const taskDate = normalizeDate(task.dueDate);
    
    // Include if task is due exactly on target date
    if (taskDate === targetDate) {
      return true;
    }
    
    // Include overdue tasks (due before target date and not completed) only if requested
    if (includeOverdue && taskDate < targetDate && task.status !== 'done') {
      return true;
    }
    
    return false;
  });
}

/**
 * Get all content items for a specific date
 * Uses scheduledDate (primary) or publishedDate (fallback)
 */
export function getContentForDay(content: ContentItem[], date: Date | string): ContentItem[] {
  const targetDate = normalizeDate(date);
  return content.filter(item => {
    const dateToUse = item.scheduledDate || item.publishedDate;
    if (!dateToUse) return false;
    return normalizeDate(dateToUse) === targetDate;
  });
}

/**
 * Get all nurture items for a specific date
 */
export function getNurturesForDay(nurtures: NurtureToDo[], date: Date | string): NurtureToDo[] {
  const targetDate = normalizeDate(date);
  return nurtures.filter(nurture => {
    if (!nurture.dueDate) return false;
    return normalizeDate(nurture.dueDate) === targetDate;
  });
}

/**
 * Date-based item converters
 */

/**
 * Convert CalendarEvent (meeting) to TimeBasedItem
 */
export function meetingToTimeBasedItem(meeting: CalendarEvent): TimeBasedItem | null {
  if (!meeting.startTime) return null;
  
  return {
    id: meeting.id,
    type: 'meeting',
    date: normalizeDate(meeting.startTime),
    time: extractTime(meeting.startTime),
    title: meeting.title,
    meeting,
    color: meeting.color,
    contact: meeting.contact,
  };
}

/**
 * Convert Task to TimeBasedItem
 */
export function taskToTimeBasedItem(task: Task): TimeBasedItem | null {
  if (!task.dueDate) return null;
  
  return {
    id: task.id,
    type: 'task',
    date: normalizeDate(task.dueDate),
    title: task.title,
    task,
    status: task.status,
    priority: task.priority === 'high',
    contact: task.contact,
  };
}

/**
 * Convert ContentItem to TimeBasedItem
 * Uses scheduledDate (primary) or publishedDate (fallback)
 */
export function contentToTimeBasedItem(content: ContentItem): TimeBasedItem | null {
  const dateToUse = content.scheduledDate || content.publishedDate;
  if (!dateToUse) return null;
  
  return {
    id: content.id,
    type: 'content',
    date: normalizeDate(dateToUse),
    title: content.title,
    content,
    status: content.status,
  };
}

/**
 * Convert NurtureToDo to TimeBasedItem
 */
export function nurtureToTimeBasedItem(nurture: NurtureToDo): TimeBasedItem | null {
  if (!nurture.dueDate) return null;
  
  return {
    id: nurture.id,
    type: 'nurture',
    date: normalizeDate(nurture.dueDate),
    title: `Nurture: ${nurture.contactName}`,
    nurture,
    status: nurture.status,
    priority: nurture.priority,
    contact: {
      id: nurture.contactId,
      name: nurture.contactName,
    },
  };
}

/**
 * Main date index functions
 */

/**
 * Get all time-based items for a specific date
 */
export function getItemsForDate(
  date: string | Date,
  options: {
    meetings: CalendarEvent[];
    tasks: Task[];
    content: ContentItem[];
    nurtures: NurtureToDo[];
  }
): TimeBasedItem[] {
  const targetDate = normalizeDate(date);
  const items: TimeBasedItem[] = [];
  
  // Add meetings
  options.meetings.forEach(meeting => {
    const item = meetingToTimeBasedItem(meeting);
    if (item && item.date === targetDate) {
      items.push(item);
    }
  });
  
  // Add tasks
  options.tasks.forEach(task => {
    const item = taskToTimeBasedItem(task);
    if (item && item.date === targetDate) {
      items.push(item);
    }
  });
  
  // Add content
  options.content.forEach(contentItem => {
    const item = contentToTimeBasedItem(contentItem);
    if (item && item.date === targetDate) {
      items.push(item);
    }
  });
  
  // Add nurtures
  options.nurtures.forEach(nurture => {
    const item = nurtureToTimeBasedItem(nurture);
    if (item && item.date === targetDate) {
      items.push(item);
    }
  });
  
  // Sort by time (meetings first, then others)
  return items.sort((a, b) => {
    // Meetings with times go first, sorted by time
    if (a.time && b.time) {
      return a.time.localeCompare(b.time);
    }
    if (a.time) return -1;
    if (b.time) return 1;
    
    // Then sort by type priority: tasks, content, nurtures
    const typePriority = { task: 1, content: 2, nurture: 3, meeting: 0 };
    return typePriority[a.type] - typePriority[b.type];
  });
}

/**
 * Get counts by type for a specific date
 */
export function getDateCounts(
  date: string | Date,
  options: {
    meetings: CalendarEvent[];
    tasks: Task[];
    content: ContentItem[];
    nurtures: NurtureToDo[];
  }
): {
  meetings: number;
  tasks: number;
  content: number;
  nurtures: number;
  total: number;
} {
  const items = getItemsForDate(date, options);
  
  return {
    meetings: items.filter(i => i.type === 'meeting').length,
    tasks: items.filter(i => i.type === 'task').length,
    content: items.filter(i => i.type === 'content').length,
    nurtures: items.filter(i => i.type === 'nurture').length,
    total: items.length,
  };
}

/**
 * Get all dates that have at least one item
 */
export function getDatesWithItems(
  options: {
    meetings: CalendarEvent[];
    tasks: Task[];
    content: ContentItem[];
    nurtures: NurtureToDo[];
  }
): string[] {
  const datesSet = new Set<string>();
  
  // Collect all unique dates
  options.meetings.forEach(meeting => {
    if (meeting.startTime) {
      datesSet.add(normalizeDate(meeting.startTime));
    }
  });
  
  options.tasks.forEach(task => {
    if (task.dueDate) {
      datesSet.add(normalizeDate(task.dueDate));
    }
  });
  
  options.content.forEach(content => {
    const dateToUse = content.scheduledDate || content.publishedDate;
    if (dateToUse) {
      datesSet.add(normalizeDate(dateToUse));
    }
  });
  
  options.nurtures.forEach(nurture => {
    if (nurture.dueDate) {
      datesSet.add(normalizeDate(nurture.dueDate));
    }
  });
  
  return Array.from(datesSet).sort();
}