/**
 * Playlist Adapter - Bridges old inline tasks with new task references
 * 
 * During migration, playlists can have either:
 * - taskIds: string[] (NEW - references to real tasks)
 * - tasks: Task[] (OLD - inline task data)
 * 
 * This adapter handles both cases seamlessly.
 */

import { Task as CanonicalTask } from '../types/task';
import { Playlist } from '../components/today/types';
import * as taskService from './taskService';

/**
 * Convert old-style playlist (inline tasks) to new-style (task IDs)
 * Creates real tasks in the task service if they don't exist
 */
export function migratePlaylistToTaskIds(playlist: Playlist): Playlist {
  // Already using new format
  if (playlist.taskIds && playlist.taskIds.length > 0) {
    return playlist;
  }
  
  // Has old inline tasks - need to migrate
  if (playlist.tasks && playlist.tasks.length > 0) {
    const taskIds: string[] = [];
    
    playlist.tasks.forEach(task => {
      // Check if this task already exists (by title match)
      const existingTasks = taskService.getAllTasks();
      let existingTask = existingTasks.find(t => 
        t.title === task.title && 
        t.status !== 'done' &&
        !t.playlistId // Not already in a playlist
      );
      
      if (existingTask) {
        // Use existing task
        taskIds.push(existingTask.id);
        console.log(`[PlaylistAdapter] Matched existing task: ${task.title}`);
      } else {
        // Create new task
        const newTask = taskService.createTask({
          title: task.title,
          description: task.description,
          status: mapStatus(task.status),
          estimatedTime: task.estimatedTime,
          isFlagged: task.flagged,
          dueDate: task.dueDate?.toISOString().split('T')[0],
          contact: task.contact ? {
            id: `contact-${Date.now()}`,
            name: task.contact.name,
            avatar: task.contact.avatar,
          } : undefined,
        });
        
        taskIds.push(newTask.id);
        console.log(`[PlaylistAdapter] Created new task: ${task.title} (${newTask.id})`);
      }
    });
    
    // Return migrated playlist
    return {
      ...playlist,
      taskIds,
      tasks: undefined, // Remove old inline data
    };
  }
  
  // Empty playlist
  return {
    ...playlist,
    taskIds: [],
    tasks: undefined,
  };
}

/**
 * Get tasks for a playlist (handles both old and new formats)
 * @param playlist The playlist to get tasks from
 * @param tasksArray Optional array of tasks to look up from (instead of taskService)
 */
export function getPlaylistTasks(playlist: Playlist, tasksArray?: any[]): CanonicalTask[] {
  console.log(`[playlistAdapter] getPlaylistTasks called for playlist: ${playlist.name}`);
  console.log(`[playlistAdapter]   Playlist has taskIds:`, playlist.taskIds);
  console.log(`[playlistAdapter]   Playlist has inline tasks:`, playlist.tasks?.length || 0);
  console.log(`[playlistAdapter]   tasksArray provided:`, tasksArray?.length || 0);
  
  // New format - fetch by IDs
  if (playlist.taskIds && playlist.taskIds.length > 0) {
    // If tasks array is provided, look up from there
    if (tasksArray && tasksArray.length > 0) {
      console.log(`[playlistAdapter]   Looking up ${playlist.taskIds.length} task IDs from tasksArray...`);
      
      const foundTasks = playlist.taskIds
        .map(id => {
          const task = tasksArray.find(t => t.id === id);
          if (task) {
            console.log(`[playlistAdapter]     ✅ Found task: ${task.title} | Status: ${task.status} (${typeof task.status})`);
          } else {
            console.log(`[playlistAdapter]     ❌ Task ID not found: ${id}`);
          }
          return task;
        })
        .filter(Boolean)
        .map(task => {
          const mappedStatus = mapStatus(task.status);
          console.log(`[playlistAdapter]     Mapping task "${task.title}": status "${task.status}" -> "${mappedStatus}"`);
          
          return {
            id: task.id,
            title: task.title,
            description: task.description,
            status: mappedStatus,
            isFlagged: task.isFlagged || task.flagged,
            estimatedTime: task.estimatedTime,
            dueDate: task.dueDate,
            contact: task.contact,
            taskType: task.taskType,
            playlistId: playlist.id,
            createdAt: task.createdAt || new Date().toISOString(),
          };
        }) as CanonicalTask[];
      
      console.log(`[playlistAdapter]   Returning ${foundTasks.length} tasks for playlist "${playlist.name}"`);
      return foundTasks;
    }
    
    // Otherwise fetch from taskService
    return playlist.taskIds
      .map(id => taskService.getTaskById(id))
      .filter(Boolean) as CanonicalTask[];
  }
  
  // Old format - convert inline tasks to canonical format
  if (playlist.tasks && playlist.tasks.length > 0) {
    return playlist.tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: mapStatus(task.status),
      isFlagged: task.flagged,
      estimatedTime: task.estimatedTime,
      dueDate: task.dueDate?.toISOString?.().split('T')[0] || task.dueDate,
      contact: task.contact ? {
        id: `contact-temp`,
        name: task.contact.name || task.contact,
        avatar: task.contact.avatar,
      } : undefined,
      playlistId: playlist.id,
      createdAt: new Date().toISOString(),
    }));
  }
  
  return [];
}

/**
 * Map task status to canonical status
 * Handles multiple formats: old format (todo, in-progress), canonical (toDo, inProgress), and TaskStatus (to-do, awaiting)
 */
function mapStatus(status: any): CanonicalTask['status'] {
  // If status is undefined or not a string, return default
  if (!status || typeof status !== 'string') {
    console.warn('[playlistAdapter] Invalid status value:', status);
    return 'toDo';
  }
  
  const statusMap: Record<string, CanonicalTask['status']> = {
    // Old format
    'todo': 'toDo',
    'in-progress': 'inProgress',
    'awaiting-reply': 'awaitingReply',
    'done': 'done',
    'archived': 'archived',
    // Canonical format (already correct - passthrough)
    'toDo': 'toDo',
    'inProgress': 'inProgress',
    'awaitingReply': 'awaitingReply',
    // TaskStatus format (from StatusDropdown)
    'to-do': 'toDo',
    'awaiting': 'awaitingReply',
  };
  
  const mapped = statusMap[status] || 'toDo';
  
  // Log if we're returning default (unexpected status value)
  if (!statusMap[status]) {
    console.warn('[playlistAdapter] Unknown status format:', status, '-> defaulting to toDo');
  }
  
  return mapped;
}

/**
 * Create playlist from selected task IDs
 */
export function createPlaylistFromTasks(
  name: string,
  taskIds: string[],
  type: 'task' | 'content' | 'nurture' = 'task'
): Playlist {
  const tasks = taskIds
    .map(id => taskService.getTaskById(id))
    .filter(Boolean) as CanonicalTask[];
  
  const estimatedTime = tasks.reduce((sum, t) => sum + (t.estimatedTime || 0), 0);
  
  const playlist: Playlist = {
    id: `playlist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    type,
    taskIds,
    estimatedTime,
  };
  
  // Update tasks to reference this playlist
  taskIds.forEach(taskId => {
    taskService.updateTask(taskId, { playlistId: playlist.id });
  });
  
  console.log(`[PlaylistAdapter] Created playlist: ${name} with ${taskIds.length} tasks`);
  return playlist;
}

/**
 * Batch migrate all playlists in a day plan
 */
export function migratePlaylists(playlists: Playlist[]): Playlist[] {
  return playlists.map(p => migratePlaylistToTaskIds(p));
}