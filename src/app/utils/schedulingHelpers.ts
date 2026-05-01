// Scheduling task utilities

export interface SchedulingEmailData {
  firstName: string;
  email: string;
  schedulingLink: string;
  topicPhrase?: string;
}

// Extract topic phrase from task title or description
export function extractTopicPhrase(title: string, description?: string): string | null {
  const combined = `${title} ${description || ''}`.toLowerCase();
  
  // Look for common topic indicators
  const topicPatterns = [
    /about\s+(?:the\s+)?(.+?)(?:\s+–|\s+-|\s+\.|$)/i,
    /regarding\s+(?:the\s+)?(.+?)(?:\s+–|\s+-|\s+\.|$)/i,
    /re:\s+(.+?)(?:\s+–|\s+-|\s+\.|$)/i,
    /for\s+(?:the\s+)?(.+?)(?:\s+–|\s+-|\s+\.|$)/i,
  ];
  
  for (const pattern of topicPatterns) {
    const match = combined.match(pattern);
    if (match && match[1]) {
      let topic = match[1].trim();
      
      // Clean up common scheduling phrases
      topic = topic.replace(/send my link|use their link|his link|her link|their link/gi, '').trim();
      
      // If we have something meaningful left (more than 3 words typically)
      if (topic.length > 10 && !topic.match(/^(schedule|meeting|call|intro|follow up)$/i)) {
        // Prefix with "the" if it doesn't already start with an article
        if (!topic.match(/^(the|a|an)\s+/i)) {
          topic = `the ${topic}`;
        }
        return topic;
      }
    }
  }
  
  return null;
}

// Generate scheduling email content
export function generateSchedulingEmail(data: SchedulingEmailData): {
  subject: string;
  body: string;
} {
  const { firstName, schedulingLink, topicPhrase } = data;
  
  const subject = "Setting up time to connect";
  
  let body: string;
  
  if (topicPhrase) {
    body = `Hi ${firstName},

I'm following up to find a time for us to connect about ${topicPhrase}. You can grab whatever works best for you using my scheduling page here: ${schedulingLink}. If none of the available times work well on your end, feel free to reply with a few options that do and we'll find something that works for both of us.

Best,
Meredith`;
  } else {
    body = `Hi ${firstName},

I'm following up to find a time for us to connect. You can grab whatever works best for you using my scheduling page here: ${schedulingLink}. If none of the available times work well on your end, feel free to reply with a few options that do and we'll find something that works for both of us.

Best,
Meredith`;
  }
  
  return { subject, body };
}

// Open Gmail compose window
export function openGmailCompose(to: string, subject: string, body: string): void {
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(gmailUrl, '_blank');
}

// Validation helpers
export interface SchedulingValidation {
  isValid: boolean;
  errorMessage?: string;
}

export function validateTheirLinkScheduling(
  contact?: { id: string; name: string; schedulingUrl?: string } | null
): SchedulingValidation {
  if (!contact) {
    return {
      isValid: false,
      errorMessage: "This scheduling task needs a linked contact first. Open the task, add a contact, then try again."
    };
  }
  
  if (!contact.schedulingUrl) {
    return {
      isValid: false,
      errorMessage: "This task is set to use their scheduling link, but there's no scheduling link saved in this contact's profile yet. Add a scheduling link and try again."
    };
  }
  
  return { isValid: true };
}

export function validateMyLinkScheduling(
  contact?: { id: string; name: string; email?: string } | null,
  userSchedulingLink?: string
): SchedulingValidation {
  if (!contact) {
    return {
      isValid: false,
      errorMessage: "This scheduling task needs a linked contact so I know who to email. Open the task, add a contact, then try again."
    };
  }
  
  if (!contact.email) {
    return {
      isValid: false,
      errorMessage: "I can't generate a scheduling email because this contact doesn't have an email address saved yet. Add an email to the contact profile and try again."
    };
  }
  
  if (!userSchedulingLink) {
    return {
      isValid: false,
      errorMessage: "I need your Google Calendar scheduling link before I can generate these emails. Add your scheduling link in your settings, then try again."
    };
  }
  
  return { isValid: true };
}

// Get contact first name from full name
export function getFirstName(fullName: string): string {
  return fullName.split(' ')[0];
}