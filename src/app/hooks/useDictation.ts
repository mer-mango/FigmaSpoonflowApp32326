import { useRef, useState, useEffect } from 'react';

interface UseDictationOptions {
  onTranscript?: (transcript: string, isFinal: boolean) => void;
  continuous?: boolean;
  language?: string;
  onError?: (error: string) => void;
}

export function useDictation(options: UseDictationOptions = {}) {
  const {
    onTranscript,
    continuous = true,
    language = 'en-US',
    onError
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if Web Speech API is supported
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSupported(true);
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = continuous;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language;
    }

    return () => {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
    };
  }, [continuous, language]);

  const startListening = async () => {
    if (!recognitionRef.current) {
      const errorMsg = 'Speech recognition is not supported in your browser. Try Chrome, Edge, or Safari.';
      setError(errorMsg);
      if (onError) onError(errorMsg);
      alert(errorMsg);
      return;
    }

    // Check if we're on HTTPS (required for microphone access)
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      const errorMsg = 'Microphone access requires a secure connection (HTTPS).';
      setError(errorMsg);
      if (onError) onError(errorMsg);
      alert(errorMsg);
      return;
    }

    setError(null);
    setIsListening(true);

    recognitionRef.current.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript = transcript;
        }
      }

      if (onTranscript) {
        if (finalTranscript) {
          onTranscript(finalTranscript.trim(), true);
        } else if (interimTranscript) {
          onTranscript(interimTranscript, false);
        }
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      // Only log unexpected errors to console
      if (event.error !== 'not-allowed' && event.error !== 'no-speech' && event.error !== 'aborted') {
        console.error('Speech recognition error:', event.error);
      }
      
      setIsListening(false);
      
      let errorMsg = 'Speech recognition error occurred.';
      
      switch (event.error) {
        case 'not-allowed':
          errorMsg = 'Microphone access was denied. Please allow microphone access in your browser settings and try again.';
          break;
        case 'no-speech':
          errorMsg = 'No speech detected. Please try again.';
          return; // Don't show alert for this one
        case 'audio-capture':
          errorMsg = 'No microphone found. Please connect a microphone and try again.';
          break;
        case 'network':
          errorMsg = 'Network error occurred. Please check your internet connection.';
          break;
        case 'aborted':
          return; // User stopped, no error needed
        default:
          errorMsg = `Speech recognition error: ${event.error}`;
      }
      
      setError(errorMsg);
      if (onError) onError(errorMsg);
      
      // Only show alert for permission-related errors
      if (event.error === 'not-allowed' || event.error === 'audio-capture') {
        alert(errorMsg);
      }
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    try {
      recognitionRef.current.start();
    } catch (err) {
      console.error('Failed to start recognition:', err);
      setIsListening(false);
      const errorMsg = 'Failed to start speech recognition. Please try again.';
      setError(errorMsg);
      if (onError) onError(errorMsg);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return {
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    toggleListening,
  };
}