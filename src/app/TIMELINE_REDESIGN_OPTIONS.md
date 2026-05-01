# Timeline Redesign - Design Options

## Overview
A simplified, manual timeline where:
- **Jamie automatically populates:** Meetings + buffers from Google Calendar
- **You manually control:** Time block placement via drag-and-drop

---

## Meeting Buffer Rules

### Standard Work Meetings & Virtual Medical Appointments
- **15 minutes BEFORE** the meeting (prep time)
- **15 minutes AFTER** the meeting (debrief/notes time)

### In-Person Medical Appointments
- **45 minutes BEFORE** (travel + prep)
- **45 minutes AFTER** (travel + debrief)

---

## Design Option 1: **Split-Screen with Time Block Bank**

```
┌─────────────────────────────────────────────────────────────────────┐
│ TODAY - WEDNESDAY, FEB 18                                Jamie 🤖  │
├───────────────┬─────────────────────────────────────────────────────┤
│               │                                                     │
│  TIME BLOCKS  │              TIMELINE (7 AM - 7 PM)                 │
│               │                                                     │
│ Drag to       │   7:00 ┌──────────────────────────────────┐       │
│ Timeline →    │        │ (Empty - drop blocks here)       │       │
│               │        └──────────────────────────────────┘       │
│ ┌───────────┐ │                                                    │
│ │ 📋 TASK   │ │   8:00 ┌──────────────────────────────────┐       │
│ │   TIME    │ │        │ (Empty)                          │       │
│ │  60 min   │ │        └──────────────────────────────────┘       │
│ └───────────┘ │                                                    │
│               │   9:00 ┌─────────────────────┬────────────┐       │
│ ┌───────────┐ │  9:00  │ 🔵 Meeting Prep     │            │       │
│ │ ✍️ CONTENT│ │  9:15  │  (Auto-added)       │            │       │
│ │   TIME    │ │        ├─────────────────────┤            │       │
│ │  90 min   │ │  9:15  │ 📅 Strategy Meeting │  LOCKED    │       │
│ └───────────┘ │  10:00 │  w/ Sarah Johnson   │  (Meeting) │       │
│               │        ├─────────────────────┤            │       │
│ ┌───────────┐ │  10:00 │ 📝 Meeting Debrief  │            │       │
│ │ 💚 NURTURE│ │  10:15 │  (Auto-added)       │            │       │
│ │   TIME    │ │        └─────────────────────┴────────────┘       │
│ │  30 min   │ │                                                    │
│ └───────────┘ │  10:30 ┌──────────────────────────────────┐       │
│               │        │ (Empty - drop blocks here)       │       │
│ ┌───────────┐ │        └──────────────────────────────────┘       │
│ │ ☕ BREAK  │ │                                                    │
│ │   15 min  │ │  11:00 ┌──────────────────────────────────┐       │
│ └───────────┘ │        │ (Empty)                          │       │
│               │        └──────────────────────────────────┘       │
│ ┌───────────┐ │                                                    │
│ │ 🎯 FOCUS  │ │  11:30 ... (continues to 7 PM)                     │
│ │   TIME    │ │                                                    │
│ │  60 min   │ │                                                    │
│ └───────────┘ │                                                    │
│               │                                                    │
│ ┌───────────┐ │                                                    │
│ │ 🍽️ LUNCH  │ │                                                    │
│ │   60 min  │ │                                                    │
│ └───────────┘ │                                                    │
│               │                                                    │
│ + Custom      │  [+ Add Time Block]  button at bottom             │
│   Block       │                                                    │
│               │                                                    │
└───────────────┴─────────────────────────────────────────────────────┘
```

