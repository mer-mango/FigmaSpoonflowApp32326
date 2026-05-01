# Jamie's Scheduling Intelligence - User Guide

## 🎉 What's New

Jamie can now **check your Google Calendar** and answer scheduling questions in real-time! This is the first phase of making Jamie more action-oriented.

---

## ✅ What Jamie Can Do NOW (Read-Only)

### Check Your Availability
Ask Jamie questions like:
- "When's my next opening?"
- "Do I have any slots this week?"
- "Can I fit another meeting Thursday?"
- "Show me my availability for next week"
- "How many open slots do I have this month?"

### Smart Recommendations
Jamie knows your scheduling rules and energy patterns:
- **Wednesdays and Thursdays** only
- **1:00-3:30 PM Eastern Time** window
- **30-minute meetings** with 30-minute buffers
- **Max 2 meetings per day**

She'll recommend the **best times** based on:
- Your peak focus window (2:00 PM)
- Current meeting load
- Energy recovery needs

---

## 📋 Example Conversations

### Scenario 1: Quick Availability Check
**You:** "Do I have any openings this week?"

**Jamie:** "Here's your availability for this week:

**Wednesday**:
• 1:00 PM (0 of 2 meetings already booked)
• 2:00 PM (0 of 2 meetings already booked)

**Thursday**:
• 1:00 PM (1 of 2 meetings already booked)
• 2:00 PM (1 of 2 meetings already booked)

Total: 4 open slots (30 min each, with 30 min buffer)"

---

### Scenario 2: Strategic Scheduling
**You:** "When should I schedule the NHC team call?"

**Jamie:** "Based on your energy patterns and existing schedule:

🎯 **BEST**: Wednesday 2:00-2:30 PM
- You have no meetings Wednesday (fresh energy)
- 2pm is your peak focus/clarity window
- Leaves morning free for deep work

✅ **ALTERNATIVE**: Thursday 2:00-2:30 PM
- You already have Spencer at 1pm Thursday
- Back-to-back meetings might be draining
- But keeps Friday completely meeting-free

Which do you prefer?"

---

### Scenario 3: Protective Scheduling
**You:** "Can I squeeze in another meeting Thursday?"

**Jamie:** "You're already at your 2-meeting max for Thursday:
• 1:00-1:30 PM - Spencer strategy call
• 2:00-2:30 PM - NHC team discussion

Based on your energy intelligence, you typically need recovery time after 2 meetings in one afternoon.

Options:
1. Move one meeting to Wednesday (you have 2 open slots)
2. Book them for next week (Wednesday has 2 openings)
3. Decline and send them your scheduling link

What works best?"

---

## 🔧 Technical Details

### Your Scheduling Rules
Jamie reads these from your Google Calendar appointment schedule:
- **Meeting Days**: Wednesday, Thursday
- **Meeting Hours**: 1:00 PM - 3:30 PM ET
- **Duration**: 30 minutes
- **Buffer**: 30 minutes after each meeting
- **Max/Day**: 2 meetings
- **Timezone**: America/New_York (Eastern)

### How It Works
1. You ask Jamie a scheduling question
2. Jamie detects it's a scheduling query
3. She calls your Google Calendar API
4. She analyzes your existing meetings
5. She calculates available slots based on your rules
6. She presents options with strategic recommendations

---

## ⚠️ Current Limitations (Phase 1 - Read-Only)

Jamie **CAN'T** do these yet (coming in Phase 3B):
- ❌ Create calendar events
- ❌ Block focus time
- ❌ Send meeting invites
- ❌ Reschedule meetings
- ❌ Cancel meetings

For now, Jamie will:
- ✅ Tell you when you're available
- ✅ Recommend optimal times
- ✅ Explain why certain times are better
- ✅ Count your available slots
- ✅ Warn you about scheduling conflicts

You still need to **create the actual calendar event yourself** (or send your scheduling link to the person).

---

## 🎯 What's Next

### Phase 2: Tasks Jamie (Next Up)
Coming soon:
- Create tasks from natural language
- Update task properties
- Break down complex tasks into subtasks
- Assign tasks to contacts

### Phase 3: Scheduling Jamie (Write Access)
After tasks:
- Create calendar events (with confirmation)
- Block focus time
- Suggest optimal times based on energy patterns
- Draft decline messages

---

## 🐛 Troubleshooting

### "I can't check your calendar because it's not connected"
**Solution**: Connect your Google Calendar in Settings first.

### Jamie shows the wrong slots
**Solution**: 
1. Check your Google Calendar appointment schedule settings
2. Make sure you've selected which calendars to sync in Settings
3. Jamie reads from your configured appointment schedule (Wed/Thu 1-3:30pm ET)

### Jamie says I have slots but I see meetings in my calendar
**Solution**: Jamie only reads from **selected calendars**. Check Settings → Calendar to ensure all relevant calendars are selected.

---

## 💡 Pro Tips

### 1. Use Natural Language
Jamie understands conversational requests:
- "What's my schedule look like next week?"
- "Can I fit a 1-hour call this week?" (she'll adjust the duration)
- "Am I free tomorrow?"
- "How booked am I in March?"

### 2. Ask for Strategic Advice
Don't just ask "when am I free?" - ask:
- "When should I schedule [person] considering my energy?"
- "What's the best time for a high-stakes meeting?"
- "Can I fit another meeting without burning out?"

### 3. Combine with Other Jamie Features
- "Check my availability and create a task to email Spencer"
- "When's my next opening? I need to schedule the BiteLabs call"
- "Show my slots this week and remind me about Jason's curriculum deadline"

---

## 📊 How Your Capacity Works

### Weekly Maximum: 4 Meeting Slots
- **Wednesday**: 2 slots (1pm, 2pm)
- **Thursday**: 2 slots (1pm, 2pm)

### Each Slot = 60 Minutes Total
- 30 min meeting
- 30 min buffer (for notes, recovery, transition)

### Peak Performance Time
**Wednesday 2:00 PM** = Your optimal slot:
- Peak focus/clarity window
- No prior meetings to drain you
- Full recovery time after

### Recovery Needs
After 2 meetings in one day:
- You typically need more recovery time
- Jamie will recommend spreading meetings across both days when possible
- She'll warn you if you're trying to overbook

---

## 🎓 Remember

This is **Phase 1** of making Jamie more autonomous:
1. ✅ **Read-Only Scheduling** (NOW) - Jamie can see your calendar and answer questions
2. 🔄 **Content & Tasks Write Access** (NEXT) - Jamie can save drafts, create tasks
3. 🔮 **Scheduling Write Access** (FUTURE) - Jamie can create calendar events (with confirmation)

Jamie is learning to **act on your behalf**, starting with the safest, most helpful capabilities first.

---

## 📝 Feedback & Questions

As you use Jamie's scheduling intelligence:
- Note which responses are most helpful
- Share examples of questions she doesn't understand yet
- Let me know if her strategic recommendations match your needs
- Report any bugs or incorrect slot calculations

This is **version 1** - your feedback will shape how Jamie's scheduling intelligence evolves! 🚀
