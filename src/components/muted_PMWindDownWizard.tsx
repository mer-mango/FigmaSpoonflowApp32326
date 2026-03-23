/**
 * PM Wind Down Wizard
 * Guides user through end-of-day review
 */

import React, { useState, useEffect } from 'react';
import { 
  Moon, 
  Calendar, 
  CheckSquare, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Maximize2, 
  Minimize2,
  Sparkles,
  Check
} from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useInteractions } from '../contexts/InteractionsContext';
import { TodosReview } from './today/TodosReview';
import { MeetingNotesDossier, MeetingDossierData } from './MeetingNotesDossier';
import { toast } from 'sonner';

// Type definitions
interface Playlist {
  id: string;
  name: string;
  type: 'task' | 'content' | 'nurture';
  tasks: any[];
  estimatedTime: number;
}

interface Meeting {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  contacts?: Array<{
    id: string;
    name: string;
    initials?: string;
    color?: string;
    imageUrl?: string;
  }>;
}

interface PMWizardProps {
  meetings: Meeting[];
  tasks?: any[];
  isOpen?: boolean;
  onUpdateTask?: (taskId: string, updates: any) => void;
  onComplete: () => void;
  onClose: () => void;
  onContactClick?: (contact: any) => void;
  onCreateTask?: (task: any) => void;
}

type WizardStep = 'welcome' | 'todos' | 'meetings' | 'summary';

