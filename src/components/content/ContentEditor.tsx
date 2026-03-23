import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ChevronLeft,
  Save,
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  Wand2,
  ChevronDown,
  Sparkles,
  LayoutList
} from 'lucide-react';
import { JamiePanel } from './JamiePanel';
import type { ContentItem, ContentStatus, Platform } from '../../types/content';
import { platformPlaybook } from '../../config/platform_playbook';

interface ContentEditorProps {
  item: ContentItem;
  onClose: () => void;
  onSave: (updatedItem: ContentItem) => void;
}

export function ContentEditor({ item, onClose, onSave }: ContentEditorProps) {
  const [editedItem, setEditedItem] = useState<ContentItem>(item);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showJamiePanel, setShowJamiePanel] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Outline mode state - default ON for new items (no content yet)
  const [outlineMode, setOutlineMode] = useState<boolean>(() => {
    if (item.outlineMode !== undefined) return item.outlineMode;
    // Default to ON if content is empty (new item)
    return !item.content || item.content.trim() === '';
  });
  
  // Module drafts for outline mode
  const [moduleDrafts, setModuleDrafts] = useState<Record<string, string>>(() => {
    return item.moduleDraft || {};
  });
  
  // Jamie module help state
  const [activeModuleHelp, setActiveModuleHelp] = useState<string | null>(null);
  const [moduleSuggestions, setModuleSuggestions] = useState<Record<string, string[]>>({});

  // Auto-save every 30 seconds
  useEffect(() => {
    if (hasUnsavedChanges) {
      autoSaveTimerRef.current = setTimeout(() => {
        handleSave(true); // silent save
      }, 30000);
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [editedItem, hasUnsavedChanges]);

  // Update word count
  useEffect(() => {
    const words = editedItem.content.trim().split(/\s+/).filter(Boolean).length;
    if (words !== editedItem.wordCount) {
      setEditedItem(prev => ({ ...prev, wordCount: words }));
    }
  }, [editedItem.content]);

  const handleSave = (silent = false) => {
    // If in outline mode, consolidate drafts into content for persistence
    const contentForSave = outlineMode ? consolidateModulesToContent() : editedItem.content;
    
    const updatedItem = {
      ...editedItem,
      content: contentForSave,
      moduleDraft: moduleDrafts,
      outlineMode,
      lastUpdated: new Date().toISOString()
    };
    
    onSave(updatedItem);
    setEditedItem(updatedItem);
    setHasUnsavedChanges(false);
    
    if (!silent) {
      console.log('✅ Content saved:', updatedItem.title);
    }
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      const confirm = window.confirm('You have unsaved changes. Do you want to save before closing?');
      if (confirm) {
        handleSave();
      }
    }
    onClose();
  };

  const handleFieldChange = (field: keyof ContentItem, value: any) => {
    setEditedItem(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleFieldChange('content', e.target.value);
  };
  
  // Handle outline mode toggle
  const handleOutlineModeToggle = () => {
    const newOutlineMode = !outlineMode;
    
    if (newOutlineMode) {
      // Turning ON: Pull drafts from editedItem.moduleDraft (authoritative version)
      const restoredDrafts = (editedItem.moduleDraft && Object.keys(editedItem.moduleDraft).length > 0)
        ? editedItem.moduleDraft
        : moduleDrafts;
      
      setModuleDrafts(restoredDrafts);
      handleFieldChange('outlineMode', true);
      handleFieldChange('moduleDraft', restoredDrafts);
    } else {
      // Turning OFF: Consolidate modules into content
      const consolidatedContent = consolidateModulesToContent();
      handleFieldChange('content', consolidatedContent);
      handleFieldChange('outlineMode', false);
      handleFieldChange('moduleDraft', moduleDrafts); // Save current module state
    }
    
    setOutlineMode(newOutlineMode);
  };
  
  // Consolidate module drafts into single content string
  const consolidateModulesToContent = (): string => {
    if (!editedItem.platform || editedItem.platform === '') return editedItem.content;
    
    const platformData = platformPlaybook.platforms[editedItem.platform];
    if (!platformData || !platformData.modules) return editedItem.content;
    
    // Use single source of truth: prefer editedItem.moduleDraft, fallback to moduleDrafts
    const draftSource = editedItem.moduleDraft ?? moduleDrafts;
    
    const parts: string[] = [];
    platformData.modules.forEach(module => {
      const moduleContent = draftSource[module.key];
      if (moduleContent && moduleContent.trim()) {
        parts.push(moduleContent.trim());
      }
    });
    
    return parts.join('\n\n');
  };
  
  // Handle module content change
  const handleModuleChange = (moduleKey: string, value: string) => {
    const newModuleDrafts = { ...moduleDrafts, [moduleKey]: value };
    setModuleDrafts(newModuleDrafts);
    handleFieldChange('moduleDraft', newModuleDrafts);
    setHasUnsavedChanges(true);
  };
  
  // Generate Jamie suggestions for a module (stubbed for now)
  const handleGenerateModuleSuggestions = async (moduleKey: string) => {
    setActiveModuleHelp(moduleKey);
    
    // Stub: Generate 3-6 suggestions based on module context
    const platformData = editedItem.platform && platformPlaybook.platforms[editedItem.platform];
    const module = platformData?.modules?.find(m => m.key === moduleKey);
    
    if (!module) return;
    
    // Simple stub suggestions based on module type
    const suggestions: Record<string, string[]> = {
      hook: [
        "Here's something most teams miss...",
        "I keep seeing this pattern in patient experience:",
        "The hardest part about building healthcare tools?"
      ],
      context: [
        "Let me walk you through what I saw...",
        "Here's the situation most teams face:",
        "This is what happens in reality:"
      ],
      pov: [
        "Here's what this tells me about patient trust:",
        "The insight: workflows matter more than features.",
        "This is where most product teams get stuck:"
      ],
      takeaways: [
        "Three things to watch for:",
        "What to do differently:",
        "Questions to ask your team:"
      ],
      cta: [
        "What's your experience with this?",
        "Curious how others handle this — thoughts?",
        "Want to pressure-test this with a patient lens? DM me."
      ]
    };
    
    setModuleSuggestions({
      ...moduleSuggestions,
      [moduleKey]: suggestions[moduleKey] || ["Start here...", "Try this angle...", "Consider this:"]
    });
  };
  
  // Insert suggestion into module
  const handleInsertSuggestion = (moduleKey: string, suggestion: string) => {
    const currentContent = moduleDrafts[moduleKey] || '';
    const newContent = currentContent ? `${currentContent}\n\n${suggestion}` : suggestion;
    handleModuleChange(moduleKey, newContent);
    setActiveModuleHelp(null);
  };

  const platformColors = {
    'LI Post': '#879fb5',
    'LI Article': '#5f7e9a',
    'SS Post': '#deb0ad',
    'SS Audio': '#ce9490',
    '': '#a8998f'
  };

  const statusColors = {
    'Idea': '#ce9da4',
    'Drafting': '#a77e93',
    'Review': '#aec3c1',
    'Scheduled': '#83a5a7',
    'Published': '#9b91ac',
    'Repurposing': '#c6c6c3'
  };

  return (
    <div className="fixed inset-0 bg-white z-[9999] flex flex-col">
      {/* Header */}
      <div className="flex-none border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              title="Back to list"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <input
              type="text"
              value={editedItem.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              className="text-xl font-semibold border-none outline-none bg-transparent flex-1 min-w-0"
              placeholder="Untitled"
            />
            {hasUnsavedChanges && (
              <span className="text-sm text-gray-500 italic flex-shrink-0">Unsaved changes</span>
            )}
          </div>
          
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => handleSave()}
              className="flex items-center gap-2 px-4 py-2 bg-[#2f829b] text-white rounded-lg hover:bg-[#034863] transition-colors"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Metadata Bar */}
        <div className="flex items-center gap-4 px-4 pb-3">
          {/* Platform Selector */}
          <div className="relative">
            <select
              value={editedItem.platform}
              onChange={(e) => handleFieldChange('platform', e.target.value as Platform)}
              className="appearance-none px-3 py-1.5 pr-8 rounded-lg text-sm font-medium text-white cursor-pointer"
              style={{ backgroundColor: platformColors[editedItem.platform] }}
            >
              <option value="">Select Platform</option>
              <option value="LI Post">LI Post</option>
              <option value="LI Article">LI Article</option>
              <option value="SS Post">SS Post</option>
              <option value="SS Audio">SS Audio</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white pointer-events-none" />
          </div>

          {/* Status Selector */}
          <div className="relative">
            <select
              value={editedItem.status}
              onChange={(e) => handleFieldChange('status', e.target.value as ContentStatus)}
              className="appearance-none px-3 py-1.5 pr-8 rounded-lg text-sm font-medium text-white cursor-pointer"
              style={{ backgroundColor: statusColors[editedItem.status] }}
            >
              <option value="Idea">Idea</option>
              <option value="Drafting">Drafting</option>
              <option value="Review">Review</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Published">Published</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white pointer-events-none" />
          </div>

          {/* Word Count */}
          <div className="text-sm text-gray-600">
            {editedItem.wordCount} {editedItem.wordCount === 1 ? 'word' : 'words'}
          </div>

          {/* Source Link */}
          {editedItem.sourceUrl && (
            <a
              href={editedItem.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#2f829b] hover:text-[#034863] underline"
            >
              View Source
            </a>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Section */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Formatting Toolbar */}
          <div className="flex-none border-b border-gray-200 bg-gray-50 px-4 py-2">
            <div className="flex items-center gap-2">
              {!outlineMode && (
                <>
                  <button
                    onClick={() => insertText('**')}
                    className="p-2 hover:bg-gray-200 rounded transition-colors"
                    title="Bold"
                  >
                    <Bold className="w-4 h-4 text-gray-700" />
                  </button>
                  <button
                    onClick={() => insertText('*')}
                    className="p-2 hover:bg-gray-200 rounded transition-colors"
                    title="Italic"
                  >
                    <Italic className="w-4 h-4 text-gray-700" />
                  </button>
                  <div className="w-px h-6 bg-gray-300 mx-1" />
                  <button
                    onClick={() => insertText('- ', '\n')}
                    className="p-2 hover:bg-gray-200 rounded transition-colors"
                    title="Bullet List"
                  >
                    <List className="w-4 h-4 text-gray-700" />
                  </button>
                  <button
                    onClick={() => insertText('1. ', '\n')}
                    className="p-2 hover:bg-gray-200 rounded transition-colors"
                    title="Numbered List"
                  >
                    <ListOrdered className="w-4 h-4 text-gray-700" />
                  </button>
                  <div className="w-px h-6 bg-gray-300 mx-1" />
                  <button
                    onClick={() => insertText('[', '](url)')}
                    className="p-2 hover:bg-gray-200 rounded transition-colors"
                    title="Link"
                  >
                    <LinkIcon className="w-4 h-4 text-gray-700" />
                  </button>
                  <div className="w-px h-6 bg-gray-300 mx-1 ml-auto" />
                </>
              )}
              
              {/* Outline Mode Toggle */}
              {editedItem.platform && editedItem.platform !== '' && (
                <button
                  onClick={handleOutlineModeToggle}
                  className={`p-2 rounded transition-colors flex items-center gap-2 ${
                    outlineMode 
                      ? 'bg-[#6b2358] text-white' 
                      : 'hover:bg-gray-200 text-gray-700'
                  } ${!outlineMode ? 'ml-auto' : ''}`}
                  title="Toggle Outline Mode"
                >
                  <LayoutList className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {outlineMode ? 'Outline mode' : 'Draft mode'}
                  </span>
                </button>
              )}
              
              <button
                onClick={() => setShowJamiePanel(!showJamiePanel)}
                className="p-2 hover:bg-purple-100 rounded transition-colors flex items-center gap-2 ml-auto"
                title="Toggle Jamie Panel"
              >
                <Wand2 className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-600">
                  {showJamiePanel ? 'Hide' : 'Show'} Jamie
                </span>
              </button>
            </div>
          </div>

          {/* Editor Content - Conditional Rendering */}
          <div className="flex-1 overflow-auto p-6">
            {outlineMode && editedItem.platform && editedItem.platform !== '' ? (
              // Outline Mode: Show modules grid
              <OutlineModulesView
                platform={editedItem.platform}
                moduleDrafts={moduleDrafts}
                onModuleChange={handleModuleChange}
                activeModuleHelp={activeModuleHelp}
                moduleSuggestions={moduleSuggestions}
                onGenerateSuggestions={handleGenerateModuleSuggestions}
                onInsertSuggestion={handleInsertSuggestion}
                onCloseHelp={() => setActiveModuleHelp(null)}
              />
            ) : outlineMode && (!editedItem.platform || editedItem.platform === '') ? (
              // Outline mode but no platform selected
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md">
                  <LayoutList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Platform</h3>
                  <p className="text-sm text-gray-600">
                    Choose a platform above to use the outline mode with guided modules.
                  </p>
                </div>
              </div>
            ) : (
              // Normal Mode: Show single text editor
              <>
                <textarea
                  ref={textareaRef}
                  value={editedItem.content}
                  onChange={handleContentChange}
                  className="w-full h-full resize-none border-none outline-none text-lg leading-relaxed font-serif"
                  placeholder="Start writing your content..."
                  style={{ fontFamily: 'Lora, Georgia, serif' }}
                />
                {editedItem.content.trim() === '' && editedItem.moduleDraft && Object.keys(editedItem.moduleDraft).length > 0 && (
                  <div className="absolute top-20 left-0 right-0 mx-auto w-fit bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
                    <p className="font-medium">💡 Tip: Switch back to outline mode before drafting for module guidance.</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Notes Section */}
          {editedItem.notes && (
            <div className="flex-none border-t border-gray-200 bg-gray-50 p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={editedItem.notes}
                onChange={(e) => handleFieldChange('notes', e.target.value)}
                className="w-full h-20 resize-none border border-gray-300 rounded-lg p-2 text-sm"
                placeholder="Add notes or reminders..."
              />
            </div>
          )}
        </div>

        {/* Jamie Panel */}
        {showJamiePanel && (
          <div className="w-96 border-l border-gray-200 flex-none overflow-hidden">
            <JamiePanel
              contentItem={editedItem}
              onUpdate={(field, value) => {
                setEditedItem(prev => ({ ...prev, [field]: value }));
                setHasUnsavedChanges(true);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Outline Modules View Component
interface OutlineModulesViewProps {
  platform: Platform;
  moduleDrafts: Record<string, string>;
  onModuleChange: (moduleKey: string, value: string) => void;
  activeModuleHelp: string | null;
  moduleSuggestions: Record<string, string[]>;
  onGenerateSuggestions: (moduleKey: string) => void;
  onInsertSuggestion: (moduleKey: string, suggestion: string) => void;
  onCloseHelp: () => void;
}

function OutlineModulesView({
  platform,
  moduleDrafts,
  onModuleChange,
  activeModuleHelp,
  moduleSuggestions,
  onGenerateSuggestions,
  onInsertSuggestion,
  onCloseHelp
}: OutlineModulesViewProps) {
  const platformData = platformPlaybook.platforms[platform];
  
  if (!platformData || !platformData.modules) {
    return (
      <div className="text-center py-8 text-gray-500">
        No modules available for this platform.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-blue-900 mb-1">📋 Outline Mode Active</h3>
        <p className="text-xs text-blue-700">
          Fill in each module below. When you're done, toggle off outline mode to consolidate into a single draft.
        </p>
      </div>

      {platformData.modules.map((module, index) => (
        <div key={module.key} className="bg-white border-2 border-slate-200 rounded-lg p-5 shadow-sm">
          {/* Module Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-[#6b2358] text-white flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
                <h4 className="text-base font-semibold text-slate-900">{module.label}</h4>
              </div>
              <p className="text-sm text-slate-600 ml-8">{module.description}</p>
            </div>
            
            {/* Jamie Help Button */}
            <button
              onClick={() => onGenerateSuggestions(module.key)}
              className="flex-shrink-0 p-2 hover:bg-purple-50 rounded-lg transition-colors"
              title="Get Jamie's help"
            >
              <Sparkles className="w-4 h-4 text-[#6b2358]" />
            </button>
          </div>

          {/* Module Textarea */}
          <textarea
            value={moduleDrafts[module.key] || ''}
            onChange={(e) => onModuleChange(module.key, e.target.value)}
            placeholder={module.placeholder || `Write your ${module.label.toLowerCase()} here...`}
            rows={module.key === 'hook' ? 3 : module.key === 'cta' ? 2 : 5}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6b2358] focus:border-transparent resize-none font-serif text-base leading-relaxed"
            style={{ fontFamily: 'Lora, Georgia, serif' }}
          />

          {/* Jamie Suggestions Panel */}
          {activeModuleHelp === module.key && moduleSuggestions[module.key] && (
            <div className="mt-3 bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-sm font-semibold text-purple-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Jamie's Suggestions
                </h5>
                <button
                  onClick={onCloseHelp}
                  className="text-purple-600 hover:text-purple-800 text-xs"
                >
                  Close
                </button>
              </div>
              <div className="space-y-2">
                {moduleSuggestions[module.key].map((suggestion, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 p-2 bg-white rounded border border-purple-100 hover:border-purple-300 transition-colors"
                  >
                    <p className="text-sm text-slate-700 flex-1">{suggestion}</p>
                    <button
                      onClick={() => onInsertSuggestion(module.key, suggestion)}
                      className="flex-shrink-0 px-2 py-1 text-xs bg-[#6b2358] text-white rounded hover:bg-[#5e2350] transition-colors"
                    >
                      Insert
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}