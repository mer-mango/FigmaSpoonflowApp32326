# Jamie's Scheduling Intelligence Guide

**Purpose**: This document defines how Jamie (AI assistant) should read, understand, and apply Meredith's routine preferences from Settings > Schedule when helping schedule her day around meetings and other commitments.

**Status**: Living document - manually update when scheduling logic or preferences change

**Note**: This is a **reference guide and documentation**. Jamie actually reads scheduling preferences from the KV store (saved when you edit Settings > Schedule > Scheduling Rules tab). This document explains the concepts and logic, but the actual preferences come from your saved settings.

---

## Core Scheduling Principles

Jamie must understand and apply these foundational rules when scheduling:

### Daily Structure (The "Time Spine")
Every day is structured around **four key touchpoints**:

1. **Start My Day** wizard (flexible start time - could be 11 AM, 1 PM, or later)
2. **AM Admin** routine (immediately follows Start My Day wizard, unless early meeting conflicts)
3. **PM Admin** routine (end-of-day wrap-up)
4. **Wind Down** wizard (final touchpoint before day ends)

**Critical**: The day doesn't "start" until the Start My Day wizard is completed. This timing is flexible based on morning commitments (especially medical appointments).

---

## Reading Schedule Preferences

Jamie reads scheduling preferences from the **Settings > Schedule > Scheduling Rules** tab, which contains:

### 1. Buffer Requirements (`buffers`)
- **Between all meetings**: 15 minutes minimum
- **Before virtual meetings/appointments**: 15 minutes
- **After virtual meetings/appointments**: 15 minutes
- **Before in-person medical appointments**: 45 minutes (for travel)
- **After in-person medical appointments**: 45 minutes (for travel)
- **Special rule**: Medical appointment buffers account for travel time (in-person) vs. connection/prep time (virtual)

**Jamie should**:
- Never schedule back-to-back meetings without proper buffers
- Automatically add buffers when suggesting meeting times
- Flag when someone tries to book without adequate buffer
- Understand that in-person medical appointments need 45-min buffers, virtual need 15-min

### 2. Time Blocking Rules (`timeBlockingRules`)
- **Focus Time Minimum**: 90 minutes for deep work blocks
- **Deep Work Windows**: 
  - Morning focus: After Start My Day wizard + AM Admin complete
  - Afternoon focus: Task Time blocks (typically 12:00 PM - 4:00 PM)
  - Content time: 3:00 PM - 5:00 PM on scheduled content days
- **Protected Hours**:
  - Morning routines: Start My Day wizard → AM Admin
  - Evening routines: PM Admin → Wind Down wizard
- **No Meeting Days**: Protect Task Time blocks from meetings; limit meetings on content creation days (Mon/Thu)

**Jamie should**:
- Schedule deep work in uninterrupted 90+ minute blocks
- Avoid fragmenting focus time with meetings
- Respect protected routine hours
- Schedule meetings around routines, not the other way around

### 3. Meeting Preferences (`meetingPreferences`)
- **Maximum per day**: 2 meetings
- **Preferred times**: After morning routines complete (Plan My Day + AM Admin)
  - Ideal windows: 12:00-1:00 PM, 2:00-3:00 PM, 4:00-5:00 PM
- **Avoid times**:
  - During morning routines (Plan My Day + AM Admin)
  - 12:00-1:00 PM if it blocks lunch
  - During scheduled Task Time or Content blocks
  - During evening routines (PM Admin + Wind Down)
- **Default duration**: 30 minutes (can extend to 60 for strategy/client meetings)
- **Back-to-back limit**: Maximum 2 consecutive meetings with 15-min buffer between; never 3+ consecutive

**Jamie should**:
- Count existing meetings and decline/suggest alternatives if already at 2/day
- Suggest meeting times in preferred windows
- Cluster meetings when possible to preserve long focus blocks
- Always maintain buffers between meetings

### 4. Energy Management (`energyManagement`)
- **Morning (before 11 AM)**: Low energy - slow start window
  - Schedule: Light admin, planning, routine tasks
  - Avoid: Demanding cognitive work, important client meetings
- **Midday (12-3 PM)**: Peak focus window
  - Schedule: Deep work, important decisions, complex tasks
  - Ideal for: Client meetings, strategy work, content creation
- **Afternoon (3-6 PM)**: Medium energy
  - Schedule: Meetings, collaborative work, lighter tasks
  - Avoid: Starting new complex projects
- **Evening (after 6 PM)**: Winding down
  - Schedule: PM Admin, Wind Down wizard, light wrap-up
  - Hard stop: 6:30 PM (never schedule work after this)

**Jamie should**:
- Match task/meeting intensity to energy levels
- Schedule demanding work during peak hours (12-3 PM)
- Respect the hard stop at 6:30 PM
- Consider chronic illness and need for pacing

### 5. Calendar Preferences (`calendarPreferences`)
- **Primary calendar**: Work Calendar
- **Multiple calendars**: Work, Personal, Virtual Appts, Medical Appts
- **Sync rules**: All calendars sync to show accurate availability
- **Privacy**: Personal and medical events show as "Busy" on work calendar without details

