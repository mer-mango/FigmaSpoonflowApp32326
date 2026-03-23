# Content Studio - Complete Feature Set

## 🎨 **Core Views**

### 1. **Pipeline View (Kanban)**
- Columns: Ideas → Drafting → In Progress → Review → Scheduled → Published
- Drag-and-drop ready (can be implemented)
- Visual progress tracking
- Color-coded status indicators

### 2. **List View**
- Grouped by status
- Grid layout with 3 columns
- Filterable and searchable

### 3. **Calendar View**
- Timeline of scheduled content
- Sortable by date
- Quick access to edit

### 4. **Published Tab**
- Separate archive of published content
- Searchable and filterable
- Performance tracking ready (link to posts, engagement)

## 🤖 **Jamie Integration**

### **Proactive Content Ideas**
- Jamie suggests ideas based on:
  - Recent meetings
  - Calendar events
  - User behavior patterns
- Purple "Jamie suggestion" cards in Ideas column
- Shows reasoning and source
- Accept or dismiss

### **Post-Meeting Wizard**
- Automatically triggers after meetings
- Suggests 3 content ideas based on meeting notes
- Option for custom idea
- One-click add to content ideas

### **Section-by-Section Writing (Long-form)**
For LinkedIn Articles & Substack:
1. **Hook/Story** - Personal narrative or vignette
2. **Analysis/Application** - Strategic insights
3. **Industry Examples** (Optional) - Real-world connections
4. **Takeaways/CTA** - Key insights and action
5. **Final Polish** - Review and refine

Features:
- Collapsible sections with completion checkmarks
- Work on one section at a time
- Save progress between sessions
- "Resume Writing" dialog asks when to continue

### **Jamie's Feedback**
- "Get Jamie's Feedback" button in editor
- Analyzes:
  - Hook quality
  - Scannability
  - Voice alignment
  - Character length (LinkedIn specific)
  - CTA effectiveness
- Can highlight specific text
- Suggests improvements

### **Quick Improvements**
- Improve Hook
- Rewrite
- Make Shorter
- Context-aware based on content type

## 📝 **Writing Guidelines (Built into Jamie)**

### **LinkedIn Posts:**
- Max 1300 characters (warns if over)
- No emojis
- Clear, scannable structure
- Strong hook at beginning
- Warm, confident tone
- Advocacy-forward

### **LinkedIn Articles:**
- More formal but still human
- 5-section structure
- Data-driven
- Professional storytelling

### **Substack:**
- More personal/conversational
- Story-focused
- Less stiff than LinkedIn
- Longer form allowed

## 🎯 **Content Organization**

### **Tags**
- Freeform tags (e.g., "digital health", "patient experience")
- Clickable to filter
- Shows in tag pills on cards
- Can search by tag

### **Links & Relationships**
- Link to **Contacts** (e.g., "Post about Sarah Thompson")
- Link to **Goals** (e.g., "3 Substack posts this month")
- Link to **Activities/Meetings** (source of inspiration)
- Track **source materials** (URL or PDF)

### **Source Material**
- Upload PDFs, attach URLs
- Jamie extracts key points
- Shows in editor as reference
- Used for drafting context

## 📅 **Scheduling & Publishing**

### **Manual Posting Workflow:**
1. Write and schedule content
2. Set target date/time
3. Creates "Post to LinkedIn" task card
4. Auto-schedules to next Content routine block
5. Reminder triggers at scheduled time
6. Click "Post Now" → Opens LinkedIn + Copies text to clipboard
7. Paste and post manually
8. Mark as "Done" → Moves to Published tab

### **Why Manual?**
- ✅ No complex OAuth setup
- ✅ Engage with comments immediately
- ✅ Check final formatting
- ✅ More authentic and responsive
- ✅ Last-minute tweaks

### **Content Blocks Integration:**
- Content routine blocks in calendar (e.g., Tues/Thurs)
- Content tasks auto-fill into these blocks
- Can reorder, defer, or archive
- Appears in Today page right sidebar

## 🎯 **Goal Tracking**

