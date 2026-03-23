# SETTINGS TAB - COMPLETE DESIGN SPECIFICATION
## All Sections, Fields, Interactions, and Storage

---

## 🎛️ SETTINGS OVERVIEW

The Settings tab is where Meredith configures:
1. **Defaults** - Lead days + effort estimates per content type
2. **Notifications** - Rules for reminders based on publish date + status
3. **Blueprints Manager** - Edit/add blueprint templates
4. **Topic Preferences** - Focus topics, avoid topics
5. **AI Preferences (Jamie)** - Voice guidelines, writing examples
6. **Publishing Integrations** - LinkedIn, Substack connections (future)

**Layout:** Vertical list of collapsible sections (accordion-style) or tabbed sub-navigation

---

## 📐 SECTION 1: DEFAULTS (Lead Days + Effort Estimates)

### **Purpose:**
Set default prep time for each content type. These auto-populate when scheduling content on calendar, but can be overridden per item.

### **UI Design:**

```
┌─────────────────────────────────────────────────────────────┐
│  Defaults: Lead Days & Effort Estimates                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Set default prep time for each content type. These will    │
│  auto-fill when you schedule content, but you can edit      │
│  them per item on the calendar.                             │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  📘 LinkedIn Post                                     │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  Lead days:    [5  ▼] days                          │  │
│  │  Effort:       [90 ▼] minutes                        │  │
│  │                                                       │  │
│  │  💡 Jamie suggests: With 5 lead days, plan:         │  │
│  │     Day 1: Outline + research                        │  │
│  │     Day 2-3: First draft                             │  │
│  │     Day 4: Edit + polish                             │  │
│  │     Day 5: Final review + schedule                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  📙 LinkedIn Article                                  │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  Lead days:    [7  ▼] days                          │  │
│  │  Effort:       [180▼] minutes                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  📕 Substack Post                                     │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  Lead days:    [10 ▼] days                          │  │
│  │  Effort:       [240▼] minutes                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  [Reset to Recommended Defaults]                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### **Fields:**

**Per content type:**
- `leadDays` - Number input (1-30 range, default suggestions: Post=5, Article=7, Substack=10)
- `effortMins` - Number input (15-480 range, default suggestions: Post=90, Article=180, Substack=240)

**Optional: Effort in hours vs minutes toggle**
- If hours selected: Display as "3.0 hours" but store as minutes (180)

### **Jamie Helper (Optional Enhancement):**
When user changes `leadDays`, show Jamie's suggested daily breakdown:
```
💡 Jamie suggests: With 7 lead days for LinkedIn Article, plan:
   Day 1: Outline + research
   Day 2-3: First draft (sections 1-3)
   Day 4-5: Complete draft + edit
   Day 6: Final polish
   Day 7: Format + schedule
```

**Storage:**
```json
{
  "defaults": {
    "LinkedIn Post": {
      "leadDays": 5,
      "effortMins": 90
    },
    "LinkedIn Article": {
      "leadDays": 7,
      "effortMins": 180
    },
    "Substack Post": {
      "leadDays": 10,
      "effortMins": 240
    }
  }
}
```

---

## 🔔 SECTION 2: NOTIFICATIONS

### **Purpose:**
Configure when to receive in-app notifications (and optionally email) based on publish date and content status.

### **UI Design:**

```
┌─────────────────────────────────────────────────────────────┐
│  Notification Rules                                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Set up automatic reminders based on publish dates.         │
│  Notifications appear in-app (bell icon in nav).            │
│                                                              │
│  Default notification time: [09:00 ▼] AM                    │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Rule 1: Content Due in 3 Days            [Toggle ON] │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │  Trigger:    3 days before publish date               │ │
│  │  Applies to: ☑ Idea  ☑ Drafting  ☑ Review             │ │
│  │              ☑ Scheduled                               │ │
│  │  Time:       [09:00 ▼] AM                              │ │
│  │  Message:    "{title}" is due in 3 days.               │ │
│  │              [Edit message template]                   │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Rule 2: Content Due Today                [Toggle ON] │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │  Trigger:    Day of publish date                       │ │
│  │  Applies to: ☑ Idea  ☑ Drafting  ☑ Review             │ │
│  │              ☑ Scheduled                               │ │
│  │  Time:       [09:00 ▼] AM                              │ │
│  │  Message:    "{title}" publishes today!                │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Rule 3: Idea Not Started               [Toggle OFF] │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │  Trigger:    5 days before publish date               │ │
│  │  Applies to: ☑ Idea  (only if still in Idea status)   │ │
│  │  Time:       [09:00 ▼] AM                              │ │
│  │  Message:    Time to start "{title}" - open wizard?   │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  [+ Add New Rule]                                            │
│                                                              │
│  Email Notifications (optional):                             │
│  [ ] Also send notifications via email                      │
│      Email: meredith@example.com                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### **Fields:**

