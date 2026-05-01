import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Calendar,
  User,
  Tag,
  Folder,
  Trash2,
  Archive,
  Circle,
  Clock,
  AlertCircle,
  CheckCircle2,
  Maximize2,
  Minimize2,
  ChevronDown,
  Check,
  Briefcase,
  ExternalLink,
  Mail,
  Loader2,
  Sparkles,
  Mic,
  MicOff,
  CheckSquare,
  Star,
  Upload,
  ArrowLeft,
  Copy,
  Box as Boxes
} from "lucide-react";
import { TaskType, taskTypeOptions, detectTaskType } from '../utils/taskTypes';
import { 
  validateTheirLinkScheduling, 
  validateMyLinkScheduling,
  extractTopicPhrase,
  getFirstName,
  generateSchedulingEmail,
  openGmailCompose
} from '../utils/schedulingHelpers';
import { getUserSchedulingLink } from '../utils/userSettings';
import { getSmartTimeEstimate, getLearnedTimeEstimate } from '../utils/jamieTimeEstimates';
import { getUpcomingAvailability } from '../utils/availabilityHelper';
import { MentionProvider } from './shared/MentionContext';
import { MentionTextarea } from './shared/MentionTextarea';
import { Button } from './ui/Button';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { 
  generateOutreachEmail,
  validateOutreachTask,
  extractOutreachTopic
} from '../utils/outreachHelpers';
import { generateStartMyTaskDraft } from '../utils/jamieAI';
import { sortContactsByLastName } from '../utils/contactSorting';
import { copyToClipboard } from '../utils/clipboard';

export interface Contact {
  id: string;
  name: string;
  email?: string;
  company?: string;
  archived?: boolean;
  schedulingUrl?: string;
}

export interface Task {
  id?: string;
  title: string;
  contact?: string | { id: string; name: string };
  contact_id?: string;
  dueDate?: string;
  status?: "toDo" | "inProgress" | "awaitingReply" | "done" | "archived";
  notes?: string;
  tags?: string[];
  folder?: string;
  isFlagged?: boolean;
  archived?: boolean;
  taskType?: TaskType;
  estimatedTime?: number; // in minutes
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  onSave?: (task: Task) => void;
  onDelete?: () => void;
  onArchive?: () => void;
  onGetStarted?: (task: Task) => void; // Start my task handler
  prefilledContact?: string | { id: string; name: string };
  contacts?: Contact[];
  onContactClick?: (contactId: string) => void;
}

const statusOptions = [
  { value: "toDo", label: "To Do", color: "#c198ad", icon: Circle },
  { value: "inProgress", label: "In Progress", color: "#e2b7bd", icon: Clock },
  { value: "awaitingReply", label: "Awaiting Reply", color: "#b8a7c9", icon: AlertCircle },
  { value: "done", label: "Done", color: "#9eafa4", icon: CheckCircle2 },
];

