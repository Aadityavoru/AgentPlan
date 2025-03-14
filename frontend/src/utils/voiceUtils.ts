/**
 * Utility functions for voice recognition and text-to-speech
 */

// Speech recognition interface for TypeScript
interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start: () => void;
    stop: () => void;
    abort: () => void;
    onerror: (event: any) => void;
    onresult: (event: any) => void;
    onend: () => void;
  }
  
  // Global reference to ensure we only have one instance
  let recognitionInstance: SpeechRecognition | null = null;
  
  /**
   * Get or create the speech recognition instance
   */
  const getSpeechRecognition = (): SpeechRecognition | null => {
    if (recognitionInstance) {
      return recognitionInstance;
    }
  
    // Check browser support
    const SpeechRecognition = (window as any).SpeechRecognition || 
                             (window as any).webkitSpeechRecognition || 
                             null;
    
    if (!SpeechRecognition) {
      console.error('Speech recognition not supported in this browser');
      return null;
    }
  
    // Create a new instance
    try {
      const instance = new SpeechRecognition();
      
      // Configure the instance
      instance.continuous = true;
      instance.interimResults = true;
      instance.lang = 'en-US';
      
      // Store and return the instance
      recognitionInstance = instance;
      return recognitionInstance;
    } catch (error) {
      console.error('Error creating speech recognition instance:', error);
      return null;
    }
  };
  
  /**
   * Start speech recognition
   * @param onResult - Callback that receives the recognized text
   * @param onEnd - Callback when recognition ends
   * @param onError - Callback when an error occurs
   * @returns Function to stop recognition
   */
  export const startSpeechRecognition = (
    onResult: (text: string, isFinal: boolean) => void,
    onEnd?: () => void,
    onError?: (error: any) => void
  ): (() => void) => {
    const recognition = getSpeechRecognition();
    
    if (!recognition) {
      if (onError) onError('Speech recognition not supported');
      return () => {};
    }
    
    // Set up result handler
    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const isFinal = event.results[i].isFinal;
        onResult(transcript, isFinal);
      }
    };
    
    // Set up end handler
    recognition.onend = () => {
      if (onEnd) onEnd();
    };
    
    // Set up error handler
    recognition.onerror = (event: any) => {
      if (onError) onError(event.error);
    };
    
    // Start recognition
    try {
      recognition.start();
    } catch (error) {
      if (onError) onError(error);
    }
    
    // Return function to stop recognition
    return () => {
      try {
        recognition.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    };
  };
  
  /**
   * Speak text using the browser's speech synthesis
   * @param text - Text to be spoken
   * @param onEnd - Callback when speech ends
   * @param options - Configuration options
   */
  export const speakText = (
    text: string, 
    onEnd?: () => void,
    options?: {
      rate?: number; // 0.1 to 10
      pitch?: number; // 0 to 2
      volume?: number; // 0 to 1
      voice?: string; // Voice name or language
    }
  ): void => {
    // Check browser support
    if (!('speechSynthesis' in window)) {
      console.error('Speech synthesis not supported in this browser');
      return;
    }
    
    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Apply options if provided
    if (options) {
      if (options.rate !== undefined) utterance.rate = options.rate;
      if (options.pitch !== undefined) utterance.pitch = options.pitch;
      if (options.volume !== undefined) utterance.volume = options.volume;
      
      // Set voice if specified
      if (options.voice) {
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find(v => 
          v.name === options.voice || 
          v.lang.includes(options.voice as string)
        );
        if (voice) utterance.voice = voice;
      }
    }
    
    // Set end callback
    if (onEnd) {
      utterance.onend = onEnd;
    }
    
    // Speak the text
    window.speechSynthesis.speak(utterance);
  };
  
  /**
   * Stop any ongoing speech
   */
  export const stopSpeaking = (): void => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };
  
  /**
   * Check if speech recognition is supported
   */
  export const isSpeechRecognitionSupported = (): boolean => {
    return !!(
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition
    );
  };
  
  /**
   * Check if speech synthesis is supported
   */
  export const isSpeechSynthesisSupported = (): boolean => {
    return 'speechSynthesis' in window;
  };
  
  /**
   * Get available voices for speech synthesis
   * Note: This may return an empty array if called before voices are loaded
   */
  export const getAvailableVoices = (): SpeechSynthesisVoice[] => {
    if (!('speechSynthesis' in window)) {
      return [];
    }
    return window.speechSynthesis.getVoices();
  };