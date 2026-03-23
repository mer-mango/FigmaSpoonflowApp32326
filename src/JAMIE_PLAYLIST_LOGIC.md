# 🎯 Jamie's Smart Playlist Generation

## **How Jamie Organizes Your To-Do Tasks**

When you open "Plan My Day," Jamie doesn't just dump all your tasks into one list. She intelligently organizes them into themed playlists based on **6 key parameters**.

---

## **📊 The 6 Parameters (In Priority Order)**

### **1. URGENCY** 🔥
**Most Important Factor**

Jamie calculates an "urgency score" for each task:

| Status | Score | Example |
|--------|-------|---------|
| **Overdue** | 100+ | "Report due yesterday" = 110 points |
| **Due Today** | 70-90 | "Send proposal by 5pm" = 90 points |
| **Due Tomorrow** | 60 | "Prep for meeting" = 60 points |
| **Due This Week** | 40 | "Review designs" = 40 points |
| **No Due Date** | 10 | "Organize files" = 10 points |

**Modifiers:**
- Flagged task: +50 points
- In progress: +30 points
- Awaiting reply: +20 points

---

### **2. TASK TYPE** 📝
**For Grouping Into Playlists**

Jamie automatically detects task types and groups them:

| Playlist | Task Types | Auto-Detection |
|----------|-----------|----------------|
| **Content Creation** | LinkedIn posts, newsletters, blog posts | Based on task type OR keywords like "write", "draft", "post" |
| **Nurture Outreach** | Follow-ups, relationship building | Has contact OR keywords "follow up", "reach out", "check in" |
| **Quick Wins** | Admin tasks < 15 min | Admin type + short duration |
| **Focus Time** | Deep work, long tasks (60+ min) | Task type OR estimated time > 60 min |
| **Task Time** | Everything else | Default category |

---

### **3. TIME ESTIMATES** ⏱️
**Uses Jamie's Learning**

- **First time creating a task:** Uses your estimate (default 30 min)
- **After completing similar tasks:** Jamie uses learned average
  - Example: If you've completed 5 "nurture-email" tasks averaging 20 minutes, Jamie automatically suggests 20 min for new nurture emails
- **Short tasks (< 15 min):** Grouped for momentum building
- **Long tasks (> 60 min):** Get dedicated focus blocks

---

### **4. ENERGY ALIGNMENT** ⚡
**Sequences Playlists Based on Your Energy**

#### **High Energy Day:**
1. Focus Time (tackle hardest work first)
2. Content Creation (creative work while fresh)
3. Nurture Outreach
4. Task Time
5. Quick Wins (save easy stuff for later)

#### **Medium Energy Day:**
1. Task Time (solid work)
2. Content Creation
3. Nurture Outreach
4. Focus Time (if manageable)
5. Quick Wins

#### **Low Energy Day:**
1. Quick Wins (build momentum)
2. Task Time
3. Nurture Outreach
4. Content Creation (if energy permits)
5. Focus Time (deprioritized)

---

### **5. FLAGGED STATUS** ⭐
**Within Each Playlist**

- Flagged tasks always appear first in their playlist
- Gets +50 urgency points
- Visual star indicator

---

### **6. CONTACT RELATIONSHIPS** 👤
**Reduces Context Switching**

- Tasks for the same contact are grouped together
- Example: "Email Sarah" and "Review Sarah's proposal" appear consecutively
- Helps maintain relationship context

---

## **🧠 How It All Works Together**

### **Step 1: Filtering**
- Remove archived tasks
- Remove completed tasks

### **Step 2: Scoring**
- Calculate urgency score for each task
- Identify task type
- Update time estimates with learned data

### **Step 3: Grouping**
- Group tasks into playlist categories
- Sort within each playlist by:
  1. Urgency score (highest first)
  2. Flagged status (flagged first)
  3. Estimated time (shorter first for momentum)

### **Step 4: Sequencing**
- Reorder playlists based on your energy level
- Apply energy-specific prioritization

### **Step 5: Trimming (Optional)**
- If you specify available time, trim tasks to fit
- Respects playlist priority order
- Prevents overloading your schedule

---

