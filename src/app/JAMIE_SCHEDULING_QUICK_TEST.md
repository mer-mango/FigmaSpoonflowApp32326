# Jamie Scheduling Intelligence - Quick Test Guide

## 🧪 How to Test

### 1. Prerequisites
✅ Google Calendar is connected (check Settings → Integrations)
✅ At least one calendar is selected for sync
✅ You have some existing meetings OR open slots on Wed/Thu

---

## 2. Test Queries

Open Jamie (sparkle icon in sidebar) and try these:

### Basic Availability:
```
"Do I have any openings this week?"
```
**Expected**: Jamie shows Wed/Thu slots with times

```
"When's my next available slot?"
```
**Expected**: Jamie shows the next chronological opening

```
"Can I fit another meeting Thursday?"
```
**Expected**: Jamie checks Thu capacity and reports

---

### Time-Specific:
```
"Am I free tomorrow?"
```
**Expected**: If tomorrow is Wed/Thu, shows slots; otherwise explains meeting days

```
"Show me my availability for next week"
```
**Expected**: Lists all open slots for next Mon-Sun (only Wed/Thu)

```
"What's my schedule look like this month?"
```
**Expected**: Shows all Wed/Thu openings in current month

---

### Strategic Questions:
```
"How many meetings can I fit this week?"
```
**Expected**: Counts available slots, explains max (4 total if all open)

```
"Can I fit a 1-hour meeting?"
```
**Expected**: Jamie should adjust duration to 60 min (currently optimized for 30, may need refinement)

```
"Should I schedule Spencer on Wednesday or Thursday?"
```
**Expected**: Strategic recommendation based on energy patterns (2pm Wed is peak)

---

## 3. Edge Cases to Test

### No Availability:
Book 2 meetings on both Wed and Thu, then ask:
```
"Do I have any openings this week?"
```
**Expected**: "You don't have any open meeting slots... fully booked"

---

### Calendar Not Connected:
Disconnect Google Calendar, then ask:
```
"When's my next opening?"
```
**Expected**: "I can't check your calendar because it's not connected yet. Please connect your Google Calendar in Settings first."

---

### Mixed Days:
Ask on a Monday:
```
"Am I free today?"
```
**Expected**: "Your meeting days are Wednesdays and Thursdays (1-3:30pm ET). Monday isn't available for scheduling."

---

## 4. What Jamie Should Show

For each available slot, you should see:
- **Day name** (Wednesday, Thursday)
- **Time** in 12-hour format with AM/PM (e.g., "1:00 PM")
- **Meetings already booked** that day (e.g., "0 of 2 meetings")
- **Total count** at the bottom
- **Duration and buffer info** (30 min each, with 30 min buffer)

---

## 5. Strategic Recommendations to Look For

Jamie should mention:
- **2:00 PM on Wednesday** is your peak focus window (best for high-stakes)
- **Spreading meetings** across both days vs. back-to-back
- **Energy recovery** after 2 meetings in one afternoon
- **Remaining capacity** per day

---

## 6. Troubleshooting

### Jamie doesn't detect my scheduling question:
Try more explicit phrasing:
- "Show me my calendar availability"
- "Check my free time this week"
- "What slots do I have open?"

### Jamie shows wrong times:
Check in Settings → Calendar:
- Which calendars are selected for sync?
- Are events from the right calendar showing up?

### Jamie shows meetings I don't recognize:
She's reading from ALL selected calendars. Deselect calendars you don't want to check against.

### Jamie says I'm fully booked but I see openings:
She only considers Wed/Thu 1-3:30pm ET. Slots outside this window don't count.

---

## 7. Sample Test Scenario

**Setup**:
1. Add a test meeting: Thursday 1:00-1:30 PM this week
2. Leave Wednesday completely open

**Test**:
Ask Jamie: "Do I have any openings this week?"

**Expected Response**:
```
Here's your availability for this week:

**Wednesday**:
• 1:00 PM (0 of 2 meetings already booked)
• 2:00 PM (0 of 2 meetings already booked)

**Thursday**:
• 2:00 PM (1 of 2 meetings already booked)

Total: 3 open slots (30 min each, with 30 min buffer)
```

**Validation**:
✅ Wednesday shows 2 slots (both open)
✅ Thursday shows only 2pm (1pm is taken)
✅ Total count is correct (3)
✅ Shows meetings already booked (1 on Thursday)

---

## 8. Advanced Test: Strategic Recommendation

**Setup**: Same as above (1 meeting Thu, Wed fully open)

**Test**: 
Ask Jamie: "I need to schedule a high-stakes meeting with the NHC team. When should I do it?"

**Expected Response** (Jamie should recommend strategically):
```
Based on your energy patterns and existing schedule:

🎯 BEST: Wednesday 2:00-2:30 PM
- You have no meetings Wednesday (fresh energy)
- 2pm is your peak focus/clarity window
- Leaves morning free for deep work

✅ ALTERNATIVE: Thursday 2:00-2:30 PM
- You already have a meeting at 1pm Thursday
- Back-to-back might be draining
- But keeps next week completely free

Which do you prefer?
```

**Validation**:
✅ Recommends Wednesday (zero meetings that day)
✅ Highlights 2pm as peak focus
✅ Mentions energy consideration
✅ Provides alternative with trade-offs

---

## 9. Quick Debug Checklist

If Jamie's responses seem off:

1. **Check browser console** for errors (F12 → Console tab)
2. **Verify calendar connection**: Settings → Integrations → Google Calendar (should show "Connected")
3. **Check selected calendars**: Settings → Calendar → Selected Calendars (at least one checked)
4. **Verify time zone**: Your calendar should be set to America/New_York
5. **Test with simple query**: "Do I have any slots this week?" (simplest test case)
6. **Check server logs**: Server endpoint `/jamie/check-availability` should return 200 OK

---

## 10. Success Criteria

Jamie's Scheduling Intelligence is working if:

✅ She detects scheduling questions ("when", "available", "opening", etc.)
✅ She shows only Wed/Thu 1-3:30pm ET slots
✅ She respects max 2 meetings per day
✅ She accounts for 30-min meetings + 30-min buffers
✅ She provides strategic recommendations
✅ She handles errors gracefully (calendar not connected, no slots, etc.)
✅ Response format is clear and actionable

---

## 🎉 You're Ready!

Open Jamie and start asking scheduling questions. This is **Phase 1** of Jamie's evolution from read-only assistant to autonomous agent.

Next up: **Content Jamie** (write access for saving drafts) and **Tasks Jamie** (create tasks from natural language).

Happy testing! 🚀
