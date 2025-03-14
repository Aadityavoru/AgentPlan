import React, { useState, useEffect, useRef } from 'react';
import { InterviewSession, Message } from '../types';
import ApiService from '../services/api';
import MessageBubble from './MessageBubble';

// Properly define the props interface
export interface InterviewChatProps {
  session: InterviewSession;
  messages: Message[];
  onAddMessage: (message: Message) => void;
  onInterviewEnd: (feedback: string) => void;
  setIsLoading: (isLoading: boolean) => void;
}

const InterviewChat: React.FC<InterviewChatProps> = ({ 
  session, 
  messages, 
  onAddMessage, 
  onInterviewEnd,
  setIsLoading 
}) => {
  // State
  const [answer, setAnswer] = useState<string>('');
  const [isLastQuestion, setIsLastQuestion] = useState<boolean>(false);
  
  // Refs
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const answerInputRef = useRef<HTMLTextAreaElement>(null);
  
  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Focus on answer input after each question
  useEffect(() => {
    if (answerInputRef.current) {
      answerInputRef.current.focus();
    }
  }, [messages.length]);
  
  // Handle answer input change
  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAnswer(e.target.value);
  };
  
  // Handle submitting an answer
  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      alert('Please enter your answer');
      return;
    }
    
    try {
      // Add candidate's answer to messages
      onAddMessage({ role: 'candidate', text: answer });
      
      // Clear input
      setAnswer('');
      
      // Show loading indicator
      setIsLoading(true);
      
      // Call API to submit answer
      const response = await ApiService.submitAnswer(session.sessionId, answer);
      
      // Add evaluation to messages
      onAddMessage({ role: 'evaluation', text: response.evaluation });
      
      // Add next question to messages
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
        <span className="badge bg-secondary">
          Question {session.currentQuestion}/{session.totalQuestions}
        </span>
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
      
      <div ref={chatContainerRef} className="chat-container">
        {messages.map((message, index) => (
          <MessageBubble key={index} message={message} />
        ))}
      </div>
      
      <div className="mb-3">
        <label htmlFor="answer-input" className="form-label">Your Answer:</label>
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
        <small className="form-text text-muted">Press Shift+Enter to submit</small>
      </div>
      
      <div className="d-flex justify-content-between">
        <button 
          className="btn btn-primary" 
          onClick={handleSubmitAnswer}
        >
          {isLastQuestion ? 'Submit Final Answer' : 'Submit Answer'}
        </button>
        <button 
          className="btn btn-danger" 
          onClick={handleEndInterview}
        >
          End Interview
        </button>
      </div>
    </div>
  );
};

export default InterviewChat;