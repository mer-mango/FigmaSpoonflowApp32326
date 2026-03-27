import React, { useState, useRef, useEffect } from 'react';
import { 
  X, ChevronRight, ChevronLeft, FileText, Target, Users, 
  Lightbulb, Check, Sparkles, ExternalLink, Plus, Trash2, Mic, MicOff, Pin, CheckCircle2
} from 'lucide-react';
import type { ContentItem, Platform } from '../../types/content';
import { generateContentSummary, generateMainPoints, generateImportantQuotes, generatePOVAngles } from '../../utils/jamieAI';
import { toast } from 'sonner';

interface ContentPlanningWizardProps {
  item?: ContentItem;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (updatedItem: Partial<ContentItem>) => void;
  onComplete?: (updatedItem: Partial<ContentItem>) => void;
  onSaveAndClose?: (partialUpdate: Partial<ContentItem>) => void;
}

// New 2-step wizard flow:
// Step 0: Plan (consolidated: title, source, summary, main points, quotes, platform, audience, goals, tone, POV angles)
// Step 1: Confirm & Start Drafting

const PLATFORMS: Platform[] = ['LI Post', 'LI Article', 'SS Post', 'SS Audio'];

const AUDIENCE_OPTIONS = [
  'Digital health teams',
  'Founders',
  'Product teams',
  'Clinicians',
  'Patients',
  'Healthcare innovation community',
  'Other'
];

const GOAL_OPTIONS = [
  'Build authority',
  'Share insight',
  'Educate audience',
  'Spark conversation',
  'Share resource',
  'Market services',
  'Promote peers'
];

const LENGTH_OPTIONS = [
  { value: 'Short', label: 'Short', description: '100-500 words' },
  { value: 'Medium', label: 'Medium', description: '500-1200 words' },
  { value: 'Long', label: 'Long', description: '1200+ words' }
];

