# Newsletter Extraction & Ranking Implementation
## Complete System: Email → Extracted Items → Scored & Ranked → Top 5

---

## 📥 INPUT: Newsletter Email

```typescript
interface NewsletterEmail {
  email_id: string;
  sender_name: string;
  sender_email: string;
  subject: string;
  received_at: string; // ISO timestamp
  email_html: string;
  email_text: string;
}
```

---

## 🔧 STEP A0: PRE-PROCESSING (Before AI)

### **Purpose:** 
Reduce AI cost, improve accuracy, avoid parsing junk

### **Implementation:**

```typescript
// /utils/newsletterPreprocessor.ts

interface CandidateBlock {
  text: string;
  url?: string;
  position: number;
}

export function preprocessNewsletter(email: NewsletterEmail): CandidateBlock[] {
  // Step 1: Strip boilerplate
  const cleanedHtml = stripBoilerplate(email.email_html);
  
  // Step 2: Extract candidate links
  const links = extractCandidateLinks(cleanedHtml);
  
  // Step 3: Create candidate blocks
  const blocks = createCandidateBlocks(cleanedHtml, links);
  
  return blocks;
}

// Strip common newsletter junk
function stripBoilerplate(html: string): string {
  let cleaned = html;
  
  // Remove unsubscribe blocks
  cleaned = cleaned.replace(
    /<div[^>]*>(.*?unsubscribe.*?)<\/div>/gis, 
    ''
  );
  
  // Remove "view in browser" blocks
  cleaned = cleaned.replace(
    /<div[^>]*>(.*?view.*?browser.*?)<\/div>/gis,
    ''
  );
  
  // Remove footer sections (common patterns)
  cleaned = cleaned.replace(
    /<footer[^>]*>.*?<\/footer>/gis,
    ''
  );
  
  // Remove privacy/preferences links
  cleaned = cleaned.replace(
    /<a[^>]*href="[^"]*privacy[^"]*"[^>]*>.*?<\/a>/gis,
    ''
  );
  cleaned = cleaned.replace(
    /<a[^>]*href="[^"]*preferences[^"]*"[^>]*>.*?<\/a>/gis,
    ''
  );
  
  // Remove social icon blocks
  cleaned = cleaned.replace(
    /<div[^>]*class="[^"]*social[^"]*"[^>]*>.*?<\/div>/gis,
    ''
  );
  
  // Remove sponsored blocks (optional - or just label them)
  cleaned = cleaned.replace(
    /<div[^>]*>(.*?sponsored.*?)<\/div>/gis,
    '<div data-sponsored="true">$1</div>' // Keep but mark
  );
  
  return cleaned;
}

// Extract links that look like articles
function extractCandidateLinks(html: string): string[] {
  const linkPattern = /<a[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/gi;
  const links: string[] = [];
  
  let match;
  while ((match = linkPattern.exec(html)) !== null) {
    const url = match[1];
    
    // Skip junk links
    if (
      url.startsWith('mailto:') ||
      url.startsWith('tel:') ||
      url.includes('unsubscribe') ||
      url.includes('privacy') ||
      url.includes('twitter.com') ||
      url.includes('facebook.com') ||
      url.includes('instagram.com') ||
      url.includes('linkedin.com/share') ||
      url.includes('preferences')
    ) {
      continue;
    }
    
    // Keep article-like links
    links.push(url);
  }
  
  return [...new Set(links)]; // Dedupe
}

// Create blocks of text around each link
function createCandidateBlocks(html: string, links: string[]): CandidateBlock[] {
  const blocks: CandidateBlock[] = [];
  
  // Convert HTML to plain text with structure preserved
  const plainText = htmlToPlainText(html);
  
  if (links.length === 0) {
    // No links found - treat entire email as one block
    return [{
      text: plainText.substring(0, 2000), // Limit size
      url: undefined,
      position: 0
    }];
  }
  
  // For each link, extract surrounding text
  links.forEach((url, index) => {
    // Find the link's position in HTML
    const linkIndex = html.indexOf(url);
    if (linkIndex === -1) return;
    
    // Extract ~300 chars before and after the link
    const start = Math.max(0, linkIndex - 300);
    const end = Math.min(html.length, linkIndex + 300);
    const contextHtml = html.substring(start, end);
    
    // Convert to plain text
    const contextText = htmlToPlainText(contextHtml);
    
    // Extract headline-ish line (usually bold or h2/h3)
    const headline = extractHeadline(contextHtml) || contextText.split('\n')[0];
    
    // Extract 1-4 lines of description
    const description = extractDescription(contextText, 4);
    
    blocks.push({
      text: `${headline}\n\n${description}`.trim(),
      url: url,
      position: index
    });
  });
  
  return blocks;
}

// Helper: Extract headline from HTML
function extractHeadline(html: string): string | null {
  // Try h2, h3, strong, b tags
  const patterns = [
    /<h2[^>]*>(.*?)<\/h2>/i,
    /<h3[^>]*>(.*?)<\/h3>/i,
    /<strong[^>]*>(.*?)<\/strong>/i,
    /<b[^>]*>(.*?)<\/b>/i,
  ];
  
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      return htmlToPlainText(match[1]).trim();
    }
  }
  
  return null;
}

// Helper: Extract description lines
function extractDescription(text: string, maxLines: number): string {
  const lines = text
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 20) // Skip too-short lines
    .slice(0, maxLines);
  
  return lines.join('\n');
}

// Helper: Convert HTML to plain text
function htmlToPlainText(html: string): string {
  return html
    .replace(/<style[^>]*>.*?<\/style>/gis, '') // Remove style tags
    .replace(/<script[^>]*>.*?<\/script>/gis, '') // Remove scripts
    .replace(/<[^>]+>/g, ' ') // Remove all HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ') // Collapse whitespace
    .trim();
}
```

