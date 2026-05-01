import { useState, useEffect, useCallback, useRef } from 'react';
import { CalendarEvent } from '../components/CalendarPage';
import { googleCalendarAutoSync, SyncStatus } from '../utils/googleCalendarAutoSync';

/**
 * Hook for managing Google Calendar meetings
 * 
 * Usage:
 * const { events, status, connect, disconnect, manualSync } = useGoogleCalendarMeetings();
 */
export function useGoogleCalendarMeetings() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [status, setStatus] = useState<SyncStatus>(googleCalendarAutoSync.getStatus());
  
  // Use ref instead of state to avoid triggering re-renders
  const lastCheckDate = useRef<string>(new Date().toDateString());

  // Load cached events on mount and clear any demo data
  useEffect(() => {
    // Clear any demo data that might be cached (prevents notifications for fake events)
    googleCalendarAutoSync.clearDemoData();
    
    const cachedEvents = googleCalendarAutoSync.getCachedEvents();
    if (cachedEvents.length > 0) {
      setEvents(cachedEvents);
      console.log('📅 Loaded', cachedEvents.length, 'cached calendar events');
    }

    // Update status
    setStatus(googleCalendarAutoSync.getStatus());
  }, []);

  // Handle events update from sync
  const handleEventsUpdate = useCallback((newEvents: CalendarEvent[]) => {
    setEvents(newEvents);
    setStatus(googleCalendarAutoSync.getStatus());
  }, []);

  // Connect to Google Calendar
  const connect = useCallback(async () => {
    try {
      const success = await googleCalendarAutoSync.connect();
      
      if (success) {
        // Start auto-sync
        googleCalendarAutoSync.startAutoSync(handleEventsUpdate);
        
        // Update local state
        const cachedEvents = googleCalendarAutoSync.getCachedEvents();
        setEvents(cachedEvents);
        setStatus(googleCalendarAutoSync.getStatus());
      }
      
      return success;
    } catch (error) {
      console.error('Failed to connect calendar:', error);
      return false;
    }
  }, [handleEventsUpdate]);

  // Disconnect from Google Calendar
  const disconnect = useCallback(() => {
    googleCalendarAutoSync.disconnect();
    setEvents([]);
    setStatus(googleCalendarAutoSync.getStatus());
  }, []);

  // Manual sync
  const manualSync = useCallback(async () => {
    try {
      const newEvents = await googleCalendarAutoSync.manualSync();
      setEvents(newEvents);
      setStatus(googleCalendarAutoSync.getStatus());
      return newEvents;
    } catch (error) {
      console.error('Manual sync failed:', error);
      return events; // Return current events on error
    }
  }, [events]);

  // Reload cache from localStorage (useful when calendar page updates the cache)
  const reloadCache = useCallback(() => {
    const cachedEvents = googleCalendarAutoSync.reloadCachedEvents(); // Use the new method
    console.log('🔄 Reloading calendar cache:', cachedEvents.length, 'events');
    setEvents(cachedEvents);
    setStatus(googleCalendarAutoSync.getStatus());
    return cachedEvents;
  }, []);

  // Start auto-sync if already connected
  useEffect(() => {
    // Re-check status on every render in case it was updated externally
    const currentStatus = googleCalendarAutoSync.getStatus();
    setStatus(currentStatus);
    
    console.log('🔍 [useGoogleCalendarMeetings] useEffect triggered:', {
      isConnected: currentStatus.isConnected,
      eventsCount: currentStatus.eventsCount,
      lastSyncTime: currentStatus.lastSyncTime,
    });
    
    if (currentStatus.isConnected) {
      console.log('🔄 [useGoogleCalendarMeetings] Starting auto-sync - connected:', currentStatus.isConnected);
      googleCalendarAutoSync.startAutoSync(handleEventsUpdate);
      
      // Cleanup on unmount
      return () => {
        console.log('🛑 [useGoogleCalendarMeetings] Cleanup - stopping auto-sync');
        googleCalendarAutoSync.stopAutoSync();
      };
    } else {
      console.log('⚠️ [useGoogleCalendarMeetings] NOT starting auto-sync - not connected');
    }
  }, [handleEventsUpdate]);
  
  // Monitor localStorage flag changes (for when server integration is activated)
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const newStatus = googleCalendarAutoSync.getStatus();
      if (newStatus.isConnected !== status.isConnected) {
        console.log('🔄 [useGoogleCalendarMeetings] Connection status changed:', newStatus.isConnected);
        setStatus(newStatus);
      }
    }, 1000); // Check every second
    
    return () => clearInterval(checkInterval);
  }, [status.isConnected]);

  // 📅 CHECK FOR DATE CHANGES - sync calendar when the date changes
  useEffect(() => {
    const dateCheckInterval = setInterval(() => {
      const currentDate = new Date().toDateString();
      
      if (currentDate !== lastCheckDate.current) {
        console.log('📅 [DATE CHANGE DETECTED] Day changed from', lastCheckDate.current, 'to', currentDate);
        console.log('🔄 [AUTO-SYNC] Triggering calendar sync due to date change...');
        
        lastCheckDate.current = currentDate;
        
        // Trigger a calendar sync if connected
        if (status.isConnected) {
          googleCalendarAutoSync.manualSync()
            .then((newEvents) => {
              console.log('✅ [DATE CHANGE SYNC] Successfully synced', newEvents.length, 'events for new day');
              setEvents(newEvents);
              setStatus(googleCalendarAutoSync.getStatus());
            })
            .catch((error) => {
              console.error('❌ [DATE CHANGE SYNC] Failed to sync calendar:', error);
            });
        } else {
          console.log('⚠️ [DATE CHANGE SYNC] Calendar not connected, skipping sync');
        }
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(dateCheckInterval);
  }, [status.isConnected]);

  return {
    events,
    status,
    connect,
    disconnect,
    manualSync,
    reloadCache,
  };
}