# Content Management App - Custom Build Guide
## Gallery + Table Views | Full Creation Workflow | Blueprint-Driven Writing

This is your personalized extraction guide for a content app focused on **blueprint-driven creation with export to platforms**.

---

## 🎯 YOUR WORKFLOW

```
1. Click "New Content" 
   ↓
2. Wizard: Choose Platform (LinkedIn Post/Article, Substack)
   ↓
3. Wizard: Choose Length + Blueprint Family
   ↓
4. Editor opens with Blueprint Template inline
   ↓
5. Write following section-by-section structure
   ↓
6. Jamie AI helps with each section (optional)
   ↓
7. Generate formatted document
   ↓
8. Copy or Export → Paste into LinkedIn/Substack
```

---

## 📁 EXACT FILES TO COPY (32 files)

### **MAIN PAGES (2 files)**

```
✅ /components/muted_ContentPage_Gallery.tsx
   → Gallery view with visual cards, filters, search, "working on" system

✅ /components/ContentTableView.tsx
   → Spreadsheet-style table with sort/filter
```

### **MODALS & WIZARDS (8 files)**

```
✅ /components/muted_NewContentModal.tsx
   → 3-step wizard: Platform → Length → Blueprint

✅ /components/muted_NewContentWizard.tsx
   → Alternative wizard with different flow (keep both, use whichever you prefer)

✅ /components/muted_ContentWizard.tsx
   → Full guided wizard: Idea → Outline → Draft → Review → Schedule

✅ /components/content/ContentDetailModal.tsx
   → Main editing modal with full content editor

✅ /components/muted_ContentModal.tsx
   → Alternative content editing modal

✅ /components/content/PostMeetingContentWizard.tsx
   → Create content from meeting notes

✅ /components/content/ResumeWritingDialog.tsx
   → "Resume writing?" reminder when you haven't worked on something

✅ /components/content/ContentGoalReminder.tsx
   → "You wanted to publish 3 posts this month" goal tracking
```

### **BLUEPRINT SYSTEM (1 file) ⭐ ESSENTIAL**

```
✅ /components/muted_InlineBlueprintTemplate.tsx
   → Section-by-section writing structure that appears in editor
   → Includes all 5 blueprint families:
      - Story (Opening → Conflict → Insight → Takeaway)
      - Education (Core Topic → Key Points → Examples → Summary)
      - Perspective (Setup → Challenge → Reframe → Application)
      - Engagement (Question → Context → Options → CTA)
      - Announcement (What → Why It Matters → Details → Next Steps)
```

### **AI & WRITING FEATURES (5 files)**

```
✅ /components/muted_DraftingFocusMode.tsx
   → Full-screen distraction-free writing mode
   → Blueprint structure sidebar
   → Jamie AI help for each section
   → Word count, timer, auto-save

✅ /components/content/JamieIdeaCard.tsx
   → AI-generated content ideas

✅ /components/muted_BrainDumpModal.tsx
   → Quick idea capture (voice or text)

✅ /components/AICopilot.tsx
   → Jamie AI floating assistant

✅ /components/GlobalJamiePanel.tsx
   → Jamie chat panel for content help
```

### **DOCUMENT EXPORT & FORMATTING (3 files)**

```
✅ /components/muted_FormattingToolbar.tsx
   → Rich text editor: Bold, italic, headings, lists, links

✅ /components/muted_ImageLibrary.tsx
   → Image picker/manager for content

✅ /components/muted_JamieImageAccessibilityModal.tsx
   → AI-generated alt text for images
```

### **LAYOUT & NAVIGATION (3 files) - REQUIRED**

```
✅ /components/SharedLayout_Muted.tsx
   → Main layout wrapper with sidebar navigation

✅ /components/PageHeader_Muted.tsx
   → Page header with title, stats, actions

✅ /components/QuickAddDropdown.tsx or /components/QuickAddMenu.tsx
   → Quick add button in top nav
```

### **FOLDERS - REQUIRED**

```
✅ /components/ui/ (entire folder)
   → Button, Input, Dialog, Dropdown, Badge, Textarea, etc.
   → All basic UI primitives

✅ /components/shared/ (entire folder)
   → Reusable shared components

✅ /styles/globals.css
   → All design tokens, colors, fonts (Lora + Poppins)
```

