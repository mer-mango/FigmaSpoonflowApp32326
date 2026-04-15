/**
 * Content Item Type Definitions
 * Core types for the content management system
 */

export type ContentStatus = 'Idea' | 'Drafting' | 'Review' | 'Scheduled' | 'Published' | 'Repurposing';

export type Platform = 'LI Post' | 'LI Article' | 'SS Post' | 'SS Audio' | '';

export interface ContentItem {
  id: string;
  title: string;
  platform: Platform;
  length?: string;
  summary?: string;
  notes?: string;
  sourceUrl?: string;
  sourceContent?: string;
  source?: string;
  sourceAuthor?: string;
  audiences?: string[];
  goals?: string[];
  tone?: string | string[];
  mainPoints?: string[];
  importantQuotes?: string[];
  povAngles?: string[];
  selectedPovAngles?: string[]; // User-selected POV angles to use in Draft Builder
  selectedMainPoints?: string[]; // User-selected main points to use in Draft Builder
  selectedImportantQuotes?: string[]; // User-selected important quotes to use in Draft Builder
  status: ContentStatus;
  tags?: string[];
  scheduledDate?: string;
  publishedDate?: string;
  publishedUrl?: string;
  lastUpdated: string;
  createdOn: string;
  wordCount: number;
  content: string;
  outline?: string;
  moduleDraft?: Record<string, string>; // For outline mode: stores content by module key
  outlineMode?: boolean; // Whether outline mode is enabled
  inWorkingOnNow?: boolean;
  startedDraftingAtISO?: string;
  repurpose?: {
    sourceId?: string;
    childrenIds?: string[];
    initiatedAtISO?: string;
    skippedAtISO?: string;
  };
  repurposeMeta?: {
    sourceId: string;
    createdFromPublish?: boolean;
    createdAtISO: string;
  };
}

export interface RepurposeOutput {
  title: string;
  platform: Platform;
  notes?: string;
}

export interface RepurposeOption {
  id: string;
  platform: Platform;
  description: string;
  rationale: string;
}

export interface BrainDump {
  id: string;
  contentItemId: string;
  text: string;
  createdAt: string;
}

export interface JamieSourceAnalysis {
  keyPoints: string[];
  suggestedAngles: string[];
  audienceInsights: string[];
  credibilityOpportunities: string[];
}

/**
 * Repurposing Options Library
 * These are the canonical options shown in the RepurposingModal
 */
export const REPURPOSE_OPTIONS: RepurposeOption[] = [
  {
    id: 'li-post-key-points',
    platform: 'LI Post',
    description: 'Pull out 3-5 key insights as a standalone post',
    rationale: 'This repurpose option is ideal for highlighting the most important takeaways from your original content, making it easy for LinkedIn followers to quickly grasp the main points.'
  },
  {
    id: 'li-carousel',
    platform: 'LI Post',
    description: 'Convert to visual carousel (5-10 slides)',
    rationale: 'A visual carousel can help engage LinkedIn followers with a series of images or infographics, making your content more visually appealing and easier to digest.'
  },
  {
    id: 'ss-audio',
    platform: 'SS Audio',
    description: 'Record audio version with personal commentary',
    rationale: 'Creating an audio version of your content allows you to reach a wider audience, including those who prefer listening to reading. Personal commentary adds a human touch and can make your content more relatable.'
  },
  {
    id: 'ss-post-deep-dive',
    platform: 'SS Post',
    description: 'Expand into longer-form Substack essay',
    rationale: 'A longer-form essay on Substack can provide a deeper dive into your topic, offering more detailed analysis and insights. This is great for engaging your email subscribers with in-depth content.'
  },
  {
    id: 'li-article-expanded',
    platform: 'LI Article',
    description: 'Turn into detailed how-to article',
    rationale: 'A detailed how-to article on LinkedIn can provide step-by-step instructions and valuable tips, making it a useful resource for your followers. This is ideal for sharing practical knowledge and expertise.'
  }
];