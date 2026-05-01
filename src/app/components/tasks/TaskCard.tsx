import React from 'react';
import { SelectionCheckbox } from './SelectionCheckbox';
import { FlagToggle } from './FlagToggle';
import { ArchiveButton } from './ArchiveButton';
import { JamieButton } from './JamieButton';
import { StatusDropdown, TaskStatus } from './StatusDropdown';
import { ContactBadge } from './ContactBadge';
import { DueDatePicker } from './DueDatePicker';
import { TimePicker } from './TimePicker';
import { GetMeStartedModal } from '../muted_GetMeStartedModal';
import { TaskTypeBadge } from './TaskTypeBadge';
import { TaskType } from '../../utils/taskTypes';

interface TaskCardProps {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  flagged: boolean;
  selected?: boolean;
  dueDate?: Date;
  estimatedTime?: number; // in minutes
  taskType?: TaskType;
  contact?: {
    name: string;
    avatar?: string;
    color?: string;
  };
  onToggleSelection?: (id: string) => void;
  onToggleFlag: (id: string) => void;
  onArchive: (id: string) => void;
  onChangeStatus: (id: string, status: TaskStatus) => void;
  onChangeDueDate: (id: string, date: Date | undefined) => void;
  onChangeEstimatedTime: (id: string, minutes: number | undefined) => void;
  onAskJamie?: (id: string, title: string) => void;
  onContactClick?: (contactName: string) => void;
  onClick?: (id: string) => void;
  selectionMode?: boolean;
}

export function TaskCard({
  id,
  title,
  description,
  status,
  flagged,
  selected = false,
  dueDate,
  estimatedTime,
  taskType,
  contact,
  onToggleSelection,
  onToggleFlag,
  onArchive,
  onChangeStatus,
  onChangeDueDate,
  onChangeEstimatedTime,
  onAskJamie,
  onContactClick,
  onClick,
  selectionMode = false,
}: TaskCardProps) {
  const [showHelpModal, setShowHelpModal] = React.useState(false);

  // When status changes to 'done', trigger archive
  const handleStatusChange = (newStatus: TaskStatus) => {
    onChangeStatus(id, newStatus);
    if (newStatus === 'done') {
      // Small delay to show the status change animation before archiving
      setTimeout(() => onArchive(id), 300);
    }
  };

  const handleAskJamie = () => {
    setShowHelpModal(true);
    onAskJamie?.(id, title);
  };

  return (
    <>
      <div
        className={`
          group
          bg-white/70 backdrop-blur-xl rounded-3xl pl-8 pr-5 py-6
          border border-slate-200/50 shadow-subtle
          transition-gentle hover:shadow-subtle hover:bg-white/80
          ${onClick ? 'cursor-pointer' : ''}
          ${selected ? 'ring-2 ring-[#6b7b98]/30' : ''}
        `}
        onClick={() => onClick?.(id)}
      >
        <div className="flex items-start gap-5">
          {/* Selection Checkbox (only shown in selection mode) */}
          {selectionMode && onToggleSelection && (
            <div className="pt-1" onClick={(e) => e.stopPropagation()}>
              <SelectionCheckbox
                checked={selected}
                onChange={() => onToggleSelection(id)}
              />
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Due Date at Top */}
            {dueDate && (
              <div className="mb-2" onClick={(e) => e.stopPropagation()}>
                <DueDatePicker
                  value={dueDate}
                  onChange={(date) => onChangeDueDate(id, date)}
                />
              </div>
            )}
            
            <h3 className="text-slate-800 mb-2 font-medium text-[17px]">
              {title}
            </h3>
            
            {description && (
              <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                {description}
              </p>
            )}

            {/* Meta Info */}
            <div className="flex items-center flex-wrap gap-2 mt-3">
              {/* Task Type Badge */}
              {taskType && (
                <TaskTypeBadge type={taskType} size="sm" />
              )}

              {/* Status Dropdown */}
              <div onClick={(e) => e.stopPropagation()}>
                <StatusDropdown
                  value={status}
                  onChange={handleStatusChange}
                />
              </div>

              {/* Time Picker */}
              <div onClick={(e) => e.stopPropagation()}>
                <TimePicker
                  value={estimatedTime}
                  onChange={(minutes) => onChangeEstimatedTime(id, minutes)}
                />
              </div>

              {/* Contact Badge */}
              {contact && (
                <ContactBadge
                  name={contact.name}
                  avatar={contact.avatar}
                  color={contact.color}
                  onClick={() => onContactClick?.(contact.name)}
                />
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <JamieButton
              onAskJamie={handleAskJamie}
            />
            <ArchiveButton
              onArchive={() => onArchive(id)}
            />
            <FlagToggle
              flagged={flagged}
              onChange={() => onToggleFlag(id)}
            />
          </div>
        </div>
      </div>

      {/* Get Me Started Modal */}
      <GetMeStartedModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        taskTitle={title}
        taskType="task"
        taskDescription={description}
      />
    </>
  );
}