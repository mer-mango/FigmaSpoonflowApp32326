import React, { useState } from 'react';
import { Sparkles, CheckCircle2, Circle, X } from 'lucide-react';

// Module definition
interface Module {
  key: string;
  label: string;
  description: string;
  placeholder: string;
  rows: number;
  guidance: string;
}

// Platform modules configuration
const MODULES: Module[] = [
  {
    key: 'hook',
    label: 'Hook',
    description: `1–2 lines. Name a tension, truth, or pattern your reader recognizes. Make it about what THEY're dealing with.`,
    placeholder: 'Start with a sharp truth your reader will recognize...',
    rows: 3,
    guidance: 'A sharp truth, a tension, a surprising observation, or a question. Make it about what the reader is navigating. Pull them in fast.'
  },
  {
    key: 'context',
    label: 'Context / Micro-story',
    description: `2–5 short lines. One specific moment, example, or pattern you've seen. Enough detail to make the insight feel real.`,
    placeholder: `Quick scene or pattern you've seen (keep it tight)...`,
    rows: 5,
    guidance: `A real moment, example, or pattern you've seen. Keep it specific and concrete. This grounds your insight in reality.`
  },
  {
    key: 'pov',
    label: 'Your take',
    description: 'Name the lesson. Translate what this means for healthcare teams building products (patient reality + workflow reality).',
    placeholder: `Here's what this means (and what teams often miss)...`,
    rows: 5,
    guidance: 'Name the lesson clearly. Translate what it means for teams building healthcare tools. Connect to patient + workflow reality.'
  },
  {
    key: 'takeaways',
    label: 'Make it usable',
    description: '1–3 bullets or a mini-framework. Give the reader something to check, change, or try this week.',
    placeholder: 'Practical bullets or a mini-framework...',
    rows: 5,
    guidance: 'Give the reader something actionable. Bullets, a framework, or specific questions to ask. Make it immediately useful.'
  },
  {
    key: 'cta',
    label: 'CTA',
    description: 'One clear ask. Invite comments, ask a question, or offer a DM next step.',
    placeholder: 'End with one question or next step...',
    rows: 2,
    guidance: 'One clear invitation. Ask a question, invite comments, or offer a next step via DM. Keep it simple and specific.'
  }
];

const CHECKLIST_ITEMS = [
  { key: 'hook_early', label: 'Hook in first ~2 lines', passed: null },
  { key: 'scannable', label: 'Scannable formatting', passed: null },
  { key: 'one_idea', label: 'One core idea', passed: null },
  { key: 'has_cta', label: 'CTA present', passed: null }
];

const BEST_PRACTICES = [
  'Hook in the first 1–2 lines',
  'Short paragraphs and lots of line breaks',
  'One idea per post',
  'Use concrete examples over general claims',
  'End with one clear question or next step'
];

const PLATFORMS = ['LI Post', 'LI Article', 'SS Post', 'SS Audio'];

