import { TaskStatus } from '../tasks/StatusDropdown';

export type EnergyLevel = 'negative' | 'low' | 'medium' | 'full';

export type RoutineType = 
  | 'self-directed'
  | 'task-playlist'
  | 'content-playlist'
  | 'nurture-list';

export interface Contact {
  id: string;
  name: string;
  role?: string;
  company?: string;
  avatar?: string;
  color?: string;
  relationshipStage?: 'prospect' | 'client' | 'partner' | 'other';
  firstMeeting?: boolean;
  lastMetDate?: Date;
  synergies?: string[];
}

export interface Meeting {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  contacts?: Contact[];
  prepNotes?: string;
  prepCheckedItems?: string[]; // Line indices checked during prep (e.g., "line-0", "line-1")
  accomplishedItems?: string[]; // Line indices or text of items checked off during meeting
  isEssential?: boolean;
}

export interface Routine {
  id: string;
  name: string;
  type: RoutineType;
  duration: number; // minutes
  
  // Scheduling preferences
  frequency: 'daily' | 'specific-days' | 'flexible';
  daysOfWeek?: number[]; // 0=Sun, 1=Mon, etc.
  idealTimeStart?: string; // "09:00"
  idealTimeEnd?: string;
  
  // Constraints
  energyRequired: 'low' | 'medium' | 'high';
  priority: 1 | 2 | 3; // 1=highest
  
  // Buffers
  bufferBefore?: number; // minutes
  bufferAfter?: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  flagged: boolean;
  dueDate?: Date;
  estimatedTime?: number;
  playlistId?: string;
  taskType?: string;
  contact?: {
    name: string;
    avatar?: string;
    color?: string;
  };
  subtaskCount?: number;
}

export interface Playlist {
  id: string;
  name: string;
  type: 'task' | 'content' | 'nurture';
  taskIds: string[]; // NEW: References to real tasks
  tasks?: Task[]; // DEPRECATED: For backward compatibility during migration
  estimatedTime: number; // total minutes
  scheduledBlockId?: string; // which routine block this maps to
}

export interface ScheduledBlock {
  id: string;
  type: 'meeting' | 'routine' | 'buffer';
  bufferType?: 'pre' | 'post';
  startTime: Date;
  endTime: Date;
  meeting?: Meeting;
  routine?: Routine;
  isLocked?: boolean; // meetings are locked
}

export interface TimeBlock {
  id: string;
  type: 'meeting' | 'routine' | 'buffer';
  bufferType?: 'pre' | 'post';
  startTime: string;
  duration: number;
  name: string;
  isLocked?: boolean;
  contacts?: Contact[];
  meeting?: Meeting;
  routine?: Routine;
}

export interface DayPlan {
  date: Date;
  energyLevel: EnergyLevel;
  mit?: string; // Most Important Thing
  notes?: string;
  selectedRoutines: string[]; // routine IDs
  scheduledBlocks: TimeBlock[];
  playlists: Playlist[];
}