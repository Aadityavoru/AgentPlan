import React from 'react';

// Export the props interface
export interface FinalFeedbackProps {
  feedback: string;
  company: string;
  onNewInterview: () => void;
}

const FinalFeedback: React.FC<FinalFeedbackProps> = ({ 
  feedback, 
  company, 
  onNewInterview 
}) => {
  // Format feedback text (convert line breaks to <br> tags)
  const formatFeedback = (text: string) => {
    return text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div className="interview-container">
      <div className="mb-4">
        <h2 className="mb-3">{company} Interview Feedback</h2>
        <div className="final-feedback">
          {formatFeedback(feedback)}
        </div>
      </div>
      
      <button 
        className="btn btn-success w-100" 
        onClick={onNewInterview}
      >
        Start New Interview
      </button>
    </div>
  );
};

export default FinalFeedback;