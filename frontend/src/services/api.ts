import axios from 'axios';
import { 
  StartInterviewResponse, 
  AnswerResponse, 
  EndInterviewResponse,
  InterviewSetup,
  InterviewSession
} from '../types';

// Create axios instance with the correct base URL
const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Log request/response for debugging
api.interceptors.request.use(request => {
  console.log('Starting Request:', request);
  return request;
});

api.interceptors.response.use(
  response => {
    console.log('Response:', response);
    return response;
  },
  error => {
    console.error('API Error:', error.response || error.message);
    return Promise.reject(error);
  }
);

// API service methods
export const ApiService = {
  // Start a new interview
  startInterview: async (setup: InterviewSetup): Promise<StartInterviewResponse> => {
    try {
      const response = await api.post('/api/start', {
        company: setup.company,
        interview_type: setup.interviewType,
        is_voice_mode: setup.isVoiceMode
      });
      
      // Create the response with frontend naming convention
      const data = response.data;
      
      // Convert session from API for frontend use
      const finalResponse: StartInterviewResponse = {
        ...data,
        // Ensure property naming is consistent
        session_id: data.session_id,
        total_questions: data.total_questions,
        is_voice_mode: data.is_voice_mode
      };
      
      return finalResponse;
    } catch (error) {
      console.error('Start interview error:', error);
      throw error;
    }
  },
  
  // Submit answer and get next question
  submitAnswer: async (sessionId: string, answer: string): Promise<AnswerResponse> => {
    try {
      const response = await api.post('/api/answer', {
        session_id: sessionId,
        answer: answer
      });
      
      return response.data;
    } catch (error) {
      console.error('Submit answer error:', error);
      throw error;
    }
  },
  
  // End interview and get final feedback
  endInterview: async (sessionId: string): Promise<EndInterviewResponse> => {
    try {
      const response = await api.post('/api/end', {
        session_id: sessionId
      });
      
      return response.data;
    } catch (error) {
      console.error('End interview error:', error);
      throw error;
    }
  },
  
  // Convert voice to text (for potential server-side processing)
  convertVoice: async (audioData: Blob): Promise<{ text: string }> => {
    try {
      // Create form data
      const formData = new FormData();
      formData.append('audio', audioData);
      
      // Make API call
      const response = await api.post('/api/voice/convert', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Voice conversion error:', error);
      throw error;
    }
  }
};

export default ApiService;