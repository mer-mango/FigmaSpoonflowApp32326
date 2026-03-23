# Jamie's Energy-Based Intelligence System

## Overview
Jamie now takes your energy level into account when planning your day, both for routine recommendations and task playlist generation.

---

## How Energy Levels Work

### 1. Energy Level Scale
You report your energy on a 4-point scale during the AM Wizard:
- **Negative** - Extremely low energy (value: 0)
- **Low** - Below average energy (value: 1)
- **Medium** - Normal energy (value: 2)
- **High** - Peak energy (value: 3)

### 2. Routine Energy Requirements
Each routine you've configured has an energy requirement:
- **Low energy required** - Simple tasks (e.g., Break, Lunch)
- **Medium energy required** - Standard work (e.g., AM Admin, PM Admin)
- **High energy required** - Deep work (e.g., Content Creation, Strategy)

---

## Jamie's Smart Recommendations

### Routine Selection (Step 3 of AM Wizard)
Jamie automatically recommends routines based on:

**Core Routines (Always Recommended):**
- Plan My Day
- AM Admin
- PM Admin
- Wind Down
- Lunch
- Break
- Task Time
- Nurtures

**Optional Routines (Energy-Dependent):**
Only recommended if:
1. Your energy level ≥ routine's required energy
2. AND the routine is marked as Priority 1

**Example:**
- You report "Low" energy
- "Content Creation" routine requires "High" energy
- Jamie won't recommend it (even if it's Priority 1)
- But "Break" requires "Low" energy → Jamie recommends it

---

## Task Playlist Prioritization

### High Energy Day
When you report **High** energy, Jamie prioritizes playlists in this order:

1. **Quick Wins** (Priority 3) - Get easy wins to build momentum
2. **Content Creation** (Priority 2) - Tackle creative work while fresh
3. **Nurture Outreach** (Priority 3) - Relationship building
4. **Task Time** (Priority 2) - General tasks

### Medium Energy Day
When you report **Medium** energy:

1. **Task Time** (Priority 2) - Solid work
2. **Content Creation** (Priority 2) - If creative work is needed
3. **Quick Wins** (Priority 3) - Administrative tasks
4. **Nurture Outreach** (Priority 3) - Outreach work

### Low Energy Day
When you report **Low** energy:

1. **Quick Wins** (Priority 1) - Easy administrative tasks first
2. **Task Time** (Priority 2) - Simpler general tasks
3. **Nurture Outreach** (Priority 3) - If manageable
4. **Content Creation** (Priority 5) - Deprioritized (requires more energy)

---

## Implementation Details

### In the AM Wizard
```typescript
// Jamie passes your energy level to the playlist generator
const playlists = generateSmartPlaylists(tasks, {
  energyLevel: energyLevel || 'medium', // Your reported energy
  prioritizeDueToday: true,             // Urgent tasks first
  respectLearnedPatterns: true          // Use learned time estimates
});
```

### Playlist Priority System
Each playlist type gets a dynamic priority based on your energy:

```typescript
// Quick Wins
priority: energyLevel === 'low' ? 1 : 3

// Content Creation  
priority: energyLevel === 'high' ? 2 : 
          energyLevel === 'medium' ? 2 : 5

// Task Time
priority: 2 (consistent across energy levels)

// Nurture Outreach
priority: 3 (consistent across energy levels)
```

---

## What This Means for You

### ✅ Jamie Will:
- **Recommend lighter routines** when you're low energy
- **Prioritize creative work** when you're high energy
- **Suggest quick wins first** when you're tired
- **Respect your capacity** by not overloading you

### ❌ Jamie Won't:
- Force high-energy routines on low-energy days
- Recommend content creation when you're exhausted
- Ignore your energy signal when planning your day
- Treat all days the same regardless of how you feel

---

## Future Enhancements

Potential improvements to energy-based planning:
- **Learn your energy patterns** over time (e.g., "You're usually high energy on Mondays")
- **Suggest energy-boosting activities** when you report low energy
- **Adjust meeting recommendations** based on energy
- **Track correlation** between energy level and task completion rates
- **Recommend optimal task ordering** based on when your energy typically peaks

---

## User Controls

You maintain full control:
- **Override recommendations** - Select any routine regardless of Jamie's suggestion
- **Reorder playlists** - Drag tasks to match your preference
- **Adjust task types** - Reclassify tasks to change their energy requirements
- **Skip routines** - Even core routines can be deselected if needed

Jamie's recommendations are **suggestions based on your energy**, not requirements!
