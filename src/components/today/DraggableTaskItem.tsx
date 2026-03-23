import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Clock, Calendar, User, Save, X, Archive, Star, Briefcase, CheckSquare, Pin, Sprout } from 'lucide-react';
import { getTaskTypeLabel, getTaskTypeColor } from '../../utils/taskTypes';

const ITEM_TYPE = 'PLAYLIST_TASK';

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

interface DraggableTaskItemProps {
  task: Task;
  playlistId: string;
  playlist: Playlist;
  index: number;
  isBottomSection: boolean;
  moveTask: (playlistId: string, dragIndex: number, hoverIndex: number) => void;
  editingStatus: { playlistId: string; taskId: string } | null;
  setEditingStatus: (value: { playlistId: string; taskId: string } | null) => void;
  editingDueDate: { playlistId: string; taskId: string } | null;
  tempDueDate: string;
  setTempDueDate: (value: string) => void;
  tempCustomDate: string;
  setTempCustomDate: (value: string) => void;
  editingTime: { playlistId: string; taskId: string } | null;
  tempTime: string;
  setTempTime: (value: string) => void;
  handleStatusChange: (playlistId: string, taskId: string, status: string) => void;
  handleStartEditDueDate: (playlistId: string, task: Task) => void;
  handleSaveDueDate: (playlistId: string, taskId: string) => void;
  setEditingDueDate: (value: { playlistId: string; taskId: string } | null) => void;
  handleStartEditTime: (playlistId: string, task: Task) => void;
  handleSaveTime: (playlistId: string, taskId: string) => void;
  setEditingTime: (value: { playlistId: string; taskId: string } | null) => void;
  handleTogglePriority: (playlistId: string, taskId: string) => void;
  handleArchiveTask: (playlistId: string, taskId: string) => void;
  getStatusBadge: (status: string, taskType: 'task' | 'content' | 'nurture') => JSX.Element;
  getStatusOption: (status: string, taskType: 'task' | 'content' | 'nurture') => any;
  formatDueDate: (date: Date | undefined) => string;
  displayTime: (timeValue: string | number | undefined) => string;
}

