/**
 * Jamie's Memory System
 * Allows Jamie to learn about Meredith over time and reference past context
 * Like ChatGPT's memory feature - builds understanding through interactions
 */

export interface JamieMemory {
  id: string;
  category: 'content' | 'project' | 'relationship' | 'preference' | 'learning' | 'meeting';
  timestamp: Date;
  title: string;
  content: string;
  tags: string[];
  metadata?: {
    // For content memories
    contentType?: 'linkedin' | 'substack' | 'article' | 'email';
    topics?: string[];
    published?: boolean;
    
    // For project memories
    projectName?: string;
    status?: string;
    
    // For relationship memories
    contactName?: string;
    contactId?: string;
    relationshipType?: 'client' | 'partner' | 'prospect' | 'community';
    
    // For preference memories
    preferenceType?: 'energy' | 'workflow' | 'communication' | 'content';
    
    // For meeting memories
    meetingWith?: string;
    keyDecisions?: string[];
    nextSteps?: string[];
  };
}

// ===== MEMORY STORAGE =====

const MEMORY_STORAGE_KEY = 'jamie_memory_v1';

export function getAllMemories(): JamieMemory[] {
  try {
    const stored = localStorage.getItem(MEMORY_STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored).map((m: any) => ({
      ...m,
      timestamp: new Date(m.timestamp)
    }));
  } catch (error) {
    console.error('Failed to load Jamie memories:', error);
    return [];
  }
}

