# Voice Dictation Standard

## 🎙️ Design Decision
All multi-line text fields (textareas, paragraph inputs) in this app should include voice dictation functionality by default.

---

## ⚡ Quick Start (Copy & Paste)

```tsx
import { DictationTextarea } from './components/ui/DictationTextarea';

<DictationTextarea
  value={text}
  onChange={setText}
  placeholder="Type or speak..."
  rows={5}
  className="w-full rounded-xl border-2 border-slate-200/50 p-4"
/>
```

**That's it!** The mic button appears automatically on hover.

---

## Implementation Options

### Option 1: DictationTextarea Component (Recommended)
Use the pre-built wrapper component for quick implementation:

```tsx
import { DictationTextarea } from './components/ui/DictationTextarea';

<DictationTextarea
  value={text}
  onChange={setText}
  placeholder="Type or speak your notes..."
  rows={5}
  className="w-full rounded-xl border-2 border-slate-200/50 p-4"
/>
```

**Props:**
- All standard textarea props are supported
- `showDictationButton?: boolean` - Show/hide mic button (default: true)
- `dictationButtonPosition?: 'top-right' | 'bottom-right'` - Position of mic button
- `onDictationStart?: () => void` - Callback when dictation starts
- `onDictationEnd?: () => void` - Callback when dictation ends

### Option 2: useDictation Hook (For Custom Implementations)
For more control or custom UI:

```tsx
import { useDictation } from '../hooks/useDictation';

const { isListening, toggleListening, isSupported } = useDictation({
  onTranscript: (transcript, isFinal) => {
    if (isFinal) {
      // Append transcript to your text field
      setText(prev => prev + ' ' + transcript);
    }
  },
  continuous: true, // Keep listening for multiple phrases
  language: 'en-US' // Set language
});

// Then add your custom mic button UI
<button onClick={toggleListening}>
  {isListening ? <MicOff /> : <Mic />}
</button>
```

## Visual Design
- **Hidden by default**: Mic button appears on hover/focus
- **Active state**: Red pulsing button when listening
- **Smooth transitions**: Matches "mindful productivity" aesthetic
- **Position**: Top-right or bottom-right corner of textarea
- **Icon**: lucide-react `Mic` / `MicOff`

## Browser Support
- ✅ Chrome/Edge: Full support
- ✅ Safari: Full support  
- ❌ Firefox: Limited/no support (gracefully hidden if not supported)

## When to Use
- ✅ Meeting prep notes
- ✅ Task descriptions
- ✅ Goal notes
- ✅ Contact notes
- ✅ Content drafts
- ✅ Journal entries
- ✅ Any multi-line text input (3+ rows)
- ❌ Single-line inputs (name, email, etc.)
- ❌ Short form fields (title, tags)

## Examples in App
- ✅ `PrepNotesEditor.tsx` - Meeting prep bullets (custom implementation)
- 🔄 Task modal description field (to be added)
- 🔄 Contact notes (to be added)
- 🔄 Goal description (to be added)
- 🔄 Content drafts (to be added)

## Reminder for AI Assistant
**When building new features with multi-line text fields, always ask:**
> "Would you like me to add voice dictation to this text field?"

OR automatically include it by default for any textarea component.