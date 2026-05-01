# Content Management App - Standalone Extraction Guide

This guide contains everything you need to create a standalone Content Management application in a new Figma Make file.

## Overview

Your content features include:
- **Content Dashboard** with gallery, table, and calendar views
- **Blueprint System** (Perspective, Story, Education templates)
- **AI-Assisted Content Creation** with Jamie integration
- **Content Analytics** (word counts, status tracking, publishing schedule)
- **Content Wizard** for guided content creation

---

## FILES TO COPY

### 1. CORE CONTENT PAGES

```
/components/ContentPageRedesign.tsx
/components/muted_ContentPage_AllViews.tsx
/components/muted_ContentPage.tsx
/components/muted_ContentPage_Gallery.tsx
/components/muted_ContentPage_DesignA.tsx
/components/muted_ContentPage_DesignB.tsx
/components/muted_ContentPage_DesignC.tsx
/components/muted_ContentPage_Simple.tsx
/components/muted_ContentPage_NewViews.tsx
/components/ContentTableView.tsx
```

### 2. CONTENT MODALS & WIZARDS

```
/components/muted_NewContentModal.tsx
/components/muted_NewContentWizard.tsx
/components/muted_ContentWizard.tsx
/components/muted_ContentModal.tsx
/components/content/ContentDetailModal.tsx
/components/content/PostMeetingContentWizard.tsx
/components/content/ResumeWritingDialog.tsx
/components/content/ContentGoalReminder.tsx
```

### 3. CONTENT-SPECIFIC COMPONENTS

```
/components/content/JamieIdeaCard.tsx
/components/muted_InlineBlueprintTemplate.tsx
/components/muted_ContentAnalytics.tsx
/components/muted_DraftingFocusMode.tsx
```

### 4. DESIGN SELECTORS (if you want to keep design exploration)

```
/components/ContentPageDesignSelector.tsx
/components/muted_ContentGallery_DesignOptions.tsx
/components/muted_ContentGallery_Hybrid.tsx
```

### 5. SHARED COMPONENTS (Dependencies)

```
/components/shared/ (entire folder - contains Button, Input, etc.)
/components/ui/ (entire folder - contains UI primitives)
/components/SharedLayout_Muted.tsx
/components/PageHeader_Muted.tsx
/components/AICopilot.tsx (if you want Jamie AI features)
/components/GlobalJamiePanel.tsx (if you want Jamie AI features)
```

### 6. STYLING

```
/styles/globals.css
```

---

## CONTENT ITEM TYPE DEFINITION

Add this to your new App.tsx:

```typescript
export interface ContentItem {
  id: string;
  title: string;
  topic: string;
  targetAudience: string;
  platform: string;
  date: string;
  publishDate?: string;
  length: string;
  blueprintFamily: 'Perspective' | 'Story' | 'Education' | 'Social' | 'Email';
  blueprintSubtype: string;
  status: 'idea' | 'outlining' | 'drafting' | 'editing' | 'ready to schedule' | 'scheduled' | 'published' | 'archived';
  outline?: string;
  wordCount: number;
  content: string;
  workingOn?: boolean;
  notes?: string;
  tags?: string[];
  seoKeywords?: string[];
  images?: string[];
}
```

---

## MINIMAL APP.TSX STRUCTURE

