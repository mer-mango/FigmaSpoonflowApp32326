/**
 * Meeting Notes Dossier - Unified Component
 * Used in AM Wizard, Post-Mtg Wizard, PM Wizard, and Interactions Tab
 * Includes Prep Notes, During Meeting Notes, and Post-Meeting Notes
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Save, 
  Sparkles, 
  Link as LinkIcon, 
  Loader2, 
  ChevronDown, 
  ChevronRight,
  Plus,
  X,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface MeetingNotesDossierProps {
  // Context: where is this dossier being used?
  context: 'am-wizard' | 'post-wizard' | 'pm-wizard' | 'interactions' | 'timeline';
  
  // Meeting info
  meetingId: string;
  meetingTitle: string;
  meetingDate: string; // Format: "March 2, 2025" or Date object converted to string
  meetingTime?: string; // Format: "2:00 PM - 3:00 PM"
  contact?: {
    id?: string;
    name: string;
    email?: string;
    initials?: string;
    color?: string;
    imageUrl?: string;
  };
  
  // Initial data (can come from InteractionsContext)
  initialData?: MeetingDossierData;
  
  // Callbacks
  onDataChange?: (data: MeetingDossierData) => void; // Auto-save callback
  onSave?: (data: MeetingDossierData) => Promise<void>; // Manual save callback
  onCreateTasks?: (tasks: Array<{
    text: string;
    contactId?: string;
    contactName?: string;
    dueDate: string;
    duration: number;
  }>) => void;
  
  // Existing tasks (already created from action items)
  existingTasks?: Array<{
    id: string;
    text: string;
    contactName?: string;
    dueDate?: string;
  }>;
  onDeleteTask?: (taskId: string) => void;
  onContactClick?: (contact: any) => void; // Callback when contact badge is clicked
  
  // UI Configuration
  hideHeader?: boolean;
  showNextButton?: boolean;
  onNext?: () => void;
}

export interface MeetingDossierData {
  // Prep Notes
  agenda: Array<{ text: string; completed: boolean }>;
  questions: Array<{ text: string; completed: boolean }>;
  thingsToKnow: string;
  nextStepsExpected: string;
  
  // During Meeting Notes
  duringNotes: string;
  
  // Post-Meeting Notes
  fathomUrl: string;
  summary: string;
  transcript: string;
  outcomes: string;
  actionItems: Array<{ text: string }>;
  tasksCreated: boolean;
}

export function MeetingNotesDossier({
  context,
  meetingId,
  meetingTitle,
  meetingDate,
  meetingTime,
  contact,
  initialData,
  onDataChange,
  onSave,
  onCreateTasks,
  existingTasks = [],
  onDeleteTask,
  onContactClick,
  hideHeader = false,
  showNextButton = false,
  onNext,
}: MeetingNotesDossierProps) {
  
  // State
  const [data, setData] = useState<MeetingDossierData>({
    agenda: [],
    questions: [],
    thingsToKnow: '',
    nextStepsExpected: '',
    duringNotes: '',
    fathomUrl: '',
    summary: '',
    transcript: '',
    outcomes: '',
    actionItems: [],
    tasksCreated: false,
    ...initialData,
  });

  const [isFetchingFathom, setIsFetchingFathom] = useState(false);
  const [isExtractingActionItems, setIsExtractingActionItems] = useState(false);
  const [transcriptExpanded, setTranscriptExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [taskDrafts, setTaskDrafts] = useState<Array<{ 
    text: string;
    duration: number;
    dueDate: string;
    contactId?: string;
    contactName?: string;
  }>>([]);
  const [manualActionItemsText, setManualActionItemsText] = useState('');
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  
  // Track which action items are selected for task conversion (all selected by default)
  const [selectedActionItems, setSelectedActionItems] = useState<Set<number>>(new Set());

  // Track previous initialData to detect actual changes
  const prevInitialDataRef = useRef<string>('');
  
  // Initialize selectedActionItems when actionItems change
  useEffect(() => {
    // When action items are added, select all of them by default
    if (data.actionItems.length > 0) {
      setSelectedActionItems(new Set(data.actionItems.map((_, i) => i)));
    }
  }, [data.actionItems.length]);

  // Update data when initialData changes (e.g., when loading existing dossier)
  // We use useEffect with no deps and check inside to avoid running on every render
  useEffect(() => {
    if (initialData) {
      const currentData = JSON.stringify(initialData);
      if (currentData !== prevInitialDataRef.current) {
        console.log('📝 MeetingNotesDossier: initialData changed, updating...', {
          context,
          meetingId,
          hasNewData: !!initialData,
          prepNotes: initialData.thingsToKnow ? 'yes' : 'no',
          agenda: initialData.agenda?.length || 0,
          questions: initialData.questions?.length || 0
        });
        prevInitialDataRef.current = currentData;
        setData(prev => ({
          ...prev,
          ...initialData,
        }));
      }
    }
  }); // No deps - runs every render but only updates when data actually changes

  // Auto-save as user types (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onDataChange) {
        onDataChange(data);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [data, onDataChange]);

  // Manual Save Handler
  const handleManualSave = async (sectionName: string) => {
    setIsSaving(true);
    try {
      if (onSave) {
        await onSave(data);
      }
      toast.success(`${sectionName} saved!`, {
        description: 'Your notes have been saved successfully',
      });
    } catch (error) {
      toast.error('Failed to save', {
        description: 'Please try again',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Fetch from Fathom URL
  const fetchFathomNotes = async () => {
    if (!data.fathomUrl) {
      toast.error('No Fathom URL provided');
      return;
    }

    setIsFetchingFathom(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a89809a8/jamie/extract-from-fathom`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ fathomUrl: data.fathomUrl }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ Fathom fetch failed:', result);
        console.error('❌ Full error response:', JSON.stringify(result, null, 2));
        
        // Show detailed error with instructions
        let errorDescription = result.message || 'Unknown error';
        
        // If there's debug info, show it in console and provide helpful guidance
        if (result.debugInfo) {
          console.log('🔍 Fathom Debug Info:', result.debugInfo);
          console.log('📋 Available webhook IDs:', result.debugInfo.availableIds);
          console.log('🔗 Available share URLs:', result.debugInfo.availableShareUrls);
          
          // Check if there are any webhooks at all
          if (result.debugInfo.totalWebhooks === 0) {
            errorDescription = `No Fathom webhooks have been received yet.\n\n✓ Make sure your webhook is configured in Fathom settings\n✓ Wait 30-60 seconds after the meeting ends\n✓ Then try again, or paste notes manually below`;
          } else {
            errorDescription = `Webhook not found for this meeting.\n\n✓ Extracted ID: ${result.debugInfo.extractedId}\n✓ We have ${result.debugInfo.totalWebhooks} webhook(s) stored\n✓ Try using the Share URL from Fathom instead\n✓ Or paste notes manually below`;
          }
        }
        
        // Show instructions if available
        if (result.instructions && Array.isArray(result.instructions)) {
          errorDescription += '\n\n' + result.instructions.map((instr: string, i: number) => `${i + 1}. ${instr}`).join('\n');
        }
        
        toast.error('Fathom notes not available', {
          description: errorDescription,
          duration: 10000,
        });
        return;
      }

      // Success! Populate fields
      setData(prev => ({
        ...prev,
        summary: result.data.summary || '',
        transcript: result.data.transcript || '',
        actionItems: result.data.actionItems || [],
      }));

      toast.success('Fathom notes loaded!', {
        description: `Found ${result.data.actionItems?.length || 0} action items`,
      });
    } catch (error) {
      console.error('Error fetching Fathom:', error);
      toast.error('Failed to connect to Fathom');
    } finally {
      setIsFetchingFathom(false);
    }
  };

  // Extract Action Items from Summary
  const handleExtractActionItems = async () => {
    if (!data.summary.trim()) {
      toast.error('Please enter a summary first');
      return;
    }

    setIsExtractingActionItems(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a89809a8/jamie/extract-from-text`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ transcript: data.summary }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ Jamie extract failed:', result);
        toast.error('Failed to extract action items', {
          description: 'You can manually add them below',
        });
        return;
      }

      // Success! Add to action items
      setData(prev => ({
        ...prev,
        actionItems: result.data.actionItems || [],
      }));

      toast.success('Action items extracted!', {
        description: `Found ${result.data.actionItems?.length || 0} items`,
      });
    } catch (error) {
      console.error('Error extracting action items:', error);
      toast.error('Failed to extract action items');
    } finally {
      setIsExtractingActionItems(false);
    }
  };

  // Parse manual action items (one per line)
  const handleParseManualActionItems = () => {
    if (!manualActionItemsText.trim()) {
      toast.error('Please enter action items');
      return;
    }
    
    // Split by newlines and filter empty lines
    const items = manualActionItemsText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(text => ({ text }));
    
    if (items.length === 0) {
      toast.error('No action items found');
      return;
    }
    
    setData(prev => ({
      ...prev,
      actionItems: items
    }));
    
    setManualActionItemsText(''); // Clear the input
    
    toast.success(`Added ${items.length} action item${items.length !== 1 ? 's' : ''}!`, {
      description: 'You can now convert them to tasks',
    });
  };
  
  // Create Tasks from Action Items
  const handleCreateTasks = () => {
    console.log('🔘 Create Tasks button clicked');
    console.log('📋 taskDrafts:', taskDrafts);
    console.log('🔧 onCreateTasks callback exists?', !!onCreateTasks);
    
    if (taskDrafts.length === 0) {
      toast.error('No tasks to create');
      return;
    }

    const tasks = taskDrafts.map(item => ({
      text: item.text,
      contactId: contact?.id,
      contactName: contact?.name,
      dueDate: item.dueDate,
      duration: item.duration,
    }));
    
    console.log('✅ Tasks to create:', tasks);

    if (onCreateTasks) {
      console.log('📞 Calling onCreateTasks callback...');
      onCreateTasks(tasks);
      setData(prev => ({ ...prev, tasksCreated: true }));
      setTaskDrafts([]); // Clear drafts after creating
      
      // Context-aware toast message
      if (context === 'interactions') {
        toast.success('Tasks created!', {
          description: `${tasks.length} task${tasks.length !== 1 ? 's' : ''} created successfully`,
        });
      } else {
        toast.success('Tasks created!', {
          description: `${tasks.length} task${tasks.length !== 1 ? 's' : ''} created successfully`,
        });
      }
    } else {
      console.error('❌ onCreateTasks callback not provided!');
      toast.error('Cannot create tasks', {
        description: 'Please try again or contact support',
      });
    }
  };
  
  // Convert action items to editable task drafts
  const handleTurnIntoTasks = () => {
    if (data.actionItems.length === 0) {
      toast.error('No action items to convert');
      return;
    }
    
    // Only convert selected action items
    const selectedItems = data.actionItems.filter((_, index) => selectedActionItems.has(index));
    
    if (selectedItems.length === 0) {
      toast.error('Please select at least one action item');
      return;
    }
    
    // Calculate tomorrow as default due date
    const meetingDateObj = new Date(meetingDate);
    const tomorrow = new Date(meetingDateObj);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD
    
    setTaskDrafts(selectedItems.map(item => ({ 
      text: item.text,
      duration: 15, // Default 15 minutes
      dueDate: tomorrowStr,
      contactId: contact?.id,
      contactName: contact?.name,
    })));
    toast.success(`${selectedItems.length} action item${selectedItems.length !== 1 ? 's' : ''} converted!`, {
      description: 'Review and edit tasks before creating',
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      {!hideHeader && (
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-serif text-3xl text-slate-800 mb-1">{meetingTitle}</h2>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <span>{meetingDate}</span>
              {meetingTime && <span>{meetingTime}</span>}
              {contact?.name && (
                <>
                  <span>•</span>
                  <button
                    onClick={() => onContactClick?.(contact)}
                    className="group/badge flex items-center gap-2 hover:bg-slate-100 rounded-lg px-2 py-1 -ml-2 transition-colors"
                  >
                    <Avatar className="w-5 h-5">
                      {contact.imageUrl ? (
                        <img src={contact.imageUrl} alt={contact.name} className="w-full h-full object-cover" />
                      ) : (
                        <AvatarFallback 
                          className="text-[10px] font-medium"
                          style={{ 
                            backgroundColor: contact.color || '#6b7b98',
                            color: 'white'
                          }}
                        >
                          {contact.initials || contact.name?.slice(0, 2).toUpperCase() || '?'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <span className="text-slate-700 group-hover/badge:text-[#6b2358] transition-colors font-medium">
                      {contact.name}
                    </span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PREP NOTES SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-2xl text-slate-800">Prep Notes</h3>
          <button
            onClick={() => handleManualSave('Prep Notes')}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>

        {/* Agenda */}
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Agenda
          </label>
          <div className="space-y-2 mb-3">
            {data.agenda.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <button
                  onClick={() => {
                    const newAgenda = [...data.agenda];
                    newAgenda[index].completed = !newAgenda[index].completed;
                    setData(prev => ({ ...prev, agenda: newAgenda }));
                  }}
                  className="flex-shrink-0 mt-1"
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    item.completed ? 'bg-[#6b2358] border-[#6b2358]' : 'border-slate-300'
                  }`}>
                    {item.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                </button>
                <input
                  type="text"
                  value={item.text}
                  onChange={(e) => {
                    const newAgenda = [...data.agenda];
                    newAgenda[index].text = e.target.value;
                    setData(prev => ({ ...prev, agenda: newAgenda }));
                  }}
                  className={`flex-1 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:border-[#6b2358] focus:outline-none ${
                    item.completed ? 'line-through text-slate-400' : 'text-slate-700'
                  }`}
                  placeholder="Agenda item..."
                />
                <button
                  onClick={() => {
                    setData(prev => ({
                      ...prev,
                      agenda: prev.agenda.filter((_, i) => i !== index)
                    }));
                  }}
                  className="text-slate-400 hover:text-red-500 transition-colors mt-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              setData(prev => ({
                ...prev,
                agenda: [...prev.agenda, { text: '', completed: false }]
              }));
            }}
            className="w-full px-4 py-2 border-2 border-dashed border-slate-300 hover:border-[#6b2358] text-slate-600 hover:text-[#6b2358] rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add agenda item
          </button>
        </div>

        {/* Questions */}
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Questions
          </label>
          <div className="space-y-2 mb-3">
            {data.questions.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <button
                  onClick={() => {
                    const newQuestions = [...data.questions];
                    newQuestions[index].completed = !newQuestions[index].completed;
                    setData(prev => ({ ...prev, questions: newQuestions }));
                  }}
                  className="flex-shrink-0 mt-1"
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    item.completed ? 'bg-[#6b2358] border-[#6b2358]' : 'border-slate-300'
                  }`}>
                    {item.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                </button>
                <input
                  type="text"
                  value={item.text}
                  onChange={(e) => {
                    const newQuestions = [...data.questions];
                    newQuestions[index].text = e.target.value;
                    setData(prev => ({ ...prev, questions: newQuestions }));
                  }}
                  className={`flex-1 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:border-[#6b2358] focus:outline-none ${
                    item.completed ? 'line-through text-slate-400' : 'text-slate-700'
                  }`}
                  placeholder="Question to ask..."
                />
                <button
                  onClick={() => {
                    setData(prev => ({
                      ...prev,
                      questions: prev.questions.filter((_, i) => i !== index)
                    }));
                  }}
                  className="text-slate-400 hover:text-red-500 transition-colors mt-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              setData(prev => ({
                ...prev,
                questions: [...prev.questions, { text: '', completed: false }]
              }));
            }}
            className="w-full px-4 py-2 border-2 border-dashed border-slate-300 hover:border-[#6b2358] text-slate-600 hover:text-[#6b2358] rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add question
          </button>
        </div>
      </div>

      {/* DURING MEETING NOTES SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-2xl text-slate-800">During Meeting Notes</h3>
          <button
            onClick={() => handleManualSave('During Meeting Notes')}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <textarea
            value={data.duringNotes}
            onChange={(e) => setData(prev => ({ ...prev, duringNotes: e.target.value }))}
            placeholder="Take notes during the meeting..."
            rows={8}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-[#6b2358] focus:outline-none transition-all resize-none"
          />
        </div>
      </div>

      {/* POST-MEETING NOTES SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-2xl text-slate-800">Post-Meeting Notes</h3>
          <button
            onClick={() => handleManualSave('Post-Meeting Notes')}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>

        {/* Fathom URL */}
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Fathom URL (Optional)
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={data.fathomUrl}
              onChange={(e) => setData(prev => ({ ...prev, fathomUrl: e.target.value }))}
              placeholder="https://app.fathom.video/call/... or https://fathom.video/share/..."
              className="flex-1 px-4 py-3 rounded-lg border border-slate-200 focus:border-[#6b2358] focus:outline-none transition-all text-sm"
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Store the Fathom recording link for future reference
          </p>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Summary
          </label>
          <textarea
            value={data.summary}
            onChange={(e) => setData(prev => ({ ...prev, summary: e.target.value }))}
            placeholder="Brief meeting summary..."
            rows={6}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-[#6b2358] focus:outline-none transition-all resize-none"
          />
        </div>

        {/* Full Transcript (Collapsible) */}
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <button
            onClick={() => setTranscriptExpanded(!transcriptExpanded)}
            className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-[#6b2358] transition-colors w-full mb-2"
          >
            {transcriptExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            Full Transcript (Optional)
          </button>
          {transcriptExpanded && (
            <textarea
              value={data.transcript}
              onChange={(e) => setData(prev => ({ ...prev, transcript: e.target.value }))}
              placeholder="Paste full transcript here if available..."
              rows={10}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-[#6b2358] focus:outline-none transition-all resize-none text-sm"
            />
          )}
        </div>

        {/* Action Items */}
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Action Items
          </label>
          
          {/* Show action items if any exist */}
          {data.actionItems.length > 0 && (
            <div className="space-y-2 mb-4">
              {data.actionItems.map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  {/* Checkbox for selecting */}
                  <input
                    type="checkbox"
                    checked={selectedActionItems.has(index)}
                    onChange={(e) => {
                      const newSelected = new Set(selectedActionItems);
                      if (e.target.checked) {
                        newSelected.add(index);
                      } else {
                        newSelected.delete(index);
                      }
                      setSelectedActionItems(newSelected);
                    }}
                    className="mt-1 w-4 h-4 rounded border-slate-300 text-[#6b2358] focus:ring-[#6b2358] cursor-pointer"
                  />
                  <div className="w-6 h-6 rounded-full bg-[#6b2358]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-[#6b2358]">{index + 1}</span>
                  </div>
                  <div className="flex-1 text-sm text-slate-700">
                    {item.text}
                  </div>
                  {/* Delete button */}
                  <button
                    onClick={() => {
                      setData(prev => ({
                        ...prev,
                        actionItems: prev.actionItems.filter((_, i) => i !== index)
                      }));
                      // Also remove from selected if it was selected
                      const newSelected = new Set(selectedActionItems);
                      newSelected.delete(index);
                      setSelectedActionItems(newSelected);
                    }}
                    className="text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                    title="Delete action item"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Manual action items input - always available */}
          <div className="space-y-2 mb-4">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              {data.actionItems.length > 0 ? 'Or add more action items (one per line):' : 'Paste action items from Fathom (one per line):'}
            </label>
            <textarea
              value={manualActionItemsText}
              onChange={(e) => setManualActionItemsText(e.target.value)}
              placeholder="- Send follow-up email&#10;- Schedule next meeting&#10;- Review proposal"
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-[#6b2358] focus:outline-none transition-all resize-none text-sm"
            />
            <button
              onClick={handleParseManualActionItems}
              disabled={!manualActionItemsText.trim()}
              className="w-full px-4 py-2 bg-gradient-to-r from-[#6b2358] to-[#8b3068] text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Action Items
            </button>
          </div>

          {/* Generate Task Draft Button */}
          {data.actionItems.length > 0 && taskDrafts.length === 0 && (
            <button
              onClick={handleTurnIntoTasks}
              className="w-full px-6 py-3 bg-gradient-to-r from-[#6b2358] to-[#8b3068] text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Generate Task Drafts ({selectedActionItems.size} selected)
            </button>
          )}
        </div>

        {/* Editable Task Drafts (Review Before Creating) */}
        {taskDrafts.length > 0 && (
          <div className="bg-white rounded-xl p-5 border border-slate-200">
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Review Tasks
              <span className="text-xs text-slate-500 ml-2">Edit details before creating</span>
            </label>
            <div className="space-y-3 mb-4">
              {taskDrafts.map((task, index) => (
                <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  {/* Task Description */}
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-slate-600 mb-1">Task</label>
                    <input
                      type="text"
                      value={task.text}
                      onChange={(e) => {
                        const newTasks = [...taskDrafts];
                        newTasks[index].text = e.target.value;
                        setTaskDrafts(newTasks);
                      }}
                      className="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 focus:border-[#6b2358] focus:outline-none text-slate-700"
                      placeholder="Task description..."
                    />
                  </div>
                  
                  {/* Duration and Due Date Row */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Duration (mins)</label>
                      <input
                        type="number"
                        value={task.duration}
                        onChange={(e) => {
                          const newTasks = [...taskDrafts];
                          newTasks[index].duration = parseInt(e.target.value) || 15;
                          setTaskDrafts(newTasks);
                        }}
                        min="5"
                        step="5"
                        className="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 focus:border-[#6b2358] focus:outline-none text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Due Date</label>
                      <input
                        type="date"
                        value={task.dueDate}
                        onChange={(e) => {
                          const newTasks = [...taskDrafts];
                          newTasks[index].dueDate = e.target.value;
                          setTaskDrafts(newTasks);
                        }}
                        className="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 focus:border-[#6b2358] focus:outline-none text-slate-700"
                      />
                    </div>
                  </div>
                  
                  {/* Contact Badge */}
                  {task.contactName && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <div className="w-5 h-5 rounded-full bg-[#6b2358]/10 flex items-center justify-center">
                          <span className="text-[10px] font-medium text-[#6b2358]">
                            {task.contactName.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <span>{task.contactName}</span>
                      </div>
                      <button
                        onClick={() => {
                          setTaskDrafts(prev => prev.filter((_, i) => i !== index));
                        }}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {!task.contactName && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          setTaskDrafts(prev => prev.filter((_, i) => i !== index));
                        }}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                // Calculate tomorrow as default due date
                const meetingDateObj = new Date(meetingDate);
                const tomorrow = new Date(meetingDateObj);
                tomorrow.setDate(tomorrow.getDate() + 1);
                const tomorrowStr = tomorrow.toISOString().split('T')[0];
                
                setTaskDrafts(prev => [...prev, { 
                  text: '', 
                  duration: 15,
                  dueDate: tomorrowStr,
                  contactId: contact?.id,
                  contactName: contact?.name,
                }]);
              }}
              className="w-full px-4 py-2 border-2 border-dashed border-slate-300 hover:border-[#6b2358] text-slate-600 hover:text-[#6b2358] rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 mb-4"
            >
              <Plus className="w-4 h-4" />
              Add another task
            </button>
            
            <button
              onClick={handleCreateTasks}
              className="w-full px-6 py-3 bg-gradient-to-r from-[#6b2358] to-[#8b3068] text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              Turn Into {taskDrafts.length} Task{taskDrafts.length !== 1 ? 's' : ''}
            </button>
          </div>
        )}

        {/* Tasks (Already Created) */}
        {existingTasks.length > 0 && (
          <div className="bg-white rounded-xl p-5 border border-slate-200">
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Tasks
            </label>
            <div className="space-y-2">
              {existingTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <div className="text-sm text-slate-700">{task.text}</div>
                    {task.contactName && (
                      <div className="text-xs text-slate-500 mt-1">
                        {task.contactName} • {task.dueDate}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => onDeleteTask?.(task.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Next Button (Only in Wizards) */}
      {showNextButton && onNext && (
        <div className="flex justify-end pt-4">
          <button
            onClick={onNext}
            className="px-8 py-3 bg-gradient-to-r from-[#6b2358] to-[#8b3068] text-white rounded-xl font-medium hover:shadow-lg transition-all"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}