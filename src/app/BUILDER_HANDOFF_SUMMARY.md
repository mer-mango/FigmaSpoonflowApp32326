# Builder Handoff - Content Ideas Inbox
## Everything You Need to Give Your Builder

---

## 📦 WHAT TO GIVE YOUR BUILDER

### **Primary Documents (Copy/Paste Ready):**

1. **`/MASTER_BUILDER_SPEC.md`** - Main specification (Part 1)
2. **`/MASTER_BUILDER_SPEC_PART2.md`** - AI Preferences, Quick Add, QA Checklist (Part 2)

### **Reference Implementation (For Technical Details):**

3. **`/JAMIE_INTEGRATION_ARCHITECTURE.md`** - How everything connects
4. **`/NEWSLETTER_EXTRACTION_IMPLEMENTATION.md`** - Extraction + scoring algorithms
5. **`/SNIPPET_HOOK_STATUS_IMPLEMENTATION.md`** - Snippet/hook generation + status flows

### **Supporting Docs (Context):**

6. **`/EXTRACTION_CHECKLIST.md`** - Files to copy from existing content app
7. **`/AI_LEARNING_APPROACHES.md`** - AI learning options (for future enhancement)
8. **`/STATUS_TRACKING_FEATURES.md`** - Status system documentation
9. **`/THUMBS_FEEDBACK_SPEC.md`** - Simple thumbs up/down feedback on cards (V1 feature)

---

## 🎯 QUICK BRIEF FOR BUILDER

**WHAT WE'RE BUILDING:**

"Content Ideas Inbox" - a section at the TOP of the existing Content page that:

