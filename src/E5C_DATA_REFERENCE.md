# E5C Data Structure Reference

This document shows the actual data structures the scheduler will work with in E5C.

## 📋 TASK Sample

```typescript
// Type: Task (from /components/TasksPage.tsx)
{
  id: "task-123",
  title: "Review Q1 Strategy Report",
  description: "Review and provide feedback on the quarterly strategy document",
  status: "toDo", // "toDo" | "inProgress" | "awaitingReply" | "done"
  dueDate: "2026-01-06T17:00:00.000Z", // ISO date string
  contact: {
    id: "contact-456",
    name: "Sarah Chen",
    avatar: undefined
  },
  priority: "high", // "low" | "medium" | "high" | undefined
  estimatedTime: "2 hours",
  taskType: "project_task",
  tags: ["#Q1", "#strategy"],
  createdAt: "2026-01-01T10:00:00.000Z",
  archived: false
}
```

**Key Fields for E5C:**
- ✅ `id` - Unique identifier
- ✅ `dueDate` - ISO date string to compare against
- ✅ `status` - Skip if "done"
- ✅ `archived` - Skip if true

**Notification Triggers:**
- **24 hours before due** → "Task due soon: {title}"
- **Overdue (after due date)** → "Task overdue: {title}"

---

## 📝 CONTENT ITEM Sample

```typescript
// Type: ContentItem (from App.tsx state)
{
  id: "content-789",
  title: "Why Patient Insight Changes Everything",
  platform: "LI Post", // "LI Post" | "LI Article" | "SS Post" | "SS Audio"
  length: "Standard (250-500 words)",
  blueprintFamily: "Perspective",
  blueprintSubtype: "What Patients Wish You Knew",
  status: "scheduled", // "idea" | "draft" | "ready to schedule" | "scheduled" | "published"
  tags: ["#prior_auth", "#PX", "#digital_health"],
  scheduledDate: "2026-01-07", // YYYY-MM-DD format (NOT ISO)
  scheduledTime: "12:00 PM", // 12-hour format string
  lastUpdated: "2026-01-05T10:30:00.000Z", // Date object or ISO string
  createdOn: "2026-01-04T14:20:00.000Z", // Date object or ISO string
  wordCount: 420,
  content: "Draft content goes here...",
  workingOn: false,
  workingOnOrder: null
}
```

**Key Fields for E5C:**
- ✅ `id` - Unique identifier
- ✅ `scheduledDate` + `scheduledTime` - Combine to create Date
- ✅ `status` - Only notify if "scheduled"

**Notification Triggers:**
- **4 hours before scheduled** → "Content publishing soon: {title}"
- **15 minutes before scheduled** → "Content publishing NOW: {title}"

**⚠️ Date Parsing Challenge:**
```typescript
// scheduledDate: "2026-01-07"
// scheduledTime: "12:00 PM"
// Need to combine into: new Date("2026-01-07T12:00:00")

// Helper function needed:
function parseScheduledDateTime(dateStr: string, timeStr: string): Date | null {
  try {
    const time24 = convertTo24Hour(timeStr);
    const parsed = new Date(`${dateStr}T${time24}:00`);
    return isNaN(parsed.getTime()) ? null : parsed;
  } catch {
    return null;
  }
}

function convertTo24Hour(time12: string): string {
  const [time, period] = time12.split(' ');
  let [hours, minutes] = time.split(':');
  let hour = parseInt(hours);
  
  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;
  
  return `${hour.toString().padStart(2, '0')}:${minutes}`;
}
```

---

## 📅 CALENDAR EVENT Sample

```typescript
// Type: CalendarEvent (from /components/CalendarPage.tsx)
{
  id: "event-321",
  title: "Client Discovery Call - Acme Health",
  startTime: new Date("2026-01-06T14:00:00.000Z"), // Date object OR ISO string!
  endTime: new Date("2026-01-06T15:00:00.000Z"), // Date object OR ISO string!
  calendarId: "google-calendar-123",
  calendarName: "Work Calendar",
  color: "#2f829b",
  contact: {
    name: "John Smith",
    initials: "JS",
    email: "john@acmehealth.com"
  },
  attendees: ["john@acmehealth.com", "sarah@acmehealth.com"],
  description: "Initial discovery call to discuss patient experience strategy",
  location: "Zoom",
  link: "https://zoom.us/j/123456789"
}
```

**Key Fields for E5C:**
- ✅ `id` - Unique identifier
- ✅ `startTime` - **Date object OR ISO string** (depends on source/serialization)
- ✅ No status field - assume all events are active

