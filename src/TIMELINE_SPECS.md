# Today Page Timeline - Complete Specifications

## Overview
The Today Page timeline is the core scheduling interface that displays the day's meetings, routines, tasks, and activities in a vertical timeline view. It serves as the central control panel for the user's daily schedule.

---

## 1. VISUAL DESIGN & LAYOUT

### Container Structure
- **Background**: Gray (#F7F7F9)
- **Timeline Container**: White/70% opacity with backdrop blur, rounded-3xl, border slate-200/50
- **Padding**: 8 units inside container
- **Max Width**: 6xl, centered

### Timeline Header
- **Title**: "Your Timeline" (when planned) or "Today at a Glance" (before planning)
- **Font**: font-serif, font-semibold, text-2xl (32px)
- **Actions**: PiP button (picture-in-picture window) - top right

### Block Visual States
1. **Normal State**: White/80% bg, border-2, rounded-2xl, shadow-gentle
2. **Active Block** (current time): ring-4 with accent color (#5e2350), ring-offset-4
3. **Selected Block**: ring-2 with accent color, ring-offset-2
4. **Hover State**: shadow-soft (when clickable)
5. **Dragging State**: Visual feedback during drag
6. **Completed**: Checkmark shown, different opacity
7. **MIT Badge**: Purple badge showing "MIT" for Most Important Thing

---

## 2. BLOCK TYPES & COLOR CODING

### Meeting Block
- **Icon Background**: Varies by subtype (physical/virtual)
- **Border**: Distinct meeting color
- **Icon**: MapPin (physical), Video (virtual)
- **Locked**: Cannot be edited or moved
- **Details Shown**: Attendees, join links, location

### Buffer Block (Pre/Post Meeting)
- **Pre-buffer**: 15 min before meeting (ArrowDown icon)
- **Post-buffer**: 15 min after meeting (ArrowUp icon)
- **Compact**: Smaller padding (py-3 px-5)
- **Locked**: Cannot be moved
- **Purpose**: Meeting prep and notes time

### Routine Block
- **Icons by Type**:
  - Sun: Morning routines
  - Coffee: Breaks
  - UtensilsCrossed: Lunch
  - Dumbbell: PT/Exercise
  - Keyboard: Work blocks
  - Moon: Wind Down
  - Clock: Admin time
- **Editable**: Time, duration, and routine type (except Plan My Day, Wind Down)
- **Draggable**: Can reorder in timeline

### Task/Content/Nurture Block
- **Playlist Indicator**: Colored circle with count of remaining items
- **Colors**:
  - Tasks: #c198ad
  - Content: #e2b7bd
  - Nurtures: #9eafa4
- **Clickable**: Opens playlist panel on right side
- **Badge Count**: Shows number of incomplete items

---

## 3. INTERACTIVE FEATURES

### Inline Editing
**Time Editing**:
- Click time to edit
- Input field appears with focus
- Enter to confirm, Escape to cancel
- Triggers Jamie schedule adjustment

**Duration Editing**:
- Click duration "(XXmin)" to edit
- Number input appears
- Enter to confirm, Escape to cancel
- Triggers Jamie schedule adjustment

**Routine Type Change**:
- Click routine title (if editable)
- Dropdown appears with available routine types
- Select new type to change
- Triggers Jamie schedule adjustment

### Drag & Drop Reordering
- **Draggable**: All unlocked, non-buffer blocks
- **Drag Handle**: GripVertical icon (shows on hover)
- **Visual Feedback**: Highlight drop target
- **Constraints**:
  - Cannot drop between meeting and its buffer
  - Cannot drop between buffer and meeting
  - Locked blocks cannot be moved
- **Auto-Recalculation**: All subsequent times recalculated based on sequential order

### Block Controls (Play/Pause/Complete)
**Play Button**:
- Appears on hover (opacity transition)
- Starts the block timer
- Integrates with Focus Timer widget
- Toast notification on start
- Auto-notification at block start time

**Pause Button** (when playing):
- Pauses the timer
- Toast notification
- Timer can be resumed

**Complete Button** (when playing):
- Marks block as complete
- Shows checkmark
- Opens BlockEndModal for reflection
- Auto-starts next block after 500ms delay
- Toast notification

**Snooze Functionality**:
- Options: 5, 10, or 15 minutes
- Extends current block duration
- Triggers Jamie's intelligent schedule adjustment
- Shows adjustment modal with proposed changes

---

## 4. STATE MANAGEMENT

### Timeline States
1. **Before Planning** (`isDayPlanned = false`):
   - Shows "Today at a Glance" with 4-card grid
   - Displays counts: Meetings, Tasks, Content, Nurtures
   - "Plan My Day with Jamie" button centered
   
2. **After Planning** (`isDayPlanned = true`):
   - Full timeline with all blocks
   - Play/pause/complete controls available
   - Drag & drop enabled

### Block States
- `playingBlockId`: Currently active block
- `blockStartTime`: When block timer started
- `completedBlocks`: Set of completed block IDs
- `draggedBlock`: Block being dragged
- `dragOverBlock`: Drop target block
- `editingTime`: Block ID being edited for time
- `editingDuration`: Block ID being edited for duration
- `editingRoutine`: Block ID being edited for routine type

### Timer States
- `showTimer`: Whether timer is visible
- `notificationsEnabled`: Desktop notifications on/off
- `has5MinWarningShown`: Tracks if 5-min warning shown per block
- `hasShownStartNotification`: Tracks start notifications per block

---

## 5. INTEGRATIONS

### Focus Timer Integration
- Clicking Play starts timer in FloatingFocusWidget
- Timer counts down from block duration
- 5-minute warning notification
- Block end notification
- Auto-start next block option

### Playlist Panel Integration
- Clicking task/content/nurture block opens playlist panel
- Panel slides in from right (33% width)
- Shows all items in that playlist
- Real-time count updates
- Can mark items complete from panel

### Jamie AI Adjustments
- **Triggers**:
  - Time change on a block
  - Duration change on a block
  - Routine type change
  - Snooze during active block
  - Drag & drop reorder

- **Adjustment Modal**:
  - Shows Jamie's message
  - Lists specific changes (shortened/moved blocks)
  - Confirm or Reject options
  - Preview of adjusted schedule

### AM Wizard Integration
- Wizard generates initial schedule
- Populates `timeBlocks` state
- Sets `isDayPlanned = true`
- Includes all meetings, routines, buffers

### Date Index Integration
- Dynamically queries items due today
- Uses `getTasksForDay()`, `getContentForDay()`, etc.
- Refreshes hourly automatically
- No localStorage caching needed

---

## 6. NOTIFICATIONS & ALERTS

### Block Start Notification
- Triggers at exact block start time
- Shows block title and type
- Desktop notification (if enabled)
- Modal option for user interaction

### 5-Minute Warning
- Shows when 5 minutes remain
- Only shown once per block
- Desktop notification (if enabled)
- Toast message in-app

### Block End Notification
- Triggers when timer reaches 0
- Opens BlockEndModal
- Options: Complete, Snooze (5/10/15min), Skip
- Asks for reflection/notes

### Schedule Change Alerts
- Toast when time adjusted
- Toast when duration changed
- Jamie adjustment modal for complex changes

---

## 7. TIME CALCULATIONS

### Helper Functions
- `parseTime(timeStr)`: Converts "9:00 AM" to { hours, minutes }
- `addMinutes(time, minutes)`: Adds minutes to time object
- `formatTime(time)`: Converts time object to "9:00 AM" string

### Auto-Recalculation
- When block moved via drag/drop: All subsequent times recalculated
- When duration changed: All subsequent blocks shift
- When time manually changed: Warns about gaps/overlaps

### Current Time Tracking
- Updates every minute
- Highlights active block (current time within block range)
- "Now line" visual indicator (optional)

---

## 8. KEYBOARD & ACCESSIBILITY

### Keyboard Shortcuts (potential)
- `Space`: Play/Pause current block
- `Enter`: Complete current block
- `Escape`: Cancel editing
- Arrow keys: Navigate blocks

### Accessibility
- All interactive elements keyboard accessible
- ARIA labels on buttons
- Focus management during editing
- Screen reader announcements

---

## 9. CONSTRAINTS & VALIDATION

### Meeting Constraints
- Meetings are locked (cannot edit/move)
- Meeting buffers must stay adjacent to meetings
- Cannot insert blocks between meeting and buffer

### Time Constraints
- Blocks must be sequential (no gaps by default)
- Overlapping prevented
- Minimum block duration: 15 minutes

### Routine Constraints
- Plan My Day: Must be first, locked
- Wind Down: Must be last, locked
- PM Admin: Before Wind Down

---

## 10. PERSISTENCE & DATA FLOW

### State Sources
- `timeBlocks`: From AM Wizard or example data
- `playlists`: Computed from App state via date index
- `completedBlocks`: Local state (could persist to localStorage)
- `playingBlockId`: Session state only

### Data Flow
1. User completes AM Wizard
2. Wizard generates schedule → `timeBlocks`
3. Component queries today's items via date index
4. Timeline renders with all data
5. User interactions update local state
6. Changes propagate to parent via callbacks

### Undo/Redo (implemented)
- History stack of timeline states
- `historyIndex` tracks position
- Can undo/redo schedule changes

---

## 11. RESPONSIVE BEHAVIOR

### Desktop (Default)
- Full timeline with playlist panel side-by-side
- All controls visible

### Picture-in-Picture Mode
- Smaller window (600x800px)
- Timeline only, no navigation
- Positioned top-right of screen
- Always-on-top functionality

### Tablet/Mobile (not yet implemented)
- Could stack playlist below timeline
- Swipe gestures for navigation
- Touch-friendly controls

---

## 12. VISUAL FEEDBACK & ANIMATIONS

### Hover States
- Block hover: shadow increases
- Control buttons: appear with opacity transition
- Edit fields: background highlight

### Transitions
- Drag feedback: smooth position changes
- Modal entrance: fade + scale
- Panel slide: smooth transform
- Playlist expand: smooth height change

### Loading States
- Initial render: blocks fade in
- Jamie adjustment: processing indicator

---

## 13. ERROR HANDLING

### Invalid Time Entry
- Validates time format
- Falls back to previous value
- Toast error message

### Drag/Drop Errors
- Prevents invalid drops
- Toast explains constraint
- Returns block to original position

### Timer Errors
- Handles permission denied for notifications
- Gracefully degrades without notification API
- Console logs for debugging

---

## 14. PERFORMANCE CONSIDERATIONS

### Optimizations
- Memoized playlist calculations
- Debounced time recalculations
- Virtualization for very long timelines (future)
- Efficient re-renders with proper keys

### Update Frequency
- Current time: Every 1 minute
- Playlist counts: On-demand + hourly refresh
- Focus timer: Every second (handled by widget)

---

## 15. FUTURE ENHANCEMENTS

### Planned Features
- Week view timeline
- Multi-day planning
- Template schedules
- Recurring blocks
- Calendar sync (already has Google Calendar)
- Time tracking analytics
- Energy level visualization
- Focus mode (hide distractions)

### Nice-to-Have
- Keyboard shortcuts
- Dark mode
- Custom block colors
- Block templates
- Batch operations
- Export to calendar

---

## Key Files
- `/components/TodayPageFilledExample_Muted.tsx` - Main component
- `/components/muted_BlockEndModal.tsx` - Block completion modal
- `/components/muted_CountdownTimer.tsx` - Timer display
- `/components/today/AMWizard.tsx` - Planning wizard
- `/utils/dateIndex.tsx` - Date-based querying
- `/utils/exampleData.tsx` - Sample timeline data

---

## Critical Notes for Redesign
1. **All functionality must be preserved** - drag/drop, inline editing, play/pause/complete
2. **State management stays the same** - don't break existing integrations
3. **Maintain accessibility** - keyboard nav, screen readers
4. **Keep performance** - efficient renders, proper keys
5. **Preserve data flow** - AM Wizard → timeline → playlist panel
6. **Don't break Focus Timer** - play/pause integration is critical
7. **Jamie adjustments must work** - schedule intelligence is key feature
8. **Meeting constraints are sacred** - buffers must stay with meetings