export function MutedTaskModal({ 
  isOpen, 
  onClose, 
  task = null, 
  onSave, 
  onDelete, 
  onArchive,
  onGetStarted,
  prefilledContact,
  contacts = [],
  onContactClick
}: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [contact, setContact] = useState("");
  const [isFlagged, setIsFlagged] = useState(false);
  const [status, setStatus] = useState<"toDo" | "inProgress" | "awaitingReply" | "done" | "archived">("toDo");
  const [taskType, setTaskType] = useState<TaskType | null>(null);
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [folder, setFolder] = useState("");
  const [isMaximized, setIsMaximized] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState<number>(30); // default 30 minutes
  
  const [contactSearchQuery, setContactSearchQuery] = useState("");
  const [showContactDropdown, setShowContactDropdown] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const contactInputRef = useRef<HTMLInputElement>(null);
  const contactDropdownRef = useRef<HTMLDivElement>(null);
  
  // Voice dictation state
  const [isListeningForTitle, setIsListeningForTitle] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Start My Task wizard state
  const [showStartWizard, setShowStartWizard] = useState(false);
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState<string>('');
  const [userPrompt, setUserPrompt] = useState<string>('');

  const filteredContacts = sortContactsByLastName(
    contacts.filter(c => 
      !c.archived && (
        c.name.toLowerCase().includes(contactSearchQuery.toLowerCase()) ||
        c.email?.toLowerCase().includes(contactSearchQuery.toLowerCase()) ||
        c.company?.toLowerCase().includes(contactSearchQuery.toLowerCase())
      )
    )
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contactDropdownRef.current && 
        !contactDropdownRef.current.contains(event.target as Node) &&
        contactInputRef.current &&
        !contactInputRef.current.contains(event.target as Node)
      ) {
        setShowContactDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Initialize speech recognition for title dictation
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false; // Stop after one phrase
      recognition.interimResults = false; //  Only want final results
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setTitle(transcript);
        setIsListeningForTitle(false);
      };

      recognition.onerror = (event: any) => {
        console.log('Speech recognition error:', event.error);
        setIsListeningForTitle(false);
        
        if (event.error === 'not-allowed') {
          toast.error('Microphone access denied. Please allow microphone access in your browser settings.');
        } else if (event.error === 'no-speech') {
          // Silent - normal behavior
        } else if (event.error === 'aborted') {
          // Silent - user stopped
        } else {
          console.error('Unexpected speech recognition error:', event.error);
        }
      };

      recognition.onend = () => {
        setIsListeningForTitle(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      
      const taskContact = task.contact;
      if (typeof taskContact === 'string') {
        setContact(taskContact);
        setContactSearchQuery(taskContact);
        const matchingContact = contacts.find(c => c.name.toLowerCase() === taskContact.toLowerCase());
        setSelectedContactId(matchingContact?.id || null);
      } else if (taskContact && typeof taskContact === 'object') {
        setContact(taskContact.name);
        setContactSearchQuery(taskContact.name);
        setSelectedContactId(taskContact.id);
      } else {
        setContact("");
        setContactSearchQuery("");
        setSelectedContactId(null);
      }
      
      setDueDate(task.dueDate || "");
      setStatus(task.status || "toDo");
      setNotes(task.notes || "");
      setTags(task.tags || []);
      setFolder(task.folder || "");
      setIsFlagged(task.isFlagged || false);
      setTaskType(task.taskType || null);
      setEstimatedTime(task.estimatedTime || 30);
    } else {
      setTitle("");
      
      if (prefilledContact) {
        if (typeof prefilledContact === 'string') {
          setContact(prefilledContact);
          setContactSearchQuery(prefilledContact);
          const matchingContact = contacts.find(c => c.name.toLowerCase() === prefilledContact.toLowerCase());
          setSelectedContactId(matchingContact?.id || null);
        } else {
          setContact(prefilledContact.name);
          setContactSearchQuery(prefilledContact.name);
          setSelectedContactId(prefilledContact.id);
        }
      } else {
        setContact("");
        setContactSearchQuery("");
        setSelectedContactId(null);
      }
      
      setDueDate("");
      setStatus("toDo");
      setNotes("");
      setTags([]);
      setFolder("");
      setIsFlagged(false);
      setTaskType(null);
      setEstimatedTime(30);
    }
    
    // Reset wizard state when task changes
    setShowStartWizard(false);
    setGeneratedDraft('');
    setUserPrompt('');
  }, [task, prefilledContact, isOpen]);

  const handleSelectContact = (selectedContact: Contact) => {
    setContact(selectedContact.name);
    setContactSearchQuery(selectedContact.name);
    setSelectedContactId(selectedContact.id);
    setShowContactDropdown(false);
  };

  const handleClearContact = () => {
    setContact("");
    setContactSearchQuery("");
    setSelectedContactId(null);
  };

  // Auto-update estimated time when task type changes (using Jamie's learned data)
  useEffect(() => {
    if (taskType && !task) {
      // Only auto-update for new tasks, not when editing existing ones
      const learnedEstimate = getSmartTimeEstimate(taskType, 30);
      setEstimatedTime(learnedEstimate);
      
      // Show a subtle toast if Jamie is using learned data
      const hasLearnedData = getLearnedTimeEstimate(taskType) !== null;
      if (hasLearnedData && learnedEstimate !== 30) {
        toast.success(`Jamie estimated ${learnedEstimate} min based on your history`, {
          duration: 2000,
          icon: <Sparkles className="w-4 h-4" />
        });
      }
    }
  }, [taskType, task]);

  const handleSave = () => {
    let finalContactId = selectedContactId;
    let finalContactName = contact;
    
    if (contactSearchQuery && !selectedContactId) {
      const matchingContact = contacts.find(c => 
        c.name.toLowerCase() === contactSearchQuery.toLowerCase()
      );
      if (matchingContact) {
        finalContactId = matchingContact.id;
        finalContactName = matchingContact.name;
      } else {
        finalContactName = contactSearchQuery;
      }
    }
    
    const contactValue = finalContactId 
      ? { id: finalContactId, name: finalContactName }
      : finalContactName || undefined;
    
    const taskData: Task = {
      id: task?.id,
      title,
      contact: contactValue,
      contact_id: finalContactId || undefined,
      dueDate: dueDate || undefined,
      status,
      notes,
      tags,
      folder,
      isFlagged,
      archived: task?.archived || false,
      taskType: taskType || detectTaskType(notes),
      estimatedTime: estimatedTime
    };
    onSave?.(taskData);
    onClose();
  };

  // Scheduling action handlers
  const handleUseTheirLink = () => {
    const selectedContact = selectedContactId ? contacts.find(c => c.id === selectedContactId) : null;
    const validation = validateTheirLinkScheduling(selectedContact);
    
    if (!validation.isValid) {
      toast.error(validation.errorMessage);
      return;
    }
    
    // Open their scheduling link
    if (selectedContact?.schedulingUrl) {
      window.open(selectedContact.schedulingUrl, '_blank');
      
      // Optionally update task status to awaiting reply
      setStatus('awaitingReply');
      toast.success(`Opened ${getFirstName(selectedContact.name)}'s scheduling page`);
    }
  };

  const handleSendMyLink = async () => {
    setIsGeneratingEmail(true);
    
    try {
      const selectedContact = selectedContactId ? contacts.find(c => c.id === selectedContactId) : null;
      
      // Get user's scheduling link from settings
      const userSchedulingLink = getUserSchedulingLink();
      
      const validation = validateMyLinkScheduling(selectedContact, userSchedulingLink);
      
      if (!validation.isValid) {
        toast.error(validation.errorMessage);
        setIsGeneratingEmail(false);
        return;
      }
      
      if (!selectedContact?.email) {
        toast.error("Contact email is required");
        setIsGeneratingEmail(false);
        return;
      }
      
      // Extract topic from title and notes
      const topicPhrase = extractTopicPhrase(title, notes);
      
      // Generate email
      const emailData = generateSchedulingEmail({
        firstName: getFirstName(selectedContact.name),
        email: selectedContact.email,
        schedulingLink: userSchedulingLink,
        topicPhrase: topicPhrase || undefined
      });
      
      // Small delay to show generating state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Open Gmail compose
      openGmailCompose(selectedContact.email, emailData.subject, emailData.body);
      
      // Update task status to awaiting reply
      setStatus('awaitingReply');
      
      toast.success(`Generated scheduling email for ${getFirstName(selectedContact.name)}`);
    } catch (error) {
      toast.error("Failed to generate scheduling email");
      console.error(error);
    } finally {
      setIsGeneratingEmail(false);
    }
  };

  // Outreach email handler
  const handleDraftOutreachEmail = async () => {
    setIsGeneratingEmail(true);
    
    try {
      const selectedContact = selectedContactId ? contacts.find(c => c.id === selectedContactId) : null;
      
      // Extract topic from title
      const topicPhrase = extractOutreachTopic(title);
      
      const validation = validateOutreachTask(selectedContact, topicPhrase);
      
      if (!validation.isValid) {
        toast.error(validation.errorMessage);
        setIsGeneratingEmail(false);
        return;
      }
      
      if (!selectedContact?.email) {
        toast.error("Contact email is required");
        setIsGeneratingEmail(false);
        return;
      }
      
      if (!topicPhrase) {
        toast.error("Couldn't determine email topic from task title");
        setIsGeneratingEmail(false);
        return;
      }
      
      // Generate outreach email
      const emailData = generateOutreachEmail({
        firstName: getFirstName(selectedContact.name),
        email: selectedContact.email,
        topicPhrase: topicPhrase,
        taskDescription: notes || undefined
      });
      
      // Small delay to show generating state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Open Gmail compose
      openGmailCompose(selectedContact.email, emailData.subject, emailData.body);
      
      // Update task status to awaiting reply
      setStatus('awaitingReply');
      
      toast.success(`Drafted outreach email for ${getFirstName(selectedContact.name)}`);
    } catch (error) {
      toast.error("Failed to draft outreach email");
      console.error(error);
    } finally {
      setIsGeneratingEmail(false);
    }
  };

  // Voice dictation handler for title
  const handleToggleDictation = async () => {
    if (!recognitionRef.current) {
      toast.error('Voice input not supported in this browser');
      return;
    }

    if (isListeningForTitle) {
      // Stop listening
      recognitionRef.current.stop();
      setIsListeningForTitle(false);
    } else {
      // Start listening - request permission first
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        console.log('Microphone permission granted');
      } catch (permError: any) {
        console.log('Microphone permission denied by user:', permError.name);
        toast.error('Microphone access denied. Please allow microphone access in your browser settings.');
        return;
      }

      try {
        recognitionRef.current.start();
        setIsListeningForTitle(true);
        toast.success('Listening... Start speaking!', { duration: 2000 });
      } catch (error) {
        console.error('Failed to start voice input:', error);
        toast.error('Could not start voice input. Please try again.');
        setIsListeningForTitle(false);
      }
    }
  };

  // Start My Task wizard handlers
  const handleStartMyTask = () => {
    setShowStartWizard(true);
    setGeneratedDraft('');
    
    // Auto-generate for scheduling-my link tasks
    if (taskType === 'schedule_my_link' && fullContact) {
      setTimeout(() => {
        const userSchedulingLink = getUserSchedulingLink();
        const firstName = getFirstName(fullContact.name);
        
        const schedulingDraft = `Subject: Let's Schedule Time to Connect

Hi ${firstName},

Here is my scheduling link for your reference. Feel free to choose a time that works best for you!

${userSchedulingLink || '[Your scheduling link]'}

I look forward to connecting!

Best,
[Your name]`;
        
        setGeneratedDraft(schedulingDraft);
      }, 100); // Small delay to show smooth transition
    }
  };

  const handleGenerateDraft = () => {
    setIsGeneratingDraft(true);

    setTimeout(() => {
      // Special handling for scheduling-my-link tasks
      if (taskType === 'schedule_my_link' && fullContact) {
        const userSchedulingLink = getUserSchedulingLink();
        const firstName = getFirstName(fullContact.name);
        
        const schedulingDraft = `Subject: Let's Schedule Time to Connect

Hi ${firstName},

Here is my scheduling link for your reference. Feel free to choose a time that works best for you!

${userSchedulingLink || '[Your scheduling link]'}

I look forward to connecting!

Best,
[Your name]`;
        
        setGeneratedDraft(schedulingDraft);
        setIsGeneratingDraft(false);
        return;
      }
      
      // Special handling for scheduling-email tasks (interpret user prompt as instructions)
      if (taskType === 'schedule_email' && fullContact) {
        const firstName = getFirstName(fullContact.name);
        
        const emailDraft = `Subject: Let's Find Time to Connect

Hi ${firstName},

I'd love to find some time to connect. Would you be able to share your availability over the next two weeks? I'm flexible and happy to work around your schedule.

Looking forward to connecting!

Best,
Meredith`;
        
        setGeneratedDraft(emailDraft);
        setIsGeneratingDraft(false);
        return;
      }
      
      // For outreach and other email tasks, use AI to generate based on prompt
      if ((taskType === 'outreach' || taskType === 'networking') && userPrompt.trim() && fullContact) {
        // Call AI generation with the prompt as instructions
        const draft = generateStartMyTaskDraft(
          title,
          taskType || undefined,
          userPrompt, // Pass as context/instructions, not literal text
          fullContact ? {
            id: fullContact.id,
            name: fullContact.name,
            email: fullContact.email,
            company: fullContact.company,
            schedulingUrl: fullContact.schedulingUrl,
          } : undefined
        );
        setGeneratedDraft(draft);
        setIsGeneratingDraft(false);
        return;
      }
      
      // Fallback to standard draft generation
      const draft = generateStartMyTaskDraft(
        title,
        taskType || undefined,
        notes,
        fullContact ? {
          id: fullContact.id,
          name: fullContact.name,
          email: fullContact.email,
          company: fullContact.company,
          schedulingUrl: fullContact.schedulingUrl,
        } : undefined
      );
      setGeneratedDraft(draft);
      setIsGeneratingDraft(false);
    }, 1500);
  };

  const handleCopyDraft = async () => {
    const success = await copyToClipboard(generatedDraft);
    if (success) {
      toast.success('Draft copied to clipboard');
    } else {
      toast.error('Failed to copy draft');
    }
  };

  if (!isOpen) return null;

  const selectedStatusOption = statusOptions.find(opt => opt.value === status);
  const SelectedIcon = selectedStatusOption?.icon || Circle;
  
  // Get full contact object for scheduling actions
  const fullContact = selectedContactId ? contacts.find(c => c.id === selectedContactId) : null;
  const contactFirstName = fullContact ? getFirstName(fullContact.name) : '';
  
  // Determine if this is a scheduling task with a link
  const isSchedulingTheirLink = taskType === 'schedule_their_link' && fullContact?.schedulingUrl;
  
  // Determine if we should show scheduling actions
  const isSchedulingTask = taskType === 'schedule_their_link' || taskType === 'schedule_my_link';
  const showSchedulingActions = isSchedulingTask && title.trim().length > 0;
  
  // Determine if we should show outreach actions
  const isOutreachTask = taskType === 'outreach';
  const showOutreachActions = isOutreachTask && title.trim().length > 0;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100000] p-4">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] w-full max-w-6xl">
        {/* Header */}
        <div className="px-8 py-6 border-b border-white/20 flex items-center justify-between" style={{ backgroundColor: '#c198ad' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-md bg-white/20 flex items-center justify-center shadow-soft">
              <CheckSquare className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-serif font-semibold text-white text-[30px]">{task ? "Edit Task" : "New Task"}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMaximized(!isMaximized)}
              className="text-white/70 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-xl"
            >
              {isMaximized ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            <button onClick={onClose} className="text-white/70 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-xl">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-[rgb(248,250,252)]">
          <div className="max-w-3xl mx-auto space-y-6">
            
            {/* Start My Task Wizard */}
            {showStartWizard ? (
              <div className="space-y-6">
                {/* Back button and header */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setShowStartWizard(false);
                      setGeneratedDraft('');
                    }}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#6b2358]/10 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-[#6b2358]" fill="currentColor" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">Start My Task</h3>
                      <p className="text-sm text-slate-600">Jamie will help you take the first action</p>
                    </div>
                  </div>
                </div>

                {/* Task Context Card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">Task</div>
                  <div className="text-lg font-semibold text-slate-900 mb-2">{title}</div>
                  {fullContact && (
                    <div className="text-sm text-slate-600 mb-2">
                      Contact: {fullContact.name}
                      {fullContact.company && ` • ${fullContact.company}`}
                    </div>
                  )}
                  {notes && (
                    <div className="text-sm text-slate-600 mt-3 pt-3 border-t border-slate-100">{notes}</div>
                  )}
                </div>

                {/* Generated Draft or Prompt Input */}
                {!generatedDraft ? (
                  <div className="space-y-6">
                    {/* Scheduling Their Link - Direct Link Access */}
                    {isSchedulingTheirLink ? (
                      <div className="space-y-6">
                        {/* Your Upcoming Availability Widget */}
                        <div className="rounded-2xl border border-[#2f829b]/20 bg-gradient-to-br from-[#2f829b]/5 to-[#98c1d9]/5 p-5">
                          <div className="flex items-center gap-2 mb-4">
                            <Clock className="w-5 h-5 text-[#2f829b]" />
                            <h4 className="font-semibold text-slate-900">Your Upcoming Availability</h4>
                          </div>
                          <div className="space-y-2">
                            {getUpcomingAvailability(4).map((slot, index) => (
                              <div 
                                key={index}
                                className="flex items-center justify-between bg-white/80 backdrop-blur-sm px-4 py-3 rounded-xl border border-slate-200/50"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-lg bg-[#2f829b]/10 flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-[#2f829b]" />
                                  </div>
                                  <div>
                                    <div className="font-medium text-slate-900">{slot.dayOfWeek}</div>
                                    <div className="text-sm text-slate-600">{slot.dateString}</div>
                                  </div>
                                </div>
                                <div className="text-sm font-medium text-slate-700">
                                  {slot.timeRange}
                                </div>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-slate-500 mt-3 text-center">
                            Based on your scheduling preferences (Wed/Thurs, 1-3:30pm ET)
                          </p>
                          <a
                            href={getUserSchedulingLink()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 mt-3 text-sm text-[#2f829b] hover:text-[#2f829b]/80 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            View My Scheduling Page
                          </a>
                        </div>

                        {/* Call to Action */}
                        <div className="flex flex-col items-center justify-center py-8 px-6 text-center">
                          <div className="w-20 h-20 rounded-2xl bg-[#6b2358]/10 flex items-center justify-center mb-5">
                            <Calendar className="w-10 h-10 text-[#6b2358]" />
                          </div>
                          <h3 className="text-xl font-semibold text-slate-900 mb-2">
                            Ready to schedule with {fullContact?.name || 'them'}
                          </h3>
                          <p className="text-slate-600 max-w-md mb-8">
                            Click below to open {getFirstName(fullContact?.name || '')}'s scheduling link
                          </p>
                          
                          <a
                            href={fullContact?.schedulingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-[#2f829b] hover:bg-[#2f829b]/90 text-white rounded-2xl transition-all text-base font-medium shadow-lg hover:shadow-xl"
                          >
                            <Calendar className="w-5 h-5" />
                            Open {getFirstName(fullContact?.name || '')}'s Scheduling Link
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Your Upcoming Availability Widget - For Scheduling My Link Tasks */}
                        {taskType === 'schedule_my_link' && (
                          <div className="rounded-2xl border border-[#2f829b]/20 bg-gradient-to-br from-[#2f829b]/5 to-[#98c1d9]/5 p-5 mb-6">
                            <div className="flex items-center gap-2 mb-4">
                              <Clock className="w-5 h-5 text-[#2f829b]" />
                              <h4 className="font-semibold text-slate-900">Your Upcoming Availability</h4>
                            </div>
                            <div className="space-y-2">
                              {getUpcomingAvailability(4).map((slot, index) => (
                                <div 
                                  key={index}
                                  className="flex items-center justify-between bg-white/80 backdrop-blur-sm px-4 py-3 rounded-xl border border-slate-200/50"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg bg-[#2f829b]/10 flex items-center justify-center">
                                      <Calendar className="w-5 h-5 text-[#2f829b]" />
                                    </div>
                                    <div>
                                      <div className="font-medium text-slate-900">{slot.dayOfWeek}</div>
                                      <div className="text-sm text-slate-600">{slot.dateString}</div>
                                    </div>
                                  </div>
                                  <div className="text-sm font-medium text-slate-700">
                                    {slot.timeRange}
                                  </div>
                                </div>
                              ))}
                            </div>
                            <p className="text-xs text-slate-500 mt-3 text-center">
                              Based on your scheduling preferences (Wed/Thurs, 1-3:30pm ET)
                            </p>
                            <a
                              href={getUserSchedulingLink()}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2 mt-3 text-sm text-[#2f829b] hover:text-[#2f829b]/80 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              View My Scheduling Page
                            </a>
                          </div>
                        )}
                        
                        {/* Prompt Input for Email/Outreach Tasks */}
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Tell Jamie what kind of email to write:
                            </label>
                            <textarea
                              value={userPrompt}
                              onChange={(e) => setUserPrompt(e.target.value)}
                              placeholder="E.g., Professional follow-up about our last conversation, casual check-in, request for meeting..."
                              className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6b2358]/30 resize-none text-sm bg-white min-h-[100px]"
                              autoFocus
                            />
                          </div>
                          
                          <Button
                            onClick={handleGenerateDraft}
                            disabled={isGeneratingDraft || !userPrompt.trim()}
                            size="lg"
                            className="w-full bg-[#6b2358] hover:bg-[#5a1d4a] text-white rounded-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isGeneratingDraft ? (
                              <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                Jamie is writing...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-5 h-5 mr-2" fill="currentColor" />
                                Generate Email Draft
                              </>
                            )}
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-5">
                    {/* Draft Display */}
                    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                      <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                        <h4 className="font-semibold text-slate-900">
                          {isSchedulingTheirLink ? 'Scheduling Link' : 'Your Draft'}
                        </h4>
                        {!isSchedulingTheirLink && (
                          <Button
                            onClick={handleCopyDraft}
                            variant="outline"
                            size="sm"
                            className="rounded-xl"
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copy
                          </Button>
                        )}
                      </div>
                      <div className="p-5">
                        {isSchedulingTheirLink && fullContact?.schedulingUrl ? (
                          <div className="space-y-4">
                            <p className="text-sm text-slate-700">
                              Click the link below to schedule with {fullContact.name}:
                            </p>
                            <a
                              href={fullContact.schedulingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-6 py-3 bg-[#2f829b] hover:bg-[#2f829b]/90 text-white rounded-xl transition-all text-base font-medium shadow-lg hover:shadow-xl"
                            >
                              <Calendar className="w-5 h-5" />
                              Open {fullContact.name}'s Scheduling Link
                              <ExternalLink className="w-4 h-4" />
                            </a>
                            <p className="text-xs text-slate-500 mt-2">
                              {fullContact.schedulingUrl}
                            </p>
                          </div>
                        ) : (
                          <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
                            {generatedDraft}
                          </pre>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {!isSchedulingTheirLink && (
                      <div className="flex gap-3">
                        <Button
                          onClick={handleGenerateDraft}
                          variant="outline"
                          className="flex-1 rounded-xl"
                        >
                          Regenerate
                        </Button>
                        <Button
                          onClick={() => {
                            // Open Gmail with the draft
                            if (fullContact?.email) {
                              // Extract subject from the first line of draft (if it looks like a subject)
                              const lines = generatedDraft.split('\n');
                              const subjectLine = lines.find(l => l.toLowerCase().startsWith('subject:'));
                              const subject = subjectLine ? subjectLine.replace(/^subject:\s*/i, '').trim() : '';
                              
                              // Remove subject line from body if it exists
                              const body = subjectLine 
                                ? generatedDraft.replace(subjectLine, '').trim()
                                : generatedDraft;
                              
                              openGmailCompose(fullContact.email, subject, body);
                              toast.success(`Opening Gmail to ${fullContact.name}`);
                              
                              // Update task status
                              setStatus('awaitingReply');
                            } else {
                              toast.error('Contact email not found');
                            }
                          }}
                          className="flex-1 bg-[#6b2358] hover:bg-[#5a1d4a] text-white rounded-xl"
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Open in Gmail
                        </Button>
                      </div>
                    )}

                    {/* Jamie's Note */}
                    <div className="text-sm text-center text-slate-600 pt-2">
                      <span className="text-[#6b2358] font-medium">Jamie's doing the work:</span> Review, edit, and make it your own.
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
            {/* Title with Flag and Dictation */}
            <div className="pb-6 border-b border-slate-200/50 flex items-start gap-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="flex-1 text-2xl font-serif font-semibold border-0 focus:outline-none px-0 py-2 bg-transparent placeholder:text-slate-300"
                placeholder="Task title..."
                autoFocus
              />
              <button
                onClick={handleToggleDictation}
                className={`flex-shrink-0 mt-2 transition-all hover:scale-110 transform duration-150 p-2 rounded-full ${
                  isListeningForTitle 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'bg-[#6b2358]/10 text-[#6b2358] hover:bg-[#6b2358]/20'
                }`}
                title={isListeningForTitle ? 'Stop dictation' : 'Start dictation'}
              >
                {isListeningForTitle ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={() => setIsFlagged(!isFlagged)}
                className="flex-shrink-0 mt-2 transition-all hover:scale-110 transform duration-150"
              >
                <Star 
                  className={`w-7 h-7 transition-all ${
                    isFlagged 
                      ? 'text-amber-400 fill-amber-400' 
                      : 'text-slate-300 hover:text-slate-400'
                  }`} 
                />
              </button>
            </div>

            {/* Due Date & Contact */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 py-3">
                <Calendar className="w-5 h-5 text-[#c198ad] flex-shrink-0" />
                <span className="text-sm font-medium text-slate-600 w-32">Due Date</span>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="flex-1 px-4 py-3 border border-slate-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#c198ad]/30 text-sm bg-white"
                />
              </div>

              <div className="relative">
                <div className="flex items-center gap-4 py-3">
                  <User className="w-5 h-5 text-[#8ba5a8] flex-shrink-0" />
                  <span className="text-sm font-medium text-slate-600 w-32">Contact</span>
                  <div className="relative flex-1">
                    {selectedContactId && contact ? (
                      <div className="px-4 py-3 bg-[#8ba5a8]/10 border border-[#8ba5a8]/20 rounded-2xl flex items-center justify-between">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            onContactClick?.(selectedContactId);
                          }}
                          className="flex items-center gap-2 hover:underline"
                        >
                          <User className="w-4 h-4 text-[#8ba5a8]" />
                          <span className="text-sm font-medium text-[#8ba5a8]">{contact}</span>
                        </button>
                        {!prefilledContact && (
                          <button
                            onClick={handleClearContact}
                            className="ml-2 p-1 hover:bg-[#8ba5a8]/20 rounded-xl transition-colors"
                          >
                            <X className="w-4 h-4 text-[#8ba5a8]" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <>
                        <input
                          type="text"
                          value={contactSearchQuery}
                          onChange={(e) => setContactSearchQuery(e.target.value)}
                          placeholder="Select contact..."
                          className="w-full px-4 py-3 pr-10 border border-slate-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#8ba5a8]/30 text-sm bg-white"
                          disabled={!!prefilledContact}
                          ref={contactInputRef}
                          onFocus={() => setShowContactDropdown(true)}
                        />
                        <button
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          onClick={() => setShowContactDropdown(!showContactDropdown)}
                          type="button"
                        >
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        </button>
                      </>
                    )}
                    {showContactDropdown && !selectedContactId && filteredContacts.length > 0 && (
                      <div
                        className="absolute z-10 left-0 right-0 top-full mt-2 bg-white/90 backdrop-blur-xl border border-slate-200/50 rounded-2xl shadow-2xl max-h-60 overflow-y-auto"
                        ref={contactDropdownRef}
                      >
                        {filteredContacts.map(c => (
                          <div
                            key={c.id}
                            className="px-4 py-3 cursor-pointer hover:bg-slate-50/80 flex items-center justify-between first:rounded-t-2xl last:rounded-b-2xl transition-colors"
                            onClick={() => handleSelectContact(c)}
                          >
                            <div className="flex items-center gap-3">
                              <User className="w-4 h-4 text-slate-400" />
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-slate-700">{c.name}</span>
                                {(c.email || c.company) && (
                                  <span className="text-xs text-slate-500">
                                    {c.company && c.email ? `${c.company} • ${c.email}` : c.company || c.email}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="pt-2">
              <div className="flex items-center gap-4 py-3">
                <SelectedIcon className="w-5 h-5 flex-shrink-0" style={{ color: selectedStatusOption?.color }} />
                <span className="text-sm font-medium text-slate-600 w-32">Status</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="flex-1 px-4 py-3 border border-slate-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#c198ad]/30 text-sm bg-white"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Task Type */}
            <div className="pt-2">
              <div className="flex items-center gap-4 py-3">
                <Briefcase className="w-5 h-5 flex-shrink-0 text-slate-400" />
                <span className="text-sm font-medium text-slate-600 w-32">Task Type</span>
                <select
                  value={taskType || ''}
                  onChange={(e) => setTaskType((e.target.value || null) as TaskType | null)}
                  onBlur={() => {
                    // Auto-detect if not manually set
                    if (!taskType && title) {
                      const detected = detectTaskType(title);
                      if (detected) setTaskType(detected);
                    }
                  }}
                  className="flex-1 px-4 py-3 border border-slate-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#c198ad]/30 text-sm bg-white"
                >
                  <option value="">None</option>
                  {taskTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Estimated Time */}
            <div className="pt-2">
              <div className="flex items-center gap-4 py-3">
                <Clock className="w-5 h-5 flex-shrink-0 text-slate-400" />
                <span className="text-sm font-medium text-slate-600 w-32">Est. Time</span>
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="number"
                    value={estimatedTime}
                    onChange={(e) => setEstimatedTime(parseInt(e.target.value) || 0)}
                    min="0"
                    step="15"
                    className="w-24 px-4 py-3 border border-slate-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#c198ad]/30 text-sm bg-white"
                  />
                  <span className="text-sm text-slate-500">minutes</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="pt-4">
              <label className="block text-sm font-semibold text-slate-700 mb-3">Notes</label>
              <MentionProvider contacts={contacts}>
                <MentionTextarea
                  value={notes}
                  onChange={(value) => setNotes(value)}
                  rows={6}
                  className="w-full px-4 py-4 border border-slate-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#c198ad]/30 resize-none text-sm bg-white"
                  placeholder="Add any additional notes..."
                />
              </MentionProvider>
            </div>

            {/* Tags & Folder */}
            <div className="pt-4 space-y-4">
              <div className="flex items-start gap-4">
                <Tag className="w-5 h-5 text-[#b8a7c9] flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <span className="text-sm font-medium text-slate-600 block mb-3">Tags</span>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {tags.map((tag, index) => (
                      <Badge key={index} className="bg-[#b8a7c9]/20 text-[#b8a7c9] border-[#b8a7c9]/30 rounded-xl px-3 py-1 flex items-center gap-1">
                        {tag}
                        <button
                          onClick={() => setTags(tags.filter((_, i) => i !== index))}
                          className="ml-1 hover:text-[#b8a7c9]/80"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        const newTag = tagInput.trim().replace(',', '');
                        if (newTag && !tags.includes(newTag)) {
                          setTags([...tags, newTag]);
                          setTagInput('');
                        }
                      }
                    }}
                    placeholder="Type and press Enter to add tags..."
                    className="w-full px-4 py-3 border border-slate-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#b8a7c9]/30 text-sm bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Folder className="w-5 h-5 text-[#9eafa4] flex-shrink-0" />
                <span className="text-sm font-medium text-slate-600 w-32">Folder</span>
                <input
                  type="text"
                  value={folder}
                  onChange={(e) => setFolder(e.target.value)}
                  placeholder="Select folder..."
                  className="flex-1 px-4 py-3 border border-slate-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#9eafa4]/30 text-sm bg-white"
                />
              </div>
            </div>

            {/* Upload PDF */}
            <div className="pt-4">
              <label className="block text-sm font-semibold text-slate-700 mb-3">Attachments</label>
              <button className="w-full px-4 py-4 border-2 border-dashed border-slate-200/50 rounded-2xl hover:border-[#c198ad]/50 hover:bg-slate-50/50 transition-all flex items-center justify-center gap-2 text-sm font-medium text-slate-500 hover:text-[#c198ad]">
                <Upload className="w-4 h-4" />
                Upload PDF
              </button>
            </div>
            
            {/* Scheduling Actions - Appears when task type is scheduling */}
            {showSchedulingActions && (
              <div className="pt-6 mt-6 border-t border-slate-200/50">
                <div className="bg-gradient-to-br from-[#98c1d9]/10 to-[#7fa99b]/10 border border-[#98c1d9]/20 rounded-2xl p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <Calendar className="w-5 h-5 text-[#98c1d9] flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-slate-800 mb-1">Scheduling Actions</h3>
                      <p className="text-sm text-slate-600">
                        {taskType === 'schedule_their_link' 
                          ? 'Open their scheduling link to book time'
                          : 'Generate and send a scheduling email with your link'}
                      </p>
                    </div>
                  </div>

                  {taskType === 'schedule_their_link' && (
                    <Button
                      onClick={handleUseTheirLink}
                      className="w-full bg-[#98c1d9] hover:bg-[#98c1d9]/90 text-white rounded-2xl shadow-soft flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {contactFirstName ? `${contactFirstName}'s Scheduling Link` : 'Open Scheduling Link'}
                    </Button>
                  )}

                  {taskType === 'schedule_my_link' && (
                    <Button
                      onClick={handleSendMyLink}
                      disabled={isGeneratingEmail}
                      className="w-full bg-[#7fa99b] hover:bg-[#7fa99b]/90 text-white rounded-2xl shadow-soft flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {isGeneratingEmail ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4" />
                          Send Scheduling Link
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            )}
            
            {/* Outreach Actions - Appears when task type is outreach */}
            {showOutreachActions && (
              <div className="pt-6 mt-6 border-t border-slate-200/50">
                <div className="bg-gradient-to-br from-[#98c1d9]/10 to-[#7fa99b]/10 border border-[#98c1d9]/20 rounded-2xl p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <Mail className="w-5 h-5 text-[#98c1d9] flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-slate-800 mb-1">Outreach Actions</h3>
                      <p className="text-sm text-slate-600">
                        Draft and send an outreach email with Jamie's help
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={handleDraftOutreachEmail}
                    disabled={isGeneratingEmail}
                    className="w-full bg-[#7fa99b] hover:bg-[#7fa99b]/90 text-white rounded-2xl shadow-soft flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isGeneratingEmail ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Drafting...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        Draft Email
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-200/50 flex items-center justify-between bg-slate-50/50 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            {task && (
              <Button 
                variant="outline" 
                size="sm" 
                className="text-[#6b2358] border-[#6b2358] hover:bg-[#6b2358] hover:text-white rounded-2xl"
                onClick={handleStartMyTask}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Start my task
              </Button>
            )}
            {task && onDelete && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-red-500 hover:text-red-600 hover:bg-red-50/60 rounded-2xl"
                onClick={onDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            )}
            {task && onArchive && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-slate-600 hover:text-slate-700 hover:bg-slate-100/60 rounded-2xl"
                onClick={onArchive}
              >
                <Archive className="w-4 h-4 mr-2" />
                Archive
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              onClick={onClose}
              className="rounded-2xl border-slate-200/50 hover:bg-slate-50/60"
            >
              Cancel
            </Button>
            <Button 
              className="bg-[#6b2358] hover:bg-[#6b2358]/90 text-[rgb(255,255,255)] rounded-2xl shadow-soft"
              onClick={handleSave}
              disabled={!title.trim()}
            >
              {task ? "Save Changes" : "Create Task"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}