---

## 🤖 STEP A1: AI EXTRACTION

### **Purpose:**
Convert candidate blocks into structured story items

### **Implementation:**

```typescript
// /utils/newsletterExtraction.ts

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

interface ExtractedItem {
  title: string;
  url: string | null;
  extracted_excerpt: string;
  source_name: string;
  received_at: string;
  parent_email_id: string;
}

export async function extractNewsletterItems(
  email: NewsletterEmail,
  candidateBlocks: CandidateBlock[]
): Promise<ExtractedItem[]> {
  
  const systemMessage = "You are Jamie. Be clear and unfussy. Output valid JSON only.";
  
  const userPrompt = `
You are extracting individual content items from a newsletter email.

Return JSON only.

NEWSLETTER METADATA:
- sender_name: ${email.sender_name}
- sender_email: ${email.sender_email}
- received_at: ${email.received_at}
- email_id: ${email.email_id}

CANDIDATE BLOCKS:
${JSON.stringify(candidateBlocks, null, 2)}

TASK:
1) Identify distinct story/article items (often multiple per newsletter).
2) For each item, return:
   - title (best available, concise)
   - url (if present)
   - extracted_excerpt (1–3 sentences pulled from the email that best summarizes the item; no fluff)
   - source_name (use sender_name)
   - received_at (use the email received_at)
   - parent_email_id (use email_id)

RULES:
- Ignore unsubscribe/privacy/social-follow/share links.
- If multiple blocks refer to the same story, merge them.
- If a story has no URL, keep it anyway with url=null.
- Aim for 3–15 items per newsletter if applicable.
- Output must be valid JSON matching this schema:

{
  "items": [
    {
      "title": "...",
      "url": "..." | null,
      "extracted_excerpt": "...",
      "source_name": "...",
      "received_at": "...",
      "parent_email_id": "..."
    }
  ]
}
  `.trim();
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.3, // Lower temp for structured extraction
      response_format: { type: "json_object" } // Force JSON response
    });
    
    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);
    
    return parsed.items || [];
    
  } catch (error) {
    console.error('Newsletter extraction error:', error);
    throw new Error(`Failed to extract newsletter items: ${error.message}`);
  }
}
```

---

