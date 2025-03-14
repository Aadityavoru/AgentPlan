import React, { useState, useEffect } from 'react';
import { InterviewSession, Message } from './types';
import InterviewSetupForm from './components/InterviewSetupForm';
import InterviewChat from './components/InterviewChat';
import VoiceInterviewChat from './components/VoiceInterviewChat';
import FinalFeedback from './components/FinalFeedback';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

const App: React.FC = () => {
  // State
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isInterviewActive, setIsInterviewActive] = useState<boolean>(false);
  const [finalFeedback, setFinalFeedback] = useState<string>('');
  const [feedbackDetails, setFeedbackDetails] = useState<{
    strengths: string[];
    areasForImprovement: string[];
    overallRating?: string;
  }>({
    strengths: [],
    areasForImprovement: []
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Handler for when interview is started
  const handleInterviewStart = (
    newSession: InterviewSession, 
    firstQuestion: string
  ) => {
    setSession(newSession);
    setMessages([{ role: 'agent', text: firstQuestion }]);
    setIsInterviewActive(true);
  };

  // Handler for when a new message is added
  const handleAddMessage = (message: Message) => {
    setMessages(prevMessages => [...prevMessages, message]);
  };

  // Handler for when interview is ended
  const handleInterviewEnd = (
    feedback: string, 
    strengths: string[] = [], 
    areasForImprovement: string[] = [],
    overallRating?: string
  ) => {
    setFinalFeedback(feedback);
    setFeedbackDetails({
      strengths,
      areasForImprovement,
      overallRating
    });
    setIsInterviewActive(false);
  };

  // Handler for starting a new interview
  const handleNewInterview = () => {
    setSession(null);
    setMessages([]);
    setFinalFeedback('');
    setFeedbackDetails({
      strengths: [],
      areasForImprovement: []
    });
    setIsInterviewActive(false);
  };

  // Add additional CSS class to body when using voice mode
  useEffect(() => {
    if (session?.isVoiceMode) {
      document.body.classList.add('voice-mode');
    } else {
      document.body.classList.remove('voice-mode');
    }
    
    return () => {
      document.body.classList.remove('voice-mode');
    };
  }, [session?.isVoiceMode]);

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-10 col-lg-8">
          <h1 className="text-center mb-4 fw-bold text-primary">
            Company-Specific Mock Interview
            {session?.isVoiceMode && (
              <span className="badge bg-info ms-2">
                <i className="bi bi-mic-fill me-1"></i> Voice Mode
              </span>
            )}
          </h1>
          
          {!isInterviewActive && !finalFeedback && (
            <InterviewSetupForm 
              onInterviewStart={handleInterviewStart} 
              setIsLoading={setIsLoading} 
            />
          )}
          
          {isInterviewActive && session && !session.isVoiceMode && (
            <InterviewChat 
              session={session}
              messages={messages}
              onAddMessage={handleAddMessage}
              onInterviewEnd={(feedback) => handleInterviewEnd(feedback)}
              setIsLoading={setIsLoading}
            />
          )}
          
          {isInterviewActive && session && session.isVoiceMode && (
            <VoiceInterviewChat 
              session={session}
              messages={messages}
              onAddMessage={handleAddMessage}
              onInterviewEnd={(feedback) => handleInterviewEnd(feedback)}
              setIsLoading={setIsLoading}
            />
          )}
          
          {finalFeedback && (
            <FinalFeedback 
              feedback={finalFeedback} 
              company={session?.company || ''}
              strengths={feedbackDetails.strengths}
              areasForImprovement={feedbackDetails.areasForImprovement}
              overallRating={feedbackDetails.overallRating}
              onNewInterview={handleNewInterview} 
            />
          )}
          
          {isLoading && (
            <div className="loader-container">
              <div className="loader"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;