**⚠️ CRITICAL: Defensive Date Parsing**
```typescript
// startTime might be Date object (fresh from API) or string (from localStorage)
// ALWAYS use safeParseDate() helper:

const startDate = safeParseDate(event.startTime);
if (!startDate) return; // Skip invalid dates
```

**Notification Triggers:**
- **15 minutes before start** → "Meeting starting soon: {title}"
- **5 minutes before start** → "Meeting starting NOW: {title}"

---

## 🌱 NURTURE ITEM Sample

```typescript
// Type: NurtureToDo (from /components/muted_NurturesView.tsx)
{
  id: "nurture-654",
  contactId: "contact-789",
  contactName: "Dr. Lisa Wang",
  contactEmail: "lisa.wang@memorial.org",
  priority: true, // boolean
  dueDate: "2026-01-05T00:00:00.000Z", // ISO date string (Monday)
  status: "toDo", // "toDo" | "emailSent" | "replyReceived" | "nonResponsive"
  lastNurtureDate: "2025-12-09T00:00:00.000Z", // ISO date string
  nurtureFrequency: 4, // weeks
  createdAt: "2025-11-15T10:00:00.000Z",
  emailDraft: "Hi Lisa, I wanted to follow up..."
}
```

**Key Fields for E5C:**
- ✅ `id` - Unique identifier
- ✅ `dueDate` - ISO date string (always a Monday)
- ✅ `status` - Skip if "emailSent" or "replyReceived"

**Notification Triggers:**
- **Monday morning 9am if due today** → "Nurture due today: {contactName}"
- **Overdue (past due date + status is 'toDo')** → "Nurture overdue: {contactName}"

---

## 🔔 When To Fire Notifications

### Tasks
```typescript
function checkTasksDue(tasks: Task[], now: Date) {
  tasks.forEach(task => {
    // Skip completed/archived
    if (task.status === 'done' || task.archived) return;
    
    // Skip if no due date
    if (!task.dueDate) return;
    
    const dueDate = new Date(task.dueDate);
    const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    // Fire 24h before
    if (hoursUntilDue > 23 && hoursUntilDue <= 24) {
      if (shouldFireNotification('task_due', task.id, '24h', now)) {
        addNotification({
          type: 'task_due_soon',
          title: 'Task due tomorrow',
          message: task.title,
          // ...
        });
        recordNotificationFired('task_due', task.id, '24h', now);
      }
    }
    
    // Fire if overdue
    if (hoursUntilDue < 0) {
      if (shouldFireNotification('task_overdue', task.id, 'overdue', now)) {
        addNotification({
          type: 'task_overdue',
          title: 'Task overdue',
          message: task.title,
          // ...
        });
        recordNotificationFired('task_overdue', task.id, 'overdue', now);
      }
    }
  });
}
```

### Content
```typescript
function checkContentScheduled(contentItems: any[], now: Date) {
  contentItems.forEach(item => {
    // Skip if not scheduled
    if (item.status !== 'scheduled') return;
    
    // Skip if missing date/time
    if (!item.scheduledDate || !item.scheduledTime) return;
    
    // Parse scheduled time
    const scheduledDateTime = parseScheduledDateTime(
      item.scheduledDate, 
      item.scheduledTime
    );
    
    const hoursUntilScheduled = (scheduledDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    // Fire 4h before
    if (hoursUntilScheduled > 3.9 && hoursUntilScheduled <= 4) {
      if (shouldFireNotification('content_scheduled', item.id, '4h', now)) {
        addNotification({
          type: 'content_publishing_soon',
          title: 'Content publishing in 4 hours',
          message: item.title,
          // ...
        });
        recordNotificationFired('content_scheduled', item.id, '4h', now);
      }
    }
    
    // Fire 15m before
    const minutesUntilScheduled = hoursUntilScheduled * 60;
    if (minutesUntilScheduled > 14 && minutesUntilScheduled <= 15) {
      if (shouldFireNotification('content_scheduled', item.id, '15m', now)) {
        addNotification({
          type: 'content_publishing_now',
          title: 'Content publishing NOW',
          message: item.title,
          // ...
        });
        recordNotificationFired('content_scheduled', item.id, '15m', now);
      }
    }
  });
}
```

