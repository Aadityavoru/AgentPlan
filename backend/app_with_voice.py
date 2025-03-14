"""
Mock interview application using the OpenAI Agents SDK with voice interview support.
Provides company-specific interviews with tailored questions, evaluation, and voice interaction.
"""

# Load environment variables
import os
import asyncio
import json
from dotenv import load_dotenv
load_dotenv()

from flask import Flask, request, session, jsonify, Response
import uuid
from flask_cors import CORS
from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field

from agents import Agent, Runner, trace, gen_trace_id



# Initialize AgentOps with error handling
try:
    import agentops
    agentops.init()
    AGENTOPS_ENABLED = True
    print("AgentOps initialized successfully")
except Exception as e:
    AGENTOPS_ENABLED = False
    print(f"AgentOps initialization failed: {e}")
# Import our company-specific question banks and evaluation configurations
from company_questions import question_banks
from evaluation_configs import build_evaluation_prompt, get_evaluation_config

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'mock_interview_secret_key')

# Enable CORS for all routes to allow React to communicate with the API
CORS(app, resources={r"/*": {"origins": "*"}})

# In-memory store for session data
sessions = {}

# Define Pydantic models for structured data
class Question(BaseModel):
    question: str
    evaluation_prompt: str

class InterviewSession(BaseModel):
    session_id: str
    company: str
    interview_type: str
    question_bank: List[Question]
    current_index: int
    history: List[Dict[str, str]]
    is_voice_mode: bool = False

class InterviewRequest(BaseModel):
    company: str
    interview_type: str
    is_voice_mode: bool = False

class EvaluationInput(BaseModel):
    candidate_answer: str
    evaluation_prompt: str
    conversation_history: List[Dict[str, str]]
    company: str
    interview_type: str

class EvaluationOutput(BaseModel):
    evaluation: str = Field(..., description="The feedback on the candidate's answer.")
    follow_up_questions: Optional[List[str]] = Field(None, description="Optional follow-up questions to ask the candidate.")

class FinalFeedbackInput(BaseModel):
    conversation_history: List[Dict[str, str]]
    company: str
    interview_type: str

class FinalFeedbackOutput(BaseModel):
    feedback: str = Field(..., description="Comprehensive feedback on the candidate's overall interview performance.")
    strengths: List[str] = Field(..., description="List of the candidate's key strengths.")
    areas_for_improvement: List[str] = Field(..., description="List of areas where the candidate can improve.")
    overall_rating: Optional[str] = Field(None, description="Overall rating of the candidate's performance.")

# Create specialized agents
evaluator_agent = Agent(
    name="EvaluatorAgent",
    instructions="""You are an expert interviewer evaluating a candidate's response. 
    Provide constructive feedback based on the company's criteria. Be specific, 
    highlight strengths, and suggest improvements. Your feedback should be 
    professional and helpful, focusing on both content and delivery.
    
    If appropriate, include 1-3 follow-up questions that could be asked to the candidate
    to explore areas that need more depth or clarification.
    
    Structure your evaluation according to the provided evaluation criteria and structure.
    """,
    model="gpt-4o",
    output_type=EvaluationOutput
)

feedback_agent = Agent(
    name="FeedbackAgent",
    instructions="""You are an expert interviewer providing a final evaluation for 
    an interview. Summarize the candidate's performance based on the company's 
    evaluation criteria, highlighting strengths and areas for improvement. 
    Your feedback should be comprehensive, specific, and constructive, helping 
    the candidate understand their performance and how to improve.
    
    Structure your feedback according to the provided evaluation structure, and include:
    1. A comprehensive written assessment
    2. A bullet-point list of key strengths
    3. A bullet-point list of specific areas for improvement
    4. An overall rating if requested in the evaluation structure
    """,
    model="gpt-4o",
    output_type=FinalFeedbackOutput
)

# Define a context manager for AgentOps that falls back gracefully
class AgentOpsSpan:
    def __init__(self, name):
        self.name = name
        self.span = None
    
    def __enter__(self):
        if AGENTOPS_ENABLED:
            try:
                self.span = agentops.start_span(self.name)
                return self.span
            except Exception as e:
                print(f"AgentOps span creation failed: {e}")
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.span and AGENTOPS_ENABLED:
            try:
                self.span.__exit__(exc_type, exc_val, exc_tb)
            except Exception as e:
                print(f"AgentOps span closure failed: {e}")

