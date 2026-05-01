# Jamie Tasks Intelligence - Quick Test Guide

## 🧪 How to Test

### 1. Simple Task Creation

Open Jamie and try:
```
"Create a task to email Spencer"
```

**Expected Response:**
```
✓ Created 1 task:
• Email Spencer - Outreach → Spencer Mitchell

All set to go!
```

**Validation:**
- ✅ Task appears in Tasks page
- ✅ Task type = Outreach (auto-detected from "email")
- ✅ Contact = Spencer Mitchell (auto-assigned)
- ✅ Status = To Do

---

### 2. Multiple Tasks

Try:
```
"I need to call Jason, email Sarah, and schedule Sophie"
```

**Expected Response:**
```
✓ Created 3 tasks:
• Call Jason - Networking → Jason Langheier
• Email Sarah - Outreach → Sarah [LastName]
• Schedule Sophie - Admin → Sophie [LastName]

All set to go!
```

**Validation:**
- ✅ 3 separate tasks created
- ✅ Each has appropriate task type
- ✅ Each has contact assigned (if in your contacts)
- ✅ All appear in Tasks page

---

### 3. With Time Estimates

Try:
```
"Create task: email Spencer (10 mins) and draft proposal for NHC (45 mins)"
```

**Expected Response:**
```
✓ Created 2 tasks:
• Email Spencer (10 mins) - Outreach → Spencer Mitchell
• Draft proposal for NHC (45 mins) - Client Work

All set to go!
```

**Validation:**
- ✅ Task 1 has estimatedTime = 10
- ✅ Task 2 has estimatedTime = 45
- ✅ Time shown in task card

---

### 4. With Due Dates

Try:
```
"Remind me to follow up with Jason by tomorrow"
```

**Expected Response:**
```
✓ Created 1 task:
• Follow up with Jason - Outreach → Jason Langheier

All set to go!
```

**Validation:**
- ✅ Task created
- ✅ Due date = tomorrow's date
- ✅ Shows in "Due Tomorrow" filter

---

### 5. Complex Multi-Task Request

Try:
```
"Spencer follow-up: send thank you email (10 mins), schedule coffee chat using his link (15 mins), draft collaboration proposal (1 hour)"
```

**Expected Response:**
```
✓ Created 3 tasks:
• Send thank you email (10 mins) - Outreach → Spencer Mitchell
• Schedule coffee chat using his link (15 mins) - Scheduling – use their link → Spencer Mitchell
• Draft collaboration proposal (60 mins) - Client Work → Spencer Mitchell

All set to go!
```

**Validation:**
- ✅ 3 tasks created, all assigned to Spencer
- ✅ Time estimates: 10, 15, 60 mins
- ✅ Different task types detected correctly
- ✅ "1 hour" converted to 60 mins

---

### 6. Bulk Creation (5+ Tasks)

Try:
```
"Create tasks: email Spencer, call Jason, message Sarah, schedule Sophie, follow up with Dan"
```

**Expected Response:**
```
✓ Created 5 tasks:
• Email Spencer - Outreach → Spencer Mitchell
• Call Jason - Networking → Jason Langheier
• Message Sarah - Outreach → Sarah [LastName]
• Schedule Sophie - Admin → Sophie [LastName]
• Follow up with Dan - Outreach → Dan [LastName]

All set to go!
```

**Validation:**
- ✅ All 5 tasks created
- ✅ No confirmation dialog (low-risk = auto-execute)
- ✅ Each task has appropriate type and contact

---

## 🔍 Edge Cases to Test

### Contact Not Found
Try:
```
"Create task to email RandomPerson123"
```

**Expected:**
- ✅ Task created with title "Email RandomPerson123"
- ✅ No contact assigned (not found)
- ✅ Task type = Outreach (from "email" keyword)
- ✅ No error shown

---

### No Time Estimate
Try:
```
"Create task to draft proposal"
```

**Expected:**
- ✅ Task created
- ✅ No estimatedTime field
- ✅ Task type = Client Work (from "draft proposal")

---

### Ambiguous Task Type
Try:
```
"Create task to do the thing"
```

**Expected:**
- ✅ Task created with title "Do the thing"
- ✅ Task type might be null (no clear keywords)
- ✅ Or defaults to most generic type (Admin)

---

### Multiple Delimiters
Try:
```
"I need to email Spencer, and call Jason and also message Sarah"
```

**Expected:**
- ✅ Parses 3 tasks despite mixed delimiters (", and" / "and also")
- ✅ Each task created separately

---

## 📋 Task Type Detection Tests

Test each task type to validate auto-detection:

