"""
Company-specific evaluation configurations for different interview types.
"""

from typing import Dict, List, Any

# Define evaluation configurations by company and interview type
evaluation_configs = {
    "Google": {
        "general": {
            "structure": {
                "sections": ["Strengths", "Areas for Improvement", "Overall Assessment"],
                "rating_scale": "1-5 scale where 5 is exceptional",
                "include_score": True
            },
            "criteria": [
                {
                    "name": "Communication Clarity",
                    "description": "Ability to articulate thoughts in a clear, concise manner",
                    "weight": 0.25
                },
                {
                    "name": "Problem-Solving Approach",
                    "description": "Structured thinking and methodical approach to problems",
                    "weight": 0.25
                },
                {
                    "name": "Culture Fit",
                    "description": "Alignment with Google's collaborative and innovative culture",
                    "weight": 0.25
                },
                {
                    "name": "Impact Focus",
                    "description": "Emphasis on measurable results and impact in examples",
                    "weight": 0.25
                }
            ],
            "evaluation_prompt_suffix": "Focus on providing actionable feedback with specific examples from the candidate's responses. For Google general interviews, emphasize the importance of data-driven decisions and user-centric thinking."
        },
        "technical": {
            "structure": {
                "sections": ["Technical Accuracy", "Problem-Solving Approach", "Communication", "Areas for Improvement", "Overall Assessment"],
                "rating_scale": "1-5 scale where 5 is exceptional",
                "include_score": True
            },
            "criteria": [
                {
                    "name": "Technical Knowledge",
                    "description": "Depth and accuracy of technical knowledge",
                    "weight": 0.3
                },
                {
                    "name": "Algorithm Efficiency",
                    "description": "Ability to optimize solutions and understand complexity",
                    "weight": 0.3
                },
                {
                    "name": "Code Quality",
                    "description": "Clean, maintainable code with good practices",
                    "weight": 0.2
                },
                {
                    "name": "System Design",
                    "description": "Understanding of scalable architecture and design patterns",
                    "weight": 0.2
                }
            ],
            "evaluation_prompt_suffix": "Evaluate the candidate's technical depth and ability to handle edge cases. For Google technical interviews, emphasize scalability considerations and optimization techniques."
        },
        "system_design": {
            "structure": {
                "sections": ["Requirements Analysis", "Architecture Design", "Component Breakdown", "Scalability Considerations", "Areas for Improvement", "Overall Assessment"],
                "rating_scale": "1-5 scale where 5 is exceptional",
                "include_score": True
            },
            "criteria": [
                {
                    "name": "Requirements Gathering",
                    "description": "Ability to clarify and define system requirements",
                    "weight": 0.2
                },
                {
                    "name": "Architectural Thinking",
                    "description": "High-level design and component interactions",
                    "weight": 0.3
                },
                {
                    "name": "Scalability Focus",
                    "description": "Consideration for system growth and scaling challenges",
                    "weight": 0.3
                },
                {
                    "name": "Trade-off Analysis",
                    "description": "Understanding of design trade-offs and their implications",
                    "weight": 0.2
                }
            ],
            "evaluation_prompt_suffix": "Assess the candidate's ability to design large-scale systems. For Google system design interviews, emphasize distributed systems principles and Google-scale considerations."
        },
        "behavioral": {
            "structure": {
                "sections": ["Leadership", "Teamwork", "Problem Resolution", "Areas for Improvement", "Overall Assessment"],
                "rating_scale": "1-5 scale where 5 is exceptional",
                "include_score": True
            },
            "criteria": [
                {
                    "name": "STAR Format",
                    "description": "Clear articulation of Situation, Task, Action, Result",
                    "weight": 0.2
                },
                {
                    "name": "Leadership",
                    "description": "Demonstration of initiative and leadership qualities",
                    "weight": 0.2
                },
                {
                    "name": "Collaboration",
                    "description": "Ability to work effectively with diverse teams",
                    "weight": 0.2
                },
                {
                    "name": "Adaptability",
                    "description": "Flexibility in challenging situations and learning from failures",
                    "weight": 0.2
                },
                {
                    "name": "Impact",
                    "description": "Evidence of measurable impact in previous roles",
                    "weight": 0.2
                }
            ],
            "evaluation_prompt_suffix": "Evaluate the candidate's behavioral responses using the STAR method. For Google behavioral interviews, look for examples of innovation, teamwork, and handling ambiguity."
        }
    },
    "Amazon": {
        "general": {
            "structure": {
                "sections": ["Leadership Principles Alignment", "Strengths", "Areas for Improvement", "Overall Assessment"],
                "rating_scale": "Does Not Meet, Meets, Exceeds, Strongly Exceeds",
                "include_score": True
            },
            "criteria": [
                {
                    "name": "Customer Obsession",
                    "description": "Focus on understanding and solving customer needs",
                    "weight": 0.25
                },
                {
                    "name": "Ownership",
                    "description": "Taking responsibility and thinking long-term",
                    "weight": 0.25
                },
                {
                    "name": "Bias for Action",
                    "description": "Speed in decision-making and execution",
                    "weight": 0.25
                },
                {
                    "name": "Dive Deep",
                    "description": "Getting to the root of problems with data",
                    "weight": 0.25
                }
            ],
            "evaluation_prompt_suffix": "Evaluate the candidate against Amazon's Leadership Principles. For each response, identify which principles are demonstrated and which are missing."
        },
        "technical": {
            "structure": {
                "sections": ["Technical Proficiency", "Leadership Principles", "Areas for Improvement", "Overall Assessment"],
                "rating_scale": "Does Not Meet, Meets, Exceeds, Strongly Exceeds",
                "include_score": True
            },
            "criteria": [
                {
                    "name": "Technical Depth",
                    "description": "Deep understanding of technical concepts",
                    "weight": 0.3
                },
                {
                    "name": "Problem-Solving",
                    "description": "Logical approach to technical challenges",
                    "weight": 0.3
                },
                {
                    "name": "Operational Excellence",
                    "description": "Focus on scalability, reliability, and performance",
                    "weight": 0.2
                },
                {
                    "name": "Leadership Principles",
                    "description": "Alignment with Amazon's leadership principles in technical context",
                    "weight": 0.2
                }
            ],
            "evaluation_prompt_suffix": "For Amazon technical interviews, evaluate both technical skills and alignment with Leadership Principles, especially 'Dive Deep' and 'Invent and Simplify'."
        },
        "system_design": {
            "structure": {
                "sections": ["Requirements Understanding", "Architecture", "Scalability", "Leadership Principles", "Areas for Improvement", "Overall Assessment"],
                "rating_scale": "Does Not Meet, Meets, Exceeds, Strongly Exceeds",
                "include_score": True
            },
            "criteria": [
                {
                    "name": "Customer Focus",
                    "description": "Design decisions centered around customer needs",
                    "weight": 0.25
                },
                {
                    "name": "Scalability",
                    "description": "Architecture that can handle Amazon-scale growth",
                    "weight": 0.25
                },
                {
                    "name": "Operational Excellence",
                    "description": "Consideration for monitoring, deployment, and reliability",
                    "weight": 0.25
                },
                {
                    "name": "Cost Optimization",
                    "description": "Efficient use of resources and awareness of trade-offs",
                    "weight": 0.25
                }
            ],
            "evaluation_prompt_suffix": "For Amazon system design interviews, assess the candidate's ability to design cost-effective, scalable systems that prioritize customer experience. Look for 'Frugality' and 'Invent and Simplify' principles."
        },
        "behavioral": {
            "structure": {
                "sections": ["Situation/Task", "Action", "Result", "Leadership Principles Demonstrated", "Areas for Improvement", "Overall Assessment"],
                "rating_scale": "Does Not Meet, Meets, Exceeds, Strongly Exceeds",
                "include_score": True
            },
            "criteria": [
                {
                    "name": "Leadership Principles",
                    "description": "Alignment with Amazon's 16 leadership principles",
                    "weight": 0.4
                },
                {
                    "name": "STAR Format",
                    "description": "Clear articulation of Situation, Task, Action, Result",
                    "weight": 0.2
                },
                {
                    "name": "Data-Driven",
                    "description": "Use of metrics and data to demonstrate impact",
                    "weight": 0.2
                },
                {
                    "name": "Ownership",
                    "description": "Taking responsibility for outcomes and learnings",
                    "weight": 0.2
                }
            ],
            "evaluation_prompt_suffix": "For Amazon behavioral interviews, analyze responses against the 16 Leadership Principles. Each answer should demonstrate at least one principle, with specific examples and measurable results."
        }
    }
}

