# Task Architecture - Single Source of Truth Implementation

## Overview
This document describes the new task architecture that establishes a single source of truth for all tasks across the application.

## Key Principles

### 1. Global Tasks Table
- **ALL tasks are stored in the global `tasks` table** in the KV store
- No separate per-contact or per-context task storage
- Tasks from Fathom meeting notes, manual entry, and all other sources go into this one table

### 2. Contact Tasks Tab = Filtered View
The Tasks tab on individual Contact profiles is **NOT** a separate data store. It's a filtered view of the global tasks table that shows:

- **Only tasks linked to that contact** (via `contact_id` or legacy `contact.id`)
- **Only "active" task statuses:**
  - `toDo`
  - `inProgress`
  - `awaitingReply`
- **Excludes:**
  - `completed` tasks
  - `archived` tasks

### 3. Automatic Status-Based Filtering
When a task's status changes to `completed` or `archived`:
- It automatically disappears from the Contact's Tasks tab
- It remains in the global tasks table (queryable on Main Tasks page with filters)
- No manual sync or refresh needed

## Data Structure

### Task Interface
```typescript
export interface Task {
  id: string;
  title: string;
  status: 'toDo' | 'inProgress' | 'awaitingReply' | 'completed' | 'archived';
  contact?: { id: string; name: string }; // DEPRECATED: Legacy support
  contact_id?: string; // Preferred: Foreign key to contacts table
  interaction_id?: string; // Foreign key to interactions/meetings
  meeting_id?: string; // Foreign key to meetings (for Fathom integration)
  dueDate?: string; // Stored as YYYY-MM-DD format
  notes?: string;
  tags?: string[];
  folder?: string;
  isFlagged?: boolean;
  archived: boolean;
  createdAt?: string;
  updatedAt?: string;
}
```

### Contact Linking
Tasks can be linked to contacts via:
1. **Preferred:** `contact_id` field (string ID)
2. **Legacy:** `contact` object with `{ id, name }`

The backend normalizes both formats for backward compatibility.

## Date Handling

### Storage Format
- All dates stored as **YYYY-MM-DD** strings
- Consistent format across the entire application
- No timezone conversion issues

### Date Utilities
Use functions from `/utils/dateUtils.ts`:
- `formatDueDate(isoString)` - Displays "Today", "Tomorrow", etc.
- `isOverdue(isoString)` - Boolean check if date is in the past
- `datePickerToISO(dateString)` - Converts YYYY-MM-DD to ISO
- `isoToDatePicker(isoString)` - Converts ISO to YYYY-MM-DD

## API Methods

### Create Task
```typescript
await tasksAPI.create({
  title: "Follow up with client",
  contact_id: "contact-123",
  status: "toDo",
  dueDate: "2024-12-15",
  notes: "Discuss Q1 goals",
  isFlagged: true,
  archived: false
});
```

### Get Tasks for Contact (Active Only)
```typescript
const activeTasks = await tasksAPI.getByContact(contactId, true);
// Returns only toDo, inProgress, awaitingReply tasks
```

### Get All Tasks for Contact
```typescript
const allTasks = await tasksAPI.getByContact(contactId, false);
// Returns tasks in all statuses
```

## Fathom Integration (Future)

When implementing Fathom meeting action items:

```typescript
// For each action item from Fathom meeting notes
await tasksAPI.create({
  title: actionItem.summary,
  notes: actionItem.detailedText,
  status: 'toDo',
  dueDate: calculateDueDate(actionItem, meeting), // YYYY-MM-DD format
  contact_id: meeting.contact_id,
  meeting_id: meeting.id, // Link back to the meeting
  interaction_id: meeting.interaction_id, // Optional
  archived: false
});
```

**Result:**
- Task appears on Main Tasks page immediately
- Task appears in Contact's Tasks tab immediately (filtered view)
- When task is completed, it disappears from Contact's Tasks tab automatically
- All history is preserved in global tasks table

## Component Changes

### ContactProfileModal
- Updated to filter tasks by:
  ```typescript
  const activeStatuses = ['toDo', 'inProgress', 'awaitingReply'];
  const contactTasks = tasks.filter(task => 
    matchesContact(task) && 
    activeStatuses.includes(task.status) && 
    !task.archived
  );
  ```

### TaskModal
- Supports both legacy `contact` object and new `contact_id` field
- Stores dates in YYYY-MM-DD format
- Status options: toDo, inProgress, awaitingReply, completed

### Backend (index.tsx)
- Normalizes both `contact` object and `contact_id` field
- Stores both for backward compatibility
- Defaults `status` to 'toDo' if not provided
- Defaults `archived` to false if not provided

## Migration Notes

### Existing Data
- Legacy tasks with `contact` object will continue to work
- Backend extracts `contact.id` and stores it as `contact_id`
- Both formats supported for backward compatibility

### Future Tasks
- Should use `contact_id` for cleaner data structure
- `contact` object maintained for UI display purposes

## Benefits

✅ **Single Source of Truth** - One place to query tasks  
✅ **No Sync Issues** - Filtered views update automatically  
✅ **Simpler Logic** - No complex synchronization code  
✅ **Scalable** - Easy to add new task sources (email, SMS, etc.)  
✅ **Consistent** - Same task appears in all relevant views  
✅ **Flexible Filtering** - Easy to create custom views by status, date, etc.  

## Testing Checklist

- [ ] Create task from Main Tasks page → appears in global list
- [ ] Create task from Contact Profile → appears in both Contact tab and Main Tasks
- [ ] Change task status to 'completed' → disappears from Contact Tasks tab
- [ ] Change task status to 'archived' → disappears from Contact Tasks tab
- [ ] Task with no due date displays correctly
- [ ] Task with future due date displays correctly
- [ ] Task with past due date shows as overdue
- [ ] Flagged tasks display flag indicator
- [ ] Contact filtering works with both contact_id and legacy contact object
