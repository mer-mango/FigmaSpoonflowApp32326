import React from 'react';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

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

interface DraftOptionsDisplayProps {
  draftOptions: DraftOption[];
  setDraftOptions: React.Dispatch<React.SetStateAction<DraftOption[]>>;
  setEditorContent: React.Dispatch<React.SetStateAction<string>>;
  setHasUnsavedChanges: React.Dispatch<React.SetStateAction<boolean>>;
  onRegenerateAll: () => void;
}

export function DraftOptionsDisplay({
  draftOptions,
  setDraftOptions,
  setEditorContent,
  setHasUnsavedChanges,
  onRegenerateAll
}: DraftOptionsDisplayProps) {
  return (
    <div className="space-y-6 pt-4 border-t border-slate-200">
      {draftOptions.map((draft, draftIndex) => (
        <div key={draft.id} className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
          {/* Draft Option Header */}
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-lg font-bold text-slate-900">Draft Option {draft.id}</h3>
            <button
              onClick={() => {
                const fullDraftContent = `${draft.jamiesThoughts}\n\nFROM THE SOURCE:\n\nRelevant Main Points:\n${draft.relevantMainPoints.map(p => `• ${p}`).join('\n')}\n\nRelevant Quotes:\n${draft.relevantQuotes.map(q => q).join('\n')}\n\nSTRUCTURAL SUGGESTIONS:\n\nHook: ${draft.structuralSuggestions.hook}\n\nContext/Micro-story: ${draft.structuralSuggestions.context}\n\nYour Take: ${draft.structuralSuggestions.yourTake}\n\nMake it Usable: ${draft.structuralSuggestions.makeItUsable}\n\nCTA: ${draft.structuralSuggestions.cta}`;
                setEditorContent(prev => prev ? `${prev}\n\n${fullDraftContent}` : fullDraftContent);
                setHasUnsavedChanges(true);
                toast.success('Added Draft Option to Editor');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#6b2358] hover:bg-[#6b2358]/90 text-white text-sm rounded-lg transition-colors whitespace-nowrap"
            >
              <span className="text-lg">⊕</span>
              Add this Draft Option to Editor
            </button>
          </div>
          
          {/* Jamie's Thoughts */}
          <div>
            <div className="text-sm font-semibold text-slate-800 mb-2">Jamie's thoughts:</div>
            <textarea
              value={draft.jamiesThoughts}
              onChange={(e) => setDraftOptions(prev => {
                const newDrafts = [...prev];
                newDrafts[draftIndex].jamiesThoughts = e.target.value;
                return newDrafts;
              })}
              rows={4}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded bg-white resize-none outline-none focus:ring-2 focus:ring-[#6b2358] focus:border-transparent"
            />
          </div>
          
          {/* FROM THE SOURCE */}
          <div>
            <div className="text-sm font-bold text-slate-900 mb-3 underline">FROM THE SOURCE:</div>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Relevant Main Points */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-bold text-slate-800">Relevant Main Points:</div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        toast.info('Regenerating main points...');
                      }}
                      className="p-1 hover:bg-slate-200 rounded transition-colors"
                      title="Regenerate"
                    >
                      <RefreshCw className="w-3 h-3 text-slate-600" />
                    </button>
                  </div>
                </div>
                <ul className="space-y-1.5">
                  {draft.relevantMainPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <button
                        className="text-red-500 hover:text-red-700 flex-shrink-0 mt-0.5"
                        onClick={() => {
                          setDraftOptions(prev => {
                            const newDrafts = [...prev];
                            newDrafts[draftIndex].relevantMainPoints.splice(idx, 1);
                            return newDrafts;
                          });
                        }}
                      >
                        ✕
                      </button>
                      <span className="text-slate-600 flex-shrink-0">○</span>
                      <input
                        type="text"
                        value={point}
                        onChange={(e) => setDraftOptions(prev => {
                          const newDrafts = [...prev];
                          newDrafts[draftIndex].relevantMainPoints[idx] = e.target.value;
                          return newDrafts;
                        })}
                        className="flex-1 bg-transparent border-none outline-none text-slate-800"
                      />
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Relevant Quotes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-bold text-slate-800">Relevant Quotes:</div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        toast.info('Regenerating quotes...');
                      }}
                      className="p-1 hover:bg-slate-200 rounded transition-colors"
                      title="Regenerate"
                    >
                      <RefreshCw className="w-3 h-3 text-slate-600" />
                    </button>
                  </div>
                </div>
                <ul className="space-y-1.5">
                  {draft.relevantQuotes.map((quote, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <button
                        className="text-red-500 hover:text-red-700 flex-shrink-0 mt-0.5"
                        onClick={() => {
                          setDraftOptions(prev => {
                            const newDrafts = [...prev];
                            newDrafts[draftIndex].relevantQuotes.splice(idx, 1);
                            return newDrafts;
                          });
                        }}
                      >
                        ✕
                      </button>
                      <span className="text-slate-600 flex-shrink-0">○</span>
                      <input
                        type="text"
                        value={quote}
                        onChange={(e) => setDraftOptions(prev => {
                          const newDrafts = [...prev];
                          newDrafts[draftIndex].relevantQuotes[idx] = e.target.value;
                          return newDrafts;
                        })}
                        className="flex-1 bg-transparent border-none outline-none text-slate-800"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          <hr className="border-slate-300" />
          
          {/* STRUCTURAL SUGGESTIONS */}
          <div>
            <div className="text-sm font-bold text-slate-900 mb-3 underline">STRUCTURAL SUGGESTIONS:</div>
            
            <div className="space-y-3">
              {/* Hook */}
              {draft.structuralSuggestions.hook && (
                <div className="flex items-start gap-2">
                  <button
                    className="text-red-500 hover:text-red-700 flex-shrink-0 mt-1"
                    onClick={() => {
                      setDraftOptions(prev => {
                        const newDrafts = [...prev];
                        newDrafts[draftIndex].structuralSuggestions.hook = '';
                        return newDrafts;
                      });
                    }}
                  >
                    ✕
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-800">Hook:</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toast.info('Regenerating hook...')}
                          className="p-1 hover:bg-slate-200 rounded transition-colors"
                          title="Regenerate"
                        >
                          <RefreshCw className="w-3 h-3 text-slate-600" />
                        </button>
                      </div>
                    </div>
                    <textarea
                      value={draft.structuralSuggestions.hook}
                      onChange={(e) => setDraftOptions(prev => {
                        const newDrafts = [...prev];
                        newDrafts[draftIndex].structuralSuggestions.hook = e.target.value;
                        return newDrafts;
                      })}
                      rows={2}
                      className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded bg-white resize-none outline-none focus:ring-1 focus:ring-[#6b2358]"
                    />
                  </div>
                </div>
              )}
              
              {/* Context/Micro-story */}
              {draft.structuralSuggestions.context && (
                <div className="flex items-start gap-2">
                  <button
                    className="text-red-500 hover:text-red-700 flex-shrink-0 mt-1"
                    onClick={() => {
                      setDraftOptions(prev => {
                        const newDrafts = [...prev];
                        newDrafts[draftIndex].structuralSuggestions.context = '';
                        return newDrafts;
                      });
                    }}
                  >
                    ✕
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-800">Context/Micro-story:</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toast.info('Regenerating context...')}
                          className="p-1 hover:bg-slate-200 rounded transition-colors"
                          title="Regenerate"
                        >
                          <RefreshCw className="w-3 h-3 text-slate-600" />
                        </button>
                      </div>
                    </div>
                    <textarea
                      value={draft.structuralSuggestions.context}
                      onChange={(e) => setDraftOptions(prev => {
                        const newDrafts = [...prev];
                        newDrafts[draftIndex].structuralSuggestions.context = e.target.value;
                        return newDrafts;
                      })}
                      rows={2}
                      className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded bg-white resize-none outline-none focus:ring-1 focus:ring-[#6b2358]"
                    />
                  </div>
                </div>
              )}
              
              {/* Your Take */}
              {draft.structuralSuggestions.yourTake && (
                <div className="flex items-start gap-2">
                  <button
                    className="text-red-500 hover:text-red-700 flex-shrink-0 mt-1"
                    onClick={() => {
                      setDraftOptions(prev => {
                        const newDrafts = [...prev];
                        newDrafts[draftIndex].structuralSuggestions.yourTake = '';
                        return newDrafts;
                      });
                    }}
                  >
                    ✕
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-800">Your Take:</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toast.info('Regenerating your take...')}
                          className="p-1 hover:bg-slate-200 rounded transition-colors"
                          title="Regenerate"
                        >
                          <RefreshCw className="w-3 h-3 text-slate-600" />
                        </button>
                      </div>
                    </div>
                    <textarea
                      value={draft.structuralSuggestions.yourTake}
                      onChange={(e) => setDraftOptions(prev => {
                        const newDrafts = [...prev];
                        newDrafts[draftIndex].structuralSuggestions.yourTake = e.target.value;
                        return newDrafts;
                      })}
                      rows={2}
                      className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded bg-white resize-none outline-none focus:ring-1 focus:ring-[#6b2358]"
                    />
                  </div>
                </div>
              )}
              
              {/* Make it Usable */}
              {draft.structuralSuggestions.makeItUsable && (
                <div className="flex items-start gap-2">
                  <button
                    className="text-red-500 hover:text-red-700 flex-shrink-0 mt-1"
                    onClick={() => {
                      setDraftOptions(prev => {
                        const newDrafts = [...prev];
                        newDrafts[draftIndex].structuralSuggestions.makeItUsable = '';
                        return newDrafts;
                      });
                    }}
                  >
                    ✕
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-800">Make it Usable:</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toast.info('Regenerating make it usable...')}
                          className="p-1 hover:bg-slate-200 rounded transition-colors"
                          title="Regenerate"
                        >
                          <RefreshCw className="w-3 h-3 text-slate-600" />
                        </button>
                      </div>
                    </div>
                    <textarea
                      value={draft.structuralSuggestions.makeItUsable}
                      onChange={(e) => setDraftOptions(prev => {
                        const newDrafts = [...prev];
                        newDrafts[draftIndex].structuralSuggestions.makeItUsable = e.target.value;
                        return newDrafts;
                      })}
                      rows={2}
                      className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded bg-white resize-none outline-none focus:ring-1 focus:ring-[#6b2358]"
                    />
                  </div>
                </div>
              )}
              
              {/* CTA */}
              {draft.structuralSuggestions.cta && (
                <div className="flex items-start gap-2">
                  <button
                    className="text-red-500 hover:text-red-700 flex-shrink-0 mt-1"
                    onClick={() => {
                      setDraftOptions(prev => {
                        const newDrafts = [...prev];
                        newDrafts[draftIndex].structuralSuggestions.cta = '';
                        return newDrafts;
                      });
                    }}
                  >
                    ✕
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-800">CTA:</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toast.info('Regenerating CTA...')}
                          className="p-1 hover:bg-slate-200 rounded transition-colors"
                          title="Regenerate"
                        >
                          <RefreshCw className="w-3 h-3 text-slate-600" />
                        </button>
                      </div>
                    </div>
                    <textarea
                      value={draft.structuralSuggestions.cta}
                      onChange={(e) => setDraftOptions(prev => {
                        const newDrafts = [...prev];
                        newDrafts[draftIndex].structuralSuggestions.cta = e.target.value;
                        return newDrafts;
                      })}
                      rows={2}
                      className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded bg-white resize-none outline-none focus:ring-1 focus:ring-[#6b2358]"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
      
      {/* Regenerate All Button */}
      <button
        onClick={onRegenerateAll}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium text-sm"
      >
        <RefreshCw className="w-4 h-4" />
        Regenerate both draft options
      </button>
    </div>
  );
}
