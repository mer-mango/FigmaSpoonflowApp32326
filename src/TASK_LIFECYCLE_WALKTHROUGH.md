# SpoonFlow Task Lifecycle - Complete Walkthrough

## 🎯 OVERVIEW
This document walks through the complete task lifecycle from creation to completion, with special focus on Jamie's scheduling integration and the Today page timeline.

---

## 📝 PHASE 1: TASK CREATION

### **Entry Points** ✅ FULLY BUILT
1. **Quick Add Button (+)** → Select "Task"
2. **Tasks Page** → "New Task" button
3. **Voice Input** → Quick Add → Voice
4. **From Contact** → Tasks tab in contact profile

### **Task Modal Fields** ✅ FULLY BUILT
Located in: `/components/muted_TaskModal.tsx`

**Core Fields:**
- ✅ **Title** (with voice dictation 🎤)
- ✅ **Contact** (searchable dropdown, linkable to contact profile)
- ✅ **Due Date** (date picker)
- ✅ **Status** (To Do, In Progress, Awaiting Reply, Done)
- ✅ **Task Type** (8 types with auto-detection):
  - `schedule_their_link` - Book time on their calendar
  - `schedule_my_link` - Send your scheduling link to them
  - `outreach` - Initial contact/outreach
  - `follow_up` - Follow up on previous conversation
  - `admin` - Administrative tasks
  - `creative` - Content creation, design work
  - `strategic` - Planning, strategy sessions
  - `learning` - Research, courses, reading