1. **Pulls newsletters** from dedicated Gmail account (manual pull, not automated)
2. **Extracts story items** (often multiple per newsletter)
3. **Ranks by relevance** to Meredith's expertise (digital health/patient experience)
4. **Generates AI content**:
   - Snippet (2-3 sentence summary)
   - Hook (1 strong opener line in Meredith's voice)
   - Tags (content pillar tags)
5. **Shows Top 5** ranked items + remaining inbox
6. **Actions**:
   - Save to Ideas → moves to main content system
   - Send to Wizard → saves + opens creation wizard
   - Dismiss → 15-second undo window

**KEY CONSTRAINTS:**

- ❌ NOT a separate page - section at top of existing Content page
- ❌ Don't modify existing Gallery/Table views
- ✅ AI named "Jamie" - uses plum color (#5e2350)
- ✅ Manual pull only (button click)
- ✅ No platform selection in inbox (happens in wizard)

---

## 📊 COMPLEXITY ESTIMATE

**Total Scope:** ~3-4 weeks for full-featured implementation

**Breakdown:**
- Week 1: UI components + AI Profile setup (40 hours)
- Week 2: Gmail integration + extraction + scoring (35 hours)
- Week 3: Snippet/hook generation + modals + actions (30 hours)
- Week 4: Polish + QA + bug fixes (15 hours)

**File Count:**
- 16 new files to create
- 4 existing files to modify
- ~3,500 lines of new code

---

## 🔑 CRITICAL TECHNICAL POINTS

### **1. AI Profile is Central**

Everything uses `AI_PROFILE_V1` JSON object:
- Ranking (keyword matching)
- Snippet/hook generation (voice rules)
- Tagging (content pillars)

Store in localStorage + optional Supabase sync.

### **2. Three-Step Processing Pipeline**

```
Newsletter → [Preprocess] → [AI Extract] → [Score] → [Rank] → [Generate Snippet/Hook] → Inbox
```

Each step is independent and testable.

### **3. Deterministic Scoring (Not Just AI)**

Scoring algorithm is **keyword-based** (debuggable, fast):
- HIGH focus area keyword match = +12 points
- MEDIUM_HIGH = +8
- MEDIUM = +5
- Avoid keyword match = -25

Normalize to 0-100 score.

Optional AI re-rank for top 10 (nice-to-have, not required).

### **4. Deduplication via Fingerprints**

```typescript
fingerprint = SHA256(normalize(title) + normalize(url) + parent_email_id)
```

Prevents duplicate cards from same newsletter.

### **5. Status Transitions**

```
new (inbox) → saved (ideas in main system) OR dismissed (hidden with undo)
```

Dismiss has 15-second undo timer (exact requirement).

### **6. Wizard Integration**

When "Send to Wizard" clicked:
1. Create ContentItem with status='idea'
2. Remove from inbox
3. Open existing wizard with `initialContent` prop
4. Wizard receives pre-filled: title (hook), notes (snippet), tags

No need to build new wizard - use existing one.

---

## 🧪 HOW TO TEST

Use the **QA Checklist** in MASTER_BUILDER_SPEC_PART2.md (18 sections, 100+ test cases).

**Key flows to test:**

1. **Happy path:**
   - Pull newsletters → See Top 5 → Click "Send to Wizard" → Wizard opens pre-filled → Save → Appears in Gallery

2. **Quick Add:**
   - Click "Quick Add" → Paste URL → AI generates snippet/hook → Card appears in inbox

3. **Dismiss + Undo:**
   - Dismiss card → Toast appears → Click "Undo" within 15s → Card restores

4. **AI Preferences:**
   - Edit focus areas → Save → Pull newsletters again → See ranking change

---

## 💡 SIMPLIFICATIONS (If Needed)

If builder needs to simplify for V1:

**Can Skip (Optional Features):**
- AI re-rank (use deterministic scoring only)
- Learning from published content (set toggle to false)
- Gmail label filtering (pull from inbox only)
- "Why this was chosen" explanation (hide it)

**Must Have (Core Features):**
- Gmail pull + extraction
- Deterministic scoring + Top 5
- Snippet/hook generation
- Save to Ideas + Send to Wizard
- Dismiss with 15s undo
- Quick Add (URL + text)
- AI Preferences modal

---

## 🎨 DESIGN TOKENS

**Jamie AI Color:** `#5e2350` (plum)
- Use for all Jamie-specific UI elements
- Buttons: "Pull newsletters", "Send to Wizard"
- Links: "AI Preferences"
- Accents: Hook box border, tag backgrounds, relevance bar

**Existing Brand Colors:**
- Primary: `#2f829b`
- Secondary: `#034863`
- Neutral light: `#f5fafb`
- Neutral: `#ddecf0`

**Typography:**
- Headings: `Lora` (serif)
- Body: `Poppins` (sans-serif)

---

## 📞 QUESTIONS TO ASK BUILDER

1. **Do you have access to the existing Content page code?**
   - If yes: Which file(s) contain the Gallery view?
   - If no: Need to extract from existing project first

2. **Do you have OpenAI API access set up?**
   - Need: `VITE_OPENAI_API_KEY` environment variable
   - Cost estimate: ~$2-5 per 100 newsletter pulls

3. **Do you have Google OAuth credentials?**
   - Need: `VITE_GOOGLE_CLIENT_ID` for Gmail integration
   - Instructions: https://console.cloud.google.com/apis/credentials

4. **Timeline preference?**
   - Full-featured (3-4 weeks) vs. MVP (2 weeks with simplifications)

5. **Deployment environment?**
   - Where will this run? (affects OAuth redirect URIs)

---

## ✅ ACCEPTANCE CRITERIA (Give to Builder)

**The feature is COMPLETE when I can:**

1. ✅ Click "Pull newsletters" and see items populate
2. ✅ See Top 5 cards with snippet + hook
3. ✅ Click "Save to Ideas" and item moves to Gallery view
4. ✅ Click "Send to Wizard" and wizard opens pre-filled
5. ✅ Dismiss items with 15-second undo
6. ✅ Quick Add a URL or pasted text
7. ✅ Edit AI Preferences and see it affect ranking
8. ✅ Everything works on mobile
9. ✅ Existing Content page features still work
10. ✅ No console errors, smooth performance

---

## 📁 FILE DELIVERY CHECKLIST

**Builder should deliver:**

- [ ] All 16 new component/util files
- [ ] Modified ContentItem interface
- [ ] Modified Content page with inbox section
- [ ] Gmail OAuth setup instructions
- [ ] Environment variables needed
- [ ] Any database migrations (if using Supabase)
- [ ] README with setup steps
- [ ] QA test results (which items pass/fail)

---

## 🚀 DEPLOYMENT CHECKLIST

**Before going live:**

1. [ ] Gmail OAuth configured in Google Cloud Console
2. [ ] OpenAI API key added to environment
3. [ ] AI_PROFILE_V1 seeded to localStorage/database
4. [ ] Test newsletter pull on staging
5. [ ] Verify wizard integration works
6. [ ] Check mobile responsive
7. [ ] Load test with 100+ newsletters
8. [ ] Verify no performance issues

---

## 💬 SUPPORT DURING BUILD

**If builder gets stuck:**

**Architecture questions:** Refer to `/JAMIE_INTEGRATION_ARCHITECTURE.md`  
**Extraction logic:** Refer to `/NEWSLETTER_EXTRACTION_IMPLEMENTATION.md`  
**AI prompts:** Copy exact templates from Batch 2  
**Status flows:** Refer to `/SNIPPET_HOOK_STATUS_IMPLEMENTATION.md`  

**Common Issues:**

1. **"AI returns invalid JSON"**
   - Solution: Use `response_format: { type: "json_object" }` in OpenAI call
   - Lower temperature to 0.3-0.4 for structured output

2. **"Scoring seems random"**
   - Solution: Log the `scoring_breakdown` object
   - Verify keywords are lowercase in matching logic

3. **"Duplicates appearing"**
   - Solution: Check fingerprint generation logic
   - Ensure dedup check runs BEFORE creating InboxItem

4. **"Wizard doesn't pre-fill"**
   - Solution: Verify `initialContent` prop is passed
   - Check wizard component accepts this prop

---

## 🎯 ONE-SENTENCE SUMMARY

**"Build a Content Ideas Inbox section (at top of existing Content page) that pulls newsletters from Gmail, ranks story items by relevance to Meredith's healthcare consulting expertise using AI, generates voice-matched hooks and snippets, and allows pushing items into the existing content creation workflow."**

---

**That's everything your builder needs!** 🚀

Hand them:
1. MASTER_BUILDER_SPEC.md (Part 1 + Part 2)
2. This summary doc
3. Reference docs for technical details

Good luck with the build!