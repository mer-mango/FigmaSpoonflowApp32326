import React, { useState, useEffect } from 'react';
import { CheckSquare, Pin, Sprout, Clock, Flag, Calendar, User, ChevronDown, Save, X, Archive, Star, Briefcase, RefreshCw, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { getPlaylistTasks } from '../../utils/playlistAdapter';
import { getTaskTypeLabel, getTaskTypeColor } from '../../utils/taskTypes';
import { DraggableTaskItem } from './DraggableTaskItem';
import { DraggableNurtureItem } from './DraggableNurtureItem';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Task type (matches TasksPage Task type)
interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  dueDate?: string | Date;
  contact?: {
    id: string;
    name: string;
    email?: string;
    role?: string;
    company?: string;
    color?: string;
    initials?: string;
  };
  estimatedTime?: string | number;
  taskType?: string;
  flagged?: boolean;
}

// Playlist type
interface Playlist {
  id: string;
  name: string;
  type: 'task' | 'content' | 'nurture';
  tasks: Task[];
  estimatedTime: number;
}

interface TodosReviewProps {
  playlists: Playlist[];
  onUpdatePlaylist: (playlistId: string, tasks: Task[]) => void;
  onAskJamie: () => void;
  onSyncTasks?: () => void; // NEW: callback to sync tasks from main task list
  onCreateTask?: (taskData: { title: string; taskType?: string; dueDate?: string }) => void; // NEW: callback to create a new task
  onUpdateTask?: (taskId: string, updates: any) => void; // NEW: callback to update task in backend (e.g., archive)
}

// History entry for undo functionality
interface HistoryEntry {
  type: 'move-task' | 'archive-task' | 'update-task';
  playlistId: string;
  task: Task;
  previousPlaylistTasks: Task[];
}

