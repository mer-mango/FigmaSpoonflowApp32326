/**
 * Contact Suggestion Queue Management
 * 
 * Handles the complete flow of suggesting calendar attendees as new contacts,
 * including queue management, snooze scheduling, and persistence.
 */

export interface PendingContact {
  email: string;
  name?: string;
  company?: string;
  role?: string;
  location?: string;
  linkedinUrl?: string;
  notes?: string;
  schedulingLink?: string;
  nextCallDate?: string;
  meetingIds: string[]; // All upcoming meeting IDs with this person
  meetingTitles: string[]; // All upcoming meeting titles
  meetingDates: string[]; // All upcoming meeting dates
  detectedAt: string; // When we first detected this person
}

export interface ContactQueueState {
  pending: PendingContact[];
  currentIndex: number; // Which contact is currently being processed
  snoozed: {
    contactEmail: string;
    snoozedUntil: string; // ISO timestamp
  }[];
  dismissed: string[]; // Emails of dismissed contacts
  processing: boolean; // Is the user currently in the contact addition flow
}

const QUEUE_STORAGE_KEY = 'contact_suggestion_queue';
const SNOOZE_CHECK_INTERVAL = 10000; // Check every 10 seconds

/**
 * Load queue state from localStorage
 */
export function loadQueueState(): ContactQueueState {
  try {
    const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        pending: parsed.pending || [],
        currentIndex: parsed.currentIndex || 0,
        snoozed: parsed.snoozed || [],
        dismissed: parsed.dismissed || [],
        processing: parsed.processing || false,
      };
    }
  } catch (error) {
    console.error('Failed to load contact suggestion queue:', error);
  }
  
  return {
    pending: [],
    currentIndex: 0,
    snoozed: [],
    dismissed: [],
    processing: false,
  };
}

/**
 * Save queue state to localStorage
 */
export function saveQueueState(state: ContactQueueState): void {
  try {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save contact suggestion queue:', error);
  }
}

/**
 * Add new pending contacts to the queue
 * Deduplicates by email and merges meeting info for existing contacts
 */
export function addPendingContacts(contacts: PendingContact[]): void {
  const state = loadQueueState();
  
  contacts.forEach(newContact => {
    // Check if already dismissed
    if (state.dismissed.includes(newContact.email)) {
      console.log(`Skipping dismissed contact: ${newContact.email}`);
      return;
    }
    
    // Check if already in pending list
    const existingIndex = state.pending.findIndex(p => p.email === newContact.email);
    
    if (existingIndex >= 0) {
      // Merge meeting info
      const existing = state.pending[existingIndex];
      state.pending[existingIndex] = {
        ...existing,
        meetingIds: [...new Set([...existing.meetingIds, ...newContact.meetingIds])],
        meetingTitles: [...new Set([...existing.meetingTitles, ...newContact.meetingTitles])],
        meetingDates: [...new Set([...existing.meetingDates, ...newContact.meetingDates])],
        // Update next call date if new one is sooner
        nextCallDate: getEarlierDate(existing.nextCallDate, newContact.nextCallDate),
      };
      console.log(`Updated existing pending contact: ${newContact.email}`);
    } else {
      // Add new contact
      state.pending.push(newContact);
      console.log(`Added new pending contact: ${newContact.email}`);
    }
  });
  
  saveQueueState(state);
}

/**
 * Get earlier of two dates (or the one that exists)
 */
function getEarlierDate(date1?: string, date2?: string): string | undefined {
  if (!date1) return date2;
  if (!date2) return date1;
  return new Date(date1) < new Date(date2) ? date1 : date2;
}

/**
 * Get the current contact being processed
 */
export function getCurrentContact(): PendingContact | null {
  const state = loadQueueState();
  if (state.currentIndex < state.pending.length) {
    return state.pending[state.currentIndex];
  }
  return null;
}

/**
 * Mark the current contact as completed and move to next
 */