## 📊 STEP B0: DETERMINISTIC SCORING

### **Purpose:**
Score each extracted item against Meredith's AI profile (deterministic, debuggable)

### **Implementation:**

```typescript
// /utils/contentScoring.ts

import type { AIProfile } from '../types/AIProfile';
import type { ExtractedItem } from './newsletterExtraction';

interface ScoredItem extends ExtractedItem {
  relevance_score_baseline: number;
  matched_focus_areas: string[];
  matched_keywords: string[];
  scoring_breakdown: {
    high_focus_hits: number;
    medium_high_hits: number;
    medium_hits: number;
    prioritize_hits: number;
    avoid_hits: number;
    penalties: number;
  };
}

export function scoreExtractedItems(
  items: ExtractedItem[],
  aiProfile: AIProfile
): ScoredItem[] {
  return items.map(item => {
    const score = calculateRelevanceScore(item, aiProfile);
    return {
      ...item,
      ...score
    };
  });
}

function calculateRelevanceScore(
  item: ExtractedItem,
  aiProfile: AIProfile
): {
  relevance_score_baseline: number;
  matched_focus_areas: string[];
  matched_keywords: string[];
  scoring_breakdown: any;
} {
  const { interest_profile } = aiProfile;
  
  // Combine title + excerpt for matching
  const text = `${item.title} ${item.extracted_excerpt}`.toLowerCase();
  
  let points = 0;
  const matched_focus_areas: string[] = [];
  const matched_keywords: string[] = [];
  const breakdown = {
    high_focus_hits: 0,
    medium_high_hits: 0,
    medium_hits: 0,
    prioritize_hits: 0,
    avoid_hits: 0,
    penalties: 0
  };
  
  // 1. Check HIGH weight focus areas (+12 each, cap 5)
  const highAreas = interest_profile.focus_areas.filter(f => f.weight === 'HIGH');
  highAreas.forEach(area => {
    const hits = countKeywordMatches(text, area.keywords);
    if (hits > 0) {
      matched_focus_areas.push(area.name);
      const cappedHits = Math.min(hits, 5);
      breakdown.high_focus_hits += cappedHits;
      points += cappedHits * 12;
    }
  });
  
  // 2. Check MEDIUM_HIGH focus areas (+8 each, cap 5)
  const medHighAreas = interest_profile.focus_areas.filter(f => f.weight === 'MEDIUM_HIGH');
  medHighAreas.forEach(area => {
    const hits = countKeywordMatches(text, area.keywords);
    if (hits > 0) {
      matched_focus_areas.push(area.name);
      const cappedHits = Math.min(hits, 5);
      breakdown.medium_high_hits += cappedHits;
      points += cappedHits * 8;
    }
  });
  
  // 3. Check MEDIUM focus areas (+5 each, cap 5)
  const medAreas = interest_profile.focus_areas.filter(f => f.weight === 'MEDIUM');
  medAreas.forEach(area => {
    const hits = countKeywordMatches(text, area.keywords);
    if (hits > 0) {
      matched_focus_areas.push(area.name);
      const cappedHits = Math.min(hits, 5);
      breakdown.medium_hits += cappedHits;
      points += cappedHits * 5;
    }
  });
  
  // 4. Check prioritize keywords (+3 each, cap 8)
  const prioritizeHits = countKeywordMatches(text, interest_profile.prioritize_keywords);
  breakdown.prioritize_hits = Math.min(prioritizeHits, 8);
  points += breakdown.prioritize_hits * 3;
  
  // Store matched keywords for display
  interest_profile.prioritize_keywords.forEach(keyword => {
    if (text.includes(keyword.toLowerCase())) {
      matched_keywords.push(keyword);
    }
  });
  
  // 5. Check avoid keywords (-25 each, cap 2)
  const avoidHits = countKeywordMatches(text, interest_profile.avoid_keywords);
  breakdown.avoid_hits = Math.min(avoidHits, 2);
  points -= breakdown.avoid_hits * 25;
  
  // 6. Penalties
  if (!item.title || item.title.length < 5) {
    points -= 10;
    breakdown.penalties -= 10;
  }
  
  if (item.extracted_excerpt.length < 120) {
    points -= 5;
    breakdown.penalties -= 5;
  }
  
  // Normalize to 0-100
  const maxPossibleScore = (5 * 12) + (5 * 8) + (5 * 5) + (8 * 3); // 185
  const normalizedScore = Math.max(0, Math.min(100, (points / maxPossibleScore) * 100));
  
  return {
    relevance_score_baseline: Math.round(normalizedScore),
    matched_focus_areas: [...new Set(matched_focus_areas)], // Dedupe
    matched_keywords: [...new Set(matched_keywords)],
    scoring_breakdown: breakdown
  };
}

// Helper: Count how many keywords match in text
function countKeywordMatches(text: string, keywords: string[]): number {
  let count = 0;
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches) count += matches.length;
  });
  return count;
}
```

