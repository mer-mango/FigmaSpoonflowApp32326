# 🚨 BUILDER #2: STOP AND ASK PROTOCOL

## CRITICAL INSTRUCTION FOR BUILDER #2

**If you have ANY question—even the slightest uncertainty—about ANYTHING in this spec:**

## ⛔ STOP IMMEDIATELY

## ❓ ASK FOR CLARIFICATION

## 🚫 DO NOT PROCEED UNTIL YOU GET AN ANSWER

---

## WHY THIS MATTERS

Small naming inconsistencies, unclear assumptions, or "I'll just guess what they meant" decisions compound into:
- ❌ Bugs that are hard to trace
- ❌ Rework that wastes days
- ❌ Mismatched expectations
- ❌ Data model inconsistencies

**It's faster to ask now than to rebuild later.**

---

## EXAMPLES OF WHEN TO ASK (Even If It Seems Obvious)

### **Naming Questions:**
- "Should I call it `contentItems` or `items`?"
- "Should notification templates use `{title}` or `{contentTitle}`?"
- "Should the dismiss button say 'Dismiss' or 'Remove'?"
- "Should I use camelCase or snake_case for database column names?"
- "Is it `publishDate` or `publish_date` in the database?"

### **UI/UX Questions:**
- "Should the 'Save to Ideas' button be primary or secondary styling?"
- "Should Jamie suggestions have a special background color or just a label?"
- "Should the Top 5 section have a border or just different spacing?"
- "Should empty states show an icon, illustration, or just text?"
- "Should the undo toast appear top-right, bottom-right, or centered?"

### **Logic Questions:**
- "If a user dismisses an item then immediately pulls newsletters again, should the dismissed item reappear?"
- "If a content item has status=Published, can it still be rescheduled?"
- "If leadDays is edited to 0, should shading disappear or show 1 day minimum?"
- "If two inbox items have the same title but different URLs, are they duplicates?"

### **Data Questions:**
- "Should tags be case-sensitive when filtering?"
- "Should contentPillarTags be stored separately from user tags, or in the same array?"
- "Should Jamie suggestions be stored in the InboxItem or computed fresh each time?"
- "Should publishDate be stored as YYYY-MM-DD string or as a Date object?"

### **Integration Questions:**
- "Should the Gmail pull happen synchronously (user waits) or asynchronously (background job)?"
- "Should AI errors show a user-friendly message or the actual error?"
- "Should failed newsletter extraction be retried automatically or require manual retry?"
- "Should notification jobs be deleted after delivery or kept as history?"

### **Edge Case Questions:**
- "What happens if a user schedules content for today's date in the past (e.g., it's 3pm, they schedule for today at 9am)?"
- "What happens if a user dismisses an item, then clicks 'Send to Wizard' before the 15-second undo window expires?"
- "What happens if the calendar is open when a new newsletter pull adds items?"
- "What happens if a user deletes a content item that has pending notifications?"

---

## HOW TO ASK

### **Good Question Format:**

```
QUESTION: [specific question]

CONTEXT: [why you're asking]

OPTIONS I'M CONSIDERING:
1. [option A]
2. [option B]

RECOMMENDATION: [which option you think is best, with reasoning]
```

### **Example:**

```
QUESTION: Should the "Save to Ideas" button be primary (blue) or secondary (outline) styling?

CONTEXT: The spec says "Primary: Send to Wizard, Secondary: Save to Ideas" but I want to confirm if "secondary" means visual styling or just importance hierarchy.

OPTIONS I'M CONSIDERING:
1. Primary blue button for Send to Wizard, outline/ghost button for Save to Ideas
2. Both blue buttons, but Send to Wizard is larger/bolder

RECOMMENDATION: Option 1 (different visual styles) makes the hierarchy clearer and matches typical UI patterns.
```

---

## WHAT NOT TO DO

### ❌ DON'T GUESS:
"I think they probably meant X, so I'll just do that."

### ❌ DON'T ASSUME:
"This is the standard way to do it, so I'll do it that way."

### ❌ DON'T FILL GAPS:
"The spec doesn't mention error states, so I'll add my own error handling."

### ❌ DON'T INVENT FEATURES:
"It would be nice to have Y, so I'll add that too."

### ❌ DON'T RENAME THINGS:
"This naming is awkward, I'll use a better name."

---

## WHEN IT'S OK TO PROCEED WITHOUT ASKING

✅ The spec explicitly covers it (e.g., "use `publishDate` not `dueDate`")  
✅ The canonical naming reference defines it (e.g., exact field names)  
✅ Standard web conventions apply and don't conflict with the spec (e.g., use semantic HTML)  
✅ Implementation details that don't affect UX or data model (e.g., internal variable names in a private function)  

---

## QUESTIONS ARE GOOD

**Asking questions demonstrates:**
- ✅ Attention to detail
- ✅ Understanding the importance of consistency
- ✅ Proactive problem-solving
- ✅ Care about delivering exactly what's needed

**Not asking questions risks:**
- ❌ Building the wrong thing
- ❌ Creating inconsistencies
- ❌ Wasting time on rework
- ❌ Breaking user expectations

---

## BOTTOM LINE

**No question is too small.**  
**No clarification is too obvious.**  
**No detail is too minor.**

**If you're not 100% certain → ASK.**

---

**END OF STOP AND ASK PROTOCOL**
