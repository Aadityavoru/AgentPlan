"""
Flask application for the company-specific mock interview system.
Integrates with OpenAI API to handle interview questions and evaluations.
"""

# Load environment variables
import os
from dotenv import load_dotenv
load_dotenv()

from flask import Flask, render_template, request, session, jsonify
import uuid
from openai import OpenAI

# Import our company-specific question banks
from company_questions import question_banks

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'mock_interview_secret_key')

# Initialize OpenAI client
client = OpenAI()

# In-memory store for session data
sessions = {}

def evaluate_answer(client, candidate_answer, evaluation_prompt, conversation_history):
    """
    Evaluates the candidate's answer using the OpenAI API.
    
    Args:
        client: OpenAI client
        candidate_answer: The candidate's answer to evaluate
        evaluation_prompt: Specific evaluation criteria for this question
        conversation_history: List of previous conversation messages
    
    Returns:
        str: Evaluation feedback
    """
    # Build messages for API call
    messages = []
    
    # Add system message with evaluation context
    messages.append({
        "role": "system", 
        "content": "You are an expert interviewer evaluating a candidate's response. " +
                   "Provide constructive feedback based on the company's criteria."
    })
    
    # Add conversation history
    for item in conversation_history:
        role = "assistant" if item["role"] == "agent" else "user"
        messages.append({"role": role, "content": item["text"]})
    
    # Add the evaluation request
    messages.append({
        "role": "user", 
        "content": f"The candidate's answer is: \"{candidate_answer}\"\n\n{evaluation_prompt}"
    })
    
    # Call OpenAI API
    response = client.chat.completions.create(
        model="gpt-4",  # You can adjust the model as needed
        messages=messages,
        temperature=0.7,
    )
    
    # Return the evaluation
    return response.choices[0].message.content

def generate_final_feedback(client, conversation_history, company):
    """
    Generates final comprehensive feedback for the entire interview.
    
    Args:
        client: OpenAI client
        conversation_history: Complete conversation history
        company: The company whose standards are being applied
    
    Returns:
        str: Final feedback summary
    """
    # Build messages for API call
    messages = []
    
    # Add system message with final evaluation context
    messages.append({
        "role": "system", 
        "content": f"You are an expert interviewer providing a final evaluation for a {company} interview. " +
                   f"Summarize the candidate's performance based on {company}'s evaluation criteria, " +
                   "highlighting strengths and areas for improvement."
    })
    
    # Add conversation history
    for item in conversation_history:
        role = "assistant" if item["role"] == "agent" else "user"
        messages.append({"role": role, "content": item["text"]})
    
    # Add the final evaluation request
    messages.append({
        "role": "user", 
        "content": f"Based on the above conversation, provide a comprehensive performance summary and " +
                   f"suggest improvements tailored to the interview standards of {company}."
    })
    
    # Call OpenAI API
    response = client.chat.completions.create(
        model="gpt-4",  # You can adjust the model as needed
        messages=messages,
        temperature=0.7,
    )
    
    # Return the final feedback
    return response.choices[0].message.content

@app.route('/')
def index():
    """Render the main page with company selection."""
    # Get list of available companies
    companies = list(question_banks.keys())
    return render_template('index.html', companies=companies)

@app.route('/start', methods=['POST'])
def start():
    """Initialize a new interview session with the selected company."""
    data = request.get_json()
    company = data.get("company")
    interview_type = data.get("interview_type", "General")
    
    # Generate a unique session ID
    session_id = str(uuid.uuid4())
    
    # Load company question bank
    question_bank = question_banks.get(company, [])
    if not question_bank:
        return jsonify({"error": f"No question bank available for {company}."}), 400
    
    # Initialize session data
    sessions[session_id] = {
        "company": company,
        "interview_type": interview_type,
        "question_bank": question_bank,
        "current_index": 0,
        "history": []
    }
    
    # Get the first question
    first_question = question_bank[0]["question"]
    
    # Record the question in conversation history
    sessions[session_id]["history"].append({"role": "agent", "text": first_question})
    
    # Store session ID in Flask session
    session['session_id'] = session_id
    
    # Return the first question
    return jsonify({
        "session_id": session_id, 
        "question": first_question,
        "company": company,
        "total_questions": len(question_bank)
    })

@app.route('/answer', methods=['POST'])
def answer():
    """Handle the candidate's answer, evaluate it, and provide the next question."""
    data = request.get_json()
    candidate_answer = data.get("answer")
    session_id = data.get("session_id") or session.get('session_id')
    
    if not session_id or session_id not in sessions:
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
    
    # Evaluate candidate's answer
    evaluation = evaluate_answer(client, candidate_answer, eval_prompt, history)
    
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
    
    return jsonify(response)

@app.route('/end', methods=['POST'])
def end():
    """End the interview and generate a comprehensive evaluation."""
    data = request.get_json()
    session_id = data.get("session_id") or session.get('session_id')
    
    if not session_id or session_id not in sessions:
        return jsonify({"error": "Session not found. Please start a new interview."}), 400
    
    # Get session data
    session_data = sessions[session_id]
    company = session_data["company"]
    history = session_data["history"]
    
    # Generate final feedback
    final_feedback = generate_final_feedback(client, history, company)
    
    # Add final feedback to history
    history.append({"role": "agent", "text": final_feedback})
    
    # Return final feedback
    return jsonify({
        "feedback": final_feedback,
        "company": company
    })

if __name__ == '__main__':
    app.run(debug=True)