---

## 💻 COMPLETE APP.TSX SETUP

```typescript
import React, { useState, useEffect } from 'react';
import { SharedLayout_Muted } from './components/SharedLayout_Muted';
import { MutedContentPage_Gallery } from './components/muted_ContentPage_Gallery';
import { ContentTableView } from './components/ContentTableView';
import { NewContentModal } from './components/muted_NewContentModal';
import { ContentDetailModal } from './components/content/ContentDetailModal';
import { NewContentWizard } from './components/muted_NewContentWizard';
import { DraftingFocusMode } from './components/muted_DraftingFocusMode';
import { BrainDumpModal } from './components/muted_BrainDumpModal';
import { AICopilot } from './components/AICopilot';
import { GlobalJamiePanel } from './components/GlobalJamiePanel';
import './styles/globals.css';

export interface ContentItem {
  id: string;
  title: string;
  platform: 'LinkedIn Post' | 'LinkedIn Article' | 'Substack Post';
  length: string;
  blueprintFamily: 'Story' | 'Education' | 'Perspective' | 'Engagement' | 'Announcement';
  blueprintSubtype: string;
  status: 'idea' | 'outlining' | 'drafting' | 'editing' | 'ready to schedule' | 'scheduled' | 'published' | 'archived';
  tags: string[];
  scheduledDate?: string;
  scheduledTime?: string;
  lastUpdated: Date;
  createdOn: Date;
  wordCount: number;
  content: string; // The actual written content
  outline?: string;
  notes?: string;
  workingOn?: boolean;
  workingOnOrder?: number;
}

function App() {
  // View state
  const [currentView, setCurrentView] = useState<'gallery' | 'table'>('gallery');
  
  // Modal states
  const [newContentModalOpen, setNewContentModalOpen] = useState(false);
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [focusModeContentId, setFocusModeContentId] = useState<string | null>(null);
  const [brainDumpOpen, setBrainDumpOpen] = useState(false);
  const [jamiePanelOpen, setJamiePanelOpen] = useState(false);

  // Content items with localStorage persistence
  const [allContentItems, setAllContentItems] = useState<ContentItem[]>(() => {
    try {
      const saved = localStorage.getItem('contentItems');
      if (saved) return JSON.parse(saved);
      
      // Default sample content
      return [
        {
          id: '1',
          title: 'Why "Patient-Centered Care" Isn\'t Enough Anymore',
          platform: 'LinkedIn Post',
          length: 'Standard (250-500 words)',
          blueprintFamily: 'Perspective',
          blueprintSubtype: 'What Patients Wish You Knew',
          status: 'drafting',
          tags: ['patient experience', 'healthcare leadership'],
          scheduledDate: '',
          lastUpdated: new Date(),
          createdOn: new Date('2024-02-15'),
          wordCount: 420,
          content: '',
          outline: '1. The gap\n2. What patients want\n3. Actionable steps',
          workingOn: true,
          workingOnOrder: 1,
        },
        {
          id: '2',
          title: 'From Broken to Breakthrough: One Hospital\'s Journey',
          platform: 'LinkedIn Article',
          length: 'Long-form (900-1,300 words)',
          blueprintFamily: 'Story',
          blueprintSubtype: 'Transformation Story',
          status: 'outlining',
          tags: ['transformation', 'case study'],
          lastUpdated: new Date(),
          createdOn: new Date('2024-02-10'),
          wordCount: 0,
          content: '',
          outline: '',
          workingOn: false,
        },
        {
          id: '3',
          title: '7 Silent Experience Killers Hiding in Your Patient Journey',
          platform: 'LinkedIn Post',
          length: 'Long (500-900 words)',
          blueprintFamily: 'Education',
          blueprintSubtype: 'Listicle',
          status: 'ready to schedule',
          tags: ['operations', 'patient journey'],
          lastUpdated: new Date(),
          createdOn: new Date('2024-02-05'),
          wordCount: 680,
          content: 'Your full written content here...',
          outline: 'Intro + 7 items + CTA',
          workingOn: false,
        },
      ];
    } catch {
      return [];
    }
  });

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('contentItems', JSON.stringify(allContentItems));
    } catch (error) {
      console.error('Failed to save content items:', error);
    }
  }, [allContentItems]);

  // Get selected content
  const selectedContent = selectedContentId 
    ? allContentItems.find(c => c.id === selectedContentId) 
    : null;

  const focusModeContent = focusModeContentId
    ? allContentItems.find(c => c.id === focusModeContentId)
    : null;

  // Handle creating new content
  const handleCreateContent = (newContent: Partial<ContentItem>) => {
    const contentItem: ContentItem = {
      id: Date.now().toString(),
      title: newContent.title || 'Untitled',
      platform: newContent.platform || 'LinkedIn Post',
      length: newContent.length || 'Standard (250-500 words)',
      blueprintFamily: newContent.blueprintFamily || 'Story',
      blueprintSubtype: newContent.blueprintSubtype || '',
      status: 'idea',
      tags: newContent.tags || [],
      createdOn: new Date(),
      lastUpdated: new Date(),
      wordCount: 0,
      content: '',
      outline: newContent.outline || '',
      notes: newContent.notes || '',
      workingOn: false,
    };
    
    setAllContentItems([contentItem, ...allContentItems]);
    setNewContentModalOpen(false);
    
    // Open in detail modal or focus mode
    setSelectedContentId(contentItem.id);
  };

  // Handle updating content
  const handleUpdateContent = (updatedContent: ContentItem) => {
    setAllContentItems(allContentItems.map(item => 
      item.id === updatedContent.id ? updatedContent : item
    ));
  };

  // Handle deleting content
  const handleDeleteContent = (id: string) => {
    setAllContentItems(allContentItems.filter(item => item.id !== id));
    setSelectedContentId(null);
    setFocusModeContentId(null);
  };

  // Handle brain dump
  const handleBrainDump = (idea: string) => {
    const contentItem: ContentItem = {
      id: Date.now().toString(),
      title: idea.substring(0, 50) + (idea.length > 50 ? '...' : ''),
      platform: 'LinkedIn Post',
      length: 'Standard (250-500 words)',
      blueprintFamily: 'Perspective',
      blueprintSubtype: '',
      status: 'idea',
      tags: [],
      createdOn: new Date(),
      lastUpdated: new Date(),
      wordCount: 0,
      content: '',
      notes: idea,
      workingOn: false,
    };
    
    setAllContentItems([contentItem, ...allContentItems]);
    setBrainDumpOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#fafbfc]">
      <SharedLayout_Muted
        currentPage="content"
        onNavigate={() => {}}
        stats={{
          content: allContentItems.filter(c => c.status !== 'archived').length,
        }}
        onQuickAdd={() => setNewContentModalOpen(true)}
      >
        {/* View Switcher */}
        <div className="mb-4 flex gap-2 border-b border-[#e5e7eb] pb-4">
          <button
            onClick={() => setCurrentView('gallery')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              currentView === 'gallery'
                ? 'bg-[#2f829b] text-white'
                : 'bg-white text-[#6b7280] hover:bg-[#f3f4f6]'
            }`}
          >
            Gallery View
          </button>
          <button
            onClick={() => setCurrentView('table')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              currentView === 'table'
                ? 'bg-[#2f829b] text-white'
                : 'bg-white text-[#6b7280] hover:bg-[#f3f4f6]'
            }`}
          >
            Table View
          </button>
          <button
            onClick={() => setBrainDumpOpen(true)}
            className="ml-auto px-4 py-2 rounded-lg bg-[#6b2358] text-white hover:bg-[#5a1e4a] transition-colors"
          >
            💡 Quick Idea Capture
          </button>
        </div>

        {/* Gallery View */}
        {currentView === 'gallery' && (
          <MutedContentPage_Gallery
            allContentItems={allContentItems}
            setAllContentItems={setAllContentItems}
            onContentSelect={(id) => setSelectedContentId(id)}
            onOpenFocusMode={(id) => setFocusModeContentId(id)}
          />
        )}

        {/* Table View */}
        {currentView === 'table' && (
          <ContentTableView
            allContentItems={allContentItems}
            setAllContentItems={setAllContentItems}
            onContentSelect={(id) => setSelectedContentId(id)}
          />
        )}
      </SharedLayout_Muted>

      {/* New Content Modal/Wizard */}
      {newContentModalOpen && (
        <NewContentModal
          isOpen={newContentModalOpen}
          onClose={() => setNewContentModalOpen(false)}
          onSave={handleCreateContent}
        />
      )}

      {/* Content Detail Modal */}
      {selectedContent && !focusModeContentId && (
        <ContentDetailModal
          content={selectedContent}
          isOpen={!!selectedContentId}
          onClose={() => setSelectedContentId(null)}
          onSave={handleUpdateContent}
          onDelete={handleDeleteContent}
          onOpenFocusMode={() => {
            setFocusModeContentId(selectedContentId);
            setSelectedContentId(null);
          }}
        />
      )}

      {/* Drafting Focus Mode */}
      {focusModeContent && (
        <DraftingFocusMode
          content={focusModeContent}
          onClose={() => setFocusModeContentId(null)}
          onSave={(updated) => {
            handleUpdateContent(updated);
            setFocusModeContentId(null);
          }}
        />
      )}

      {/* Brain Dump Modal */}
      {brainDumpOpen && (
        <BrainDumpModal
          isOpen={brainDumpOpen}
          onClose={() => setBrainDumpOpen(false)}
          onSave={handleBrainDump}
        />
      )}

      {/* Jamie AI Panel (toggle with button) */}
      {jamiePanelOpen && (
        <GlobalJamiePanel
          isOpen={jamiePanelOpen}
          onClose={() => setJamiePanelOpen(false)}
        />
      )}

      {/* AI Copilot (floating) */}
      <AICopilot />
    </div>
  );
}

export default App;
```

