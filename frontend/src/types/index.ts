// Interview session types
export interface InterviewSession {
    sessionId: string;
    company: string;
    totalQuestions: number;
    currentQuestion: number;
    isVoiceMode?: boolean;
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
    isVoiceMode?: boolean;
  }
  
  // API response types
  export interface StartInterviewResponse {
    session_id: string;
    question: string;
    company: string;
    total_questions: number;
    is_voice_mode?: boolean;
  }
  
  export interface AnswerResponse {
    evaluation: string;
    question: string;
    question_number: number;
    total_questions: number;
    is_last: boolean;
    follow_up_questions?: string[];
    is_voice_mode?: boolean;
  }
  
  export interface EndInterviewResponse {
    feedback: string;
    company: string;
    strengths?: string[];
    areas_for_improvement?: string[];
    overall_rating?: string;
    is_voice_mode?: boolean;
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
  
  // Evaluation criteria
  export interface EvaluationCriterion {
    name: string;
    description: string;
    weight: number;
  }
  
  // Evaluation structure
  export interface EvaluationStructure {
    sections: string[];
    rating_scale: string;
    include_score: boolean;
  }
  
  // Evaluation configuration
  export interface EvaluationConfig {
    structure: EvaluationStructure;
    criteria: EvaluationCriterion[];
    evaluation_prompt_suffix: string;
  }