```typescript
import React, { useState, useEffect } from 'react';
import { SharedLayout_Muted } from './components/SharedLayout_Muted';
import { MutedContentPage_Gallery } from './components/muted_ContentPage_Gallery';
import { NewContentModal } from './components/muted_NewContentModal';
import { ContentDetailModal } from './components/content/ContentDetailModal';
import './styles/globals.css';

export interface ContentItem {
  // ... (copy the interface from above)
}

function App() {
  const [currentPage, setCurrentPage] = useState('content');
  const [contentModalOpen, setContentModalOpen] = useState(false);
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  
  // Content items state with localStorage persistence
  const [allContentItems, setAllContentItems] = useState<ContentItem[]>(() => {
    try {
      const saved = localStorage.getItem('allContentItems');
      if (saved) return JSON.parse(saved);
      return [
        {
          id: '1',
          title: 'Why "Patient-Centered Care" Isn't Enough Anymore',
          topic: 'Patient Experience Evolution',
          targetAudience: 'Healthcare Executives',
          platform: 'LinkedIn',
          date: '2024-02-15',
          publishDate: '2024-02-20',
          length: 'Standard (250-500 words)',
          blueprintFamily: 'Perspective',
          blueprintSubtype: 'What Patients Wish You Knew',
          status: 'scheduled',
          outline: '1. The gap between care and experience\n2. What patients really want\n3. Actionable steps',
          wordCount: 420,
          content: 'Draft content goes here...',
          workingOn: true,
        },
        // Add more example items...
      ];
    } catch {
      return [];
    }
  });

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('allContentItems', JSON.stringify(allContentItems));
    } catch (error) {
      console.error('Failed to save content items:', error);
    }
  }, [allContentItems]);

  const selectedContent = selectedContentId 
    ? allContentItems.find(c => c.id === selectedContentId)
    : null;

  return (
    <div className="min-h-screen bg-[#fafbfc]">
      <SharedLayout_Muted 
        currentPage="content" 
        onNavigate={setCurrentPage}
        stats={{
          content: allContentItems.length,
        }}
        onQuickAdd={() => setContentModalOpen(true)}
      >
        <MutedContentPage_Gallery 
          allContentItems={allContentItems}
          setAllContentItems={setAllContentItems}
          onContentSelect={(id) => setSelectedContentId(id)}
        />
      </SharedLayout_Muted>

      {/* New Content Modal */}
      {contentModalOpen && (
        <NewContentModal
          isOpen={contentModalOpen}
          onClose={() => setContentModalOpen(false)}
          onSave={(newContent) => {
            setAllContentItems([...allContentItems, {
              ...newContent,
              id: Date.now().toString(),
              date: new Date().toISOString().split('T')[0],
              wordCount: 0,
              content: '',
            }]);
            setContentModalOpen(false);
          }}
        />
      )}

      {/* Content Detail Modal */}
      {selectedContent && (
        <ContentDetailModal
          content={selectedContent}
          isOpen={!!selectedContentId}
          onClose={() => setSelectedContentId(null)}
          onSave={(updated) => {
            setAllContentItems(allContentItems.map(c => 
              c.id === updated.id ? updated : c
            ));
            setSelectedContentId(null);
          }}
          onDelete={(id) => {
            setAllContentItems(allContentItems.filter(c => c.id !== id));
            setSelectedContentId(null);
          }}
        />
      )}
    </div>
  );
}

export default App;
```

---

## BLUEPRINT FAMILIES & SUBTYPES

Your content system includes these blueprint structures:

### PERSPECTIVE
- What Patients Wish You Knew
- Myth vs Reality
- Unpopular Opinion
- Hot Take

### STORY
- Insight Story
- Transformation Story
- Case Study
- Behind the Scenes

### EDUCATION
- Listicle
- How-To Guide
- Deep Dive
- Framework

### SOCIAL
- LinkedIn Post
- Thread
- Quote Graphic
- Poll

### EMAIL
- Newsletter
- Announcement
- Personal Note

---

## SAMPLE CONTENT ITEMS

