# 🧠 BRAIN DUMP FEATURE - COMPLETE SPECIFICATION

**Location:** Full-page editor (Drafting Focus Mode)  
**Purpose:** Voice-to-text structured content capture with Jamie AI  
**Use Case:** When user is in Drafting mode and wants to speak ideas freely

---

## 📍 WHERE BRAIN DUMP LIVES

### **NOT in the + Button Dropdown**
Brain Dump is NOT an input tool for creating new ideas.

### **YES in the Full-Page Editor**
Brain Dump is a **writing tool** used during the drafting process.

**Location:**
- Full-page editor toolbar (when contentItem.status = "Drafting" or "Review")
- Appears alongside formatting tools (bold, italic, etc.)
- Button: "Brain Dump with Jamie" (sparkle icon)

---

## 🎯 USER WORKFLOW

### **Step 1: Open Brain Dump Modal**
User clicks "Brain Dump with Jamie" button in editor toolbar

### **Step 2: Record Voice**
- Click microphone button to start recording
- Speak freely (no structure needed)
- Live transcript appears as user speaks
- Click microphone again to stop recording

### **Step 3: Let Jamie Structure**
- User reviews raw transcript
- Click "Let Jamie Structure This" button
- Jamie AI organizes thoughts into coherent content
- Uses blueprint structure + Meredith's voice

### **Step 4: Review & Insert**
- User reviews Jamie's structured version
- Can edit directly in modal before inserting
- Click "Insert into Document" to add to editor
- Content appears at cursor position (or end of document)

---

## 🤖 JAMIE AI STRUCTURING (Context-Aware)

Jamie structures content based on:
1. **Content Type** (LinkedIn Post, LinkedIn Article, Substack Post, Substack Podcast)
2. **Blueprint Family** (Story, Perspective, Education, Engagement, Announcement)
3. **Blueprint Subtype** (if selected)

### **Example: LinkedIn Post + Story Blueprint**

**Raw Transcript:**
> "So I was in a waiting room yesterday and noticed this woman trying to fill out the intake form on her phone but the form kept timing out and making her start over and she eventually just gave up and I was thinking about how many times we build digital tools that are supposed to make things easier but they end up being more frustrating than paper and this is exactly why co-design matters because if we had just asked patients what they needed we would have known that mobile forms need to save progress automatically"

**Jamie's Structured Output:**
```
**Scene:**
Yesterday in a waiting room, I watched a woman attempt to fill out an intake form on her phone. The form kept timing out, forcing her to start over each time.

**What Happened:**
After three failed attempts, she gave up entirely.

**The Invisible Load:**
Digital tools meant to simplify often add layers of frustration that paper never had.

**The Insight:**
This is why co-design isn't optional. If we had asked patients what they needed, we would have built mobile forms that save progress automatically.

**The Move:**
Auto-save on mobile forms. Always. No exceptions.
```

---

## 🎨 UI/UX DETAILS

### **Modal Design:**
- Full-screen modal (85vw x 90vh)
- Background: `#e5e7f0` (muted palette)
- Header: "Brain Dump with Jamie" + subtitle
- 3-step visual flow (Record → Structure → Insert)

### **Step 1: Record (Always Visible)**
- Large circular microphone button (purple gradient)
- Recording status: red pulse + timer
- Live transcript box (editable)
- "Clear" button to start over

### **Step 2: Structure (Appears after transcript exists)**
- "Let Jamie Structure This" button
- Loading state: "Jamie is working..." with spinner
- Processes for ~2 seconds

### **Step 3: Insert (Appears after structuring)**
- Editable textarea with structured content
- "Start Over" button (clears all, returns to Step 1)
- "Insert into Document" button (closes modal, adds to editor)

### **Tips Section (Shown when no transcript)**
Blue info box with:
- "Speak naturally and don't overthink it"
- "Say 'new paragraph' when you want to separate ideas"
- "Mention any key points or sections you want to emphasize"
- "You can edit Jamie's structured version before inserting"

---

## 🔧 TECHNICAL IMPLEMENTATION

### **Speech Recognition:**
- Uses Web Speech API (browser-based)
- `webkitSpeechRecognition` for Chrome/Edge
- `SpeechRecognition` for Firefox
- Continuous recording with interim results
- Error handling for:
  - No speech detected
  - Microphone access denied
  - Unsupported browser

### **Jamie AI Structuring:**
Uses OpenAI GPT-4 API with context-aware prompt

**System Message:**
```
You are Jamie, Meredith's AI writing assistant. Structure raw voice 
transcripts into coherent content that matches her voice and the 
selected blueprint structure.

Meredith's voice: concise, human, clear. No hype. No jargon.

Banned words: unlock, game-changing, synergy, leverage, deep dive, 
low-hanging fruit, circle back.
```

**User Message:**
```
Structure this voice transcript into {contentType} content using the 
{blueprintFamily} - {blueprintSubtype} blueprint.

Raw transcript:
{transcript}

Blueprint structure:
{blueprintTemplate}

Return structured content that:
1. Follows the blueprint sections
2. Uses Meredith's voice (concise, human, clear)
3. Organizes ideas logically
4. Removes filler words and false starts
5. Maintains the core message

Do not add new ideas. Only organize what's in the transcript.
```

---

## 📦 COMPONENT INTERFACE

