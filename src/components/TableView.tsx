import React, { useState } from "react";
import { Checkbox } from "./ui/checkbox";
import { 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  MoreVertical, 
  Trash2, 
  Archive, 
  Copy,
  User
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { TaskCardDesignOptions } from "./TaskCardDesignOptions";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "toDo" | "inProgress" | "awaitingReply" | "done";
  dueDate?: string;
  contact?: {
    id: string;
    name: string;
    avatar?: string;
  };
  priority?: "low" | "medium" | "high";
  estimatedTime?: string;
  tags?: string[];
  folder?: string;
  collections?: string[];
  subtasks?: Task[];
  parentId?: string;
  createdAt: string;
  archived?: boolean;
}

interface TableViewProps {
  tasks: Task[];
  selectedTasks: Set<string>;
  setSelectedTasks: (tasks: Set<string>) => void;
  onTaskClick: (task: Task) => void;
  onArchiveTask?: (taskId: string) => void;
  onDeleteTask?: (taskId: string) => void;
  onDuplicateTask?: (task: Task) => void;
  onContactClick?: (contact: { id: string; name: string }) => void;
  onTogglePriority?: (taskId: string) => void;
}

const statusConfig = {
  toDo: { label: "To Do", color: "#ffffff", bgColor: "rgba(202, 78, 99, 0.7)" },
  inProgress: { label: "In Progress", color: "#ffffff", bgColor: "rgba(234, 156, 128, 0.7)" },
  awaitingReply: { label: "Awaiting Reply", color: "#ffffff", bgColor: "rgba(246, 202, 142, 0.7)" },
  done: { label: "Done", color: "#ffffff", bgColor: "rgba(135, 160, 141, 0.7)" },
};

const folderColors: Record<string, string> = {
  scheduling: "#3b82f6",
  deliverables: "#f59e0b",
  admin: "#6b7280",
  followups: "#10b981",
};

export function TableView({
  tasks,
  selectedTasks,
  setSelectedTasks,
  onTaskClick,
  onArchiveTask,
  onDeleteTask,
  onDuplicateTask,
  onContactClick,
  onTogglePriority,
}: TableViewProps) {
  const handleToggleTask = (taskId: string) => {
    const newSet = new Set(selectedTasks);
    if (newSet.has(taskId)) {
      newSet.delete(taskId);
    } else {
      newSet.add(taskId);
    }
    setSelectedTasks(newSet);
  };

  const formatDueDate = (dateStr: string) => {
    // Parse date string in local timezone to avoid timezone issues
    // If dateStr is "2025-12-01", create date as local midnight, not UTC
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Normalize dates to midnight for comparison
    const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const tomorrowDay = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());

    if (dateDay.getTime() === todayDay.getTime()) return "Today";
    if (dateDay.getTime() === tomorrowDay.getTime()) return "Tomorrow";

    const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  const isOverdue = (dateStr?: string) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const today = new Date();
    const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return dateDay < todayDay;
  };

  const getTypeColor = (folder?: string) => {
    if (!folder) return "#adc3a6";
    return folderColors[folder] || "#adc3a6";
  };

  return (
    <div className="px-8 py-6 pb-[200px]">
      <div className="space-y-3 max-w-full">
        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-4" />
            </div>
            <p className="text-gray-600">No tasks found</p>
            <p className="text-sm text-gray-500 mt-1">
              Try adjusting your filters or create a new task
            </p>
          </div>
        ) : (
          tasks.map(task => (
            <TaskCardDesignOptions
              key={task.id}
              design={6}
              task={task}
              isSelected={selectedTasks.has(task.id)}
              onToggleSelect={() => handleToggleTask(task.id)}
              onClick={() => onTaskClick(task)}
              onContactClick={onContactClick}
              onTogglePriority={onTogglePriority}
              onDuplicate={onDuplicateTask}
              onArchive={onArchiveTask}
              onDelete={onDeleteTask}
            />
          ))
        )}
      </div>
    </div>
  );
}