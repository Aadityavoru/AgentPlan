/**
 * Main JavaScript file for the Company-Specific Mock Interview application.
 * Handles UI interactions and AJAX calls to the Flask backend.
 */

// Global variables
let sessionId = null;
let totalQuestions = 0;
let currentQuestion = 1;

// DOM elements
const setupSection = document.getElementById('setup-section');
const interviewSection = document.getElementById('interview-section');
const companySelect = document.getElementById('company-select');
const interviewType = document.getElementById('interview-type');
const startBtn = document.getElementById('start-btn');
const companyTitle = document.getElementById('company-title');
const questionCounter = document.getElementById('question-counter');
const progressBar = document.getElementById('progress-bar');
const chatContainer = document.getElementById('chat-container');
const answerInput = document.getElementById('answer-input');
const submitBtn = document.getElementById('submit-btn');
const endBtn = document.getElementById('end-btn');
const loader = document.getElementById('loader');
const finalFeedbackContainer = document.getElementById('final-feedback-container');
const finalFeedbackContent = document.getElementById('final-feedback-content');
const newInterviewBtn = document.getElementById('new-interview-btn');

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Start interview button
    startBtn.addEventListener('click', startInterview);
    
    // Submit answer button
    submitBtn.addEventListener('click', submitAnswer);
    
    // End interview button
    endBtn.addEventListener('click', endInterview);
    
    // New interview button
    newInterviewBtn.addEventListener('click', resetInterview);
    
    // Allow submitting with Enter key when pressing Shift+Enter
    answerInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.shiftKey) {
            e.preventDefault();
            submitAnswer();
        }
    });
});

/**
 * Starts a new interview session with the selected company.
 */
function startInterview() {
    const company = companySelect.value;
    const type = interviewType.value;
    
    if (!company) {
        alert('Please select a company');
        return;
    }
    
    // Show loader
    toggleLoader(true);
    
    // Send request to start interview
    fetch('/start', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            company: company,
            interview_type: type
        }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // Store session data
        sessionId = data.session_id;
        totalQuestions = data.total_questions;
        currentQuestion = 1;
        
        // Update UI
        setupSection.classList.add('hidden');
        interviewSection.classList.remove('hidden');
        companyTitle.textContent = `${data.company} Mock Interview`;
        updateQuestionCounter();
        
        // Add first question to chat
        addMessage('agent', data.question);
        
        // Focus on answer input
        answerInput.focus();
    })
    .catch(error => {
        console.error('Error starting interview:', error);
        alert('Failed to start interview. Please try again.');
    })
    .finally(() => {
        toggleLoader(false);
    });
}

/**
 * Submits the candidate's answer and gets the next question.
 */
function submitAnswer() {
    const answer = answerInput.value.trim();
    
    if (!answer) {
        alert('Please enter your answer');
        return;
    }
    
    if (!sessionId) {
        alert('Session not found. Please start a new interview.');
        resetInterview();
        return;
    }
    
    // Add candidate's answer to chat
    addMessage('candidate', answer);
    
    // Clear input field
    answerInput.value = '';
    
    // Show loader
    toggleLoader(true);
    
    // Disable submit button
    submitBtn.disabled = true;
    
    // Send request to submit answer
    fetch('/answer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            session_id: sessionId,
            answer: answer
        }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // Add evaluation to chat
        addMessage('evaluation', data.evaluation);
        
        // Add next question to chat
        addMessage('agent', data.question);
        
        // Update question counter
        currentQuestion = data.question_number;
        updateQuestionCounter();
        
        // Check if this is the last question
        if (data.is_last) {
            submitBtn.textContent = 'Submit Final Answer';
        }
    })
    .catch(error => {
        console.error('Error submitting answer:', error);
        addMessage('agent', 'Sorry, there was an error processing your answer. Please try again or start a new interview.');
    })
    .finally(() => {
        toggleLoader(false);
        submitBtn.disabled = false;
        // Focus on answer input
        answerInput.focus();
    });
}

/**
 * Ends the interview and gets the final feedback.
 */
function endInterview() {
    if (!sessionId) {
        alert('Session not found. Please start a new interview.');
        resetInterview();
        return;
    }
    
    // Show loader
    toggleLoader(true);
    
    // Send request to end interview
    fetch('/end', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            session_id: sessionId
        }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // Hide response section
        document.getElementById('response-section').classList.add('hidden');
        
        // Show final feedback
        finalFeedbackContent.innerHTML = formatMessage(data.feedback);
        finalFeedbackContainer.classList.remove('hidden');
    })
    .catch(error => {
        console.error('Error ending interview:', error);
        alert('Failed to end interview. Please try again.');
    })
    .finally(() => {
        toggleLoader(false);
    });
}

/**
 * Resets the interview to start a new one.
 */
function resetInterview() {
    // Reset global variables
    sessionId = null;
    totalQuestions = 0;
    currentQuestion = 1;
    
    // Reset UI
    chatContainer.innerHTML = '';
    answerInput.value = '';
    submitBtn.textContent = 'Submit Answer';
    finalFeedbackContainer.classList.add('hidden');
    document.getElementById('response-section').classList.remove('hidden');
    
    // Show setup section
    interviewSection.classList.add('hidden');
    setupSection.classList.remove('hidden');
}

/**
 * Adds a message to the chat container.
 * 
 * @param {string} role - The role of the message sender (agent, candidate, evaluation)
 * @param {string} text - The message text
 */
function addMessage(role, text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    messageDiv.innerHTML = formatMessage(text);
    
    chatContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

/**
 * Updates the question counter and progress bar.
 */
function updateQuestionCounter() {
    // Update counter text
    questionCounter.textContent = `Question ${currentQuestion}/${totalQuestions}`;
    
    // Update progress bar
    const progress = (currentQuestion / totalQuestions) * 100;
    progressBar.style.width = `${progress}%`;
    progressBar.setAttribute('aria-valuenow', progress);
}

/**
 * Toggles the loader visibility.
 * 
 * @param {boolean} show - Whether to show the loader
 */
function toggleLoader(show) {
    if (show) {
        loader.classList.remove('hidden');
    } else {
        loader.classList.add('hidden');
    }
}

/**
 * Formats a message text with line breaks and styling.
 * 
 * @param {string} text - The message text
 * @returns {string} - The formatted HTML
 */
function formatMessage(text) {
    // Convert line breaks to <br> tags
    return text.replace(/\n/g, '<br>');
}