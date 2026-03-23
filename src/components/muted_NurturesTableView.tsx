/**
 * Nurtures Table View
 * Displays nurture sequences in table format
 */

import React from 'react';
import type { Contact } from '../types/contact';

interface NurturesTableViewProps {
  contacts: Contact[];
  onContactClick?: (contact: Contact) => void;
}

export function NurturesTableView({ contacts, onContactClick }: NurturesTableViewProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-4">Contact Name</th>
            <th className="text-left p-4">Company</th>
            <th className="text-left p-4">Stage</th>
            <th className="text-left p-4">Last Contact</th>
            <th className="text-left p-4">Next Action</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => (
            <tr
              key={contact.id}
              className="border-b hover:bg-gray-50 cursor-pointer"
              onClick={() => onContactClick?.(contact)}
            >
              <td className="p-4">{contact.name}</td>
              <td className="p-4">{contact.company}</td>
              <td className="p-4">
                <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                  {contact.stage || 'New'}
                </span>
              </td>
              <td className="p-4 text-gray-600">
                {contact.lastContact ? new Date(contact.lastContact).toLocaleDateString() : 'Never'}
              </td>
              <td className="p-4 text-gray-600">-</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}