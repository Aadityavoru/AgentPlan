import React, { useState } from 'react';
import { InterviewSession, Message } from './types';
import InterviewSetupForm from './components/InterviewSetupForm';
import InterviewChat from './components/InterviewChat';
import FinalFeedback from './components/FinalFeedback';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const App: React.FC = () => {
  // State
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isInterviewActive, setIsInterviewActive] = useState<boolean>(false);
  const [finalFeedback, setFinalFeedback] = useState<string>('');
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
  const handleInterviewEnd = (feedback: string) => {
    setFinalFeedback(feedback);
    setIsInterviewActive(false);
  };

  // Handler for starting a new interview
  const handleNewInterview = () => {
    setSession(null);
    setMessages([]);
    setFinalFeedback('');
    setIsInterviewActive(false);
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-10 col-lg-8">
          <h1 className="text-center mb-4 fw-bold text-primary">Company-Specific Mock Interview</h1>
          
          {!isInterviewActive && !finalFeedback && (
            <InterviewSetupForm 
              onInterviewStart={handleInterviewStart} 
              setIsLoading={setIsLoading} 
            />
          )}
          
          {isInterviewActive && session && (
            <InterviewChat 
              session={session}
              messages={messages}
              onAddMessage={handleAddMessage}
              onInterviewEnd={handleInterviewEnd}
              setIsLoading={setIsLoading}
            />
          )}
          
          {finalFeedback && (
            <FinalFeedback 
              feedback={finalFeedback} 
              company={session?.company || ''}
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