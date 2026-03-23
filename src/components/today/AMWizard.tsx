import React, { useState, useEffect, useRef } from 'react';
import { 
  Sun, 
  Calendar, 
  CheckSquare, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Maximize2, 
  Minimize2,
  Sparkles,
  Pencil
} from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { useInteractions } from '../../contexts/InteractionsContext';
import { TodosReview } from './TodosReview';
import { MeetingNotesDossier, MeetingDossierData } from '../MeetingNotesDossier';
import { getPlaylistTasks } from '../../utils/playlistAdapter';
import { ContactMentionInput } from '../ContactMentionInput';
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

interface DayPlan {
  playlists: Playlist[];
  startTime: string; // When the user wants to start their day (HH:mm format)
  meetingPrepNotes: Record<string, {
    thingsToKnow: string;
    thingsToDiscuss: Array<{ text: string; completed: boolean }>;
    questionsToAsk: Array<{ text: string; completed: boolean }>;
    nextSteps: string;
  }>;
  scheduledBlocks: Array<{
    id: string;
    type: 'meeting' | 'buffer';
    bufferType?: 'pre' | 'post';
    name: string;
    startTime: string;
    duration: number;
    isLocked: boolean;
    contacts?: Array<{
      name: string;
      color: string;
      id?: string;
    }>;
    meeting?: {
      id: string;
      link?: string;
    };
  }>;
}

interface AMWizardProps {
  meetings: Meeting[];
  contacts?: any[];
  tasks?: any[];
  onUpdateMeeting?: (meetingId: string, updates: Partial<Meeting>) => void;
  onUpdateTask?: (taskId: string, updates: any) => void; // NEW: callback to update task in backend
  onComplete: (dayPlan: DayPlan) => void;
  onClose: () => void;
  onSaveProgress?: (partialPlan: Partial<DayPlan>) => void;
  existingPlan?: Partial<DayPlan>;
  onContactClick?: (contact: any) => void; // NEW: callback to open contact profile
}

type WizardStep = 'welcome' | 'todos' | 'meetings' | 'summary';