export function OutlineModePrototype() {
  const [platform, setPlatform] = useState('LI Post');
  const [moduleDrafts, setModuleDrafts] = useState<Record<string, string>>({});
  const [activeDrawerModule, setActiveDrawerModule] = useState<string | null>(null);
  const [generatedSuggestions, setGeneratedSuggestions] = useState<string[]>([]);

  // Handle module text change
  const handleModuleChange = (moduleKey: string, value: string) => {
    setModuleDrafts(prev => ({ ...prev, [moduleKey]: value }));
  };

  // Open Jamie suggestions drawer
  const handleGetSuggestions = (moduleKey: string) => {
    setActiveDrawerModule(moduleKey);
    setGeneratedSuggestions([]); // Reset suggestions
  };

  // Generate placeholder suggestions
  const handleGenerateOptions = () => {
    const module = MODULES.find(m => m.key === activeDrawerModule);
    if (!module) return;

    // Placeholder suggestions based on module type
    const suggestions = {
      hook: [
        `Most digital health teams test with patients at the end.\n\nBut by then, you've already built the wrong thing.`,
        `Here's the uncomfortable truth about patient engagement:\n\nIf patients have to "learn" your tool, you've already lost.`,
        `Stop asking patients to validate your idea.\n\nStart asking them to show you their current workaround.`
      ],
      context: [
        `Last month, I watched a product team demo their medication tracker to a patient with chronic pain.\n\nThe patient nodded politely through the whole thing.\n\nThen at the end, she pulled out a crumpled sticky note from her purse — her actual system.`,
        `I was reviewing a care coordination app with a nurse.\n\nShe pointed at the "streamlined workflow" they'd designed.\n\n"This assumes I have time to sit down," she said.`,
        `A founder showed me their beautiful symptom tracker.\n\nClean interface. Minimal clicks. Very impressive.\n\nThen I asked: "What happens when someone's too sick to log anything?"`
      ],
      pov: [
        `This is the gap nobody talks about:\n\nYour product enters someone's life at their most vulnerable moment — and you're asking them to adapt to YOU.\n\nReal patient-centered design means your product adapts to their chaos, not the other way around.`,
        `Here's what teams miss:\n\nPatients aren't resisting your tool because they don't "get it."\n\nThey're resisting because it doesn't fit the 47 other things they're already managing.`,
        `The real insight:\n\nEvery workaround patients create is a feature request in disguise.\n\nIf you're not studying the sticky notes, the spreadsheets, the reminder alarms — you're designing blind.`
      ],
      takeaways: [
        `Three questions to ask before your next sprint:\n\n• What are patients doing RIGHT NOW to solve this?\n• What would have to break for them to switch to our tool?\n• Are we making their life simpler, or just different?`,
        `Try this framework:\n\n1. **Shadow first** — Watch the current workaround in action\n2. **Map the chaos** — Document everything else happening in that moment\n3. **Design for reality** — Build for the worst day, not the best case`,
        `What to do this week:\n\n• Find 3 patients using a workaround for your problem\n• Ask them to walk you through it (don't pitch your solution)\n• Look for what they're NOT saying — the frustration, the shortcuts, the resignation`
      ],
      cta: [
        `What's the most revealing workaround you've seen patients create?\n\nDrop it in the comments — I'm collecting real examples.`,
        `If you're building a patient-facing tool, what's the hardest part to get right?\n\nLet me know. Happy to pressure-test ideas.`,
        `Curious: what assumptions have patients proven wrong for you?\n\nI'd love to hear the stories that changed your roadmap.`
      ]
    };

    setGeneratedSuggestions(suggestions[activeDrawerModule as keyof typeof suggestions] || [
      'Option 1 placeholder text...',
      'Option 2 placeholder text...',
      'Option 3 placeholder text...'
    ]);
  };

  // Insert suggestion into module
  const handleInsertSuggestion = (suggestionText: string) => {
    if (activeDrawerModule) {
      setModuleDrafts(prev => ({ ...prev, [activeDrawerModule]: suggestionText }));
      setActiveDrawerModule(null);
      setGeneratedSuggestions([]);
    }
  };

  // Generate consolidated preview
  const generatePreview = () => {
    const parts: string[] = [];
    MODULES.forEach(module => {
      const content = moduleDrafts[module.key];
      if (content && content.trim()) {
        parts.push(content.trim());
      }
    });
    return parts.join('\n\n') || '(No content yet — fill in modules above)';
  };

  const activeModule = MODULES.find(m => m.key === activeDrawerModule);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 px-8 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-900">Content Editor</h1>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-slate-700">Platform:</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {PLATFORMS.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-8 py-8">
        <div className="flex gap-8">
          {/* Left Column - Module Cards */}
          <div className="flex-1 space-y-6">
            {MODULES.map((module, index) => (
              <div key={module.key} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                {/* Module Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900">{module.label}</h3>
                    </div>
                    <p className="text-sm text-slate-600 ml-11">{module.description}</p>
                  </div>
                </div>

                {/* Textarea */}
                <textarea
                  value={moduleDrafts[module.key] || ''}
                  onChange={(e) => handleModuleChange(module.key, e.target.value)}
                  placeholder={module.placeholder}
                  rows={module.rows}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-base leading-relaxed mb-3"
                  style={{ fontFamily: 'Georgia, serif' }}
                />

                {/* Get Suggestions Button */}
                <button
                  onClick={() => handleGetSuggestions(module.key)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  Get suggestions
                </button>
              </div>
            ))}
          </div>

          {/* Right Column - Validation & Best Practices */}
          <div className="w-80 space-y-6">
            {/* Checklist Section */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Checklist</h3>
              <div className="space-y-3">
                {CHECKLIST_ITEMS.map((item) => (
                  <div key={item.key} className="flex items-center gap-3">
                    {item.passed === true ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    ) : item.passed === false ? (
                      <Circle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 flex-shrink-0" />
                    )}
                    <span className="text-sm text-slate-700">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Best Practices Section */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Best practices</h3>
              <ul className="space-y-2">
                {BEST_PRACTICES.map((practice, idx) => (
                  <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span>{practice}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Consolidated Draft Preview */}
        <div className="mt-8 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Consolidated Draft Preview</h3>
          <p className="text-xs text-slate-500 mb-4">
            This preview joins non-empty module drafts in module order with blank lines between.
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 min-h-[200px]">
            <pre className="whitespace-pre-wrap text-slate-800 text-base leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
              {generatePreview()}
            </pre>
          </div>
        </div>
      </div>

      {/* Jamie Suggestions Drawer */}
      {activeDrawerModule && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setActiveDrawerModule(null)}
          />

          {/* Drawer */}
          <div className="fixed top-0 right-0 bottom-0 w-[500px] bg-white shadow-2xl z-50 overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-slate-900 mb-1">Jamie Suggestions</h2>
                  {activeModule && (
                    <>
                      <h3 className="text-lg font-medium text-purple-700 mb-2">{activeModule.label}</h3>
                      <p className="text-sm text-slate-600">{activeModule.description}</p>
                    </>
                  )}
                </div>
                <button
                  onClick={() => setActiveDrawerModule(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              {/* Platform Guidance */}
              {activeModule && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                  <h4 className="text-sm font-semibold text-purple-900 mb-2">Platform guidance</h4>
                  <p className="text-sm text-purple-800 leading-relaxed">{activeModule.guidance}</p>
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={handleGenerateOptions}
                disabled={generatedSuggestions.length > 0}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white font-medium rounded-lg transition-colors mb-6"
              >
                <Sparkles className="w-5 h-5" />
                Generate 3 options
              </button>

              {/* Suggestions */}
              {generatedSuggestions.length > 0 && (
                <div className="space-y-4">
                  {generatedSuggestions.map((suggestion, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-sm font-semibold text-slate-900">Option {idx + 1}</h5>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed mb-4 whitespace-pre-wrap" style={{ fontFamily: 'Georgia, serif' }}>
                        {suggestion}
                      </p>
                      <button
                        onClick={() => handleInsertSuggestion(suggestion)}
                        className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Insert into module
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
