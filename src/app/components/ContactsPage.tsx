import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Grid3x3, Table, Sprout, Upload, ChevronDown, Users, Archive, X, Star, Calendar } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ContactProfileModal } from "./ContactProfileModal";
import { brandColors, mutedRainbow } from "../lib/colors";
import { CSVContactUpload } from "./CSVContactUpload";
import { MutedTaskModal } from "./muted_TaskModal";
import { PageHeader_Muted } from "./PageHeader_Muted";
import { MutedPostMeetingWizard } from "./muted_PostMeetingWizard";
import { ContactsTableView } from "./ContactsTableView";
import type { Service } from "../App";
import { exampleContacts } from "../data/contacts";
import { sortContactsByLastName, getLastName } from "../utils/contactSorting";

export interface Contact {
  id: string;
  name: string;
  initials: string;
  email?: string;
  phone?: string;
  company?: string;
  companyWebsite?: string;
  role?: string;
  contactType?: 'prospect' | 'client' | 'network';
  from?: string;
  about?: string;
  linkedinUrl?: string;
  schedulingUrl?: string;
  city?: string;
  state?: string;
  tags?: string[];
  notes?: string;
  upcomingMeetings?: number;
  activeTasks?: number;
  contentItems?: number;
  lastContact?: string;
  nextCallDate?: string; // ISO string of next scheduled meeting/call
  color?: string;
  archived?: boolean;
  priority?: boolean; // Star/priority flag
  taskStatusCounts?: { // Task counts by status for display in table view
    toDo: number;
    inProgress: number;
    awaitingReply: number;
    done: number;
  };
  imageUrl?: string; // Avatar image URL
  // Nurture fields
  nurtureFrequency?: 2 | 4 | 6 | 8 | 10 | 12; // Nurture frequency in weeks
  nurtureStartDate?: string; // ISO string of when nurture schedule started
}

const sampleContacts: Contact[] = [];

interface QuickAddPostConsultData {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  role?: string;
  linkedinUrl?: string;
}

interface ContactsPageProps {
  contacts?: Contact[];
  onUpdateContacts?: (contacts: Contact[]) => void;
  onSaveTask?: (taskData: any) => void;
  tasks?: any[];
  onTaskClick?: (task: any) => void;
  selectedContactFromNav?: Contact | null;
  recentlyViewedContactIds?: string[];
  onContactViewed?: (contactId: string) => void;
  onOpenTaskModal?: (task?: any, prefilledContact?: string) => void;
  onQuickAddSelect?: (type: 'task' | 'contact' | 'content' | 'voice') => void;
  onJamieAction?: (type: 'plan-day' | 'post-meeting' | 'wind-down' | 'chat') => void;
  calendarEvents?: any[]; // Calendar events for auto-syncing next call dates
  onNavigateToNurtures?: () => void; // Navigate to nurtures view
  services?: Service[];
  onNavigateToForms?: (preselectedContactId?: string, preselectedContactName?: string) => void; // Navigate to forms page with optional pre-selected contact
  onCaptureMeetingNotes?: (meeting: any) => void; // Open post-meeting wizard
  onBack?: () => void; // Back navigation handler
}

