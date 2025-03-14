import React from 'react';

// Export the props interface
export interface FinalFeedbackProps {
  feedback: string;
  company: string;
  strengths?: string[];
  areasForImprovement?: string[];
  overallRating?: string;
  onNewInterview: () => void;
}

const FinalFeedback: React.FC<FinalFeedbackProps> = ({ 
  feedback, 
  company, 
  strengths = [],
  areasForImprovement = [],
  overallRating,
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
        
        {overallRating && (
          <div className="overall-rating mb-4">
            <h3>Overall Rating</h3>
            <div className="alert alert-info">
              <strong>{overallRating}</strong>
            </div>
          </div>
        )}
        
        <div className="row mb-4">
          {strengths.length > 0 && (
            <div className="col-md-6 mb-3 mb-md-0">
              <div className="card h-100 border-success">
                <div className="card-header bg-success text-white">
                  <h3 className="mb-0 fs-5">Key Strengths</h3>
                </div>
                <div className="card-body">
                  <ul className="mb-0">
                    {strengths.map((strength, index) => (
                      <li key={index}>{strength}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          {areasForImprovement.length > 0 && (
            <div className="col-md-6">
              <div className="card h-100 border-warning">
                <div className="card-header bg-warning text-dark">
                  <h3 className="mb-0 fs-5">Areas for Improvement</h3>
                </div>
                <div className="card-body">
                  <ul className="mb-0">
                    {areasForImprovement.map((area, index) => (
                      <li key={index}>{area}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="card mb-4">
          <div className="card-header bg-primary text-white">
            <h3 className="mb-0 fs-5">Detailed Feedback</h3>
          </div>
          <div className="card-body">
            <div className="detailed-feedback">
              {formatFeedback(feedback)}
            </div>
          </div>
        </div>
      </div>
      
      <button 
        className="btn btn-success w-100 py-3" 
        onClick={onNewInterview}
      >
        Start New Interview
      </button>
    </div>
  );
};

export default FinalFeedback;