export function ContentPlanningWizard({ item, isOpen, onClose, onSave, onComplete, onSaveAndClose }: ContentPlanningWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);

  // All fields from Step 0 (Plan page)
  const [title, setTitle] = useState(item?.title || '');
  const [summary, setSummary] = useState(item?.summary || '');
  const [notes, setNotes] = useState(item?.notes || '');
  const [sourceUrl, setSourceUrl] = useState(item?.sourceUrl || '');
  const [sourceContent, setSourceContent] = useState(item?.sourceContent || '');
  const [mainPoints, setMainPoints] = useState<string[]>(item?.mainPoints || []);
  const [importantQuotes, setImportantQuotes] = useState<string[]>(item?.importantQuotes || []);
  const [povAngles, setPovAngles] = useState<string[]>(item?.povAngles || []);
  const [selectedPovAngles, setSelectedPovAngles] = useState<string[]>(item?.selectedPovAngles || []);
  
  const [selectedGoals, setSelectedGoals] = useState<string[]>(item?.goals || []);
  const [customGoal, setCustomGoal] = useState('');
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>(item?.audiences || []);
  const [customAudience, setCustomAudience] = useState('');
  const [length, setLength] = useState(item?.length || '');
  const [platform, setPlatform] = useState<Platform | ''>(item?.platform || '');
  
  // Jamie generation states
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [isGeneratingMainPoints, setIsGeneratingMainPoints] = useState(false);
  const [mainPointsError, setMainPointsError] = useState<string | null>(null);
  const [isGeneratingQuotes, setIsGeneratingQuotes] = useState(false);
  const [quotesError, setQuotesError] = useState<string | null>(null);
  const [isGeneratingPOVAngles, setIsGeneratingPOVAngles] = useState(false);
  const [povAnglesError, setPovAnglesError] = useState<string | null>(null);
  
  // Voice dictation state for title
  const [isListeningForTitle, setIsListeningForTitle] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Reset/initialize wizard state when modal opens or item changes
  useEffect(() => {
    if (isOpen) {
      console.log('🔄 ContentPlanningWizard: Modal opened, initializing state from item:', item);
      
      setCurrentStep(0);
      
      setTitle(item?.title || '');
      setSummary(item?.summary || '');
      setNotes(item?.notes || '');
      setSourceUrl(item?.sourceUrl || '');
      setSourceContent(item?.sourceContent || '');
      setMainPoints(item?.mainPoints || []);
      setImportantQuotes(item?.importantQuotes || []);
      setPovAngles(item?.povAngles || []);
      setSelectedPovAngles(item?.selectedPovAngles || []);
      setSelectedGoals(item?.goals || []);
      setSelectedAudiences(item?.audiences || []);
      setLength(item?.length || '');
      setPlatform(item?.platform || '');
      
      setCustomGoal('');
      setCustomAudience('');
      
      setIsGeneratingSummary(false);
      setSummaryError(null);
      setIsGeneratingMainPoints(false);
      setMainPointsError(null);
      setIsGeneratingQuotes(false);
      setQuotesError(null);
      setIsGeneratingPOVAngles(false);
      setPovAnglesError(null);
      
      console.log('✅ Wizard state initialized');
    }
  }, [isOpen, item]);

  // Can proceed validation
  const canProceedFromStep0 = 
    title.trim().length > 0; // Only require title to proceed

  const handleAddCustomGoal = () => {
    if (customGoal.trim()) {
      setSelectedGoals([...selectedGoals, customGoal.trim()]);
      setCustomGoal('');
    }
  };

  const handleAddCustomAudience = () => {
    if (customAudience.trim()) {
      setSelectedAudiences([...selectedAudiences, customAudience.trim()]);
      setCustomAudience('');
    }
  };

  const handleRemoveGoal = (goal: string) => {
    setSelectedGoals(selectedGoals.filter(g => g !== goal));
  };

  const handleRemoveAudience = (audience: string) => {
    setSelectedAudiences(selectedAudiences.filter(a => a !== audience));
  };

  const handlePlatformChange = (newPlatform: Platform) => {
    setPlatform(newPlatform);
  };

  const handleNext = () => {
    if (currentStep === 1) {
      // Complete wizard
      const updatedItem: Partial<ContentItem> = {
        title,
        summary,
        notes,
        sourceUrl,
        sourceContent,
        mainPoints,
        importantQuotes,
        povAngles,
        selectedPovAngles,
        goals: selectedGoals,
        audiences: selectedAudiences,
        length,
        platform: platform as Platform,
        startedDraftingAtISO: item?.startedDraftingAtISO || new Date().toISOString()
      };
      if (onComplete) {
        onComplete(updatedItem);
      } else if (onSave) {
        onSave(updatedItem);
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    if (currentStep === 0) return canProceedFromStep0;
    if (currentStep === 1) return true;
    return false;
  };

  // Jamie generation handlers
  const handleGenerateSummary = async () => {
    const availableSourceContent = sourceContent || item?.sourceContent || item?.notes || '';
    const availableSourceUrl = sourceUrl || item?.sourceUrl || '';
    
    if (!availableSourceContent && !availableSourceUrl) {
      setSummaryError('Please add source material (URL or content) first');
      return;
    }
    
    setIsGeneratingSummary(true);
    setSummaryError(null);
    
    try {
      const generatedSummary = await generateContentSummary(
        availableSourceContent,
        availableSourceUrl,
        item?.sourceAuthor
      );
      setSummary(generatedSummary);
      toast.success('Summary generated');
    } catch (error) {
      console.error('Failed to generate summary:', error);
      setSummaryError(error instanceof Error ? error.message : 'Failed to generate summary');
      toast.error('Failed to generate summary');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleGenerateMainPoints = async () => {
    const availableSourceContent = sourceContent || item?.sourceContent || '';
    const availableSourceUrl = sourceUrl || item?.sourceUrl || '';
    
    if (!availableSourceContent && !availableSourceUrl) {
      setMainPointsError('Please add source material first');
      return;
    }
    
    setIsGeneratingMainPoints(true);
    setMainPointsError(null);
    
    try {
      const generatedPoints = await generateMainPoints(
        availableSourceContent,
        availableSourceUrl,
        item?.sourceAuthor
      );
      setMainPoints(generatedPoints);
      toast.success('Main points generated');
    } catch (error) {
      console.error('Failed to generate main points:', error);
      setMainPointsError(error instanceof Error ? error.message : 'Failed to generate main points');
      toast.error('Failed to generate main points');
    } finally {
      setIsGeneratingMainPoints(false);
    }
  };

  const handleGenerateImportantQuotes = async () => {
    const availableSourceContent = sourceContent || item?.sourceContent || '';
    const availableSourceUrl = sourceUrl || item?.sourceUrl || '';
    
    if (!availableSourceContent && !availableSourceUrl) {
      setQuotesError('Please add source material first');
      return;
    }
    
    setIsGeneratingQuotes(true);
    setQuotesError(null);
    
    try {
      console.log('🚀 Starting quote generation...');
      const generatedQuotes = await generateImportantQuotes(
        availableSourceContent,
        availableSourceUrl,
        item?.sourceAuthor
      );
      console.log('✅ Quotes generated successfully:', generatedQuotes);
      setImportantQuotes(generatedQuotes);
      toast.success('Important quotes extracted');
    } catch (error) {
      console.error('❌ Failed to generate quotes:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate quotes';
      setQuotesError(errorMessage);
      toast.error(`Failed to generate quotes: ${errorMessage}`);
    } finally {
      setIsGeneratingQuotes(false);
    }
  };

  const handleGeneratePOVAngles = async () => {
    const availableSourceContent = sourceContent || item?.sourceContent || '';
    const availableSourceUrl = sourceUrl || item?.sourceUrl || '';
    
    if (!availableSourceContent && !availableSourceUrl) {
      setPovAnglesError('Please add source material first');
      return;
    }
    
    if (!platform) {
      setPovAnglesError('Please select a platform first');
      return;
    }
    
    if (selectedAudiences.length === 0) {
      setPovAnglesError('Please select at least one audience first');
      return;
    }
    
    if (selectedGoals.length === 0) {
      setPovAnglesError('Please select at least one goal first');
      return;
    }
    
    setIsGeneratingPOVAngles(true);
    setPovAnglesError(null);
    
    try {
      const generatedAngles = await generatePOVAngles(
        availableSourceContent,
        platform,
        selectedAudiences,
        selectedGoals,
        availableSourceUrl,
        item?.sourceAuthor
      );
      setPovAngles(generatedAngles);
      toast.success('POV angles generated');
    } catch (error) {
      console.error('Failed to generate POV angles:', error);
      setPovAnglesError(error instanceof Error ? error.message : 'Failed to generate POV angles');
      toast.error('Failed to generate POV angles');
    } finally {
      setIsGeneratingPOVAngles(false);
    }
  };

  // Voice dictation for title
  const handleStartListeningForTitle = () => {
    if (!recognitionRef.current) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        console.error('Speech recognition is not supported in this browser.');
        return;
      }

      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setTitle(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        if (event.error !== 'not-allowed' && event.error !== 'no-speech' && event.error !== 'aborted') {
          console.error('Speech recognition error:', event.error);
        }
        
        if (event.error === 'not-allowed') {
          console.warn('Microphone access denied.');
        }
        setIsListeningForTitle(false);
      };

      recognitionRef.current.onend = () => {
        setIsListeningForTitle(false);
      };
    }

    try {
      recognitionRef.current.start();
      setIsListeningForTitle(true);
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListeningForTitle(false);
    }
  };

  const handleStopListeningForTitle = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListeningForTitle(false);
    }
  };

  const stepConfig = [
    { number: 0, label: 'Plan', icon: Lightbulb },
    { number: 1, label: 'Confirm', icon: Check }
  ];

  if (!isOpen) return null;

  // Check if POV angles section should appear
  const showPOVAngles = (sourceContent || sourceUrl || item?.sourceContent || item?.sourceUrl) && 
                        platform && 
                        selectedAudiences.length > 0 && 
                        selectedGoals.length > 0;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100000]">
      <div className="w-full max-w-6xl h-[90vh] bg-[#f7f7f9] rounded-[32px] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-10 py-8 border-b border-slate-200/50 flex items-center justify-between backdrop-blur-xl bg-[#e2b7be]">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[rgba(255,255,255,0.4)] flex items-center justify-center shadow-lg shadow-[#6b2358]/20">
              <Pin className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="font-serif font-medium text-[30px] text-[rgb(255,255,255)]">New Content Planning</h2>
              <p className="text-white/80 text-[16px] mt-0.5">Content idea: <span className="font-medium">{title || 'Untitled idea'}</span></p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 rounded-xl hover:bg-white/60 transition-all flex items-center justify-center text-[rgb(255,255,255)] hover:text-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Pills */}
        <div className="border-b border-slate-200/50 bg-white/40 px-8 py-4 bg-[rgb(247,247,249)] px-[32px] py-[18px]">
          <div className="flex items-center gap-2">
            {stepConfig.map((s, idx) => {
              const Icon = s.icon;
              const isActive = currentStep === s.number;
              const isCompleted = currentStep > s.number;
              
              return (
                <div key={s.number} className="flex items-center gap-2">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all ${
                    isActive 
                      ? 'bg-[#6b2358] text-white font-semibold' 
                      : isCompleted 
                        ? 'bg-[#6b2358] text-white font-medium' 
                        : 'bg-slate-100 text-slate-500 font-normal'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                    <span>{s.label}</span>
                  </div>
                  {idx < stepConfig.length - 1 && (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#f7f7f9]">
          <div className="max-w-3xl mx-auto">
            
            {/* Step 0: Plan (One Big Page) */}
            {currentStep === 0 && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-[#e2b7bd] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lightbulb className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2" style={{ fontFamily: 'Lora, serif', fontSize: '28pt' }}>
                    Plan Your Content
                  </h3>
                  <p className="text-slate-600">
                    Add your content idea, source material, and planning details
                  </p>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 text-[18px]">
                    Content Idea Title
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Content title..."
                      className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6b2358] focus:border-transparent"
                    />
                    <button
                      onClick={isListeningForTitle ? handleStopListeningForTitle : handleStartListeningForTitle}
                      className={`flex-shrink-0 p-2.5 rounded-lg transition-all ${
                        isListeningForTitle 
                          ? 'bg-red-500 text-white animate-pulse' 
                          : 'bg-[#6b2358]/10 text-[#6b2358] hover:bg-[#6b2358]/20'
                      }`}
                      title={isListeningForTitle ? 'Stop dictation' : 'Start dictation'}
                    >
                      {isListeningForTitle ? (
                        <MicOff className="w-5 h-5" />
                      ) : (
                        <Mic className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Source Material */}
                <div className="bg-white border-2 border-[#6b2358]/20 rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-[#6b2358]" />
                    <h4 className="text-sm font-semibold text-slate-900">Source Material</h4>
                  </div>
                  <p className="text-xs text-slate-600 mb-4">
                    Add research, articles, or links here. Jamie will use this to help you draft.
                  </p>
                  
                  {/* Source URL */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Source URL <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="url"
                      value={sourceUrl}
                      onChange={(e) => setSourceUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6b2358] focus:border-transparent"
                    />
                    {sourceUrl && (
                      <a 
                        href={sourceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-[#6b2358] hover:text-[#5e2350] transition-colors mt-1.5"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Open in new tab
                      </a>
                    )}
                  </div>

                  {/* Source Content */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Source Content <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                      value={sourceContent}
                      onChange={(e) => setSourceContent(e.target.value)}
                      placeholder="Paste article text, research notes, or any content Jamie should reference..."
                      rows={6}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6b2358] focus:border-transparent resize-none font-mono text-xs"
                    />
                  </div>
                </div>

                {/* Summary with Jamie Generation */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700 text-[18px]">
                      Summary <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <button
                      onClick={handleGenerateSummary}
                      disabled={isGeneratingSummary || (!sourceContent && !sourceUrl && !item?.sourceContent && !item?.sourceUrl)}
                      className="px-3 py-1.5 bg-[#6b2358] hover:bg-[#5e2350] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 text-xs font-medium"
                    >
                      {isGeneratingSummary ? (
                        <>
                          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                          Generating...
                        </>
                      ) : (summary) ? (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          Regenerate summary
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          Generate summary
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="What is this content about? A brief overview..."
                    rows={4}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6b2358] focus:border-transparent resize-none"
                  />
                  {summaryError && (
                    <p className="text-sm text-red-600 mt-2">{summaryError}</p>
                  )}
                </div>

                {/* Main Points */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700 text-[18px]">
                      Main Points <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <button
                      onClick={handleGenerateMainPoints}
                      disabled={isGeneratingMainPoints || (!sourceContent && !sourceUrl && !item?.sourceContent && !item?.sourceUrl)}
                      className="px-3 py-1.5 bg-[#6b2358] hover:bg-[#5e2350] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 text-xs font-medium"
                    >
                      {isGeneratingMainPoints ? (
                        <>
                          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                          Generating...
                        </>
                      ) : (mainPoints.length > 0) ? (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          Regenerate main points
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          Generate main points
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    value={mainPoints.join('\n\n')}
                    onChange={(e) => {
                      const points = e.target.value.split('\n\n').map(p => p.trim()).filter(p => p);
                      setMainPoints(points);
                    }}
                    placeholder="One main point per paragraph (separate with double line breaks)..."
                    rows={6}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6b2358] focus:border-transparent resize-none"
                  />
                  {mainPointsError && (
                    <p className="text-sm text-red-600 mt-2">{mainPointsError}</p>
                  )}
                </div>

                {/* Important Quotes */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700 text-[18px]">
                      Important Quotes <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <button
                      onClick={handleGenerateImportantQuotes}
                      disabled={isGeneratingQuotes || (!sourceContent && !sourceUrl && !item?.sourceContent && !item?.sourceUrl)}
                      className="px-3 py-1.5 bg-[#6b2358] hover:bg-[#5e2350] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 text-xs font-medium"
                    >
                      {isGeneratingQuotes ? (
                        <>
                          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                          Generating...
                        </>
                      ) : (importantQuotes.length > 0) ? (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          Regenerate quotes
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          Generate quotes
                        </>
                      )}
                    </button>
                  </div>
                  <textarea
                    value={importantQuotes.join('\n\n')}
                    onChange={(e) => {
                      const quotes = e.target.value.split('\n\n').filter(q => q.trim());
                      setImportantQuotes(quotes);
                    }}
                    placeholder="One quote per paragraph (separate with double line breaks)..."
                    rows={6}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6b2358] focus:border-transparent resize-none"
                  />
                  {quotesError && (
                    <p className="text-sm text-red-600 mt-2">{quotesError}</p>
                  )}
                </div>

                {/* Dividing Line */}
                <div className="border-t border-slate-300 my-2"></div>

                {/* Platform + Length */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Platform */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3 text-[18px]">
                      Platform <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <div className="space-y-2">
                      {PLATFORMS.map((p) => (
                        <button
                          key={p}
                          onClick={() => handlePlatformChange(p)}
                          className={`w-full px-4 py-3 rounded-lg border-2 text-left transition-all ${
                            platform === p 
                              ? 'border-[#6b2358] bg-[#f5e5eb]' 
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-slate-900">{p}</div>
                            {platform === p && (
                              <div className="w-5 h-5 bg-[#6b2358] rounded-full flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Length */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3 text-[18px]">
                      Length <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <div className="space-y-2">
                      {LENGTH_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setLength(option.value)}
                          className={`w-full px-4 py-3 rounded-lg border-2 text-left transition-all ${
                            length === option.value 
                              ? 'border-[#6b2358] bg-[#f5e5eb]' 
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-slate-900">{option.label}</div>
                              <div className="text-sm text-slate-500">{option.description}</div>
                            </div>
                            {length === option.value && (
                              <div className="w-5 h-5 bg-[#6b2358] rounded-full flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Goals */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3 text-[18px]">
                    Goals <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {GOAL_OPTIONS.map((goal) => {
                      const isSelected = selectedGoals.includes(goal);
                      return (
                        <button
                          key={goal}
                          onClick={() => {
                            if (isSelected) {
                              handleRemoveGoal(goal);
                            } else {
                              setSelectedGoals([...selectedGoals, goal]);
                            }
                          }}
                          className={`px-3 py-2 rounded-lg border-2 text-sm transition-all ${
                            isSelected 
                              ? 'border-[#6b2358] bg-[#6b2358]/10 text-[#6b2358]' 
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          {goal}
                        </button>
                      );
                    })}
                  </div>
                  
                  {selectedGoals.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {selectedGoals.map((goal) => (
                        <div 
                          key={goal}
                          className="flex items-center gap-1 px-3 py-1 bg-[#6b2358] text-white rounded-full text-sm"
                        >
                          <span>{goal}</span>
                          <button
                            onClick={() => handleRemoveGoal(goal)}
                            className="hover:bg-white/20 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customGoal}
                      onChange={(e) => setCustomGoal(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddCustomGoal()}
                      placeholder="Add custom goal..."
                      className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6b2358]"
                    />
                    <button
                      onClick={handleAddCustomGoal}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>
                </div>

                {/* Audiences */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3 text-[18px]">
                    Target Audiences <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {AUDIENCE_OPTIONS.map((audience) => {
                      const isSelected = selectedAudiences.includes(audience);
                      return (
                        <button
                          key={audience}
                          onClick={() => {
                            if (isSelected) {
                              handleRemoveAudience(audience);
                            } else {
                              setSelectedAudiences([...selectedAudiences, audience]);
                            }
                          }}
                          className={`px-3 py-2 rounded-lg border-2 text-sm transition-all flex items-center gap-2 ${
                            isSelected 
                              ? 'border-[#6b2358] bg-[#f5e5eb] text-[#5e2350]' 
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <Users className="w-4 h-4" />
                          {audience}
                        </button>
                      );
                    })}
                  </div>

                  {selectedAudiences.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {selectedAudiences.map((audience) => (
                        <div 
                          key={audience}
                          className="flex items-center gap-1 px-3 py-1 bg-[#6b2358] text-white rounded-full text-sm"
                        >
                          <span>{audience}</span>
                          <button
                            onClick={() => handleRemoveAudience(audience)}
                            className="hover:bg-white/20 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customAudience}
                      onChange={(e) => setCustomAudience(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddCustomAudience()}
                      placeholder="Add custom audience..."
                      className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6b2358]"
                    />
                    <button
                      onClick={handleAddCustomAudience}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>
                </div>

                {/* POV Angles - Only show when conditions are met */}
                {showPOVAngles && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-slate-700 text-[18px]">
                        POV / Angle Suggestions <span className="text-slate-400 font-normal">(optional)</span>
                      </label>
                      <button
                        onClick={handleGeneratePOVAngles}
                        disabled={isGeneratingPOVAngles}
                        className="px-3 py-1.5 bg-[#6b2358] hover:bg-[#5e2350] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 text-xs font-medium"
                      >
                        {isGeneratingPOVAngles ? (
                          <>
                            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                            Generating...
                          </>
                        ) : povAngles.length > 0 ? (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            Regenerate
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            Generate with Jamie
                          </>
                        )}
                      </button>
                    </div>
                    {povAngles.length > 0 ? (
                      <div className="space-y-2">
                        {povAngles.map((angle, idx) => {
                          const isSelected = selectedPovAngles.includes(angle);
                          return (
                            <div 
                              key={idx} 
                              className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                                isSelected 
                                  ? 'bg-[#f5e5eb] border-[#6b2358]' 
                                  : 'bg-white border-[#6b2358]/30 hover:border-[#6b2358]/50'
                              }`}
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedPovAngles(selectedPovAngles.filter(a => a !== angle));
                                } else {
                                  setSelectedPovAngles([...selectedPovAngles, angle]);
                                }
                              }}
                            >
                              {/* Checkbox */}
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                isSelected 
                                  ? 'bg-[#6b2358] border-[#6b2358]' 
                                  : 'bg-white border-slate-300'
                              }`}>
                                {isSelected && <Check className="w-3 h-3 text-white" />}
                              </div>
                              
                              <Lightbulb className="w-5 h-5 text-[#6b2358] flex-shrink-0 mt-0.5" />
                              <p className="text-sm text-slate-700 flex-1">{angle}</p>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPovAngles(povAngles.filter((_, i) => i !== idx));
                                  setSelectedPovAngles(selectedPovAngles.filter(a => a !== angle));
                                }}
                                className="text-slate-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 italic">Jamie can suggest angles based on your source material, platform, audiences, and goals. Click "Generate with Jamie" above.</p>
                    )}
                    {povAnglesError && (
                      <p className="text-sm text-red-600 mt-2">{povAnglesError}</p>
                    )}
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 text-[18px]">
                    Notes <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Raw research, links, brainstorming, anything that helps..."
                    rows={6}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6b2358] focus:border-transparent resize-none"
                  />
                </div>
              </div>
            )}

            {/* Step 1: Confirm & Start Drafting */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-[#e2b7bd] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2" style={{ fontFamily: 'Lora, serif', fontSize: '28pt' }}>
                    Ready to Draft
                  </h3>
                  <p className="text-slate-600">
                    Review your plan before starting
                  </p>
                </div>

                {/* Summary Card */}
                <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-slate-500 mb-1">Title</h4>
                    <p className="text-lg font-semibold text-slate-900">{title}</p>
                  </div>

                  {summary && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-500 mb-1">Summary</h4>
                      <p className="text-sm text-slate-700">{summary}</p>
                    </div>
                  )}

                  {mainPoints.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-500 mb-2">Main Points (top {Math.min(8, mainPoints.length)} shown)</h4>
                      <ul className="space-y-1.5">
                        {mainPoints.slice(0, 8).map((point, idx) => (
                          <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                            <span className="text-[#6b2358] font-semibold">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {importantQuotes.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-500 mb-2">Important Quotes (top {Math.min(6, importantQuotes.length)} shown)</h4>
                      <div className="space-y-2">
                        {importantQuotes.slice(0, 6).map((quote, idx) => (
                          <div key={idx} className="pl-4 border-l-2 border-[#6b2358]">
                            <p className="text-sm text-slate-700 italic">"{quote}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-3 py-1.5 bg-[#6b2358] text-white text-sm rounded-lg font-medium">
                        {platform}
                      </span>
                      <span className="px-3 py-1.5 bg-slate-100 text-slate-700 text-sm rounded-lg">
                        {length}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-slate-500 mb-2">Goals</h4>
                        <div className="flex flex-wrap gap-1">
                          {selectedGoals.map((goal) => (
                            <span key={goal} className="px-2 py-1 bg-[#f5e5eb] text-[#5e2350] text-xs rounded-full">
                              {goal}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-slate-500 mb-2">Audiences</h4>
                        <div className="flex flex-wrap gap-1">
                          {selectedAudiences.map((audience) => (
                            <span key={audience} className="px-2 py-1 bg-[#f5e5eb] text-[#5e2350] text-xs rounded-full">
                              {audience}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {selectedPovAngles.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-slate-500 mb-2">Selected POV Angles</h4>
                        <ul className="space-y-1.5">
                          {selectedPovAngles.map((angle, idx) => (
                            <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                              <Lightbulb className="w-4 h-4 text-[#6b2358] flex-shrink-0 mt-0.5" />
                              <span>{angle}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-[rgba(245,229,235,0)] border border-[#6b2358] rounded-lg p-4">
                  <p className="text-sm text-slate-700">
                    <span className="font-semibold text-[#5e2350]">Next:</span> We'll open the editor ready for you to start drafting.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-white px-8 py-4 flex items-center justify-between">
          <button
            onClick={currentStep === 0 ? onClose : handleBack}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            {currentStep === 0 ? 'Cancel' : 'Back'}
          </button>

          {/* Breadcrumb Dots */}
          <div className="flex items-center gap-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i <= currentStep
                    ? 'w-8 bg-[#6b2358]'
                    : 'w-2 bg-slate-200'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Save idea and finish later button - only show on step 0 */}
            {currentStep === 0 && onSaveAndClose && (
              <button
                onClick={() => {
                  const partialUpdate: Partial<ContentItem> = {
                    title,
                    summary,
                    notes,
                    sourceUrl,
                    sourceContent,
                    mainPoints,
                    importantQuotes,
                    povAngles,
                    selectedPovAngles,
                    goals: selectedGoals.length > 0 ? selectedGoals : undefined,
                    audiences: selectedAudiences.length > 0 ? selectedAudiences : undefined,
                    length: length || undefined,
                    platform: platform || undefined,
                  };
                  onSaveAndClose(partialUpdate);
                }}
                disabled={!title}
                className="px-4 py-2 text-[#6b2358] hover:bg-[#f5e5eb] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border border-[#6b2358]"
              >
                Save idea and finish later
              </button>
            )}
            
            {/* Open Editor button - bypass wizard and go straight to editor - only show on step 0 */}
            {currentStep === 0 && onComplete && (
              <button
                onClick={() => {
                  const partialUpdate: Partial<ContentItem> = {
                    title,
                    summary,
                    notes,
                    sourceUrl,
                    sourceContent,
                    mainPoints,
                    importantQuotes,
                    povAngles,
                    selectedPovAngles,
                    goals: selectedGoals.length > 0 ? selectedGoals : undefined,
                    audiences: selectedAudiences.length > 0 ? selectedAudiences : undefined,
                    length: length || undefined,
                    platform: platform || undefined,
                    startedDraftingAtISO: item?.startedDraftingAtISO || new Date().toISOString()
                  };
                  onComplete(partialUpdate);
                }}
                disabled={!title}
                className="px-4 py-2 bg-[#2f829b] hover:bg-[#034863] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Open Editor
              </button>
            )}
            
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="px-6 py-2 bg-[rgb(107,35,88)] hover:bg-[#5e2350] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {currentStep === 1 ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  Start drafting
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}