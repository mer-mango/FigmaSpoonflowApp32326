/**
 * Utility functions for sorting contacts
 */

export interface Contact {
  id: string;
  name: string;
  [key: string]: any;
}

/**
 * Extracts the last name from a full name
 * If name has multiple words, returns the last word
 * Otherwise returns the full name
 */
export function getLastName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  return parts.length > 1 ? parts[parts.length - 1] : fullName;
}

/**
 * Sorts contacts alphabetically by last name (A-Z)
 */
export function sortContactsByLastName<T extends Contact>(contacts: T[]): T[] {
  return [...contacts].sort((a, b) => {
    const lastNameA = getLastName(a.name).toLowerCase();
    const lastNameB = getLastName(b.name).toLowerCase();
    return lastNameA.localeCompare(lastNameB);
  });
}
