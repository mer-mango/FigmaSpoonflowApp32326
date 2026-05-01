# Meeting Dossier Lifecycle Implementation

## Overview
This document tracks the implementation of the meeting dossier lifecycle system where a single interaction card is progressively enriched through the AM wizard (prep), Post-Meeting wizard, and Wind Down wizard.

## ✅ Completed

### 1. Data Models (`/types/interactions.ts`)
- `MeetingPrepNotes` - Structured prep notes with things to know, discuss, questions
- `PostMeetingNotes` - Post-meeting summary, outcomes, action items
- `WindDownNotes` - Reflections and lessons learned
- `MeetingTask` - Tasks linked to meetings with `meetingId` reference
- `MeetingDossier` - Complete dossier with lifecycle tracking
- `InteractionCard` - Display format for contact interactions tab

### 2. Context & State Management (`/contexts/InteractionsContext.tsx`)
- Created `InteractionsProvider` with localStorage persistence
- Dossier CRUD operations:
  - `createDossier()` - Create new dossier
  - `updateDossier()` - Update existing dossier
  - `getDossierById()` - Retrieve specific dossier
  - `getDossiersByContactId()` - Get all dossiers for a contact
- Task CRUD operations with meeting linkage:
  - `createTask()` - Automatically links to meetingId
  - `updateTask()` - Updates synced across all locations
  - `getTasksByMeetingId()` - Get tasks for specific meeting
  - `createTasksForMeeting()` - Bulk create tasks for meeting
  
### 3. App-Wide Integration (`/App.tsx`)
- Wrapped entire app with `<InteractionsProvider>`
- All components now have access to interactions context

## 🚧 TODO: Implementation Steps

### Phase 1: AM Wizard Integration
**Goal**: Create meeting dossiers with prep notes during morning planning

**Files to update**:
- `/components/today/AMWizard.tsx`
- `/components/muted_MeetingDossier.tsx`

**Changes needed**:
1. Import `useInteractions` hook in AM Wizard
2. When user completes prep notes for a meeting:
   ```tsx
   const { createDossier } = useInteractions();
   
   const dossierId = createDossier({
     type: 'meeting',
     meetingTitle: meeting.title,
     meetingDate: meeting.date,
     meetingTime: meeting.time,
     contactId: meeting.contact.id,
     contactName: meeting.contact.name,
     prepCompleted: true,
     prepCompletedAt: new Date().toISOString(),
     prepNotes: {
       thingsToKnow,
       thingsToDiscuss,
       questionsToAsk,
       nextSteps
     },
     taskIds: [],
     postMeetingCompleted: false,
     windDownCompleted: false
   });
   ```

### Phase 2: Post-Meeting Wizard Integration
**Goal**: Load existing dossier and add post-meeting notes + tasks

**Files to update**:
- `/components/muted_PostMeetingWizard.tsx`
- `/components/muted_MeetingDossier.tsx`

**Changes needed**:
1. On wizard open, look up existing dossier by meeting ID
2. Load prep notes (read-only/checkable) to show what was planned
3. When user completes post-meeting notes:
   ```tsx
   const { updateDossier, createTasksForMeeting } = useInteractions();
   
   // Update dossier with post-meeting notes
   updateDossier(dossierId, {
     postMeetingCompleted: true,
     postMeetingCompletedAt: new Date().toISOString(),
     postMeetingNotes: {
       fathomUrl,
       summary,
       thingsDiscussed,
       outcomes,
       remainingQuestions,
       actionItems
     }
   });
   
   // Create tasks (these auto-link to meeting)
   const createdTasks = createTasksForMeeting(dossierId, tasksArray);
   ```

### Phase 3: Wind Down Wizard Integration
**Goal**: Load dossier for final review and task updates

**Files to update**:
- `/components/muted_PMWindDownWizard.tsx`
- `/components/muted_MeetingDossier.tsx`

**Changes needed**:
1. Load existing dossier with prep + post-meeting notes
2. Display all notes in read-only mode for review
3. Allow editing/adding tasks
4. When complete:
   ```tsx
   const { updateDossier, updateTask, createTask } = useInteractions();
   
   // Update dossier
   updateDossier(dossierId, {
     windDownCompleted: true,
     windDownCompletedAt: new Date().toISOString(),
     windDownNotes: {
       reflections,
       lessonsLearned,
       additionalContext
     }
   });
   
   // Update or create tasks
   updatedTasks.forEach(task => {
     if (task.id) {
       updateTask(task.id, task); // Syncs everywhere
     } else {
       createTask({ ...task, meetingId: dossierId });
     }
   });
   ```

### Phase 4: Contact Profile Interactions Tab
**Goal**: Display dossiers as cards in contact interactions

**Files to update**:
- `/components/ContactProfile.tsx` or `/components/muted_ContactModal.tsx`

**Changes needed**:
1. Create an "Interactions" tab in contact profile
2. Use `getDossiersByContactId(contactId)` to fetch dossiers
3. Display each dossier as a card showing:
   - Meeting title, date, time
   - Prep notes summary
   - Post-meeting summary
   - Tasks generated (embedded)
   - Badges showing completion status (prep ✓, post-meeting ✓, wind down ✓)
4. Click to expand and view full details

### Phase 5: Tasks Tab Integration  
**Goal**: Show meeting-generated tasks in contact's tasks tab

**Files to update**:
- `/components/ContactProfile.tsx` tasks tab

**Changes needed**:
1. Use `getTasksByContactId(contactId)` to fetch all tasks
2. Group or badge tasks that came from meetings
3. Clicking a meeting task could highlight/scroll to the interaction card

### Phase 6: Main Tasks Page Integration
**Goal**: Show all tasks including meeting-generated ones

**Files to update**:
- `/components/TasksPage.tsx`

**Changes needed**:
1. Import meeting tasks from `useInteractions().tasks`
2. Merge with existing tasks
3. Add badge/indicator for meeting-sourced tasks
4. Ensure edits update via `updateTask()` which syncs everywhere

### Phase 7: Task Sync Testing
**Goal**: Verify tasks update in all 3 locations

**Test scenarios**:
1. Create task in post-meeting wizard → appears in:
   - Interaction card (embedded)
   - Contact tasks tab
   - Main tasks page
2. Edit task from main tasks page → updates in:
   - Interaction card
   - Contact tasks tab
3. Mark task complete in contact tasks tab → updates in:
   - Interaction card
   - Main tasks page

## Data Flow Diagram

```
AM Wizard
   ↓ (creates)
Meeting Dossier (with prep notes)
   ↓ (stored in)
Contact Interactions Tab
   ↓ (loaded by)
Post-Meeting Wizard (adds post-meeting notes + tasks)
   ↓ (creates)
Tasks → appear in: [Interaction Card, Contact Tasks Tab, Main Tasks Page]
   ↓ (loaded by)
Wind Down Wizard (final review + task edits)
   ↓ (updates)
Tasks → sync across all locations
```

## Key Principles

1. **Single Source of Truth**: Dossier is created once, updated multiple times
2. **Task Linking**: Every task has `meetingId` to link back to source
3. **Bidirectional Updates**: Changes in any location update all references
4. **Progressive Enrichment**: Each wizard phase adds to the same dossier
5. **Prep Notes Persistence**: Prep notes visible (with checkboxes) in all phases

## Next Steps

Start with **Phase 1** (AM Wizard Integration) to establish the dossier creation flow, then proceed sequentially through the phases.
