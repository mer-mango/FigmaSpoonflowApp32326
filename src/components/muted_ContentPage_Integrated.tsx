import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Lightbulb, 
  Sparkles,
  ChevronRight,
  MoreHorizontal,
  ExternalLink,
  Filter,
  ChevronDown,
  ArrowUpDown,
  GripVertical,
  Edit3,
  FileText,
  Plus,
  ChevronLeft,
  LayoutGrid,
  List,
  RefreshCw,
  Eye,
  Wand2
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { ContentPlanningWizard } from './content/ContentPlanningWizard';
import { RepurposingModal } from './content/RepurposingModal';
import { PageHeader_Muted } from './PageHeader_Muted';
import ContentKanbanView from './muted/content/ContentKanbanView';
import { QuickPreviewModal } from './muted/content/QuickPreviewModal';
import { FirstDraftPopup } from './content/FirstDraftPopup';
import { PublishedContentViewer } from './content/PublishedContentViewer';
import { ContentEditor } from './content/ContentEditor';
import { useNotifications } from '../contexts/NotificationContext';
import type { ContentItem, ContentStatus, Platform, RepurposeOutput } from '../types/content';
import { 
  requestContentStatusChange,
  type RepurposeDecision
} from '../utils/contentActions';
import { projectId, publicAnonKey } from '../utils/supabase/info';

