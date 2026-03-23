import { CalendarEvent } from '../components/CalendarPage';
import { PendingContact } from './contactSuggestionQueue';
import { getUserSchedulingLink } from './userSettings';

/**
 * Extract company name from meeting title
 * Looks for patterns like "Meeting with [Company]" or "[Company] - [Topic]"
 */
function extractCompanyFromTitle(title: string): string | undefined {
  // Common patterns
  const patterns = [
    /(?:meeting|call|sync|check-?in|discussion)\s+(?:with|at|@)\s+([A-Z][A-Za-z0-9\s&]+?)(?:\s+-|$|\s+\()/i,
    /^([A-Z][A-Za-z0-9\s&]+?)\s+(?:-|–|:|\|)/,
    /\b([A-Z][A-Za-z0-9]+(?:\s+(?:Inc|LLC|Corp|Co|Ltd|Group|Labs|Health|Tech|Solutions)\.?))\b/,
  ];

  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match && match[1]) {
      const company = match[1].trim();
      // Filter out common non-company words
      const excludeWords = ['meeting', 'call', 'sync', 'weekly', 'daily', 'monthly', 'team', 'standup', 'review'];
      if (!excludeWords.some(word => company.toLowerCase() === word)) {
        return company;
      }
    }
  }

  return undefined;
}

/**
 * Extract role/title from meeting title or name
 * Looks for patterns like "CEO", "Director of", etc.
 */
function extractRoleFromTitle(title: string, name?: string): string | undefined {
  const roleTitles = [
    'CEO', 'CTO', 'CFO', 'COO', 'CMO', 'CPO', 'CIO', 'CISO',
    'President', 'VP', 'Vice President', 'Director', 'Manager',
    'Head of', 'Lead', 'Founder', 'Co-Founder', 'Partner',
    'Consultant', 'Advisor', 'Specialist', 'Coordinator',
    'Engineer', 'Designer', 'Developer', 'Analyst'
  ];

  const lowerTitle = title.toLowerCase();
  
  for (const role of roleTitles) {
    if (lowerTitle.includes(role.toLowerCase())) {
      // Try to extract fuller context
      const pattern = new RegExp(`([A-Za-z\\s]*${role}[A-Za-z\\s]*)`, 'i');
      const match = title.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
      return role;
    }
  }

  return undefined;
}

/**
 * Extract LinkedIn URL from meeting description
 */
function extractLinkedInUrl(description?: string): string | undefined {
  if (!description) return undefined;

  const linkedInPattern = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w-]+\/?/i;
  const match = description.match(linkedInPattern);
  
  return match ? match[0] : undefined;
}

/**
 * Generate notes from meeting context
 */
function generateMeetingNotes(events: CalendarEvent[], email: string): string {
  const notes: string[] = [];
  
  // Add context about upcoming meetings
  const futureEvents = events.filter(e => new Date(e.startTime) > new Date());
  
  if (futureEvents.length > 0) {
    const firstMeeting = futureEvents[0];
    const meetingDate = new Date(firstMeeting.startTime).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    
    if (futureEvents.length === 1) {
      notes.push(`Met via "${firstMeeting.title}" on ${meetingDate}`);
    } else {
      notes.push(`${futureEvents.length} upcoming meetings scheduled`);
      notes.push(`First meeting: "${firstMeeting.title}" on ${meetingDate}`);
    }
  }
  
  // Add location if consistent
  const locations = events.map(e => e.location).filter(Boolean);
  if (locations.length > 0) {
    const uniqueLocations = [...new Set(locations)];
    if (uniqueLocations.length === 1) {
      notes.push(`Meetings typically in: ${uniqueLocations[0]}`);
    }
  }

  return notes.join('\n');
}

/**
 * Get the earliest future meeting date
 */