| Task Type | Test Input | Expected Detection |
|-----------|-----------|-------------------|
| Outreach | "Email Spencer" | outreach |
| Networking | "Coffee chat with Jason" | networking |
| Client Work | "Draft proposal for NHC" | client_work |
| Admin | "Organize files" | admin |
| CPP | "Prep for CPP board meeting" | cpp |
| Personal | "Pick up prescription" | personal |
| Scheduling (their link) | "Use Spencer's Calendly link" | schedule_their_link |
| Scheduling (my link) | "Send my scheduling link to Jason" | schedule_my_link |
| Scheduling (email) | "Send scheduling email to NHC" | schedule_email |
| Business Development | "Draft new service offering" | business_development |

---

## ⏱️ Time Parsing Tests

| Input | Expected Time |
|-------|--------------|
| "email Spencer (10 mins)" | 10 |
| "draft proposal (1 hour)" | 60 |
| "write article (2 hours)" | 120 |
| "quick call (15 minutes)" | 15 |
| "research (30 min)" | 30 |

---

## 📅 Due Date Parsing Tests

| Input | Expected Due Date |
|-------|------------------|
| "by today" | Today's date |
| "by tomorrow" | Tomorrow's date |
| "this week" | End of this week (Sunday) |
| "next week" | End of next week (Sunday) |

---

## 🐛 Debugging Checklist

If tasks aren't being created:

1. **Check browser console** (F12 → Console)
   - Look for "Created task:" logs
   - Check for API errors

2. **Verify task intent detection**
   - Add `console.log(taskIntent)` in GlobalJamiePanel
   - Check if `isTaskRequest: true` and `action: 'create'`

3. **Check parsed tasks**
   - Log `taskIntent.tasks` to see what was parsed
   - Verify titles, contacts, times are extracted

4. **Check server response**
   - Network tab → Look for POST to `/tasks`
   - Check response status (should be 200 OK)

5. **Verify tasks in storage**
   - Open Tasks page
   - Check if tasks appear
   - Filter by "All Tasks" to see everything

---

## ✅ Success Criteria

Jamie's Task Intelligence is working if:

✅ She detects task creation requests ("create", "I need to", "remind me")
✅ She parses multiple tasks from one message
✅ She extracts time estimates correctly
✅ She auto-detects task types based on keywords
✅ She finds and assigns contacts by name
✅ She parses due dates from natural language
✅ She creates tasks via server API
✅ She provides clear confirmation messages
✅ Tasks appear immediately in Tasks page
✅ No errors in console

---

## 🎓 Testing Scenarios

### Scenario 1: Morning Planning
**You:** "Good morning Jamie! I need to email Spencer about the collaboration, call Jason re: BiteLabs course, and schedule a follow-up with the NHC team"

**Jamie should:**
1. Create 3 tasks
2. Assign Spencer, Jason, and detect "NHC team" context
3. Detect task types: Outreach, Networking, Admin/Outreach
4. Confirm all 3 created

---

### Scenario 2: Post-Meeting Follow-Up
**You:** "Create tasks from my meeting with Spencer: send thank you email (5 mins), draft proposal (1 hour), schedule next call using his link (10 mins)"

**Jamie should:**
1. Create 3 tasks related to Spencer
2. Assign Spencer to all 3
3. Extract time estimates: 5, 60, 10
4. Detect types: Outreach, Client Work, Scheduling (their link)

---

### Scenario 3: Weekly Planning
**You:** "This week I need to: follow up with Jason, draft NHC curriculum outline, prep for CPP board meeting, and pick up prescription"

**Jamie should:**
1. Create 4 tasks
2. Detect "this week" as due date timeframe
3. Assign contacts: Jason, (NHC team), (CPP), none
4. Detect types: Outreach, Client Work, CPP, Personal

---

### Scenario 4: Urgent Task
**You:** "Urgent: send proposal to BiteLabs by Friday (45 mins)"

**Jamie should:**
1. Create 1 task
2. Set priority = high (from "urgent")
3. Set due date = next Friday
4. Set estimatedTime = 45
5. Detect type = Client Work

---

## 💡 Pro Tips for Testing

### 1. Start Simple
Begin with single tasks, then test multiple.

### 2. Check the Tasks Page
After each test, open Tasks page to verify:
- Task appears
- Title is correct
- Contact is assigned (if mentioned)
- Task type is appropriate
- Time estimate shows (if specified)
- Due date is set (if mentioned)

### 3. Test Natural Variations
Try different phrasings:
- "Create task to X"
- "I need to X"
- "Remind me to X"
- "Add task: X"
- "X (10 mins)"

### 4. Test Contact Variations
- Full name: "Spencer Mitchell"
- First name only: "Spencer"
- Last name only: "Mitchell"
- Partial match: "Spenc"

### 5. Test Time Variations
- "10 mins"
- "10 minutes"
- "1 hour"
- "2 hours"
- "45 min"

---

## 🚀 Ready to Test!

Open Jamie (sparkle icon in sidebar) and start creating tasks! This is **Phase 2** of Jamie's evolution - she can now ACT on your behalf, not just advise.

**Next up**: Content Jamie (save drafts, update content stages) - Phase 3!

Happy testing! 🎉
