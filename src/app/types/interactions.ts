// Meeting Dossier and Interaction Types

export interface MeetingPrepNotes {
  thingsToKnow: string;
  thingsToDiscuss: Array<{ text: string; completed: boolean }>;
  questionsToAsk: Array<{ text: string; completed: boolean }>;
  nextSteps: string;
}

export interface PostMeetingNotes {
  fathomUrl?: string;
  summary: string;
  thingsDiscussed: Array<{ text: string; completed: boolean }>;
  outcomes: string;
  remainingQuestions: string;
  actionItems: Array<{ text: string }>;
  thankYouEmailSent?: boolean;
  // Follow-up tracking
  followUpAlreadyScheduled?: boolean;
  followUpReminderTaskId?: string;
  followUpReminderDueDate?: string;
  // Nurture tracking
  nurtureFrequencySet?: number; // in weeks
  nurtureFrequencyChanged?: boolean;
}

export interface WindDownNotes {
  reflections: string;
  lessonsLearned: string;
  additionalContext: string;
}

export interface MeetingTask {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  duration?: string;
  status: 'todo' | 'in-progress' | 'done';
  flagged: boolean;
  tags?: string[];
  contactId?: string;
  contactName?: string;
  meetingId?: string; // Link back to the interaction
  createdAt: string;
  updatedAt: string;
}

export interface MeetingDossier {
  id: string;
  type: 'meeting' | 'email' | 'call' | 'nurture' | 'other';
  meetingId?: string; // ID of the meeting from calendar/scheduler
  meetingTitle: string;
  meetingDate: string;
  meetingTime?: string;
  meetingEndTime?: string;
  contactId: string;
  contactName: string;

  // Lifecycle tracking
  prepCompleted: boolean;
  prepCompletedAt?: string;
  postMeetingCompleted: boolean;
  postMeetingCompletedAt?: string;
  windDownCompleted: boolean;
  windDownCompletedAt?: string;

  // Notes from each phase
  prepNotes?: MeetingPrepNotes;
  postMeetingNotes?: PostMeetingNotes;
  windDownNotes?: WindDownNotes;

  // CANONICAL notes fields - all entry points read/write to these fields
  duringMeetingNotes?: string; // Notes taken during the meeting
  fathomUrl?: string; // Link to Fathom recording
  summary?: string; // Post-meeting summary
  transcript?: string; // Full transcript from Fathom or manual entry
  actionItems?: Array<{ text: string }>; // Action items extracted from meeting

  // Tasks generated from this meeting
  taskIds: string[];

  // Metadata
  createdAt: string;
  updatedAt: string;
}

// For displaying in the interactions tab
export interface InteractionCard {
  id: string;
  type: 'meeting' | 'email' | 'call' | 'nurture' | 'other';
  title: string;
  date: string;
  time?: string;
  link?: string;
  linkText?: string;
  summary?: string;
  dossier?: MeetingDossier; // Full meeting dossier if this is a meeting
  completed: boolean;
}