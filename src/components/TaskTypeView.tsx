/**
 * Task Type View
 * Shows tasks grouped by task type
 */

import React from 'react';
import { Calendar, User, Clock, Flag, CircleDot, CheckCircle2, Eye, AlertCircle } from 'lucide-react';
import type { Task } from './TasksPage';
import { taskTypeOptions, getTaskTypeLabel, getTaskTypeColor } from '../utils/taskTypes';

interface TaskTypeViewProps {
  tasks: Task[];
  statusConfig: any;
  onUpdateTask?: (taskId: string, updates: Partial<Task>) => void;
  onEditTask?: (task: Task) => void;
  onArchive?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
  formatDueDate?: (date: string) => string;
  isOverdue?: (date: string | undefined) => boolean;
}

export function TaskTypeView({ 
  tasks, 
  statusConfig,
  onUpdateTask,
  onEditTask, 
  onArchive,
  onDelete,
  formatDueDate,
  isOverdue 
}: TaskTypeViewProps) {
  // Group tasks by type
  const tasksByType = taskTypeOptions.map(typeOption => {
    const typeTasks = tasks.filter(task => task.taskType === typeOption.value);
    return {
      ...typeOption,
      tasks: typeTasks,
      count: typeTasks.length
    };
  });

  // Add a group for tasks with no type
  const noTypeTasks = tasks.filter(task => !task.taskType);
  if (noTypeTasks.length > 0) {
    tasksByType.push({
      value: null as any,
      label: 'No Type',
      color: '#b0b5ba',
      keywords: [],
      tasks: noTypeTasks,
      count: noTypeTasks.length
    });
  }

  // Filter out empty groups
  const nonEmptyGroups = tasksByType.filter(group => group.count > 0);

  const getPriorityColor = (priority?: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-amber-600';
      case 'low': return 'text-blue-600';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: Task['status']) => {
    const config = statusConfig[status];
    const Icon = config?.icon || CircleDot;
    return Icon;
  };

  return (
    <div className="space-y-6">
      {nonEmptyGroups.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          <p>No tasks to display</p>
        </div>
      ) : (
        nonEmptyGroups.map((group) => (
          <div key={group.value || 'no-type'} className="bg-white rounded-2xl border-2 border-slate-200/50 overflow-hidden">
            {/* Group Header */}
            <div 
              className="px-6 py-4 border-b-2 border-slate-200/50 flex items-center justify-between"
              style={{ backgroundColor: `${group.color}20` }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: group.color }}
                />
                <h3 className="font-semibold text-slate-800">{group.label}</h3>
              </div>
              <span className="text-sm font-medium text-slate-600 bg-white px-3 py-1 rounded-full">
                {group.count} {group.count === 1 ? 'task' : 'tasks'}
              </span>
            </div>

            {/* Tasks Grid */}
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {group.tasks.map((task) => {
                const statusConfig_forTask = statusConfig[task.status];
                const StatusIcon = getStatusIcon(task.status);

                return (
                  <div
                    key={task.id}
                    className="bg-white border-2 border-slate-200/50 p-4 rounded-xl hover:shadow-md cursor-pointer transition-all hover:scale-[1.02]"
                    onClick={() => onEditTask?.(task)}
                  >
                    {/* Task Title */}
                    <h4 className="font-medium text-slate-800 mb-3 line-clamp-2">{task.title}</h4>
                    
                    {/* Task Meta */}
                    <div className="space-y-2">
                      {/* Status */}
                      <div className="flex items-center gap-2">
                        <StatusIcon className={`w-3.5 h-3.5 ${statusConfig_forTask.text}`} />
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusConfig_forTask.bg} ${statusConfig_forTask.text}`}>
                          {statusConfig_forTask.label}
                        </span>
                      </div>

                      {/* Contact */}
                      {task.contact && (
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-xs text-slate-600">{task.contact.name}</span>
                        </div>
                      )}

                      {/* Due Date */}
                      {task.dueDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span className={`text-xs ${isOverdue?.(task.dueDate) ? 'text-red-600 font-semibold' : 'text-slate-600'}`}>
                            {formatDueDate?.(task.dueDate) || task.dueDate}
                          </span>
                        </div>
                      )}

                      {/* Priority & Time */}
                      <div className="flex items-center gap-3 flex-wrap">
                        {task.priority && (
                          <div className="flex items-center gap-1">
                            <Flag className={`w-3.5 h-3.5 ${getPriorityColor(task.priority)}`} />
                            <span className={`text-xs capitalize ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                          </div>
                        )}
                        {task.estimatedTime && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-xs text-slate-600">{task.estimatedTime}</span>
                          </div>
                        )}
                      </div>

                      {/* Subtasks indicator */}
                      {task.subtasks && task.subtasks.length > 0 && (
                        <div className="text-xs text-slate-500 pt-2 border-t border-slate-100">
                          {task.subtasks.filter(st => st.status === 'done').length}/{task.subtasks.length} subtasks completed
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
