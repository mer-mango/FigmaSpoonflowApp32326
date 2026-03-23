# Routine Colors and Icons Reference

This document defines the standardized colors and icons for all routine types, meeting types, and activity types used throughout the application.

---

## 🌅 CORE ROUTINES (Locked/Special)

### Plan My Day
- **Color:** `#6b2358` (Jamie Plum)
- **Icon:** Sun
- **Type:** `routine` (locked)
- **Notes:** First activity of the day, always followed by AM Admin

### Wind Down
- **Color:** `#6b2358` (Jamie Plum)
- **Icon:** Moon
- **Type:** `routine` (locked)
- **Notes:** Last activity of the day, preceded by PM Admin

---

## 📋 ADMIN & WORK ROUTINES

### AM Admin
- **Color:** `#928a9c` (Soft Purple-Gray)
- **Icon:** Keyboard
- **Type:** `routine`
- **Notes:** Always follows Plan My Day wizard

### PM Admin
- **Color:** `#928a9c` (Soft Purple-Gray)
- **Icon:** Keyboard
- **Type:** `routine`
- **Notes:** Always precedes Wind Down wizard

---

## 🍽️ BREAKS & SELF-CARE

### Lunch
- **Color:** `#b0afa8` (Warm Taupe)
- **Icon:** UtensilsCrossed (fork and knife)
- **Type:** `routine`

### Break
- **Color:** `#dee1e7` (Cool Light Gray)
- **Icon:** Pause
- **Type:** `routine`

### PT (Physical Training)
- **Color:** `#bcd1d5` (Soft Teal/Aqua)
- **Icon:** Bike
- **Type:** `routine`

---

## 📅 MEETINGS & APPOINTMENTS

### Regular Meetings
- **Color:** `#6484a1` (Slate Blue)
- **Icon:** Calendar
- **Type:** `meeting`
- **Buffers:** 15 min before + 15 min after
- **Buffer Icon:** ArrowDown (pre-meeting) / ArrowUp (post-meeting)
- **Buffer Color:** `#6484a1` at 50% opacity (`#6484a180`)
- **Notes:** General calendar events, client meetings

### Medical Appointments
- **Color:** `#c6686d` (Muted Red)
- **Icon:** Stethoscope
- **Type:** `meeting`
- **Subtype:** `medical`
- **Buffers:** 45 min before + 45 min after (for in-person travel)
- **Buffer Icon:** ArrowDown (pre-meeting) / ArrowUp (post-meeting)
- **Buffer Color:** `#c6686d` at 50% opacity (`#c6686d80`)

### Virtual Appointments
- **Color:** `#e09470` (Muted Orange)
- **Icon:** Cross (medical cross icon)
- **Type:** `meeting`
- **Subtype:** `virtual`
- **Buffers:** 15 min before + 15 min after
- **Buffer Icon:** ArrowDown (pre-meeting) / ArrowUp (post-meeting)
- **Buffer Color:** `#e09470` at 50% opacity (`#e0947080`)

---

## 📊 ACTIVITY PLAYLISTS

### Tasks
- **Color:** `#c198ad` (Dusty Rose)
- **Icon:** CheckSquare (square checkbox with checkmark)
- **Type:** `task`

### Content Creation
- **Color:** `#e2b7be` (Soft Pink)
- **Icon:** Pin (push pin icon)
- **Type:** `content`

### Nurtures
- **Color:** `#8fa790` (Sage Green)
- **Icon:** Sprout
- **Type:** `nurture`

---

## 📚 PROFESSIONAL DEVELOPMENT

### Professional Development
- **Color:** `#93738e` (Muted Purple-Gray)
- **Icon:** Book
- **Type:** `routine` or `task`
- **Notes:** Learning, courses, skill development

---

## 🔄 BUFFERS

Buffers inherit their color from the item they're buffering, displayed at 50% opacity:

