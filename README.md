# Company-Specific Mock Interview Application

An advanced mock interview system that simulates company-specific interviews with tailored questions, intelligent evaluations, and voice interaction capabilities. Built using AgentOpsAI, OpenAI Agents SDK, and Flask.

## Features

### Core Functionality
- **Company-Specific Interviews**: Tailored questions and evaluation criteria for Google, Amazon, Facebook, Microsoft, and more
- **Multiple Interview Types**: Support for General, Technical, Behavioral, and System Design interviews
- **AI-Powered Evaluation**: Intelligent, contextual feedback based on company standards
- **Structured Feedback**: Strengths, areas for improvement, and overall ratings
- **Voice Interview Mode**: Speak your answers and hear questions for a realistic experience
- **Follow-up Questions**: AI generates intelligent follow-up questions to dig deeper

### Technical Features
- **OpenAI Agents SDK**: Specialized AI agents for evaluation and feedback
- **Company-Specific Evaluation Rubrics**: Tailored assessment frameworks
- **Voice Processing**: Speech-to-text and text-to-speech capabilities
- **Monitoring & Tracing**: Optional AgentOps integration for tracking agent performance
- **Error-Resistant Design**: Graceful fallbacks for all components

## Architecture

The application follows a client-server architecture:

### Backend (Python/Flask)
- API endpoints for interview flow, answer evaluation, and feedback generation
- OpenAI Agents SDK integration with specialized agents
- Pydantic data models for type safety
- Optional AgentOps monitoring

### Frontend (React/TypeScript)
- Company and interview type selection
- Real-time voice recognition and synthesis
- Interactive chat interface
- Detailed feedback visualization

## Installation

### Prerequisites
- Python 3.8+
- Node.js 14+
- OpenAI API key
- (Optional) AgentOps access key

### Backend Setup

1. Clone the repository:
```bash
git clone https://github.com/Aadityavoru/AgentPlan.git
cd AgentPlan/backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file with your API keys:
```
OPENAI_API_KEY=your_openai_api_key
AGENTOPS_API_KEY=your_agentops_api_key  # Optional
SECRET_KEY=your_flask_secret_key
```

5. Start the Flask server:
```bash
python app_with_voice.py
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd ../frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser to `http://localhost:3000`

## Usage

### Starting an Interview

1. Select a company (Google, Amazon, Facebook, Microsoft)
2. Choose an interview type (General, Technical, Behavioral, System Design)
3. Toggle voice mode on/off (requires browser support)
4. Click "Start Interview"

### During the Interview

**Text Mode:**
- Type your answers in the text area
- Submit to receive evaluation and the next question

**Voice Mode:**
- Questions will be read aloud
- Click "Start Listening" to speak your answer
- Your speech will be transcribed in real-time
- Click "Submit Answer" when finished

### Ending the Interview

- After answering all questions (or at any time)
- Click "End Interview" to receive comprehensive feedback
- Review your strengths, areas for improvement, and overall rating

## Customization

### Adding New Companies

Edit the `company_questions.py` file to add new companies with their specific questions.

### Modifying Evaluation Criteria

Edit the `evaluation_configs.py` file to customize how different companies evaluate responses.

## Troubleshooting

### Voice Recognition Issues

- Ensure you're using a supported browser (Chrome recommended)
- Check that your microphone permissions are granted
- Speak clearly and at a moderate pace

### AgentOps Integration

If you encounter errors related to AgentOps:

1. Check that your AgentOps API key is valid
2. Ensure proper initialization in the application
3. Consider running without AgentOps if issues persist

### API Connection Issues

- Verify that the Flask backend is running on port 5000
- Check browser console for CORS or network errors
- Ensure your OpenAI API key is valid and has sufficient credits

## Development

### Tracing and Debugging

The application includes tracing capabilities:

- OpenAI trace IDs are generated for each agent interaction
- (Optional) AgentOps spans provide detailed monitoring
- Error handling includes full stack traces for debugging

### Adding New Interview Types

1. Update `company_questions.py` with questions for the new type
2. Add corresponding evaluation criteria in `evaluation_configs.py`
3. Update the frontend to include the new type option

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for the Agents SDK
- AgentOps for monitoring capabilities
- All contributors to this project