export function AMWizard({ 
  meetings, 
  contacts,
  onComplete, 
  onClose,
  onSaveProgress,
  existingPlan,
  tasks,
  onUpdateMeeting,
  onUpdateTask,
  onContactClick
}: AMWizardProps) {
  const [step, setStep] = useState<WizardStep>('welcome');
  const [currentMeetingIndex, setCurrentMeetingIndex] = useState(0);
  const [isMaximized, setIsMaximized] = useState(false);
  const [editingMeetingTitle, setEditingMeetingTitle] = useState(false);
  const [meetingTitleInput, setMeetingTitleInput] = useState('');
  
  // @ mention autocomplete state
  const [showContactDropdown, setShowContactDropdown] = useState(false);
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const [mentionStartPos, setMentionStartPos] = useState<number | null>(null);
  
  // Interactions context for creating meeting dossiers
  const { createDossier, getDossierByMeetingId, updateDossier, createTask } = useInteractions();
  
  // Track prep notes for each meeting (by meeting ID)
  const [meetingPrepNotes, setMeetingPrepNotes] = useState<Record<string, {
    thingsToKnow: string;
    thingsToDiscuss: Array<{ text: string; completed: boolean }>;
    questionsToAsk: Array<{ text: string; completed: boolean }>;
    nextSteps: string;
  }>>({});
  
  // Wizard data
  const [updatedMeetings, setUpdatedMeetings] = useState<Meeting[]>(() => {
    return [...meetings].sort((a, b) => {
      if (!a.startTime || !b.startTime) return 0;
      return a.startTime.getTime() - b.startTime.getTime();
    });
  });
  
  // Track playlists for TodosReview
  const [playlists, setPlaylists] = useState<Playlist[]>(
    existingPlan?.playlists || []
  );
  
  // Track task IDs to detect when tasks are removed (e.g., archived)
  const previousTaskIds = useRef<Set<string>>(new Set());

  // Track selected start time for the day
  const [selectedStartTime, setSelectedStartTime] = useState<string>(() => {
    // Generate 4 time options on 15-minute marks starting from next 15-min increment
    const now = new Date();
    const minutes = now.getMinutes();
    const nextQuarter = Math.ceil(minutes / 15) * 15;
    
    if (nextQuarter === 60) {
      now.setHours(now.getHours() + 1);
      now.setMinutes(0);
    } else {
      now.setMinutes(nextQuarter);
    }
    
    return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  });

  // Initialize playlists from tasks prop when component mounts or tasks change
  useEffect(() => {
    // Only initialize if we don't have existing playlists from a saved draft
    if (!existingPlan?.playlists && tasks && tasks.length > 0) {
      console.log('🎯 AMWizard: Initializing playlists from tasks:', tasks);
      console.log('🎯 AMWizard: Task details:', tasks.map(t => ({
        title: t.title,
        taskType: t.taskType,
        status: t.status,
        dueDate: t.dueDate
      })));
      
      // Separate tasks by type
      // Tasks playlist gets everything that's NOT content or nurture
      const contentItems = tasks.filter(t => t.taskType === 'content');
      const nurtureItems = tasks.filter(t => t.taskType === 'nurture');
      const taskItems = tasks.filter(t => 
        t.taskType !== 'content' && t.taskType !== 'nurture'
      );
      
      console.log('🎯 AMWizard: Task breakdown:', {
        tasks: taskItems.length,
        content: contentItems.length,
        nurture: nurtureItems.length
      });
      console.log('🎯 AMWizard: taskItems:', taskItems.map(t => t.title));
      console.log('🎯 AMWizard: contentItems:', contentItems.map(t => t.title));
      console.log('🎯 AMWizard: nurtureItems:', nurtureItems.map(t => t.title));
      
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
      
      console.log('🎯 AMWizard: Created playlists:', newPlaylists);
      setPlaylists(newPlaylists);
    }
  }, [tasks, existingPlan]);
  
  // Sync playlists when tasks prop changes (e.g., when a task is archived)
  // This ensures the wizard reflects changes made outside of playlist manipulation
  useEffect(() => {
    if (!tasks) return;
    
    // Get IDs of all tasks in the tasks prop
    const currentTaskIds = new Set(tasks.map(t => t.id));
    
    // Check if task IDs have changed
    const idsChanged = 
      currentTaskIds.size !== previousTaskIds.current.size ||
      Array.from(currentTaskIds).some(id => !previousTaskIds.current.has(id)) ||
      Array.from(previousTaskIds.current).some(id => !currentTaskIds.has(id));
    
    if (idsChanged && previousTaskIds.current.size > 0) {
      console.log('🔄 AMWizard: Task IDs changed, syncing playlists');
      
      // Update playlists to remove tasks that are no longer in the tasks prop
      setPlaylists(prevPlaylists => {
        if (prevPlaylists.length === 0) return prevPlaylists;
        
        const updatedPlaylists = prevPlaylists.map(playlist => ({
          ...playlist,
          tasks: playlist.tasks.filter(task => currentTaskIds.has(task.id)),
          estimatedTime: playlist.tasks
            .filter(task => currentTaskIds.has(task.id))
            .reduce((sum, t) => sum + (t.estimatedTime || 30), 0)
        })).filter(playlist => playlist.tasks.length > 0); // Remove empty playlists
        
        return updatedPlaylists;
      });
    }
    
    // Update the ref with current task IDs
    previousTaskIds.current = currentTaskIds;
  }, [tasks]);

  // Sync updatedMeetings when meetings prop changes
  useEffect(() => {
    const sortedMeetings = [...meetings].sort((a, b) => {
      if (!a.startTime || !b.startTime) return 0;
      return a.startTime.getTime() - b.startTime.getTime();
    });
    setUpdatedMeetings(sortedMeetings);
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

  const handleSaveAndExit = () => {
    const partialPlan: Partial<DayPlan> = {
      playlists,
      meetingPrepNotes,
    };
    
    if (onSaveProgress) {
      onSaveProgress(partialPlan);
    }
    
    setShowExitConfirmation(false);
    onClose();
  };

  const handleDiscardAndExit = () => {
    setShowExitConfirmation(false);
    onClose();
  };

  const handleMeetingNext = () => {
    if (currentMeetingIndex < updatedMeetings.length - 1) {
      setCurrentMeetingIndex(prev => prev + 1);
    } else {
      // Save all meeting prep notes as dossiers before moving to summary
      saveMeetingDossiers();
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
  
  // Function to save meeting prep notes to dossiers
  const saveMeetingDossiers = () => {
    updatedMeetings.forEach(meeting => {
      const contact = meeting.contacts?.[0];
      const existingDossier = getDossierByMeetingId(meeting.id);
      const prepNotes = meetingPrepNotes[meeting.id];
      
      // Always create or update dossier for every meeting
      if (existingDossier) {
        // Update existing dossier
        updateDossier(existingDossier.id, {
          prepNotes: prepNotes || undefined,
          prepCompleted: true,
          prepCompletedAt: new Date().toISOString(),
        });
        console.log(`✅ Updated dossier for meeting: ${contact?.name || meeting.title}`);
      } else {
        // Create new dossier
        createDossier({
          type: 'meeting',
          meetingId: meeting.id,
          meetingTitle: contact?.name || meeting.title,
          meetingDate: meeting.startTime.toLocaleDateString(),
          meetingTime: meeting.startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          meetingEndTime: meeting.endTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          contactId: contact?.id || 'unknown',
          contactName: contact?.name || 'Unknown',
          prepCompleted: true,
          prepCompletedAt: new Date().toISOString(),
          prepNotes: prepNotes || undefined,
          taskIds: [],
          postMeetingCompleted: false,
          windDownCompleted: false,
        });
        console.log(`✅ Created dossier for meeting: ${contact?.name || meeting.title}`);
      }
    });
  };

  const handleComplete = () => {
    // Generate scheduled blocks from meetings with pre/post buffers
    const scheduledBlocks: DayPlan['scheduledBlocks'] = [];
    
    updatedMeetings.forEach((meeting) => {
      const contact = meeting.contacts?.[0];
      const meetingDuration = Math.round((meeting.endTime.getTime() - meeting.startTime.getTime()) / (1000 * 60));
      
      // Calculate pre-meeting buffer start time (15 minutes before meeting)
      const preBufferStart = new Date(meeting.startTime.getTime() - 15 * 60 * 1000);
      
      // Add pre-meeting buffer
      scheduledBlocks.push({
        id: `pre-${meeting.id}`,
        type: 'buffer',
        bufferType: 'pre',
        name: 'Mtg Prep',
        startTime: preBufferStart.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit' 
        }),
        duration: 15,
        isLocked: true,
        contacts: contact ? [{
          name: contact.name,
          color: contact.color || '#6b7b98',
          id: contact.id
        }] : [],
        meeting: {
          id: meeting.id
        }
      });
      
      // Add the meeting itself
      scheduledBlocks.push({
        id: meeting.id,
        type: 'meeting',
        name: contact?.name || meeting.title,
        startTime: meeting.startTime.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit' 
        }),
        duration: meetingDuration,
        isLocked: true,
        contacts: contact ? [{
          name: contact.name,
          color: contact.color || '#6b7b98',
          id: contact.id
        }] : [],
        meeting: {
          id: meeting.id,
          link: undefined // You can add meeting link here if available
        }
      });
      
      // Calculate post-meeting buffer start time (right after meeting)
      const postBufferStart = meeting.endTime;
      
      // Add post-meeting buffer
      scheduledBlocks.push({
        id: `post-${meeting.id}`,
        type: 'buffer',
        bufferType: 'post',
        name: 'Post-Mtg Notes',
        startTime: postBufferStart.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit' 
        }),
        duration: 15,
        isLocked: true,
        contacts: contact ? [{
          name: contact.name,
          color: contact.color || '#6b7b98',
          id: contact.id
        }] : [],
        meeting: {
          id: meeting.id
        }
      });
    });
    
    // Sort blocks by time
    scheduledBlocks.sort((a, b) => {
      const timeA = new Date(`2000-01-01 ${a.startTime}`);
      const timeB = new Date(`2000-01-01 ${b.startTime}`);
      return timeA.getTime() - timeB.getTime();
    });
    
    const dayPlan: DayPlan = {
      playlists,
      startTime: selectedStartTime, // User's selected start time
      meetingPrepNotes,
      scheduledBlocks
    };
    
    console.log('📅 Completing day plan with scheduled blocks:', dayPlan);
    onComplete(dayPlan);
  };

  const handleMeetingTitleChange = (meetingId: string, newTitle: string) => {
    // Update local meetings state
    setUpdatedMeetings(prev => prev.map(m => 
      m.id === meetingId ? { ...m, title: newTitle } : m
    ));
    
    // Notify parent component if callback provided
    if (onUpdateMeeting) {
      onUpdateMeeting(meetingId, { title: newTitle });
    }
  };

  const handleStartEditTitle = (meeting: Meeting) => {
    const contact = meeting.contacts?.[0];
    setMeetingTitleInput(meeting.title || contact?.name || 'Untitled Meeting');
    setEditingMeetingTitle(true);
  };

  const handleContactSelected = (meetingId: string, selectedContact: any) => {
    // Update the meeting with the selected contact
    setUpdatedMeetings(prev => prev.map(m => 
      m.id === meetingId ? {
        ...m,
        title: selectedContact.name,
        contacts: [{
          id: selectedContact.id,
          name: selectedContact.name,
          initials: selectedContact.initials,
          color: selectedContact.color,
          imageUrl: selectedContact.imageUrl
        }]
      } : m
    ));
    
    // Also notify parent component
    if (onUpdateMeeting) {
      onUpdateMeeting(meetingId, {
        title: selectedContact.name,
        contacts: [{
          id: selectedContact.id,
          name: selectedContact.name,
          initials: selectedContact.initials,
          color: selectedContact.color,
          imageUrl: selectedContact.imageUrl
        }]
      });
    }
    
    setEditingMeetingTitle(false);
  };

  const handleSaveMeetingTitle = (meetingId: string) => {
    if (meetingTitleInput.trim()) {
      handleMeetingTitleChange(meetingId, meetingTitleInput.trim());
    }
    setEditingMeetingTitle(false);
  };

  const getStepTitle = () => {
    switch (step) {
      case 'welcome': return 'Plan Your Day';
      case 'todos': return 'To-Do Review';
      case 'meetings': return `Meeting Prep (${currentMeetingIndex + 1}/${updatedMeetings.length})`;
      case 'summary': return 'Ready to Start!';
      default: return '';
    }
  };

  const getCurrentStepIndex = () => {
    if (updatedMeetings.length > 0) {
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
    return updatedMeetings.length > 0 ? 4 : 3; // Include meetings step only if there are meetings
  };

  const renderStepContent = () => {
    // Count actual tasks currently in playlists (reflects any removals/rescheduling)
    const totalTasks = playlists.reduce((sum, p) => sum + p.tasks.length, 0);

    switch (step) {
      case 'welcome':
        return (
          <div className="space-y-8">
            <div className="text-center mb-12 px-0 py-5 pt-8 pb-3">
              <h2 className="font-serif font-medium text-[50px] text-slate-800 mb-3">
                Let's Plan Your Day
              </h2>
              <p className="text-slate-500 text-lg py-3">
                Review your tasks and prep for meetings
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
                {totalTasks > 0 
                  ? (() => {
                      const taskCount = playlists.find(p => p.type === 'task')?.tasks.length || 0;
                      const contentCount = playlists.find(p => p.type === 'content')?.tasks.length || 0;
                      const nurtureCount = playlists.find(p => p.type === 'nurture')?.tasks.length || 0;
                      
                      const parts = [];
                      if (taskCount > 0) parts.push(`${taskCount} task${taskCount !== 1 ? 's' : ''}`);
                      if (contentCount > 0) parts.push(`${contentCount} content item${contentCount !== 1 ? 's' : ''}`);
                      if (nurtureCount > 0) parts.push(`${nurtureCount} nurture${nurtureCount !== 1 ? 's' : ''}`);
                      
                      return `You have ${parts.join(', ')} due today`;
                    })()
                  : 'No items due today'}
              </p>
            </div>

            <TodosReview
              playlists={playlists}
              onUpdatePlaylist={(playlistId, updatedTasks) => {
                const playlist = playlists.find(p => p.id === playlistId);
                if (playlist) {
                  // Find tasks that were removed (rescheduled to another day)
                  const removedTasks = playlist.tasks.filter(
                    oldTask => !updatedTasks.find(newTask => newTask.id === oldTask.id)
                  );
                  
                  // Update tasks in backend if they were rescheduled
                  removedTasks.forEach(task => {
                    if (onUpdateTask && task.dueDate) {
                      console.log(`📅 Task "${task.title}" was rescheduled, updating in backend`);
                      onUpdateTask(task.id, { dueDate: task.dueDate });
                    }
                  });
                  
                  // Also update any tasks that had their properties changed
                  updatedTasks.forEach(updatedTask => {
                    const originalTask = playlist.tasks.find(t => t.id === updatedTask.id);
                    if (originalTask && onUpdateTask) {
                      // Check if due date or estimated time changed
                      if (updatedTask.dueDate !== originalTask.dueDate || 
                          updatedTask.estimatedTime !== originalTask.estimatedTime ||
                          updatedTask.status !== originalTask.status ||
                          updatedTask.flagged !== originalTask.flagged) {
                        console.log(`📅 Task "${updatedTask.title}" was modified, updating in backend`);
                        onUpdateTask(updatedTask.id, {
                          dueDate: updatedTask.dueDate,
                          estimatedTime: updatedTask.estimatedTime,
                          status: updatedTask.status,
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
              onUpdateTask={onUpdateTask}
            />
          </div>
        );

      case 'meetings':
        const currentMeeting = updatedMeetings[currentMeetingIndex];
        const contact = currentMeeting?.contacts?.[0];
        
        // Load existing dossier data for this meeting
        const existingDossier = getDossierByMeetingId(currentMeeting.id);
        
        // Convert old format to new format
        const dossierData: MeetingDossierData = {
          agenda: existingDossier?.prepNotes?.thingsToDiscuss || meetingPrepNotes[currentMeeting.id]?.thingsToDiscuss || [],
          questions: existingDossier?.prepNotes?.questionsToAsk || meetingPrepNotes[currentMeeting.id]?.questionsToAsk || [],
          thingsToKnow: existingDossier?.prepNotes?.thingsToKnow || meetingPrepNotes[currentMeeting.id]?.thingsToKnow || '',
          nextStepsExpected: existingDossier?.prepNotes?.nextSteps || meetingPrepNotes[currentMeeting.id]?.nextSteps || '',
          duringNotes: existingDossier?.duringMeetingNotes || '',
          fathomUrl: existingDossier?.fathomUrl || '',
          summary: existingDossier?.summary || '',
          transcript: existingDossier?.transcript || '',
          outcomes: existingDossier?.postMeetingNotes?.outcomes || '',
          actionItems: existingDossier?.actionItems || [],
          tasksCreated: existingDossier?.taskIds && existingDossier.taskIds.length > 0 || false,
        };
        
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-4xl font-serif font-medium text-slate-800 mb-2 group">
                Prep for{' '}
                {editingMeetingTitle ? (
                  <ContactMentionInput
                    value={meetingTitleInput}
                    onChange={setMeetingTitleInput}
                    onContactSelect={(selectedContact) => handleContactSelected(currentMeeting.id, selectedContact)}
                    contacts={contacts || []}
                    onBlur={() => handleSaveMeetingTitle(currentMeeting.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveMeetingTitle(currentMeeting.id);
                      if (e.key === 'Escape') {
                        setEditingMeetingTitle(false);
                        setMeetingTitleInput(contact?.name || currentMeeting.title);
                      }
                    }}
                    placeholder="Type @ to link a contact"
                    className="inline-block px-3 py-1 border-b-2 border-[#6b2358] bg-transparent focus:outline-none"
                    autoFocus
                  />
                ) : (
                  <button
                    onClick={() => handleStartEditTitle(currentMeeting)}
                    className="inline-flex items-center gap-2 hover:text-[#6b2358] transition-colors"
                  >
                    <span>{currentMeeting.title || contact?.name || 'Untitled Meeting'}</span>
                    <Pencil className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                )}
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
              key={currentMeeting.id}
              context="am-wizard"
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
              initialData={dossierData}
              onDataChange={(data) => {
                // Convert new format back to old format for wizard state
                setMeetingPrepNotes(prev => ({
                  ...prev,
                  [currentMeeting.id]: {
                    thingsToKnow: data.thingsToKnow,
                    thingsToDiscuss: data.agenda,
                    questionsToAsk: data.questions,
                    nextSteps: data.nextStepsExpected,
                  }
                }));
                
                // ✅ IMMEDIATE SAVE: Create or update dossier as user types
                const contact = currentMeeting.contacts?.[0];
                if (existingDossier) {
                  // Update existing dossier immediately
                  updateDossier(existingDossier.id, {
                    prepNotes: {
                      thingsToKnow: data.thingsToKnow,
                      thingsToDiscuss: data.agenda,
                      questionsToAsk: data.questions,
                      nextSteps: data.nextStepsExpected,
                    },
                    duringMeetingNotes: data.duringNotes,
                    actionItems: data.actionItems,
                  });
                } else {
                  // Create new dossier immediately when first note is added
                  createDossier({
                    type: 'meeting',
                    meetingId: currentMeeting.id,
                    meetingTitle: contact?.name || currentMeeting.title,
                    meetingDate: currentMeeting.startTime.toLocaleDateString(),
                    meetingTime: currentMeeting.startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
                    meetingEndTime: currentMeeting.endTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
                    contactId: contact?.id || 'unknown',
                    contactName: contact?.name || 'Unknown',
                    prepCompleted: false, // Not completed yet, still in wizard
                    prepNotes: {
                      thingsToKnow: data.thingsToKnow,
                      thingsToDiscuss: data.agenda,
                      questionsToAsk: data.questions,
                      nextSteps: data.nextStepsExpected,
                    },
                    duringMeetingNotes: data.duringNotes,
                    taskIds: [],
                    postMeetingCompleted: false,
                    windDownCompleted: false,
                  });
                  console.log(`✅ Created dossier immediately for meeting: ${contact?.name || currentMeeting.title}`);
                }
              }}
              onCreateTasks={(tasks) => {
                // Create tasks from action items in the AM Wizard
                tasks.forEach(task => {
                  // Create in InteractionsContext
                  createTask({
                    title: task.text,
                    description: `From meeting: ${currentMeeting.title || contact?.name}`,
                    dueDate: task.dueDate,
                    duration: `${task.duration} mins`,
                    status: 'todo',
                    meetingDossierId: existingDossier?.id,
                    contactId: contact?.id || 'unknown',
                    contactName: contact?.name || 'Unknown',
                    meetingId: currentMeeting.id,
                  });
                });
                
                toast.success(`Created ${tasks.length} task${tasks.length !== 1 ? 's' : ''}!`, {
                  description: 'View them in the Tasks page',
                });
              }}
            />
          </div>
        );

      case 'summary':
        // Generate 4 time options on 15-minute increments
        const timeOptions = (() => {
          const options: string[] = [];
          const now = new Date();
          const minutes = now.getMinutes();
          const nextQuarter = Math.ceil(minutes / 15) * 15;
          
          const baseTime = new Date(now);
          if (nextQuarter === 60) {
            baseTime.setHours(baseTime.getHours() + 1);
            baseTime.setMinutes(0);
          } else {
            baseTime.setMinutes(nextQuarter);
          }
          
          for (let i = 0; i < 4; i++) {
            const optionTime = new Date(baseTime.getTime() + (i * 15 * 60 * 1000));
            options.push(optionTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }));
          }
          
          return options;
        })();
        
        return (
          <div className="space-y-8">
            <div className="text-center mb-12 px-[0px] pt-[32px] pb-[0px]">
              
              <h2 className="font-serif font-medium text-[50px] text-slate-800 mb-3">
                You're All Set!
              </h2>
              
            </div>

            <div className="bg-slate-50 rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-3">
                <CheckSquare className="w-5 h-5 text-slate-600" />
                <div>
                  <div className="font-medium text-slate-800">Items Reviewed</div>
                  <div className="text-sm text-slate-600">
                    {(() => {
                      const taskCount = playlists.find(p => p.type === 'task')?.tasks.length || 0;
                      const contentCount = playlists.find(p => p.type === 'content')?.tasks.length || 0;
                      const nurtureCount = playlists.find(p => p.type === 'nurture')?.tasks.length || 0;
                      
                      const parts = [];
                      if (taskCount > 0) parts.push(`${taskCount} task${taskCount !== 1 ? 's' : ''}`);
                      if (contentCount > 0) parts.push(`${contentCount} content`);
                      if (nurtureCount > 0) parts.push(`${nurtureCount} nurture${nurtureCount !== 1 ? 's' : ''}`);
                      
                      return parts.length > 0 ? parts.join(', ') : 'No items';
                    })()}
                  </div>
                </div>
              </div>

              {updatedMeetings.length > 0 && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-slate-600" />
                  <div>
                    <div className="font-medium text-slate-800">Meetings Prepped</div>
                    <div className="text-sm text-slate-600">
                      {updatedMeetings.length} meeting{updatedMeetings.length !== 1 ? 's' : ''} ready
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Start Time Selection */}
            <div className="bg-white rounded-lg p-6 border border-slate-200">
              <h3 className="text-lg font-medium text-slate-800 mb-4">When do you want to start your day?</h3>
              <div className="grid grid-cols-4 gap-3">
                {timeOptions.map((timeOption) => (
                  <button
                    key={timeOption}
                    onClick={() => setSelectedStartTime(timeOption)}
                    className={`px-4 py-3 rounded-lg border-2 transition-all font-medium ${ 
                      selectedStartTime === timeOption
                        ? 'border-[#6b2358] bg-[#6b2358]/10 text-[#6b2358]'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    {timeOption}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <button
                onClick={handleComplete}
                className="flex items-center gap-2 px-8 py-3 bg-[#6b2358] hover:bg-[#6b2358]/90 text-white rounded-lg font-medium transition-colors"
              >
                Start My Day
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

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
                <Sun className="w-6 h-6 text-white" />
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
                    if (updatedMeetings.length > 0) {
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
                {step === 'meetings' && currentMeetingIndex === updatedMeetings.length - 1
                  ? 'Finish Prep'
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
              Save Your Progress?
            </h3>
            <p className="text-slate-600 mb-6">
              You're partway through planning your day. Would you like to save your progress?
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleDiscardAndExit}
                className="flex-1 px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Don't Save
              </button>
              <button
                onClick={handleSaveAndExit}
                className="flex-1 px-4 py-2.5 bg-[#6b2358] hover:bg-[#6b2358]/90 text-white rounded-lg transition-colors"
              >
                Save & Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}