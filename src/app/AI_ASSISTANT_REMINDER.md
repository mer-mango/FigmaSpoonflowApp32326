# 🤖 AI Assistant Development Reminders

## Voice Dictation Standard 🎙️

### ALWAYS ask when creating multi-line text fields:
> "I've added the text field. **Would you like me to include voice dictation?**"

### Or AUTOMATICALLY include it for:
- Task descriptions
- Meeting notes
- Contact notes  
- Goal descriptions
- Content drafts
- Journal entries
- Any textarea with 3+ rows

### Quick implementation:
```tsx
import { DictationTextarea } from './components/ui/DictationTextarea';

<DictationTextarea
  value={text}
  onChange={setText}
  placeholder="Type or speak..."
  rows={5}
  className="your-tailwind-classes"
/>
```

---

## Other Standards to Remember

### Modal Sizing
- Default: `w-[85vw] h-[90vh]`
- Include maximize to full screen option

### Priority Fields
- Simple flag/no flag system (not 3-level scale)
- Use `FlagToggle` component from `/components/tasks/FlagToggle.tsx`

### Design System
- **Colors**: `#2f829b`, `#034863`, `#6b2358` (AI features)
- **Typography**: Lora (serif headings) + Poppins (body)
- **Rounded**: 20-30px radius heavily rounded
- **Translucent**: white/60-70% with backdrop-blur
- **Aesthetic**: "mindful productivity" / "calm digital sanctuary"

### Brand Philosophy
- Unified timeline with drag-and-drop time blocking
- AI-assisted scheduling through Jamie
- "Empty puzzle" concept for Today page
- Locked meeting blocks with fillable routine slots

---

## Checklist for New Features

- [ ] Multi-line text field? → Add dictation
- [ ] Modal? → Size w-[85vw] h-[90vh] with maximize
- [ ] Priority field? → Use flag/no flag only
- [ ] Using brand colors? → #2f829b, #034863, #6b2358
- [ ] Rounded corners? → 20-30px
- [ ] Translucent layers? → white/60-70% backdrop-blur