```typescript
interface BrainDumpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (structuredContent: string) => void;
  context: 'content' | 'document';  // Always 'content' for Just Content app
  contentType: string;  // "LinkedIn Post", "Substack Post", etc.
  blueprintFamily?: string;  // "Story", "Perspective", etc.
  blueprintSubtype?: string;  // "Waiting Room Moment", etc.
  blueprintTemplate?: string;  // Full template structure
}
```

### **Usage in Editor:**

```typescript
const [brainDumpOpen, setBrainDumpOpen] = useState(false);

// In toolbar:
<button onClick={() => setBrainDumpOpen(true)}>
  <Sparkles /> Brain Dump with Jamie
</button>

// Modal:
<BrainDumpModal
  isOpen={brainDumpOpen}
  onClose={() => setBrainDumpOpen(false)}
  onInsert={(content) => {
    // Insert at cursor position or end of document
    setEditorContent(prev => prev + '\n\n' + content);
    setBrainDumpOpen(false);
  }}
  context="content"
  contentType={contentItem.contentType}
  blueprintFamily={contentItem.blueprintFamily}
  blueprintSubtype={contentItem.blueprintSubtype}
  blueprintTemplate={getTemplate(contentItem.blueprintFamily, contentItem.blueprintSubtype)}
/>
```

---

## 🎯 BLUEPRINT-SPECIFIC STRUCTURING EXAMPLES

### **LinkedIn Post + Perspective**
**Output format:**
```
**The Translation Gap:**
{identify the disconnect}

**What Patients Hear:**
{patient interpretation}

**What Teams Mean:**
{intended message}

**The Reframe:**
{suggested language swap}
```

### **Substack Podcast + Story**
**Output format:**
```
**Cold Open:**
{hook - 30-50 words}

**The Scene:**
{setting + moment - 150-200 words}

**What Patients Carry:**
{invisible load - 75-100 words}

**The Insight:**
{lesson in plain language - 75-100 words}

**Practical Moves:**
{2-3 actionable steps - 150-200 words}

**Close:**
{memorable line + listener prompt - 30-50 words}
```

### **LinkedIn Article + Education**
**Output format:**
```
**The Pattern:**
{UI/UX pattern or workflow issue}

**How It Shows Up:**
{specific examples from real use}

**What It Costs Patients:**
{impact on experience/outcomes}

**Why It Exists:**
{optional context - tech debt, legacy systems, etc.}

**3 Design Moves:**
1. {specific fix}
2. {specific fix}
3. {specific fix}
```

---

## 🚀 IMPLEMENTATION CHECKLIST FOR BUILDER #2

### **Phase 1: Basic Modal**
- [ ] Create Brain Dump button in editor toolbar
- [ ] Build modal UI (3-step flow)
- [ ] Implement speech recognition (Web Speech API)
- [ ] Live transcript display
- [ ] Recording timer

### **Phase 2: Jamie AI Integration**
- [ ] Connect to OpenAI API
- [ ] Create context-aware prompts
- [ ] Pass contentType + blueprint to API
- [ ] Handle loading states
- [ ] Error handling (API failures)

### **Phase 3: Content Insertion**
- [ ] "Insert into Document" function
- [ ] Insert at cursor position
- [ ] Insert at end if no cursor position
- [ ] Close modal after insert
- [ ] Success toast notification

### **Phase 4: Polish**
- [ ] Editable structured text (before insert)
- [ ] "Start Over" reset function
- [ ] "Clear" transcript button
- [ ] Tips section (conditional display)
- [ ] Keyboard shortcuts (ESC to close)

---

## 📝 JAMIE AI PROMPTS (Detailed)

### **PROMPT TEMPLATE: BRAIN_DUMP_STRUCTURING**

**System Message:**
```
You are Jamie, Meredith's AI writing assistant. Your job is to take 
raw voice transcripts and structure them into coherent content.

Meredith's voice guidelines:
- Concise (no fluff)
- Human (conversational but clear)
- Clear (no jargon or buzzwords)

BANNED WORDS (never use these):
unlock, game-changing, synergy, leverage, deep dive, low-hanging 
fruit, circle back

When structuring:
1. Follow the blueprint structure exactly
2. Remove filler words (um, uh, like, you know)
3. Remove false starts and repetition
4. Keep the core message intact
5. Organize ideas logically
6. Use Meredith's voice (not yours)
7. Do not add new ideas or examples not in the transcript
```

**User Message:**
```
Structure this voice transcript into {contentType} content.

Content Type: {contentType}
Blueprint: {blueprintFamily} - {blueprintSubtype}

Raw Transcript:
{transcript}

Blueprint Structure to Follow:
{blueprintTemplate}

Instructions:
- Organize the transcript into the sections shown in the blueprint
- Remove filler words and false starts
- Keep sentences concise and clear
- Use Meredith's voice (concise, human, clear)
- Do not add ideas that aren't in the transcript
- If a section has no relevant content, write "[Add content here]"

Return ONLY the structured content, using markdown headings for sections.
```

---

## ✅ SUMMARY

**Brain Dump is:**
- A **writing tool** (not an input tool)
- Located in the **full-page editor** (not the + button)
- Used during **Drafting or Review** status
- Voice-to-text with **Jamie AI structuring**
- Context-aware (uses contentType + blueprint)

**Brain Dump is NOT:**
- A way to create new ideas
- In the quick-add dropdown
- A general note-taking tool
- A transcription-only feature (it structures, not just transcribes)

All specs ready for Builder #2 implementation! 🎯
