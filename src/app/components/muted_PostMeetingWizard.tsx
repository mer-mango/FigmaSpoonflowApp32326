import { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Calendar, Clock, MessageSquare, Maximize2, Minimize2, Save, UserPlus, Repeat, Mail, CheckCircle2, Copy, ExternalLink, ChevronRight, ChevronLeft, Target, Heart, ThumbsUp, FileText, Edit } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { MeetingNotesDossier, MeetingDossierData } from './MeetingNotesDossier';
import { useInteractions } from '../contexts/InteractionsContext';
import { MeetingDossier } from '../types/interactions';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import React from 'react';
import { getTodayLocal, getTomorrowLocal, dateToLocalString } from '../utils/dateUtils';
import { sortContactsByLastName } from '../utils/contactSorting';
import { copyToClipboard } from '../utils/clipboard';

interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  endTime?: string;
  contact?: { 
    name: string; 
    id?: string; 
    email?: string; 
    nurtureFrequency?: number;
    initials?: string;
    color?: string;
    imageUrl?: string;
  };
  attendees?: string[];
  description?: string;
}

interface PostMeetingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: any) => void;
  meeting: Meeting;
  onNavigateToContact?: (contactName: string) => void;
  onUpdateContactNurture?: (contactId: string, frequency: number) => void;
  contacts?: Array<{ id: string; name: string; email?: string }>; // All contacts for selector
  // 🎯 PHASE 5 PROMPT 10: Add callbacks to save tasks/nurtures to App state
  onCreateTask?: (task: {
    title: string;
    description?: string;
    dueDate?: string;
    contact?: { id: string; name: string };
    priority?: 'high' | 'medium' | 'low';
    status?: string;
    estimatedTime?: number; // 🎯 Default 15 mins for action items
    taskType?: string; // Jamie's attempted task type
  }) => void;
  onCreateNurture?: (nurture: {
    contactId: string;
    contactName: string;
    dueDate: string;
    type: 'email' | 'call' | 'meeting';
    priority?: boolean;
  }) => void;
}

type WizardStep = "welcome" | "meeting-review" | "follow-up" | "nurture" | "thank-you" | "complete";

