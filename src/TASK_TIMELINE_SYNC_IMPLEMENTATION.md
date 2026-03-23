# Task-Timeline Sync Implementation Plan

## 🎯 **Goal**
Make Today Page to-do's a "read-only view" (except for completion) of tasks that live on the Tasks Page.

## 📐 **Architecture**

### **Single Source of Truth**
```
┌─────────────────────────────────────┐
│     Tasks Page (Source of Truth)   │
│                                      │
│  - Full task data with IDs          │
│  - CRUD operations                  │
│  - Time tracking                    │
│  - All metadata                     │
└──────────────┬──────────────────────┘
               │
               │ References
               ▼
┌─────────────────────────────────────┐
│         Playlists (Groups)          │
│                                      │
│  - id: string                       │
│  - name: string                     │
│  - taskIds: string[]  ← References  │
│  - estimatedTime: number            │
└──────────────┬──────────────────────┘
               │
               │ References
               ▼
┌─────────────────────────────────────┐
│      Timeline Blocks (Schedule)     │
│                                      │
│  - id: string                       │
│  - time: string                     │
│  - duration: number                 │
│  - playlistId?: string  ← Reference │
│  - taskIds?: string[]   ← Reference │
└──────────────┬──────────────────────┘
               │
               │ Displays
               ▼
┌─────────────────────────────────────┐
│     Today Page (View Layer)         │
│                                      │
│  - Reads tasks by ID                │
│  - Shows task data                  │
│  - CAN mark complete                │
│  - Updates propagate back           │
└─────────────────────────────────────┘
```

## 🗂️ **New Files Created**

### ✅ `/types/task.ts`
**Canonical Task type** - Single source of truth for task structure

```typescript
export interface Task {
  id: string;
  title: string;
  status: 'toDo' | 'inProgress' | 'awaitingReply' | 'done' | 'archived';
  estimatedTime?: number; // minutes
  actualTime?: number; // minutes - tracked when completed
  timeSpent?: number; // minutes - accumulated during work
  playlistId?: string;
  timelineBlockId?: string;
  completedInBlock?: string;
  // ... full fields
}

export interface Playlist {
  id: string;
  name: string;
  taskIds: string[]; // ← References real tasks!
  estimatedTime: number;
  scheduledBlockId?: string;
}

export interface TimelineBlock {
  id: string;
  playlistId?: string; // ← References playlist
  taskIds?: string[]; // ← Or direct task references
  // ... other fields
}
```

### ✅ `/utils/taskService.ts`
**Task Service** - Central API for all task operations

**Key Functions:**
- `getAllTasks()` - Load from localStorage
- `createTask(task)` - Create with auto-generated ID
- `updateTask(id, updates)` - Update any task field
- `completeTask(id, options)` - Mark done + track time
- `createPlaylist(name, taskIds)` - Create playlist from existing tasks
- `getTasksForPlaylist(playlistId)` - Get tasks by playlist ID
- `startTimeTracking(taskId)` - Begin time tracking
- `stopTimeTracking()` - End tracking + save actualTime

### ✅ `/hooks/useTasks.ts`
**React Hooks** - Reactive state management

```typescript
const { tasks, createTask, updateTask, completeTask } = useTasks();
const { playlists, createPlaylist, getTasksForPlaylist } = usePlaylists();
const { activeSession, startTracking, stopTracking } = useTimeTracking();
```

## 🔄 **Data Flow**

### **Creating Tasks in AM Wizard**

**OLD WAY (Broken):**
```typescript
// Created inline tasks without IDs
const playlist = {
  id: 'p1',
  name: 'Client Check-ins',
  tasks: [
    { title: 'Follow up with Sarah', estimatedTime: 15 },
    { title: 'Send contract to Michael', estimatedTime: 10 },
  ]
};
// ❌ These tasks don't exist on Tasks Page!
```

**NEW WAY (Fixed):**
```typescript
// Step 1: User selects existing tasks from Tasks Page
const selectedTaskIds = ['task-123', 'task-456', 'task-789'];

// Step 2: Create playlist with references
const playlist = taskService.createPlaylist(
  'Client Check-ins',
  selectedTaskIds,
  'task'
);
// ✅ Playlist references real tasks!
// ✅ Tasks are updated with playlistId

// Step 3: Create timeline block
const block = {
  id: 'block-1',
  time: '10:00 AM',
  duration: 45,
  type: 'task',
  title: 'Client Check-ins',
  playlistId: playlist.id, // ← References playlist
};

// Step 4: Tasks are updated with block reference
selectedTaskIds.forEach(taskId => {
  taskService.updateTask(taskId, {
    timelineBlockId: block.id,
    scheduledDate: '2026-01-24',
    scheduledTime: '10:00 AM',
  });
});
```

### **Displaying Tasks on Today Page**

