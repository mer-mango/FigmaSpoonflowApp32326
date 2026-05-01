import React, { useState, useMemo, useEffect } from 'react';
import { 
  Sparkles, 
  ListTodo, 
  Flag, 
  Calendar as CalendarIcon, 
  User, 
  ChevronRight, 
  CheckCircle2, 
  Circle, 
  Archive, 
  ArrowLeft, 
  Clock, 
  Filter, 
  Search, 
  ChevronDown, 
  Mail,
  X,
  Edit3,
  MoreVertical,
  Trash2,
  CircleDot,
  AlertCircle,
  List,
  LayoutGrid,
  Briefcase,
  SortAsc,
  Star
} from "lucide-react";
import { TaskModal } from "./muted_TaskModal";
import { Contact, Task, TaskType } from "../types";
import { getTodayLocal } from '../utils/dateUtils';
import { sortContactsByLastName } from '../utils/contactSorting';
import { taskTypeOptions, getTaskTypeLabel, getTaskTypeColor } from '../utils/taskTypes';
import { PageHeader_Muted } from './PageHeader_Muted';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { TaskKanbanView } from './TaskKanbanView';
import { TaskTypeView } from './TaskTypeView';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "toDo" | "inProgress" | "awaitingReply" | "done";
  dueDate?: string; // ISO date string
  contact?: {
    id: string;
    name: string;
    avatar?: string;
  };
  priority?: "low" | "medium" | "high";
  estimatedTime?: string;
  taskType?: TaskType;
  tags?: string[];
  subtasks?: Task[];
  parentId?: string;
  createdAt: string;
  archived?: boolean;
}

interface TasksPageProps {
  onNavigate?: (page: 'today' | 'tasks') => void;
  onTasksChange?: (tasks: Task[]) => void;
  tasks?: Task[];
  onEditTask?: (task: Task) => void;
  onUpdateTask?: (taskId: string, updates: Partial<Task>) => void;
  onContactClick?: (contactId: string) => void;
  onQuickAddSelect?: (type: 'task' | 'contact' | 'content' | 'voice') => void;
  onJamieAction?: (type: 'plan-day' | 'post-meeting' | 'wind-down' | 'chat') => void;
  onGetStarted?: (task: Task) => void; // Start my task handler
  onBack?: () => void; // Back navigation handler
}

