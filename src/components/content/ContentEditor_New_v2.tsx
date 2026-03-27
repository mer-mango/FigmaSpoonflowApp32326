import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronDown,
  Save,
  Sparkles,
  Calendar,
  Mic,
  RefreshCw,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Link,
  Quote
} from 'lucide-react';
import { toast } from 'sonner';
import type { ContentItem, ContentStatus, Platform } from '../../types/content';
import { platformPlaybook } from '../../config/platform_playbook';
import { PageHeader_Muted } from '../PageHeader_Muted';
import { ExpandableWorkDrawer } from './ExpandableWorkDrawer';
import { useNotifications } from '../../contexts/NotificationContext';
import { DraftOptionsDisplay } from './DraftOptionsDisplay';

interface ContentEditorNewProps {
  item: ContentItem;
  onClose: () => void;
  onSave: (updatedItem: ContentItem) => void;
  onQuickAddSelect?: (type: 'task' | 'contact' | 'content') => void;
  onJamieAction?: (type: 'plan-day' | 'wind-down' | 'post-meeting' | 'chat' | 'dev-skip-to-timeline') => void;
}

interface DraftStructuralElement {
  hook: string;
  context: string;
  yourTake: string;
  makeItUsable: string;
  cta: string;
}

interface DraftOption {
  id: number;
  jamiesThoughts: string;
  relevantMainPoints: string[];
  relevantQuotes: string[];
  structuralSuggestions: DraftStructuralElement;
}

