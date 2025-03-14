// Interview session types
export interface InterviewSession {
    sessionId: string;
    company: string;
    totalQuestions: number;
    currentQuestion: number;
  }
  
  // Message types for the chat
  export interface Message {
    role: 'agent' | 'candidate' | 'evaluation';
    text: string;
  }
  
  // Interview setup options
  export interface InterviewSetup {
    company: string;
    interviewType: string;
  }
  
  // API response types
  export interface StartInterviewResponse {
    session_id: string;
    question: string;
    company: string;
    total_questions: number;
  }
  
  export interface AnswerResponse {
    evaluation: string;
    question: string;
    question_number: number;
    total_questions: number;
    is_last: boolean;
  }
  
  export interface EndInterviewResponse {
    feedback: string;
    company: string;
  }
  
  // Company structure
  export interface Company {
    name: string;
    value: string;
  }
  
  // Interview type structure
  export interface InterviewType {
    name: string;
    value: string;
  }