# Task Type Auto-Generation TODO

## Implementation Needed

Task types should auto-generate when tasks are created from:

### 1. Meeting Action Items
When action items from meetings are converted to tasks, the system should:
- Parse the action item title
- Run `detectTaskType()` function from `/utils/taskTypes.ts`
- Auto-assign the detected task type to the new task
- Store the task type in the task object

**Implementation Location:**
- Wherever meeting action items are converted to tasks (likely in Meeting Dossier or Post-Meeting Notes flow)
- Use: `import { detectTaskType } from '../utils/taskTypes'`
- On task creation: `const taskType = detectTaskType(actionItemTitle);`

### 2. Contact Tasks Tab
When creating a task from a contact's tasks tab:
- Auto-detect task type based on title as user types
- Apply auto-detection on blur or form submission
- Prefill the taskType field in the task creation modal

**Implementation Location:**
- Contact profile's tasks tab
- Task creation flow from contact context
- Use same `detectTaskType()` function

### 3. Detection Logic
The detection happens in `/utils/taskTypes.ts`:
```typescript
// Auto-detect based on keywords in title
const detectedType = detectTaskType(title);
if (detectedType && !manuallySetType) {
  task.taskType = detectedType;
}
```

## Files to Update
- Meeting dossier action item conversion
- Contact profile task creation
- Any other task creation flows

## Notes
- Auto-detection should never override a manually set task type
- Detection runs on title blur or form submission
- Keywords are defined in `taskTypeOptions` array in `/utils/taskTypes.ts`