**Jamie should**:
- Check all calendars for conflicts when scheduling
- Understand medical appointments come from separate calendars (Virtual Appts vs. Medical Appts)
- Respect privacy by not exposing personal/medical details in work scheduling

### 6. Priority Hierarchy (`autoDeclineRules.priorityRules`)
When conflicts arise, this is the order of importance:

1. **Medical appointments** (virtual or in-person) - NEVER move
2. **Client meetings** - can override primary routines if necessary
3. **Primary routines** (Start My Day, AM Admin, Task Time, PM Admin, Wind Down)
4. **Time-sensitive opportunities**
5. **Secondary routines** (Professional Development, Content)
6. **Internal team meetings**
7. **1:1s and optional meetings**

**Jamie should**:
- Never suggest moving medical appointments
- Allow client meetings to override routines, but suggest rescheduling the routine to later in the day
- Protect routines from lower-priority items
- When displacing a routine, always suggest when to reschedule it (never skip entirely)

---

## Jamie's Decision-Making Framework

When a scheduling request comes in, Jamie should follow this process:

### Step 1: Check Calendar Conflicts
- Is there an existing meeting, medical appointment, or routine?
- Is there adequate buffer time (15 min standard, 45 min for in-person medical)?
- Has the day started yet (Start My Day wizard completed)?

### Step 2: Assess Priority Level
- Use the priority hierarchy above
- Medical appointments > Client meetings > Primary routines > Everything else
- Client meetings CAN override routines if necessary

### Step 3: Evaluate Energy Requirements
- Does this need peak energy hours (12-3 PM)?
- Would it fit better in medium energy time (3-6 PM)?
- Is it appropriate for current time context?

### Step 4: Check Routine Impact
- Would this displace a routine? Can the routine be rescheduled to later?
- Would this fragment a focus block?
- Does this respect the 2 meetings/day maximum?

### Step 5: Suggest Best Alternative
- Offer 2-3 time slots that honor all constraints
- If displacing a routine, suggest when to reschedule it
- Explain reasoning diplomatically

---

## Special Instructions for Jamie

### Plan My Day Wizard Integration
The wizard asks:
- **MIT (Most Important Thing)**: What must get done today?
- **Other needs**: Any special needs or things Jamie should know?

**Jamie MUST**:
- Factor MIT answer into routine prioritization during timeline auto-fill
- Let "other needs" answer influence the schedule
- Examples:
  - If MIT is "doing 30 minutes of PT" → PT routine MUST be scheduled that day
  - If user says "I'm exhausted and need 2 breaks today" → 2 break routines MUST be added
  - If user says "I need 1 hour for lunch" → lunch routine MUST be 1 hour (not default 30 min)
  - If user says "I have a doctor appointment at 2 PM" → block that time and add appropriate buffers
- User-specified needs override default routine patterns for that specific day

### Medical Appointment Handling
- **Virtual medical appointments** (from "Virtual Appts" calendar): 15 min before + 15 min after
- **In-person medical appointments** (from "Medical Appts" calendar): 45 min before + 45 min after for travel
- **Never suggest moving medical appointments**
- Medical appointments may cause the day to start later (e.g., if appointment is at 11 AM, Start My Day wizard happens at 1 PM)

### Client Meeting Priority
- Client meetings can override routines if scheduling conflict exists
- When displacing a routine, **always suggest rescheduling it to later in the day**
- Example dialogue: "I have my planning routine then, but given this is a client meeting, I can move it to 3 PM. Does 1 PM work for you?"

### Routine Protection
- Protect the sequence: **Start My Day → AM Admin** (start of day) and **PM Admin → Wind Down** (end of day)
- If urgent meeting must happen during routine time, reschedule routine to later (never skip)
- Maximum 2 meetings per day - decline additional meeting requests politely

### Buffer Enforcement
- Never schedule back-to-back without 15-min buffer minimum
- Flag when someone tries to book without adequate buffer
- Suggest next available slot that maintains proper spacing
- Remember: in-person medical = 45-min buffers, virtual = 15-min buffers

---

## Applying Preferences During Scheduling

### When User Asks: "Can I take a meeting at 2 PM tomorrow?"

**Jamie's thought process**:
1. Check calendar for 2 PM tomorrow
2. Check if there are already 2 meetings scheduled that day (max limit)
3. Check if 2 PM falls during a protected routine
4. Check if there's adequate buffer time before/after (15 min)
5. Check energy context - is 2 PM a good time? (Yes, afternoon window)
6. If conflicts exist, apply priority hierarchy
7. If routine must be displaced, suggest when to reschedule it

**Example good response**:
"You have Task Time scheduled from 1:30-3:30 PM tomorrow, but since this is a client meeting, we can move Task Time to 3:45-5:15 PM instead. That gives you a 15-minute buffer after the meeting ends at 3 PM. Does 2 PM work?"

**Example decline response** (already at 2 meetings):
"You already have 2 meetings tomorrow (your max), so I'd suggest declining this one. I can offer alternative times on [next available day]: 12:00 PM, 2:00 PM, or 4:00 PM. Which works best?"

### When User Asks: "Schedule my day around my 11 AM doctor appointment"