**Per rule:**
- `enabled` - Toggle (on/off)
- `trigger` - "due_date" (only option in v1)
- `offsetDays` - Number (-30 to +7, negative = before, 0 = day of, positive = after)
- `timeOfDay` - Time picker (default: 09:00)
- `appliesToStatuses` - Checkboxes for Idea, Drafting, Review, Scheduled, Published
- `titleTemplate` - Text input (max 50 chars)
- `messageTemplate` - Textarea (max 200 chars, supports {title}, {publishDate} variables)

**Global settings:**
- `defaultNotificationTime` - Time picker (applies to all new rules)
- `emailNotificationsEnabled` - Toggle
- `emailAddress` - Text input (if email notifications enabled)

### **Recommended Default Rules:**

**Rule 1:** 3 days before (all statuses except Published)
**Rule 2:** Day of publish date (all statuses)
**Rule 3:** 7 days before (Idea status only - "Hey, start this soon!")

### **Storage:**
```json
{
  "notificationRules": [
    {
      "id": "rule_due_3days",
      "enabled": true,
      "trigger": "due_date",
      "offsetDays": -3,
      "timeOfDay": "09:00",
      "appliesToStatuses": ["Idea", "Drafting", "Review", "Scheduled"],
      "titleTemplate": "Content coming up",
      "messageTemplate": "\"{title}\" is due in 3 days. Want to open the wizard?"
    }
  ],
  "defaultNotificationTime": "09:00",
  "emailNotificationsEnabled": false,
  "emailAddress": "meredith@example.com"
}
```

---

## 📚 SECTION 3: BLUEPRINTS MANAGER

### **Purpose:**
Edit existing blueprint templates, add new subtypes, customize the structure for each blueprint.

### **UI Design:**

```
┌─────────────────────────────────────────────────────────────┐
│  Blueprints Manager                                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Customize your content templates. Each blueprint family    │
│  has subtypes with editable templates.                      │
│                                                              │
│  ┌─ FAMILY: 📖 Story ────────────────────────────────────┐  │
│  │                                                         │  │
│  │  Subtypes:                                             │  │
│  │  • Personal Story              [Edit] [Active ✓]      │  │
│  │  • Insight Story               [Edit] [Active ✓]      │  │
│  │  • Mini Case Story             [Edit] [Active ✓]      │  │
│  │  • Origin Story                [Edit] [Active ✓]      │  │
│  │  • Other                       [Edit] [Active ✓]      │  │
│  │                                                         │  │
│  │  [+ Add New Subtype to Story]                          │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ FAMILY: 📚 Education ────────────────────────────────┐  │
│  │  Subtypes:                                             │  │
│  │  • Listicle                    [Edit] [Active ✓]      │  │
│  │  • Analysis                    [Edit] [Active ✓]      │  │
│  │  • Tips for Innovators         [Edit] [Active ✓]      │  │
│  │  • Resource Share              [Edit] [Active ✓]      │  │
│  │  • Other                       [Edit] [Active ✓]      │  │
│  │                                                         │  │
│  │  [+ Add New Subtype to Education]                      │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                              │
│  ... (collapsed: Perspective, Engagement, Announcement)      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**When user clicks [Edit] on a subtype:**

```
┌─────────────────────────────────────────────────────────────┐
│  Edit Blueprint: Insight Story                          [✕] │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Subtype Name:  [Insight Story              ]              │
│                                                              │
│  Template Structure:                                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ SECTION 1: Set the Scene                             │  │
│  │ When and where this happened (context)                │  │
│  │                                                        │  │
│  │ SECTION 2: The Moment                                 │  │
│  │ What happened, what you noticed                       │  │
│  │                                                        │  │
│  │ SECTION 3: The Pattern                                │  │
│  │ Why this moment matters beyond itself                 │  │
│  │                                                        │  │
│  │ SECTION 4: What This Means for You                    │  │
│  │ Actionable insight for digital health teams           │  │
│  │                                                        │  │
│  │ SECTION 5: The Bigger Stakes                          │  │
│  │ Connect to larger themes in patient experience        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  [Save Changes]  [Cancel]  [Reset to Default]               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### **Fields:**