export function TasksPage({ onNavigate, onTasksChange, tasks: propTasks, onEditTask, onUpdateTask, onContactClick, onQuickAddSelect, onJamieAction, onGetStarted, onBack }: TasksPageProps = {}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedView, setSelectedView] = useState("all");
  const [showArchived, setShowArchived] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'type'>('list');
  const [showBatchStatusMenu, setShowBatchStatusMenu] = useState(false);
  
  // Filter states
  const [statusFilters, setStatusFilters] = useState({
    toDo: true,
    inProgress: true,
    awaitingReply: true,
    done: false,
  });
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [selectedTaskType, setSelectedTaskType] = useState<TaskType | null>(null);
  const [sortBy, setSortBy] = useState("dueDate");
  const [showFilters, setShowFilters] = useState(false);

  // Use tasks from props if provided, otherwise use empty array
  const allTasks = propTasks || [];

  // Get unique contacts for filter
  const contacts = useMemo(() => {
    const contactMap = new Map();
    allTasks.forEach(task => {
      if (task.contact) {
        contactMap.set(task.contact.id, task.contact);
      }
    });
    return Array.from(contactMap.values());
  }, [allTasks]);

  // Notify parent of task changes
  useEffect(() => {
    if (onTasksChange) {
      onTasksChange(allTasks);
    }
  }, [allTasks, onTasksChange]);

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let filtered = allTasks.filter(task => {
      // Filter out subtasks (they'll be shown nested)
      if (task.parentId) return false;

      // Archive filter - treat undefined archived as false
      const isArchived = task.archived === true;
      if (showArchived && !isArchived) return false;
      if (!showArchived && isArchived) return false;

      // Status filter
      if (!statusFilters[task.status]) return false;

      // Search filter
      if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Contact filter
      if (selectedContact && task.contact?.id !== selectedContact) {
        return false;
      }

      // Task Type filter
      if (selectedTaskType && task.taskType !== selectedTaskType) {
        return false;
      }

      // Date filter
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      if (dateFilter === "today" && task.dueDate) {
        const taskDate = new Date(task.dueDate);
        const taskDay = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
        if (taskDay.getTime() !== today.getTime()) return false;
      } else if (dateFilter === "thisWeek" && task.dueDate) {
        const weekFromNow = new Date(today.getTime() + 7 * 86400000);
        const taskDate = new Date(task.dueDate);
        if (taskDate < today || taskDate > weekFromNow) return false;
      } else if (dateFilter === "overdue" && task.dueDate) {
        const taskDate = new Date(task.dueDate);
        if (taskDate >= today) return false;
      } else if (dateFilter === "noDueDate") {
        if (task.dueDate) return false;
      }

      // Quick view filters
      if (selectedView === "today" && task.dueDate) {
        const taskDate = new Date(task.dueDate);
        const taskDay = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
        if (taskDay.getTime() !== today.getTime()) return false;
      } else if (selectedView === "thisWeek" && task.dueDate) {
        const weekFromNow = new Date(today.getTime() + 7 * 86400000);
        const taskDate = new Date(task.dueDate);
        if (taskDate < today || taskDate > weekFromNow) return false;
      } else if (selectedView === "overdue" && task.dueDate) {
        const taskDate = new Date(task.dueDate);
        if (taskDate >= today) return false;
      } else if (selectedView === "awaitingReply") {
        if (task.status !== "awaitingReply") return false;
      } else if (selectedView === "noDueDate") {
        if (task.dueDate) return false;
      }

      return true;
    });

    // Sort: no due date first, then chronologically by due date
    filtered.sort((a, b) => {
      // Sort based on selected option
      switch (sortBy) {
        case 'dueDate':
          // If both have no due date, maintain original order
          if (!a.dueDate && !b.dueDate) {
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          }
          // Tasks without due dates come first
          if (!a.dueDate) return -1;
          if (!b.dueDate) return 1;
          // Both have due dates - sort chronologically
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        
        case 'dateCreated':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // Newest first
        
        case 'priority':
          const priorityOrder = { high: 1, medium: 2, low: 3 };
          const aPriority = a.priority ? priorityOrder[a.priority] : 4;
          const bPriority = b.priority ? priorityOrder[b.priority] : 4;
          return aPriority - bPriority;
        
        case 'status':
          const statusOrder = { toDo: 1, inProgress: 2, awaitingReply: 3, done: 4 };
          return statusOrder[a.status] - statusOrder[b.status];
        
        case 'title':
          return a.title.localeCompare(b.title);
        
        default:
          return 0;
      }
    });

    return filtered;
  }, [allTasks, showArchived, statusFilters, searchQuery, selectedContact, selectedTaskType, dateFilter, selectedView, sortBy]);

  const handleToggleTask = (taskId: string) => {
    setSelectedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    setSelectedTasks(new Set(filteredTasks.map(t => t.id)));
  };

  const handleDeselectAll = () => {
    setSelectedTasks(new Set());
  };

  const handleToggleExpand = (taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const handleArchiveTask = (taskId: string) => {
    if (onTasksChange) {
      const updatedTasks = allTasks.map(task => 
        task.id === taskId ? { ...task, archived: true } : task
      );
      onTasksChange(updatedTasks);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (onTasksChange) {
      const updatedTasks = allTasks.filter(task => task.id !== taskId);
      onTasksChange(updatedTasks);
    }
  };

  const handleBatchArchive = () => {
    if (onTasksChange) {
      const updatedTasks = allTasks.map(task => 
        selectedTasks.has(task.id) ? { ...task, archived: true } : task
      );
      onTasksChange(updatedTasks);
    }
    setSelectedTasks(new Set());
  };

  const handleBatchDelete = () => {
    if (onTasksChange) {
      const updatedTasks = allTasks.filter(task => !selectedTasks.has(task.id));
      onTasksChange(updatedTasks);
    }
    setSelectedTasks(new Set());
  };

  const handleBatchMarkDone = () => {
    if (onTasksChange) {
      const updatedTasks = allTasks.map(task => 
        selectedTasks.has(task.id) ? { ...task, status: 'done' as const } : task
      );
      onTasksChange(updatedTasks);
    }
    setSelectedTasks(new Set());
  };

  const handleBatchChangeStatus = (newStatus: 'toDo' | 'inProgress' | 'awaitingReply' | 'done') => {
    if (onTasksChange) {
      const updatedTasks = allTasks.map(task => 
        selectedTasks.has(task.id) ? { ...task, status: newStatus } : task
      );
      onTasksChange(updatedTasks);
    }
    setSelectedTasks(new Set());
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    // Parse date as local date to avoid timezone issues
    const [year, month, day] = dueDate.split('-').map(Number);
    const taskDate = new Date(year, month - 1, day);
    return taskDate < today;
  };

  const formatDueDate = (dueDate: string) => {
    // Parse date as local date to avoid timezone issues
    const [year, month, day] = dueDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    // Get today using the same approach as getTodayLocal to avoid timezone issues
    const now = new Date();
    const todayYear = now.getFullYear();
    const todayMonth = now.getMonth();
    const todayDay = now.getDate();
    const today = new Date(todayYear, todayMonth, todayDay);
    const taskDay = new Date(year, month - 1, day);
    
    const diffTime = taskDay.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    
    // Always return numerical date for everything else
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const statusConfig = {
    toDo: {
      label: "To Do",
      bg: "bg-[#d6a0a9]/50",
      text: "text-[#8b4d5a]",
      icon: CircleDot,
      color: "#d6a0a9",
      bgColor: "#d6a0a920",
    },
    inProgress: {
      label: "In Progress",
      bg: "bg-[#e4b9ab]/50",
      text: "text-[#a6715f]",
      icon: Clock,
      color: "#e4b9ab",
      bgColor: "#e4b9ab20",
    },
    awaitingReply: {
      label: "Awaiting Reply",
      bg: "bg-[#e1d6cb]/50",
      text: "text-[#6b6460]",
      icon: AlertCircle,
      color: "#e1d6cb",
      bgColor: "#e1d6cb20",
    },
    done: {
      label: "Done",
      bg: "bg-[#c2cfc9]/50",
      text: "text-[#5a726b]",
      icon: CheckCircle2,
      color: "#c2cfc9",
      bgColor: "#c2cfc920",
    },
  };

  const quickViews = [
    { 
      id: "all", 
      label: "All Tasks", 
      count: allTasks.filter(t => !t.archived && t.status !== 'done').length 
    },
    { id: "today", label: "Today" },
    { id: "thisWeek", label: "This Week" },
    { id: "overdue", label: "Overdue" },
    { id: "awaitingReply", label: "Awaiting Reply" },
    { id: "noDueDate", label: "No Due Date" },
  ];

  const handleAddTask = () => {
    // Open the task modal in "new" mode
    if (onEditTask) {
      onEditTask(null as any); // Pass null to indicate "new task" mode
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#ebeef4] overflow-hidden">
      {/* Header */}
      <PageHeader_Muted
        title="Tasks"
        newButtonLabel="New Task"
        newButtonColor="#c198ad"
        onNewClick={handleAddTask}
        onQuickAddSelect={onQuickAddSelect}
        onJamieAction={onJamieAction}
        onBack={onBack}
        showBackButton={!!onBack}
      />

      {/* Filter and Sort Bar */}
      <div className="backdrop-blur-xl border-b border-slate-200/50 px-8 py-[18px]" style={{ backgroundColor: '#F7F7F9' }}>
        <div className="flex items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="pl-10 rounded-2xl border-slate-200/50 bg-white/60 backdrop-blur-sm focus:bg-white/80"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="rounded-2xl bg-white/60 backdrop-blur-sm hover:bg-white/80 border-slate-200/50"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </Button>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <SortAsc className="w-4 h-4 text-slate-500" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="text-sm border-none bg-transparent text-slate-700 cursor-pointer focus:outline-none"
            >
              <option value="dueDate">Due Date</option>
              <option value="dateCreated">Date Created</option>
              <option value="priority">Priority</option>
              <option value="status">Status</option>
              <option value="title">Title</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-white/60 backdrop-blur-sm rounded-2xl p-1 border border-slate-200/50">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl transition-all ${
                viewMode === 'list'
                  ? 'bg-[#c198ad] text-white shadow-soft'
                  : 'text-slate-600 hover:bg-white/60'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded-xl transition-all ${
                viewMode === 'kanban'
                  ? 'bg-[#c198ad] text-white shadow-soft'
                  : 'text-slate-600 hover:bg-white/60'
              }`}
              title="Kanban View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('type')}
              className={`p-2 rounded-xl transition-all ${
                viewMode === 'type'
                  ? 'bg-[#c198ad] text-white shadow-soft'
                  : 'text-slate-600 hover:bg-white/60'
              }`}
              title="Type View"
            >
              <Briefcase className="w-4 h-4" />
            </button>
          </div>

          <div className="text-sm text-slate-500">
            {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-200/50 grid grid-cols-2 gap-6">
            {/* Status Filters */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-3 block">Status</label>
              <div className="space-y-2">
                {Object.entries(statusConfig).map(([key, config]) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer group">
                    <Checkbox
                      checked={statusFilters[key as keyof typeof statusFilters]}
                      onCheckedChange={checked =>
                        setStatusFilters(prev => ({ ...prev, [key]: checked as boolean }))
                      }
                    />
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: config.color }}
                    />
                    <span className="text-sm text-slate-700 group-hover:text-slate-900">
                      {config.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Date Filter */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-3 block">Due Date</label>
              <div className="space-y-2">
                {[
                  { value: "all", label: "All Dates" },
                  { value: "today", label: "Today" },
                  { value: "thisWeek", label: "This Week" },
                  { value: "overdue", label: "Overdue" },
                  { value: "noDueDate", label: "No Due Date" },
                ].map(option => (
                  <label key={option.value} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="dateFilter"
                      value={option.value}
                      checked={dateFilter === option.value}
                      onChange={e => setDateFilter(e.target.value)}
                      className="text-[#c198ad] focus:ring-[#c198ad]"
                    />
                    <span className="text-sm text-slate-700 group-hover:text-slate-900">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Contact Filter */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-3 block">Contact</label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="contactFilter"
                    checked={selectedContact === null}
                    onChange={() => setSelectedContact(null)}
                    className="text-[#c198ad] focus:ring-[#c198ad]"
                  />
                  <span className="text-sm text-slate-700 group-hover:text-slate-900">
                    All Contacts
                  </span>
                </label>
                {sortContactsByLastName(contacts).map(contact => (
                  <label key={contact.id} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="contactFilter"
                      checked={selectedContact === contact.id}
                      onChange={() => setSelectedContact(contact.id)}
                      className="text-[#c198ad] focus:ring-[#c198ad]"
                    />
                    <span className="text-sm text-slate-700 group-hover:text-slate-900">
                      {contact.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Task Type Filter */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-3 block">Task Type</label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="taskTypeFilter"
                    checked={selectedTaskType === null}
                    onChange={() => setSelectedTaskType(null)}
                    className="text-[#c198ad] focus:ring-[#c198ad]"
                  />
                  <span className="text-sm text-slate-700 group-hover:text-slate-900">
                    All Task Types
                  </span>
                </label>
                {taskTypeOptions.map(taskType => (
                  <label key={taskType.value} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="taskTypeFilter"
                      checked={selectedTaskType === taskType.value}
                      onChange={() => setSelectedTaskType(taskType.value)}
                      className="text-[#c198ad] focus:ring-[#c198ad]"
                    />
                    <span className="text-sm text-slate-700 group-hover:text-slate-900">
                      {taskType.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Batch Actions Bar */}
      {selectedTasks.size > 0 && (
        <div className="bg-[#c198ad] text-white px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-medium">
              {selectedTasks.size} task{selectedTasks.size !== 1 ? "s" : ""} selected
            </span>
            <button
              onClick={handleSelectAll}
              className="text-sm text-white/80 hover:text-white underline"
            >
              Select All ({filteredTasks.length})
            </button>
            <button
              onClick={handleDeselectAll}
              className="text-sm text-white/80 hover:text-white underline"
            >
              Deselect All
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/10 rounded-2xl"
              onClick={handleBatchMarkDone}
            >
              Mark Done
            </Button>
            <div className="relative">
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/10 rounded-2xl"
                onClick={() => setShowBatchStatusMenu(!showBatchStatusMenu)}
              >
                Change Status
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
              
              {showBatchStatusMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-[5]" 
                    onClick={() => setShowBatchStatusMenu(false)}
                  />
                  <div className="absolute top-full mt-2 right-0 bg-white rounded-2xl shadow-xl border-2 border-slate-200/50 py-2 z-50 min-w-[180px]">
                    {Object.entries(statusConfig).map(([key, cfg]: [string, any]) => {
                      const Icon = cfg.icon;
                      return (
                        <button
                          key={key}
                          onClick={() => {
                            handleBatchChangeStatus(key as any);
                            setShowBatchStatusMenu(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
                        >
                          <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                          <span style={{ color: cfg.color }}>{cfg.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/10 rounded-2xl"
              onClick={handleBatchArchive}
            >
              <Archive className="w-4 h-4 mr-1" />
              Archive ({selectedTasks.size})
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/10 rounded-2xl"
              onClick={handleBatchDelete}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete ({selectedTasks.size})
            </Button>
          </div>
        </div>
      )}

      {/* Tasks List/Kanban/Type */}
      <div className="flex-1 overflow-y-auto px-8 py-6 bg-[#F7F7F9]">
        {viewMode === 'kanban' ? (
          <TaskKanbanView
            tasks={filteredTasks}
            statusConfig={statusConfig}
            onUpdateTask={onUpdateTask}
            onEditTask={onEditTask}
            onArchive={handleArchiveTask}
            onDelete={handleDeleteTask}
            formatDueDate={formatDueDate}
            isOverdue={isOverdue}
          />
        ) : viewMode === 'type' ? (
          <DndProvider backend={HTML5Backend}>
            <TaskTypeView
              tasks={filteredTasks}
              statusConfig={statusConfig}
              onUpdateTask={onUpdateTask}
              onEditTask={onEditTask}
              onArchive={handleArchiveTask}
              onDelete={handleDeleteTask}
              formatDueDate={formatDueDate}
              isOverdue={isOverdue}
            />
          </DndProvider>
        ) : (
          <div className="space-y-2 max-w-6xl relative">
            {/* Vertical timeline line spanning from first to last date box */}
            {filteredTasks.length > 0 && (() => {
              // Find indices of tasks that show date boxes
              const dateBoxIndices: number[] = [];
              filteredTasks.forEach((task, index) => {
                const prevTask = index > 0 ? filteredTasks[index - 1] : null;
                const showDateBox = !prevTask || prevTask.dueDate !== task.dueDate;
                if (showDateBox) {
                  dateBoxIndices.push(index);
                }
              });
              
              if (dateBoxIndices.length === 0) return null;
              
              const firstIndex = dateBoxIndices[0];
              const lastIndex = dateBoxIndices[dateBoxIndices.length - 1];
              
              // Each task takes up: task height (variable, estimate 80px min) + gap (8px)
              // But we need to measure from center of first box to center of last box
              // Simplified: use a very long line that extends through all tasks
              
              return null; // We'll render per-task instead
            })()}
            
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-slate-400 mb-2">
                  <Circle className="w-12 h-12 mx-auto mb-4" />
                </div>
                <p className="text-slate-600">No tasks found</p>
                <p className="text-sm text-slate-500 mt-1">
                  Try adjusting your filters or create a new task
                </p>
              </div>
            ) : (
              filteredTasks.map((task, index) => {
                // Determine if this task should show a date box
                const prevTask = index > 0 ? filteredTasks[index - 1] : null;
                const showDateBox = !prevTask || prevTask.dueDate !== task.dueDate;
                
                return (
                  <TaskCard
                    key={task.id}
                    task={task}
                    showDateBox={showDateBox}
                    isSelected={selectedTasks.has(task.id)}
                    isExpanded={expandedTasks.has(task.id)}
                    onToggleSelect={() => handleToggleTask(task.id)}
                    onToggleExpand={() => handleToggleExpand(task.id)}
                    onClick={() => {}} // Removed onJamieClick
                    statusConfig={statusConfig}
                    isOverdue={isOverdue(task.dueDate)}
                    formatDueDate={formatDueDate}
                    onArchive={handleArchiveTask}
                    onDelete={handleDeleteTask}
                    onEditTask={onEditTask}
                    onUpdateTask={onUpdateTask}
                    onContactClick={onContactClick}
                  />
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TaskCard({
  task,
  showDateBox,
  isSelected,
  isExpanded,
  onToggleSelect,
  onToggleExpand,
  onClick,
  statusConfig,
  isOverdue,
  formatDueDate,
  onArchive,
  onDelete,
  onEditTask,
  onUpdateTask,
  onContactClick,
}: {
  task: Task;
  showDateBox: boolean;
  isSelected: boolean;
  isExpanded: boolean;
  onToggleSelect: () => void;
  onToggleExpand: () => void;
  onClick: () => void;
  statusConfig: any;
  isOverdue: boolean;
  formatDueDate: (date: string) => string;
  onArchive: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onEditTask?: (task: Task) => void;
  onUpdateTask?: (taskId: string, updates: Partial<Task>) => void;
  onContactClick?: (contactId: string) => void;
}) {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [editingStatus, setEditingStatus] = useState(false);
  const [editingTime, setEditingTime] = useState(false);
  const [tempTime, setTempTime] = useState('');
  const [editingDate, setEditingDate] = useState(false);
  const [tempDate, setTempDate] = useState('');
  const config = statusConfig[task.status];
  const StatusIcon = config.icon;
  const hasSubtasks = task.subtasks && task.subtasks.length > 0;

  const handleStatusChange = (newStatus: "toDo" | "inProgress" | "awaitingReply" | "done") => {
    setEditingStatus(false);
    if (onUpdateTask) {
      // Auto-archive when task is marked as done
      if (newStatus === 'done') {
        onUpdateTask(task.id, { status: newStatus, archived: true });
      } else {
        onUpdateTask(task.id, { status: newStatus });
      }
    }
  };

  const handleTogglePriority = () => {
    if (onUpdateTask) {
      const newPriority = task.priority === 'high' ? undefined : 'high';
      onUpdateTask(task.id, { priority: newPriority });
    }
  };

  const handleStartEditTime = () => {
    setEditingTime(true);
    // Parse existing time if it exists (e.g., "30m" or "1h 30m")
    const currentTime = task.estimatedTime || '30m';
    const minutes = parseTimeToMinutes(currentTime);
    setTempTime(minutes.toString());
  };

  const handleSaveTime = () => {
    if (onUpdateTask && tempTime) {
      const minutes = parseInt(tempTime) || 30;
      const formatted = formatMinutes(minutes);
      console.log(`[TaskRowItem] Saving time for task "${task.title}": ${tempTime} mins -> ${formatted}`);
      console.log(`[TaskRowItem] Task ID: ${task.id}, Current estimatedTime: ${task.estimatedTime}`);
      onUpdateTask(task.id, { estimatedTime: formatted });
      console.log(`[TaskRowItem] onUpdateTask called with:`, { estimatedTime: formatted });
    } else {
      console.warn(`[TaskRowItem] Cannot save time - onUpdateTask: ${!!onUpdateTask}, tempTime: ${tempTime}`);
    }
    setEditingTime(false);
  };

  const parseTimeToMinutes = (timeStr: string): number => {
    if (!timeStr) return 30;
    // Handle formats like "30m", "1h", "1h 30m"
    const hourMatch = timeStr.match(/(\d+)h/);
    const minMatch = timeStr.match(/(\d+)m/);
    const hours = hourMatch ? parseInt(hourMatch[1]) : 0;
    const mins = minMatch ? parseInt(minMatch[1]) : 0;
    return hours * 60 + mins || 30;
  };

  const handleStartEditDate = () => {
    setEditingDate(true);
    // Convert existing date to YYYY-MM-DD format for input
    const currentDate = task.dueDate || new Date().toISOString().split('T')[0];
    const dateOnly = currentDate.includes('T') ? currentDate.split('T')[0] : currentDate;
    setTempDate(dateOnly);
  };

  const handleSaveDate = () => {
    if (onUpdateTask && tempDate) {
      console.log(`[TaskRowItem] Saving date for task \"${task.title}\": ${tempDate}`);
      onUpdateTask(task.id, { dueDate: tempDate });
    }
    setEditingDate(false);
  };

  const formatMinutes = (totalMinutes: number): string => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h`;
    return `${minutes}m`;
  };

  // Format the timeline date box
  const formatTimelineDate = (dueDate?: string): string => {
    if (!dueDate) return "—";
    const [year, month, day] = dueDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const dayName = date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
    const monthNum = month;
    const dayNum = day;
    return `${dayName} ${monthNum}/${dayNum}`;
  };

  return (
    <div className="flex items-center gap-5 relative">
      {/* Timeline Date Box - Far Left */}
      {showDateBox && (
        <div className="flex-shrink-0 w-14 h-14 rounded-md flex flex-col items-center justify-center text-xs font-semibold relative z-10" style={{ backgroundColor: task.dueDate ? '#c198ad' : '#e5e7eb', color: task.dueDate ? 'white' : '#9ca3af' }}>
          {task.dueDate ? (
            <>
              <div className="text-[10px] leading-tight">{formatTimelineDate(task.dueDate).split(' ')[0]}</div>
              <div className="text-xs font-bold leading-tight">{formatTimelineDate(task.dueDate).split(' ')[1]}</div>
            </>
          ) : (
            <div className="text-xl">—</div>
          )}
        </div>
      )}
      
      {/* Spacer for tasks without date box */}
      {!showDateBox && <div className="w-14 flex-shrink-0" />}

      {/* Task Container */}
      <div 
        className="flex-1 p-4 rounded-md bg-white/80 border-2 border-slate-200/50 hover:bg-white/90 hover:border-slate-300/50 transition-all group relative cursor-pointer"
        onClick={() => {
          if (onEditTask) {
            onEditTask(task);
          }
        }}
      >
        <div className="flex items-start gap-3">
          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title and More Menu */}
            <div className="flex items-start gap-2 mb-2">
              <h4 className="font-medium text-slate-800 flex-1">
                {task.title}
              </h4>
              {/* Checkbox - Far Right */}
              <div className="flex-shrink-0">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={onToggleSelect}
                  onClick={e => e.stopPropagation()}
                />
              </div>
              {/* More Menu - Three dots - After Checkbox */}
              <div className="relative flex-shrink-0">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setShowMoreMenu(!showMoreMenu);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100/60 rounded-lg transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                
                {showMoreMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-[5]" 
                      onClick={() => setShowMoreMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-slate-200/50 py-1.5 z-50 min-w-[160px]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onEditTask) {
                            onEditTask(task);
                          }
                          setShowMoreMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onArchive(task.id);
                          setShowMoreMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Archive className="w-4 h-4" />
                        Archive
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(task.id);
                          setShowMoreMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-[#d88b8b] hover:bg-[#d88b8b]/10 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {task.description && (
              <p className="text-sm text-slate-600 mb-2">
                {task.description}
              </p>
            )}

            {/* Badges in order: Status → Contact → Due Date → Duration → Star */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Status Badge - FIRST */}
              {editingStatus ? (
                <div className="relative" onClick={e => e.stopPropagation()}>
                  <div 
                    className="fixed inset-0 z-[5]" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingStatus(false);
                    }}
                  />
                  <div className="absolute top-full mt-1 left-0 bg-white rounded-2xl shadow-xl border-2 border-slate-200/50 p-3 space-y-1.5 z-[60] min-w-[140px] max-h-[280px] overflow-y-auto">
                    {Object.entries(statusConfig).map(([key, cfg]: [string, any]) => {
                      return (
                        <button
                          key={key}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(key as any);
                          }}
                          className={`w-full px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover:scale-105 ${cfg.bg} ${cfg.text}`}
                        >
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingStatus(true);
                  }}
                  className="hover:opacity-80 transition-opacity"
                >
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                    {config.label}
                  </span>
                </button>
              )}

              {/* Contact Badge - SECOND */}
              {task.contact && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onContactClick && task.contact) {
                      onContactClick(task.contact.id);
                    }
                  }}
                  className="flex items-center gap-1.5 text-xs transition-all px-2 py-1 rounded-lg bg-[#2f829b]/10 text-[#2f829b] hover:bg-[#2f829b]/20"
                  title={`View ${task.contact.name}'s profile`}
                >
                  <User className="w-3.5 h-3.5" />
                  {task.contact.name}
                </button>
              )}

              {/* Task Type Badge - THIRD */}
              {task.taskType && (
                <div 
                  className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg"
                  style={{ 
                    backgroundColor: `${getTaskTypeColor(task.taskType)}20`, 
                    color: getTaskTypeColor(task.taskType) 
                  }}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  {getTaskTypeLabel(task.taskType)}
                </div>
              )}

              {/* Due Date - FOURTH */}
              {editingDate ? (
                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                  <CalendarIcon className="w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="date"
                    value={tempDate}
                    onChange={e => setTempDate(e.target.value)}
                    onBlur={handleSaveDate}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleSaveDate();
                      if (e.key === 'Escape') setEditingDate(false);
                    }}
                    className="px-1.5 py-0.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5e2350]/30"
                    autoFocus
                  />
                </div>
              ) : task.dueDate ? (
                <button
                  onClick={e => {
                    e.stopPropagation();
                    handleStartEditDate();
                  }}
                  className={`flex items-center gap-1 text-xs transition-all px-2 py-1 rounded-lg ${
                    isOverdue
                      ? "text-[#d88b8b] bg-[#d88b8b]/10 hover:bg-[#d88b8b]/20"
                      : "text-slate-600 bg-slate-100/60 hover:bg-slate-100"
                  }`}
                >
                  <CalendarIcon className="w-3.5 h-3.5" />
                  {formatDueDate(task.dueDate)}
                  {isOverdue && <span className="ml-1 font-bold">OVERDUE</span>}
                </button>
              ) : null}

              {/* Duration - FIFTH */}
              {editingTime ? (
                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="number"
                    value={tempTime}
                    onChange={e => setTempTime(e.target.value)}
                    onBlur={handleSaveTime}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleSaveTime();
                      if (e.key === 'Escape') setEditingTime(false);
                    }}
                    min="5"
                    step="5"
                    className="w-14 px-1.5 py-0.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#5e2350]/30"
                    autoFocus
                  />
                  <span className="text-xs text-slate-500">min</span>
                </div>
              ) : (
                <button
                  onClick={e => {
                    e.stopPropagation();
                    handleStartEditTime();
                  }}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-[#5e2350] transition-all px-2 py-1 rounded-lg hover:bg-[#5e2350]/5"
                >
                  <Clock className="w-3.5 h-3.5" />
                  {task.estimatedTime || '30m'}
                </button>
              )}

              {/* Star - SIXTH (LAST) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleTogglePriority();
                }}
                className="hover:scale-110 transition-transform"
                title={task.priority === "high" ? 'Remove priority' : 'Add priority'}
              >
                <Star 
                  className={`w-4 h-4 ${task.priority === "high" ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`}
                />
              </button>
            </div>

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap mt-2">
                {task.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-lg text-xs bg-slate-100/60 text-slate-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Subtasks count badge */}
            {hasSubtasks && (
              <div className="mt-2">
                <div className="inline-flex px-2 py-1 rounded-lg text-xs bg-purple-50 text-purple-700">
                  {task.subtasks!.filter(st => st.status === "done").length}/
                  {task.subtasks!.length} subtasks
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Subtasks */}
        {hasSubtasks && isExpanded && (
          <div className="mt-3 ml-11 space-y-1.5 pl-4 border-l-2 border-slate-200/50">
            {task.subtasks!.map(subtask => (
              <SubtaskCard
                key={subtask.id}
                subtask={subtask}
                statusConfig={statusConfig}
              />
            ))}
          </div>
        )}

        {/* Click outside handler for status dropdown */}
        {editingStatus && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setEditingStatus(false)}
          />
        )}
      </div>
    </div>
  );
}

function SubtaskCard({
  subtask,
  statusConfig,
}: {
  subtask: Task;
  statusConfig: any;
}) {
  const config = statusConfig[subtask.status];
  const StatusIcon = config.icon;

  return (
    <div className="flex items-center gap-2 p-2 bg-slate-50/60 backdrop-blur-sm rounded-2xl hover:bg-slate-100/60 transition-colors cursor-pointer">
      <Checkbox checked={subtask.status === "done"} />
      <div
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: config.color }}
      />
      <span className={`text-sm flex-1 ${subtask.status === "done" ? "line-through text-slate-500" : "text-slate-700"}`}>
        {subtask.title}
      </span>
      <div
        className="px-1.5 py-0.5 rounded-lg text-xs"
        style={{ backgroundColor: config.bgColor, color: config.color }}
      >
        {config.label}
      </div>
    </div>
  );
}