---

## 🎨 BLUEPRINT STRUCTURES INCLUDED

### **1. STORY Blueprint**
```
OPENING
- Paint a vivid picture
- Make it relatable  
- Create curiosity

CONFLICT
- Show the stakes
- Create tension
- Make readers care

INSIGHT  
- Be specific and authentic
- Connect to your expertise
- Make it actionable

TAKEAWAY
- Broader application
- Value for your audience
- Call to engagement
```

### **2. EDUCATION Blueprint**
```
CORE TOPIC
- What are you teaching?

KEY POINTS (3-7 items)
- Each point with example

EXAMPLES
- Real-world applications

SUMMARY & CTA
- Recap + next steps
```

### **3. PERSPECTIVE Blueprint**
```
SETUP
- State conventional wisdom
- Set the stage

CHALLENGE
- Why it's incomplete
- What's missing

REFRAME  
- Your perspective
- The truth

APPLICATION
- So what?
- What to do instead
```

### **4. ENGAGEMENT Blueprint**
```
QUESTION
- The core question

CONTEXT
- Why it matters
- Background

OPTIONS
- Different viewpoints

CTA
- Ask for responses
```

### **5. ANNOUNCEMENT Blueprint**
```
WHAT
- The news

WHY IT MATTERS
- Impact on audience

DETAILS
- Key information

NEXT STEPS
- What to do / how to participate
```

