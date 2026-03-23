import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Calendar, Star, Archive, Sprout, User, Mail } from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';

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

interface DraggableNurtureItemProps {
  task: Task;
  playlistId: string;
  playlist: Playlist;
  index: number;
  moveTask: (playlistId: string, dragIndex: number, hoverIndex: number) => void;
  handleTogglePriority: (playlistId: string, taskId: string) => void;
  handleArchiveTask: (playlistId: string, taskId: string) => void;
  formatDueDate: (date: Date | undefined) => string;
}

export function DraggableNurtureItem({
  task,
  playlistId,
  playlist,
  index,
  moveTask,
  handleTogglePriority,
  handleArchiveTask,
  formatDueDate,
}: DraggableNurtureItemProps) {
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

  // Extract contact info from the task
  const contactName = task.contact?.name || task.title;
  const contactEmail = task.contact?.email;
  const contactRole = task.contact?.role;
  const contactCompany = task.contact?.company;
  const contactColor = task.contact?.color || '#7ba892';
  const contactInitials = task.contact?.initials || contactName.substring(0, 2).toUpperCase();

  return (
    <div
      ref={ref}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className="bg-white/70 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-6 hover:shadow-lg hover:border-slate-300/70 hover:bg-white/90 transition-all cursor-move group relative"
    >
      {/* Archive button - Top Right */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleArchiveTask(playlistId, task.id);
        }}
        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-slate-100/80 rounded-2xl z-10"
        title="Archive"
      >
        <Archive className="w-4 h-4 text-slate-400" />
      </button>

      {/* Left-justified layout with 2 columns */}
      <div className="flex gap-4">
        {/* Left Column: Avatar with Star */}
        <div className="flex-shrink-0 relative">
          <Avatar className="w-16 h-16 border-2" style={{ borderColor: contactColor }}>
            <AvatarFallback 
              className="text-white font-medium text-lg"
              style={{ backgroundColor: contactColor }}
            >
              {contactInitials}
            </AvatarFallback>
          </Avatar>
          {/* Star button hugging the avatar perimeter */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleTogglePriority(playlistId, task.id);
            }}
            className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-soft hover:bg-gray-50 transition-colors"
            title={task.flagged ? "Remove priority" : "Mark as priority"}
          >
            <Star 
              className={`w-4 h-4 transition-colors ${
                task.flagged 
                  ? 'fill-amber-400 text-amber-400' 
                  : 'text-gray-300'
              }`}
            />
          </button>
        </div>

        {/* Right Column: Contact Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 mb-1">{contactName}</h3>
          
          {contactRole && (
            <p className="text-xs text-slate-600 mb-0.5">{contactRole}</p>
          )}
          {contactCompany && (
            <p className="text-xs text-slate-500 mb-3">{contactCompany}</p>
          )}

          {contactEmail && (
            <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-3">
              <Mail className="w-3 h-3" />
              {contactEmail}
            </div>
          )}

          {/* Next Nurture Date */}
          {task.dueDate && (
            <div className="mb-3 pb-3 border-b border-slate-200/50">
              <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#7ba892]" />
                Next Nurture
              </p>
              <p className="font-medium text-slate-900">{formatDueDate(task.dueDate)}</p>
            </div>
          )}

          {/* Nurture Frequency Badge */}
          {task.description && task.description.includes('week') && (
            <div className="pt-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-[#7ba892]/10 text-[#7ba892]">
                <Sprout className="w-3 h-3 mr-1" />
                {task.description}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}