export function DraggableTaskItem({
  task,
  playlistId,
  playlist,
  index,
  isBottomSection,
  moveTask,
  editingStatus,
  setEditingStatus,
  editingDueDate,
  tempDueDate,
  setTempDueDate,
  tempCustomDate,
  setTempCustomDate,
  editingTime,
  tempTime,
  setTempTime,
  handleStatusChange,
  handleStartEditDueDate,
  handleSaveDueDate,
  setEditingDueDate,
  handleStartEditTime,
  handleSaveTime,
  setEditingTime,
  handleTogglePriority,
  handleArchiveTask,
  getStatusBadge,
  getStatusOption,
  formatDueDate,
  displayTime,
}: DraggableTaskItemProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: { id: task.id, playlistId, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ITEM_TYPE,
    hover(item: { id: string; playlistId: string; index: number }, monitor) {
      if (!ref.current) return;
      
      // Only allow reordering within the same playlist
      if (item.playlistId !== playlistId) return;

      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      moveTask(playlistId, dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  const getIcon = () => {
    if (playlist.type === 'task') return CheckSquare;
    if (playlist.type === 'content') return Pin;
    return Sprout;
  };

  const Icon = getIcon();

  return (
    <div
      ref={ref}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className="p-4 rounded-2xl bg-white/60 border border-slate-200/50 hover:bg-white/80 transition-all group cursor-move"
    >
      <div className="flex items-start gap-3">
        {/* Icon with playlist type color */}
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
          playlist.type === 'task' ? 'bg-[#c198ac]' : 
          playlist.type === 'content' ? 'bg-[#d4a5a5]' : 
          'bg-[#7ba892]'
        }`}>
          <Icon className="w-4 h-4 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-slate-800 mb-2 text-[18px]">
            {task.title}
          </h4>

          {task.description && (
            <p className="text-sm text-slate-600 mb-2">
              {task.description}
            </p>
          )}

          {/* Badges in order: Status → Contact → Task Type → Due Date → Duration → Star */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Status Badge - FIRST */}
            {editingStatus?.playlistId === playlistId && editingStatus?.taskId === task.id ? (
              <div className="relative status-dropdown-container">
                <div className={`absolute ${isBottomSection ? 'bottom-full mb-1' : 'top-full mt-1'} left-0 bg-white rounded-2xl shadow-xl border-2 border-slate-200/50 p-3 space-y-1.5 z-[60] min-w-[140px] max-h-[280px] overflow-y-auto`}>
                  {playlist.type === 'content' ? (
                    <>
                      {['idea', 'drafting', 'in-progress', 'review', 'scheduled', 'published'].map(status => {
                        const config = getStatusOption(status, playlist.type);
                        return (
                          <button
                            key={status}
                            onClick={() => handleStatusChange(playlistId, task.id, status)}
                            className={`w-full px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover:scale-105 ${config.bg} ${config.text}`}
                          >
                            {config.label}
                          </button>
                        );
                      })}
                    </>
                  ) : (
                    <>
                      {['todo', 'in-progress', 'awaiting-reply', 'done'].map(status => {
                        const config = getStatusOption(status, playlist.type);
                        return (
                          <button
                            key={status}
                            onClick={() => handleStatusChange(playlistId, task.id, status)}
                            className={`w-full px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover:scale-105 ${config.bg} ${config.text}`}
                          >
                            {config.label}
                          </button>
                        );
                      })}
                    </>
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingStatus({ playlistId, taskId: task.id });
                }}
                className="hover:opacity-80 transition-opacity"
              >
                {getStatusBadge(task.status, playlist.type)}
              </button>
            )}

            {/* Contact Badge - SECOND */}
            {task.contact && (
              <div
                className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg bg-[#2f829b]/10 text-[#2f829b]"
              >
                <User className="w-3.5 h-3.5" />
                {task.contact.name}
              </div>
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
            {editingDueDate?.playlistId === playlistId && editingDueDate?.taskId === task.id ? (
              <div className="flex items-center gap-1">
                <input
                  type="date"
                  value={tempCustomDate}
                  onChange={(e) => setTempCustomDate(e.target.value)}
                  className="px-2 py-1 text-xs bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#6b2358]/30"
                  autoFocus
                />
                <button
                  onClick={() => handleSaveDueDate(playlistId, task.id)}
                  className="p-1 bg-[#6b2358] hover:bg-[#6b2358]/90 text-white rounded-lg transition-gentle"
                  title="Save"
                >
                  <Save className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setEditingDueDate(null)}
                  className="p-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-gentle"
                  title="Cancel"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartEditDueDate(playlistId, task);
                }}
                className="flex items-center gap-1 text-xs text-slate-600 bg-slate-100/60 hover:bg-slate-100 transition-all px-2 py-1 rounded-lg"
              >
                <Calendar className="w-3.5 h-3.5" />
                {formatDueDate(task.dueDate)}
              </button>
            )}

            {/* Duration - FIFTH */}
            {editingTime?.playlistId === playlistId && editingTime?.taskId === task.id ? (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={tempTime}
                  onChange={(e) => setTempTime(e.target.value)}
                  min="5"
                  step="5"
                  className="w-16 px-2 py-1 text-xs bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#6b2358]/30"
                  autoFocus
                />
                <span className="text-xs text-slate-500">min</span>
                <button
                  onClick={() => handleSaveTime(playlistId, task.id)}
                  className="p-1 bg-[#6b2358] hover:bg-[#6b2358]/90 text-white rounded-lg transition-gentle"
                  title="Save"
                >
                  <Save className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setEditingTime(null)}
                  className="p-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-gentle"
                  title="Cancel"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartEditTime(playlistId, task);
                }}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-[#5e2350] transition-all px-2 py-1 rounded-lg hover:bg-[#5e2350]/5"
              >
                <Clock className="w-3.5 h-3.5" />
                {displayTime(task.estimatedTime)}
              </button>
            )}

            {/* Star - SIXTH (LAST) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleTogglePriority(playlistId, task.id);
              }}
              className="hover:scale-110 transition-transform"
              title={task.flagged ? 'Remove priority' : 'Add priority'}
            >
              <Star 
                className={`w-4 h-4 ${task.flagged ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`}
              />
            </button>
          </div>
        </div>

        {/* Archive button in top right corner */}
        <button
          onClick={() => handleArchiveTask(playlistId, task.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-200 rounded-lg self-start"
          title="Archive task"
        >
          <Archive className="w-4 h-4 text-slate-500" />
        </button>
      </div>
    </div>
  );
}