**Jamie's thought process**:
1. Identify appointment type: in-person or virtual medical?
2. Add appropriate buffers (45 min before/after for in-person, 15 min for virtual)
3. Block buffer time as unavailable
4. Schedule Start My Day wizard + AM Admin to happen after appointment + buffer (e.g., 12:30 PM)
5. Build rest of day from there

**Example response**:
"Got it! Since your 11 AM appointment is in-person medical, I'm blocking 10:15-11:00 AM for travel/prep and 11:45 AM-12:30 PM for travel back. I'll schedule your Start My Day wizard and AM Admin to start at 12:30 PM, then we can build your afternoon from there. Sound good?"

### When User Says: "I'm exhausted today and need extra breaks"

**Jamie's thought process**:
1. User has indicated special need - this overrides default patterns
2. Add extra break routines to timeline
3. Reduce intensity of scheduled work
4. Avoid scheduling optional meetings
5. Protect energy for essential tasks only

**Example response**:
"Absolutely. I'm adding two 30-minute break blocks to your schedule today - one at 2 PM and one at 4 PM. I'll also keep your Task Time focused on just the essentials and suggest declining any optional meetings. Let's prioritize rest and recovery today."

---

## Technical Implementation Notes

### Where Schedule Preferences Live
- **File**: `/components/ScheduleSettings.tsx`
- **Storage**: User-edited preferences saved to KV store as `schedule_settings`
- **Defaults**: `defaultScheduleSettings` object provides initial values before user customizes
- **Data structure sections**:
  - `buffers`
  - `calendarPreferences`
  - `timeBlockingRules`
  - `meetingPreferences`
  - `energyManagement`
  - `schedulingConstraints`
  - `autoDeclineRules`
  - `jamieGuidance`

### Where Jamie Reads Preferences
- **File**: `/utils/jamieAI.ts`
- **Function**: `loadScheduleSettings()` - loads from KV store (falls back to defaults if none saved)
- **Usage**: `buildJamieSystemPrompt()` includes loaded settings in Jamie's context
- Jamie's system prompt dynamically includes all your saved scheduling preferences

### How It Works
1. **You edit** preferences in Settings > Schedule > Scheduling Rules tab
2. **You click "Save Changes"** - settings are saved to KV store (`schedule_settings` key)
3. **Jamie loads** settings via `loadScheduleSettings()` every time she generates a response
4. **Jamie applies** these rules when helping you schedule or plan your day

### How to Update Your Preferences
1. Go to Settings > Schedule > Scheduling Rules tab
2. Expand any section (Buffers, Meetings, Energy, Jamie's Guidance, etc.)
3. Edit the fields to match your preferences
4. Click "Save Changes"
5. Jamie will immediately use your new preferences (no app restart needed)

### How to Update This Documentation
This guide is a **manual reference document**. When you change how scheduling logic should work:
1. Edit your preferences in Settings > Schedule (as above)
2. Update this document (`/docs/JAMIE_SCHEDULING_GUIDE.md`) to reflect conceptual changes
3. Test with Jamie to ensure behavior matches expectations

---

## Testing Jamie's Scheduling Intelligence

To verify Jamie understands and applies preferences:

### Test Scenarios
1. **Buffer enforcement**: Ask to schedule back-to-back meetings without buffers
   - ✅ Jamie should decline and suggest times with proper buffers
2. **Meeting maximum**: Try to schedule 3rd meeting in a day
   - ✅ Jamie should decline and explain 2-meeting limit
3. **Medical appointment handling**: Schedule around in-person vs. virtual medical appointment
   - ✅ Jamie should add 45-min buffers for in-person, 15-min for virtual
4. **Routine protection**: Try to schedule meeting during Start My Day wizard time
   - ✅ Jamie should suggest alternative times and protect the routine
5. **Client meeting override**: Ask to schedule client meeting during routine time
   - ✅ Jamie should allow it but suggest rescheduling the routine to later
6. **Energy-aware scheduling**: Ask to schedule deep work at 8 AM (low energy time)
   - ✅ Jamie should suggest better time (12-3 PM peak focus window)
7. **Plan My Day integration**: Tell Jamie "my MIT is doing 30 min of PT"
   - ✅ Jamie should schedule PT routine that day

---

## Changelog

- **2026-01-19**: Initial document created to consolidate scheduling intelligence requirements
- _Future updates will be logged here_

---

## Quick Reference: Key Rules

**For Jamie to remember**:
1. ✅ Day starts with Start My Day wizard (flexible timing) → AM Admin
2. ✅ Day ends with PM Admin → Wind Down wizard
3. ✅ Medical appointments NEVER move (highest priority)
4. ✅ Client meetings CAN override routines (but reschedule routine, don't skip)
5. ✅ Maximum 2 meetings per day
6. ✅ 15-min buffers between all meetings (45-min for in-person medical)
7. ✅ Deep work needs 90+ minute uninterrupted blocks
8. ✅ Peak focus hours: 12-3 PM (best for demanding work)
9. ✅ Hard stop: 6:30 PM (never schedule after this)
10. ✅ Listen to Plan My Day wizard answers - user's stated needs override defaults