// Safe ID generation with fallback
const makeId = () =>
  (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
    ? crypto.randomUUID()
    : `c_${Date.now()}_${Math.random().toString(16).slice(2)}`;

// Format date for display
const formatDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

// Parse repurpose URL params: ?source=<id>&repurposes=<id1,id2,id3>
const parseRepurposeParams = (search: string): { sourceId?: string; repurposeIds: string[] } => {
  const params = new URLSearchParams(search);
  const sourceId = params.get('source') || undefined;
  const repurposesParam = params.get('repurposes') || '';
  const repurposeIds = repurposesParam ? repurposesParam.split(',').filter(Boolean) : [];
  
  return { sourceId, repurposeIds };
};

type ViewMode = 'table' | 'kanban';

type ViewState = 
  | { type: 'table' }
  | { type: 'filtered'; filterType: 'status' | 'platform'; filterValue: ContentStatus | Platform }
  | { type: 'viewer'; itemId: string }; // For viewing published content

interface ContentPageIntegratedProps {
  onQuickAddSelect: (type: 'task' | 'contact' | 'content' | 'voice') => void;
  onJamieAction: (action: 'plan-day' | 'wind-down' | 'post-meeting' | 'chat') => void;
  contentItems: ContentItem[];
  setContentItems: React.Dispatch<React.SetStateAction<ContentItem[]>>;
  onBack?: () => void;
  onOpenEditor: (itemId: string) => void;
}

// Sample Inbox Data - will be moved to state for dynamic updates
const initialInboxItems: any[] = [];

const initialContentItems: ContentItem[] = [];

const DEFAULT_COLUMN_ORDER = ['title', 'platform', 'publishDate', 'status', 'source'];

export default function MutedContentPageIntegrated({ onQuickAddSelect, onJamieAction, contentItems, setContentItems, onBack, onOpenEditor }: ContentPageIntegratedProps) {
  const { addNotification } = useNotifications();
  const [viewState, setViewState] = useState<ViewState>({ type: 'table' });
  
  // contentItems and setContentItems are now passed as props from App.tsx
  // No need for local state or localStorage persistence here
  
  const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null);
  const [showInboxMenu, setShowInboxMenu] = useState<string | null>(null);
  const [inboxExpanded, setInboxExpanded] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [pillsExpanded, setPillsExpanded] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState<ContentStatus | null>(null);
  const [filterPlatform, setFilterPlatform] = useState<Platform | 'Undecided' | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'platform' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Editing states for inline dropdowns
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  
  // Column ordering
  const [columnOrder, setColumnOrder] = useState(DEFAULT_COLUMN_ORDER);
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  
  // Column visibility
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(['title', 'platform', 'publishDate', 'status', 'source'])
  );

  const toggleColumnVisibility = (columnKey: string) => {
    setVisibleColumns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(columnKey)) {
        // Don't allow hiding title column
        if (columnKey === 'title') return prev;
        newSet.delete(columnKey);
      } else {
        newSet.add(columnKey);
      }
      return newSet;
    });
  };

  // New feature states
  const [showContentWizard, setShowContentWizard] = useState(false);
  const [wizardItemId, setWizardItemId] = useState<string>(''); // Track which item wizard is editing
  const [showRepurposingModal, setShowRepurposingModal] = useState(false);
  const [repurposingPost, setRepurposingPost] = useState<ContentItem | null>(null);
  const [repurposingTriggeredByPublish, setRepurposingTriggeredByPublish] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  
  // Quick Preview modal state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<{
    title: string;
    source?: string;
    sourceUrl?: string;
    date?: string;
    content?: string;
    snippet?: string;
    summary?: string;
  } | null>(null);

  // Inbox state
  const [inboxItems, setInboxItems] = useState(initialInboxItems);

  // Track content item created from inbox (for potential future focus/editing behavior)
  const [inboxCreatedContentId, setInboxCreatedContentId] = useState<string | null>(null);

  // Expose add to inbox function for Jamie (web search integration)
  const handleAddSearchResultToInbox = (result: {
    title: string;
    url: string;
    description: string;
    source: string;
    published?: string;
  }) => {
    const newInboxItem = {
      id: makeId(),
      title: result.title,
      source: result.source,
      sourceUrl: result.url,
      date: result.published || new Date().toISOString(),
      snippet: result.description,
      fullBody: result.description,
      fromWebSearch: true // Mark as coming from web search
    };

    setInboxItems(prev => [newInboxItem, ...prev]);
    setInboxExpanded(true); // Auto-expand to show new item
    
    return newInboxItem.id;
  };

  // Register the function globally so Jamie can call it
  useEffect(() => {
    (window as any).__addToContentInbox = handleAddSearchResultToInbox;
    
    return () => {
      delete (window as any).__addToContentInbox;
    };
  }, []);

  // URL param focusing state
  const [focusedSourceId, setFocusedSourceId] = useState<string | undefined>();
  const [focusedRepurposeIds, setFocusedRepurposeIds] = useState<string[]>([]);
  const firstFocusedItemRef = useRef<HTMLDivElement | null>(null);

  // First Draft Popup state (PROMPT 3)
  const [showFirstDraftPopup, setShowFirstDraftPopup] = useState(false);
  const [firstDraftItemId, setFirstDraftItemId] = useState<string>('');

  // Parse URL params on mount and handle scroll
  useEffect(() => {
    const { sourceId, repurposeIds } = parseRepurposeParams(window.location.search);
    
    if (sourceId || repurposeIds.length > 0) {
      // Store for focus highlighting
      setFocusedSourceId(sourceId);
      setFocusedRepurposeIds(repurposeIds);
      
      console.log(`📍 Navigation params detected: source=${sourceId}, repurposes=[${repurposeIds.join(', ')}]`);
      
      // Auto-scroll to parent item after render (children will be underneath)
      setTimeout(() => {
        if (firstFocusedItemRef.current) {
          firstFocusedItemRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 300);
    }
  }, []); // Run only on mount
  
  // Check if we should open an item in editor mode (from wizard completion)
  // This runs on every render to catch changes from wizard navigation
  useEffect(() => {
    const itemToOpenInEditor = sessionStorage.getItem('openContentItemInEditor');
    if (itemToOpenInEditor) {
      sessionStorage.removeItem('openContentItemInEditor');
      console.log(`📝 Opening content item in editor: ${itemToOpenInEditor}`);
      setTimeout(() => {
        onOpenEditor(itemToOpenInEditor);
      }, 100);
    }
  }); // No dependencies - runs on every render to catch new items

  const platformColors = {
    'LI Post': '#879fb5',
    'LI Article': '#5f7e9a',
    'SS Post': '#deb0ad',
    'SS Audio': '#ce9490'
  };
  
  const statusColors = {
    'Idea': '#ce9da4',
    'Drafting': '#a77e93',
    'Review': '#aec3c1',
    'Scheduled': '#83a5a7',
    'Published': '#9b91ac',
    'Repurposing': '#c6c6c3'
  };

  // Calculate counts for pills
  const statusCounts = {
    'Idea': contentItems.filter(c => c.status === 'Idea').length,
    'Drafting': contentItems.filter(c => c.status === 'Drafting').length,
    'Review': contentItems.filter(c => c.status === 'Review').length,
    'Scheduled': contentItems.filter(c => c.status === 'Scheduled').length,
    'Published': contentItems.filter(c => c.status === 'Published').length,
    'Repurposing': contentItems.filter(c => c.status === 'Repurposing').length,
  };

  const platformCounts = {
    'LI Post': contentItems.filter(c => c.platform === 'LI Post').length,
    'LI Article': contentItems.filter(c => c.platform === 'LI Article').length,
    'SS Post': contentItems.filter(c => c.platform === 'SS Post').length,
    'SS Audio': contentItems.filter(c => c.platform === 'SS Audio').length,
  };

  // Update content item
  const updateContentItem = (id: string, field: string, value: any) => {
    // Special handling for status changes
    if (field === 'status') {
      const item = contentItems.find(i => i.id === id);
      if (!item) return;

      console.log(`\n🔄 Status change requested for "${item.title}": ${item.status} → ${value}`);

      const decision: RepurposeDecision = requestContentStatusChange(item, value as ContentStatus);

      console.log(`📋 Decision: ${decision.action}`);

      if (decision.action === 'prompt-repurpose') {
        console.log(`🚀 Prompting for repurposing (status not yet changed)`);
        // Don't finalize status yet - prompt user first
        setRepurposingPost(decision.item);
        setRepurposingTriggeredByPublish(true); // Mark as triggered by publish
        setShowRepurposingModal(true);
        setEditingCell(null);
        return;
      }

      console.log(`✅ Applying status change directly: "${item.title}" → ${decision.newStatus}`);
      
      // Otherwise, apply the status change
      setContentItems(prev => prev.map(i => 
        i.id === id ? { ...i, status: decision.newStatus } : i
      ));
      setEditingCell(null);
      return;
    }

    // Non-status field changes: apply directly
    setContentItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
    setEditingCell(null);
  };

  // Manual repurposing trigger
  const openRepurposingModal = (itemId: string) => {
    const item = contentItems.find(i => i.id === itemId);
    if (!item) return;
    
    setRepurposingPost(item);
    setRepurposingTriggeredByPublish(false); // Mark as manual trigger
    setShowRepurposingModal(true);
  };

  // Check if item can start manual repurposing
  const canStartManualRepurposing = (item: ContentItem): boolean => {
    const isCorrectStatus = item.status === 'Published' || item.status === 'Repurposing';
    const hasNoChildren = !item.repurpose?.childrenIds?.length;
    return isCorrectStatus && hasNoChildren;
  };

  // Repurposing Modal Handlers
  const handleRepurposingComplete = (outputs: RepurposeOutput[]) => {
    if (!repurposingPost) return;

    const nowISO = new Date().toISOString();
    const sourceId = repurposingPost.id;

    // If user submits 0 selections, treat it like skip (optional but consistent UX)
    if (outputs.length === 0) {
      handleRepurposingSkip();
      return;
    }

    // Generate child IDs outside setContentItems so we can use them for Jamie CTA
    const childIds = outputs.map(() => makeId());

    setContentItems((prev: ContentItem[]) => {
      const source = prev.find(i => i.id === sourceId);
      if (!source) return prev;

      // ✅ Idempotent: if children already exist, don't recreate
      if (source.repurpose?.childrenIds?.length) return prev;

      const children: ContentItem[] = outputs.map((o, idx) => ({
        id: childIds[idx],
        title: o.title,
        platform: o.platform,
        status: 'Idea',
        scheduledDate: '',
        publishedDate: '',
        publishedUrl: '',
        source: source.source,
        sourceUrl: source.sourceUrl,
        content:
          o.notes ??
          `Repurposed from: ${source.title}\n\nOriginal platform: ${source.platform}\n\n---\n\n${source.content}`,
        repurposeMeta: {
          sourceId,
          createdFromPublish: repurposingTriggeredByPublish || undefined,
          createdAtISO: nowISO,
        },
        // Set startedDraftingAtISO to prevent First Draft Popup
        startedDraftingAtISO: nowISO,
      }));

      const updatedSource: ContentItem = {
        ...source,
        status: 'Repurposing',
        repurpose: {
          ...(source.repurpose ?? {}),
          initiatedAtISO: nowISO,
          childrenIds: childIds,
        },
      };

      // Notification removed - using Jamie CTA banner instead
      // addNotification({
      //   id: makeId(),
      //   type: 'content-repurpose-created',
      //   title: 'Repurposing Created',
      //   message: `Created ${children.length} new ${children.length === 1 ? 'idea' : 'ideas'} from "${source.title}"`,
      //   timestamp: nowISO,
      //   read: false,
      //   category: 'content',
      // });

      console.log(`✅ Created ${children.length} repurposed items from "${source.title}"`);
      console.log(`✅ Moved "${source.title}" to Repurposing status`);
      console.log(`✅ createdFromPublish: ${repurposingTriggeredByPublish}`);

      // Put updated source back + append children
      return prev.map(i => (i.id === sourceId ? updatedSource : i)).concat(children);
    });

    setShowRepurposingModal(false);
    setRepurposingPost(null);
    setRepurposingTriggeredByPublish(false);
  };

  const handleRepurposingSkip = () => {
    if (!repurposingPost) return;

    const nowISO = new Date().toISOString();
    const sourceId = repurposingPost.id;

    setContentItems((prev: ContentItem[]) =>
      prev.map(i => {
        if (i.id !== sourceId) return i;

        // ✅ If children already exist, don't mark skipped
        if (i.repurpose?.childrenIds?.length) return i;

        return {
          ...i,
          status: 'Published',
          repurpose: {
            ...(i.repurpose ?? {}),
            skippedAtISO: i.repurpose?.skippedAtISO ?? nowISO,
          },
        };
      })
    );

    console.log(`✅ Skipped repurposing for "${repurposingPost.title}" (won't prompt again)`);

    setShowRepurposingModal(false);
    setRepurposingPost(null);
    setRepurposingTriggeredByPublish(false);
  };

  const handleRepurposingClose = () => {
    setShowRepurposingModal(false);
    setRepurposingPost(null);
    setRepurposingTriggeredByPublish(false);
  };

  // Inbox Action Handlers
  const handleSaveAsIdea = (inboxItem: typeof inboxItems[0], silent = false): string => {
    // Create new content item from inbox item
    // Platform starts as "undecided" (empty string) - user will decide during planning/drafting
    const newContentItem: ContentItem = {
      id: makeId(),
      title: inboxItem.title,
      platform: '',  // Undecided - will be set during Content Planning Wizard or manual selection
      status: 'Idea',
      scheduledDate: '',
      publishedDate: '',
      publishedUrl: '',
      source: inboxItem.source,
      sourceUrl: inboxItem.sourceUrl,
      content: inboxItem.snippet
    };

    setContentItems(prev => [newContentItem, ...prev]);
    
    // Remove from inbox
    setInboxItems(prev => prev.filter(item => item.id !== inboxItem.id));
    
    if (!silent) {
      toast.success(`"${inboxItem.title}" saved as Idea`);
    }

    console.log(`💡 Saved inbox item as Idea: ${inboxItem.title} (ID: ${newContentItem.id})`);
    console.log(`🗑️ Removed item from inbox: ${inboxItem.id}`);
    
    return newContentItem.id;
  };

  const handleFetchNewsletters = async () => {
    const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-a89809a8`;
    
    try {
      setSyncing(true);
      const response = await fetch(`${serverUrl}/rss-feeds/fetch`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📰 Fetched RSS posts:', data.posts);
        
        // Convert RSS posts to inbox items
        const newInboxItems = data.posts.map((post: any) => {
          // Strip HTML tags from content for snippet
          const plainText = post.content.replace(/<[^>]*>/g, '');
          const snippet = plainText.substring(0, 300);
          
          return {
            id: makeId(),
            title: post.title || 'Untitled Post',
            source: post.feed_name || post.author || 'Unknown',
            sourceUrl: post.url,
            date: post.published_at || new Date().toISOString(),
            snippet: snippet,
            fullBody: post.content || '',
            // Store URL so users can access the original post
            postUrl: post.url
          };
        });
        
        // Add to inbox (prepend so newest are first)
        setInboxItems(prev => [...newInboxItems, ...prev]);
        
        // Auto-expand inbox to show new items
        setInboxExpanded(true);
        
        if (newInboxItems.length > 0) {
          toast.success(`Added ${newInboxItems.length} posts to Idea Inbox!`);
        } else {
          toast.info('No new posts found. Your feeds may not have recent updates.');
        }
      } else {
        const error = await response.json();
        console.error('❌ Failed to fetch RSS feeds:', error);
        toast.error(`Failed to fetch posts: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error fetching RSS feeds:', error);
      toast.error('Failed to fetch posts. Check console for details.');
    } finally {
      setSyncing(false);
    }
  };

  const handleQuickPreviewInbox = (inboxItem: typeof inboxItems[0]) => {
    setPreviewData({
      title: inboxItem.title,
      source: inboxItem.source,
      sourceUrl: inboxItem.sourceUrl,
      date: inboxItem.date,
      // Use full body for preview, fall back to snippet
      snippet: inboxItem.fullBody || inboxItem.snippet,
      summary: undefined // Inbox items don't have summaries yet
    });
    setPreviewOpen(true);
    setShowInboxMenu(null); // Close the actions menu
  };

  const handleQuickPreviewContent = (contentItem: ContentItem) => {
    setPreviewData({
      title: contentItem.title,
      source: contentItem.source,
      sourceUrl: contentItem.sourceUrl,
      date: contentItem.scheduledDate ? new Date(contentItem.scheduledDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }) : undefined,
      content: contentItem.content,
      summary: undefined // We don't have a summary field yet, will add in wizard
    });
    setPreviewOpen(true);
    setShowActionsMenu(null); // Close the actions menu
  };

  const handleSaveAsIdeaAndOpenEditor = (inboxItem: typeof inboxItems[0]) => {
    // Save as idea (silently - we'll show a combined toast)
    const newContentId = handleSaveAsIdea(inboxItem, true);
    
    // Store the ID for potential future focus/editing behavior
    setInboxCreatedContentId(newContentId);
    
    // Get the newly created item to check if we should show first-time popup
    const newItem = contentItems.find(i => i.id === newContentId);
    
    if (newItem && shouldShowFirstDraftPopup(newItem)) {
      // Show first-time drafting gate popup
      setFirstDraftItemId(newContentId);
      setShowFirstDraftPopup(true);
    }
    
    // Open editor
    onOpenEditor(newContentId);
    
    toast.success(`Saved idea and opened editor`);

    console.log(`📝 Saved as Idea and opened editor: ${inboxItem.title} (ID: ${newContentId})`);
  };

  const handleDismissInboxItem = (inboxItemId: string) => {
    const item = inboxItems.find(i => i.id === inboxItemId);
    
    setInboxItems(prev => prev.filter(i => i.id !== inboxItemId));
    
    toast.message(item ? `"${item.title}" removed from inbox` : 'Item dismissed');

    console.log(`🗑️ Dismissed inbox item: ${inboxItemId}`);
  };

  // Handle Quick Add → Content (create new Idea and open wizard)
  const handleQuickAddContent = () => {
    // Create blank Idea item with startedDraftingAtISO already set
    const newId = makeId();
    const newItem: ContentItem = {
      id: newId,
      title: 'New Content Idea',
      platform: '',
      status: 'Idea',
      scheduledDate: '',
      publishedDate: '',
      publishedUrl: '',
      source: '',
      sourceUrl: '',
      content: '',
      // Empty planning fields
      summary: '',
      notes: '',
      audiences: [],
      goals: [],
      length: '',
      // Mark as started so First Draft Popup doesn't show
      startedDraftingAtISO: new Date().toISOString()
    };
    
    setContentItems(prev => [newItem, ...prev]);
    
    // DON'T change view state - stay on table view
    // Just open wizard modal for this new item
    setWizardItemId(newId);
    setShowContentWizard(true);
    
    console.log(`📝 Quick Add → Content: Created new Idea and opening wizard: ${newId}`);
  };

  // Filter and sort content (with parent-child grouping)
  const getFilteredAndSortedContent = () => {
    let filtered = [...contentItems];
    
    console.log(`🔍 FILTERING - Starting with ${filtered.length} items`);
    console.log(`   Active filters: status="${filterStatus}", platform="${filterPlatform}"`);
    
    // Apply filters
    if (filterStatus) {
      const beforeCount = filtered.length;
      filtered = filtered.filter(item => item.status === filterStatus);
      console.log(`   Status filter "${filterStatus}": ${beforeCount} → ${filtered.length} items`);
    }
    if (filterPlatform) {
      const beforeCount = filtered.length;
      if (filterPlatform === 'Undecided') {
        // Show items with empty/missing platform
        filtered = filtered.filter(item => !item.platform);
      } else {
        filtered = filtered.filter(item => item.platform === filterPlatform);
      }
      console.log(`   Platform filter "${filterPlatform}": ${beforeCount} → ${filtered.length} items`);
    }
    
    // Separate parents and children
    const parents = filtered.filter(item => !item.repurposedFromId);
    const children = filtered.filter(item => item.repurposedFromId);
    
    // Apply sorting to parents only
    if (sortBy) {
      parents.sort((a, b) => {
        let compareResult = 0;
        
        if (sortBy === 'date') {
          compareResult = new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
        } else if (sortBy === 'status') {
          const statusOrder: Record<ContentStatus, number> = {
            'Idea': 0,
            'Drafting': 1,
            'Review': 2,
            'Scheduled': 3,
            'Published': 4,
            'Repurposing': 5
          };
          compareResult = statusOrder[a.status as ContentStatus] - statusOrder[b.status as ContentStatus];
        } else if (sortBy === 'platform') {
          compareResult = a.platform.localeCompare(b.platform);
        }
        
        return sortDirection === 'asc' ? compareResult : -compareResult;
      });
    }
    
    // Build grouped array: parent followed by its children
    const grouped: typeof filtered = [];
    parents.forEach(parent => {
      grouped.push(parent);
      
      // Find and add children of this parent
      const parentChildren = children.filter(child => child.repurposedFromId === parent.id);
      grouped.push(...parentChildren);
    });
    
    return grouped;
  };

  const filteredContent = getFilteredAndSortedContent();
  console.log(`🔄 RENDER - Total items: ${contentItems.length}, Filtered: ${filteredContent.length}`);
  console.log(`   All filtered titles:`, filteredContent.map(i => i.title));
  console.log(`   All filtered IDs:`, filteredContent.map(i => i.id));

  /**
   * shouldShowFirstDraftPopup
   * 
   * Returns true for all Idea items, allowing the popup to appear every time
   */
  const shouldShowFirstDraftPopup = (item: ContentItem): boolean => {
    return item.status === 'Idea';
  };

  const handleTitleClick = (itemId: string) => {
    const item = contentItems.find(i => i.id === itemId);
    
    if (!item) return;
    
    // If item is Published, show viewer instead of editor
    if (item.status === 'Published') {
      setViewState({ type: 'viewer', itemId });
      return;
    }
    
    // For Idea items, show the popup
    if (shouldShowFirstDraftPopup(item)) {
      setFirstDraftItemId(itemId);
      setShowFirstDraftPopup(true);
      onOpenEditor(itemId);
    } else {
      // Go directly to editor for Drafting, Review, Scheduled, Repurposing
      onOpenEditor(itemId);
    }
  };

  const handlePillClick = (filterType: 'status' | 'platform', filterValue: ContentStatus | Platform) => {
    setViewState({ type: 'filtered', filterType, filterValue });
  };

  const handleBackToTable = () => {
    setViewState({ type: 'table' });
  };

  // First Draft Popup handlers (PROMPT 3)
  const handleStartDrafting = () => {
    const nowISO = new Date().toISOString();
    const item = contentItems.find(i => i.id === firstDraftItemId);
    
    if (item) {
      // Mark as started drafting
      setContentItems(prev => prev.map(i => 
        i.id === firstDraftItemId 
          ? { ...i, startedDraftingAtISO: nowISO }
          : i
      ));
      
      console.log(`📝 User chose "Go to editor" for: ${item.title}`);
    }
    
    setShowFirstDraftPopup(false);
    // Stay in editor (already set by handleTitleClick)
  };

  const handleOpenWizard = () => {
    const nowISO = new Date().toISOString();
    const item = contentItems.find(i => i.id === firstDraftItemId);
    
    if (item) {
      // Mark as started via wizard
      setContentItems(prev => prev.map(i => 
        i.id === firstDraftItemId 
          ? { ...i, startedDraftingAtISO: nowISO }
          : i
      ));
      
      console.log(`✨ User chose "Open Content Planning Wizard" for: ${item.title}`);
    }
    
    setShowFirstDraftPopup(false);
    
    // Open wizard modal for this specific item
    setWizardItemId(firstDraftItemId);
    setShowContentWizard(true);
  };

  const handleCloseFirstDraftPopup = () => {
    setShowFirstDraftPopup(false);
    // Also go back to table view since user cancelled
    setViewState({ type: 'table' });
  };

  // Format date as MM/DD/YY
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${month}/${day}/${year}`;
  };

  // Column drag handlers
  const handleDragStart = (e: React.DragEvent, columnKey: string) => {
    setDraggedColumn(columnKey);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetColumn: string) => {
    e.preventDefault();
    
    if (!draggedColumn || draggedColumn === targetColumn) {
      setDraggedColumn(null);
      return;
    }

    const newOrder = [...columnOrder];
    const draggedIndex = newOrder.indexOf(draggedColumn);
    const targetIndex = newOrder.indexOf(targetColumn);
    
    // Remove dragged column and insert at target position
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedColumn);
    
    setColumnOrder(newOrder);
    setDraggedColumn(null);
  };

  // Column labels
  const columnLabels: Record<string, string> = {
    title: 'Title',
    platform: 'Platform',
    publishDate: 'Publish Date',
    status: 'Status',
    source: 'Source'
  };

  // Render cell content
  const renderCell = (columnKey: string, item: any) => {
    switch (columnKey) {
      case 'title':
        return (
          <div className="flex flex-col gap-1">
            <button
              onClick={() => handleTitleClick(item.id)}
              className="text-xs text-slate-900 hover:text-[#2f829b] transition-colors text-left"
              style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}
            >
              {item.title}
            </button>
            
            {/* Child item: show source badge */}
            {item.repurposeMeta && (() => {
              const sourceItem = contentItems.find(c => c.id === item.repurposeMeta.sourceId);
              if (!sourceItem) return null;
              
              return (
                <div className="flex items-center gap-1.5">
                  <span 
                    className="px-2 py-0.5 rounded-full text-[9px] font-medium text-white whitespace-nowrap"
                    style={{ backgroundColor: '#a8998f' }}
                  >
                    Repurposed
                  </span>
                  <button
                    onClick={() => handleTitleClick(sourceItem.id)}
                    className="text-[10px] text-[#a8998f] hover:text-[#938aa9] transition-colors text-left flex items-center gap-1"
                  >
                    <span className="opacity-70">from:</span>
                    <span className="underline">{sourceItem.title}</span>
                  </button>
                </div>
              );
            })()}
            
            {/* Source item: show children count */}
            {item.repurpose?.childrenIds?.length > 0 && (
              <button
                onClick={() => {
                  // Filter to show only children
                  const childrenIds = item.repurpose.childrenIds;
                  console.log('Show children:', childrenIds);
                  // TODO: Could open a modal or set a custom filter
                }}
                className="text-[10px] text-slate-500 hover:text-slate-700 transition-colors text-left"
              >
                {item.repurpose.childrenIds.length} {item.repurpose.childrenIds.length === 1 ? 'repurpose' : 'repurposes'} created
              </button>
            )}
          </div>
        );
      
      case 'platform':
        if (!item.platform) {
          // Undecided state - show blank with click to select
          return (
            <button
              onClick={() => setEditingCell({ id: item.id, field: 'platform' })}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              —
            </button>
          );
        }
        return editingCell?.id === item.id && editingCell?.field === 'platform' ? (
          <select
            value={item.platform}
            onChange={(e) => updateContentItem(item.id, 'platform', e.target.value)}
            onBlur={() => setEditingCell(null)}
            autoFocus
            className="text-[10px] font-medium px-2 py-0.5 rounded-full border-2 border-slate-300"
          >
            <option value="">Undecided</option>
            <option value="LI Post">LI Post</option>
            <option value="LI Article">LI Article</option>
            <option value="SS Post">SS Post</option>
            <option value="SS Audio">SS Audio</option>
          </select>
        ) : (
          <button
            onClick={() => setEditingCell({ id: item.id, field: 'platform' })}
            className="px-2 py-0.5 rounded-full text-[10px] font-medium text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: platformColors[item.platform as Platform] }}
          >
            {item.platform}
          </button>
        );
      

      case 'publishDate':
        return editingCell?.id === item.id && editingCell?.field === 'scheduledDate' ? (
          <input
            type="date"
            value={item.scheduledDate}
            onChange={(e) => updateContentItem(item.id, 'scheduledDate', e.target.value)}
            onBlur={() => setEditingCell(null)}
            autoFocus
            className="text-xs text-slate-600 px-2 py-1 border-2 border-slate-300 rounded"
          />
        ) : (
          <button
            onClick={() => setEditingCell({ id: item.id, field: 'scheduledDate' })}
            className="text-xs text-slate-600 hover:text-slate-900 transition-colors"
          >
            {item.scheduledDate ? formatDate(item.scheduledDate) : '—'}
          </button>
        );
      
      case 'status':
        return editingCell?.id === item.id && editingCell?.field === 'status' ? (
          <select
            value={item.status}
            onChange={(e) => updateContentItem(item.id, 'status', e.target.value)}
            onBlur={() => setEditingCell(null)}
            autoFocus
            className="text-[10px] font-medium px-2 py-0.5 rounded-full border-2 border-slate-300"
          >
            <option value="Idea">Idea</option>
            <option value="Drafting">Drafting</option>
            <option value="Review">Review</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Published">Published</option>
            <option value="Repurposing">Repurposing</option>
          </select>
        ) : (
          <button
            onClick={() => setEditingCell({ id: item.id, field: 'status' })}
            className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: statusColors[item.status as ContentStatus] }}
          >
            {item.status}
          </button>
        );
      
      case 'source':
        return (
          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#2f829b] hover:text-[#034863] underline transition-colors"
          >
            {item.source}
          </a>
        );
      
      default:
        return null;
    }
  };

  // Render right-side content based on view state
  const renderMainContent = () => {
    // If viewer view, show published content viewer
    if (viewState.type === 'viewer') {
      const item = contentItems.find(i => i.id === viewState.itemId);
      if (!item) {
        setViewState({ type: 'table' });
        return null;
      }
      
      return (
        <PublishedContentViewer
          item={item}
          onClose={handleBackToTable}
          onRepurpose={() => {
            openRepurposingModal(item.id);
            setViewState({ type: 'table' });
          }}
        />
      );
    }

    // If filtered view, show filtered table
    if (viewState.type === 'filtered') {
      return (
        <div className="p-6 text-center text-gray-500">
          <p>Content Filtered View component temporarily disabled</p>
          <p className="text-sm mt-2">ContentFilteredView component was removed during cleanup</p>
          <button 
            onClick={handleBackToTable}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Back to Table
          </button>
        </div>
      );
    }

    // Main table view (no extra wrapper, already in flex layout)
    return (
      <div className="space-y-3">
        {/* Filter/Sort and View Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Filter & Sort */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors"
            >
              <Filter className="w-3.5 h-3.5" />
              Filter & Sort
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  viewMode === 'table'
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                Table
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  viewMode === 'kanban'
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Kanban
              </button>
            </div>
          </div>
        </div>
          
        {showFilters && (
          <div className="mt-3 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {/* Status Filter */}
              <div>
                <label className="text-[10px] font-medium text-slate-500 mb-1.5 block uppercase tracking-wide">Status</label>
                <select
                  value={filterStatus || ''}
                  onChange={(e) => setFilterStatus(e.target.value as ContentStatus || null)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="">All Statuses</option>
                  <option value="Idea">Idea</option>
                  <option value="Drafting">Drafting</option>
                  <option value="Review">Review</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Published">Published</option>
                  <option value="Repurposing">Repurposing</option>
                </select>
              </div>
              
              {/* Platform Filter */}
              <div>
                <label className="text-[10px] font-medium text-slate-500 mb-1.5 block uppercase tracking-wide">Platform</label>
                <select
                  value={filterPlatform || ''}
                  onChange={(e) => setFilterPlatform((e.target.value as Platform | 'Undecided') || null)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="">All Platforms</option>
                  <option value="Undecided">Undecided</option>
                  <option value="LI Post">LI Post</option>
                  <option value="LI Article">LI Article</option>
                  <option value="SS Post">SS Post</option>
                  <option value="SS Audio">SS Audio</option>
                </select>
              </div>
              
              {/* Sort */}
              <div>
                <label className="text-[10px] font-medium text-slate-500 mb-1.5 block uppercase tracking-wide">Sort By</label>
                <div className="flex gap-2">
                  <select
                    value={sortBy || ''}
                    onChange={(e) => setSortBy(e.target.value as any || null)}
                    className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="">None</option>
                    <option value="date">Date</option>
                    <option value="status">Status</option>
                    <option value="platform">Platform</option>
                  </select>
                  <button
                    onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                    className="px-2.5 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                  >
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Column Visibility Controls */}
            <div>
              <label className="text-[10px] font-medium text-slate-500 mb-2 block uppercase tracking-wide">Visible Columns</label>
              <div className="flex flex-wrap gap-3">
                {DEFAULT_COLUMN_ORDER.map((columnKey) => (
                  <label 
                    key={columnKey} 
                    className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer hover:text-slate-900 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={visibleColumns.has(columnKey)}
                      onChange={() => toggleColumnVisibility(columnKey)}
                      disabled={columnKey === 'title'}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-[#2f829b] focus:ring-[#2f829b] focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <span className={columnKey === 'title' ? 'opacity-50' : ''}>
                      {columnLabels[columnKey]}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {(filterStatus || filterPlatform || sortBy) && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] text-slate-400">Active:</span>
            {filterStatus && (
              <button
                onClick={() => setFilterStatus(null)}
                className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] flex items-center gap-1"
              >
                {filterStatus}
                <X className="w-2.5 h-2.5" />
              </button>
            )}
            {filterPlatform && (
              <button
                onClick={() => setFilterPlatform(null)}
                className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] flex items-center gap-1"
              >
                {filterPlatform}
                <X className="w-2.5 h-2.5" />
              </button>
            )}
            {sortBy && (
              <button
                onClick={() => setSortBy(null)}
                className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] flex items-center gap-1"
              >
                Sort: {sortBy}
                <X className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
        )}
        
        {/* Render based on view mode */}
        {viewMode === 'kanban' ? (
          <ContentKanbanView
            contentItems={filteredContent}
            onItemClick={handleTitleClick}
            onUpdateItem={updateContentItem}
            focusedSourceId={focusedSourceId}
            focusedRepurposeIds={focusedRepurposeIds}
            firstFocusedItemRef={firstFocusedItemRef}
          />
        ) : (
          <div className="bg-white rounded-xl border border-slate-200">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {columnOrder.filter(col => visibleColumns.has(col)).map((columnKey) => (
                    <th
                      key={columnKey}
                      draggable
                      onDragStart={(e) => handleDragStart(e, columnKey)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, columnKey)}
                      className={`px-8 py-2.5 text-left text-[10px] font-medium text-slate-500 uppercase tracking-wider cursor-move hover:bg-slate-100 transition-colors ${
                        draggedColumn === columnKey ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <GripVertical className="w-3 h-3 text-slate-400" />
                        {columnLabels[columnKey]}
                      </div>
                    </th>
                  ))}
                  <th className="px-8 py-2.5 text-left text-[10px] font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredContent.map((item, index) => {
                  console.log(`🎨 Rendering row ${index}: ${item.id} - ${item.title}`);
                  const isChild = !!item.repurposedFromId;
                  const isSource = focusedSourceId === item.id;
                  const isNewlyCreated = item.title.includes('TEST') || item.title === 'New Content Idea';
                  
                  return (
                    <tr 
                      key={item.id} 
                      ref={isSource ? firstFocusedItemRef : null}
                      className={`transition-colors hover:bg-slate-50 ${
                        isChild ? 'bg-slate-50/30' : ''
                      } ${isNewlyCreated ? 'bg-yellow-100' : ''}`}
                      style={isNewlyCreated ? { 
                        backgroundColor: 'yellow',
                        border: '5px solid red',
                        minHeight: '100px'
                      } : undefined}
                    >
                      {columnOrder.filter(col => visibleColumns.has(col)).map((columnKey) => (
                        <td 
                          key={columnKey} 
                          className={`px-8 py-3 ${
                            columnKey === 'title' && isChild ? 'pl-16' : ''
                          }`}
                        >
                          {columnKey === 'title' && isChild ? (
                            <div className="flex items-start gap-2">
                              <span className="text-slate-400 text-xs mt-1">└─</span>
                              {renderCell(columnKey, item)}
                            </div>
                          ) : (
                            renderCell(columnKey, item)
                          )}
                        </td>
                      ))}
                      
                      <td className="px-8 py-3 relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowActionsMenu(showActionsMenu === item.id ? null : item.id);
                          }}
                          className="text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                        
                        {/* Actions Menu */}
                        {showActionsMenu === item.id && (
                          <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-slate-200 py-1 w-48 z-50">
                            <button 
                              onClick={() => {
                                handleQuickPreviewContent(item);
                              }}
                              className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 text-left transition-colors flex items-center gap-2"
                            >
                              <Eye className="w-3 h-3" />
                              Quick Preview
                            </button>
                            <button 
                              onClick={() => {
                                setWizardItemId(item.id);
                                setShowContentWizard(true);
                                setShowActionsMenu(null);
                              }}
                              className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 text-left transition-colors flex items-center gap-2"
                            >
                              <Wand2 className="w-3 h-3" />
                              Open in Wizard
                            </button>
                            <button 
                              onClick={() => {
                                handleTitleClick(item.id);
                                setShowActionsMenu(null);
                              }}
                              className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 text-left transition-colors flex items-center gap-2"
                            >
                              <Edit3 className="w-3 h-3" />
                              Open in Editor
                            </button>
                            {canStartManualRepurposing(item) && (
                              <button 
                                onClick={() => {
                                  openRepurposingModal(item.id);
                                  setShowActionsMenu(null);
                                }}
                                className="w-full px-3 py-1.5 text-xs text-[#2f829b] hover:bg-[#f5fafb] text-left transition-colors flex items-center gap-2"
                              >
                                <RefreshCw className="w-3 h-3" />
                                Start Repurposing
                              </button>
                            )}
                            <button 
                              onClick={() => {
                                console.log('Duplicate:', item.id);
                                setShowActionsMenu(null);
                              }}
                              className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 text-left transition-colors flex items-center gap-2"
                            >
                              <FileText className="w-3 h-3" />
                              Duplicate
                            </button>
                            <div className="border-t border-slate-200 my-1"></div>
                            <button 
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to delete "${item.title}"?`)) {
                                  setContentItems(prev => prev.filter(i => i.id !== item.id));
                                  toast.success('Content deleted');
                                }
                                setShowActionsMenu(null);
                              }}
                              className="w-full px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 text-left transition-colors flex items-center gap-2"
                            >
                              <X className="w-3 h-3" />
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* PageHeader WITHOUT filter pills */}
      <PageHeader_Muted
        title="Content"
        onQuickAddSelect={onQuickAddSelect}
        onJamieAction={onJamieAction}
        onBack={onBack}
        showBackButton={!!onBack}
      />

      {/* Main Content Area with neutral background */}
      <div className="flex-1 overflow-y-auto p-8" style={{ backgroundColor: '#f7f7f9' }}>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Horizontal Idea Inbox - Collapsible */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-6 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <button
                onClick={() => setInboxExpanded(!inboxExpanded)}
                className="flex items-center gap-3 flex-1"
              >
                <Lightbulb className="w-5 h-5 text-slate-600" />
                <h3 className="text-lg font-medium text-slate-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Idea Inbox
                </h3>
                {inboxExpanded ? (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                )}
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleFetchNewsletters();
                }}
                disabled={syncing}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-2 text-xs text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Fetching...' : 'Fetch Latest Posts'}
              </button>
            </div>

            {inboxExpanded && (
              <div className="px-6 pb-6 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  {inboxItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-slate-50 rounded-lg border border-slate-200 p-4 hover:bg-white transition-colors relative group"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <h4 className="flex-1 text-sm font-medium text-slate-900" style={{ fontFamily: 'Lora, serif' }}>
                          {item.title}
                        </h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowInboxMenu(showInboxMenu === item.id ? null : item.id);
                          }}
                          className="flex-shrink-0 p-1 text-slate-400 hover:text-slate-600 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Actions Menu */}
                      {showInboxMenu === item.id && (
                        <div className="absolute right-2 top-12 bg-white rounded-lg shadow-lg border border-slate-200 py-1 w-56 z-50">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickPreviewInbox(item);
                            }}
                            className="w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 text-left transition-colors flex items-center gap-2"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Quick Preview
                          </button>
                          {item.sourceUrl && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(item.sourceUrl, '_blank');
                                setShowInboxMenu(null);
                              }}
                              className="w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 text-left transition-colors flex items-center gap-2"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              View Original Post
                            </button>
                          )}
                          <div className="border-t border-slate-200 my-1"></div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveAsIdea(item);
                              setShowInboxMenu(null);
                            }}
                            className="w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 text-left transition-colors flex items-center gap-2"
                          >
                            <Lightbulb className="w-3.5 h-3.5" />
                            Save as Idea
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveAsIdeaAndOpenEditor(item);
                              setShowInboxMenu(null);
                            }}
                            className="w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 text-left transition-colors flex items-center gap-2"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            Save Idea + Open Editor
                          </button>
                          <div className="border-t border-slate-200 my-1"></div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDismissInboxItem(item.id);
                              setShowInboxMenu(null);
                            }}
                            className="w-full px-4 py-2 text-sm text-slate-500 hover:bg-slate-50 text-left transition-colors flex items-center gap-2"
                          >
                            <X className="w-3.5 h-3.5" />
                            Dismiss
                          </button>
                        </div>
                      )}

                      <div className="text-xs text-slate-500 mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        {item.source} • {formatDate(item.date)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Main Content Table with Left Pill Column */}
          <div className="flex gap-6">
            {/* Left Pills Column - Collapsible */}
            {pillsExpanded ? (
              <div className="flex flex-col gap-3 pt-2" style={{ width: '160px' }}>
                {/* Collapse button */}
                <button
                  onClick={() => setPillsExpanded(false)}
                  className="flex items-center justify-center p-2 text-slate-400 hover:text-slate-600 transition-colors mb-1"
                  title="Collapse filters"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Status Pills */}
                <button
                  onClick={() => handlePillClick('status', 'Idea')}
                  className="px-4 py-2 rounded-full text-xs transition-all hover:opacity-90 whitespace-nowrap text-white flex items-center justify-between"
                  style={{ backgroundColor: '#ce9da4', fontWeight: 500 }}
                >
                  <span>Idea</span>
                  <span className="ml-2 bg-white/30 px-2 py-0.5 rounded-full">{statusCounts.Idea}</span>
                </button>

                <button
                  onClick={() => handlePillClick('status', 'Drafting')}
                  className="px-4 py-2 rounded-full text-xs transition-all hover:opacity-90 whitespace-nowrap text-white flex items-center justify-between"
                  style={{ backgroundColor: '#a77e93', fontWeight: 500 }}
                >
                  <span>Drafting</span>
                  <span className="ml-2 bg-white/30 px-2 py-0.5 rounded-full">{statusCounts.Drafting}</span>
                </button>

                <button
                  onClick={() => handlePillClick('status', 'Review')}
                  className="px-4 py-2 rounded-full text-xs transition-all hover:opacity-90 whitespace-nowrap text-white flex items-center justify-between"
                  style={{ backgroundColor: '#aec3c1', fontWeight: 500 }}
                >
                  <span>Review</span>
                  <span className="ml-2 bg-white/30 px-2 py-0.5 rounded-full">{statusCounts.Review}</span>
                </button>

                <button
                  onClick={() => handlePillClick('status', 'Scheduled')}
                  className="px-4 py-2 rounded-full text-xs transition-all hover:opacity-90 whitespace-nowrap text-white flex items-center justify-between"
                  style={{ backgroundColor: '#83a5a7', fontWeight: 500 }}
                >
                  <span>Scheduled</span>
                  <span className="ml-2 bg-white/30 px-2 py-0.5 rounded-full">{statusCounts.Scheduled}</span>
                </button>

                <button
                  onClick={() => handlePillClick('status', 'Published')}
                  className="px-4 py-2 rounded-full text-xs transition-all hover:opacity-90 whitespace-nowrap text-white flex items-center justify-between"
                  style={{ backgroundColor: '#9b91ac', fontWeight: 500 }}
                >
                  <span>Published</span>
                  <span className="ml-2 bg-white/30 px-2 py-0.5 rounded-full">{statusCounts.Published}</span>
                </button>

                <button
                  onClick={() => handlePillClick('status', 'Repurposing')}
                  className="px-4 py-2 rounded-full text-xs transition-all hover:opacity-90 whitespace-nowrap text-white flex items-center justify-between"
                  style={{ backgroundColor: '#c6c6c3', fontWeight: 500 }}
                >
                  <span>Repurposing</span>
                  <span className="ml-2 bg-white/30 px-2 py-0.5 rounded-full">{statusCounts.Repurposing}</span>
                </button>

                {/* Platform Pills */}
                <button
                  onClick={() => handlePillClick('platform', 'LI Post')}
                  className="px-4 py-2 rounded-full text-xs transition-all hover:opacity-90 whitespace-nowrap text-white flex items-center justify-between"
                  style={{ backgroundColor: '#879fb5', fontWeight: 500 }}
                >
                  <span>LI Post</span>
                  <span className="ml-2 bg-white/30 px-2 py-0.5 rounded-full">{platformCounts['LI Post']}</span>
                </button>

                <button
                  onClick={() => handlePillClick('platform', 'LI Article')}
                  className="px-4 py-2 rounded-full text-xs transition-all hover:opacity-90 whitespace-nowrap text-white flex items-center justify-between"
                  style={{ backgroundColor: '#5f7e9a', fontWeight: 500 }}
                >
                  <span>LI Article</span>
                  <span className="ml-2 bg-white/30 px-2 py-0.5 rounded-full">{platformCounts['LI Article']}</span>
                </button>

                <button
                  onClick={() => handlePillClick('platform', 'SS Post')}
                  className="px-4 py-2 rounded-full text-xs transition-all hover:opacity-90 whitespace-nowrap text-white flex items-center justify-between"
                  style={{ backgroundColor: '#deb0ad', fontWeight: 500 }}
                >
                  <span>SS Post</span>
                  <span className="ml-2 bg-white/30 px-2 py-0.5 rounded-full">{platformCounts['SS Post']}</span>
                </button>

                <button
                  onClick={() => handlePillClick('platform', 'SS Audio')}
                  className="px-4 py-2 rounded-full text-xs transition-all hover:opacity-90 whitespace-nowrap text-white flex items-center justify-between"
                  style={{ backgroundColor: '#ce9490', fontWeight: 500 }}
                >
                  <span>SS Audio</span>
                  <span className="ml-2 bg-white/30 px-2 py-0.5 rounded-full">{platformCounts['SS Audio']}</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 pt-2" style={{ width: '40px' }}>
                {/* Expand button */}
                <button
                  onClick={() => setPillsExpanded(true)}
                  className="flex items-center justify-center p-2 text-slate-400 hover:text-slate-600 transition-colors mb-1"
                  title="Expand filters"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Content Table */}
            <div className="flex-1">
              {renderMainContent()}
            </div>
          </div>
        </div>
      </div>

      {/* Content Planning Wizard */}
      {showContentWizard && wizardItemId && (() => {
        const item = contentItems.find(i => i.id === wizardItemId);
        return item ? (
          <ContentPlanningWizard
            item={item}
            isOpen={true}
            onClose={() => {
              setShowContentWizard(false);
              setWizardItemId('');
            }}
            onComplete={(updatedFields) => {
              // Full completion: user finished all steps and chose "Choose and start drafting"
              const itemId = wizardItemId; // Capture before state changes
              
              console.log(`🎯 onComplete called - itemId: ${itemId}, title: ${updatedFields.title}`);
              console.log(`   Platform: ${updatedFields.platform}`);
              console.log(`   Current viewState:`, viewState);
              
              // Update the content item with all the planning details
              setContentItems(prev => {
                const updated = prev.map(i => 
                  i.id === itemId 
                    ? { ...i, ...updatedFields }
                    : i
                );
                console.log(`   Updated contentItems, item exists:`, updated.some(i => i.id === itemId));
                return updated;
              });
              
              // Close wizard AFTER updating content
              setShowContentWizard(false);
              setWizardItemId('');
              
              // Always ensure editor is open for this item
              console.log(`   Explicitly opening editor for itemId: ${itemId}`);
              onOpenEditor(itemId);
              
              toast.success('Content plan saved! Opening editor...');
            }}
            onSaveAndClose={(partialUpdate) => {
              // Partial save: user chose "Save idea and finish wizard later"
              const itemId = wizardItemId; // Capture before state changes
              
              console.log(`💾 Partial save starting - itemId: ${itemId}`);
              console.log(`   Partial update data:`, partialUpdate);
              console.log(`   Title: ${partialUpdate.title}`);
              console.log(`   SourceURL: ${partialUpdate.sourceUrl}`);
              console.log(`   Current contentItems count:`, contentItems.length);
              console.log(`   Item exists before update:`, contentItems.some(i => i.id === itemId));
              
              setContentItems(prev => {
                const updated = prev.map(i => 
                  i.id === itemId 
                    ? { ...i, ...partialUpdate }
                    : i
                );
                const itemAfterUpdate = updated.find(i => i.id === itemId);
                console.log(`   Item after update:`, itemAfterUpdate);
                console.log(`   Item sourceUrl after update:`, itemAfterUpdate?.sourceUrl);
                console.log(`   Item exists after update:`, updated.some(i => i.id === itemId));
                return updated;
              });
              
              setShowContentWizard(false);
              setWizardItemId('');
              
              // Show softer toast for partial save
              toast.success('Saved — finish planning later');
            }}
          />
        ) : null;
      })()}

      {/* Repurposing Modal */}
      {showRepurposingModal && repurposingPost && (
        <RepurposingModal
          originalPost={repurposingPost}
          onClose={handleRepurposingClose}
          onComplete={handleRepurposingComplete}
          onSkip={handleRepurposingSkip}
        />
      )}

      {/* Quick Preview Modal */}
      <QuickPreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        data={previewData || {
          title: '',
          source: '',
          sourceUrl: '',
          date: '',
          content: '',
          snippet: '',
          summary: ''
        }}
      />

      {/* First Draft Popup (PROMPT 3) */}
      {showFirstDraftPopup && (
        <FirstDraftPopup
          onStartDrafting={handleStartDrafting}
          onOpenWizard={handleOpenWizard}
          onClose={handleCloseFirstDraftPopup}
        />
      )}
    </>
  );
}