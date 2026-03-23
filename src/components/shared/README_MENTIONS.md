# @ Mention System - Platform-Wide Usage Guide

The @ mention system provides autocomplete for routines, tasks, contacts, playlists, and tags across all text fields in the platform.

## User Experience Flow

### 1. **Type `@`** - Autocomplete dropdown appears
When you type the `@` symbol, an autocomplete dropdown instantly appears showing all available entities you can mention.

### 2. **Start typing to filter** - `@p` → shows "PT", "Professional Development", etc.
As you continue typing, the list filters in real-time to match your query.

### 3. **Select with keyboard or mouse**
- **Arrow keys (↑/↓)** - Navigate through suggestions
- **Enter** - Select the highlighted item
- **Mouse click** - Click any suggestion to select it
- **Esc** - Close the dropdown

### 4. **Visual confirmation** - "Jamie understood" appears
After you finish typing (when the dropdown closes), a beautiful confirmation box appears below the field showing:
- ✨ "Jamie understood:" header
- Color-coded badges for each mention (e.g., "2× Break", "1× PT")
- Icons and entity type indicators

This gives you instant visual feedback that Jamie recognized and linked your mentions to actual entities in the system.

## Example Flow

**You type:**
```
"Need 2 @Break today and at least 30 mins of @PT"
```

**What happens:**
1. Type `@B` → Dropdown shows "Break", "Business Development", etc.
2. Select "Break" → Text becomes "Need 2 @Break "
3. Type `@P` → Dropdown shows "PT", "Professional Development", etc.
4. Select "PT" → Text becomes "Need 2 @Break today and at least 30 mins of @PT"
5. Click outside or blur → Confirmation box appears:
   ```
   ✨ Jamie understood:
   [☕ 2× Break] [💪 1× PT]
   ```

## Benefits

✅ **No memorization needed** - See all available entities in the dropdown  
✅ **Visual confirmation** - Know immediately that Jamie understood  
✅ **Structured data** - Jamie can act on mentions (auto-schedule, prioritize, etc.)  
✅ **Disambiguation** - "PT" could mean many things; `@PT` is explicit  
✅ **Faster input** - Autocomplete is faster than typing full names

## Smart Pluralization

The mention system intelligently handles plurals, so you can type naturally:

- `@breaks` → matches "Break" routine
- `@pts` → matches "PT" routine  
- `@routines` → matches "Routine" entity
- `@activities` → matches "Activity" entity

**You don't need to remember exact names!** Just type `@break` or `@breaks` - both work.

Examples:
- ✅ "I need 2 @break today" → Matches "Break"
- ✅ "I need 2 @breaks today" → Also matches "Break"
- ✅ "@PT session" → Matches "PT"
- ✅ "@pts needed" → Also matches "PT"