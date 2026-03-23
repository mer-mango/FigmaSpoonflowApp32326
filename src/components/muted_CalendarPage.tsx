import { useState, useEffect, useMemo } from "react";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Search,
  Filter,
  CheckSquare,
  FileText,
  Sprout,
  Maximize2,
  Minimize2,
  Video,
  Star,
  Sparkles,
  Pin,
  Home,
  Pencil,
  X
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { calendarColors } from "../lib/colors";
import { CalendarEvent, CalendarSource } from "./CalendarPage";
import { Task } from "./TasksPage";
import { ContentItem } from "../types/content";
import { NurtureToDo } from "./muted_NurturesView";
import { Contact } from "./ContactsPage";
import { sortContactsByLastName } from '../utils/contactSorting';
import { enrichCalendarEventsWithContacts } from "../utils/contactCalendarSync";
import { WeekView } from "./muted_WeekView";
import { PageHeader_Muted } from "./PageHeader_Muted";
import { 
  getMeetingsForDay, 
  getTasksForDay, 
  getContentForDay, 
  getNurturesForDay,
  toDateKey 
} from "../utils/dateIndex";
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner';

// Helper function to convert URLs in text to clickable links
function linkifyText(text: string, colorClass: string = "text-[#7ab8d1] hover:text-white") {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  
  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className={`${colorClass} hover:underline underline break-all`}
        >
          {part}
        </a>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

interface MutedCalendarPageProps {
  events?: CalendarEvent[];
  tasks?: Task[];
  content?: ContentItem[];
  nurtures?: NurtureToDo[];
  contacts?: Contact[];
  manualContactAssignments?: Record<string, string>;
  onEventClick?: (event: CalendarEvent) => void;
  onTaskClick?: (task: Task) => void;
  onContentClick?: (content: ContentItem) => void;
  onNurtureClick?: (nurture: NurtureToDo) => void;
  onOpenTaskModal?: (task?: Task) => void;
  onQuickAddSelect?: (type: 'task' | 'contact' | 'content' | 'voice') => void;
  onJamieAction?: (type: 'plan-day' | 'post-meeting' | 'wind-down' | 'chat') => void;
  onContactClick?: (contactId: string) => void;
  onAssignContact?: (eventId: string, contactId: string | null) => Promise<void>;
  onBack?: () => void;
}

// Sample events
const sampleEvents: CalendarEvent[] = [
  // Today's events
  {
    id: "today-1",
    title: "Team Standup",
    startTime: new Date(2024, 11, 6, 9, 0),
    endTime: new Date(2024, 11, 6, 9, 30),
    calendarId: "ehs",
    calendarName: "EHS Meetings",
    color: calendarColors.ehs,
    contact: { name: "Dev Team", initials: "DT" },
    description: "Daily standup with development team",
    link: "https://meet.google.com/abc-defg-hij"
  },
  {
    id: "today-2",
    title: "Doctor Appointment",
    startTime: new Date(2024, 11, 6, 11, 0),
    endTime: new Date(2024, 11, 6, 12, 0),
    calendarId: "medical",
    calendarName: "Medical Appointments",
    color: calendarColors.medical,
    location: "Medical Center",
  },
  {
    id: "today-3",
    title: "Client Meeting - Sarah Wilson",
    startTime: new Date(2024, 11, 6, 14, 0),
    endTime: new Date(2024, 11, 6, 15, 30),
    calendarId: "ehs",
    calendarName: "EHS Meetings",
    color: calendarColors.ehs,
    contact: { name: "Sarah Wilson", initials: "SW" },
    link: "https://zoom.us/j/123456789"
  },
  {
    id: "today-4",
    title: "Virtual Consultation",
    startTime: new Date(2024, 11, 6, 16, 0),
    endTime: new Date(2024, 11, 6, 16, 45),
    calendarId: "virtual",
    calendarName: "Virtual Appointments",
    color: calendarColors.virtual,
    location: "Zoom",
  },
  // Tomorrow
  {
    id: "tom-1",
    title: "Product Review",
    startTime: new Date(2024, 11, 7, 10, 0),
    endTime: new Date(2024, 11, 7, 11, 30),
    calendarId: "ehs",
    calendarName: "EHS Meetings",
    color: calendarColors.ehs,
    contact: { name: "Product Team", initials: "PT" },
  },
  {
    id: "tom-2",
    title: "Lunch with Alex",
    startTime: new Date(2024, 11, 7, 12, 30),
    endTime: new Date(2024, 11, 7, 13, 30),
    calendarId: "personal",
    calendarName: "Personal",
    color: calendarColors.personal,
    location: "Downtown Cafe",
  },
  // Dec 10
  {
    id: "dec10-1",
    title: "Sprint Planning",
    startTime: new Date(2024, 11, 10, 9, 0),
    endTime: new Date(2024, 11, 10, 10, 30),
    calendarId: "ehs",
    calendarName: "EHS Meetings",
    color: calendarColors.ehs,
    contact: { name: "Dev Team", initials: "DT" },
  },
];

// Sample tasks with due dates
const sampleTasks: Task[] = [
  {
    id: "task-1",
    title: "Review design mockups",
    status: "toDo",
    dueDate: "2024-12-06",
    priority: "high",
    createdAt: new Date().toISOString(),
  },
  {
    id: "task-2",
    title: "Update documentation",
    status: "toDo",
    dueDate: "2024-12-06",
    createdAt: new Date().toISOString(),
  },
  {
    id: "task-3",
    title: "Prepare presentation",
    status: "toDo",
    dueDate: "2024-12-07",
    createdAt: new Date().toISOString(),
  },
  {
    id: "task-4",
    title: "Follow up with client",
    status: "toDo",
    dueDate: "2024-12-10",
    priority: "high",
    createdAt: new Date().toISOString(),
  },
];

export function MutedCalendarPage({ 
  events: propEvents, 
  tasks: propTasks, 
  content: propContent,
  nurtures: propNurtures,
  contacts: propContacts = [],
  manualContactAssignments: propManualAssignments = {},
  onEventClick, 
  onTaskClick, 
  onContentClick,
  onNurtureClick,
  onOpenTaskModal,
  onQuickAddSelect,
  onJamieAction,
  onContactClick,
  onAssignContact,
  onBack
}: MutedCalendarPageProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  
  // Fetch real calendars from Google
  const [calendarSources, setCalendarSources] = useState<CalendarSource[]>([
    { id: "ehs", name: "EHS Meetings", color: calendarColors.ehs, enabled: true, synced: true, type: "google" },
    { id: "medical", name: "Medical Appointments", color: calendarColors.medical, enabled: true, synced: true, type: "google" },
    { id: "virtual", name: "Virtual Appointments", color: calendarColors.virtual, enabled: true, synced: true, type: "google" },
    { id: "cbc", name: "CBC", color: calendarColors.cbc, enabled: true, synced: true, type: "google" },
    { id: "commongrounds", name: "Common Grounds", color: calendarColors.commonGrounds, enabled: true, synced: false, type: "google" },
    { id: "life", name: "Life", color: calendarColors.life, enabled: true, synced: true, type: "google" },
    { id: "personal", name: "Personal", color: calendarColors.personal, enabled: true, synced: true, type: "google" },
  ]);
  const [isLoadingCalendars, setIsLoadingCalendars] = useState(false);
  const [googleCalendarEvents, setGoogleCalendarEvents] = useState<CalendarEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  
  // Track which event is being edited for contact assignment
  const [editingContactForEvent, setEditingContactForEvent] = useState<string | null>(null);
  
  // Fetch user's actual Google calendars
  useEffect(() => {
    // 🔧 FIX: Don't fetch calendars if propEvents are provided - use calendar IDs from events instead
    if (propEvents && propEvents.length > 0) {
      console.log('📅 [CALENDAR PAGE] Skipping calendar fetch - using propEvents');
      
      // Build calendar sources from the events themselves
      const calendarMap = new Map<string, CalendarSource>();
      propEvents.forEach(event => {
        if (!calendarMap.has(event.calendarId)) {
          calendarMap.set(event.calendarId, {
            id: event.calendarId,
            name: event.calendarName || event.calendarId,
            color: event.color || calendarColors.ehs,
            enabled: true,
            synced: true,
            type: "google" as const
          });
        }
      });
      
      const sourcesFromEvents = Array.from(calendarMap.values());
      console.log('📅 [CALENDAR PAGE] Built calendar sources from events:', sourcesFromEvents);
      console.log('📅 [CALENDAR PAGE] Sample event colors:', propEvents.slice(0, 3).map(e => ({ title: e.title, color: e.color, calendarId: e.calendarId })));
      setCalendarSources(sourcesFromEvents);
      
      // Set enabled calendars to all calendar IDs from events
      const enabledIds = sourcesFromEvents.map(c => c.id);
      console.log('📅 [CALENDAR PAGE] Setting enabled calendars from events:', enabledIds);
      setEnabledCalendars(enabledIds);
      
      return; // Don't fetch from server
    }
    
    const fetchCalendars = async () => {
      try {
        console.log('📅 [CALENDAR PAGE] Starting to fetch calendars...');
        setIsLoadingCalendars(true);
        const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-a89809a8`;
        console.log('📅 [CALENDAR PAGE] Server URL:', serverUrl);
        
        const response = await fetch(`${serverUrl}/calendar/list`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        });
        
        console.log('📅 [CALENDAR PAGE] Calendar list response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('📅 Fetched real calendars:', data.calendars);
          console.log('📅 [CALENDAR PAGE] Sample calendar object:', data.calendars?.[0]);
          
          // Transform to CalendarSource format
          const realCalendars: CalendarSource[] = data.calendars.map((cal: any, index: number) => ({
            id: cal.id,
            name: cal.name,
            color: cal.color,
            enabled: cal.selected,
            synced: true,
            type: "google" as const
          }));
          
          console.log('📅 [CALENDAR PAGE] Transformed calendars:', realCalendars.length);
          console.log('📅 [CALENDAR PAGE] Real calendar IDs:', realCalendars.map(c => c.id));
          console.log('📅 [CALENDAR PAGE] Setting calendar sources NOW');
          
          if (realCalendars.length > 0) {
            setCalendarSources(realCalendars);
            // ALSO set enabled calendars immediately!
            const enabledIds = realCalendars.filter(c => c.enabled).map(c => c.id);
            console.log('📅 [CALENDAR PAGE] Setting enabled calendars:', enabledIds);
            setEnabledCalendars(enabledIds);
            console.log('✅ [CALENDAR PAGE] Calendar sources SET!');
          } else {
            console.log('❌ [CALENDAR PAGE] No calendars to set - array is empty');
          }
        } else {
          const errorText = await response.text();
          console.log('📅 Not connected to Google Calendar or error fetching, using default calendars. Status:', response.status, 'Error:', errorText);
        }
      } catch (error) {
        console.error('Failed to fetch calendars:', error);
      } finally {
        setIsLoadingCalendars(false);
      }
    };
    
    console.log('📅 [CALENDAR PAGE] useEffect for calendars triggered');
    fetchCalendars();
  }, [propEvents]);
  
  // Fetch events from Google Calendar
  useEffect(() => {
    // 🔧 FIX: Don't fetch events if propEvents are provided - App.tsx is managing the events
    if (propEvents && propEvents.length > 0) {
      console.log('📅 [EVENTS] Skipping event fetch - using propEvents from App.tsx');
      setGoogleCalendarEvents([]); // Clear internal state, rely on propEvents
      return;
    }
    
    const fetchEvents = async () => {
      try {
        console.log('📅 [EVENTS] Starting to fetch events...');
        console.log('📅 [EVENTS] Calendar sources:', calendarSources.length, 'Loading:', isLoadingCalendars);
        
        setIsLoadingEvents(true);
        const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-a89809a8`;
        console.log('📅 [EVENTS] Server URL:', serverUrl);
        
        const response = await fetch(`${serverUrl}/calendar/events`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        });
        
        console.log('📅 [EVENTS] Events response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('📅 Fetched real events:', data.events?.length || 0, 'events');
          console.log('📅 [EVENTS] Raw event data:', data);
          
          // Find calendar source for each event to get the color
          const calendarColorMap: Record<string, string> = {};
          calendarSources.forEach(cal => {
            calendarColorMap[cal.id] = cal.color;
          });
          
          console.log('📅 [EVENTS] Calendar color map:', calendarColorMap);
          console.log('📅 [EVENTS] Sample event:', data.events?.[0]);
          
          try {
            // Helper function to generate proper initials from a name
            const generateInitials = (name: string): string => {
              if (!name) return '??';
              
              // If it's an email, extract name before @ and use first 2 chars
              if (name.includes('@')) {
                const emailName = name.split('@')[0];
                return emailName.slice(0, 2).toUpperCase();
              }
              
              // Split by space and take first letter of first and last name
              const parts = name.trim().split(/\s+/);
              if (parts.length >= 2) {
                return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
              }
              
              // Single name - take first 2 letters
              return name.slice(0, 2).toUpperCase();
            };
            
            // Find the primary contact (not the current user)
            const findPrimaryContact = (attendees: any[], organizerEmail: string) => {
              if (!attendees || attendees.length === 0) return null;
              
              // Try to find an attendee that's not the organizer and not the current user
              const otherAttendee = attendees.find(a => 
                a.email && 
                a.email !== organizerEmail &&
                a.email !== 'meredith@empowerhealthstrategies.com' && // Filter out user's email
                !a.self // Not the current user
              );
              
              const contactAttendee = otherAttendee || attendees.find(a => !a.self) || attendees[0];
              if (!contactAttendee) return null;
              
              // Match attendee email to a contact in SpoonFlow
              const matchedContact = propContacts.find(c => 
                c.email?.toLowerCase() === contactAttendee.email?.toLowerCase()
              );
              
              // Use contact name from SpoonFlow if found, otherwise use displayName or email
              const contactName = matchedContact?.name || contactAttendee.displayName || contactAttendee.email;
              
              return {
                name: contactName,
                email: contactAttendee.email,
                initials: matchedContact?.initials || generateInitials(contactName)
              };
            };
            
            // Transform to CalendarEvent format
            const realEvents: CalendarEvent[] = (data.events || []).map((event: any) => {
              const calendarColor = calendarColorMap[event.calendarId] || '#63829f';
              const primaryContact = findPrimaryContact(event.attendees, event.organizer?.email);
              
              return {
                id: event.id,
                title: event.summary || '(No title)', // Always use the meeting title, not contact name
                startTime: new Date(event.start.dateTime || event.start.date),
                endTime: new Date(event.end.dateTime || event.end.date),
                calendarId: event.calendarId,
                calendarName: calendarSources.find(c => c.id === event.calendarId)?.name || 'Calendar',
                color: calendarColor,
                location: event.location,
                description: event.description,
                link: event.hangoutLink || event.conferenceData?.entryPoints?.find((ep: any) => ep.entryPointType === 'video')?.uri,
                contact: primaryContact,
                attendees: event.attendees?.map((a: any) => a.email).filter(Boolean) || []
              };
            });
            
            console.log(`✅ Transformed ${realEvents.length} Google Calendar events`);
            console.log('📅 [EVENTS] Sample transformed event:', realEvents[0]);
            setGoogleCalendarEvents(realEvents);
            
            // 📦 Also update the calendar events cache that useGoogleCalendarMeetings hook reads from
            try {
              localStorage.setItem('googleCalendarEvents', JSON.stringify(realEvents));
              console.log('📦 Updated googleCalendarEvents cache with', realEvents.length, 'events for AMWizard');
              console.log('📦 Sample cached event:', realEvents[0]);
              console.log('📦 Sample event startTime type:', typeof realEvents[0]?.startTime);
            } catch (e) {
              console.error('Failed to update calendar events cache:', e);
            }
          } catch (transformError) {
            console.error('❌ Error transforming events:', transformError);
            setGoogleCalendarEvents([]);
          }
        } else {
          console.log('📅 Not connected to Google Calendar or error fetching events');
          setGoogleCalendarEvents([]);
        }
      } catch (error) {
        console.log('📅 Calendar events fetch failed (calendar may not be connected):', error);
        // Don't show error - just use empty events
        setGoogleCalendarEvents([]);
      } finally {
        setIsLoadingEvents(false);
      }
    };
    
    // Only fetch if we have calendar sources loaded AND propEvents are not provided
    if (calendarSources.length > 0 && !isLoadingCalendars && (!propEvents || propEvents.length === 0)) {
      fetchEvents();
    }
  }, [calendarSources, isLoadingCalendars, propEvents]);
  
  // 🎯 ENRICH CALENDAR EVENTS with contact details for UI display
  const enrichedGoogleCalendarEvents = useMemo(() => {
    if (googleCalendarEvents.length === 0 || propContacts.length === 0) {
      return googleCalendarEvents;
    }
    console.log('📅 Enriching', googleCalendarEvents.length, 'calendar events with', propContacts.length, 'contacts');
    return enrichCalendarEventsWithContacts(googleCalendarEvents, propContacts, propManualAssignments);
  }, [googleCalendarEvents, propContacts, propManualAssignments]);
  
  // Use real props if provided, otherwise fallback to enriched Google events or samples
  const events = propEvents !== undefined ? propEvents : (enrichedGoogleCalendarEvents.length > 0 ? enrichedGoogleCalendarEvents : sampleEvents);
  const tasks = propTasks !== undefined ? propTasks : sampleTasks;
  const content = propContent !== undefined ? propContent : [];
  const nurtures = propNurtures !== undefined ? propNurtures : [];
  
  console.log('🔍 MutedCalendarPage render - content items:', content.length);
  console.log('🎨 VERSION CHECK - UPDATED AT 10:47 AM - Peach pills should be #a8998f');
  console.log('📅 [RENDER] Events source:', propEvents ? 'propEvents' : (enrichedGoogleCalendarEvents.length > 0 ? 'enrichedGoogleCalendarEvents' : 'sampleEvents'));
  console.log('📅 [RENDER] Events count:', events.length);
  console.log('📅 [RENDER] Sample event colors:', events.slice(0, 3).map(e => ({ title: e.title, color: e.color, calendarId: e.calendarId })));
  
  const [enabledCalendars, setEnabledCalendars] = useState<string[]>([]);
  
  // Update enabled calendars when sources change
  useEffect(() => {
    if (calendarSources.length > 0) {
      const enabledIds = calendarSources.filter(c => c.enabled).map(c => c.id);
      console.log('📅 [ENABLED CALENDARS] Updating from calendarSources:', enabledIds);
      setEnabledCalendars(enabledIds);
    }
  }, [calendarSources]);
  
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMaximized, setIsMaximized] = useState(false);
  const [priorityDates, setPriorityDates] = useState<Set<string>>(new Set());

  const filteredEvents = events
    .filter(e => !e.archived)
    // 🔧 FIX: Only filter by enabled calendars if we have calendars loaded
    // If enabledCalendars is empty, show all events (don't filter them out)
    .filter(e => enabledCalendars.length === 0 || enabledCalendars.includes(e.calendarId))
    .filter(e => 
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.contact?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  
  console.log('📅 [FILTER] ========== FILTER DEBUG ==========');
  console.log('📅 [FILTER] Enabled calendars:', enabledCalendars);
  console.log('📅 [FILTER] Total events before filter:', events.length);
  console.log('📅 [FILTER] Filtered events after all filters:', filteredEvents.length);
  console.log('📅 [FILTER] Sample event calendarId:', events[0]?.calendarId);
  console.log('📅 [FILTER] Does sample event match enabled?:', enabledCalendars.includes(events[0]?.calendarId));
  console.log('📅 [FILTER] First 3 enabled calendar IDs:', enabledCalendars.slice(0, 3));

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (view === "day") {
      newDate.setDate(newDate.getDate() - 1);
      setSelectedDate(newDate); // Update selected date too
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (view === "day") {
      newDate.setDate(newDate.getDate() + 1);
      setSelectedDate(newDate); // Update selected date too
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const handleSyncCalendar = async () => {
    toast.success('Syncing with Google Calendar...', { duration: 2000 });
    
    try {
      // 📊 CAPTURE PREVIOUS STATE for change detection
      const previousEvents = [...googleCalendarEvents];
      
      // Refresh calendars
      setIsLoadingCalendars(true);
      const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-a89809a8`;
      const response = await fetch(`${serverUrl}/calendar/list`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const realCalendars: CalendarSource[] = data.calendars.map((cal: any) => ({
          id: cal.id,
          name: cal.name,
          color: cal.color,
          enabled: cal.selected,
          synced: true,
          type: "google" as const
        }));
        
        if (realCalendars.length > 0) {
          setCalendarSources(realCalendars);
          const enabledIds = realCalendars.filter(c => c.enabled).map(c => c.id);
          setEnabledCalendars(enabledIds);
        }
      }
      
      // Refresh events
      setIsLoadingEvents(true);
      const eventsResponse = await fetch(`${serverUrl}/calendar/events`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        const calendarColorMap: Record<string, string> = {};
        calendarSources.forEach(cal => {
          calendarColorMap[cal.id] = cal.color;
        });
        
        const realEvents: CalendarEvent[] = (eventsData.events || []).map((event: any) => {
          const calendarColor = calendarColorMap[event.calendarId] || '#63829f';
          
          return {
            id: event.id,
            title: event.summary || '(No title)',
            startTime: new Date(event.start.dateTime || event.start.date),
            endTime: new Date(event.end.dateTime || event.end.date),
            calendarId: event.calendarId,
            calendarName: calendarSources.find(c => c.id === event.calendarId)?.name || 'Calendar',
            color: calendarColor,
            location: event.location,
            description: event.description,
            contact: event.attendees && event.attendees.length > 0 ? {
              name: event.attendees[0].displayName || event.attendees[0].email,
              initials: (event.attendees[0].displayName || event.attendees[0].email).slice(0, 2).toUpperCase(),
              email: event.attendees[0].email
            } : undefined,
            // ⭐ Include attendees array for contact matching
            attendees: event.attendees?.map((a: any) => a.email).filter(Boolean) || []
          };
        });
        
        // 🔍 Log sample event with attendees for debugging
        if (realEvents.length > 0) {
          console.log('📧 Sample calendar event with attendees:', {
            title: realEvents[0].title,
            attendees: realEvents[0].attendees,
            contact: realEvents[0].contact
          });
        }
        
        // 🔍 DETECT CHANGES
        const previousEventIds = new Set(previousEvents.map(e => e.id));
        const newEventIds = new Set(realEvents.map(e => e.id));
        
        const addedEvents = realEvents.filter(e => !previousEventIds.has(e.id));
        const removedEvents = previousEvents.filter(e => !newEventIds.has(e.id));
        
        // Detect modified events (same ID but different time)
        const modifiedEvents = realEvents.filter(newEvent => {
          const oldEvent = previousEvents.find(e => e.id === newEvent.id);
          if (!oldEvent) return false;
          return oldEvent.startTime.getTime() !== newEvent.startTime.getTime() ||
                 oldEvent.endTime.getTime() !== newEvent.endTime.getTime();
        });
        
        setGoogleCalendarEvents(realEvents);
        
        // 📦 Also update the calendar events cache that useGoogleCalendarMeetings hook reads from
        try {
          localStorage.setItem('googleCalendarEvents', JSON.stringify(realEvents));
          console.log('📦 Updated googleCalendarEvents cache with', realEvents.length, 'events for AMWizard');
        } catch (e) {
          console.error('Failed to update calendar events cache:', e);
        }
        
        // 🎯 SHOW DETAILED SYNC NOTIFICATION
        const changes: string[] = [];
        if (addedEvents.length > 0) changes.push(`${addedEvents.length} added`);
        if (modifiedEvents.length > 0) changes.push(`${modifiedEvents.length} changed`);
        if (removedEvents.length > 0) changes.push(`${removedEvents.length} removed`);
        
        if (changes.length > 0) {
          toast.success(`Calendar synced! ${changes.join(', ')}`);
          console.log('📅 Calendar changes:', {
            added: addedEvents.map(e => e.title),
            modified: modifiedEvents.map(e => e.title),
            removed: removedEvents.map(e => e.title)
          });
        } else {
          toast.success('Calendar synced successfully! No changes detected.');
        }
      }
    } catch (error) {
      console.error('Failed to sync calendar:', error);
      toast.error('Failed to sync calendar');
    } finally {
      setIsLoadingCalendars(false);
      setIsLoadingEvents(false);
    }
  };

  const togglePriorityDate = (date: Date) => {
    const dateStr = date.toDateString();
    const newPriorityDates = new Set(priorityDates);
    if (newPriorityDates.has(dateStr)) {
      newPriorityDates.delete(dateStr);
    } else {
      newPriorityDates.add(dateStr);
    }
    setPriorityDates(newPriorityDates);
  };

  return (
    <div className="flex h-full overflow-hidden" style={{ backgroundColor: '#EBF0F2' }}>
      {/* Main Calendar Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <PageHeader_Muted
          title="Calendar"
          onQuickAddSelect={onQuickAddSelect}
          onJamieAction={onJamieAction}
          onBack={onBack}
          showBackButton={!!onBack}
        />

        {/* Filter/Sort Bar */}
        <div className="backdrop-blur-xl border-b border-slate-200/50 px-8 py-[18px]" style={{ backgroundColor: '#F7F7F9' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Date Navigation */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                  className="h-10 w-10 p-0 rounded-[16px] border-slate-200/70 bg-white/70 backdrop-blur-sm hover:bg-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <div className="min-w-[200px] text-center">
                  <p className="font-medium text-slate-900">
                    {view === "day"
                      ? currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })
                      : view === "week" 
                        ? `Week of ${currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                        : currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                    }
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNext}
                  className="h-10 w-10 p-0 rounded-[16px] border-slate-200/70 bg-white/70 backdrop-blur-sm hover:bg-white"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleToday}
                className="h-10 rounded-[20px] border-slate-200/70 bg-white/70 backdrop-blur-sm hover:bg-white"
              >
                Today
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleSyncCalendar}
                disabled={isLoadingCalendars || isLoadingEvents}
                className="h-10 rounded-[20px] border-[#5e2350] bg-gradient-to-br from-[#5e2350] to-[#5e2350]/90 hover:from-[#5e2350]/95 hover:to-[#5e2350]/85 text-white flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                <CalendarIcon className="w-4 h-4" />
                {isLoadingCalendars || isLoadingEvents ? 'Syncing...' : 'Sync Calendar'}
              </Button>

              {/* View Selector with Filters */}
              <div className="flex items-center gap-1 bg-white/70 backdrop-blur-sm p-1.5 rounded-[20px] border border-slate-200/50">
                <button
                  onClick={() => setView("day")}
                  className={`px-4 py-2 rounded-[16px] text-sm font-medium transition-all ${
                    view === "day"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Day
                </button>
                <button
                  onClick={() => setView("week")}
                  className={`px-4 py-2 rounded-[16px] text-sm font-medium transition-all ${
                    view === "week"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => setView("month")}
                  className={`px-4 py-2 rounded-[16px] text-sm font-medium transition-all ${
                    view === "month"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 rounded-[16px] text-sm font-medium transition-all text-slate-600 hover:text-slate-900 flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64 h-10 rounded-[20px] border-slate-200/70 bg-white/70 backdrop-blur-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <div className="px-8 py-4" style={{
            background: 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(148, 163, 184, 0.15)'
          }}>
            <div className="grid grid-cols-4 gap-6">
              {/* Calendar Sources */}
              <div className="col-span-4">
                <label className="font-medium text-sm text-slate-700 mb-3 block">Calendar Sources</label>
                <div className="flex flex-wrap gap-3">
                  {calendarSources.map((cal) => (
                    <button
                      key={cal.id}
                      onClick={async () => {
                        const newEnabledCalendars = enabledCalendars.includes(cal.id)
                          ? enabledCalendars.filter(id => id !== cal.id)
                          : [...enabledCalendars, cal.id];
                        
                        setEnabledCalendars(newEnabledCalendars);
                        
                        // Update calendar sources state
                        setCalendarSources(prev => prev.map(c => 
                          c.id === cal.id ? { ...c, enabled: !c.enabled } : c
                        ));
                        
                        // Save to server
                        try {
                          const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-a89809a8`;
                          await fetch(`${serverUrl}/calendar/select`, {
                            method: 'POST',
                            headers: {
                              'Authorization': `Bearer ${publicAnonKey}`,
                              'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ calendarIds: newEnabledCalendars })
                          });
                          console.log('✅ Saved calendar selection');
                          
                          // Trigger a manual sync to reload events from the newly selected calendars
                          console.log('🔄 Triggering calendar sync after selection change...');
                          await handleSyncCalendar();
                        } catch (error) {
                          console.error('Failed to save calendar selection:', error);
                        }
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-[16px] text-sm transition-all border ${
                        enabledCalendars.includes(cal.id)
                          ? 'bg-white border-slate-300 shadow-sm'
                          : 'bg-white/50 border-slate-200/50'
                      }`}
                    >
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: cal.color }} 
                      />
                      <span className={enabledCalendars.includes(cal.id) ? 'text-slate-900' : 'text-slate-500'}>
                        {cal.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Split View Content */}
        <div className="flex-1 overflow-hidden">
          <SplitView 
            events={filteredEvents}
            tasks={tasks}
            content={content}
            nurtures={nurtures}
            contacts={propContacts}
            currentDate={currentDate}
            selectedDate={selectedDate}
            view={view}
            onDateSelect={setSelectedDate}
            onCurrentDateChange={setCurrentDate}
            onEventClick={onEventClick}
            onTaskClick={onTaskClick}
            onContentClick={onContentClick}
            onNurtureClick={onNurtureClick}
            onOpenTaskModal={onOpenTaskModal}
            onContactClick={onContactClick}
            onAssignContact={onAssignContact}
            isMaximized={isMaximized}
            onToggleMaximize={() => setIsMaximized(!isMaximized)}
            isPanelCollapsed={isPanelCollapsed}
            onTogglePanelCollapsed={() => setIsPanelCollapsed(!isPanelCollapsed)}
            priorityDates={priorityDates}
            onTogglePriority={togglePriorityDate}
          />
        </div>
      </div>
    </div>
  );
}

// Split View - Calendar + Selected Date Details
function SplitView({ 
  events, 
  tasks,
  content,
  nurtures,
  contacts,
  currentDate,
  selectedDate,
  view,
  onDateSelect,
  onCurrentDateChange,
  onEventClick,
  onTaskClick,
  onContentClick,
  onNurtureClick,
  onOpenTaskModal,
  onContactClick,
  onAssignContact,
  isMaximized,
  onToggleMaximize,
  isPanelCollapsed,
  onTogglePanelCollapsed,
  priorityDates,
  onTogglePriority
}: { 
  events: CalendarEvent[];
  tasks: Task[];
  content: ContentItem[];
  nurtures: NurtureToDo[];
  contacts: Contact[];
  currentDate: Date;
  selectedDate: Date;
  view: "month" | "week" | "day";
  onDateSelect: (date: Date) => void;
  onCurrentDateChange: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onTaskClick?: (task: Task) => void;
  onContentClick?: (content: ContentItem) => void;
  onNurtureClick?: (nurture: NurtureToDo) => void;
  onOpenTaskModal?: (task?: Task) => void;
  onContactClick?: (contactId: string) => void;
  onAssignContact?: (eventId: string, contactId: string | null) => Promise<void>;
  isMaximized: boolean;
  onToggleMaximize: () => void;
  isPanelCollapsed: boolean;
  onTogglePanelCollapsed: () => void;
  priorityDates: Set<string>;
  onTogglePriority: (date: Date) => void;
}) {
  // Debug: Check if onContactClick is received
  console.log('🔍 SplitView received onContactClick:', typeof onContactClick, onContactClick);
  
  // Track which event is being edited for contact assignment
  const [editingContactForEvent, setEditingContactForEvent] = useState<string | null>(null);
  
  // Get items for selected date
  const selectedDateStr = selectedDate.toDateString();
  
  const dayMeetings = events
    .filter(e => e.startTime.toDateString() === selectedDateStr)
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  
  const dayTasks = tasks.filter(t => {
    if (!t.dueDate) return false;
    // Exclude archived tasks
    if (t.archived || t.status === 'archived') return false;
    // Safe date parsing: handle both YYYY-MM-DD and full ISO formats
    const dateStr = typeof t.dueDate === 'string' && !t.dueDate.includes('T') 
      ? t.dueDate + 'T00:00:00' 
      : t.dueDate;
    const taskDate = new Date(dateStr);
    return taskDate.toDateString() === selectedDateStr;
  });

  const dayContent = content.filter(c => {
    const dateToUse = c.scheduledDate || c.publishedDate;
    if (!dateToUse) return false;
    // Parse the date string properly (scheduledDate is in YYYY-MM-DD format)
    const dateStr = typeof dateToUse === 'string' && !dateToUse.includes('T') 
      ? dateToUse + 'T00:00:00' 
      : dateToUse;
    const contentDate = new Date(dateStr);
    return contentDate.toDateString() === selectedDateStr;
  });

  const dayNurtures = nurtures.filter(n => {
    if (!n.dueDate) return false;
    // Safe date parsing: handle both YYYY-MM-DD and full ISO formats
    const dateStr = typeof n.dueDate === 'string' && !n.dueDate.includes('T') 
      ? n.dueDate + 'T00:00:00' 
      : n.dueDate;
    const nurtureDate = new Date(dateStr);
    return nurtureDate.toDateString() === selectedDateStr;
  });
  
  const hasNurtures = dayNurtures.length > 0;

  // Main calendar content
  const calendarContent = (
    <div className={`h-full flex ${isMaximized ? 'flex-col' : 'gap-6'} ${isMaximized ? 'p-0' : 'p-8'} overflow-hidden ${isMaximized ? 'bg-transparent' : 'bg-[#F7F7F9]'}`}>
      {/* Calendar */}
      <div className={`${isMaximized ? 'flex-1' : 'flex-1'} overflow-y-auto`}>
        <div className="bg-white/60 backdrop-blur-sm rounded-[24px] border border-slate-200/50 p-6 min-h-full">
          <div className="flex items-center justify-between mb-6">
            {/* Navigation controls when maximized in day/week view */}
            {isMaximized && (view === "day" || view === "week") ? (
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newDate = new Date(selectedDate);
                    if (view === "day") {
                      newDate.setDate(newDate.getDate() - 1);
                    } else {
                      newDate.setDate(newDate.getDate() - 7);
                    }
                    onDateSelect(newDate);
                    onCurrentDateChange(newDate);
                  }}
                  className="h-10 w-10 p-0 rounded-[16px] border-slate-200/70 bg-white/70 backdrop-blur-sm hover:bg-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <div className="min-w-[200px] text-center">
                  <p className="font-medium text-slate-900" style={{ fontFamily: 'Lora, serif' }}>
                    {view === "day"
                      ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })
                      : `Week of ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                    }
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newDate = new Date(selectedDate);
                    if (view === "day") {
                      newDate.setDate(newDate.getDate() + 1);
                    } else {
                      newDate.setDate(newDate.getDate() + 7);
                    }
                    onDateSelect(newDate);
                    onCurrentDateChange(newDate);
                  }}
                  className="h-10 w-10 p-0 rounded-[16px] border-slate-200/70 bg-white/70 backdrop-blur-sm hover:bg-white"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const today = new Date();
                    onDateSelect(today);
                    onCurrentDateChange(today);
                  }}
                  className="h-10 rounded-[20px] border-slate-200/70 bg-white/70 backdrop-blur-sm hover:bg-white"
                >
                  Today
                </Button>
              </div>
            ) : (
              <h3 className="text-lg font-medium text-slate-900" style={{ fontFamily: 'Lora, serif' }}>
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleMaximize}
              className="h-8 w-8 p-0 rounded-[12px] hover:bg-slate-100"
            >
              {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
          
          {view === "week" ? (
            <WeekView
              events={events}
              tasks={tasks}
              currentDate={currentDate}
              selectedDate={selectedDate}
              onDateSelect={onDateSelect}
              priorityDates={priorityDates}
              onTogglePriority={(date, e) => {
                e.stopPropagation();
                onTogglePriority(date);
              }}
            />
          ) : view === "day" ? (
            <DayView
              events={events}
              tasks={tasks}
              content={content}
              nurtures={nurtures}
              contacts={contacts}
              selectedDate={selectedDate}
              onEventClick={onEventClick}
              onTaskClick={onTaskClick}
              onContactClick={onContactClick}
              onAssignContact={onAssignContact}
              editingContactForEvent={editingContactForEvent}
              setEditingContactForEvent={setEditingContactForEvent}
              priorityDates={priorityDates}
              onTogglePriority={onTogglePriority}
            />
          ) : (
            <FullMonthCalendar 
              events={events} 
              tasks={tasks}
              content={content}
              nurtures={nurtures}
              contacts={contacts}
              currentDate={currentDate} 
              selectedDate={selectedDate}
              onDateSelect={onDateSelect}
              onContactClick={onContactClick}
              onAssignContact={onAssignContact}
              editingContactForEvent={editingContactForEvent}
              setEditingContactForEvent={setEditingContactForEvent}
              priorityDates={priorityDates}
              onTogglePriority={onTogglePriority}
            />
          )}
        </div>
      </div>

      {/* Selected Date Details - hide when maximized */}
      {!isMaximized && !isPanelCollapsed && (
        <div className="w-[400px] flex-shrink-0 overflow-y-auto">
          <div className="bg-white/60 backdrop-blur-sm rounded-[24px] border border-slate-200/50 p-6 relative">
            {/* Collapse button */}
            <button
              onClick={onTogglePanelCollapsed}
              className="absolute top-4 right-4 z-10 h-6 w-6 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
              aria-label="Collapse panel"
            >
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
            
            <div className="mb-6 flex items-start justify-between pr-8">
              <div>
                <h3 className="text-lg font-medium text-slate-900 mb-1" style={{ fontFamily: 'Lora, serif' }}>
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h3>
                <p className="text-sm text-slate-500">
                  {dayMeetings.length + dayTasks.length + dayContent.length + dayNurtures.length} items
                </p>
              </div>
              <button
                onClick={() => onTogglePriority(selectedDate)}
                className="flex-shrink-0"
              >
                <Star
                  className={`w-5 h-5 transition-all ${
                    priorityDates.has(selectedDate.toDateString())
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-300 hover:text-slate-400'
                  }`}
                />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Meetings Section */}
              {dayMeetings.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-[12px] mb-3" style={{ backgroundColor: '#6484a1' }}>
                    <CalendarIcon className="w-4 h-4 text-white" />
                    <h4 className="text-sm font-medium text-white">Meetings</h4>
                    <span className="text-xs text-white/80">({dayMeetings.length})</span>
                  </div>
                  <div className="space-y-2">
                    {dayMeetings.map((event, eventIndex) => {
                      const startTime = event.startTime.toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit',
                        hour12: true
                      });
                      const endTime = event.endTime.toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit',
                        hour12: true
                      });

                      return (
                        <div
                          key={`detail-${event.id}-${eventIndex}`}
                          onClick={() => onEventClick?.(event)}
                          className="w-full flex items-start gap-3 p-3 rounded-[16px] bg-white/70 backdrop-blur-sm border border-slate-200/50 hover:bg-white hover:shadow-sm transition-all text-left cursor-pointer"
                        >
                          <div 
                            className="flex-shrink-0 w-1 h-10 rounded-full"
                            style={{ backgroundColor: event.color }}
                          />
                          
                          <div className="flex-1 min-w-0">
                            {/* Time first */}
                            <p className="text-xs text-slate-500 mb-1">
                              {startTime} - {endTime}
                            </p>
                            
                            {/* Title with contact badge and Home tag on same line */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-medium text-slate-900 mb-0">
                                {event.title}
                              </p>
                              
                              {/* Contact badge (if exists and is not an email) */}
                              {event.contact?.name && !event.contact.name.includes('@') && editingContactForEvent !== event.id && (
                                <div className="inline-flex items-center gap-1">
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (event.contactDetails?.id) {
                                        console.log('🔍 Contact badge clicked:', event.contactDetails);
                                        console.log('🔍 onContactClick available?', typeof onContactClick);
                                        if (onContactClick) {
                                          onContactClick(event.contactDetails.id);
                                        } else {
                                          console.error('❌ onContactClick is not available');
                                        }
                                      } else {
                                        console.warn('⚠️ No contactDetails.id found for event:', event.title, event);
                                      }
                                    }}
                                    className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full transition-colors ${
                                      event.contactDetails?.id 
                                        ? 'bg-slate-100 hover:bg-slate-200 cursor-pointer' 
                                        : 'bg-slate-50 cursor-default'
                                    }`}
                                  >
                                  {/* Show avatar if contact details available */}
                                  {event.contactDetails && (
                                    <Avatar className="w-4 h-4">
                                      {event.contactDetails.imageUrl ? (
                                        <img src={event.contactDetails.imageUrl} alt={event.contactDetails.name} className="w-full h-full object-cover" />
                                      ) : (
                                        <AvatarFallback 
                                          className="text-[8px] font-medium"
                                          style={{ backgroundColor: event.contactDetails.color + '20', color: event.contactDetails.color }}
                                        >
                                          {event.contactDetails.initials}
                                        </AvatarFallback>
                                      )}
                                    </Avatar>
                                  )}
                                  <span className="text-xs text-slate-600">{event.contact.name}</span>
                                </div>
                                {onAssignContact && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingContactForEvent(event.id);
                                    }}
                                    className="p-1 hover:bg-slate-200 rounded transition-colors"
                                    title="Change contact"
                                  >
                                    <Pencil className="w-3 h-3 text-slate-600" />
                                  </button>
                                )}
                              </div>
                              )}
                              
                              {/* "+ Contact" button when no contact assigned */}
                              {!event.contact?.name && onAssignContact && editingContactForEvent !== event.id && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingContactForEvent(event.id);
                                  }}
                                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>Contact</span>
                                </button>
                              )}
                              
                              {/* Contact selector dropdown */}
                              {onAssignContact && editingContactForEvent === event.id && (
                                <div className="inline-flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                  <select
                                    value={event.contactDetails?.id || ''}
                                    onChange={async (e) => {
                                      const contactId = e.target.value || null;
                                      await onAssignContact(event.id, contactId);
                                      setEditingContactForEvent(null);
                                    }}
                                    className="text-xs border border-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    autoFocus
                                  >
                                    <option value="">Select contact...</option>
                                    {sortContactsByLastName(contacts).map(contact => (
                                      <option key={contact.id} value={contact.id}>{contact.name}</option>
                                    ))}
                                  </select>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingContactForEvent(null);
                                    }}
                                    className="p-1 hover:bg-slate-200 rounded transition-colors"
                                    title="Cancel"
                                  >
                                    <X className="w-3 h-3 text-slate-600" />
                                  </button>
                                </div>
                              )}
                              
                              {event.calendarName?.toLowerCase().includes('gildergold family') && (
                                <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100">
                                  <Home className="w-3 h-3 text-slate-600" />
                                  <span className="text-xs text-slate-600">Home</span>
                                </div>
                              )}
                            </div>
                            
                            {/* Location below contact (if exists) */}
                            {event.location && (
                              <p className="text-xs text-slate-500 mt-1.5">{event.location}</p>
                            )}
                            
                            {/* Description with linkified URLs (if exists) */}
                            {event.description && (
                              <p className="text-xs text-slate-500 mt-1.5">
                                {linkifyText(event.description, "text-[#2f829b] hover:text-[#034863]")}
                              </p>
                            )}
                            
                            {/* Meeting link (if exists) */}
                            {event.link && (
                              <a
                                href={event.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1.5 text-xs text-[#2f829b] hover:text-[#034863] hover:underline mt-1.5 transition-colors"
                              >
                                <Video className="w-3 h-3" />
                                <span>Join meeting</span>
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tasks Section */}
              {dayTasks.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-[12px] mb-3" style={{ backgroundColor: '#c198ad' }}>
                    <CheckSquare className="w-4 h-4 text-white" />
                    <h4 className="text-sm font-medium text-white">Tasks</h4>
                    <span className="text-xs text-white/80">({dayTasks.length})</span>
                  </div>
                  <div className="space-y-2">
                    {dayTasks.map((task) => (
                      <button
                        key={task.id}
                        onClick={() => onOpenTaskModal?.(task)}
                        className="w-full flex items-start gap-3 p-3 rounded-[16px] bg-white/70 backdrop-blur-sm border border-slate-200/50 hover:bg-white hover:shadow-sm transition-all text-left"
                      >
                        <div 
                          className="flex-shrink-0 w-1 h-10 rounded-full"
                          style={{ backgroundColor: '#c198ad' }}
                        />
                        
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${
                            task.status === 'done' 
                              ? 'text-slate-500 line-through' 
                              : 'text-slate-900'
                          }`}>
                            {task.title}
                          </p>
                          {task.contact && (
                            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-100 mt-1.5">
                              <span className="text-xs text-slate-600">{task.contact.name}</span>
                            </div>
                          )}
                        </div>
                        
                        {task.priority === 'high' && (
                          <div className="w-1.5 h-1.5 rounded-full bg-[#e07c7c] flex-shrink-0 mt-1.5" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Content Section */}
              {dayContent.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-[12px] mb-3" style={{ backgroundColor: '#e2b7be' }}>
                    <Pin className="w-4 h-4 text-white" />
                    <h4 className="text-sm font-medium text-white">Content</h4>
                    <span className="text-xs text-white/80">({dayContent.length})</span>
                  </div>
                  <div className="space-y-2">
                    {dayContent.map((item) => {
                      // Platform color mapping
                      const platformColors: Record<string, { badge: string }> = {
                        'LI Post': { badge: 'LI' },
                        'LI Article': { badge: 'LI' },
                        'SS Post': { badge: 'SS' },
                        'SS Audio': { badge: 'SS' },
                      };
                      
                      const platform = platformColors[item.platform] || { badge: '?' };
                      
                      return (
                        <button
                          key={item.id}
                          onClick={() => onContentClick?.(item)}
                          className="w-full flex items-start gap-3 p-3 rounded-[16px] bg-white/70 backdrop-blur-sm border border-slate-200/50 hover:bg-white hover:shadow-sm transition-all text-left"
                        >
                          <div 
                            className="flex-shrink-0 w-1 h-10 rounded-full"
                            style={{ backgroundColor: '#e2b7be' }}
                          />
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900">
                              {item.title}
                            </p>
                            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-100 mt-1.5">
                              <span className="text-xs text-slate-600">{platform.badge}</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Nurtures Section */}
              {dayNurtures.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-[12px] mb-3" style={{ backgroundColor: '#8fa790' }}>
                    <Sprout className="w-4 h-4 text-white" />
                    <h4 className="text-sm font-medium text-white">Nurtures</h4>
                    <span className="text-xs text-white/80">({dayNurtures.length})</span>
                  </div>
                  <div className="space-y-2">
                    {dayNurtures.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => onNurtureClick?.(item)}
                        className="w-full flex items-start gap-3 p-3 rounded-[16px] bg-white/70 backdrop-blur-sm border border-slate-200/50 hover:bg-white hover:shadow-sm transition-all text-left"
                      >
                        <div 
                          className="flex-shrink-0 w-1 h-10 rounded-full"
                          style={{ backgroundColor: '#8fa790' }}
                        />
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900">
                            Nurture: {item.contactName}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {dayMeetings.length === 0 && dayTasks.length === 0 && dayContent.length === 0 && dayNurtures.length === 0 && (
                <div className="text-center py-12">
                  <CalendarIcon className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">No items for this date</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Expand button when panel is collapsed */}
      {!isMaximized && isPanelCollapsed && (
        <div className="flex-shrink-0">
          <button
            onClick={onTogglePanelCollapsed}
            className="h-12 w-12 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-[16px] border border-slate-200/50 hover:bg-white hover:shadow-sm transition-all"
            aria-label="Expand panel"
          >
            <ChevronLeft className="w-5 h-5 text-slate-500" />
          </button>
        </div>
      )}
    </div>
  );

  // If maximized, wrap in modal overlay
  if (isMaximized) {
    return (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100000] p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full h-full max-w-[98vw] max-h-[98vh] overflow-hidden flex flex-col">
          {calendarContent}
        </div>
      </div>
    );
  }

  // Normal inline display
  return calendarContent;
}

// Full Month Calendar Component with event/task indicators
function FullMonthCalendar({ 
  events, 
  tasks,
  content,
  nurtures,
  contacts,
  currentDate,
  selectedDate,
  onDateSelect,
  onContactClick,
  onAssignContact,
  editingContactForEvent,
  setEditingContactForEvent,
  priorityDates,
  onTogglePriority
}: { 
  events: CalendarEvent[];
  tasks: Task[];
  content: ContentItem[];
  nurtures: NurtureToDo[];
  contacts: Contact[];
  currentDate: Date;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onContactClick?: (contactId: string) => void;
  onAssignContact?: (eventId: string, contactId: string | null) => Promise<void>;
  editingContactForEvent: string | null;
  setEditingContactForEvent: (id: string | null) => void;
  priorityDates: Set<string>;
  onTogglePriority: (date: Date) => void;
}) {
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const days = [];
  const current = new Date(startDate);
  
  for (let i = 0; i < 42; i++) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return (
    <div>
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 mb-2">
        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
          <div key={day} className="text-center text-xs font-medium text-slate-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid - with thin borders */}
      <div className="grid grid-cols-7 border border-slate-200">
        {days.map((day, i) => {
          const isToday = day.toDateString() === new Date().toDateString();
          const isSelected = day.toDateString() === selectedDate.toDateString();
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const isPriority = priorityDates.has(day.toDateString());
          const dayEvents = getMeetingsForDay(events, day);
          const dayTasks = getTasksForDay(tasks, day, false); // Only show tasks due on THIS date, not overdue tasks
          const dayContent = getContentForDay(content, day);
          const dayNurtures = getNurturesForDay(nurtures, day);

          return (
            <button
              key={i}
              onClick={() => onDateSelect(day)}
              className={`relative min-h-[180px] p-2 transition-all group border-r border-b border-slate-200 flex flex-col ${
                isToday ? 'bg-[#eaeaf1]' : isCurrentMonth ? 'bg-transparent hover:bg-white/20' : 'bg-transparent hover:bg-white/10'
              } ${isSelected ? 'ring-1 ring-inset ring-slate-300' : ''}`}
            >
              {/* Date number - upper left corner */}
              <div className={`text-sm font-medium mb-2 text-left ${
                isToday ? 'text-[#2f829b] font-semibold' : isCurrentMonth ? 'text-slate-700' : 'text-slate-400'
              }`}>
                {day.getDate()}
              </div>
              
              {/* Event indicators - pill style */}
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event, idx) => {
                  const startTime = event.startTime.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true
                  });

                  const endTime = event.endTime.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true
                  });
                  
                  return (
                    <div
                      key={`event-${event.id}-${idx}`}
                      className="relative group/event flex items-center gap-1.5 px-2 py-1 rounded-full text-xs"
                      style={{ 
                        backgroundColor: event.color,
                      }}
                    >
                      <CalendarIcon className="w-3 h-3 flex-shrink-0 text-white" />
                      {event.contactDetails && (
                        <Avatar className="w-4 h-4 flex-shrink-0">
                          {event.contactDetails.imageUrl ? (
                            <img src={event.contactDetails.imageUrl} alt={event.contactDetails.name} className="w-full h-full object-cover" />
                          ) : (
                            <AvatarFallback 
                              className="text-[8px] font-medium"
                              style={{ backgroundColor: 'rgba(255,255,255,0.3)', color: 'white' }}
                            >
                              {event.contactDetails.initials}
                            </AvatarFallback>
                          )}
                        </Avatar>
                      )}
                      <span className="truncate text-white font-medium">
                        {startTime.replace(' ', '').toLowerCase()} {event.title}
                      </span>
                      
                      {/* Hover tooltip */}
                      <div className="absolute left-0 top-full mt-1 w-64 bg-slate-900 text-white text-xs rounded-lg p-3 shadow-lg opacity-0 invisible group-hover/event:opacity-100 group-hover/event:visible transition-all z-50 pointer-events-auto">
                        <p className="font-semibold mb-1">{event.title}</p>
                        <p className="text-slate-300 mb-1">
                          {startTime} - {endTime}
                        </p>
                        {event.location && (
                          <p className="text-slate-300 mb-1">📍 {event.location}</p>
                        )}
                        {event.contact?.name && !event.contact.name.includes('@') && (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              if (event.contactDetails?.id) {
                                console.log('🔍 Contact badge clicked (week view):', event.contactDetails);
                                console.log('🔍 onContactClick available?', typeof onContactClick);
                                if (onContactClick) {
                                  onContactClick(event.contactDetails.id);
                                } else {
                                  console.error('❌ onContactClick is not available (week view)');
                                }
                              } else {
                                console.warn('⚠️ No contactDetails.id found for event:', event.title, event);
                              }
                            }}
                            className={`flex items-center gap-2 mt-1 rounded-lg p-1.5 -ml-1.5 transition-colors w-full ${
                              event.contactDetails?.id 
                                ? 'hover:bg-white/10 cursor-pointer' 
                                : 'cursor-default'
                            }`}
                          >
                            {event.contactDetails && (
                              <Avatar className="w-5 h-5">
                                {event.contactDetails.imageUrl ? (
                                  <img src={event.contactDetails.imageUrl} alt={event.contactDetails.name} className="w-full h-full object-cover" />
                                ) : (
                                  <AvatarFallback 
                                    className="text-[9px] font-medium"
                                    style={{ backgroundColor: event.contactDetails.color + '40', color: '#fff' }}
                                  >
                                    {event.contactDetails.initials}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                            )}
                            <div>
                              <p className="text-white font-medium">{event.contact.name}</p>
                              {event.contactDetails?.company && (
                                <p className="text-slate-400 text-[10px]">{event.contactDetails.company}</p>
                              )}
                            </div>
                          </div>
                        )}
                        {event.description && (
                          <p className="text-slate-300 mt-2 text-[11px]">
                            {linkifyText(event.description)}
                          </p>
                        )}
                        {event.link && (
                          <a
                            href={event.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 mt-2 text-[#7ab8d1] hover:text-white hover:underline transition-colors"
                          >
                            <Video className="w-3 h-3" />
                            <span>Join meeting</span>
                          </a>
                        )}
                        {event.calendarName?.toLowerCase().includes('gildergold family') && (
                          <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/20 mt-2">
                            <Home className="w-3 h-3" />
                            <span className="text-[11px]">Home</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {/* Tasks - pill style with count */}
                {dayTasks.length > 0 && (
                  <div
                    className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs"
                    style={{ backgroundColor: '#c198ad' }}
                  >
                    <CheckSquare className="w-3 h-3 flex-shrink-0 text-white" />
                    <span className="truncate text-white font-medium">
                      {dayTasks.length}
                    </span>
                  </div>
                )}
                
                {/* Content - pill style */}
                {dayContent.slice(0, 1).map((item, idx) => (
                  <div
                    key={`content-${item.id}-${idx}`}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs"
                    style={{ backgroundColor: '#e2b7be' }}
                  >
                    <Pin className="w-3 h-3 flex-shrink-0 text-white" />
                    <span className="truncate font-medium text-white">
                      {item.platform}
                    </span>
                  </div>
                ))}

                {/* Nurtures - pill style */}
                {dayNurtures.length > 0 && (
                  <div
                    className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs"
                    style={{ backgroundColor: '#9eafa4' }}
                  >
                    <Sprout className="w-3 h-3 flex-shrink-0 text-white" />
                    <span className="truncate text-white font-medium">
                      Nurture ({dayNurtures.length})
                    </span>
                  </div>
                )}

                {dayEvents.length > 3 && (
                  <div className="text-[10px] text-slate-500 text-center py-0.5">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Day View Component
function DayView({ 
  events, 
  tasks,
  content,
  nurtures,
  contacts,
  selectedDate,
  onEventClick,
  onTaskClick,
  onContactClick,
  onAssignContact,
  editingContactForEvent,
  setEditingContactForEvent,
  priorityDates,
  onTogglePriority
}: { 
  events: CalendarEvent[];
  tasks: Task[];
  content: ContentItem[];
  nurtures: NurtureToDo[];
  contacts: Contact[];
  selectedDate: Date;
  onEventClick?: (event: CalendarEvent) => void;
  onTaskClick?: (task: Task) => void;
  onContactClick?: (contactId: string) => void;
  onAssignContact?: (eventId: string, contactId: string | null) => Promise<void>;
  editingContactForEvent: string | null;
  setEditingContactForEvent: (id: string | null) => void;
  priorityDates: Set<string>;
  onTogglePriority: (date: Date) => void;
}) {
  const selectedDateStr = selectedDate.toDateString();
  
  const dayMeetings = events
    .filter(e => e.startTime.toDateString() === selectedDateStr)
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  
  const dayTasks = tasks.filter(t => {
    if (!t.dueDate) return false;
    // Exclude archived tasks
    if (t.archived || t.status === 'archived') return false;
    // Safe date parsing: handle both YYYY-MM-DD and full ISO formats
    const dateStr = typeof t.dueDate === 'string' && !t.dueDate.includes('T') 
      ? t.dueDate + 'T00:00:00' 
      : t.dueDate;
    const taskDate = new Date(dateStr);
    return taskDate.toDateString() === selectedDateStr;
  });

  const dayContent = content.filter(c => {
    const dateToUse = c.scheduledDate || c.publishedDate;
    if (!dateToUse) return false;
    const dateStr = typeof dateToUse === 'string' && !dateToUse.includes('T') 
      ? dateToUse + 'T00:00:00' 
      : dateToUse;
    const contentDate = new Date(dateStr);
    return contentDate.toDateString() === selectedDateStr;
  });

  const dayNurtures = nurtures.filter(n => {
    if (!n.dueDate) return false;
    // Safe date parsing: handle both YYYY-MM-DD and full ISO formats
    const dateStr = typeof n.dueDate === 'string' && !n.dueDate.includes('T') 
      ? n.dueDate + 'T00:00:00' 
      : n.dueDate;
    const nurtureDate = new Date(dateStr);
    return nurtureDate.toDateString() === selectedDateStr;
  });
  
  const hasNurtures = dayNurtures.length > 0;

  // Generate hours 6 AM to 9 PM
  const hours = Array.from({ length: 16 }, (_, i) => i + 6);

  return (
    <div className="flex flex-col h-full">
      {/* Day Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-slate-900" style={{ fontFamily: 'Lora, serif' }}>
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long',
              month: 'long',
              day: 'numeric'
            })}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {dayMeetings.length} meetings • {dayTasks.length} tasks • {dayContent.length} content
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onTogglePriority(selectedDate)}
          className="h-8 w-8 p-0 rounded-[12px] hover:bg-slate-100"
        >
          <Star
            className={`w-4 h-4 transition-all ${
              priorityDates.has(selectedDate.toDateString())
                ? 'fill-amber-400 text-amber-400'
                : 'text-slate-300 hover:text-slate-400'
            }`}
          />
        </Button>
      </div>

      {/* All-day items section */}
      {(dayTasks.length > 0 || dayContent.length > 0 || dayNurtures.length > 0) && (
        <div className="mb-6 space-y-3">
          <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wide">All Day</h4>
          
          {/* Tasks */}
          {dayTasks.length > 0 && (
            <div className="space-y-1.5">
              {dayTasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => onTaskClick?.(task)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-[12px] transition-all text-left group"
                  style={{ backgroundColor: '#c198ad' }}
                >
                  <CheckSquare className="w-3.5 h-3.5 flex-shrink-0 text-white" />
                  <p className="text-sm flex-1 text-white">
                    {task.title}
                  </p>
                  {task.priority === 'high' && (
                    <Star className="w-3.5 h-3.5 flex-shrink-0 fill-white text-white" />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Content */}
          {dayContent.length > 0 && (
            <div className="space-y-1.5">
              {dayContent.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onEventClick?.(item as any)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-[12px] transition-all text-left group"
                  style={{ backgroundColor: '#e2b7be' }}
                >
                  <Pin className="w-3.5 h-3.5 flex-shrink-0 text-white" />
                  <p className="text-sm flex-1 text-white">
                    {item.title}
                  </p>
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-white/30 text-white">
                    {item.platform}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Nurtures */}
          {dayNurtures.length > 0 && (
            <div className="space-y-1.5">
              {dayNurtures.map((item) => (
                <button
                  key={item.id}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-[12px] transition-all text-left group"
                  style={{ backgroundColor: '#9eafa4' }}
                >
                  <Sprout className="w-3.5 h-3.5 flex-shrink-0 text-white" />
                  <p className="text-sm flex-1 text-white">
                    Nurture: {item.contactName}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Time grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="relative">
          {hours.map((hour) => {
            const hourEvents = dayMeetings.filter(e => e.startTime.getHours() === hour);
            const isPM = hour >= 12;
            const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
            const timeLabel = `${displayHour}${isPM ? 'pm' : 'am'}`;

            return (
              <div key={hour} className="flex border-b border-slate-200">
                {/* Time label */}
                <div className="w-20 flex-shrink-0 py-4 pr-4 text-right">
                  <span className="text-xs font-medium text-slate-500">{timeLabel}</span>
                </div>

                {/* Hour cell */}
                <div className="flex-1 min-h-[80px] py-2 px-2 relative">
                  {hourEvents.map((event, idx) => {
                    const startTime = event.startTime.toLocaleTimeString('en-US', { 
                      hour: 'numeric', 
                      minute: '2-digit',
                      hour12: true
                    });
                    const endTime = event.endTime.toLocaleTimeString('en-US', { 
                      hour: 'numeric', 
                      minute: '2-digit',
                      hour12: true
                    });

                    return (
                      <button
                        key={`timeline-${event.id}-${idx}`}
                        onClick={() => onEventClick?.(event)}
                        className="w-full mb-2 flex items-start gap-3 p-3 rounded-[16px] border border-slate-200/50 hover:shadow-sm transition-all text-left"
                        style={{ backgroundColor: event.color }}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-sm font-medium text-white">
                              {event.title}
                            </p>
                            {event.contact?.name && !event.contact.name.includes('@') && editingContactForEvent !== event.id && (
                              <div className="inline-flex items-center gap-1">
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (event.contactDetails?.id) {
                                      console.log('🔍 Contact badge clicked (month view):', event.contactDetails);
                                      console.log('🔍 onContactClick available?', typeof onContactClick);
                                      if (onContactClick) {
                                        onContactClick(event.contactDetails.id);
                                      } else {
                                        console.error('❌ onContactClick is not available (month view)');
                                      }
                                    } else {
                                      console.warn('⚠️ No contactDetails.id found for event:', event.title, event);
                                    }
                                  }}
                                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full transition-colors ${
                                    event.contactDetails?.id 
                                      ? 'bg-white/20 hover:bg-white/30 cursor-pointer' 
                                      : 'bg-white/10 cursor-default'
                                  }`}
                                >
                                  <span className="text-xs text-white">{event.contact.name}</span>
                                </div>
                                {onAssignContact && (
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingContactForEvent(event.id);
                                    }}
                                    className="p-0.5 hover:bg-white/20 rounded transition-colors cursor-pointer"
                                    title="Change contact"
                                  >
                                    <Pencil className="w-3 h-3 text-white/70" />
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* "+ Contact" button when no contact assigned */}
                            {!event.contact?.name && onAssignContact && editingContactForEvent !== event.id && (
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingContactForEvent(event.id);
                                }}
                                className="inline-flex items-center gap-1 text-xs text-white/70 hover:text-white transition-colors cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Contact</span>
                              </div>
                            )}
                            
                            {/* Contact selector dropdown */}
                            {onAssignContact && editingContactForEvent === event.id && (
                              <div className="inline-flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                <select
                                  value={event.contactDetails?.id || ''}
                                  onChange={async (e) => {
                                    const contactId = e.target.value || null;
                                    await onAssignContact(event.id, contactId);
                                    setEditingContactForEvent(null);
                                  }}
                                  className="text-xs border border-white/30 bg-white/90 text-slate-900 rounded px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-white/50"
                                  autoFocus
                                >
                                  <option value="">Select contact...</option>
                                  {sortContactsByLastName(contacts).map(contact => (
                                    <option key={contact.id} value={contact.id}>{contact.name}</option>
                                  ))}
                                </select>
                                <button
                                  onClick={() => setEditingContactForEvent(null)}
                                  className="p-0.5 hover:bg-white/20 rounded transition-colors"
                                  title="Cancel"
                                >
                                  <X className="w-3 h-3 text-white/70" />
                                </button>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-white/70">
                            {startTime} - {endTime}
                          </p>
                          {event.location && (
                            <p className="text-xs text-white/70 mt-0.5 flex items-center gap-1">
                              <Video className="w-3 h-3" />
                              {event.location}
                            </p>
                          )}
                          {event.link && (
                            <a
                              href={event.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1.5 mt-2 text-white/90 hover:text-white hover:underline transition-colors text-xs"
                            >
                              <Video className="w-3 h-3" />
                              <span>Join meeting</span>
                            </a>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Empty state */}
      {dayMeetings.length === 0 && dayTasks.length === 0 && dayContent.length === 0 && dayNurtures.length === 0 && (
        <div className="text-center py-12">
          <CalendarIcon className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No items for this date</p>
        </div>
      )}
    </div>
  );
}