async def evaluate_answer(input_data: EvaluationInput) -> EvaluationOutput:
    """
    Evaluates the candidate's answer using the OpenAI Agents SDK.
    
    Args:
        input_data: Contains the candidate's answer, evaluation prompt, and conversation history
    
    Returns:
        EvaluationOutput: Evaluation feedback and optional follow-up questions
    """
    # Generate a trace ID for debugging
    with AgentOpsSpan("evaluate_answer"):
        trace_id = gen_trace_id()
        
        # Enhance the evaluation prompt with company-specific configuration
        enhanced_prompt = build_evaluation_prompt(
            input_data.company, 
            input_data.interview_type,
            input_data.evaluation_prompt
        )
        
        # Construct prompt for the evaluator agent
        prompt = f"""
        Company: {input_data.company}
        Interview Type: {input_data.interview_type}
        
        Conversation History:
        {format_conversation_history(input_data.conversation_history)}
        
        Candidate's Answer: 
        "{input_data.candidate_answer}"
        
        Evaluation Criteria:
        {enhanced_prompt}
        
        Please evaluate the candidate's answer based on the provided criteria.
        If appropriate, include 1-3 follow-up questions that could be asked to explore areas that need more depth or clarification.
        """
        
        # Use tracing to help with debugging
        with trace("Evaluate candidate answer", trace_id=trace_id):
            # Run the evaluator agent
            result = await Runner.run(evaluator_agent, input=prompt)
            evaluation = result.final_output_as(EvaluationOutput)
            
            return evaluation

async def generate_final_feedback(input_data: FinalFeedbackInput) -> FinalFeedbackOutput:
    """
    Generates final comprehensive feedback for the entire interview using the Agents SDK.
    
    Args:
        input_data: Contains the conversation history, company name, and interview type
    
    Returns:
        FinalFeedbackOutput: Final feedback with strengths and areas for improvement
    """
    # Generate a trace ID for debugging
    with AgentOpsSpan("generate_final_feedback"):
        trace_id = gen_trace_id()
        
        # Get evaluation configuration
        eval_config = get_evaluation_config(input_data.company, input_data.interview_type)
        
        # Construct prompt for the feedback agent
        prompt = f"""
        Company: {input_data.company}
        Interview Type: {input_data.interview_type}
        
        Complete Interview Conversation:
        {format_conversation_history(input_data.conversation_history)}
        
        Based on the above conversation, provide a comprehensive performance summary and
        suggest improvements tailored to the interview standards of {input_data.company}.
        
        Evaluation Structure:
        {json.dumps(eval_config.get('structure', {}), indent=2)}
        
        Evaluation Criteria:
        {json.dumps(eval_config.get('criteria', []), indent=2)}
        
        Please include:
        1. A comprehensive written assessment
        2. A bullet-point list of key strengths (at least 3)
        3. A bullet-point list of specific areas for improvement (at least 3)
        4. An overall rating (if requested in the evaluation structure)
        """
        
        # Use tracing to help with debugging
        with trace("Generate final feedback", trace_id=trace_id):
            # Run the feedback agent
            result = await Runner.run(feedback_agent, input=prompt)
            feedback = result.final_output_as(FinalFeedbackOutput)
            
            return feedback

def format_conversation_history(history: List[Dict[str, str]]) -> str:
    """Format conversation history into a readable text format"""
    formatted = ""
    for item in history:
        role = "Interviewer" if item["role"] == "agent" else "Candidate"
        formatted += f"{role}: {item['text']}\n\n"
    return formatted

@app.route('/api/companies')
def get_companies():
    """Return a list of available companies."""
    companies = list(question_banks.keys())
    return jsonify(companies)

@app.route('/api/start', methods=['POST'])
def start():
    """Initialize a new interview session with the selected company."""
    print("Received start request:", request.json)
    data = request.get_json()
    company = data.get("company")
    interview_type = data.get("interview_type", "General")
    is_voice_mode = data.get("is_voice_mode", False)
    
    # Generate a unique session ID
    session_id = str(uuid.uuid4())
    
    # Load company question bank
    company_questions = question_banks.get(company, {})
    if not company_questions:
        print(f"Error: No question bank found for {company}")
        return jsonify({"error": f"No question bank available for {company}."}), 400
    
    # Get questions for the specified interview type
    interview_type_lower = interview_type.lower()
    type_questions = company_questions.get(interview_type_lower, [])
    if not type_questions:
        print(f"Error: No question bank found for {company} ({interview_type} interview)")
        return jsonify({"error": f"No question bank available for {company} ({interview_type} interview)."}), 400
    
    # Initialize session data
    sessions[session_id] = {
        "company": company,
        "interview_type": interview_type,
        "question_bank": type_questions,
        "current_index": 0,
        "history": [],
        "is_voice_mode": is_voice_mode
    }
    
    # Get the first question
    first_question = type_questions[0]["question"]
    
    # Record the question in conversation history
    sessions[session_id]["history"].append({"role": "agent", "text": first_question})
    
    # Store session ID in Flask session
    session['session_id'] = session_id
    
    # Return the first question
    response = {
        "session_id": session_id, 
        "question": first_question,
        "company": company,
        "total_questions": len(type_questions),
        "is_voice_mode": is_voice_mode
    }
    print("Sending response:", response)
    return jsonify(response)

