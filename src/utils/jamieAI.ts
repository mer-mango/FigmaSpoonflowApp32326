import { ChatMessage } from '../components/muted_JamieChatPanel';
import { Task } from '../components/TasksPage';
import { Contact } from '../components/ContactsPage';
import { getUserSchedulingLink } from './userSettings';
import { voiceProfile } from '../config/voice_profile';
import { platformPlaybook } from '../config/platform_playbook';

// Default schedule settings (ScheduleSettings component was deleted - scheduling disabled)
interface SchedulingRules {
  workStartTime: string;
  workEndTime: string;
  breakDuration: number;
  meetingBuffer: number;
  focusBlockMinutes: number;
  maxMeetingsPerDay: number;
  defaultMeetingLength: number;
}

const defaultScheduleSettings: SchedulingRules = {
  workStartTime: '09:00',
  workEndTime: '17:00',
  breakDuration: 60,
  meetingBuffer: 15,
  focusBlockMinutes: 90,
  maxMeetingsPerDay: 5,
  defaultMeetingLength: 30
};

// Rich prompt-ready schedule settings (for Jamie's context)
type PromptScheduleSettings = {
  buffers: { 
    notes: string; 
    betweenMeetings: number;
    beforeFirstMeeting: string;
    afterLastMeeting: string;
    travelTime: string;
  };
  meetingPreferences: { 
    notes: string; 
    maxPerDay: number; 
    preferredTimes: string;
    avoidTimes: string;
    defaultDuration: string;
    backToBackLimit: string;
  };
  timeBlockingRules: {
    focusTimeMinimum: string;
    deepWorkWindows: string;
    protectedHours: string;
  };
  energyManagement: { 
    notes: string; 
    peakHours: string; 
    lowEnergyHours: string; 
    breakFrequency: string;
  };
  schedulingConstraints: { 
    notes: string; 
    workingHours: string; 
    timezone: string;
    flexibilityRules: string;
    overrideConditions: string;
  };
  autoDeclineRules: {
    priorityRules: string;
  };
  jamieGuidance: { 
    generalPrinciples: string; 
    decisionMakingFramework: string; 
    specialInstructions: string;
  };
};

/**
 * Convert simple SchedulingRules to rich PromptScheduleSettings for Jamie's context
 */
function toPromptScheduleSettings(rules: SchedulingRules): PromptScheduleSettings {
  return {
    buffers: {
      notes: `Keep space between meetings so you can reset and capture notes.`,
      betweenMeetings: rules.meetingBuffer,
      beforeFirstMeeting: `${rules.meetingBuffer} min`,
      afterLastMeeting: `${rules.meetingBuffer} min`,
      travelTime: `Add 15 min if location changes`
    },
    meetingPreferences: {
      notes: `Meetings should stay contained and energy-aware.`,
      maxPerDay: rules.maxMeetingsPerDay,
      preferredTimes: `12-3pm (peak focus) or 3-5pm`,
      avoidTimes: `Before 11am (low energy), after 6pm (hard stop at 6:30pm)`,
      defaultDuration: `${rules.defaultMeetingLength} min`,
      backToBackLimit: `Max 2 back-to-back, then require break`
    },
    timeBlockingRules: {
      focusTimeMinimum: `${rules.focusBlockMinutes} min`,
      deepWorkWindows: `12-3pm daily (protect this!)`,
      protectedHours: `12-3pm for deep work, before 11am for slow start`
    },
    energyManagement: {
      notes: `Protect your best brain hours.`,
      peakHours: `12pm–3pm`,
      lowEnergyHours: `before 11am`,
      breakFrequency: `Take a ${rules.breakDuration} min break after ${rules.focusBlockMinutes} min focus blocks`
    },
    schedulingConstraints: {
      notes: `Honor working hours unless it's truly worth the tradeoff.`,
      workingHours: `${rules.workStartTime}–${rules.workEndTime}`,
      timezone: `America/New_York`,
      flexibilityRules: `Can extend to 6:30pm for key meetings, but hard stop then`,
      overrideConditions: `High-priority client meetings or strategic partnerships can override preferences`
    },
    autoDeclineRules: {
      priorityRules: `
1. **Medical appointments** - always highest priority, never move
2. **Client meetings** - critical for business, protect these
3. **Deep work blocks** - necessary for deliverables, defend when possible
4. **Routines (AM Admin, PM Admin)** - can be shifted within the day if needed
5. **Nice-to-have networking** - lowest priority, easiest to reschedule

When a high-priority meeting conflicts with a routine, suggest moving the routine to a later time slot (never skip).`
    },
    jamieGuidance: {
      generalPrinciples: `Clarity, control, and recovery time come first. Default to protecting deep work and energy management over packing the calendar.`,
      decisionMakingFramework: `
When scheduling:
1. **Protect focus window first** (12-3pm for deep work)
2. **Limit meetings to max per day** (${rules.maxMeetingsPerDay})
3. **Add buffers between meetings** (${rules.meetingBuffer} min minimum)
4. **Respect energy patterns** (slow start before 11am, hard stop at 6:30pm)
5. **Then schedule everything else**`,
      specialInstructions: `Default to the smallest plan that moves things forward. When in doubt, ask clarifying questions rather than assuming. If Meredith is overcommitted, say so gently and suggest what to defer.`
    }
  };
}
import {
  getRelevantMemories,
  analyzeContentPatterns,
  getContactContext,
  getProjectContext,
  saveContentMemory,
  saveMeetingMemory,
  saveRelationshipMemory,
  saveLearningMemory,
  JamieMemory
} from './jamieMemory';
import { projectId, publicAnonKey } from './supabase/info';

/**
 * Load user's saved schedule settings or return defaults
 */
export async function loadScheduleSettings(): Promise<SchedulingRules> {
  try {
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a89809a8/schedule-settings`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.settings) {
        return data.settings as SchedulingRules;
      }
    }
  } catch (error) {
    console.error('Error loading schedule settings:', error);
  }
  return defaultScheduleSettings;
}

/**
 * Jamie's AI Response System
 * Embodies Jamie's complete DNA: personality, knowledge, communication style, and capabilities
 * NOW WITH MEMORY: Jamie learns about you over time and references past context
 * 
 * VOICE GUIDELINES:
 * - Empathetic, human, confident, encouraging, clear, conversational
 * - "Meredith Real Talk" - thoughtful and nuanced, but said like a real person
 * - First person ("I"), never "we" or "our team"
 * - Clear over clever. Grounded over grandiose. Specific over vague.
 * - Strong first sentences. Concrete examples from real patient life.
 * - Acknowledge complex emotions (frustration, relief, grief, hope, complexity)
 * 
 * BANNED PHRASES (never use):
 * - "nice-to-have", "in the evolving landscape", "is rooted in"
 * - "deep insights", "deeply" as filler, "unlock the power of"
 * - "buzzword", "let's face it", "let's be real"
 * - "it wasn't about X it was about Y", "embed/embedded" in branding
 * - "game-changing", "transforming healthcare at scale"
 * - Any motivational tone, corporate jargon, or patronizing "thought leader" clichés
 * 
 * PREFERRED PHRASES:
 * - "speak patient", "patient journey", "care continuum"
 * - "real-life constraints", "nuance", "connection"
 */

// ===== JAMIE'S PERSONALITY & TONE =====

const JAMIE_PERSONALITY = {
  traits: ['steady', 'clear', 'thoughtful', 'human', 'supportive'],
  neverUse: ['hype', 'clichés', 'motivational tone', 'cutesy language', 'corporate jargon', 'dramatic language'],
  responseLength: 'short and direct by default, longer when detail requested',
  pronouns: { self: 'I', user: 'you' }
};

/**
 * Helper: Generate comprehensive voice guidance from voice_profile.ts
 */
function getVoiceGuidanceText(): string {
  const bannedPhrasesList = voiceProfile.banned.phrases.join('", "');
  const bannedWordsList = voiceProfile.banned.words?.join('", "') || '';
  const preferredVerbs = voiceProfile.preferred_language.preferred_verbs.join(', ');
  
  return `
**MEREDITH'S VOICE RULES (from voice_profile.ts):**

POV Rules:
- Always write in FIRST PERSON SINGULAR ("I") when speaking as Meredith
- NEVER use: "${voiceProfile.pov_rules.disallowed_phrases_unless_approved.join('", "')}" unless explicitly approved
- When referring to Empower Health Strategies: "At Empower Health Strategies, I…"

BANNED PHRASES (never use):
"${bannedPhrasesList}"

BANNED WORDS (use sparingly if at all):
"${bannedWordsList}"

Tone Spectrum:
- Formal when: ${voiceProfile.tone_spectrum.formal_when.join(', ')}
- Casual/warm when: ${voiceProfile.tone_spectrum.casual_warm_when.join(', ')}
- NEVER: ${voiceProfile.tone_spectrum.never.join(', ')}

Style Guardrails:
- Always aim for: ${voiceProfile.style_guardrails.always_aim_for.join(' • ')}
- Avoid: ${voiceProfile.style_guardrails.avoid.join(' • ')}
- Default: ${voiceProfile.style_guardrails.defaults[voiceProfile.style_guardrails.defaults.length - 1]}

Preferred Language:
- Care & Journey: ${voiceProfile.preferred_language.care_and_journey.join(', ')}
- Patient-Centered: ${voiceProfile.preferred_language.patient_centered.join(', ')}
- Preferred Verbs: ${preferredVerbs}
`;
}

/**
 * Helper: Generate platform-specific guidance from platform_playbook.ts
 */
function getPlatformGuidanceText(platform?: string): string {
  if (!platform) return '';
  
  const platformKey = platform as keyof typeof platformPlaybook.platforms;
  const playbook = platformPlaybook.platforms[platformKey];
  
  if (!playbook) return '';
  
  return `
**PLATFORM GUIDANCE for ${platform} (from platform_playbook.ts):**

Purpose: ${playbook.purpose}
Ideal length: ${playbook.ideal_length_words.min}–${playbook.ideal_length_words.max} words

Best Practices:
${playbook.best_practices.map((bp: string) => `• ${bp}`).join('\n')}

DO:
${playbook.do.map((d: string) => `• ${d}`).join('\n')}

AVOID:
${playbook.avoid.map((a: string) => `• ${a}`).join('\n')}

Structure guidance:
${playbook.structure.map((s: any) => `• ${s.label}: ${s.guidance}`).join('\n')}

CTA Examples:
${playbook.cta_examples.map((ex: string) => `• "${ex}"`).join('\n')}
`;
}

/**
 * Helper: Get key writing DNA excerpts from jamie-dna.md
 */
function getWritingDNAGuidance(): string {
  return `
**MEREDITH'S WRITING DNA (from jamie-dna.md):**

Core Principles:
• Clear, straightforward sentences
• Human, conversational tone (not cutesy)
• Warm and empathetic without melodrama
• Strategic and thoughtful without jargon
• Specific over vague

Signature Style Elements:
• Parenthetical asides for personality without breaking flow
• Strategic fragments for emphasis

Example Opening Hook Style:
"If you're here, chances are you care about improving healthcare. Not just the technology or systems, but the foundational human experience of it all."

Example Sentence Rhythm:
"I've worked across the healthcare system in medical practices, hospitals, advocacy organizations, and the digital health world. But I feel my secret weapon and most valuable expertise comes from my personal healthcare experiences."

Voice Quality:
• Warm without being sentimental
• Confident without being corporate
• Personal without oversharing
• Structured without being rigid
• Invitational without being pushy

Content Creation Approach:
• Make content creation feel lighter, clearer, and less overwhelming
• Help you think, structure, and refine — without taking over your voice
• Offer 2–3 options that sound like you, not formulaic
• Keep everything aligned with your voice and your no-no words
• Shorten without losing nuance; tighten scattered sections
`;
}

// ===== MEREDITH'S CONTEXT & KNOWLEDGE =====

const MEREDITH_CONTEXT = {
  business: {
    name: 'Empower Health Strategies',
    expertise: 'Patient experience strategy, digital health consulting, co-design',
    positioning: 'Helping digital health teams align solutions with real patient pain points and care continuum dynamics',
  },
  currentProjects: {
    biteLabs: 'Faculty and partnership development, teaching PX course (Feb/March cohort)',
    cpp: 'Chronic Pain Project board member - annual planning, fundraising, programming',
    nhcPxi: 'National Health Council Patient Experience Innovation Center - high-priority relationship with Spencer',
    chronicallyMe: 'Partnership exploration with Sophie on accelerator for young adults',
    connectome: 'Light advisory work on chronic illness navigation app',
    commonGrounds: 'Active in health tech networking community',
  },
  energyPatterns: {
    notAMorningPerson: true,
    peakFocusWindow: '12pm-3pm',
    slowStartBefore: '11am',
    lighterTasksAfter: '3:30pm',
    hardStop: '6:30pm',
    taskTimeGoal: '90 minutes/day for focused work',
  },
  chronicIllness: {
    hasChronicConditions: true,
    needsSpoonManagement: true,
    frequentMedicalAppointments: true,
  },
  perfectionism: {
    strugglesWithStarting: true,
    needsHelpOvercomingParalysis: true,
    benefitsFromRoughDrafts: true,
  },
  // CLIENT ENGAGEMENT AUTOMATION SYSTEM
  engagementSystem: {
    summary: 'Modular Forms → Flows → Engagement Wizard workflow for consulting engagements (replaces static PDFs)',
    architecture: {
      formsLibrary: 'Reusable form templates (SOW, Invoice, Intake, etc.) - structure without client data',
      assembleFlow: 'Predefined or custom sequences of forms - LEGO-style form templates',
      draftEngagement: 'Client-specific instantiation where real content is written',
      previewEngagement: 'Full end-to-end review before anything is sent',
      sendEngagement: 'Intentional delivery using email templates',
      engagementLog: 'Global, read-only audit trail across all clients',
      contactEngagementTab: 'Contact-specific engagement history view',
    },
    keyRules: [
      'Forms are reusable; engagements are not',
      'Nothing is sent without preview',
      'Admin approval is required before final delivery',
      'Every client action triggers notifications (in-app, email, desktop if enabled)',
      'Every action is timestamped and logged',
      'Each form generates a PDF + one comprehensive engagement packet',
      'Email templates are auto-inserted but editable at send time',
    ],
    principles: 'Design for clarity, control, and trust. No automation without visibility. No delivery without intent.',
  }
};

// ===== HELPER FUNCTIONS =====

/**
 * Extract JSON from responses that may contain markdown code fences or extra text
 * Gemini sometimes wraps JSON in ```json ... ``` blocks or adds conversational text before the JSON
 */
function stripMarkdownCodeFences(text: string): string {
  // First, try to find JSON within code fences
  const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/i);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }
  
  // If no code fences, try to find raw JSON (look for first { and last })
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0].trim();
  }
  
  // Fall back to original text
  return text.trim();
}

function getCurrentTimeContext(): { isLowEnergy: boolean; isPeakFocus: boolean; isEndOfDay: boolean; currentTime: string; currentDate: string } {
  const now = new Date();
  const hour = now.getHours();
  const minutes = now.getMinutes();
  const timeString = `${hour > 12 ? hour - 12 : hour === 0 ? 12 : hour}:${minutes.toString().padStart(2, '0')}${hour >= 12 ? 'pm' : 'am'}`;
  const dateString = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  
  return {
    isLowEnergy: hour < 11, // Before 11am - slow start time
    isPeakFocus: hour >= 12 && hour <= 15, // 12pm-3pm peak focus window
    isEndOfDay: hour >= 18, // After 6pm - winding down
    currentTime: timeString,
    currentDate: dateString
  };
}

function detectEnergyLevel(message: string): 'low' | 'normal' | 'high' {
  // Safety check: ensure message is a string
  if (typeof message !== 'string') {
    return 'normal';
  }
  
  const lowerMsg = message.toLowerCase();
  const lowEnergyIndicators = ['tired', 'exhausted', 'overwhelm', 'can\'t focus', 'foggy', 'low spoons', 'flare', 'pain'];
  const hasLowEnergy = lowEnergyIndicators.some(indicator => lowerMsg.includes(indicator));
  return hasLowEnergy ? 'low' : 'normal';
}

function getTaskStats(tasks: Task[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const activeTasks = tasks.filter(t => !t.archived && t.status !== 'done');
  const overdueTasks = activeTasks.filter(t => {
    if (!t.dueDate) return false;
    return new Date(t.dueDate) < today;
  });
  const todayTasks = activeTasks.filter(t => {
    if (!t.dueDate) return false;
    const dueDate = new Date(t.dueDate);
    return dueDate.toDateString() === today.toDateString();
  });
  const priorityTasks = activeTasks.filter(t => t.priority);
  
  return { activeTasks, overdueTasks, todayTasks, priorityTasks };
}

function createQuickAction(label: string, action: string, data?: any) {
  return { label, action, data };
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return 'last week';
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 60) return 'last month';
  return `${Math.floor(diffDays / 30)} months ago`;
}

/**
 * Voice Quality Check - Ensures Jamie's outputs follow Meredith's voice guidelines
 * Flags banned phrases and suggests alternatives
 */
export function checkVoiceGuidelines(text: string): {
  hasBannedPhrases: boolean;
  bannedPhrasesFound: string[];
  suggestions: string[];
} {
  // Load banned phrases from voice profile config
  const bannedPhrases = [
    ...voiceProfile.banned.phrases,
    ...voiceProfile.pov_rules.disallowed_phrases_unless_approved
  ];
  
  // Also include banned words
  const bannedWords = voiceProfile.banned.words || [];
  
  const lowerText = text.toLowerCase();
  const found: string[] = [];
  const suggestions: string[] = [];
  
  // Helper to add suggestion only if not duplicate
  const addSuggestion = (suggestion: string) => {
    if (!suggestions.includes(suggestion)) {
      suggestions.push(suggestion);
    }
  };
  
  // Helper to add found item only if not duplicate
  const addFound = (item: string) => {
    if (!found.includes(item)) {
      found.push(item);
    }
  };
  
  // Check banned phrases
  bannedPhrases.forEach(phrase => {
    let matched = false;
    
    // Use word boundary regex for single words or specific cases like "we"
    if (phrase === 'we' || !phrase.includes(' ')) {
      const regex = new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      matched = regex.test(text);
    } else {
      // Multi-word phrases use includes
      matched = lowerText.includes(phrase.toLowerCase());
    }
    
    if (matched) {
      addFound(phrase);
      
      // Provide alternatives
      if (phrase === 'we' || phrase.includes('our team') || phrase.includes('our company')) {
        addSuggestion('Use "I" instead - Meredith is a solo consultant');
      } else if (phrase.includes('unlock')) {
        addSuggestion('Replace with: "help you," "make possible," or "create space for"');
      } else if (phrase.includes('landscape') || phrase.includes('realm')) {
        addSuggestion('Cut this phrase entirely - get straight to the point');
      } else if (phrase.includes('rooted')) {
        addSuggestion('Replace with: "based on" or "built from"');
      } else if (phrase.includes('deep')) {
        addSuggestion('Cut "deep/deeply" or rewrite more directly');
      }
    }
  });
  
  // Check banned words with word boundaries
  bannedWords.forEach(word => {
    const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(text)) {
      addFound(word);
      
      // Provide alternatives for banned words
      if (word === 'deep' || word === 'deeply') {
        addSuggestion('Cut "deep/deeply" or rewrite more directly');
      }
    }
  });
  
  return {
    hasBannedPhrases: found.length > 0,
    bannedPhrasesFound: found,
    suggestions
  };
}

// ===== RESPONSE GENERATORS =====

function generateTaskResponse(
  message: string,
  tasks: Task[],
  energyLevel: 'low' | 'normal' | 'high'
): ChatMessage {
  const lowerMsg = message.toLowerCase();
  const stats = getTaskStats(tasks);
  
  // Overdue tasks query
  if (lowerMsg.includes('overdue')) {
    if (stats.overdueTasks.length === 0) {
      return {
        id: `msg-${Date.now()}`,
        sender: 'jamie',
        text: 'No overdue tasks right now. You\'re caught up.',
        timestamp: new Date(),
        quickActions: []
      };
    }
    
    const topOverdue = stats.overdueTasks[0];
    return {
      id: `msg-${Date.now()}`,
      sender: 'jamie',
      text: `You have ${stats.overdueTasks.length} overdue task${stats.overdueTasks.length > 1 ? 's' : ''}. The most urgent: "${topOverdue.title}". Want help prioritizing?`,
      timestamp: new Date(),
      quickActions: [
        createQuickAction('View task', 'view-task', { taskId: topOverdue.id }),
        createQuickAction('Plan my day', 'open-plan-day')
      ]
    };
  }
  
  // Today's tasks
  if (lowerMsg.includes('today') || lowerMsg.includes('due today')) {
    if (stats.todayTasks.length === 0) {
      return {
        id: `msg-${Date.now()}`,
        sender: 'jamie',
        text: 'No tasks specifically due today. Want me to suggest what to work on?',
        timestamp: new Date(),
        quickActions: [
          createQuickAction('Plan my day', 'open-plan-day')
        ]
      };
    }
    
    return {
      id: `msg-${Date.now()}`,
        sender: 'jamie',
        text: `${stats.todayTasks.length} task${stats.todayTasks.length > 1 ? 's' : ''} due today. Let's make sure you have time blocked.`,
        timestamp: new Date(),
        quickActions: [
          createQuickAction('Plan my day', 'open-plan-day')
        ]
      };
  }
  
  // Create/add new task
  if (lowerMsg.includes('create') || lowerMsg.includes('add') || lowerMsg.includes('new task')) {
    return {
      id: `msg-${Date.now()}`,
      sender: 'jamie',
      text: 'What would you like to add?',
      timestamp: new Date(),
      quickActions: [
        createQuickAction('Create task', 'create-task')
      ]
    };
  }
  
  // Priority tasks
  if (lowerMsg.includes('priority') || lowerMsg.includes('important')) {
    if (stats.priorityTasks.length === 0) {
      return {
        id: `msg-${Date.now()}`,
        sender: 'jamie',
        text: 'No tasks currently flagged as priority.',
        timestamp: new Date(),
        quickActions: []
      };
    }
    
    return {
      id: `msg-${Date.now()}`,
      sender: 'jamie',
      text: `${stats.priorityTasks.length} task${stats.priorityTasks.length > 1 ? 's' : ''} flagged as priority. Focus on those first.`,
      timestamp: new Date(),
      quickActions: [
        createQuickAction('View tasks', 'view-task')
      ]
    };
  }
  
  // General task overview
  const overdueNote = stats.overdueTasks.length > 0 ? ` ${stats.overdueTasks.length} overdue.` : '';
  return {
    id: `msg-${Date.now()}`,
    sender: 'jamie',
    text: `${stats.activeTasks.length} active tasks.${overdueNote}`,
    timestamp: new Date(),
    quickActions: [
      createQuickAction('View tasks', 'view-task'),
      createQuickAction('Plan my day', 'open-plan-day')
    ]
  };
}