export function completeCurrentContact(): void {
  const state = loadQueueState();
  
  // Remove current contact from pending list
  if (state.currentIndex < state.pending.length) {
    const completedEmail = state.pending[state.currentIndex].email;
    state.pending.splice(state.currentIndex, 1);
    console.log(`Completed contact: ${completedEmail}`);
  }
  
  // Current index stays the same (we removed the current item)
  // Check if we're done
  if (state.currentIndex >= state.pending.length) {
    state.processing = false;
    state.currentIndex = 0;
  }
  
  saveQueueState(state);
}

/**
 * Snooze the current contact for X minutes
 */
export function snoozeCurrentContact(minutes: number): void {
  const state = loadQueueState();
  
  if (state.currentIndex < state.pending.length) {
    const contact = state.pending[state.currentIndex];
    const snoozedUntil = new Date();
    snoozedUntil.setMinutes(snoozedUntil.getMinutes() + minutes);
    
    // Add to snoozed list
    state.snoozed.push({
      contactEmail: contact.email,
      snoozedUntil: snoozedUntil.toISOString(),
    });
    
    // Remove from pending and move to next
    state.pending.splice(state.currentIndex, 1);
    
    // Check if we're done with active contacts
    if (state.currentIndex >= state.pending.length) {
      state.processing = false;
      state.currentIndex = 0;
    }
    
    console.log(`Snoozed contact ${contact.email} until ${snoozedUntil.toISOString()}`);
    saveQueueState(state);
  }
}

/**
 * Dismiss the current contact permanently
 */
export function dismissCurrentContact(): void {
  const state = loadQueueState();
  
  if (state.currentIndex < state.pending.length) {
    const contact = state.pending[state.currentIndex];
    
    // Add to dismissed list
    state.dismissed.push(contact.email);
    
    // Remove from pending
    state.pending.splice(state.currentIndex, 1);
    
    // Check if we're done
    if (state.currentIndex >= state.pending.length) {
      state.processing = false;
      state.currentIndex = 0;
    }
    
    console.log(`Dismissed contact: ${contact.email}`);
    saveQueueState(state);
  }
}

/**
 * Snooze ALL active pending contacts for X minutes
 */
export function snoozeAllContacts(minutes: number): void {
  const state = loadQueueState();
  const snoozedUntil = new Date();
  snoozedUntil.setMinutes(snoozedUntil.getMinutes() + minutes);
  
  // Move all pending contacts to snoozed list
  state.pending.forEach(contact => {
    state.snoozed.push({
      contactEmail: contact.email,
      snoozedUntil: snoozedUntil.toISOString(),
    });
  });
  
  console.log(`Snoozed ${state.pending.length} contacts until ${snoozedUntil.toISOString()}`);
  
  // Clear pending list
  state.pending = [];
  state.currentIndex = 0;
  state.processing = false;
  
  saveQueueState(state);
}

/**
 * Dismiss ALL active pending contacts permanently
 */
export function dismissAllContacts(): void {
  const state = loadQueueState();
  
  // Add all pending contacts to dismissed list
  state.pending.forEach(contact => {
    state.dismissed.push(contact.email);
  });
  
  // Also add all snoozed contacts to dismissed list
  state.snoozed.forEach(snoozed => {
    if (!state.dismissed.includes(snoozed.contactEmail)) {
      state.dismissed.push(snoozed.contactEmail);
    }
  });
  
  console.log(`Dismissed ${state.pending.length + state.snoozed.length} contacts permanently`);
  
  // Clear pending and snoozed lists
  state.pending = [];
  state.snoozed = [];
  state.currentIndex = 0;
  state.processing = false;
  
  saveQueueState(state);
}

/**
 * Start processing the queue (user has clicked to begin adding contacts)
 */
export function startProcessingQueue(): void {
  const state = loadQueueState();
  state.processing = true;
  state.currentIndex = 0;
  saveQueueState(state);
}

/**
 * Stop processing the queue
 */
export function stopProcessingQueue(): void {
  const state = loadQueueState();
  state.processing = false;
  saveQueueState(state);
}

