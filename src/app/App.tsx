import React, { useState, useEffect, useMemo } from 'react';
import { Toaster, toast } from 'sonner@2.0.3';
import { ErrorBoundary } from './ErrorBoundary';
import { projectId, publicAnonKey } from './utils/supabase/info';
import { getTodayLocal, getTomorrowLocal, dateToLocalString, isoStringToLocalDate } from './utils/dateUtils';
import { brandColors } from './lib/colors';
import { NavOptions } from './components/navigation/NavOptions';
import { NavRefinedOptions } from './components/navigation/NavRefinedOptions';
import { NavColoredVersion } from './components/navigation/NavColoredVersion';
import { TodayPageFilledExample_Muted } from './components/TodayPageFilledExample_Muted';
import { SubwayTimeline } from './components/SubwayTimeline';
import { TasksPage, Task } from './components/TasksPage';
import { ContactsPage, Contact } from './components/ContactsPage';
import { CalendarPage } from './components/CalendarPage';
import { MutedCalendarPage } from './components/muted_CalendarPage';
import { SharedLayout_Muted } from './components/SharedLayout_Muted';
import { PageHeader_Muted } from './components/PageHeader_Muted';
import { MutedTaskModal } from './components/muted_TaskModal';
import { ContactProfileModal } from './components/ContactProfileModal';
import { ContentPlanningWizard } from './components/content/ContentPlanningWizard';
import { StartMyTaskModal } from './components/muted_StartMyTaskModal';
import { MutedVoiceInputModal } from './components/muted_VoiceInputModal';
import { MutedJamieChatPanel, ChatMessage } from './components/muted_JamieChatPanel';
import { TimerPiPView } from './components/muted_TimerPiPView';
import MutedContentPageIntegrated from './components/muted_ContentPage_Integrated';
import { ContentEditorNew } from './components/content/ContentEditor_New_v2';
import { AMWizard } from './components/today/AMWizard';
import { PMWizard } from './components/today/PMWizard';
import { MutedPostMeetingWizard } from './components/muted_PostMeetingWizard';
import { InteractionsProvider } from './contexts/InteractionsContext';
import { NotificationProvider, useNotifications } from './contexts/NotificationContext';
import { GoalsPage, Goal } from './components/GoalsPage';
import { GoalModal } from './components/GoalModal';
import { NotificationSchedulerBridge } from './components/NotificationSchedulerBridge';
import { CalendarDossierSync } from './components/CalendarDossierSync';
import MutedSettingsPage from './components/muted_SettingsPage';
import { NurturesView, NurtureToDo } from './components/muted_NurturesView';
import { generateJamieResponse } from './utils/jamieAI';
import { seedInitialMemories } from './utils/jamieMemory';
import { googleCalendarAutoSync } from './utils/googleCalendarAutoSync';
import ClientHubPage from './components/muted_ClientHubPage';
import { FormEditorPage } from './components/FormEditorPage';
import { FormsApp } from './components/forms/FormsApp';
import { OriginalFormsApp } from './components/forms/OriginalFormsApp';
import { calculateActionRequiredItems } from './utils/actionRequiredHelpers';
import { FathomDiagnostic } from './components/FathomDiagnostic_New';
import { useGoogleCalendarMeetings } from './hooks/useGoogleCalendarMeetings';
import { GmailOAuthLauncher } from './components/GmailOAuthLauncher';
import { GmailOAuthCallback } from './components/GmailOAuthCallback';
import { CalendarOAuthLauncher } from './components/CalendarOAuthLauncher';
import { CalendarOAuthCallback } from './components/CalendarOAuthCallback';
import { LinkedInOAuthLauncher } from './components/LinkedInOAuthLauncher';
import { LinkedInOAuthCallback } from './components/LinkedInOAuthCallback';
import { OutlineModePrototype } from './components/demo/OutlineModePrototype';
import { ContactSuggestionBanner } from './components/ContactSuggestionBanner';
import { ContactSuggestionModal } from './components/ContactSuggestionModal';
import { ContactQueueProgressDialog } from './components/ContactQueueProgressDialog';
import { ContactRecoveryTool } from './components/ContactRecoveryTool';
import { detectMissingContacts } from './utils/contactDataExtraction';
import { 
  addPendingContacts, 
  getTotalPendingCount, 
  getCurrentContact,
  completeCurrentContact,
  snoozeCurrentContact,
  dismissCurrentContact,
  snoozeAllContacts,
  dismissAllContacts,
  startSnoozeWatcher,
  isProcessingQueue,
  startProcessingQueue,
  loadQueueState
} from './utils/contactSuggestionQueue';
import { FathomSyncPrompt } from './components/FathomSyncPrompt';
import { MeetingSelector } from './components/MeetingSelector';
import { getTasksForDay, getContentForDay, getNurturesForDay, getTodayDate } from './utils/dateIndex';
import { syncContactsWithCalendar, findContactForEvent, enrichCalendarEventsWithContacts } from './utils/contactCalendarSync';

// Use example contacts from centralized data
import { exampleContacts } from './data/contacts';

// Legacy field cleanup utility
import { stripLegacyContentFields } from './utils/stripLegacyContentFields';

// 🎯 PHASE 5 PROMPT 11: Schedule blocks and calendar change detection
import { JamieCalendarChangeDialog, TimeBlock, CalendarChange, ScheduleProposal } from './components/JamieCalendarChangeDialog';
import { proposeScheduleBlocks, detectCalendarChanges, generateChangeReason } from './utils/scheduleBlockProposer';

// Supabase utilities for persistence
const SUPABASE_CONTACTS_KEY = 'app_contacts';

// Business Files Type
export interface BusinessFileItem {
  id: string;
  title: string;
  fileType: 'Proposal' | 'Contract' | 'Project Brief' | 'Meeting Agenda' | 'Report' | 'SOW' | 'Case Study' | 'Presentation Outline' | 'Invoice';
  templateFamily: 'Sales' | 'Project Management' | 'Legal' | 'Marketing' | 'Operations' | 'General';
  templateSubtype: string;
  status: 'draft' | 'in_review' | 'approved' | 'final' | 'archived';
  tags: string[];
  contact_ids?: string[];
  dueDate?: string;
  lastUpdated: string;
  createdOn: string;
  wordCount: number;
  content: string;
  outline?: string;
  notes?: string;
  folderId: string;
  pinned: boolean;
  primaryContactId?: string;
  invoiceNumber?: string;
  currency?: string;
  lineItems?: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
  subtotal?: number;
  taxRate?: number;
  taxAmount?: number;
  total?: number;
  paymentStatus?: 'unpaid' | 'paid' | 'partial' | 'cancelled';
  paymentLinkUrl?: string;
  paidAt?: string | null;
  paymentMethod?: 'card' | 'bank_transfer' | 'other' | null;
  signingProvider?: 'docusign' | 'hellosign' | 'dropbox_sign' | 'other';
  signingStatus?: 'not_sent' | 'sent' | 'viewed' | 'signed' | 'void';
  signingUrl?: string | null;
  signedFileUrl?: string | null;
  externalSigningId?: string | null;
  isOnboardingDoc?: boolean;
}

// Service Type
export interface Service {
  id: string;
  name: string;
  description: string;
  price: string;
  duration: string;
  deliverables: string[];
  isActive: boolean;
  linkedForms?: string[]; // IDs of forms that use this service
  // Brochure Fields
  bestFitUseCases?: string[]; // What this service is best for
  engagementFormats?: string[]; // e.g., "Workshop", "1:1 Consulting", "Virtual"
  pricingModel?: string; // e.g., "Fixed Fee", "Per Session", "Custom"
  feeRange?: string; // e.g., "$5,000 - $15,000"
  paymentStructure?: string; // e.g., "50% upfront, 50% on completion"
  testimonials?: Array<{
    id: string;
    quote: string;
    name: string;
    title?: string;
    organization?: string;
  }>;
  // SOW Template Fields (source of truth for SOW generation)
  sowTemplates?: {
    projectDescription?: string;
    scopeOfServices?: string;
    deliverablesAndSuccess?: string;
    timeline?: string;
    rolesResponsibilities?: string;
    communication?: string;
    feesPaymentTerms?: string;
    assumptions?: string;
    inclusionsExclusions?: string;
    risksConstraints?: string;
    ipUsage?: string;
    confidentiality?: string;
  };
}

