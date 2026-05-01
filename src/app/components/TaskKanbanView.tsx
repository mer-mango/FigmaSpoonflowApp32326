/**
 * Task Kanban View
 * Kanban board view for task management by status
 */

import React from 'react';
import { Calendar, User, Clock, Flag, Briefcase } from 'lucide-react';
import type { Task } from './TasksPage';
import { getTaskTypeLabel, getTaskTypeColor } from '../utils/taskTypes';

interface TaskKanbanViewProps {
  tasks: Task[];
  statusConfig: any;
  onTaskClick?: (task: Task) => void;
  onEditTask?: (task: Task) => void;
  onUpdateTask?: (taskId: string, updates: Partial<Task>) => void;
  onArchive?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
  formatDueDate?: (date: string) => string;
  isOverdue?: (date: string | undefined) => boolean;
}

export function TaskKanbanView({ 
  tasks, 
  statusConfig, 
  onTaskClick,
  onEditTask, 
  onUpdateTask,
  onArchive,
  onDelete,
  formatDueDate,
  isOverdue 
}: TaskKanbanViewProps) {
  const columns: Array<keyof typeof statusConfig> = ['toDo', 'inProgress', 'awaitingReply', 'done'];

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newStatus: keyof typeof statusConfig) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (onUpdateTask) {
      onUpdateTask(taskId, { status: newStatus as Task['status'] });
    }
  };

  const getPriorityColor = (priority?: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-amber-600';
      case 'low': return 'text-blue-600';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 h-full">
      {columns.map((columnKey) => {
        const config = statusConfig[columnKey];
        const columnTasks = tasks.filter((task) => task.status === columnKey);
        const Icon = config.icon;
        
        return (
          <div 
            key={columnKey} 
            className="flex-shrink-0 w-80"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, columnKey)}
          >
            <div className="bg-white rounded-2xl border-2 border-slate-200/50 h-full flex flex-col">
              {/* Column Header */}
              <div className={`${config.bg} rounded-t-2xl px-4 py-3 border-b-2 border-slate-200/50`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${config.text}`} />
                    <h3 className={`font-semibold ${config.text}`}>{config.label}</h3>
                  </div>
                  <span className={`text-sm font-medium ${config.text}`}>{columnTasks.length}</span>
                </div>
              </div>
              
              {/* Column Content */}
              <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                {columnTasks.length === 0 ? (
                  <div className="text-center text-gray-400 text-sm py-8">
                    No tasks
                  </div>
                ) : (
                  columnTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      className="bg-white border-2 border-slate-200/50 p-4 rounded-xl shadow-sm hover:shadow-md cursor-pointer transition-all hover:scale-[1.02]"
                      onClick={() => onEditTask?.(task)}
                    >
                      {/* Task Title */}
                      <h4 className="font-medium text-slate-800 mb-3 line-clamp-2">{task.title}</h4>
                      
                      {/* Task Meta */}
                      <div className="space-y-2">
                        {/* Task Type */}
                        {task.taskType && (
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                            <span 
                              className="text-xs px-2 py-0.5 rounded-full font-medium"
                              style={{ 
                                backgroundColor: `${getTaskTypeColor(task.taskType)}20`,
                                color: getTaskTypeColor(task.taskType)
                              }}
                            >
                              {getTaskTypeLabel(task.taskType)}
                            </span>
                          </div>
                        )}

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
                        <div className="flex items-center gap-3">
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
                          <div className="text-xs text-slate-500 pt-1 border-t border-slate-100">
                            {task.subtasks.filter(st => st.status === 'done').length}/{task.subtasks.length} subtasks
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}