import React, { useState, useEffect } from 'react';
import { InterviewSession, InterviewSetup } from '../types';
import ApiService from '../services/api';
import { 
  isSpeechRecognitionSupported, 
  isSpeechSynthesisSupported 
} from '../utils/voiceUtils';

// Export the props interface
export interface InterviewSetupFormProps {
  onInterviewStart: (session: InterviewSession, firstQuestion: string) => void;
  setIsLoading: (isLoading: boolean) => void;
}

const InterviewSetupForm: React.FC<InterviewSetupFormProps> = ({ 
  onInterviewStart, 
  setIsLoading 
}) => {
  // State for form values
  const [formValues, setFormValues] = useState<InterviewSetup>({
    company: '',
    interviewType: 'General',
    isVoiceMode: false
  });
  
  // Error state
  const [error, setError] = useState<string>('');
  
  // Voice support state
  const [isVoiceSupported, setIsVoiceSupported] = useState<boolean>(true);

  // Companies list
  const companies = [
    { name: 'Google', value: 'Google' },
    { name: 'Facebook', value: 'Facebook' },
    { name: 'Amazon', value: 'Amazon' },
    { name: 'Microsoft', value: 'Microsoft' }
  ];

  // Interview types
  const interviewTypes = [
    { name: 'General', value: 'General' },
    { name: 'Technical', value: 'Technical' },
    { name: 'Behavioral', value: 'Behavioral' },
    { name: 'System Design', value: 'System Design' }
  ];
  
  // Check if voice features are supported
  useEffect(() => {
    const speechRecognitionSupported = isSpeechRecognitionSupported();
    const speechSynthesisSupported = isSpeechSynthesisSupported();
    setIsVoiceSupported(speechRecognitionSupported && speechSynthesisSupported);
    
    // If voice mode is enabled but not supported, show a warning
    if (formValues.isVoiceMode && 
        (!speechRecognitionSupported || !speechSynthesisSupported)) {
      setError('Voice features are not fully supported in your browser. Please use Chrome for the best experience.');
    }
  }, [formValues.isVoiceMode]);

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear any previous errors when user changes selection
    setError('');
  };
  
  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: checked
    }));
    
    // Clear any previous errors when user changes selection
    setError('');
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formValues.company) {
      setError('Please select a company');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      // Call API to start interview
      const response = await ApiService.startInterview(formValues);
      
      // Create session object
      const newSession: InterviewSession = {
        sessionId: response.session_id,
        company: response.company,
        totalQuestions: response.total_questions,
        currentQuestion: 1,
        isVoiceMode: formValues.isVoiceMode
      };
      
      // Pass session and first question to parent
      onInterviewStart(newSession, response.question);
    } catch (error) {
      console.error('Error starting interview:', error);
      setError('Failed to start interview. Please check if the backend server is running on port 5000.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="setup-container">
      <h2 className="mb-4 text-center">Interview Setup</h2>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="company" className="form-label">Select Company:</label>
          <select 
            id="company" 
            name="company" 
            className="form-select form-select-lg mb-3" 
            value={formValues.company} 
            onChange={handleChange}
          >
            <option value="" disabled>Choose a company...</option>
            {companies.map(company => (
              <option key={company.value} value={company.value}>
                {company.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label htmlFor="interviewType" className="form-label">Interview Type:</label>
          <select 
            id="interviewType" 
            name="interviewType" 
            className="form-select form-select-lg mb-3" 
            value={formValues.interviewType} 
            onChange={handleChange}
          >
            {interviewTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-4 form-check">
          <input
            type="checkbox"
            className="form-check-input"
            id="isVoiceMode"
            name="isVoiceMode"
            checked={formValues.isVoiceMode}
            onChange={handleCheckboxChange}
            disabled={!isVoiceSupported}
          />
          <label className="form-check-label" htmlFor="isVoiceMode">
            Enable Voice Interview Mode
          </label>
          <div className="form-text">
            {isVoiceSupported ? 
              "Voice mode allows you to speak your answers and hear the interviewer's questions." :
              "Voice features are not supported in your browser. Please use Chrome for voice interviews."
            }
          </div>
        </div>
        
        <button type="submit" className="btn btn-primary w-100 py-3 mt-3">
          Start Interview
        </button>
      </form>
    </div>
  );
};

export default InterviewSetupForm;