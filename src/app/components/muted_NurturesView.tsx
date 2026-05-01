import { useState, useMemo } from 'react';
import { Sprout, Search, LayoutGrid, Table as TableIcon, Filter, Star, ArrowLeft, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Contact } from './ContactsPage';
import { NurtureCard } from './muted_NurtureCard';
import { NurturesTableView } from './muted_NurturesTableView';
import { PageHeader_Muted } from './PageHeader_Muted';

export interface NurtureToDo {
  id: string;
  contactId: string;
  contactName: string;
  contactEmail?: string;
  priority: boolean;
  dueDate: string; // ISO date string
  status: 'toDo' | 'emailSent' | 'replyReceived' | 'nonResponsive';
  lastNurtureDate?: string;
  nurtureFrequency: number; // in weeks
  createdAt: string;
  emailDraft?: string;
}

interface NurturesViewProps {
  contacts: Contact[];
  nurtureToDos: NurtureToDo[];
  onContactClick: (contact: Contact) => void;
  onUpdateNurtureToDo: (nurtureToDo: NurtureToDo) => void;
  onGenerateEmail: (nurtureToDo: NurtureToDo) => void;
  onBackToContacts?: () => void;
  onQuickAddSelect?: (type: 'task' | 'contact' | 'content' | 'voice') => void;
  onJamieAction?: (type: 'plan-day' | 'post-meeting' | 'wind-down' | 'chat') => void;
  onBack?: () => void;
}