## **💡 Jamie's Smart Recommendations**

After generating playlists, Jamie analyzes the workload:

| Condition | Jamie Says |
|-----------|------------|
| Total time > 6 hours | "This is a lot to tackle. Consider moving some tasks to tomorrow." |
| Total time < 2 hours | "You have a light task load today. Good time for deep work or learning." |
| Focus playlist > 90 min | "Block calendar time for your focus work to protect it from interruptions." |
| 3+ urgent tasks | "You have X urgent items. Tackle these first." |

---

## **📈 Integration with Time Learning**

### **The Learning Cycle:**

```
Task Created → Play Button Pressed → Work on Task → Mark Done → 
Jamie Records Actual Time → Calculates Average → Uses for Future Tasks
```

### **Example:**

1. **Monday:** Create "Draft nurture email" (estimate: 30 min) → actual: 20 min
2. **Tuesday:** Create "Draft nurture email" (estimate: 30 min) → actual: 22 min  
3. **Wednesday:** Create "Draft nurture email" (estimate: 30 min) → actual: 18 min
4. **Thursday:** Jamie calculates average = 20 min
5. **Friday:** Create new "Draft nurture email" → **Jamie auto-suggests: 20 min** ✨

### **Benefits:**
- ✅ More accurate time estimates over time
- ✅ Better daily planning with realistic timeframes
- ✅ Jamie gets smarter the more you use her
- ✅ Playlist time totals become more accurate

---

## **🎨 Visual Example**

### **Your Tasks Before Jamie:**
```
❌ Random list of 15 tasks
❌ No clear priorities
❌ Overwhelming
❌ Don't know where to start
```

### **Your Tasks After Jamie:**
```
✅ Quick Wins (3 tasks, 35 min total)
   • Approve expense report (10 min) ⭐
   • Update calendar (15 min)
   • Reply to vendor email (10 min)

✅ Focus Time (2 tasks, 120 min total)
   • Draft Q1 strategy doc (90 min) ⭐
   • Deep dive: competitor analysis (30 min)

✅ Content Creation (2 tasks, 45 min total)
   • Write LinkedIn post (20 min) ⭐
   • Draft newsletter outline (25 min)

✅ Nurture Outreach (3 tasks, 60 min total)
   • Follow up with Sarah (20 min) ⭐
   • Check in: Tom Anderson (20 min)
   • Send thank you note (20 min)

✅ Task Time (5 tasks, 90 min total)
   • Review client proposals (30 min) ⭐
   • Update project tracker (15 min)
   • Schedule team meetings (15 min)
   • etc...
```

**Total: 5 playlists, 15 tasks, 350 min (5h 50m)**

Jamie: "This is a full day! I've prioritized your flagged items and grouped similar work together. Focus Time is first since you indicated high energy."

---

## **🔧 For Developers**

### **Core Files:**
- `/utils/jamiePlaylistGenerator.ts` - Main logic
- `/utils/jamieTimeEstimates.ts` - Learning system
- `/components/today/AMWizard.tsx` - UI integration

### **Key Functions:**
```typescript
// Generate playlists from tasks
generateSmartPlaylists(tasks, {
  energyLevel: 'high' | 'medium' | 'low',
  availableTime: 360, // minutes
  prioritizeDueToday: true,
  respectLearnedPatterns: true
})

// Get summary of generated playlists
getPlaylistGenerationSummary(playlists)

// Get Jamie's learned estimate for a task type
getSmartTimeEstimate('nurture-email', 30)
```

### **Data Storage:**
- Playlists: Generated fresh each planning session (not stored)
- Time learning data: `localStorage` under `jamie_learned_time_estimates`
- Completion history: `localStorage` under `jamie_task_completion_history`

---

## **🎯 The Result**

Instead of staring at a long, overwhelming task list, you get:
1. **Clear priorities** (urgent items bubble up)
2. **Grouped context** (similar work together)
3. **Energy-matched sequencing** (right work at right time)
4. **Realistic time estimates** (based on your actual patterns)
5. **Actionable playlists** (know exactly where to start)

**Jamie doesn't just organize your tasks. She creates your optimal workday.**