### Buffer Icons
- **Pre-Meeting Buffer:** ArrowDown
- **Post-Meeting Buffer:** ArrowUp

### Buffer Colors (50% Opacity)
| Meeting Type | Base Color | Buffer Color (50% opacity) |
|--------------|-----------|---------------------------|
| Regular Meeting | `#6484a1` | `#6484a180` |
| Medical Appointment | `#c6686d` | `#c6686d80` |
| Virtual Appointment | `#e09470` | `#e0947080` |

### Buffer Rules
- Regular meetings: 15 min before + 15 min after
- Medical appointments (in-person): 45 min before + 45 min after
- Virtual appointments: 15 min before + 15 min after
- Buffers are locked and cannot be moved independently of their parent meeting

---

## 🎨 COLOR PALETTE SUMMARY

| Category | Name | Hex Code | RGB | With 50% Opacity |
|----------|------|----------|-----|------------------|
| **Jamie Features** | Jamie Plum | `#6b2358` | rgb(107, 35, 88) | `#6b235880` |
| **Admin** | Soft Purple-Gray | `#928a9c` | rgb(146, 138, 156) | `#928a9c80` |
| **Self-Care** | Warm Taupe | `#b0afa8` | rgb(176, 175, 168) | `#b0afa880` |
| **Self-Care** | Cool Light Gray | `#dee1e7` | rgb(222, 225, 231) | `#dee1e780` |
| **Self-Care** | Soft Teal | `#bcd1d5` | rgb(188, 209, 213) | `#bcd1d580` |
| **Meetings** | Slate Blue | `#6484a1` | rgb(100, 132, 161) | `#6484a180` |
| **Medical** | Muted Red | `#c6686d` | rgb(198, 104, 109) | `#c6686d80` |
| **Virtual** | Muted Orange | `#e09470` | rgb(224, 148, 112) | `#e0947080` |
| **Tasks** | Dusty Rose | `#c198ad` | rgb(193, 152, 173) | `#c198ad80` |
| **Content** | Soft Pink | `#e2b7be` | rgb(226, 183, 190) | `#e2b7be80` |
| **Nurtures** | Sage Green | `#8fa790` | rgb(143, 167, 144) | `#8fa79080` |
| **Prof Dev** | Muted Purple-Gray | `#93738e` | rgb(147, 115, 142) | `#93738e80` |

---

## 🔧 IMPLEMENTATION NOTES

### Usage in Components
- **Timeline Blocks:** Use full color for icon background, 15% opacity for card background
- **Buffers:** Use 50% opacity of parent item color, arrow icons
- **Calendar Events:** Use full color for event pills and dots
- **Sidebar/Navigation:** Use full color with white icon for contrast
- **Hover States:** Use 30% opacity version for hover backgrounds

### Icon Import
All icons are from `lucide-react`:
```tsx
import { 
  Sun,           // Plan My Day
  Moon,          // Wind Down
  Keyboard,      // Admin
  UtensilsCrossed, // Lunch
  Pause,         // Break
  Bike,          // PT
  Calendar,      // Meetings
  Stethoscope,   // Medical
  Cross,         // Virtual
  CheckSquare,   // Tasks
  Pin,           // Content
  Sprout,        // Nurtures
  Book,          // Prof Dev
  ArrowDown,     // Pre-meeting buffer
  ArrowUp        // Post-meeting buffer
} from 'lucide-react';
```

### Accessibility
- All colors meet WCAG AA contrast requirements when used with white text
- Icons are sized at minimum 16px for visibility
- Always provide aria-labels for screen readers

---

## 📝 CHANGELOG

- **2026-01-18:** Updated buffer title styling to be more subtle (lighter gray, not bold)
- **2026-01-18:** Updated AM/PM Admin color to #928a9c
- **2026-01-18:** Added buffer color and icon specifications (50% opacity, arrow icons)
- **2026-01-18:** Initial documentation created with complete color and icon specifications