@app.route('/api/answer', methods=['POST'])
def answer():
    """Handle the candidate's answer, evaluate it, and provide the next question."""
    print("Received answer request:", request.json)
    data = request.get_json()
    candidate_answer = data.get("answer")
    session_id = data.get("session_id") or session.get('session_id')
    
    if not session_id or session_id not in sessions:
        print("Session not found:", session_id)
        return jsonify({"error": "Session not found. Please start a new interview."}), 400
    
    # Get session data
    session_data = sessions[session_id]
    company = session_data["company"]
    interview_type = session_data["interview_type"]
    history = session_data["history"]
    question_bank = session_data["question_bank"]
    current_index = session_data["current_index"]
    is_voice_mode = session_data["is_voice_mode"]
    
    # Add candidate's answer to history
    history.append({"role": "candidate", "text": candidate_answer})
    
    # Get evaluation prompt for current question
    eval_prompt = question_bank[current_index]["evaluation_prompt"]
    
    try:
        # Create evaluation input
        eval_input = EvaluationInput(
            candidate_answer=candidate_answer,
            evaluation_prompt=eval_prompt,
            conversation_history=history,
            company=company,
            interview_type=interview_type
        )
        
        # Evaluate candidate's answer using the evaluator agent
        # Note: We need to run the async function in a synchronous context
        evaluation_output = asyncio.run(evaluate_answer(eval_input))
        evaluation = evaluation_output.evaluation
        follow_up_questions = evaluation_output.follow_up_questions or []
        
        # Add evaluation to history
        history.append({"role": "agent", "text": evaluation})
        
        # Move to next question
        session_data["current_index"] += 1
        current_index = session_data["current_index"]
        
        # Check if there are more questions
        if current_index < len(question_bank):
            next_question = question_bank[current_index]["question"]
            # Add next question to history
            history.append({"role": "agent", "text": next_question})
            
            response = {
                "evaluation": evaluation, 
                "follow_up_questions": follow_up_questions,
                "question": next_question,
                "question_number": current_index + 1,
                "total_questions": len(question_bank),
                "is_last": current_index == len(question_bank) - 1,
                "is_voice_mode": is_voice_mode
            }
        else:
            # No more questions
            response = {
                "evaluation": evaluation,
                "follow_up_questions": follow_up_questions,
                "question": "That concludes our interview questions. Would you like to end the interview and receive your final feedback?",
                "question_number": current_index,
                "total_questions": len(question_bank),
                "is_last": True,
                "is_voice_mode": is_voice_mode
            }
        
        print("Sending answer response:", response)
        return jsonify(response)
    
    except Exception as e:
        print(f"Error processing answer: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": "There was an error processing your answer. Please try again."}), 500

@app.route('/api/end', methods=['POST'])
def end():
    """End the interview and generate a comprehensive evaluation."""
    print("Received end request:", request.json)
    data = request.get_json()
    session_id = data.get("session_id") or session.get('session_id')
    
    if not session_id or session_id not in sessions:
        print("Session not found:", session_id)
        return jsonify({"error": "Session not found. Please start a new interview."}), 400
    
    # Get session data
    session_data = sessions[session_id]
    company = session_data["company"]
    interview_type = session_data["interview_type"]
    history = session_data["history"]
    is_voice_mode = session_data["is_voice_mode"]
    
    try:
        # Create feedback input
        feedback_input = FinalFeedbackInput(
            conversation_history=history,
            company=company,
            interview_type=interview_type
        )
        
        # Generate final feedback using the feedback agent
        # Note: We need to run the async function in a synchronous context
        feedback_output = asyncio.run(generate_final_feedback(feedback_input))
        
        # Add final feedback to history
        history.append({"role": "agent", "text": feedback_output.feedback})
        
        response = {
            "feedback": feedback_output.feedback,
            "strengths": feedback_output.strengths,
            "areas_for_improvement": feedback_output.areas_for_improvement,
            "overall_rating": feedback_output.overall_rating,
            "company": company,
            "is_voice_mode": is_voice_mode
        }
        print("Sending end response:", response)
        return jsonify(response)
    
    except Exception as e:
        print(f"Error generating final feedback: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": "There was an error generating the final feedback. Please try again."}), 500

# New endpoint for voice-specific operations
@app.route('/api/voice/convert', methods=['POST'])
def convert_voice():
    """
    Process voice data for speech-to-text conversion.
    Note: In a production app, you'd integrate with a real speech service.
    This endpoint is a placeholder that simulates the functionality.
    """
    # In a real implementation, this would use a speech-to-text service
    # For now, we'll just echo back the text if it's provided
    data = request.get_json()
    text = data.get("text", "")
    
    # Here you would call a speech-to-text service
    # For example: Google Cloud Speech-to-Text, Azure Speech, etc.
    
    return jsonify({"text": text})

if __name__ == '__main__':
    print("Starting server on http://localhost:5000")
    app.run(debug=True)