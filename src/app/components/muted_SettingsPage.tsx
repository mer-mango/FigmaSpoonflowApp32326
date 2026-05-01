// Settings Page - Updated with Data Backup

import { Service } from '../App';
import { useState, useEffect } from 'react';
import { OriginalFormsApp } from './forms/OriginalFormsApp';
import { 
  User, 
  Bell, 
  Palette, 
  Calendar,
  Mail,
  Lock,
  HelpCircle,
  ChevronRight,
  Check,
  Sparkles,
  Clock,
  TestTube,
  Briefcase,
  Plus,
  Pencil,
  Trash2,
  DollarSign,
  Archive,
  RotateCcw,
  FileText,
  Linkedin,
  Rss,
  Download,
  Upload,
  Database
} from 'lucide-react';
import { PageHeader_Muted } from './PageHeader_Muted';
import { MutedNotificationSettings } from './muted_NotificationSettings';
import { MutedIntegrationsSettings } from './muted_IntegrationsSettings';
import { useNotifications } from '../contexts/NotificationContext';
import { toast } from 'sonner';
import React from 'react';
import { RssFeedSettings } from './RssFeedSettings';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { getUserSchedulingLink, saveUserSchedulingLink } from '../utils/userSettings';
import { DataBackupSection } from './DataBackupSection';
import { FathomZapierSettings } from './settings/FathomZapierSettings';

interface MutedSettingsPageProps {
  onQuickAddSelect?: (type: 'task' | 'contact' | 'content' | 'voice') => void;
  onJamieAction?: (type: 'plan-day' | 'post-meeting' | 'wind-down' | 'chat') => void;
  services?: Service[];
  onUpdateServices?: (services: Service[]) => void;
  onBack?: () => void;
}

