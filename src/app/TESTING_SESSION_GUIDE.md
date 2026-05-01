# Jamie Tasks Testing Session - Live Guide

## ✅ **READY TO TEST!**

Everything is now integrated. Let's test Jamie's task creation capabilities step-by-step.

---

## 🎯 **Test Plan**

### **Test 1: Simple Single Task**
Open Jamie (click the sparkle ✨ icon in the sidebar) and type:
```
Create a task to email Spencer
```

**What to look for:**
- ✅ Jamie shows "Creating 1 task..."
- ✅ Jamie responds with "✓ Created 1 task:"
- ✅ Shows: "• Email Spencer - Outreach → Spencer Mitchell"
- ✅ Toast notification appears
- ✅ Go to Tasks page - task appears in list
- ✅ Task has Outreach task type (muted rose color)
- ✅ Spencer Mitchell is assigned as contact

**Screenshot this if it works!**

---

### **Test 2: Multiple Tasks**
Type in Jamie:
```
I need to call Jason, email Sarah, and schedule Sophie
```

**What to look for:**
- ✅ Jamie shows "Creating 3 tasks..."
- ✅ Jamie lists all 3 tasks created
- ✅ Each task has appropriate type:
  - Call Jason → Networking
  - Email Sarah → Outreach
  - Schedule Sophie → Admin or Outreach
- ✅ All 3 appear in Tasks page
- ✅ Contacts assigned if they exist in your system

---

### **Test 3: With Time Estimates**
Type:
```
Create task: email Spencer (10 mins) and draft proposal for NHC (45 mins)
```

**What to look for:**
- ✅ 2 tasks created
- ✅ First task shows "(10 mins)"
- ✅ Second task shows "(45 mins)"
- ✅ In Tasks page, tasks show time estimates
- ✅ Task types: Outreach, Client Work

---

### **Test 4: Complex Request with Details**
Type:
```
Spencer follow-up: send thank you email (10 mins), schedule coffee chat using his link (15 mins), draft collaboration proposal (1 hour)
```

**What to look for:**
- ✅ 3 tasks created
- ✅ All assigned to Spencer Mitchell
- ✅ Time estimates: 10, 15, 60 mins (note: 1 hour → 60 mins)
- ✅ Task types:
  - Thank you email → Outreach
  - Schedule using his link → Scheduling – use their link
  - Draft proposal → Client Work

---

### **Test 5: With Due Date**
Type:
```
Remind me to follow up with Jason by tomorrow
```

**What to look for:**
- ✅ Task created
- ✅ Due date = tomorrow's date
- ✅ Task appears in Tasks page
- ✅ Filter by "Due Tomorrow" shows it

---

### **Test 6: Bulk Creation (5+ tasks)**
Type:
```
Create tasks: email Spencer, call Jason, message Sarah, schedule Sophie, follow up with Dan
```

**What to look for:**
- ✅ All 5 tasks created
- ✅ No confirmation dialog (low-risk = auto-execute)
- ✅ Each task has appropriate type and contact
- ✅ All appear in Tasks page

---

## 🐛 **If Something Doesn't Work**

### **Error: "Sorry, I had trouble creating those tasks"**
**Check:**
1. Open browser console (F12)
2. Look for error messages
3. Check Network tab for failed POST requests to `/tasks`

### **Tasks created but don't show contact**
**This is OK!** It means:
- Contact name was mentioned but not found in your contacts
- Task still created successfully
- You can manually assign contact later

### **Wrong task type detected**
**This is expected sometimes!** 
- Task type detection is keyword-based (~80% accuracy)
- You can manually change task type in Tasks page
- Still counts as success if task was created

### **Jamie doesn't detect task request**
**Try being more explicit:**
- ❌ "I should probably do the thing"
- ✅ "Create task to do the thing"
- ✅ "I need to X, Y, and Z"
- ✅ "Remind me to X"

---

## 📊 **Success Metrics**

After testing, check:
- [ ] Simple task creation works
- [ ] Multiple tasks work
- [ ] Time estimates extracted correctly
- [ ] Contacts auto-assigned when possible
- [ ] Task types auto-detected
- [ ] Due dates parsed from natural language
- [ ] Tasks appear in Tasks page immediately
- [ ] Toast notifications show
- [ ] No JavaScript errors in console

---

## 🎉 **BONUS: Test Scheduling Too!**

Since we also built Scheduling Jamie, try:
```
Do I have any openings this week?
```

**What to look for:**
- ✅ Jamie checks your calendar
- ✅ Shows Wednesday/Thursday slots (1-3:30pm ET)
- ✅ Lists times with meetings already booked
- ✅ Total count at bottom

---

## 📝 **Report Back**

After testing, let me know:
1. Which tests **passed** ✅
2. Which tests **failed** ❌
3. Any **errors** you saw (paste console output)
4. Any **unexpected behavior**
5. What you **loved** about it 💖
6. What **needs work** 🔧

Then we can:
- Fix any bugs discovered
- Refine the parsing logic
- Tune the task type detection
- Add more natural language patterns
- Move on to Content Jamie next!

---

## 🚀 **Ready? Start Testing!**

1. Open your SpoonFlow app
2. Click the sparkle ✨ icon (Jamie)
3. Start with Test 1: "Create a task to email Spencer"
4. Work through the tests
5. Report back with results!

**Let's see Jamie in action!** 🎯✨
