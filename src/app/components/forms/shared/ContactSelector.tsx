import React from 'react';
import { User, Building, Mail } from 'lucide-react';
import { Contact } from '../../ContactsPage';
import { sortContactsByLastName } from '../../../utils/contactSorting';

interface ContactSelectorProps {
  contacts: Contact[];
  selectedContactId: string;
  onSelectContact: (contactId: string) => void;
  showInDocument?: boolean; // Whether to show contact info in client-facing document
  onToggleShowInDocument?: (show: boolean) => void;
  label?: string;
}

export function ContactSelector({
  contacts,
  selectedContactId,
  onSelectContact,
  showInDocument = false,
  onToggleShowInDocument,
  label = 'Link to Contact'
}: ContactSelectorProps) {
  const selectedContact = contacts.find(c => c.id === selectedContactId);

  return (
    <div className="bg-white border-2 border-[#ddecf0] rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-['Poppins'] font-medium text-[#034863] flex items-center gap-2">
          <User className="w-5 h-5 text-[#2f829b]" />
          {label}
        </h3>
        {onToggleShowInDocument && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showInDocument}
              onChange={(e) => onToggleShowInDocument(e.target.checked)}
              className="w-4 h-4 text-[#2f829b] border-[#ddecf0] rounded focus:ring-[#2f829b]"
            />
            <span className="font-['Poppins'] text-sm text-[#034863]/70">
              Show on document
            </span>
          </label>
        )}
      </div>

      <select
        value={selectedContactId}
        onChange={(e) => onSelectContact(e.target.value)}
        className="w-full px-4 py-3 border-2 border-[#ddecf0] rounded-lg font-['Poppins'] text-[16px] text-[#034863] focus:border-[#2f829b] focus:ring-0 transition-colors"
      >
        <option value="">Select a contact...</option>
        {sortContactsByLastName(
          contacts.filter(c => !c.archived)
        ).map(contact => (
          <option key={contact.id} value={contact.id}>
            {contact.name} {contact.company ? `- ${contact.company}` : ''}
          </option>
        ))}
      </select>

      {selectedContact && (
        <div className="mt-4 p-4 bg-[#f5fafb] rounded-lg space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-[#2f829b]" />
            <span className="font-['Poppins'] text-[#034863]">{selectedContact.name}</span>
          </div>
          {selectedContact.company && (
            <div className="flex items-center gap-2 text-sm">
              <Building className="w-4 h-4 text-[#2f829b]" />
              <span className="font-['Poppins'] text-[#034863]">{selectedContact.company}</span>
            </div>
          )}
          {selectedContact.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-[#2f829b]" />
              <span className="font-['Poppins'] text-[#034863]">{selectedContact.email}</span>
            </div>
          )}
          {selectedContact.role && (
            <div className="text-sm">
              <span className="font-['Poppins'] text-[#034863]/70">{selectedContact.role}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}