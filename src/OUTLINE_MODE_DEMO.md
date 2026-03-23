# Outline Mode Prototype Demo

## 🎯 What This Is

A fully functional prototype of the ideal "Outline Mode" content editor with Jamie AI suggestions drawer, built as a clean demonstration of the UX flow.

## 🚀 How to Access

Navigate to: **`?page=outline-demo`**

Or use the URL parameter: `https://your-app.com/?page=outline-demo`

## ✨ Features Implemented

### **Main Screen**

#### Top Bar
- Page title: "Content Editor"
- Platform dropdown with 4 options:
  - LI Post
  - LI Article
  - SS Post
  - SS Audio

#### Left Column - Module Cards (5 cards)
Each card includes:
1. **Circular number badge** (1-5) in purple
2. **Module label** as heading (Hook, Context/Micro-story, Your take, Make it usable, CTA)
3. **Module description** as helper text
4. **Multiline textarea** with platform-specific placeholder text
5. **"Get suggestions" button** to open Jamie drawer

**Textarea sizing:**
- Hook: 3 rows
- CTA: 2 rows
- Context, POV, Takeaways: 5 rows each

**Module order (fixed):**
1. Hook
2. Context / Micro-story
3. Your take (POV)
4. Make it usable (Takeaways)
5. CTA

#### Right Column - Validation & Best Practices
- **Checklist section** with 4 items:
  - Hook in first ~2 lines
  - Scannable formatting
  - One core idea
  - CTA present
  - (Currently showing placeholder state - no validation logic)

- **Best practices section** with 5 bullets:
  - Hook in the first 1–2 lines
  - Short paragraphs and lots of line breaks
  - One idea per post
  - Use concrete examples over general claims
  - End with one clear question or next step

#### Bottom Section - Consolidated Draft Preview
- Read-only preview box
- Automatically joins non-empty module drafts with blank lines between
- Updates in real-time as you type
- Shows "(No content yet)" when all modules are empty

---

### **Jamie Suggestions Drawer**

Opens from the "Get suggestions" button on any module card.

#### Drawer Layout
1. **Header**: "Jamie Suggestions"
2. **Subheader**: Shows the active module's label and description
3. **Platform guidance block**:
   - Title: "Platform guidance"
   - Body: Module-specific guidance text
4. **"Generate 3 options" button** (primary CTA)
5. **Three suggestion cards** (after generation):
   - Option 1, Option 2, Option 3
   - Each with realistic example content
   - Each with "Insert into module" button

#### Interactions
- **Click "Get suggestions"** → Opens drawer for that specific module
- **Click "Generate 3 options"** → Shows 3 pre-written examples for that module type
- **Click "Insert into module"** → Populates the textarea with that option and closes drawer
- **Click X or overlay** → Closes drawer without changes
- **Drawer remembers** which module is active (Hook vs Context vs POV vs Takeaways vs CTA)

#### Example Suggestions
The prototype includes realistic examples for each module:
- **Hook**: 3 different opening hooks about patient-centered design
- **Context**: 3 micro-stories about product teams and patients
- **POV**: 3 different "take" angles on the insight
- **Takeaways**: 3 sets of actionable bullets/frameworks
- **CTA**: 3 different conversation-starting questions

---

## 🎨 Design Details

**Color Palette:**
- Primary accent: Purple (`#9333EA` / `purple-600`)
- Number badges: Purple background, white text
- Buttons: Purple with hover states
- Backgrounds: White cards on slate-50 background
- Borders: Subtle slate-200

**Typography:**
- Headings: System font, semibold
- Body text: System font, regular
- Textarea content: Georgia serif (matches writing style)
- Clean hierarchy: Large → Medium → Small

**Spacing:**
- Generous whitespace between cards
- Comfortable padding inside cards
- Clear visual separation between sections

**Components:**
- Rounded corners (`rounded-xl` for cards, `rounded-lg` for inputs)
- Subtle shadows on cards
- Smooth transitions on hover states
- Focus rings on interactive elements

---

## 🔧 Technical Implementation

**Component:** `/components/demo/OutlineModePrototype.tsx`

**Key Features:**
- Self-contained demo (no external dependencies)
- Real-time preview updates
- Drawer state management
- Module-specific content examples
- Responsive to window size

**State Management:**
```typescript
- platform: string // Selected platform
- moduleDrafts: Record<string, string> // Module content
- activeDrawerModule: string | null // Which module's drawer is open
- generatedSuggestions: string[] // AI-generated options
```

**No Backend Required:**
- All suggestions are pre-written examples
- State managed in React (not persisted)
- Perfect for testing UX flows

---

## 📝 Use Cases

**For User Testing:**
- Show this to users to validate the outline mode concept
- Test whether the module structure makes sense
- Validate the Jamie suggestions interaction flow

**For Development Reference:**
- Clean example of the ideal UX
- Reference for implementing real Jamie AI integration
- Template for module card layout

**For Design Iteration:**
- Easy to modify styles and spacing
- Self-contained for quick iterations
- Can be shared via URL

---

## 🚧 What's NOT Included (Intentional)

- No backend persistence (it's a demo!)
- No real AI generation (uses pre-written examples)
- No validation logic (checklist is placeholder UI only)
- No platform switching logic (all platforms use same modules for demo)
- No save/export functionality
- Not integrated with the main app's content system

---

## 💡 Next Steps for Production

To turn this into a production feature:

1. **Replace placeholder suggestions** with real Jamie AI calls
2. **Add backend persistence** for drafts
3. **Implement validation logic** for checklist items
4. **Add platform-specific modules** (different modules per platform if needed)
5. **Integrate with ContentItem** data model
6. **Add save/publish workflow**
7. **Add word count tracking**
8. **Connect to voice profile** for tone consistency

---

## 🎯 Success Metrics

When testing this prototype, look for:
- ✅ Users understand the module structure immediately
- ✅ Users find the suggestions helpful and contextual
- ✅ The "insert" interaction feels natural
- ✅ The consolidated preview helps them see the full draft
- ✅ The right-column checklist provides useful guidance
- ✅ Users want this in the real app!

---

## 📸 Screenshots Reference

**Main View:**
- Clean 2-column layout
- 5 numbered module cards on left
- Validation + best practices on right
- Consolidated preview at bottom

**Drawer Open:**
- Slides in from right
- Shows module context
- 3 suggestion options
- Clear insert CTAs
- Easy to close

---

## 🎨 Design Philosophy

This prototype demonstrates:
- **Clarity over cleverness** - Simple, predictable interactions
- **Guidance without overwhelm** - Helper text where needed, hidden when not
- **Progressive disclosure** - Start simple, reveal details on demand
- **Consistency** - Repeated patterns (numbered cards, insert buttons)
- **Confidence** - Clear labeling, obvious next actions

The goal: **Make content creation feel structured but not constrained.**
