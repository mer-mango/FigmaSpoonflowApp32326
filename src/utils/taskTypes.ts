// Task Type definitions and utilities

export type TaskType = 
  | 'outreach'
  | 'networking'
  | 'client_work'
  | 'business_development'
  | 'cpp'
  | 'personal'
  | 'admin'
  | 'schedule_their_link'
  | 'schedule_my_link'
  | 'schedule_email';

export interface TaskTypeOption {
  value: TaskType;
  label: string;
  color: string; // muted palette color
  keywords: string[]; // for auto-detection
}

// Task type options with muted palette colors
export const taskTypeOptions: TaskTypeOption[] = [
  {
    value: 'outreach',
    label: 'Outreach',
    color: '#c198ad', // muted rose
    keywords: ['contact', 'reach out', 'email', 'message', 'follow up', 'touch base', 'connect with']
  },
  {
    value: 'networking',
    label: 'Networking',
    color: '#b8a7c9', // muted lavender
    keywords: ['networking', 'coffee chat', 'intro call', 'introduction', 'connect', 'network']
  },
  {
    value: 'client_work',
    label: 'Client Work',
    color: '#9eafa4', // muted sage
    keywords: ['client', 'deliverable', 'draft proposal', 'project', 'consultation']
  },
  {
    value: 'business_development',
    label: 'Business Development',
    color: '#e2b7bd', // muted blush
    keywords: ['create service', 'business strategy', 'develop', 'proposal', 'pitch', 'bd']
  },
  {
    value: 'cpp',
    label: 'CPP',
    color: '#d4b5a0', // muted terracotta
    keywords: ['cpp', 'chronic pain project', 'board']
  },
  {
    value: 'personal',
    label: 'Personal',
    color: '#a8b5c7', // muted periwinkle
    keywords: ['personal', 'pharmacy', 'doctor', 'appointment', 'health', 'medical']
  },
  {
    value: 'admin',
    label: 'Admin',
    color: '#b0b5ba', // muted slate
    keywords: ['organize', 'update', 'admin', 'file', 'form', 'paperwork', 'schedule']
  },
  {
    value: 'schedule_their_link',
    label: 'Scheduling – use their link',
    color: '#98c1d9', // muted sky blue
    keywords: ['schedule', 'his link', 'her link', 'their link', 'use their', 'calendly']
  },
  {
    value: 'schedule_my_link',
    label: 'Scheduling – send my link',
    color: '#7fa99b', // muted seafoam
    keywords: ['schedule', 'send my link', 'my calendly', 'share my', 'send link']
  },
  {
    value: 'schedule_email',
    label: 'Scheduling – email',
    color: '#a8c1b0', // muted mint
    keywords: ['scheduling email', 'schedule email', 'email to schedule', 'email about meeting']
  }
];

// Auto-detect task type based on title
export function detectTaskType(title: string): TaskType | null {
  if (!title || title.trim().length < 3) return null;
  
  const lowerTitle = title.toLowerCase();
  
  // Check each task type for keyword matches
  // Order matters - more specific matches first
  
  // Check scheduling types first (most specific)
  const schedulingTheirMatch = taskTypeOptions.find(opt => opt.value === 'schedule_their_link');
  if (schedulingTheirMatch?.keywords.some(keyword => lowerTitle.includes(keyword))) {
    // Further check for "their/his/her link" to distinguish
    if (lowerTitle.includes('their link') || lowerTitle.includes('his link') || lowerTitle.includes('her link') || lowerTitle.includes('use their')) {
      return 'schedule_their_link';
    }
  }
  
  const schedulingMyMatch = taskTypeOptions.find(opt => opt.value === 'schedule_my_link');
  if (schedulingMyMatch?.keywords.some(keyword => lowerTitle.includes(keyword))) {
    if (lowerTitle.includes('send my') || lowerTitle.includes('my link') || lowerTitle.includes('share my')) {
      return 'schedule_my_link';
    }
  }
  
  const schedulingEmailMatch = taskTypeOptions.find(opt => opt.value === 'schedule_email');
  if (schedulingEmailMatch?.keywords.some(keyword => lowerTitle.includes(keyword))) {
    if (lowerTitle.includes('send email') || lowerTitle.includes('email') || lowerTitle.includes('message')) {
      return 'schedule_email';
    }
  }
  
  // Check other types by keyword confidence
  for (const option of taskTypeOptions) {
    if (option.value === 'schedule_their_link' || option.value === 'schedule_my_link' || option.value === 'schedule_email') {
      continue; // Already checked
    }
    
    const matchCount = option.keywords.filter(keyword => 
      lowerTitle.includes(keyword)
    ).length;
    
    if (matchCount > 0) {
      return option.value;
    }
  }
  
  // Default to null if no confident match
  return null;
}

// Get task type option by value
export function getTaskTypeOption(type: TaskType | undefined | null): TaskTypeOption | undefined {
  if (!type) return undefined;
  return taskTypeOptions.find(opt => opt.value === type);
}

// Get display label for task type
export function getTaskTypeLabel(type: TaskType | undefined | null): string {
  const option = getTaskTypeOption(type);
  return option?.label || '';
}

// Get color for task type
export function getTaskTypeColor(type: TaskType | undefined | null): string {
  const option = getTaskTypeOption(type);
  return option?.color || '#b0b5ba'; // default to muted slate
}