export function NurturesView({
  contacts = [],
  nurtureToDos = [],
  onContactClick,
  onUpdateNurtureToDo,
  onGenerateEmail,
  onBackToContacts,
  onQuickAddSelect,
  onJamieAction,
  onBack
}: NurturesViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [filterBy, setFilterBy] = useState<'all' | 'date' | 'frequency'>('all');
  const [selectedDate, setSelectedDate] = useState<string>(''); // Specific Monday
  const [selectedFrequency, setSelectedFrequency] = useState<number | 'all'>('all');
  const [sortBy, setSortBy] = useState<'az' | 'priority'>('priority');
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  // Get all nurture-enabled contacts
  const nurtureContacts = useMemo(() => {
    return (contacts || []).filter(c => c.nurtureFrequency && c.nurtureFrequency > 0 && !c.archived);
  }, [contacts]);

  // Get upcoming Mondays for filtering
  const upcomingMondays = useMemo(() => {
    const mondays: Date[] = [];
    const today = new Date();
    
    // Find next Monday
    let nextMonday = new Date(today);
    const daysUntilMonday = (8 - nextMonday.getDay()) % 7 || 7;
    nextMonday.setDate(today.getDate() + daysUntilMonday);
    nextMonday.setHours(0, 0, 0, 0);
    
    // Get next 12 Mondays
    for (let i = 0; i < 12; i++) {
      const monday = new Date(nextMonday);
      monday.setDate(nextMonday.getDate() + (i * 7));
      mondays.push(monday);
    }
    
    return mondays;
  }, []);

  // Filter and sort nurture to-dos
  const filteredNurtureToDos = useMemo(() => {
    let filtered = [...nurtureToDos];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(n => 
        n.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.contactEmail?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Date filter
    if (filterBy === 'date' && selectedDate) {
      filtered = filtered.filter(n => {
        const dueDate = new Date(n.dueDate);
        const filterDate = new Date(selectedDate);
        return dueDate.toDateString() === filterDate.toDateString();
      });
    }

    // Frequency filter
    if (filterBy === 'frequency' && selectedFrequency !== 'all') {
      filtered = filtered.filter(n => n.nurtureFrequency === selectedFrequency);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'priority') {
        // Priority first, then by name
        if (a.priority && !b.priority) return -1;
        if (!a.priority && b.priority) return 1;
        return a.contactName.localeCompare(b.contactName);
      } else {
        // A-Z
        return a.contactName.localeCompare(b.contactName);
      }
    });

    return filtered;
  }, [nurtureToDos, searchQuery, filterBy, selectedDate, selectedFrequency, sortBy]);

  // Group by frequency for Kanban view
  const groupedByFrequency = useMemo(() => {
    const groups: Record<number, NurtureToDo[]> = {
      2: [],
      4: [],
      6: [],
      8: [],
      10: [],
      12: []
    };

    filteredNurtureToDos.forEach(nurture => {
      if (groups[nurture.nurtureFrequency]) {
        groups[nurture.nurtureFrequency].push(nurture);
      }
    });

    return groups;
  }, [filteredNurtureToDos]);

  // Group by date for Kanban view
  const groupedByDate = useMemo(() => {
    const groups: Record<string, NurtureToDo[]> = {};

    filteredNurtureToDos.forEach(nurture => {
      const dateKey = nurture.dueDate;
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(nurture);
    });

    // Sort by date
    const sortedGroups: Record<string, NurtureToDo[]> = {};
    Object.keys(groups)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      .forEach(key => {
        sortedGroups[key] = groups[key];
      });

    return sortedGroups;
  }, [filteredNurtureToDos]);

  const handleNurtureClick = (nurtureToDo: NurtureToDo) => {
    // Find the contact and open their profile on the Nurtures tab
    const contact = contacts.find(c => c.id === nurtureToDo.contactId);
    if (contact && onContactClick) {
      onContactClick(contact);
    }
  };

  return (
    <div className="flex h-full overflow-hidden flex-col">
      {/* Header */}
      <PageHeader_Muted
        title="Nurtures"
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
            {/* Back to Contacts Button */}
            <button
              onClick={onBackToContacts}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 rounded-2xl transition-colors font-medium text-slate-700 shadow-soft border border-slate-200/50"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Contacts
            </button>

            {/* Search */}
            <div className="relative w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 pl-12 pr-4 rounded-2xl border-slate-200/60 bg-white/60 backdrop-blur-sm focus:bg-white focus:border-slate-300 transition-all shadow-soft"
              />
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1.5 bg-slate-100/60 backdrop-blur-sm p-1.5 rounded-2xl shadow-soft">
            <button
              onClick={() => setViewMode('kanban')}
              className={`h-8 px-4 rounded-xl font-medium transition-all ${
                viewMode === 'kanban'
                  ? 'bg-white text-slate-900 shadow-soft'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <LayoutGrid className="w-4 h-4 inline mr-1.5" />
              Kanban
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`h-8 px-4 rounded-xl font-medium transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-soft'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <TableIcon className="w-4 h-4 inline mr-1.5" />
              Table
            </button>
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
            {(filterBy !== "all" || selectedDate || (selectedFrequency !== 'all' && selectedFrequency !== undefined) || sortBy !== "priority") && (
              <span className="ml-1 px-2 py-0.5 bg-slate-300/50 text-slate-700 rounded-full text-xs">
                Active
              </span>
            )}
          </button>

          {isFiltersExpanded && (
            <div className="mt-3 p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-slate-200/50">
              <div className="flex items-center gap-6">
                {/* Filter By Dropdown */}
                <div className="flex-1">
                  <label className="text-xs font-medium text-slate-600 mb-2 block">Filter By</label>
                  <select
                    value={filterBy}
                    onChange={(e) => {
                      setFilterBy(e.target.value as any);
                      // Reset dependent filters
                      if (e.target.value === 'all') {
                        setSelectedDate('');
                        setSelectedFrequency('all');
                      }
                    }}
                    className="h-9 px-4 pr-9 bg-white/70 border border-slate-200/50 rounded-xl font-medium text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300/50 cursor-pointer transition-all hover:bg-white w-full appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23475569%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:16px] bg-[right_0.75rem_center] bg-no-repeat"
                  >
                    <option value="all">All Nurtures</option>
                    <option value="date">By Date</option>
                    <option value="frequency">By Frequency</option>
                  </select>
                </div>

                {/* Conditional Date Picker */}
                {filterBy === 'date' && (
                  <div className="flex-1">
                    <label className="text-xs font-medium text-slate-600 mb-2 block">Select Monday</label>
                    <select
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="h-9 px-4 pr-9 bg-white/70 border border-slate-200/50 rounded-xl font-medium text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300/50 cursor-pointer transition-all hover:bg-white w-full appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23475569%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:16px] bg-[right_0.75rem_center] bg-no-repeat"
                    >
                      <option value="">All Dates</option>
                      {upcomingMondays.map(monday => (
                        <option key={monday.toISOString()} value={monday.toISOString()}>
                          {monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Conditional Frequency Picker */}
                {filterBy === 'frequency' && (
                  <div className="flex-1">
                    <label className="text-xs font-medium text-slate-600 mb-2 block">Frequency</label>
                    <select
                      value={selectedFrequency}
                      onChange={(e) => setSelectedFrequency(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                      className="h-9 px-4 pr-9 bg-white/70 border border-slate-200/50 rounded-xl font-medium text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300/50 cursor-pointer transition-all hover:bg-white w-full appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23475569%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:16px] bg-[right_0.75rem_center] bg-no-repeat"
                    >
                      <option value="all">All Frequencies</option>
                      <option value={2}>2 Weeks</option>
                      <option value={4}>4 Weeks</option>
                      <option value={6}>6 Weeks</option>
                      <option value={8}>8 Weeks</option>
                      <option value={10}>10 Weeks</option>
                      <option value={12}>12 Weeks</option>
                    </select>
                  </div>
                )}

                {/* Sort Dropdown */}
                <div className="flex-1">
                  <label className="text-xs font-medium text-slate-600 mb-2 block">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="h-9 px-4 pr-9 bg-white/70 border border-slate-200/50 rounded-xl font-medium text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300/50 cursor-pointer transition-all hover:bg-white w-full appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23475569%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:16px] bg-[right_0.75rem_center] bg-no-repeat"
                  >
                    <option value="priority">Priority First</option>
                    <option value="az">A-Z</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8 bg-[rgb(247,247,249)]">
        {filteredNurtureToDos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-12 border border-slate-200/50 shadow-soft">
              <Sprout className="w-16 h-16 mb-4 opacity-20 text-[#8fa890] mx-auto" />
              <p className="text-lg font-medium mb-2 text-slate-700">No nurtures found</p>
              <p className="text-slate-500">
                {searchQuery ? 'Try adjusting your search' : 'Set nurture frequencies for contacts to get started'}
              </p>
            </div>
          </div>
        ) : viewMode === 'kanban' ? (
          <div className="space-y-8">
            {/* Group by frequency OR date based on filter */}
            {filterBy === 'frequency' || filterBy === 'all' ? (
              // Frequency-based Kanban
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(groupedByFrequency).map(([freq, nurtures]) => {
                  if (nurtures.length === 0) return null;
                  return (
                    <div key={freq} className="bg-white/70 backdrop-blur-sm rounded-3xl border border-slate-200/50 p-6">
                      <h3 className="font-serif text-xl text-slate-800 mb-4 flex items-center gap-2">
                        <Sprout className="w-5 h-5 text-[#8fa890]" />
                        {freq} Weeks
                        <span className="ml-auto text-sm font-sans text-slate-500">
                          {nurtures.length}
                        </span>
                      </h3>
                      <div className="space-y-3">
                        {nurtures.map(nurture => (
                          <NurtureCard
                            key={nurture.id}
                            nurtureToDo={nurture}
                            onClick={() => handleNurtureClick(nurture)}
                            onGenerateEmail={() => onGenerateEmail(nurture)}
                            onUpdateStatus={(status) => onUpdateNurtureToDo({ ...nurture, status })}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Date-based Kanban
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Object.entries(groupedByDate).map(([date, nurtures]) => {
                  const displayDate = new Date(date);
                  const today = new Date();
                  const isToday = displayDate.toDateString() === today.toDateString();
                  const tomorrow = new Date(today);
                  tomorrow.setDate(today.getDate() + 1);
                  const isTomorrow = displayDate.toDateString() === tomorrow.toDateString();
                  
                  let label = displayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  if (isToday) label = 'Today';
                  if (isTomorrow) label = 'Tomorrow';

                  return (
                    <div key={date} className="bg-white/70 backdrop-blur-sm rounded-3xl border border-slate-200/50 p-6">
                      <h3 className="font-serif text-xl text-slate-800 mb-4 flex items-center gap-2">
                        <Sprout className="w-5 h-5 text-[#8fa890]" />
                        {label}
                        <span className="ml-auto text-sm font-sans text-slate-500">
                          {nurtures.length}
                        </span>
                      </h3>
                      <div className="space-y-3">
                        {nurtures.map(nurture => (
                          <NurtureCard
                            key={nurture.id}
                            nurtureToDo={nurture}
                            onClick={() => handleNurtureClick(nurture)}
                            onGenerateEmail={() => onGenerateEmail(nurture)}
                            onUpdateStatus={(status) => onUpdateNurtureToDo({ ...nurture, status })}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <NurturesTableView
            nurtureToDos={filteredNurtureToDos}
            onNurtureClick={handleNurtureClick}
            onGenerateEmail={onGenerateEmail}
            onUpdateStatus={(nurture, status) => onUpdateNurtureToDo({ ...nurture, status })}
          />
        )}
      </div>
    </div>
  );
}