function generateContactResponse(
  message: string,
  contacts: Contact[]
): ChatMessage {
  const lowerMsg = message.toLowerCase();
  
  // Check for pending calendar contact suggestions
  if (lowerMsg.includes('add') && (lowerMsg.includes('calendar') || lowerMsg.includes('meeting') || lowerMsg.includes('attendee'))) {
    try {
      const stored = localStorage.getItem('pending_contact_suggestions');
      if (stored) {
        const pending = JSON.parse(stored);
        if (pending.length > 0) {
          const peopleList = pending.map((p: any, i: number) => `${i + 1}. ${p.name || p.email} (${p.email})`).join('\n');
          return {
            id: `msg-${Date.now()}`,
            sender: 'jamie',
            text: `I found ${pending.length} ${pending.length === 1 ? 'person' : 'people'} from your calendar who ${pending.length === 1 ? 'isn\'t' : 'aren\'t'} in your contacts yet:\n\n${peopleList}\n\nWould you like me to add ${pending.length === 1 ? 'them' : 'any of them'}?`,
            timestamp: new Date(),
            quickActions: pending.slice(0, 3).map((p: any) => 
              createQuickAction(`Add ${p.name || p.email.split('@')[0]}`, 'create-contact', { 
                email: p.email, 
                name: p.name 
              })
            )
          };
        }
      }
    } catch (e) {
      console.error('Error checking pending contacts:', e);
    }
  }
  
  // Find/search for specific contact
  if (lowerMsg.includes('find') || lowerMsg.includes('search') || lowerMsg.includes('who')) {
    // Try to extract a name from the message
    for (const contact of contacts) {
      if (lowerMsg.includes(contact.name.toLowerCase())) {
        return {
          id: `msg-${Date.now()}`,
          sender: 'jamie',
          text: `I found ${contact.name}${contact.company ? ` at ${contact.company}` : ''}.${contact.email ? ` Email: ${contact.email}` : ''}`,
          timestamp: new Date(),
          quickActions: [
            createQuickAction('View profile', 'view-contact', { contactId: contact.id })
          ]
        };
      }
    }
    
    return {
      id: `msg-${Date.now()}`,
      sender: 'jamie',
      text: 'I didn\'t find that contact. Want to add them?',
      timestamp: new Date(),
      quickActions: [
        createQuickAction('Create contact', 'create-contact')
      ]
    };
  }
  
  // Create new contact
  if (lowerMsg.includes('create') || lowerMsg.includes('add') || lowerMsg.includes('new')) {
    return {
      id: `msg-${Date.now()}`,
      sender: 'jamie',
      text: 'Who would you like to add?',
      timestamp: new Date(),
      quickActions: [
        createQuickAction('Create contact', 'create-contact')
      ]
    };
  }
  
  // General contact overview
  return {
    id: `msg-${Date.now()}`,
    sender: 'jamie',
    text: `You have ${contacts.length} contacts. Looking for someone specific?`,
    timestamp: new Date(),
    quickActions: []
  };
}

function generateScheduleResponse(message: string): ChatMessage {
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes('plan') || lowerMsg.includes('organize')) {
    return {
      id: `msg-${Date.now()}`,
      sender: 'jamie',
      text: 'I can help you plan your day. I\'ll review your meetings, tasks, and routines to create an optimal schedule.',
      timestamp: new Date(),
      quickActions: [
        createQuickAction('Plan my day', 'open-plan-day')
      ]
    };
  }
  
  if (lowerMsg.includes('meeting') && (lowerMsg.includes('prep') || lowerMsg.includes('prepare'))) {
    return {
      id: `msg-${Date.now()}`,
      sender: 'jamie',
      text: 'I can prep you for any meeting. Which one?',
      timestamp: new Date(),
      quickActions: []
    };
  }
  
  return {
    id: `msg-${Date.now()}`,
    sender: 'jamie',
    text: 'I can help with scheduling. Want to find time for something, or plan your day?',
    timestamp: new Date(),
    quickActions: [
      createQuickAction('Plan my day', 'open-plan-day')
    ]
  };
}

function generateWindDownResponse(): ChatMessage {
  return {
    id: `msg-${Date.now()}`,
    sender: 'jamie',
    text: 'Ready to wind down? I\'ll help you capture meeting notes, review what you accomplished, and prep for tomorrow.',
    timestamp: new Date(),
    quickActions: [
      createQuickAction('Start wind down', 'open-wind-down')
    ]
  };
}

function generateLowEnergyResponse(message: string): ChatMessage {
  return {
    id: `msg-${Date.now()}`,
    sender: 'jamie',
    text: 'I see you\'re in low-energy mode. Let\'s keep things gentle today. Focus on 1-3 tiny essentials—admin, simple emails, or health-supportive tasks. Deep work can wait.',
    timestamp: new Date(),
    quickActions: [
      createQuickAction('Show me easy tasks', 'view-task')
    ]
  };
}

function generateContextResponse(
  currentPage: string,
  selectedItem?: { type: string; id: string; title: string }
): ChatMessage {
  // Context-aware responses based on current page
  switch (currentPage) {
    case 'tasks':
      return {
        id: `msg-${Date.now()}`,
        sender: 'jamie',
        text: 'I can help with tasks. I can help you prioritize, create new ones, or find time to work on them.',
        timestamp: new Date(),
        quickActions: [
          createQuickAction('Create task', 'create-task'),
          createQuickAction('Plan my day', 'open-plan-day')
        ]
      };
      
    case 'contacts':
      return {
        id: `msg-${Date.now()}`,
        sender: 'jamie',
        text: 'I can help with contacts. I can help you find someone, schedule a meeting, or create follow-up tasks.',
        timestamp: new Date(),
        quickActions: [
          createQuickAction('Create contact', 'create-contact')
        ]
      };
      
    case 'calendar':
      return {
        id: `msg-${Date.now()}`,
        sender: 'jamie',
        text: 'Looking at your calendar. I can help you find time for tasks, schedule meetings, or plan your day.',
        timestamp: new Date(),
        quickActions: [
          createQuickAction('Plan my day', 'open-plan-day')
        ]
      };
      
    case 'content':
      return {
        id: `msg-${Date.now()}`,
        sender: 'jamie',
        text: 'I can help with content. Need an outline, hook ideas, or help getting started on a draft?',
        timestamp: new Date(),
        quickActions: [
          createQuickAction('Create content', 'create-content')
        ]
      };
      
    case 'today':
      const timeContext = getCurrentTimeContext();
      if (timeContext.isLowEnergy) {
        return {
          id: `msg-${Date.now()}`,
          sender: 'jamie',
          text: 'Morning. Take it easy—this is your slow-start window. Good time for tiny admin, email triage, or basic planning.',
          timestamp: new Date(),
          quickActions: [
            createQuickAction('Plan my day', 'open-plan-day')
          ]
        };
      } else if (timeContext.isPeakFocus) {
        return {
          id: `msg-${Date.now()}`,
          sender: 'jamie',
          text: 'You\'re in your peak focus window (12-3pm). This is the best time for deep work, strategy, or complex writing.',
          timestamp: new Date(),
          quickActions: [
            createQuickAction('View tasks', 'view-task')
          ]
        };
      } else if (timeContext.isEndOfDay) {
        return {
          id: `msg-${Date.now()}`,
          sender: 'jamie',
          text: 'Getting close to your 6:30pm cutoff. Time to wrap up and wind down?',
          timestamp: new Date(),
          quickActions: [
            createQuickAction('Wind down', 'open-wind-down')
          ]
        };
      }
      return {
        id: `msg-${Date.now()}`,
        sender: 'jamie',
        text: 'I\'m here to help. What do you need?',
        timestamp: new Date(),
        quickActions: [
          createQuickAction('Plan my day', 'open-plan-day')
        ]
      };
      
    default:
      return {
        id: `msg-${Date.now()}`,
        sender: 'jamie',
        text: 'I\'m here to help. What do you need?',
        timestamp: new Date(),
        quickActions: []
      };
  }
}

function generateBusinessResponse(message: string): ChatMessage {
  const lowerMsg = message.toLowerCase();
  
  // BiteLabs
  if (lowerMsg.includes('bitelabs') || lowerMsg.includes('jason')) {
    return {
      id: `msg-${Date.now()}`,
      sender: 'jamie',
      text: 'BiteLabs: You\'re deepening your relationship with Jason, exploring programming for fellows/alumni/faculty, and teaching another PX course (likely late Feb/early March).',
      timestamp: new Date(),
      quickActions: []
    };
  }
  
  // CPP
  if (lowerMsg.includes('cpp') || lowerMsg.includes('chronic pain project')) {
    return {
      id: `msg-${Date.now()}`,
      sender: 'jamie',
      text: 'Chronic Pain Project: Board member focused on annual planning, fundraising, and programming for artists living with chronic pain.',
      timestamp: new Date(),
      quickActions: []
    };
  }
  
  // NHC PXI
  if (lowerMsg.includes('nhc') || lowerMsg.includes('national health council') || lowerMsg.includes('spencer')) {
    return {
      id: `msg-${Date.now()}`,
      sender: 'jamie',
      text: 'NHC PXI: High-priority relationship. You\'re exploring collaboration with Spencer on patient-centered co-design, curriculum, and advisory work for their Patient Experience Innovation Center.',
      timestamp: new Date(),
      quickActions: []
    };
  }
  
  // Chronically Me / Sophie
  if (lowerMsg.includes('sophie') || lowerMsg.includes('chronically me') || lowerMsg.includes('chargies')) {
    return {
      id: `msg-${Date.now()}`,
      sender: 'jamie',
      text: 'Chronically Me/The Chargies: Exploring partnership with Sophie on accelerator for young adults in digital health. Potential roles: strategic partner, curriculum creator, workshop facilitator.',
      timestamp: new Date(),
      quickActions: []
    };
  }
  
  // General business query
  if (lowerMsg.includes('project') || lowerMsg.includes('partnership') || lowerMsg.includes('client')) {
    return {
      id: `msg-${Date.now()}`,
      sender: 'jamie',
      text: 'Your main focus: landing paying clients (funded digital health companies, accelerators/incubators) and strengthening visibility through content (LinkedIn, Substack). Key partnerships in progress: BiteLabs, NHC PXI, Chronically Me, CPP board work.',
      timestamp: new Date(),
      quickActions: []
    };
  }
  
  return {
    id: `msg-${Date.now()}`,
    sender: 'jamie',
    text: 'What would you like to know about your projects or partnerships?',
    timestamp: new Date(),
    quickActions: []
  };
}

function generateGreetingResponse(): ChatMessage {
  const timeContext = getCurrentTimeContext();
  let greeting = 'I\'m here to help.';
  
  if (timeContext.isLowEnergy) {
    greeting = 'Morning. Take your time—this is your slow-start window.';
  } else if (timeContext.isEndOfDay) {
    greeting = 'Almost time to wrap up. Need help winding down?';
  }
  
  return {
    id: `msg-${Date.now()}`,
    sender: 'jamie',
    text: `${greeting}\n\nI can help with:\n• Writing content (posts, emails, articles)\n• Answering questions about your tasks and contacts\n• Searching for articles and research\n• Providing suggestions based on context\n\nWhat do you need?`,
    timestamp: new Date(),
    quickActions: [
      createQuickAction('Plan my day', 'open-plan-day'),
      createQuickAction('Wind down', 'open-wind-down')
    ]
  };
}

// ===== MAIN RESPONSE GENERATOR =====

/**
 * Build a comprehensive response for meta-questions about Jamie's knowledge
 */
