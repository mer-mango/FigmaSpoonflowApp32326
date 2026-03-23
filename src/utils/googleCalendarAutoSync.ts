import { CalendarEvent } from '../components/CalendarPage';

/**
 * Google Calendar Auto-Sync Utility
 * 
 * Handles automatic syncing of Google Calendar events with configurable interval.
 * Default: syncs every 30 minutes (configurable via localStorage calendarSettings.syncMinutes)
 * Also provides manual sync capability.
 */

export interface SyncStatus {
  isConnected: boolean;
  lastSyncTime: Date | null;
  isSyncing: boolean;
  error: string | null;
  eventsCount: number;
}

class GoogleCalendarAutoSync {
  private syncInterval: NodeJS.Timeout | null = null;
  private isConnected: boolean = false;
  private isSyncing: boolean = false;
  private lastSyncTime: Date | null = null;
  private lastError: string | null = null;
  private onEventsUpdated: ((events: CalendarEvent[]) => void) | null = null;
  private cachedEvents: CalendarEvent[] = [];

  constructor() {
    // Load connection status and last sync time from localStorage
    const stored = localStorage.getItem('googleCalendarSync');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        this.isConnected = data.isConnected || false;
        this.lastSyncTime = data.lastSyncTime ? new Date(data.lastSyncTime) : null;
      } catch (e) {
        console.error('Failed to load calendar sync status:', e);
      }
    }

    // Load cached events from localStorage
    const cachedEvents = localStorage.getItem('googleCalendarEvents');
    if (cachedEvents) {
      try {
        const parsed = JSON.parse(cachedEvents);
        this.cachedEvents = parsed.map((e: any) => ({
          ...e,
          startTime: new Date(e.startTime),
          endTime: new Date(e.endTime),
        }));
      } catch (e) {
        console.error('Failed to load cached events:', e);
      }
    }
  }

  /**
   * Start auto-sync with configurable interval (default: 30 minutes)
   * Interval can be configured via localStorage: calendarSettings.syncMinutes
   */
  startAutoSync(onEventsUpdated: (events: CalendarEvent[]) => void) {
    console.log('🎬 [startAutoSync] Called with:', {
      isConnected: this.isConnected,
      hasCallback: !!onEventsUpdated,
    });
    
    if (!this.isConnected) {
      console.warn('⚠️ [startAutoSync] Calendar not connected. Cannot start auto-sync.');
      return;
    }

    this.onEventsUpdated = onEventsUpdated;
    
    console.log('🚀 [startAutoSync] Starting initial sync...');
    
    // Initial sync
    this.sync();

    // Get sync interval from localStorage settings (default: 30 minutes)
    const syncMinutes = this.getSyncIntervalMinutes();
    const syncIntervalMs = syncMinutes * 60 * 1000;

    // Set up auto-sync interval
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      this.sync();
    }, syncIntervalMs);

    console.log(`✅ Google Calendar auto-sync started (every ${syncMinutes} minutes)`);
  }

  /**
   * Get sync interval from localStorage settings
   * @returns Sync interval in minutes (default: 30)
   * 
   * Example usage:
   * ```javascript
   * // Set sync interval to 15 minutes
   * localStorage.setItem('calendarSettings', JSON.stringify({ syncMinutes: 15 }));
   * 
   * // Set sync interval to 5 minutes for testing
   * localStorage.setItem('calendarSettings', JSON.stringify({ syncMinutes: 5 }));
   * ```
   */
  private getSyncIntervalMinutes(): number {
    try {
      const settings = localStorage.getItem('calendarSettings');
      if (settings) {
        const parsed = JSON.parse(settings);
        const syncMinutes = parsed.syncMinutes;
        
        // Validate: must be a positive number between 1 and 1440 (24 hours)
        if (typeof syncMinutes === 'number' && syncMinutes >= 1 && syncMinutes <= 1440) {
          return syncMinutes;
        }
      }
    } catch (e) {
      console.warn('Failed to read calendar settings, using default interval:', e);
    }
    
    // Default: 30 minutes
    return 30;
  }

  /**
   * Stop auto-sync
   */
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('🛑 Google Calendar auto-sync stopped');
    }
  }

  /**
   * Manual sync - can be called from UI
   */
  async manualSync(): Promise<CalendarEvent[]> {
    return await this.sync();
  }

  /**
   * Internal sync method
   */
  private async sync(): Promise<CalendarEvent[]> {
    if (this.isSyncing) {
      console.log('Sync already in progress...');
      return this.cachedEvents;
    }

    this.isSyncing = true;
    this.lastError = null;

    try {
      console.log('🔄 Syncing Google Calendar...');
      
      // Fetch events from Google Calendar API
      const events = await this.fetchCalendarEvents();
      
      // Check if we got demo data
      const hasDemoData = events.some(e => e.isDemoData);
      const realEventsCount = events.filter(e => !e.isDemoData).length;
      const demoEventsCount = events.filter(e => e.isDemoData).length;
      
      // Only show demo data message once on first load, and as info not warning
      if (hasDemoData && realEventsCount === 0 && !this.cachedEvents.length) {
        console.log('📅 Using demo calendar data. Connect Google Calendar in Settings for real events.');
      }
      
      // If we have real events, clear out any cached demo data from previous sessions
      if (realEventsCount > 0 && this.cachedEvents.some(e => e.isDemoData)) {
        console.log('🧹 Clearing cached demo data - now using real calendar events');
      }
      
      // Update cache
      this.cachedEvents = events;
      
      // Save to localStorage
      localStorage.setItem('googleCalendarEvents', JSON.stringify(events));
      
      // Update sync time
      this.lastSyncTime = new Date();
      this.saveStatus();
      
      // Notify listeners - with safety check
      if (this.onEventsUpdated) {
        try {
          this.onEventsUpdated(events);
        } catch (error) {
          console.error('❌ Error in events update callback:', error);
          // Don't throw - just log the error
        }
      }

      if (demoEventsCount > 0) {
        console.log(`✅ Synced ${realEventsCount} real calendar events (${demoEventsCount} demo events filtered)`);
      } else {
        console.log(`✅ Synced ${events.length} calendar events`);
      }
      
      return events;
    } catch (error) {
      this.lastError = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Calendar sync failed:', error);
      return this.cachedEvents; // Return cached events on error
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Fetch events from Google Calendar API
   * 
   * First tries to get real access token from server, falls back to demo data.
   */
  private async fetchCalendarEvents(): Promise<CalendarEvent[]> {
    try {
      // Try to get access token from server
      const accessToken = await this.getAccessTokenFromServer();
      
      if (accessToken) {
        console.log('📅 Using real Google Calendar API');
        return await this.fetchFromGoogleAPI(accessToken);
      } else {
        console.log('📅 Calendar not connected, using demo data');
        return this.generateSampleEvents();
      }
    } catch (error) {
      console.log('📅 Calendar sync not available, using demo data');
      return this.generateSampleEvents();
    }
  }

  /**
   * Get access token from server
   */
  private async getAccessTokenFromServer(): Promise<string | null> {
    try {
      // Get project info from localStorage or environment
      const supabaseUrl = localStorage.getItem('supabaseUrl');
      const supabaseAnonKey = localStorage.getItem('supabaseAnonKey');
      
      if (!supabaseUrl || !supabaseAnonKey) {
        return null;
      }
      
      const serverUrl = `${supabaseUrl}/functions/v1/make-server-a89809a8`;
      const response = await fetch(`${serverUrl}/integrations/status`, {
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`
        }
      });
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      
      // Return access token if calendar is connected
      if (data.calendar?.connected && data.calendar?.accessToken) {
        return data.calendar.accessToken;
      }
      
      return null;
    } catch (error) {
      // Silently fail if server is not available
      return null;
    }
  }

  /**
   * Fetch from actual Google Calendar API via server endpoint
   */
  private async fetchFromGoogleAPI(accessToken: string): Promise<CalendarEvent[]> {
    try {
      // Get project info
      const supabaseUrl = localStorage.getItem('supabaseUrl');
      const supabaseAnonKey = localStorage.getItem('supabaseAnonKey');
      
      if (!supabaseUrl || !supabaseAnonKey) {
        console.log('📅 Supabase credentials not configured, using demo data');
        return this.generateSampleEvents();
      }
      
      const serverUrl = `${supabaseUrl}/functions/v1/make-server-a89809a8`;

      console.log('🔍 [FETCH] Fetching calendar events from:', `${serverUrl}/calendar/events`);

      // Use server endpoint to fetch from multiple calendars
      const response = await fetch(`${serverUrl}/calendar/events`, {
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`
        }
      });

      console.log('🔍 [FETCH] Response status:', response.status, response.ok);

      if (!response.ok) {
        console.log('📅 Calendar not connected or no events available, using demo data');
        return this.generateSampleEvents();
      }

      const data = await response.json();
      
      console.log('🔍 [FETCH] Raw data from server:', {
        dataType: typeof data,
        isArray: Array.isArray(data),
        length: Array.isArray(data) ? data.length : 'N/A',
        hasEvents: !!data.events,
        eventsLength: data.events?.length || 0,
        sample: data.events?.slice(0, 2) || data.slice?.(0, 2)
      });
      
      // Transform Google Calendar events to our format
      const events = data.events || [];
      console.log(`📅 Fetched ${events.length} events from server endpoint`);
      return events.map((item: any) => this.transformGoogleEvent(item));
    } catch (error) {
      console.log('📅 Calendar sync not available, using demo data');
      return this.generateSampleEvents();
    }
  }

  /**
   * Transform Google Calendar event to our CalendarEvent format
   */
  private transformGoogleEvent(googleEvent: any): CalendarEvent {
    // Extract attendees emails (excluding self)
    const attendees = googleEvent.attendees
      ?.filter((a: any) => !a.self) // Exclude the user's own email
      ?.map((a: any) => a.email) || [];
    
    // Find primary contact (first non-self attendee)
    const primaryContact = googleEvent.attendees?.find((a: any) => !a.self);

    return {
      id: googleEvent.id,
      title: googleEvent.summary || 'Untitled Event',
      startTime: new Date(googleEvent.start.dateTime || googleEvent.start.date),
      endTime: new Date(googleEvent.end.dateTime || googleEvent.end.date),
      calendarId: googleEvent.calendarId || googleEvent.organizer?.email || 'primary',
      calendarName: googleEvent.organizer?.displayName || 'Google Calendar',
      color: googleEvent.color || '#a8988f', // Use color from server or default to muted peach
      contact: primaryContact ? {
        name: primaryContact.displayName || primaryContact.email,
        initials: this.getInitials(primaryContact.displayName || primaryContact.email),
        email: primaryContact.email,
      } : undefined,
      attendees,
      description: googleEvent.description,
      location: googleEvent.location,
      link: googleEvent.htmlLink,
    };
  }

  /**
   * Generate sample events for demo purposes
   */
  private generateSampleEvents(): Promise<CalendarEvent[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const now = new Date();
        const events: CalendarEvent[] = [];

        // Generate events for the next 14 days
        for (let i = 0; i < 14; i++) {
          const date = new Date(now);
          date.setDate(date.getDate() + i);
          
          // 1-3 events per day
          const numEvents = Math.floor(Math.random() * 3) + 1;
          
          for (let j = 0; j < numEvents; j++) {
            const startHour = 9 + Math.floor(Math.random() * 8); // 9am - 5pm
            const startTime = new Date(date);
            startTime.setHours(startHour, Math.random() > 0.5 ? 0 : 30, 0, 0);
            
            const duration = [30, 60, 90][Math.floor(Math.random() * 3)];
            const endTime = new Date(startTime);
            endTime.setMinutes(endTime.getMinutes() + duration);

            // Sample contacts with emails
            const contacts = [
              { name: 'Sarah Chen', email: 'sarah@example.com', initials: 'SC' },
              { name: 'Marcus Rodriguez', email: 'marcus@clientco.com', initials: 'MR' },
              { name: 'Emily Watson', email: 'emily@partner.com', initials: 'EW' },
              { name: 'David Kim', email: 'david@startup.io', initials: 'DK' },
              { name: 'Lisa Thompson', email: 'lisa@corp.com', initials: 'LT' },
            ];
            
            const contact = contacts[Math.floor(Math.random() * contacts.length)];
            
            const meetingTypes = [
              'Strategy Session',
              'Weekly Sync',
              'Project Review',
              'Client Check-in',
              '1:1 Meeting',
              'Team Standup',
              'Planning Session',
            ];
            
            const meetingType = meetingTypes[Math.floor(Math.random() * meetingTypes.length)];

            events.push({
              id: `cal-${i}-${j}-${Date.now()}`,
              title: `${meetingType} - ${contact.name}`,
              startTime,
              endTime,
              calendarId: 'work',
              calendarName: 'Work Calendar',
              color: '#4285F4',
              contact: {
                name: contact.name,
                initials: contact.initials,
                email: contact.email,
              },
              attendees: [contact.email],
              description: `${meetingType} with ${contact.name}`,
              location: Math.random() > 0.5 ? 'Zoom' : 'Conference Room',
              isDemoData: true, // Mark as demo data to prevent notifications
            });
          }
        }

        resolve(events);
      }, 500); // Simulate network delay
    });
  }

  /**
   * Get initials from a name
   */
  private getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  /**
   * Connect to Google Calendar
   */
  async connect(): Promise<boolean> {
    try {
      // In production, this would initiate OAuth flow
      // For demo, we'll just mark as connected
      
      this.isConnected = true;
      localStorage.setItem('google_calendar_connected', 'true');
      localStorage.setItem('google_calendar_access_token', 'demo'); // In production, store real token
      
      this.saveStatus();
      
      // Initial sync
      await this.sync();
      
      return true;
    } catch (error) {
      console.error('Failed to connect calendar:', error);
      return false;
    }
  }

  /**
   * Activate server-side integration (when OAuth is handled server-side)
   */
  activateServerIntegration(): void {
    console.log('🔌 Activating server-side calendar integration...');
    this.isConnected = true;
    this.saveStatus();
  }

  /**
   * Disconnect from Google Calendar
   */
  disconnect() {
    this.stopAutoSync();
    this.isConnected = false;
    this.lastSyncTime = null;
    this.cachedEvents = [];
    
    localStorage.removeItem('google_calendar_connected');
    localStorage.removeItem('google_calendar_access_token');
    localStorage.removeItem('googleCalendarEvents');
    
    this.saveStatus();
  }

  /**
   * Get current sync status
   */
  getStatus(): SyncStatus {
    return {
      isConnected: this.isConnected,
      lastSyncTime: this.lastSyncTime,
      isSyncing: this.isSyncing,
      error: this.lastError,
      eventsCount: this.cachedEvents.length,
    };
  }

  /**
   * Get cached events
   */
  getCachedEvents(): CalendarEvent[] {
    return this.cachedEvents;
  }

  /**
   * Reload cached events from localStorage (useful when external code updates the cache)
   */
  reloadCachedEvents(): CalendarEvent[] {
    console.log('🔄 [GoogleCalendarAutoSync] Reloading events from localStorage...');
    const cachedEvents = localStorage.getItem('googleCalendarEvents');
    if (cachedEvents) {
      try {
        const parsed = JSON.parse(cachedEvents);
        this.cachedEvents = parsed.map((e: any) => ({
          ...e,
          startTime: new Date(e.startTime),
          endTime: new Date(e.endTime),
        }));
        console.log('✅ [GoogleCalendarAutoSync] Reloaded', this.cachedEvents.length, 'events from cache');
      } catch (e) {
        console.error('❌ [GoogleCalendarAutoSync] Failed to reload cached events:', e);
        this.cachedEvents = [];
      }
    } else {
      console.log('⚠️ [GoogleCalendarAutoSync] No cached events found in localStorage');
      this.cachedEvents = [];
    }
    return this.cachedEvents;
  }

  /**
   * Clear demo data from cache and localStorage
   * Useful for cleaning up after demo events have been cached
   */
  clearDemoData(): void {
    console.log('🧹 Clearing demo calendar data...');
    
    // Filter out demo events from cache
    const beforeCount = this.cachedEvents.length;
    this.cachedEvents = this.cachedEvents.filter(e => !e.isDemoData);
    const afterCount = this.cachedEvents.length;
    const removedCount = beforeCount - afterCount;
    
    if (removedCount > 0) {
      console.log(`✅ Removed ${removedCount} demo events from cache`);
      
      // Update localStorage
      localStorage.setItem('googleCalendarEvents', JSON.stringify(this.cachedEvents));
      
      // Notify listeners of the cleaned data
      if (this.onEventsUpdated) {
        try {
          this.onEventsUpdated(this.cachedEvents);
        } catch (error) {
          console.error('❌ Error in events update callback:', error);
        }
      }
    } else {
      console.log('✅ No demo events found in cache');
    }
  }

  /**
   * Check if connected - now checks server integration status
   */
  isCalendarConnected(): boolean {
    // Check if we have a valid server integration
    // The actual connection is managed server-side now
    try {
      const integrationStatus = localStorage.getItem('calendar_integration_connected');
      if (integrationStatus === 'true') {
        return true;
      }
    } catch (e) {
      // Ignore
    }
    
    // Fallback to old method
    return this.isConnected;
  }

  /**
   * Save status to localStorage
   */
  private saveStatus() {
    const status = {
      isConnected: this.isConnected,
      lastSyncTime: this.lastSyncTime?.toISOString(),
    };
    localStorage.setItem('googleCalendarSync', JSON.stringify(status));
  }

  /**
   * Create a calendar event for content publishing
   * @param title - Content title
   * @param publishDate - Date to publish
   * @param platform - Platform (e.g., "LinkedIn Post", "Substack Post")
   * @param calendarId - Optional calendar ID (defaults to 'primary')
   * @returns Event ID if successful, null otherwise
   */
  async createContentPublishEvent(
    title: string,
    publishDate: Date,
    platform: string,
    calendarId: string = 'primary'
  ): Promise<string | null> {
    const accessToken = localStorage.getItem('google_calendar_access_token');
    
    if (!accessToken || accessToken === 'demo') {
      console.log('📅 Demo mode: Would create event:', { title, publishDate, platform, calendarId });
      return `demo-event-${Date.now()}`;
    }

    try {
      // Create all-day event
      const eventStart = new Date(publishDate);
      eventStart.setHours(0, 0, 0, 0);
      
      const eventEnd = new Date(publishDate);
      eventEnd.setHours(23, 59, 59, 999);

      const event = {
        summary: `📱 Publish: ${title}`,
        description: `Scheduled to publish on ${platform}\n\nContent: ${title}`,
        start: {
          date: publishDate.toISOString().split('T')[0], // YYYY-MM-DD for all-day event
        },
        end: {
          date: publishDate.toISOString().split('T')[0],
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 24 * 60 }, // 1 day before
            { method: 'popup', minutes: 60 }, // 1 hour before
          ],
        },
        colorId: '5', // Yellow/banana color for content events
      };

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to create event: ${errorData.error?.message || response.statusText}`);
      }

      const createdEvent = await response.json();
      console.log('✅ Created calendar event:', createdEvent.id);
      
      return createdEvent.id;
    } catch (error) {
      console.error('❌ Failed to create calendar event:', error);
      return null;
    }
  }

  /**
   * Update a calendar event (e.g., when publish date changes)
   */
  async updateContentPublishEvent(
    eventId: string,
    title: string,
    publishDate: Date,
    platform: string,
    calendarId: string = 'primary'
  ): Promise<boolean> {
    const accessToken = localStorage.getItem('google_calendar_access_token');
    
    if (!accessToken || accessToken === 'demo') {
      console.log('📅 Demo mode: Would update event:', { eventId, title, publishDate });
      return true;
    }

    try {
      const event = {
        summary: `📱 Publish: ${title}`,
        description: `Scheduled to publish on ${platform}\n\nContent: ${title}`,
        start: {
          date: publishDate.toISOString().split('T')[0],
        },
        end: {
          date: publishDate.toISOString().split('T')[0],
        },
      };

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update event: ${response.statusText}`);
      }

      console.log('✅ Updated calendar event:', eventId);
      return true;
    } catch (error) {
      console.error('❌ Failed to update calendar event:', error);
      return false;
    }
  }

  /**
   * Delete a calendar event
   */
  async deleteContentPublishEvent(
    eventId: string,
    calendarId: string = 'primary'
  ): Promise<boolean> {
    const accessToken = localStorage.getItem('google_calendar_access_token');
    
    if (!accessToken || accessToken === 'demo') {
      console.log('📅 Demo mode: Would delete event:', eventId);
      return true;
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok && response.status !== 404) {
        throw new Error(`Failed to delete event: ${response.statusText}`);
      }

      console.log('✅ Deleted calendar event:', eventId);
      return true;
    } catch (error) {
      console.error('❌ Failed to delete calendar event:', error);
      return false;
    }
  }
}

// Singleton instance
export const googleCalendarAutoSync = new GoogleCalendarAutoSync();