---

## 🏆 STEP B0.5: TOP 5 SELECTION (Diversity Rules)

### **Purpose:**
Select best 5 items with diversity constraints

### **Implementation:**

```typescript
// /utils/contentRanking.ts

export function selectTop5(
  scoredItems: ScoredItem[]
): ScoredItem[] {
  // Sort by score descending
  const sorted = [...scoredItems].sort(
    (a, b) => b.relevance_score_baseline - a.relevance_score_baseline
  );
  
  // Take top 7 candidates
  const top7 = sorted.slice(0, 7);
  
  // Apply diversity rules
  const selected: ScoredItem[] = [];
  const sourceCount = new Map<string, number>();
  const focusAreaCount = new Map<string, number>();
  
  for (const item of top7) {
    if (selected.length >= 5) break;
    
    // Rule 1: Max 2 items per source
    const currentSourceCount = sourceCount.get(item.source_name) || 0;
    if (currentSourceCount >= 2) {
      continue; // Skip this item
    }
    
    // Rule 2: Prefer diversity in focus areas (soft rule)
    const itemFocusAreas = item.matched_focus_areas;
    let alreadyHasFocusArea = false;
    itemFocusAreas.forEach(area => {
      if ((focusAreaCount.get(area) || 0) >= 2) {
        alreadyHasFocusArea = true;
      }
    });
    
    // If we already have 2+ items with this focus area AND there are other candidates, skip
    if (alreadyHasFocusArea && selected.length < 3) {
      // Only enforce this rule if we're still building the list
      continue;
    }
    
    // Add to selected
    selected.push(item);
    
    // Update counters
    sourceCount.set(item.source_name, currentSourceCount + 1);
    itemFocusAreas.forEach(area => {
      focusAreaCount.set(area, (focusAreaCount.get(area) || 0) + 1);
    });
  }
  
  // If we still don't have 5, fill from remaining top 7
  if (selected.length < 5) {
    for (const item of top7) {
      if (selected.length >= 5) break;
      if (!selected.includes(item)) {
        selected.push(item);
      }
    }
  }
  
  return selected;
}
```

---

## 🤖 STEP B1: OPTIONAL AI RE-RANK (Advanced)

### **Purpose:**
Use AI to refine ordering and assign content pillar tags

### **Implementation:**

```typescript
// /utils/aiReranking.ts

export async function aiRerank(
  top10Items: ScoredItem[],
  aiProfile: AIProfile
): Promise<{
  id: string;
  final_relevance_score: number;
  tags: string[];
  one_sentence_reason: string;
}[]> {
  
  const systemMessage = "You are Jamie. Be clear and unfussy. Output valid JSON only.";
  
  const userPrompt = `
Return JSON only.

You are helping rank and tag content items for Meredith's Content Ideas Inbox.

AI PROFILE:
${JSON.stringify({
  focus_areas: aiProfile.interest_profile.focus_areas,
  prioritize_keywords: aiProfile.interest_profile.prioritize_keywords,
  avoid_keywords: aiProfile.interest_profile.avoid_keywords,
  tagging_rules: aiProfile.tagging_rules
}, null, 2)}