function buildMetaQuestionResponse(stats: any, contactCount: number): string {
  const timeContext = getCurrentTimeContext();
  let energyStatus = 'normal productivity';
  if (timeContext.isLowEnergy) {
    energyStatus = 'your slow-start morning window (before 11am)';
  } else if (timeContext.isPeakFocus) {
    energyStatus = 'your peak focus window (12-3pm)';
  } else if (timeContext.isEndOfDay) {
    energyStatus = 'winding down time (after 6pm)';
  }

  return `I know quite a bit about you, Meredith! Here's what I have:

**Your Business:**
• ${MEREDITH_CONTEXT.business.name} - ${MEREDITH_CONTEXT.business.expertise}
• You help digital health teams embed empathy and co-design into product development
• ${MEREDITH_CONTEXT.business.positioning}

**Current Projects & Key Relationships:**
• **BiteLabs with Jason** - ${MEREDITH_CONTEXT.currentProjects.biteLabs}
  - Teaching PX courses, likely another in late Feb/early March
  - Deepening relationship, exploring programming opportunities
  
• **NHC PXI with Spencer** - ${MEREDITH_CONTEXT.currentProjects.nhcPxi}
  - HIGH PRIORITY relationship
  - Patient-centered co-design collaboration and curriculum development
  
• **Chronically Me with Sophie/The Chargies** - ${MEREDITH_CONTEXT.currentProjects.chronicallyMe}
  - Accelerator for young adults in digital health
  - Potential roles: strategic partner, curriculum creator, workshop facilitator
  
• **CPP Board** - ${MEREDITH_CONTEXT.currentProjects.cpp}
  - Supporting artists living with chronic pain
  - Annual planning, fundraising, programming
  
• **Connectome** - ${MEREDITH_CONTEXT.currentProjects.connectome}
• **Common Grounds** - ${MEREDITH_CONTEXT.currentProjects.commonGrounds}

**Your Energy & Work Style:**
• Not a morning person - slow start before ${MEREDITH_CONTEXT.energyPatterns.slowStartBefore}
• Peak focus: ${MEREDITH_CONTEXT.energyPatterns.peakFocusWindow} (best for deep work)
• Lighter tasks after: ${MEREDITH_CONTEXT.energyPatterns.lighterTasksAfter}
• Hard stop: ${MEREDITH_CONTEXT.energyPatterns.hardStop}
• Daily focused work goal: ${MEREDITH_CONTEXT.energyPatterns.taskTimeGoal}
• You manage chronic conditions - need spoon management and gentle pacing
• Struggle with perfectionism when starting tasks (I can help!)

**Content Expertise & Pillars:**
• **Co-Design**: Bringing patients in from the beginning, not just testing at the end
• **Patient Experience (PX)**: Full ecosystem - clinical, emotional, cognitive, logistical, financial
• **Empathy as Strategy**: Data tells WHAT, empathy tells WHY
• **Digital Health Strategy**: Landing paying clients, strengthening visibility through content

**Current Context (Right Now):**
• It's ${timeContext.currentTime} on ${timeContext.currentDate}
• You're in ${energyStatus}
• ${stats.activeTasks.length} active tasks (${stats.overdueTasks.length} overdue, ${stats.todayTasks.length} due today)
• ${stats.priorityTasks.length} priority-flagged tasks
• ${contactCount} contacts in your network

**Client Engagement Automation System:**
• ${MEREDITH_CONTEXT.engagementSystem.summary}
• **Architecture**: Forms Library (reusable templates) → Assemble Flow (LEGO-style sequences) → Draft Engagement (client-specific) → Preview → Send → Engagement Log (audit trail)
• **Key principles**: ${MEREDITH_CONTEXT.engagementSystem.principles}
• **Rules**: Forms are reusable, engagements are not. Nothing sent without preview. Admin approval required. All actions logged & timestamped.

**What I Can Actually Help With:**
• Help you write content - posts, emails, articles in your voice
• Answer questions about your tasks and contacts (what you have, not what you should do)
• Search the web for articles and research when you ask
• Draft outlines and content on co-design, PX, empathy topics
• Provide suggestions based on what page you're on

**What I Can't Do (being honest):**
• I can't see your calendar or schedule meetings
• I can't create tasks directly (but I can suggest what they should be)
• I can't read meeting notes or past conversation details
• I can't send emails or take actions on your behalf

What would you like help with?`;
}

/**
 * Build Jamie's system prompt with all her knowledge and personality
 */
function buildJamieSystemPrompt(
  currentPage: string,
  tasks: Task[],
  contacts: Contact[],
  scheduleSettings: PromptScheduleSettings,
  selectedItem?: { type: string; id: string; title: string }
): string {
  const stats = getTaskStats(tasks);
  const timeContext = getCurrentTimeContext();
  
  let timeContextStr = `Current time: ${timeContext.currentTime} on ${timeContext.currentDate}. `;
  if (timeContext.isLowEnergy) {
    timeContextStr += 'Time context: Morning slow-start window (before 11am) - user has low energy.';
  } else if (timeContext.isPeakFocus) {
    timeContextStr += 'Time context: Peak focus window (12-3pm) - best time for deep work.';
  } else if (timeContext.isEndOfDay) {
    timeContextStr += 'Time context: Near end of day (after 6pm) - winding down time. Her hard stop is at 6:30pm.';
  }
  
  // RETRIEVE RELEVANT MEMORIES
  const recentMemories = getRelevantMemories({
    type: 'all',
    timeframe: 'recent'
  });
  
  const contentPatterns = analyzeContentPatterns();
  
  let memoryContext = '';
  if (recentMemories.length > 0) {
    memoryContext = '\n\n# RECENT CONTEXT FROM MEMORY\n';
    recentMemories.slice(0, 5).forEach(memory => {
      const timeAgo = formatTimeAgo(memory.timestamp);
      memoryContext += `- ${timeAgo}: ${memory.summary}\n`;
    });
  }
  
  let contentInsights = '';
  if (contentPatterns && Array.isArray(contentPatterns.contentGaps) && contentPatterns.contentGaps.length > 0) {
    contentInsights = `\n\n# CONTENT INSIGHTS\n- Content gaps you haven't covered recently: ${contentPatterns.contentGaps.join(', ')}\n`;
  }
  
  return `You are Jamie, Meredith's AI planning assistant. You help her manage her schedule, tasks, contacts, and business.

# ⚠️ CRITICAL: HANDLING META-QUESTIONS (READ THIS FIRST!)
When Meredith asks ANY of these types of questions, you MUST answer directly and comprehensively:
- "what do you know about me?"
- "tell me about yourself" / "what can you do?"
- "what context do you have?"
- "what information do you have on me?"
- "tell me what you know"

❌ DO NOT:
- Give a canned response like "I'm here to help with tasks..."
- Redirect to offering task management
- Give a generic greeting
- Deflect the question

✅ DO:
- Actually LIST OUT the specific information you have about her
- Include: business name, expertise areas, current projects, key relationships, energy patterns, chronic illness needs, content pillars
- Show that you understand her full context by referencing SPECIFIC details
- Be comprehensive - she wants to see what you actually know

EXAMPLE GOOD RESPONSE to "what do you know about me?":
"I know quite a bit about you, Meredith! Here's what I have:

**Your Business:**
- Empower Health Strategies - patient experience consultant for digital health companies
- You help teams embed empathy and co-design into product development

**Current Projects & Key Relationships:**
- BiteLabs with Jason - teaching PX courses, deepening partnership
- NHC PXI with Spencer - HIGH PRIORITY, exploring patient-centered co-design collaboration  
- Chronically Me with Sophie/The Chargies - accelerator work, strategic partnerships
- CPP Board - supporting artists with chronic pain

**Your Energy & Work Style:**
- Not a morning person - slow start before 11am
- Peak focus: 12-3pm for deep work
- You manage chronic conditions and need spoon management
- Daily focused work goal: 4 hours
- Hard stop at 8pm

**Content Expertise:**
- Co-design (bringing patients in from the beginning)
- Patient Experience (full ecosystem approach)
- Empathy as Strategy (data tells WHAT, empathy tells WHY)

**Current Context:**
- You have ${stats.activeTasks.length} active tasks
- ${contacts.length} contacts in your network

What would you like to know more about?"

# YOUR PERSONALITY & VOICE
- Empathetic, human, confident, encouraging, clear, conversational
- "Meredith Real Talk" - thoughtful and nuanced, but said like a real person
- First person ("I"), never "we" or "our team"
- Clear over clever. Grounded over grandiose. Specific over vague.
- Strong first sentences. Concrete examples from real life.
- Acknowledge complex emotions (frustration, relief, grief, hope, complexity)

# BANNED PHRASES (NEVER USE)
- "nice-to-have", "in the evolving landscape", "is rooted in"
- "deep insights", "deeply" as filler, "unlock the power of"
- "buzzword", "let's face it", "let's be real"
- "it wasn't about X it was about Y", "embed/embedded" in branding
- "game-changing", "transforming healthcare at scale"
- Any motivational tone, corporate jargon, or patronizing "thought leader" clichés

# PREFERRED PHRASES
- "speak patient", "patient journey", "care continuum"
- "real-life constraints", "nuance", "connection"

# ABOUT MEREDITH
Business: ${MEREDITH_CONTEXT.business.name}
Expertise: ${MEREDITH_CONTEXT.business.expertise}
Positioning: ${MEREDITH_CONTEXT.business.positioning}

## Current Projects & Key Relationships
- **BiteLabs (Jason)**: ${MEREDITH_CONTEXT.currentProjects.biteLabs}
  - Deepening relationship with Jason
  - Exploring programming for fellows/alumni/faculty
  - Teaching another PX course (likely late Feb/early March)
  
- **CPP (Chronic Pain Project)**: ${MEREDITH_CONTEXT.currentProjects.cpp}
  - Board member role
  - Focus on annual planning, fundraising, programming
  - Supporting artists living with chronic pain
  
- **NHC PXI (Spencer)**: ${MEREDITH_CONTEXT.currentProjects.nhcPxi}
  - HIGH PRIORITY relationship
  - Exploring collaboration on patient-centered co-design
  - Curriculum development and advisory work
  - Patient Experience Innovation Center partnership
  
- **Chronically Me (Sophie/The Chargies)**: ${MEREDITH_CONTEXT.currentProjects.chronicallyMe}
  - Accelerator for young adults in digital health
  - Potential roles: strategic partner, curriculum creator, workshop facilitator
  - Excited about the vision and community
  
- **Connectome**: ${MEREDITH_CONTEXT.currentProjects.connectome}
- **Common Grounds**: ${MEREDITH_CONTEXT.currentProjects.commonGrounds}

## Energy Patterns
- Not a morning person - slow start before ${MEREDITH_CONTEXT.energyPatterns.slowStartBefore}
- Peak focus: ${MEREDITH_CONTEXT.energyPatterns.peakFocusWindow}
- Lighter tasks after: ${MEREDITH_CONTEXT.energyPatterns.lighterTasksAfter}
- Hard stop: ${MEREDITH_CONTEXT.energyPatterns.hardStop}
- Daily focused work goal: ${MEREDITH_CONTEXT.energyPatterns.taskTimeGoal}

## Chronic Illness Considerations
- Manages chronic conditions - needs spoon management
- Frequent medical appointments
- Benefits from gentle pacing and rough drafts over perfectionism
- Struggles with starting tasks due to perfectionism
- Needs acknowledgment of energy limits and real-life constraints

# MEREDITH'S CONTENT PILLARS & EXPERTISE

## Co-Design
- **Core belief**: Real co-design means bringing patients in from the beginning, not testing at the end
- **Value prop**: Treating patients as equal partners who shape product direction, not just validate assumptions
- **Why it works**: Catches blind spots early, aligns with how care really works vs. how we imagine it
- **How to start**: Identify one patient pain point → Find 3-5 patients living that experience → Ask them about workarounds

## Patient Experience (PX)
- **Not just**: Satisfaction scores or nice interfaces
- **Actually is**: Understanding what care looks and feels like for people using your solution
- **Full ecosystem**: Clinical, emotional, cognitive, logistical, and financial dimensions
- **Reality**: Patients are coordinating care, advocating, managing fear, fitting everything into daily life
- **Impact**: Products that account for this become trusted companions; products that ignore it feel like extra work
- **Meredith's approach**: Help teams see the full picture—where product enters the journey, what else patients are managing, how to design around real context

## Empathy as Strategy
- **Not soft**: Empathy is strategic—leads to better adoption, trust, retention
- **Deep understanding**: When teams understand what patients feel and experience, they make different decisions
- **Data vs. empathy**: Data tells you WHAT patients do, empathy tells you WHY
- **Building it in**: Regular patient conversations, shadowing care journeys, listening to workarounds

## Digital Health Strategy
- Landing paying clients (funded digital health companies, accelerators, incubators)
- Strengthening visibility through content (LinkedIn, Substack)
- Building strategic partnerships

## Client Engagement Automation System
**Summary**: ${MEREDITH_CONTEXT.engagementSystem.summary}

**Architecture (7 Components)**:
1. **Forms Library** - ${MEREDITH_CONTEXT.engagementSystem.architecture.formsLibrary}
2. **Assemble Flow** - ${MEREDITH_CONTEXT.engagementSystem.architecture.assembleFlow}
3. **Draft Engagement** - ${MEREDITH_CONTEXT.engagementSystem.architecture.draftEngagement}
4. **Preview Engagement** - ${MEREDITH_CONTEXT.engagementSystem.architecture.previewEngagement}
5. **Send Engagement** - ${MEREDITH_CONTEXT.engagementSystem.architecture.sendEngagement}
6. **Engagement Log** - ${MEREDITH_CONTEXT.engagementSystem.architecture.engagementLog}
7. **Contact Engagement Tab** - ${MEREDITH_CONTEXT.engagementSystem.architecture.contactEngagementTab}

**Key Rules**:
${Array.isArray(MEREDITH_CONTEXT.engagementSystem.keyRules) && MEREDITH_CONTEXT.engagementSystem.keyRules.length > 0 
  ? MEREDITH_CONTEXT.engagementSystem.keyRules.map(rule => `- ${rule}`).join('\n') 
  : 'Not configured'}

**Guiding Principles**: ${MEREDITH_CONTEXT.engagementSystem.principles}

# CURRENT CONTEXT
Page: ${currentPage}
${selectedItem ? `Selected item: ${selectedItem.type} - "${selectedItem.title}"` : ''}
${timeContextStr}

## Task Status
- Active tasks: ${stats.activeTasks.length}
- Overdue tasks: ${stats.overdueTasks.length}
- Due today: ${stats.todayTasks.length}
- Priority flagged: ${stats.priorityTasks.length}

## Network
- Total contacts: ${contacts.length}
${(() => {
  // Check for pending contact suggestions from calendar
  try {
    const stored = localStorage.getItem('pending_contact_suggestions');
    if (stored) {
      const pending = JSON.parse(stored);
      if (pending.length > 0) {
        return `\n⚠️ PENDING: ${pending.length} calendar ${pending.length === 1 ? 'attendee' : 'attendees'} not in contacts: ${pending.map((p: any) => p.name || p.email).join(', ')}. If asked, offer to add them.`;
      }
    }
  } catch (e) {
    // Ignore
  }
  return '';
})()}
${memoryContext}${contentInsights}

# SCHEDULING & ROUTINE PREFERENCES

## Daily Structure
Every day is anchored by four key touchpoints:
1. **Start My Day** wizard (flexible start time - could be 11 AM, 1 PM, or based on morning schedule)
2. **AM Admin** routine (immediately follows Start My Day, unless early meeting conflicts)
3. **PM Admin** routine (end-of-day wrap-up)
4. **Wind Down** wizard (final touchpoint before day ends)

**CRITICAL**: The day doesn't "start" until Start My Day wizard is completed. This timing is flexible based on morning commitments, especially medical appointments.

## Buffer Requirements
${scheduleSettings.buffers.notes}
- Between meetings: ${scheduleSettings.buffers.betweenMeetings}
- Before first meeting: ${scheduleSettings.buffers.beforeFirstMeeting}
- After last meeting: ${scheduleSettings.buffers.afterLastMeeting}
- Travel time: ${scheduleSettings.buffers.travelTime}

## Meeting Preferences
${scheduleSettings.meetingPreferences.notes}
- **Maximum per day**: ${scheduleSettings.meetingPreferences.maxPerDay}
- **Preferred times**: ${scheduleSettings.meetingPreferences.preferredTimes}
- **Avoid times**: ${scheduleSettings.meetingPreferences.avoidTimes}
- **Default duration**: ${scheduleSettings.meetingPreferences.defaultDuration}
- **Back-to-back limit**: ${scheduleSettings.meetingPreferences.backToBackLimit}

## Time Blocking & Energy
${scheduleSettings.energyManagement.notes}
- **Focus time minimum**: ${scheduleSettings.timeBlockingRules.focusTimeMinimum}
- **Deep work windows**: ${scheduleSettings.timeBlockingRules.deepWorkWindows}
- **Protected hours**: ${scheduleSettings.timeBlockingRules.protectedHours}
- **Peak energy hours**: ${scheduleSettings.energyManagement.peakHours}
- **Low energy hours**: ${scheduleSettings.energyManagement.lowEnergyHours}
- **Break frequency**: ${scheduleSettings.energyManagement.breakFrequency}

## Priority Hierarchy (When Conflicts Arise)
${scheduleSettings.autoDeclineRules.priorityRules}

**When displacing a routine**: Always suggest rescheduling it to later in the day (never skip entirely)

## Jamie's Scheduling Decision Framework
${scheduleSettings.jamieGuidance.generalPrinciples}

${scheduleSettings.jamieGuidance.decisionMakingFramework}

## Special Instructions
${scheduleSettings.jamieGuidance.specialInstructions}

## Scheduling Constraints
${scheduleSettings.schedulingConstraints.notes}
- **Working hours**: ${scheduleSettings.schedulingConstraints.workingHours}
- **Timezone**: ${scheduleSettings.schedulingConstraints.timezone}
- **Flexibility rules**: ${scheduleSettings.schedulingConstraints.flexibilityRules}
- **Override conditions**: ${scheduleSettings.schedulingConstraints.overrideConditions}

# JAMIE'S SCHEDULING INTELLIGENCE (READ-ONLY - AVAILABLE NOW!)
You now have access to Meredith's Google Calendar and can answer scheduling questions!

## Meredith's Meeting Availability Rules
- **Meeting Days**: Wednesdays and Thursdays ONLY
- **Meeting Window**: 1:00 PM - 3:30 PM Eastern Time
- **Meeting Duration**: 30 minutes (standard)
- **Buffer After Meetings**: 30 minutes (for recovery/notes)
- **Maximum Meetings Per Day**: 2
- **Timezone**: America/New_York (Eastern Time)

## What You Can Do
✅ Check her availability ("When's my next opening?" / "Do I have any slots this week?")
✅ Count available slots ("How many meetings can I fit this week?")
✅ Check specific days ("Am I free Thursday?" / "Can I fit another meeting tomorrow?")
✅ Explain her scheduling constraints ("Why can't I schedule on Monday?")
✅ Suggest optimal times based on her energy patterns (2pm is her peak focus window)

## How Slots Work
- Each slot = 30 min meeting + 30 min buffer = 60 minutes total
- Possible slots: 1:00-1:30pm, 2:00-2:30pm (and sometimes 3:00-3:30pm if no buffer needed after)
- Maximum weekly capacity: 4 meetings (2 days × 2 meetings max)
- If she has 1 meeting on Wednesday, she can fit 1 more that day

## Strategic Guidance
When helping with scheduling:
- **Prioritize Wednesday 2:00pm**: Her peak clarity/focus window, no meetings yet
- **Avoid back-to-back when possible**: She needs recovery time between meetings
- **High-stakes meetings**: Recommend 2pm slot (peak energy) on a day with no other meetings
- **Quick check-ins**: 1pm or 3pm slots are fine, less energy-intensive
- **Thursday caution**: If she already has 2 meetings on Wednesday, remind her she'll be low on energy Thursday

## Example Responses
"You have 3 open slots this week: Wednesday 1pm, Wednesday 2pm, and Thursday 2pm. For the NHC team call (high-stakes), I'd recommend Wednesday at 2pm—that's your peak focus window and you'd have no other meetings that day."

"You're already at your 2-meeting max for Thursday (Spencer at 1pm, Sarah at 2pm). Want to move one to Wednesday? You have both slots open."

# YOUR CAPABILITIES
You can help with:
- **Creating tasks directly** - You can now CREATE tasks, not just suggest them! Parse natural language and create actual tasks in her system
- **Checking calendar availability** - Answer questions like "When's my next opening?", "Do I have slots this week?", "Can I fit another meeting?"
- Planning her day with time blocking (acknowledge energy patterns!)
- Managing tasks and priorities (help overcome perfectionism paralysis)
- Finding and organizing contacts
- Wind down at end of day
- Answering questions about schedule and projects
- Writing outreach emails (you know templates for Spencer, Jason, Sophie)
- Breaking down complex tasks into tiny first steps
- Providing meeting prep and follow-up
- Drafting LinkedIn posts and articles in Meredith's voice
- Creating content outlines on co-design, PX, empathy topics
- Managing client engagements through the Forms → Flows → Engagement Wizard system

# JAMIE'S TASK INTELLIGENCE (WRITE ACCESS - AVAILABLE NOW!)
You can now CREATE tasks directly in Meredith's system! No more just suggesting—you can actually DO it.

## What You Can Do:
✅ Create single tasks from natural language
✅ Create multiple tasks from one request ("I need to X, Y, and Z")
✅ Auto-detect task type (outreach, client work, admin, scheduling, etc.)
✅ Parse contact names and auto-assign
✅ Extract time estimates ("email Spencer (10 mins)")
✅ Parse due dates ("by tomorrow", "this week", "next Monday")
✅ Detect priority ("urgent", "ASAP")

## How to Parse Task Requests:

### Pattern 1: Simple Creation
"Create a task to email Spencer"
→ Creates 1 task: "Email Spencer" (taskType: outreach, contact: Spencer if found)

### Pattern 2: Multiple Tasks
"I need to call Jason, email Sarah, and schedule Sophie"
→ Creates 3 tasks, each with appropriate task type

### Pattern 3: With Metadata
"Remind me to follow up with the NHC team by Friday (30 mins)"
→ Creates task with estimatedTime: 30, dueDate: next Friday

### Pattern 4: Complex Request
"Add tasks for Spencer follow-up: send email (10 mins), schedule call using his link (15 mins), draft proposal outline (45 mins)"
→ Creates 3 tasks, assigns Spencer as contact, sets time estimates, detects task types

## Task Type Auto-Detection:
Based on keywords in the title:
- **Outreach**: "email", "reach out", "follow up", "touch base"
- **Networking**: "coffee chat", "intro call", "connect"
- **Client Work**: "deliverable", "draft proposal", "project"
- **Admin**: "organize", "update", "file", "paperwork"
- **Scheduling (their link)**: "use their link", "his link", "Calendly"
- **Scheduling (my link)**: "send my link", "share my availability"
- **Scheduling (email)**: "email to schedule", "scheduling email"
- **CPP**: "chronic pain project", "board"
- **Personal**: "pharmacy", "doctor", "medical"

## Contact Auto-Assignment:
If task includes contact name (e.g., "email Spencer"), automatically:
1. Search contacts for matching name
2. Assign contact to task if found
3. Continue even if contact not found (task still created)

## Response Format When Creating Tasks:
Keep it simple and confirmatory:

"✓ Created 3 tasks:
• Email Spencer (10 mins) - Outreach
• Call Jason - Networking  
• Draft proposal for NHC (45 mins) - Client Work

All set to go!"

## Permission Level: LOW-RISK (Execute Immediately)
Creating tasks = safe action, no confirmation needed. Just do it and confirm.

## Edge Cases:
- If contact name mentioned but not in system: Create task anyway, leave contact blank
- If time estimate missing: Let task be created without estimate
- If ambiguous task type: Default to most likely (or leave blank if truly unclear)
- If bulk creation (5+ tasks): Create all of them—she asked for it!

# QUICK ACTIONS
When helpful, suggest quick actions by mentioning them naturally:
- "Plan my day" - opens AM wizard
- "Wind down" - opens PM wizard  
- "View tasks" - navigates to tasks page

# RESPONSE STYLE
- Keep responses SHORT and DIRECT by default (2-4 sentences)
- Only go longer when the user asks for detail or explanation
- Use bullet points for lists
- Be warm but not overly chatty
- Acknowledge her reality (chronic illness, energy limits, perfectionism)
- Adjust tone based on time of day and energy context
- When she's stuck on starting, offer the smallest possible first step
- When discussing partnerships (Spencer/Jason/Sophie), reference specific context
- When helping with content, offer hooks/angles from her expertise pillars
- Reference relevant memories when appropriate to show continuity

# IMPORTANT: HANDLING META-QUESTIONS
When Meredith asks questions like "what do you know about me?" or "tell me about yourself" or "what context do you have?":
- DO NOT give a canned response or redirect to a task
- DO answer the question directly and comprehensively
- List out the specific information you have about her: business, projects, people, energy patterns, expertise
- Show that you're truly aware of her full context
- This builds trust and demonstrates your understanding`;
}

