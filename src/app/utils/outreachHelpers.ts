/**
 * Outreach Helpers
 * Utilities for managing outreach tasks
 */

import type { Task } from '../types/task';

export interface OutreachValidation {
  isValid: boolean;
  errors: string[];
}

export interface OutreachEmailData {
  firstName: string;
  email: string;
  topicPhrase: string;
  companyName?: string;
}

export interface GeneratedEmail {
  subject: string;
  body: string;
  to: string;
}

/**
 * Validate an outreach task has required fields
 */
export function validateOutreachTask(task: Partial<Task>): OutreachValidation {
  const errors: string[] = [];
  
  if (!task.title || task.title.trim() === '') {
    errors.push('Task title is required');
  }
  
  if (!task.contactId) {
    errors.push('Contact is required for outreach tasks');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Extract outreach topic from task title or description
 */
export function extractOutreachTopic(task: Task): string | null {
  // Try to extract topic from title
  const titleMatch = task.title.match(/outreach.*?(?:about|re:|regarding)\s+(.+)/i);
  if (titleMatch) {
    return titleMatch[1].trim();
  }
  
  // Try to extract from description
  if (task.description) {
    const descMatch = task.description.match(/topic:\s*(.+)/i);
    if (descMatch) {
      return descMatch[1].trim();
    }
  }
  
  return null;
}

/**
 * Generate outreach task title
 */
export function generateOutreachTitle(contactName: string, topic?: string): string {
  if (topic) {
    return `Outreach to ${contactName} re: ${topic}`;
  }
  return `Outreach to ${contactName}`;
}

/**
 * Generate outreach email content
 */
export function generateOutreachEmail(data: OutreachEmailData): GeneratedEmail {
  const { firstName, email, topicPhrase, companyName } = data;
  
  // Generate subject line
  const subject = `Following up on ${topicPhrase}`;
  
  // Generate email body
  const companyMention = companyName ? ` at ${companyName}` : '';
  
  const body = `Hi ${firstName},

I wanted to follow up regarding ${topicPhrase}.

[Your message here]

Looking forward to connecting.

Best regards`;

  return {
    subject,
    body,
    to: email
  };
}