CANDIDATE ITEMS (already pre-scored):
${JSON.stringify(top10Items.map(item => ({
  id: item.parent_email_id + '_' + item.url, // Unique ID
  title: item.title,
  excerpt: item.extracted_excerpt,
  baseline_score: item.relevance_score_baseline,
  matched_focus_areas: item.matched_focus_areas
})), null, 2)}

TASK:
- Re-rank these items into the best Top 5 for Meredith based on interest_profile weights and keywords.
- Provide for each item:
  - id
  - final_relevance_score (0–100)
  - tags (0–3) chosen ONLY from these: ${aiProfile.tagging_rules.tags.join(', ')}
  - one_sentence_reason (why it fits her wheelhouse)

RULES:
- Favor HIGH-weight focus areas.
- Avoid hype topics and anything matching avoid_keywords.
- Prefer variety across tags when possible.
- Output JSON schema:

{
  "ranked": [
    {"id":"...", "final_relevance_score": 0, "tags":["..."], "one_sentence_reason":"..."}
  ]
}
  `.trim();
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.4,
      response_format: { type: "json_object" }
    });
    
    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);
    
    return parsed.ranked || [];
    
  } catch (error) {
    console.error('AI re-ranking error:', error);
    throw new Error(`Failed to re-rank items: ${error.message}`);
  }
}
```

---

## 🔄 COMPLETE FLOW: End-to-End

```typescript
// /utils/processNewsletter.ts

import { preprocessNewsletter } from './newsletterPreprocessor';
import { extractNewsletterItems } from './newsletterExtraction';
import { scoreExtractedItems } from './contentScoring';
import { selectTop5 } from './contentRanking';
import { aiRerank } from './aiReranking';
import type { AIProfile } from '../types/AIProfile';
import type { NewsletterEmail } from '../types/Newsletter';

export async function processNewsletter(
  email: NewsletterEmail,
  aiProfile: AIProfile,
  useAIRerank: boolean = false
): Promise<InboxItem[]> {
  
  console.log('📧 Processing newsletter:', email.subject);
  
  // STEP 1: Pre-process (strip boilerplate, extract blocks)
  console.log('🔧 Pre-processing...');
  const candidateBlocks = preprocessNewsletter(email);
  console.log(`Found ${candidateBlocks.length} candidate blocks`);
  
  // STEP 2: AI extraction (blocks → structured items)
  console.log('🤖 Extracting items with AI...');
  const extractedItems = await extractNewsletterItems(email, candidateBlocks);
  console.log(`Extracted ${extractedItems.length} items`);
  
  // STEP 3: Score items (deterministic)
  console.log('📊 Scoring items...');
  const scoredItems = scoreExtractedItems(extractedItems, aiProfile);
  
  // STEP 4: Select top 5 (with diversity)
  console.log('🏆 Selecting top 5...');
  let top5 = selectTop5(scoredItems);
  
  // STEP 5: Optional AI re-rank
  if (useAIRerank) {
    console.log('🤖 AI re-ranking...');
    const top10 = scoredItems.slice(0, 10);
    const reranked = await aiRerank(top10, aiProfile);
    
    // Merge reranked scores back into items
    top5 = top5.map(item => {
      const itemId = item.parent_email_id + '_' + item.url;
      const rerankedData = reranked.find(r => r.id === itemId);
      
      if (rerankedData) {
        return {
          ...item,
          relevance_score: rerankedData.final_relevance_score,
          suggestedTags: rerankedData.tags,
          aiReason: rerankedData.one_sentence_reason
        };
      }
      
      return item;
    });
  } else {
    // Use deterministic tags (map keywords to tags)
    top5 = top5.map(item => ({
      ...item,
      relevance_score: item.relevance_score_baseline,
      suggestedTags: mapFocusAreasToTags(item.matched_focus_areas, aiProfile),
      aiReason: `Matches: ${item.matched_focus_areas.join(', ')}`
    }));
  }
  
  // STEP 6: Convert to InboxItem format
  const inboxItems: InboxItem[] = top5.map((item, index) => ({
    id: `${email.email_id}_${index}`,
    sourceType: 'newsletter',
    sourceUrl: item.url || undefined,
    sourceText: item.extracted_excerpt,
    sourceName: item.source_name,
    status: 'new',
    relevanceScore: item.relevance_score,
    snippet: item.extracted_excerpt,
    hook: item.title, // We'll generate better hooks in Chunk 2
    suggestedTags: item.suggestedTags || [],
    extractedAt: new Date(item.received_at),
    matchedFocusAreas: item.matched_focus_areas,
    matchedKeywords: item.matched_keywords,
    scoringBreakdown: item.scoring_breakdown
  }));
  
  console.log('✅ Processing complete!');
  return inboxItems;
}

// Helper: Map focus area names to content pillar tags
function mapFocusAreasToTags(
  focusAreas: string[],
  aiProfile: AIProfile
): string[] {
  const { focus_areas } = aiProfile.interest_profile;
  const { tags: validTags } = aiProfile.tagging_rules;
  
  const mappedTags: string[] = [];
  
  focusAreas.forEach(areaName => {
    const area = focus_areas.find(f => f.name === areaName);
    if (area && validTags.includes(area.id)) {
      mappedTags.push(area.id);
    }
  });
  
  return mappedTags.slice(0, 3); // Max 3 tags
}
```