/**
 * Perform web search using Brave Search API
 */
export async function performWebSearch(
  query: string,
  count: number = 5,
  freshness?: 'pd' | 'pw' | 'pm' // past day, past week, past month
): Promise<{
  results: Array<{
    title: string;
    url: string;
    description: string;
    age?: string;
    publishedDate?: string;
    siteName?: string;
  }>;
  error?: string;
}> {
  try {
    const { projectId, publicAnonKey } = await import('./supabase/info');
    
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a89809a8/web-search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({
        query,
        count,
        freshness
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Web search API error:', errorData);
      return {
        results: [],
        error: errorData.error || 'Failed to perform web search'
      };
    }

    const data = await response.json();
    return {
      results: data.results || []
    };
  } catch (error) {
    console.error('Error performing web search:', error);
    return {
      results: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Detect if user message is requesting task creation/management
 */
export function detectTaskIntent(message: string): {
  isTaskRequest: boolean;
  action?: 'create' | 'update' | 'complete' | 'delete' | 'list';
  tasks?: Array<{
    title: string;
    estimatedTime?: number;
    dueDate?: string;
    contactName?: string;
    priority?: 'low' | 'medium' | 'high';
  }>;
} {
  // Safety check: ensure message is a string
  if (typeof message !== 'string') {
    console.error('detectTaskIntent received non-string message:', message);
    return { isTaskRequest: false };
  }
  
  const lowerMsg = message.toLowerCase().trim();
  
  // Task creation patterns
  const createPatterns = [
    /(?:create|add|make|new).*task/i,
    /(?:i need to|need to|should|have to).*(?:and|,)/i, // "I need to X, Y, and Z"
    /(?:remind me to|remember to)/i,
    /(?:tasks?|to-?dos?).*(?:for|about|regarding)/i,
  ];
  
  // Task management patterns
  const completePatterns = [
    /(?:mark|set|change).*(?:as|to).*(?:done|complete|finished)/i,
    /(?:complete|finish|did).*task/i,
  ];
  
  const updatePatterns = [
    /(?:change|update|move|reschedule).*task/i,
    /(?:assign|give).*(?:task|to-?do).*to/i,
  ];
  
  const deletePatterns = [
    /(?:delete|remove|cancel).*task/i,
  ];
  
  const listPatterns = [
    /(?:show|list|what are|tell me).*(?:my|all).*tasks/i,
    /what.*(?:on my|to-?do|task).*(?:list|today)/i,
  ];
  
  // Detect action type
  let action: 'create' | 'update' | 'complete' | 'delete' | 'list' | undefined;
  
  if (completePatterns.some(p => p.test(message))) {
    action = 'complete';
  } else if (updatePatterns.some(p => p.test(message))) {
    action = 'update';
  } else if (deletePatterns.some(p => p.test(message))) {
    action = 'delete';
  } else if (listPatterns.some(p => p.test(message))) {
    action = 'list';
  } else if (createPatterns.some(p => p.test(message))) {
    action = 'create';
  }
  
  if (!action) {
    return { isTaskRequest: false };
  }
  
  // For CREATE actions, parse task details
  if (action === 'create') {
    const tasks = parseTasksFromMessage(message);
    return {
      isTaskRequest: true,
      action: 'create',
      tasks
    };
  }
  
  return {
    isTaskRequest: true,
    action
  };
}

/**
 * Parse tasks from natural language message
 */
function parseTasksFromMessage(message: string): Array<{
  title: string;
  estimatedTime?: number;
  dueDate?: string;
  contactName?: string;
  priority?: 'low' | 'medium' | 'high';
}> {
  const tasks: Array<any> = [];
  
  // Remove create/add prefixes
  let cleanedMsg = message
    .replace(/^(?:create|add|make|new)\s+(?:a\s+)?(?:task|tasks|to-?do|to-?dos)\s+(?:to|for)?\s*/i, '')
    .replace(/^(?:i need to|need to|should|have to)\s*/i, '')
    .replace(/^(?:remind me to|remember to)\s*/i, '');
  
  // Split by common delimiters
  const taskParts = cleanedMsg.split(/(?:,\s*(?:and\s+)?|\s+and\s+)/);
  
  for (let part of taskParts) {
    part = part.trim();
    if (!part || part.length < 3) continue;
    
    // Extract time estimate
    const timeMatch = part.match(/\((\d+)\s*(?:min|mins|minutes?|hours?|hrs?)\)/i);
    let estimatedTime: number | undefined;
    
    if (timeMatch) {
      const value = parseInt(timeMatch[1]);
      const unit = timeMatch[0].toLowerCase();
      estimatedTime = unit.includes('hour') || unit.includes('hr') ? value * 60 : value;
      part = part.replace(/\s*\(\d+\s*(?:min|mins|minutes?|hours?|hrs?)\)\s*/i, '');
    }
    
    // Extract contact name
    const contactMatch = part.match(/(?:email|call|message|contact|reach out to|follow up with|schedule|meet with)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
    const contactName = contactMatch ? contactMatch[1] : undefined;
    
    // Extract priority
    let priority: 'low' | 'medium' | 'high' | undefined;
    if (/urgent|asap|important|high priority/i.test(part)) {
      priority = 'high';
      part = part.replace(/\s*\((?:urgent|asap|important|high priority)\)\s*/i, '');
    }
    
    // Extract due date
    let dueDate: string | undefined;
    const today = new Date();
    
    if (/today/i.test(part)) {
      dueDate = today.toISOString().split('T')[0];
      part = part.replace(/\s*(?:by|for)?\s*today\s*/i, '');
    } else if (/tomorrow/i.test(part)) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      dueDate = tomorrow.toISOString().split('T')[0];
      part = part.replace(/\s*(?:by|for)?\s*tomorrow\s*/i, '');
    } else if (/this week/i.test(part)) {
      const endOfWeek = new Date(today);
      const daysUntilSunday = 7 - today.getDay();
      endOfWeek.setDate(endOfWeek.getDate() + daysUntilSunday);
      dueDate = endOfWeek.toISOString().split('T')[0];
      part = part.replace(/\s*(?:by|for)?\s*this week\s*/i, '');
    } else if (/next week/i.test(part)) {
      const endOfNextWeek = new Date(today);
      const daysUntilNextSunday = 7 - today.getDay() + 7;
      endOfNextWeek.setDate(endOfNextWeek.getDate() + daysUntilNextSunday);
      dueDate = endOfNextWeek.toISOString().split('T')[0];
      part = part.replace(/\s*(?:by|for)?\s*next week\s*/i, '');
    } else {
      // Check for specific day names (Monday, Tuesday, etc.)
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayMatch = part.match(/(?:by|for|due|on)?\s*(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
      
      if (dayMatch) {
        const targetDayName = dayMatch[1].toLowerCase();
        const targetDayIndex = dayNames.indexOf(targetDayName);
        const currentDayIndex = today.getDay();
        
        // Calculate days until next occurrence of target day
        let daysUntilTarget = targetDayIndex - currentDayIndex;
        if (daysUntilTarget <= 0) {
          daysUntilTarget += 7; // Move to next week
        }
        
        const targetDate = new Date(today);
        targetDate.setDate(targetDate.getDate() + daysUntilTarget);
        dueDate = targetDate.toISOString().split('T')[0];
        
        part = part.replace(/\s*(?:by|for|due|on)?\s*(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s*/i, '');
      }
    }
    
    // Clean up title
    const title = part
      .replace(/^\s*-\s*/, '')
      .replace(/^\s*\d+\.\s*/, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (title.length >= 3) {
      tasks.push({
        title,
        estimatedTime,
        dueDate,
        contactName,
        priority
      });
    }
  }
  
  return tasks;
}

/**
 * Create tasks via server API
 */
export async function createTasksViaJamie(
  tasks: Array<{
    title: string;
    estimatedTime?: number;
    dueDate?: string;
    contactName?: string;
    priority?: 'low' | 'medium' | 'high';
  }>,
  contacts: Contact[]
): Promise<{ success: boolean; createdTasks?: any[]; error?: string }> {
  try {
    const createdTasks: any[] = [];
    
    console.log('🎯 createTasksViaJamie called with:', { tasksCount: tasks.length, contactsCount: contacts.length });
    
    for (const taskData of tasks) {
      console.log('📝 Processing task:', taskData);
      
      // Find contact by name if specified
      let contact: { id: string; name: string } | undefined;
      if (taskData.contactName) {
        console.log('🔍 Looking for contact:', taskData.contactName);
        
        // Find all matching contacts
        const matchingContacts = contacts.filter(c => {
          // Safety check: ensure c.name and taskData.contactName are strings
          if (!c || typeof c.name !== 'string' || !taskData.contactName) {
            return false;
          }
          const contactNameLower = c.name.toLowerCase();
          const searchNameLower = taskData.contactName.toLowerCase();
          return contactNameLower.includes(searchNameLower) || searchNameLower.includes(contactNameLower);
        });
        
        // If multiple contacts match, we need disambiguation
        if (matchingContacts.length > 1) {
          const contactNames = matchingContacts.map(c => c.name).join(', ');
          return {
            success: false,
            error: `Multiple contacts found named "${taskData.contactName}": ${contactNames}. Please specify which one you mean (e.g., use full name).`
          };
        }
        
        // Single match - use it
        if (matchingContacts.length === 1) {
          contact = {
            id: matchingContacts[0].id,
            name: matchingContacts[0].name
          };
        }
      }
      
      // Auto-detect task type
      const taskTypeModule = await import('./taskTypes');
      const taskType = taskTypeModule.detectTaskType(taskData.title);
      
      // Build task object
      const task = {
        title: taskData.title,
        status: 'toDo',
        estimatedTime: taskData.estimatedTime,
        dueDate: taskData.dueDate,
        contact,
        priority: taskData.priority,
        taskType,
        createdAt: new Date().toISOString()
      };
      
      console.log('📤 Sending task to server:', task);
      
      // Create via server API
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a89809a8/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(task)
      });
      
      console.log('📥 Server response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Failed to create task:', errorText);
        continue;
      }
      
      const createdTask = await response.json();
      console.log('✅ Task created successfully:', createdTask);
      createdTasks.push(createdTask);
    }
    
    console.log(`✅ All tasks processed. Created ${createdTasks.length} out of ${tasks.length}`);
    
    return {
      success: true,
      createdTasks
    };
  } catch (error) {
    console.error('Error creating tasks:', error);
    return {
      success: false,
      error: String(error)
    };
  }
}

/**
 * Detect if user message is requesting scheduling/availability information
 */
export function detectSchedulingIntent(message: string): {
  isSchedulingRequest: boolean;
  queryType?: 'check_availability' | 'next_opening' | 'specific_time' | 'week_overview';
  timeframe?: 'today' | 'tomorrow' | 'this_week' | 'next_week' | 'this_month';
  duration?: number;
} {
  // Safety check: ensure message is a string
  if (typeof message !== 'string') {
    return { isSchedulingRequest: false };
  }
  
  const lowerMsg = message.toLowerCase().trim();
  
  // Scheduling trigger patterns
  const schedulingPatterns = [
    /(?:when(?:'s| is)|what(?:'s| is)).*(?:my|next|available|availability|opening|free)/i,
    /(?:do i have|any).*(?:openings?|availability|free time|slots?)/i,
    /(?:can i|could i).*(?:fit|schedule|add).*(?:meeting|call|appointment)/i,
    /(?:show|check|what are).*(?:my|available).*(?:slots?|times?|openings?)/i,
    /(?:am i|are you).*(?:free|available|open)/i,
    /(?:how many|count).*(?:meetings?|slots?|openings?)/i,
  ];
  
  const isSchedulingRequest = schedulingPatterns.some(pattern => pattern.test(message));
  
  if (!isSchedulingRequest) {
    return { isSchedulingRequest: false };
  }
  
  // Determine query type
  let queryType: 'check_availability' | 'next_opening' | 'specific_time' | 'week_overview' = 'check_availability';
  
  if (lowerMsg.includes('next') && (lowerMsg.includes('opening') || lowerMsg.includes('available') || lowerMsg.includes('slot'))) {
    queryType = 'next_opening';
  } else if (lowerMsg.includes('how many') || lowerMsg.includes('count') || lowerMsg.includes('left')) {
    queryType = 'week_overview';
  } else if (/(?:today|tomorrow|monday|tuesday|wednesday|thursday|friday).*at.*\d/i.test(lowerMsg)) {
    queryType = 'specific_time';
  }
  
  // Extract timeframe
  let timeframe: 'today' | 'tomorrow' | 'this_week' | 'next_week' | 'this_month' = 'this_week';
  
  if (lowerMsg.includes('today')) {
    timeframe = 'today';
  } else if (lowerMsg.includes('tomorrow')) {
    timeframe = 'tomorrow';
  } else if (lowerMsg.includes('this week')) {
    timeframe = 'this_week';
  } else if (lowerMsg.includes('next week')) {
    timeframe = 'next_week';
  } else if (lowerMsg.includes('this month') || lowerMsg.includes('next month')) {
    timeframe = 'this_month';
  }
  
  // Extract duration if specified (defaults to 30 minutes)
  const durationMatch = message.match(/(\d+)\s*(?:min|minute|hour)/i);
  let duration = 30; // default
  if (durationMatch) {
    const value = parseInt(durationMatch[1], 10);
    if (message.match(/hour/i)) {
      duration = value * 60;
    } else {
      duration = value;
    }
  }
  
  return {
    isSchedulingRequest: true,
    queryType,
    timeframe,
    duration
  };
}

/**
 * Check calendar availability for Jamie's scheduling intelligence
 */
export async function checkCalendarAvailability(
  timeframe: 'today' | 'tomorrow' | 'this_week' | 'next_week' | 'this_month',
  duration: number = 30
): Promise<{
  availableSlots: any[];
  config: any;
  error?: string;
}> {
  try {
    // Calculate date range based on timeframe
    const now = new Date();
    const startDate = new Date(now);
    let endDate = new Date(now);
    
    // Set time to start of day in Eastern Time
    startDate.setHours(0, 0, 0, 0);
    
    switch (timeframe) {
      case 'today':
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'tomorrow':
        startDate.setDate(startDate.getDate() + 1);
        endDate.setDate(endDate.getDate() + 1);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'this_week':
        // Rest of this week
        const daysUntilSunday = 7 - now.getDay();
        endDate.setDate(endDate.getDate() + daysUntilSunday);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'next_week':
        // Next full week (Monday-Sunday)
        const daysUntilNextMonday = (8 - now.getDay()) % 7 || 7;
        startDate.setDate(startDate.getDate() + daysUntilNextMonday);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'this_month':
        // Rest of this month
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
    }
    
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a89809a8/jamie/check-availability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        duration
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return {
        availableSlots: [],
        config: {},
        error: errorData.message || errorData.error || 'Failed to check availability'
      };
    }
    
    const data = await response.json();
    return {
      availableSlots: data.availableSlots || [],
      config: data.config || {},
      error: undefined
    };
  } catch (error) {
    console.error('Error checking calendar availability:', error);
    return {
      availableSlots: [],
      config: {},
      error: 'Failed to check calendar availability'
    };
  }
}

/**
 * Detect if user message is requesting a web search
 */
export function detectWebSearchIntent(message: string): {
  isSearchRequest: boolean;
  searchQuery?: string;
  count?: number;
  freshness?: 'pd' | 'pw' | 'pm';
} {
  // Safety check: ensure message is a string
  if (typeof message !== 'string') {
    return { isSearchRequest: false };
  }
  
  const lowerMsg = message.toLowerCase().trim();
  
  // Search trigger patterns
  const searchPatterns = [
    /web\s+search/i,  // Direct "web search" command
    /(?:find|search|look\s+for|get\s+me|show\s+me).*(?:articles?|posts?|pieces?|content|research|information|news)/i,
    /(?:what(?:'s|\s+is)?\s+new|recent|latest).*(?:on|about|in|regarding)/i,
    /(?:articles?|posts?|research|news).*(?:about|on|regarding)/i,
  ];
  
  const isSearchRequest = searchPatterns.some(pattern => pattern.test(message));
  
  if (!isSearchRequest) {
    return { isSearchRequest: false };
  }
  
  // Extract count if specified
  const countMatch = message.match(/(\d+)\s*(?:articles?|posts?|pieces?|results?)/i);
  const count = countMatch ? parseInt(countMatch[1], 10) : 5;
  
  // Extract freshness/time filter
  let freshness: 'pd' | 'pw' | 'pm' | undefined;
  if (lowerMsg.includes('today') || lowerMsg.includes('past day')) {
    freshness = 'pd';
  } else if (lowerMsg.includes('this week') || lowerMsg.includes('past week') || lowerMsg.includes('last week')) {
    freshness = 'pw';
  } else if (lowerMsg.includes('this month') || lowerMsg.includes('past month') || lowerMsg.includes('last month') || lowerMsg.includes('recent')) {
    freshness = 'pm';
  }
  
  // Extract the actual search query (remove the command words)
  let searchQuery = message
    .replace(/^(?:find|search|look\s+for|get\s+me|show\s+me)\s+/i, '')
    .replace(/(?:\d+\s*)?(?:articles?|posts?|pieces?|results?)\s+(?:on|about|regarding)\s+/i, '')
    .replace(/(?:from|in)\s+(?:the\s+)?(?:past|last)\s+(?:day|week|month)/i, '')
    .trim();
  
  return {
    isSearchRequest: true,
    searchQuery,
    count: Math.min(count, 10), // Cap at 10
    freshness
  };
}

/**
 * Generate Jamie's response using OpenAI
 */
export async function generateJamieResponse(
  userMessage: string,
  currentPage: string,
  tasks: Task[],
  contacts: Contact[],
  selectedItem?: { type: string; id: string; title: string },
  conversationHistory: ChatMessage[] = []
): Promise<ChatMessage> {
  // Safety check: ensure userMessage is a string
  if (typeof userMessage !== 'string') {
    console.error('generateJamieResponse received non-string userMessage:', userMessage);
    return {
      id: `msg-${Date.now()}`,
      sender: 'jamie',
      text: "I didn't quite catch that. Can you try again?",
      timestamp: new Date(),
      quickActions: []
    };
  }
  
  // SPECIAL HANDLING: Detect meta-questions about Jamie's knowledge/context
  const lowerMsg = userMessage.toLowerCase().trim();
  const isMetaQuestion = 
    lowerMsg.includes('what do you know about me') ||
    lowerMsg.includes('what do you know') ||
    lowerMsg.includes('tell me about yourself') ||
    lowerMsg.includes('what can you do') ||
    lowerMsg.includes('what context do you have') ||
    lowerMsg.includes('what information do you have') ||
    lowerMsg === 'tell me what you know';
  
  if (isMetaQuestion) {
    // Instead of sending to AI, construct a direct response from MEREDITH_CONTEXT
    const stats = getTaskStats(tasks);
    const response = buildMetaQuestionResponse(stats, contacts.length);
    
    return {
      id: `msg-${Date.now()}`,
      sender: 'jamie',
      text: response,
      timestamp: new Date(),
      quickActions: []
    };
  }
  
  // Load schedule settings for Jamie's context
  const scheduleRules = await loadScheduleSettings();
  const scheduleSettings = toPromptScheduleSettings(scheduleRules);
  
  // Prepare context for new honest prompt
  const stats = getTaskStats(tasks);
  const timeContext = getCurrentTimeContext();
  
  // RETRIEVE RELEVANT MEMORIES
  const recentMemories = getRelevantMemories({
    type: 'all',
    timeframe: 'recent'
  });
  
  const contentPatterns = analyzeContentPatterns();
  
  let memoryContext = '';
  if (recentMemories.length > 0) {
    memoryContext = '\n\n# RECENT CONTEXT FROM MEMORY\n';
    recentMemories.slice(0, 5).forEach(memory => {
      const timeAgo = formatTimeAgo(memory.timestamp);
      memoryContext += `- ${timeAgo}: ${memory.summary}\n`;
    });
  }
  
  let contentInsights = '';
  if (contentPatterns && Array.isArray(contentPatterns.contentGaps) && contentPatterns.contentGaps.length > 0) {
    contentInsights = `\n\n# CONTENT INSIGHTS\n- Content gaps you haven't covered recently: ${contentPatterns.contentGaps.join(', ')}\n`;
  }
  
  // Use the new honest system prompt
  const { buildHonestJamieSystemPrompt } = await import('./jamieSystemPrompt_New');
  const systemPrompt = buildHonestJamieSystemPrompt(
    currentPage, 
    tasks, 
    contacts,
    stats,
    timeContext,
    memoryContext,
    contentInsights
  );
  
  try {
    // Build conversation history for OpenAI (last 10 messages for context)
    const recentHistory = conversationHistory.slice(-10);
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt }
    ];
    
    // Add recent conversation history
    recentHistory.forEach(msg => {
      if (msg.sender === 'user') {
        messages.push({ role: 'user', content: msg.text });
      } else if (msg.sender === 'jamie') {
        messages.push({ role: 'assistant', content: msg.text });
      }
    });
    
    // Add current user message
    messages.push({ role: 'user', content: userMessage });
    
    // Call Jamie endpoint on our server (which proxies to OpenAI)
    const { projectId, publicAnonKey } = await import('./supabase/info');
    
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a89809a8/jamie/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({
        messages
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Jamie API error:', errorData);
      throw new Error(`Jamie API error: ${response.statusText}`);
    }

    const data = await response.json();
    const jamieText = data.choices[0].message.content;

    // Extract quick actions from response if Jamie mentions them
    const quickActions = extractQuickActions(jamieText);
    
    // SAVE TO MEMORY: Detect if this conversation should be remembered
    saveConversationToMemory(userMessage, jamieText, currentPage, selectedItem);

    return {
      id: `msg-${Date.now()}`,
      sender: 'jamie',
      text: jamieText,
      timestamp: new Date(),
      quickActions
    };
  } catch (error) {
    console.error('Error generating Jamie response:', error);
    
    // Check if this is a quota error
    const errorMsg = error instanceof Error ? error.message : String(error);
    const isQuotaError = errorMsg.includes('quota') || errorMsg.includes('insufficient_quota') || errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED');
    const isApiKeyError = errorMsg.includes('API key not configured') || errorMsg.includes('GEMINI_API_KEY') || errorMsg.includes('API_KEY_INVALID');
    
    if (isApiKeyError) {
      return {
        id: `msg-${Date.now()}`,
        sender: 'jamie',
        text: "I need a Gemini API key to access my full AI capabilities.\n\n**To set up (100% free):**\n1. Get a free API key at https://aistudio.google.com/app/apikey\n2. Add it to Supabase secrets as: GEMINI_API_KEY\n3. Free tier includes 1,500 requests/day - plenty for personal use!\n\n**In the meantime**, I can still help with:\n• Viewing and organizing tasks\n• Finding contacts\n• Opening plan/wind-down workflows\n• Basic schedule questions\n\nWhat can I help with?",
        timestamp: new Date(),
        quickActions: [
          createQuickAction('Plan my day', 'open-plan-day'),
          createQuickAction('View tasks', 'view-task'),
          createQuickAction('Wind down', 'open-wind-down')
        ]
      };
    }
    
    if (isQuotaError) {
      return {
        id: `msg-${Date.now()}`,
        sender: 'jamie',
        text: "I've hit the Gemini API quota limit for today. The free tier resets in 24 hours.\n\n**In the meantime**, I can still help with:\n• Viewing and organizing tasks\n• Finding contacts\n• Opening plan/wind-down workflows\n• Basic schedule questions\n\nWhat can I help with?",
        timestamp: new Date(),
        quickActions: [
          createQuickAction('Plan my day', 'open-plan-day'),
          createQuickAction('View tasks', 'view-task'),
          createQuickAction('Wind down', 'open-wind-down')
        ]
      };
    }
    
    // Enhanced fallback - provide helpful responses based on context even without AI
    const lowerMsg = userMessage.toLowerCase();
    const energyLevel = detectEnergyLevel(userMessage);
    
    // Try to provide context-aware fallback responses
    if (lowerMsg.includes('task')) {
      return generateTaskResponse(userMessage, tasks, energyLevel);
    } else if (lowerMsg.includes('contact') || lowerMsg.includes('find') || lowerMsg.includes('who')) {
      return generateContactResponse(userMessage, contacts);
    } else if (lowerMsg.includes('schedule') || lowerMsg.includes('plan') || lowerMsg.includes('meeting')) {
      return generateScheduleResponse(userMessage);
    } else if (lowerMsg.includes('wind down') || lowerMsg.includes('wrap up')) {
      return generateWindDownResponse();
    } else if (energyLevel === 'low') {
      return generateLowEnergyResponse(userMessage);
    } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('help')) {
      return generateGreetingResponse();
    } else if (lowerMsg.includes('project') || lowerMsg.includes('client') || lowerMsg.includes('partnership')) {
      return generateBusinessResponse(userMessage);
    } else if (currentPage || selectedItem) {
      return generateContextResponse(currentPage, selectedItem);
    }
    
    // Generic fallback with helpful info
    return {
      id: `msg-${Date.now()}`,
      sender: 'jamie',
      text: "I'm running in limited mode right now (AI connection unavailable). I can still help with basic tasks, contacts, and scheduling. What do you need?",
      timestamp: new Date(),
      quickActions: [
        createQuickAction('Plan my day', 'open-plan-day'),
        createQuickAction('View tasks', 'view-task'),
        createQuickAction('Wind down', 'open-wind-down')
      ]
    };
  }
}

/**
 * Save conversation to memory if it contains important information
 */
function saveConversationToMemory(
  userMessage: string,
  jamieResponse: string,
  currentPage: string,
  selectedItem?: { type: string; id: string; title: string }
) {
  const lowerUser = userMessage.toLowerCase();
  const lowerJamie = jamieResponse.toLowerCase();
  
  // Save content-related conversations
  if (currentPage === 'content' || lowerUser.includes('write') || lowerUser.includes('post') || lowerUser.includes('article')) {
    saveContentMemory({
      topic: selectedItem?.title || extractTopicFromMessage(userMessage),
      platform: 'LinkedIn',
      outcome: 'discussed',
      insights: `User asked: "${userMessage}". Jamie suggested: "${jamieResponse}"`,
      contentPillar: detectContentPillar(userMessage + ' ' + jamieResponse)
    });
  }
  
  // Save relationship/contact conversations
  if (currentPage === 'contacts' || lowerUser.includes('spencer') || lowerUser.includes('jason') || lowerUser.includes('sophie')) {
    const contactName = extractContactName(userMessage);
    if (contactName) {
      saveRelationshipMemory({
        contactName,
        interaction: 'discussed with Jamie',
        outcome: jamieResponse.substring(0, 200),
        followUpNeeded: lowerJamie.includes('follow up') || lowerJamie.includes('reach out')
      });
    }
  }
  
  // Save learning/insights
  if (lowerUser.includes('how do i') || lowerUser.includes('help me') || lowerUser.includes('struggling')) {
    saveLearningMemory({
      insight: `User asked: "${userMessage}"`,
      context: currentPage,
      application: jamieResponse.substring(0, 200)
    });
  }
}

/**
 * Extract topic from user message
 */
function extractTopicFromMessage(message: string): string {
  // Simple topic extraction - look for key phrases
  const words = message.split(' ').filter(w => w.length > 4);
  return words.slice(0, 3).join(' ');
}

/**
 * Detect content pillar from message
 */
function detectContentPillar(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('co-design') || lower.includes('co design')) return 'Co-Design';
  if (lower.includes('patient experience') || lower.includes('px')) return 'Patient Experience';
  if (lower.includes('empathy')) return 'Empathy';
  if (lower.includes('digital health')) return 'Digital Health Strategy';
  return 'General';
}

/**
 * Extract contact name from message
 */
function extractContactName(message: string): string | null {
  const lower = message.toLowerCase();
  if (lower.includes('spencer')) return 'Spencer';
  if (lower.includes('jason')) return 'Jason';
  if (lower.includes('sophie')) return 'Sophie';
  return null;
}

/**
 * Extract quick action buttons from Jamie's response text
 */
function extractQuickActions(text: string): Array<{ label: string; action: string; data?: any }> {
  const actions: Array<{ label: string; action: string; data?: any }> = [];
  
  // Look for common action phrases
  if (text.toLowerCase().includes('plan my day') || text.toLowerCase().includes('plan your day')) {
    actions.push({ label: 'Plan my day', action: 'open-plan-day' });
  }
  if (text.toLowerCase().includes('wind down')) {
    actions.push({ label: 'Wind down', action: 'open-wind-down' });
  }
  if (text.toLowerCase().includes('create task')) {
    actions.push({ label: 'Create task', action: 'create-task' });
  }
  if (text.toLowerCase().includes('create contact')) {
    actions.push({ label: 'Create contact', action: 'create-contact' });
  }
  if (text.toLowerCase().includes('view tasks')) {
    actions.push({ label: 'View tasks', action: 'view-task' });
  }
  
  return actions;
}

// ===== "GET ME STARTED" DRAFT GENERATION =====

/**
 * Generates drafts for "Get Me Started" feature
 * Uses Jamie's voice, Meredith's context, and actual knowledge
 */
export function generateGetMeStartedDraft(
  taskTitle: string,
  taskType: 'task' | 'content' | 'nurture',
  taskDescription?: string
): string {
  if (taskType === 'content') {
    return generateContentDraftStub(taskTitle, taskDescription);
  } else if (taskType === 'nurture') {
    return generateNurtureDraft(taskTitle, taskDescription);
  } else {
    return generateTaskBreakdown(taskTitle, taskDescription);
  }
}

// ===== "START MY TASK" DRAFT GENERATION =====

interface ContactForDraft {
  id: string;
  name: string;
  email?: string;
  company?: string;
  schedulingUrl?: string;
  linkedinUrl?: string;
}

/**
 * Generates drafts for "Start My Task" feature
 * Enhanced version with task type and contact awareness
 * Uses Jamie's voice, Meredith's context, and actual knowledge
 */
export function generateStartMyTaskDraft(
  taskTitle: string,
  taskType?: string, // TaskType from taskTypes.ts
  taskDescription?: string,
  contact?: ContactForDraft
): string {
  // Handle scheduling tasks with contact links
  if (taskType === 'schedule_their_link' && contact?.schedulingUrl) {
    return `Ready to schedule with ${contact.name}!\n\nClick the link above to book a time on their calendar.\n\n${contact.schedulingUrl}`;
  }
  
  // Handle scheduling with my link - draft email
  if (taskType === 'schedule_my_link' && contact) {
    // Get user's scheduling link from settings
    const userSchedulingLink = getUserSchedulingLink();
    
    const subjectLine = `Let's schedule a call`;
    const opener = `Hi ${contact.name},`;
    const body = `I'd love to connect and chat${taskDescription ? ` about ${taskDescription}` : ''}.\n\nHere's my scheduling link—feel free to pick a time that works for you:\n${userSchedulingLink}\n\nLooking forward to it!`;
    const closing = `Best,\nMeredith`;
    
    return `Subject: ${subjectLine}\n\n${opener}\n\n${body}\n\n${closing}`;
  }
  
  // Handle scheduling email tasks
  if (taskType === 'schedule_email' && contact) {
    const firstName = contact.name.split(' ')[0];
    const subjectLine = `Let's Find Time to Connect`;
    const opener = `Hi ${firstName},`;
    const body = `I'd love to find some time to connect. Would you be able to share your availability over the next two weeks? I'm flexible and happy to work around your schedule.`;
    const closing = `Looking forward to connecting!\n\nBest,\nMeredith`;
    
    return `Subject: ${subjectLine}\n\n${opener}\n\n${body}\n\n${closing}`;
  }
  
  // Handle outreach/networking email tasks with user prompt
  if ((taskType === 'outreach' || taskType === 'networking') && contact && taskDescription) {
    const firstName = contact.name.split(' ')[0];
    
    // Interpret the user's prompt/description to generate appropriate email content
    const lowerDesc = taskDescription.toLowerCase();
    
    let body = '';
    let subjectLine = 'Checking In';
    
    // Parse common patterns in user prompts
    if (lowerDesc.includes('collaboration') || lowerDesc.includes('partner')) {
      subjectLine = 'Exploring Collaboration Opportunities';
      body = `I've been following your work${contact.company ? ` at ${contact.company}` : ''} and would love to explore potential collaboration opportunities. I think there could be some interesting synergies between what you're working on and my patient experience strategy work.\n\nWould you be open to a brief call to discuss?`;
    } else if (lowerDesc.includes('introduce') || lowerDesc.includes('intro')) {
      subjectLine = 'Quick Introduction';
      body = `I wanted to reach out and introduce myself. I work in patient experience strategy for digital health companies, and I'd love to learn more about what you're working on${contact.company ? ` at ${contact.company}` : ''}.\n\nWould you be open to a quick call sometime?`;
    } else if (lowerDesc.includes('follow up') || lowerDesc.includes('check in')) {
      subjectLine = 'Following Up';
      body = `I wanted to check in and see how things are going${contact.company ? ` at ${contact.company}` : ''}. I'd love to catch up and hear what you've been working on lately.\n\nDo you have time for a quick call in the next week or two?`;
    } else if (lowerDesc.includes('thank')) {
      subjectLine = 'Thank You';
      body = `I wanted to reach out and say thank you. I really appreciated our last conversation and would love to stay connected.\n\nLet me know if there's anything I can do to support your work!`;
    } else {
      // Generic outreach based on task title
      subjectLine = taskTitle.replace(/email|reach out to|contact|message/gi, '').trim() || 'Quick Note';
      body = `I wanted to reach out and connect. I'd love to learn more about your work${contact.company ? ` at ${contact.company}` : ''} and explore how we might be able to support each other.\n\nWould you be open to a brief call?`;
    }
    
    const opener = `Hi ${firstName},`;
    const closing = `Best,\nMeredith`;
    
    return `Subject: ${subjectLine}\n\n${opener}\n\n${body}\n\n${closing}`;
  }
  
  // Handle general follow-up, email, or outreach tasks even without a specific task type
  if (contact && (taskTitle.toLowerCase().includes('follow up') || 
                   taskTitle.toLowerCase().includes('email') || 
                   taskTitle.toLowerCase().includes('reach out') ||
                   taskTitle.toLowerCase().includes('contact') ||
                   taskTitle.toLowerCase().includes('message'))) {
    const firstName = contact.name.split(' ')[0];
    const lowerTitle = taskTitle.toLowerCase();
    const lowerDesc = taskDescription?.toLowerCase() || '';
    
    let body = '';
    let subjectLine = 'Following Up';
    
    // Parse patterns in task title and description
    if (lowerDesc.includes('collaboration') || lowerDesc.includes('partner') || 
        lowerTitle.includes('collaboration') || lowerTitle.includes('partner')) {
      subjectLine = 'Exploring Collaboration Opportunities';
      body = `I've been following your work${contact.company ? ` at ${contact.company}` : ''} and would love to explore potential collaboration opportunities. I think there could be some interesting synergies between what you're working on and my patient experience strategy work.\n\nWould you be open to a brief call to discuss?`;
    } else if (lowerDesc.includes('introduce') || lowerDesc.includes('intro') ||
               lowerTitle.includes('introduce') || lowerTitle.includes('intro')) {
      subjectLine = 'Quick Introduction';
      body = `I wanted to reach out and introduce myself. I work in patient experience strategy for digital health companies, and I'd love to learn more about what you're working on${contact.company ? ` at ${contact.company}` : ''}.\n\nWould you be open to a quick call sometime?`;
    } else if (lowerDesc.includes('thank') || lowerTitle.includes('thank')) {
      subjectLine = 'Thank You';
      body = `I wanted to reach out and say thank you. I really appreciated our last conversation and would love to stay connected.\n\nLet me know if there's anything I can do to support your work!`;
    } else {
      // Generic follow-up email
      subjectLine = 'Following Up';
      body = `I wanted to follow up and see how things are going${contact.company ? ` at ${contact.company}` : ''}. ${taskDescription || "I'd love to catch up and hear what you've been working on lately."}\n\nDo you have time for a quick call in the next week or two?`;
    }
    
    const opener = `Hi ${firstName},`;
    const closing = `Best,\nMeredith`;
    
    return `Subject: ${subjectLine}\n\n${opener}\n\n${body}\n\n${closing}`;
  }
  
  // For other task types, use the existing breakdown logic
  return generateTaskBreakdown(taskTitle, taskDescription, contact);
}

function generateContentDraftStub(title: string, description?: string): string {
  const lowerTitle = title.toLowerCase();
  
  // CHECK MEMORY: Look for related past content
  const contentPatterns = analyzeContentPatterns();
  const relevantMemories = getRelevantMemories({
    type: 'content',
    topic: title,
    timeframe: 'all'
  });
  
  // Build context from memory
  let memoryContext = '';
  if (relevantMemories.length > 0) {
    const recentSimilar = relevantMemories.slice(0, 2);
    if (recentSimilar.length === 1) {
      const when = formatTimeAgo(recentSimilar[0].timestamp);
      memoryContext = `\\n\\n[Jamie's note: You wrote about this ${when}. This piece could extend that thinking or take a different angle.]\\n\\n`;
    } else if (recentSimilar.length > 1) {
      memoryContext = `\\n\\n[Jamie's note: You've covered related topics before. Consider how this adds something new to your body of work.]\\n\\n`;
    }
  }
  
  // Check for content gaps
  let gapSuggestion = '';
  if (contentPatterns && Array.isArray(contentPatterns.contentGaps) && contentPatterns.contentGaps.length > 0 && !lowerTitle.includes('specific')) {
    const unusedPillar = contentPatterns.contentGaps[0];
    gapSuggestion = `\\n[Jamie's suggestion: You haven't written about "${unusedPillar}" recently. Could be a fresh angle if this piece isn't working.]\\n\\n`;
  }
  
  // Detect topic and use appropriate content pillar knowledge
  let hook = '';
  let mainPoints = [];
  
  if (lowerTitle.includes('co-design') || lowerTitle.includes('co design')) {
    hook = `If you're here, chances are you care about building health tech that actually works for patients—not just in theory, but in practice.`;
    mainPoints = [
      {
        title: 'What co-design really means',
        content: 'Real co-design means bringing patients in from the beginning, not testing at the end. It means treating them as equal partners who shape the direction of the product, not just validate assumptions.'
      },
      {
        title: 'Why it makes solutions stronger',
        content: 'When patients help design from the start, you catch blind spots early—the ones that would have caused costly pivots later. You align with how care really works, not how you imagine it works.'
      },
      {
        title: 'How to start',
        content: 'Start small: Identify one patient pain point you\'re solving. Find 3-5 patients living that experience. Ask them to walk you through their current workarounds and what they wish existed.'
      }
    ];
  } else if (lowerTitle.includes('patient experience') || lowerTitle.includes('px')) {
    hook = `Patient experience isn't just about satisfaction scores or nice interfaces. It's about understanding what care actually looks and feels like for the people using your solution.`;
    mainPoints = [
      {
        title: 'The full patient experience ecosystem',
        content: 'PX includes clinical, emotional, cognitive, logistical, and financial dimensions. Patients aren\'t just managing their condition—they\'re coordinating care, advocating for themselves, managing fear, and fitting it all into their daily lives.'
      },
      {
        title: 'Why it matters for digital health',
        content: 'Products that ignore this reality feel like extra work. Products that account for it become trusted companions in patients\' care—tools they actually use and recommend.'
      },
      {
        title: 'How I approach PX strategy',
        content: 'I help teams see the full picture: where your product enters the patient journey, what else they\'re managing at that moment, and how to design around their real context.'
      }
    ];
  } else if (lowerTitle.includes('empathy') || lowerTitle.includes('patient-centered')) {
    hook = `Empathy in health tech isn't a soft skill or a nice-to-have. It's strategy. It leads to better adoption, trust, and retention.`;
    mainPoints = [
      {
        title: 'Empathy as a strategic tool',
        content: 'When teams deeply understand what patients feel and experience, they make different product decisions—ones that align with real needs, not assumptions.'
      },
      {
        title: 'Bridging data and lived experience',
        content: 'Data tells you what patients do. Empathy tells you why. Both matter, but most teams over-index on data and miss the emotional and practical context that shapes behavior.'
      },
      {
        title: 'Building empathy into your process',
        content: 'Regular patient conversations, shadowing care journeys, and listening to workarounds patients have already created. That\'s where the insights live.'
      }
    ];
  } else {
    // Generic content outline
    hook = `Let's start with a clear, grounded opening that connects with your reader.`;
    mainPoints = [
      {
        title: 'Main Point 1',
        content: '[Your first key insight or argument. Keep it specific and concrete.]'
      },
      {
        title: 'Main Point 2',
        content: '[Supporting details or a real-world example. Show, don\'t just tell.]'
      },
      {
        title: 'What this means',
        content: '[Practical takeaway or implication for your reader. Make it actionable.]'
      }
    ];
  }
  
  // Build the draft in Meredith's voice
  let draft = `# ${title}\n\n## Opening\n\n${hook}\n\n`;
  
  mainPoints.forEach((point, index) => {
    draft += `## ${point.title}\n\n${point.content}\n\n`;
  });
  
  draft += `## Closing\n\n[Tie it back to your main point and invite further conversation or action. Keep it human and direct.]\n\n`;
  draft += `—meredith`;
  
  return draft;
}

function generateNurtureDraft(title: string, description?: string): string {
  const lowerTitle = title.toLowerCase();
  
  // Extract contact name if mentioned
  let contactName = '[Name]';
  let subjectLine = '';
  let opener = '';
  let body = '';
  let cta = '';
  
  // Detect specific partnerships/contacts
  if (lowerTitle.includes('spencer') || lowerTitle.includes('nhc')) {
    contactName = 'Spencer';
    subjectLine = 'Following up on PXI curriculum collaboration';
    opener = `I've been thinking about our conversation regarding the Patient Experience Innovation Center and curriculum development.`;
    body = `I'd love to explore how I can support the work you're building—whether through advisory input on patient-centered co-design, helping shape curriculum, or contributing to programming.\n\nI'm attending the Leadership Alliance brainstorming meeting and looking forward to getting a better sense of how the pieces fit together.`;
    cta = `In the meantime, I'd welcome a chance to continue the conversation. Are you available for a brief call in the next week or two?`;
  } else if (lowerTitle.includes('jason') || lowerTitle.includes('bitelabs')) {
    contactName = 'Jason';
    subjectLine = 'Checking in on BiteLabs partnership opportunities';
    opener = `I wanted to check in and see if there are any updates on the employer connection programming we discussed.`;
    body = `I'm excited about the direction BiteLabs is heading and the potential to create structured opportunities that connect fellows, alumni, and faculty with companies that need this expertise.\n\nI'm also planning for the next PX course (likely late Feb/early March) and would love to sync up on timing and any new ideas you're exploring.`;
    cta = `Let me know when you have a few minutes to connect—happy to work around your schedule.`;
  } else if (lowerTitle.includes('sophie') || lowerTitle.includes('chronically me')) {
    contactName = 'Sophie';
    subjectLine = 'Thoughts on partnership structure for the accelerator';
    opener = `I've been reflecting on our conversations about the accelerator for young adults in digital health.`;
    body = `I'm genuinely excited about what you're building with Chronically Me and The Chargies, and I see a lot of potential for collaboration—whether as a strategic partner, curriculum creator, or workshop facilitator.\n\nI'd love to explore what partnership could look like, including structure and compensation, so we can build something that works for both of us.`;
    cta = `Want to schedule time to talk through some ideas? I'm happy to put together some initial thoughts on curriculum modules if that would be helpful.`;
  } else {
    // Generic nurture template
    subjectLine = '[Clear, conversational subject line]';
    opener = `I wanted to reach out and [reason for connecting—follow up, check in, share something relevant].`;
    body = `[Main message: Why you're reaching out, what's on your mind, or how you can help. Keep it warm and specific.]\n\n[Optional: Reference something from your last conversation or a recent development.]`;
    cta = `[Gentle next step: Suggest a call, ask a question, or offer to share something useful.]`;
  }
  
  return `Subject: ${subjectLine}\n\nHi ${contactName},\n\n${opener}\n\n${body}\n\n${cta}\n\nBest,\nMeredith`;
}

function generateTaskBreakdown(title: string, description?: string, contact?: ContactForDraft): string {
  const lowerTitle = title.toLowerCase();
  
  let steps: string[] = [];
  let firstAction = '';
  
  // If contact is provided, add context
  const contactContext = contact ? `\n\nContact: ${contact.name}${contact.company ? ` (${contact.company})` : ''}${contact.email ? `\nEmail: ${contact.email}` : ''}` : '';
  
  // Content-related tasks
  if (lowerTitle.includes('linkedin') || lowerTitle.includes('article') || lowerTitle.includes('post')) {
    steps = [
      'Choose your main topic or angle (what\'s the one thing you want to say?)',
      'Outline 2-3 key points in bullet form—don\'t worry about polish',
      'Write a rough opening paragraph (doesn\'t need to be perfect)',
      'Fill in the key points with 1-2 sentences each',
      'Add a simple closing line that invites conversation or reflection'
    ];
    firstAction = 'Pick your topic and jot down the main point in one sentence.';
  } 
  // Meeting prep tasks
  else if (lowerTitle.includes('prep') || lowerTitle.includes('prepare') || lowerTitle.includes('meeting')) {
    steps = [
      'Review notes from your last conversation with this person',
      'Identify 1-2 goals for this call (What do you want to learn or accomplish?)',
      'List 3-4 questions you could ask based on their role and your last discussion',
      'Note any open loops or follow-ups from previous conversations',
      'Write a one-sentence reminder of why this relationship matters'
    ];
    firstAction = 'Pull up your last notes with this person and scan for context.';
  }
  // Course/curriculum tasks
  else if (lowerTitle.includes('course') || lowerTitle.includes('curriculum') || lowerTitle.includes('workshop')) {
    steps = [
      'Define 2-3 core learning objectives (What should participants walk away knowing?)',
      'Outline the main topics or modules in a simple list',
      'For each module, jot down 1-2 key activities or discussion points',
      'Identify real-world examples or case studies you could use',
      'Sketch a rough timeline (how much time per section?)'
    ];
    firstAction = 'Write down 2-3 learning objectives in plain language.';
  }
  // Email/outreach tasks
  else if (lowerTitle.includes('email') || lowerTitle.includes('reach out') || lowerTitle.includes('follow up')) {
    steps = [
      'Decide on your main reason for reaching out (one clear purpose)',
      'Draft a conversational subject line',
      'Write the opening line (reference last conversation or shared context)',
      'State your ask or main message in 2-3 sentences',
      'Add a simple closing line with a gentle next step'
    ];
    firstAction = 'Write one sentence: Why are you reaching out?';
  }
  // Generic task breakdown
  else {
    steps = [
      'Identify the smallest possible first step (What can you do in 5-10 minutes?)',
      'Gather any materials or information you need',
      'Break the work into 3-4 manageable chunks',
      'Tackle the easiest or clearest chunk first',
      'Build momentum—once you start, the next step usually becomes clearer'
    ];
    firstAction = 'Take 2 minutes to list what you already know and what you need to figure out.';
  }
  
  let breakdown = `Task: ${title}${contactContext}\n\n`;
  
  if (description) {
    breakdown += `Context: ${description}\n\n`;
  }
  
  breakdown += `Here's how to break this down:\n\n`;
  
  steps.forEach((step, index) => {
    breakdown += `${index + 1}. ${step}\n`;
  });
  
  breakdown += `\n✨ Start here: ${firstAction}\n\n`;
  breakdown += `You don't need to finish everything right now. Just take the first step.`;
  
  return breakdown;
}

// ===== CONTENT SUMMARY GENERATION =====

/**
 * Generate a concise summary from source content using Jamie/AI
 * Used in Content Planning Wizard when source content is available
 */
export async function generateContentSummary(
  sourceContent: string,
  sourceUrl?: string,
  sourceAuthor?: string
): Promise<string> {
  try {
    const { projectId, publicAnonKey } = await import('./supabase/info');
    
    // Build context for the summary generation
    const context = `You are Jamie, Meredith's AI assistant helping with content planning.
    
Your task: Read the source content below and generate a concise 2-3 sentence summary that captures the core insight or story. This summary will help Meredith plan content based on this source.

VOICE GUIDELINES:
- Clear, conversational, and direct
- Focus on the key insight, not surface details
- Use Meredith's language: "patient journey", "real-life constraints", "nuance"
- Avoid buzzwords like "deep insights", "unlock the power of", "game-changing"

SOURCE CONTENT:
${sourceContent}
${sourceAuthor ? `\nSource Author: ${sourceAuthor}` : ''}
${sourceUrl ? `\nSource URL: ${sourceUrl}` : ''}

Generate a 2-3 sentence summary:`;

    const messages = [
      { role: 'system', content: 'You are Jamie, an AI assistant that helps with content strategy. You are clear, conversational, and focused on insight.' },
      { role: 'user', content: context }
    ];

    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a89809a8/jamie/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ messages })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Jamie API error:', errorData);
      throw new Error(`Jamie API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating summary:', error);
    throw error;
  }
}

/**
 * Generate main points from source content using Jamie/AI
 * Used in Content Planning Wizard when source content is available
 */
export async function generateMainPoints(
  sourceContent: string,
  sourceUrl?: string,
  sourceAuthor?: string
): Promise<string[]> {
  try {
    const { projectId, publicAnonKey } = await import('./supabase/info');
    
    const context = `You are Jamie, Meredith's AI assistant helping with content planning.

Your task: Read the source content below and extract the 5-8 most important main points. These should be the key ideas, insights, or takeaways that Meredith might want to reference when drafting content.

GUIDELINES:
- Each point should be one clear sentence
- Focus on insights, not just facts
- Prioritize what would be useful for patient experience content
- Use clear, direct language (no buzzwords)

SOURCE CONTENT:
${sourceContent}
${sourceAuthor ? `\nSource Author: ${sourceAuthor}` : ''}
${sourceUrl ? `\nSource URL: ${sourceUrl}` : ''}

Return your response as a JSON array of strings. Example format:
["First main point here", "Second main point here", "Third main point here"]`;

    const messages = [
      { role: 'system', content: 'You are Jamie, an AI assistant that helps with content strategy. You are clear, conversational, and focused on insight.' },
      { role: 'user', content: context }
    ];

    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a89809a8/jamie/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ messages })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Jamie API error:', errorData);
      throw new Error(`Jamie API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    
    // Parse the JSON response
    const cleanedContent = stripMarkdownCodeFences(content);
    const points = JSON.parse(cleanedContent);
    
    // Format points with numbers and double line breaks
    const formattedPoints = Array.isArray(points) 
      ? points.map((point, idx) => `${idx + 1}. ${point}`)
      : [];
    
    return formattedPoints;
  } catch (error) {
    console.error('Error generating main points:', error);
    throw error;
  }
}

/**
 * Generate important quotes from source content using Jamie/AI
 * Used in Content Planning Wizard when source content is available
 */
export async function generateImportantQuotes(
  sourceContent: string,
  sourceUrl?: string,
  sourceAuthor?: string
): Promise<string[]> {
  try {
    // Validate input
    if (!sourceContent || sourceContent.trim().length === 0) {
      console.warn('⚠️ No source content provided for quote generation');
      return [];
    }

    const { projectId, publicAnonKey } = await import('./supabase/info');
    
    if (!projectId || !publicAnonKey) {
      console.error('❌ Missing Supabase credentials');
      throw new Error('Configuration error: Missing Supabase credentials');
    }

    const context = `You are Jamie, Meredith's AI assistant helping with content planning.

Your task: Read the source content below and extract 3-6 of the most quotable, compelling direct quotes. These should be verbatim quotes that Meredith might want to reference or use in her content.

GUIDELINES:
- Use exact quotes from the source (verbatim)
- Choose quotes that are insightful, memorable, or capture key moments
- Prioritize quotes about patient experience, healthcare friction, or real-world constraints
- Each quote should stand alone and be compelling

SOURCE CONTENT:
${sourceContent}
${sourceAuthor ? `\nSource Author: ${sourceAuthor}` : ''}
${sourceUrl ? `\nSource URL: ${sourceUrl}` : ''}

Return your response as a JSON array of strings. Example format:
["First verbatim quote here", "Second verbatim quote here", "Third verbatim quote here"]

If there are no good quotes in the source, return an empty array: []`;

    const messages = [
      { role: 'system', content: 'You are Jamie, an AI assistant that helps with content strategy. You are clear, conversational, and focused on insight.' },
      { role: 'user', content: context }
    ];

    console.log('🔄 Generating important quotes via Jamie...');
    console.log('📤 Request URL:', `https://${projectId}.supabase.co/functions/v1/make-server-a89809a8/jamie/chat`);

    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a89809a8/jamie/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ messages })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Jamie API error generating quotes:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Jamie API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Jamie response received for quotes');
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      console.error('❌ Invalid response structure from Jamie:', data);
      throw new Error('Invalid response structure from Jamie');
    }

    const content = data.choices[0].message.content.trim();
    
    // Parse the JSON response
    const cleanedContent = stripMarkdownCodeFences(content);
    const quotes = JSON.parse(cleanedContent);
    
    return Array.isArray(quotes) ? quotes : [];
  } catch (error) {
    console.error('❌ Error generating important quotes:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    throw error;
  }
}

