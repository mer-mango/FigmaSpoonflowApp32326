# Comprehensive App Documentation
## High-Level Overview of Empower Health Strategies Content Management System

**Last Updated:** January 4, 2026

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [App Evolution: From Client Hub to Content Management](#app-evolution)
3. [Design System](#design-system)
4. [Core Architecture](#core-architecture)
5. [Main Features & Systems](#main-features--systems)
6. [Content Management Features](#content-management-features)
7. [AI Assistant: Jamie](#ai-assistant-jamie)
8. [Backend Integration](#backend-integration)
9. [Component Directory](#component-directory)
10. [Data Models](#data-models)

---

## Executive Summary

This is a **standalone content management application** for Empower Health Strategies, a healthcare patient experience consultancy. The app extracts and refines all content-related features from a larger comprehensive client hub, creating a focused tool for managing content creation from ideation through publication.

**Primary Functions:**
- Content Ideas Inbox (Gmail integration with AI extraction)
- Content pipeline management (Idea → Drafting → Review → Scheduled → Published)
- AI-powered writing assistant ("Jamie") with voice matching & blueprint guidance
- LinkedIn & Substack publishing integration
- Content blueprint system (30+ structured content templates)
- Desktop notifications for workflow automation

---

## App Evolution

### Original App: Comprehensive Client Hub
The original application was an all-in-one client relationship management system including:
- **Today Page**: Daily planning with AM/PM wizards, timeline view, meeting preparation
- **Tasks Management**: Task tracking with contact linking, time blocking, status workflows
- **Client Hub**: Contact management, journey tracking, engagement logging, meeting dossiers
- **Calendar Integration**: Google Calendar sync with automatic meeting detection
- **Business Documents**: Forms, proposals, SOWs, invoices with PDF generation
- **Nurture System**: Client outreach tracking and email templates
- **Jamie AI Assistant**: Context-aware AI helper integrated across all modules

### Refined App: Content Management System
The current application extracts and enhances only content-related features:
- **Content Page** (main focus): Kanban-style content pipeline with drag-and-drop
- **Content Ideas Inbox**: Gmail integration, AI ranking, story extraction
- **Content Editor**: Full-featured editor with Jamie integration in sidebar
- **Blueprint System**: 7 major blueprint categories with 30+ subtypes
- **Settings**: 6 tabs for integrations, notifications, routines, archive, and Jamie's knowledge
- **Today Page** (retained): For users who want the full planning experience (accessible via `?view=original`)

---

## Design System

### Brand Colors
**Client-Facing (Empower Health Strategies):**
- Primary: `#2f829b` (Teal)
- Secondary: `#034863` (Dark Teal)
- Neutrals: `#f5fafb` (Light), `#ddecf0` (Medium)
- Accent: `#6b2358` (Plum)

**Internal Tools (Muted Productivity Palette):**
- `#a8998f` (Warm Gray)
- `#a89db0` (Soft Lavender)
- `#938aa9` (Muted Purple)

### Visual Direction
**"Mindful Productivity with Soft Modernism"**
- Clean, uncluttered interfaces
- Soft color transitions and gradients
- Generous whitespace
- Gentle shadows and rounded corners
- Calm, professional aesthetic

### Content-Specific Color Coding

**Status Colors:**
- Idea: `#ce9da4` (Soft Rose)
- Drafting: `#a77e93` (Mauve)
- Review: `#aec3c1` (Sage)
- Scheduled: `#83a5a7` (Teal Gray)
- Published: `#9b91ac` (Soft Purple)

**Platform Colors:**
- LI Post: `#879fb5` (LinkedIn Blue Light)
- LI Article: `#5f7e9a` (LinkedIn Blue Dark)
- SS Post: `#deb0ad` (Substack Coral Light)
- SS Audio: `#ce9490` (Substack Coral Dark)

---

## Core Architecture

### Technology Stack
- **Frontend**: React 18, TypeScript
- **Styling**: Tailwind CSS v4.0
- **Backend**: Supabase (Edge Functions, Auth, Storage, Database)
- **AI Integration**: OpenAI GPT-4 (via Jamie)
- **Notifications**: Web Notifications API
- **State Management**: React Context + localStorage

### File Structure
```
/
├── App.tsx                          # Main application router
├── ContentPage_SimpleTable.tsx      # Main content management interface
├── ContentEditor.tsx                # Full-featured content editor
├── ContentFilteredView.tsx          # Status/platform filtered views
├── SettingsPage.tsx                 # Settings with 6 tabs
├── pages/
│   └── TodayPage.tsx               # Daily planning (optional)
├── components/
│   ├── content/                    # Content-specific components
│   │   ├── BlueprintExplorer.tsx   # Browse & select blueprints
│   │   ├── EnhancedContentWizard.tsx # Pre-draft content creation
│   │   ├── RepurposingModal.tsx    # Content repurposing tool
│   │   ├── RemixTool.tsx           # Remix existing content
│   │   ├── CTASuggester.tsx        # CTA recommendations
│   │   ├── AudienceHelper.tsx      # Audience-aware guidance
│   │   └── ContentDetailModal.tsx  # Quick view modal
│   ├── today/                      # Today page components
│   ├── tasks/                      # Task components
│   ├── navigation/                 # Navigation options
│   └── ui/                         # Shared UI components
├── contexts/
│   ├── NotificationContext.tsx     # Notification management
│   └── InteractionsContext.tsx     # User interactions tracking
├── utils/
│   ├── jamieAI.ts                  # Jamie AI logic
│   ├── notifications.ts            # Desktop notification manager
│   ├── googleCalendarSync.ts       # Calendar integration
│   └── dateUtils.ts                # Date/time utilities
├── data/
│   ├── blueprints.ts               # Content blueprint definitions
│   └── contacts.ts                 # Sample contact data
└── supabase/functions/server/
    ├── index.tsx                   # Hono web server
    └── kv_store.tsx                # Key-value storage utility
```

---

## Main Features & Systems

### 1. Navigation
- **Top Navigation Bar**: Clean, minimal design with logo, page links, and utility icons
- **Quick Add Menu**: Floating button for creating tasks, content, contacts
- **Settings Access**: Bell icon for notifications, settings gear icon
- **Page Switching**: Seamless transitions between Content, Today, Settings

### 2. Content Page (Main Interface)
**Layout:**
- Left sidebar: Content Ideas Inbox (collapsible)
- Center: Kanban board with 5 status columns
- Right sidebar: Quick stats, filters, platform breakdown

**Kanban Columns:**
1. **Idea** - Brainstormed concepts, inbox items converted to content
2. **Drafting** - Active writing, Jamie assistance available
3. **Review** - Content awaiting final review
4. **Scheduled** - Content scheduled for publishing
5. **Published** - Published content archive

**Features:**
- Drag-and-drop between columns (triggers status notifications)
- Inline editing (title, tags, platform)
- Color-coded status and platform badges
- Pin to "Working On" section at top
- Quick actions: Edit, Delete, Duplicate, Repurpose
- Sorting: Manual drag order within columns
- Filtering: By platform, status, blueprint family

### 3. Content Ideas Inbox
**Purpose:** Extract and rank story ideas from Gmail newsletters, research reports, patient stories

**Workflow:**
1. Connect Gmail account (Settings → Integrations)
2. System monitors specified newsletters/senders
3. AI extracts key stories and assigns relevance score (0-100)
4. Suggests platform and blueprint for each item
5. User reviews, converts to content item with one click

**Features:**
- Relevance scoring (94 = highly relevant, <70 = low relevance)
- AI-generated snippets summarizing key insight
- Suggested platform (LI Post, LI Article, SS Post, SS Audio)
- Suggested blueprint (Research Insight, Myth vs Reality, etc.)
- Direct link to source material
- Archive or dismiss low-relevance items

### 4. Content Editor
**Layout:**
- Main editor: Rich text with formatting toolbar
- Right sidebar: Jamie AI assistant (5 expandable sections)
- Top bar: Title, platform selector, blueprint selector, status dropdown

**Jamie Sidebar Sections:**
1. **Blueprint Guidance** - Structure and talking points for selected blueprint
2. **Voice Match** - Tone suggestions, phrase alternatives, voice consistency checker
3. **Hook Suggestions** - Opening line recommendations
4. **Tag Recommendations** - Relevant hashtags based on content
5. **Research Links** - Related resources and references

**Editor Features:**
- Auto-save every 30 seconds
- Word count tracker
- Platform-specific guidelines (character limits, formatting rules)
- Resume writing dialog (if navigated away from active draft)
- Export to platform (direct publish or copy formatted text)

### 5. Blueprint System
**7 Major Blueprint Categories:**

1. **Perspective** (Personal viewpoint on industry topics)
   - What Patients Wish You Knew
   - Myth vs Reality
   - Underrated / Overrated
   - Unpopular Opinion

2. **Story** (Narrative-driven content)
   - Patient Story
   - Insight Story
   - Project Story
   - Founder Journey

3. **Education** (Teaching frameworks and concepts)
   - Listicle (5 Ways to...)
   - How-To Guide
   - Framework Breakdown
   - Mistake Breakdown

4. **Engagement** (Community interaction)
   - Poll Post
   - Question Post
   - Behind the Scenes
   - This or That

5. **Industry Commentary** (Timely responses)
   - Reaction to News
   - Trend Analysis
   - Conference Debrief

6. **Social Proof** (Credibility building)
   - Case Study
   - Testimonial Highlight
   - Results Showcase

7. **Newsletter** (Long-form Substack)
   - Research Roundup
   - Deep Dive Essay
   - Interview Feature

**Each blueprint includes:**
- Structural template (intro → body → conclusion)
- Talking point suggestions
- Length guidelines
- Platform compatibility
- CTA recommendations

### 6. Blueprint System Enhancements (7 Major Features)

#### 6.1 Blueprint Explorer
- Visual browsing interface for all 30+ blueprints
- Filter by: Platform compatibility, Content length, Engagement type
- Preview structure and example before selecting
- "Start from Blueprint" button launches wizard

#### 6.2 Enhanced Pre-Draft Wizard
**Multi-step content creation assistant:**
1. Select blueprint family & subtype
2. Choose platform (LI Post, LI Article, SS Post, SS Audio)
3. Pick angle/hook
4. Jamie generates outline
5. Create content item or start drafting immediately

#### 6.3 Repurposing System
**Convert existing content to new platforms:**
- LI Article → LI Post series (break into 3-5 posts)
- LI Post → SS Post (expand with more narrative)
- SS Post → LI Article (condense for professional audience)
- Any content → SS Audio script (podcast-optimized version)

**Features:**
- AI-powered platform translation (voice/tone adjustment)
- Automatic snippet extraction
- Linked relationship tracking (shows original content)

#### 6.4 Remix Tool
**Create variations of existing content:**
- Different angle on same topic
- Different platform with adapted voice
- Updated version with new data/examples
- Series continuation
- Links back to original for reference

#### 6.5 CTA Suggestion Engine
**Context-aware call-to-action recommendations:**
- Analyzes content topic, platform, blueprint
- Suggests 3-5 CTAs ranked by relevance
- Types: Website visit, Resource download, Consultation booking, Newsletter signup, DM conversation starter
- Platform-specific formatting (LI comment prompts vs SS subscribe buttons)

#### 6.6 Audience-Aware Post Guidance
**Real-time audience fit scoring:**
- Primary Audience: Healthcare executives (60% weight)
- Secondary: Patient advocates, PX professionals (30%)
- Tertiary: General healthcare audience (10%)
- Suggests adjustments to increase relevance
- Highlights jargon that needs simplification

#### 6.7 LinkedIn Sharing Integration
**Simplified one-click posting:**
- "Share to LinkedIn" button in editor
- Auto-formats content for LinkedIn (hashtags, line breaks, character limit)
- Option to copy formatted text or open LinkedIn composer
- Tracks shared posts with "Shared to LinkedIn" timestamp

---

## AI Assistant: Jamie

### Core Concept
Jamie is a context-aware AI assistant that learns your:
- Writing voice and style patterns
- Expertise areas (patient experience, digital health, healthcare design)
- Content preferences (blueprint usage patterns, platform distribution)
- Work patterns (when you write, how long drafts take)

### Jamie's Capabilities

**Content Creation:**
- Generate outlines from blueprint selection
- Suggest opening hooks (3-5 options)
- Provide voice-matched phrase alternatives
- Recommend relevant tags/hashtags
- Quality check for clarity, flow, and audience fit

**Learning & Memory:**
- Stores voice guidelines in Settings → Jamie's Knowledge
- Tracks commonly used phrases, sentence structures
- Learns from user edits (what you keep vs. change)
- Adapts suggestions based on past content performance

**Integration Points:**
1. Content Editor sidebar (always available while writing)
2. Pre-Draft Wizard (generates initial structure)
3. Repurposing Modal (translates between platforms)
4. Inbox Review (suggests platform/blueprint for ideas)
5. CTA Suggester (recommends calls-to-action)

### Jamie Knowledge Base (Settings)
**User configures:**
- Voice & Tone guidelines (formal/casual, technical/accessible)
- Expertise topics (tags for deep knowledge areas)
- Off-limits topics (what not to write about)
- Preferred CTAs (default calls-to-action)
- Example content (Jamie learns from favorites)

---

## Settings Page (6 Tabs)

### 1. Integrations Tab
**Available Integrations:**
- **Gmail** (Content Ideas Inbox)
  - OAuth connection
  - Newsletter/sender monitoring
  - Auto-extraction settings
  - Sync frequency (real-time, hourly, daily)

- **Google Calendar**
  - OAuth connection
  - Auto-sync meetings to Today page
  - Meeting prep triggers
  - Two-way sync (create events from app)

- **LinkedIn**
  - OAuth connection (simplified flow)
  - Direct post publishing
  - Share formatted content
  - Profile link for CTA suggestions

- **Substack**
  - API key integration
  - Newsletter publish
  - Subscriber count tracking
  - Draft sync

**Integration Status Indicators:**
- ✅ Connected (green checkmark)
- ⚠️ Needs reauth (yellow warning)
- ❌ Disconnected (red X)

### 2. General Tab
- App appearance (dark mode toggle)
- Default content platform
- Auto-save interval
- Export format preferences
- Data export (download all content as JSON)

### 3. Routines Tab
**Daily Routines (optional for users with Today page access):**
- AM Plan My Day (8:00 AM - 8:30 AM)
- AM Admin (8:30 AM - 9:00 AM)
- Content Block (9:00 AM - 11:00 AM)
- Lunch (12:00 PM - 1:00 PM)
- Task Time (1:00 PM - 3:00 PM)
- PM Admin (3:00 PM - 4:00 PM)
- PM Wind Down (5:00 PM - 5:30 PM)

**Each routine configurable:**
- Start time, duration
- Priority (high/medium/low)
- Locked (prevent Jamie from adjusting)
- Linked tasks/content items

### 4. Notifications Tab
**Notification Preferences:**

**Content Status Changes:**
- ✅ Item moved to Drafting (reminder to complete)
- ✅ Item moved to Review (reminder to finalize)
- ✅ Item scheduled (confirmation + pre-publish reminder)
- ✅ Item published (success confirmation)

**Inbox Updates:**
- ✅ New high-relevance idea (score > 90)
- ⚠️ Weekly inbox digest (Mondays at 9 AM)

**Writing Reminders:**
- ✅ Active draft hasn't been touched in 3 days
- ✅ Daily writing goal progress
- ✅ Scheduled content due in 24 hours

**Notification Behavior:**
- Persistent desktop notifications (stay until snoozed/dismissed)
- Snooze options: 5 min, 30 min, 1 hour, tomorrow
- Do Not Disturb mode (scheduled quiet hours)
- Priority levels (urgent, normal, low)

### 5. Archive Tab
**View and restore archived content:**
- Soft-delete recovery (restore archived items)
- Published content archive (historical view)
- Filtering by date range, platform, blueprint
- Bulk actions (restore multiple, permanent delete)

### 6. Jamie's Knowledge Tab
**Configure Jamie's AI assistance:**

**Voice & Tone:**
- Formality level (1-10 slider)
- Technical depth (accessible ↔ expert)
- Personality (professional, friendly, authoritative, conversational)
- Example phrases Jamie should use/avoid

**Expertise Areas:**
- Patient experience design
- Digital health technology
- Prior authorization issues
- Healthcare journey mapping
- Clinical workflow design
- Health equity
- (User can add custom topics)

**Content Strategy:**
- Preferred blueprints (rank by frequency)
- Platform distribution goals (60% LI, 30% SS, 10% other)
- Content calendar themes (monthly focus areas)
- CTAs library (save custom calls-to-action)

**Learning Data:**
- View Jamie's learned patterns
- Reset learning (start fresh)
- Import/export voice profile

---

## Content Management Features (Detailed)

### Content Item Data Model
```typescript
interface ContentItem {
  id: string;
  title: string;
  platform: 'LI Post' | 'LI Article' | 'SS Post' | 'SS Audio';
  blueprintFamily: string;
  blueprintSubtype: string;
  status: 'Idea' | 'Drafting' | 'Review' | 'Scheduled' | 'Published';
  content: string; // Full draft text
  tags: string[]; // ['#patient_experience', '#digital_health']
  scheduledDate?: string;
  scheduledTime?: string;
  publishedDate?: string;
  publishedUrl?: string;
  lastUpdated: Date;
  createdOn: Date;
  wordCount: number;
  workingOn: boolean; // Pinned to top
  workingOnOrder: number; // Position in pinned section
  inboxSourceId?: string; // If created from inbox item
  originalContentId?: string; // If repurposed/remixed
  linkedContentIds?: string[]; // Related content
  audienceScore?: number; // Relevance score from AI
  ctaSuggestions?: string[];
  voiceMatchScore?: number; // How well it matches your voice
}
```

### Workflow States & Transitions

**Idea → Drafting:**
- User starts writing or launches Pre-Draft Wizard
- Notification: "New draft started - ready to write!"
- Jamie provides blueprint guidance

**Drafting → Review:**
- User marks draft as complete
- Notification: "Draft ready for review - take a final look"
- Jamie runs quality check (voice match, audience fit, CTA presence)

**Review → Scheduled:**
- User schedules publish date/time
- Notification: "Content scheduled for [date] at [time]"
- 24-hour pre-publish reminder
- Option to connect to LinkedIn/Substack scheduler

**Scheduled → Published:**
- Manual publish or auto-publish (if integration connected)
- Notification: "Content published successfully!"
- Archive to Published column
- Track engagement (if platform integration supports it)

**Any → Idea:**
- User can demote content back to Idea stage
- Useful for incomplete drafts or changed plans

### Filters & Views

**Filter by Status:**
- All, Idea, Drafting, Review, Scheduled, Published

**Filter by Platform:**
- All, LI Post, LI Article, SS Post, SS Audio

**Filter by Blueprint Family:**
- All, Perspective, Story, Education, Engagement, Industry Commentary, Social Proof, Newsletter

**Sort Options:**
- Manual (drag-and-drop order)
- Last updated (newest first)
- Created date (oldest first)
- Word count (longest first)
- Scheduled date (soonest first)

**Saved Views:**
- Working On (pinned items only)
- This Week (scheduled in next 7 days)
- By Platform (separate list for each platform)
- Recent (last 30 days)

---

## Backend Integration

### Supabase Architecture

**Three-Tier System:**
```
Frontend (React) 
    ↓ 
Server (Hono Edge Function) 
    ↓ 
Database (Postgres + KV Store)
```

### API Endpoints (Hono Server)
**Base URL:** `https://${projectId}.supabase.co/functions/v1/make-server-a89809a8/`

**Content Endpoints:**
- `GET /content` - Fetch all content items
- `POST /content` - Create new content item
- `PUT /content/:id` - Update content item
- `DELETE /content/:id` - Delete content item
- `GET /content/:id` - Fetch single content item

**Inbox Endpoints:**
- `GET /inbox` - Fetch inbox items
- `POST /inbox/refresh` - Trigger Gmail sync
- `POST /inbox/:id/convert` - Convert inbox item to content

**Integration Endpoints:**
- `POST /integrations/gmail/auth` - Gmail OAuth flow
- `POST /integrations/linkedin/auth` - LinkedIn OAuth flow
- `POST /integrations/linkedin/publish` - Publish to LinkedIn
- `GET /integrations/status` - Check integration connections

**Notification Endpoints:**
- `POST /notifications/subscribe` - Register for push notifications
- `GET /notifications` - Fetch notification history

### Data Storage

**Key-Value Store (kv_store_a89809a8 table):**
- Content items: `content:${id}`
- Inbox items: `inbox:${id}`
- User settings: `settings:${userId}`
- Integration tokens: `integration:${provider}:${userId}`
- Jamie learning data: `jamie:voice:${userId}`

**Supabase Storage (Private Buckets):**
- Draft backups: `make-a89809a8-drafts`
- Published content archive: `make-a89809a8-published`
- Exported data: `make-a89809a8-exports`

### Authentication
**Not currently implemented** - App uses public anon key for MVP
**Future:** Supabase Auth with email/password or social login (Google, LinkedIn)

---

## Notification System

### Desktop Notifications
**Implementation:** Web Notifications API

**Notification Types:**

1. **Status Change** (High Priority)
   - Persistent until dismissed/snoozed
   - Shows content title, new status, quick actions
   - Actions: View Content, Snooze 5 min, Dismiss

2. **Inbox Alert** (Medium Priority)
   - New high-relevance item (score > 90)
   - Shows title, relevance score, suggested platform
   - Actions: Review Inbox, Convert to Content, Dismiss

3. **Writing Reminder** (Low Priority)
   - Active draft idle for 3+ days
   - Daily writing goal progress
   - Scheduled content due soon
   - Actions: Open Editor, Snooze, Dismiss

4. **Integration Alert** (High Priority)
   - OAuth token expired
   - Sync error (Gmail, LinkedIn, Substack)
   - Actions: Reconnect, Dismiss

### Notification Manager (`utils/notifications.ts`)
```typescript
class NotificationManager {
  // Request permission
  requestPermission(): Promise<boolean>
  
  // Show notification
  show(options: NotificationOptions): void
  
  // Schedule notification
  schedule(options: NotificationOptions, delay: number): void
  
  // Clear notification
  clear(id: string): void
  
  // Snooze notification
  snooze(id: string, duration: number): void
  
  // Get pending notifications
  getPending(): Notification[]
}
```

### Notification Context (`contexts/NotificationContext.tsx`)
- Provides notification state to entire app
- Tracks unread count (badge on bell icon)
- Handles notification actions
- Persists snooze state across sessions

---

## Component Directory

### Core Pages
- `ContentPage_SimpleTable.tsx` - Main content kanban interface
- `ContentEditor.tsx` - Full-featured content editor
- `ContentFilteredView.tsx` - Filtered content views
- `SettingsPage.tsx` - Settings with 6 tabs
- `pages/TodayPage.tsx` - Daily planning page (optional)

### Content Components (`components/content/`)
- `BlueprintExplorer.tsx` - Browse and select blueprints
- `EnhancedContentWizard.tsx` - Pre-draft creation wizard
- `RepurposingModal.tsx` - Content repurposing tool
- `RemixTool.tsx` - Remix existing content
- `CTASuggester.tsx` - CTA recommendation engine
- `AudienceHelper.tsx` - Audience-aware guidance
- `ContentDetailModal.tsx` - Quick view modal
- `ContentGoalReminder.tsx` - Writing goal tracking
- `JamieIdeaCard.tsx` - Inbox item card
- `PostMeetingContentWizard.tsx` - Convert meeting notes to content
- `ResumeWritingDialog.tsx` - Resume interrupted drafts

### Today Page Components (`components/today/`)
- `AMWizard.tsx` - Morning planning wizard
- `PMWizard.tsx` - Evening wind-down wizard
- `JamieAdjustmentDialog.tsx` - Schedule adjustment suggestions
- `JamieTransitionDialog.tsx` - Transition between tasks
- `JamieCalendarChangeDialog.tsx` - Calendar change notifications
- `JamieReclaimedTimeDialog.tsx` - Handle canceled meetings
- `NotificationPermissionPrompt.tsx` - Request notification access
- `TimelineCalendarView.tsx` - Calendar-style timeline
- `MeetingPrepCard.tsx` - Meeting preparation
- `PrepNotesEditor.tsx` - Meeting prep notes

### Navigation (`components/navigation/`)
- `NavOptions.tsx` - Main navigation component
- `NavRefinedOptions.tsx` - Refined navigation (content-focused)
- `NavColoredVersion.tsx` - Colored navigation variant

### Shared Components (`components/shared/`)
- `MentionInput.tsx` - @mention functionality
- `MentionTextarea.tsx` - Textarea with mention support
- `MentionParser.tsx` - Parse @mentions
- `MentionMatcher.tsx` - Match mentions to entities

### UI Components (`components/ui/`)
- `Button.tsx`, `Input.tsx`, `Select.tsx` - Form components
- `Modal.tsx`, `Dialog.tsx` - Modal/dialog components
- `Card.tsx`, `Badge.tsx` - Display components
- `Dropdown.tsx`, `Popover.tsx` - Interactive components
- `Textarea.tsx`, `DictationTextarea.tsx` - Text input
- `Toast.tsx` (via Sonner) - Notification toasts

---

## Data Models

### ContentItem
```typescript
interface ContentItem {
  id: string;
  title: string;
  platform: 'LI Post' | 'LI Article' | 'SS Post' | 'SS Audio';
  length: string; // 'Short (150-250)', 'Standard (250-500)', etc.
  blueprintFamily: string;
  blueprintSubtype: string;
  status: 'Idea' | 'Drafting' | 'Review' | 'Scheduled' | 'Published';
  tags: string[];
  scheduledDate?: string;
  scheduledTime?: string;
  publishedDate?: string;
  publishedUrl?: string;
  lastUpdated: Date;
  createdOn: Date;
  wordCount: number;
  content: string;
  outline?: string;
  notes?: string;
  workingOn: boolean;
  workingOnOrder: number;
  inboxSourceId?: string;
  originalContentId?: string;
  linkedContentIds?: string[];
  voiceMatchScore?: number;
  audienceScore?: number;
  ctaSuggestions?: string[];
  sharedToLinkedIn?: boolean;
  sharedTimestamp?: string;
}
```

### InboxItem
```typescript
interface InboxItem {
  id: string;
  title: string;
  source: string; // Newsletter name or sender
  date: string;
  score: number; // 0-100 relevance score
  snippet: string; // AI-generated summary
  suggestedPlatform: string;
  suggestedBlueprint: string;
  sourceUrl: string;
  rawContent?: string; // Original email content
  extractedAt: Date;
  status: 'new' | 'reviewed' | 'converted' | 'dismissed';
}
```

### Blueprint
```typescript
interface Blueprint {
  id: string;
  family: 'Perspective' | 'Story' | 'Education' | 'Engagement' | 'Industry Commentary' | 'Social Proof' | 'Newsletter';
  subtype: string; // 'What Patients Wish You Knew', 'Listicle', etc.
  description: string;
  structure: {
    intro: string;
    body: string[];
    conclusion: string;
  };
  talkingPoints: string[];
  lengthGuidelines: {
    min: number;
    max: number;
    ideal: number;
  };
  platformCompatibility: ('LI Post' | 'LI Article' | 'SS Post' | 'SS Audio')[];
  ctaRecommendations: string[];
  exampleContent?: string;
}
```

### UserSettings
```typescript
interface UserSettings {
  userId: string;
  
  // General
  darkMode: boolean;
  defaultPlatform: string;
  autoSaveInterval: number; // seconds
  
  // Notifications
  notifications: {
    enabled: boolean;
    statusChanges: boolean;
    inboxAlerts: boolean;
    writingReminders: boolean;
    integrationAlerts: boolean;
    quietHours: { start: string; end: string } | null;
  };
  
  // Integrations
  integrations: {
    gmail: { connected: boolean; accessToken?: string; refreshToken?: string };
    googleCalendar: { connected: boolean; accessToken?: string; refreshToken?: string };
    linkedin: { connected: boolean; accessToken?: string; profileUrl?: string };
    substack: { connected: boolean; apiKey?: string; publicationUrl?: string };
  };
  
  // Jamie
  jamieKnowledge: {
    voiceTone: {
      formality: number; // 1-10
      technicalDepth: 'accessible' | 'balanced' | 'expert';
      personality: string[];
      examplePhrases: { use: string[]; avoid: string[] };
    };
    expertiseAreas: string[];
    contentStrategy: {
      preferredBlueprints: { blueprintId: string; frequency: number }[];
      platformDistribution: { platform: string; percentage: number }[];
      monthlyThemes: { month: string; theme: string }[];
    };
    ctaLibrary: string[];
  };
  
  // Routines
  routines: {
    id: string;
    name: string;
    startTime: string;
    duration: number;
    priority: 'high' | 'medium' | 'low';
    locked: boolean;
  }[];
}
```

---

## Key Workflows

### 1. Converting Inbox Item to Content
1. User clicks inbox item in Content Ideas Inbox
2. Review modal opens with AI suggestions
3. User confirms/edits platform and blueprint
4. Click "Create Content Item"
5. New content item created in "Idea" column
6. Inbox item marked as "converted"
7. Notification: "New content idea created!"

### 2. Drafting with Jamie
1. User clicks content item in "Idea" or "Drafting" column
2. Editor opens with content title/metadata
3. Jamie sidebar provides:
   - Blueprint structure guidance
   - Hook suggestions (3-5 options)
   - Voice-matched phrase alternatives
   - Tag recommendations
4. User writes draft, Jamie adapts suggestions based on content
5. Auto-save every 30 seconds
6. User clicks "Move to Review" when complete
7. Notification: "Draft ready for review!"

### 3. Scheduling & Publishing
1. User reviews content in "Review" column
2. Makes final edits if needed
3. Clicks "Schedule" button
4. Selects date, time, platform
5. If LinkedIn/Substack connected: Option to auto-publish
6. If not connected: Creates calendar reminder
7. Content moves to "Scheduled" column
8. Notification 24 hours before publish: "Content scheduled for tomorrow at [time]"
9. On publish: Notification "Content published!" + move to "Published" column

### 4. Repurposing Content
1. User selects published LI Article
2. Clicks "Repurpose" from quick actions menu
3. Modal opens with platform options
4. User selects "LI Post Series" (break into 3-5 posts)
5. Jamie analyzes article, extracts key sections
6. Generates 3-5 standalone posts with adapted voice
7. User reviews/edits suggested posts
8. Click "Create All" to add posts to "Drafting" column
9. Each post linked to original article (shows source)

---

## Future Enhancements (Roadmap)

### Phase 1: Enhanced AI (Q1 2026)
- Voice learning from published content (analyze what performs well)
- Auto-tagging based on content analysis
- Sentiment analysis (ensure positive/professional tone)
- Readability scoring (grade level, clarity)

### Phase 2: Analytics (Q2 2026)
- LinkedIn engagement tracking (if API access available)
- Substack subscriber analytics
- Content performance dashboard
- A/B testing recommendations (compare hook variations)

### Phase 3: Collaboration (Q3 2026)
- Multi-user support (team members can review/edit)
- Comment threads on drafts
- Approval workflow (manager reviews before publish)
- Version history (track changes over time)

### Phase 4: Advanced Automation (Q4 2026)
- Auto-scheduling based on optimal publish times
- Content calendar with theme planning
- Batch creation (generate 5 posts from one article)
- Email newsletter integration (auto-send Substack)

---

## Technical Notes

### Performance Optimizations
- Content items lazy-loaded (only visible items rendered)
- Editor auto-save debounced (avoid excessive writes)
- Jamie suggestions cached (avoid repeated API calls)
- Notifications throttled (max 1 per 5 minutes per type)

### Browser Compatibility
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (notifications require user interaction)
- Mobile browsers: Read-only view (editing not optimized)

### Data Persistence
- All content stored in Supabase KV store
- Local draft backups in IndexedDB (offline resilience)
- Settings synced to cloud (cross-device consistency)
- Notification snooze state in localStorage

### Security Considerations
- OAuth tokens encrypted in database
- API keys stored as Supabase secrets (never in frontend code)
- Content items private by default (user-specific)
- CORS enabled only for app domain

---

## Getting Started (User Onboarding)

### First-Time Setup
1. **Connect Gmail** (Settings → Integrations)
   - Click "Connect Gmail"
   - Authorize app to read newsletters
   - Select newsletters/senders to monitor
   - Wait for first sync (may take 5-10 minutes)

2. **Configure Jamie** (Settings → Jamie's Knowledge)
   - Set voice tone (formality, personality)
   - Add expertise areas
   - Provide example phrases you commonly use
   - Set content strategy preferences

3. **Enable Notifications** (Settings → Notifications)
   - Allow browser notifications when prompted
   - Enable desired notification types
   - Set quiet hours if needed

4. **Optional: Connect LinkedIn/Substack**
   - Settings → Integrations
   - Connect for direct publishing
   - Or skip and copy/paste content manually

### Creating Your First Content Item
1. **From Inbox:**
   - Review Content Ideas Inbox (left sidebar)
   - Click high-relevance item (score > 90)
   - Click "Create Content Item"
   - Content appears in "Idea" column

2. **From Scratch:**
   - Click "+ New Content" in Kanban header
   - Or use Pre-Draft Wizard (Blueprint Explorer)
   - Fill in title, platform, blueprint
   - Click "Create" to add to "Idea" column

3. **Start Drafting:**
   - Click content item to open editor
   - Use Jamie's blueprint guidance to structure content
   - Write first draft
   - Click "Move to Review" when done

4. **Review & Schedule:**
   - Move to "Review" column
   - Make final edits
   - Click "Schedule"
   - Set publish date/time
   - Content moves to "Scheduled"

5. **Publish:**
   - Manual: Copy content, post to LinkedIn/Substack
   - Or: Use "Share to LinkedIn" button (if connected)
   - Mark as "Published"
   - Content archived to Published column

---

## Glossary

**Blueprint:** A structured template for creating specific types of content (e.g., Listicle, Patient Story, Myth vs Reality). Provides outline, talking points, and length guidelines.

**Content Ideas Inbox:** Left sidebar feature that displays story ideas extracted from Gmail newsletters, ranked by relevance score.

**Jamie:** AI writing assistant that provides blueprint guidance, voice matching, hook suggestions, and content strategy help.

**Platform:** Publishing destination for content. Options: LI Post (LinkedIn Post), LI Article (LinkedIn Article), SS Post (Substack Post), SS Audio (Substack Podcast).

**Relevance Score:** 0-100 rating assigned by AI to inbox items, indicating how well the story aligns with user's expertise and content strategy.

**Repurposing:** Converting existing content to a different platform (e.g., LI Article → LI Post series), with AI-powered voice/format adaptation.

**Remix:** Creating a variation of existing content with a different angle, updated data, or platform-specific adjustments.

**Status:** Current stage in content pipeline. Flow: Idea → Drafting → Review → Scheduled → Published.

**Voice Match:** AI analysis of how well a draft matches the user's established writing voice, based on learned patterns from Settings → Jamie's Knowledge.

**Working On:** Pinned section at top of Kanban board for content items currently in active development.

---

## Support & Troubleshooting

### Common Issues

**Inbox not syncing:**
- Check Settings → Integrations → Gmail connection status
- Verify Gmail OAuth token hasn't expired (reconnect if needed)
- Ensure newsletters are being sent to monitored email address
- Check server logs for sync errors

**Notifications not appearing:**
- Verify browser notification permissions granted
- Check Settings → Notifications → ensure desired types enabled
- Disable Do Not Disturb mode if active
- Try different browser (Safari requires extra user interaction)

**Jamie not responding:**
- Check OpenAI API key in Supabase secrets
- Verify internet connection
- Review browser console for API errors
- Try refreshing page

**Content not saving:**
- Check browser console for errors
- Verify localStorage not full (clear old drafts)
- Ensure Supabase connection active
- Try manual save (Ctrl+S / Cmd+S)

**LinkedIn sharing not working:**
- Reconnect LinkedIn in Settings → Integrations
- Verify LinkedIn OAuth token valid
- Check LinkedIn API rate limits
- Use manual copy/paste as fallback

---

## Changelog

### v1.0 - January 4, 2026 (Current)
- ✅ Complete content management system with Kanban interface
- ✅ Content Ideas Inbox with Gmail integration
- ✅ Full-featured editor with Jamie AI sidebar
- ✅ Blueprint system (7 families, 30+ subtypes)
- ✅ Settings page with 6 tabs (Integrations, General, Routines, Notifications, Archive, Jamie)
- ✅ Desktop notifications with snooze/dismiss
- ✅ LinkedIn sharing integration (simplified)
- ✅ 7 major blueprint enhancements:
  - Blueprint Explorer
  - Enhanced Pre-Draft Wizard
  - Repurposing System
  - Remix Tool
  - CTA Suggestion Engine
  - Audience-Aware Post Guidance
  - LinkedIn Sharing
- ✅ Today page navigation fix (React Hooks compliance)
- ✅ All components production-ready and functional

### v0.9 - December 2025
- Initial extraction from comprehensive client hub
- Basic content page with status columns
- Simple Jamie integration
- Gmail inbox concept

---

**Document Version:** 1.0  
**Last Updated:** January 4, 2026  
**Maintained By:** Development Team  
**For:** ChatGPT context sharing and team onboarding