---

## 📤 EXPORT WORKFLOW

### **Step 1: Create Content with Blueprint**
1. Click "New Content"
2. Choose platform (LinkedIn Post, LinkedIn Article, Substack)
3. Choose blueprint family
4. Blueprint template appears in editor

### **Step 2: Write Following Structure**
- Each section has guidance prompts
- Word count updates live
- Jamie AI can help with each section
- Auto-saves as you write

### **Step 3: Format for Platform**
The app will format your content based on platform:

**LinkedIn Post Format:**
```
[Hook line]

[Main content with line breaks]

---
[Tags at bottom]
#tag1 #tag2 #tag3
```

**LinkedIn Article Format:**
```
# [Title]

[Introduction paragraph]

## [Section Heading]
[Content]

## [Section Heading]  
[Content]

[Conclusion]
```

**Substack Format:**
```
[Title]

[Subtitle/Hook]

[Body with sections]

[CTA at end]
```

### **Step 4: Export/Copy**

Add export buttons to the content detail modal:

```typescript
// Add to ContentDetailModal.tsx

<div className="flex gap-2">
  <button 
    onClick={() => copyToClipboard(formatForLinkedIn(content))}
    className="px-4 py-2 bg-[#2f829b] text-white rounded-lg"
  >
    📋 Copy for LinkedIn
  </button>
  
  <button
    onClick={() => openInLinkedIn(formatForLinkedIn(content))}
    className="px-4 py-2 bg-[#0077b5] text-white rounded-lg"
  >
    🔗 Open in LinkedIn
  </button>
  
  <button
    onClick={() => copyToClipboard(formatForSubstack(content))}
    className="px-4 py-2 bg-[#ff6719] text-white rounded-lg"
  >
    📋 Copy for Substack
  </button>
</div>

// Helper functions
function formatForLinkedIn(content: ContentItem): string {
  // Format with proper line breaks, hashtags at end
  return `${content.content}\n\n---\n${content.tags.map(t => `#${t}`).join(' ')}`;
}

function formatForSubstack(content: ContentItem): string {
  // Format for Substack editor
  return content.content;
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
  toast.success('Copied to clipboard!');
}

function openInLinkedIn(content: string) {
  // This opens LinkedIn's share dialog
  window.open('https://www.linkedin.com/feed/', '_blank');
  copyToClipboard(content);
  toast.success('Content copied! Paste into LinkedIn.');
}
```