/**
 * Generate POV/angle suggestions based on source material, platform, audiences, and goals
 * Used in Content Planning Wizard after user provides context
 */
export async function generatePOVAngles(
  sourceContent: string,
  platform: string,
  audiences: string[],
  goals: string[],
  sourceUrl?: string,
  sourceAuthor?: string
): Promise<string[]> {
  try {
    const { projectId, publicAnonKey } = await import('./supabase/info');
    
    const context = `You are Jamie, Meredith's AI assistant helping with content planning.

Your task: Based on the source content, platform, audiences, and goals below, suggest 3-5 different POV angles or perspectives Meredith could take when creating this content.

CONTEXT:
- Platform: ${platform}
- Target Audiences: ${audiences.join(', ')}
- Goals: ${goals.join(', ')}

SOURCE CONTENT:
${sourceContent}
${sourceAuthor ? `\nSource Author: ${sourceAuthor}` : ''}
${sourceUrl ? `\nSource URL: ${sourceUrl}` : ''}

GUIDELINES:
- Each angle should be one clear sentence describing a perspective or approach
- Make angles specific to the audience and goals
- Focus on patient experience lens and healthcare reality
- Consider what would resonate most with the target audience
- Avoid generic angles - make them actionable and specific

Return your response as a JSON array of strings. Example format:
["Angle focusing on patient friction points", "Angle highlighting workflow reality", "Angle centered on care team perspective"]`;

    const messages = [
      { role: 'system', content: 'You are Jamie, an AI assistant that helps with content strategy. You are clear, conversational, and focused on insight.' },
      { role: 'user', content: context }
    ];

    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a89809a8/jamie/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ messages })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Jamie API error:', errorData);
      throw new Error(`Jamie API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    
    // Parse the JSON response
    const cleanedContent = stripMarkdownCodeFences(content);
    const angles = JSON.parse(cleanedContent);
    
    return Array.isArray(angles) ? angles : [];
  } catch (error) {
    console.error('Error generating POV angles:', error);
    throw error;
  }
}

/**
 * Process brain dump and generate structured outline + Jamie's thoughts
 * Used in Brain Dump modal in Content Editor
 */
export async function processBrainDump(
  rawInput: string,
  contentContext?: {
    title?: string;
    platform?: string;
    summary?: string;
    goals?: string[];
    audiences?: string[];
  }
): Promise<{ outline: string; thoughts: string }> {
  try {
    const { projectId, publicAnonKey } = await import('./supabase/info');
    
    // Build context for the brain dump processing
    const contextStr = contentContext ? `
CONTENT CONTEXT:
- Title: ${contentContext.title || 'Untitled'}
- Platform: ${contentContext.platform || 'Not specified'}
- Summary: ${contentContext.summary || 'None'}
- Goals: ${Array.isArray(contentContext.goals) && contentContext.goals.length > 0 ? contentContext.goals.join(', ') : 'None'}
- Target Audiences: ${Array.isArray(contentContext.audiences) && contentContext.audiences.length > 0 ? contentContext.audiences.join(', ') : 'None'}
` : '';

    const prompt = `You are Jamie, Meredith's AI assistant helping with content drafting.

Meredith just did a brain dump—either speaking or typing freely about what she wants to write. Your job is to process her raw thoughts into TWO things:

1. **A STRUCTURED OUTLINE** (HTML format with <h3>, <ul>, <li> tags)
   - Organize her brain dump into a clear, logical flow
   - Pull out the main points and sub-points
   - Create a hierarchical structure she can follow when drafting
   - Use <h3> for main sections, <ul>/<li> for bullet points
   
2. **JAMIE'S THOUGHTS** (HTML format with <p> tags)
   - Separate section at the end
   - Offer 2-3 directional thoughts about:
     - Paths she could take with this content
     - Angles that might resonate with her audience
     - Gaps or opportunities she might explore
   - Keep it supportive and actionable, not prescriptive

VOICE GUIDELINES:
- Clear, conversational, and encouraging
- Focus on helping her move forward, not perfection
- Use Meredith's language: "patient journey", "real-life constraints", "nuance"
- Avoid buzzwords and corporate jargon

${contextStr}

MEREDITH'S BRAIN DUMP:
${rawInput}

Generate the outline and thoughts as JSON:
{
  "outline": "<h3>Main Point 1</h3><ul><li>Sub-point A</li><li>Sub-point B</li></ul>...",
  "thoughts": "<p>First thought...</p><p>Second thought...</p>"
}`;

    const messages = [
      { role: 'system', content: 'You are Jamie, an AI assistant that helps with content creation. You are clear, supportive, and focused on helping the user move forward.' },
      { role: 'user', content: prompt }
    ];

    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a89809a8/jamie/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ messages })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Jamie API error:', errorData);
      throw new Error(`Jamie API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    
    // Strip markdown code fences and parse JSON response
    const cleanedContent = stripMarkdownCodeFences(content);
    try {
      const parsed = JSON.parse(cleanedContent);
      return {
        outline: parsed.outline,
        thoughts: parsed.thoughts
      };
    } catch (parseError) {
      console.error('Failed to parse JSON response:', cleanedContent);
      throw new Error('Jamie returned an invalid response format. Please try again.');
    }
  } catch (error) {
    console.error('Error processing brain dump:', error);
    throw error;
  }
}