# Default configuration for companies without specific configurations
default_eval_config = {
    "structure": {
        "sections": ["Strengths", "Areas for Improvement", "Overall Assessment"],
        "rating_scale": "1-5 scale where 5 is exceptional",
        "include_score": True
    },
    "criteria": [
        {
            "name": "Communication",
            "description": "Clarity and effectiveness of communication",
            "weight": 0.25
        },
        {
            "name": "Technical Accuracy",
            "description": "Correctness of technical information provided",
            "weight": 0.25
        },
        {
            "name": "Problem-Solving",
            "description": "Structured approach to solving problems",
            "weight": 0.25
        },
        {
            "name": "Culture Fit",
            "description": "Alignment with company values and culture",
            "weight": 0.25
        }
    ],
    "evaluation_prompt_suffix": "Provide balanced feedback with specific examples from the candidate's responses. Highlight both strengths and concrete areas for improvement."
}

def get_evaluation_config(company: str, interview_type: str) -> Dict[str, Any]:
    """
    Get the evaluation configuration for a specific company and interview type.
    
    Args:
        company: The company name
        interview_type: The interview type
    
    Returns:
        The evaluation configuration
    """
    company_config = evaluation_configs.get(company)
    if not company_config:
        return default_eval_config
        
    interview_type = interview_type.lower()
    interview_config = company_config.get(interview_type)
    if not interview_config:
        # Try to find a close match
        if interview_type in ['system_design', 'system design', 'systems design']:
            interview_config = company_config.get('system_design')
        elif interview_type in ['tech', 'technical', 'coding']:
            interview_config = company_config.get('technical')
        elif interview_type in ['behavior', 'behavioral', 'leadership']:
            interview_config = company_config.get('behavioral')
        else:
            interview_config = company_config.get('general')
            
    return interview_config or default_eval_config

def build_evaluation_prompt(company: str, interview_type: str, base_prompt: str) -> str:
    """
    Build an evaluation prompt by appending company-specific guidance.
    
    Args:
        company: The company name
        interview_type: The interview type
        base_prompt: The base evaluation prompt
    
    Returns:
        The enhanced evaluation prompt
    """
    config = get_evaluation_config(company, interview_type)
    suffix = config.get('evaluation_prompt_suffix', '')
    
    criteria_text = "\n\nEvaluation Criteria:\n"
    for criterion in config.get('criteria', []):
        criteria_text += f"- {criterion['name']}: {criterion['description']} (Weight: {criterion['weight']})\n"
    
    structure = config.get('structure', {})
    structure_text = "\n\nEvaluation Structure:\n"
    for section in structure.get('sections', []):
        structure_text += f"- {section}\n"
    
    if structure.get('include_score', False):
        structure_text += f"\nPlease include a rating using this scale: {structure.get('rating_scale', '1-5')}"
    
    enhanced_prompt = f"{base_prompt}{criteria_text}{structure_text}\n\n{suffix}"
    return enhanced_prompt