export function MutedPostMeetingWizard({
  isOpen,
  onClose,
  onComplete,
  meeting,
  onNavigateToContact,
  onUpdateContactNurture,
  onCreateTask,
  onCreateNurture,
  contacts
}: PostMeetingWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>("welcome");
  const [isMaximized, setIsMaximized] = useState(false);
  const followUpTaskCreationInProgressRef = useRef(false);
  
  // Interactions context for loading and updating dossiers
  const { getDossierByMeetingId, updateDossier, createDossier } = useInteractions();
  
  // Load existing dossier (if prep was done in AM Wizard)
  const [existingDossier, setExistingDossier] = useState<MeetingDossier | null>(null);
  
  // Track which contact to attach the dossier to (defaults to meeting.contact)
  const [selectedContactForDossier, setSelectedContactForDossier] = useState<{ id: string; name: string } | null>(
    meeting.contact?.id && meeting.contact?.name 
      ? { id: meeting.contact.id, name: meeting.contact.name } 
      : null
  );
  
  // Track post-meeting notes as they're being edited
  const [postMeetingNotes, setPostMeetingNotes] = useState<{
    fathomUrl: string;
    summary: string;
    outcomes: string;
    remainingQuestions: string;
  }>({
    fathomUrl: '',
    summary: '',
    outcomes: '',
    remainingQuestions: ''
  });
  
  // Track created tasks
  const [createdTasks, setCreatedTasks] = useState<Array<{
    title: string;
    description?: string;
    dueDate?: string; // Changed from Date to string (YYYY-MM-DD format)
    flagged: boolean;
    estimatedTime?: number; // 🎯 Default 15 mins for action items
    taskType?: string; // Jamie's attempted task type
  }>>([]);
  
  // NEW: Follow-up meeting task state
  const [followUpState, setFollowUpState] = useState<{
    hasFollowUpScheduled: boolean | null;
    wantsReminderTask: boolean | null;
    reminderDate: Date | null;
    taskCreated: boolean;
  }>({
    hasFollowUpScheduled: null,
    wantsReminderTask: null,
    reminderDate: null,
    taskCreated: false
  });
  
  // NEW: Nurture schedule state
  const [nurtureState, setNurtureState] = useState<{
    currentFrequency: number | null;
    wantsToSet: boolean | null;
    wantsToChange: boolean | null;
    newFrequency: number | null;
    updated: boolean;
  }>({
    currentFrequency: meeting.contact?.nurtureFrequency || null,
    wantsToSet: null,
    wantsToChange: null,
    newFrequency: null,
    updated: false
  });
  
  // NEW: Thank-you email state
  const [thankYouState, setThankYouState] = useState<{
    subject: string;
    body: string;
    sent: boolean;
    generated: boolean;
  }>({
    subject: '',
    body: '',
    sent: false,
    generated: false
  });
  
  // Load existing dossier when wizard opens
  useEffect(() => {
    if (isOpen && meeting.id) {
      console.log('🔍 Post-Meeting Wizard: Loading dossier for meeting ID:', meeting.id);
      console.log('🔍 Meeting title:', meeting.title);
      
      const dossier = getDossierByMeetingId(meeting.id);
      
      if (dossier) {
        setExistingDossier(dossier);
        console.log('📋 Loaded existing dossier for meeting:', meeting.title, dossier);
        console.log('📋 PrepNotes from dossier:', dossier.prepNotes);
        console.log('   - thingsToDiscuss (agenda):', dossier.prepNotes?.thingsToDiscuss);
        console.log('   - questionsToAsk:', dossier.prepNotes?.questionsToAsk);
        console.log('   - thingsToKnow:', dossier.prepNotes?.thingsToKnow);
        console.log('   - nextSteps:', dossier.prepNotes?.nextSteps);
        
        // Pre-fill post-meeting notes if they exist
        if (dossier.postMeetingNotes) {
          setPostMeetingNotes({
            fathomUrl: dossier.postMeetingNotes.fathomUrl || '',
            summary: dossier.postMeetingNotes.summary || '',
            outcomes: dossier.postMeetingNotes.outcomes || '',
            remainingQuestions: dossier.postMeetingNotes.remainingQuestions || ''
          });
          
          // Pre-fill thank-you email state if it exists
          if (dossier.postMeetingNotes.thankYouEmailSent !== undefined) {
            setThankYouState(prev => ({
              ...prev,
              sent: dossier.postMeetingNotes?.thankYouEmailSent || false
            }));
          }
        }
      } else {
        console.log('⚠️ No existing dossier found for meeting:', meeting.title);
        console.log('⚠️ Meeting ID searched:', meeting.id);
      }
    }
  }, [isOpen, meeting.id, meeting.title, getDossierByMeetingId]);

  // Handle ESC key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleNext = () => {
    // Save data before moving to next step
    if (currentStep === "meeting-review") {
      saveMeetingReviewData();
    } else if (currentStep === "follow-up") {
      saveFollowUpData();
    } else if (currentStep === "nurture") {
      saveNurtureData();
    } else if (currentStep === "thank-you") {
      saveThankYouData();
    }
    
    // Move to next step
    if (currentStep === "welcome") {
      setCurrentStep("meeting-review");
    } else if (currentStep === "meeting-review") {
      setCurrentStep("follow-up");
    } else if (currentStep === "follow-up") {
      setCurrentStep("nurture");
    } else if (currentStep === "nurture") {
      setCurrentStep("thank-you");
    } else if (currentStep === "thank-you") {
      setCurrentStep("complete");
    } else {
      // Complete the wizard
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep === "meeting-review") {
      setCurrentStep("welcome");
    } else if (currentStep === "follow-up") {
      setCurrentStep("meeting-review");
    } else if (currentStep === "nurture") {
      setCurrentStep("follow-up");
    } else if (currentStep === "thank-you") {
      setCurrentStep("nurture");
    } else if (currentStep === "complete") {
      setCurrentStep("thank-you");
    }
  };

  const saveMeetingReviewData = () => {
    // If no existing dossier, create one now (since we changed from creating on schedule to creating on post-meeting)
    let dossier = existingDossier;
    
    if (!dossier) {
      console.log('📋 No existing dossier - creating new dossier for meeting:', meeting.title);
      
      // Use the selected contact for dossier, or fall back to meeting.contact
      const contactForDossier = selectedContactForDossier || (meeting.contact?.id && meeting.contact?.name ? { id: meeting.contact.id, name: meeting.contact.name } : null);
      
      if (!contactForDossier) {
        toast.error('Please select a contact for this interaction');
        return;
      }
      
      // Create the dossier
      const newDossier = createDossier({
        meetingId: meeting.id,
        meetingTitle: meeting.title,
        meetingDate: meeting.date,
        meetingTime: meeting.time,
        contactId: contactForDossier.id,
        contactName: contactForDossier.name,
        attendees: meeting.attendees || [],
        preMeetingCompleted: false,
        postMeetingCompleted: false
      });
      
      if (newDossier) {
        dossier = newDossier;
        setExistingDossier(newDossier);
        console.log('✅ Created new dossier for contact:', contactForDossier.name, newDossier.id);
      } else {
        console.error('❌ Failed to create dossier');
        return; // Exit if we can't create a dossier
      }
    }
    
    if (dossier) {
      // Action-item tasks are created immediately in MeetingNotesDossier.onCreateTasks.
      // Do not create them again here, or each action item becomes a duplicate task
      // when the user advances past the Meeting Review step.
      const taskIds: string[] = [];
      console.log(`📝 ${createdTasks.length} action item task(s) already handled by MeetingNotesDossier.onCreateTasks`);

      // Update the dossier
      updateDossier(dossier.id, {
        postMeetingNotes: {
          ...dossier.postMeetingNotes,
          fathomUrl: postMeetingNotes.fathomUrl,
          summary: postMeetingNotes.summary,
          outcomes: postMeetingNotes.outcomes,
          remainingQuestions: postMeetingNotes.remainingQuestions,
        },
        taskIds: [...(dossier.taskIds || []), ...taskIds],
        postMeetingCompleted: true,
        postMeetingCompletedAt: new Date().toISOString()
      });
      
      console.log(`✅ Updated dossier with post-meeting notes:`, dossier.id);
      console.log(`📝 Created ${taskIds.length} tasks linked to meeting`);
    }
  };

  const createFollowUpReminderTask = () => {
    if (
      !followUpState.wantsReminderTask ||
      !followUpState.reminderDate ||
      followUpState.taskCreated ||
      followUpTaskCreationInProgressRef.current
    ) {
      return false;
    }

    // React state updates are not immediate, so this ref prevents double-clicks
    // or rapid Next clicks from creating the same follow-up task more than once.
    followUpTaskCreationInProgressRef.current = true;

    if (!onCreateTask || !meeting.contact?.id) {
      followUpTaskCreationInProgressRef.current = false;
      console.warn('⚠️ Cannot create follow-up reminder task: onCreateTask callback or contact ID is missing');
      toast.error('Unable to create follow-up task. Contact or task callback is missing.');
      return false;
    }

    // Use onCreateTask as the single canonical App task creation path.
    // The previous version also called InteractionsContext.createTask here, which could create duplicates.
    onCreateTask({
      title: `Reminder to schedule follow-up call with ${meeting.contact.name}`,
      description: `Follow-up from meeting: ${meeting.title}`,
      dueDate: dateToLocalString(followUpState.reminderDate),
      contact: {
        id: meeting.contact.id,
        name: meeting.contact.name
      },
      priority: undefined,
      status: 'toDo'
    });

    setFollowUpState(prev => ({ ...prev, taskCreated: true }));

    if (existingDossier) {
      updateDossier(existingDossier.id, {
        postMeetingNotes: {
          ...existingDossier.postMeetingNotes,
          followUpAlreadyScheduled: false,
          followUpReminderDueDate: followUpState.reminderDate.toISOString()
        }
      });
    }

    console.log('✅ Created follow-up reminder task in App state');
    return true;
  };

  const saveFollowUpData = () => {
    // Create the reminder if the user selected a date and advanced without pressing the confirm button.
    if (followUpState.wantsReminderTask && followUpState.reminderDate && !followUpState.taskCreated) {
      createFollowUpReminderTask();
      return;
    }

    // Just save the follow-up status if no reminder task needs to be created.
    if (existingDossier) {
      updateDossier(existingDossier.id, {
        postMeetingNotes: {
          ...existingDossier.postMeetingNotes,
          followUpAlreadyScheduled: followUpState.hasFollowUpScheduled || false,
          followUpReminderDueDate: followUpState.reminderDate?.toISOString()
        }
      });
    }
  };

  const saveNurtureData = () => {
    // Update nurture frequency if changed
    if (nurtureState.newFrequency && nurtureState.newFrequency !== nurtureState.currentFrequency && meeting.contact?.id) {
      onUpdateContactNurture?.(meeting.contact.id, nurtureState.newFrequency);
      setNurtureState(prev => ({ ...prev, updated: true, currentFrequency: prev.newFrequency }));
      
      // Save nurture tracking to dossier
      if (existingDossier) {
        updateDossier(existingDossier.id, {
          postMeetingNotes: {
            ...existingDossier.postMeetingNotes,
            nurtureFrequencySet: nurtureState.newFrequency,
            nurtureFrequencyChanged: nurtureState.currentFrequency !== null
          }
        });
      }
      
      console.log(`✅ Updated nurture frequency to ${nurtureState.newFrequency} weeks`);
    }
  };

  const saveThankYouData = () => {
    // Update the dossier with thank-you email sent status
    if (existingDossier) {
      updateDossier(existingDossier.id, {
        postMeetingNotes: {
          ...existingDossier.postMeetingNotes,
          thankYouEmailSent: thankYouState.sent
        }
      });
      console.log(`✅ Updated thank-you email status: ${thankYouState.sent}`);
    }
  };

  const handleComplete = () => {
    toast.success('Post-meeting notes saved successfully!');
    onComplete({
      meetingId: meeting.id,
      postMeetingNotes,
      tasksCreated: createdTasks.length + (followUpState.taskCreated ? 1 : 0),
      followUpTaskCreated: followUpState.taskCreated,
      nurtureUpdated: nurtureState.updated,
      thankYouEmailSent: thankYouState.sent
    });
  };

  // NEW: Handler to manually update the dossier without completing the wizard
  const handleUpdateDossier = () => {
    if (existingDossier) {
      console.log('💾 Manually updating dossier:', existingDossier.id);
      updateDossier(existingDossier.id, {
        postMeetingNotes: {
          ...existingDossier.postMeetingNotes,
          fathomUrl: postMeetingNotes.fathomUrl,
          summary: postMeetingNotes.summary,
          outcomes: postMeetingNotes.outcomes,
          remainingQuestions: postMeetingNotes.remainingQuestions,
        },
        updatedAt: new Date().toISOString()
      });
      
      // Show toast notification
      toast.success('Meeting dossier edits have been saved', {
        duration: 3000,
      });
    } else {
      console.warn('⚠️ No existing dossier to update');
      toast.error('No dossier found to update');
    }
  };

  // NEW: Generate thank-you email using AI
  const handleGenerateThankYouEmail = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a89809a8/generate-thank-you-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          contactName: meeting.contact?.name,
          meetingTitle: meeting.title,
          summary: postMeetingNotes.summary,
          outcomes: postMeetingNotes.outcomes,
          prepNotes: existingDossier?.prepNotes
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate email');
      }

      const data = await response.json();
      setThankYouState(prev => ({
        ...prev,
        subject: data.subject,
        body: data.body,
        generated: true
      }));
      
      toast.success('Thank-you email generated!');
    } catch (error) {
      console.error('Error generating email:', error);
      toast.error('Failed to generate email. Please try again.');
    }
  };

  const getStepNumber = () => {
    const steps: WizardStep[] = ["welcome", "meeting-review", "follow-up", "nurture", "thank-you", "complete"];
    return steps.indexOf(currentStep) + 1;
  };

  const getTotalSteps = () => {
    return 6;
  };

  // Step configuration for pills
  const stepConfig = [
    { key: 'welcome', label: 'Welcome', icon: MessageSquare },
    { key: 'meeting-review', label: 'Meeting Review', icon: FileText },
    { key: 'follow-up', label: 'Follow-Up', icon: Target },
    { key: 'nurture', label: 'Nurture', icon: Heart },
    { key: 'thank-you', label: 'Thank You', icon: Mail },
    { key: 'complete', label: 'Complete', icon: ThumbsUp }
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case "welcome":
        return (
          <div className="space-y-8 text-center max-w-3xl mx-auto">
            {/* Main Heading */}
            <div className="pt-[20px]">
              <h2 className="font-serif font-semibold text-4xl text-slate-800 mb-3 text-[50px]">
                Capture Your Thoughts
              </h2>
              <p className="text-lg text-slate-500 pt-[5px] pr-[0px] pb-[0px] pl-[0px]">
                Let's capture the important details while they're fresh
              </p>
            </div>

            {/* Meeting Info Card */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-slate-200/50 shadow-gentle">
              <h3 className="font-serif text-2xl text-slate-800 mb-4 text-[32px]">
                {meeting.title}
              </h3>
              <div className="flex items-center justify-center gap-4 text-slate-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-[20px]">{meeting.date}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-[20px]">{meeting.time}</span>
                  {meeting.endTime && <span className="text-[20px]">- {meeting.endTime}</span>}
                </div>
              </div>
              
              {meeting.contact && (
                <div className="mt-4 flex items-center justify-center">
                  <span className="text-slate-600 mr-2">with</span>
                  <button
                    onClick={() => onNavigateToContact?.(meeting.contact!.name)}
                    className="group/badge flex items-center gap-2 hover:bg-slate-100 rounded-lg px-3 py-2 transition-colors"
                  >
                    <Avatar className="w-8 h-8">
                      {meeting.contact.imageUrl ? (
                        <img src={meeting.contact.imageUrl} alt={meeting.contact.name} className="w-full h-full object-cover" />
                      ) : (
                        <AvatarFallback 
                          className="text-sm font-medium"
                          style={{ 
                            backgroundColor: meeting.contact.color || '#6b7b98',
                            color: 'white'
                          }}
                        >
                          {meeting.contact.initials || meeting.contact.name?.slice(0, 2).toUpperCase() || '?'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <span className="text-[18px] text-slate-700 group-hover/badge:text-[#6b2358] transition-colors font-medium">
                      {meeting.contact.name}
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Contact Selector for Dossier */}
            {contacts && contacts.length > 0 && (
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/50 shadow-gentle text-left">
                <label className="block text-lg font-medium text-slate-700 mb-3">
                  Which contact should this interaction be saved to?
                </label>
                <p className="text-sm text-slate-500 mb-4">
                  This determines where the dossier will appear in the Interactions tab
                </p>
                <select
                  value={selectedContactForDossier?.id || ''}
                  onChange={(e) => {
                    const contact = contacts.find(c => c.id === e.target.value);
                    if (contact) {
                      setSelectedContactForDossier({ id: contact.id, name: contact.name });
                    }
                  }}
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-700 focus:border-[#6b2358] focus:outline-none transition-all text-base"
                >
                  <option value="">Select a contact...</option>
                  {sortContactsByLastName(contacts).map(contact => (
                    <option key={contact.id} value={contact.id}>
                      {contact.name}{contact.email ? ` (${contact.email})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Jamie hint */}
            <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
              <Sparkles className="w-4 h-4 text-[#5e2350]" />
              <span>Jamie can help generate notes if you prefer</span>
            </div>
          </div>
        );

      case "meeting-review":
        // Convert old format to new unified format
        const dossierData: MeetingDossierData = {
          agenda: existingDossier?.prepNotes?.thingsToDiscuss || [],
          questions: existingDossier?.prepNotes?.questionsToAsk || [],
          thingsToKnow: existingDossier?.prepNotes?.thingsToKnow || '',
          nextStepsExpected: existingDossier?.prepNotes?.nextSteps || '',
          duringNotes: existingDossier?.duringMeetingNotes || '',
          fathomUrl: existingDossier?.fathomUrl || postMeetingNotes.fathomUrl || '',
          summary: existingDossier?.summary || postMeetingNotes.summary || '',
          transcript: existingDossier?.transcript || '',
          outcomes: existingDossier?.postMeetingNotes?.outcomes || postMeetingNotes.outcomes || '',
          actionItems: existingDossier?.actionItems || [],
          tasksCreated: existingDossier?.taskIds && existingDossier.taskIds.length > 0 || false,
        };
        
        return (
          <div className="space-y-6">
            <MeetingNotesDossier
              context="post-wizard"
              meetingId={meeting.id}
              meetingTitle={meeting.title}
              meetingDate={meeting.date}
              meetingTime={meeting.time}
              contact={meeting.contact}
              hideHeader={false}
              initialData={dossierData}
              onContactClick={(contact) => {
                // Navigate to contact profile
                onNavigateToContact?.(contact.name);
              }}
              onDataChange={(data) => {
                // Update post-meeting notes as they're edited
                setPostMeetingNotes({
                  fathomUrl: data.fathomUrl,
                  summary: data.summary,
                  outcomes: data.outcomes,
                  remainingQuestions: '', // Not used in new format
                });
                
                // Update dossier in context if it exists
                if (existingDossier) {
                  updateDossier(existingDossier.id, {
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
                      ...existingDossier.postMeetingNotes,
                      outcomes: data.outcomes,
                    },
                    actionItems: data.actionItems,
                  });
                }
              }}
              onCreateTasks={(tasks) => {
                const existingTaskKeys = new Set(
                  createdTasks.map(task =>
                    [
                      meeting.id,
                      task.title?.trim().toLowerCase(),
                      task.dueDate || '',
                      meeting.contact?.id || meeting.contact?.name || ''
                    ].join('|')
                  )
                );

                const tasksToCreate = tasks.filter(task => {
                  const taskKey = [
                    meeting.id,
                    task.text?.trim().toLowerCase(),
                    task.dueDate || '',
                    meeting.contact?.id || meeting.contact?.name || ''
                  ].join('|');

                  return !existingTaskKeys.has(taskKey);
                });

                // Create tasks immediately via onCreateTask callback.
                // saveMeetingReviewData intentionally does not recreate these later.
                tasksToCreate.forEach(task => {
                  if (onCreateTask) {
                    onCreateTask({
                      title: task.text,
                      description: `From meeting: ${meeting.title}`,
                      dueDate: task.dueDate, // Keep as string (YYYY-MM-DD)
                      contact: meeting.contact ? {
                        id: meeting.contact.id || 'unknown',
                        name: meeting.contact.name
                      } : undefined,
                      estimatedTime: task.duration,
                      status: 'toDo',
                    });
                  }
                });

                // Store in wizard state for tracking/summary only, not for later task creation.
                const convertedTasks = tasksToCreate.map(task => ({
                  title: task.text,
                  description: `From meeting: ${meeting.title}`,
                  dueDate: task.dueDate, // Keep as string
                  flagged: false,
                  estimatedTime: task.duration,
                  taskType: undefined,
                }));

                if (convertedTasks.length > 0) {
                  setCreatedTasks(prev => [...prev, ...convertedTasks]);
                }

                // Show success toast
                if (tasksToCreate.length > 0) {
                  toast.success(`${tasksToCreate.length} task${tasksToCreate.length === 1 ? '' : 's'} created successfully!`, {
                    description: `View them in the Tasks page`,
                    duration: 3000,
                  });
                } else {
                  toast.info('Those tasks already exist, so no duplicates were created.', {
                    duration: 2500,
                  });
                }
              }}
              existingTasks={existingDossier?.taskIds?.map((id, index) => ({
                id,
                text: createdTasks[index]?.title || `Task ${index + 1}`,
                contactName: meeting.contact?.name,
                dueDate: getTomorrowLocal(),
              })) || []}
              onDeleteTask={(taskId) => {
                // Remove from created tasks
                setCreatedTasks(prev => prev.filter((_, i) => existingDossier?.taskIds?.[i] !== taskId));
                
                // Update dossier
                if (existingDossier) {
                  updateDossier(existingDossier.id, {
                    taskIds: existingDossier.taskIds?.filter(id => id !== taskId) || [],
                  });
                }
              }}
            />
          </div>
        );

      case "follow-up":
        return (
          <div className="space-y-8 max-w-3xl mx-auto">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#6b7b98]/20 to-[#6b7b98]/10 flex items-center justify-center">
                <UserPlus className="w-10 h-10 text-[#6b7b98]" />
              </div>
            </div>

            {/* Heading */}
            <div className="text-center">
              <h2 className="font-serif text-4xl text-slate-800 mb-3">Follow-Up Meeting</h2>
              <p className="text-lg text-slate-500">
                Let's confirm your next steps with {meeting.contact?.name || 'this contact'}
              </p>
            </div>

            {/* Question 1: Already scheduled? */}
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-slate-200/50">
              <p className="text-xl text-slate-700 mb-6">
                Did you already schedule a follow-up meeting with {meeting.contact?.name || 'this contact'}?
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setFollowUpState(prev => ({ ...prev, hasFollowUpScheduled: true, wantsReminderTask: false }))}
                  className={`flex-1 px-6 py-4 rounded-2xl border-2 transition-all ${
                    followUpState.hasFollowUpScheduled === true
                      ? 'bg-[#6b2358] border-[#6b2358] text-white'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-[#6b2358]/50'
                  }`}
                >
                  Yes
                </button>
                <button
                  onClick={() => setFollowUpState(prev => ({ ...prev, hasFollowUpScheduled: false }))}
                  className={`flex-1 px-6 py-4 rounded-2xl border-2 transition-all ${
                    followUpState.hasFollowUpScheduled === false
                      ? 'bg-[#6b2358] border-[#6b2358] text-white'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-[#6b2358]/50'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* Question 2: Want a reminder task? (only if answered No) */}
            {followUpState.hasFollowUpScheduled === false && (
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-slate-200/50 space-y-6">
                <p className="text-xl text-slate-700">
                  Do you want a task reminding you to schedule a follow-up meeting?
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setFollowUpState(prev => ({ ...prev, wantsReminderTask: true }))}
                    className={`flex-1 px-6 py-4 rounded-2xl border-2 transition-all ${
                      followUpState.wantsReminderTask === true
                        ? 'bg-[#6b2358] border-[#6b2358] text-white'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-[#6b2358]/50'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setFollowUpState(prev => ({ ...prev, wantsReminderTask: false }))}
                    className={`flex-1 px-6 py-4 rounded-2xl border-2 transition-all ${
                      followUpState.wantsReminderTask === false
                        ? 'bg-[#6b2358] border-[#6b2358] text-white'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-[#6b2358]/50'
                    }`}
                  >
                    No
                  </button>
                </div>

                {/* Date picker (only if wants reminder) */}
                {followUpState.wantsReminderTask === true && (
                  <div className="space-y-4 pt-4 border-t border-slate-200">
                    <p className="text-slate-700">When should we remind you?</p>
                    
                    {/* Quick date options */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Tomorrow', days: 1 },
                        { label: 'In 3 days', days: 3 },
                        { label: 'Next week', days: 7 }
                      ].map(option => (
                        <button
                          key={option.label}
                          onClick={() => {
                            const date = new Date();
                            date.setDate(date.getDate() + option.days);
                            setFollowUpState(prev => ({ ...prev, reminderDate: date }));
                          }}
                          className={`px-4 py-3 rounded-xl border-2 transition-all ${
                            followUpState.reminderDate && 
                            new Date(followUpState.reminderDate).toDateString() === new Date(new Date().setDate(new Date().getDate() + option.days)).toDateString()
                              ? 'bg-[#6b2358]/10 border-[#6b2358] text-[#6b2358]'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-[#6b2358]/50'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>

                    {/* Custom date picker */}
                    <div>
                      <label className="block text-sm text-slate-600 mb-2">Or choose a custom date:</label>
                      <input
                        type="date"
                        value={followUpState.reminderDate ? dateToLocalString(followUpState.reminderDate) : ''}
                        onChange={(e) => setFollowUpState(prev => ({ ...prev, reminderDate: new Date(e.target.value) }))}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-[#6b2358] focus:outline-none"
                        min={getTodayLocal()}
                      />
                    </div>

                    {/* Task summary */}
                    {followUpState.reminderDate && (
                      <div className="space-y-3">
                        <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                          <p className="text-sm font-medium text-slate-600">Task Preview:</p>
                          <p className="text-slate-800">Reminder to schedule follow-up call with {meeting.contact?.name || 'contact'}</p>
                          <p className="text-sm text-slate-600">Due: {followUpState.reminderDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          <p className="text-sm text-slate-600">Tagged to: {meeting.contact?.name || 'this contact'}</p>
                        </div>
                        
                        {!followUpState.taskCreated && (
                          <button
                            onClick={() => {
                              const created = createFollowUpReminderTask();
                              if (created) {
                                toast.success('Follow-up reminder task created!', {
                                  description: `Due ${followUpState.reminderDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
                                  duration: 2500,
                                });
                              }
                            }}
                            className="w-full px-6 py-3 bg-[#6b2358] hover:bg-[#6b2358]/90 text-white rounded-xl shadow-lg shadow-[#6b2358]/20 transition-all"
                          >
                            Confirm and Create Task
                          </button>
                        )}
                        
                        {followUpState.taskCreated && (
                          <div className="flex items-center justify-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-green-700">
                            <CheckCircle2 className="w-5 h-5" />
                            <span>Task created successfully</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case "nurture":
        return (
          <div className="space-y-8 max-w-3xl mx-auto">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#6b7b98]/20 to-[#6b7b98]/10 flex items-center justify-center">
                <Repeat className="w-10 h-10 text-[#6b7b98]" />
              </div>
            </div>

            {/* Heading */}
            <div className="text-center">
              <h2 className="font-serif text-4xl text-slate-800 mb-3">Nurture Schedule</h2>
              <p className="text-lg text-slate-500">
                Keep the relationship going with {meeting.contact?.name || 'this contact'}
              </p>
            </div>

            {/* Scenario 1: No nurture schedule set */}
            {!nurtureState.currentFrequency && (
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-slate-200/50 space-y-6">
                <p className="text-xl text-slate-700">
                  Do you want to set a nurture schedule for {meeting.contact?.name || 'this contact'}?
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setNurtureState(prev => ({ ...prev, wantsToSet: true }))}
                    className={`flex-1 px-6 py-4 rounded-2xl border-2 transition-all ${
                      nurtureState.wantsToSet === true
                        ? 'bg-[#6b2358] border-[#6b2358] text-white'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-[#6b2358]/50'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setNurtureState(prev => ({ ...prev, wantsToSet: false }))}
                    className={`flex-1 px-6 py-4 rounded-2xl border-2 transition-all ${
                      nurtureState.wantsToSet === false
                        ? 'bg-[#6b2358] border-[#6b2358] text-white'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-[#6b2358]/50'
                    }`}
                  >
                    No
                  </button>
                </div>

                {/* Frequency options */}
                {nurtureState.wantsToSet === true && (
                  <div className="space-y-4 pt-4 border-t border-slate-200">
                    <label className="block text-slate-700 mb-2">How often would you like to nurture this relationship?</label>
                    <select
                      value={nurtureState.newFrequency || ''}
                      onChange={(e) => setNurtureState(prev => ({ ...prev, newFrequency: Number(e.target.value) }))}
                      className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-700 focus:border-[#6b2358] focus:outline-none transition-all"
                    >
                      <option value="">Select frequency...</option>
                      <option value="2">Every 2 weeks</option>
                      <option value="4">Every 4 weeks</option>
                      <option value="6">Every 6 weeks</option>
                      <option value="8">Every 8 weeks</option>
                      <option value="10">Every 10 weeks</option>
                      <option value="12">Every 12 weeks</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Scenario 2: Already has nurture schedule */}
            {nurtureState.currentFrequency && (
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-slate-200/50 space-y-6">
                <p className="text-xl text-slate-700">
                  You currently have {meeting.contact?.name || 'this contact'} set to a nurture frequency of every {nurtureState.currentFrequency} {nurtureState.currentFrequency === 1 ? 'week' : 'weeks'}. Do you want to change this?
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setNurtureState(prev => ({ ...prev, wantsToChange: true }))}
                    className={`flex-1 px-6 py-4 rounded-2xl border-2 transition-all ${
                      nurtureState.wantsToChange === true
                        ? 'bg-[#6b2358] border-[#6b2358] text-white'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-[#6b2358]/50'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setNurtureState(prev => ({ ...prev, wantsToChange: false }))}
                    className={`flex-1 px-6 py-4 rounded-2xl border-2 transition-all ${
                      nurtureState.wantsToChange === false
                        ? 'bg-[#6b2358] border-[#6b2358] text-white'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-[#6b2358]/50'
                    }`}
                  >
                    No
                  </button>
                </div>

                {/* Frequency options */}
                {nurtureState.wantsToChange === true && (
                  <div className="space-y-4 pt-4 border-t border-slate-200">
                    <label className="block text-slate-700 mb-2">How often would you like to nurture this relationship?</label>
                    <select
                      value={nurtureState.newFrequency || ''}
                      onChange={(e) => setNurtureState(prev => ({ ...prev, newFrequency: Number(e.target.value) }))}
                      className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-700 focus:border-[#6b2358] focus:outline-none transition-all"
                    >
                      <option value="">Select frequency...</option>
                      <option value="2">Every 2 weeks</option>
                      <option value="4">Every 4 weeks</option>
                      <option value="6">Every 6 weeks</option>
                      <option value="8">Every 8 weeks</option>
                      <option value="10">Every 10 weeks</option>
                      <option value="12">Every 12 weeks</option>
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case "thank-you":
        return (
          <div className="space-y-8 max-w-4xl mx-auto">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#6b7b98]/20 to-[#6b7b98]/10 flex items-center justify-center">
                <Mail className="w-10 h-10 text-[#6b7b98]" />
              </div>
            </div>

            {/* Heading */}
            <div className="text-center">
              <h2 className="font-serif text-4xl text-slate-800 mb-3">Thank-You Email</h2>
              <p className="text-lg text-slate-500">
                Send a warm follow-up to {meeting.contact?.name || 'your contact'}
              </p>
            </div>

            {/* Generate button (if not generated yet) */}
            {!thankYouState.generated && (
              <div className="flex justify-center">
                <button
                  onClick={handleGenerateThankYouEmail}
                  className="px-8 py-4 bg-[#6b2358] hover:bg-[#6b2358]/90 text-white rounded-2xl shadow-lg transition-all flex items-center gap-3"
                >
                  <Sparkles className="w-5 h-5" />
                  <span className="font-medium">Generate with Jamie</span>
                </button>
              </div>
            )}

            {/* Email editor (if generated) */}
            {thankYouState.generated && (
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-slate-200/50 space-y-6">
                {/* Header with regenerate button */}
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-slate-800">Email Draft</h3>
                  <button
                    onClick={handleGenerateThankYouEmail}
                    className="px-4 py-2 bg-white border-2 border-slate-200 hover:border-[#6b2358]/50 text-slate-700 rounded-xl transition-all flex items-center gap-2 text-sm"
                  >
                    <Sparkles className="w-4 h-4" />
                    Regenerate
                  </button>
                </div>
                
                {/* Subject line */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
                  <input
                    type="text"
                    value={thankYouState.subject}
                    onChange={(e) => setThankYouState(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-[#6b2358] focus:outline-none"
                  />
                </div>

                {/* Email body */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                  <textarea
                    value={thankYouState.body}
                    onChange={(e) => setThankYouState(prev => ({ ...prev, body: e.target.value }))}
                    rows={12}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-[#6b2358] focus:outline-none resize-none"
                  />
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={async () => {
                      const success = await copyToClipboard(thankYouState.body);
                      if (success) {
                        toast.success('Email copied to clipboard!');
                      } else {
                        toast.error('Failed to copy email');
                      }
                    }}
                    className="flex-1 px-6 py-3 bg-white border-2 border-slate-200 hover:border-[#6b2358]/50 text-slate-700 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Text
                  </button>
                  <button
                    onClick={() => {
                      const mailtoLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${meeting.contact?.email || ''}&su=${encodeURIComponent(thankYouState.subject)}&body=${encodeURIComponent(thankYouState.body)}`;
                      window.open(mailtoLink, '_blank');
                    }}
                    className="flex-1 px-6 py-3 bg-[#6b2358] hover:bg-[#6b2358]/90 text-white rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open in Gmail
                  </button>
                </div>

                {/* Sent checkbox */}
                <div className="pt-4 border-t border-slate-200">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={thankYouState.sent}
                      onChange={(e) => setThankYouState(prev => ({ ...prev, sent: e.target.checked }))}
                      className="w-5 h-5 rounded border-slate-300 text-[#6b2358] focus:ring-[#6b2358]"
                    />
                    <span className="text-slate-700 font-medium">I've sent the thank you email</span>
                  </label>
                  <p className="text-xs text-slate-500 ml-8 mt-1">
                    You must confirm the email has been sent before continuing
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      case "complete":
        return (
          <div className="space-y-8 max-w-3xl mx-auto">
            {/* Success icon */}
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500/20 to-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
            </div>

            {/* Heading */}
            <div className="text-center">
              <h2 className="font-serif text-4xl text-slate-800 mb-3">All Done!</h2>
              <p className="text-lg text-slate-500">
                Here's what we accomplished
              </p>
            </div>

            {/* Summary cards */}
            <div className="space-y-4">
              {/* Meeting notes saved */}
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-800 mb-1">Meeting Notes Saved</h3>
                    <p className="text-sm text-slate-600">
                      Notes and details saved in meeting card in {meeting.contact?.name || 'contact'}'s interaction tab
                    </p>
                  </div>
                </div>
              </div>

              {/* Tasks created */}
              {(createdTasks.length > 0 || followUpState.taskCreated) && (
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-800 mb-1">
                        {createdTasks.length + (followUpState.taskCreated ? 1 : 0)} Task{createdTasks.length + (followUpState.taskCreated ? 1 : 0) !== 1 ? 's' : ''} Created
                      </h3>
                      <p className="text-sm text-slate-600">
                        Tasks added to main Tasks page and {meeting.contact?.name || 'contact'}'s tasks tab
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Follow-up meeting */}
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-800 mb-1">Follow-Up Meeting</h3>
                    <p className="text-sm text-slate-600">
                      {followUpState.hasFollowUpScheduled 
                        ? 'Follow-up meeting already scheduled'
                        : followUpState.wantsReminderTask && followUpState.taskCreated
                        ? `Reminder task created for ${followUpState.reminderDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                        : 'No follow-up reminder needed at this time'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Nurture schedule */}
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-800 mb-1">Nurture Schedule</h3>
                    <p className="text-sm text-slate-600">
                      {nurtureState.updated
                        ? `Set to every ${nurtureState.newFrequency} ${nurtureState.newFrequency === 1 ? 'week' : 'weeks'}`
                        : nurtureState.currentFrequency
                        ? `Keeping current schedule (every ${nurtureState.currentFrequency} ${nurtureState.currentFrequency === 1 ? 'week' : 'weeks'})`
                        : 'No nurture schedule set'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Thank-you email */}
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-800 mb-1">Thank-You Email</h3>
                    <p className="text-sm text-slate-600 mb-3">
                      {thankYouState.sent
                        ? 'Sent to contact'
                        : thankYouState.generated
                        ? 'Draft generated, not sent yet'
                        : 'Not generated'}
                    </p>
                    {thankYouState.generated && !thankYouState.sent && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setCurrentStep('thank-you')}
                          className="px-4 py-2 bg-white border-2 border-slate-200 hover:border-[#6b2358]/50 text-slate-700 rounded-xl transition-all flex items-center gap-2 text-sm"
                        >
                          <Edit className="w-4 h-4" />
                          View/Edit Draft
                        </button>
                        <button
                          onClick={() => {
                            const mailtoLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${meeting.contact?.email || ''}&su=${encodeURIComponent(thankYouState.subject)}&body=${encodeURIComponent(thankYouState.body)}`;
                            window.open(mailtoLink, '_blank');
                          }}
                          className="px-4 py-2 bg-[#6b2358] hover:bg-[#6b2358]/90 text-white rounded-xl transition-all flex items-center gap-2 text-sm"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Open in Gmail
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100000] p-4">
      <div className={`bg-gradient-to-br from-white/95 to-slate-50/95 backdrop-blur-xl rounded-[32px] shadow-2xl border border-slate-200/50 flex flex-col overflow-hidden transition-all ${
        isMaximized ? 'w-screen h-screen' : 'w-full max-w-6xl h-[90vh]'
      }`}>
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-200/50 flex items-center justify-between backdrop-blur-xl flex-shrink-0 rounded-t-[32px] bg-[#6b2358]">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#6b7b98]/10 flex items-center justify-center shadow-lg bg-[rgba(255,255,255,0.4)]">
              <Calendar className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-serif font-medium text-[rgb(255,255,255)] text-[30px]">Post-Meeting Notes</h1>
              <p className="text-[rgb(255,255,255)] text-[20px] pt-[5px] pr-[0px] pb-[0px] pl-[0px]">{meeting.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMaximized(!isMaximized)}
              className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-[rgb(255,255,255)] hover:text-slate-700 transition-all"
              title={isMaximized ? "Restore size" : "Maximize"}
            >
              {isMaximized ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-[rgb(255,255,255)] hover:text-slate-700 transition-all"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Pills */}
        <div className="border-b border-slate-200/50 bg-[rgb(247,247,249)] px-8 py-4">
          <div className="flex items-center gap-2">
            {stepConfig.map((s, idx) => {
              const Icon = s.icon;
              const isActive = currentStep === s.key;
              const isCompleted = getStepNumber() > idx + 1;
              
              return (
                <div key={s.key} className="contents">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all ${
                    isActive 
                      ? 'bg-[#6b2358] text-white font-semibold' 
                      : isCompleted 
                        ? 'bg-[#6b2358] text-white font-medium' 
                        : 'bg-slate-100 text-slate-500 font-normal'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                    <span>{s.label}</span>
                  </div>
                  {idx < stepConfig.length - 1 && (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-[32px] pt-[50px] pr-[32px] pb-[32px] pl-[32px] bg-[#f7f7f9]">
          {renderStepContent()}
        </div>

        {/* Footer with Progress Breadcrumbs */}
        <div className="px-8 py-6 border-t border-slate-200/50 flex items-center justify-between bg-white/60 backdrop-blur-xl flex-shrink-0 rounded-b-[32px]">
          {/* Back Button */}
          <button
            onClick={handleBack}
            disabled={currentStep === "welcome"}
            className={`px-6 py-3 rounded-2xl transition-all flex items-center gap-2 ${
              currentStep === "welcome"
                ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                : 'bg-white/60 hover:bg-white/80 border border-slate-200 text-slate-700 shadow-sm'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          {/* Breadcrumb Dots */}
          <div className="flex items-center gap-2">
            {Array.from({ length: getTotalSteps() }).map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i < getStepNumber()
                    ? 'w-8 bg-[#6b2358]'
                    : 'w-2 bg-slate-200'
                }`}
              />
            ))}
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            className="px-6 py-3 bg-[#6b2358] hover:bg-[#6b2358]/90 text-white rounded-2xl transition-all shadow-lg flex items-center gap-2 shadow-[#6b2358]/20"
          >
            {currentStep === "complete" ? "Close" : "Next"}
            {currentStep !== "complete" && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

export { MutedPostMeetingWizard as PostMeetingWizard };