```typescript
const sampleContentItems: ContentItem[] = [
  {
    id: '1',
    title: 'Why "Patient-Centered Care" Isn\'t Enough Anymore',
    topic: 'Patient Experience Evolution',
    targetAudience: 'Healthcare Executives',
    platform: 'LinkedIn',
    date: '2024-02-15',
    publishDate: '2024-02-20',
    length: 'Standard (250-500 words)',
    blueprintFamily: 'Perspective',
    blueprintSubtype: 'What Patients Wish You Knew',
    status: 'scheduled',
    outline: '1. The gap between care and experience\n2. What patients really want\n3. Actionable steps',
    wordCount: 420,
    content: 'Draft content...',
    tags: ['patient experience', 'healthcare leadership'],
    seoKeywords: ['patient-centered care', 'healthcare transformation'],
  },
  {
    id: '2',
    title: 'From Broken to Breakthrough: One Hospital\'s Journey',
    topic: 'Emergency Department Transformation',
    targetAudience: 'Healthcare Leaders',
    platform: 'Blog',
    date: '2024-02-10',
    length: 'Standard (900-1,300 words)',
    blueprintFamily: 'Story',
    blueprintSubtype: 'Insight Story',
    status: 'draft',
    outline: 'Problem → Solution → Results → Lessons',
    wordCount: 1040,
    content: '',
    workingOn: true,
  },
  {
    id: '3',
    title: '7 Silent Experience Killers Hiding in Your Patient Journey',
    topic: 'Patient Journey Optimization',
    targetAudience: 'Operations Directors',
    platform: 'LinkedIn',
    date: '2024-02-05',
    length: 'Long (500-900 words)',
    blueprintFamily: 'Education',
    blueprintSubtype: 'Listicle',
    status: 'ready to schedule',
    outline: 'Intro + 7 items with examples + CTA',
    wordCount: 680,
    content: '',
  },
];
```

---

## KEY FEATURES TO IMPLEMENT

### 1. View Modes
- **Gallery View** (visual cards with thumbnails)
- **Table View** (spreadsheet-like with filters)
- **Calendar View** (publishing schedule)
- **Analytics View** (word counts, status distribution)

### 2. Status Workflow
```
idea → outlining → drafting → editing → ready to schedule → scheduled → published
```

### 3. Filters & Search
- By status
- By blueprint family
- By platform
- By date range
- By "working on" flag
- By word count range

### 4. AI Integration (Jamie)
- Content idea generation
- Outline creation
- Draft assistance
- SEO optimization
- Title suggestions

### 5. Content Analytics
- Total word count
- Publishing cadence
- Blueprint usage distribution
- Platform distribution
- Content in each status

---

## OPTIONAL FEATURES

### Export/Import
Add CSV/JSON export for content inventory

### Templates Library
Store and reuse successful content structures

### Content Calendar
Visual publishing schedule with drag-and-drop

### Collaboration
Add comments, revision history, approval workflow

---

## SETUP STEPS

1. **Create new Figma Make file** called "Content Management Hub"

2. **Copy all files** listed in "FILES TO COPY" section above

3. **Copy App.tsx structure** from the minimal example

4. **Update imports** in copied components to remove references to:
   - Tasks
   - Contacts
   - Calendar events
   - Forms/invoices
   - Any other non-content features

5. **Test with sample data** using the sample content items provided

6. **Customize** colors, branding, blueprint families to your needs

---

## BRAND COLORS (from your main app)

```css
/* Client-facing */
--primary: #2f829b;
--secondary: #034863;
--accent: #6b2358;
--neutral-light: #f5fafb;
--neutral: #ddecf0;

/* Internal tools (if needed) */
--muted-1: #a8998f;
--muted-2: #a89db0;
```

---

## NEXT STEPS AFTER EXTRACTION

1. **Simplify navigation** - Remove client/business management nav items
2. **Focus on writing workflow** - Optimize for content creation process
3. **Add integrations** - Connect to publishing platforms (WordPress, LinkedIn, etc.)
4. **Build analytics** - Track content performance across platforms
5. **Content library** - Build searchable archive of published pieces

---

## BENEFITS OF STANDALONE APP

✅ **Focused interface** - Only content features, no distractions
✅ **Faster loading** - Smaller bundle size
✅ **Independent updates** - Change content features without affecting business tools
✅ **Easy onboarding** - Simpler for content team members or VAs
✅ **Portable** - Share with clients or collaborators separately

---

## QUESTIONS?

The main decision points:
- Do you want ALL the design options or just pick one view?
- Do you want full Jamie AI integration or simpler prompts?
- Do you want analytics built-in or separate reporting?
- Do you want multi-user features or single-user focus?

Let me know and I can customize this guide further!
