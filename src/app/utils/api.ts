/**
 * API Client for Supabase Backend
 * 
 * Handles all communication with the Supabase Edge Functions server
 */

import { projectId, publicAnonKey } from './supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-a89809a8`;

/**
 * Generic fetch wrapper with error handling and retry logic
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  retries = 2
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Add timeout to prevent hanging - increased to 30 seconds
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
        'Connection': 'keep-alive',
        ...options.headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.warn(`⚠️ API Error [${endpoint}]:`, error);
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    // Try to parse the JSON response with better error handling
    try {
      const data = await response.json();
      return data;
    } catch (parseError) {
      console.error(`❌ Failed to parse response for ${endpoint}:`, parseError);
      throw new Error('Invalid response from server');
    }
  } catch (err) {
    clearTimeout(timeoutId);
    
    // Specific handling for connection closed errors
    const errorMessage = err instanceof Error ? err.message : String(err);
    const isConnectionError = errorMessage.includes('connection closed') || 
                              errorMessage.includes('network') ||
                              err instanceof TypeError;
    
    // Retry on connection errors
    if (retries > 0 && (isConnectionError || (err instanceof Error && err.name === 'AbortError'))) {
      console.warn(`⚠️ Request failed for ${endpoint} (${errorMessage}), retrying... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
      return apiFetch<T>(endpoint, options, retries - 1);
    }
    
    if (err instanceof Error && err.name === 'AbortError') {
      console.error(`❌ Request timeout for ${endpoint} - Edge Function may be slow or unresponsive`);
      throw new Error('Request timeout - Please try again in a moment');
    }
    
    // Log the full error for debugging
    console.error(`❌ API request failed for ${endpoint}:`, err);
    throw err;
  }
}

// ========================================
// CONTACTS API
// ========================================

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  initials: string;
  color: string;
  role?: string;
  tags?: string[];
  notes?: string;
  upcomingMeetings?: number;
  activeTasks?: number;
  contentItems?: number;
  lastContact?: string;
  archived?: boolean;
  imageUrl?: string;
  title?: string;
  location?: string;
  linkedinUrl?: string;
  schedulingUrl?: string;
  about?: string;
  nurture?: string;
  summary?: string;
  starred?: boolean;
  nextCallDate?: string;
  nextNurtureDate?: string;
  nextMeeting?: string;
  taskStatusCounts?: {
    toDo: number;
    inProgress: number;
    awaitingReply: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export const contactsAPI = {
  /**
   * Get all contacts
   */
  async getAll(): Promise<Contact[]> {
    console.log('📥 API: Fetching all contacts');
    return apiFetch<Contact[]>('/contacts');
  },

  /**
   * Create a new contact
   */
  async create(contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contact> {
    console.log('📝 API: Creating contact:', contact);
    return apiFetch<Contact>('/contacts', {
      method: 'POST',
      body: JSON.stringify(contact),
    });
  },

  /**
   * Update an existing contact
   */
  async update(id: string, updates: Partial<Contact>): Promise<Contact> {
    console.log(`📝 API: Updating contact ${id}:`, updates);
    return apiFetch<Contact>(`/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  /**
   * Delete a contact
   */
  async delete(id: string): Promise<{ success: boolean }> {
    console.log(`🗑️ API: Deleting contact ${id}`);
    return apiFetch<{ success: boolean }>(`/contacts/${id}`, {
      method: 'DELETE',
    });
  },
};

// ========================================
// TASKS API
// ========================================

export interface Task {
  id: string;
  title: string;
  status: 'toDo' | 'inProgress' | 'awaitingReply' | 'completed' | 'archived';
  contact?: { id: string; name: string }; // DEPRECATED: Use contact_id instead
  contact_id?: string; // Foreign key to contacts
  interaction_id?: string; // Foreign key to interactions/meetings
  meeting_id?: string; // Foreign key to meetings
  dueDate?: string; // Stored as YYYY-MM-DD format
  notes?: string;
  tags?: string[];
  folder?: string;
  isFlagged?: boolean;
  archived: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const tasksAPI = {
  /**
   * Get all tasks
   */
  async getAll(): Promise<Task[]> {
    console.log('📥 API: Fetching all tasks');
    return apiFetch<Task[]>('/tasks');
  },

  /**
   * Get tasks filtered by contact
   */
  async getByContact(contactId: string, activeOnly: boolean = true): Promise<Task[]> {
    console.log(`📥 API: Fetching tasks for contact ${contactId}`);
    const allTasks = await apiFetch<Task[]>('/tasks');
    
    // Filter tasks by contact_id or legacy contact.id
    let filtered = allTasks.filter(task => {
      const matchesContact = task.contact_id === contactId || task.contact?.id === contactId;
      return matchesContact;
    });
    
    // If activeOnly, filter out completed and archived
    if (activeOnly) {
      filtered = filtered.filter(task => {
        const activeStatuses: Task['status'][] = ['toDo', 'inProgress', 'awaitingReply'];
        return activeStatuses.includes(task.status) && !task.archived;
      });
    }
    
    return filtered;
  },

  /**
   * Create a new task
   */
  async create(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    console.log('📝 API: Creating task:', task);
    return apiFetch<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  },

  /**
   * Update an existing task
   */
  async update(id: string, updates: Partial<Task>): Promise<Task> {
    console.log(`📝 API: Updating task ${id}:`, updates);
    return apiFetch<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  /**
   * Delete a task
   */
  async delete(id: string): Promise<{ success: boolean }> {
    console.log(`🗑️ API: Deleting task ${id}`);
    return apiFetch<{ success: boolean }>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },
};

// ========================================
// CONTENT IDEAS API
// ========================================

export interface ContentIdea {
  id: string;
  title: string;
  type?: string;
  status?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const contentAPI = {
  /**
   * Get all content ideas
   */
  async getAll(): Promise<ContentIdea[]> {
    console.log('📥 API: Fetching all content ideas');
    return apiFetch<ContentIdea[]>('/content');
  },

  /**
   * Create a new content idea
   */
  async create(content: Omit<ContentIdea, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContentIdea> {
    console.log('📝 API: Creating content idea:', content);
    return apiFetch<ContentIdea>('/content', {
      method: 'POST',
      body: JSON.stringify(content),
    });
  },

  /**
   * Update an existing content idea
   */
  async update(id: string, updates: Partial<ContentIdea>): Promise<ContentIdea> {
    console.log(`📝 API: Updating content idea ${id}:`, updates);
    return apiFetch<ContentIdea>(`/content/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  /**
   * Delete a content idea
   */
  async delete(id: string): Promise<{ success: boolean }> {
    console.log(`🗑️ API: Deleting content idea ${id}`);
    return apiFetch<{ success: boolean }>(`/content/${id}`, {
      method: 'DELETE',
    });
  },
};

// ========================================
// GOALS API
// ========================================

export interface SubGoal {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  scheduledDate?: string; // When this sub-goal should appear/be worked on
  isDone: boolean;
  isRoutineLinked: boolean;
  createdBy: 'user' | 'jamie';
  createdAt?: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  timeframeType?: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  targetDate?: string;
  periodStartDate?: string;
  periodEndDate?: string;
  isActive: boolean;
  jamieGenerated: boolean;
  subGoals: SubGoal[];
  progressStatus?: 'on_track' | 'falling_behind' | 'stuck';
  pdfUrl?: string; // URL to uploaded PDF file
  pdfName?: string; // Original filename
  contact?: string; // Linked contact name
  content?: string; // Linked content idea
  document?: string; // Linked document name
  createdAt?: string;
  updatedAt?: string;
}

export const goalsAPI = {
  /**
   * Get all goals
   */
  async getAll(): Promise<Goal[]> {
    console.log('📥 API: Fetching all goals');
    return apiFetch<Goal[]>('/goals');
  },

  /**
   * Create a new goal
   */
  async create(goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Goal> {
    console.log('📝 API: Creating goal:', goal);
    return apiFetch<Goal>('/goals', {
      method: 'POST',
      body: JSON.stringify(goal),
    });
  },

  /**
   * Update an existing goal
   */
  async update(id: string, updates: Partial<Goal>): Promise<Goal> {
    console.log(`📝 API: Updating goal ${id}:`, updates);
    return apiFetch<Goal>(`/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  /**
   * Delete a goal
   */
  async delete(id: string): Promise<{ success: boolean }> {
    console.log(`🗑️ API: Deleting goal ${id}`);
    return apiFetch<{ success: boolean }>(`/goals/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Ask Jamie to break down a goal into sub-goals
   */
  async breakdownWithJamie(id: string): Promise<Goal> {
    console.log(`🤖 API: Jamie breaking down goal ${id}`);
    return apiFetch<Goal>(`/goals/${id}/breakdown`, {
      method: 'POST',
    });
  },
};

// ========================================
// HEALTH CHECK
// ========================================

export async function healthCheck(): Promise<{ status: string }> {
  console.log('🏥 API: Health check');
  return apiFetch<{ status: string }>('/health');
}