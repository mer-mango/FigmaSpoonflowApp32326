/**
 * Jamie Task Intelligence
 * Provides proactive suggestions and task health analysis
 */

import type { Task } from '../types/task';
import type { Contact } from '../types/contact';
import type { CalendarEvent } from '../types/calendar';

export interface TaskSuggestion {
  id: string;
  type: 'create' | 'update' | 'schedule' | 'delegate';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  taskId?: string;
  contactId?: string;
  suggestedAction?: any;
}

export interface TaskNudge {
  id: string;
  taskId: string;
  type: 'overdue' | 'stuck' | 'needs_contact' | 'time_estimate';
  message: string;
  severity: 'info' | 'warning' | 'error';
}

export interface TaskIntelligenceIntent {
  isIntelligenceRequest: boolean;
  type?: 'suggest' | 'search' | 'health' | 'context';
  query?: string;
}

/**
 * Detect if user input is asking for task intelligence
 */
export function detectTaskIntelligenceIntent(text: string): TaskIntelligenceIntent {
  const lowerText = text.toLowerCase();
  
  // Check for suggestion requests
  if (lowerText.includes('suggest') || lowerText.includes('recommend') || lowerText.includes('what should')) {
    return { isIntelligenceRequest: true, type: 'suggest' };
  }
  
  // Check for search requests
  if (lowerText.includes('find task') || lowerText.includes('search task')) {
    return { isIntelligenceRequest: true, type: 'search', query: text };
  }
  
  // Check for health analysis
  if (lowerText.includes('task health') || lowerText.includes('overdue') || lowerText.includes('stuck')) {
    return { isIntelligenceRequest: true, type: 'health' };
  }
  
  // Check for context suggestions
  if (lowerText.includes('context') || lowerText.includes('related')) {
    return { isIntelligenceRequest: true, type: 'context' };
  }
  
  return { isIntelligenceRequest: false };
}

/**
 * Suggest next task to work on
 */
export function suggestNextTask(tasks: Task[]): Task | null {
  // Filter incomplete tasks
  const incompleteTasks = tasks.filter(t => !t.completed);
  
  if (incompleteTasks.length === 0) return null;
  
  // Sort by priority and due date
  const sorted = incompleteTasks.sort((a, b) => {
    // Priority comparison
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    const aPriority = priorityOrder[a.priority || 'medium'];
    const bPriority = priorityOrder[b.priority || 'medium'];
    
    if (aPriority !== bPriority) return aPriority - bPriority;
    
    // Due date comparison
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    
    return 0;
  });
  
  return sorted[0];
}

/**
 * Search tasks by query
 */
export function searchTasks(tasks: Task[], query: string): Task[] {
  const lowerQuery = query.toLowerCase();
  
  return tasks.filter(task => 
    task.title.toLowerCase().includes(lowerQuery) ||
    task.description?.toLowerCase().includes(lowerQuery) ||
    task.notes?.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Generate context-aware task suggestions
 */
export function generateContextSuggestions(
  tasks: Task[],
  contacts: Contact[],
  events: CalendarEvent[]
): { suggestions: TaskSuggestion[] } {
  const suggestions: TaskSuggestion[] = [];
  
  // This is a stub implementation
  // Future: Add intelligent suggestions based on task patterns, calendar availability, etc.
  
  return { suggestions };
}

/**
 * Analyze task health and generate nudges
 */
export function analyzeTaskHealth(
  tasks: Task[],
  contacts: Contact[]
): { nudges: TaskNudge[] } {
  const nudges: TaskNudge[] = [];
  
  const now = new Date();
  
  // Check for overdue tasks
  tasks.forEach(task => {
    if (!task.completed && task.dueDate) {
      const dueDate = new Date(task.dueDate);
      if (dueDate < now) {
        nudges.push({
          id: `overdue_${task.id}`,
          taskId: task.id,
          type: 'overdue',
          message: `Task "${task.title}" is overdue by ${Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))} days`,
          severity: 'error'
        });
      }
    }
  });
  
  return { nudges };
}