### **Goal Reminders:**
- Purple banner at top of Content page
- Shows progress bar
- Days remaining
- "On track" vs "Need X more" messaging
- Auto-reminder in next content block if behind

### **Goal Types:**
- "Post 3 Substack articles this month"
- "Publish 2 LinkedIn posts per week"
- Tracks automatically when you publish
- Lives on Goals page, reminds on Content page

## 🔄 **Status Workflow**

### **Status Transitions:**
1. **Idea** - Captured concept
2. **Draft** - Jamie generating or you writing
3. **In Progress** - Partially complete (for long-form)
   - Can pause and resume
   - Choose when to continue (next content block, today sidebar, specific time)
4. **In Review** - Ready for final check
   - Get Jamie's feedback
   - Polish and refine
5. **Scheduled** - Date/time set, task created
6. **Published** - Manually posted, archived

### **"Resume Writing" Dialog:**
When you save "In Progress" content:
- **Next content block** (Recommended) - Maintains routine
- **Add to today's tasks** - Work on it anytime today
- **Pick specific time** - Custom scheduling

## 🎨 **Visual Design**

### **Brand Colors:**
- **#2f829b** - Primary actions (New Content, active views)
- **#034863** - Secondary elements
- **#6b2358** - Jamie/AI features (purple gradient)

### **Channel Colors:**
- **#0077B5** - LinkedIn Post
- **#0A66C2** - LinkedIn Article  
- **#FF6719** - Substack

### **Card Design:**
- Colored stripe at top (channel color)
- Title, preview, tags
- Date badge
- Quick actions on hover (Copy, Edit)
- Status badge
- Three-dot menu

## 📱 **Content Detail Modal**

### **Layout:**
- **Left 2/3**: Main editor
  - Title
  - Body/Sections
  - Tags
  - Image
  - Source material

- **Right 1/3**: Sidebar
  - Jamie's Help section
  - Get Feedback button
  - Quick improvements
  - Scheduling
  - Quick actions

### **Features:**
- View/Edit mode toggle
- Character counter
- LinkedIn length warnings
- Image upload with alt text
- Tag management
- Section progress tracking (long-form)
- Copy text
- Post Now (opens LinkedIn + copies)
- Set reminder

## 🔍 **Search & Filters**

- **Global search** across all content
- **Channel filter** (All, LinkedIn Post, Article, Substack)
- **Tag filter** (click tags to filter)
- **Status filter** (implicit in views)
- **Date range** (for published content)

## 📊 **Stats Bar**

Shows at top:
- X Ideas (includes Jamie suggestions)
- X Drafting
- X In Progress
- X Scheduled
- X Published

## 🚀 **Quick Actions**

### **Throughout App:**
- "+" button to add content idea
- Quick capture for inspiration
- Post-meeting content suggestion
- From interaction → Create content idea

### **On Cards:**
- Copy text
- Edit
- Archive
- Three-dot menu (more options)

## 🎯 **Next Steps for Implementation**

1. ✅ **All components created:**
   - ContentPageRedesign (main)
   - ContentDetailModal (editor)
   - ContentGoalReminder (purple banner)
   - ResumeWritingDialog (scheduling)
   - JamieIdeaCard (suggestions)
   - PostMeetingContentWizard (post-meeting)

2. **Backend Integration Needed:**
   - Connect to actual ContentItem and PostIdea entities
   - Implement Jamie's AI generation (InvokeLLM)
   - PDF/URL extraction
   - Task creation integration
   - Calendar/routine block integration
   - Goal progress tracking

3. **Features to Add:**
   - Drag-and-drop between columns
   - Image editing (crop, filter)
   - Rich text formatting
   - LinkedIn preview mode
   - Engagement tracking (after publish)
   - Content performance analytics
   - Batch operations

4. **Polish:**
   - Loading states
   - Error handling
   - Toast notifications
   - Keyboard shortcuts
   - Mobile responsiveness

---

## 📋 **Remember: Tasks Page Fixes**

After Content page is complete:
- [ ] Add colored stripe to task cards
- [ ] Fix three-dot menu functionality
- [ ] Review and complete task modal

---

**Status:** ✅ All core components built and ready for integration!