- ✅ **Estimated Time** (in minutes, with Jamie's learned estimates)
- ✅ **Notes** (rich text with @mentions)
- ✅ **Tags** (comma-separated)
- ✅ **Folder** (organization)
- ✅ **Flag** (high priority star)

**Smart Features:**
- ✅ Task type auto-detection from title/notes
- ✅ Jamie's learned time estimates (adjusts based on your history)
- ✅ Contact autocomplete with company/email display
- ✅ Voice dictation for title field

**Special Scheduling Actions** ✅ FULLY BUILT
When task type is set to scheduling:

1. **`schedule_their_link`** → Shows button to open their scheduling URL
2. **`schedule_my_link`** → Generates email draft with YOUR link
3. **`outreach`** → Draft outreach email button

---

## ⚡ PHASE 2: START MY TASK (Jamie Assistance)

### **"Start My Task" Button** ✅ FULLY BUILT
Located in: Task Modal footer (when viewing existing task)

**What It Does:**
Opens `StartMyTaskModal` with context-aware suggestions from Jamie

**Jamie's Logic** (`/utils/jamieAI.ts` - `generateStartMyTaskDraft()`):

1. **For `schedule_their_link` tasks:**
   - Shows contact's scheduling URL as clickable link
   - Message: "Ready to schedule with [Name]! Click the link above to book a time on their calendar."

2. **For `schedule_my_link` tasks:**
   - Generates full email draft with subject line
   - Includes YOUR scheduling link from Settings
   - Message includes task context (e.g., "about [topic]")
   - Format: "Hi [Name], I'd love to connect and chat about [topic]..."

3. **For all other task types:**
   - Breaks down task into actionable steps
   - Includes contact context (name, company, email)
   - Provides first concrete action to take

**Example Outputs:**

```
TASK: "schedule with Sarah about Q1 strategy"
TYPE: schedule_their_link
JAMIE: "Ready to schedule with Sarah!

Click the link above to book a time on their calendar.

https://calendly.com/sarah-example"
```

```
TASK: "send my link to Michael for coffee chat"
TYPE: schedule_my_link
JAMIE: "Subject: Let's schedule a call

Hi Michael,

I'd love to connect and chat about coffee chat.

Here's my scheduling link—feel free to pick a time that works for you:
https://calendar.app.google/RYD84SRDRH4U7Y3T6

Looking forward to it!

Best,
Meredith"
```

---

## 📅 PHASE 3: JAMIE GENERATES YOUR SCHEDULE (AM Wizard)

### **How to Access** ✅ FULLY BUILT
**Today Page** → Jamie button → "Plan my day"

### **AM Wizard Flow** ✅ FULLY BUILT
Located in: `/components/today/AMWizard.tsx`

**Step 1: Energy Check** 🌟
- "How's your energy this morning?"
- Options: Fresh & Ready / Okay / Low / Running on fumes
- Jamie adjusts schedule based on energy level

**Step 2: Select Routines** 🔄
Shows your saved routines (from `/utils/exampleData.ts`):
- Plan My Day (priority 1) - always first
- AM Admin (priority 1) - email, Slack, quick responses
- Focused Work Block (priority 1)
- Content Creation (priority 2)
- Workout (priority 3)
- Etc.

Each shows:
- Name, duration, time preference
- Select/deselect with checkbox
- High-priority routines recommended by default

**Step 3: Pull in Today's Meetings** 📆
- Automatically fetches from your calendar
- Shows: time, title, location/video link
- Can edit or remove individual meetings
- Adds 15-min buffer before/after

**Step 4: Add Task Playlists** ✅ 
Creates "playlists" of related tasks to batch together:

```
Example Playlist: "Client Check-ins"
- Follow up with Sarah (15 min)
- Send contract to Michael (10 min)
- Review feedback from Jennifer (20 min)
Total: 45 minutes
```

**How It Works:**
- Select tasks from your task list
- Jamie groups by contact or theme
- Uses estimated time from each task
- Can create multiple playlists

**Step 5: Choose Start Time** ⏰
- Shows time slots in 15-min increments
- "Right now" or future times
- Visual indicator of how far away each slot is

**Step 6: Review Generated Schedule** 📋
Jamie's `generateSchedule()` function does this:

1. **Places fixed blocks first:**
   - Plan My Day at your chosen start time
   - AM Admin right after
   - All meetings with 15-min buffers
   
2. **Fills gaps with routines & playlists:**
   - Priority 1 routines first
   - Task playlists in appropriate time slots
   - Secondary routines if time allows
   
3. **Smart adjustments:**
   - Shortens routines if needed
   - Skips low-priority items if tight on time
   - Respects your desired end time
   
4. **Shows you what changed:**
   - "Modified 'Workout' from 45 to 30 minutes"
   - "Skipped 'Reading' (not enough time)"

**Final Confirmation:**
- View full timeline preview
- See all adjustments Jamie made
- Click "Lock it in!" to apply to Today page

---

## 🎨 PHASE 4: TODAY PAGE TIMELINE VIEW

### **What You See** ✅ FULLY BUILT
Located in: `/components/TodayPageFilledExample_Muted.tsx`

**Left Side - Timeline Column:**
Shows your full schedule from AM Wizard as colored blocks:

```
8:00 AM  ┌─────────────────────┐
         │ Plan My Day         │ [Purple - routine]
8:15 AM  ├─────────────────────┤
         │ AM Admin            │ [Purple - routine]
9:00 AM  ├─────────────────────┤
         │ Focused Work Block  │ [Purple - routine]
         │ ▶️ PLAY             │
10:30 AM ├─────────────────────┤
         │ Meeting Buffer      │ [Gray - buffer]
10:45 AM ├─────────────────────┤
         │ 1:1 with Sarah      │ [Blue - meeting]
         │ 📍 Zoom             │
11:30 AM ├─────────────────────┤
         │ Meeting Buffer      │ [Gray - buffer]
11:45 AM ├─────────────────────┤
         │ Client Check-ins    │ [Teal - playlist]
         │ • Sarah follow-up   │
         │ • Michael contract  │
         │ • Jennifer review   │
12:30 PM └─────────────────────┘
```

**Block Types & Colors:**
- 🟣 **Routine** - Purple (#c198ad)
- 🔵 **Meeting** - Blue (#7fa99b)
- 🔷 **Playlist** - Teal (#8ba5a8)
- ⚪ **Buffer** - Gray (#d4d4d8)

**Block Features:**
- ⏰ Start time on left
- 📊 Duration bar
- 🎵 Playlist icon (if assigned)
- ▶️ Play button (starts timer)
- ⏸️ Pause button (when active)
- ⏭️ Skip button
- ⚙️ More menu (edit, delete, etc.)
- 🔒 Lock icon (for Plan My Day - can't be moved/deleted)

**Right Side - To-Do Panel:**
Shows tasks in context-aware sections:

1. **During a Playlist Block:**
   ```
   📋 CURRENT PLAYLIST: Client Check-ins
   
   ✓ Follow up with Sarah (15 min)
   ☐ Send contract to Michael (10 min)
   ☐ Review feedback from Jennifer (20 min)
   
   Progress: 1/3 complete • 25 min remaining
   ```

2. **During Open Work Time:**
   ```
   📌 FOCUS ON
   
   ☐ Finish blog post draft
   ☐ Review Q1 strategy deck
   ☐ Update client spreadsheet
   ```

3. **Outside Work Hours:**
   ```
   📅 UPCOMING
   
   Tomorrow:
   ☐ Call with potential client
   ☐ Send proposal to Michael
   
   This Week:
   ☐ Prepare webinar slides
   ☐ Follow up on 3 proposals
   ```

**Interactive Features:**
- ✅ Check off tasks inline
- 🌟 Flag/unflag tasks
- ✏️ Quick edit (click to open modal)
- 👤 Contact linking
- 🏷️ Tag filtering

---

## ⏱️ PHASE 5: DURING "TASK TIME" (Active Focus Mode)

### **Starting a Block** ✅ FULLY BUILT
Click ▶️ **PLAY** on any timeline block

**What Happens:**
1. FloatingFocusWidget appears (draggable timer bar)
2. Timeline block highlights in green
3. To-do panel updates to show relevant tasks
4. Countdown timer starts

### **FloatingFocusWidget** ✅ FULLY BUILT
Located in: `/components/FloatingFocusWidget.tsx`

**Minimized State (Default):**
```
┌──────────────────────────────────────────┐
│ 🎯 Client Check-ins    ⏱️ 42:30    ⏸️ ⚙️ │
└──────────────────────────────────────────┘
```
- Task/block name
- Countdown timer (MM:SS)
- Pause button
- More options
- **Draggable** - move anywhere on screen

**Expanded State:**
```
┌──────────────────────────────────────────────┐
│  🎯 Client Check-ins              ⏸️ ⚙️ 🗕   │
├──────────────────────────────────────────────┤
│                                               │
│  ⏱️ 42 minutes 30 seconds remaining          │
│                                               │
│  📋 Tasks in this playlist:                   │
│  ✓ Follow up with Sarah                      │
│  ☐ Send contract to Michael                  │
│  ☐ Review feedback from Jennifer             │
│                                               │
│  🎵 Focus Beats playing                       │
│                                               │
│  📍 Next: Lunch Break at 12:30 PM             │
│                                               │
├──────────────────────────────────────────────┤
│  [PAUSE]  [SKIP TO NEXT]  [END EARLY]        │
└──────────────────────────────────────────────┘
```

**Features:**
- ⏸️ Pause/Resume
- ⏭️ Skip to next block
- 🛑 End early
- 🗕 Minimize/Maximize
- 🎵 Shows active music playlist (if set)
- 📍 Shows what's next

**Timer Colors:**
- 🟢 Green: Plenty of time (>50% remaining)
- 🟡 Yellow: Halfway done (25-50%)
- 🔴 Red: Running low (<25%)
- ⏰ Blinking: Last 5 minutes

### **Timeline During Active Block** ✅ BUILT
- Current block: Highlighted with green border + pulsing indicator
- Past blocks: Faded/grayed out
- Current time: Red line showing "NOW"
- Future blocks: Normal appearance

### **To-Do Panel During Active Block** ✅ BUILT

**For Playlist Blocks:**
```
🎯 ACTIVE FOCUS: Client Check-ins

✓ Follow up with Sarah                    ✓ Done
  └─ Called and confirmed next meeting

☐ Send contract to Michael                [Start]
  └─ Draft ready in Google Drive

☐ Review feedback from Jennifer           [Start]

─────────────────────────────────
Progress: 1 of 3 • 25 min left
```

**For Open Work Blocks:**
```
🎯 ACTIVE FOCUS: Focused Work Block

Quick Add: [+ Add task to this block]

☐ Task 1
☐ Task 2
☐ Task 3

─────────────────────────────────
💡 TIP: Working on something else?
   [Tell Jamie what you're doing]
```

**For Routine Blocks:**
```
🔄 ACTIVE ROUTINE: AM Admin

✓ Check email
☐ Respond to Slack messages
☐ Review calendar for tomorrow
☐ Quick admin tasks

─────────────────────────────────
⏱️ 15 min remaining
```

---

## ✅ PHASE 6: COMPLETING TASKS

### **During Task Execution** ✅ BUILT
Three ways to mark complete:

1. **Timeline To-Do Panel:**
   - Click checkbox next to task
   - Task fades with strikethrough
   - Confetti animation 🎉 (if it's a big task)
   - Progress bar updates

2. **FloatingFocusWidget (expanded):**
   - Click checkbox in task list
   - Same celebration effects

3. **Tasks Page:**
   - Find task in any view (Board/Table/Timeline)
   - Click checkbox
   - Task moves to "Done" column/section

### **What Happens on Completion** ✅ BUILT
1. Task status → "Done"
2. Completion timestamp saved
3. Jamie learns from time taken vs. estimated
4. Removed from active to-do lists
5. Available in "Completed" filter
6. Counts update everywhere

### **Block End Modal** ✅ BUILT
Located in: `/components/muted_BlockEndModal.tsx`

**Triggers when:**
- Timer reaches 0:00
- You click "End Early"
- You click "Skip to Next"

**Modal Content:**
```
┌─────────────────────────────────────────┐
│  ✨ Nice work on Client Check-ins!      │
│                                          │
│  📋 How'd it go?                         │
│                                          │
│  ☐ Follow up with Sarah                 │
│  ☐ Send contract to Michael             │
│  ☐ Review feedback from Jennifer        │
│                                          │
│  💬 Quick note (optional):               │
│  [____________________________]          │
│                                          │
│  🎯 Ready for the next block?            │
│                                          │
│  [YES, START NEXT]   [TAKE A BREAK]     │
└─────────────────────────────────────────┘
```

**Smart Features:**
- Shows incomplete tasks from the block
- Asks if you want to mark any complete
- Optional notes field
- Auto-starts next block OR gives break option
- Jamie learns: "You usually need 5 extra minutes for client check-ins"

---

## 📊 PHASE 7: TASK ANALYTICS & LEARNING

### **Jamie's Learning** ⚡ PARTIALLY BUILT

**Currently Built:**
✅ Time estimate learning per task type
✅ Stored in `/utils/jamieTimeEstimates.ts`
✅ Updates when tasks complete
✅ Used in AM Wizard scheduling

**Example:**
```javascript
{
  "creative": {
    estimatedTime: 45,
    actualTime: 60,
    completedTasks: 12
  }
  // Jamie learns: "Your creative tasks usually take 33% longer"
  // Next time: Auto-adjusts creative task estimates
}
```

**Not Yet Built (Future):**
❌ Task completion rate by time of day
❌ Focus quality metrics
❌ Energy level correlation
❌ Contact interaction patterns
❌ Playlist effectiveness scoring

---

## 🎯 **What's Fully BUILT vs. WHAT'S LEFT**

### ✅ **FULLY FUNCTIONAL**

1. **Task Creation & Management**
   - ✅ Full modal with all fields
   - ✅ Voice dictation for title
   - ✅ Contact linking & searching
   - ✅ Task type detection
   - ✅ Time estimates with learning
   - ✅ Tags, folders, flags
   - ✅ "Start My Task" modal with AI suggestions

2. **Scheduling Integration**
   - ✅ Contact scheduling URLs stored
   - ✅ User scheduling link in Settings
   - ✅ "Schedule their link" button
   - ✅ "Send my link" email generation
   - ✅ Outreach email drafting

3. **AM Wizard (Jamie Planning)**
   - ✅ Full 6-step wizard
   - ✅ Energy level assessment
   - ✅ Routine selection
   - ✅ Meeting import
   - ✅ Task playlist creation
   - ✅ Start time selection
   - ✅ Schedule generation algorithm
   - ✅ Adjustment explanations

4. **Today Page Timeline**
   - ✅ Visual timeline with blocks
   - ✅ Color-coded by type
   - ✅ Play/Pause/Skip controls
   - ✅ Drag & drop reordering
   - ✅ Current time indicator
   - ✅ Block details & editing

5. **Focus Mode**
   - ✅ FloatingFocusWidget
   - ✅ Countdown timer
   - ✅ Minimize/Maximize/PiP
   - ✅ Task list in widget
   - ✅ Next block preview
   - ✅ Draggable positioning

6. **To-Do Panel Context**
   - ✅ Shows playlist tasks during playlist time
   - ✅ Shows general tasks during open work
   - ✅ Inline task completion
   - ✅ Progress tracking
   - ✅ Quick task editing

7. **Block Completion**
   - ✅ Block End Modal
   - ✅ Task completion checkboxes
   - ✅ Auto-advance to next block
   - ✅ Break option

8. **Timeline Notifications** ✨ NEW!
   - ✅ Desktop notifications for block starting
   - ✅ 5-minute warning when time is running out
   - ✅ Block ended notification
   - ✅ In-app toast notifications
   - ✅ Respects notification preferences (quiet hours, muted, etc.)
   - ✅ Auto-requests browser permission
   - ✅ **Interactive action buttons** (Complete, Snooze 5/10/15 min)
   - ✅ **Click-to-focus** - Opens app and shows options
   - ✅ **Jamie schedule adjustment** - Asks how to use saved time
   - ✅ Works across all windows/apps (not just when SpoonFlow is focused)

### ⚠️ **PARTIALLY BUILT / NEEDS WORK**

1. **Task-Timeline Sync**
   - ⚠️ Tasks created from AM Wizard → Need to save to main task list
   - ⚠️ Tasks checked off in timeline → Should update main Tasks page
   - ⚠️ Task time tracking → Should save actual time spent
   - ⚠️ Playlist tasks → Need proper IDs and full task data

2. **Jamie Learning**
   - ⚠️ Time estimates → Working but could be more sophisticated
   - ⚠️ No learning from completion patterns yet
   - ⚠️ No energy level correlation yet
   - ⚠️ No time-of-day effectiveness tracking

3. **Calendar Integration**
   - ⚠️ Google Calendar OAuth is set up
   - ⚠️ Can fetch events
   - ⚠️ Can't yet CREATE events from timeline blocks
   - ⚠️ Can't yet UPDATE events when blocks change

### ❌ **NOT YET BUILT**

1. **Recurring Tasks**
   - ❌ No repeat patterns (daily/weekly/monthly)
   - ❌ No "complete and create next instance"

2. **Subtasks / Task Breakdown**
   - ❌ Can't create subtasks within a task
   - ❌ No hierarchical task structure
   - ❌ Jamie suggests breakdowns but doesn't create them automatically

3. **Task Dependencies**
   - ❌ Can't mark "Task B depends on Task A"
   - ❌ No automatic reordering based on dependencies

4. **Advanced Timeline Features**
   - ❌ Can't manually create blocks outside AM Wizard
   - ❌ No "reschedule all remaining blocks" function
   - ❌ No automatic time block suggestions during the day

5. **Mobile Responsive Timeline**
   - ❌ Timeline is desktop-focused
   - ❌ Focus widget not optimized for mobile

6. **Notifications**
   - ❌ No browser notifications when block starts
   - ❌ No "5 minutes left" warnings
   - ❌ No end-of-block chime/alert

---

## 🧪 TESTING CHECKLIST

### **Test 1: Create a Task**
1. Click + button → Select Task
2. Type title: "Follow up with Sarah about Q1 strategy"
3. Select contact: Sarah
4. Set task type: follow_up
5. Note estimated time (should be Jamie's learned estimate)
6. Add notes: "Discuss budget allocation and timeline"
7. Set due date: Tomorrow
8. Click "Create Task"
9. **Verify:** Task appears in Tasks page

### **Test 2: Start My Task (Scheduling)**
1. Create task: "schedule with Michael"
2. Set type: schedule_their_link
3. Add Michael as contact (make sure he has a scheduling URL)
4. Save task
5. Reopen task → Click "Start my task"
6. **Verify:** Modal shows Michael's scheduling link
7. Create another task: "send my link to Jennifer"
8. Set type: schedule_my_link
9. Click "Start my task"
10. **Verify:** Email draft with YOUR scheduling link

### **Test 3: AM Wizard → Timeline**
1. Today page → Jamie button → "Plan my day"
2. Select energy: "Fresh & Ready"
3. Select routines: Plan My Day, AM Admin, Focused Work
4. Add a fake meeting at 10:00 AM
5. Create playlist: "Admin Tasks" with 3 tasks
6. Choose start time: "Right now"
7. Review schedule → Click "Lock it in!"
8. **Verify:** Timeline shows all blocks in order
9. **Verify:** Playlist block shows 3 tasks

### **Test 4: Active Focus Mode**
1. Click ▶️ on first timeline block
2. **Verify:** FloatingFocusWidget appears
3. **Verify:** Timer counts down
4. **Verify:** Block highlights in timeline
5. **Verify:** To-do panel shows relevant tasks
6. Try dragging focus widget
7. Try minimizing/maximizing
8. Click Pause → **Verify:** Timer stops

### **Test 5: Task Completion Flow**
1. During active playlist block
2. Check off first task in to-do panel
3. **Verify:** Task gets strikethrough
4. **Verify:** Progress updates (1/3 complete)
5. **Verify:** Focus widget updates task list
6. Let timer run to 0:00
7. **Verify:** Block End Modal appears
8. Mark remaining tasks complete
9. Click "Yes, start next"
10. **Verify:** Next block auto-starts

### **Test 6: Scheduling Link Settings**
1. Settings → Profile
2. Scroll to "My Scheduling Link"
3. Edit link to: "https://calendly.com/your-link"
4. Click "Save Link"
5. Create task with type: schedule_my_link
6. Click "Start my task"
7. **Verify:** Email draft contains your new link

---

## 🚀 RECOMMENDED NEXT PRIORITIES

Based on what's missing:

1. **CRITICAL:** Task-Timeline Sync
   - Save playlist tasks to main task list with proper IDs
   - Update task status when checked in timeline
   - Track actual time spent on tasks

2. **HIGH VALUE:** Timeline Block Creation Outside Wizard
   - Quick "Block time for this task" button in task modal
   - Manual block creation in timeline
   - Drag tasks from to-do panel → timeline

3. **POLISH:** Notifications & Alerts
   - Block start notifications
   - 5-minute warnings
   - End-of-block chime

4. **NICE TO HAVE:** Calendar Sync
   - Push timeline blocks → Google Calendar
   - Two-way sync when events change

5. **FUTURE:** Recurring Tasks & Dependencies
   - Would require significant data model changes

---

## 💡 TIPS FOR USING THE SYSTEM

**Best Practices:**
1. **Morning:** Always run AM Wizard to set up your day
2. **Task Creation:** Set task type + estimated time for better Jamie learning
3. **During Day:** Use FloatingFocusWidget in minimized mode for visibility without distraction
4. **End of Block:** Take 30 seconds to mark tasks complete and add notes
5. **Scheduling:** Use the smart scheduling buttons instead of manually writing emails

**Common Workflows:**
- **"I need to schedule with someone"** → Create task with type, add contact, use "Start my task"
- **"I have a bunch of similar tasks"** → Group into playlist in AM Wizard
- **"I'm running behind"** → Pause current block, drag remaining blocks later
- **"I finished early"** → Click "End Early" and start next block

---

**Last Updated:** January 24, 2026
**Version:** Based on current codebase state