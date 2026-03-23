# Jamie's Task Intelligence - User Guide

## 🎉 What's New

Jamie can now **CREATE TASKS DIRECTLY** in your system! No more "I'll suggest you create these tasks"—she actually creates them for you.

---

## ✅ What Jamie Can Do NOW (Write Access)

### Create Tasks from Natural Language
Jamie understands conversational requests like:
- "Create a task to email Spencer"
- "I need to call Jason, email Sarah, and schedule Sophie"
- "Remind me to follow up with NHC team by Friday"
- "Add task: draft proposal for BiteLabs (45 mins)"

### Smart Parsing
Jamie automatically extracts:
- **Task titles** from your request
- **Time estimates** ("email Spencer (10 mins)")
- **Due dates** ("by tomorrow", "this week", "next Monday")
- **Contact names** and auto-assigns them
- **Priority** ("urgent", "ASAP", "important")
- **Task types** (outreach, client work, admin, etc.)

### Bulk Creation
Create multiple tasks in one sentence:
- "I need to email Spencer, call Jason, and draft the proposal"
  → Creates 3 separate tasks instantly

---

## 📋 Example Conversations

### Scenario 1: Simple Task Creation
**You:** "Create a task to email Spencer"

**Jamie:** "✓ Created 1 task:
• Email Spencer - Outreach → Spencer

All set to go!"

**Behind the scenes:**
- Detected "email Spencer" = Outreach task type
- Found Spencer in contacts, auto-assigned
- Created task with status "To Do"

---

### Scenario 2: Multiple Tasks with Details
**You:** "I need to call Jason (15 mins), email the NHC team about the curriculum (30 mins), and schedule Sophie using her link"

**Jamie:** "✓ Created 3 tasks:
• Call Jason (15 mins) - Networking → Jason
• Email the NHC team about the curriculum (30 mins) - Outreach  
• Schedule Sophie using her link - Scheduling – use their link → Sophie

All set to go!"

**Behind the scenes:**
- Parsed 3 separate tasks
- Extracted time estimates (15, 30 mins)
- Auto-detected task types (networking, outreach, scheduling)
- Assigned contacts where names were mentioned

---

### Scenario 3: With Due Dates and Priority
**You:** "Add urgent task: send proposal to BiteLabs by Friday (45 mins)"

**Jamie:** "✓ Created 1 task:
• Send proposal to BiteLabs by Friday (45 mins) - Client Work

All set to go!"

**Behind the scenes:**
- Set priority: high (from "urgent")
- Set due date: next Friday
- Estimated time: 45 minutes
- Task type: client_work

---

### Scenario 4: Complex Multi-Task Request
**You:** "Spencer follow-up: send thank you email (10 mins), schedule coffee chat using his link (15 mins), draft collaboration proposal (1 hour)"

**Jamie:** "✓ Created 3 tasks:
• Send thank you email (10 mins) - Outreach → Spencer
• Schedule coffee chat using his link (15 mins) - Scheduling – use their link → Spencer
• Draft collaboration proposal (60 mins) - Client Work → Spencer

All set to go!"

**Behind the scenes:**
- Recognized all 3 tasks relate to Spencer
- Auto-assigned Spencer to all tasks
- Converted "1 hour" to 60 minutes
- Detected different task types for each

---

## 🧠 Task Type Auto-Detection

Jamie automatically categorizes tasks based on keywords:

| Task Type | Keywords | Example |
|-----------|----------|---------|
| **Outreach** | email, reach out, follow up, touch base | "Email Spencer" |
| **Networking** | coffee chat, intro call, connect | "Schedule intro call with Jason" |
| **Client Work** | deliverable, draft proposal, project | "Draft proposal for BiteLabs" |
| **Admin** | organize, update, file, paperwork | "Update contact list" |
| **Scheduling (their link)** | use their link, his link, Calendly | "Schedule Sophie using her link" |
| **Scheduling (my link)** | send my link, share my availability | "Send my scheduling link to Jason" |
| **Scheduling (email)** | email to schedule, scheduling email | "Send scheduling email to NHC team" |
| **CPP** | chronic pain project, board | "Prep for CPP board meeting" |
| **Personal** | pharmacy, doctor, medical, appointment | "Pick up prescription" |

---

## 📅 Due Date Parsing

Jamie understands natural language dates:

| You Say | Jamie Interprets |
|---------|------------------|
| "by today" | Today's date |
| "by tomorrow" | Tomorrow's date |
| "this week" | End of this week (Sunday) |
| "next week" | End of next week (Sunday) |
| "by Friday" | Next Friday |
| "next Monday" | Specific day next week |

---

## ⏱️ Time Estimate Parsing

Jamie extracts time estimates from your phrasing:

| You Say | Time Estimate |
|---------|--------------|
| "email Spencer (10 mins)" | 10 minutes |
| "draft proposal (1 hour)" | 60 minutes |
| "write article (2 hours)" | 120 minutes |
| "quick call (15 mins)" | 15 minutes |

---

## 👥 Contact Auto-Assignment

When you mention a contact name, Jamie:
1. Searches your contacts for a match
2. Auto-assigns if found
3. Creates task anyway if contact doesn't exist (no error)