/**
 * Generate a full draft based on outline, Jamie's thoughts, and content context
 * Used in Brain Dump modal for generating a complete first draft
 */
export async function generateContentDraft(params: {
  outline: string;
  thoughts: string;
  brainDump: string;
  context?: {
    title?: string;
    platform?: string;
    summary?: string;
    goals?: string[];
    audiences?: string[];
    length?: string;
    tone?: string | string[];  // Allow both string and array
  };
}): Promise<string> {
  try {
    const { projectId, publicAnonKey } = await import('./supabase/info');
    
    // Handle tone - convert array to readable string
    let toneStr = 'Not specified';
    if (params.context?.tone) {
      if (Array.isArray(params.context.tone)) {
        toneStr = params.context.tone.length > 0 ? params.context.tone.join(', ') : 'Not specified';
      } else {
        toneStr = params.context.tone;
      }
    }
    
    // Build context string
    const contextStr = params.context ? `
CONTENT PARAMETERS:
- Title: ${params.context.title || 'Untitled'}
- Platform: ${params.context.platform || 'Not specified'}
- Summary: ${params.context.summary || 'None'}
- Goals: ${Array.isArray(params.context.goals) && params.context.goals.length > 0 ? params.context.goals.join(', ') : 'None'}
- Target Audiences: ${Array.isArray(params.context.audiences) && params.context.audiences.length > 0 ? params.context.audiences.join(', ') : 'None'}
- Desired Length: ${params.context.length || 'Not specified'}
- Tone: ${toneStr}
` : '';

    // Get platform-specific best practices
    const platformGuidance = params.context?.platform ? getPlatformBestPractices(params.context.platform) : '';
    
    // Get tone-specific guidance
    const toneArray = params.context?.tone 
      ? (Array.isArray(params.context.tone) ? params.context.tone : [params.context.tone])
      : [];
    const toneGuidance = getToneGuidance(toneArray);

    const prompt = `You are Jamie, Meredith's AI assistant helping draft content.

${contextStr}

${platformGuidance}
${toneGuidance}

⚠️ CRITICAL INSTRUCTION - TONE TAKES PRIORITY:
The user has selected specific tone(s): ${toneStr}
You MUST match this tone precisely. The tone selection overrides default voice guidelines.

- If tone includes "Professional" or "Educational" → Use formal, authoritative language (NOT casual or chatty)
- If tone includes "Conversational" → Then and ONLY then use casual, friendly language
- If tone includes "Inspiring" or "Provocative" → Use bold, vision-forward language
- If tone includes "Storytelling" → Lead with narrative and personal anecdotes

${getVoiceGuidanceText()}

${getWritingDNAGuidance()}

NOTE: Apply the above voice rules and writing DNA WITHIN the selected tone. For example, if the tone is "Professional + Educational", still avoid banned phrases and use first person POV, but adopt a more formal register than you would for "Conversational".

BRAIN DUMP (Meredith's raw thoughts):
${params.brainDump}

STRUCTURED OUTLINE:
${params.outline}

YOUR INSIGHTS & SUGGESTIONS:
${params.thoughts}

Now generate a COMPLETE DRAFT that:
1. Follows the structured outline you created
2. Incorporates your insights and suggestions
3. Uses Meredith's original brain dump content
4. STRICTLY MATCHES the tone: ${toneStr} (see tone requirements above)
5. Follows platform best practices for ${params.context?.platform || 'this platform'}

🚨 FINAL REMINDER: The tone "${toneStr}" is NOT optional or flexible. Review the tone requirements above and ensure EVERY sentence matches the specified tone. If the tone is Professional + Educational, the draft should read like an expert teaching article, NOT a casual blog post.

Return ONLY the draft content as HTML (using <p>, <h2>, <h3>, <ul>, <li>, <strong>, <em> tags as needed for structure). Do NOT include JSON or any other formatting.`;

    const messages = [
      { role: 'user', content: prompt }
    ];

    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a89809a8/jamie/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ messages })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Jamie API error:', errorData);
      throw new Error(`Jamie API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating draft:', error);
    throw error;
  }
}

/**
 * Generate 2 cohesive draft options for the Draft Builder
 * Each draft has its own thesis/argument that drives all its structural elements
 */
export async function generate2DraftOptions(params: {
  // Content planning inputs
  selectedPovAngle?: string;
  audiences?: string[];
  goals?: string[];
  notes?: string;
  brainDump?: string;
  
  // Source content
  sourceContent?: string;
  sourceUrl?: string;
  sourceAuthor?: string;
  summary?: string;
  mainPoints?: string[];
  importantQuotes?: string[];
  
  // Platform context
  platform?: string;
  title?: string;
}): Promise<Array<{
  id: number;
  jamiesThoughts: string;
  relevantMainPoints: string[];
  relevantQuotes: string[];
  structuralSuggestions: {
    hook: string;
    context: string;
    yourTake: string;
    makeItUsable: string;
    cta: string;
  };
}>> {
  try {
    const { projectId, publicAnonKey } = await import('./supabase/info');
    
    // Build comprehensive context
    const contextStr = `
CONTENT PLANNING INPUTS:
- POV/Angle: ${params.selectedPovAngle || 'Not specified'}
- Target Audiences: ${params.audiences?.join(', ') || 'Not specified'}
- Goals: ${params.goals?.join(', ') || 'Not specified'}
- Platform: ${params.platform || 'Not specified'}
- Title: ${params.title || 'Untitled'}

SOURCE MATERIAL:
${params.summary ? `Summary: ${params.summary}` : ''}
${params.sourceContent ? `\nSource Content:\n${params.sourceContent}` : ''}
${params.sourceUrl ? `\nSource URL: ${params.sourceUrl}` : ''}
${params.sourceAuthor ? `\nSource Author: ${params.sourceAuthor}` : ''}

MAIN POINTS FROM SOURCE:
${params.mainPoints && params.mainPoints.length > 0 ? params.mainPoints.map(p => `• ${p}`).join('\n') : 'None provided'}

IMPORTANT QUOTES FROM SOURCE:
${params.importantQuotes && params.importantQuotes.length > 0 ? params.importantQuotes.map(q => `"${q}"`).join('\n') : 'None provided'}

MEREDITH'S NOTES:
${params.notes || 'None'}

MEREDITH'S BRAIN DUMP:
${params.brainDump || 'None'}
`;

    const prompt = `You are Jamie, Meredith's AI assistant helping with content creation.

YOUR TASK: Generate 2 DISTINCT draft options for Meredith to choose from. Each draft should feel like ONE COHESIVE ARGUMENT with all elements supporting that specific direction.

${contextStr}

IMPORTANT INSTRUCTIONS:

For each draft:
1. First, determine a DISTINCT TOPIC/ARGUMENT/THESIS for the draft
2. Generate supporting source-based fields that align with that thesis:
   - Relevant Main Points (3-5 points from the source that support THIS draft's direction)
   - Relevant Quotes (2-4 quotes from the source that support THIS draft's direction)
3. Generate structural suggestions that all align with that same draft direction:
   - Hook (opening that pulls reader in for THIS specific angle)
   - Context/Micro-story (either draft a contextual micro-story OR suggest what kind of personal story/experience Meredith should include)
   - Your Take (Meredith's perspective on THIS specific angle)
   - Make it Usable (practical takeaway for THIS argument)
   - CTA (call-to-action that fits THIS direction)

DRAFT OPTION 1 and DRAFT OPTION 2 should:
- Have DIFFERENT thesis/argument/angle (not just slight variations)
- Each feel internally consistent and cohesive
- Pull from the source material but emphasize different aspects
- Target the specified audience and goals but through different lenses

${getVoiceGuidanceText()}

${getPlatformGuidanceText(params.platform)}

${getWritingDNAGuidance()}

CONTEXT/MICRO-STORY OPTIONS:
- You can either draft a full contextual micro-story (2-3 sentences)
- OR suggest what kind of personal story/experience Meredith should add (e.g., "Add a story about a time you saw a patient struggle with X")

Return your response as a JSON object with this EXACT structure:
{
  "draft1": {
    "jamiesThoughts": "Draft 1: [1-2 sentences explaining the thesis/argument of this draft and what makes it distinct]",
    "relevantMainPoints": ["Point 1", "Point 2", "Point 3"],
    "relevantQuotes": ["\\"Quote 1\\"", "\\"Quote 2\\""],
    "structuralSuggestions": {
      "hook": "Opening hook text...",
      "context": "Either a drafted micro-story OR a suggestion for what story to add...",
      "yourTake": "Meredith's perspective text...",
      "makeItUsable": "Practical takeaway text...",
      "cta": "Call to action text..."
    }
  },
  "draft2": {
    "jamiesThoughts": "Draft 2: [1-2 sentences explaining the DIFFERENT thesis/argument of this draft]",
    "relevantMainPoints": ["Point A", "Point B", "Point C"],
    "relevantQuotes": ["\\"Quote X\\"", "\\"Quote Y\\""],
    "structuralSuggestions": {
      "hook": "Alternative opening hook...",
      "context": "Alternative micro-story or suggestion...",
      "yourTake": "Alternative perspective...",
      "makeItUsable": "Alternative takeaway...",
      "cta": "Alternative CTA..."
    }
  }
}`;

    const messages = [
      { role: 'system', content: 'You are Jamie, an AI assistant that helps with content strategy. You are clear, conversational, and focused on creating cohesive, well-reasoned content.' },
      { role: 'user', content: prompt }
    ];

    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a89809a8/jamie/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ messages })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Jamie API error:', errorData);
      throw new Error(`Jamie API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    
    // Extract JSON from response (may have markdown code fences)
    const cleanedContent = stripMarkdownCodeFences(content);
    
    let parsed;
    try {
      parsed = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', cleanedContent);
      throw new Error('Jamie returned an invalid response format. Please try again.');
    }
    
    // Transform into the format expected by the UI
    return [
      {
        id: 1,
        jamiesThoughts: parsed.draft1.jamiesThoughts,
        relevantMainPoints: parsed.draft1.relevantMainPoints,
        relevantQuotes: parsed.draft1.relevantQuotes,
        structuralSuggestions: parsed.draft1.structuralSuggestions
      },
      {
        id: 2,
        jamiesThoughts: parsed.draft2.jamiesThoughts,
        relevantMainPoints: parsed.draft2.relevantMainPoints,
        relevantQuotes: parsed.draft2.relevantQuotes,
        structuralSuggestions: parsed.draft2.structuralSuggestions
      }
    ];
  } catch (error) {
    console.error('Error generating draft options:', error);
    throw error;
  }
}

/**
 * Get tone-specific guidance to enforce proper voice matching
 */
function getToneGuidance(tones: string[]): string {
  const guidance: Record<string, string> = {
    'Professional': `
      ✓ Use authoritative, polished expert voice
      ✓ Formal language and industry terminology
      ✓ Structured, well-organized paragraphs
      ✗ NO casual phrases, chatty asides, or exclamation points
      ✗ NO "Hey!" or "Let's be real" style openings
      Example: "Patient experience strategy requires systematic evaluation of care touchpoints across the full continuum."`,
    
    'Educational': `
      ✓ Teaching language with clear explanations
      ✓ Numbered steps, frameworks, and "what this means" sections
      ✓ Define terms and concepts clearly
      ✓ Include concrete examples and takeaways
      ✗ NO assumptions about reader knowledge
      Example: "Co-design has three distinct phases: 1) Discovery (understanding patient pain points), 2) Ideation (collaborative solution development), and 3) Validation (testing with real users)."`,
    
    'Conversational': `
      ✓ Warm, approachable, personal tone
      ✓ "Meredith Real Talk" - like talking to a friend
      ✓ Can use contractions, casual phrases, personal anecdotes
      ✓ This is the ONE tone where informal language is appropriate
      Example: "Here's the thing about co-design - it's not just about asking patients what they think. It's about bringing them in from day one."`,
    
    'Inspiring': `
      ✓ Motivational language with vision-forward thinking
      ✓ Paint a picture of what's possible
      ✓ Aspirational but grounded in real examples
      ✓ Balance hope with practical next steps
      Example: "Imagine a healthcare system where every digital tool was shaped by the people who actually use it. That's not a distant dream - it's happening right now."`,
    
    'Provocative': `
      ✓ Challenge conventional assumptions
      ✓ Ask hard, uncomfortable questions
      ✓ Push back on industry norms
      ✓ Bold statements backed by reasoning
      Example: "We call it 'user testing' but let's be honest - testing patients at the end isn't co-design. It's validation theater."`,
    
    'Storytelling': `
      ✓ Lead with narrative and personal experience
      ✓ Use "I remember when..." or "Here's what happened..." structure
      ✓ Concrete scenes with sensory details
      ✓ Connect story to larger insight
      Example: "I was sitting in a conference room with a product team when they showed me their patient portal. 'It's so intuitive,' they said. Then I asked: 'Have you watched a patient use it?'"`
  };
  
  if (tones.length === 0) return '';
  
  let result = '\n🎯 TONE ENFORCEMENT (CRITICAL - READ CAREFULLY):\n';
  result += `Selected tones: ${tones.join(' + ')}\n\n`;
  
  tones.forEach(tone => {
    if (guidance[tone]) {
      result += `${tone.toUpperCase()} REQUIREMENTS:\n${guidance[tone]}\n\n`;
    }
  });
  
  return result;
}

/**
 * Get platform-specific best practices for content drafting
 */
function getPlatformBestPractices(platform: string): string {
  const practices: Record<string, string> = {
    'LI Post': `
LINKEDIN POST BEST PRACTICES:
- Hook in first 1-2 lines (crucial for feed visibility)
- Use short paragraphs (1-2 sentences max)
- Include line breaks for readability
- Personal stories and insights perform best
- End with a question or call-to-action to drive engagement
- Aim for 1,200-1,500 characters for optimal engagement
`,
    'LI Article': `
LINKEDIN ARTICLE BEST PRACTICES:
- Strong headline that promises value
- Compelling introduction that hooks the reader
- Use subheadings (H2, H3) to break up content
- Include bullet points and lists for scannability
- Personal anecdotes and case studies add credibility
- Conclude with clear takeaways and next steps
- 1,000-2,000 words is the sweet spot
`,
    'SS Post': `
SUBSTACK POST BEST PRACTICES:
- Conversational, email-like tone
- Strong subject line/title
- Personal and intimate - you're writing to someone's inbox
- Longer-form content welcomed (1,500-3,000 words)
- Use subheadings, quotes, and formatting for visual interest
- Can be more vulnerable and in-depth than social media
- Include clear sections or chapters for longer pieces
`,
    'SS Audio': `
SUBSTACK AUDIO BEST PRACTICES:
- Write for the ear, not the eye (conversational language)
- Use shorter sentences and natural speech patterns
- Include verbal signposts ("First," "Here's the thing," "Let me explain")
- Personal stories and commentary work especially well
- Aim for 10-20 minutes of content (roughly 1,500-3,000 words)
- Write like you're talking to a friend over coffee
`
  };

  return practices[platform] || '';
}

/**
 * Analyze source material and extract key insights relevant to user's expertise
 * Used in Content Editor Jamie panel
 */
export async function analyzeSourceMaterial(
  sourceContent: string,
  sourceUrl?: string,
  sourceTitle?: string,
  sourceAuthor?: string
): Promise<{
  highlevelSummary: string;
  keyPoints: Array<{
    text: string;
    type: 'insight' | 'quote' | 'stat' | 'topic';
    isQuote?: boolean;
  }>;
}> {
  try {
    const { projectId, publicAnonKey } = await import('./supabase/info');
    
    const prompt = `You are Jamie, an AI assistant helping a patient experience strategist analyze source material.

USER'S EXPERTISE AREAS:
- Patient experience design
- Digital health product strategy  
- Healthcare communication
- Patient journey mapping
- Healthcare friction points
- Trust and credibility in healthcare
- Patient engagement strategies

SOURCE TO ANALYZE:
Title: ${sourceTitle || 'Untitled'}
Author: ${sourceAuthor || 'Unknown'}
${sourceUrl ? `URL: ${sourceUrl}` : ''}

Content: ${sourceContent}

YOUR TASK:
1. Write a high-level summary (2-3 sentences) capturing the main thesis
2. Extract 5-8 key points that would be most valuable for this user, prioritizing:
   - Insights about patient behavior, friction points, or experience gaps
   - Statistics or data about healthcare/digital health
   - Quotable statements that align with the user's expertise (mark these with isQuote: true)
   - Framework concepts or strategic insights

VOICE GUIDELINES:
- Clear and conversational
- Use Meredith's language: "patient journey", "real-life constraints", "nuance"
- Avoid buzzwords

Format your response as JSON:
{
  "highlevelSummary": "...",
  "keyPoints": [
    { "text": "...", "type": "insight", "isQuote": false },
    { "text": "...", "type": "quote", "isQuote": true }
  ]
}`;

    const messages = [
      { role: 'system', content: 'You are Jamie, an AI assistant that analyzes content for strategic insights. You are clear, focused, and identify what matters most.' },
      { role: 'user', content: prompt }
    ];

    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a89809a8/jamie/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ messages })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Jamie API error:', errorData);
      throw new Error(`Jamie API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    
    // Strip markdown code fences and parse JSON response
    const cleanedContent = stripMarkdownCodeFences(content);
    try {
      const parsed = JSON.parse(cleanedContent);
      return {
        highlevelSummary: parsed.highlevelSummary,
        keyPoints: parsed.keyPoints
      };
    } catch (parseError) {
      console.error('Failed to parse JSON response:', cleanedContent);
      throw new Error('Jamie returned an invalid response format. Please try again.');
    }
  } catch (error) {
    console.error('Error analyzing source material:', error);
    throw error;
  }
}

/**
 * Generate SEO metadata (title and description) for Substack posts
 * Used in Content Editor Jamie panel
 */
export async function generateSEOMetadata(
  contentTitle: string,
  contentBody: string,
  platform?: string
): Promise<{
  seoTitle: string;
  seoDescription: string;
}> {
  try {
    const { projectId, publicAnonKey } = await import('./supabase/info');
    
    const prompt = `You are Jamie, an AI assistant helping a patient experience strategist create SEO metadata for their Substack post.

CONTENT TITLE: ${contentTitle || 'Untitled'}
PLATFORM: ${platform || 'Substack'}

CONTENT BODY (first 500 words):
${contentBody.substring(0, 2000)}

YOUR TASK:
Generate SEO-optimized metadata for this Substack post:

1. **SEO Title** (under 60 characters):
   - Compelling and clear
   - Include the main keyword/topic
   - Maintain Meredith's voice (clear, human, specific)
   - Must be under 60 characters

2. **SEO Description** (50-160 characters):
   - Concise summary of the post's value
   - Include relevant keywords naturally
   - Clear call to action or benefit
   - Between 50-160 characters

VOICE GUIDELINES:
- Clear over clever
- Specific over vague
- Use patient experience language: "patient journey", "real-life constraints", "nuance"
- Avoid buzzwords like "unlock", "transform", "game-changing"
- Speak like a real person, not a marketing robot

Format your response as JSON:
{
  "seoTitle": "...",
  "seoDescription": "..."
}`;

    const messages = [
      { role: 'system', content: 'You are Jamie, an AI assistant that creates SEO metadata. You write clear, compelling copy that drives clicks while maintaining authenticity.' },
      { role: 'user', content: prompt }
    ];

    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a89809a8/jamie/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ messages })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Jamie API error:', errorData);
      throw new Error(`Jamie API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    
    // Strip markdown code fences and parse JSON response
    const cleanedContent = stripMarkdownCodeFences(content);
    try {
      const parsed = JSON.parse(cleanedContent);
      return {
        seoTitle: parsed.seoTitle,
        seoDescription: parsed.seoDescription
      };
    } catch (parseError) {
      console.error('Failed to parse JSON response:', cleanedContent);
      throw new Error('Jamie returned an invalid response format. Please try again.');
    }
  } catch (error) {
    console.error('Error generating SEO metadata:', error);
    throw error;
  }
}

/**
 * Generate exactly 2 polished rewrite options for selected text
 * Lightweight utility for the "Jamie Polish" feature in Content Editor
 */
export async function generateJamiePolishOptions(params: {
  selectedText: string;
  // Content context
  title?: string;
  platform?: string;
  summary?: string;
  notes?: string;
  selectedPovAngles?: string[];
  goals?: string[];
  audiences?: string[];
  mainPoints?: string[];
  importantQuotes?: string[];
  sourceContent?: string;
  sourceUrl?: string;
  sourceAuthor?: string;
  // Cursor context
  fullEditorContent?: string;
  cursorPosition?: number;
}): Promise<Array<{
  id: string;
  label: string;
  rationale: string;
  text: string;
}>> {
  try {
    const { projectId, publicAnonKey } = await import('./supabase/info');
    
    // Build context sections
    let contextInfo = '';
    
    if (params.title) {
      contextInfo += `\n**Content Title:** ${params.title}`;
    }
    
    if (params.platform) {
      contextInfo += `\n**Platform:** ${params.platform}`;
    }
    
    if (params.summary) {
      contextInfo += `\n\n**Summary:** ${params.summary}`;
    }
    
    if (params.selectedPovAngles && params.selectedPovAngles.length > 0) {
      contextInfo += `\n\n**Selected Angle:** ${params.selectedPovAngles[0]}`;
    }
    
    if (params.goals && params.goals.length > 0) {
      contextInfo += `\n\n**Goals:** ${params.goals.join(', ')}`;
    }
    
    if (params.audiences && params.audiences.length > 0) {
      contextInfo += `\n\n**Target Audiences:** ${params.audiences.join(', ')}`;
    }
    
    if (params.mainPoints && params.mainPoints.length > 0) {
      contextInfo += `\n\n**Key Points to Consider:**\n${params.mainPoints.slice(0, 3).map(p => `• ${p}`).join('\n')}`;
    }
    
    if (params.importantQuotes && params.importantQuotes.length > 0) {
      contextInfo += `\n\n**Important Quotes:**\n${params.importantQuotes.slice(0, 2).map(q => `• "${q}"`).join('\n')}`;
    }
    
    if (params.notes) {
      contextInfo += `\n\n**Notes:** ${params.notes}`;
    }
    
    if (params.sourceAuthor || params.sourceUrl) {
      contextInfo += `\n\n**Source:** ${params.sourceAuthor || 'Unknown author'}${params.sourceUrl ? ` (${params.sourceUrl})` : ''}`;
    }

    const prompt = `You are Jamie, Meredith's AI writing assistant. Meredith has highlighted a section of text in her content editor and wants you to polish it.

YOUR TASK:
Generate exactly 2 distinct polished rewrite options for the selected text.

SELECTED TEXT TO REWRITE:
"${params.selectedText}"

CONTENT CONTEXT:${contextInfo || '\n(No additional context provided)'}

${params.fullEditorContent ? `\nFULL EDITOR CONTENT (for context):\n${params.fullEditorContent.substring(0, 1000)}${params.fullEditorContent.length > 1000 ? '...' : ''}` : ''}

${getVoiceGuidanceText()}

${getPlatformGuidanceText(params.platform)}

${getWritingDNAGuidance()}

WRITING RULES (Priority Order):
1. **Preserve the core meaning** unless a stronger shift is clearly warranted
2. **Use Meredith's voice**: Apply all voice rules, writing DNA, and platform guidance above
3. **Use strategic context**: Let the goals/angles/audience guide tone and emphasis, but don't mechanically insert them
4. **Make options meaningfully different**: Not just minor word swaps - offer distinct approaches (e.g., more concise vs more detailed, warmer vs more direct, etc.)

RESPONSE FORMAT (JSON):
Return exactly 2 options as a JSON array. Each option must include:
- **id**: "option1" or "option2"
- **label**: Short descriptive label (e.g., "More Direct," "Warmer Tone," "More Specific")
- **rationale**: 1-2 sentences explaining what this version does well or what changed
- **text**: The rewritten text

Example structure:
{
  "options": [
    {
      "id": "option1",
      "label": "More Concise",
      "rationale": "Tightened the language and removed redundancy while keeping the core insight.",
      "text": "..."
    },
    {
      "id": "option2",
      "label": "Warmer Tone",
      "rationale": "Added more human connection and made the advice feel more accessible.",
      "text": "..."
    }
  ]
}

Generate the 2 rewrite options now.`;

    const messages = [
      { role: 'user', content: prompt }
    ];

    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a89809a8/jamie/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ messages })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Jamie API error:', errorData);
      throw new Error(`Jamie API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    
    // Strip markdown code fences and parse JSON response
    const cleanedContent = stripMarkdownCodeFences(content);
    try {
      const parsed = JSON.parse(cleanedContent);
      
      if (!parsed.options || !Array.isArray(parsed.options) || parsed.options.length !== 2) {
        throw new Error('Jamie did not return exactly 2 options');
      }
      
      return parsed.options.map((opt: any) => ({
        id: opt.id,
        label: opt.label || 'Rewrite',
        rationale: opt.rationale || '',
        text: opt.text || ''
      }));
    } catch (parseError) {
      console.error('Failed to parse Jamie Polish response:', cleanedContent);
      throw new Error('Jamie returned an invalid response format. Please try again.');
    }
  } catch (error) {
    console.error('Error generating polish options:', error);
    throw error;
  }
}