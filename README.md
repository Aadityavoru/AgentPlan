# Company-Specific Mock Interview Application

This application simulates a mock interview experience where the interview questions and evaluation feedback are tailored to specific companies' standards. The candidate chooses a company, and the system uses company-specific question banks and evaluation rubrics.

## Features

- **Company Selection:** Choose from different companies (Google, Facebook, Amazon, Microsoft)
- **Company-Specific Question Bank:** Pre-defined questions tailored to each company
- **Real-Time Evaluation:** Immediate feedback after each answer based on company criteria
- **Final Evaluation:** Comprehensive summary evaluation once the interview is complete

## Installation

1. Clone this repository:
```
git clone <repository-url>
cd mock-interview-agent
```

2. Create a virtual environment:
```
python -m venv venv
source venv/bin/activate  # On Windows, use: venv\Scripts\activate
```

3. Install the dependencies:
```
pip install -r requirements.txt
```

4. Set up your OpenAI API key:
```
export OPENAI_API_KEY=your_api_key_here  # On Windows, use: set OPENAI_API_KEY=your_api_key_here
```

Alternatively, create a `.env` file with:
```
OPENAI_API_KEY=your_api_key_here
```

## Directory Structure

```
mock_interview_agent/
│
├── app.py                # Flask application with endpoints
├── company_questions.py  # Contains company question banks & evaluation prompts
├── templates/
│   └── index.html        # Main HTML page with company selection and chat UI
├── static/
│   └── main.js           # Frontend JavaScript for AJAX calls
└── requirements.txt      # Dependencies
```

## Running the Application

1. Start the Flask server:
```
python app.py
```

2. Open your browser and navigate to:
```
http://127.0.0.1:5000/
```

3. Select a company and start the mock interview!

## Customizing

### Adding New Companies

To add a new company with its own question bank, edit the `company_questions.py` file. Follow the existing structure:

```python
question_banks = {
    "YourCompany": [
        {
            "question": "Your interview question here",
            "evaluation_prompt": "Criteria to evaluate this answer"
        },
        # Add more questions...
    ]
}
```

### Modifying Evaluation Criteria

You can customize the evaluation prompts for each question in `company_questions.py` to reflect specific company values or expectations.

## Deployment

For production deployment, consider:

1. Using a production WSGI server like Gunicorn:
```
gunicorn app:app
```

2. Setting appropriate environment variables for security
3. Using a platform like Heroku, Render, or AWS for hosting

## Contributing

Contributions are welcome! Feel free to submit pull requests or open issues for bugs and feature requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.