### Meetings
```typescript
function checkMeetingsStarting(events: CalendarEvent[], now: Date) {
  events.forEach(event => {
    // DEFENSIVE: Handle Date object OR string
    const startDate = safeParseDate(event.startTime);
    if (!startDate) return; // Skip invalid dates
    
    const minutesUntilStart = (startDate.getTime() - now.getTime()) / (1000 * 60);
    
    // Fire 15m before
    if (minutesUntilStart > 14 && minutesUntilStart <= 15) {
      if (shouldFireNotification('meeting_starting', event.id, '15m', now)) {
        addNotification({
          type: 'meeting_starting_soon',
          title: 'Meeting in 15 minutes',
          message: event.title,
          // ...
        });
        recordNotificationFired('meeting_starting', event.id, '15m', now);
      }
    }
    
    // Fire 5m before
    if (minutesUntilStart > 4 && minutesUntilStart <= 5) {
      if (shouldFireNotification('meeting_starting', event.id, '5m', now)) {
        addNotification({
          type: 'meeting_starting_now',
          title: 'Meeting in 5 minutes',
          message: event.title,
          // ...
        });
        recordNotificationFired('meeting_starting', event.id, '5m', now);
      }
    }
  });
}
```

### Nurtures
```typescript
function checkNurturesDue(nurtures: NurtureToDo[], now: Date) {
  nurtures.forEach(nurture => {
    // Skip if already sent
    if (nurture.status !== 'toDo') return;
    
    const dueDate = new Date(nurture.dueDate);
    const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    // Fire on Monday morning if due today
    const isMondayMorning = now.getDay() === 1 && now.getHours() === 9;
    const isDueToday = hoursUntilDue > 0 && hoursUntilDue <= 24;
    
    if (isMondayMorning && isDueToday) {
      if (shouldFireNotification('nurture_due', nurture.id, 'today', now)) {
        addNotification({
          type: 'nurture_due_today',
          title: 'Nurture due today',
          message: nurture.contactName,
          // ...
        });
        recordNotificationFired('nurture_due', nurture.id, 'today', now);
      }
    }
    
    // Fire if overdue
    if (hoursUntilDue < 0) {
      if (shouldFireNotification('nurture_overdue', nurture.id, 'overdue', now)) {
        addNotification({
          type: 'nurture_overdue',
          title: 'Nurture overdue',
          message: nurture.contactName,
          // ...
        });
        recordNotificationFired('nurture_overdue', nurture.id, 'overdue', now);
      }
    }
  });
}
```

---

## 🎯 Summary for E5C Implementation

**Files to Create/Modify:**
1. `/utils/notificationScheduler.ts` - Add check functions
2. `/utils/schedulerHelpers.ts` - Date parsing utilities

**Helper Functions Needed:**
```typescript
// Defensive date parsing (handles Date objects OR ISO strings)
function safeParseDate(dateValue: Date | string | undefined | null): Date | null {
  if (!dateValue) return null;
  
  // Already a Date object
  if (dateValue instanceof Date) {
    return isNaN(dateValue.getTime()) ? null : dateValue;
  }
  
  // Try parsing as ISO string
  if (typeof dateValue === 'string') {
    const parsed = new Date(dateValue);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  
  return null;
}

// Parse content scheduled time
function parseScheduledDateTime(dateStr: string, timeStr: string): Date | null {
  try {
    const time24 = convertTo24Hour(timeStr);
    const parsed = new Date(`${dateStr}T${time24}:00`);
    return isNaN(parsed.getTime()) ? null : parsed;
  } catch {
    return null;
  }
}

function convertTo24Hour(time12: string): string {
  const [time, period] = time12.split(' ');
  let [hours, minutes] = time.split(':');
  let hour = parseInt(hours);
  
  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;
  
  return `${hour.toString().padStart(2, '0')}:${minutes}`;
}

// Time calculations
function getHoursUntil(futureDate: Date, now: Date): number;
function getMinutesUntil(futureDate: Date, now: Date): number;

// Filtering
function isWithinWindow(value: number, min: number, max: number): boolean;
```

**Check Functions to Implement:**
```typescript
function checkTasksDue(deps: SchedulerDeps, now: Date): void;
function checkContentScheduled(deps: SchedulerDeps, now: Date): void;
function checkMeetingsStarting(deps: SchedulerDeps, now: Date): void;
function checkNurturesDue(deps: SchedulerDeps, now: Date): void;
```

**Update `runNotificationSchedulerOnce`:**
```typescript
export function runNotificationSchedulerOnce(deps: SchedulerDeps): void {
  const now = deps.getNow ? deps.getNow() : new Date();
  
  console.log(`[E5C Scheduler] Running checks at ${now.toISOString()}`);
  
  // Run all checks
  checkTasksDue(deps, now);
  checkContentScheduled(deps, now);
  checkMeetingsStarting(deps, now);
  checkNurturesDue(deps, now);
  
  console.log('[E5C Scheduler] All checks complete');
}
```

---

**Ready for E5C implementation!** 🎉