**Examples:**
- "Email Spencer" → Finds Spencer Mitchell, assigns
- "Call Jason" → Finds Jason from BiteLabs, assigns
- "Follow up with Sophie" → Finds Sophie from Chronically Me, assigns

---

## 🚦 Permission Level: LOW-RISK (Auto-Execute)

Task creation is considered **safe**, so Jamie:
- ✅ Creates tasks immediately (no confirmation needed)
- ✅ Just confirms what was created
- ✅ Handles errors gracefully

This is different from higher-risk actions like:
- ⚠️ Deleting tasks (would require confirmation)
- ⚠️ Creating calendar events (Phase 3 - requires confirmation)

---

## 💡 Pro Tips

### 1. Be Conversational
Jamie understands natural language:
- ✅ "I need to email Spencer"
- ✅ "Remind me to call Jason"
- ✅ "Create task: draft proposal"
- ✅ "Add to my list: schedule meeting"

### 2. Include Details Inline
Put time/dates right in the request:
- "Email Spencer (10 mins)"
- "Call Jason by Friday"
- "Draft proposal by next week (2 hours)"

### 3. Batch Similar Tasks
Group related tasks together:
- "Spencer follow-up: email, call, send proposal"
- "BiteLabs tasks: update curriculum, schedule call, invoice"

### 4. Use Contact Names
Mention names for auto-assignment:
- "Email Spencer" (better)
- vs "Email about collaboration" (no contact)

### 5. Be Specific About Task Type
Help Jamie categorize correctly:
- "Send my scheduling link" → Scheduling (my link)
- "Use their Calendly" → Scheduling (their link)
- "Email to schedule" → Scheduling (email)

---

## 🐛 Troubleshooting

### "Created 0 tasks"
**Cause**: Jamie couldn't parse any valid tasks from your message.
**Solution**: Try being more explicit:
- ❌ "I should probably do the thing"
- ✅ "Create task to do the thing"

### Contact wasn't assigned
**Cause**: Name doesn't exactly match a contact, or name wasn't mentioned in task-related context.
**Solution**: 
- Check contact name spelling
- Add contact first, then create task
- Or manually assign after creation

### Wrong task type detected
**Cause**: Keywords triggered a different category.
**Solution**: 
- Manually change task type in Tasks page
- Or be more specific in your request next time

### Time estimate not recognized
**Cause**: Format wasn't clear.
**Solution**: Use parentheses with units:
- ✅ "Draft proposal (45 mins)"
- ✅ "Write article (2 hours)"
- ❌ "Draft proposal takes about 45"

---

## 🎯 What's Next

### Phase 2B: Task Management (Coming Soon)
- Mark tasks as complete: "Mark Spencer email as done"
- Update tasks: "Move proposal task to next week"
- Delete tasks: "Remove the old follow-up task"
- Bulk operations: "Mark all Spencer tasks as complete"

### Phase 3: Scheduling Write Access (After Content)
- Create calendar events with confirmation
- Block focus time
- Suggest optimal meeting times

---

## 📊 How It Works (Technical)

### Detection → Parsing → Creation

1. **Intent Detection**
   - Jamie scans your message for task-related patterns
   - Identifies action type (create, update, complete, delete, list)

2. **Natural Language Parsing**
   - Splits message by delimiters (commas, "and")
   - Extracts task title, time, date, contact, priority
   - Cleans up formatting

3. **Task Type Detection**
   - Matches title keywords against task type definitions
   - Assigns most confident match

4. **Contact Matching**
   - Searches contacts by name (case-insensitive, partial match)
   - Assigns if found, skips if not

5. **Server Creation**
   - Calls `/make-server-a89809a8/tasks` endpoint
   - Creates each task individually
   - Returns created task with full details

6. **Confirmation**
   - Formats response with task details
   - Shows task type, contact, time estimate
   - Triggers refresh of Tasks page

---

## 🎓 Remember

Jamie is evolving from **assistant → agent**:
1. ✅ **Read-Only Scheduling** (Phase 1) - Check calendar, answer questions
2. ✅ **Task Creation** (Phase 2 - NOW!) - Create tasks from natural language
3. 🔄 **Content Write Access** (Next) - Save drafts, update content stages
4. 🔮 **Scheduling Write Access** (Phase 3) - Create calendar events

Each phase adds more **autonomy** while maintaining **safety** through permission levels.

---

## 📝 Quick Reference

### Supported Patterns:
- "Create task to [action]"
- "I need to [task 1], [task 2], and [task 3]"
- "Remind me to [action]"
- "Add task: [description]"
- "[Contact] follow-up: [task list]"

### Metadata Extraction:
- **Time**: (10 mins), (1 hour), (45 minutes)
- **Date**: by today, tomorrow, Friday, this week, next week
- **Priority**: urgent, ASAP, important
- **Contact**: Names after verbs (email Spencer, call Jason)

### Auto-Detected Task Types:
Outreach, Networking, Client Work, Admin, CPP, Personal, Business Development, 3 Scheduling Types

---

Ready to let Jamie handle your task creation? Just ask her to create tasks like you would a real assistant! 🚀
