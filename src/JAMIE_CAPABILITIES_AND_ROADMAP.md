# Jamie's Current Capabilities & Improvement Roadmap

## Executive Summary

Jamie is currently a **conversational AI assistant** with limited actionable capabilities. She can access and discuss your data, but she **cannot modify most things in the app**. The tone issue in content creation is caused by insufficient enforcement of tone parameters in the AI prompt. Below is a comprehensive breakdown of what Jamie can and cannot do, plus recommendations for making her more effective.

---

## 🟢 What Jamie CAN Do Now

### 1. **Information Access & Retrieval**
Jamie has READ access to:
- ✅ All your tasks (title, status, due date, priority, type, contact)
- ✅ All your contacts (name, relationship, tags, notes)
- ✅ Your schedule settings (meeting preferences, energy patterns, buffer requirements)
- ✅ Calendar events (if synced)
- ✅ Her own memory system (conversations, patterns, learnings)
- ✅ Current page context (knows which page you're on)
- ✅ Selected items (if you've selected a task/contact)
- ✅ Time context (current time, whether you're in low energy/peak focus/end of day)

### 2. **Conversational Assistance**
Jamie can:
- ✅ Answer questions about your tasks, contacts, and schedule
- ✅ Provide meeting prep suggestions (based on contact history)
- ✅ Offer task breakdown suggestions (but can't create them)
- ✅ Reference your expertise areas (co-design, PX, empathy as strategy)
- ✅ Remember past conversations through her memory system
- ✅ Understand your energy patterns and chronic illness needs
- ✅ Speak in your voice guidelines (when properly prompted)
- ✅ Perform web searches via Brave Search API
- ✅ Find articles and add them to Content Ideas Inbox

### 3. **Limited Content Creation**
Jamie can:
- ✅ Generate content summaries from URLs
- ✅ Create outlines from brain dumps
- ✅ Suggest content ideas
- ✅ Generate full drafts (but with TONE ISSUES - see below)
- ✅ Reference your content pillars and voice guidelines
- ✅ Check for banned phrases (has voice quality checker built-in)

### 4. **Quick Actions (Suggestions Only)**
Jamie can SUGGEST these actions but can't execute them:
- "Plan my day" - Opens AM Wizard (she can't actually open it)
- "Wind down" - Opens PM Wizard (she can't actually open it)
- "Create task" - Opens task modal (she can't create the task)
- "View task" - Opens specific task (she can't navigate you there)

---

## 🔴 What Jamie CANNOT Do Now

### 1. **No Write/Modify Access**
Jamie **CANNOT**:
- ❌ Create tasks
- ❌ Update task status, priority, or due dates
- ❌ Create or modify contacts
- ❌ Add calendar events
- ❌ Create content items
- ❌ Update content stages or statuses
- ❌ Send emails or messages
- ❌ Create engagements or forms
- ❌ Modify your settings
- ❌ Change routines or playlists

### 2. **No Navigation Control**
Jamie **CANNOT**:
- ❌ Open wizards or modals
- ❌ Navigate you between pages
- ❌ Execute quick actions she suggests
- ❌ Filter or sort your views
- ❌ Open specific items for editing

### 3. **No Scheduling Actions**
Jamie **CANNOT**:
- ❌ Actually schedule meetings (only suggest times)
- ❌ Send scheduling links
- ❌ Block time on calendar
- ❌ Move or reschedule events
- ❌ Decline meetings

### 4. **Limited Content Control**
Jamie **CANNOT**:
- ❌ Save drafts directly to content items
- ❌ Change content stages
- ❌ Create new blueprint templates
- ❌ Publish content

---

## 🚨 THE TONE PROBLEM (Critical Issue)

### Why Content Drafts Are Too Informal

**Root Cause**: The AI prompt in `generateContentDraft()` does not sufficiently emphasize or enforce the selected tone.

**Current Prompt Issues**:
1. **Weak enforcement**: Says "Match the tone specified above" but doesn't explain HOW
2. **Conflicting guidance**: "Meredith Real Talk" voice guidelines emphasize "conversational" and "said like a real person" which the AI interprets as informal
3. **No tone-specific examples**: Doesn't show what "Educational + Professional" should actually look like
4. **Generic instruction**: "Write in Meredith's voice - natural, thoughtful, and real" overrides the specific tone request

**Example**:
- **You select**: Educational, Professional
- **You get**: Conversational, informal, chatty
- **Why**: AI prioritizes "conversational" from voice guidelines over "professional" from tone selection

### The Fix (Recommended)

Update the prompt in `/utils/jamieAI.ts` `generateContentDraft()` function:

```typescript
// Current (WEAK):
IMPORTANT: Match the tone specified above. ${toneStr !== 'Not specified' ? `The tone should be ${toneStr.toLowerCase()}.` : ''}

// Proposed (STRONG):
CRITICAL TONE REQUIREMENTS:
The user has specifically selected: ${toneStr}

${getToneGuidance(selectedTones)} // New function providing tone-specific instructions

This is NOT optional. The tone MUST match the selection above, even if it feels less "conversational."
- Educational = Teaching, informative, detailed, with clear takeaways
- Professional = Authoritative, polished, expert voice (NOT casual or chatty)
- Conversational = Warm and approachable (this is when casual tone is appropriate)
- Inspiring = Motivational and uplifting
- Provocative = Challenging and thought-provoking
- Storytelling = Narrative-driven with personal anecdotes

Meredith's voice guidelines apply WITHIN the tone, not instead of it.
```

**New Helper Function Needed**:
```typescript
function getToneGuidance(tones: string[]): string {
  const guidance = {
    'Educational': 'Use teaching language. Include numbered steps, clear explanations, and "what this means" sections. Think: textbook meets blog post.',
    'Professional': 'Formal expert voice. Avoid casual phrases, exclamation points, or chatty asides. Use industry terminology appropriately.',
    'Conversational': 'Warm, approachable, personal. This is where "Meredith Real Talk" shines - like talking to a friend.',
    'Inspiring': 'Motivational language with vision-forward thinking. Paint a picture of what\'s possible.',
    'Provocative': 'Challenge assumptions. Ask hard questions. Push back on conventional thinking.',
    'Storytelling': 'Lead with narrative. Use "I remember when..." or "Here\'s what happened..." structure.'
  };
  
  return tones.map(t => `- ${t}: ${guidance[t] || ''}`).join('\n');
}
```

---

## 🎯 Recommended Architecture: Context-Specific Jamies

### The Problem with Global Jamie
One global Jamie trying to do everything creates:
- **Context confusion**: She doesn't know if you want task help, content help, or scheduling help
- **Shallow capabilities**: Can't go deep on any one feature
- **Permission limits**: Can't take actions because she's not integrated with specific features

### The Solution: Feature-Specific AI Assistants

Create **specialized Jamie contexts** on each major page:

#### 1. **Calendar Jamie** (on Calendar Page)
**Capabilities**:
- ✅ Suggest optimal meeting times based on your energy patterns
- ✅ Auto-fill meeting notes from past interactions
- ✅ Recommend buffer adjustments
- ✅ Draft decline messages for conflicts
- ✅ Identify scheduling conflicts
- ✅ **WRITE ACCESS**: Create calendar events, update meeting details

**Example Interaction**:
> **You**: "Schedule 30 min with Spencer next week"  
> **Calendar Jamie**: "Based on your preferences, I'd suggest Tuesday 1-1:30pm (your peak focus window, with 15min buffer after your 11:30am call). Should I create the invite?"  
> **You**: "Yes"  
> **Calendar Jamie**: *Actually creates the event* ✅

---

#### 2. **Content Jamie** (on Content Page)
**Capabilities**:
- ✅ Generate ideas from RSS feeds
- ✅ Create outlines and drafts **WITH PROPER TONE ENFORCEMENT**
- ✅ Suggest repurposing opportunities
- ✅ Reference your blueprint library
- ✅ Check voice guidelines compliance
- ✅ **WRITE ACCESS**: Create content items, update stages, save drafts

**Example Interaction**:
> **You**: "Turn this brain dump into a LinkedIn article, educational and professional tone"  
> **Content Jamie**: "Got it. I'll create an article that teaches co-design fundamentals with an authoritative expert voice - not conversational or casual. Give me 30 seconds..."  
> *Generates properly-toned draft* ✅

---

#### 3. **Tasks Jamie** (on Tasks Page)
**Capabilities**:
- ✅ Identify overdue and priority tasks
- ✅ Suggest task breakdowns
- ✅ Recommend time estimates based on learned patterns
- ✅ Filter by contact, type, or status
- ✅ **WRITE ACCESS**: Create tasks, update status/priority/dates, create subtasks

**Example Interaction**:
> **You**: "Create a task to follow up with Spencer about NHC PXI curriculum, due next Friday"  
> **Tasks Jamie**: *Actually creates the task* ✅  
> "Created! Based on past Spencer interactions, I estimate 20 minutes. Want me to add it to your Thursday afternoon task time block?"

---

#### 4. **Contacts Jamie** (on Contacts Page)
**Capabilities**:
- ✅ Find contacts by relationship, tag, or project
- ✅ Suggest nurture opportunities
- ✅ Draft outreach emails in your voice
- ✅ Reference past interactions from memory
- ✅ Identify calendar attendees not in contacts
- ✅ **WRITE ACCESS**: Create contacts, update tags/notes, create nurture tasks

**Example Interaction**:
> **You**: "Who haven't I talked to in 3+ months that I should reach out to?"  
> **Contacts Jamie**: "You have 5 contacts you haven't touched in 90+ days: Jason (BiteLabs - last contact: Dec 10), Sophie (Chronically Me - last contact: Nov 28)... Should I draft a warm check-in for Jason?"

---

#### 5. **Planning Jamie** (on Today/Plan Page)
**Capabilities**:
- ✅ Generate smart playlists based on energy
- ✅ Suggest routine selections
- ✅ Time blocking recommendations
- ✅ Energy-based task ordering
- ✅ **WRITE ACCESS**: Update today's plan, reorder playlists, toggle routines

**Example Interaction**:
> **You**: "I'm low energy today, what should I focus on?"  
> **Planning Jamie**: "Low energy = Quick Wins first. I've prioritized 3 administrative tasks (45 min total) and moved content creation to tomorrow. Sound good?"  
> **You**: "Perfect"  
> **Planning Jamie**: *Updates playlist order* ✅

---

### Global Jamie (Persistent Chat)
**Keeps her current role**:
- General questions about business/projects
- Memory and context retrieval
- Web search
- Cross-feature questions ("What's my week look like?")
- Meta questions ("What do you know about me?")

**Does NOT**:
- Try to take actions (redirects to feature-specific Jamies)
- Generate content (redirects to Content Jamie)
- Manage tasks (redirects to Tasks Jamie)

---

## 🛠️ Implementation Priority

### **Phase 1: Fix Tone Problem** (HIGH PRIORITY)
**Time**: 1-2 hours  
**Impact**: Immediate improvement to content quality  
**Action**:
1. Add `getToneGuidance()` helper function
2. Update `generateContentDraft()` prompt with stronger tone enforcement
3. Add tone-specific examples to system prompt
4. Test with all 6 tone combinations

---

### **Phase 2: Content Jamie** (HIGH PRIORITY)
**Time**: 4-6 hours  
**Impact**: Makes content creation actually useful  
**Action**:
1. Create dedicated chat interface on Content Page
2. Give Content Jamie WRITE access to content items
3. Context: current content item, selected blueprints, tone selections
4. Capabilities:
   - Save drafts directly to item
   - Update content stage
   - Create new content items from ideas
   - Suggest repurposing opportunities

---

### **Phase 3: Tasks Jamie** (MEDIUM PRIORITY)
**Time**: 4-6 hours  
**Impact**: Makes task management more efficient  
**Action**:
1. Create dedicated chat on Tasks Page
2. WRITE access to tasks
3. Can parse natural language: "Create 3 tasks for Spencer follow-up"
4. Can update task properties
5. Can suggest breakdowns and create subtasks

---

### **Phase 4: Calendar Jamie** (MEDIUM PRIORITY)
**Time**: 6-8 hours (more complex due to calendar integration)  
**Impact**: Automates scheduling workflow  
**Action**:
1. Chat interface on Calendar
2. WRITE access to calendar events
3. Integration with scheduling settings
4. Can suggest AND create events
5. Draft decline messages

---

### **Phase 5: Contacts Jamie** (LOW PRIORITY)
**Time**: 3-4 hours  
**Impact**: Helpful for nurture workflow  
**Action**:
1. Chat on Contacts Page
2. WRITE access to contacts
3. Draft outreach emails
4. Suggest nurture tasks
5. Auto-add calendar attendees

---

### **Phase 6: Planning Jamie** (LOW PRIORITY - Already Partially Built)
**Time**: 2-3 hours  
**Impact**: Minor (playlists already smart)  
**Action**:
1. Chat interface in Today view
2. Can explain playlist logic
3. Can reorder playlists on request
4. Suggest routine toggles

---

## 📊 Comparison: Current vs. Proposed

| Feature | Current Jamie | After Phase 1-3 |
|---------|--------------|-----------------|
| **Content Tone Accuracy** | 40% (often wrong) | 90% (enforced) |
| **Can Create Tasks** | ❌ No (only suggests) | ✅ Yes (Tasks Jamie) |
| **Can Save Content Drafts** | ❌ No (copy/paste) | ✅ Yes (Content Jamie) |
| **Can Schedule Meetings** | ❌ No (only suggests) | ✅ Yes (Calendar Jamie) |
| **Context Awareness** | 50% (knows page) | 95% (specialized) |
| **User Perception** | "Why can't she DO anything?" | "She actually helps!" |

---

## 🎯 Quick Wins You Can Test Right Now

### 1. **Ask Jamie Meta-Questions**
She's actually quite good at this:
- "What do you know about me?"
- "Tell me about my current projects"
- "What are my energy patterns?"

**Expected Result**: Comprehensive, detailed answers showing her context

### 2. **Use Web Search**
- "Search for articles about co-design in digital health"
- "Find recent patient experience research"

**Expected Result**: Brave Search results you can add to Idea Inbox

### 3. **Ask About Your Data**
- "What tasks are overdue?"
- "Who haven't I contacted recently?"
- "What's my schedule like this week?"

**Expected Result**: Accurate data retrieval and analysis

---

## 💡 Recommendation Summary

**IMMEDIATE** (Do This Week):
1. ✅ Fix tone enforcement in content generation
2. ✅ Test and document what Jamie can/can't do
3. ✅ Add user-facing guide explaining Jamie's limits

**SHORT TERM** (Next 2-4 Weeks):
1. ✅ Build Content Jamie with write access
2. ✅ Build Tasks Jamie with write access
3. ✅ Add "Ask Jamie" button on each relevant page

**LONG TERM** (Future Iterations):
1. ✅ Calendar Jamie with scheduling capabilities
2. ✅ Contacts Jamie with CRM features
3. ✅ Cross-feature intelligence (Jamie learns patterns across pages)
4. ✅ Voice input/output for hands-free interaction
5. ✅ Proactive suggestions ("You usually call Jason on Fridays - want me to schedule?")

---

## 🎓 For You to Consider

**Question 1**: Do you want ONE powerful Jamie that can do everything, or MULTIPLE specialized Jamies?
- **One Jamie**: Easier to build, but limited context
- **Multiple Jamies**: Better results, but more complex

**Question 2**: What's your #1 priority use case?
- Content creation? → Fix tone + build Content Jamie
- Task management? → Build Tasks Jamie
- Scheduling? → Build Calendar Jamie

**Question 3**: How much control do you want?
- **High control**: Jamie suggests, you approve
- **Medium control**: Jamie acts, you can undo
- **Low control**: Jamie acts autonomously (risky)

---

## 📝 Next Steps

1. **Review this document** and decide on priority
2. **Test current Jamie** with the "Quick Wins" section above
3. **Choose Phase 1-6** implementation order based on your needs
4. **I'll implement** the selected phase(s) in priority order

Let me know which direction you want to go! 🚀
