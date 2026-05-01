import React, { useState, useEffect, useRef } from "react";
import { X, Upload, User, FileText, Archive, Maximize2, Minimize2, Star, Plus, Repeat, CheckSquare, List, LayoutGrid, Users, Clock, CreditCard, MapPin, DollarSign, Package, Linkedin, ExternalLink, Heart, Save, Bold, Italic, Underline, ListOrdered, Link as LinkIcon, Image as ImageIcon, Undo, Redo, Calendar, Shrink } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Contact } from "./ContactsPage";
import { mutedRainbow } from "../lib/colors";
import { TaskCardDesignOptions } from "./TaskCardDesignOptions";
import { useInteractions } from "../contexts/InteractionsContext";
import { useNotifications } from "../contexts/NotificationContext";
import { MeetingDossier } from "../types/interactions";
import { MeetingNotesDossier, MeetingDossierData } from "./MeetingNotesDossier";
import type { Service } from "../App";
import { toast } from "sonner";

// Helper to parse date strings in local timezone
const formatTaskDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day); // month is 0-indexed
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

interface ContactProfileModalProps {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (contact: Contact) => void;
  onUpdateContact?: (contact: Contact) => void; // Update without closing modal
  onArchive?: () => void;
  isNew?: boolean;
  onOpenTaskModal?: (contactName: string) => void;
  onOpenMeetingModal?: (contactName: string) => void;
  onOpenEmailLogModal?: (contactName: string) => void;
  onOpenNurtureLogModal?: (contactName: string) => void;
  onOpenFlowWizard?: (contactId: string, contactName: string) => void;
  tasks?: any[];
  onTaskClick?: (task: any) => void;
  calendarEvents?: any[]; // Calendar events to auto-sync next call
  services?: Service[];
  onCaptureMeetingNotes?: (meeting: any) => void;
  onCreateTask?: (task: any) => void; // Create task from action items
  defaultTab?: "info" | "activity" | "notes" | "action-items" | "nurture"; // Default tab to show
}

const availableColors = [
  mutedRainbow.dustyBlue,
  mutedRainbow.sage,
  mutedRainbow.mauve,
  mutedRainbow.tan,
  mutedRainbow.rose,
  mutedRainbow.peach,
  mutedRainbow.lavender,
  mutedRainbow.forestGreen,
  mutedRainbow.oceanBlue,
  mutedRainbow.berry,
];

const DEFAULT_FROM_OPTIONS = [
  "LI",
  "CBC",
  "Common Grounds",
  "BiteLabs",
  "HTN",
  "HRC",
  "Referral",
  "DiMe",
  "PFMD",
  "ISPEP",
  "CPP",
  "Other"
];