---

## 🎯 COMPLETE FEATURE LIST

### ✅ **Views**
- Gallery view with visual cards
- Table view with sort/filter
- View switcher toggle

### ✅ **Content Creation**
- New Content Wizard (3-step: Platform → Length → Blueprint)
- Alternative wizard options
- Brain dump quick capture
- From meeting notes

### ✅ **Editing**
- Detail modal with full editor
- Focus mode (full-screen distraction-free)
- Rich text formatting toolbar
- Image library integration

### ✅ **Blueprint System**
- Inline blueprint templates
- 5 blueprint families with subtypes
- Section-by-section guidance
- Custom prompts per blueprint

### ✅ **AI Features**
- Jamie AI section help
- Content idea generation
- Outline assistance  
- Writing feedback
- Image alt text generation

### ✅ **Status Workflow**
```
idea → outlining → drafting → editing → ready to schedule → scheduled → published
```

### ✅ **Organization**
- Tags
- "Working on" pin system
- Search and filters
- Status badges
- Word count tracking

### ✅ **Export**
- Copy formatted for platform
- Open directly in platform
- Platform-specific formatting

---

## 🚀 SETUP STEPS

### **1. Create New Figma Make File**
- Name it "Content Management Hub"

### **2. Copy All 32 Files**
Use the file list at the top of this guide

### **3. Copy App.tsx**
Use the complete code provided above

### **4. Customize**
- Update brand colors in `/styles/globals.css`
- Adjust blueprint structures if needed
- Add your own sample content

### **5. Test Workflow**
1. Click "New Content"
2. Go through wizard
3. Choose Story blueprint
4. See template appear
5. Write content
6. Click "Copy for LinkedIn"
7. Paste into LinkedIn

---

## 🎨 BRAND COLORS (Already Set)

```css
/* Your Empower Health Strategies colors */
--color-primary: #2f829b;
--color-secondary: #034863;
--color-accent: #6b2358;
--color-neutral-light: #f5fafb;
--color-neutral: #ddecf0;
--color-muted-1: #a8998f;
--color-muted-2: #a89db0;

/* Typography */
--font-heading: 'Lora', serif;
--font-body: 'Poppins', sans-serif;
```

---

## 💡 NEXT ENHANCEMENTS (After Core Works)

1. **Analytics Dashboard** - Track which blueprints perform best
2. **Publishing Calendar** - Visual schedule of when to post
3. **Version History** - See previous drafts
4. **Templates Library** - Save your best-performing structures
5. **Collaboration** - Share drafts, get feedback
6. **Platform Integrations** - Direct post to LinkedIn API, Substack API

---

## ❓ QUESTIONS?

This setup gives you:
- ✅ Gallery + Table views
- ✅ Complete creation wizard workflow
- ✅ Blueprint-driven writing
- ✅ Jamie AI assistance
- ✅ Export to platforms

Want me to:
- Generate specific component modifications?
- Add more blueprint types?
- Build the export functionality?
- Create a video walkthrough script?

Let me know!