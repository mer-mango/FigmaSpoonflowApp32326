# Content Management System - Complete Documentation Package
**For Empower Health Strategies | Last Updated: January 2026**

---

## 📚 **TABLE OF CONTENTS**

1. [System Overview](#system-overview)
2. [Visual Design & Brand Colors](#visual-design--brand-colors)
3. [Content Workflow (5 Stages)](#content-workflow-5-stages)
4. [Blueprint System (5 Families, 25 Subtypes)](#blueprint-system-5-families-25-subtypes)
5. [Content Editor & Jamie AI](#content-editor--jamie-ai)
6. [Ideas Inbox & Gmail Integration](#ideas-inbox--gmail-integration)
7. [Platform Types & Publishing](#platform-types--publishing)
8. [Settings & Integrations](#settings--integrations)
9. [Notifications System](#notifications-system)
10. [File Structure Reference](#file-structure-reference)

---

## 🎯 **SYSTEM OVERVIEW**

### **What This System Does:**
A standalone content management app that extracts all content-related features into a focused workspace for creating, managing, and publishing patient-first healthcare content across LinkedIn and Substack.

### **Core Philosophy:**
"Mindful productivity with soft modernism" - A calm, focused environment combining empathy with strategic insight.

### **Key Features:**
- **Content Ideas Inbox** - Gmail integration that pulls story ideas, AI-ranks them (0-100), suggests blueprints
- **5-Stage Workflow** - Idea → Drafting → Review → Scheduled → Published
- **Blueprint System** - 5 families, 25 specific content templates
- **Jamie AI Assistant** - Voice-matched writing help, SEO generation, improvements
- **Full Editor** - Distraction-free writing with auto-save
- **Desktop Notifications** - Status change alerts with snooze/dismiss
- **LinkedIn Integration** - Simplified sharing with preview
- **Google Calendar Sync** - Schedule content publishes

---

## 🎨 **VISUAL DESIGN & BRAND COLORS**

### **Brand Colors (Client-Facing):**
```css
/* Primary Brand */
--teal-main: #2f829b       /* Main brand color */
--teal-dark: #034863       /* Secondary/depth */
--accent-purple: #6b2358   /* Strategic highlights */

/* Neutrals */
--blue-light: #f5fafb      /* Light backgrounds */
--blue-medium: #ddecf0     /* Medium backgrounds */
```

### **Status Colors (Workflow):**
| Status | Color | Hex | Emoji | Meaning |
|--------|-------|-----|-------|---------|
| **Idea** | Rose | `#ce9da4` | 💡 | Raw idea, not started |
| **Drafting** | Mauve | `#a77e93` | ✍️ | Actively writing |
| **Review** | Sage | `#aec3c1` | 👀 | Draft complete, needs review |
| **Scheduled** | Teal-gray | `#83a5a7` | 📅 | Ready to publish, scheduled |
| **Published** | Purple-gray | `#9b91ac` | ✅ | Live, includes URL |

### **Platform Colors:**
| Platform | Color | Hex | Abbreviation |
|----------|-------|-----|--------------|
| **LinkedIn Post** | Blue-gray | `#879fb5` | LI Post |
| **LinkedIn Article** | Dark blue | `#5f7e9a` | LI Article |
| **Substack Post** | Rose-beige | `#deb0ad` | SS Post |
| **Substack Audio** | Coral | `#ce9490` | SS Audio |

### **Internal Tool Colors (Muted Palette):**
```css
--tool-beige: #a8998f     /* Warm neutral */
--tool-lavender: #a89db0  /* Cool neutral */
--tool-purple: #938aa9    /* Accent neutral */
```

---

## 📊 **CONTENT WORKFLOW (5 STAGES)**

### **The Journey:**
```
💡 Idea → ✍️ Drafting → 👀 Review → 📅 Scheduled → ✅ Published
```

### **Stage 1: Idea 💡** (`#ce9da4`)
**What it means:** Raw concept, not yet started

**How ideas get here:**
- Gmail integration (newsletters, research)
- Manual "Quick Add Content"
- Brain Dump sessions
- "Process Idea" from inbox

**What to do:**
- Review AI score (0-100)
- See suggested blueprint
- Click "Generate Draft"
- Archive if not interested

**Notification triggers:**
- New high-score idea (90+) appears in inbox
- Idea sits untouched for 14+ days

---

### **Stage 2: Drafting ✍️** (`#a77e93`)
**What it means:** Actively writing, not yet complete

**What to do:**
- Open in Content Editor
- Use Jamie for assistance
- Add blueprint structure
- Brain dump sections

**Typical time:**
- LI Post: 1-3 hours
- LI Article: 3-6 hours
- SS Post: 2-5 hours
- SS Audio: 1-2 hours (notes)

**Notification triggers:**
- Draft hasn't been touched in 7 days
- Word count milestone reached (500, 1000, etc.)

---

### **Stage 3: Review 👀** (`#aec3c1`)
**What it means:** Draft complete, final polish needed

**What to do:**
- Run "Suggest Improvements"
- Check Voice Match score
- Review Hook Analysis
- Get feedback (optional)

**Best practice:** Let draft rest 24 hours before reviewing

**Notification triggers:**
- Draft in Review for 3+ days without edits
- Voice Match score below 80%

---

### **Stage 4: Scheduled 📅** (`#83a5a7`)
**What it means:** Ready to publish, date/time set

**What to do:**
- Set scheduled date/time
- Generate SEO metadata
- Add to content calendar
- Prepare images/graphics

**Notification triggers:**
- Scheduled post 1 day before publish
- Scheduled post 1 hour before publish
- Scheduled post ready now (on publish time)

---

### **Stage 5: Published ✅** (`#9b91ac`)
**What it means:** Live on platform, has public URL

**What to include:**
- Published URL
- Publish date
- Performance metrics (optional)

**Long-term uses:**
- Track what you've published
- Find content to repurpose
- Build content series
- See content gaps

**Notification triggers:**
- Content performance milestone (engagement)
- Content could be repurposed (90 days old, high engagement)

---

## 📋 **BLUEPRINT SYSTEM (5 FAMILIES, 25 SUBTYPES)**

### **How Blueprints Work:**
**Blueprint** = Structure/format of content  
**Content Pillar Tags** = Topic/theme of content

---

### **1. 📖 STORY FAMILY**
**Purpose:** Share an experience

**Subtypes:**
1. **Personal Story** - Your lived experience
2. **Insight Story** - Story that reveals deeper pattern
3. **Mini Case Story** - Brief example from your work
4. **Origin Story** - How something came to be
5. **Other** - Story that doesn't fit above

**When to use:**
- Build connection and trust
- Show real-world examples
- Humanize complex concepts
- Demonstrate empathy

**Performance:** 8.9/10 average (highest performer)

**Example:**
> "What working as an IBD patient taught me about prior auth" (Insight Story)

**Template Example (Insight Story):**
```
SECTION 1: Set the Scene
→ When and where this happened (context)

SECTION 2: The Moment
→ What happened, what you noticed

SECTION 3: The Pattern
→ Why this moment matters beyond itself

SECTION 4: What This Means for You
→ Actionable insight for digital health teams

SECTION 5: The Bigger Stakes
→ Connect to larger themes in patient experience
```

---

### **2. 📚 EDUCATION FAMILY**
**Purpose:** Teach something valuable

**Subtypes:**
1. **Listicle** - "X things about Y" format
2. **Analysis** - Deep dive with research/data
3. **Tips for Innovators** - Actionable advice
4. **Resource Share** - Curated tools/frameworks
5. **Other** - Educational content

**When to use:**
- Share frameworks you use
- Teach specific skill/approach
- Break down complex topics
- Provide actionable takeaways

**Performance:** 7.6/10 average (highest volume)

**Example:**
> "5 questions to ask before rolling out a new patient portal" (Listicle)

**Template Example (Listicle):**
```
SECTION 1: Hook
→ Why this list matters now

SECTION 2-6: Items 1-5
→ Each with explanation + example

SECTION 7: Conclusion
→ Summary + next steps
```

---

### **3. 💡 PERSPECTIVE FAMILY**
**Purpose:** Offer a truth or opinion

**Subtypes:**
1. **Myth vs Reality** - Debunk misconceptions
2. **Hot Take** - Strong opinion on trending topic
3. **Truthism** - Plain truth that needs saying
4. **What Patients Wish You Knew** - Surface patient perspective
5. **Other** - Perspective content

**When to use:**
- Challenge conventional thinking
- Surface patient voice
- Call out industry gaps
- Share contrarian insights

**Performance:** 8.2/10 average

**Example:**
> "What Patients Wish Providers Knew About Prior Auth" (What Patients Wish You Knew)

**Template Example (What Patients Wish You Knew):**
```
SECTION 1: The Gap
→ What providers/builders typically assume or miss

SECTION 2: The Patient Reality
→ What it's actually like from patient perspective

SECTION 3: Why This Matters
→ How this gap affects care, trust, adoption

SECTION 4: What You Can Do
→ Practical shifts or questions to ask

SECTION 5: The Bigger Picture
→ Connect to broader patient experience themes
```

---

### **4. 💬 ENGAGEMENT FAMILY**
**Purpose:** Start a conversation

**Subtypes:**
1. **Question Post** - Ask audience a direct question
2. **Poll Setup** - Create LinkedIn poll
3. **Market Research Ask** - Survey network for insights
4. **Short Video Script** - Quick video/voice note plan
5. **Other** - Engagement content

**When to use:**
- Test ideas or assumptions
- Gather community input
- Spark discussion
- Build engagement

**Performance:** 6.8/10 average

**Example:**
> "Quick poll: What's the #1 barrier to patient portal adoption you see?" (Poll Setup)

---

### **5. 📢 ANNOUNCEMENT FAMILY**
**Purpose:** Share news or updates

**Subtypes:**
1. **Launch** - New project/service/offering
2. **Shoutout** - Recognize someone/celebrate milestone
3. **Speaking Announcement** - Upcoming speaking engagements
4. **Program/Resource Update** - Update on your work
5. **Other** - Announcement content

**When to use:**
- Share your work/projects
- Build visibility for speaking
- Celebrate collaborations
- Keep audience updated

**Performance:** 4.2/10 average (lowest, but necessary)

**Example:**
> Speaking announcement for upcoming healthcare UX conference (Speaking Announcement)

---

## 📝 **CONTENT EDITOR & JAMIE AI**

### **Main Editor:**
- Clean, distraction-free interface
- Auto-save every 30 seconds
- Live word count & reading time
- Markdown support

**Keyboard Shortcuts:**
- `Cmd/Ctrl + B` - Bold
- `Cmd/Ctrl + I` - Italic
- `Cmd/Ctrl + K` - Add link
- `Cmd/Ctrl + S` - Save
- `Cmd/Ctrl + J` - Open Jamie panel

---

### **Jamie AI Panel (5 Sections):**

#### **1. Generate Title 🏷️**
**What it does:**
- Provides 3-5 title options
- Different angle varieties
- Click to apply

**When to use:**
- Starting new piece
- Current title feels flat
- Want multiple perspectives

---

#### **2. Add Blueprint Template 📋**
**What it does:**
- Inserts structured content framework
- All 25 blueprint types available
- Sections with prompts

**When to use:**
- Stuck on structure
- Want proven framework
- Starting from scratch

---

#### **3. Suggest Improvements 🎯**
**What it checks:**
- Voice consistency
- Readability
- Clarity
- Flow

**Provides:**
- Line-by-line feedback
- "Strong" and "To Improve" sections
- Actionable suggestions

**When to use:**
- After first draft
- Something feels off
- Before moving to Review stage

---

#### **4. Generate SEO Info 📱**
**Creates:**
- Meta title
- Meta description (155 chars)
- 5-7 relevant hashtags
- Social preview text

**Platform-specific:**
- **LinkedIn:** Hashtags, preview hook
- **Substack:** Email subject lines (A/B options)

**When to use:**
- Content is final
- Moving to Scheduled status
- Ready to publish

---

#### **5. Publishing Reminder 📊**
**Shows:**
- Monthly content goal
- Progress (X of Y published)
- Days remaining in month
- Recommended cadence

**Helps with:**
- Staying consistent
- Avoiding burnout
- Planning ahead

---

### **Brain Dump Modal 🧠**
**Voice-to-text idea capture**

**Use for:**
- Messy initial thoughts
- Walking/driving captures
- Multiple ideas at once
- Getting unstuck

**Jamie structures into:**
- Main topic
- Key points
- Potential angle
- Next steps

---

## 📥 **IDEAS INBOX & GMAIL INTEGRATION**

### **How Ideas Get In:**

#### **1. Gmail Integration (Primary)**
**What gets pulled:**
- Healthcare news newsletters
- Research digests
- Industry publications
- Patient advocacy updates

**What you see:**
- Story headline
- Source snippet
- AI relevance score (0-100)
- Suggested blueprint
- Suggested platform

**Schedule:**
- Checks: Every 4 hours
- Processes: Last 7 days of emails
- Filters: Only flagged newsletters

---

#### **2. Manual Add**
**Use for:**
- Conversation inspiration
- Podcast reactions
- Personal observations
- Client questions

**Fields:**
- Idea/topic (required)
- Notes (optional)
- Platform preference (optional)

---

#### **3. Brain Dump**
**Automatically:**
- Transcribes speech
- Extracts main topic
- Adds to inbox
- Suggests blueprint

---

### **AI Scoring System (0-100):**

**90-100: Perfect Fit** ⭐⭐⭐
- Highly relevant to expertise
- Unique angle opportunity
- Timely topic
- Strong audience interest
**→ Action:** Write now or add to Working On Now

**70-89: Strong Potential** ⭐⭐
- Good fit for expertise
- Decent uniqueness
- Moderate timeliness
**→ Action:** Add to Ideas for later

**50-69: Moderate Fit** ⭐
- Some relevance
- Common angle
- Low urgency
**→ Action:** Consider if passionate, otherwise skip

**Below 50: Low Priority**
- Off-brand
- Overexposed topic
- Weak angle
**→ Action:** Archive

---

### **Auto-Blueprint Suggestion Logic:**
```typescript
// Jamie analyzes tags and auto-suggests blueprint
function suggestBlueprint(tags: string[]): BlueprintFamily {
  if (tags.includes('speaking_patient') || tags.includes('empathy_as_strategy')) {
    return 'Perspective'; // Patient voice content
  }
  if (tags.includes('full_patient_ecosystem') || tags.includes('fit_real_care_journeys')) {
    return 'Story'; // Real-world examples
  }
  if (tags.includes('co_design_hcd') || tags.includes('participatory_medicine')) {
    return 'Education'; // Process/frameworks
  }
  return 'Perspective'; // Default
}
```

---

## 📱 **PLATFORM TYPES & PUBLISHING**

### **LinkedIn Post** (LI Post)
**Color:** `#879fb5` (blue-gray)  
**Ideal Length:** 250-900 words
- Short: 250-400 (quick insight)
- Standard: 400-600 (main format)
- Long: 600-900 (deep dive)

**Best for:**
- Personal stories
- Hot takes
- Quick frameworks
- Data insights
- Myth-busting

**Cadence:** 2-3x per week

---

### **LinkedIn Article** (LI Article)
**Color:** `#5f7e9a` (darker blue)  
**Ideal Length:** 900-1,500 words
- Standard: 900-1,300
- Deep Dive: 1,300-1,500

**Best for:**
- Comprehensive guides
- Research analysis
- Multi-part frameworks
- Detailed case studies

**Cadence:** 1-2x per month

---

### **Substack Post** (SS Post)
**Color:** `#deb0ad` (rose-beige)  
**Ideal Length:** 600-1,500 words
- Short Essay: 600-1,000
- Standard Essay: 1,000-1,500
- Long Essay: 1,500-2,000

**Best for:**
- Personal narratives
- Deep analysis
- Serialized content
- Vulnerable sharing

**Cadence:** 1x per week (or biweekly)

---

### **Substack Audio** (SS Audio)
**Color:** `#ce9490` (coral)  
**Show Notes Length:** 200-500 words

**Best for:**
- Interviews
- Conversational deep-dives
- Audio-first content
- Behind-the-scenes

**Cadence:** Biweekly or monthly

---

## ⚙️ **SETTINGS & INTEGRATIONS**

### **Settings Page (6 Tabs):**

#### **1. Profile & Voice**
- Name, email, bio
- Expertise areas
- Voice guidelines
- Writing samples

#### **2. Content Statuses**
- Customize status colors
- Add custom statuses
- Reorder statuses
- Set default status

#### **3. Blueprint Templates**
- Edit existing templates
- Create custom blueprints
- Set favorite blueprints
- Archive unused blueprints

#### **4. Notifications**
- Desktop notification settings
- Status change alerts
- Snooze durations (5/15/30/60 min)
- Notification sound
- Quiet hours

#### **5. Integrations**
- **Gmail** - Ideas inbox sync
- **Google Calendar** - Publish scheduling
- **LinkedIn** - Simplified sharing
- **Substack** - API connection

#### **6. Goals & Analytics**
- Monthly content goals
- Weekly cadence targets
- Platform mix preferences
- Performance tracking

---

## 🔔 **NOTIFICATIONS SYSTEM**

### **Desktop Notifications:**
**Behavior:**
- Stay until snoozed or dismissed
- Snooze options: 5, 15, 30, 60 minutes
- Click to jump to item

### **Automatic Triggers:**

**Status Change Notifications:**
- Item moved to Drafting
- Item moved to Review
- Item scheduled for publish
- Item published successfully

**Time-Based Notifications:**
- Idea untouched 14+ days
- Draft untouched 7+ days
- Review sitting 3+ days
- Scheduled post 1 day before
- Scheduled post 1 hour before
- Scheduled post ready now

**Performance Notifications:**
- High-score idea (90+) appears
- Voice Match score below 80%
- Engagement milestone reached
- Content could be repurposed

### **Notification Settings:**
Located in Settings → Notifications tab

**Options:**
- Enable/disable by type
- Set quiet hours (9 PM - 8 AM default)
- Snooze duration preferences
- Sound on/off
- Badge count display

---

## 📂 **FILE STRUCTURE REFERENCE**

### **Key Files:**

#### **Main Pages:**
- `/ContentPage_SimpleTable.tsx` - Main content table view
- `/ContentEditor.tsx` - Full editor interface
- `/ContentFilteredView.tsx` - Filtered status/platform views
- `/SettingsPage.tsx` - Settings with 6 tabs

#### **Content Components:**
- `/components/content/ContentDetailModal.tsx` - Quick view modal
- `/components/content/JamieIdeaCard.tsx` - Inbox idea card
- `/components/content/ContentGoalReminder.tsx` - Publishing reminders
- `/components/content/PostMeetingContentWizard.tsx` - Post-meeting content flow

#### **Notification System:**
- `/contexts/NotificationContext.tsx` - Notification provider
- `/components/muted_NotificationBell.tsx` - Notification bell UI
- `/components/muted_NotificationPanel.tsx` - Notification panel
- `/utils/notificationHelpers.ts` - Helper functions

#### **Documentation:**
- `/CONTENT_BLUEPRINTS_REFERENCE.md` - Complete blueprint guide
- `/CONTENT_APP_MANUAL.md` - Full user manual
- `/CONTENT_FILES_EXPLAINED.md` - File structure explained
- `/CONTENT_PAGE_FEATURES.md` - Feature specifications
- `/CONTENT_NOTIFICATIONS_COMPLETE.md` - Notification system docs

#### **Data & Types:**
```typescript
// Content Item Type
interface ContentItem {
  id: string;
  title: string;
  status: 'Idea' | 'Drafting' | 'Review' | 'Scheduled' | 'Published';
  platform: 'LI Post' | 'LI Article' | 'SS Post' | 'SS Audio';
  content: string;
  blueprintFamily?: 'Story' | 'Education' | 'Perspective' | 'Engagement' | 'Announcement';
  blueprintSubtype?: string;
  contentPillarTags?: string[];
  relevanceScore?: number; // 0-100
  wordCount?: number;
  scheduledDate?: Date;
  publishedUrl?: string;
  publishedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  isWorking?: boolean; // "Working On Now" flag
  isArchived?: boolean;
}
```

---

## 🎯 **CONTENT PILLAR TAGS**

Your 8 core expertise areas (from AI_PROFILE_V1):

1. **speaking_patient** - Language, tone, communication
2. **fit_real_care_journeys** - Workflow, care continuum
3. **full_patient_ecosystem** - Admin burden, hidden work
4. **empathy_as_strategy** - Trust, engagement, activation
5. **co_design_hcd** - Human-centered design, co-creation
6. **participatory_medicine** - Patient partnership
7. **multi_stakeholder_alignment** - Cross-functional collaboration
8. **what_good_care_looks_like** - Care quality, respect

---

## 🚀 **QUICK START GUIDE**

### **Week 1: Setup**
- [ ] Connect Gmail for inbox
- [ ] Add 5-10 manual ideas
- [ ] Explore blueprints
- [ ] Try Brain Dump
- [ ] Set notification preferences

### **Week 2: First Content**
- [ ] Pick highest-scored inbox item
- [ ] Use suggested blueprint
- [ ] Write first draft
- [ ] Run Suggest Improvements
- [ ] Publish!

### **Week 3: Build Pipeline**
- [ ] Process 5 inbox items
- [ ] Start 2 new drafts
- [ ] Complete 1 piece
- [ ] Schedule 1 piece

### **Week 4: Establish Rhythm**
- [ ] Set weekly content goal
- [ ] Create "Working On Now" focus list
- [ ] Batch idea processing
- [ ] Review what's working

---

## 📊 **BEST PRACTICES**

### **Content Mix (Recommended):**
- **60%** Education + Story (your strengths)
- **30%** Perspective (your unique voice)
- **10%** Engagement + Announcement (community building)

### **Weekly Workflow:**
- **Monday:** Process inbox → plan week
- **Tuesday-Thursday:** Writing sessions
- **Friday:** Review and schedule
- **Anytime:** Brain Dump captures

### **Batching Strategy:**
1. **Idea sprint:** Process 5-10 inbox items
2. **Structure sprint:** Add blueprints to 3-5 pieces
3. **Writing sprint:** Draft 2-3 pieces
4. **Polish sprint:** Review and finalize
5. **Scheduling sprint:** SEO + schedule week ahead

### **Status Hygiene:**
- Update status as you work
- Don't let items stagnate
- Archive dead ideas
- Keep "Working On Now" to 1-3 items max

---

## 🆘 **TROUBLESHOOTING**

**"My inbox is overwhelming"**
→ Archive items below 70 score, process top 3 only

**"Too many items in Drafting"**
→ Limit to 3 max, complete before starting new

**"Don't know what to write next"**
→ Check inbox scores, review "Working On Now"

**"Content doesn't feel cohesive"**
→ Stick to 2-3 blueprints, check Voice Match scores

---

## 📈 **SUCCESS METRICS**

Track monthly:
- **Volume:** Content published by platform
- **Efficiency:** Avg time Idea → Published
- **Quality:** Avg Voice Match score, engagement
- **Pipeline:** % of inbox items that become content

---

**That's your complete Content Management System!** 🎉

This guide covers everything another AI assistant needs to understand your content capabilities, workflow, blueprints, and system architecture.