export function ContactProfileModal({
  contact,
  isOpen,
  onClose,
  onSave,
  onUpdateContact,
  onArchive,
  isNew = false,
  onOpenTaskModal,
  onOpenMeetingModal,
  onOpenEmailLogModal,
  onOpenNurtureLogModal,
  onOpenFlowWizard,
  tasks,
  onTaskClick,
  calendarEvents = [],
  services = [],
  onCaptureMeetingNotes,
  onCreateTask,
  defaultTab = "info"
}: ContactProfileModalProps) {
  const [activeTab, setActiveTab] = useState<"info" | "activity" | "notes" | "action-items" | "nurture">(defaultTab);
  const [selectedDesign, setSelectedDesign] = useState<1 | 2 | 3 | 4 | 5>(2); // Locked to Design 2
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);
  
  // Rich text notes for the Notes tab
  const [notesRichText, setNotesRichText] = useState<string>('');
  const [isNoteSaving, setIsNoteSaving] = useState(false);
  
  // Filter states for Tasks tab
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['toDo', 'inProgress', 'awaitingReply', 'done']);
  const [selectedDueDateFilter, setSelectedDueDateFilter] = useState<string[]>(['all']);
  const [selectedCreatedDateFilter, setSelectedCreatedDateFilter] = useState<string[]>(['all']);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [showDueDateFilter, setShowDueDateFilter] = useState(false);
  const [showCreatedDateFilter, setShowCreatedDateFilter] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Contact> & {
    title?: string;
    location?: string;
    linkedinUrl?: string;
    companyWebsite?: string;
    schedulingUrl?: string;
    nextMeeting?: string;
    about?: string;
    nurture?: string;
    summary?: string;
    imageUrl?: string;
    from?: string;
    priority?: boolean;
    // Address fields
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    // Nurture fields
    nurtureFrequency?: 2 | 4 | 6 | 8 | 10 | 12;
    nurtureStartDate?: string;
  }>({
    name: "",
    email: "",
    company: "",
    role: "",
    notes: "",
    tags: [],
    color: mutedRainbow.dustyBlue,
    title: "",
    location: "Network",
    linkedinUrl: "",
    companyWebsite: "",
    schedulingUrl: "",
    nextMeeting: "",
    about: "",
    nurture: "",
    summary: "",
    imageUrl: "",
    from: "",
    priority: false,
    ...contact,
  });

  const [imagePreview, setImagePreview] = useState<string>(contact?.imageUrl || "");
  const [isMaximized, setIsMaximized] = useState(false);
  const [isPiP, setIsPiP] = useState(false); // NEW: Picture-in-Picture mode
  const [pipPosition, setPipPosition] = useState({ x: window.innerWidth - 420, y: 20 }); // Bottom right corner
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const pipRef = useRef<HTMLDivElement>(null);
  const [fromOptions, setFromOptions] = useState<string[]>(DEFAULT_FROM_OPTIONS);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [newFromOption, setNewFromOption] = useState("");
  const [actionItemsView, setActionItemsView] = useState<"list" | "kanban">("list");
  const [selectedMeetingDossier, setSelectedMeetingDossier] = useState<MeetingDossier | null>(null);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);

  // Get interactions data from context
  const { dossiers, getDossiersByContactId, getTasksByContactId, getDossierById, updateDossier, deleteDossier, createDossier } = useInteractions();
  
  // Get notification helpers
  const { notifyStatusChange } = useNotifications();
  
  // Sync selectedMeetingDossier with the latest dossier data from context
  // This ensures the modal shows the latest data when the dossier is updated elsewhere
  useEffect(() => {
    if (selectedMeetingDossier && isDossierModalOpen) {
      const latestDossier = dossiers.find(d => d.id === selectedMeetingDossier.id);
      if (latestDossier && JSON.stringify(latestDossier) !== JSON.stringify(selectedMeetingDossier)) {
        setSelectedMeetingDossier(latestDossier);
      }
    }
  }, [dossiers, isDossierModalOpen, selectedMeetingDossier]);

  // Convert meeting dossiers to activities format
  const contactDossiers = contact?.id ? getDossiersByContactId(contact.id) : [];
  const dossierActivities = contactDossiers.map((dossier: MeetingDossier) => ({
    id: dossier.id,
    type: 'meeting' as const,
    title: dossier.meetingTitle,
    date: dossier.meetingDate, // Just the date for sorting/display
    time: dossier.meetingTime && dossier.meetingEndTime 
      ? `${dossier.meetingTime} - ${dossier.meetingEndTime}`
      : dossier.meetingTime,
    prepNotes: dossier.prepNotes?.thingsToKnow,
    postNotes: dossier.postMeetingNotes ? {
      discussed: dossier.postMeetingNotes.summary || '',
      outcomes: dossier.postMeetingNotes.outcomes || '',
      actionItems: dossier.postMeetingNotes.actionItems || []
    } : undefined,
    fathomLink: dossier.postMeetingNotes?.fathomUrl
  }));

  // Only show dossiers as activities - calendar events are just the source data
  // The dossier IS the interaction with all the prep/post notes
  const activities = [...dossierActivities].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });

  // Get contact-specific tasks from InteractionsContext and map to expected format
  const interactionTasks = contact?.id ? getTasksByContactId(contact.id) : [];
  const mappedInteractionTasks = interactionTasks.map(task => ({
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status === 'todo' ? 'toDo' : 
            task.status === 'in-progress' ? 'inProgress' : 'done',
    priority: task.flagged ? 'high' : undefined,
    dueDate: task.dueDate,
    contact: { name: contact?.name || task.contactName || '', id: contact?.id || task.contactId },
    contact_id: contact?.id || task.contactId,
    tags: task.tags || [],
    createdAt: task.createdAt,
    archived: false
  }));

  const nextNurtureDate = "Monday, Dec 9, 2024";
  const nurtureStatus = "on-track" as const;

  // Helper function to find next upcoming calendar event for this contact
  const findNextCalendarEvent = (contactId?: string, contactEmail?: string) => {
    if ((!contactId && !contactEmail) || !calendarEvents.length) return null;
    
    const now = new Date();
    const upcomingEvents = calendarEvents
      .filter(event => {
        // Check if event is in the future
        if (new Date(event.startTime) <= now) return false;
        
        // PRIORITY 1: Check if event was manually assigned to this contact (via contactDetails.id)
        if (contactId && event.contactDetails?.id === contactId) {
          return true;
        }
        
        // PRIORITY 2: Check if contact's email is in the event (as contact or attendee)
        if (contactEmail) {
          const hasContactEmail = 
            event.contact?.email?.toLowerCase() === contactEmail.toLowerCase() ||
            event.attendees?.some((email: string) => email.toLowerCase() === contactEmail.toLowerCase());
          
          return hasContactEmail;
        }
        
        return false;
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    
    return upcomingEvents[0] || null;
  };

  useEffect(() => {
    if (contact) {
      // Find next calendar event for this contact
      const nextEvent = findNextCalendarEvent(contact.id, contact.email);
      // Store the full ISO string to preserve the correct timezone
      const autoNextCallDate = nextEvent ? (nextEvent.startTime instanceof Date ? nextEvent.startTime.toISOString() : nextEvent.startTime) : "";
      
      setFormData({ 
        ...contact,
        // Always use the auto-synced calendar date - this is the source of truth
        nextMeeting: autoNextCallDate,
      });
      setImagePreview(contact.imageUrl || "");
      setNotesRichText(contact.notes || ""); // Initialize notes rich text
    } else if (isNew) {
      setFormData({
        name: "",
        email: "",
        company: "",
        role: "",
        notes: "",
        tags: [],
        color: mutedRainbow.dustyBlue,
        title: "",
        location: "",
        linkedinUrl: "",
        schedulingUrl: "",
        nextMeeting: "",
        about: "",
        nurture: "",
        summary: "",
        imageUrl: "",
        from: "",
        priority: false,
      });
      setImagePreview("");
      setNotesRichText(""); // Clear notes for new contact
    }
  }, [contact, isNew, calendarEvents]);

  const handleSave = () => {
    if (!formData.name?.trim()) {
      alert("Name is required");
      return;
    }

    const initials = formData.name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    // Map nextMeeting to nextCallDate for API consistency
    const contactDataToSave = {
      ...formData,
      initials,
      id: contact?.id || "",
      nextCallDate: formData.nextMeeting, // Map nextMeeting -> nextCallDate
    };
    
    // Remove nextMeeting field since we're using nextCallDate
    delete (contactDataToSave as any).nextMeeting;

    onSave(contactDataToSave as Contact);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData({ ...formData, imageUrl: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  /* Removed - old PDF upload code
  const handlePDFUpload_OLD = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setIsGenerating(true);
      
      try {
        // Read the PDF file as base64
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            const base64Data = reader.result as string;
            
            console.log('Sending PDF to backend for analysis...');
            
            // Send to backend for processing
            const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a89809a8/generate-linkedin-summary`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${publicAnonKey}`
              },
              body: JSON.stringify({
                pdfBase64: base64Data,
                contactName: formData.name || 'Contact'
              })
            });
            
            console.log('Response status:', response.status);
            
            if (!response.ok) {
              const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
              console.error('Backend error:', errorData);
              throw new Error(errorData.error || errorData.message || 'Failed to generate summary from PDF');
            }
            
            const data = await response.json();
            console.log('Summary generated successfully');
            setFormData({ ...formData, aiSummary: data.summary });
          } catch (error) {
            console.error('Error in PDF processing:', error);
            alert(`Failed to generate summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
          } finally {
            setIsGenerating(false);
          }
        };
        
        reader.onerror = () => {
          console.error('Error reading PDF file');
          alert('Failed to read PDF file. Please try again.');
          setIsGenerating(false);
        };
        
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error uploading PDF:', error);
        alert('Failed to process PDF. Please try again.');
        setIsGenerating(false);
      }
      
      // Reset file input
      e.target.value = '';
    } else {
      alert('Please upload a PDF file.');
    }
  };

  const handleGenerateSummary_OLD = async () => {
    setIsGenerating(true);
    
    try {
      // Check if there's text in the LinkedIn profile input area
      const profileText = linkedinProfileText.trim();
      
      if (!profileText) {
        alert('Please paste LinkedIn profile text in the input area above, or click "Upload PDF" to upload a LinkedIn profile PDF.');
        setIsGenerating(false);
        return;
      }
      
      console.log('📝 Generating summary from text...');
      
      // Call backend to generate summary from text
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a89809a8/generate-linkedin-summary`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            profileText: profileText,
            contactName: formData.name
          })
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Backend error:', errorData);
        throw new Error(errorData.error || 'Failed to generate summary');
      }
      
      const data = await response.json();
      console.log('Summary generated successfully from text');
      setFormData({ ...formData, aiSummary: data.summary });
    } catch (error) {
      console.error('Error generating summary:', error);
      alert(`Failed to generate summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  */

  const removeService = (serviceId: string) => {
    const newServiceIds = formData.serviceIds?.filter(id => id !== serviceId) || [];
    setFormData({ ...formData, serviceIds: newServiceIds });
  };

  // PiP drag handlers
  const handlePiPMouseDown = (e: React.MouseEvent) => {
    if (!isPiP) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - pipPosition.x,
      y: e.clientY - pipPosition.y
    });
  };

  const handlePiPMouseMove = (e: MouseEvent) => {
    if (!isDragging || !isPiP) return;
    setPipPosition({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y
    });
  };

  const handlePiPMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handlePiPMouseMove);
      window.addEventListener('mouseup', handlePiPMouseUp);
      return () => {
        window.removeEventListener('mousemove', handlePiPMouseMove);
        window.removeEventListener('mouseup', handlePiPMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  if (!isOpen) return null;

  return (
    <>
    {/* Backdrop - only show when NOT in PiP mode */}
    {!isPiP && (
      <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
        <div 
          className={`bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
            isMaximized ? 'w-[98vw] h-[98vh]' : 'w-full max-w-6xl h-[90vh]'
          }`}
        >
          {/* Header */}
          <div 
            className="px-8 py-6 border-b border-gray-200 flex items-center justify-between" 
            style={{ backgroundColor: "#8ba5a8" }}
          >
            <div className="flex items-center gap-4">
              <Users className="w-6 h-6 text-white" />
              <h2 className="text-xl font-semibold text-white font-[Lora] text-[30px]">{isNew ? "New Contact" : formData.name}</h2>
            </div>
            <div className="flex items-center gap-2">
              {/* PiP Button */}
              <button
                onClick={() => {
                  setIsPiP(true);
                  setIsMaximized(false);
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Picture-in-Picture mode"
              >
                <Shrink className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={() => setIsMaximized(!isMaximized)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title={isMaximized ? "Restore size" : "Maximize"}
              >
                {isMaximized ? (
                  <Minimize2 className="w-5 h-5 text-white" />
                ) : (
                  <Maximize2 className="w-5 h-5 text-white" />
                )}
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-8 pt-4 border-b border-gray-200 bg-white">
          <button
            onClick={() => setActiveTab("info")}
            className={`px-4 py-3 text-sm font-medium transition-colors relative ${
              activeTab === "info"
                ? "text-gray-900"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Information
            {activeTab === "info" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
            )}
          </button>
          {!isNew && (
            <>
              <button
                onClick={() => setActiveTab("activity")}
                className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === "activity"
                    ? "text-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Interactions
                {activeTab === "activity" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("notes")}
                className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === "notes"
                    ? "text-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Notes
                {activeTab === "notes" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("action-items")}
                className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === "action-items"
                    ? "text-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Tasks
                <Badge className="ml-2 bg-gray-100 text-gray-700">
                  {(tasks || []).filter(task => {
                    if (!task.contact && !task.contact_id) return false;
                    const taskContactName = task.contact?.name?.toLowerCase() || '';
                    const currentContactName = formData.name?.toLowerCase() || '';
                    const matchesContact = taskContactName === currentContactName || task.contact?.id === contact?.id || task.contact_id === contact?.id;
                    // Only count active tasks (not done or archived)
                    const activeStatuses = ['toDo', 'inProgress', 'awaitingReply'];
                    const isActive = activeStatuses.includes(task.status) && !task.archived;
                    return matchesContact && isActive;
                  }).length}
                </Badge>
                {activeTab === "action-items" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("nurture")}
                className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === "nurture"
                    ? "text-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Nurture
                {activeTab === "nurture" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
                )}
              </button>
            </>
          )}
        </div>

        {/* Log Buttons - Only show when Interactions tab is active */}
        {activeTab === "activity" && !isNew && (
          <div className="px-8 pt-4 pb-4 bg-white border-b border-gray-200">
            <div className="flex gap-3">
              <Button 
                className="text-white hover:opacity-90"
                style={{ backgroundColor: "#8ba5a8" }}
                onClick={() => onOpenMeetingModal?.(contact?.name || '')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Log Meeting
              </Button>
              <Button 
                variant="outline"
                onClick={() => onOpenEmailLogModal?.(contact?.name || '')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Log Email
              </Button>
              <Button 
                variant="outline"
                onClick={() => onOpenNurtureLogModal?.(contact?.name || '')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Log Nurture
              </Button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-12 py-6">
          <div className="max-w-4xl mx-auto">
            {activeTab === "info" && (
            <>
            {/* Single Column Layout */}
            <div className="space-y-6">
                {/* Profile Header Card */}
                <div className="bg-gradient-to-br from-[#8ba5a8]/5 to-[#8ba5a8]/10 border border-[#8ba5a8]/20 rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="relative flex-shrink-0">
                      <Avatar className="w-20 h-20 border-4 border-white shadow-lg cursor-pointer" onClick={() => document.getElementById('avatar-upload')?.click()}>
                        {imagePreview ? (
                          <AvatarImage src={imagePreview} alt={formData.name} />
                        ) : null}
                        <AvatarFallback className="text-2xl text-white" style={{ backgroundColor: "#8ba5a8" }}>
                          {getInitials(formData.name)}
                        </AvatarFallback>
                      </Avatar>
                      {/* Priority Star Button */}
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, priority: !formData.priority })}
                        className="absolute -top-1 -right-1 p-1.5 bg-white hover:bg-gray-50 rounded-full shadow-lg transition-colors border border-gray-200"
                        title={formData.priority ? "Remove priority" : "Mark as priority"}
                      >
                        <Star 
                          className={`w-4 h-4 transition-colors ${
                            formData.priority 
                              ? 'fill-yellow-400 text-yellow-400' 
                              : 'text-gray-400'
                          }`} 
                        />
                      </button>
                      {/* Upload Photo Button */}
                      <button
                        type="button"
                        onClick={() => document.getElementById('avatar-upload')?.click()}
                        className="absolute -bottom-1 -right-1 p-1.5 text-white rounded-full shadow-lg transition-opacity hover:opacity-90"
                        style={{ backgroundColor: "#8ba5a8" }}
                        title="Upload photo"
                      >
                        <Upload className="w-3 h-3" />
                      </button>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </div>
                    <div className="flex-1 space-y-3">
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Full Name"
                        className="border-0 bg-white/50 focus:bg-white"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          value={formData.role || ""}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                          placeholder="Role"
                          className="text-sm border-0 bg-white/50 focus:bg-white"
                        />
                        <Input
                          value={formData.company || ""}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          placeholder="Company"
                          className="text-sm border-0 bg-white/50 focus:bg-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {/* Contact Type Dropdown */}
                        <select
                          value={formData.location || "Network"}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          className="text-sm border-0 bg-white/50 hover:bg-white focus:bg-white px-3 py-2 rounded-md transition-colors appearance-none cursor-pointer"
                          style={{
                            backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                            backgroundSize: '20px',
                            backgroundPosition: 'right 0.5rem center',
                            backgroundRepeat: 'no-repeat',
                            paddingRight: '2.5rem'
                          }}
                        >
                          <option value="Prospect">Prospect</option>
                          <option value="Client">Client</option>
                          <option value="Network">Network</option>
                        </select>
                        {/* "From" Dropdown */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowFromDropdown(!showFromDropdown)}
                            className="w-full text-left text-sm border-0 bg-white/50 hover:bg-white focus:bg-white px-3 py-2 rounded-md transition-colors"
                          >
                            {formData.from || "From"}
                          </button>
                          {showFromDropdown && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
                              <div className="p-2 border-b border-gray-700">
                                <p className="text-xs text-gray-300 px-2 py-1">Select an option or create one</p>
                              </div>
                              {fromOptions.map((option) => (
                                <button
                                  key={option}
                                  type="button"
                                  onClick={() => {
                                    setFormData({ ...formData, from: option });
                                    setShowFromDropdown(false);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors flex items-center gap-2"
                                >
                                  <span className="w-1 h-1 rounded-full bg-gray-500" />
                                  {option}
                                </button>
                              ))}
                              <div className="p-2 border-t border-gray-700">
                                <div className="flex gap-2">
                                  <Input
                                    value={newFromOption}
                                    onChange={(e) => setNewFromOption(e.target.value)}
                                    placeholder="Add new option..."
                                    className="flex-1 bg-gray-700 border-gray-600 text-white text-sm"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' && newFromOption.trim()) {
                                        e.preventDefault();
                                        setFromOptions([...fromOptions, newFromOption.trim()]);
                                        setFormData({ ...formData, from: newFromOption.trim() });
                                        setNewFromOption("");
                                        setShowFromDropdown(false);
                                      }
                                    }}
                                  />
                                  <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => {
                                      if (newFromOption.trim()) {
                                        setFromOptions([...fromOptions, newFromOption.trim()]);
                                        setFormData({ ...formData, from: newFromOption.trim() });
                                        setNewFromOption("");
                                        setShowFromDropdown(false);
                                      }
                                    }}
                                    className="text-white text-xs h-8 hover:opacity-90"
                                    style={{ backgroundColor: "#8ba5a8" }}
                                  >
                                    Add
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Next Call Date - Auto-synced from Google Calendar */}
                      <div className="col-span-full">
                        <label className="text-xs font-medium text-gray-500 mb-1 block flex items-center gap-2">
                          Next Call
                          <span className="text-[10px] text-slate-400 font-normal">(auto-synced from calendar)</span>
                        </label>
                        {formData.nextMeeting ? (
                          <div className="space-y-2">
                            <div className="px-3 py-2 rounded-xl bg-[#6484a1]/10 border border-[#6484a1]/20 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-[#6484a1]" />
                                <span className="text-sm font-medium text-slate-800">
                                  {new Date(formData.nextMeeting).toLocaleString('en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    hour12: true
                                  })}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setFormData({ ...formData, nextMeeting: '' })}
                                className="p-1 hover:bg-red-100 rounded transition-colors group"
                                title="Remove next call date"
                              >
                                <X className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-400">
                            No upcoming meetings scheduled
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* About Card - moved above email */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" style={{ color: "#8ba5a8" }} />
                    About
                  </h3>
                  <Textarea
                    rows={3}
                    value={formData.about || ""}
                    onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                    className="w-full rounded-lg resize-none"
                    placeholder="Brief description about this contact..."
                  />
                </div>

                {/* Contact Info Card */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Email</label>
                      <Input
                        type="email"
                        value={formData.email || ""}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">LinkedIn Profile</label>
                      <div className="flex gap-3 items-center">
                        <div className="flex-1 relative">
                          <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0077b5]" />
                          <Input
                            value={formData.linkedinUrl || ""}
                            onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                            placeholder="https://linkedin.com/in/username"
                            className="pl-10"
                          />
                        </div>
                        {formData.linkedinUrl && (
                          <Button
                            type="button"
                            onClick={() => window.open(formData.linkedinUrl, '_blank')}
                            className="bg-[#0077b5] hover:bg-[#006399] text-white flex items-center gap-2 px-6 shadow-md hover:shadow-lg transition-all"
                          >
                            <Linkedin className="w-4 h-4" />
                            View Profile
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Company Website</label>
                      <div className="flex gap-3 items-center">
                        <div className="flex-1 relative">
                          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            value={formData.companyWebsite || ""}
                            onChange={(e) => setFormData({ ...formData, companyWebsite: e.target.value })}
                            placeholder="https://example.com"
                            className="pl-10"
                          />
                        </div>
                        {formData.companyWebsite && (
                          <Button
                            type="button"
                            onClick={() => window.open(formData.companyWebsite, '_blank')}
                            className="bg-gray-600 hover:bg-gray-700 text-white flex items-center gap-2 px-6 shadow-md hover:shadow-lg transition-all"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Visit Site
                          </Button>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Scheduling Link</label>
                      <Input
                        value={formData.schedulingUrl || ""}
                        onChange={(e) => setFormData({ ...formData, schedulingUrl: e.target.value })}
                        placeholder="https://calendly.com/..."
                      />
                    </div>
                  </div>
                </div>

                {/* Mailing Address Card */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5" style={{ color: "#8ba5a8" }} />
                    Mailing Address
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Address Line 1</label>
                      <Input
                        value={formData.addressLine1 || ""}
                        onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                        placeholder="123 Main Street"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Address Line 2</label>
                      <Input
                        value={formData.addressLine2 || ""}
                        onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                        placeholder="Apt, Suite, Building (optional)"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">City</label>
                        <Input
                          value={formData.city || ""}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">State</label>
                        <Input
                          value={formData.state || ""}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          placeholder="State"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">ZIP Code</label>
                        <Input
                          value={formData.zipCode || ""}
                          onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                          placeholder="12345"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Country</label>
                        <Input
                          value={formData.country || ""}
                          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                          placeholder="United States"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Nurture Schedule Card */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5" style={{ color: "#6b2358" }} />
                    Nurture Schedule
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Frequency</label>
                      <select
                        value={formData.nurtureFrequency || ""}
                        onChange={(e) => setFormData({ ...formData, nurtureFrequency: e.target.value ? parseInt(e.target.value) as 2 | 4 | 6 | 8 | 10 | 12 : undefined })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b2358]/30"
                      >
                        <option value="">No nurture schedule</option>
                        <option value="2">Every 2 weeks</option>
                        <option value="4">Every 4 weeks</option>
                        <option value="6">Every 6 weeks</option>
                        <option value="8">Every 8 weeks</option>
                        <option value="10">Every 10 weeks</option>
                        <option value="12">Every 12 weeks</option>
                      </select>
                    </div>
                    {formData.nurtureFrequency && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Start Date</label>
                        <Input
                          type="date"
                          value={formData.nurtureStartDate || ""}
                          onChange={(e) => setFormData({ ...formData, nurtureStartDate: e.target.value })}
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes Card - moved to bottom */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" style={{ color: "#8ba5a8" }} />
                    Notes
                  </h3>
                  <Textarea
                    rows={5}
                    value={formData.notes || ""}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full rounded-lg resize-none"
                    placeholder="Add any additional notes..."
                  />
                </div>
              </div>
            </>
            )}

            {activeTab === "activity" && contact && (() => {
              // Get all meetings for this contact from calendar events
              const contactMeetings = (calendarEvents || [])
                .filter(event => {
                  // Match by contact email or name
                  return event.contact?.email === contact.email || 
                         event.contact?.name === contact.name ||
                         event.title?.toLowerCase().includes(contact.name.toLowerCase());
                })
                .sort((a, b) => {
                  // Sort by date, most recent first
                  const dateA = a.startTime ? new Date(a.startTime).getTime() : 0;
                  const dateB = b.startTime ? new Date(b.startTime).getTime() : 0;
                  return dateB - dateA;
                });

              // Get dossiers for this contact
              const contactDossiers = getDossiersByContactId(contact.id);
              
              // Create a map of meetingId -> dossier for quick lookup
              const dossiersByMeetingId = new Map(
                contactDossiers.map(d => [d.meetingId, d])
              );

              return (
                <div className="space-y-4">
                  {contactMeetings.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>No meetings found with {contact.name}</p>
                      <p className="text-sm mt-2">Meetings will appear here automatically from your calendar</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {contactMeetings.map((meeting) => {
                        const hasDossier = dossiersByMeetingId.has(meeting.id);
                        const dossier = dossiersByMeetingId.get(meeting.id);
                        const meetingDate = meeting.startTime ? new Date(meeting.startTime) : null;
                        const isPast = meetingDate ? meetingDate < new Date() : false;
                        
                        return (
                          <div
                            key={meeting.id}
                            className={`bg-white border-2 rounded-2xl p-5 transition-all cursor-pointer ${
                              hasDossier 
                                ? 'border-[#8ba5a8]/30 hover:border-[#8ba5a8]/60 hover:shadow-md' 
                                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                            }`}
                            onClick={() => {
                              if (hasDossier && dossier) {
                                // Open the existing dossier
                                setSelectedMeetingDossier(dossier);
                                setIsDossierModalOpen(true);
                              } else if (isPast) {
                                // Open post-meeting wizard for past meeting
                                onCaptureMeetingNotes?.({
                                  id: meeting.id,
                                  title: meeting.title || `Meeting with ${contact.name}`,
                                  date: meetingDate?.toLocaleDateString('en-US', { 
                                    month: 'long', 
                                    day: 'numeric', 
                                    year: 'numeric' 
                                  }) || '',
                                  time: meetingDate?.toLocaleTimeString('en-US', { 
                                    hour: 'numeric', 
                                    minute: '2-digit', 
                                    hour12: true 
                                  }) || '',
                                  startTime: meeting.startTime,
                                  endTime: meeting.endTime,
                                  contact: {
                                    id: contact.id,
                                    name: contact.name,
                                    email: contact.email
                                  }
                                });
                                onClose(); // Close contact modal to show wizard
                              } else {
                                // Upcoming meeting without dossier - create one for prep notes
                                // CANONICAL WRITE: Initialize with empty canonical fields
                                const newDossier = createDossier({
                                  meetingId: meeting.id,
                                  meetingTitle: meeting.title || `Meeting with ${contact.name}`,
                                  meetingDate: meetingDate?.toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                  }) || '',
                                  meetingTime: meetingDate?.toLocaleTimeString('en-US', {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    hour12: true
                                  }) || '',
                                  meetingEndTime: meeting.endTime ? new Date(meeting.endTime).toLocaleTimeString('en-US', {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    hour12: true
                                  }) : undefined,
                                  contactId: contact.id,
                                  contactName: contact.name,
                                  prepNotes: {
                                    thingsToKnow: '',
                                    thingsToDiscuss: [],
                                    questionsToAsk: [],
                                    nextSteps: ''
                                  },
                                  // Canonical notes fields
                                  duringMeetingNotes: '',
                                  fathomUrl: '',
                                  summary: '',
                                  transcript: '',
                                  actionItems: [],
                                  postMeetingNotes: {
                                    fathomUrl: '',
                                    summary: '',
                                    thingsDiscussed: [],
                                    outcomes: '',
                                    remainingQuestions: '',
                                    actionItems: []
                                  },
                                  taskIds: []
                                });
                                
                                // Open the new dossier
                                setSelectedMeetingDossier(newDossier);
                                setIsDossierModalOpen(true);
                              }
                            }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="font-semibold text-gray-900">
                                    {meeting.title || `Meeting with ${contact.name}`}
                                  </h4>
                                  {hasDossier && (
                                    <Badge 
                                      variant="secondary" 
                                      className="bg-[#8ba5a8]/10 text-[#8ba5a8] border-[#8ba5a8]/20"
                                    >
                                      <FileText className="w-3 h-3 mr-1" />
                                      Has Notes
                                    </Badge>
                                  )}
                                  {!isPast && (
                                    <Badge 
                                      variant="secondary" 
                                      className="bg-blue-50 text-blue-600 border-blue-200"
                                    >
                                      Upcoming
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <div className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4" />
                                    <span>
                                      {meetingDate?.toLocaleDateString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric',
                                        year: 'numeric'
                                      })}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4" />
                                    <span>
                                      {meetingDate?.toLocaleTimeString('en-US', { 
                                        hour: 'numeric', 
                                        minute: '2-digit', 
                                        hour12: true 
                                      })}
                                    </span>
                                  </div>
                                </div>
                                {hasDossier && dossier?.postMeetingNotes?.summary && (
                                  <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                                    {dossier.postMeetingNotes.summary}
                                  </p>
                                )}
                              </div>
                              <div className="ml-4">
                                {hasDossier ? (
                                  <div className="text-[#8ba5a8] text-sm font-medium">
                                    View Notes →
                                  </div>
                                ) : isPast ? (
                                  <div className="text-gray-500 text-sm font-medium">
                                    Add Notes →
                                  </div>
                                ) : (
                                  <div className="text-gray-400 text-sm">
                                    Future
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}

            {activeTab === "notes" && (
              <div>
                {/* Notes Tab - Rich Text Editor */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <FileText className="w-6 h-6" style={{ color: "#8ba5a8" }} />
                        Notes for {formData.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Freeform notes and observations
                      </p>
                    </div>
                    
                    {/* Save Button - Moved to top */}
                    <button
                      onClick={() => {
                        console.log("📝 Save Notes clicked");
                        console.log("  Current notes:", notesRichText);
                        console.log("  Current formData:", formData);
                        console.log("  onUpdateContact exists?", !!onUpdateContact);
                        
                        setIsNoteSaving(true);
                        try {
                          // Save the notes to the contact without closing modal
                          const updatedContact = { ...formData, notes: notesRichText };
                          console.log("  Updated contact:", updatedContact);
                          setFormData(updatedContact);
                          if (onUpdateContact) {
                            console.log("  Calling onUpdateContact...");
                            onUpdateContact(updatedContact as Contact);
                            setTimeout(() => {
                              setIsNoteSaving(false);
                              console.log("✅ Notes saved successfully!");
                              toast.success("Notes saved successfully", {
                                description: "Your notes have been saved to this contact.",
                              });
                            }, 500);
                          } else {
                            console.log("❌ onUpdateContact is not defined!");
                            setIsNoteSaving(false);
                            toast.error("Failed to save notes", {
                              description: "Unable to save notes. Please try again.",
                            });
                          }
                        } catch (error) {
                          console.error("❌ Error saving notes:", error);
                          setIsNoteSaving(false);
                          toast.error("Failed to save notes", {
                            description: "An error occurred while saving. Please try again.",
                          });
                        }
                      }}
                      disabled={isNoteSaving}
                      className="flex items-center gap-2 px-6 py-2 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                      style={{ backgroundColor: "#8ba5a8" }}
                    >
                      {isNoteSaving ? (
                        <>
                          <Save className="w-4 h-4 animate-pulse" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Save Notes</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Rich Text Editor */}
                  <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                    {/* Formatting Toolbar */}
                    <div className="flex items-center gap-1 p-2 border-b border-slate-200 bg-slate-50">
                      <button className="p-2 hover:bg-slate-100 rounded transition-colors" title="Bold">
                        <Bold className="w-4 h-4 text-slate-600" />
                      </button>
                      <button className="p-2 hover:bg-slate-100 rounded transition-colors" title="Italic">
                        <Italic className="w-4 h-4 text-slate-600" />
                      </button>
                      <button className="p-2 hover:bg-slate-100 rounded transition-colors" title="Underline">
                        <Underline className="w-4 h-4 text-slate-600" />
                      </button>
                      <div className="w-px h-4 bg-slate-300 mx-1"></div>
                      <button className="p-2 hover:bg-slate-100 rounded transition-colors" title="Bullet List">
                        <List className="w-4 h-4 text-slate-600" />
                      </button>
                      <button className="p-2 hover:bg-slate-100 rounded transition-colors" title="Numbered List">
                        <ListOrdered className="w-4 h-4 text-slate-600" />
                      </button>
                      <div className="w-px h-4 bg-slate-300 mx-1"></div>
                      <button className="p-2 hover:bg-slate-100 rounded transition-colors" title="Add Link">
                        <LinkIcon className="w-4 h-4 text-slate-600" />
                      </button>
                      <button className="p-2 hover:bg-slate-100 rounded transition-colors" title="Add Image">
                        <ImageIcon className="w-4 h-4 text-slate-600" />
                      </button>
                      <div className="w-px h-4 bg-slate-300 mx-1"></div>
                      <button className="p-2 hover:bg-slate-100 rounded transition-colors" title="Undo">
                        <Undo className="w-4 h-4 text-slate-600" />
                      </button>
                      <button className="p-2 hover:bg-slate-100 rounded transition-colors" title="Redo">
                        <Redo className="w-4 h-4 text-slate-600" />
                      </button>
                    </div>
                    
                    <textarea
                      value={notesRichText}
                      onChange={(e) => setNotesRichText(e.target.value)}
                      className="w-full min-h-[500px] p-4 text-slate-900 resize-y focus:outline-none focus:ring-2 focus:ring-[#8ba5a8] focus:border-transparent"
                      placeholder="Start writing notes about this contact..."
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "action-items" && (
              <div>
                {/* Header with New Task Button and Filters */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <CheckSquare className="w-6 h-6" style={{ color: "#8ba5a8" }} />
                        All Tasks for {formData.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        All tasks related to this contact
                      </p>
                    </div>
                    <Button 
                      className="text-white hover:opacity-90"
                      style={{ backgroundColor: "#8ba5a8" }}
                      onClick={() => onOpenTaskModal && onOpenTaskModal(formData.name)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      New Task
                    </Button>
                  </div>
                  
                  {/* Filter Dropdowns */}
                  <div className="flex items-center gap-3">
                    {/* Status Filter */}
                    <div className="relative">
                      <button
                        onClick={() => {
                          setShowStatusFilter(!showStatusFilter);
                          setShowDueDateFilter(false);
                          setShowCreatedDateFilter(false);
                        }}
                        className="h-9 px-4 rounded-xl bg-white border border-slate-200/50 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                      >
                        Status
                        <span className="text-xs text-slate-500">
                          ({selectedStatuses.length}/4)
                        </span>
                      </button>
                      
                      {showStatusFilter && (
                        <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200/50 z-50 overflow-hidden">
                          <div className="p-3 space-y-1">
                            {[
                              { value: 'toDo', label: 'To Do', color: '#d6a0a9' },
                              { value: 'inProgress', label: 'In Progress', color: '#e4b9ab' },
                              { value: 'awaitingReply', label: 'Awaiting Reply', color: '#e1d6cb' },
                              { value: 'done', label: 'Done', color: '#c2cfc9' },
                            ].map((status) => (
                              <label
                                key={status.value}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedStatuses.includes(status.value)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedStatuses([...selectedStatuses, status.value]);
                                    } else {
                                      setSelectedStatuses(selectedStatuses.filter(s => s !== status.value));
                                    }
                                  }}
                                  className="w-4 h-4 rounded border-slate-300"
                                />
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: status.color }}
                                  />
                                  <span className="text-sm text-slate-700">{status.label}</span>
                                </div>
                              </label>
                            ))}
                          </div>
                          <div className="border-t border-slate-200/50 p-2 flex items-center justify-between bg-slate-50">
                            <button
                              onClick={() => setSelectedStatuses(['toDo', 'inProgress', 'awaitingReply', 'done'])}
                              className="text-xs text-slate-600 hover:text-slate-900 px-2 py-1"
                            >
                              Select All
                            </button>
                            <button
                              onClick={() => setShowStatusFilter(false)}
                              className="text-xs font-medium text-slate-900 px-3 py-1 rounded-lg hover:bg-white"
                            >
                              Done
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Due Date Filter */}
                    <div className="relative">
                      <button
                        onClick={() => {
                          setShowDueDateFilter(!showDueDateFilter);
                          setShowStatusFilter(false);
                          setShowCreatedDateFilter(false);
                        }}
                        className="h-9 px-4 rounded-xl bg-white border border-slate-200/50 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                      >
                        Due Date
                        {selectedDueDateFilter.length > 0 && !selectedDueDateFilter.includes('all') && (
                          <span className="text-xs text-slate-500">
                            ({selectedDueDateFilter.length})
                          </span>
                        )}
                      </button>
                      
                      {showDueDateFilter && (
                        <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200/50 z-50 overflow-hidden">
                          <div className="p-3 space-y-1">
                            {[
                              { value: 'all', label: 'All' },
                              { value: 'overdue', label: 'Overdue' },
                              { value: 'today', label: 'Due Today' },
                              { value: 'thisWeek', label: 'Due This Week' },
                              { value: 'nextWeek', label: 'Due Next Week' },
                              { value: 'later', label: 'Due Later' },
                              { value: 'noDueDate', label: 'No Due Date' },
                            ].map((option) => (
                              <label
                                key={option.value}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedDueDateFilter.includes(option.value)}
                                  onChange={(e) => {
                                    if (option.value === 'all') {
                                      setSelectedDueDateFilter(e.target.checked ? ['all'] : []);
                                    } else {
                                      let newFilters = selectedDueDateFilter.filter(f => f !== 'all');
                                      if (e.target.checked) {
                                        newFilters = [...newFilters, option.value];
                                      } else {
                                        newFilters = newFilters.filter(f => f !== option.value);
                                      }
                                      setSelectedDueDateFilter(newFilters.length === 0 ? ['all'] : newFilters);
                                    }
                                  }}
                                  className="w-4 h-4 rounded border-slate-300"
                                />
                                <span className="text-sm text-slate-700">{option.label}</span>
                              </label>
                            ))}
                          </div>
                          <div className="border-t border-slate-200/50 p-2 flex items-center justify-end bg-slate-50">
                            <button
                              onClick={() => setShowDueDateFilter(false)}
                              className="text-xs font-medium text-slate-900 px-3 py-1 rounded-lg hover:bg-white"
                            >
                              Done
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Created Date Filter */}
                    <div className="relative">
                      <button
                        onClick={() => {
                          setShowCreatedDateFilter(!showCreatedDateFilter);
                          setShowStatusFilter(false);
                          setShowDueDateFilter(false);
                        }}
                        className="h-9 px-4 rounded-xl bg-white border border-slate-200/50 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                      >
                        Created Date
                        {selectedCreatedDateFilter.length > 0 && !selectedCreatedDateFilter.includes('all') && (
                          <span className="text-xs text-slate-500">
                            ({selectedCreatedDateFilter.length})
                          </span>
                        )}
                      </button>
                      
                      {showCreatedDateFilter && (
                        <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200/50 z-50 overflow-hidden">
                          <div className="p-3 space-y-1">
                            {[
                              { value: 'all', label: 'All' },
                              { value: 'today', label: 'Created Today' },
                              { value: 'yesterday', label: 'Created Yesterday' },
                              { value: 'thisWeek', label: 'Created This Week' },
                              { value: 'lastWeek', label: 'Created Last Week' },
                              { value: 'thisMonth', label: 'Created This Month' },
                              { value: 'older', label: 'Older' },
                            ].map((option) => (
                              <label
                                key={option.value}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedCreatedDateFilter.includes(option.value)}
                                  onChange={(e) => {
                                    if (option.value === 'all') {
                                      setSelectedCreatedDateFilter(e.target.checked ? ['all'] : []);
                                    } else {
                                      let newFilters = selectedCreatedDateFilter.filter(f => f !== 'all');
                                      if (e.target.checked) {
                                        newFilters = [...newFilters, option.value];
                                      } else {
                                        newFilters = newFilters.filter(f => f !== option.value);
                                      }
                                      setSelectedCreatedDateFilter(newFilters.length === 0 ? ['all'] : newFilters);
                                    }
                                  }}
                                  className="w-4 h-4 rounded border-slate-300"
                                />
                                <span className="text-sm text-slate-700">{option.label}</span>
                              </label>
                            ))}
                          </div>
                          <div className="border-t border-slate-200/50 p-2 flex items-center justify-end bg-slate-50">
                            <button
                              onClick={() => setShowCreatedDateFilter(false)}
                              className="text-xs font-medium text-slate-900 px-3 py-1 rounded-lg hover:bg-white"
                            >
                              Done
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Task List */}
                {(() => {
                  // Merge tasks from both props and InteractionsContext
                  const propsContactTasks = (tasks || []).filter(task => {
                    if (!task.contact && !task.contact_id) return false;
                    const taskContactName = task.contact?.name?.toLowerCase() || '';
                    const currentContactName = formData.name?.toLowerCase() || '';
                    const matchesContact = taskContactName === currentContactName || task.contact?.id === contact?.id || task.contact_id === contact?.id;
                    
                    // Show all non-archived tasks (including done)
                    return matchesContact && !task.archived;
                  });
                  
                  // Combine tasks from both sources (de-duplicate by ID)
                  const allContactTasks = [...propsContactTasks];
                  mappedInteractionTasks.forEach(interactionTask => {
                    if (!allContactTasks.find(t => t.id === interactionTask.id)) {
                      allContactTasks.push(interactionTask);
                    }
                  });
                  
                  let filteredContactTasks = allContactTasks;
                  
                  // Apply status filter
                  if (selectedStatuses.length > 0) {
                    filteredContactTasks = filteredContactTasks.filter(task => selectedStatuses.includes(task.status));
                  }
                  
                  // Apply due date filter
                  if (!selectedDueDateFilter.includes('all') && selectedDueDateFilter.length > 0) {
                    filteredContactTasks = filteredContactTasks.filter(task => {
                      if (!task.dueDate && selectedDueDateFilter.includes('noDueDate')) return true;
                      if (!task.dueDate) return false;
                      
                      const dueDate = new Date(task.dueDate);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const tomorrow = new Date(today);
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      const weekEnd = new Date(today);
                      weekEnd.setDate(weekEnd.getDate() + 7);
                      const nextWeekEnd = new Date(today);
                      nextWeekEnd.setDate(nextWeekEnd.getDate() + 14);
                      
                      if (selectedDueDateFilter.includes('overdue') && dueDate < today) return true;
                      if (selectedDueDateFilter.includes('today') && dueDate.toDateString() === today.toDateString()) return true;
                      if (selectedDueDateFilter.includes('thisWeek') && dueDate >= today && dueDate < weekEnd) return true;
                      if (selectedDueDateFilter.includes('nextWeek') && dueDate >= weekEnd && dueDate < nextWeekEnd) return true;
                      if (selectedDueDateFilter.includes('later') && dueDate >= nextWeekEnd) return true;
                      
                      return false;
                    });
                  }
                  
                  // Apply created date filter
                  if (!selectedCreatedDateFilter.includes('all') && selectedCreatedDateFilter.length > 0) {
                    filteredContactTasks = filteredContactTasks.filter(task => {
                      if (!task.createdAt) return false;
                      
                      const createdDate = new Date(task.createdAt);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const yesterday = new Date(today);
                      yesterday.setDate(yesterday.getDate() - 1);
                      const weekStart = new Date(today);
                      weekStart.setDate(weekStart.getDate() - 7);
                      const lastWeekStart = new Date(today);
                      lastWeekStart.setDate(lastWeekStart.getDate() - 14);
                      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                      
                      if (selectedCreatedDateFilter.includes('today') && createdDate.toDateString() === today.toDateString()) return true;
                      if (selectedCreatedDateFilter.includes('yesterday') && createdDate.toDateString() === yesterday.toDateString()) return true;
                      if (selectedCreatedDateFilter.includes('thisWeek') && createdDate >= weekStart && createdDate < today) return true;
                      if (selectedCreatedDateFilter.includes('lastWeek') && createdDate >= lastWeekStart && createdDate < weekStart) return true;
                      if (selectedCreatedDateFilter.includes('thisMonth') && createdDate >= monthStart) return true;
                      if (selectedCreatedDateFilter.includes('older') && createdDate < monthStart) return true;
                      
                      return false;
                    });
                  }
                  
                  if (filteredContactTasks.length === 0) {
                    return (
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
                        <CheckSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">No tasks match your filters</p>
                        <p className="text-sm text-gray-500 mb-4">Try adjusting your filter settings or create a new task</p>
                        <Button 
                          className="text-white hover:opacity-90"
                          style={{ backgroundColor: "#8ba5a8" }}
                          onClick={() => onOpenTaskModal && onOpenTaskModal(formData.name)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          New Task
                        </Button>
                      </div>
                    );
                  }
                  
                  // Status color mapping
                  const statusColors = {
                    toDo: '#d6a0a9',
                    inProgress: '#e4b9ab',
                    awaitingReply: '#e1d6cb',
                    done: '#c2cfc9'
                  };
                  
                  return (
                    <div className="space-y-2">
                      {filteredContactTasks.map(task => (
                        <div
                          key={task.id}
                          onClick={() => onTaskClick && onTaskClick(task)}
                          className="bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-2xl p-4 hover:bg-white/80 transition-all cursor-pointer"
                        >
                          <div className="flex items-start gap-3">
                            {/* Status indicator */}
                            <div 
                              className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                              style={{ backgroundColor: statusColors[task.status as keyof typeof statusColors] || statusColors.toDo }}
                            />
                            
                            {/* Task content */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-slate-900 mb-1">{task.title}</h4>
                              
                              {/* Metadata */}
                              <div className="flex items-center gap-3 text-sm text-slate-600">
                                {task.dueDate && (() => {
                                  // Parse date safely to avoid timezone issues
                                  const dateStr = task.dueDate.split('T')[0];
                                  const [year, month, day] = dateStr.split('-').map(Number);
                                  const date = new Date(year, month - 1, day);
                                  return (
                                    <span className="text-xs">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                  );
                                })()}
                                <span 
                                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                                  style={{ 
                                    backgroundColor: statusColors[task.status as keyof typeof statusColors] || statusColors.toDo,
                                    color: 'white'
                                  }}
                                >
                                  {task.status === 'toDo' ? 'To Do' : 
                                   task.status === 'inProgress' ? 'In Progress' : 
                                   task.status === 'awaitingReply' ? 'Awaiting Reply' : 'Done'}
                                </span>
                              </div>
                            </div>
                            
                            {/* Priority flag */}
                            {task.priority === 'high' && (
                              <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0 mt-1" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}

            {activeTab === "nurture" && (
              <div>
                {/* Header with Create Button */}
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Repeat className="w-6 h-6 text-[#81bcc0]" />
                      Nurture Schedule for {formData.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Manage and schedule nurture activities for this contact
                    </p>
                  </div>
                  <Button 
                    className="bg-[rgb(143,168,144)] hover:bg-[#6aa8ac] text-white"
                    onClick={() => onOpenNurtureLogModal && onOpenNurtureLogModal(formData.name)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Log Nurture
                  </Button>
                </div>

                {/* Empty State */}
                <div className="text-center py-16 bg-gradient-to-br from-[#81bcc0]/5 to-transparent rounded-2xl border-2 border-dashed border-[#81bcc0]/30">
                  <Repeat className="w-16 h-16 text-[#81bcc0]/40 mx-auto mb-4" />
                  <h3 className="font-serif text-xl text-gray-700 mb-2">No nurture activities yet</h3>
                  <p className="text-gray-500 mb-6">Set up a nurture schedule to stay connected with {formData.name}</p>
                  <Button 
                    className="bg-[rgb(143,168,144)] hover:bg-[#6aa8ac] text-white"
                    onClick={() => onOpenNurtureLogModal && onOpenNurtureLogModal(formData.name)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Set Up Nurture
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-200 bg-white flex items-center justify-between">
          {onArchive && !isNew ? (
            <Button
              variant="ghost"
              className="text-gray-600 hover:text-gray-700 hover:bg-gray-100"
              onClick={onArchive}
            >
              <Archive className="w-4 h-4 mr-2" />
              {contact?.archived ? "Unarchive" : "Archive"}
            </Button>
          ) : (
            <div />
          )}
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="rounded-xl text-white hover:opacity-90"
              style={{ backgroundColor: "#8ba4a8" }}
            >
              {isNew ? "Create Contact" : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
    )}

    {/* PiP Mode - Floating draggable window */}
    {isPiP && (
      <div
        ref={pipRef}
        className="fixed z-[100000] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{
          left: `${pipPosition.x}px`,
          top: `${pipPosition.y}px`,
          width: '400px',
          height: '600px',
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
      >
        {/* Draggable Header */}
        <div 
          className="px-4 py-3 border-b border-gray-200 flex items-center justify-between cursor-grab active:cursor-grabbing" 
          style={{ backgroundColor: "#8ba5a8" }}
          onMouseDown={handlePiPMouseDown}
        >
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-white" />
            <h2 className="text-sm font-semibold text-white truncate max-w-[250px]">{formData.name}</h2>
          </div>
          <div className="flex items-center gap-1">
            {/* Restore to full modal */}
            <button
              onClick={() => setIsPiP(false)}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              title="Restore"
            >
              <Maximize2 className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Tabs - Compact version */}
        <div className="flex items-center gap-1 px-3 pt-2 border-b border-gray-200 bg-white overflow-x-auto">
          {!isNew && (
            <>
              <button
                onClick={() => setActiveTab("info")}
                className={`px-3 py-2 text-xs font-medium transition-colors relative whitespace-nowrap ${
                  activeTab === "info"
                    ? "text-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Info
                {activeTab === "info" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("activity")}
                className={`px-3 py-2 text-xs font-medium transition-colors relative whitespace-nowrap ${
                  activeTab === "activity"
                    ? "text-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Meetings
                {activeTab === "activity" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("notes")}
                className={`px-3 py-2 text-xs font-medium transition-colors relative whitespace-nowrap ${
                  activeTab === "notes"
                    ? "text-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Notes
                {activeTab === "notes" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
                )}
              </button>
            </>
          )}
        </div>

        {/* Compact Content - Only show Interactions tab in PiP */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === "info" && (
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-xs text-gray-500 mb-1">Company</div>
                <div className="font-medium">{formData.company || "—"}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Email</div>
                <div className="font-medium">{formData.email || "—"}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Role</div>
                <div className="font-medium">{formData.role || "—"}</div>
              </div>
            </div>
          )}
          
          {activeTab === "activity" && contact && (
            <div className="p-6 text-center text-gray-500">
              <p>Activity tab component temporarily disabled</p>
              <p className="text-sm mt-2">ActivityTabDesigns component was removed during cleanup</p>
            </div>
          )}
          
          {activeTab === "notes" && (
            <div className="prose prose-sm max-w-none">
              <div className="text-xs text-gray-600 whitespace-pre-wrap">
                {formData.notes || "No notes yet"}
              </div>
            </div>
          )}
        </div>
      </div>
    )}

    {/* Meeting Dossier Modal */}
    {isDossierModalOpen && selectedMeetingDossier && (() => {
      console.log('📋 Opening dossier modal with data:', selectedMeetingDossier);
      console.log('📋 PrepNotes:', selectedMeetingDossier.prepNotes);
      return true;
    })() && (
      <div className="fixed inset-0 z-[100001] flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden w-[85vw] h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-slate-200 bg-white">
            <div className="flex items-center gap-4">
              <h2 className="font-serif text-2xl text-slate-800">
                {selectedMeetingDossier.meetingTitle}
              </h2>
            </div>
            <button
              onClick={() => {
                setIsDossierModalOpen(false);
                setSelectedMeetingDossier(null);
              }}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          {/* Dossier Content */}
          <div className="flex-1 overflow-y-auto p-8">
            <MeetingNotesDossier
              context="interactions"
              meetingId={selectedMeetingDossier.meetingId || ''}
              meetingTitle={selectedMeetingDossier.meetingTitle}
              meetingDate={selectedMeetingDossier.meetingDate}
              meetingTime={selectedMeetingDossier.meetingTime && selectedMeetingDossier.meetingEndTime 
                ? `${selectedMeetingDossier.meetingTime} - ${selectedMeetingDossier.meetingEndTime}`
                : selectedMeetingDossier.meetingTime}
              contact={{
                id: selectedMeetingDossier.contactId,
                name: selectedMeetingDossier.contactName,
              }}
              hideHeader={true}
              initialData={{
                // Canonical read path: all notes fields are at top level of dossier
                agenda: selectedMeetingDossier.prepNotes?.thingsToDiscuss || [],
                questions: selectedMeetingDossier.prepNotes?.questionsToAsk || [],
                thingsToKnow: selectedMeetingDossier.prepNotes?.thingsToKnow || '',
                nextStepsExpected: selectedMeetingDossier.prepNotes?.nextSteps || '',
                duringNotes: selectedMeetingDossier.duringMeetingNotes || '',
                fathomUrl: selectedMeetingDossier.fathomUrl || '',
                summary: selectedMeetingDossier.summary || '',
                transcript: selectedMeetingDossier.transcript || '',
                outcomes: selectedMeetingDossier.postMeetingNotes?.outcomes || '',
                actionItems: selectedMeetingDossier.actionItems || [],
                tasksCreated: selectedMeetingDossier.taskIds && selectedMeetingDossier.taskIds.length > 0 || false,
              }}
              onDataChange={(data) => {
                // CANONICAL WRITE PATH: Update persistent context with all notes fields
                console.log('💾 [ContactProfileModal] Auto-saving dossier notes:', {
                  dossierId: selectedMeetingDossier.id,
                  hasPrep: !!(data.agenda?.length || data.questions?.length || data.thingsToKnow),
                  hasDuring: !!data.duringNotes,
                  hasPost: !!(data.summary || data.outcomes),
                });

                updateDossier(selectedMeetingDossier.id, {
                  // Prep notes
                  prepNotes: {
                    thingsToKnow: data.thingsToKnow,
                    thingsToDiscuss: data.agenda,
                    questionsToAsk: data.questions,
                    nextSteps: data.nextStepsExpected,
                  },
                  // Canonical notes fields - persist at top level
                  duringMeetingNotes: data.duringNotes,
                  fathomUrl: data.fathomUrl,
                  summary: data.summary,
                  transcript: data.transcript,
                  actionItems: data.actionItems,
                  // Post-meeting notes
                  postMeetingNotes: {
                    ...selectedMeetingDossier.postMeetingNotes,
                    outcomes: data.outcomes,
                    summary: data.summary, // Also store in postMeetingNotes for backwards compatibility
                    actionItems: data.actionItems, // Also store in postMeetingNotes for backwards compatibility
                  },
                });
              }}
              onCreateTasks={(tasks) => {
                console.log('🎯 onCreateTasks called in ContactProfileModal dossier modal');
                console.log('📋 Tasks to create:', tasks);
                console.log('🔧 onCreateTask prop exists?', !!onCreateTask);
                
                // Create tasks from action items and save to App state
                tasks.forEach(task => {
                  if (onCreateTask) {
                    console.log('✅ Creating task:', task.text);
                    onCreateTask({
                      title: task.text,
                      description: `From meeting: ${selectedMeetingDossier.meetingTitle}`,
                      dueDate: task.dueDate,
                      contact: {
                        id: selectedMeetingDossier.contactId,
                        name: selectedMeetingDossier.contactName,
                      },
                      estimatedTime: task.duration,
                      status: 'toDo',
                    });
                  } else {
                    console.error('❌ onCreateTask prop not provided to ContactProfileModal!');
                  }
                });
                
                // Update dossier with task created status
                updateDossier(selectedMeetingDossier.id, {
                  postMeetingNotes: {
                    ...selectedMeetingDossier.postMeetingNotes,
                  },
                });
                
                toast.success(`Created ${tasks.length} task${tasks.length !== 1 ? 's' : ''}!`, {
                  description: 'View them in the Tasks page',
                });
              }}
            />
          </div>

          {/* Footer with Close Button */}
          <div className="flex items-center justify-end gap-3 px-8 py-4 border-t border-slate-200 bg-white">
            <button
              onClick={() => {
                setIsDossierModalOpen(false);
                setSelectedMeetingDossier(null);
              }}
              className="px-6 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 transition-colors text-slate-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}