import React, { useState, useEffect, useRef } from 'react';
import { InterviewSession, Message } from '../types';
import ApiService from '../services/api';
import MessageBubble from './MessageBubble';
import { 
  startSpeechRecognition, 
  speakText, 
  stopSpeaking,
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported
} from '../utils/voiceUtils';

// Export the props interface
export interface VoiceInterviewChatProps {
  session: InterviewSession;
  messages: Message[];
  onAddMessage: (message: Message) => void;
  onInterviewEnd: (feedback: string) => void;
  setIsLoading: (isLoading: boolean) => void;
}

const VoiceInterviewChat: React.FC<VoiceInterviewChatProps> = ({ 
  session, 
  messages, 
  onAddMessage, 
  onInterviewEnd,
  setIsLoading 
}) => {
  // State
  const [answer, setAnswer] = useState<string>('');
  const [isLastQuestion, setIsLastQuestion] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [isVoiceSupported, setIsVoiceSupported] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  
  // Refs
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const answerInputRef = useRef<HTMLTextAreaElement>(null);
  const stopListeningRef = useRef<(() => void) | null>(null);
  
  // Check browser support for voice features
  useEffect(() => {
    const speechRecognitionSupported = isSpeechRecognitionSupported();
    const speechSynthesisSupported = isSpeechSynthesisSupported();
    setIsVoiceSupported(speechRecognitionSupported && speechSynthesisSupported);
    
    if (!speechRecognitionSupported || !speechSynthesisSupported) {
      console.warn('Voice features not fully supported in this browser');
    }
  }, []);
  
  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Speak the interview questions
  useEffect(() => {
    // Only speak agent messages (questions)
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'agent' && session.isVoiceMode) {
      // Check if it's a question or follow-up, not an evaluation
      if (lastMessage.text.includes('?') || 
          isAgentQuestion(lastMessage.text, messages.length - 1)) {
        handleSpeak(lastMessage.text);
      }
    }
  }, [messages, session.isVoiceMode]);
  
  // Helper to determine if an agent message is a question not an evaluation
  const isAgentQuestion = (text: string, index: number): boolean => {
    // If this is the first message, it's definitely a question
    if (index === 0) return true;
    
    // If the previous message was from the candidate, and this doesn't contain
    // evaluation-like content, it's likely a question
    if (index > 0 && 
        messages[index - 1].role === 'candidate' &&
        !text.toLowerCase().includes('strength') &&
        !text.toLowerCase().includes('improve') &&
        !text.toLowerCase().includes('evaluation') &&
        !text.toLowerCase().includes('assessment')) {
      return true;
    }
    
    return false;
  };
  
  // Handle speaking text
  const handleSpeak = (text: string) => {
    setIsSpeaking(true);
    
    // Stop any ongoing speech
    stopSpeaking();
    
    // Speak the new text
    speakText(
      text,
      () => {
        setIsSpeaking(false);
        // Auto-start listening after speaking if voice mode is on
        if (session.isVoiceMode && !isListening) {
          handleToggleListening();
        }
      },
      {
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0
      }
    );
  };
  
  // Handle toggling speech recognition
  const handleToggleListening = () => {
    if (isListening) {
      // Stop listening
      if (stopListeningRef.current) {
        stopListeningRef.current();
        stopListeningRef.current = null;
      }
      setIsListening(false);
      
      // If we have interim results, add them to the answer
      if (interimTranscript) {
        setAnswer(prev => prev + ' ' + interimTranscript);
        setInterimTranscript('');
      }
    } else {
      // Start listening
      setIsListening(true);
      
      const stopListening = startSpeechRecognition(
        (text, isFinal) => {
          if (isFinal) {
            setAnswer(prev => prev + ' ' + text);
            setInterimTranscript('');
          } else {
            setInterimTranscript(text);
          }
        },
        () => {
          setIsListening(false);
          stopListeningRef.current = null;
        },
        (error) => {
          console.error('Speech recognition error:', error);
          setIsListening(false);
          stopListeningRef.current = null;
        }
      );
      
      stopListeningRef.current = stopListening;
    }
  };
  
  // Handle answer input change
  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAnswer(e.target.value);
  };
  
  // Handle submitting an answer
  const handleSubmitAnswer = async () => {
    // Stop listening if active
    if (isListening && stopListeningRef.current) {
      stopListeningRef.current();
      stopListeningRef.current = null;
      setIsListening(false);
    }
    
    // Stop speaking if active
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    }
    
    // Combine input and interim transcript
    const finalAnswer = (answer + ' ' + interimTranscript).trim();
    
    if (!finalAnswer) {
      alert('Please enter your answer');
      return;
    }
    
    try {
      // Add candidate's answer to messages
      onAddMessage({ role: 'candidate', text: finalAnswer });
      
      // Clear inputs
      setAnswer('');
      setInterimTranscript('');
      
      // Show loading indicator
      setIsLoading(true);
      
      // Call API to submit answer
      const response = await ApiService.submitAnswer(session.sessionId, finalAnswer);
      
      // Add evaluation to messages (this won't be spoken)
      onAddMessage({ role: 'evaluation', text: response.evaluation });
      
      // Add next question to messages (this will be spoken)
      onAddMessage({ role: 'agent', text: response.question });
      
      // Check if this is the last question
      setIsLastQuestion(response.is_last);
      
    } catch (error) {
      console.error('Error submitting answer:', error);
      onAddMessage({ 
        role: 'agent', 
        text: 'Sorry, there was an error processing your answer. Please try again or start a new interview.' 
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle ending the interview
  const handleEndInterview = async () => {
    // Stop listening if active
    if (isListening && stopListeningRef.current) {
      stopListeningRef.current();
      stopListeningRef.current = null;
      setIsListening(false);
    }
    
    // Stop speaking if active
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    }
    
    try {
      setIsLoading(true);
      
      // Call API to end interview
      const response = await ApiService.endInterview(session.sessionId);
      
      // Pass feedback to parent
      onInterviewEnd(response.feedback);
    } catch (error) {
      console.error('Error ending interview:', error);
      alert('Failed to end interview. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle keydown events (Shift+Enter to submit)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      handleSubmitAnswer();
    }
  };
  
  // Calculate progress percentage
  const progressPercentage = (session.currentQuestion / session.totalQuestions) * 100;
  
  return (
    <div className="interview-container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>{session.company} Mock Interview</h2>
        <div className="d-flex align-items-center">
          {session.isVoiceMode && (
            <div className={`voice-indicator me-3 ${isListening ? 'active' : ''}`}>
              {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Voice Mode'}
            </div>
          )}
          <span className="badge bg-secondary">
            Question {session.currentQuestion}/{session.totalQuestions}
          </span>
        </div>
      </div>
      
      <div className="progress-container">
        <div className="progress" style={{ height: '10px' }}>
          <div 
            className="progress-bar" 
            role="progressbar" 
            style={{ width: `${progressPercentage}%` }} 
            aria-valuenow={progressPercentage} 
            aria-valuemin={0} 
            aria-valuemax={100}
          ></div>
        </div>
      </div>
      
      {!isVoiceSupported && session.isVoiceMode && (
        <div className="alert alert-warning mt-3">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Voice features are not fully supported in your browser. Please use Chrome for the best experience.
        </div>
      )}
      
      <div ref={chatContainerRef} className="chat-container">
        {messages.map((message, index) => (
          <MessageBubble key={index} message={message} />
        ))}
        
        {interimTranscript && (
          <div className="message interim-transcript">
            <i className="bi bi-mic-fill me-2"></i>
            {interimTranscript}
          </div>
        )}
      </div>
      
      <div className="mb-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <label htmlFor="answer-input" className="form-label mb-0">Your Answer:</label>
          
          {session.isVoiceMode && (
            <button 
              className={`btn ${isListening ? 'btn-danger' : 'btn-outline-primary'} btn-sm`}
              onClick={handleToggleListening}
              disabled={!isVoiceSupported || isSpeaking}
            >
              <i className={`bi ${isListening ? 'bi-mic-mute-fill' : 'bi-mic-fill'} me-1`}></i>
              {isListening ? 'Stop Listening' : 'Start Listening'}
            </button>
          )}
        </div>
        
        <textarea 
          id="answer-input" 
          ref={answerInputRef}
          className="form-control" 
          rows={4} 
          placeholder="Type your answer here..." 
          value={answer}
          onChange={handleAnswerChange}
          onKeyDown={handleKeyDown}
        ></textarea>
        <small className="form-text text-muted d-flex justify-content-between">
          <span>Press Shift+Enter to submit</span>
          {session.isVoiceMode && isListening && (
            <span className="text-danger">Listening...</span>
          )}
        </small>
      </div>
      
      <div className="d-flex justify-content-between">
        <button 
          className="btn btn-primary" 
          onClick={handleSubmitAnswer}
          disabled={isSpeaking}
        >
          {isLastQuestion ? 'Submit Final Answer' : 'Submit Answer'}
        </button>
        <button 
          className="btn btn-danger" 
          onClick={handleEndInterview}
          disabled={isSpeaking}
        >
          End Interview
        </button>
      </div>
    </div>
  );
};

export default VoiceInterviewChat;