import axios from 'axios';
import { 
  StartInterviewResponse, 
  AnswerResponse, 
  EndInterviewResponse,
  InterviewSetup
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
        interview_type: setup.interviewType
      });
      return response.data;
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
  }
};

export default ApiService;