function getNextCallDate(events: CalendarEvent[]): string | undefined {
  const futureEvents = events
    .filter(e => new Date(e.startTime) > new Date())
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  if (futureEvents.length > 0) {
    return futureEvents[0].startTime.toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  return undefined;
}

/**
 * Extract name from email if no name provided
 */
function extractNameFromEmail(email: string): string {
  const localPart = email.split('@')[0];
  
  // Replace common separators with spaces
  const cleaned = localPart.replace(/[._-]/g, ' ');
  
  // Capitalize each word
  return cleaned
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Extract comprehensive contact data from calendar events
 * 
 * @param email - The attendee's email address
 * @param events - All calendar events where this person is an attendee
 * @returns Pending contact with extracted data
 */
export function extractContactDataFromCalendar(
  email: string,
  events: CalendarEvent[]
): PendingContact {
  // Try to get name from first event's attendee list
  let name: string | undefined;
  for (const event of events) {
    if (event.contact?.email === email && event.contact.name) {
      name = event.contact.name;
      break;
    }
  }

  // Fallback: extract name from email
  if (!name) {
    name = extractNameFromEmail(email);
  }

  // Extract company from meeting titles
  let company: string | undefined;
  for (const event of events) {
    const extracted = extractCompanyFromTitle(event.title);
    if (extracted) {
      company = extracted;
      break;
    }
  }

  // Extract role from meeting titles
  let role: string | undefined;
  for (const event of events) {
    const extracted = extractRoleFromTitle(event.title, name);
    if (extracted) {
      role = extracted;
      break;
    }
  }

  // Extract LinkedIn from descriptions
  let linkedinUrl: string | undefined;
  for (const event of events) {
    const extracted = extractLinkedInUrl(event.description);
    if (extracted) {
      linkedinUrl = extracted;
      break;
    }
  }

  // Get location (prefer most common or most recent)
  const locations = events.map(e => e.location).filter(Boolean);
  const location = locations.length > 0 ? locations[0] : undefined;

  // Generate notes
  const notes = generateMeetingNotes(events, email);

  // Get user's scheduling link
  const schedulingLink = getUserSchedulingLink();

  // Get next call date
  const nextCallDate = getNextCallDate(events);

  // Collect meeting metadata
  const meetingIds = events.map(e => e.id);
  const meetingTitles = events.map(e => e.title);
  const meetingDates = events.map(e => e.startTime.toISOString().split('T')[0]);

  return {
    email,
    name,
    company,
    role,
    location,
    linkedinUrl,
    notes,
    schedulingLink,
    nextCallDate,
    meetingIds,
    meetingTitles,
    meetingDates,
    detectedAt: new Date().toISOString(),
  };
}

/**
 * Detect which calendar attendees are not in the contacts database
 * 
 * @param calendarEvents - All calendar events
 * @param existingContacts - Array of existing contact emails
 * @param calendarInteractionSettings - Per-calendar settings for auto-creating interactions (optional)
 * @returns Array of pending contacts with extracted data
 */
export function detectMissingContacts(
  calendarEvents: CalendarEvent[],
  existingContacts: { email?: string }[],
  calendarInteractionSettings?: Record<string, boolean>
): PendingContact[] {
  // Filter events based on calendar interaction settings
  const eligibleEvents = calendarInteractionSettings 
    ? calendarEvents.filter(event => {
        // If no calendarId, assume it should be included (default true)
        if (!event.calendarId) return true;
        // Check if this calendar has interaction creation enabled (default to true)
        return calendarInteractionSettings[event.calendarId] !== false;
      })
    : calendarEvents;
  
  console.log(`📅 Filtered ${eligibleEvents.length}/${calendarEvents.length} events based on interaction settings`);
  
  // Get all unique attendee emails from eligible calendar events
  const attendeeEmails = new Set<string>();
  
  eligibleEvents.forEach(event => {
    if (event.attendees) {
      event.attendees.forEach(email => {
        // Normalize email
        const normalizedEmail = email.toLowerCase().trim();
        if (normalizedEmail && !normalizedEmail.includes('noreply') && !normalizedEmail.includes('calendar')) {
          attendeeEmails.add(normalizedEmail);
        }
      });
    }
  });

  // Get existing contact emails (normalized)
  const existingEmailSet = new Set(
    existingContacts
      .map(c => c.email?.toLowerCase().trim())
      .filter(Boolean) as string[]
  );

  // Find missing contacts
  const missingEmails = Array.from(attendeeEmails).filter(
    email => !existingEmailSet.has(email)
  );

  // Extract full contact data for each missing email
  const pendingContacts: PendingContact[] = missingEmails.map(email => {
    // Find all events with this attendee (from eligible events only)
    const eventsWithAttendee = eligibleEvents.filter(event =>
      event.attendees?.some(a => a.toLowerCase().trim() === email)
    );

    return extractContactDataFromCalendar(email, eventsWithAttendee);
  });

  return pendingContacts;
}