export default function MutedSettingsPage({ 
  onQuickAddSelect, 
  onJamieAction,
  services: propServices = [],
  onUpdateServices,
  onBack
}: MutedSettingsPageProps = {}) {
  const [activeSection, setActiveSection] = useState<'profile' | 'notifications' | 'appearance' | 'integrations' | 'schedule' | 'services' | 'forms' | 'archive' | 'data-backup'>('integrations');

  // Get notification helpers for testing
  const { notifyStatusChange } = useNotifications();
  
  // Calendar connection state
  const [isCalendarConnected, setIsCalendarConnected] = useState(false);
  const [calendarEmail, setCalendarEmail] = useState<string | null>(null);
  const [calendars, setCalendars] = useState<any[]>([]);
  const [isLoadingCalendars, setIsLoadingCalendars] = useState(false);
  
  // Gmail and LinkedIn connection state
  const [isGmailConnected, setIsGmailConnected] = useState(false);
  const [gmailEmail, setGmailEmail] = useState<string | null>(null);
  const [isLinkedInConnected, setIsLinkedInConnected] = useState(false);
  const [linkedInName, setLinkedInName] = useState<string | null>(null);
  
  // Debug state
  const [debugInfo, setDebugInfo] = useState<any>(null);
  
  // Debug: Check KV store
  const checkKvStore = async () => {
    try {
      const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-a89809a8`;
      
      // Fetch both KV store and status endpoint
      const [kvResponse, statusResponse] = await Promise.all([
        fetch(`${serverUrl}/debug/kv-integrations`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }),
        fetch(`${serverUrl}/integrations/status`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        })
      ]);
      
      console.log('📡 Status Response Status:', statusResponse.status);
      console.log('📡 Status Response Headers:', Object.fromEntries(statusResponse.headers.entries()));
      
      const statusText = await statusResponse.text();
      console.log('📡 Status Response Raw Text:', statusText);
      
      let statusData;
      try {
        statusData = JSON.parse(statusText);
      } catch (e) {
        statusData = { error: 'Failed to parse JSON', raw: statusText };
      }
      
      const kvData = kvResponse.ok ? await kvResponse.json() : { error: 'Failed to fetch' };
      
      const combinedData = {
        kvStore: kvData,
        statusEndpoint: statusData,
        statusResponseStatus: statusResponse.status,
        timestamp: new Date().toISOString()
      };
      
      console.log('🔍 Debug Data:', combinedData);
      setDebugInfo(combinedData);
    } catch (error) {
      console.error('Failed to check KV store:', error);
      setDebugInfo({ error: String(error) });
    }
  };

  // Fetch user's calendars
  const fetchCalendars = async () => {
    try {
      console.log('📋 Fetching calendars list...');
      setIsLoadingCalendars(true);
      const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-a89809a8`;
      const response = await fetch(`${serverUrl}/calendar/list`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      
      console.log('📋 Calendar list response:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📅 Fetched calendars:', data.calendars?.length || 0, 'calendars');
        console.log('📅 Calendar data:', JSON.stringify(data.calendars, null, 2));
        // Ensure each calendar has proper defaults to prevent uncontrolled input warnings
        const calendarsWithDefaults = (data.calendars || []).map((cal: any) => ({
          ...cal,
          selected: cal.selected ?? false
        }));
        setCalendars(calendarsWithDefaults);
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to fetch calendars:', response.status, errorText);
      }
    } catch (error) {
      console.error('❌ Failed to fetch calendars:', error);
    } finally {
      setIsLoadingCalendars(false);
    }
  };

  // Toggle calendar selection
  const toggleCalendar = async (calendarId: string) => {
    const updatedCalendars = calendars.map(cal => 
      cal.id === calendarId ? { ...cal, selected: !cal.selected } : cal
    );
    setCalendars(updatedCalendars);
    
    // Save to server
    try {
      const selectedIds = updatedCalendars.filter(c => c.selected).map(c => c.id);
      const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-a89809a8`;
      await fetch(`${serverUrl}/calendar/select`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ calendarIds: selectedIds })
      });
      console.log('✅ Saved calendar selection');
      toast.success('Calendar selection updated');
    } catch (error) {
      console.error('Failed to save calendar selection:', error);
      toast.error('Failed to save selection');
    }
  };

  // Check calendar connection status on mount
  useEffect(() => {
    const checkConnectionStatus = async () => {
      try {
        console.log('🔍 Checking integration connection status...');
        const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-a89809a8`;
        const response = await fetch(`${serverUrl}/integrations/status`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        });
        
        console.log('📡 Status check response:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('📅 Integration status data:', JSON.stringify(data, null, 2));
          
          // Check Calendar
          if (data.calendar?.connected) {
            console.log('✅ Calendar is connected! Email:', data.calendar.email);
            setIsCalendarConnected(true);
            setCalendarEmail(data.calendar.email || null);
            // Set flag for auto-sync to detect
            localStorage.setItem('calendar_integration_connected', 'true');
            // Fetch calendar list
            fetchCalendars();
          } else {
            console.log('📅 Calendar not connected');
            localStorage.removeItem('calendar_integration_connected');
          }
          
          // Check Gmail
          if (data.gmail?.connected) {
            console.log('✅ Gmail is connected! Email:', data.gmail.email);
            setIsGmailConnected(true);
            setGmailEmail(data.gmail.email || null);
          } else {
            console.log('📧 Gmail not connected');
          }
          
          // Check LinkedIn
          if (data.linkedin?.connected) {
            console.log('✅ LinkedIn is connected! Name:', data.linkedin.name);
            setIsLinkedInConnected(true);
            setLinkedInName(data.linkedin.name || null);
          } else {
            console.log('💼 LinkedIn not connected');
          }
        } else {
          const errorText = await response.text();
          console.debug('Integration status check skipped:', response.status);
        }
      } catch (error) {
        // Silent fail - status will default to disconnected
        console.debug('Integration status check skipped (server may be starting)');
      }
    };
    
    checkConnectionStatus();
  }, []);

  // Profile settings - load from localStorage
  const [profileSettings, setProfileSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('profileSettings');
      const parsed = saved ? JSON.parse(saved) : {};
      // Ensure all fields have default values to prevent uncontrolled input warnings
      return { 
        fullName: parsed.fullName || '', 
        email: parsed.email || '' 
      };
    } catch {
      return { fullName: '', email: '' };
    }
  });

  // Persist profile settings whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('profileSettings', JSON.stringify(profileSettings));
    } catch (error) {
      console.error('Failed to save profile settings to localStorage:', error);
    }
  }, [profileSettings]);

  // Settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    jamieReminders: true,
    meetingReminders: true,
    taskDeadlines: true,
  });

  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'light',
    fontSize: 'medium',
  });

  // Scheduling Link state - load from settings utility
  const [schedulingLink, setSchedulingLink] = useState(() => {
    return getUserSchedulingLink();
  });

  // Save scheduling link using utility function
  const handleSaveSchedulingLink = () => {
    saveUserSchedulingLink(schedulingLink);
    toast.success('Scheduling link saved!');
  };

  // Use services from props
  const services = propServices;
  const setServices = (updater: Service[] | ((prev: Service[]) => Service[])) => {
    const newServices = typeof updater === 'function' ? updater(propServices) : updater;
    console.log('💾 SettingsPage: Saving services to localStorage via onUpdateServices callback...', newServices);
    if (onUpdateServices) {
      onUpdateServices(newServices);
      console.log('✅ SettingsPage: Services updated via callback - App.tsx will persist to localStorage');
    } else {
      console.error('⚠️ SettingsPage: onUpdateServices callback is not defined!');
    }
  };

  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showAddService, setShowAddService] = useState(false);

  const settingsSections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'schedule', label: 'Schedule', icon: Clock },
    { id: 'integrations', label: 'Integrations', icon: Calendar },
    { id: 'services', label: 'Services', icon: Briefcase },
    { id: 'forms', label: 'Forms Editor', icon: Pencil },
    { id: 'content-ideas', label: 'Content Ideas', icon: Rss },
    { id: 'data-backup', label: 'Data Backup', icon: Database },
    { id: 'archive', label: 'Archive', icon: Archive },
  ];

  const handleConnectCalendar = () => {
    console.log('🔗 Starting Google Calendar OAuth...');
    
    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    // Open popup to our OAuth launcher page
    const launcherUrl = `${window.location.origin}${window.location.pathname}?calendar-oauth=launcher`;
    
    console.log('📅 Opening popup to:', launcherUrl);
    
    const popup = window.open(
      launcherUrl,
      'calendar-oauth',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
    
    // Listen for success message from popup
    const handleMessage = (event: MessageEvent) => {
      console.log('📨 SettingsPage: Message received from popup:', event.data);
      
      if (event.data?.type === 'calendar-connected') {
        console.log('✅ Calendar connected via OAuth');
        setIsCalendarConnected(true);
        setCalendarEmail(event.data?.email || null);
        toast.success('Google Calendar connected successfully!');
        // Fetch calendars after connecting
        fetchCalendars();
      } else if (event.data?.type === 'calendar-debug') {
        console.log('🐛 SettingsPage: Calendar OAuth Callback Debug Info:', event.data);
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    // Cleanup listener when popup closes
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed);
        window.removeEventListener('message', handleMessage);
      }
    }, 500);
  };

  const handleDisconnectCalendar = async () => {
    try {
      console.log('🔌 Disconnecting Google Calendar...');
      const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-a89809a8`;
      const response = await fetch(`${serverUrl}/calendar/disconnect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      if (response.ok) {
        setIsCalendarConnected(false);
        setCalendarEmail(null);
        setCalendars([]);
        localStorage.removeItem('calendar_integration_connected');
        toast.success('Google Calendar disconnected');
        console.log('✅ Calendar disconnected successfully');
      } else {
        throw new Error('Failed to disconnect calendar');
      }
    } catch (error) {
      console.error('Failed to disconnect calendar:', error);
      toast.error('Failed to disconnect calendar');
    }
  };

  const handleConnectGmail = () => {
    console.log('🔗 Starting Gmail OAuth...');
    
    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    // Open popup to our OAuth launcher page
    const launcherUrl = `${window.location.origin}${window.location.pathname}?gmail-oauth=launcher`;
    
    console.log('📧 Opening popup to:', launcherUrl);
    
    const popup = window.open(
      launcherUrl,
      'gmail-oauth',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
    
    // Listen for success message from popup
    const handleMessage = (event: MessageEvent) => {
      console.log('📨 SettingsPage: Message received from popup:', event.data);
      
      if (event.data?.type === 'gmail-connected') {
        console.log('✅ Gmail connected via OAuth');
        toast.success('Gmail connected successfully!');
        popup?.close();
        
        // Refresh connection status
        setTimeout(async () => {
          try {
            const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-a89809a8`;
            const response = await fetch(`${serverUrl}/integrations/status`, {
              headers: { 'Authorization': `Bearer ${publicAnonKey}` }
            });
            if (response.ok) {
              const data = await response.json();
              if (data.gmail?.connected) {
                setIsGmailConnected(true);
                setGmailEmail(data.gmail.email || null);
              }
            }
          } catch (error) {
            console.error('Failed to refresh Gmail status:', error);
          }
        }, 1000);
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    // Cleanup listener when popup closes
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed);
        window.removeEventListener('message', handleMessage);
      }
    }, 500);
  };

  const handleConnectLinkedIn = () => {
    console.log('🔗 Starting LinkedIn OAuth...');
    
    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    // Open popup to our OAuth launcher page
    const launcherUrl = `${window.location.origin}${window.location.pathname}?linkedin-oauth=launcher`;
    
    console.log('💼 Opening popup to:', launcherUrl);
    
    const popup = window.open(
      launcherUrl,
      'linkedin-oauth',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
    
    // Listen for success message from popup
    const handleMessage = (event: MessageEvent) => {
      console.log('📨 SettingsPage: Message received from popup:', event.data);
      
      if (event.data?.type === 'linkedin-connected') {
        console.log('✅ LinkedIn connected via OAuth');
        toast.success('LinkedIn connected successfully!');
        popup?.close();
        
        // Refresh connection status
        setTimeout(async () => {
          try {
            const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-a89809a8`;
            const response = await fetch(`${serverUrl}/integrations/status`, {
              headers: { 'Authorization': `Bearer ${publicAnonKey}` }
            });
            if (response.ok) {
              const data = await response.json();
              if (data.linkedin?.connected) {
                setIsLinkedInConnected(true);
                setLinkedInName(data.linkedin.name || null);
              }
            }
          } catch (error) {
            console.error('Failed to refresh LinkedIn status:', error);
          }
        }, 1000);
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    // Cleanup listener when popup closes
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed);
        window.removeEventListener('message', handleMessage);
      }
    }, 500);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <PageHeader_Muted
        title="Settings"
        onQuickAddSelect={onQuickAddSelect}
        onJamieAction={onJamieAction}
        onBack={onBack}
        showBackButton={!!onBack}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white/40 backdrop-blur-xl border-r border-slate-200/50 p-6">
          <nav className="space-y-2">
            {settingsSections.map((section) => {
              const IconComponent = section.icon;
              const isActive = activeSection === section.id;
              
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-br from-[#a8998f] to-[#b8a7a0] text-white shadow-lg'
                      : 'text-slate-700 hover:bg-white/60'
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span className="font-medium text-sm">{section.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-[50px] py-8">
          {activeSection === 'profile' && (
            <div className="max-w-2xl">
              <h2 className="font-serif text-3xl text-slate-800 mb-6">Profile Settings</h2>
              
              <div className="space-y-6">
                {/* Profile Picture */}
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-slate-200/50">
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Profile Picture
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#a8998f] to-[#b8a7a0] flex items-center justify-center text-white text-2xl font-serif">
                      U
                    </div>
                    <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-2xl text-sm font-medium text-slate-700 transition-colors">
                      Change Photo
                    </button>
                  </div>
                </div>

                {/* Name */}
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-slate-200/50">
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={profileSettings.fullName}
                    onChange={(e) => setProfileSettings(prev => ({ ...prev, fullName: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#a8998f]/30"
                  />
                </div>

                {/* Email */}
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-slate-200/50">
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={profileSettings.email}
                    onChange={(e) => setProfileSettings(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#a8998f]/30"
                  />
                </div>

                {/* Scheduling Link */}
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-slate-200/50">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        My Scheduling Link
                      </label>
                      <p className="text-xs text-slate-500 mt-1">
                        This link is used when Jamie drafts scheduling emails on your behalf
                      </p>
                    </div>
                    <Calendar className="w-5 h-5 text-[#7fa99b] flex-shrink-0" />
                  </div>
                  <div className="space-y-3">
                    <input
                      type="url"
                      value={schedulingLink}
                      onChange={(e) => setSchedulingLink(e.target.value)}
                      placeholder="https://calendar.app.google/..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7fa99b]/30 text-sm"
                    />
                    <button 
                      onClick={handleSaveSchedulingLink}
                      className="px-4 py-2 bg-[#7fa99b] hover:bg-[#7fa99b]/90 text-white rounded-xl text-sm font-medium transition-colors"
                    >
                      Save Link
                    </button>
                  </div>
                </div>

                {/* Save Button */}
                <button 
                  onClick={() => {
                    toast.success('Profile settings saved!');
                  }}
                  className="px-6 py-3 bg-gradient-to-br from-[#a8998f] to-[#b8a7a0] text-white rounded-2xl font-medium hover:shadow-lg transition-all"
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <MutedNotificationSettings
              preferences={(() => {
                try {
                  const saved = localStorage.getItem('notificationPreferences');
                  return saved ? JSON.parse(saved) : undefined;
                } catch {
                  return undefined;
                }
              })()}
              onSave={(prefs) => {
                try {
                  localStorage.setItem('notificationPreferences', JSON.stringify(prefs));
                  toast.success('Notification preferences saved!');
                  console.log('✅ Notification preferences saved to localStorage:', prefs);
                } catch (error) {
                  console.error('Failed to save notification preferences to localStorage:', error);
                  toast.error('Failed to save notification preferences');
                }
              }}
            />
          )}

          {activeSection === 'integrations' && (
            <div className="max-w-4xl space-y-8">
              {/* Google Calendar Integration */}
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-slate-200/50">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-['Lora'] text-xl text-slate-800 mb-1">Google Calendar</h3>
                    <p className="text-sm text-slate-600">Sync your calendar events and meetings</p>
                  </div>
                  {isCalendarConnected ? (
                    <button
                      onClick={handleDisconnectCalendar}
                      className="px-4 py-2 text-sm border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      onClick={handleConnectCalendar}
                      className="px-4 py-2 text-sm bg-[#6b2358] text-white rounded-lg hover:bg-[#541c45] transition-colors"
                    >
                      Connect
                    </button>
                  )}
                </div>
                
                {isCalendarConnected && calendarEmail && (
                  <div className="pt-4 border-t border-slate-200">
                    <p className="text-sm text-slate-600 mb-3">
                      Connected as <strong>{calendarEmail}</strong>
                    </p>
                    
                    {/* Calendar Selection */}
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 mb-3">Select calendars to sync:</h4>
                      {isLoadingCalendars ? (
                        <p className="text-sm text-slate-500">Loading calendars...</p>
                      ) : calendars.length > 0 ? (
                        <div className="space-y-2">
                          {calendars.map(calendar => (
                            <label
                              key={calendar.id}
                              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={calendar.selected}
                                onChange={() => toggleCalendar(calendar.id)}
                                className="w-4 h-4 text-[#6b2358] border-slate-300 rounded focus:ring-[#6b2358]"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-3 h-3 rounded-full" 
                                    style={{ backgroundColor: calendar.color || calendar.backgroundColor || '#6b2358' }}
                                  />
                                  <span className="text-sm font-medium text-slate-700">{calendar.name || calendar.summary}</span>
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500">No calendars found</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Gmail Integration */}
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-slate-200/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-['Lora'] text-xl text-slate-800 mb-1">Gmail</h3>
                    <p className="text-sm text-slate-600">Send emails and track communications</p>
                  </div>
                  {isGmailConnected ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-green-600">✓ Connected</span>
                      {gmailEmail && (
                        <span className="text-xs text-slate-500">({gmailEmail})</span>
                      )}
                      <button
                        onClick={() => {
                          // TODO: Implement disconnect
                          toast.info('Gmail disconnect coming soon');
                        }}
                        className="px-4 py-2 text-sm border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        Disconnect
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Not connected</span>
                      <button
                        onClick={handleConnectGmail}
                        className="px-4 py-2 text-sm bg-[#6b2358] text-white rounded-lg hover:bg-[#541c45] transition-colors"
                      >
                        Connect
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* LinkedIn Integration */}
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-slate-200/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-['Lora'] text-xl text-slate-800 mb-1">LinkedIn</h3>
                    <p className="text-sm text-slate-600">Import connections and track interactions</p>
                  </div>
                  {isLinkedInConnected ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-green-600">✓ Connected</span>
                      {linkedInName && (
                        <span className="text-xs text-slate-500">({linkedInName})</span>
                      )}
                      <button
                        onClick={() => {
                          // TODO: Implement disconnect
                          toast.info('LinkedIn disconnect coming soon');
                        }}
                        className="px-4 py-2 text-sm border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        Disconnect
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Not connected</span>
                      <button
                        onClick={handleConnectLinkedIn}
                        className="px-4 py-2 text-sm bg-[#6b2358] text-white rounded-lg hover:bg-[#541c45] transition-colors"
                      >
                        Connect
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Fathom Integration via Zapier */}
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-slate-200/50">
                <FathomZapierSettings />
              </div>

              {/* Brave Search Integration */}
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-slate-200/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-['Lora'] text-xl text-slate-800 mb-1">Brave Search</h3>
                    <p className="text-sm text-slate-600">Power web research and content ideation</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-green-600">✓ API Key Set</span>
                    <span className="text-xs text-slate-400 ml-2">Ready to use</span>
                  </div>
                </div>
              </div>

              {/* Substack/Newsletter Fetcher */}
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-slate-200/50">
                <div className="mb-4">
                  <h3 className="font-['Lora'] text-xl text-slate-800 mb-1">Newsletter & Blog Fetcher</h3>
                  <p className="text-sm text-slate-600">Automatically pull content from Substack newsletters and blogs</p>
                </div>
                <button
                  onClick={() => setActiveSection('content-ideas')}
                  className="px-4 py-2 text-sm bg-[#6b2358] text-white rounded-lg hover:bg-[#541c45] transition-colors"
                >
                  Manage RSS Feeds
                </button>
              </div>
            </div>
          )}

          {activeSection === 'schedule' && (
            <div className="max-w-4xl p-6 text-center text-gray-500">
              <p>Schedule settings component temporarily disabled</p>
              <p className="text-sm mt-2">ScheduleSettings component was removed (scheduling feature disabled)</p>
            </div>
          )}

          {activeSection === 'services' && (
            <div className="max-w-4xl">
              <div className="mb-6">
                <h2 className="font-['Lora'] text-3xl text-slate-800 mb-2">Services</h2>
                <p className="text-slate-600">Manage your service offerings. These services are used across Scope of Work, Invoice, Services Brochure, and Payment Terms forms.</p>
              </div>
              
              <div className="space-y-4">
                {/* Add Service Button */}
                <button
                  className="px-6 py-3 bg-gradient-to-br from-[#a8998f] to-[#b8a7a0] text-white rounded-2xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
                  onClick={() => {
                    setShowAddService(true);
                    setEditingService({
                      id: `service-${Date.now()}`,
                      name: '',
                      description: '',
                      price: '',
                      duration: '',
                      deliverables: [''],
                      isActive: true
                    });
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Add New Service
                </button>

                {/* Service List */}
                {services.length === 0 ? (
                  <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-12 border border-slate-200/50 text-center">
                    <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 mb-2">No services yet</p>
                    <p className="text-sm text-slate-500">Add your first service to get started</p>
                  </div>
                ) : (
                  services.map(service => (
                    <div key={service.id} className="contents">
                      {/* Service Card */}
                      <div
                        className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-slate-200/50"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-['Lora'] text-xl text-slate-800">{service.name}</h3>
                              {!service.isActive && (
                                <span className="px-2 py-1 bg-slate-200 text-slate-600 text-xs rounded-full">Inactive</span>
                              )}
                            </div>
                            <p className="text-sm text-slate-600 mb-3">{service.description}</p>
                            <div className="grid grid-cols-2 gap-4 mb-3">
                              <div>
                                <span className="text-xs text-slate-500 block mb-1">Price</span>
                                <span className="text-sm font-medium text-slate-700 flex items-center gap-1">
                                  <DollarSign className="w-3 h-3" />
                                  {service.price}
                                </span>
                              </div>
                              <div>
                                <span className="text-xs text-slate-500 block mb-1">Duration</span>
                                <span className="text-sm font-medium text-slate-700">{service.duration}</span>
                              </div>
                            </div>
                            {service.deliverables && service.deliverables.length > 0 && service.deliverables[0] !== '' && (
                              <div className="mb-3">
                                <span className="text-xs text-slate-500 block mb-2">Deliverables</span>
                                <ul className="space-y-1">
                                  {service.deliverables.map((deliverable, idx) => (
                                    deliverable && (
                                      <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                                        <Check className="w-3 h-3 text-[#a8998f] mt-1 flex-shrink-0" />
                                        <span>{deliverable}</span>
                                      </li>
                                    )
                                  ))}
                                </ul>
                              </div>
                            )}
                            {/* Show linked forms */}
                            {service.linkedForms && service.linkedForms.length > 0 && (
                              <div className="pt-3 border-t border-slate-200/50">
                                <span className="text-xs text-slate-500 block mb-2">Used in forms:</span>
                                <div className="flex flex-wrap gap-2">
                                  {service.linkedForms.map((formId, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-[#a8998f]/10 text-[#a8998f] text-xs rounded-full">
                                      {formId}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              className="p-2 text-[#a8998f] hover:bg-[#a8998f]/10 rounded-lg transition-colors"
                              onClick={() => {
                                if (editingService?.id === service.id) {
                                  setEditingService(null); // Close if already editing
                                } else {
                                  // Ensure all fields have proper defaults to prevent uncontrolled input warnings
                                  setEditingService({
                                    ...service,
                                    name: service.name || '',
                                    description: service.description || '',
                                    price: service.price || '',
                                    duration: service.duration || '',
                                    deliverables: service.deliverables || ['']
                                  });
                                  setShowAddService(false); // Close add form if open
                                }
                              }}
                              title="Edit service"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                              onClick={() => {
                                const linkedFormsWarning = service.linkedForms && service.linkedForms.length > 0
                                  ? `\n\nNote: This service is currently used in ${service.linkedForms.length} form(s).`
                                  : '';
                                if (confirm(`Archive "${service.name}"? It will be hidden from forms but you can restore it later.${linkedFormsWarning}`)) {
                                  setServices(prev => prev.map(s => 
                                    s.id === service.id ? { ...s, isActive: !s.isActive } : s
                                  ));
                                  toast.success(service.isActive ? 'Service archived' : 'Service restored');
                                }
                              }}
                              title={service.isActive ? "Archive service" : "Restore service"}
                            >
                              {service.isActive ? <Archive className="w-4 h-4" /> : <RotateCcw className="w-4 h-4" />}
                            </button>
                            <button
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              onClick={() => {
                                const linkedFormsWarning = service.linkedForms && service.linkedForms.length > 0
                                  ? `\n\nWarning: This service is currently used in ${service.linkedForms.length} form(s). Consider archiving instead.`
                                  : '';
                                if (confirm(`Delete "${service.name}" permanently? This cannot be undone.${linkedFormsWarning}`)) {
                                  setServices(prev => prev.filter(s => s.id !== service.id));
                                  toast.success('Service deleted');
                                }
                              }}
                              title="Delete service permanently"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Edit Form - Appears directly below the service card being edited */}
                      {editingService?.id === service.id && !showAddService && (
                        <div className="bg-[#a8998f]/5 backdrop-blur-sm rounded-3xl p-6 border-2 border-[#a8998f]/30 shadow-lg -mt-2">
                          <h3 className="font-['Lora'] text-xl text-slate-800 mb-6">
                            Edit Service
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">Service Name</label>
                              <input
                                type="text"
                                placeholder="e.g., Patient Experience Innovation Audit"
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#a8998f]/30"
                                value={editingService.name}
                                onChange={(e) => setEditingService(prev => prev ? { ...prev, name: e.target.value } : null)}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                              <textarea
                                placeholder="Brief description of this service"
                                rows={3}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#a8998f]/30"
                                value={editingService.description}
                                onChange={(e) => setEditingService(prev => prev ? { ...prev, description: e.target.value } : null)}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Price</label>
                                <input
                                  type="text"
                                  placeholder="e.g., $15,000"
                                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#a8998f]/30"
                                  value={editingService.price}
                                  onChange={(e) => setEditingService(prev => prev ? { ...prev, price: e.target.value } : null)}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Duration</label>
                                <input
                                  type="text"
                                  placeholder="e.g., 6-8 weeks"
                                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#a8998f]/30"
                                  value={editingService.duration}
                                  onChange={(e) => setEditingService(prev => prev ? { ...prev, duration: e.target.value } : null)}
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">Deliverables</label>
                              <div className="space-y-2">
                                {editingService.deliverables.map((deliverable, index) => (
                                  <div key={index} className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      placeholder="e.g., Comprehensive audit report"
                                      value={deliverable}
                                      className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#a8998f]/30"
                                      onChange={(e) => {
                                        const newDeliverables = [...editingService.deliverables];
                                        newDeliverables[index] = e.target.value;
                                        setEditingService(prev => prev ? { ...prev, deliverables: newDeliverables } : null);
                                      }}
                                    />
                                    {editingService.deliverables.length > 1 && (
                                      <button
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        onClick={() => {
                                          const newDeliverables = editingService.deliverables.filter((_, i) => i !== index);
                                          setEditingService(prev => prev ? { ...prev, deliverables: newDeliverables } : null);
                                        }}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                ))}
                                <button
                                  className="px-4 py-2 text-[#a8998f] hover:bg-[#a8998f]/10 rounded-lg font-medium transition-colors flex items-center gap-2"
                                  onClick={() => {
                                    setEditingService(prev => prev ? {
                                      ...prev,
                                      deliverables: [...prev.deliverables, '']
                                    } : null);
                                  }}
                                >
                                  <Plus className="w-4 h-4" />
                                  Add Deliverable
                                </button>
                              </div>
                            </div>

                            {/* SOW Template Fields - Expandable Section */}
                            <div className="pt-6 border-t border-slate-200">
                              <h4 className="font-['Lora'] text-lg text-slate-800 mb-3">
                                SOW Template Content
                              </h4>
                              <p className="text-sm text-slate-600 mb-4">
                                Pre-fill SOW sections with service-specific content. These will auto-populate when creating an SOW for this service.
                              </p>
                              
                              <div className="space-y-4">
                                {/* Project Description */}
                                <div>
                                  <label className="block text-sm font-medium text-slate-700 mb-2">Project Description Template</label>
                                  <textarea
                                    placeholder="Default project description for this service"
                                    rows={3}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#a8998f]/30 text-sm"
                                    value={editingService.sowTemplates?.projectDescription || ''}
                                    onChange={(e) => setEditingService(prev => prev ? {
                                      ...prev,
                                      sowTemplates: {
                                        ...prev.sowTemplates,
                                        projectDescription: e.target.value
                                      }
                                    } : null)}
                                  />
                                </div>

                                {/* Scope of Services */}
                                <div>
                                  <label className="block text-sm font-medium text-slate-700 mb-2">Scope of Services Template</label>
                                  <textarea
                                    placeholder="Default scope of services content"
                                    rows={3}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#a8998f]/30 text-sm"
                                    value={editingService.sowTemplates?.scopeOfServices || ''}
                                    onChange={(e) => setEditingService(prev => prev ? {
                                      ...prev,
                                      sowTemplates: {
                                        ...prev.sowTemplates,
                                        scopeOfServices: e.target.value
                                      }
                                    } : null)}
                                  />
                                </div>

                                {/* Timeline */}
                                <div>
                                  <label className="block text-sm font-medium text-slate-700 mb-2">Timeline Template</label>
                                  <textarea
                                    placeholder="Default timeline content"
                                    rows={3}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#a8998f]/30 text-sm"
                                    value={editingService.sowTemplates?.timeline || ''}
                                    onChange={(e) => setEditingService(prev => prev ? {
                                      ...prev,
                                      sowTemplates: {
                                        ...prev.sowTemplates,
                                        timeline: e.target.value
                                      }
                                    } : null)}
                                  />
                                </div>

                                {/* Roles & Responsibilities */}
                                <div>
                                  <label className="block text-sm font-medium text-slate-700 mb-2">Roles & Responsibilities Template</label>
                                  <textarea
                                    placeholder="Default roles and responsibilities"
                                    rows={3}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#a8998f]/30 text-sm"
                                    value={editingService.sowTemplates?.rolesResponsibilities || ''}
                                    onChange={(e) => setEditingService(prev => prev ? {
                                      ...prev,
                                      sowTemplates: {
                                        ...prev.sowTemplates,
                                        rolesResponsibilities: e.target.value
                                      }
                                    } : null)}
                                  />
                                </div>

                                {/* Communication */}
                                <div>
                                  <label className="block text-sm font-medium text-slate-700 mb-2">Communication Plan Template</label>
                                  <textarea
                                    placeholder="Default communication plan"
                                    rows={3}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#a8998f]/30 text-sm"
                                    value={editingService.sowTemplates?.communication || ''}
                                    onChange={(e) => setEditingService(prev => prev ? {
                                      ...prev,
                                      sowTemplates: {
                                        ...prev.sowTemplates,
                                        communication: e.target.value
                                      }
                                    } : null)}
                                  />
                                </div>

                                {/* Fees & Payment Terms */}
                                <div>
                                  <label className="block text-sm font-medium text-slate-700 mb-2">Fees & Payment Terms Template</label>
                                  <textarea
                                    placeholder="Default fees and payment terms"
                                    rows={3}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#a8998f]/30 text-sm"
                                    value={editingService.sowTemplates?.feesPaymentTerms || ''}
                                    onChange={(e) => setEditingService(prev => prev ? {
                                      ...prev,
                                      sowTemplates: {
                                        ...prev.sowTemplates,
                                        feesPaymentTerms: e.target.value
                                      }
                                    } : null)}
                                  />
                                </div>

                                {/* Assumptions */}
                                <div>
                                  <label className="block text-sm font-medium text-slate-700 mb-2">Assumptions Template</label>
                                  <textarea
                                    placeholder="Default assumptions"
                                    rows={2}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#a8998f]/30 text-sm"
                                    value={editingService.sowTemplates?.assumptions || ''}
                                    onChange={(e) => setEditingService(prev => prev ? {
                                      ...prev,
                                      sowTemplates: {
                                        ...prev.sowTemplates,
                                        assumptions: e.target.value
                                      }
                                    } : null)}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                              <button
                                className="px-6 py-3 bg-gradient-to-br from-[#a8998f] to-[#b8a7a0] text-white rounded-2xl font-medium hover:shadow-lg transition-all"
                                onClick={() => {
                                  if (!editingService.name.trim()) {
                                    toast.error('Please enter a service name');
                                    return;
                                  }
                                  setServices(prev => prev.map(s => 
                                    s.id === editingService.id ? editingService : s
                                  ));
                                  setEditingService(null);
                                  toast.success('Service updated successfully');
                                }}
                              >
                                Save Changes
                              </button>
                              <button
                                className="px-6 py-3 bg-slate-200 text-slate-700 rounded-2xl font-medium hover:bg-slate-300 transition-colors"
                                onClick={() => setEditingService(null)}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}

                {/* Add Service Form - Only shown when "Add New Service" is clicked */}
                {showAddService && editingService && (
                  <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-slate-200/50 shadow-lg">
                    <h3 className="font-['Lora'] text-xl text-slate-800 mb-6">
                      Add New Service
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Service Name</label>
                        <input
                          type="text"
                          placeholder="e.g., Patient Experience Innovation Audit"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#a8998f]/30"
                          value={editingService.name}
                          onChange={(e) => setEditingService(prev => prev ? { ...prev, name: e.target.value } : null)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                        <textarea
                          placeholder="Brief description of this service"
                          rows={3}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#a8998f]/30"
                          value={editingService.description}
                          onChange={(e) => setEditingService(prev => prev ? { ...prev, description: e.target.value } : null)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Price</label>
                          <input
                            type="text"
                            placeholder="e.g., $15,000"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#a8998f]/30"
                            value={editingService.price}
                            onChange={(e) => setEditingService(prev => prev ? { ...prev, price: e.target.value } : null)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Duration</label>
                          <input
                            type="text"
                            placeholder="e.g., 6-8 weeks"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#a8998f]/30"
                            value={editingService.duration}
                            onChange={(e) => setEditingService(prev => prev ? { ...prev, duration: e.target.value } : null)}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Deliverables</label>
                        <div className="space-y-2">
                          {editingService.deliverables.map((deliverable, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <input
                                type="text"
                                placeholder="e.g., Comprehensive audit report"
                                value={deliverable}
                                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#a8998f]/30"
                                onChange={(e) => {
                                  const newDeliverables = [...editingService.deliverables];
                                  newDeliverables[index] = e.target.value;
                                  setEditingService(prev => prev ? { ...prev, deliverables: newDeliverables } : null);
                                }}
                              />
                              {editingService.deliverables.length > 1 && (
                                <button
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  onClick={() => {
                                    const newDeliverables = editingService.deliverables.filter((_, i) => i !== index);
                                    setEditingService(prev => prev ? { ...prev, deliverables: newDeliverables } : null);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            className="px-4 py-2 text-[#a8998f] hover:bg-[#a8998f]/10 rounded-lg font-medium transition-colors flex items-center gap-2"
                            onClick={() => {
                              setEditingService(prev => prev ? {
                                ...prev,
                                deliverables: [...prev.deliverables, '']
                              } : null);
                            }}
                          >
                            <Plus className="w-4 h-4" />
                            Add Deliverable
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                        <button
                          className="px-6 py-3 bg-gradient-to-br from-[#a8998f] to-[#b8a7a0] text-white rounded-2xl font-medium hover:shadow-lg transition-all"
                          onClick={() => {
                            if (!editingService.name.trim()) {
                              toast.error('Please enter a service name');
                              return;
                            }
                            if (showAddService) {
                              setServices(prev => [...prev, editingService]);
                              toast.success('Service added successfully');
                            } else {
                              setServices(prev => prev.map(s => s.id === editingService.id ? editingService : s));
                              toast.success('Service updated successfully');
                            }
                            setEditingService(null);
                            setShowAddService(false);
                          }}
                        >
                          {showAddService ? 'Add Service' : 'Save Changes'}
                        </button>
                        <button
                          className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-medium transition-colors"
                          onClick={() => {
                            setEditingService(null);
                            setShowAddService(false);
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === 'forms' && (
            <div className="w-full h-[calc(100vh-10rem)] -m-8">
              <OriginalFormsApp />
            </div>
          )}

          {activeSection === 'content-ideas' && (
            <div className="max-w-4xl">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Content Ideas Inbox</h2>
                <p className="text-gray-600">Add your favorite blogs and Substacks to automatically pull content ideas</p>
              </div>
              <RssFeedSettings />
            </div>
          )}

          {activeSection === 'data-backup' && (
            <DataBackupSection />
          )}

          {activeSection === 'archive' && (
            <ArchiveSection />
          )}
        </div>
      </div>
    </div>
  );
}

// Archive Section Component  
function ArchiveSection() {
  const [archivedItems, setArchivedItems] = useState<any[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('archived_forms') || '[]');
    } catch {
      return [];
    }
  });

  const handleRestore = (itemId: string) => {
    const confirmed = window.confirm('Restore this item? It will be removed from the archive and appear back in Forms & Flows.');
    if (confirmed) {
      // Remove from archive
      const newArchivedItems = archivedItems.filter(item => item.id !== itemId);
      localStorage.setItem('archived_forms', JSON.stringify(newArchivedItems));
      setArchivedItems(newArchivedItems);
      
      // Dispatch event to notify other components
      window.dispatchEvent(new Event('archive-updated'));
      
      alert('Item restored successfully! It will now appear in Forms & Flows.');
    }
  };

  const handleDelete = (itemId: string) => {
    const confirmed = window.confirm('Permanently delete this item? This action cannot be undone.');
    if (confirmed) {
      // Remove from archive
      const newArchivedItems = archivedItems.filter(item => item.id !== itemId);
      localStorage.setItem('archived_forms', JSON.stringify(newArchivedItems));
      setArchivedItems(newArchivedItems);
      
      // Dispatch event to notify other components
      window.dispatchEvent(new Event('archive-updated'));
      
      alert('Item permanently deleted.');
    }
  };

  const handleEmptyArchive = () => {
    const confirmed = window.confirm(`Permanently delete all ${archivedItems.length} archived items? This action cannot be undone.`);
    if (confirmed) {
      const doubleConfirm = window.confirm('Are you absolutely sure? This will permanently delete everything in the archive.');
      if (doubleConfirm) {
        localStorage.setItem('archived_forms', JSON.stringify([]));
        setArchivedItems([]);
        
        // Dispatch event to notify other components
        window.dispatchEvent(new Event('archive-updated'));
        
        alert('Archive emptied successfully.');
      }
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="font-serif text-3xl text-slate-800 mb-2">Archive</h2>
          <p className="text-slate-600">Archived form templates and other items. You can restore or permanently delete them.</p>
        </div>
        {archivedItems.length > 0 && (
          <button
            onClick={handleEmptyArchive}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-medium transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Empty Archive ({archivedItems.length})
          </button>
        )}
      </div>
      
      {archivedItems.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-12 border border-slate-200/50 text-center">
          <Archive className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">No archived items</p>
        </div>
      ) : (
        <div className="space-y-3">
          {archivedItems.map(item => (
            <div
              key={item.id}
              className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-slate-200/50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-slate-800 mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-600">
                    {item.type} • Archived {new Date(item.archivedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-4 py-2 bg-gradient-to-br from-[#a8998f] to-[#b8a7a0] text-white rounded-2xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
                    onClick={() => handleRestore(item.id)}
                  >
                    <RotateCcw className="w-4 h-4" />
                    Restore
                  </button>
                  <button
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-medium transition-colors flex items-center gap-2"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}