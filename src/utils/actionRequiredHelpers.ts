/**
 * Helpers for calculating action required items
 */

import { Contact } from '../components/ContactsPage';

export interface ActionRequiredItem {
  id: string;
  contactId: string;
  contactName: string;
  contactType: 'Prospect' | 'Client';
  status: string;
  action: string;
  whoseMove: string;
  dueDate: Date;
  priority: 'high' | 'normal';
}

/**
 * Calculates all action required items from contacts
 * Note: Journey tracking has been removed from this app.
 * This function now returns an empty array.
 */
export function calculateActionRequiredItems(contacts: Contact[]): ActionRequiredItem[] {
  // Journey tracking removed - return empty array
  return [];
}