**Per blueprint subtype:**
- `name` - Text input (max 50 chars)
- `isActive` - Toggle (show/hide in Wizard)
- `template` - Large textarea (markdown or structured text, 2000 chars max)

**Actions:**
- Edit existing subtype
- Toggle active/inactive
- Add new subtype to family
- Delete custom subtype (can't delete defaults)
- Reset to default template

### **Storage:**
```json
{
  "blueprintCatalog": {
    "families": [
      {
        "name": "Story",
        "icon": "📖",
        "subtypes": [
          {
            "name": "Insight Story",
            "isActive": true,
            "isDefault": true,
            "template": "SECTION 1: Set the Scene\nWhen and where this happened (context)\n\nSECTION 2: The Moment\n..."
          },
          {
            "name": "Custom Patient Journey",
            "isActive": true,
            "isDefault": false,
            "template": "..."
          }
        ]
      }
    ]
  }
}
```

---

## 🎯 SECTION 4: TOPIC PREFERENCES

### **Purpose:**
Define focus topics (what Meredith writes about) and avoid topics (what to filter out).

### **UI Design:**

```
┌─────────────────────────────────────────────────────────────┐
│  Topic Preferences                                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Help Jamie understand what content is relevant to you.     │
│                                                              │
│  Focus Topics (what you write about):                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  [patient experience            ] [+ Add]            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  Current focus topics:                                       │
│  • patient experience              [✕]                      │
│  • digital health                  [✕]                      │
│  • prior authorization             [✕]                      │
│  • care navigation                 [✕]                      │
│  • human-centered design           [✕]                      │
│  • participatory medicine          [✕]                      │
│  • health equity                   [✕]                      │
│                                                              │
│  Avoid Topics (filter these out):                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  [crypto                        ] [+ Add]            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  Current avoid topics:                                       │
│  • crypto                          [✕]                      │
│  • politics                        [✕]                      │
│  • celebrity gossip                [✕]                      │
│                                                              │
│  💡 Jamie uses these to score newsletter items.             │
│     Matches to focus topics = higher score.                 │
│     Matches to avoid topics = penalty or skip.              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### **Fields:**

- `focusTopics` - String array (add/remove via tag-style UI)
- `avoidTopics` - String array (add/remove via tag-style UI)

**Recommended defaults:**
```
Focus: patient experience, digital health, prior authorization, care navigation, 
       human-centered design, participatory medicine, health equity, chronic care, 
       patient engagement, health tech
       
Avoid: crypto, politics, celebrity gossip, sports, fashion
```

### **Storage:**
```json
{
  "topicPreferences": {
    "focusTopics": [
      "patient experience",
      "digital health",
      "prior authorization",
      "care navigation",
      "human-centered design"
    ],
    "avoidTopics": [
      "crypto",
      "politics",
      "celebrity gossip"
    ]
  }
}
```

---

## 🤖 SECTION 5: AI PREFERENCES (JAMIE)

### **Purpose:**
Configure Jamie's voice, style, and learning inputs.

### **UI Design:**

```
┌─────────────────────────────────────────────────────────────┐
│  AI Preferences (Jamie)                                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Customize how Jamie helps with content creation.           │
│                                                              │
│  ┌─ Voice Guidelines ──────────────────────────────────┐   │
│  │                                                       │   │
│  │  Tone: ☑ Concise  ☑ Human  ☑ Clear                  │   │
│  │                                                       │   │
│  │  Avoid: ☑ Hype  ☑ Clichés  ☑ Corporate speak        │   │
│  │                                                       │   │
│  │  Banned Words/Phrases:                               │   │
│  │  • unlock           [✕]                              │   │
│  │  • game-changing    [✕]                              │   │
│  │  • synergy          [✕]                              │   │
│  │  • leverage         [✕]                              │   │
│  │  [Add banned word/phrase...]                         │   │
│  │                                                       │   │
│  │  Preferred Phrases (Jamie should use these):        │   │
│  │  • from the patient perspective                     │   │
│  │  • what patients actually experience                │   │
│  │  [Add preferred phrase...]                           │   │
│  │                                                       │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─ Writing Examples ──────────────────────────────────┐   │
│  │                                                       │   │
│  │  Upload examples of your writing to help Jamie       │   │
│  │  learn your style. Paste URLs or full text.          │   │
│  │                                                       │   │
│  │  Example 1: Blog post about prior auth burden       │   │
│  │  [https://example.com/blog/prior-auth] [✕]          │   │
│  │                                                       │   │
│  │  Example 2: LinkedIn article on patient portals     │   │
│  │  [Pasted text: "When I ask patients..." (450 words)]│   │
│  │  [✕]                                                 │   │
│  │                                                       │   │
│  │  Example 3: Substack essay on care navigation       │   │
│  │  [https://example.substack.com/p/care-nav] [✕]      │   │
│  │                                                       │   │
│  │  [+ Add Writing Example (URL or Text)]               │   │
│  │                                                       │   │
│  │  💡 Jamie will analyze these to match your:         │   │
│  │     • Sentence structure                             │   │
│  │     • Vocabulary choices                             │   │
│  │     • Opening/closing patterns                       │   │
│  │     • Storytelling style                             │   │
│  │                                                       │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─ Content Pillar Tags ───────────────────────────────┐   │
│  │                                                       │   │
│  │  These tags help Jamie categorize and rank content:  │   │
│  │                                                       │   │
│  │  • speaking_patient         Language, tone           │   │
│  │  • fit_real_care_journeys   Workflow, care continuum│   │
│  │  • full_patient_ecosystem   Admin burden            │   │
│  │  • empathy_as_strategy      Trust, engagement       │   │
│  │  • co_design_hcd            Human-centered design   │   │
│  │  • participatory_medicine   Patient partnership     │   │
│  │  • multi_stakeholder        Cross-functional collab │   │
│  │  • what_good_care_looks_like Care quality, respect  │   │
│  │                                                       │   │
│  │  [Edit Pillar Tags] (advanced - opens modal)        │   │
│  │                                                       │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─ Feedback & Learning ───────────────────────────────┐   │
│  │                                                       │   │
│  │  Jamie learns from your feedback (thumbs up/down).   │   │
│  │                                                       │   │
│  │  Total suggestions:     247                          │   │
│  │  Thumbs up:             181 (73%)                    │   │
│  │  Thumbs down:           24 (10%)                     │   │
│  │  No feedback yet:       42 (17%)                     │   │
│  │                                                       │   │
│  │  [ ] Use feedback to improve future suggestions     │   │
│  │      (experimental)                                  │   │
│  │                                                       │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### **Fields:**

**Voice Guidelines:**
- `tone` - Checkboxes (concise, human, clear, professional, casual, etc.)
- `avoid` - Checkboxes (hype, clichés, corporate, jargon, etc.)
- `bannedWords` - String array
- `preferredPhrases` - String array

**Writing Examples:**
- `writingExamples` - Array of objects:
  ```typescript
  {
    type: "url" | "text",
    source: "https://..." | "pasted text content",
    title: "Blog post about prior auth",
    addedAt: "2025-12-28T..."
  }
  ```

**Content Pillar Tags:**
- Pre-defined list (locked to 8 tags in v1)
- Each tag has: `id`, `label`, `description`

**Feedback Stats:**
- Read-only display of thumbs up/down counts
- Toggle to enable/disable learning from feedback

### **Storage:**
```json
{
  "aiPreferences": {
    "voiceGuidelines": {
      "tone": ["concise", "human", "clear"],
      "avoid": ["hype", "clichés", "corporate"],
      "bannedWords": ["unlock", "game-changing", "synergy", "leverage"],
      "preferredPhrases": ["from the patient perspective", "what patients actually experience"]
    },
    "writingExamples": [
      {
        "type": "url",
        "source": "https://example.com/blog/prior-auth",
        "title": "Blog post about prior auth burden",
        "addedAt": "2025-12-28T10:00:00Z"
      }
    ],
    "contentPillarTags": [
      { "id": "speaking_patient", "label": "Speaking Patient", "description": "Language, tone, communication" }
    ],
    "learningEnabled": false
  }
}
```

---

## 🔌 SECTION 6: PUBLISHING INTEGRATIONS (Future/Optional)

### **Purpose:**
Connect LinkedIn and Substack accounts for one-click publishing (future enhancement).

### **UI Design:**

```
┌─────────────────────────────────────────────────────────────┐
│  Publishing Integrations                                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Connect your accounts to publish directly from this app.   │
│                                                              │
│  ┌─ LinkedIn ─────────────────────────────────────────┐    │
│  │  Status: Not connected                              │    │
│  │  [Connect LinkedIn Account]                         │    │
│  │                                                      │    │
│  │  Once connected, you can:                           │    │
│  │  • Post directly to LinkedIn from Drafting mode     │    │
│  │  • Preview how posts will look                      │    │
│  │  • Schedule posts via LinkedIn's scheduler          │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─ Substack ─────────────────────────────────────────┐    │
│  │  Status: Not connected                              │    │
│  │  [Connect Substack Account]                         │    │
│  │                                                      │    │
│  │  Once connected, you can:                           │    │
│  │  • Publish posts directly to Substack              │    │
│  │  • Save as draft in Substack                        │    │
│  │  • Schedule posts                                   │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
│  Note: This feature is optional. You can continue copying   │
│  content and pasting manually if you prefer.                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Implementation notes:**
- LinkedIn: Use LinkedIn OAuth + API
- Substack: Use API key (Substack provides API for publishers)
- Store tokens securely (encrypted in database, not localStorage)
- Allow disconnect/revoke access

---

## 💾 COMPLETE SETTINGS STORAGE SCHEMA

```typescript
interface JustContentSettings {
  // Section 1: Defaults
  defaults: {
    "LinkedIn Post": { leadDays: number; effortMins: number };
    "LinkedIn Article": { leadDays: number; effortMins: number };
    "Substack Post": { leadDays: number; effortMins: number };
  };
  
  // Section 2: Notifications
  notificationRules: NotificationRule[];
  defaultNotificationTime: string; // "HH:MM"
  emailNotificationsEnabled: boolean;
  emailAddress?: string;
  
  // Section 3: Blueprints
  blueprintCatalog: BlueprintCatalog;
  
  // Section 4: Topics
  topicPreferences: {
    focusTopics: string[];
    avoidTopics: string[];
  };
  
  // Section 5: AI Preferences
  aiPreferences: {
    voiceGuidelines: {
      tone: string[];
      avoid: string[];
      bannedWords: string[];
      preferredPhrases: string[];
    };
    writingExamples: WritingExample[];
    contentPillarTags: ContentPillarTag[];
    learningEnabled: boolean;
  };
  
  // Section 6: Publishing Integrations (future)
  integrations?: {
    linkedin?: {
      connected: boolean;
      accessToken?: string; // encrypted
      expiresAt?: string;
    };
    substack?: {
      connected: boolean;
      apiKey?: string; // encrypted
    };
  };
  
  // Metadata
  updatedAt: string;
}
```

---

## ✅ SETTINGS IMPLEMENTATION CHECKLIST

- [ ] Create Settings page layout (collapsible sections or tabs)
- [ ] Build Section 1: Defaults UI (3 content types, lead days + effort)
- [ ] Build Section 2: Notifications UI (rule builder, toggle, time pickers)
- [ ] Build Section 3: Blueprints Manager UI (family/subtype editor, template textarea)
- [ ] Build Section 4: Topic Preferences UI (tag-style add/remove)
- [ ] Build Section 5: AI Preferences UI (voice guidelines, writing examples uploader)
- [ ] Build API endpoint: GET /api/settings
- [ ] Build API endpoint: PUT /api/settings
- [ ] Implement settings validation (lead days 1-30, effort 15-480, etc.)
- [ ] Implement "Reset to defaults" functionality
- [ ] Test all settings save/load correctly
- [ ] Test settings changes reflect immediately in app (calendar defaults, etc.)

---

**END OF SETTINGS TAB COMPLETE DESIGN**

**Summary:** Settings tab has 5 core sections (6 with future integrations). All fields, layouts, and storage schemas defined. Ready for implementation.