export function App() {
  console.log('🚀 App component rendering...');
  console.log('📍 Current URL:', window.location.href);
  console.log('📍 Current pathname:', window.location.pathname);
  console.log('📍 Current search:', window.location.search);
  
  // Force a hard refresh if there's a module loading error (browser cache issue)
  useEffect(() => {
    const handleModuleError = (event: ErrorEvent) => {
      if (event.message && event.message.includes('Failed to fetch dynamically imported module')) {
        console.error('🚨 RELOAD TRIGGERED: Module loading error detected');
        console.error('Error details:', event);
        // Clear cache and hard reload
        if ('caches' in window) {
          caches.keys().then(names => {
            names.forEach(name => caches.delete(name));
          });
        }
        // Force hard reload with cache bypass
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    };
    
    window.addEventListener('error', handleModuleError);
    return () => window.removeEventListener('error', handleModuleError);
  }, []);
  
  // Check URL parameters for routing and view options
  const urlParams = new URLSearchParams(window.location.search);
  
  // Store Supabase info in localStorage for calendar sync utility
  useEffect(() => {
    localStorage.setItem('supabaseUrl', `https://${projectId}.supabase.co`);
    localStorage.setItem('supabaseAnonKey', publicAnonKey);
  }, []);
  
  // 🧹 CLEANUP: Remove demo calendar events from cache
  useEffect(() => {
    try {
      const cachedEvents = localStorage.getItem('googleCalendarEvents');
      if (cachedEvents) {
        const parsed = JSON.parse(cachedEvents);
        if (Array.isArray(parsed)) {
          const cleanedEvents = parsed.filter(event => !event?.isDemoData);
          if (cleanedEvents.length < parsed.length) {
            console.log(`🧹 Removed ${parsed.length - cleanedEvents.length} demo calendar event(s) from cache`);
            localStorage.setItem('googleCalendarEvents', JSON.stringify(cleanedEvents));
          }
        }
      }
    } catch (error) {
      console.error('Failed to clean calendar cache:', error);
    }
  }, []);
  
  // ⚠️ ALL HOOKS MUST BE DECLARED BEFORE ANY CONDITIONAL RETURNS (Rules of Hooks)
  // OAuth routing checks moved to AFTER all hooks declarations (see bottom of component)
  
  // State for which page to show - Read from URL or localStorage or default to 'today'
  const [currentPage, setCurrentPage] = useState<string>(() => {
    const pageFromUrl = urlParams.get('page');
    if (pageFromUrl) return pageFromUrl;
    
    // Default to 'today' instead of reading from localStorage
    // This ensures fresh page loads always go to the Today page
    return 'today';
  });
  
  // Navigation history stack for back button
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  
  // Track if user explicitly navigated to full app from content page
  const [showFullApp, setShowFullApp] = useState<boolean>(true);
  
  console.log('🔍 State:', { currentPage, showFullApp, viewParam: urlParams.get('view') });
  
  // ALL STATE HOOKS MUST BE DECLARED BEFORE ANY CONDITIONAL RETURNS (Rules of Hooks)
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contentModalOpen, setContentModalOpen] = useState(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [planDayWizardOpen, setPlanDayWizardOpen] = useState(false);
  const [makeContentWizardOpen, setMakeContentWizardOpen] = useState(false);
  const [windDownWizardOpen, setWindDownWizardOpen] = useState(false);
  const [postMeetingWizardOpen, setPostMeetingWizardOpen] = useState(false);
  const [selectedPostMeetingData, setSelectedPostMeetingData] = useState<any>(null); // Store the actual meeting data
  const [startMyTaskModalOpen, setStartMyTaskModalOpen] = useState(false);
  const [taskForStartModal, setTaskForStartModal] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [prefilledContactForTask, setPrefilledContactForTask] = useState<string | null>(null);
  const [selectedContactForProfile, setSelectedContactForProfile] = useState<Contact | null>(null);
  const [recentlyViewedContactIds, setRecentlyViewedContactIds] = useState<string[]>([]);
  const [jamieChatOpen, setJamieChatOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ type: 'task' | 'contact' | 'event' | 'content'; id: string; title: string } | undefined>(undefined);
  
  // Fathom Sync Prompt state
  const [fathomSyncPromptMeeting, setFathomSyncPromptMeeting] = useState<any | null>(null);
  const [promptedMeetings, setPromptedMeetings] = useState<string[]>([]);
  const [snoozedMeetings, setSnoozedMeetings] = useState<Record<string, number>>({});
  const [meetingSelectorOpen, setMeetingSelectorOpen] = useState(false);
  
  // Focus Widget visibility state
  const [showFocusWidget, setShowFocusWidget] = useState(false);
  
  // Contact Suggestion Flow state
  const [contactSuggestionModalOpen, setContactSuggestionModalOpen] = useState(false);
  const [contactQueueProgressOpen, setContactQueueProgressOpen] = useState(false);
  const [isAddingContactFromQueue, setIsAddingContactFromQueue] = useState(false);
  
  // Track if we've shown proactive suggestions in this Jamie chat session
  const [hasShownProactiveSuggestions, setHasShownProactiveSuggestions] = useState(false);
  
  // Initialize chat messages from localStorage
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('jamieChatMessages');
      return saved ? JSON.parse(saved).map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      })) : [];
    } catch {
      return [];
    }
  });
  
  // Initialize state from localStorage or use defaults
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [tasksLoaded, setTasksLoaded] = useState(false);
  
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [contactsLoaded, setContactsLoaded] = useState(false);
  
  // Manual contact assignments for calendar events (eventId -> contactId)
  const [manualContactAssignments, setManualContactAssignments] = useState<Record<string, string>>({});

  // Goals state
  const [allGoals, setAllGoals] = useState<Goal[]>([]);
  const [goalsLoaded, setGoalsLoaded] = useState(false);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>(undefined);

  // Services state - start empty
  const [allServices, setAllServices] = useState<Service[]>(() => {
    try {
      const saved = localStorage.getItem('allServices');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Business files state
  const [allBusinessFiles, setAllBusinessFiles] = useState<BusinessFileItem[]>(() => {
    try {
      const saved = localStorage.getItem('allBusinessFiles');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Content items state
  const [allContentItems, setAllContentItems] = useState<any[]>([]);
  const [contentLoaded, setContentLoaded] = useState(false);
  
  // Track which content item is being edited (for content-editor page)
  const [editingContentId, setEditingContentId] = useState<string | null>(null);
  
  // Load content items on mount
  useEffect(() => {
    const loadContent = async () => {
      try {
        const saved = localStorage.getItem('allContentItems');
        if (saved) {
          const items = JSON.parse(saved);
          console.log('✅ Loaded content from localStorage:', items.length);
          // Migration: Strip legacy blueprint fields and fix old defaults
          const migrated = items.map((item: any) => {
            const cleanItem = stripLegacyContentFields(item);
            
            // Reset platform to empty if it's a stub/incomplete item with the old default
            if (cleanItem.status === 'Idea' && 
                (!cleanItem.content || cleanItem.content.trim() === '') &&
                (!cleanItem.summary || cleanItem.summary.trim() === '') &&
                cleanItem.platform === 'LI Post') {
              console.log(`🔄 Migrating content item "${cleanItem.title}" - resetting platform from "LI Post" to empty`);
              return { ...cleanItem, platform: '' };
            }
            return cleanItem;
          });
          setAllContentItems(migrated);
        } else {
          // 🔄 Try to restore from backend backup
          console.log('📦 No content in localStorage, checking backend backup...');
          try {
            const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a89809a8/kv/allContentItems_backup`, {
              headers: {
                'Authorization': `Bearer ${publicAnonKey}`
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              if (data.value && Array.isArray(data.value) && data.value.length > 0) {
                console.log('✅ Restored content from backend backup:', data.value.length);
                // Strip legacy blueprint fields from backup data
                const cleanedBackup = data.value.map(stripLegacyContentFields);
                setAllContentItems(cleanedBackup);
                // Re-save to localStorage
                localStorage.setItem('allContentItems', JSON.stringify(cleanedBackup));
                return;
              }
            }
          } catch (backupError) {
            console.log('No backend backup found for content');
          }
          
          console.log('📝 No content found, starting fresh');
          setAllContentItems([]);
        }
      } catch (error) {
        console.error('Failed to load content:', error);
        setAllContentItems([]);
      } finally {
        setContentLoaded(true);
      }
    };
    
    loadContent();
  }, []);

  // Nurtures state
  const [allNurtureToDos, setAllNurtureToDos] = useState<NurtureToDo[]>(() => {
    try {
      const saved = localStorage.getItem('allNurtureToDos');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Google Calendar meetings integration
  const { 
    events: calendarEvents,
    status: calendarSyncStatus,
    connect: connectCalendar,
    disconnect: disconnectCalendar,
    manualSync: manualSyncCalendar,
    reloadCache: reloadCalendarCache
  } = useGoogleCalendarMeetings();

  // State for upcoming meetings with prep notes (shared between PM and AM wizards)
  const [upcomingMeetings, setUpcomingMeetings] = useState(() => {
    try {
      const saved = localStorage.getItem('upcomingMeetings');
      // Start with empty array instead of demo meetings
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // State for today's schedule (generated by AM wizard) - persisted by date
  const [todaySchedule, setTodaySchedule] = useState<any>(() => {
    try {
      const today = new Date().toDateString();
      const saved = localStorage.getItem('todaySchedule');
      if (saved) {
        const { date, schedule } = JSON.parse(saved);
        // Only restore if it's for today
        if (date === today) {
          console.log('📅 Restored today\'s schedule from localStorage');
          return schedule;
        }
      }
    } catch (error) {
      console.error('Error restoring schedule:', error);
    }
    return null;
  });
  
  // State for draft/partial day plan (when user saves progress in AM wizard)
  const [draftDayPlan, setDraftDayPlan] = useState<any>(null);
  
  // 🎯 PHASE 5 PROMPT 11: Schedule blocks state (persisted by date)
  const [scheduleBlocks, setScheduleBlocks] = useState<Record<string, TimeBlock[]>>(() => {
    try {
      const saved = localStorage.getItem('scheduleBlocks');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  
  // 🎯 PHASE 5 PROMPT 11: Previous calendar events for change detection
  const [previousCalendarEvents, setPreviousCalendarEvents] = useState<any[]>([]);
  
  // 🎯 PHASE 5 PROMPT 11: Schedule change proposal dialog state
  const [scheduleProposal, setScheduleProposal] = useState<ScheduleProposal | null>(null);
  const [showScheduleChangeDialog, setShowScheduleChangeDialog] = useState(false);

  // DEBUG: Track manual contact assignments changes 
  useEffect(() => {
    console.log('🔄 manualContactAssignments STATE CHANGED:', manualContactAssignments);
    console.log('   Assignment count:', Object.keys(manualContactAssignments).length);
  }, [manualContactAssignments]);

  // ONE-TIME COMPLETE RESET: Clear all demo data from localStorage
  // IMPORTANT: This must be BEFORE any conditional returns to follow Rules of Hooks
  useEffect(() => {
    // Check for code version mismatch (forces reload after restore/code changes)
    const currentCodeVersion = 'v2025.02.01'; // Update this when hooks structure changes
    const storedCodeVersion = localStorage.getItem('app_code_version');
    
    if (storedCodeVersion && storedCodeVersion !== currentCodeVersion) {
      console.error('🚨 RELOAD TRIGGERED: Code version changed from', storedCodeVersion, 'to', currentCodeVersion);
      localStorage.setItem('app_code_version', currentCodeVersion);
      window.location.reload();
      return;
    }
    
    if (!storedCodeVersion) {
      console.log('✅ Setting initial code version:', currentCodeVersion);
      localStorage.setItem('app_code_version', currentCodeVersion);
    }
    
    // RESET DISABLED: Already completed on published site
    // Just mark as complete to prevent future resets
    const hasRunReset = localStorage.getItem('demo_data_reset_complete_v6');
    if (!hasRunReset) {
      console.log('✅ Marking reset as complete (already done on published site)');
      localStorage.setItem('demo_data_reset_complete_v6', 'true');
    }
  }, []);
  
  // 🎯 START SNOOZE WATCHER for contact suggestions
  useEffect(() => {
    const cleanup = startSnoozeWatcher((unsnoozedContacts) => {
      console.log('⏰ Contacts unsnoozed:', unsnoozedContacts);
      
      // Show desktop notification
      if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification('Contact Addition Reminder', {
          body: `Time to add ${unsnoozedContacts.length} ${unsnoozedContacts.length === 1 ? 'contact' : 'contacts'} to SpoonFlow!`,
          icon: '/favicon.ico',
          tag: 'contact-snooze-reminder',
          requireInteraction: true,
        });
        
        notification.onclick = () => {
          // Open Contact Suggestion Modal
          window.focus();
          setContactSuggestionModalOpen(true);
          notification.close();
        };
      }
      
      // Show toast as well
      toast.info(
        `Reminder: ${unsnoozedContacts.length} ${unsnoozedContacts.length === 1 ? 'contact is' : 'contacts are'} ready to be added!`,
        {
          duration: 10000,
          action: {
            label: 'Add Now',
            onClick: () => setContactSuggestionModalOpen(true)
          }
        }
      );
    });
    
    return cleanup;
  }, []);
  
  // Check server integration status and set flag for auto-sync
  useEffect(() => {
    const checkServerIntegrationStatus = async () => {
      try {
        console.log('🔍 Checking server calendar integration status...');
        const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-a89809a8`;
        const response = await fetch(`${serverUrl}/integrations/status`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.calendar?.connected) {
            console.log('✅ Server reports calendar is connected - activating integration');
            localStorage.setItem('calendar_integration_connected', 'true');
            
            // Activate the server-side integration (updates internal state)
            googleCalendarAutoSync.activateServerIntegration();
          } else {
            console.log('📅 Server reports calendar not connected');
            localStorage.removeItem('calendar_integration_connected');
          }
        }
      } catch (error) {
        // Silently fail if server is not available - integration will be checked later
      }
    };
    
    checkServerIntegrationStatus();
  }, []);
  
  // Load tasks from localStorage or backend on mount
  useEffect(() => {
    const loadTasks = async () => {
      try {
        // 🔄 First, try to fetch from backend
        console.log('📦 Fetching tasks from backend...');
        try {
          const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a89809a8/tasks`, {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`
            }
          });
          
          if (response.ok) {
            const backendTasks = await response.json();
            if (Array.isArray(backendTasks) && backendTasks.length > 0) {
              console.log('✅ Loaded tasks from backend:', backendTasks.length);
              setAllTasks(backendTasks);
              // Save to localStorage as cache
              localStorage.setItem('allTasks', JSON.stringify(backendTasks));
              return;
            }
          }
        } catch (backendError) {
          console.log('⚠️ Backend fetch failed, trying localStorage...', backendError);
        }
        
        // Fallback to localStorage if backend fails
        const stored = localStorage.getItem('allTasks');
        if (stored) {
          const parsed = JSON.parse(stored);
          console.log('✅ Loaded tasks from localStorage:', parsed.length);
          setAllTasks(parsed);
        } else {
          // 🔄 Try to restore from backend backup
          console.log('📦 No tasks in localStorage, checking backend backup...');
          try {
            const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a89809a8/kv/allTasks_backup`, {
              headers: {
                'Authorization': `Bearer ${publicAnonKey}`
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              if (data.value && Array.isArray(data.value) && data.value.length > 0) {
                console.log('✅ Restored tasks from backend backup:', data.value.length);
                setAllTasks(data.value);
                // Re-save to localStorage
                localStorage.setItem('allTasks', JSON.stringify(data.value));
                return;
              }
            }
          } catch (backupError) {
            console.log('No backend backup found for tasks');
          }
          
          console.log('📝 No tasks found, starting fresh');
          setAllTasks([]);
        }
      } catch (error) {
        console.error('Failed to load tasks:', error);
        setAllTasks([]);
      } finally {
        setTasksLoaded(true);
      }
    };
    
    loadTasks();
  }, []);
  
  // Persist tasks to localStorage whenever they change
  useEffect(() => {
    if (!tasksLoaded) {
      console.log('⏸️ [TASK PERSIST] Skipping persist - tasks not loaded yet');
      return;
    }
    
    console.log(`💾 [TASK PERSIST] Persisting ${allTasks.length} tasks to localStorage and backend`);
    
    try {
      localStorage.setItem('allTasks', JSON.stringify(allTasks));
      console.log(`✅ [TASK PERSIST] Saved to localStorage`);
      
      // 🔄 SYNC TO BACKEND (both primary "tasks" key and backup)
      // Sync to main tasks key (used by iPhone Shortcuts and other integrations)
      fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a89809a8/kv/tasks`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ value: allTasks })
      }).then(async (res) => {
        if (res.ok) {
          console.log(`✅ [TASK PERSIST] Synced to backend /kv/tasks`);
        } else if (res.status !== 404) {
          // Only log errors for non-404 responses (404 is expected when backend not configured)
          const errorData = await res.json().catch(() => ({ status: res.status, statusText: res.statusText }));
          console.warn('⚠️ [TASK PERSIST] Backend sync failed (localStorage is still safe):', errorData);
        }
      }).catch((error) => {
        // Silently handle network errors - localStorage is primary storage
        console.debug('Network error during task backup (localStorage is safe):', error.message);
      });
      
      // Also backup to allTasks_backup
      fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a89809a8/kv/allTasks_backup`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ value: allTasks })
      }).then(async (res) => {
        if (!res.ok && res.status !== 503 && res.status !== 404) {
          // Only log errors for non-404/503 responses (404 = not configured, 503 = service unavailable)
          const errorData = await res.json().catch(() => ({ status: res.status, statusText: res.statusText }));
          console.warn('⚠️ Tasks backup failed (localStorage is still safe):', errorData);
        }
      }).catch(() => {
        // Silently fail for network errors - localStorage is primary storage
      });
      
    } catch (error) {
      console.error('Failed to save tasks to localStorage:', error);
    }
  }, [allTasks, tasksLoaded]);
  
  // 🔄 Auto-refresh tasks every 10 seconds when on TasksPage (for iPhone Shortcuts integration)
  useEffect(() => {
    if (currentPage !== 'tasks') return; // Only poll when on TasksPage
    
    const pollTasks = async () => {
      try {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a89809a8/tasks`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        });
        
        if (response.ok) {
          const backendTasks = await response.json();
          if (Array.isArray(backendTasks) && backendTasks.length > 0) {
            // Only update if backend has MORE tasks than local
            // This prevents overwriting newly created tasks that haven't synced yet
            if (backendTasks.length > allTasks.length) {
              console.log('🔄 [TASK POLL] Backend has more tasks, updating:', backendTasks.length);
              setAllTasks(backendTasks);
              localStorage.setItem('allTasks', JSON.stringify(backendTasks));
            } else if (backendTasks.length === allTasks.length) {
              // Only update if content is different and backend isn't missing any of our tasks
              const backendIds = new Set(backendTasks.map((t: Task) => t.id));
              const localIds = new Set(allTasks.map(t => t.id));
              const missingInBackend = Array.from(localIds).some(id => !backendIds.has(id));
              
              if (!missingInBackend && JSON.stringify(backendTasks) !== JSON.stringify(allTasks)) {
                console.log('🔄 [TASK POLL] Tasks updated from backend:', backendTasks.length);
                setAllTasks(backendTasks);
                localStorage.setItem('allTasks', JSON.stringify(backendTasks));
              } else if (missingInBackend) {
                console.log('⏸️ [TASK POLL] Skipping backend update - local has tasks not in backend yet');
              }
            } else {
              console.log('⏸️ [TASK POLL] Skipping backend update - local has more tasks');
            }
          }
        }
      } catch (error) {
        // Silently fail - don't spam console with errors
      }
    };
    
    const intervalId = setInterval(pollTasks, 10000); // Poll every 10 seconds
    
    return () => clearInterval(intervalId); // Cleanup on unmount or page change
  }, [currentPage, allTasks]);
  
  // Load goals from localStorage on mount
  useEffect(() => {
    const loadGoals = async () => {
      try {
        const stored = localStorage.getItem('allGoals');
        if (stored) {
          const parsed = JSON.parse(stored);
          console.log('✅ Loaded goals from localStorage:', parsed.length);
          setAllGoals(parsed);
        } else {
          console.log('📦 No goals in localStorage, checking backend backup...');
          try {
            const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a89809a8/kv/allGoals_backup`, {
              headers: {
                'Authorization': `Bearer ${publicAnonKey}`
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              if (data.value && Array.isArray(data.value) && data.value.length > 0) {
                console.log('✅ Restored goals from backend backup:', data.value.length);
                setAllGoals(data.value);
                localStorage.setItem('allGoals', JSON.stringify(data.value));
                return;
              }
            }
          } catch (backupError) {
            console.log('No backend backup found for goals');
          }
          
          console.log('📝 No goals found, starting fresh');
          setAllGoals([]);
        }
      } catch (error) {
        console.error('Failed to load goals:', error);
        setAllGoals([]);
      } finally {
        setGoalsLoaded(true);
      }
    };
    
    loadGoals();
  }, []);
  
  // Persist goals to localStorage whenever they change
  useEffect(() => {
    if (!goalsLoaded) {
      console.log('⏸️ [GOAL PERSIST] Skipping persist - goals not loaded yet');
      return;
    }
    
    console.log(`💾 [GOAL PERSIST] Persisting ${allGoals.length} goals to localStorage and backend`);
    
    try {
      localStorage.setItem('allGoals', JSON.stringify(allGoals));
      console.log(`✅ [GOAL PERSIST] Saved to localStorage`);
      
      // Also backup to backend
      fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a89809a8/kv/allGoals_backup`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ value: allGoals })
      }).then(async (res) => {
        if (!res.ok && res.status !== 503 && res.status !== 404) {
          // Only log errors for non-404/503 responses (404 = not configured, 503 = service unavailable)
          const errorData = await res.json().catch(() => ({ status: res.status, statusText: res.statusText }));
          console.warn('⚠️ Goals backup failed (localStorage is still safe):', errorData);
        }
      }).catch(() => {
        // Silently fail for network errors - localStorage is primary storage
      });
      
    } catch (error) {
      console.error('Failed to save goals to localStorage:', error);
    }
  }, [allGoals, goalsLoaded]);
  
  // Load contacts from localStorage on mount
  useEffect(() => {
    const loadContacts = async () => {
      try {
        const stored = localStorage.getItem('spoonflow_contacts');
        if (stored) {
          const parsed = JSON.parse(stored);
          console.log('✅ Loaded contacts from localStorage:', parsed.length);
          
          // 🧹 CLEANUP: Remove demo contacts
          const demoContactNames = [
            'Sarah Chen', 'Lisa Thompson', 'David Kim', 'Marcus Rodriguez', 'Emily Watson',
            'Sarah Mitchell', 'Marcus Chen', 'Jessica Torres', 'David Park', 'Amanda Rodriguez'
          ];
          const demoContactEmails = [
            'sarah@example.com', 'lisa@corp.com', 'david@startup.io', 
            'marcus@clientco.com', 'emily@partner.com',
            'sarah@techstartup.com', 'mchen@securedata.io', 'jtorres@innovate.design',
            'dpark@greenfield.co', 'arodriguez@acmecorp.com'
          ];
          
          const cleanedContacts = parsed.filter((contact: Contact) => {
            const isDemoByName = demoContactNames.some(name => 
              contact.name?.toLowerCase() === name.toLowerCase()
            );
            const isDemoByEmail = contact.email && demoContactEmails.some(email => 
              contact.email?.toLowerCase() === email.toLowerCase()
            );
            return !isDemoByName && !isDemoByEmail;
          });
          
          if (cleanedContacts.length < parsed.length) {
            const removedCount = parsed.length - cleanedContacts.length;
            console.log(`🧹 Removed ${removedCount} demo contact(s)`);
          }
          
          // 🔄 Migration: Set all contacts to "network" type
          const migratedContacts = cleanedContacts.map((contact: Contact) => ({
            ...contact,
            contactType: 'network' as const
          }));
          
          setAllContacts(migratedContacts);
        } else {
          // 🔄 Try to restore from backend backup
          console.log('📦 No contacts in localStorage, checking backend backup...');
          console.log('💡 TIP: If your contacts are missing, navigate to: ?page=contact-recovery');
          try {
            const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a89809a8/kv/spoonflow_contacts_backup`, {
              headers: {
                'Authorization': `Bearer ${publicAnonKey}`
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              if (data.value && Array.isArray(data.value) && data.value.length > 0) {
                console.log('✅ Restored contacts from backend backup:', data.value.length);
                const migratedContacts = data.value.map((contact: Contact) => ({
                  ...contact,
                  contactType: 'network' as const
                }));
                setAllContacts(migratedContacts);
                // Re-save to localStorage
                localStorage.setItem('spoonflow_contacts', JSON.stringify(migratedContacts));
                return;
              }
            }
          } catch (backupError) {
            console.log('No backend backup found');
          }
          
          console.log('⚠️ No contacts in localStorage or backend - starting with empty contacts');
          console.log('💡 If your contacts are missing, navigate to: ?page=contact-recovery');
          // Start with empty contacts - no demo data
          setAllContacts([]);
        }
      } catch (error) {
        console.error('Failed to load contacts from localStorage:', error);
        // Start with empty contacts - no demo data
        setAllContacts([]);
      } finally {
        setContactsLoaded(true);
      }
    };
    
    loadContacts();
  }, []);
  
  // Load manual contact assignments from server on mount
  useEffect(() => {
    const loadManualAssignments = async () => {
      try {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a89809a8/kv/calendar_event_contact_assignments`, {
          headers: { Authorization: `Bearer ${publicAnonKey}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.value) {
            setManualContactAssignments(data.value);
            console.log('✅ Loaded manual contact assignments:', Object.keys(data.value).length);
          }
        } else {
          // Silently fail if endpoint doesn't exist yet - this is optional data
          console.log('ℹ️ No manual contact assignments found (this is normal on first load)');
        }
      } catch (error) {
        // Silently fail - this data is optional and may not exist yet
        console.log('ℹ️ Manual contact assignments not available (this is normal on first load)');
      }
    };
    
    loadManualAssignments();
  }, []);

  // Save contacts to localStorage whenever they change (after initial load)
  useEffect(() => {
    if (!contactsLoaded) return; // Don't save during initial load

    try {
      localStorage.setItem('spoonflow_contacts', JSON.stringify(allContacts));
      console.log('✅ Contacts saved to localStorage:', allContacts.length);
      
      // 🔄 OPTIONAL BACKEND BACKUP (non-blocking, only if contacts list is reasonable size)
      // Skip backend backup if contacts list is too large to avoid WORKER_LIMIT errors
      const contactsSize = JSON.stringify(allContacts).length;
      const MAX_BACKUP_SIZE = 100000; // 100KB limit for backend backup
      
      if (contactsSize < MAX_BACKUP_SIZE) {
        // Fire and forget - don't wait for response
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a89809a8/kv/spoonflow_contacts_backup`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ value: allContacts })
        }).then(async (res) => {
          if (res.ok) {
            console.log('✅ Contacts backed up to cloud');
          } else if (res.status !== 503 && res.status !== 404) {
            // Only log errors for non-404/503 responses (404 = not configured, 503 = service unavailable)
            const errorData = await res.json().catch(() => ({ status: res.status, statusText: res.statusText }));
            console.warn('⚠️ Contacts backup failed (localStorage is still safe):', errorData);
          }
        }).catch(() => {
          // Silently fail for network errors - localStorage is primary storage
        });
      } else {
        console.log(`⚠️ Skipping backend backup (${Math.round(contactsSize/1024)}KB exceeds ${Math.round(MAX_BACKUP_SIZE/1024)}KB limit). localStorage is primary storage.`);
      }
      
    } catch (error) {
      console.error('Failed to save contacts to localStorage:', error);
    }
  }, [allContacts, contactsLoaded]);
  
  // 🎯 DETECT NEW CALENDAR ATTENDEES NOT IN CONTACTS
  useEffect(() => {
    if (!contactsLoaded || !calendarEvents || calendarEvents.length === 0) return;
    
    // Use new comprehensive contact detection system
    const missingContacts = detectMissingContacts(calendarEvents, allContacts);
    
    if (missingContacts.length > 0) {
      // Filter out contacts that have been dismissed
      const queueState = loadQueueState();
      const notDismissed = missingContacts.filter(
        contact => !queueState.dismissed.includes(contact.email)
      );
      
      if (notDismissed.length > 0) {
        console.log('📧 Found calendar attendees not in contacts:', notDismissed);
        
        // Add to queue (deduplicates automatically)
        addPendingContacts(notDismissed);
        
        const totalPending = getTotalPendingCount();
        
        // Show desktop notification only if there are new contacts that weren't previously dismissed
        if (totalPending > 0 && 'Notification' in window && Notification.permission === 'granted') {
          const notification = new Notification('New Calendar Contacts Detected', {
            body: `${totalPending} ${totalPending === 1 ? 'person' : 'people'} from your calendar ${totalPending === 1 ? 'isn\'t' : 'aren\'t'} in SpoonFlow yet.`,
            icon: '/favicon.ico',
            tag: 'contact-suggestions',
            requireInteraction: true, // Notification stays until user interacts
          });
          
          notification.onclick = () => {
            // Open Contact Suggestion Modal
            window.focus();
            setContactSuggestionModalOpen(true);
            notification.close();
          };
        }
      } else {
        console.log('📧 All missing contacts were previously dismissed, skipping notification');
      }
    }
  }, [calendarEvents, allContacts, contactsLoaded]);
  
  // 🎯 AUTO-SYNC CONTACTS WITH CALENDAR EVENTS
  // Update contact "nextCallDate" fields whenever calendar events change
  useEffect(() => {
    if (!contactsLoaded || calendarEvents.length === 0) return;
    
    console.log('📅 Syncing contacts with calendar events...', {
      contactsCount: allContacts.length,
      eventsCount: calendarEvents.length
    });
    
    // Sync contacts with calendar to update nextCallDate fields
    const syncedContacts = syncContactsWithCalendar(allContacts, calendarEvents);
    
    // Check if any contacts actually changed
    const hasChanges = syncedContacts.some((contact, index) => {
      const original = allContacts[index];
      return contact.nextCallDate !== original.nextCallDate ||
             contact.upcomingMeetings !== original.upcomingMeetings;
    });
    
    if (hasChanges) {
      console.log('📅 Contact nextCallDate fields updated from calendar');
      setAllContacts(syncedContacts);
    }
  }, [calendarEvents, contactsLoaded]);
  
  // 🎯 ENRICH CALENDAR EVENTS with contact details for UI display
  // This creates a derived version of calendar events with full contact information
  const enrichedCalendarEvents = useMemo(() => {
    console.log('🎨 ENRICHMENT: About to enrich calendar events');
    console.log('  Calendar events:', calendarEvents.length);
    console.log('  Contacts:', allContacts.length);
    console.log('  Contacts loaded:', contactsLoaded);
    
    // 📋 LOG ALL UNIQUE CALENDAR IDs (for buffer configuration)
    if (calendarEvents.length > 0) {
      const uniqueCalendarIds = new Map<string, string>(); // ID -> Name
      calendarEvents.forEach(event => {
        if (event?.calendarId && !uniqueCalendarIds.has(event.calendarId)) {
          uniqueCalendarIds.set(event.calendarId, event.calendarName || 'Unknown');
        }
      });
      
      if (uniqueCalendarIds.size > 0) {
        console.log('');
        console.log('═══════════════════════════════════════════════════════');
        console.log('📋 ALL CALENDAR IDs (for SubwayTimeline buffer config):');
        console.log('═══════════════════════════════════════════════════════');
        uniqueCalendarIds.forEach((name, id) => {
          console.log(`"${id}",  // ${name}`);
        });
        console.log('═══════════════════════════════════════════════════════');
        console.log('');
      }
    }
    
    if (!contactsLoaded || calendarEvents.length === 0) {
      console.log('⚠️ ENRICHMENT: Skipping - contactsLoaded:', contactsLoaded, 'events:', calendarEvents.length);
      return calendarEvents;
    }
    return enrichCalendarEventsWithContacts(calendarEvents, allContacts, manualContactAssignments);
  }, [calendarEvents, allContacts, contactsLoaded, manualContactAssignments]);
  
  // 🎯 SYNC INTERACTION DELETIONS when calendar events are cancelled
  useEffect(() => {
    // We need access to InteractionsContext, but we can't use useInteractions hook here
    // Instead, we'll store previous calendar events and compare
    
    // Skip on first load
    if (previousCalendarEvents.length === 0 && calendarEvents.length > 0) {
      setPreviousCalendarEvents(calendarEvents);
      return;
    }
    
    if (previousCalendarEvents.length === 0 || calendarEvents.length === 0) return;
    
    // Detect deleted events
    const previousEventIds = new Set(previousCalendarEvents.map(e => e.id));
    const currentEventIds = new Set(calendarEvents.map(e => e.id));
    
    const deletedEventIds = Array.from(previousEventIds).filter(id => !currentEventIds.has(id));
    
    if (deletedEventIds.length > 0) {
      console.log('🗑️ Detected deleted calendar events:', deletedEventIds);
      
      // Load interactions from localStorage and filter out deleted events
      try {
        const storedDossiers = localStorage.getItem('meeting_dossiers');
        if (storedDossiers) {
          const dossiers = JSON.parse(storedDossiers);
          const updatedDossiers = dossiers.filter((d: any) => 
            !deletedEventIds.includes(d.meetingId)
          );
          
          if (updatedDossiers.length !== dossiers.length) {
            localStorage.setItem('meeting_dossiers', JSON.stringify(updatedDossiers));
            console.log(`🗑️ Auto-deleted ${dossiers.length - updatedDossiers.length} interaction entries for cancelled meetings`);
            
            toast.info(`Removed ${dossiers.length - updatedDossiers.length} interaction ${dossiers.length - updatedDossiers.length === 1 ? 'entry' : 'entries'} for cancelled meetings`);
          }
        }
      } catch (error) {
        console.error('Failed to sync interaction deletions:', error);
      }
    }
    
    // Update previous events
    setPreviousCalendarEvents(calendarEvents);
  }, [calendarEvents]);
  
  // DISABLED: Meeting end detection - User prefers manual post-meeting notes workflow
  /* useEffect(() => {
    const checkForEndedMeetings = () => {
      console.log('🔍 [Fathom] Checking for ended meetings...');
      console.log('🔍 [Fathom] Calendar events count:', calendarEvents?.length || 0);
      
      if (!calendarEvents || calendarEvents.length === 0) {
        console.log('❌ [Fathom] No calendar events to check');
        return;
      }
      
      const now = new Date();
      const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);
      
      console.log('🔍 [Fathom] Current time:', now.toLocaleTimeString());
      console.log('🔍 [Fathom] Looking for meetings ended between:', fifteenMinutesAgo.toLocaleTimeString(), 'and', now.toLocaleTimeString());
      console.log('🔍 [Fathom] Already prompted meetings:', promptedMeetings);
      console.log('🔍 [Fathom] Snoozed meetings:', snoozedMeetings);
      
      // Find meetings that ended in the last 15 minutes
      const recentlyEndedMeetings = calendarEvents.filter(event => {
        if (!event.end?.dateTime) return false;
        
        const endTime = new Date(event.end.dateTime);
        const isRecentlyEnded = endTime > fifteenMinutesAgo && endTime < now;
        const notYetPrompted = !promptedMeetings.includes(event.id);
        const notCurrentlySnoozed = !snoozedMeetings[event.id] || snoozedMeetings[event.id] < now.getTime();
        
        if (endTime > fifteenMinutesAgo && endTime < now) {
          console.log('🔍 [Fathom] Meeting ended recently:', event.summary, 'at', endTime.toLocaleTimeString());
          console.log('  - Recently ended?', isRecentlyEnded);
          console.log('  - Not yet prompted?', notYetPrompted);
          console.log('  - Not currently snoozed?', notCurrentlySnoozed);
        }
        
        return isRecentlyEnded && notYetPrompted && notCurrentlySnoozed;
      });
      
      console.log('🔍 [Fathom] Recently ended meetings found:', recentlyEndedMeetings.length);
      
      // Check for snoozed meetings that should reappear
      const readyToReappear = Object.entries(snoozedMeetings).find(([meetingId, snoozeUntil]) => {
        return snoozeUntil < now.getTime();
      });
      
      if (readyToReappear) {
        const [meetingId] = readyToReappear;
        const meeting = calendarEvents.find(e => e.id === meetingId);
        if (meeting) {
          // Remove from snoozed and show prompt
          const newSnoozed = { ...snoozedMeetings };
          delete newSnoozed[meetingId];
          setSnoozedMeetings(newSnoozed);
          
          // Find contact name from attendees
          const contactName = meeting.attendees?.find((a: any) => !a.self)?.email?.split('@')[0] || 'Unknown';
          
          const meetingData = {
            id: meeting.id,
            title: meeting.summary || 'Untitled Meeting',
            contactName,
            contactId: undefined, // TODO: Match to contact by email
            startTime: meeting.start?.dateTime,
            endTime: meeting.end?.dateTime
          };
          
          setFathomSyncPromptMeeting(meetingData);
          
          // Show desktop notification for snoozed reminder
          if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification('Meeting Notes Reminder', {
              body: `Time to capture notes from ${meetingData.title}${contactName ? ` with ${contactName}` : ''}`,
              icon: '/favicon.ico',
              tag: `fathom-reminder-${meeting.id}`,
              requireInteraction: true,
            });
            
            notification.onclick = () => {
              // Focus window and ensure the Fathom prompt is showing
              window.focus();
              setFathomSyncPromptMeeting(meetingData);
              notification.close();
            };
          }
        }
      } else if (recentlyEndedMeetings.length > 0) {
        // Show prompt for first recently ended meeting
        const meeting = recentlyEndedMeetings[0];
        console.log('✅ [Fathom] Showing prompt for meeting:', meeting.summary);
        
        const contactName = meeting.attendees?.find((a: any) => !a.self)?.email?.split('@')[0] || 'Unknown';
        
        const meetingData = {
          id: meeting.id,
          title: meeting.summary || 'Untitled Meeting',
          contactName,
          contactId: undefined, // TODO: Match to contact by email
          startTime: meeting.start?.dateTime,
          endTime: meeting.end?.dateTime
        };
        
        setFathomSyncPromptMeeting(meetingData);
        
        // Show desktop notification
        if ('Notification' in window && Notification.permission === 'granted') {
          const notification = new Notification('Meeting Just Ended', {
            body: `${meetingData.title}${contactName ? ` with ${contactName}` : ''} - Would you like to capture notes?`,
            icon: '/favicon.ico',
            tag: `fathom-sync-${meeting.id}`,
            requireInteraction: true,
          });
          
          notification.onclick = () => {
            // Focus window and ensure the Fathom prompt is showing
            window.focus();
            setFathomSyncPromptMeeting(meetingData);
            notification.close();
          };
        }
      }
    };
    
    // Check immediately
    checkForEndedMeetings();
    
    // Then check every minute
    const interval = setInterval(checkForEndedMeetings, 60000);
    
    return () => clearInterval(interval);
  }, [calendarEvents, promptedMeetings, snoozedMeetings]); */
  
  // Content publish notifications now handled by NotificationScheduler
  // (see /utils/notificationScheduler.ts and NotificationSchedulerBridge)
  
  // Keyboard shortcut to toggle Focus Widget (Cmd/Ctrl + Shift + F)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'F' || e.key === 'f')) {
        e.preventDefault();
        console.log('🎯 Focus Widget shortcut triggered!');
        setShowFocusWidget(prev => {
          console.log('📍 Focus Widget state changing from', prev, 'to', !prev);
          return !prev;
        });
      }
    };

    console.log('⌨️ Focus Widget keyboard listener attached');
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Persist current page to localStorage and update URL whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('currentPage', currentPage);
      
      // Update URL without reloading the page (use relative URL to avoid cross-origin issues)
      try {
        const params = new URLSearchParams(window.location.search);
        params.set('page', currentPage);
        window.history.replaceState({}, '', `?${params.toString()}`);
      } catch (historyError) {
        // Ignore history API errors in iframe contexts
        console.log('Could not update URL (this is normal in some contexts)');
      }
    } catch (error) {
      console.error('Failed to save current page:', error);
    }
  }, [currentPage]);
  
  // Persist content items to localStorage whenever they change
  useEffect(() => {
    if (!contentLoaded) return;
    
    try {
      console.log(`💾 Saving ${allContentItems.length} content items to localStorage`);
      localStorage.setItem('allContentItems', JSON.stringify(allContentItems));
      console.log(`✅ Successfully saved to localStorage`);
      
      // 🔄 ALSO SYNC TO BACKEND for cloud backup
      fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a89809a8/kv/allContentItems_backup`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ value: allContentItems })
      }).then(async (res) => {
        if (!res.ok && res.status !== 503 && res.status !== 404) {
          // Only log errors for non-404/503 responses (404 = not configured, 503 = service unavailable)
          const errorData = await res.json().catch(() => ({ status: res.status, statusText: res.statusText }));
          console.warn('⚠️ Content backup failed (localStorage is still safe):', errorData);
        }
      }).catch(() => {
        // Silently fail for network errors - localStorage is primary storage
      });
      
    } catch (error) {
      console.error('Failed to save content items to localStorage:', error);
    }
  }, [allContentItems, contentLoaded]);
  
  // Persist nurtures to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('allNurtureToDos', JSON.stringify(allNurtureToDos));
      
      // 🔄 ALSO SYNC TO BACKEND for cloud backup
      fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a89809a8/kv/allNurtureToDos_backup`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ value: allNurtureToDos })
      }).catch(() => {
        // Silently fail for network errors
      });
      
    } catch (error) {
      console.error('Failed to save nurtures to localStorage:', error);
    }
  }, [allNurtureToDos]);
  
  // Persist services to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('allServices', JSON.stringify(allServices));
      
      // 🔄 ALSO SYNC TO BACKEND for cloud backup
      fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a89809a8/kv/allServices_backup`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ value: allServices })
      }).catch(() => {
        // Silently fail for network errors
      });
      
    } catch (error) {
      console.error('Failed to save services to localStorage:', error);
    }
  }, [allServices]);
  
  // Persist business files to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('allBusinessFiles', JSON.stringify(allBusinessFiles));
      
      // 🔄 ALSO SYNC TO BACKEND for cloud backup
      fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a89809a8/kv/allBusinessFiles_backup`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ value: allBusinessFiles })
      }).catch(() => {
        // Silently fail for network errors
      });
      
    } catch (error) {
      console.error('Failed to save business files to localStorage:', error);
    }
  }, [allBusinessFiles]);
  
  // Persist meetings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('upcomingMeetings', JSON.stringify(upcomingMeetings));
    } catch (error) {
      console.error('Failed to save meetings to localStorage:', error);
    }
  }, [upcomingMeetings]);

  // Persist chat messages to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('jamieChatMessages', JSON.stringify(chatMessages));
    } catch (error) {
      console.error('Failed to save chat messages to localStorage:', error);
    }
  }, [chatMessages]);

  // 🎯 PROACTIVE JAMIE: Generate context-aware suggestions when chat opens
  useEffect(() => {
    // Reset the flag when chat closes
    if (!jamieChatOpen) {
      setHasShownProactiveSuggestions(false);
      return;
    }
    
    // Only run when Jamie chat is opened and tasks/contacts are loaded
    if (!tasksLoaded || !contactsLoaded || hasShownProactiveSuggestions) return;
    
    // Don't generate if there are already recent messages (within last 30 seconds)
    const lastMessage = chatMessages[chatMessages.length - 1];
    if (lastMessage && (Date.now() - new Date(lastMessage.timestamp).getTime() < 30000)) {
      return;
    }
    
    // Generate proactive suggestions
    const generateProactiveSuggestions = async () => {
      try {
        const { generateContextSuggestions, analyzeTaskHealth } = await import('./utils/jamieTaskIntelligence');
        
        // Check for context suggestions
        const { suggestions } = generateContextSuggestions(allTasks, allContacts, calendarEvents);
        
        // Check for task health issues
        const { nudges } = analyzeTaskHealth(allTasks, allContacts);
        
        // Only surface high-priority suggestions or urgent nudges
        const highPrioritySuggestions = suggestions.filter(s => s.priority === 'high');
        const urgentNudges = nudges.filter(n => n.severity === 'urgent');
        
        if (highPrioritySuggestions.length === 0 && urgentNudges.length === 0) {
          setHasShownProactiveSuggestions(true); // Mark as shown even if nothing to show
          return; // No proactive messages needed
        }
        
        // Build proactive message
        let proactiveMessage = '';
        
        if (urgentNudges.length > 0) {
          proactiveMessage += '🔴 Quick heads up:\n\n';
          urgentNudges.forEach(nudge => {
            proactiveMessage += `${nudge.message}\n\n`;
          });
        }
        
        if (highPrioritySuggestions.length > 0) {
          if (proactiveMessage) proactiveMessage += '---\n\n';
          proactiveMessage += '💡 I also noticed:\n\n';
          highPrioritySuggestions.forEach(suggestion => {
            proactiveMessage += `${suggestion.message}\n`;
            if (suggestion.actionItems && suggestion.actionItems.length > 0) {
              suggestion.actionItems.forEach(item => {
                proactiveMessage += `  → ${item}\n`;
              });
            }
            proactiveMessage += '\n';
          });
        }
        
        // Add the proactive message to chat
        const jamieMessage: ChatMessage = {
          id: `msg-proactive-${Date.now()}`,
          sender: 'jamie',
          text: proactiveMessage.trim(),
          timestamp: new Date(),
        };
        
        setChatMessages(prev => [...prev, jamieMessage]);
        setHasShownProactiveSuggestions(true);
        
      } catch (error) {
        console.error('Error generating proactive suggestions:', error);
        setHasShownProactiveSuggestions(true);
      }
    };
    
    // Run after a short delay to let the panel open smoothly
    const timer = setTimeout(generateProactiveSuggestions, 500);
    return () => clearTimeout(timer);
    
  }, [jamieChatOpen, tasksLoaded, contactsLoaded, hasShownProactiveSuggestions, allTasks, allContacts, calendarEvents, chatMessages]);

  // Persist business files to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('allBusinessFiles', JSON.stringify(allBusinessFiles));
    } catch (error) {
      console.error('Failed to save business files to localStorage:', error);
    }
  }, [allBusinessFiles]);

  // Persist services to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('allServices', JSON.stringify(allServices));
      console.log('💾 App.tsx: Services persisted to localStorage', allServices.length, 'services');
    } catch (error) {
      console.error('❌ App.tsx: Failed to save services to localStorage:', error);
    }
  }, [allServices]);
  
  // 🎯 PHASE 5 PROMPT 11: Persist schedule blocks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('scheduleBlocks', JSON.stringify(scheduleBlocks));
    } catch (error) {
      console.error('Failed to save schedule blocks to localStorage:', error);
    }
  }, [scheduleBlocks]);
  
  // 🎯 PHASE 5 PROMPT 11: Detect calendar changes and propose schedule adjustments
  useEffect(() => {
    // Skip if no calendar events yet or this is the first load
    if (calendarEvents.length === 0 || previousCalendarEvents.length === 0) {
      setPreviousCalendarEvents(calendarEvents);
      return;
    }
    
    // Get today's date in YYYY-MM-DD format
    const today = getTodayLocal(); // Use local timezone
    
    // Convert calendar events to meetings format for today only
    const oldMeetingsToday = previousCalendarEvents
      .filter((event: any) => event.date === today)
      .map((event: any) => ({
        id: event.id,
        title: event.title,
        startTime: event.startTime,
        endTime: event.endTime,
        date: event.date
      }));
      
    const newMeetingsToday = calendarEvents
      .filter((event: any) => event.date === today)
      .map((event: any) => ({
        id: event.id,
        title: event.title,
        startTime: event.startTime,
        endTime: event.endTime,
        date: event.date
      }));
    
    // Detect changes
    const changes = detectCalendarChanges(oldMeetingsToday, newMeetingsToday, today);
    
    // If there are changes, generate a proposal
    if (changes.length > 0) {
      console.log('📅 Calendar changes detected:', changes);
      
      // Get current schedule blocks for today
      const currentBlocks = scheduleBlocks[today] || [];
      
      // Propose new schedule blocks based on the updated meetings
      const proposedBlocks = proposeScheduleBlocks(newMeetingsToday, {
        workDayStart: '09:00',
        workDayEnd: '17:00',
        bufferDuration: 15,
        minFocusBlockDuration: 60
      });
      
      // Generate reasoning
      const reason = generateChangeReason(changes);
      
      // Create proposal
      const proposal: ScheduleProposal = {
        date: today,
        changes,
        currentBlocks,
        proposedBlocks,
        reason
      };
      
      // Show dialog
      setScheduleProposal(proposal);
      setShowScheduleChangeDialog(true);
    }
    
    // Update previous events
    setPreviousCalendarEvents(calendarEvents);
  }, [calendarEvents]); // Only run when calendarEvents change
  
  // Persist today's schedule to localStorage
  useEffect(() => {
    if (todaySchedule) {
      try {
        const today = new Date().toDateString();
        localStorage.setItem('todaySchedule', JSON.stringify({
          date: today,
          schedule: todaySchedule
        }));
        console.log('💾 Saved today\'s schedule to localStorage');
      } catch (error) {
        console.error('Error saving schedule:', error);
      }
    }
  }, [todaySchedule]);
  
  // Generate nurtures from contacts' nurtureFrequency and nurtureStartDate
  const contactBasedNurtures = React.useMemo(() => {
    const nurtures: NurtureToDo[] = [];
    const today = new Date();
    const futureLimit = new Date();
    futureLimit.setFullYear(today.getFullYear() + 5); // Generate 5 years out (indefinite)
    
    allContacts.forEach(contact => {
      if (contact.nurtureStartDate && contact.nurtureFrequency) {
        const startDate = new Date(contact.nurtureStartDate);
        const frequencyInDays = contact.nurtureFrequency * 7; // Convert weeks to days
        
        // Generate nurtures from start date up to 5 years out (effectively indefinite)
        let currentDate = new Date(startDate);
        while (currentDate <= futureLimit) {
          // Only add if the nurture date hasn't passed
          if (currentDate >= today || currentDate.toDateString() === today.toDateString()) {
            nurtures.push({
              id: `nurture-${contact.id}-${dateToLocalString(currentDate)}`, // Use local timezone
              contactId: contact.id || '',
              contactName: contact.name,
              dueDate: dateToLocalString(currentDate), // YYYY-MM-DD format in local timezone
              status: 'pending',
              priority: false,
              type: 'email', // Default type
              nurtureFrequency: contact.nurtureFrequency,
              createdAt: new Date().toISOString(),
            });
          }
          
          // Add frequency to get next nurture date
          currentDate = new Date(currentDate);
          currentDate.setDate(currentDate.getDate() + frequencyInDays);
        }
      }
    });
    
    return nurtures;
  }, [allContacts]);

  // Merge contactBasedNurtures with allNurtureToDos for a complete list
  const allNurtures = React.useMemo(() => {
    // Combine both sources, with manual nurtures taking precedence over auto-generated ones
    // if there's a conflict (same contact + same date)
    const merged = [...allNurtureToDos];
    
    contactBasedNurtures.forEach(autoNurture => {
      // Only add auto-generated nurture if there's no manual one for the same contact on the same date
      const existingManual = allNurtureToDos.find(n => 
        n.contactId === autoNurture.contactId && n.dueDate === autoNurture.dueDate
      );
      
      if (!existingManual) {
        merged.push(autoNurture);
      }
    });
    
    return merged;
  }, [allNurtureToDos, contactBasedNurtures]);
  
  // Calculate counts for navigation (with dynamic journey count)
  // MUST be before any conditional returns (Rules of Hooks)
  const counts = React.useMemo(() => {
    const today = getTodayDate();
    const todayTasks = getTasksForDay(allTasks, today);
    const todayContent = getContentForDay(allContentItems, today);
    const todayNurtures = getNurturesForDay(allNurtures, today);
    
    // Calculate TODAY'S active tasks (due today, not archived, not done)
    const activeTodayTasks = todayTasks.filter(t => 
      !t.archived && 
      t.status !== 'done' && 
      t.status !== 'completed'
    );
    
    // Calculate ALL active tasks (not just today - for nav badge to match Tasks page)
    const allActiveTasks = allTasks.filter(t => 
      !t.archived && 
      t.status !== 'done' && 
      t.status !== 'completed'
    );
    
    // Calculate total content items (not archived, not published)
    const activeContent = allContentItems.filter(c => 
      !c.archived && 
      c.status !== 'Published' && 
      c.status !== 'Archived'
    );
    
    console.log('📊 App.tsx counts calculation:', {
      today,
      todayTasks: todayTasks.length,
      activeTodayTasks: activeTodayTasks.length,
      allActiveTasks: allActiveTasks.length,
      todayContent: todayContent.length,
      todayNurtures: todayNurtures.length,
      totalTasks: allTasks.length,
      totalContent: allContentItems.length,
      activeContent: activeContent.length,
    });
    
    // Calculate active goals (to do + in progress)
    const activeGoals = allGoals.filter(g => g.status === 'toDo' || g.status === 'inProgress');
    
    return {
      tasks: allActiveTasks.length, // ALL active tasks (for nav badge to match Tasks page)
      content: activeContent.length, // Total active content (for nav badge)
      contacts: allContacts.filter(c => !c.archived).length,
      nurtures: todayNurtures.length, // Only TODAY's nurtures
      goals: activeGoals.length, // Active goals (to do + in progress)
      documents: 0, // TODO: Add documents count when implemented
      calendar: calendarEvents.length,
    };
  }, [allTasks, allContentItems, allContacts, allNurtures, calendarEvents, allGoals]);

  // Separate counts for "Today at a Glance" (only items due today)
  const todayCounts = React.useMemo(() => {
    // Count all active tasks (matching TasksPage filter logic)
    const allActiveTasks = allTasks.filter(t => !t.archived && t.status !== 'done');
    const activeContent = allContentItems.filter(c => 
      c.status !== 'Published' && 
      c.status !== 'Deleted' && 
      c.status !== 'Archived'
    );
    
    // Count active goals
    const activeGoals = allGoals.filter(g => g.status === 'toDo' || g.status === 'inProgress');
    
    return {
      tasks: allActiveTasks.length, // Total active tasks (not done, not archived)
      content: activeContent.length, // Total active content
      // Removed contacts and calendar counts per user request
      goals: activeGoals.length,
      documents: 0,
    };
  }, [allTasks, allContentItems, allGoals]);

  // Filter calendar events to only today's events
  const todaysCalendarEvents = useMemo(() => {
    const today = getTodayLocal();
    
    console.log('🔍 [TIMELINE DEBUG] Filtering calendar events for today:');
    console.log(`  📅 Today's date (local): "${today}"`);
    console.log(`  📊 Total enriched events: ${enrichedCalendarEvents.length}`);
    console.log(`  📊 Raw calendar events from hook: ${calendarEvents.length}`);
    
    // Show ALL calendar events (not just enriched) for debugging
    if (calendarEvents.length > 0) {
      console.log(`  🔍 Raw calendar events (first 5) - ⚠️ NOTE: Still using UTC split, fixing below:`);
      calendarEvents.slice(0, 5).forEach((e, i) => {
        const startTime = e.startTime instanceof Date ? e.startTime.toISOString() : e.startTime;
        const startDate = startTime ? startTime.split('T')[0] : 'N/A';
        console.log(`    ${i + 1}. "${e.title || e.summary}" (${e.calendarName || 'Unknown Calendar'})`);
        console.log(`       - startTime: "${startTime}"`);
        console.log(`       - Date: "${startDate}" ${startDate === today ? '✅ MATCHES TODAY' : '❌ different day'}`);
      });
    }
    
    if (enrichedCalendarEvents.length > 0) {
      console.log(`  📋 Sample enriched events (first 3):`);
      enrichedCalendarEvents.slice(0, 3).forEach((e, i) => {
        const startTime = e.startTime instanceof Date ? e.startTime.toISOString() : e.startTime;
        const startDate = startTime ? startTime.split('T')[0] : 'N/A';
        
        console.log(`    ${i + 1}. "${e.title || e.summary}"`);
        console.log(`       - startTime: "${startTime}"`);
        console.log(`       - Extracted date: "${startDate}"`);
      });
    }
    
    const todaysEvents = enrichedCalendarEvents.filter(event => {
      if (!event.startTime) {
        console.log(`  ⚠️ Event "${event.title || event.summary}" has no startTime`);
        return false;
      }
      
      // Convert startTime to date string (YYYY-MM-DD) using LOCAL timezone
      // This is critical! Google Calendar returns UTC times, so 9pm EST becomes 1am UTC next day
      const startTime = event.startTime instanceof Date ? event.startTime.toISOString() : event.startTime;
      const eventDate = isoStringToLocalDate(startTime); // Use LOCAL timezone, not UTC!
      const eventDateUTC = startTime.split('T')[0]; // Old UTC method for comparison
      const matches = eventDate === today;
      
      // Special logging for CM Fellowship events
      const isCMFellowship = event.calendarName?.includes('CM Fellowship') || event.calendarId?.includes('classroom');
      if (isCMFellowship) {
        console.log(`  🎓 CM FELLOWSHIP EVENT: "${event.title || event.summary}"`);
        console.log(`     - Calendar: ${event.calendarName}`);
        console.log(`     - Date: "${eventDate}" (today is "${today}")`);
        console.log(`     - Time: ${startTime}`);
        console.log(`     - ${matches ? '✅ MATCHES TODAY' : '❌ NOT TODAY'}`);
      }
      
      if (!matches && !isCMFellowship) {
        console.log(`  ❌ Event "${event.title || event.summary}" doesn't match: "${eventDate}" !== "${today}"`);
      } else if (matches && !isCMFellowship) {
        console.log(`  ✅ Event "${event.title || event.summary}" MATCHES: "${eventDate}" === "${today}"`);
      }
      
      return matches;
    });
    
    console.log(`📅 RESULT: ${todaysEvents.length} out of ${enrichedCalendarEvents.length} events match today (${today})`);
    if (todaysEvents.length > 0) {
      console.log(`  Matching events:`, todaysEvents.map(e => e.title || e.summary));
    }
    
    return todaysEvents;
  }, [enrichedCalendarEvents]);

  // DEBUG: Track enrichedCalendarEvents changes
  useEffect(() => {
    console.log('🎨 enrichedCalendarEvents CHANGED (new reference)');
    console.log('   Event count:', enrichedCalendarEvents.length);
    console.log('   Events with contacts:', enrichedCalendarEvents.filter(e => e.contact).length);
    if (enrichedCalendarEvents.length > 0) {
      console.log('   Sample enriched event:', enrichedCalendarEvents[0]);
    }
  }, [enrichedCalendarEvents]);

  // DEBUG: Track todaysCalendarEvents changes  
  useEffect(() => {
    console.log('📅 todaysCalendarEvents CHANGED (new reference)');
    console.log('   Event count:', todaysCalendarEvents.length);
    console.log('   Events with contacts:', todaysCalendarEvents.filter(e => e.contact).length);
  }, [todaysCalendarEvents]);

  // Handler to refresh counts (called by Today page hourly)
  // Note: Counts recalculate automatically when allContacts changes
  // This callback is just for logging/future extensibility
  // MUST be before any conditional returns (Rules of Hooks)
  const handleRefreshCounts = React.useCallback(() => {
    console.log('⏰ Hourly refresh check for Today at a Glance counts');
    // Counts are already reactive based on allContacts state
    // No forced re-render needed - just log the refresh event
  }, []);

  // ⚠️ OAUTH ROUTING CHECKS - MUST BE AFTER ALL HOOKS (Rules of Hooks)
  // These early returns are OK here because all hooks have been declared above
  
  // Check for Gmail OAuth launcher route
  if (urlParams.get('gmail-oauth') === 'launcher') {
    return <GmailOAuthLauncher />;
  }
  
  // Check for Gmail OAuth callback (code from Google)
  // Google will redirect to: /?gmail_callback=true&code=XXX
  const isGmailCallback = urlParams.get('gmail_callback') === 'true';
  const gmailCode = urlParams.get('code');
  const gmailError = urlParams.get('error');
  if (isGmailCallback && (gmailCode || gmailError)) {
    return <GmailOAuthCallback code={gmailCode} error={gmailError} />;
  }
  
  // Check for Calendar OAuth launcher route
  if (urlParams.get('calendar-oauth') === 'launcher') {
    return <CalendarOAuthLauncher />;
  }
  
  // Check for Calendar OAuth callback (code from Google)
  // Google will redirect to: /?calendar_callback=true&code=XXX
  const isCalendarCallback = urlParams.get('calendar_callback') === 'true';
  const calendarCode = urlParams.get('code');
  const calendarError = urlParams.get('error');
  console.log('🔍 Calendar callback check:', { isCalendarCallback, calendarCode: calendarCode?.substring(0, 20), calendarError });
  if (isCalendarCallback && (calendarCode || calendarError)) {
    console.log('✅ Rendering CalendarOAuthCallback component');
    return <CalendarOAuthCallback code={calendarCode} error={calendarError} />;
  }
  
  // Check for LinkedIn OAuth launcher
  const isLinkedInLauncher = urlParams.get('linkedin-oauth') === 'launcher';
  if (isLinkedInLauncher) {
    console.log('✅ Rendering LinkedInOAuthLauncher component');
    return <LinkedInOAuthLauncher />;
  }
  
  // Check for LinkedIn OAuth callback (code from LinkedIn)
  // LinkedIn will redirect to: /?linkedin_callback=true&code=XXX
  const isLinkedInCallback = urlParams.get('linkedin_callback') === 'true';
  const linkedInCode = urlParams.get('code');
  const linkedInError = urlParams.get('error');
  console.log('🔍 LinkedIn callback check:', { isLinkedInCallback, linkedInCode: linkedInCode?.substring(0, 20), linkedInError });
  if (isLinkedInCallback && (linkedInCode || linkedInError)) {
    console.log('✅ Rendering LinkedInOAuthCallback component');
    return <LinkedInOAuthCallback code={linkedInCode} error={linkedInError} />;
  }
  
  // Check if user wants to view the original comprehensive app
  const showOriginalApp = urlParams.get('view') === 'original';

  const handleAddTask = (task: { title: string; contact?: { name: string; initials: string }; dueDate?: string }) => {
    console.log('Add task from quick add:', task);
    // TODO: Add task to state/backend
  };

  const handleQuickAddSelect = (type: 'task' | 'contact' | 'content') => {
    if (type === 'task') {
      setTaskModalOpen(true);
    } else if (type === 'contact') {
      setSelectedContactForProfile(null); // Clear any previously selected contact
      setContactModalOpen(true);
    } else if (type === 'content') {
      setContentModalOpen(true);
    }
  };

  const handleJamieClick = () => {
    console.log('Ask Jamie clicked');
    // TODO: Open Jamie assistant
  };
  
  // Track recently viewed contacts for quick access
  const handleContactViewed = (contactId: string) => {
    setRecentlyViewedContactIds(prev => {
      // Remove contactId if it already exists, then add to front
      const filtered = prev.filter(id => id !== contactId);
      // Keep only the 4 most recent
      return [contactId, ...filtered].slice(0, 4);
    });
  };
  
  const handleContactClickFromTimeline = (contactId: string, meetingId?: string) => {
    console.log('Opening contact profile from timeline:', contactId, meetingId);
    
    // Find the contact by ID
    const contact = allContacts.find(c => c.id === contactId);
    
    if (contact) {
      setSelectedContactForProfile(contact);
      setContactModalOpen(true);
    } else {
      console.warn('Contact not found:', contactId);
      toast.error('Contact not found');
    }
  };
  
  const handleJamieAction = (type: 'plan-day' | 'wind-down' | 'post-meeting' | 'chat' | 'dev-skip-to-timeline') => {
    console.log('Jamie action:', type);
    if (type === 'plan-day') {
      console.log('Opening Plan Your Day workflow...');
      // Reload calendar cache before opening wizard to ensure latest events are available
      const reloadedEvents = reloadCalendarCache();
      console.log('🔄 Reloaded', reloadedEvents.length, 'calendar events before opening AM wizard');
      setPlanDayWizardOpen(true);
    } else if (type === 'wind-down') {
      console.log('Opening Wind Down workflow...');
      
      // Debug: Log all tasks with their due dates and statuses
      const today = getTodayLocal(); // Use local timezone
      const tomorrowStr = getTomorrowLocal(); // Use local timezone
      
      console.log('📊 All Tasks Summary for Wind Down:');
      console.log('  Today:', today);
      console.log('  Tomorrow:', tomorrowStr);
      console.log('  Total tasks:', allTasks.length);
      
      allTasks.forEach(t => {
        if (t.dueDate) {
          const taskDateStr = t.dueDate.split('T')[0];
          const label = taskDateStr === today ? '🎯 TODAY' : taskDateStr === tomorrowStr ? '📅 TOMORROW' : '📆 OTHER';
          console.log(`  ${label}: "${t.title}" | Due: ${t.dueDate} | Status: ${t.status}`);
        }
      });
      
      setWindDownWizardOpen(true);
    } else if (type === 'post-meeting') {
      console.log('Opening Post-Meeting workflow...');
      // Open meeting selector to choose which meeting
      setMeetingSelectorOpen(true);
    } else if (type === 'chat') {
      console.log('Opening Jamie chat...');
      setJamieChatOpen(true);
    } else if (type === 'dev-skip-to-timeline') {
      // Development shortcut - mark day as planned without going through wizard
      console.log('⚡ Dev shortcut: Skipping to timeline view');
      setTodaySchedule({
        scheduledBlocks: [
          {
            id: '1',
            startTime: '11:00 AM',
            duration: 15,
            type: 'routine',
            name: 'Plan My Day',
            locked: true,
          },
          {
            id: '2',
            startTime: '11:15 AM',
            duration: 30,
            type: 'routine',
            name: 'AM Admin',
          },
          {
            id: '3',
            startTime: '11:45 AM',
            duration: 15,
            type: 'buffer',
            bufferType: 'pre',
            name: 'Mtg Prep',
          },
          {
            id: '4',
            startTime: '12:00 PM',
            duration: 30,
            type: 'meeting',
            subtype: 'regular',
            name: 'Onboarding Meeting',
            locked: true,
            contacts: [{ id: 'c1', name: 'Mary Jane', color: '#6b7b98' }],
            hasPrep: true,
            hasCallLink: true,
          },
          {
            id: '5',
            startTime: '12:30 PM',
            duration: 15,
            type: 'buffer',
            bufferType: 'post',
            name: 'Post-Mtg Notes',
          },
          {
            id: '6',
            startTime: '12:45 PM',
            duration: 30,
            type: 'routine',
            name: 'Lunch',
          },
          {
            id: '7',
            startTime: '1:15 PM',
            duration: 15,
            type: 'buffer',
            bufferType: 'pre',
            name: 'Travel Time',
          },
          {
            id: '8',
            startTime: '1:30 PM',
            duration: 45,
            type: 'meeting',
            subtype: 'medical',
            name: 'Medical Appt',
            locked: true,
          },
          {
            id: '9',
            startTime: '2:15 PM',
            duration: 45,
            type: 'buffer',
            bufferType: 'post',
            name: 'Travel Time',
          },
          {
            id: '10',
            startTime: '3:00 PM',
            duration: 60,
            type: 'routine',
            name: 'Task Time',
          },
          {
            id: '11',
            startTime: '4:00 PM',
            duration: 30,
            type: 'routine',
            name: 'Professional Development',
          },
          {
            id: '12',
            startTime: '4:30 PM',
            duration: 30,
            type: 'routine',
            name: 'PM Admin',
          },
        ],
      });
    }
  };
  
  // Manual Post-Meeting Wizard trigger
  const handleManualPostMeetingWizard = (meeting: any) => {
    // Mark as prompted so it doesn't show again automatically
    setPromptedMeetings(prev => [...prev, meeting.id]);
    
    // Store the meeting data and open Post-Meeting Wizard
    setSelectedPostMeetingData(meeting);
    setPostMeetingWizardOpen(true);
    toast.success('Opening Post-Meeting Wizard');
  };
  
  // 🎯 Contact Queue Handlers
  const handleViewContactSuggestions = () => {
    console.log('🎯 handleViewContactSuggestions called - opening modal');
    setContactSuggestionModalOpen(true);
  };
  
  const handleSnoozeBanner = (minutes: number) => {
    const count = getTotalPendingCount();
    snoozeAllContacts(minutes);
    toast.success(`Snoozed ${count} ${count === 1 ? 'contact' : 'contacts'} for ${minutes} minutes`);
  };
  
  const handleDismissBanner = () => {
    const count = getTotalPendingCount();
    dismissAllContacts();
    toast.success(`Dismissed ${count} ${count === 1 ? 'contact' : 'contacts'}`);
  };
  
  const handleStartAddingContacts = (selectedEmails: string[]) => {
    console.log('Starting to add contacts:', selectedEmails);
    setContactSuggestionModalOpen(false);
    setIsAddingContactFromQueue(true);
    
    // Open contact modal with first contact's data
    const currentContact = getCurrentContact();
    if (currentContact) {
      // Create a new Contact object from the pending contact
      const newContact: Contact = {
        id: `temp-${Date.now()}`,
        name: currentContact.name || '',
        email: currentContact.email,
        company: currentContact.company || '',
        role: currentContact.role || '',
        contactType: 'network',
        status: 'prospect',
        tags: [],
        notes: currentContact.notes || '',
        location: currentContact.location,
        linkedInUrl: currentContact.linkedinUrl,
        schedulingLink: currentContact.schedulingLink,
        nextCallDate: currentContact.nextCallDate,
        interactions: [],
        tasks: [],
        from: '',
      };
      
      setSelectedContactForProfile(newContact);
      setContactModalOpen(true);
    }
  };
  
  const handleContactSaved = (savedContact: Contact) => {
    // Contact was saved
    console.log('Contact saved:', savedContact);
    
    // Create interaction entries for all upcoming meetings with this contact
    const queueContact = getCurrentContact();
    if (queueContact && queueContact.meetingIds.length > 0) {
      try {
        // Load existing dossiers
        const storedDossiers = localStorage.getItem('meeting_dossiers');
        const existingDossiers = storedDossiers ? JSON.parse(storedDossiers) : [];
        
        // Create interaction entries for each meeting
        const newDossiers = queueContact.meetingIds.map((meetingId, index) => {
          const meetingDate = queueContact.meetingDates[index];
          const meetingTitle = queueContact.meetingTitles[index];
          
          return {
            id: `dossier-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'meeting' as const,
            meetingId,
            meetingTitle,
            meetingDate,
            meetingTime: '', // We don't have time in the queue data
            contactId: savedContact.id,
            contactName: savedContact.name,
            prepCompleted: false,
            postMeetingCompleted: false,
            windDownCompleted: false,
            taskIds: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        });
        
        // Save to localStorage
        localStorage.setItem('meeting_dossiers', JSON.stringify([...existingDossiers, ...newDossiers]));
        
        console.log(`📅 Created ${newDossiers.length} interaction entries for ${savedContact.name}`);
        
        if (newDossiers.length > 0) {
          toast.info(`Added ${newDossiers.length} upcoming ${newDossiers.length === 1 ? 'meeting' : 'meetings'} to ${savedContact.name}'s timeline`);
        }
      } catch (error) {
        console.error('Failed to create interaction entries:', error);
      }
    }
    
    // Close the contact modal
    setContactModalOpen(false);
    
    // Complete current contact in queue
    completeCurrentContact();
    
    // Check if there are more contacts to prompt
    const remainingCount = getTotalPendingCount();
    
    if (remainingCount > 0) {
      // Show progress dialog to ask if they want to continue
      setContactQueueProgressOpen(true);
    } else {
      // All done!
      setIsAddingContactFromQueue(false);
      toast.success('All contacts have been added to SpoonFlow! 🎉', {
        description: 'Your calendar contacts are now in your network.',
        duration: 5000,
      });
    }
  };

  // Handle contact queue progress actions
  const handleContinueToNextContact = () => {
    setContactQueueProgressOpen(false);
    // Move to next contact in queue
    const nextContact = getCurrentContact();
    if (nextContact) {
      // Create a new Contact object from the pending contact
      const newContact: Contact = {
        id: `temp-${Date.now()}`,
        name: nextContact.name || '',
        email: nextContact.email,
        company: nextContact.company || '',
        role: nextContact.role || '',
        contactType: 'network',
        status: 'prospect',
        tags: [],
        notes: nextContact.notes || '',
        location: nextContact.location,
        linkedInUrl: nextContact.linkedinUrl,
        schedulingLink: nextContact.schedulingLink,
        nextCallDate: nextContact.nextCallDate,
        interactions: [],
        tasks: [],
        from: '',
      };
      
      setSelectedContactForProfile(newContact);
      setContactModalOpen(true);
    }
  };

  const handleSnoozeQueue = (minutes: number) => {
    snoozeCurrentContact(minutes);
    setContactQueueProgressOpen(false);
    setIsAddingContactFromQueue(false);
    toast.info(`Snoozed for ${minutes} minutes`, {
      description: 'You\'ll be reminded when it\'s time to continue.',
      duration: 3000,
    });
  };

  const handleDismissQueue = () => {
    dismissCurrentContact();
    setContactQueueProgressOpen(false);
    setIsAddingContactFromQueue(false);
    toast.success('Dismissed remaining contacts', {
      description: 'They won\'t be suggested again.',
      duration: 3000,
    });
  };

  // Handle page navigation with history tracking
  const handleNavigateToPage = (page: string) => {
    // Add current page to history before navigating (unless it's the same page)
    if (currentPage !== page) {
      setNavigationHistory(prev => [...prev, currentPage]);
    }
    
    // Clear selected contact when navigating to contacts page from sidebar
    // This prevents the modal from auto-opening when returning to contacts
    if (page === 'contacts') {
      setSelectedContactForProfile(null);
    }
    
    setCurrentPage(page);
  };

  // Handle back navigation
  const handleNavigateBack = () => {
    if (navigationHistory.length > 0) {
      const previousPage = navigationHistory[navigationHistory.length - 1];
      setNavigationHistory(prev => prev.slice(0, -1)); // Remove last item
      setCurrentPage(previousPage);
    }
  };
  
  // Handle manual contact assignment for calendar events
  const handleAssignContact = async (eventId: string, contactId: string | null) => {
    try {
      console.log(`Assigning contact ${contactId || 'null'} to event ${eventId}`);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a89809a8/calendar/event/${eventId}/contact`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ contactId })
        }
      );
      
      if (response.ok) {
        // Update local state
        setManualContactAssignments(prev => {
          const updated = { ...prev };
          if (contactId) {
            updated[eventId] = contactId;
          } else {
            delete updated[eventId];
          }
          return updated;
        });
        
        toast.success(contactId ? 'Contact assigned successfully' : 'Contact assignment removed');
      } else {
        throw new Error('Failed to assign contact');
      }
    } catch (error) {
      console.error('Error assigning contact:', error);
      toast.error('Failed to assign contact');
    }
  };

  // Handle Jamie chat message sending
  const handleSendChatMessage = async (text: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date(),
      context: {
        page: currentPage,
        selectedItem,
      },
    };

    setChatMessages(prev => [...prev, userMessage]);

    // Import all Jamie AI functions
    const { detectTaskIntent, createTasksViaJamie, detectSchedulingIntent, checkCalendarAvailability, detectWebSearchIntent, performWebSearch } = await import('./utils/jamieAI');
    const { detectTaskIntelligenceIntent, suggestNextTask, searchTasks, analyzeTaskHealth, generateContextSuggestions } = await import('./utils/jamieTaskIntelligence');
    
    // Check if this is a task intelligence request (priority suggestions, search, health check, context)
    const intelligenceIntent = detectTaskIntelligenceIntent(text);
    
    if (intelligenceIntent.type) {
      if (intelligenceIntent.type === 'priority_suggestion') {
        // "What should I work on next?"
        const suggestion = suggestNextTask(allTasks, allContacts);
        
        let responseText = `${suggestion.suggestion}\n\n${suggestion.reasoning}`;
        
        if (suggestion.alternativeTasks && suggestion.alternativeTasks.length > 0) {
          responseText += `\n\nAlternatives:\n`;
          suggestion.alternativeTasks.forEach(task => {
            responseText += `• ${task.title}${task.estimatedMinutes ? ` (${task.estimatedMinutes} mins)` : ''}\n`;
          });
        }
        
        const jamieMessage: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'jamie',
          text: responseText,
          timestamp: new Date(),
        };
        
        setChatMessages(prev => [...prev, jamieMessage]);
        return;
      }
      
      if (intelligenceIntent.type === 'task_search') {
        // "Show me all tasks related to Spencer"
        const { results, searchSummary } = searchTasks(intelligenceIntent.query || text, allTasks, allContacts);
        
        let responseText = searchSummary;
        
        if (results.length > 0) {
          responseText += `\n\n`;
          results.forEach(task => {
            let taskLine = `• ${task.title}`;
            if (task.status) {
              const statusLabel = task.status === 'toDo' ? 'To Do' : 
                                 task.status === 'inProgress' ? 'In Progress' :
                                 task.status === 'awaitingReply' ? 'Awaiting Reply' : 'Done';
              taskLine += ` [${statusLabel}]`;
            }
            if (task.dueDate) {
              const dueDate = new Date(task.dueDate);
              const today = new Date().toISOString().split('T')[0];
              const isToday = task.dueDate === today;
              const isTomorrow = task.dueDate === new Date(Date.now() + 86400000).toISOString().split('T')[0];
              
              if (isToday) taskLine += ` - Due today`;
              else if (isTomorrow) taskLine += ` - Due tomorrow`;
              else taskLine += ` - Due ${dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
            }
            if (task.estimatedMinutes) {
              taskLine += ` (${task.estimatedMinutes} mins)`;
            }
            responseText += taskLine + '\n';
          });
        }
        
        const jamieMessage: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'jamie',
          text: responseText,
          timestamp: new Date(),
        };
        
        setChatMessages(prev => [...prev, jamieMessage]);
        return;
      }
      
      if (intelligenceIntent.type === 'task_health') {
        // "How's my task list?"
        const { nudges } = analyzeTaskHealth(allTasks, allContacts);
        
        let responseText = '';
        
        if (nudges.length === 0) {
          responseText = `Your task list looks healthy! No major issues to flag.`;
        } else {
          responseText = `Here's what I'm seeing:\n\n`;
          
          nudges.forEach(nudge => {
            const icon = nudge.severity === 'urgent' ? '🔴' : nudge.severity === 'warning' ? '⚠️' : 'ℹ️';
            responseText += `${icon} ${nudge.message}\n`;
            
            // Show first few affected tasks
            if (nudge.affectedTasks.length > 0 && nudge.affectedTasks.length <= 3) {
              nudge.affectedTasks.forEach(task => {
                responseText += `  • ${task.title}\n`;
              });
            }
            responseText += '\n';
          });
        }
        
        const jamieMessage: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'jamie',
          text: responseText.trim(),
          timestamp: new Date(),
        };
        
        setChatMessages(prev => [...prev, jamieMessage]);
        return;
      }
      
      if (intelligenceIntent.type === 'context_suggestion') {
        // "Any suggestions?"
        const { suggestions } = generateContextSuggestions(allTasks, allContacts, calendarEvents);
        
        let responseText = '';
        
        if (suggestions.length === 0) {
          responseText = `No specific suggestions right now. Your workflow looks smooth!`;
        } else {
          responseText = `Here's what I notice:\n\n`;
          
          // Show top 3 suggestions
          suggestions.slice(0, 3).forEach(suggestion => {
            const icon = suggestion.priority === 'high' ? '🎯' : suggestion.priority === 'medium' ? '💡' : '✨';
            responseText += `${icon} ${suggestion.message}\n`;
            
            if (suggestion.actionItems && suggestion.actionItems.length > 0) {
              suggestion.actionItems.forEach(item => {
                responseText += `  → ${item}\n`;
              });
            }
            responseText += '\n';
          });
        }
        
        const jamieMessage: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'jamie',
          text: responseText.trim(),
          timestamp: new Date(),
        };
        
        setChatMessages(prev => [...prev, jamieMessage]);
        return;
      }
    }
    
    // Check if this is a task creation request FIRST
    const taskIntent = detectTaskIntent(text);
    
    if (taskIntent.isTaskRequest && taskIntent.action === 'create' && taskIntent.tasks && taskIntent.tasks.length > 0) {
      // Handle task creation
      const loadingMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'jamie',
        text: `Creating ${taskIntent.tasks.length} ${taskIntent.tasks.length === 1 ? 'task' : 'tasks'}...`,
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, loadingMessage]);
      
      try {
        const { success, createdTasks, error } = await createTasksViaJamie(taskIntent.tasks, allContacts);
        
        if (error || !success || !createdTasks || createdTasks.length === 0) {
          const errorMsg: ChatMessage = {
            id: `msg-${Date.now() + 2}`,
            sender: 'jamie',
            text: `Sorry, I had trouble creating those tasks: ${error || 'Unknown error'}`,
            timestamp: new Date(),
          };
          setChatMessages(prev => prev.filter(m => m.id !== loadingMessage.id).concat(errorMsg));
        } else {
          // Add created tasks to state
          setAllTasks(prev => [...prev, ...createdTasks]);
          
          // Format success response
          let responseText = `✓ Created ${createdTasks.length} ${createdTasks.length === 1 ? 'task' : 'tasks'}:\n\n`;
          
          createdTasks.forEach((task: any) => {
            let taskLine = `• ${task.title}`;
            if (task.estimatedTime) {
              taskLine += ` (${task.estimatedTime} mins)`;
            }
            if (task.taskType) {
              const typeLabel = task.taskType.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
              taskLine += ` - ${typeLabel}`;
            }
            if (task.contact) {
              taskLine += ` → ${task.contact.name}`;
            }
            responseText += taskLine + '\n';
          });
          
          responseText += '\nAll set to go!';
          
          const successMsg: ChatMessage = {
            id: `msg-${Date.now() + 2}`,
            sender: 'jamie',
            text: responseText,
            timestamp: new Date(),
          };
          setChatMessages(prev => prev.filter(m => m.id !== loadingMessage.id).concat(successMsg));
          
          toast.success(`Created ${createdTasks.length} task${createdTasks.length > 1 ? 's' : ''}!`);
        }
      } catch (error) {
        console.error('Task creation error:', error);
        const errorMsg: ChatMessage = {
          id: `msg-${Date.now() + 2}`,
          sender: 'jamie',
          text: 'Sorry, something went wrong while creating tasks. Please try again.',
          timestamp: new Date(),
        };
        setChatMessages(prev => prev.filter(m => m.id !== loadingMessage.id).concat(errorMsg));
      }
      return; // Exit early, don't call generateJamieResponse
    }

    // Check if this is a web search request
    const searchIntent = detectWebSearchIntent(text);
    
    if (searchIntent.isSearchRequest && searchIntent.searchQuery) {
      // Handle web search
      const loadingMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'jamie',
        text: `Searching for "${searchIntent.searchQuery}"...`,
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, loadingMessage]);
      
      try {
        const searchData = await performWebSearch(
          searchIntent.searchQuery,
          searchIntent.count,
          searchIntent.freshness
        );
        
        if (searchData.error) {
          const errorMsg: ChatMessage = {
            id: `msg-${Date.now() + 2}`,
            sender: 'jamie',
            text: `Sorry, I couldn't search for that: ${searchData.error}`,
            timestamp: new Date(),
          };
          setChatMessages(prev => prev.filter(m => m.id !== loadingMessage.id).concat(errorMsg));
        } else if (searchData.results.length === 0) {
          const noResultsMsg: ChatMessage = {
            id: `msg-${Date.now() + 2}`,
            sender: 'jamie',
            text: `I couldn't find any results for "${searchIntent.searchQuery}". Try different search terms?`,
            timestamp: new Date(),
          };
          setChatMessages(prev => prev.filter(m => m.id !== loadingMessage.id).concat(noResultsMsg));
        } else {
          const resultsMsg: ChatMessage = {
            id: `msg-${Date.now() + 2}`,
            sender: 'jamie',
            text: `Found ${searchData.results.length} result${searchData.results.length > 1 ? 's' : ''} for "${searchIntent.searchQuery}". Click + to add any to your Idea Inbox:`,
            timestamp: new Date(),
            searchResults: searchData.results.map((r: any) => ({
              title: r.title,
              url: r.url,
              description: r.description,
              published: r.age,
              favicon: r.favicon
            })),
          };
          setChatMessages(prev => prev.filter(m => m.id !== loadingMessage.id).concat(resultsMsg));
        }
      } catch (error) {
        console.error('Web search error:', error);
        const errorMsg: ChatMessage = {
          id: `msg-${Date.now() + 2}`,
          sender: 'jamie',
          text: 'Sorry, something went wrong with the search. Please try again.',
          timestamp: new Date(),
        };
        setChatMessages(prev => prev.filter(m => m.id !== loadingMessage.id).concat(errorMsg));
      }
      return; // Exit early, don't call generateJamieResponse
    }

    // Generate Jamie's response using OpenAI with conversation history
    try {
      const jamieResponse = await generateJamieResponse(
        text, 
        currentPage, 
        allTasks, 
        allContacts, 
        selectedItem,
        chatMessages // Pass conversation history for context
      );
      setChatMessages(prev => [...prev, jamieResponse]);
      
      // Check if Jamie's response includes task creation and extract the tasks
      const taskCreationIndicators = [
        'I\'ve created these tasks',
        'Here are the tasks I\'ve added',
        'Tasks added to your list',
        'I\'ve created',
        'Here are the tasks'
      ];
      
      const hasTaskCreationIndicator = taskCreationIndicators.some(indicator => 
        jamieResponse.text.toLowerCase().includes(indicator.toLowerCase())
      );
      
      if (hasTaskCreationIndicator) {
        const today = getTodayLocal(); // Use local timezone
        const createdTasks: Task[] = [];
        
        // Pattern 1: **Task Title** (estimated X mins)
        const patternWithTime = /\*\*([^*]+)\*\*.*?\(estimated (\d+) min(?:s|utes)?\)/gi;
        const matchesWithTime = [...jamieResponse.text.matchAll(patternWithTime)];
        
        // Pattern 2: **Task Title** at the start of a line or after bullet (without time)
        // Allow for multiple spaces after the bullet
        const patternWithoutTime = /(?:^|\n|\*\s+)\*\*([^*]+)\*\*/gm;
        const matchesWithoutTime = [...jamieResponse.text.matchAll(patternWithoutTime)];
        
        console.log('[Task Extraction] Response text:', jamieResponse.text);
        console.log('[Task Extraction] Matches with time:', matchesWithTime.length);
        console.log('[Task Extraction] Matches without time:', matchesWithoutTime.length);
        
        // Log the actual matches for debugging
        if (matchesWithTime.length > 0) {
          console.log('[Task Extraction] Tasks with time found:');
          matchesWithTime.forEach((match, i) => {
            console.log(`  ${i + 1}. "${match[1].trim()}" (${match[2]} mins)`);
          });
        }
        if (matchesWithoutTime.length > 0) {
          console.log('[Task Extraction] Tasks without time found:');
          matchesWithoutTime.forEach((match, i) => {
            console.log(`  ${i + 1}. "${match[1].trim()}"`);
          });
        }
        
        // Track which tasks we've already created (by title) to avoid duplicates
        const createdTaskTitles = new Set<string>();
        
        // Get existing task titles to avoid duplicates
        const existingTaskTitles = new Set(allTasks.map(t => t.title));
        
        // Process matches with time estimates first
        matchesWithTime.forEach(match => {
          const title = match[1].trim();
          const estimatedMinutes = parseInt(match[2]);
          
          // Skip if this task already exists
          if (existingTaskTitles.has(title)) {
            console.log(`[Task Extraction] Skipping duplicate: "${title}"`);
            return;
          }
          
          createdTasks.push({
            id: `task-${Date.now()}-${Math.random()}`,
            title: title,
            status: 'toDo',
            dueDate: today,
            priority: 'normal',
            estimatedMinutes: estimatedMinutes,
            createdAt: new Date().toISOString(),
          });
          createdTaskTitles.add(title);
        });
        
        // Also process matches without time (default to 30 mins)
        // Skip any that were already matched with time estimates
        if (matchesWithoutTime.length > 0) {
          matchesWithoutTime.forEach(match => {
            const title = match[1].trim();
            
            // Skip if title is too short or too long (likely not a task)
            if (title.length < 3 || title.length > 100) return;
            
            // Skip if this task already exists
            if (existingTaskTitles.has(title)) {
              console.log(`[Task Extraction] Skipping duplicate: "${title}"`);
              return;
            }
            
            // Skip if we already created this task in this batch (avoid duplicates)
            if (createdTaskTitles.has(title)) return;
            
            createdTasks.push({
              id: `task-${Date.now()}-${Math.random()}`,
              title: title,
              status: 'toDo',
              dueDate: today,
              priority: 'normal',
              estimatedMinutes: 30,
              createdAt: new Date().toISOString(),
            });
            createdTaskTitles.add(title);
          });
        }
        
        if (createdTasks.length > 0) {
          setAllTasks(prev => [...prev, ...createdTasks]);
          console.log(`✅ Auto-created ${createdTasks.length} tasks from Jamie:`, createdTasks);
          toast.success(`Created ${createdTasks.length} task${createdTasks.length > 1 ? 's' : ''} for today`);
        } else {
          console.warn('[Task Extraction] No tasks extracted despite indicator phrase being present');
        }
      }
    } catch (error) {
      console.error('Error generating Jamie response:', error);
      // Add error message
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'jamie',
        text: "I'm having trouble connecting right now. Can you try again?",
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, errorMessage]);
    }
  };

  // Handle executing quick actions from Jamie's responses
  const handleExecuteChatAction = (action: string, data?: any) => {
    console.log('Executing action:', action, data);

    if (action === 'create-task') {
      if (data && data.title) {
        // Auto-create task with provided data
        const newTask: Task = {
          id: `task-${Date.now()}`,
          title: data.title,
          status: 'toDo',
          dueDate: data.dueDate || getTodayLocal(), // Use local timezone
          priority: data.priority || 'normal',
          estimatedMinutes: data.estimatedMinutes,
          createdAt: new Date().toISOString(),
        };
        setAllTasks(prev => [...prev, newTask]);
        toast.success(`Task created: ${data.title}`);
      } else {
        // Open modal for manual creation
        setTaskModalOpen(true);
      }
    } else if (action === 'create-contact') {
      setContactModalOpen(true);
    } else if (action === 'open-plan-day') {
      setPlanDayWizardOpen(true);
    } else if (action === 'open-wind-down') {
      setWindDownWizardOpen(true);
    } else if (action === 'view-task') {
      const task = allTasks.find(t => t.id === data?.taskId);
      if (task) {
        setEditingTask(task);
        setTaskModalOpen(true);
      }
    } else if (action === 'view-contact') {
      const contact = allContacts.find(c => c.id === data?.contactId);
      if (contact) {
        setCurrentPage('contacts');
        setSelectedContactForProfile(contact);
      }
    }
  };

  // Check if this is the timer PiP window
  const isTimerPiP = urlParams.get('timer') === 'true';

  console.log('🚀 App.tsx proceeding to full app render...');
  console.log('🔍 URL params:', Object.fromEntries(urlParams));
  
  if (isTimerPiP) {
    const blockTitle = urlParams.get('blockTitle') || 'Block';
    const endTime = new Date(parseInt(urlParams.get('endTime') || '0'));
    return <TimerPiPView blockTitle={blockTitle} endTime={endTime} />;
  }

  // Check if we're showing the color comparison or demo pages
  const showColorComparison = urlParams.get('colors') === 'true';
  const showRefinedComparison = urlParams.get('colors') === 'refined';
  const showContentViews = urlParams.get('contentviews') === 'true';
  const showContentGalleryDesigns = urlParams.get('contentgallery') === 'true';
  const showContentHybrid = urlParams.get('contenthybrid') === 'true';
  const showPostMeetingDemo = urlParams.get('demo') === 'postmeeting';
  const showMeetingDossierDemo = urlParams.get('demo') === 'dossier';
  const showDossierComparison = urlParams.get('demo') === 'dossier-compare';
  const showMeetingPrepPiP = urlParams.get('demo') === 'prep-pip';
  const showHelpMeGetStartedDemo = urlParams.get('demo') === 'help';
  const showPlaylistDemo = urlParams.get('demo') === 'playlist';
  const showPDFComparison = urlParams.get('demo') === 'pdf-compare';
  const showInvoicePDF = urlParams.get('demo') === 'invoice-pdf';
  const showLinkedInOptions = urlParams.get('demo') === 'linkedin-options';
  const showContentPageOptions = urlParams.get('demo') === 'content-options';
  const showContentOption3 = urlParams.get('demo') === 'content-option3';
  const showContentClean = urlParams.get('demo') === 'content-clean';
  const showContentDesigns = urlParams.get('demo') === 'content-designs';
  const showContentStats = urlParams.get('demo') === 'content-stats';
  const showContentCompact = urlParams.get('demo') === 'content-compact';
  const showContentSimple = urlParams.get('demo') === 'content-simple';
  
  if (showPlaylistDemo) {
    return <PlaylistDemo />;
  }
  
  if (showContentSimple) {
    return <ContentPage_SimpleTable />;
  }
  
  if (showContentCompact) {
    return <ContentPage_CompactStats />;
  }
  
  if (showContentStats) {
    return <ContentPage_InboxWithStats />;
  }
  
  if (showContentDesigns) {
    return <ContentDesignOptions />;
  }
  
  if (showContentClean) {
    return <ContentPage_CleanDesign />;
  }
  
  if (showContentOption3) {
    return <ContentPageOption3_Correct />;
  }
  
  if (showContentPageOptions) {
    return <ContentPageOptions />;
  }
  
  if (showLinkedInOptions) {
    return <LinkedInOptionsMockup />;
  }
  
  if (showInvoicePDF) {
    return <InvoicePDFDemo />;
  }
  
  if (showPDFComparison) {
    return <PDFComparisonTest />;
  }
  
  if (showHelpMeGetStartedDemo) {
    return <HelpMeGetStartedDemo />;
  }
  
  if (showContentGalleryDesigns) {
    return <MutedContentGalleryDesignOptions />;
  }
  
  if (showContentHybrid) {
    return <MutedContentGalleryHybrid />;
  }
  
  if (showDossierComparison) {
    return <MeetingDossierComparison />;
  }
  
  if (showMeetingDossierDemo) {
    return <MeetingDossierDemo />;
  }
  
  if (showMeetingPrepPiP) {
    return <MeetingPrepPiPDemo />;
  }
  
  if (showPostMeetingDemo) {
    return <PostMeetingNotesDemo />;
  }
  
  if (showRefinedComparison) {
    return <BackgroundColorComparison_Refined />;
  }
  
  if (showColorComparison) {
    return <BackgroundColorComparison />;
  }
  
  if (showContentViews) {
    return (
      <>
        <SharedLayout_Muted 
          currentPage="content" 
          onNavigate={setCurrentPage}
          counts={{}}
        >
          <MutedContentPage_AllViews />
        </SharedLayout_Muted>
        <Toaster position="top-center" />
      </>
    );
  }
  
  return (
    <InteractionsProvider>
      <NotificationProvider>
        {/* E5B: Start notification scheduler (runs in background) */}
        {/* E5C PROMPT 11.15: IMPORTANT - Only mount ONE NotificationSchedulerBridge instance */}
        {/* The scheduler has module-level guards, but multiple bridges = wasted effects */}
        <NotificationSchedulerBridge
          tasks={allTasks}
          calendarEvents={calendarEvents}
          nurtureItems={allNurtures}
        />
        
        {/* Auto-create dossiers for calendar meetings - DISABLED: Now only created after AM Wizard */}
        {/* <CalendarDossierSync
          calendarEvents={calendarEvents}
          contacts={allContacts}
          contactsLoaded={contactsLoaded}
        /> */}
        
        <SharedLayout_Muted 
          currentPage={currentPage} 
          onNavigate={setCurrentPage}
          onSyncCalendar={manualSyncCalendar}
          counts={todayCounts}
        >
          {currentPage === 'today' && (
            <>
              <PageHeader_Muted
                title="Today"
                onJamieAction={handleJamieAction}
                onQuickAddSelect={handleQuickAddSelect}
              />
              <SubwayTimeline 
                calendarEvents={todaysCalendarEvents}
                contacts={allContacts.map(c => ({
                  id: c.id,
                  name: c.name,
                  color: c.color,
                  imageUrl: c.imageUrl,
                  initials: c.initials
                }))}
                onAssignContact={handleAssignContact}
                onNavigateToContact={(contactId) => {
                  // Find the contact and navigate to their profile
                  const contact = allContacts.find(c => c.id === contactId);
                  if (contact) {
                    setSelectedContactForProfile(contact);
                    setCurrentPage('contacts');
                  } else {
                    console.warn('Contact not found:', contactId);
                  }
                }}
                onCreateTask={(task) => {
                  // Create task from action items in timeline dossier
                  // Helper to format minutes to string
                  const formatMinutes = (mins?: number): string | undefined => {
                    if (!mins) return undefined;
                    const hours = Math.floor(mins / 60);
                    const minutes = mins % 60;
                    if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
                    if (hours > 0) return `${hours}h`;
                    return `${minutes}m`;
                  };
                  
                  const newTask: Task = {
                    id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    title: task.title,
                    description: task.description || '',
                    dueDate: task.dueDate || '',
                    contact: task.contact,
                    contactId: task.contact?.id,
                    priority: task.priority || 'medium',
                    status: task.status || 'toDo',
                    estimatedTime: formatMinutes(task.estimatedTime || 15),
                    taskType: task.taskType as any,
                    createdAt: new Date().toISOString(),
                    archived: false
                  };
                  
                  setAllTasks(prev => [...prev, newTask]);
                  console.log(`✅ Task created from Timeline dossier: "${newTask.title}" (${newTask.estimatedTime} mins)`);
                }}
              />
            </>
          )}
          {currentPage === 'tasks' && (
            <TasksPage
              onTasksChange={setAllTasks}
              tasks={allTasks}
              onEditTask={(task) => {
                setEditingTask(task);
                setTaskModalOpen(true);
              }}
              onUpdateTask={(taskId, updates) => {
                console.log('[App.tsx] onUpdateTask called:', { taskId, updates });
                setAllTasks(prev => {
                  const updated = prev.map(t => 
                    t.id === taskId ? { ...t, ...updates } : t
                  );
                  console.log('[App.tsx] Task after update:', updated.find(t => t.id === taskId));
                  return updated;
                });
              }}
              onGetStarted={(task) => {
                setTaskForStartModal(task);
                setStartMyTaskModalOpen(true);
              }}
              onQuickAddSelect={handleQuickAddSelect}
              onJamieAction={handleJamieAction}
              onContactClick={(contactId) => {
                // Find the contact and open their profile
                const contact = allContacts.find(c => c.id === contactId);
                if (contact) {
                  // Switch to contacts page
                  handleNavigateToPage('contacts');
                  // TODO: Open the contact profile modal
                  // This would require passing a selected contact to ContactsPage
                  setSelectedContactForProfile(contact);
                }
              }}
              onBack={handleNavigateBack}
            />
          )}
          {currentPage === 'contact-recovery' && (
            <SharedLayout_Muted 
              currentPage="contact-recovery" 
              onNavigate={setCurrentPage}
              counts={{}}
            >
              <ContactRecoveryTool 
                onRestore={(contacts) => {
                  setAllContacts(contacts);
                  toast.success(`Restored ${contacts.length} contacts successfully!`);
                  // Redirect back to contacts page
                  setTimeout(() => {
                    setCurrentPage('contacts');
                  }, 2000);
                }}
              />
            </SharedLayout_Muted>
          )}
          {currentPage === 'contacts' && (
            <ContactsPage
              contacts={allContacts}
              onUpdateContacts={setAllContacts}
              tasks={allTasks}
              selectedContactFromNav={selectedContactForProfile}
              recentlyViewedContactIds={recentlyViewedContactIds}
              onContactViewed={handleContactViewed}
              onOpenTaskModal={(task, prefilledContact) => {
                if (task) {
                  // Edit mode - open with existing task
                  setEditingTask(task);
                  setPrefilledContactForTask(null);
                } else if (prefilledContact) {
                  // New task mode - prefill with contact
                  setEditingTask(null);
                  setPrefilledContactForTask(prefilledContact);
                }
                setTaskModalOpen(true);
              }}
              onQuickAddSelect={handleQuickAddSelect}
              onJamieAction={handleJamieAction}
              calendarEvents={enrichedCalendarEvents}
              onNavigateToNurtures={() => handleNavigateToPage('nurtures')}
              services={allServices}
              onNavigateToForms={(contactId, contactName) => {
                handleNavigateToPage('forms');
                // Store the pre-selected contact info so Forms page can use it
                // We'll need to add state for this
                sessionStorage.setItem('preselectedFlowContact', JSON.stringify({ id: contactId, name: contactName }));
              }}
              onCaptureMeetingNotes={handleManualPostMeetingWizard}
              onBack={handleNavigateBack}
            />
          )}
          {currentPage === 'nurtures' && (
            <NurturesView
              contacts={allContacts}
              nurtureToDos={allNurtures}
              onContactClick={(contact) => {
                setCurrentPage('contacts');
                setSelectedContactForProfile(contact);
              }}
              onUpdateNurtureToDo={(nurtureToDo) => {
                setAllNurtureToDos(prev => prev.map(n => 
                  n.id === nurtureToDo.id ? nurtureToDo : n
                ));
              }}
              onGenerateEmail={(nurtureToDo) => {
                console.log('Generate email for nurture:', nurtureToDo);
                // TODO: Implement AI email generation
              }}
              onBackToContacts={() => setCurrentPage('contacts')}
              onQuickAddSelect={handleQuickAddSelect}
              onJamieAction={handleJamieAction}
              onBack={handleNavigateBack}
            />
          )}
          {currentPage === 'goals' && (
            <>
              <PageHeader_Muted
                title="Goals"
                onJamieAction={handleJamieAction}
                onQuickAddSelect={handleQuickAddSelect}
                customActions={
                  <button
                    onClick={() => {
                      setEditingGoal(undefined);
                      setGoalModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-full text-white font-medium transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#a389aa' }}
                  >
                    + New Goal
                  </button>
                }
              />
              <GoalsPage
                goals={allGoals}
                onGoalsChange={setAllGoals}
                onAddGoal={() => {
                  setEditingGoal(undefined);
                  setGoalModalOpen(true);
                }}
              />
            </>
          )}
          {currentPage === 'content' && (
            <MutedContentPageIntegrated
              onQuickAddSelect={handleQuickAddSelect}
              onJamieAction={handleJamieAction}
              contentItems={allContentItems}
              setContentItems={setAllContentItems}
              onBack={handleNavigateBack}
              onOpenEditor={(itemId) => {
                setEditingContentId(itemId);
                setCurrentPage('content-editor');
              }}
            />
          )}
          {currentPage === 'content-editor' && editingContentId && (() => {
            const item = allContentItems.find(i => i.id === editingContentId);
            if (!item) {
              setCurrentPage('content');
              return null;
            }
            return (
              <ContentEditorNew
                item={item}
                onClose={() => setCurrentPage('content')}
                onSave={(updatedItem) => {
                  setAllContentItems(prev => prev.map(i => 
                    i.id === updatedItem.id ? updatedItem : i
                  ));
                }}
                onQuickAddSelect={handleQuickAddSelect}
                onJamieAction={handleJamieAction}
              />
            );
          })()}
          {currentPage === 'content-simple' && (
            <ContentPage_SimpleTable />
          )}
          {currentPage === 'calendar' && (
            <MutedCalendarPage 
              events={enrichedCalendarEvents}
              tasks={allTasks}
              content={allContentItems}
              nurtures={contactBasedNurtures}
              contacts={allContacts}
              manualContactAssignments={manualContactAssignments}
              onEventClick={(event) => {
                // When an event is clicked, if it has contact details, we can optionally show their profile
                // Or just log it for now
                console.log('📅 Event clicked:', event);
              }}
              onOpenTaskModal={(task) => {
                if (task) {
                  setEditingTask(task);
                }
                setTaskModalOpen(true);
              }}
              onContentClick={(contentItem) => {
                // Navigate to content page with this item selected
                setCurrentPage('content');
                // TODO: We'll need to pass the selected item ID to the content page
                // For now, just navigate to the content page
              }}
              onContactClick={(contactId) => {
                const contact = allContacts.find(c => c.id === contactId);
                if (contact) {
                  setSelectedContactForProfile(contact);
                  setContactModalOpen(true);
                }
              }}
              onQuickAddSelect={handleQuickAddSelect}
              onJamieAction={handleJamieAction}
              onAssignContact={handleAssignContact}
              onBack={handleNavigateBack}
            />
          )}
          {currentPage === 'settings' && (
            <MutedSettingsPage 
              services={allServices}
              onUpdateServices={setAllServices}
              onQuickAddSelect={handleQuickAddSelect}
              onJamieAction={handleJamieAction}
              onBack={handleNavigateBack}
            />
          )}
          {currentPage === 'form-editor' && (
            <FormEditorPage 
              onQuickAddSelect={handleQuickAddSelect}
              onJamieAction={handleJamieAction}
              onBack={handleNavigateBack}
            />
          )}
          {currentPage === 'fathom-diagnostic' && (
            <div className="p-8">
              <FathomDiagnostic />
            </div>
          )}
          {currentPage === 'outline-demo' && (
            <OutlineModePrototype />
          )}
        </SharedLayout_Muted>
        
        {/* Quick Add Modals */}
        <MutedTaskModal
          isOpen={taskModalOpen}
          task={editingTask ? (() => {
            // Always get the latest version of the task from allTasks
            const latestTask = allTasks.find(t => t.id === editingTask.id);
            const taskToUse = latestTask || editingTask;
            
            // Parse estimatedTime from string format (e.g., "30m", "1h 30m") to minutes
            const parseTimeToMinutes = (timeStr?: string | number): number | undefined => {
              if (!timeStr) return undefined;
              
              // If it's already a number, return it
              if (typeof timeStr === 'number') return timeStr;
              
              // If it's not a string, return undefined
              if (typeof timeStr !== 'string') return undefined;
              
              const hourMatch = timeStr.match(/(\d+)h/);
              const minMatch = timeStr.match(/(\d+)m/);
              const hours = hourMatch ? parseInt(hourMatch[1]) : 0;
              const mins = minMatch ? parseInt(minMatch[1]) : 0;
              return hours * 60 + mins || undefined;
            };
            
            return {
              id: taskToUse.id,
              title: taskToUse.title,
              notes: taskToUse.description,
              status: taskToUse.status,
              dueDate: taskToUse.dueDate,
              contact: taskToUse.contact,
              isFlagged: taskToUse.priority === 'high',
              tags: taskToUse.tags,
              taskType: taskToUse.taskType,
              estimatedTime: parseTimeToMinutes(taskToUse.estimatedTime),
            };
          })() : undefined}
          prefilledContact={prefilledContactForTask || undefined}
          contacts={allContacts}
          onClose={() => {
            setTaskModalOpen(false);
            setEditingTask(null);
            setPrefilledContactForTask(null);
          }}
          onSave={(task) => {
            console.log('Save task:', task);
            
            // Convert estimatedTime from minutes (number) to string format
            const formatMinutesToString = (minutes?: number): string | undefined => {
              if (!minutes) return undefined;
              const hours = Math.floor(minutes / 60);
              const mins = minutes % 60;
              if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
              if (hours > 0) return `${hours}h`;
              return `${mins}m`;
            };
            
            if (editingTask) {
              // Update existing task
              setAllTasks(prev => prev.map(t => 
                t.id === editingTask.id ? {
                  ...t,
                  title: task.title,
                  description: task.notes,
                  status: task.status || 'toDo',
                  dueDate: task.dueDate,
                  contact: typeof task.contact === 'object' && task.contact 
                    ? { id: task.contact.id, name: task.contact.name }
                    : undefined,
                  priority: task.isFlagged ? 'high' : undefined,
                  tags: task.tags,
                  taskType: task.taskType,
                  estimatedTime: formatMinutesToString(task.estimatedTime),
                } : t
              ));
            } else {
              // Map MutedTaskModal format to TasksPage format
              const newTask: Task = {
                id: task.id || `task-${Date.now()}`,
                title: task.title,
                description: task.notes,
                status: task.status || 'toDo',
                dueDate: task.dueDate,
                contact: typeof task.contact === 'object' && task.contact 
                  ? { id: task.contact.id, name: task.contact.name }
                  : undefined,
                priority: task.isFlagged ? 'high' : undefined,
                tags: task.tags,
                taskType: task.taskType,
                estimatedTime: formatMinutesToString(task.estimatedTime),
                createdAt: new Date().toISOString(),
                archived: false,
              };
              
              // Add to tasks list
              setAllTasks(prev => [...prev, newTask]);
            }
            
            setTaskModalOpen(false);
            setEditingTask(null);
            setPrefilledContactForTask(null);
          }}
          onGetStarted={(task) => {
            // Convert MutedTaskModal task format to TasksPage format
            const fullTask = allTasks.find(t => t.id === task.id);
            if (fullTask) {
              setTaskForStartModal(fullTask);
              setStartMyTaskModalOpen(true);
            }
          }}
        />
        <ContactProfileModal
          contact={selectedContactForProfile}
          isNew={!selectedContactForProfile?.id || selectedContactForProfile.id.startsWith('temp-')}
          isOpen={contactModalOpen}
          onClose={() => {
            setContactModalOpen(false);
            setSelectedContactForProfile(null); // Clear contact data when closing
            // If we were adding from queue and user cancelled, stop the flow
            if (isAddingContactFromQueue) {
              setIsAddingContactFromQueue(false);
            }
          }}
          services={allServices}
          calendarEvents={enrichedCalendarEvents}
          onCaptureMeetingNotes={handleManualPostMeetingWizard}
          onSave={(contact) => {
            console.log('Contact saved:', contact);
            
            // Assign real ID if it's a temp ID
            const finalContact = contact.id.startsWith('temp-') 
              ? { ...contact, id: `contact-${Date.now()}` }
              : contact;
            
            // Check if contact already exists (update) or is new (add)
            setAllContacts(prev => {
              const existingIndex = prev.findIndex(c => c.id === contact.id);
              if (existingIndex >= 0 && !contact.id.startsWith('temp-')) {
                // Update existing contact
                const updated = [...prev];
                updated[existingIndex] = finalContact;
                return updated;
              } else {
                // Add new contact
                return [...prev, finalContact];
              }
            });
            
            // If we're in the queue flow, handle it specially
            if (isAddingContactFromQueue) {
              handleContactSaved(finalContact);
            } else {
              setContactModalOpen(false);
              setSelectedContactForProfile(null); // Clear contact data after saving
            }
          }}
          onCreateTask={(task) => {
            // Create task from action items in Interactions tab
            // Helper to format minutes to string (e.g., 15 -> "15m", 90 -> "1h 30m")
            const formatMinutes = (mins?: number): string | undefined => {
              if (!mins) return undefined;
              const hours = Math.floor(mins / 60);
              const minutes = mins % 60;
              if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
              if (hours > 0) return `${hours}h`;
              return `${minutes}m`;
            };
            
            const newTask: Task = {
              id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              title: task.title,
              description: task.description || '',
              dueDate: task.dueDate || '',
              contact: task.contact,
              contactId: task.contact?.id,
              priority: task.priority || 'medium',
              status: task.status || 'toDo',
              estimatedTime: formatMinutes(task.estimatedTime || 15),
              taskType: task.taskType as any,
              createdAt: new Date().toISOString(),
              archived: false
            };
            
            console.log(`✅ [TASK CREATE] Creating task from Interactions tab:`, newTask);
            console.log(`✅ [TASK CREATE] tasksLoaded status:`, tasksLoaded);
            console.log(`✅ [TASK CREATE] Current tasks count:`, allTasks.length);
            
            setAllTasks(prev => {
              const updated = [...prev, newTask];
              console.log(`✅ [TASK CREATE] Updated tasks count:`, updated.length);
              return updated;
            });
            
            toast.success(`Task created: ${newTask.title}`, {
              description: `Added to your task list`,
              duration: 3000,
            });
          }}
        />
        <GoalModal
          isOpen={goalModalOpen}
          onClose={() => {
            setGoalModalOpen(false);
            setEditingGoal(undefined);
          }}
          goal={editingGoal}
          onSave={(goalData) => {
            if (editingGoal) {
              // Update existing goal
              setAllGoals(prev => prev.map(g => 
                g.id === editingGoal.id ? { ...g, ...goalData } as Goal : g
              ));
              toast.success('Goal updated');
            } else {
              // Create new goal
              const newGoal: Goal = {
                id: `goal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                title: goalData.title || '',
                status: goalData.status || 'toDo',
                timelineEntries: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };
              setAllGoals(prev => [...prev, newGoal]);
              toast.success('Goal created');
            }
            setGoalModalOpen(false);
            setEditingGoal(undefined);
          }}
        />
        <ContentPlanningWizard
          isOpen={contentModalOpen}
          onClose={() => setContentModalOpen(false)}
          onComplete={(content) => {
            console.log('Quick add content - wizard completed:', content);
            
            // Create a properly formatted content item
            const newContentItem = {
              id: Date.now().toString(),
              title: content.title || content.idea || 'Untitled Content',
              platform: content.platform || '',  // Don't default to 'LI Post' - let user decide
              length: content.length || 'Standard (250-500 words)',
              summary: content.summary || '',
              notes: content.notes || '',
              sourceUrl: content.sourceUrl || '',  // FIXED: Include sourceUrl from wizard
              sourceContent: content.sourceContent || '',  // FIXED: Include sourceContent from wizard
              audiences: content.audiences || [],
              goals: content.goals || [],
              status: content.startedDraftingAtISO ? 'Drafting' : 'Idea', // Set to Drafting if user chose "start drafting"
              tags: [],
              lastUpdated: new Date().toISOString(),
              createdOn: new Date().toISOString(),
              wordCount: 0,
              content: '',
              outline: content.notes || '',
              inWorkingOnNow: false,
              startedDraftingAtISO: content.startedDraftingAtISO || undefined // Include the drafting timestamp if set
            };
            
            console.log(`✅ Created new content item with sourceUrl: ${newContentItem.sourceUrl}`);
            
            // Add to content items list
            setAllContentItems(prev => [newContentItem, ...prev]);
            
            setContentModalOpen(false);
            
            // Navigate to content page - the page will handle opening the item in editor
            setCurrentPage('content');
            
            // Store the item ID so the content page can open it in editor mode
            // We'll use sessionStorage as a simple way to pass this data
            sessionStorage.setItem('openContentItemInEditor', newContentItem.id);
          }}
          onSaveAndClose={(content) => {
            console.log('Quick add content - partial save:', content);
            
            // Create a properly formatted content item
            const newContentItem = {
              id: Date.now().toString(),
              title: content.title || content.idea || 'Untitled Content',
              platform: content.platform || '',  // Don't default to 'LI Post' - let user decide
              length: content.length || 'Standard (250-500 words)',
              summary: content.summary || '',
              notes: content.notes || '',
              sourceUrl: content.sourceUrl || '',  // FIXED: Include sourceUrl from wizard
              sourceContent: content.sourceContent || '',  // FIXED: Include sourceContent from wizard
              audiences: content.audiences || [],
              goals: content.goals || [],
              status: 'Idea', // Fixed: should be capitalized to match ContentStatus type
              tags: [],
              lastUpdated: new Date().toISOString(),
              createdOn: new Date().toISOString(),
              wordCount: 0,
              content: '',
              outline: content.notes || '',
              inWorkingOnNow: false
            };
            
            console.log(`✅ Created new content item with sourceUrl: ${newContentItem.sourceUrl}`);
            
            // Add to content items list
            setAllContentItems(prev => [newContentItem, ...prev]);
            
            setContentModalOpen(false);
            
            // Navigate to content page
            setCurrentPage('content');
          }}
        />
        <StartMyTaskModal
          isOpen={startMyTaskModalOpen}
          onClose={() => {
            setStartMyTaskModalOpen(false);
            setTaskForStartModal(null);
          }}
          taskTitle={taskForStartModal?.title || ''}
          taskType={taskForStartModal?.taskType}
          taskDescription={taskForStartModal?.description}
          contact={taskForStartModal?.contact ? {
            id: taskForStartModal.contact.id,
            name: taskForStartModal.contact.name,
            email: allContacts.find(c => c.id === taskForStartModal.contact?.id)?.email,
            company: allContacts.find(c => c.id === taskForStartModal.contact?.id)?.company,
            schedulingUrl: allContacts.find(c => c.id === taskForStartModal.contact?.id)?.scheduling_link,
          } : undefined}
        />
        <MutedVoiceInputModal
          isOpen={voiceModalOpen}
          onClose={() => setVoiceModalOpen(false)}
          onTranscript={(text) => {
            console.log('Voice transcript:', text);
            // Open task modal with the transcript
            setVoiceModalOpen(false);
            // TODO: Parse the transcript and open task modal with pre-filled data
          }}
        />
        
        {/* Jamie Wizards */}
        {planDayWizardOpen && (
          <AMWizard
            tasks={(() => {
              // Filter tasks to only show those due today or overdue
              const today = getTodayLocal(); // Use getTodayLocal for consistency (YYYY-MM-DD format)
              console.log('🔍 AMWizard: Filtering tasks for today:', today);
              console.log('🔍 AMWizard: Total allTasks count:', allTasks.length);
              
              const todayTasks = allTasks.filter(task => {
                // Skip archived tasks
                if (task.archived) {
                  console.log('  ⏭️  Skipping archived task:', task.title);
                  return false;
                }
                
                // Skip completed tasks
                if (task.status === 'done') {
                  console.log('  ⏭️  Skipping done task:', task.title);
                  return false;
                }
                
                // If no due date, exclude from AM wizard
                if (!task.dueDate) {
                  console.log('  ⏭️  Skipping task with no due date:', task.title);
                  return false;
                }
                
                // Extract date part (YYYY-MM-DD) from dueDate - handle both YYYY-MM-DD and ISO formats
                let taskDateStr: string;
                if (typeof task.dueDate === 'string') {
                  // Handle ISO format (YYYY-MM-DDTHH:mm:ss) or simple YYYY-MM-DD
                  taskDateStr = task.dueDate.includes('T') ? task.dueDate.split('T')[0] : task.dueDate;
                } else {
                  // Handle Date object
                  const d = new Date(task.dueDate);
                  const year = d.getFullYear();
                  const month = String(d.getMonth() + 1).padStart(2, '0');
                  const day = String(d.getDate()).padStart(2, '0');
                  taskDateStr = `${year}-${month}-${day}`;
                }
                
                // Include if due today or overdue
                const isToday = taskDateStr === today;
                const isOverdue = taskDateStr < today;
                
                console.log(`  ${isToday || isOverdue ? '✅' : '❌'} Task: "${task.title}" | Due: ${taskDateStr} | Today: ${today} | Status: ${task.status} | Match: ${isToday ? 'TODAY' : isOverdue ? 'OVERDUE' : 'FUTURE'}`);
                
                return isToday || isOverdue;
              });
              
              console.log('📋 Total tasks for AM wizard:', todayTasks.length, 'out of', allTasks.length, 'total tasks');
              console.log('📋 Tasks included:', todayTasks.map(t => `"${t.title}" (${t.status})`).join(', '));
              // Add content items with today's publish date as "content" tasks
              const contentTodayTasks = allContentItems
                .filter(content => {
                  if (!content.publishDate) return false;
                  const publishDateStr = content.publishDate.includes('T') 
                    ? content.publishDate.split('T')[0] 
                    : content.publishDate;
                  return publishDateStr === today;
                })
                .map(content => ({
                  id: content.id,
                  title: `Publish: ${content.title}`,
                  taskType: 'content' as const,
                  status: 'todo' as const,
                  dueDate: content.publishDate,
                  estimatedTime: 30,
                  description: `${content.platform} - ${content.status}`
                }));
              
              console.log('📝 Content items due today:', contentTodayTasks.length);
              
              // Add nurtures due today as "nurture" tasks
              const nurtureTodayTasks = allNurtures
                .filter(nurture => {
                  if (!nurture.dueDate) return false;
                  const nurtureDateStr = nurture.dueDate.includes('T') 
                    ? nurture.dueDate.split('T')[0] 
                    : nurture.dueDate;
                  return nurtureDateStr === today && (nurture.status === 'pending' || nurture.status === 'toDo');
                })
                .map(nurture => ({
                  id: nurture.id,
                  title: `Nurture: ${nurture.contactName}`,
                  taskType: 'nurture' as const,
                  status: 'todo' as const,
                  dueDate: nurture.dueDate,
                  estimatedTime: 15,
                  description: `Reach out to ${nurture.contactName}`
                }));
              
              console.log('🌱 Nurtures due today:', nurtureTodayTasks.length);
              
              const allTodayItems = [...todayTasks, ...contentTodayTasks, ...nurtureTodayTasks];
              
              return allTodayItems;
            })()}
  
            onUpdateTask={(taskId, updates) => {
              console.log(`🔄 Updating task ${taskId} from AM wizard:`, updates);
              // Update the task in allTasks
              setAllTasks(prev => prev.map(t => {
                if (t.id === taskId) {
                  const updated = { ...t, ...updates };
                  // If status is being set to 'archived', also set the archived flag
                  if (updates.status === 'archived') {
                    updated.archived = true;
                  }
                  return updated;
                }
                return t;
              }));
            }}
            onClose={() => {
              // Clear any draft progress when closing without saving
              setDraftDayPlan(null);
              setPlanDayWizardOpen(false);
            }}
            onComplete={async (dayPlan) => {
              console.log('Plan Your Day completed:', dayPlan);
              
              // Save the schedule to state
              setTodaySchedule(dayPlan);
              
              // Clear draft since we completed
              setDraftDayPlan(null);
              
              // Update meetings with any new prep notes from AM wizard
              const updatedMeetingsFromPlan = dayPlan.scheduledBlocks
                ?.filter(block => block.type === 'meeting' && block.meeting)
                .map(block => block.meeting!);
              
              if (updatedMeetingsFromPlan && updatedMeetingsFromPlan.length > 0) {
                setUpcomingMeetings(prev => prev.map(m => {
                  const updated = updatedMeetingsFromPlan.find(um => um.id === m.id);
                  return updated ? { ...m, prepNotes: updated.prepNotes || m.prepNotes } : m;
                }));
              }
              
              // Convert AM wizard schedule to timeline activities and save to KV store
              try {
                console.log('📅 Using selected start time from wizard:', dayPlan.startTime);
                
                // Convert scheduled blocks to timeline activities using their own start times
                const activities = dayPlan.scheduledBlocks?.map((block, index) => ({
                  id: `activity-${Date.now()}-${index}`,
                  type: block.type === 'meeting' ? 'meeting' : block.type === 'task' ? 'task' : 'custom',
                  title: block.name || block.meeting?.title || block.task?.title || 'Untitled',
                  startTime: block.startTime || dayPlan.startTime, // Use block's time or wizard's start time
                  duration: block.duration || 60,
                  isCompleted: false,
                  isJamieAdded: block.type === 'meeting',
                  calendarEventId: block.meeting?.id,
                  manualContactName: block.name
                })) || [];
                
                console.log('📅 Saving timeline activities from AM wizard:', activities);
                
                // Save to KV store
                if (projectId && publicAnonKey) {
                  const url = `https://${projectId}.supabase.co/functions/v1/make-server-a89809a8/kv/timeline_activities`;
                  console.log('💾 Attempting to save to:', url);
                  
                  const response = await fetch(url, {
                    method: 'PUT',
                    headers: {
                      'Authorization': `Bearer ${publicAnonKey}`,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ value: activities })
                  });
                  
                  if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    console.error('Failed to save timeline activities:', response.status, errorData);
                  } else {
                    console.log('✅ Timeline activities saved from wizard');
                  }
                } else {
                  console.log('⚠️ Supabase credentials not available, skipping save');
                }
              } catch (error) {
                console.error('Error saving timeline activities:', error);
                // Silently fail - don't block wizard from closing
              }
              
              setPlanDayWizardOpen(false);
            }}
            onSaveProgress={(partialPlan) => {
              console.log('💾 Saving partial day plan progress:', partialPlan);
              setDraftDayPlan(partialPlan);
              toast.success('Progress saved! You can continue where you left off.');
            }}
            existingPlan={draftDayPlan}
            meetings={(todaysCalendarEvents || []).map((event: any) => {
  const matchingContact = event.contact
    ? findContactForEvent(event, allContacts)
    : null;

  const contactDetails = matchingContact || event.contactDetails || event.contact || null;

  const hasValidTitle =
    event.title &&
    event.title.trim() &&
    !event.title.includes('@');

  const meetingTitle = hasValidTitle
    ? event.title
    : contactDetails?.name || 'Untitled Meeting';

  return {
    id: event.id,
    title: meetingTitle,
    startTime: event.startTime ? new Date(event.startTime) : new Date(),
    endTime: event.endTime ? new Date(event.endTime) : new Date(),
    isDemoData: event.isDemoData || false,
    contacts: contactDetails?.name
      ? [{
          id: contactDetails.id || contactDetails.email || event.id,
          name: contactDetails.name,
          initials: contactDetails.initials,
          color: contactDetails.color || '#6b7b98',
          imageUrl: contactDetails.imageUrl,
        }]
      : [],
  };
})}
         onUpdateMeeting={(meetingId, updates) => {
  console.log('Meeting update requested from AMWizard:', meetingId, updates);
}}
          
            contacts={allContacts}
            onContactClick={(contact) => {
              setSelectedContactForProfile(contact);
              setContactModalOpen(true);
            }}
          />
        )}
        
        <PMWizard
          isOpen={windDownWizardOpen}
          onClose={() => setWindDownWizardOpen(false)}
          onComplete={() => {
            console.log('Wind Down completed');
            setWindDownWizardOpen(false);
          }}
          meetings={(todaysCalendarEvents || []).map((event: any) => {
  const matchingContact = event.contact
    ? findContactForEvent(event, allContacts)
    : null;

  const contactDetails = matchingContact || event.contactDetails || event.contact || null;

  const hasValidTitle =
    event.title &&
    event.title.trim() &&
    !event.title.includes('@');

  const meetingTitle = hasValidTitle
    ? event.title
    : contactDetails?.name || 'Untitled Meeting';

  return {
    id: event.id,
    title: meetingTitle,
    startTime: event.startTime ? new Date(event.startTime) : new Date(),
    endTime: event.endTime ? new Date(event.endTime) : new Date(),
    isDemoData: event.isDemoData || false,
    contacts: contactDetails?.name
      ? [{
          id: contactDetails.id || contactDetails.email || event.id,
          name: contactDetails.name,
          initials: contactDetails.initials,
          color: contactDetails.color || '#6b7b98',
          imageUrl: contactDetails.imageUrl,
        }]
      : [],
  };
})}
          tasks={(() => {
            // Get all tasks due today for review
            const today = getTodayLocal();
            const todayTasks = allTasks
              .filter(t => {
                if (!t.dueDate) return false;
                if (t.status === 'done') return false; // Skip completed tasks
                const taskDateStr = t.dueDate.split('T')[0];
                return taskDateStr === today;
              })
              .map(t => ({
                ...t,
                taskType: t.taskType || 'task',
              }));
            
            // Add content items with today's publish date
            const contentTodayTasks = allContentItems
              .filter(content => {
                if (!content.publishDate) return false;
                const publishDateStr = content.publishDate.includes('T') 
                  ? content.publishDate.split('T')[0] 
                  : content.publishDate;
                return publishDateStr === today;
              })
              .map(content => ({
                id: content.id,
                title: `Publish: ${content.title}`,
                taskType: 'content' as const,
                status: 'todo' as const,
                dueDate: content.publishDate,
                estimatedTime: 30,
                description: `${content.platform} - ${content.status}`
              }));
            
            // Add nurtures due today
            const nurtureTodayTasks = allNurtures
              .filter(nurture => {
                if (!nurture.dueDate) return false;
                const nurtureDateStr = nurture.dueDate.includes('T') 
                  ? nurture.dueDate.split('T')[0] 
                  : nurture.dueDate;
                return nurtureDateStr === today && (nurture.status === 'pending' || nurture.status === 'toDo');
              })
              .map(nurture => ({
                id: nurture.id,
                title: `Nurture: ${nurture.contactName}`,
                taskType: 'nurture' as const,
                status: 'todo' as const,
                dueDate: nurture.dueDate,
                estimatedTime: 15,
                description: `Reach out to ${nurture.contactName}`
              }));
            
            return [...todayTasks, ...contentTodayTasks, ...nurtureTodayTasks];
          })()}
          onUpdateTask={(taskId, updates) => {
            // Update the task in allTasks
            setAllTasks(prev => prev.map(t => {
              if (t.id === taskId) {
                const updated = { ...t, ...updates };
                // If status is being set to 'archived', also set the archived flag
                if (updates.status === 'archived') {
                  updated.archived = true;
                }
                return updated;
              }
              return t;
            }));
            console.log('Task updated in Wind Down:', taskId, updates);
          }}
          onContactClick={(contact) => {
            setSelectedContactForProfile(contact);
            setContactModalOpen(true);
          }}
          onCreateTask={(task) => {
            // Create task from PM wizard dossier
            const newTask: Task = {
              id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              title: task.title,
              description: task.description || '',
              dueDate: task.dueDate,
              status: task.status || 'toDo',
              estimatedTime: task.estimatedTime || 30,
              contact: task.contact,
              taskType: task.taskType || 'task',
              createdAt: new Date().toISOString()
            };
            
            setAllTasks(prev => [...prev, newTask]);
            
            console.log(`✅ Task created from PM wizard: "${newTask.title}" (${newTask.estimatedTime} mins, contact: ${task.contact?.name || 'none'})`);
          }}
        />
        
        {/* Post-Meeting Notes Wizard */}
        {postMeetingWizardOpen && selectedPostMeetingData && (
          <MutedPostMeetingWizard
            isOpen={postMeetingWizardOpen}
            meeting={{
              id: selectedPostMeetingData.id || 'meeting-unknown',
              title: selectedPostMeetingData.title || 'Untitled Meeting',
              description: selectedPostMeetingData.description || '',
              date: selectedPostMeetingData.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
              time: (() => {
                // Format time properly - handle both Date objects and strings
                const timeValue = selectedPostMeetingData.startTime || selectedPostMeetingData.time;
                if (!timeValue) return '12:00 PM';
                if (typeof timeValue === 'string') return timeValue;
                // If it's a Date object, format it
                const date = new Date(timeValue);
                return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
              })(),
              endTime: (() => {
                // Format end time properly - handle both Date objects and strings
                const endTimeValue = selectedPostMeetingData.endTime;
                if (!endTimeValue) return '';
                if (typeof endTimeValue === 'string') return endTimeValue;
                // If it's a Date object, format it
                const date = new Date(endTimeValue);
                return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
              })(),
              contact: (() => {
                // Try to find matching contact from allContacts for full details
                const eventContact = selectedPostMeetingData.contact || selectedPostMeetingData.attendees?.[0];
                if (!eventContact) return { name: 'Unknown', id: 'unknown' };
                
                // Find matching contact by ID or email
                const matchingContact = allContacts.find(c => 
                  c.id === eventContact.id || 
                  c.email?.toLowerCase() === eventContact.email?.toLowerCase() ||
                  c.name === eventContact.name
                );
                
                if (matchingContact) {
                  return {
                    id: matchingContact.id,
                    name: matchingContact.name,
                    email: matchingContact.email,
                    initials: matchingContact.initials,
                    color: matchingContact.color,
                    imageUrl: matchingContact.imageUrl,
                    nurtureFrequency: matchingContact.nurtureFrequency,
                  };
                }
                
                // Return basic contact info if no match found
                return typeof eventContact === 'string' 
                  ? { name: eventContact, id: 'unknown' }
                  : eventContact;
              })()
            }}
            onClose={() => {
              setPostMeetingWizardOpen(false);
              setSelectedPostMeetingData(null);
            }}
            onComplete={(data) => {
              console.log('Post-meeting notes completed:', data);
              setPostMeetingWizardOpen(false);
            }}
            onNavigateToContact={(contactName) => {
              // Find the contact and open their profile
              const contact = allContacts.find(c => c.name === contactName);
              if (contact) {
                setCurrentPage('contacts');
                setSelectedContactForProfile(contact);
                setPostMeetingWizardOpen(false);
              }
            }}
            onUpdateContactNurture={(contactId, frequency) => {
              // 🎯 PHASE 5 PROMPT 10: Update the contact's nurture frequency
              setAllContacts(prev => prev.map(c => 
                c.id === contactId 
                  ? { ...c, nurtureFrequency: frequency, nurtureStartDate: new Date().toISOString() }
                  : c
              ));
              console.log(`✅ Updated nurture frequency for contact ${contactId} to ${frequency} weeks`);
            }}
            onCreateTask={(task) => {
              // 🎯 PHASE 5 PROMPT 10: Create task and add to App state
              // Helper to format minutes to string
              const formatMinutes = (mins?: number): string | undefined => {
                if (!mins) return undefined;
                const hours = Math.floor(mins / 60);
                const minutes = mins % 60;
                if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
                if (hours > 0) return `${hours}h`;
                return `${minutes}m`;
              };
              
              const newTask: Task = {
                id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                title: task.title,
                description: task.description || '',
                dueDate: task.dueDate || '',
                contact: task.contact,
                contactId: task.contact?.id, // Denormalized for easy lookup
                priority: task.priority || 'medium',
                status: task.status || 'toDo',
                estimatedTime: formatMinutes(task.estimatedTime || 15), // 🎯 Default 15 mins
                taskType: task.taskType as any, // Jamie's attempted task type
                createdAt: new Date().toISOString(),
                archived: false
              };
              
              // Add to allTasks state
              setAllTasks(prev => [...prev, newTask]);
              
              console.log(`✅ Task created from post-meeting wizard: "${newTask.title}" (${newTask.estimatedTime} mins, contact: ${task.contact?.name || 'none'})`);
            }}
            onCreateNurture={(nurture) => {
              // 🎯 PHASE 5 PROMPT 10: Create nurture and add to App state
              const newNurture: NurtureToDo = {
                id: `nurture-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                contactId: nurture.contactId,
                contactName: nurture.contactName,
                dueDate: nurture.dueDate,
                type: nurture.type,
                priority: nurture.priority || false,
                status: 'pending',
                createdAt: new Date().toISOString()
              };
              
              // Add to allNurtureToDos state
              setAllNurtureToDos(prev => [...prev, newNurture]);
              
              console.log(`✅ Nurture created from post-meeting wizard: ${newNurture.contactName} (due: ${newNurture.dueDate})`);
            }}
            contacts={allContacts.filter(c => !exampleContacts.some(ex => ex.id === c.id))} // Filter out demo contacts
          />
        )}
        
        {/* Jamie Chat Panel */}
        <MutedJamieChatPanel
          isOpen={jamieChatOpen}
          onClose={() => {
            setJamieChatOpen(false);
            setCurrentPage('today');
          }}
          currentPage={currentPage}
          selectedItem={selectedItem}
          messages={chatMessages}
          onSendMessage={handleSendChatMessage}
          onExecuteAction={handleExecuteChatAction}
        />
        
        {/* 🎯 PHASE 5 PROMPT 11: Jamie Calendar Change Dialog */}
        {showScheduleChangeDialog && scheduleProposal && (
          <JamieCalendarChangeDialog
            isOpen={showScheduleChangeDialog}
            onClose={() => setShowScheduleChangeDialog(false)}
            proposal={scheduleProposal}
            onAccept={(acceptedBlocks) => {
              console.log('✅ Accepted schedule proposal:', acceptedBlocks);
              // Save the accepted blocks for today
              setScheduleBlocks(prev => ({
                ...prev,
                [scheduleProposal.date]: acceptedBlocks
              }));
              setShowScheduleChangeDialog(false);
            }}
            onReject={() => {
              console.log('❌ Rejected schedule proposal');
              setShowScheduleChangeDialog(false);
            }}
          />
        )}
        
        {/* DISABLED: Fathom Sync Prompt - User prefers manual workflow */}
        {/* {fathomSyncPromptMeeting && (
          <FathomSyncPrompt
            meeting={fathomSyncPromptMeeting}
            onSyncAndStartWizard={handleFathomSyncAndStartWizard}
            onSkipSyncAndStartWizard={handleFathomSkipSyncAndStartWizard}
            onDismissAndCreateMinimalInteraction={handleFathomDismissAndCreateMinimalInteraction}
            onSnooze={handleFathomSnooze}
            onClose={() => setFathomSyncPromptMeeting(null)}
          />
        )} */}
        
        {/* Meeting Selector for manual post-meeting wizard */}
        {meetingSelectorOpen && (
          <MeetingSelector
            meetings={calendarEvents}
            onSelect={handleManualPostMeetingWizard}
            onClose={() => setMeetingSelectorOpen(false)}
          />
        )}
        
        {/* 🎯 Contact Suggestion System */}
        {/* Banner disabled per user request - keeps reappearing 
        <ContactSuggestionBanner 
          onViewSuggestions={handleViewContactSuggestions}
          onSnooze={handleSnoozeBanner}
          onDismiss={handleDismissBanner}
        />
        */}
        
        <ContactSuggestionModal
          isOpen={contactSuggestionModalOpen}
          onClose={() => setContactSuggestionModalOpen(false)}
          onStartAdding={handleStartAddingContacts}
        />
        
        <ContactQueueProgressDialog
          isOpen={contactQueueProgressOpen}
          onClose={() => setContactQueueProgressOpen(false)}
          currentContact={getCurrentContact()}
          remainingCount={getTotalPendingCount()}
          onContinue={handleContinueToNextContact}
          onSnooze={handleSnoozeQueue}
          onDismiss={handleDismissQueue}
        />
        
        <Toaster position="top-center" />
      </NotificationProvider>
    </InteractionsProvider>
  );
}

export default function AppWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}