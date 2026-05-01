import { useState, useEffect, useRef } from 'react';
import { X, Search, Minimize2, Sparkles, Send, Calendar, CheckSquare, User, FileText, ExternalLink, Plus } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'jamie';
  text: string;
  timestamp: Date;
  context?: {
    page?: string;
    selectedItem?: {
      type: 'task' | 'contact' | 'event' | 'content';
      id: string;
      title: string;
    };
  };
  quickActions?: {
    label: string;
    action: string;
    data?: any;
  }[];
  searchResults?: Array<{
    title: string;
    url: string;
    description: string;
    published?: string;
    favicon?: string;
  }>;
}

interface MutedJamieChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage?: string;
  selectedItem?: {
    type: 'task' | 'contact' | 'event' | 'content';
    id: string;
    title: string;
  };
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onExecuteAction: (action: string, data?: any) => void;
}

export function MutedJamieChatPanel({
  isOpen,
  onClose,
  currentPage,
  selectedItem,
  messages,
  onSendMessage,
  onExecuteAction,
}: MutedJamieChatPanelProps) {
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const filteredMessages = messages.filter(msg =>
    msg.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddToInbox = (result: {
    title: string;
    url: string;
    description: string;
    published?: string;
  }) => {
    try {
      const urlObj = new URL(result.url);
      const source = urlObj.hostname.replace('www.', '');

      const globalAddFn = (window as any).__addToContentInbox;
      if (globalAddFn) {
        globalAddFn({
          title: result.title,
          url: result.url,
          description: result.description,
          source,
          published: result.published
        });
        toast.success(`Added "${result.title}" to Idea Inbox`);
      } else {
        toast.error("Navigate to Content page to add items to Idea Inbox");
      }
    } catch (error) {
      console.error('Error adding to inbox:', error);
      toast.error("Failed to add item to Idea Inbox");
    }
  };

  const getContextIcon = (type?: string) => {
    switch (type) {
      case 'task': return <CheckSquare className="w-3 h-3" />;
      case 'contact': return <User className="w-3 h-3" />;
      case 'event': return <Calendar className="w-3 h-3" />;
      case 'content': return <FileText className="w-3 h-3" />;
      default: return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed top-0 right-0 h-full transition-all duration-300 ease-out z-50 ${
        isExpanded ? 'w-[450px]' : 'w-[60px]'
      }`}
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.65)',
        backdropFilter: 'blur(20px)',
        borderLeft: '1px solid rgba(148, 163, 184, 0.2)',
      }}
    >
      {!isExpanded && (
        <div className="flex flex-col items-center pt-6 gap-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(true);
            }}
            className="p-3 rounded-full transition-all duration-200 hover:bg-white/40"
            style={{ color: '#5e2350' }}
          >
            <Sparkles className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-2 rounded-full transition-all duration-200 hover:bg-slate-200/40"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      )}

      {isExpanded && (
        <div className="flex flex-col h-full">
          <div className="px-6 py-4 border-b border-slate-200/50 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#5e2350' }}
                >
                  <Sparkles className="w-4 h-4 text-white" />
                </div>

                <div className="min-w-0">
                  <h3 className="text-slate-800" style={{ fontFamily: 'Lora, serif' }}>Jamie</h3>

                  {(currentPage || selectedItem) && (
                    <div className="flex items-center gap-2 text-xs text-slate-600 mt-1 flex-wrap">
                      <Sparkles className="w-3 h-3" style={{ color: '#5e2350' }} />
                      <span>Context:</span>

                      {currentPage && (
                        <span className="px-2 py-0.5 rounded-lg bg-white/40 capitalize">
                          {currentPage}
                        </span>
                      )}

                      {selectedItem && (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/40">
                          {getContextIcon(selectedItem.type)}
                          <span className="max-w-[140px] truncate">{selectedItem.title}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(false);
                  }}
                  className="p-2 rounded-lg hover:bg-white/40 transition-colors"
                >
                  <Minimize2 className="w-4 h-4 text-slate-500" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  className="p-2 rounded-lg hover:bg-white/40 transition-colors"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search conversation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200/50 bg-white/40 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-3 space-y-4">
            {filteredMessages.length === 0 && messages.length > 0 && (
              <div className="text-center text-slate-400 text-sm py-8">
                No messages match "{searchQuery}"
              </div>
            )}

            {filteredMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] ${msg.sender === 'user' ? 'order-2' : 'order-1'}`}>
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      msg.sender === 'user'
                        ? 'bg-slate-700 text-white rounded-br-md'
                        : 'bg-white/60 text-slate-800 rounded-bl-md'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>

                    {msg.searchResults && msg.searchResults.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {msg.searchResults.map((result, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-slate-50/80 rounded-lg border border-slate-200 hover:border-[#2f829b] transition-colors group"
                          >
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <a
                                href={result.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 text-sm font-semibold text-[#034863] hover:text-[#2f829b] flex items-center gap-1 group-hover:underline"
                              >
                                {result.title}
                                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                              </a>
                            </div>
                            <p className="text-xs text-slate-600 mb-2 line-clamp-2">{result.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-400">
                                {new URL(result.url).hostname.replace('www.', '')}
                                {result.published && ` • ${result.published}`}
                              </span>
                              <button
                                onClick={() => handleAddToInbox(result)}
                                className="flex items-center gap-1 text-xs font-medium text-[#2f829b] hover:text-[#034863] transition-colors px-2 py-1 rounded hover:bg-[#f5fafb]"
                              >
                                <Plus className="w-3 h-3" />
                                Add to Inbox
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

      
                  </div>

                  <div className={`text-xs text-slate-400 mt-1 px-2 ${
                    msg.sender === 'user' ? 'text-right' : 'text-left'
                  }`}>
                    {new Date(msg.timestamp).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="px-6 py-4 border-t border-slate-200/50">
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask Jamie anything..."
                  rows={3}
                  className="w-full px-4 py-3 pr-12 rounded-2xl border border-slate-200/50 bg-white/40 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 resize-none"
                  style={{ maxHeight: '180px', minHeight: '84px' }}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="p-3 rounded-2xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: inputValue.trim() ? '#5e2350' : '#cbd5e1',
                }}
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}