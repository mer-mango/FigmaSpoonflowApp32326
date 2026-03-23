import { useState, useEffect } from "react";
import { X, Mic, MicOff, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";

interface VoiceInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTranscript?: (text: string) => void;
}

export function MutedVoiceInputModal({ 
  isOpen, 
  onClose,
  onTranscript
}: VoiceInputModalProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recognition, setRecognition] = useState<any>(null);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event: any) => {
        let interim = '';
        let final = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPart = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcriptPart + ' ';
          } else {
            interim += transcriptPart;
          }
        }
        
        if (final) {
          setTranscript(prev => prev + final);
        }
        setInterimTranscript(interim);
      };

      recognitionInstance.onerror = (event: any) => {
        console.log('Speech recognition error event:', event.error);
        
        setIsListening(false);
        setInterimTranscript("");
        
        if (event.error === 'not-allowed') {
          setPermissionDenied(true);
          setError('Microphone access denied. Please allow microphone access in your browser settings.');
        } else if (event.error === 'no-speech') {
          // This is normal - user just paused
          setError(null);
        } else if (event.error === 'aborted') {
          // Aborted is normal when user stops, don't show error
          setError(null);
        } else {
          // Only log unexpected errors
          console.error('Unexpected speech recognition error:', event.error, event);
          setError(`Voice input error: ${event.error}`);
        }
      };

      recognitionInstance.onend = () => {
        console.log('Speech recognition ended');
        // Only reset if we're not intentionally listening
        // This prevents the flash when recognition restarts
        setIsListening(false);
        setInterimTranscript("");
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  // Reset error states when modal opens
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setPermissionDenied(false);
    }
  }, [isOpen]);

  const startListening = async () => {
    if (!recognition) {
      alert("Voice input is not supported in your browser");
      return;
    }

    // Prevent starting if already listening
    if (isListening) {
      console.log('Already listening, ignoring start request');
      return;
    }

    console.log('Attempting to start speech recognition...');
    
    // First, request microphone permission explicitly
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Permission granted, stop the test stream
      stream.getTracks().forEach(track => track.stop());
      console.log('Microphone permission granted');
    } catch (permError: any) {
      // Check if it's a permissions policy violation
      if (permError.name === 'NotAllowedError' && permError.message?.includes('policy')) {
        console.log('Microphone blocked by permissions policy');
        setPermissionDenied(true);
        setError('Microphone access is blocked. Please open this app in a new browser tab to use voice input.');
        return;
      }
      
      console.log('Microphone permission denied by user:', permError.name);
      setPermissionDenied(true);
      setError('Microphone access denied. Please allow microphone access in your browser settings and refresh the page.');
      return;
    }
    
    // Now start speech recognition
    try {
      recognition.start();
      setIsListening(true);
      setError(null);
      setPermissionDenied(false);
      console.log('Speech recognition started successfully');
    } catch (error: any) {
      console.error('Error starting recognition:', error);
      setIsListening(false);
      setError('Could not start voice input. Please refresh the page and try again.');
    }
  };

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleSave = () => {
    if (transcript.trim()) {
      onTranscript?.(transcript.trim());
    }
    onClose();
    // Reset
    setTranscript("");
    setInterimTranscript("");
    stopListening();
  };

  const handleClose = () => {
    stopListening();
    setTranscript("");
    setInterimTranscript("");
    onClose();
  };

  if (!isOpen) return null;

  const displayText = transcript + (interimTranscript ? ` ${interimTranscript}` : '');

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100000] p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-[28px] shadow-2xl overflow-hidden flex flex-col w-full max-w-6xl border border-slate-200/50">
        {/* Header */}
        <div className="px-8 py-6 border-b border-white/20 flex items-center justify-between" style={{ backgroundColor: '#82607d' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shadow-soft">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-serif font-semibold text-white">Voice Input</h2>
          </div>
          <button onClick={handleClose} className="text-white/70 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-start pt-12">
          <div className="max-w-4xl mx-auto w-full space-y-8">
            {/* Microphone Visual */}
            <div className="flex flex-col items-center gap-6">
              <button
                onClick={handleToggleListening}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-2xl ${
                  isListening 
                    ? 'bg-gradient-to-br from-red-500 to-red-600 animate-pulse scale-110' 
                    : 'bg-gradient-to-br from-[#82607d] to-[#b8a7c9] hover:scale-105'
                }`}
              >
                {isListening ? (
                  <Loader2 className="w-12 h-12 text-white animate-spin" />
                ) : (
                  <Mic className="w-12 h-12 text-white" />
                )}
              </button>
              
              <div className="text-center">
                <p className="text-lg font-medium text-slate-700">
                  {isListening ? 'Listening...' : 'Click to start recording'}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  {isListening ? 'Speak clearly into your microphone' : 'Voice input powered by Jamie'}
                </p>
              </div>
            </div>

            {/* Transcript Display */}
            <div className="bg-white/60 backdrop-blur-sm border border-slate-200/50 rounded-2xl p-6 min-h-[300px]">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-[#5e2350]" />
                <span className="text-sm font-medium text-slate-600">Transcript</span>
              </div>
              <div className="text-slate-700 leading-relaxed">
                {displayText || (
                  <span className="text-slate-400 italic">
                    Your spoken words will appear here...
                  </span>
                )}
                {interimTranscript && (
                  <span className="text-slate-400 ml-1">{interimTranscript}</span>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-[#5e2350]/5 border border-[#5e2350]/10 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#5e2350] flex-shrink-0 mt-0.5" />
                <div className="text-sm text-slate-600">
                  <p className="font-medium mb-1">Tips for best results:</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-500">
                    <li>Speak clearly and at a normal pace</li>
                    <li>Minimize background noise</li>
                    <li>Click the microphone button to stop recording</li>
                    <li>Click "Use Transcript" to process your input with Jamie</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mt-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-500">
                    <p className="font-medium mb-1">Error:</p>
                    <p className="text-slate-500">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Permission Denied Display */}
            {permissionDenied && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-700 mb-1">Microphone Access Required</p>
                    <p className="text-slate-600 mb-2">
                      To use voice input, please allow microphone access in your browser settings.
                    </p>
                    <p className="text-xs text-slate-500">
                      <strong>Chrome:</strong> Click the camera icon in the address bar → Allow microphone<br />
                      <strong>Safari:</strong> Safari menu → Settings → Websites → Microphone → Allow
                    </p>
                    <div className="mt-3">
                      <p className="text-sm text-slate-600 font-medium mb-2">Or type your input below:</p>
                      <textarea
                        value={transcript}
                        onChange={(e) => setTranscript(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border border-slate-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5e2350]/30 resize-none text-sm bg-white/60 backdrop-blur-sm"
                        placeholder="Type your message here..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-200/50 flex items-center justify-between bg-slate-50/50 backdrop-blur-sm">
          <Button 
            variant="outline"
            onClick={handleClose}
            className="rounded-2xl border-slate-200/50 hover:bg-slate-50/60"
          >
            Cancel
          </Button>
          <div className="flex items-center gap-3">
            {transcript && (
              <Button 
                variant="outline"
                onClick={() => {
                  setTranscript("");
                  setInterimTranscript("");
                }}
                className="rounded-2xl border-slate-200/50 hover:bg-slate-50/60"
              >
                Clear
              </Button>
            )}
            <Button 
              className="bg-gradient-to-br from-[#5e2350] to-[#b8a7c9] hover:from-[#5e2350]/90 hover:to-[#b8a7c9]/90 text-white rounded-2xl shadow-soft"
              onClick={handleSave}
              disabled={!transcript.trim()}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Use Transcript
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}