### Features:
- **Left sidebar** = Draggable time block "templates"
- **Right side** = Full timeline with 30-min grid
- **Locked blocks** = Meetings (can't be moved/deleted)
- **Hover effect** = Valid drop zones highlight in light blue
- **Conflict detection** = Red border if block overlaps
- **Duration control** = Click block to edit duration before dragging

### Pros:
- Clear visual separation
- Easy to see all available block types
- Familiar layout (like Figma layers panel)

### Cons:
- Takes up horizontal space
- Might feel cluttered on smaller screens

---

## Design Option 2: **Floating Toolbar with Inline Timeline**

```
┌─────────────────────────────────────────────────────────────────────┐
│ TODAY - WEDNESDAY, FEB 18                                Jamie 🤖  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ BLOCKS: 📋 Task · ✍️ Content · 💚 Nurture · ☕ Break · 🎯 Focus │   │
│  │         🍽️ Lunch · ➕ Custom                                 │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  TIMELINE                                                           │
│  ┌────┬──────────────────────────────────────────────────────┐     │
│  │7:00│ ┌────────────────────────────────────────┐           │     │
│  │    │ │ (Drop blocks here)                     │           │     │
│  │    │ └────────────────────────────────────────┘           │     │
│  ├────┼──────────────────────────────────────────────────────┤     │
│  │8:00│ ┌────────────────────────────────────────┐           │     │
│  │    │ │                                        │           │     │
│  │    │ └────────────────────────────────────────┘           │     │
│  ├────┼──────────────────────────────────────────────────────┤     │
│  │9:00│ ┌─────────────────────┬──────────────────┐           │     │
│  │    │ │ 🔵 Prep (15 min)    │  Jamie added     │           │     │
│  ├────┤ ├─────────────────────┼──────────────────┤           │     │
│  │9:15│ │ 📅 Strategy Meeting │  Sarah Johnson   │  LOCKED   │     │
│  │    │ │     (45 min)        │  Zoom: Join      │           │     │
│  ├────┤ ├─────────────────────┼──────────────────┤           │     │
│  │10:00│ │ 📝 Debrief (15 min)│  Jamie added     │           │     │
│  ├────┼─┴─────────────────────┴──────────────────┘           │     │
│  │10:15│ ┌────────────────────────────────────────┐           │     │
│  │     │ │ (Drop blocks here)                     │           │     │
│  │     │ └────────────────────────────────────────┘           │     │
│  ├────┼──────────────────────────────────────────────────────┤     │
│  │11:00│                                                      │     │
│  │     │ ... (continues)                                      │     │
│  └────┴──────────────────────────────────────────────────────┘     │
│                                                                     │
│  [+ Add Custom Time Block]                                          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Features:
- **Top toolbar** = Horizontal block selector (click to drag)
- **Full-width timeline** = Maximum space for schedule
- **Time labels** = Left column shows times
- **Meeting cards** = Show attendee + join link inline
- **Right-click menu** = Options to edit/delete/duplicate blocks

### Pros:
- More space for timeline
- Cleaner, modern look
- Better for laptop screens

### Cons:
- Toolbar might get hidden on scroll
- Less obvious that blocks are draggable

---

## Design Option 3: **Collapsible Drawer + Calendar Grid View**

```
┌─────────────────────────────────────────────────────────────────────┐
│ TODAY - WEDNESDAY, FEB 18                                Jamie 🤖  │
│ ┌───────────┐                                                       │
│ │ ⚡ BLOCKS │  ◀ Click to expand/collapse                          │
│ └───────────┘                                                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│       7 AM      8 AM      9 AM      10 AM     11 AM     12 PM       │
│  ┌────────┬────────┬────────┬────────┬────────┬────────┐           │
│  │        │        │  🔵    │  📝    │        │        │           │
│  │        │        │ Prep   │Debrief │        │        │           │
│  │        │        ├────────┤        │        │        │           │
│  │        │        │ 📅 Mtg │        │        │        │           │
│  │        │        │ Sarah  │        │        │        │           │
│  │        │        │  45m   │        │        │        │           │
│  └────────┴────────┴────────┴────────┴────────┴────────┘           │
│                                                                     │
│  ┌────────┬────────┬────────┬────────┬────────┬────────┐           │
│  │ 12 PM  │  1 PM  │  2 PM  │  3 PM  │  4 PM  │  5 PM  │           │
│  ├────────┼────────┼────────┼────────┼────────┼────────┤           │
│  │        │        │        │        │        │        │           │
│  │        │        │        │        │        │        │           │
│  │        │        │        │        │        │        │           │
│  └────────┴────────┴────────┴────────┴────────┴────────┘           │
│                                                                     │
│  When drawer is open:                                               │
│  ┌────────────────────────────────────────┐                        │
│  │ TIME BLOCKS                        [X] │                        │
│  │ ────────────────────────────────────── │                        │
│  │  📋 Task Time (60 min)     [Drag →]   │                        │
│  │  ✍️ Content Time (90 min)  [Drag →]   │                        │
│  │  💚 Nurture Time (30 min)  [Drag →]   │                        │
│  │  ☕ Break (15 min)          [Drag →]   │                        │
│  │  🎯 Focus Time (60 min)    [Drag →]   │                        │
│  │  🍽️ Lunch (60 min)         [Drag →]   │                        │
│  │  ➕ Create Custom Block              │                        │
│  └────────────────────────────────────────┘                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Features:
- **Collapsible drawer** = Opens from left when needed
- **Calendar grid** = Hourly columns (like Google Calendar)
- **Drag from drawer** = Drop into time slots
- **Visual time representation** = Block height = duration
- **Mobile-friendly** = Drawer can be full-screen on mobile

### Pros:
- Maximizes timeline space
- Familiar calendar interface
- Great for visualizing day at a glance

### Cons:
- Harder to see precise start/end times
- Might be tricky to align blocks precisely

---

## Design Option 4: **Modal-Based Block Creation** (Simplest)

```
┌─────────────────────────────────────────────────────────────────────┐
│ TODAY - WEDNESDAY, FEB 18                          [+ Add Block] 🟣 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  TIMELINE                                                           │
│                                                                     │
│  7:00 AM  ┌──────────────────────────────────────┐                 │
│           │ (Click "+ Add Block" to get started) │                 │
│           └──────────────────────────────────────┘                 │
│                                                                     │
│  8:00 AM  ┌──────────────────────────────────────┐                 │
│           │                                      │                 │
│           └──────────────────────────────────────┘                 │
│                                                                     │
│  9:00 AM  ╔═════════════════════════════════════╗                 │
│  9:00     ║ 🔵 PREP TIME (15 min)               ║                 │
│  9:15     ║ Auto-added by Jamie                 ║                 │
│           ╠═════════════════════════════════════╣                 │
│  9:15     ║ 📅 STRATEGY MEETING                 ║                 │
│  10:00    ║ Sarah Johnson • Zoom                ║  🔒 LOCKED      │
│           ║ 45 minutes                          ║                 │
│           ╠═════════════════════════════════════╣                 │
│  10:00    ║ 📝 DEBRIEF TIME (15 min)            ║                 │
│  10:15    ║ Auto-added by Jamie                 ║                 │
│           ╚═════════════════════════════════════╝                 │
│                                                                     │
│  10:30 AM ┌──────────────────────────────────────┐                 │
│           │ (Empty - click time to add block)    │  ← Click here  │
│           └──────────────────────────────────────┘                 │
│                                                                     │
│  11:00 AM ...                                                       │
│                                                                     │
│                                                                     │
│  When you click "+ Add Block", a modal opens:                      │
│  ┌────────────────────────────────────────────┐                    │
│  │  ADD TIME BLOCK                        [X] │                    │
│  │  ────────────────────────────────────────  │                    │
│  │  Block Type:                               │                    │
│  │  ○ Task Time      ○ Content Time           │                    │
│  │  ○ Nurture Time   ○ Break                  │                    │
│  │  ○ Focus Time     ○ Lunch                  │                    │
│  │  ○ Custom                                  │                    │
│  │                                            │                    │
│  │  Start Time: [10:30 AM ▼]                 │                    │
│  │  Duration:   [60 minutes ▼]               │                    │
│  │                                            │                    │
│  │     [Cancel]          [Add Block]          │                    │
│  └────────────────────────────────────────────┘                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Features:
- **Click to add** = No drag-and-drop, just click
- **Modal form** = Simple dropdown selections
- **Auto-snap to grid** = Blocks align to 15-min intervals
- **Inline editing** = Click block to edit start time/duration
- **Keyboard shortcuts** = `T` for Task, `C` for Content, etc.

### Pros:
- Simplest to implement
- No drag-drop complexity
- Works great on mobile
- Accessible

### Cons:
- Less visual/fun than drag-drop
- More clicks required
- Slower for power users

---

## Recommended Approach: **Option 2** (Floating Toolbar)

### Why?
1. **Best balance** of visual clarity and screen space
2. **Familiar pattern** - Similar to Notion, ClickUp, etc.
3. **Easy to implement** - Standard drag-drop libraries work well
4. **Scalable** - Easy to add more block types later
5. **Mobile-adaptable** - Toolbar can collapse into dropdown

---

## Visual Design Details

### Color Coding
- **Meetings (Blue)** - `#3b82f6` (locked, can't modify)
- **Meeting Buffers (Light Blue)** - `#93c5fd` (auto-added, can remove)
- **Task Time (Purple)** - `#6b2358` (Empower Health brand plum)
- **Content Time (Teal)** - `#14b8a6` 
- **Nurture Time (Green)** - `#22c55e`
- **Break (Gray)** - `#6b7280`
- **Focus Time (Orange)** - `#f59e0b`
- **Lunch (Yellow)** - `#eab308`
- **Custom (Customizable)** - User picks color

### Typography
- **Block titles** - 14px, semibold
- **Time labels** - 12px, medium
- **Metadata** (attendees, duration) - 11px, regular
- **Empty state** - 13px, gray-500

### Spacing
- **30-minute grid** - Each row = 60px height
- **15-minute intervals** - Light dotted line at 30px
- **Block padding** - 12px all around
- **Gap between blocks** - 4px

### Interactions
1. **Hover block** = Show resize handles (top/bottom edges)
2. **Click block** = Select (highlight with border)
3. **Drag block** = Show ghost/preview in new position
4. **Drop block** = Smooth animation to snap into place
5. **Delete block** = Swipe left or press Delete key
6. **Edit block** = Double-click to open details modal

---

## Implementation Notes

### Drag-Drop Library
Use `@dnd-kit` (modern, accessible):
```bash
npm install @dnd-kit/core @dnd-kit/sortable
```

### State Management
```typescript
interface TimeBlock {
  id: string;
  type: 'task' | 'content' | 'nurture' | 'break' | 'focus' | 'lunch' | 'custom' | 'meeting';
  title: string;
  startTime: string; // "9:00 AM"
  duration: number; // minutes
  color: string;
  
  // For meetings only
  isLocked?: boolean;
  meetingData?: {
    attendees: string[];
    link?: string;
    location?: string;
  };
  
  // For buffers
  isBuffer?: boolean;
  bufferType?: 'prep' | 'debrief';
  parentMeetingId?: string;
}
```

### API Structure
```typescript
// On component mount
1. Fetch today's meetings from Google Calendar
2. For each meeting, generate prep + debrief buffers
3. Add all as locked blocks to timeline
4. Load any manually-added blocks from localStorage
5. Render timeline

// On block drag
1. Calculate new start time from drop position
2. Check for conflicts with locked blocks
3. If valid, update block startTime
4. Save to localStorage
5. Re-render

// On block delete
1. Check if block is locked (can't delete meetings)
2. If buffer, just remove it
3. If user block, confirm deletion
4. Update localStorage
5. Re-render
```

---

## Next Steps

**Please choose your preferred design option (1-4), and I'll:**
1. Build the timeline component with that design
2. Implement drag-and-drop functionality
3. Add meeting buffer logic
4. Create the time block bank/toolbar
5. Test with sample data

Which design do you prefer? Or would you like me to create a hybrid of multiple options?