export function ContentEditorNew({ item, onClose, onSave, onQuickAddSelect, onJamieAction }: ContentEditorNewProps) {
  const [editedItem, setEditedItem] = useState<ContentItem>(item);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { notifyContentScheduled } = useNotifications();
  const editorRef = useRef<HTMLTextAreaElement>(null);
  
  // Drawer state - collapsed by default
  const [drawerExpanded, setDrawerExpanded] = useState(false);
  
  // Dropdown states for platform and status
  const [showPlatformDropdown, setShowPlatformDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  
  // Brain dump field
  const [brainDump, setBrainDump] = useState('');
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  
  // Draft options (2 full drafts)
  const [draftOptions, setDraftOptions] = useState<DraftOption[]>([]);

  // Editor content
  const [editorContent, setEditorContent] = useState(() => {
    if (item.content && item.content.trim()) {
      return item.content;
    }
    return '';
  });

  // Platform and status colors
  const platformColors: Record<Platform, string> = {
    'LI Post': '#879fb5',
    'LI Article': '#5f7e9a',
    'SS Post': '#deb0ad',
    'SS Audio': '#ce9490',
    '': '#999999'
  };
  
  const statusColors: Record<ContentStatus, string> = {
    'Idea': '#ce9da4',
    'Drafting': '#a77e93',
    'Review': '#aec3c1',
    'Scheduled': '#83a5a7',
    'Published': '#9b91ac',
    'Repurposing': '#c6c6c3'
  };
  
  // Auto-save every 30 seconds
  useEffect(() => {
    if (hasUnsavedChanges) {
      autoSaveTimerRef.current = setTimeout(() => {
        handleSave(true);
      }, 30000);
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [editorContent, hasUnsavedChanges]);

  const handleSave = (silent = false) => {
    const updatedItem = {
      ...editedItem,
      content: editorContent,
      lastUpdated: new Date().toISOString()
    };
    
    onSave(updatedItem);
    setEditedItem(updatedItem);
    setHasUnsavedChanges(false);
    
    if (!silent) {
      console.log('✅ Content saved:', updatedItem.title);
    }
  };

  const handleEditorChange = (value: string) => {
    setEditorContent(value);
    setHasUnsavedChanges(true);
  };

  const handleTitleChange = (value: string) => {
    setEditedItem(prev => ({ ...prev, title: value }));
    setHasUnsavedChanges(true);
  };

  const handlePlatformChange = (platform: Platform) => {
    setEditedItem(prev => ({ ...prev, platform }));
    setHasUnsavedChanges(true);
  };

  const handleStatusChange = (status: ContentStatus) => {
    setEditedItem(prev => ({ ...prev, status }));
    setHasUnsavedChanges(true);
  };
  
  const handlePublishDateChange = (publishDate: string) => {
    const previousDate = editedItem.publishDate;
    setEditedItem(prev => ({ ...prev, publishDate }));
    setHasUnsavedChanges(true);
    
    // Send notification if date is set and it's a future date
    if (publishDate && publishDate !== previousDate) {
      notifyContentScheduled(
        editedItem.id,
        editedItem.title,
        publishDate,
        editedItem.platform || 'Content'
      );
      toast.success(`Publish date set: ${new Date(publishDate).toLocaleDateString()}`);
    }
  };

  // Handle voice input
  const handleVoiceInput = () => {
    if (!isVoiceRecording) {
      // Start recording
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        toast.error('Speech recognition is not supported in this browser.');
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsVoiceRecording(true);
        toast.success('Voice recording started');
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        // Update brain dump with transcribed text
        if (finalTranscript) {
          setBrainDump(prev => prev ? `${prev} ${finalTranscript}` : finalTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsVoiceRecording(false);
        if (event.error !== 'aborted') {
          toast.error(`Voice input error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsVoiceRecording(false);
      };

      // Store recognition instance in a ref for cleanup
      (window as any).__activeRecognition = recognition;
      recognition.start();
    } else {
      // Stop recording
      const recognition = (window as any).__activeRecognition;
      if (recognition) {
        recognition.stop();
        (window as any).__activeRecognition = null;
      }
      setIsVoiceRecording(false);
      toast.success('Voice recording stopped');
    }
  };

  // Generate draft modules from all content
  const handleGenerateDraftPuzzlePieces = async () => {
    toast.info('Jamie is organizing your content...');
    // TODO: Call AI to generate modules from summary, main points, quotes, and brain dump
    // For now, show a mock response
    setTimeout(() => {
      setDraftOptions([
        {
          id: 1,
          jamiesThoughts: 'Draft 1: This draft focuses on the key points and provides a clear structure for the content.',
          relevantMainPoints: ['Point 1', 'Point 2', 'Point 3'],
          relevantQuotes: ['"Quote 1"', '"Quote 2"'],
          structuralSuggestions: {
            hook: 'Generated hook based on your content...',
            context: 'Generated context from your brain dump...',
            yourTake: 'Your perspective based on main points...',
            makeItUsable: 'Key takeaways compiled...',
            cta: 'Suggested call to action...'
          }
        },
        {
          id: 2,
          jamiesThoughts: 'Draft 2: This draft emphasizes the importance of the topic and provides a different angle.',
          relevantMainPoints: ['Point A', 'Point B', 'Point C'],
          relevantQuotes: ['"Quote X"', '"Quote Y"'],
          structuralSuggestions: {
            hook: 'Alternative hook based on your content...',
            context: 'Alternative context from your brain dump...',
            yourTake: 'Alternative perspective based on main points...',
            makeItUsable: 'Alternative key takeaways compiled...',
            cta: 'Alternative suggested call to action...'
          }
        }
      ]);
      toast.success('Draft puzzle pieces generated!');
    }, 1500);
  };

  // Regenerate individual field
  const handleRegenerateField = (field: 'summary' | 'mainPoints' | 'quotes' | 'brainDump' | 'hook' | 'context' | 'pov' | 'takeaways' | 'cta') => {
    toast.info(`Regenerating ${field}...`);
    // TODO: Implement actual regeneration logic
    setTimeout(() => {
      toast.success(`${field} regenerated!`);
    }, 1000);
  };

  // Add all brainstorming content to editor
  const handleAddAllToEditor = () => {
    let content = editorContent;
    
    if (editedItem.summary) {
      content += content ? '\n\nSummary:\n' + editedItem.summary : 'Summary:\n' + editedItem.summary;
    }
    
    if (editedItem.mainPoints && editedItem.mainPoints.length > 0) {
      content += '\n\nMain Points:\n' + editedItem.mainPoints.map(p => `• ${p}`).join('\n');
    }
    
    if (editedItem.importantQuotes && editedItem.importantQuotes.length > 0) {
      content += '\n\nImportant Quotes:\n' + editedItem.importantQuotes.map(q => `"${q}"`).join('\n');
    }
    
    if (brainDump.trim()) {
      content += '\n\nBrain Dump:\n' + brainDump;
    }
    
    if (draftOptions.length > 0) {
      const selectedDraft = draftOptions[0].structuralSuggestions; // For now, use the first draft
      if (selectedDraft.hook) content += '\n\nHook:\n' + selectedDraft.hook;
      if (selectedDraft.context) content += '\n\nContext / Micro-story:\n' + selectedDraft.context;
      if (selectedDraft.yourTake) content += '\n\nYour take:\n' + selectedDraft.yourTake;
      if (selectedDraft.makeItUsable) content += '\n\nMake it usable:\n' + selectedDraft.makeItUsable;
      if (selectedDraft.cta) content += '\n\nCTA:\n' + selectedDraft.cta;
    }
    
    setEditorContent(content);
    setHasUnsavedChanges(true);
    toast.success('Added all content to editor!');
  };

  // Rich text formatting functions
  const applyFormatting = (prefix: string, suffix: string = '') => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = editorContent.substring(start, end);
    const beforeText = editorContent.substring(0, start);
    const afterText = editorContent.substring(end);

    let newText: string;
    let newCursorPos: number;

    if (selectedText) {
      // Wrap selected text
      newText = beforeText + prefix + selectedText + suffix + afterText;
      newCursorPos = start + prefix.length + selectedText.length + suffix.length;
    } else {
      // Insert formatting at cursor
      newText = beforeText + prefix + suffix + afterText;
      newCursorPos = start + prefix.length;
    }

    setEditorContent(newText);
    setHasUnsavedChanges(true);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const insertAtCursor = (text: string) => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const beforeText = editorContent.substring(0, start);
    const afterText = editorContent.substring(start);

    const newText = beforeText + text + afterText;
    const newCursorPos = start + text.length;

    setEditorContent(newText);
    setHasUnsavedChanges(true);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleBold = () => applyFormatting('**', '**');
  const handleItalic = () => applyFormatting('_', '_');
  const handleUnderline = () => applyFormatting('<u>', '</u>');
  const handleHeading1 = () => insertAtCursor('\n# ');
  const handleHeading2 = () => insertAtCursor('\n## ');
  const handleHeading3 = () => insertAtCursor('\n### ');
  const handleBulletList = () => insertAtCursor('\n• ');
  const handleNumberedList = () => insertAtCursor('\n1. ');
  const handleQuote = () => insertAtCursor('\n> ');
  
  const handleLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      applyFormatting('[', `](${url})`);
    }
  };

  // Get publish URL based on platform
  const getPublishUrl = () => {
    switch (editedItem.platform) {
      case 'LI Post':
        return 'https://www.linkedin.com/feed/?shareActive=true';
      case 'LI Article':
        return 'https://www.linkedin.com/article/new/';
      case 'SS Post':
        return 'https://empowerhealthstrategies.substack.com/publish/post';
      case 'SS Audio':
        return 'https://substack.com/publish?tab=podcast';
      default:
        return null;
    }
  };
  
  const publishUrl = getPublishUrl();

  // Handle publish click - copy content to clipboard
  const handlePublishClick = async () => {
    try {
      await navigator.clipboard.writeText(editedItem.content || '');
      toast.success('Content copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      toast.error('Failed to copy content');
    }
  };

  // Get platform modules
  const getPlatformModules = () => {
    const platformKey = editedItem.platform as keyof typeof platformPlaybook.platforms;
    const platformData = platformPlaybook.platforms[platformKey];
    return platformData?.modules || [];
  };

  const platformModules = getPlatformModules();

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Page Header */}
      <PageHeader_Muted
        title={editedItem.title || 'Untitled'}
        showBackButton
        onBack={onClose}
        onQuickAddSelect={onQuickAddSelect}
        onJamieAction={onJamieAction}
      />
      
      {/* Header Bar */}
      <div className="bg-white border-b border-slate-200 px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Title Input */}
          
          
          {/* Metadata + Actions */}
          <div className="flex items-center gap-3">
            {/* Platform Pill */}
            <div className="relative">
              <button
                onClick={() => setShowPlatformDropdown(!showPlatformDropdown)}
                className="px-3 py-1.5 text-xs font-medium text-white rounded-full hover:opacity-90 transition-opacity flex items-center gap-1.5"
                style={{ backgroundColor: platformColors[editedItem.platform] }}
              >
                {editedItem.platform || 'Select platform'}
                <ChevronDown className="w-3 h-3" />
              </button>
              
              {showPlatformDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50 min-w-[140px]">
                  {(['LI Post', 'LI Article', 'SS Post', 'SS Audio'] as Platform[]).map((platform) => (
                    <button
                      key={platform}
                      onClick={() => {
                        handlePlatformChange(platform);
                        setShowPlatformDropdown(false);
                        toast.success(`Platform changed to ${platform}`);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: platformColors[platform] }}
                        />
                        {platform}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Status Pill */}
            <div className="relative">
              <button
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className="px-3 py-1.5 text-xs font-medium text-white rounded-full hover:opacity-90 transition-opacity flex items-center gap-1.5"
                style={{ backgroundColor: statusColors[editedItem.status] }}
              >
                {editedItem.status}
                <ChevronDown className="w-3 h-3" />
              </button>
              
              {showStatusDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50 min-w-[140px]">
                  {(['Idea', 'Drafting', 'Review', 'Scheduled', 'Published', 'Repurposing'] as ContentStatus[]).map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        handleStatusChange(status);
                        setShowStatusDropdown(false);
                        toast.success(`Status changed to ${status}`);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: statusColors[status] }}
                        />
                        {status}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Publish Date */}
            <div className="relative">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                <Calendar className="w-3 h-3 text-slate-600" />
                <input
                  type="date"
                  value={editedItem.publishDate || ''}
                  onChange={(e) => handlePublishDateChange(e.target.value)}
                  className="text-xs font-medium text-slate-700 bg-transparent border-none outline-none cursor-pointer"
                  placeholder="Set publish date"
                />
              </div>
            </div>
            
            {/* Publish to Platform Button */}
            {publishUrl && (
              <a
                href={publishUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handlePublishClick}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white text-sm rounded-lg transition-colors"
              >
                Publish to {editedItem.platform}
              </a>
            )}
            
            {/* Save Button */}
            <button
              onClick={() => handleSave(false)}
              disabled={!hasUnsavedChanges}
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
                hasUnsavedChanges
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  : 'bg-slate-50 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Save className="w-4 h-4" />
              {hasUnsavedChanges ? 'Save' : 'Saved'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-6 space-y-4">
          
          {/* Rich Text Toolbar */}
          <div className="flex items-center gap-1 py-2 border-b border-slate-200">
            {/* Bold */}
            <button
              onClick={handleBold}
              className="p-2 hover:bg-slate-100 rounded transition-colors"
              title="Bold (Ctrl+B)"
            >
              <Bold className="w-4 h-4 text-slate-600" />
            </button>

            {/* Italic */}
            <button
              onClick={handleItalic}
              className="p-2 hover:bg-slate-100 rounded transition-colors"
              title="Italic (Ctrl+I)"
            >
              <Italic className="w-4 h-4 text-slate-600" />
            </button>

            {/* Underline */}
            <button
              onClick={handleUnderline}
              className="p-2 hover:bg-slate-100 rounded transition-colors"
              title="Underline (Ctrl+U)"
            >
              <Underline className="w-4 h-4 text-slate-600" />
            </button>

            <div className="w-px h-6 bg-slate-200 mx-1" />

            {/* Heading 1 */}
            <button
              onClick={handleHeading1}
              className="p-2 hover:bg-slate-100 rounded transition-colors"
              title="Heading 1"
            >
              <Heading1 className="w-4 h-4 text-slate-600" />
            </button>

            {/* Heading 2 */}
            <button
              onClick={handleHeading2}
              className="p-2 hover:bg-slate-100 rounded transition-colors"
              title="Heading 2"
            >
              <Heading2 className="w-4 h-4 text-slate-600" />
            </button>

            {/* Heading 3 */}
            <button
              onClick={handleHeading3}
              className="p-2 hover:bg-slate-100 rounded transition-colors"
              title="Heading 3"
            >
              <Heading3 className="w-4 h-4 text-slate-600" />
            </button>

            <div className="w-px h-6 bg-slate-200 mx-1" />

            {/* Bullet List */}
            <button
              onClick={handleBulletList}
              className="p-2 hover:bg-slate-100 rounded transition-colors"
              title="Bullet List"
            >
              <List className="w-4 h-4 text-slate-600" />
            </button>

            {/* Numbered List */}
            <button
              onClick={handleNumberedList}
              className="p-2 hover:bg-slate-100 rounded transition-colors"
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4 text-slate-600" />
            </button>

            <div className="w-px h-6 bg-slate-200 mx-1" />

            {/* Quote */}
            <button
              onClick={handleQuote}
              className="p-2 hover:bg-slate-100 rounded transition-colors"
              title="Quote"
            >
              <Quote className="w-4 h-4 text-slate-600" />
            </button>

            {/* Link */}
            <button
              onClick={handleLink}
              className="p-2 hover:bg-slate-100 rounded transition-colors"
              title="Insert Link"
            >
              <Link className="w-4 h-4 text-slate-600" />
            </button>

            <div className="flex-1" />

            <span className="text-xs text-slate-400">Markdown formatting</span>
          </div>

          {/* Collapsible Draft Builder Drawer */}
          <ExpandableWorkDrawer
            title="Draft Builder"
            summary="Jamie's content plan + your brain dump"
            isExpanded={drawerExpanded}
            onToggle={() => setDrawerExpanded(!drawerExpanded)}
            icon={<Sparkles className="w-4 h-4 text-[#6b2358]" />}
          >
            <div className="space-y-6">
              
              {/* Jamie-Generated Content (Read-only) */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-slate-800">From Content Planning Wizard</h4>
                
                {/* Summary */}
                {editedItem.summary && (
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="text-xs font-medium text-blue-900">Jamie-generated summary</div>
                      <button
                        onClick={() => handleRegenerateField('summary')}
                        className="text-xs text-blue-700 hover:text-blue-900 flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Regenerate
                      </button>
                    </div>
                    <p className="text-sm text-blue-800">{editedItem.summary}</p>
                  </div>
                )}
                
                {/* Main Points */}
                {editedItem.mainPoints && editedItem.mainPoints.length > 0 && (
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-medium text-blue-900">Main points</div>
                      <button
                        onClick={() => handleRegenerateField('mainPoints')}
                        className="text-xs text-blue-700 hover:text-blue-900 flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Regenerate
                      </button>
                    </div>
                    <ul className="space-y-1.5">
                      {editedItem.mainPoints.map((point, idx) => (
                        <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
                          <span className="text-blue-600 mt-0.5">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Important Quotes */}
                {editedItem.importantQuotes && editedItem.importantQuotes.length > 0 && (
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-medium text-blue-900">Important quotes</div>
                      <button
                        onClick={() => handleRegenerateField('quotes')}
                        className="text-xs text-blue-700 hover:text-blue-900 flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Regenerate
                      </button>
                    </div>
                    <ul className="space-y-1.5">
                      {editedItem.importantQuotes.map((quote, idx) => (
                        <li key={idx} className="text-sm text-blue-800 italic flex items-start gap-2">
                          <span className="text-blue-600 mt-0.5">"</span>
                          <span>{quote}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* POV/Angle Suggestions */}
                {editedItem.selectedPovAngles && editedItem.selectedPovAngles.length > 0 && (
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-medium text-blue-900">POV/Angle Suggestions</div>
                    </div>
                    <ul className="space-y-1.5">
                      {editedItem.selectedPovAngles.map((angle, idx) => (
                        <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
                          <span className="text-blue-600 mt-0.5">→</span>
                          <span>{angle}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Notes */}
                {editedItem.notes && (
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="text-xs font-medium text-blue-900">Notes</div>
                    </div>
                    <p className="text-sm text-blue-800 whitespace-pre-wrap">{editedItem.notes}</p>
                  </div>
                )}
              </div>

              {/* Brain Dump Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-800">Brain Dump</h4>
                  <div className="flex items-center gap-2">
                    {brainDump.trim() && (
                      <button
                        onClick={() => handleRegenerateField('brainDump')}
                        className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Regenerate
                      </button>
                    )}
                    <button
                      onClick={handleVoiceInput}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        isVoiceRecording
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <Mic className="w-4 h-4" />
                      {isVoiceRecording ? 'Stop' : 'Voice input'}
                    </button>
                  </div>
                </div>
                <textarea
                  value={brainDump}
                  onChange={(e) => setBrainDump(e.target.value)}
                  placeholder="Type or speak your thoughts, ideas, examples, stories... anything that comes to mind about this content."
                  rows={8}
                  className="w-full px-4 py-3 text-sm border border-slate-200 rounded-lg resize-none outline-none focus:ring-2 focus:ring-[#6b2358] focus:border-transparent"
                />
                
                {/* Generate Button */}
                <button
                  onClick={handleGenerateDraftPuzzlePieces}
                  disabled={!brainDump.trim() && !editedItem.summary && !editedItem.mainPoints?.length}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#6b2358] hover:bg-[#6b2358]/90 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
                >
                  <Sparkles className="w-4 h-4" />
                  Ask Jamie to generate 2 draft options from this info
                </button>
              </div>

              {/* Draft Options - Show after generation */}
              {draftOptions.length > 0 && (
                <DraftOptionsDisplay
                  draftOptions={draftOptions}
                  setDraftOptions={setDraftOptions}
                  setEditorContent={setEditorContent}
                  setHasUnsavedChanges={setHasUnsavedChanges}
                  onRegenerateAll={handleGenerateDraftPuzzlePieces}
                />
              )}
            </div>
          </ExpandableWorkDrawer>

          {/* Main Editor Area - Google Doc Style */}
          <div className="bg-white pt-8">
            <textarea
              ref={editorRef}
              value={editorContent}
              onChange={(e) => handleEditorChange(e.target.value)}
              placeholder="Start writing..."
              className="w-full min-h-[calc(100vh-400px)] px-0 py-0 text-base border-none outline-none focus:ring-0 font-serif text-slate-800 leading-relaxed resize-none"
              style={{ 
                lineHeight: '1.8',
                fontSize: '16px'
              }}
            />
          </div>

        </div>
      </div>
    </div>
  );
}