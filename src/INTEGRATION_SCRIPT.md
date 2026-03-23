# Jamie Panel Integration Instructions

## What to Replace in `/ContentEditor.tsx`

### 1. Find and Delete Lines 734-1003
These lines contain the old Jamie panel. You need to delete everything from:

```typescript
      {/* Right Sidebar - Jamie Panel */}
      <div className="w-96 bg-white border-l border-slate-200 flex flex-col overflow-y-auto">
```

All the way down to (and including):

```typescript
        )}
      </div>
```

(Just before the `{/* Brain Dump Modal */}` comment)

### 2. Replace with This Single Component:

```typescript
      {/* Right Sidebar - Jamie Panel */}
      <JamiePanel
        contentItem={item}
        onUpdate={(field, value) => onUpdate(item.id, field, value)}
        onInsertBlueprint={() => setShowBlueprintTemplate(true)}
        onPublish={() => {
          toast.success('Publishing to ' + item.platform);
        }}
      />
```

### 3. Remove Old State Variables (Optional Cleanup)

These state variables in ContentEditor are no longer needed:
- `brainDumpOpen` (line ~79)
- Usage of `setBrainDumpOpen` (toolbar button around line ~700)

The Brain Dump button is now inside the Jamie Panel itself.

### 4. Remove Old Brain Dump Modal

Delete these lines (around line 1005-1012):

```typescript
      {/* Brain Dump Modal */}
      <BrainDumpModal
        isOpen={brainDumpOpen}
        onClose={() => setBrainDumpOpen(false)}
        onInsert={handleInsertBrainDump}
        context="content"
        contentType={item.platform}
      />
```

The new Jamie Panel has its own Brain Dump Modal inside.

### 5. Remove Old Brain Dump Button from Toolbar

Find this button in the formatting toolbar (around line ~697) and delete it:

```typescript
              <button 
                onClick={() => setBrainDumpOpen(true)}
                className="px-3 py-1.5 bg-[#f5fafb] hover:bg-[#ddecf0] text-[#2f829b] rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <Wand2 className="w-3.5 h-3.5" />
                Brain Dump
              </button>
```

The Brain Dump functionality is now in the Jamie Panel (right sidebar).

---

## Result

After these changes, your ContentEditor will:
- ✅ Use the new redesigned Jamie Panel
- ✅ Have Brain Dump modal accessible from Jamie Panel
- ✅ Have source analysis auto-generation
- ✅ Have all collapsible sections per mockup
- ✅ Have cleaner code with less duplication
