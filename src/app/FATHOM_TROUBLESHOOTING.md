# Fathom Integration Troubleshooting Guide

## Current Architecture

### Components
- **MutedPostMeetingWizard** (`/components/muted_PostMeetingWizard.tsx`)
  - Main wizard for post-meeting notes
  - Manages workflow through steps: welcome → meeting-review → follow-up → nurture → thank-you → complete
  - Contains `MutedMeetingDossier` component for note-taking

- **MutedMeetingDossier** (`/components/muted_MeetingDossier.tsx`)
  - Displays prep notes (AM Wizard) or post-meeting notes (Post-Meeting Wizard)
  - Has Fathom URL input field
  - Has "Jamie Extract" button
  - Extracts outcomes, action items, etc. from meeting summary text

### Backend Endpoints
- **`/make-server-a89809a8/jamie/extract-from-text`** 
  - Uses OpenAI to extract structured data from meeting summary text
  - Takes `{ transcript: string }`
  - Returns: `{ summary, outcomes, thingsDiscussed, actionItems }`

- **`/make-server-a89809a8/jamie/extract-from-fathom`** 
  - Fetches transcript from Fathom API using meeting ID
  - Requires `CURRENT_FATHOM_API_KEY` environment variable
  - Takes `{ fathomUrl: string }`
  - Returns same structure as extract-from-text

### Fathom Client (`/supabase/functions/server/fathomClient.ts`)
- `extractFathomMeetingId(url)` - Parses Fathom URLs
- `fetchFathomTranscript(meetingId, apiKey)` - Calls Fathom API
- `parseFathomTranscript(transcript)` - Converts Fathom data to app format

## Current Workflow

1. User completes a meeting
2. User clicks "Post-Meeting Notes" from Today page or Jamie menu
3. Post-Meeting Wizard opens
4. User can:
   - Paste Fathom URL in "Fathom Recording URL" field (for record-keeping)
   - Paste meeting summary/transcript in "Meeting Summary" textarea
   - Click "Jamie Extract" to process the summary text with AI

## Issues to Address

### 1. ❌ Fathom URL Not Connected to Extract Function
**Current:** Fathom URL field exists but isn't used for extraction
**Expected:** User should be able to:
  - Paste Fathom URL
  - Click a button to fetch transcript from Fathom API
  - Auto-populate the Summary field with Fathom transcript
  - Then use Jamie Extract on that content

**Solution:** Add a "Fetch from Fathom" button next to the Fathom URL field

### 2. ❌ No Direct Fathom → Jamie Pipeline
**Current:** Two-step process (paste summary → extract)
**Expected:** One-click process (paste Fathom URL → fetch & extract automatically)

**Solution:** Create a "Fetch & Extract from Fathom" button that:
  1. Calls `/jamie/extract-from-fathom` endpoint
  2. Auto-populates all fields (summary, outcomes, action items)

### 3. ⚠️  Jamie Extract Button Logic
**Current:** Button is disabled if summary is empty
**Issue:** Users might want to extract from Fathom URL instead of pasting text

**Solution:** Enable button if either:
  - Summary has text, OR
  - Fathom URL is provided

### 4. ⚠️  Error Handling for Fathom API
**Needed:**
  - Clear error messages if Fathom API key is missing
  - Clear error messages if Fathom URL is invalid
  - Clear error messages if meeting not found/no access
  - Fallback to manual entry if Fathom fails

### 5. ⚠️  Loading States
**Needed:**
  - Show loading indicator when fetching from Fathom
  - Disable buttons during fetch
  - Show progress: "Fetching transcript..." → "Analyzing with Jamie..."

## Recommended Implementation Plan

### Phase 1: Basic Fathom Fetch
1. Add "Fetch Transcript" button next to Fathom URL field
2. When clicked:
   - Validate Fathom URL format
   - Call server to fetch transcript
   - Populate Summary field with raw transcript
   - Show success/error toast

### Phase 2: Combined Fetch + Extract
1. Add "Fetch & Extract from Fathom" button
2. When clicked:
   - Call `/jamie/extract-from-fathom` endpoint
   - Auto-populate all fields (summary, outcomes, action items)
   - Show loading states
   - Handle errors gracefully

### Phase 3: Smart Button Logic
1. Update "Jamie Extract" button to:
   - If Fathom URL provided: Use extract-from-fathom endpoint
   - If Summary text provided: Use extract-from-text endpoint
   - If both provided: Prioritize Fathom URL

### Phase 4: Error Handling & Polish
1. Add error messages for common scenarios
2. Add retry logic
3. Add validation messages
4. Add help text explaining the workflow

## Environment Variables Required

- `CURRENT_FATHOM_API_KEY` - Already set (confirmed in user's secrets list)
- `OPENAI_API_KEY` - Already set (confirmed in user's secrets list)

## Testing Checklist

- [ ] Fathom URL validation works
- [ ] Fathom API returns transcript successfully
- [ ] Jamie extraction from Fathom works
- [ ] Jamie extraction from text works
- [ ] Action items convert to tasks
- [ ] Error messages display correctly
- [ ] Loading states show during fetch/extract
- [ ] Post-meeting notes save to dossier
- [ ] Dossier persists across wizard sessions