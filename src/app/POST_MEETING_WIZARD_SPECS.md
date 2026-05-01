# Post-Meeting Notes Wizard - Current Specifications

## Overview
The Post-Meeting Notes Wizard is a comprehensive modal that captures structured notes, action items, and feedback after a meeting ends.

## Modal Specifications

### Size & Layout
- **Default Size:** `w-[85vw] h-[90vh]`
- **Maximized Size:** `w-[98vw] h-[98vh]`
- **Maximize/Minimize:** Toggle button in header
- **Background:** White with scrollable content area
- **Z-Index:** 10000 (above most other modals)

### Header Section
- **Background Color:** `#6b2358` (AI/Jamie purple)
- **Elements:**
  - Jamie avatar with "J" initial
  - Title: "Meeting Notes"
  - Subtitle: Meeting title
  - Maximize/minimize button
  - Close (X) button

### Meeting Info Banner
- **Background:** Light blue (`bg-blue-50`)
- **Border:** Blue (`border-blue-200`)
- **Content:**
  - Calendar icon + start time
  - User icon + contact name (if available)
  - Duration text

## Content Sections

### 1. Quick Summary
- **Icon:** FileText (teal `#2f829b`)
- **Type:** Textarea
- **Rows:** 3
- **Required:** Yes (Save button disabled without it)
- **Placeholder:** "What happened in this meeting? (1-2 sentences)"
- **Styling:** Rounded corners, border, focus ring

### 2. Key Discussion Points
- **Icon:** Star (yellow `#f59e0b`)
- **Type:** Dynamic list with add/remove
- **Display:** Yellow-tinted cards with message icon
- **Add Method:** 
  - Text input with "Add" button
  - Enter key support
- **Item Display:**
  - MessageSquare icon
  - Point text
  - Remove (X) button per item

### 3. Action Items & Next Steps
- **Icon:** Target (green `#10b981`)
- **Type:** Dynamic list with add/remove
- **Fields per item:**
  - Task description (required)
  - Assignee name (required)
  - Optional: due date (not currently implemented in UI but in data structure)
- **Display:** Green-tinted cards with CheckCircle icon
- **Add Method:** 
  - Task input field
  - Assignee input field
  - "Add Action" button

### 4. Follow-up Needed?
- **Icon:** AlertCircle (orange `#f97316`)
- **Type:** Boolean toggle (Yes/No)
- **Display:** Two large toggle buttons side-by-side
  - Yes: Orange border + background when selected
  - No: Green border + background when selected
- **Conditional:** If "Yes" is selected, show textarea for follow-up notes
  - Placeholder: "When and how should you follow up?"
  - 2 rows

### 5. Meeting Rating
- **Icon:** Star (teal `#2f829b`)
- **Type:** 1-5 scale selection
- **Display:** Grid of 5 buttons in a row
- **Options:**
  1. Poor - `#ca4e63` (red-ish)
  2. Fair - `#f29c97` (light red)
  3. Good - `#f9d67a` (yellow)
  4. Great - `#adc3a6` (light green)
  5. Excellent - `#81bcc0` (teal)
- **Button Style:**
  - Colored circle with number
  - Label below
  - Border and scale effect when selected

### Jamie's Tip Section
- **Background:** Purple tint (`rgba(107, 35, 88, 0.1)`)
- **Border:** Purple (`#6b2358` with opacity)
- **Icon:** Sparkles
- **Content:** Informational message about notes being saved to contact's meeting dossier

## Footer Section
- **Background:** Gray (`bg-gray-50`)
- **Border:** Top border
- **Buttons:**
  - Left: "Skip for Now" (ghost variant)
  - Right: "Save Notes" (purple `#6b2358`)
    - Includes ArrowRight icon
    - Disabled if summary is empty

## Data Structure

### Input Props
```typescript
interface PostMeetingNotesWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (notesData: {
    summary: string;
    keyPoints: string[];
    actionItems: { task: string; assignee: string; dueDate?: string }[];
    followUpNeeded: boolean;
    followUpNotes: string;
    meetingRating: number;
  }) => void;
  meeting: {
    id: string;
    title: string;
    contact?: string;
    duration: string;
    startTime: string;
  };
}
```

## User Flow

1. **Open wizard** immediately after meeting ends
2. **Write summary** - Required first step
3. **Add key points** - Optional, can add multiple
4. **Add action items** - Optional, each needs task + assignee
5. **Select follow-up** - Yes/No toggle
6. **Rate meeting** - 1-5 scale
7. **Save or skip** - Either save all data or skip for now

## Design Characteristics

- **Color Coding:** Each section has its own accent color for visual organization
- **Progressive Disclosure:** Follow-up notes only show when "Yes" is selected
- **Inline Add/Remove:** Items can be added and removed within each section
- **Form Validation:** Only summary is required, rest is optional
- **Visual Hierarchy:** Clear section headers with icons
- **Feedback:** Border colors and backgrounds change on interaction

## Integration Points

- **Trigger:** Called after meeting ends (from calendar/meeting flow)
- **Data Save:** OnComplete callback sends all captured data
- **Contact Association:** Notes saved to contact's meeting dossier
- **Action Items:** Could be converted to tasks in task management system

## Accessibility

- **Keyboard Navigation:** Enter key adds items in list sections
- **Focus Management:** Clear focus states on all inputs
- **Visual Feedback:** Color changes and scale effects on selections
- **Clear Labels:** All sections have descriptive labels and icons

---

**File Location:** `/components/PostMeetingNotesWizard.tsx`
**Last Updated:** Based on current implementation as of session
