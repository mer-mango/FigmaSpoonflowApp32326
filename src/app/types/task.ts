/**
 * Canonical Task Type - Single Source of Truth
 * 
 * This is the ONE TRUE task type used across the entire app.
 * Tasks Page, Today Page, AM Wizard, and all other components
 * should import from here.
 */

import { TaskType } from '../utils/taskTypes';

export interface Task {
  id: string;
  title: string;
  description?: string;
  
  // Status & Progress
  status: 'toDo' | 'inProgress' | 'awaitingReply' | 'done' | 'archived';
  isFlagged?: boolean;
  archived?: boolean;
  
  // Scheduling
  dueDate?: string; // ISO date string
  scheduledDate?: string; // ISO date string - when it's on the timeline
  scheduledTime?: string; // Time string like "9:00 AM"
  
  // Contact & Context
  contact?: {
    id: string;
    name: string;
    email?: string;
    avatar?: string;
    company?: string;
  };
  contactId?: string; // Denormalized for easy lookup
  
  // Task Classification
  taskType?: TaskType;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
  folder?: string;
  collections?: string[]; // For playlists/groupings
  
  // Time Tracking
  estimatedTime?: number; // in minutes
  actualTime?: number; // in minutes - tracked when completed
  timeSpent?: number; // in minutes - accumulated during active work
  
  // Timeline Integration
  playlistId?: string; // Which playlist this belongs to
  timelineBlockId?: string; // Which timeline block this is part of
  completedInBlock?: string; // Which block it was completed in
  
  // Hierarchy
  subtasks?: Task[];
  parentId?: string;
  
  // Metadata
  notes?: string;
  createdAt: string; // ISO timestamp
  updatedAt?: string; // ISO timestamp
  completedAt?: string; // ISO timestamp
}

/**
 * Playlist - Group of related tasks
 * Used in AM Wizard and Today Page
 */
export interface Playlist {
  id: string;
  name: string;
  type: 'task' | 'content' | 'nurture';
  taskIds: string[]; // References to real Task IDs
  estimatedTime: number; // total minutes (calculated from tasks)
  scheduledBlockId?: string; // which timeline block this maps to
  createdAt: string;
}

/**
 * Timeline Block - Scheduled block of time
 * Can contain a playlist (which references tasks)
 */
export interface TimelineBlock {
  id: string;
  time: string; // "9:00 AM"
  duration: number; // minutes
  type: 'routine' | 'task' | 'content' | 'nurture' | 'goals' | 'meeting' | 'buffer' | 'appointment';
  title: string;
  
  // Task Integration
  playlistId?: string; // References a Playlist
  taskIds?: string[]; // Direct task IDs (for single-task blocks)
  
  // Meeting Integration
  eventId?: string; // reference to calendar event
  location?: string;
  attendees?: string[];
  hasPrep?: boolean;
  joinLink?: string;
  
  // State
  locked?: boolean; // Can't be moved/deleted
  isMIT?: boolean; // Most Important Task
  isActive?: boolean; // Currently running
  completed?: boolean;
  
  // Buffers
  bufferType?: 'pre' | 'post';
  subtype?: 'medical' | 'virtual-medical' | 'ehs-meeting' | 'regular';
}

/**
 * Task with timing data - Used during active work
 */
export interface TaskWithTiming extends Task {
  startedAt?: string; // ISO timestamp
  pausedAt?: string; // ISO timestamp
  resumedAt?: string; // ISO timestamp
  sessionTime?: number; // Current session time in seconds
}