export function TodosReview({ playlists, onUpdatePlaylist, onAskJamie, onSyncTasks, onCreateTask, onUpdateTask }: TodosReviewProps) {
  console.log('🎯 TodosReview RENDERING with playlists:', playlists);
  console.log('🎯 TodosReview playlists count:', playlists?.length || 0);
  console.log('🎯 TodosReview playlists detail:', playlists?.map(p => ({
    id: p.id,
    name: p.name,
    type: p.type,
    taskCount: p.tasks?.length || 0,
    tasks: p.tasks
  })));
  
  const [expandedPlaylists, setExpandedPlaylists] = useState<Set<string>>(
    new Set(playlists.map(p => p.id))
  );
  const [editingTask, setEditingTask] = useState<{ playlistId: string; taskId: string } | null>(null);
  const [editDueDate, setEditDueDate] = useState<string>('');
  const [editCustomDate, setEditCustomDate] = useState<string>('');
  const [editEstTime, setEditEstTime] = useState<string>('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [editingStatus, setEditingStatus] = useState<{ playlistId: string; taskId: string } | null>(null);
  const [editingDueDate, setEditingDueDate] = useState<{ playlistId: string; taskId: string } | null>(null);
  const [editingTime, setEditingTime] = useState<{ playlistId: string; taskId: string } | null>(null);
  const [tempDueDate, setTempDueDate] = useState<string>('');
  const [tempCustomDate, setTempCustomDate] = useState<string>('');
  const [tempTime, setTempTime] = useState<string>('');

  // Click outside to close status dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editingStatus) {
        const target = event.target as HTMLElement;
        if (!target.closest('.status-dropdown-container')) {
          setEditingStatus(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [editingStatus]);

  // Keyboard shortcut for undo (Ctrl+Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [history, playlists]);

  const handleUndo = () => {
    if (history.length === 0) {
      toast.error('Nothing to undo');
      return;
    }

    const lastEntry = history[history.length - 1];
    const newHistory = history.slice(0, -1);
    setHistory(newHistory);

    // Restore the previous state
    onUpdatePlaylist(lastEntry.playlistId, lastEntry.previousPlaylistTasks);
    
    if (lastEntry.type === 'move-task') {
      toast.success('Undone - task restored to today');
    } else if (lastEntry.type === 'archive-task') {
      toast.success('Undone - task unarchived');
    }
  };

  const getStatusBadge = (status: string, taskType: 'task' | 'content' | 'nurture') => {
    // Normalize status to handle both old format (todo, in-progress) and canonical format (toDo, inProgress)
    const normalizedStatus = normalizeStatus(status);
    
    // Status config for regular tasks and nurtures - SOFT MUTED COLORS
    const regularStatusConfig: Record<string, { label: string; bg: string; text: string }> = {
      'todo': { label: 'To Do', bg: 'bg-[#d88b8b]/50', text: 'text-[#8b3a3a]' },
      'in-progress': { label: 'In Progress', bg: 'bg-[#e8b4a0]/50', text: 'text-[#a66f5c]' },
      'awaiting-reply': { label: 'Awaiting Reply', bg: 'bg-[#c9c5c1]/50', text: 'text-[#6b6865]' },
      'done': { label: 'Done', bg: 'bg-[#a8c5b5]/50', text: 'text-[#5a7a6a]' },
    };

    // Status config for content tasks - SOFT MUTED COLORS
    const contentStatusConfig: Record<string, { label: string; bg: string; text: 'text-[#7a6379]' | 'text-[#5e7491]' | 'text-[#8a7c60]' | 'text-[#4d5f73]' | 'text-[#5a7a6a]' }> = {
      'idea': { label: 'Idea', bg: 'bg-[#c5adc5]/50', text: 'text-[#7a6379]' },
      'drafting': { label: 'Drafting', bg: 'bg-[#a8bdd4]/50', text: 'text-[#5e7491]' },
      'in-progress': { label: 'In Progress', bg: 'bg-[#e8b4a0]/50', text: 'text-[#a66f5c]' },
      'review': { label: 'Review', bg: 'bg-[#d4c5a8]/50', text: 'text-[#8a7c60]' },
      'scheduled': { label: 'Scheduled', bg: 'bg-[#8fa8bf]/50', text: 'text-[#4d5f73]' },
      'published': { label: 'Published', bg: 'bg-[#a8c5b5]/50', text: 'text-[#5a7a6a]' },
    };

    const statusConfig = taskType === 'content' ? contentStatusConfig : regularStatusConfig;
    const config = statusConfig[normalizedStatus] || statusConfig['todo'] || statusConfig['idea'];
    
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };
  
  const getStatusOption = (status: string, taskType: 'task' | 'content' | 'nurture') => {
    // Normalize status to handle both old format (todo, in-progress) and canonical format (toDo, inProgress)
    const normalizedStatus = normalizeStatus(status);
    
    const regularStatusConfig: Record<string, { label: string; bg: string; text: string }> = {
      'todo': { label: 'To Do', bg: 'bg-[#d88b8b]/50', text: 'text-[#8b3a3a]' },
      'in-progress': { label: 'In Progress', bg: 'bg-[#e8b4a0]/50', text: 'text-[#a66f5c]' },
      'awaiting-reply': { label: 'Awaiting Reply', bg: 'bg-[#c9c5c1]/50', text: 'text-[#6b6865]' },
      'done': { label: 'Done', bg: 'bg-[#a8c5b5]/50', text: 'text-[#5a7a6a]' },
    };

    const contentStatusConfig: Record<string, { label: string; bg: 'bg-[#c5adc5]/50' | 'bg-[#a8bdd4]/50' | 'bg-[#e8b4a0]/50' | 'bg-[#d4c5a8]/50' | 'bg-[#8fa8bf]/50' | 'bg-[#a8c5b5]/50'; text: 'text-[#7a6379]' | 'text-[#5e7491]' | 'text-[#8a7c60]' | 'text-[#4d5f73]' | 'text-[#5a7a6a]' }> = {
      'idea': { label: 'Idea', bg: 'bg-[#c5adc5]/50', text: 'text-[#7a6379]' },
      'drafting': { label: 'Drafting', bg: 'bg-[#a8bdd4]/50', text: 'text-[#5e7491]' },
      'in-progress': { label: 'In Progress', bg: 'bg-[#e8b4a0]/50', text: 'text-[#a66f5c]' },
      'review': { label: 'Review', bg: 'bg-[#d4c5a8]/50', text: 'text-[#8a7c60]' },
      'scheduled': { label: 'Scheduled', bg: 'bg-[#8fa8bf]/50', text: 'text-[#4d5f73]' },
      'published': { label: 'Published', bg: 'bg-[#a8c5b5]/50', text: 'text-[#5a7a6a]' },
    };

    const statusConfig = taskType === 'content' ? contentStatusConfig : regularStatusConfig;
    const config = statusConfig[normalizedStatus] || statusConfig['todo'] || statusConfig['idea'];
    
    return config;
  };

  // Helper function to normalize status format (handles both old and canonical formats)
  const normalizeStatus = (status: string): string => {
    // If status is not a string or is missing, return default
    if (!status || typeof status !== 'string') {
      console.warn('[TodosReview] Invalid status value:', status);
      return 'todo';
    }
    
    const statusMap: Record<string, string> = {
      // Canonical format -> old format
      'toDo': 'todo',
      'inProgress': 'in-progress',
      'awaitingReply': 'awaiting-reply',
      'done': 'done',
      'archived': 'archived',
      // TaskStatus format -> old format
      'to-do': 'todo',
      'awaiting': 'awaiting-reply',
      // Old format passthrough
      'todo': 'todo',
      'in-progress': 'in-progress',
      'awaiting-reply': 'awaiting-reply',
    };
    
    const normalized = statusMap[status] || status;
    
    // Log warning if we didn't recognize the status (might be a contact name!)
    if (!statusMap[status]) {
      console.warn('[TodosReview] Unrecognized status format:', status, '-> using as-is');
    }
    
    return normalized;
  };

  const getPlaylistIcon = (type: 'task' | 'content' | 'nurture') => {
    if (type === 'task') return CheckSquare;
    if (type === 'content') return Pin;
    return Sprout;
  };

  const getPlaylistColor = (type: 'task' | 'content' | 'nurture') => {
    if (type === 'task') return {
      bg: 'bg-[#a89bb4]/10',
      border: 'border-[#a89bb4]/30',
      icon: 'bg-[#a89bb4]',
      text: 'text-[#a89bb4]',
    };
    if (type === 'content') return {
      bg: 'bg-[#d4a5a5]/10',
      border: 'border-[#d4a5a5]/30',
      icon: 'bg-[#d4a5a5]',
      text: 'text-[#d4a5a5]',
    };
    return {
      bg: 'bg-[#7ba892]/10',
      border: 'border-[#7ba892]/30',
      icon: 'bg-[#7ba892]',
      text: 'text-[#7ba892]',
    };
  };

  const formatTime = (minutes: number) => {
    if (!minutes || isNaN(minutes)) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h`;
    return `${mins}m`;
  };

  const parseTimeStringToMinutes = (timeStr: string | number | undefined): number => {
    if (!timeStr) return 30;
    if (typeof timeStr === 'number') return timeStr;
    
    const hourMatch = timeStr.match(/(\d+)h/);
    const minMatch = timeStr.match(/(\d+)m/);
    const hours = hourMatch ? parseInt(hourMatch[1]) : 0;
    const mins = minMatch ? parseInt(minMatch[1]) : 0;
    return hours * 60 + mins || 30;
  };

  const displayTime = (timeValue: string | number | undefined): string => {
    const minutes = parseTimeStringToMinutes(timeValue);
    return formatTime(minutes);
  };

  const formatDueDate = (date: Date | undefined) => {
    if (!date) return 'Today';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Fix timezone issue: If date is a string, parse it as local date
    let dueDate: Date;
    if (typeof date === 'string') {
      // Parse string date as local timezone, not UTC
      const parts = date.split(/[-/]/);
      if (parts.length === 3) {
        // Handle MM/DD/YYYY or YYYY-MM-DD formats
        const hasYear = parts[0].length === 4;
        const year = hasYear ? parseInt(parts[0]) : parseInt(parts[2]);
        const month = hasYear ? parseInt(parts[1]) - 1 : parseInt(parts[0]) - 1;
        const day = hasYear ? parseInt(parts[2]) : parseInt(parts[1]);
        dueDate = new Date(year, month, day);
      } else {
        dueDate = new Date(date);
      }
    } else {
      dueDate = new Date(date);
    }
    dueDate.setHours(0, 0, 0, 0);
    
    if (dueDate.getTime() === today.getTime()) return 'Today';
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (dueDate.getTime() === tomorrow.getTime()) return 'Tomorrow';
    
    return dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const togglePlaylist = (id: string) => {
    const newExpanded = new Set(expandedPlaylists);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedPlaylists(newExpanded);
  };

  const handleEditTask = (playlistId: string, task: Task) => {
    setEditingTask({ playlistId, taskId: task.id });
    
    // Set due date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = task.dueDate ? new Date(task.dueDate) : today;
    dueDate.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (dueDate.getTime() === tomorrow.getTime()) {
      setEditDueDate('tomorrow');
      setEditCustomDate('');
    } else {
      setEditDueDate('custom');
      // Format date for input type="date" (YYYY-MM-DD)
      const year = dueDate.getFullYear();
      const month = String(dueDate.getMonth() + 1).padStart(2, '0');
      const day = String(dueDate.getDate()).padStart(2, '0');
      setEditCustomDate(`${year}-${month}-${day}`);
    }
    
    setEditEstTime(task.estimatedTime?.toString() || '30');
  };

  const handleSaveTask = (playlistId: string, taskId: string) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return;

    const task = playlist.tasks.find(t => t.id === taskId);
    if (!task) return;

    // Calculate new due date
    let newDueDate: Date;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch (editDueDate) {
      case 'tomorrow':
        newDueDate = new Date(today);
        newDueDate.setDate(newDueDate.getDate() + 1);
        break;
      case 'custom':
        newDueDate = new Date(editCustomDate);
        newDueDate.setHours(0, 0, 0, 0);
        break;
      default:
        newDueDate = task.dueDate || today;
    }

    // Check if the new due date is different from today
    const isMovedToAnotherDay = newDueDate.getTime() !== today.getTime();

    if (isMovedToAnotherDay) {
      setHistory([...history, {
        type: 'move-task',
        playlistId,
        task: { ...task },
        previousPlaylistTasks: [...playlist.tasks],
      }]);

      // Update the task with new due date (don't remove it - parent will handle persistence)
      const updatedTasks = playlist.tasks.map(t => {
        if (t.id === taskId) {
          // Format date as YYYY-MM-DD to match TasksPage expectations
          const formattedDate = `${newDueDate.getFullYear()}-${String(newDueDate.getMonth() + 1).padStart(2, '0')}-${String(newDueDate.getDate()).padStart(2, '0')}`;
          return { ...t, dueDate: formattedDate };
        }
        return t;
      });
      onUpdatePlaylist(playlistId, updatedTasks);
      toast.success(`Moved to ${formatDueDate(newDueDate)}`, {
        description: `\"${task.title}\" has been rescheduled`,
      });
    } else {
      const updatedTasks = playlist.tasks.map(t => {
        if (t.id === taskId) {
          // Format date as YYYY-MM-DD to match TasksPage expectations
          const formattedDate = `${newDueDate.getFullYear()}-${String(newDueDate.getMonth() + 1).padStart(2, '0')}-${String(newDueDate.getDate()).padStart(2, '0')}`;
          return { ...t, dueDate: formattedDate };
        }
        return t;
      });
      onUpdatePlaylist(playlistId, updatedTasks);
      toast.success('Due date updated');
    }

    setEditingTask(null);
  };

  const handleArchiveTask = (playlistId: string, taskId: string) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return;

    const task = playlist.tasks.find(t => t.id === taskId);
    if (!task) return;

    // Save to history before archiving
    setHistory([...history, {
      type: 'archive-task',
      playlistId,
      task: { ...task },
      previousPlaylistTasks: [...playlist.tasks],
    }]);

    // Remove the task from the playlist
    const updatedTasks = playlist.tasks.filter(t => t.id !== taskId);
    onUpdatePlaylist(playlistId, updatedTasks);
    
    // Update task status to 'archived' in backend
    if (onUpdateTask) {
      console.log(`📦 Archiving task "${task.title}" in backend`);
      onUpdateTask(taskId, { status: 'archived' });
    }
    
    toast.success('Task archived', {
      description: `"${task.title}" has been archived`,
    });
  };

  const handleStatusChange = (playlistId: string, taskId: string, newStatus: string) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return;

    const updatedTasks = playlist.tasks.map(t => {
      if (t.id === taskId) {
        return { ...t, status: newStatus };
      }
      return t;
    });

    onUpdatePlaylist(playlistId, updatedTasks);
    setEditingStatus(null);
    toast.success('Status updated');
  };

  const handleTogglePriority = (playlistId: string, taskId: string) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return;

    const task = playlist.tasks.find(t => t.id === taskId);
    const newFlaggedState = !task?.flagged;

    const updatedTasks = playlist.tasks.map(t => {
      if (t.id === taskId) {
        return { ...t, flagged: newFlaggedState };
      }
      return t;
    });

    onUpdatePlaylist(playlistId, updatedTasks);
    toast.success(newFlaggedState ? 'Priority added' : 'Priority removed');
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
  };

  // Inline editing handlers for due date
  const handleStartEditDueDate = (playlistId: string, task: Task) => {
    setEditingDueDate({ playlistId, taskId: task.id });
    
    // Parse the task's due date and set it directly in the date input
    let dueDate: Date;
    if (task.dueDate) {
      if (typeof task.dueDate === 'string') {
        // Parse string date as local timezone, not UTC
        const parts = task.dueDate.split(/[-/]/);
        if (parts.length === 3) {
          // Handle MM/DD/YYYY or YYYY-MM-DD formats
          const hasYear = parts[0].length === 4;
          const year = hasYear ? parseInt(parts[0]) : parseInt(parts[2]);
          const month = hasYear ? parseInt(parts[1]) - 1 : parseInt(parts[0]) - 1;
          const day = hasYear ? parseInt(parts[2]) : parseInt(parts[1]);
          dueDate = new Date(year, month, day);
        } else {
          dueDate = new Date(task.dueDate);
        }
      } else {
        dueDate = new Date(task.dueDate);
      }
    } else {
      // Default to today if no due date
      dueDate = new Date();
    }
    dueDate.setHours(0, 0, 0, 0);
    
    // Format date for input type="date" (YYYY-MM-DD)
    const year = dueDate.getFullYear();
    const month = String(dueDate.getMonth() + 1).padStart(2, '0');
    const day = String(dueDate.getDate()).padStart(2, '0');
    setTempCustomDate(`${year}-${month}-${day}`);
  };

  const handleSaveDueDate = (playlistId: string, taskId: string) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return;

    const task = playlist.tasks.find(t => t.id === taskId);
    if (!task) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Parse the custom date input
    const [year, month, day] = tempCustomDate.split('-').map(Number);
    const newDueDate = new Date(year, month - 1, day);
    newDueDate.setHours(0, 0, 0, 0);

    const isMovedToAnotherDay = newDueDate.getTime() !== today.getTime();

    if (isMovedToAnotherDay) {
      setHistory([...history, {
        type: 'move-task',
        playlistId,
        task: { ...task },
        previousPlaylistTasks: [...playlist.tasks],
      }]);

      // Update the task with new due date (don't remove it - parent will handle persistence)
      const updatedTasks = playlist.tasks.map(t => {
        if (t.id === taskId) {
          // Format date as YYYY-MM-DD to match TasksPage expectations
          const formattedDate = `${newDueDate.getFullYear()}-${String(newDueDate.getMonth() + 1).padStart(2, '0')}-${String(newDueDate.getDate()).padStart(2, '0')}`;
          return { ...t, dueDate: formattedDate };
        }
        return t;
      });
      onUpdatePlaylist(playlistId, updatedTasks);
      toast.success(`Moved to ${formatDueDate(newDueDate)}`, {
        description: `\"${task.title}\" has been rescheduled`,
      });
    } else {
      const updatedTasks = playlist.tasks.map(t => {
        if (t.id === taskId) {
          // Format date as YYYY-MM-DD to match TasksPage expectations
          const formattedDate = `${newDueDate.getFullYear()}-${String(newDueDate.getMonth() + 1).padStart(2, '0')}-${String(newDueDate.getDate()).padStart(2, '0')}`;
          return { ...t, dueDate: formattedDate };
        }
        return t;
      });
      onUpdatePlaylist(playlistId, updatedTasks);
      toast.success('Due date updated');
    }

    setEditingDueDate(null);
  };

  // Inline editing handlers for time
  const handleStartEditTime = (playlistId: string, task: Task) => {
    setEditingTime({ playlistId, taskId: task.id });
    const minutes = parseTimeStringToMinutes(task.estimatedTime);
    setTempTime(minutes.toString());
  };

  const handleSaveTime = (playlistId: string, taskId: string) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return;

    const updatedTasks = playlist.tasks.map(t => {
      if (t.id === taskId) {
        return { ...t, estimatedTime: parseInt(tempTime) || 30 };
      }
      return t;
    });

    onUpdatePlaylist(playlistId, updatedTasks);
    setEditingTime(null);
    toast.success('Time updated');
  };

  const totalItems = playlists.reduce((sum, p) => sum + p.tasks.length, 0);
  const totalTime = playlists.reduce((sum, p) => {
    const playlistTime = p.tasks.reduce((taskSum, task) => {
      const timeInMinutes = parseTimeStringToMinutes(task.estimatedTime);
      return taskSum + timeInMinutes;
    }, 0);
    return sum + playlistTime;
  }, 0);

  // Separate tasks by due date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const allTasks = playlists.flatMap(playlist => 
    playlist.tasks.map(task => ({ task, playlistId: playlist.id, playlist }))
  );
  
  // Filter tasks due today
  const tasksDueToday = allTasks.filter(({ task }) => {
    if (!task.dueDate) return false;
    
    let taskDate: Date;
    if (typeof task.dueDate === 'string') {
      const parts = task.dueDate.split(/[-/]/);
      if (parts.length === 3) {
        const hasYear = parts[0].length === 4;
        const year = hasYear ? parseInt(parts[0]) : parseInt(parts[2]);
        const month = hasYear ? parseInt(parts[1]) - 1 : parseInt(parts[0]) - 1;
        const day = hasYear ? parseInt(parts[2]) : parseInt(parts[1]);
        taskDate = new Date(year, month, day);
      } else {
        taskDate = new Date(task.dueDate);
      }
    } else {
      taskDate = new Date(task.dueDate);
    }
    taskDate.setHours(0, 0, 0, 0);
    
    return taskDate.getTime() === today.getTime();
  });
  
  // Drag and drop handler
  const moveTask = (playlistId: string, dragIndex: number, hoverIndex: number) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return;

    const updatedTasks = [...playlist.tasks];
    const [draggedTask] = updatedTasks.splice(dragIndex, 1);
    updatedTasks.splice(hoverIndex, 0, draggedTask);

    onUpdatePlaylist(playlistId, updatedTasks);
  };

  // Helper function to render a task card
  const renderTaskCard = (
    task: Task,
    playlistId: string,
    playlist: Playlist,
    index: number,
    isBottomSection: boolean
  ) => {
    // Nurture playlists should display items as contact cards
    if (playlist.type === 'nurture') {
      return (
        <DraggableNurtureItem
          key={task.id}
          task={task}
          playlistId={playlistId}
          playlist={playlist}
          index={index}
          moveTask={moveTask}
          handleTogglePriority={handleTogglePriority}
          handleArchiveTask={handleArchiveTask}
          formatDueDate={formatDueDate}
        />
      );
    }

    // Tasks and Content playlists display as task cards
    return (
      <DraggableTaskItem
        key={task.id}
        task={task}
        playlistId={playlistId}
        playlist={playlist}
        index={index}
        isBottomSection={isBottomSection}
        moveTask={moveTask}
        editingStatus={editingStatus}
        setEditingStatus={setEditingStatus}
        editingDueDate={editingDueDate}
        tempDueDate={tempDueDate}
        setTempDueDate={setTempDueDate}
        tempCustomDate={tempCustomDate}
        setTempCustomDate={setTempCustomDate}
        editingTime={editingTime}
        tempTime={tempTime}
        setTempTime={setTempTime}
        handleStatusChange={handleStatusChange}
        handleStartEditDueDate={handleStartEditDueDate}
        handleSaveDueDate={handleSaveDueDate}
        setEditingDueDate={setEditingDueDate}
        handleStartEditTime={handleStartEditTime}
        handleSaveTime={handleSaveTime}
        setEditingTime={setEditingTime}
        handleTogglePriority={handleTogglePriority}
        handleArchiveTask={handleArchiveTask}
        getStatusBadge={getStatusBadge}
        getStatusOption={getStatusOption}
        formatDueDate={formatDueDate}
        displayTime={displayTime}
      />
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-5 pb-24">
        {/* Header */}
        <div className="mb-6">
          
          
        </div>

        {/* Playlists */}
        <div className="space-y-3">
          {playlists.length === 0 ? (
            <div className="text-center py-12 px-4 bg-white/60 rounded-2xl border border-slate-200/50">
              <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-700 mb-2">No tasks for today</h3>
              <p className="text-sm text-slate-500 mb-4">
                You're all set! No tasks are scheduled for today.
              </p>
              {onCreateTask && (
                <button
                  onClick={() => {
                    const title = prompt('Task title:');
                    if (title) {
                      const today = new Date();
                      onCreateTask({ 
                        title, 
                        dueDate: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
                      });
                      toast.success('Task created!', {
                        description: 'New task added for today'
                      });
                    }
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#6b2358] hover:bg-[#6b2358]/90 text-white rounded-lg transition-gentle text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Create First Task
                </button>
              )}
            </div>
          ) : (
            playlists.map((playlist, playlistIndex) => {
            const Icon = getPlaylistIcon(playlist.type);
            const colors = getPlaylistColor(playlist.type);
            const isExpanded = expandedPlaylists.has(playlist.id);
            // Check if this is one of the last playlists (open dropdown upward to prevent clipping)
            const isBottomPlaylist = playlistIndex >= playlists.length - 2;

            // Sort tasks by due date (soonest first), then by flagged status (flagged first)
            const sortedTasks = [...playlist.tasks].sort((a, b) => {
              const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Date.now();
              const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Date.now();
              
              // First sort by due date
              if (dateA !== dateB) {
                return dateA - dateB;
              }
              
              // If same due date, sort by flagged status (flagged first)
              if (a.flagged && !b.flagged) return -1;
              if (!a.flagged && b.flagged) return 1;
              
              return 0;
            });

            // Calculate actual playlist time from tasks
            const playlistTotalTime = playlist.tasks.reduce((sum, task) => {
              const timeInMinutes = parseTimeStringToMinutes(task.estimatedTime);
              return sum + timeInMinutes;
            }, 0);

            return (
              <div
                key={playlist.id}
                className={`
                  bg-white/80 backdrop-blur-xl rounded-3xl border-2 overflow-hidden transition-all
                  ${colors.border}
                `}
              >
                {/* Header */}
                <button
                  onClick={() => togglePlaylist(playlist.id)}
                  className="w-full px-5 py-4 flex items-center gap-4 hover:bg-white/50 transition-gentle"
                >
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    playlist.type === 'task' ? 'bg-[#c198ac]' : 
                    playlist.type === 'content' ? 'bg-[#d4a5a5]' : 
                    'bg-[#7ba892]'
                  }`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-left min-w-0">
                    <h3 className="font-semibold text-slate-800 mb-1 text-[20px] px-[0px] py-[10px] pt-[10px] pr-[0px] pb-[5px] pl-[0px]">
                      {playlist.name}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-slate-600 px-[0px] py-[10px] pt-[0px] pr-[0px] pb-[10px] pl-[0px]">
                      <span>{playlist.tasks.length} items</span>
                      <span>•</span>
                      <span>{formatTime(playlistTotalTime)}</span>
                    </div>
                  </div>

                  {/* Expand icon */}
                  <div className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-5 h-5 text-slate-500" />
                  </div>
                </button>

                {/* Tasks list */}
                {isExpanded && (
                  <div className="px-5 pb-5 space-y-2">
                    <div className="h-px bg-slate-200/50 mb-4" />
                    
                    {sortedTasks.map((task, index) => {
                      const isEditing = editingTask?.playlistId === playlist.id && editingTask?.taskId === task.id;

                      return (
                        renderTaskCard(task, playlist.id, playlist, index, isBottomPlaylist)
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
          )}
        </div>

        {/* Bottom note */}
        <div className="text-center pt-2">
          <p className="text-sm text-slate-500">
            Click on a task's due date or time to make adjustments. Jamie will update your schedule accordingly.
          </p>
        </div>
      </div>
    </DndProvider>
  );
}