---

## 📦 OUTPUT: InboxItem

```typescript
// /types/InboxItem.ts

export interface InboxItem {
  id: string;
  sourceType: 'newsletter' | 'url' | 'quick_text';
  sourceUrl?: string;
  sourceText?: string;
  sourceName?: string;
  status: 'new' | 'saved' | 'dismissed';
  relevanceScore: number; // 0-100
  snippet: string; // AI-generated excerpt
  hook: string; // AI-generated hook (will be enhanced in Chunk 2)
  suggestedTags: string[]; // Content pillar tags
  extractedAt: Date;
  dismissedAt?: Date; // For 15s undo
  
  // Debug info
  matchedFocusAreas?: string[];
  matchedKeywords?: string[];
  scoringBreakdown?: any;
  aiReason?: string; // One-sentence explanation
}
```

---

## ✅ SUMMARY: What Builder Gets

### **Files to Create:**

1. `/utils/newsletterPreprocessor.ts` - Strip boilerplate, extract blocks
2. `/utils/newsletterExtraction.ts` - AI extraction prompt
3. `/utils/contentScoring.ts` - Deterministic scoring algorithm
4. `/utils/contentRanking.ts` - Top 5 selection with diversity
5. `/utils/aiReranking.ts` - Optional AI re-rank
6. `/utils/processNewsletter.ts` - Complete end-to-end flow
7. `/types/InboxItem.ts` - Output interface

### **How It Works:**

```
Newsletter Email
    ↓
Pre-process (strip junk, extract blocks)
    ↓
AI Extract (blocks → structured items)
    ↓
Score (deterministic, 0-100)
    ↓
Select Top 5 (diversity rules)
    ↓
Optional: AI Re-rank (refine + tag)
    ↓
InboxItem[] ready for display
```

### **Integration with Architecture:**

```typescript
// In ContentIdeasInbox.tsx

const handleAddNewsletter = async (email: NewsletterEmail) => {
  setLoading(true);
  
  try {
    const inboxItems = await processNewsletter(
      email,
      aiProfile,
      aiProfile.useAIRerank // From settings
    );
    
    setInboxItems([...inboxItems, ...existingInboxItems]);
    toast.success(`Added ${inboxItems.length} ideas from ${email.sender_name}`);
  } catch (error) {
    toast.error('Failed to process newsletter');
    console.error(error);
  } finally {
    setLoading(false);
  }
};
```

---

## 🎯 READY FOR CHUNK 2!

This chunk handles **newsletter → ranked Top 5**. 

Chunk 2 will cover:
- Better hook generation (Meredith's voice)
- Snippet enhancement
- Status transitions (save/dismiss/undo)
- UI for inbox display

The foundation is rock-solid! 🚀