export function saveMemory(memory: Omit<JamieMemory, 'id' | 'timestamp'>): JamieMemory {
  const newMemory: JamieMemory = {
    ...memory,
    id: `mem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date()
  };
  
  const memories = getAllMemories();
  memories.push(newMemory);
  
  try {
    localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(memories));
    console.log('[Jamie Memory] Saved:', newMemory.title);
  } catch (error) {
    console.error('Failed to save Jamie memory:', error);
  }
  
  return newMemory;
}

export function updateMemory(id: string, updates: Partial<JamieMemory>): void {
  const memories = getAllMemories();
  const index = memories.findIndex(m => m.id === id);
  
  if (index !== -1) {
    memories[index] = { ...memories[index], ...updates };
    try {
      localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(memories));
      console.log('[Jamie Memory] Updated:', memories[index].title);
    } catch (error) {
      console.error('Failed to update Jamie memory:', error);
    }
  }
}

export function deleteMemory(id: string): void {
  const memories = getAllMemories();
  const filtered = memories.filter(m => m.id !== id);
  
  try {
    localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(filtered));
    console.log('[Jamie Memory] Deleted memory');
  } catch (error) {
    console.error('Failed to delete Jamie memory:', error);
  }
}

// ===== MEMORY QUERYING =====

export function searchMemories(query: string): JamieMemory[] {
  const memories = getAllMemories();
  const lowerQuery = query.toLowerCase();
  
  return memories.filter(m => {
    return (
      m.title.toLowerCase().includes(lowerQuery) ||
      m.content.toLowerCase().includes(lowerQuery) ||
      m.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export function getMemoriesByCategory(category: JamieMemory['category']): JamieMemory[] {
  return getAllMemories()
    .filter(m => m.category === category)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export function getMemoriesByTag(tag: string): JamieMemory[] {
  return getAllMemories()
    .filter(m => m.tags.some(t => t.toLowerCase() === tag.toLowerCase()))
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export function getMemoriesByContact(contactName: string): JamieMemory[] {
  return getAllMemories()
    .filter(m => m.metadata?.contactName?.toLowerCase() === contactName.toLowerCase())
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export function getMemoriesByProject(projectName: string): JamieMemory[] {
  return getAllMemories()
    .filter(m => m.metadata?.projectName?.toLowerCase() === projectName.toLowerCase())
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export function getRecentMemories(limit: number = 10): JamieMemory[] {
  return getAllMemories()
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);
}

export function getMemoriesByDateRange(startDate: Date, endDate: Date): JamieMemory[] {
  return getAllMemories()
    .filter(m => m.timestamp >= startDate && m.timestamp <= endDate)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

// ===== MEMORY EXTRACTION =====

/**
 * Extracts and saves relevant memories from content creation
 */
export function saveContentMemory(
  title: string,
  content: string,
  topics: string[],
  contentType: 'linkedin' | 'substack' | 'article' | 'email' = 'linkedin',
  published: boolean = false
): JamieMemory {
  return saveMemory({
    category: 'content',
    title: `Content: ${title}`,
    content: `You wrote about ${topics.join(', ')}. Key themes: ${content.substring(0, 200)}...`,
    tags: [...topics, contentType, 'writing'],
    metadata: {
      contentType,
      topics,
      published
    }
  });
}

/**
 * Saves project updates and milestones
 */
export function saveProjectMemory(
  projectName: string,
  update: string,
  status?: string,
  tags: string[] = []
): JamieMemory {
  return saveMemory({
    category: 'project',
    title: `${projectName} update`,
    content: update,
    tags: [projectName.toLowerCase(), ...tags],
    metadata: {
      projectName,
      status
    }
  });
}

/**
 * Saves relationship context and conversation notes
 */
export function saveRelationshipMemory(
  contactName: string,
  note: string,
  relationshipType: 'client' | 'partner' | 'prospect' | 'community',
  tags: string[] = [],
  contactId?: string
): JamieMemory {
  return saveMemory({
    category: 'relationship',
    title: `Conversation with ${contactName}`,
    content: note,
    tags: [contactName.toLowerCase(), relationshipType, ...tags],
    metadata: {
      contactName,
      contactId,
      relationshipType
    }
  });
}

/**
 * Saves meeting notes with decisions and next steps
 */
export function saveMeetingMemory(
  meetingWith: string,
  notes: string,
  keyDecisions: string[] = [],
  nextSteps: string[] = [],
  tags: string[] = []
): JamieMemory {
  return saveMemory({
    category: 'meeting',
    title: `Meeting with ${meetingWith}`,
    content: notes,
    tags: [meetingWith.toLowerCase(), 'meeting', ...tags],
    metadata: {
      meetingWith,
      keyDecisions,
      nextSteps
    }
  });
}

/**
 * Saves user preferences and what works/doesn't work
 */
export function savePreferenceMemory(
  preferenceType: 'energy' | 'workflow' | 'communication' | 'content',
  title: string,
  description: string,
  tags: string[] = []
): JamieMemory {
  return saveMemory({
    category: 'preference',
    title,
    content: description,
    tags: [preferenceType, ...tags],
    metadata: {
      preferenceType
    }
  });
}

/**
 * Saves insights Jamie learns about Meredith over time
 */
export function saveLearningMemory(
  learning: string,
  context: string,
  tags: string[] = []
): JamieMemory {
  return saveMemory({
    category: 'learning',
    title: learning,
    content: context,
    tags: ['insight', ...tags]
  });
}

// ===== SMART CONTEXT RETRIEVAL =====

/**
 * Gets relevant memories for a given context
 * This is what Jamie uses before generating responses
 */
export function getRelevantMemories(
  context: {
    type?: 'content' | 'meeting' | 'task' | 'relationship';
    topic?: string;
    contactName?: string;
    projectName?: string;
    timeframe?: 'recent' | 'week' | 'month' | 'all';
  }
): JamieMemory[] {
  let memories = getAllMemories();
  
  // Filter by type
  if (context.type) {
    memories = memories.filter(m => {
      if (context.type === 'content') return m.category === 'content';
      if (context.type === 'meeting') return m.category === 'meeting';
      if (context.type === 'relationship') return m.category === 'relationship';
      if (context.type === 'task') return m.category === 'project';
      return true;
    });
  }
  
  // Filter by topic/search
  if (context.topic) {
    const lowerTopic = context.topic.toLowerCase();
    memories = memories.filter(m => {
      return (
        m.title.toLowerCase().includes(lowerTopic) ||
        m.content.toLowerCase().includes(lowerTopic) ||
        m.tags.some(tag => tag.toLowerCase().includes(lowerTopic)) ||
        m.metadata?.topics?.some(t => t.toLowerCase().includes(lowerTopic))
      );
    });
  }
  
  // Filter by contact
  if (context.contactName) {
    memories = memories.filter(m => 
      m.metadata?.contactName?.toLowerCase() === context.contactName?.toLowerCase() ||
      m.metadata?.meetingWith?.toLowerCase() === context.contactName?.toLowerCase()
    );
  }
  
  // Filter by project
  if (context.projectName) {
    memories = memories.filter(m => 
      m.metadata?.projectName?.toLowerCase() === context.projectName?.toLowerCase()
    );
  }
  
  // Filter by timeframe
  if (context.timeframe) {
    const now = new Date();
    let cutoffDate = new Date();
    
    if (context.timeframe === 'recent') {
      cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Last 7 days
    } else if (context.timeframe === 'week') {
      cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (context.timeframe === 'month') {
      cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    if (context.timeframe !== 'all') {
      memories = memories.filter(m => m.timestamp >= cutoffDate);
    }
  }
  
  // Sort by recency
  return memories.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

/**
 * Analyzes content history to suggest new angles
 */
export function analyzeContentPatterns(): {
  topicsWrittenAbout: { topic: string; count: number }[];
  recentTopics: string[];
  contentGaps: string[];
  mostSuccessfulTypes: string[];
} {
  try {
    const contentMemories = getMemoriesByCategory('content');
    
    // Count topics
    const topicCounts: Record<string, number> = {};
    contentMemories.forEach(m => {
      const topics = m.metadata?.topics;
      if (Array.isArray(topics)) {
        topics.forEach(topic => {
          topicCounts[topic] = (topicCounts[topic] || 0) + 1;
        });
      }
    });
    
    const topicsWrittenAbout = Object.entries(topicCounts)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count);
    
    // Recent topics (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentMemories = contentMemories.filter(m => m.timestamp >= thirtyDaysAgo);
    const recentTopics = [...new Set(recentMemories.flatMap(m => {
      const topics = m.metadata?.topics;
      return Array.isArray(topics) ? topics : [];
    }))];
    
    // Content pillars that haven't been covered recently
    const contentPillars = [
      'co-design',
      'patient experience',
      'empathy as strategy',
      'participatory medicine',
      'patient language',
      'care journey',
      'health tech fit',
      'patient ecosystem'
    ];
    
    const contentGaps = contentPillars.filter(pillar => 
      !recentTopics.some(topic => topic.toLowerCase().includes(pillar.toLowerCase()))
    );
    
    // Most successful content types
    const typeCounts: Record<string, number> = {};
    contentMemories.forEach(m => {
      if (m.metadata?.contentType) {
        typeCounts[m.metadata.contentType] = (typeCounts[m.metadata.contentType] || 0) + 1;
      }
    });
    
    const mostSuccessfulTypes = Object.entries(typeCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([type]) => type);
    
    return {
      topicsWrittenAbout,
      recentTopics,
      contentGaps,
      mostSuccessfulTypes
    };
  } catch (error) {
    console.error('Error in analyzeContentPatterns:', error);
    // Return safe defaults
    return {
      topicsWrittenAbout: [],
      recentTopics: [],
      contentGaps: [],
      mostSuccessfulTypes: []
    };
  }
}

/**
 * Gets context summary for a contact (for meeting prep)
 */
export function getContactContext(contactName: string): {
  lastConversation?: JamieMemory;
  allNotes: JamieMemory[];
  relationshipType?: string;
  nextSteps?: string[];
  keyThemes: string[];
} {
  const memories = getMemoriesByContact(contactName);
  
  const lastConversation = memories[0];
  
  // Extract all next steps that haven't been marked done
  const nextSteps: string[] = [];
  memories.forEach(m => {
    if (m.metadata?.nextSteps) {
      nextSteps.push(...m.metadata.nextSteps);
    }
  });
  
  // Find common themes
  const allTags = memories.flatMap(m => m.tags);
  const tagCounts: Record<string, number> = {};
  allTags.forEach(tag => {
    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
  });
  
  const keyThemes = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag]) => tag);
  
  return {
    lastConversation,
    allNotes: memories,
    relationshipType: lastConversation?.metadata?.relationshipType,
    nextSteps: [...new Set(nextSteps)],
    keyThemes
  };
}

/**
 * Gets project timeline and status
 */
export function getProjectContext(projectName: string): {
  recentUpdates: JamieMemory[];
  currentStatus?: string;
  timeline: { date: Date; update: string }[];
} {
  const memories = getMemoriesByProject(projectName);
  
  const recentUpdates = memories.slice(0, 5);
  const currentStatus = recentUpdates[0]?.metadata?.status;
  
  const timeline = memories.map(m => ({
    date: m.timestamp,
    update: m.content
  }));
  
  return {
    recentUpdates,
    currentStatus,
    timeline
  };
}

// ===== MEMORY INITIALIZATION =====

/**
 * Seeds initial memories from Jamie DNA
 * This ensures Jamie starts with baseline knowledge
 */
export function seedInitialMemories(): void {
  const existing = getAllMemories();
  if (existing.length > 0) {
    console.log('[Jamie Memory] Memories already exist, skipping seed');
    return;
  }
  
  console.log('[Jamie Memory] Seeding initial memories...');
  
  // ===== WHO MEREDITH IS =====
  
  saveLearningMemory(
    'Meredith is a Patient Experience & Engagement Strategy Advisor (CPXP)',
    'She partners with digital health and health tech teams to align products with the real patient journey and care-continuum dynamics. Her work is shaped by both professional expertise and lived patient experience with multiple chronic conditions.',
    ['professional-identity', 'expertise', 'patient-advocate']
  );
  
  // ===== ENERGY & CHRONIC ILLNESS =====
  
  savePreferenceMemory(
    'energy',
    'Not a morning person - Peak focus 12pm-3pm',
    'Prefer slow starts before 11am. Peak focus window is 12pm-3pm. Lighter tasks after 3:30pm. Hard stop at 6:30pm. Chronic illness means fluctuating energy.',
    ['energy', 'schedule', 'focus', 'chronic-illness']
  );
  
  saveLearningMemory(
    'Spoon management is essential',
    'Chronic illness means energy is limited and fluctuates. Always respect bandwidth. Help reduce cognitive load, decision fatigue, and context-switching. Gentle mode for low-energy days. No productivity guilt.',
    ['chronic-illness', 'energy', 'spoons', 'support']
  );
  
  // ===== HOW MEREDITH THINKS & WORKS =====
  
  savePreferenceMemory(
    'workflow',
    'Systems thinker who wants to see connections',
    'Meredith is a systems thinker - she wants to see how pieces connect (patient journeys, product features, operations, messaging). She appreciates structure: clear headings, bullets, tables, frameworks, step-by-step flows.',
    ['systems-thinking', 'structure', 'workflow']
  );
  
  savePreferenceMemory(
    'workflow',
    'Prefers actionable, copy-paste-ready outputs',
    'She likes actionable outputs she can use immediately: wireframe outlines, draft emails, full LinkedIn posts, schema definitions. Not abstract advice - actual deliverables.',
    ['actionable', 'practical', 'workflow']
  );
  
  savePreferenceMemory(
    'workflow',
    'Blends story + strategy in her work',
    'She often blends story + strategy: start from real patient or personal experience, then draw out implications and practical takeaways for digital health teams.',
    ['storytelling', 'strategy', 'approach']
  );
  
  savePreferenceMemory(
    'workflow',
    'Struggles with perfectionism',
    'Benefits from rough drafts and small first steps. "Get Me Started" feature helps overcome paralysis by doing the work, not giving advice. Just start it for her.',
    ['perfectionism', 'workflow', 'support']
  );
  
  savePreferenceMemory(
    'workflow',
    'Summarize complex topics first, then offer detail',
    'If something is complex, summarize first, then offer detail. This reduces cognitive load and helps her decide how deep to go.',
    ['communication', 'complexity', 'cognitive-load']
  );
  
  // ===== VOICE & TONE GUIDELINES =====
  
  savePreferenceMemory(
    'content',
    'Voice: Empathetic, human, confident, encouraging, clear, conversational',
    'Not stiff, cheesy, or hypey. "Meredith Real Talk" — thoughtful and nuanced, but said like a real person would say it. Grounded in experience, but not arrogant. She leads with care, nuance, and credibility.',
    ['voice', 'tone', 'writing']
  );
  
  savePreferenceMemory(
    'content',
    'Always write in first person ("I"), never "we" or "our team"',
    'Clear over clever. Grounded over grandiose. Specific over vague. She is a solo consultant, not a team.',
    ['voice', 'writing', 'style']
  );
  
  savePreferenceMemory(
    'content',
    'Use strong, attention-grabbing first sentences',
    'Start with narrative hooks that lead into analysis and takeaways. Use concrete examples from real patient life, not abstractions.',
    ['writing', 'hooks', 'engagement']
  );
  
  savePreferenceMemory(
    'content',
    'It\'s okay to acknowledge complex emotions',
    'Acknowledge frustration, relief, grief, hope, and complexity—especially around the patient experience. Don\'t sanitize the messy reality.',
    ['voice', 'emotion', 'authenticity']
  );
  
  savePreferenceMemory(
    'content',
    'Preferred phrases: "speak patient," "patient journey," "care continuum"',
    'Also likes: "real-life constraints," "nuance," "connection." These are her vocabulary.',
    ['language', 'terminology', 'writing']
  );
  
  // ===== BANNED WORDS & PHRASES =====
  
  savePreferenceMemory(
    'content',
    'NEVER use these phrases in her voice',
    'Banned: "nice-to-have," "in the evolving landscape," "is rooted in," "deep insights," "deeply" as filler, "unlock the power of," "buzzword," "let\'s face it," "let\'s be real," "it\'sn\'t about X it was about Y," "embed/embedded" in branding contexts, "game-changing," "transforming healthcare at scale." Avoid motivational tone, corporate jargon, empty buzzwords, and patronizing "thought leader" clichés.',
    ['voice', 'writing', 'banned-words', 'style-guide']
  );
  
  // ===== FORMATTING PREFERENCES =====
  
  savePreferenceMemory(
    'content',
    'Format with headings, bullets, short paragraphs',
    'Use headings + subheadings for skimmability. Bulleted or numbered lists. Short paragraphs - avoid walls of text. Always prioritize readability.',
    ['formatting', 'structure', 'readability']
  );
  
  savePreferenceMemory(
    'content',
    'Offer 3-5 options for important items',
    'For titles, CTAs, taglines, key paragraphs - give multiple strong options instead of just one. Let her choose what resonates.',
    ['options', 'choices', 'workflow']
  );
  
  savePreferenceMemory(
    'workflow',
    'Anticipate downstream needs',
    'If you draft a meeting dossier, also propose follow-up email language. If you create a framework, suggest how it shows up on a slide or in a client proposal. Think ahead.',
    ['anticipation', 'comprehensive', 'helpful']
  );
  
  // ===== CURRENT PROJECTS =====
  
  saveProjectMemory(
    'BiteLabs',
    'Partnership with Jason. Teaching PX course (likely late Feb/early March). Exploring programming for fellows/alumni/faculty.',
    'active',
    ['partnership', 'teaching', 'curriculum']
  );
  
  saveProjectMemory(
    'NHC PXI',
    'High-priority relationship with Spencer at National Health Council Patient Experience Innovation Center. Exploring collaboration on patient-centered co-design, curriculum, and advisory work.',
    'prospect',
    ['high-priority', 'curriculum', 'advisory', 'spencer']
  );
  
  saveProjectMemory(
    'Chronically Me',
    'Partnership exploration with Sophie on accelerator for young adults in digital health. Potential roles: strategic partner, curriculum creator, workshop facilitator.',
    'exploring',
    ['partnership', 'curriculum', 'sophie', 'young-adults']
  );
  
  saveProjectMemory(
    'CPP',
    'Board member of Chronic Pain Project. Focus: annual planning, fundraising, programming for artists living with chronic pain.',
    'active',
    ['board', 'nonprofit', 'chronic-pain', 'artists']
  );
  
  // ===== WHAT MEREDITH WORKS ON =====
  
  saveLearningMemory(
    'Common work categories: Brand & Marketing Copy',
    'Website copy (hero sections, About, Services, case studies). LinkedIn posts, carousels, articles. Substack newsletters and Notes. Email sequences, outreach, intros, follow-ups. CTAs, taglines, value propositions.',
    ['content-types', 'marketing', 'writing']
  );
  
  saveLearningMemory(
    'Common work categories: Thought Leadership & Education',
    'Frameworks and mini-courses on patient experience. Presentation outlines, slide copy, speaker scripts. Workshop agendas, exercises, discussion prompts.',
    ['education', 'teaching', 'frameworks', 'workshops']
  );
  
  saveLearningMemory(
    'Common work categories: Product & Service Design',
    'Structuring services and offers (audits, advisory, co-design, training). Mapping patient journeys for digital tools. Designing patient engagement mechanisms (advisory boards, pilots, feedback loops). Translating patient insights into product decisions.',
    ['product-design', 'patient-experience', 'strategy']
  );
  
  saveLearningMemory(
    'Common work categories: Systems & App-Building (Jamie/SpoonFlow)',
    'Writing prompts for Figma AI Builder. Designing schemas (contacts, tasks, routines, goals, interactions, content, documents). Defining flows like "Plan My Day," "Wind Down," meeting-prep wizards. Logic rules, edge cases, automations.',
    ['app-building', 'systems', 'technical']
  );
  
  saveLearningMemory(
    'Common work categories: Business-Building & Workflow',
    'Structuring day/week around energy management. Turning relationships into collaborations and paid projects. Productizing expertise into repeatable offers. Planning content calendars and repurposing content.',
    ['business', 'workflow', 'strategy', 'energy-management']
  );
  
  console.log('[Jamie Memory] Initial memories seeded with comprehensive Meredith profile');
}