**To-Do Panel:**
```typescript
// Get current active block
const activeBlock = getActiveTimelineBlock();

// If block has a playlist
if (activeBlock.playlistId) {
  const taskIds = getPlaylistById(activeBlock.playlistId).taskIds;
  const tasks = taskIds.map(id => getTaskById(id));
  
  // Render tasks
  tasks.map(task => (
    <TodoCard 
      key={task.id}
      task={task} // ← Full task data!
      onComplete={() => completeTask(task.id, {
        timeSpent: calculateElapsedTime(),
        completedInBlock: activeBlock.id,
      })}
    />
  ));
}

// If block has direct task references
if (activeBlock.taskIds) {
  const tasks = activeBlock.taskIds.map(id => getTaskById(id));
  // ... same rendering
}
```

### **Marking Task Complete**

```typescript
function handleTaskComplete(taskId: string) {
  const timeSpent = stopTimeTracking(); // Get actual time
  
  completeTask(taskId, {
    timeSpent: timeSpent.duration,
    completedInBlock: currentBlock.id,
    notes: 'Completed during timeline block',
  });
  
  // ✅ Task is updated in main task list
  // ✅ Status changes to 'done'
  // ✅ actualTime is recorded
  // ✅ Tasks Page shows it as complete
  // ✅ Today Page to-do panel updates instantly
}
```

## 🎯 **Implementation Steps**

### **Phase 1: Foundation** ✅ DONE
- [x] Create `/types/task.ts` - Canonical types
- [x] Create `/utils/taskService.ts` - Task CRUD + sync
- [x] Create `/hooks/useTasks.ts` - React integration

### **Phase 2: AM Wizard Integration** (NEXT)
- [ ] Update AM Wizard to accept existing tasks as props
- [ ] Modify playlist creation to use `taskService.createPlaylist()`
- [ ] Ensure generated schedule saves task references properly
- [ ] Update "Lock it in!" button to:
  - Create playlists with real task IDs
  - Create timeline blocks with playlist references
  - Update tasks with `timelineBlockId` and `scheduledDate`

### **Phase 3: Today Page Integration**
- [ ] Import `useTasks()` and `usePlaylists()` hooks
- [ ] Update to-do panel to fetch tasks by playlist ID
- [ ] Wire up task completion to `completeTask()` service
- [ ] Show task metadata (contact, due date, flags)
- [ ] Add time tracking when block starts

### **Phase 4: FloatingFocusWidget Integration**
- [ ] Start time tracking when block begins
- [ ] Stop time tracking when block ends
- [ ] Pass actual time to completion handler
- [ ] Show time spent vs estimated in widget

### **Phase 5: BlockEndModal Integration**
- [ ] Show incomplete tasks from playlist
- [ ] Mark tasks complete with actual time
- [ ] Calculate time variance for Jamie learning
- [ ] Update all tasks in batch

### **Phase 6: Tasks Page Integration**
- [ ] Show `scheduledDate` and `scheduledTime` on task cards
- [ ] Show `timelineBlockId` reference
- [ ] Display "Scheduled for Today at 10:00 AM" badge
- [ ] Show actual vs estimated time on completed tasks
- [ ] Add "Schedule this task" quick action

## 📊 **Testing Checklist**

### **Test 1: Create Task → Add to Playlist → View on Today**
1. Tasks Page → Create task "Follow up with Sarah"
2. Note the task ID
3. AM Wizard → Create playlist → Select that task
4. Lock in schedule
5. **Verify:** Task appears in Today Page to-do panel
6. **Verify:** Task shows same data (contact, due date, etc.)

### **Test 2: Complete Task on Today Page → See on Tasks Page**
1. Today Page → Click play on playlist block
2. To-do panel → Check off first task
3. Navigate to Tasks Page
4. **Verify:** Task status = "Done"
5. **Verify:** Task shows "Completed in [block name]"
6. **Verify:** Actual time is recorded

### **Test 3: Time Tracking**
1. Today Page → Start playlist block with 3 tasks (est 45 min)
2. Complete all 3 tasks in 35 minutes
3. End block
4. **Verify:** Each task shows actualTime
5. **Verify:** Total time = 35 minutes distributed across tasks
6. **Verify:** Jamie learns "You're 10 min faster on client tasks"

### **Test 4: Edit Task → Updates Everywhere**
1. Tasks Page → Edit task title "Call Sarah" → "Video call with Sarah"
2. Navigate to Today Page
3. **Verify:** To-do panel shows new title
4. **Verify:** FloatingFocusWidget shows new title
5. **Verify:** Timeline block playlist shows new title

### **Test 5: Delete Task → Removes from Playlist**
1. Tasks Page → Delete a task that's in a playlist
2. Today Page → View that playlist block
3. **Verify:** Deleted task doesn't appear
4. **Verify:** Playlist duration updates
5. **Verify:** No errors or broken references

## 🚀 **Next Steps**

**Ready to implement Phase 2?** I can update the AM Wizard to:
1. Accept tasks from App state
2. Create real playlists with task IDs
3. Save proper references to timeline blocks
4. Update tasks with scheduling info

Let me know when you're ready!

---

**Last Updated:** January 24, 2026  
**Status:** Phase 1 Complete ✅