export function ContactsPage({ contacts: propContacts = [], onUpdateContacts, onSaveTask, tasks = [], onTaskClick, selectedContactFromNav, recentlyViewedContactIds = [], onContactViewed, onOpenTaskModal, onQuickAddSelect, onJamieAction, calendarEvents = [], onNavigateToNurtures, services = [], onNavigateToForms, onCaptureMeetingNotes, onBack }: ContactsPageProps = {}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [isCSVUploadOpen, setIsCSVUploadOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"az" | "activeTasks" | "nextCall" | "nurtureSchedule" | "priority">("az");
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [filterByType, setFilterByType] = useState<"all" | "Prospect" | "Client" | "Network">("all");
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  
  // Modal states for task, content, meeting creation from contact profile
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [prefilledContactName, setPrefilledContactName] = useState("");
  const [meetingContactForLog, setMeetingContactForLog] = useState<Contact | null>(null);
  
  // Create a stable key for ContactProfileModal that changes when tasks update
  const tasksVersion = useMemo(() => {
    // Create a hash of all task IDs, statuses, and dueDates
    return tasks.map(t => `${t.id}-${t.status}-${t.dueDate}`).join('|');
  }, [tasks]);
  
  // Handle selectedContactFromNav to open contact profile automatically
  useEffect(() => {
    if (selectedContactFromNav) {
      setSelectedContact(selectedContactFromNav);
      setIsProfileOpen(true);
    } else {
      // When selectedContactFromNav is cleared, also clear local state
      setSelectedContact(null);
      setIsProfileOpen(false);
    }
  }, [selectedContactFromNav]);

  // Always use prop contacts - App.tsx manages persistence
  const contacts = propContacts;
  const setContacts = (updater: Contact[] | ((prev: Contact[]) => Contact[])) => {
    const newContacts = typeof updater === 'function' ? updater(contacts) : updater;
    console.log('📝 ContactsPage updating contacts:', newContacts);
    if (onUpdateContacts) {
      onUpdateContacts(newContacts);
    }
  };

  // Detect if we're showing demo/example contacts only
  const isShowingOnlyDemoData = useMemo(() => {
    if (contacts.length === 0) return false;
    if (contacts.length > 10) return false; // Unlikely to be demo data if more than 10 contacts
    // Check if all contacts are from exampleContacts
    return contacts.every(contact => 
      exampleContacts.some(ex => ex.id === contact.id || ex.name === contact.name)
    );
  }, [contacts]);
  
  // Enrich contacts with task counts and auto-sync next call from calendar
  const enrichedContacts = useMemo(() => {
    return contacts.map(contact => {
      // Count tasks for this contact - ONLY non-done and non-archived tasks
      const contactTasks = tasks.filter(task => {
        if (!task.contact) return false;
        if (task.status === 'done' || task.archived) return false; // FIX: Don't count done or archived tasks
        // Handle both string and object contact formats
        const contactName = typeof task.contact === 'string' 
          ? task.contact 
          : task.contact.name;
        return contactName?.toLowerCase() === contact.name.toLowerCase();
      });

      const taskStatusCounts = {
        toDo: contactTasks.filter(t => t.status === 'toDo').length,
        inProgress: contactTasks.filter(t => t.status === 'inProgress').length,
        awaitingReply: contactTasks.filter(t => t.status === 'awaitingReply').length,
        done: contactTasks.filter(t => t.status === 'done').length,
      };

      // Auto-sync next call date from Google Calendar
      let nextCallDate = contact.nextCallDate;
      if (calendarEvents.length > 0) {
        const now = new Date();
        const upcomingEvents = calendarEvents
          .filter(event => {
            // Check if event is in the future
            if (new Date(event.startTime) <= now) return false;
            
            // PRIORITY 1: Check if event was manually assigned to this contact (via contactDetails.id)
            if (event.contactDetails?.id === contact.id) {
              return true;
            }
            
            // PRIORITY 2: Check if contact's email is in the event (as contact or attendee)
            if (contact.email) {
              const hasContactEmail = 
                event.contact?.email?.toLowerCase() === contact.email.toLowerCase() ||
                event.attendees?.some((email: string) => email.toLowerCase() === contact.email.toLowerCase());
              
              return hasContactEmail;
            }
            
            return false;
          })
          .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
        
        // Use the next upcoming event if found
        if (upcomingEvents[0]) {
          nextCallDate = new Date(upcomingEvents[0].startTime).toISOString();
        }
      }

      return {
        ...contact,
        taskStatusCounts,
        nextCallDate, // Auto-synced from calendar
      };
    });
  }, [contacts, tasks, calendarEvents]);

  const sortContacts = (contactsToSort: Contact[]) => {
    const sorted = [...contactsToSort];
    
    switch (sortBy) {
      case "az":
        return sortContactsByLastName(sorted);
      case "activeTasks":
        return sorted.sort((a, b) => {
          const aTotal = (a.taskStatusCounts?.toDo || 0) + (a.taskStatusCounts?.inProgress || 0) + (a.taskStatusCounts?.awaitingReply || 0);
          const bTotal = (b.taskStatusCounts?.toDo || 0) + (b.taskStatusCounts?.inProgress || 0) + (b.taskStatusCounts?.awaitingReply || 0);
          return bTotal - aTotal;
        });
      case "nextCall":
        return sorted.sort((a, b) => {
          if (!a.nextCallDate) return 1;
          if (!b.nextCallDate) return -1;
          return new Date(a.nextCallDate).getTime() - new Date(b.nextCallDate).getTime();
        });
      case "nurtureSchedule":
        return sorted.sort((a, b) => {
          if (!a.nextNurtureDate) return 1;
          if (!b.nextNurtureDate) return -1;
          return new Date(a.nextNurtureDate).getTime() - new Date(b.nextNurtureDate).getTime();
        });
      case "priority":
        return sorted.sort((a, b) => {
          // Priority contacts first (true comes before false)
          if (a.priority && !b.priority) return -1;
          if (!a.priority && b.priority) return 1;
          // If both have same priority status, sort by last name
          const lastNameA = getLastName(a.name).toLowerCase();
          const lastNameB = getLastName(b.name).toLowerCase();
          return lastNameA.localeCompare(lastNameB);
        });
      default:
        return sorted;
    }
  };

  const filteredContacts = sortContacts(
    enrichedContacts
      .filter(c => !c.archived)
      .filter(c => {
        // Filter by contact type
        if (filterByType !== "all" && c.location !== filterByType) {
          return false;
        }
        // Filter by search query
        return (
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      })
  );

  const handleContactClick = (contact: Contact) => {
    setSelectedContact(contact);
    setIsProfileOpen(true);
    if (onContactViewed) {
      onContactViewed(contact.id);
    }
  };

  const handleArchiveContact = (contactId: string) => {
    setContacts(contacts.map(c => 
      c.id === contactId ? { ...c, archived: !c.archived } : c
    ));
  };

  const handleToggleSelection = (contactId: string) => {
    setSelectedContactIds(prev => 
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedContactIds.length === filteredContacts.length) {
      setSelectedContactIds([]);
    } else {
      setSelectedContactIds(filteredContacts.map(c => c.id));
    }
  };

  const handleBatchArchive = () => {
    setContacts(contacts.map(c => 
      selectedContactIds.includes(c.id) ? { ...c, archived: !c.archived } : c
    ));
    setSelectedContactIds([]);
  };

  const handleTogglePriority = (contactId: string) => {
    setContacts(contacts.map(c => 
      c.id === contactId ? { ...c, priority: !c.priority } : c
    ));
  };

  const handleQuickAddPostConsult = (data: QuickAddPostConsultData) => {
    console.log("💾 Quick Add Post-Consult:", data);
    
    // Generate initials
    const nameParts = data.name.split(' ');
    const initials = nameParts.length > 1 
      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
      : data.name.slice(0, 2).toUpperCase();
    
    // Generate a color
    const colors = mutedRainbow;
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    // Create new contact
    const newContact: Contact = {
      id: `contact-${Date.now()}`,
      name: data.name,
      initials,
      email: data.email,
      phone: data.phone,
      company: data.company,
      role: data.role,
      contactType: 'network',
      linkedinUrl: data.linkedinUrl,
      color,
      archived: false
    };
    
    setContacts([...contacts, newContact]);
    
    // Open the contact profile to continue editing/adding more details
    setSelectedContact(newContact);
    setIsProfileOpen(true);
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main Contacts List */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <PageHeader_Muted
          title="Contacts"
          newButtonLabel="New Contact"
          newButtonColor="#8ba5a8"
          onNewClick={() => {
            setSelectedContact(null);
            setIsAddingContact(true);
            setIsProfileOpen(true);
          }}
          /* Commented out until Post-Consult Add feature is implemented
          customActions={
            <button 
              className="flex items-center gap-2 px-4 py-2.5 h-10 rounded-[20px] text-white hover:opacity-90 shadow-soft transition-all border-2 border-white/30"
              style={{ backgroundColor: '#8ba5a8' }}
              onClick={() => setIsQuickAddPostConsultOpen(true)}
            >
              <Plus className="w-4 h-4" />
              <span className="font-medium">Post-Consult Add</span>
            </button>
          }
          */
          onQuickAddSelect={onQuickAddSelect}
          onJamieAction={onJamieAction}
          onBack={onBack}
          showBackButton={!!onBack}
        />

        {/* Filter/Sort Bar */}
        <div className="backdrop-blur-xl border-b border-slate-200/50 px-8" style={{ backgroundColor: '#F7F7F9' }}>
          {/* Main toolbar row */}
          <div className="py-[18px] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search contacts, companies, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-11 pl-12 pr-4 rounded-2xl border-slate-200/60 bg-white/60 backdrop-blur-sm focus:bg-white focus:border-slate-300 transition-all shadow-soft"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-slate-100/60 backdrop-blur-sm p-1.5 rounded-2xl shadow-soft">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`h-8 px-4 rounded-xl font-medium transition-all ${
                    viewMode === "grid"
                      ? "bg-white text-slate-900 shadow-soft"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                  }`}
                >
                  <Grid3x3 className="w-4 h-4 inline mr-1.5" />
                  Grid
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`h-8 px-4 rounded-xl font-medium transition-all ${
                    viewMode === "table"
                      ? "bg-white text-slate-900 shadow-soft"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                  }`}
                >
                  <Table className="w-4 h-4 inline mr-1.5" />
                  Table
                </button>
              </div>

              <Button
                onClick={onNavigateToNurtures}
                className="h-11 px-4 rounded-2xl text-white font-medium shadow-soft hover:opacity-90 transition-all"
                style={{ backgroundColor: "#8fa890" }}
              >
                <Sprout className="w-4 h-4 mr-2" />
                Nurtures
              </Button>

              <Button
                onClick={() => setIsCSVUploadOpen(true)}
                className="h-11 px-4 rounded-2xl text-white font-medium shadow-soft hover:opacity-90 transition-all"
                style={{ backgroundColor: "#8ba5a8" }}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload CSV
              </Button>
            </div>
          </div>

          {/* Expandable Filters and Sorting Section */}
          <div className="pb-[18px]">
            <button
              onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white/50 transition-all text-sm font-medium"
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${isFiltersExpanded ? 'rotate-180' : ''}`} />
              Filters and Sorting
              {(filterByType !== "all" || sortBy !== "az") && (
                <span className="ml-1 px-2 py-0.5 bg-slate-300/50 text-slate-700 rounded-full text-xs">
                  Active
                </span>
              )}
            </button>

            {isFiltersExpanded && (
              <div className="mt-3 p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-slate-200/50">
                <div className="flex items-center gap-6">
                  {/* Contact Type Filter */}
                  <div className="flex-1">
                    <label className="text-xs font-medium text-slate-600 mb-2 block">Contact Type</label>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setFilterByType("all")}
                        className={`h-8 px-4 rounded-xl font-medium transition-all text-sm ${
                          filterByType === "all"
                            ? "bg-slate-900 text-white shadow-soft"
                            : "bg-white/70 text-slate-600 hover:text-slate-900 hover:bg-white border border-slate-200/50"
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setFilterByType("Prospect")}
                        className={`h-8 px-4 rounded-xl font-medium transition-all text-sm ${
                          filterByType === "Prospect"
                            ? "bg-slate-900 text-white shadow-soft"
                            : "bg-white/70 text-slate-600 hover:text-slate-900 hover:bg-white border border-slate-200/50"
                        }`}
                      >
                        Prospects
                      </button>
                      <button
                        onClick={() => setFilterByType("Client")}
                        className={`h-8 px-4 rounded-xl font-medium transition-all text-sm ${
                          filterByType === "Client"
                            ? "bg-slate-900 text-white shadow-soft"
                            : "bg-white/70 text-slate-600 hover:text-slate-900 hover:bg-white border border-slate-200/50"
                        }`}
                      >
                        Clients
                      </button>
                      <button
                        onClick={() => setFilterByType("Network")}
                        className={`h-8 px-4 rounded-xl font-medium transition-all text-sm ${
                          filterByType === "Network"
                            ? "bg-slate-900 text-white shadow-soft"
                            : "bg-white/70 text-slate-600 hover:text-slate-900 hover:bg-white border border-slate-200/50"
                        }`}
                      >
                        Network
                      </button>
                    </div>
                  </div>

                  {/* Sort Dropdown */}
                  <div className="flex-1">
                    <label className="text-xs font-medium text-slate-600 mb-2 block">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="h-9 px-4 pr-9 bg-white/70 border border-slate-200/50 rounded-xl font-medium text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300/50 cursor-pointer transition-all hover:bg-white w-full appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23475569%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:16px] bg-[right_0.75rem_center] bg-no-repeat"
                    >
                      <option value="az">A-Z</option>
                      <option value="activeTasks">Active Tasks</option>
                      <option value="nextCall">Next Call</option>
                      <option value="nurtureSchedule">Nurture Schedule</option>
                      <option value="priority">Priority</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Batch Actions Toolbar */}
        {selectedContactIds.length > 0 && (
          <div className="bg-slate-100/80 backdrop-blur-sm border-b border-slate-200/50 px-8 py-4">
            <div className="flex items-center justify-between">
              <p className="font-medium text-slate-700">
                {selectedContactIds.length} contact{selectedContactIds.length !== 1 ? 's' : ''} selected
              </p>
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleBatchArchive}
                  variant="outline"
                  className="rounded-2xl border-slate-300/60 text-slate-700 hover:bg-white shadow-soft"
                >
                  <Archive className="w-4 h-4 mr-2" />
                  Archive Selected
                </Button>
                <Button
                  onClick={() => setSelectedContactIds([])}
                  variant="ghost"
                  className="rounded-2xl text-slate-600 hover:text-slate-900 hover:bg-white/60"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Contacts Grid */}
        <div className="flex-1 overflow-y-auto p-8 bg-[rgb(247,247,249)]">
          {/* Demo Data Recovery Banner - Shows when only demo contacts are present */}
          {isShowingOnlyDemoData && (
            <div className="mb-6 p-5 bg-yellow-50 border-2 border-yellow-200 rounded-2xl shadow-soft">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-yellow-700" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-yellow-900 mb-1">
                    🔍 Your contacts may have been lost
                  </h3>
                  <p className="text-sm text-yellow-800 mb-4">
                    You're currently viewing demo data. If your real contacts disappeared, you can try to recover them from backups.
                  </p>
                  <button
                    onClick={() => window.location.href = '?page=contact-recovery'}
                    className="px-5 py-2.5 bg-yellow-600 text-white text-sm font-semibold rounded-xl hover:bg-yellow-700 transition-colors shadow-soft"
                  >
                    Open Contact Recovery Tool
                  </button>
                </div>
                <button
                  onClick={(e) => {
                    e.currentTarget.parentElement?.parentElement?.remove();
                  }}
                  className="flex-shrink-0 p-2 hover:bg-yellow-100 rounded-lg transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4 text-yellow-700" />
                </button>
              </div>
            </div>
          )}
          
          {filteredContacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-12 border border-slate-200/50 shadow-soft max-w-lg">
                <Users className="w-16 h-16 mb-4 opacity-20 text-slate-400 mx-auto" />
                <p className="text-lg font-medium mb-2 text-slate-700">No contacts found</p>
                <p className="text-slate-500 mb-4">
                  {searchQuery ? "Try adjusting your search" : "Add your first contact to get started"}
                </p>
                {!searchQuery && contacts.length <= 5 && (
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-left">
                    <p className="text-sm font-medium text-yellow-900 mb-2">🔍 Missing your contacts?</p>
                    <p className="text-sm text-yellow-800 mb-3">
                      If your contacts disappeared, you can try to recover them from backups.
                    </p>
                    <button
                      onClick={() => window.location.href = '?page=contact-recovery'}
                      className="w-full px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                      Open Recovery Tool
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredContacts.map((contact) => (
                  <ContactCard
                    key={contact.id}
                    contact={contact}
                    onClick={() => handleContactClick(contact)}
                    onArchive={() => handleArchiveContact(contact.id)}
                    onTogglePriority={() => handleTogglePriority(contact.id)}
                  />
                ))}
              </div>
            ) : (
              <ContactsTableView
                contacts={filteredContacts}
                recentlyViewedContactIds={recentlyViewedContactIds}
                onContactClick={handleContactClick}
                onArchive={handleArchiveContact}
                onTogglePriority={handleTogglePriority}
                onToggleSelection={handleToggleSelection}
                selectedContactIds={selectedContactIds}
                onToggleSelectAll={handleToggleSelectAll}
              />
            )
          )}
        </div>
      </div>

      {/* Contact Profile Sidebar */}
      {isProfileOpen && (
        <ContactProfileModal
          key={`${selectedContact?.id}-${tasksVersion}`}
          contact={selectedContact}
          isOpen={isProfileOpen}
          onClose={() => {
            setIsProfileOpen(false);
            setSelectedContact(null);
            setIsAddingContact(false);
          }}
          onSave={(contact) => {
            console.log("💾 ContactsPage: Saving contact:", contact);
            if (contact.id) {
              // Update existing - use the contact's ID, not selectedContact
              console.log("✏️ Updating existing contact with ID:", contact.id);
              setContacts(contacts.map(c => c.id === contact.id ? contact : c));
            } else {
              // Add new - generate ID only if contact doesn't have one
              console.log("➕ Creating new contact");
              const newContact = { ...contact, id: `contact-${Date.now()}` };
              setContacts([...contacts, newContact]);
            }
            setIsProfileOpen(false);
            setSelectedContact(null);
            setIsAddingContact(false);
          }}
          onUpdateContact={(contact) => {
            // Update contact without closing modal (for in-place edits like notes)
            console.log("📝 ContactsPage: Updating contact in place:", contact);
            if (contact.id) {
              setContacts(contacts.map(c => c.id === contact.id ? contact : c));
              // Update the selected contact so the modal reflects the saved data
              setSelectedContact(contact);
            }
          }}
          onArchive={selectedContact ? () => {
            handleArchiveContact(selectedContact.id);
            setIsProfileOpen(false);
          } : undefined}
          isNew={isAddingContact}
          onOpenTaskModal={(contactName) => {
            // Call the parent handler to open the main task modal with prefilled contact
            if (onOpenTaskModal) {
              onOpenTaskModal(undefined, contactName);
            }
            // Close the contact profile modal
            setIsProfileOpen(false);
          }}
          onOpenMeetingModal={(contactName) => {
            const contact = contacts.find(c => c.name === contactName);
            if (contact) {
              setMeetingContactForLog(contact);
              setIsMeetingModalOpen(true);
            }
          }}
          onOpenFlowWizard={(contactId, contactName) => {
            // Navigate to forms page and trigger flow wizard with pre-selected contact
            if (onNavigateToForms) {
              onNavigateToForms(contactId, contactName);
            }
            // Close the contact profile modal
            setIsProfileOpen(false);
          }}
          tasks={tasks}
          onTaskClick={(task) => {
            // Open the task modal in edit mode
            if (onOpenTaskModal) {
              onOpenTaskModal(task);
            }
            // Close the contact profile modal
            setIsProfileOpen(false);
          }}
          calendarEvents={calendarEvents}
          services={services}
          onCaptureMeetingNotes={onCaptureMeetingNotes}
        />
      )}

      {/* CSV Upload Modal */}
      {isCSVUploadOpen && (
        <CSVContactUpload
          isOpen={isCSVUploadOpen}
          onClose={() => setIsCSVUploadOpen(false)}
          onImport={(newContacts) => {
            const contactsToAdd = newContacts.map(c => ({
              ...c,
              id: `${Date.now()}-${Math.random()}`,
            } as Contact));
            setContacts([...contacts, ...contactsToAdd]);
          }}
        />
      )}

      {/* Task Modal - for creating tasks from contact profile */}
      <MutedTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setPrefilledContactName("");
        }}
        prefilledContact={prefilledContactName}
        onSave={(task) => {
          console.log("Task created from contact:", task);
          if (onSaveTask) {
            onSaveTask(task);
          }
        }}
      />

      {/* Post-Meeting Wizard - for logging meetings from contact profile */}
      {isMeetingModalOpen && meetingContactForLog && (
        <MutedPostMeetingWizard
          isOpen={isMeetingModalOpen}
          onClose={() => {
            setIsMeetingModalOpen(false);
            setMeetingContactForLog(null);
          }}
          meeting={{
            id: `meeting-${Date.now()}`,
            title: `Meeting with ${meetingContactForLog.name}`,
            description: '',
            date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
            contact: { 
              name: meetingContactForLog.name, 
              id: meetingContactForLog.id 
            }
          }}
          onComplete={(data) => {
            console.log('Meeting logged:', data);
            setIsMeetingModalOpen(false);
            setMeetingContactForLog(null);
          }}
          onNavigateToContact={(contactName) => {
            // Close wizard and open contact profile
            setIsMeetingModalOpen(false);
            const contact = contacts.find(c => c.name === contactName);
            if (contact) {
              setSelectedContact(contact);
              setIsProfileOpen(true);
            }
          }}
        />
      )}
    </div>
  );
}

function ContactCard({ 
  contact, 
  onClick,
  onArchive,
  onTogglePriority
}: { 
  contact: Contact;
  onClick: () => void;
  onArchive: () => void;
  onTogglePriority: () => void;
}) {
  const taskCounts = contact.taskStatusCounts || { toDo: 0, inProgress: 0, awaitingReply: 0 };
  const hasTasks = taskCounts.toDo > 0 || taskCounts.inProgress > 0 || taskCounts.awaitingReply > 0;

  return (
    <div
      className="bg-white/70 backdrop-blur-sm border border-slate-200/50 rounded-3xl p-6 hover:shadow-lg hover:border-slate-300/70 hover:bg-white/90 transition-all cursor-pointer group relative"
      onClick={onClick}
    >
      {/* Archive button - Top Right */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onArchive();
        }}
        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-slate-100/80 rounded-2xl z-10"
        title={contact.archived ? "Unarchive" : "Archive"}
      >
        <Archive className="w-4 h-4 text-slate-400" />
      </button>

      {/* Left-justified layout with 2 columns */}
      <div className="flex gap-4">
        {/* Left Column: Avatar with Star */}
        <div className="flex-shrink-0 relative">
          <Avatar className="w-16 h-16 border-2" style={{ borderColor: contact.color }}>
            {contact.imageUrl ? (
              <AvatarImage src={contact.imageUrl} alt={contact.name} />
            ) : (
              <AvatarFallback 
                className="text-white font-medium text-lg"
                style={{ backgroundColor: contact.color }}
              >
                {contact.initials}
              </AvatarFallback>
            )}
          </Avatar>
          {/* Star button hugging the avatar perimeter */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTogglePriority();
            }}
            className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-soft hover:bg-gray-50 transition-colors"
            title={contact.priority ? "Remove priority" : "Mark as priority"}
          >
            <Star 
              className={`w-4 h-4 transition-colors ${
                contact.priority 
                  ? 'fill-amber-400 text-amber-400' 
                  : 'text-gray-300'
              }`}
            />
          </button>
        </div>

        {/* Right Column: Contact Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 mb-1">{contact.name}</h3>
          
          {contact.role && (
            <p className="text-xs text-slate-600 mb-0.5">{contact.role}</p>
          )}
          {contact.company && (
            <p className="text-xs text-slate-500 mb-3">{contact.company}</p>
          )}

          {/* Next Call Date - Auto-synced from Calendar */}
          {contact.nextCallDate && (() => {
            const date = new Date(contact.nextCallDate);
            const now = new Date();
            const isToday = date.toDateString() === now.toDateString();
            const isTomorrow = date.toDateString() === new Date(now.getTime() + 86400000).toDateString();
            
            let displayText = date.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit'
            });
            
            if (isToday) displayText = `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
            if (isTomorrow) displayText = `Tomorrow, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
            
            return (
              <div className="mb-3 pb-3 border-b border-slate-200/50">
                <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#6484a1]" />
                  Next Call
                </p>
                <p className="font-medium text-slate-900">{displayText}</p>
              </div>
            );
          })()}

          {/* Task Status Indicators */}
          {hasTasks && (
            <div className="flex items-center gap-2">
              {taskCounts.toDo > 0 && (
                <div className="flex items-center gap-1" title={`${taskCounts.toDo} To Do`}>
                  <div 
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium shadow-soft"
                    style={{ backgroundColor: '#d6a0a9' }}
                  >
                    {taskCounts.toDo}
                  </div>
                </div>
              )}
              {taskCounts.inProgress > 0 && (
                <div className="flex items-center gap-1" title={`${taskCounts.inProgress} In Progress`}>
                  <div 
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium shadow-soft"
                    style={{ backgroundColor: '#e4b9ab' }}
                  >
                    {taskCounts.inProgress}
                  </div>
                </div>
              )}
              {taskCounts.awaitingReply > 0 && (
                <div className="flex items-center gap-1" title={`${taskCounts.awaitingReply} Awaiting Reply`}>
                  <div 
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium shadow-soft"
                    style={{ backgroundColor: '#e1d6cb' }}
                  >
                    {taskCounts.awaitingReply}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}