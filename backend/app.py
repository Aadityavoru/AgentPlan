"""
Mock interview application using the OpenAI Agents SDK.
Provides company-specific interviews with tailored questions and evaluation.
"""

# Load environment variables
import os
import asyncio
from dotenv import load_dotenv
load_dotenv()

from flask import Flask, request, session, jsonify
import uuid
from flask_cors import CORS
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

from agents import Agent, Runner, trace, gen_trace_id

# Import our company-specific question banks
from company_questions import question_banks

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

class EvaluationInput(BaseModel):
    candidate_answer: str
    evaluation_prompt: str
    conversation_history: List[Dict[str, str]]
    company: str

class EvaluationOutput(BaseModel):
    evaluation: str
    """The feedback on the candidate's answer."""

class FinalFeedbackInput(BaseModel):
    conversation_history: List[Dict[str, str]]
    company: str

class FinalFeedbackOutput(BaseModel):
    feedback: str
    """Comprehensive feedback on the candidate's overall interview performance."""

# Create specialized agents
evaluator_agent = Agent(
    name="EvaluatorAgent",
    instructions="""You are an expert interviewer evaluating a candidate's response. 
    Provide constructive feedback based on the company's criteria. Be specific, 
    highlight strengths, and suggest improvements. Your feedback should be 
    professional and helpful, focusing on both content and delivery.""",
    model="gpt-4o",
    output_type=EvaluationOutput
)

feedback_agent = Agent(
    name="FeedbackAgent",
    instructions="""You are an expert interviewer providing a final evaluation for 
    an interview. Summarize the candidate's performance based on the company's 
    evaluation criteria, highlighting strengths and areas for improvement. 
    Your feedback should be comprehensive, specific, and constructive, helping 
    the candidate understand their performance and how to improve.""",
    model="gpt-4o",
    output_type=FinalFeedbackOutput
)

async def evaluate_answer(input_data: EvaluationInput) -> str:
    """
    Evaluates the candidate's answer using the OpenAI Agents SDK.
    
    Args:
        input_data: Contains the candidate's answer, evaluation prompt, and conversation history
    
    Returns:
        str: Evaluation feedback
    """
    # Generate a trace ID for debugging
    trace_id = gen_trace_id()
    
    # Construct prompt for the evaluator agent
    prompt = f"""
    Company: {input_data.company}
    
    Conversation History:
    {format_conversation_history(input_data.conversation_history)}
    
    Candidate's Answer: 
    "{input_data.candidate_answer}"
    
    Evaluation Criteria:
    {input_data.evaluation_prompt}
    
    Please evaluate the candidate's answer based on the provided criteria.
    """
    
    # Use tracing to help with debugging
    with trace("Evaluate candidate answer", trace_id=trace_id):
        # Run the evaluator agent
        result = await Runner.run(evaluator_agent, input=prompt)
        evaluation = result.final_output_as(EvaluationOutput)
        
        return evaluation.evaluation

async def generate_final_feedback(input_data: FinalFeedbackInput) -> str:
    """
    Generates final comprehensive feedback for the entire interview using the Agents SDK.
    
    Args:
        input_data: Contains the conversation history and company name
    
    Returns:
        str: Final feedback summary
    """
    # Generate a trace ID for debugging
    trace_id = gen_trace_id()
    
    # Construct prompt for the feedback agent
    prompt = f"""
    Company: {input_data.company}
    
    Complete Interview Conversation:
    {format_conversation_history(input_data.conversation_history)}
    
    Based on the above conversation, provide a comprehensive performance summary and
    suggest improvements tailored to the interview standards of {input_data.company}.
    """
    
    # Use tracing to help with debugging
    with trace("Generate final feedback", trace_id=trace_id):
        # Run the feedback agent
        result = await Runner.run(feedback_agent, input=prompt)
        feedback = result.final_output_as(FinalFeedbackOutput)
        
        return feedback.feedback

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
        "history": []
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
        "total_questions": len(type_questions)
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
    history = session_data["history"]
    question_bank = session_data["question_bank"]
    current_index = session_data["current_index"]
    
    # Add candidate's answer to history
    history.append({"role": "candidate", "text": candidate_answer})
    
    # Get evaluation prompt for current question
    eval_prompt = question_bank[current_index]["evaluation_prompt"]
    
    # Create evaluation input
    eval_input = EvaluationInput(
        candidate_answer=candidate_answer,
        evaluation_prompt=eval_prompt,
        conversation_history=history,
        company=company
    )
    
    # Evaluate candidate's answer using the evaluator agent
    # Note: We need to run the async function in a synchronous context
    evaluation = asyncio.run(evaluate_answer(eval_input))
    
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
            "question": next_question,
            "question_number": current_index + 1,
            "total_questions": len(question_bank),
            "is_last": current_index == len(question_bank) - 1
        }
    else:
        # No more questions
        response = {
            "evaluation": evaluation, 
            "question": "That concludes our interview questions. Would you like to end the interview and receive your final feedback?",
            "question_number": current_index,
            "total_questions": len(question_bank),
            "is_last": True
        }
    
    print("Sending answer response:", response)
    return jsonify(response)

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
    history = session_data["history"]
    
    # Create feedback input
    feedback_input = FinalFeedbackInput(
        conversation_history=history,
        company=company
    )
    
    # Generate final feedback using the feedback agent
    # Note: We need to run the async function in a synchronous context
    final_feedback = asyncio.run(generate_final_feedback(feedback_input))
    
    # Add final feedback to history
    history.append({"role": "agent", "text": final_feedback})
    
    response = {
        "feedback": final_feedback,
        "company": company
    }
    print("Sending end response:", response)
    return jsonify(response)

if __name__ == '__main__':
    print("Starting server on http://localhost:5000")
    app.run(debug=True)