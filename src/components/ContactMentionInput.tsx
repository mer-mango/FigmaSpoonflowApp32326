import React, { useState, useRef, useEffect } from 'react';
import { User } from 'lucide-react';
import { sortContactsByLastName } from '../utils/contactSorting';

interface Contact {
  id: string;
  name: string;
  company?: string;
  imageUrl?: string;
  initials?: string;
  color?: string;
}

interface ContactMentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onContactSelect: (contact: Contact) => void;
  contacts: Contact[];
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export function ContactMentionInput({
  value,
  onChange,
  onContactSelect,
  contacts,
  onBlur,
  onKeyDown,
  placeholder,
  className,
  autoFocus
}: ContactMentionInputProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionQuery, setMentionQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Detect @ mentions
  useEffect(() => {
    const atIndex = value.lastIndexOf('@');
    if (atIndex !== -1) {
      const query = value.slice(atIndex + 1);
      const hasSpace = query.includes(' ');
      
      if (!hasSpace) {
        setMentionQuery(query);
        const filtered = sortContactsByLastName(
          contacts.filter(c =>
            c.name.toLowerCase().includes(query.toLowerCase()) ||
            c.company?.toLowerCase().includes(query.toLowerCase())
          )
        );
        setFilteredContacts(filtered);
        setShowDropdown(filtered.length > 0);
        setSelectedIndex(0);
      } else {
        setShowDropdown(false);
      }
    } else {
      setShowDropdown(false);
    }
  }, [value, contacts]);

  const handleSelectContact = (contact: Contact) => {
    const atIndex = value.lastIndexOf('@');
    const newValue = value.slice(0, atIndex) + contact.name;
    onChange(newValue);
    onContactSelect(contact);
    setShowDropdown(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showDropdown) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredContacts.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
      } else if (e.key === 'Enter' && filteredContacts.length > 0) {
        e.preventDefault();
        handleSelectContact(filteredContacts[selectedIndex]);
        return;
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowDropdown(false);
        return;
      }
    }
    
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    if (showDropdown && dropdownRef.current) {
      const selectedElement = dropdownRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex, showDropdown]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => {
          // Delay to allow click on dropdown
          setTimeout(() => {
            setShowDropdown(false);
            if (onBlur) onBlur();
          }, 200);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        autoFocus={autoFocus}
      />
      
      {showDropdown && filteredContacts.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50"
        >
          {filteredContacts.map((contact, index) => (
            <button
              key={contact.id}
              onClick={() => handleSelectContact(contact)}
              className={`w-full px-4 py-2.5 text-left hover:bg-slate-50 transition-colors flex items-center gap-3 ${
                index === selectedIndex ? 'bg-slate-100' : ''
              }`}
            >
              {contact.imageUrl ? (
                <img
                  src={contact.imageUrl}
                  alt={contact.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                  style={{ backgroundColor: contact.color || '#6b7b98' }}
                >
                  {contact.initials || contact.name.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-slate-800 truncate">{contact.name}</div>
                {contact.company && (
                  <div className="text-xs text-slate-500 truncate">{contact.company}</div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
