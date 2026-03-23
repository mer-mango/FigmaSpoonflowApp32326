/**
 * Nurture Card
 * Displays nurture sequence information
 */

import React from 'react';
import type { Contact } from '../types/contact';

interface NurtureCardProps {
  contact: Contact;
  onClick?: () => void;
}

export function NurtureCard({ contact, onClick }: NurtureCardProps) {
  return (
    <div 
      className="p-4 bg-white border rounded-lg hover:shadow-md cursor-pointer"
      onClick={onClick}
    >
      <h3 className="font-semibold">{contact.name}</h3>
      <p className="text-sm text-gray-600">{contact.company}</p>
    </div>
  );
}
