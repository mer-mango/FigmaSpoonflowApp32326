import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Star, Calendar, CheckSquare, Mail, Phone, Settings2, Eye, EyeOff } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Contact } from './ContactsPage';

interface ContactsTableViewProps {
  contacts: Contact[];
  recentlyViewedContactIds?: string[];
  onContactClick: (contact: Contact) => void;
  onArchive?: (contactId: string) => void;
  onTogglePriority?: (contactId: string) => void;
  onToggleSelection?: (contactId: string) => void;
  selectedContactIds?: string[];
  onToggleSelectAll?: () => void;
  searchQuery?: string;
}

type SortField = 'name' | 'company' | 'nextCallDate' | 'activeTasks';
type SortDirection = 'asc' | 'desc';

type ColumnId = 'name' | 'company' | 'contactInfo' | 'tasks' | 'nextCall';

interface ColumnConfig {
  id: ColumnId;
  label: string;
  sortField?: SortField;
  width: number;
  visible: boolean;
}

export function ContactsTableView({ 
  contacts, 
  recentlyViewedContactIds = [],
  onContactClick, 
  onArchive,
  onTogglePriority,
  onToggleSelection,
  selectedContactIds = [],
  onToggleSelectAll,
  searchQuery = ''
}: ContactsTableViewProps) {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  
  // Column configuration with default widths (in pixels)
  const [columns, setColumns] = useState<ColumnConfig[]>([
    { id: 'name', label: 'Contact', sortField: 'name', width: 280, visible: true },
    { id: 'company', label: 'Company', sortField: 'company', width: 200, visible: true },
    { id: 'contactInfo', label: 'Contact Info', width: 240, visible: true },
    { id: 'tasks', label: 'Tasks', sortField: 'activeTasks', width: 100, visible: true },
    { id: 'nextCall', label: 'Next Call', sortField: 'nextCallDate', width: 150, visible: true },
  ]);

  const [resizingColumn, setResizingColumn] = useState<ColumnId | null>(null);
  const [resizeStartX, setResizeStartX] = useState(0);
  const [resizeStartWidth, setResizeStartWidth] = useState(0);
  const [draggedColumn, setDraggedColumn] = useState<ColumnId | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<ColumnId | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleResizeStart = (e: React.MouseEvent, columnId: ColumnId) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingColumn(columnId);
    setResizeStartX(e.clientX);
    const column = columns.find(c => c.id === columnId);
    if (column) {
      setResizeStartWidth(column.width);
    }
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (resizingColumn) {
      const diff = e.clientX - resizeStartX;
      const newWidth = Math.max(80, resizeStartWidth + diff); // Min width 80px
      setColumns(cols => cols.map(c => 
        c.id === resizingColumn ? { ...c, width: newWidth } : c
      ));
    }
  };

  const handleResizeEnd = () => {
    setResizingColumn(null);
  };

  React.useEffect(() => {
    if (resizingColumn) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);
      return () => {
        window.removeEventListener('mousemove', handleResizeMove);
        window.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [resizingColumn, resizeStartX, resizeStartWidth]);

  const handleDragStart = (e: React.DragEvent, columnId: ColumnId) => {
    setDraggedColumn(columnId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, columnId: ColumnId) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: ColumnId) => {
    e.preventDefault();
    if (draggedColumn && draggedColumn !== targetColumnId) {
      const draggedIndex = columns.findIndex(c => c.id === draggedColumn);
      const targetIndex = columns.findIndex(c => c.id === targetColumnId);
      
      const newColumns = [...columns];
      const [removed] = newColumns.splice(draggedIndex, 1);
      newColumns.splice(targetIndex, 0, removed);
      
      setColumns(newColumns);
    }
    setDraggedColumn(null);
    setDragOverColumn(null);
  };

  const toggleColumnVisibility = (columnId: ColumnId) => {
    setColumns(cols => cols.map(c => 
      c.id === columnId ? { ...c, visible: !c.visible } : c
    ));
  };

  const abbreviateText = (text: string, maxLength: number) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  };

  const sortedContacts = [...contacts].sort((a, b) => {
    let aVal: any = a[sortField];
    let bVal: any = b[sortField];

    // Handle undefined values
    if (aVal === undefined) aVal = '';
    if (bVal === undefined) bVal = '';

    // Handle dates
    if (sortField === 'nextCallDate') {
      aVal = aVal ? new Date(aVal).getTime() : 0;
      bVal = bVal ? new Date(bVal).getTime() : 0;
    }

    // Handle numbers
    if (sortField === 'activeTasks') {
      aVal = aVal || 0;
      bVal = bVal || 0;
    }

    // Handle strings
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Separate recent contacts from the rest
  const recentContacts = recentlyViewedContactIds
    .map(id => sortedContacts.find(c => c.id === id))
    .filter(Boolean) as Contact[];
  
  const otherContacts = sortedContacts.filter(
    c => !recentlyViewedContactIds.includes(c.id)
  );

  const SortHeader = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 font-medium text-slate-700 hover:text-slate-900 transition-colors"
    >
      {label}
      {sortField === field && (
        sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
      )}
    </button>
  );

  const visibleColumns = columns.filter(c => c.visible);

  if (sortedContacts.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
          <CheckSquare className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          {searchQuery ? 'No contacts found' : 'No contacts yet'}
        </h3>
        <p className="text-sm text-slate-500">
          {searchQuery ? 'Try adjusting your search' : 'Add your first contact to get started'}
        </p>
      </div>
    );
  }

  const renderCellContent = (contact: Contact, columnId: ColumnId) => {
    switch (columnId) {
      case 'name':
        return (
          <div className="flex items-center gap-3">
            {contact.priority && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
            <Avatar className="h-10 w-10">
              {contact.imageUrl ? (
                <AvatarImage src={contact.imageUrl} alt={contact.name} />
              ) : null}
              <AvatarFallback style={{ backgroundColor: contact.color || '#034863' }} className="text-white font-medium">
                {contact.initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-slate-900">{contact.name}</div>
              {contact.role && <div className="text-sm text-slate-500">{contact.role}</div>}
            </div>
          </div>
        );

      case 'company':
        return (
          <div className="text-sm text-slate-900" title={contact.company}>
            {abbreviateText(contact.company || '—', 30)}
          </div>
        );

      case 'contactInfo':
        return (
          <div className="flex flex-col gap-1">
            {contact.email && (
              <div className="flex items-center gap-1.5 text-sm text-slate-600">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate max-w-[200px]">{contact.email}</span>
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center gap-1.5 text-sm text-slate-600">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{contact.phone}</span>
              </div>
            )}
            {!contact.email && !contact.phone && <span className="text-sm text-slate-400">—</span>}
          </div>
        );

      case 'tasks':
        return contact.activeTasks && contact.activeTasks > 0 ? (
          <div className="flex items-center gap-1.5">
            <CheckSquare className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">{contact.activeTasks}</span>
          </div>
        ) : (
          <span className="text-sm text-slate-400">—</span>
        );

      case 'nextCall':
        return contact.nextCallDate ? (
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-sm text-slate-700">
              {new Date(contact.nextCallDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>
        ) : (
          <span className="text-sm text-slate-400">—</span>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative">
      {/* Column Settings Button */}
      <div className="absolute top-0 right-4 z-10">
        <button
          onClick={() => setShowColumnSettings(!showColumnSettings)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Settings2 className="w-4 h-4" />
          <span>Columns</span>
        </button>
        
        {showColumnSettings && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 p-2">
            <div className="text-xs font-medium text-slate-500 uppercase px-3 py-2">
              Show/Hide Columns
            </div>
            {columns.map(column => (
              <button
                key={column.id}
                onClick={() => toggleColumnVisibility(column.id)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded transition-colors"
              >
                {column.visible ? (
                  <Eye className="w-4 h-4 text-slate-400" />
                ) : (
                  <EyeOff className="w-4 h-4 text-slate-300" />
                )}
                <span className={column.visible ? '' : 'text-slate-400'}>{column.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto pt-12">
        <table className="w-full border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {visibleColumns.map((column, index) => (
                <th
                  key={column.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, column.id)}
                  onDragOver={(e) => handleDragOver(e, column.id)}
                  onDrop={(e) => handleDrop(e, column.id)}
                  style={{ 
                    width: `${column.width}px`,
                    minWidth: `${column.width}px`,
                    maxWidth: `${column.width}px`,
                  }}
                  className={`
                    relative px-6 py-3 text-left text-sm select-none
                    ${dragOverColumn === column.id ? 'bg-blue-50' : ''}
                    ${draggedColumn === column.id ? 'opacity-50' : ''}
                  `}
                >
                  <div className="flex items-center justify-between">
                    {column.sortField ? (
                      <SortHeader field={column.sortField} label={column.label} />
                    ) : (
                      <span className="font-medium text-slate-700">{column.label}</span>
                    )}
                  </div>
                  
                  {/* Resize Handle */}
                  {index < visibleColumns.length - 1 && (
                    <div
                      onMouseDown={(e) => handleResizeStart(e, column.id)}
                      className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-400 transition-colors group"
                    >
                      <div className="absolute top-0 right-0 w-1 h-full group-hover:bg-blue-400" />
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {/* Recent Contacts - displayed at top with gray background */}
            {recentContacts.length > 0 && recentContacts.map((contact) => (
              <tr
                key={contact.id}
                onClick={() => onContactClick(contact)}
                className="bg-slate-100/40 hover:bg-slate-100/60 cursor-pointer transition-colors"
              >
                {visibleColumns.map((column) => (
                  <td
                    key={column.id}
                    className="px-6 py-4"
                    style={{ 
                      width: `${column.width}px`,
                      minWidth: `${column.width}px`,
                      maxWidth: `${column.width}px`,
                    }}
                  >
                    {renderCellContent(contact, column.id)}
                  </td>
                ))}
              </tr>
            ))}
            
            {/* All Other Contacts */}
            {otherContacts.map((contact) => (
              <tr
                key={contact.id}
                onClick={() => onContactClick(contact)}
                className="hover:bg-slate-50 cursor-pointer transition-colors"
              >
                {visibleColumns.map((column) => (
                  <td
                    key={column.id}
                    className="px-6 py-4"
                    style={{ 
                      width: `${column.width}px`,
                      minWidth: `${column.width}px`,
                      maxWidth: `${column.width}px`,
                    }}
                  >
                    {renderCellContent(contact, column.id)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}