export function PMWizard({ 
  meetings, 
  isOpen,
  onComplete, 
  onClose,
  tasks,
  onUpdateTask,
  onContactClick,
  onCreateTask
}: PMWizardProps) {
  const [step, setStep] = useState<WizardStep>('welcome');
  const [currentMeetingIndex, setCurrentMeetingIndex] = useState(0);
  const [isMaximized, setIsMaximized] = useState(false);
  
  // Interactions context
  const { getDossierByMeetingId, updateDossier } = useInteractions();
  
  // Wizard data - filter for today's meetings
  const [todayMeetings, setTodayMeetings] = useState<Meeting[]>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return meetings.filter(m => {
      const meetingDate = new Date(m.startTime);
      return meetingDate >= today && meetingDate < tomorrow;
    }).sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  });
  
  // Track playlists for TodosReview
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  // Reset wizard to welcome step when modal is opened
  useEffect(() => {
    if (isOpen) {
      setStep('welcome');
      setCurrentMeetingIndex(0);
    }
  }, [isOpen]);

  // Initialize playlists from tasks prop when component mounts or tasks change
  useEffect(() => {
    if (tasks && tasks.length > 0) {
      console.log('🌙 PMWizard: Initializing playlists from tasks:', tasks);
      
      // Separate tasks by type
      const contentItems = tasks.filter(t => t.taskType === 'content');
      const nurtureItems = tasks.filter(t => t.taskType === 'nurture');
      const taskItems = tasks.filter(t => 
        t.taskType !== 'content' && t.taskType !== 'nurture'
      );
      
      const newPlaylists: Playlist[] = [];
      
      // Create Tasks playlist
      if (taskItems.length > 0) {
        newPlaylists.push({
          id: 'tasks',
          name: 'Tasks',
          type: 'task',
          tasks: taskItems,
          estimatedTime: taskItems.reduce((sum, t) => sum + (t.estimatedTime || 30), 0)
        });
      }
      
      // Create Content playlist
      if (contentItems.length > 0) {
        newPlaylists.push({
          id: 'content',
          name: 'Content',
          type: 'content',
          tasks: contentItems,
          estimatedTime: contentItems.reduce((sum, t) => sum + (t.estimatedTime || 30), 0)
        });
      }
      
      // Create Nurture playlist
      if (nurtureItems.length > 0) {
        newPlaylists.push({
          id: 'nurture',
          name: 'Nurture',
          type: 'nurture',
          tasks: nurtureItems,
          estimatedTime: nurtureItems.reduce((sum, t) => sum + (t.estimatedTime || 30), 0)
        });
      }
      
      console.log('🌙 PMWizard: Created playlists:', newPlaylists);
      setPlaylists(newPlaylists);
    }
  }, [tasks]);

  // Update todayMeetings when meetings prop changes
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const filtered = meetings.filter(m => {
      const meetingDate = new Date(m.startTime);
      return meetingDate >= today && meetingDate < tomorrow;
    }).sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    
    setTodayMeetings(filtered);
  }, [meetings]);

  // Exit confirmation modal state
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);

  const handleClose = () => {
    if (step === 'welcome') {
      onClose();
      return;
    }
    setShowExitConfirmation(true);
  };

  const handleDiscardAndExit = () => {
    setShowExitConfirmation(false);
    onClose();
  };

  const handleMeetingNext = () => {
    if (currentMeetingIndex < todayMeetings.length - 1) {
      setCurrentMeetingIndex(prev => prev + 1);
    } else {
      setStep('summary');
      setCurrentMeetingIndex(0);
    }
  };

  const handleMeetingBack = () => {
    if (currentMeetingIndex > 0) {
      setCurrentMeetingIndex(prev => prev - 1);
    } else {
      setStep('todos');
    }
  };

  const handleComplete = () => {
    console.log('🌙 Wind Down completed');
    onComplete();
  };

  const getStepTitle = () => {
    switch (step) {
      case 'welcome': return 'Wind Down';
      case 'todos': return 'To-Do Review';
      case 'meetings': return `Meeting Review (${currentMeetingIndex + 1}/${todayMeetings.length})`;
      case 'summary': return 'Day Complete';
      default: return '';
    }
  };

  const getCurrentStepIndex = () => {
    if (todayMeetings.length > 0) {
      // With meetings: welcome, todos, meetings, summary (4 steps)
      const steps: WizardStep[] = ['welcome', 'todos', 'meetings', 'summary'];
      return steps.indexOf(step);
    } else {
      // Without meetings: welcome, todos, summary (3 steps)
      const steps: WizardStep[] = ['welcome', 'todos', 'summary'];
      return steps.indexOf(step);
    }
  };

  const getTotalSteps = () => {
    return todayMeetings.length > 0 ? 4 : 3;
  };

  const renderStepContent = () => {
    // Count completed and remaining tasks
    const completedTasks = playlists.reduce((sum, p) => 
      sum + p.tasks.filter(t => t.status === 'done').length, 0
    );
    const totalTasks = playlists.reduce((sum, p) => sum + p.tasks.length, 0);
    const remainingTasks = totalTasks - completedTasks;

    switch (step) {
      case 'welcome':
        return (
          <div className="space-y-8">
            <div className="text-center mb-12 px-0 py-5 pt-8 pb-3">
              <h2 className="font-serif font-medium text-[50px] text-slate-800 mb-3">
                Let's Close Out Today
              </h2>
              <p className="text-slate-500 text-lg py-3">
                Review what's done and what's worth carrying forward
              </p>
            </div>
            
            <div className="flex justify-center pt-4">
              <button
                onClick={() => setStep('todos')}
                className="flex items-center gap-2 px-8 py-3 bg-[#6b2358] hover:bg-[#6b2358]/90 text-white rounded-lg font-medium transition-colors"
              >
                Get Started
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        );

      case 'todos':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-4xl font-serif font-medium text-slate-800 mb-2">
                To-Do Review
              </h2>
              <p className="text-slate-600">
                {completedTasks > 0 
                  ? `You completed ${completedTasks} item${completedTasks !== 1 ? 's' : ''} today`
                  : 'Review your tasks'
                }
                {remainingTasks > 0 && ` · ${remainingTasks} remaining`}
              </p>
            </div>

            {/* Defer Remaining Tasks Button */}
            {remainingTasks > 0 && (
              <div className="bg-[#6b2358]/5 border border-[#6b2358]/20 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-800">
                    {remainingTasks} incomplete task{remainingTasks !== 1 ? 's' : ''}
                  </div>
                  <div className="text-sm text-slate-600">
                    Move all to tomorrow to start fresh
                  </div>
                </div>
                <button
                  onClick={() => {
                    // Defer all incomplete tasks to tomorrow
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    const tomorrowStr = tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD
                    
                    const updatedPlaylists = playlists.map(playlist => ({
                      ...playlist,
                      tasks: playlist.tasks.map(task => {
                        if (task.status !== 'done') {
                          // Update in backend
                          if (onUpdateTask) {
                            onUpdateTask(task.id, { dueDate: tomorrowStr });
                          }
                          return { ...task, dueDate: tomorrowStr };
                        }
                        return task;
                      })
                    }));
                    
                    setPlaylists(updatedPlaylists);
                    toast.success(`Moved ${remainingTasks} task${remainingTasks !== 1 ? 's' : ''} to tomorrow`, {
                      description: 'You\'ll see them in tomorrow\'s AM wizard',
                    });
                  }}
                  className="px-4 py-2 bg-[#6b2358] hover:bg-[#6b2358]/90 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Defer to Tomorrow
                </button>
              </div>
            )}

            <TodosReview
              playlists={playlists}
              onUpdatePlaylist={(playlistId, updatedTasks) => {
                const playlist = playlists.find(p => p.id === playlistId);
                if (playlist) {
                  // Find tasks that were updated
                  updatedTasks.forEach(updatedTask => {
                    const originalTask = playlist.tasks.find(t => t.id === updatedTask.id);
                    if (originalTask && onUpdateTask) {
                      // Check if status or other properties changed
                      // Compare dates carefully (they might be Date objects or strings)
                      const originalDate = originalTask.dueDate instanceof Date 
                        ? originalTask.dueDate.toISOString() 
                        : originalTask.dueDate;
                      const updatedDate = updatedTask.dueDate instanceof Date 
                        ? updatedTask.dueDate.toISOString() 
                        : updatedTask.dueDate;
                      
                      if (updatedTask.status !== originalTask.status || 
                          updatedDate !== originalDate ||
                          updatedTask.estimatedTime !== originalTask.estimatedTime ||
                          updatedTask.flagged !== originalTask.flagged) {
                        console.log(`🌙 Task "${updatedTask.title}" was modified in PM wizard`);
                        onUpdateTask(updatedTask.id, {
                          status: updatedTask.status,
                          dueDate: updatedTask.dueDate,
                          estimatedTime: updatedTask.estimatedTime,
                          flagged: updatedTask.flagged
                        });
                      }
                    }
                  });
                }
                
                // Update local playlist state
                setPlaylists(prev => 
                  prev.map(p => p.id === playlistId ? { ...p, tasks: updatedTasks } : p)
                );
              }}
              onAskJamie={() => {}}
            />
          </div>
        );

      case 'meetings':
        const currentMeeting = todayMeetings[currentMeetingIndex];
        const contact = currentMeeting?.contacts?.[0];
        const dossier = getDossierByMeetingId(currentMeeting?.id);
        
        // Convert dossier to unified format
        const pmDossierData: MeetingDossierData = {
          agenda: dossier?.prepNotes?.thingsToDiscuss || [],
          questions: dossier?.prepNotes?.questionsToAsk || [],
          thingsToKnow: dossier?.prepNotes?.thingsToKnow || '',
          nextStepsExpected: dossier?.prepNotes?.nextSteps || '',
          duringNotes: dossier?.duringMeetingNotes || '',
          fathomUrl: dossier?.fathomUrl || '',
          summary: dossier?.summary || '',
          transcript: dossier?.transcript || '',
          outcomes: dossier?.postMeetingNotes?.outcomes || '',
          actionItems: dossier?.actionItems || [],
          tasksCreated: dossier?.taskIds && dossier.taskIds.length > 0 || false,
        };
        
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-4xl font-serif font-medium text-slate-800 mb-2">
                Review: {currentMeeting.title || contact?.name || 'Untitled Meeting'}
              </h2>
              <div className="flex items-center gap-2">
                {contact && (
                  <button
                    onClick={() => onContactClick?.(contact)}
                    className="group/badge flex items-center gap-2 hover:bg-slate-100 rounded-lg px-2 py-1 -ml-2 transition-colors"
                  >
                    <Avatar className="w-6 h-6">
                      {contact.imageUrl ? (
                        <img src={contact.imageUrl} alt={contact.name} className="w-full h-full object-cover" />
                      ) : (
                        <AvatarFallback 
                          className="text-xs font-medium"
                          style={{ 
                            backgroundColor: contact.color || '#6b7b98',
                            color: 'white'
                          }}
                        >
                          {contact.initials || contact.name?.slice(0, 2).toUpperCase() || '?'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <span className="text-sm text-slate-700 group-hover/badge:text-[#6b2358] transition-colors">
                      {contact.name}
                    </span>
                  </button>
                )}
                <p className="text-slate-600">
                  {currentMeeting?.startTime.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit' 
                  })} - {currentMeeting?.endTime.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>

            <MeetingNotesDossier
              context="pm-wizard"
              meetingId={currentMeeting.id}
              meetingTitle={currentMeeting.title || contact?.name || 'Untitled Meeting'}
              meetingDate={currentMeeting.startTime.toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
              meetingTime={`${currentMeeting.startTime.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit' 
              })} - ${currentMeeting.endTime.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit' 
              })}`}
              contact={contact}
              hideHeader={true}
              initialData={pmDossierData}
              onDataChange={(data) => {
                // Auto-save changes to dossier during PM review
                if (dossier) {
                  updateDossier(dossier.id, {
                    prepNotes: {
                      thingsToKnow: data.thingsToKnow,
                      thingsToDiscuss: data.agenda,
                      questionsToAsk: data.questions,
                      nextSteps: data.nextStepsExpected,
                    },
                    duringMeetingNotes: data.duringNotes,
                    fathomUrl: data.fathomUrl,
                    summary: data.summary,
                    transcript: data.transcript,
                    postMeetingNotes: {
                      ...dossier.postMeetingNotes,
                      outcomes: data.outcomes,
                    },
                    actionItems: data.actionItems,
                    windDownCompleted: true,
                    windDownCompletedAt: new Date().toISOString(),
                  });
                }
              }}
              onCreateTasks={(tasks) => {
                // Create tasks from action items in PM wizard
                tasks.forEach(task => {
                  if (onCreateTask) {
                    onCreateTask({
                      title: task.text,
                      description: `From meeting: ${currentMeeting.title || contact?.name || 'Untitled Meeting'}`,
                      dueDate: task.dueDate,
                      contact: contact ? {
                        id: contact.id,
                        name: contact.name,
                      } : undefined,
                      estimatedTime: task.duration,
                      status: 'toDo',
                    });
                  }
                });
                
                // Mark tasks as created in dossier
                if (dossier) {
                  updateDossier(dossier.id, {
                    taskIds: tasks.map(t => `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`),
                  });
                }
                
                toast.success(`Created ${tasks.length} task${tasks.length === 1 ? '' : 's'}`);
              }}
            />
          </div>
        );

      case 'summary':
        return (
          <div className="space-y-8">
            <div className="text-center mb-12 px-0 py-5 pt-8 pb-3">
              
              <h2 className="font-serif font-medium text-[50px] text-slate-800 mb-3">
                You're Done!
              </h2>
              <p className="text-slate-500 text-lg py-3">
                Time to rest. Tomorrow's a fresh start.
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-3">
                <CheckSquare className="w-5 h-5 text-slate-600" />
                <div>
                  <div className="font-medium text-slate-800">Tasks Today</div>
                  <div className="text-sm text-slate-600">
                    {completedTasks > 0 
                      ? `${completedTasks} completed${remainingTasks > 0 ? `, ${remainingTasks} to carry forward` : ''}`
                      : 'No tasks completed today'}
                  </div>
                </div>
              </div>

              {todayMeetings.length > 0 && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-slate-600" />
                  <div>
                    <div className="font-medium text-slate-800">Meetings Today</div>
                    <div className="text-sm text-slate-600">
                      {todayMeetings.length} meeting{todayMeetings.length !== 1 ? 's' : ''} reviewed
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-center pt-4">
              <button
                onClick={handleComplete}
                className="flex items-center gap-2 px-8 py-3 bg-[#6b2358] hover:bg-[#6b2358]/90 text-white rounded-lg font-medium transition-colors"
              >
                Close
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Main Wizard Modal */}
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1100]">
        <div 
          className={`bg-white shadow-2xl flex flex-col transition-all overflow-hidden ${ 
            isMaximized ? 'w-full h-full rounded-none' : 'w-[900px] max-h-[85vh] rounded-[32px]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-slate-200 bg-[#6b2358]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[rgba(255,255,255,0.3)] rounded-xl flex items-center justify-center">
                <Moon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-serif font-medium text-white">
                  {getStepTitle()}
                </h1>
                <p className="text-sm text-white/70">
                  Step {getCurrentStepIndex() + 1} of {getTotalSteps()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMaximized(!isMaximized)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
              >
                {isMaximized ? (
                  <Minimize2 className="w-5 h-5" />
                ) : (
                  <Maximize2 className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-8 py-8">
            {renderStepContent()}
          </div>

          {/* Footer Navigation */}
          {step !== 'welcome' && step !== 'summary' && (
            <div className="flex items-center justify-between px-8 py-6 border-t border-slate-200">
              <button
                onClick={() => {
                  if (step === 'meetings' && currentMeetingIndex > 0) {
                    handleMeetingBack();
                  } else if (step === 'meetings') {
                    setStep('todos');
                  } else if (step === 'todos') {
                    setStep('welcome');
                  }
                }}
                className="flex items-center gap-2 px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>

              <button
                onClick={() => {
                  if (step === 'todos') {
                    if (todayMeetings.length > 0) {
                      setStep('meetings');
                    } else {
                      setStep('summary');
                    }
                  } else if (step === 'meetings') {
                    handleMeetingNext();
                  }
                }}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#6b2358] hover:bg-[#6b2358]/90 text-white rounded-lg transition-colors"
              >
                {step === 'meetings' && currentMeetingIndex === todayMeetings.length - 1
                  ? 'Finish Review'
                  : 'Continue'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      {showExitConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1110]">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-serif font-medium text-slate-800 mb-3">
              Exit Wind Down?
            </h3>
            <p className="text-slate-600 mb-6">
              Your progress won't be saved if you exit now.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleDiscardAndExit}
                className="flex-1 px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Don't Save
              </button>
              <button
                onClick={() => setShowExitConfirmation(false)}
                className="flex-1 px-4 py-2.5 bg-[#6b2358] hover:bg-[#6b2358]/90 text-white rounded-lg transition-colors"
              >
                Keep Going
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}