/**
 * Check if we're currently processing the queue
 */
export function isProcessingQueue(): boolean {
  const state = loadQueueState();
  return state.processing;
}

/**
 * Get total count of pending contacts (including snoozed)
 */
export function getTotalPendingCount(): number {
  const state = loadQueueState();
  return state.pending.length + state.snoozed.length;
}

/**
 * Get count of active (non-snoozed) pending contacts
 */
export function getActivePendingCount(): number {
  const state = loadQueueState();
  return state.pending.length;
}

/**
 * Check for expired snoozes and move them back to pending
 * Returns array of contacts that were unsnoozed
 */
export function checkExpiredSnoozes(): PendingContact[] {
  const state = loadQueueState();
  const now = new Date();
  const unsnoozed: PendingContact[] = [];
  
  // Find expired snoozes
  const expired = state.snoozed.filter(s => new Date(s.snoozedUntil) <= now);
  
  if (expired.length > 0) {
    // Remove from snoozed list
    state.snoozed = state.snoozed.filter(s => new Date(s.snoozedUntil) > now);
    
    // Try to restore contacts from old pending_contact_suggestions (migration)
    const oldStored = localStorage.getItem('pending_contact_suggestions');
    let oldContacts: any[] = [];
    if (oldStored) {
      try {
        oldContacts = JSON.parse(oldStored);
      } catch (e) {
        console.error('Failed to parse old contact suggestions:', e);
      }
    }
    
    // Add back to pending (but skip dismissed contacts)
    expired.forEach(exp => {
      // Skip if dismissed
      if (state.dismissed.includes(exp.contactEmail)) {
        console.log(`Skipping unsnoozed contact ${exp.contactEmail} (was dismissed)`);
        return;
      }
      
      // Try to find the full contact info
      const oldContact = oldContacts.find((c: any) => c.email === exp.contactEmail);
      
      if (oldContact) {
        const restoredContact: PendingContact = {
          email: oldContact.email,
          name: oldContact.name,
          company: oldContact.company,
          role: oldContact.role,
          location: oldContact.location,
          linkedinUrl: oldContact.linkedinUrl,
          notes: oldContact.notes,
          schedulingLink: oldContact.schedulingLink,
          nextCallDate: oldContact.nextCallDate,
          meetingIds: oldContact.meetingIds || [],
          meetingTitles: oldContact.meetingTitles || [],
          meetingDates: oldContact.meetingDates || [],
          detectedAt: oldContact.detectedAt || new Date().toISOString(),
        };
        state.pending.push(restoredContact);
        unsnoozed.push(restoredContact);
      } else {
        // Create minimal contact
        const minimalContact: PendingContact = {
          email: exp.contactEmail,
          meetingIds: [],
          meetingTitles: [],
          meetingDates: [],
          detectedAt: new Date().toISOString(),
        };
        state.pending.push(minimalContact);
        unsnoozed.push(minimalContact);
      }
    });
    
    saveQueueState(state);
    console.log(`Unsnoozed ${unsnoozed.length} contacts (skipped ${expired.length - unsnoozed.length} dismissed)`);
  }
  
  return unsnoozed;
}

/**
 * Start watching for expired snoozes
 * Call this once when the app starts
 */
export function startSnoozeWatcher(onContactsUnsnoozed: (contacts: PendingContact[]) => void): () => void {
  const intervalId = setInterval(() => {
    const unsnoozed = checkExpiredSnoozes();
    if (unsnoozed.length > 0) {
      onContactsUnsnoozed(unsnoozed);
    }
  }, SNOOZE_CHECK_INTERVAL);
  
  // Return cleanup function
  return () => clearInterval(intervalId);
}

/**
 * Clear all dismissed contacts (for testing/debugging)
 */
export function clearDismissed(): void {
  const state = loadQueueState();
  state.dismissed = [];
  saveQueueState(state);
}

/**
 * Reset entire queue (for testing/debugging)
 */
export function resetQueue(): void {
  localStorage.removeItem(QUEUE_STORAGE_KEY);
}