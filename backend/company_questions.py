"""
Contains company-specific question banks and evaluation prompts.
Each company has a list of questions with associated evaluation criteria.
"""

question_banks = {
    "Google": [
        {
            "question": "Explain the concept of MapReduce.",
            "evaluation_prompt": "Evaluate the answer based on clarity and technical depth expected at Google. Look for understanding of distributed computing concepts, the map and reduce functions, and practical applications of the framework."
        },
        {
            "question": "What are the trade-offs of microservices versus monolithic architectures?",
            "evaluation_prompt": "Assess this answer for understanding of system design, scalability, and communication clarity according to Google standards. Good answers should discuss deployment complexity, service boundaries, and operational challenges."
        },
        {
            "question": "Describe a time when you faced a technical challenge and how you overcame it.",
            "evaluation_prompt": "Evaluate based on Google's STAR method (Situation, Task, Action, Result). Look for structured problem solving, technical depth, and clear communication of the solution's impact."
        },
        {
            "question": "Design a system that can handle millions of concurrent users for a social media platform.",
            "evaluation_prompt": "Assess for Google-level system design skills. Look for consideration of data partitioning, caching strategies, database choices, and scalability patterns. The candidate should address both read and write heavy workloads."
        },
        {
            "question": "How would you improve Google Search?",
            "evaluation_prompt": "Evaluate based on innovation, understanding of search technologies, and user-focused improvements. Google values candidates who can balance technical feasibility with user experience enhancements."
        }
    ],
    "Facebook": [
        {
            "question": "How would you design a scalable news feed system?",
            "evaluation_prompt": "Evaluate the answer for innovation, scalability, and trade-off analysis as per Facebook's expectations. Look for understanding of fan-out approaches, cache invalidation strategies, and real-time delivery mechanisms."
        },
        {
            "question": "Explain a project where you had to make difficult technical trade-offs.",
            "evaluation_prompt": "Facebook values pragmatic engineering. Assess whether the candidate demonstrates balancing product requirements with technical feasibility, and how they communicate trade-offs to stakeholders."
        },
        {
            "question": "How would you detect fake accounts at scale?",
            "evaluation_prompt": "Facebook focuses heavily on integrity issues. Evaluate the answer for understanding of ML-based approaches, behavioral analysis, and graph-based detection methods. Look for both technical depth and ethical considerations."
        },
        {
            "question": "Describe how you would build a recommendation system for Facebook Marketplace.",
            "evaluation_prompt": "Assess for understanding of recommendation algorithms, feature engineering, and balancing buyer/seller needs. Facebook values candidates who consider both engagement and transaction optimization."
        },
        {
            "question": "How would you handle a production outage affecting millions of users?",
            "evaluation_prompt": "Facebook engineers need strong incident response skills. Evaluate their methodical approach to diagnosing issues, their communication plan during the outage, and their post-mortem process."
        }
    ],
    "Amazon": [
        {
            "question": "Tell me about a time when you had to make a decision with incomplete information.",
            "evaluation_prompt": "Evaluate based on Amazon's leadership principles, especially 'Bias for Action' and 'Have Backbone; Disagree and Commit'. Look for calculated risk-taking and decisive action despite uncertainty."
        },
        {
            "question": "How would you design Amazon's recommendation system?",
            "evaluation_prompt": "Assess for understanding of recommendation algorithms, scalability considerations, and business impact awareness. Amazon values candidates who can connect technical solutions to customer experience and business outcomes."
        },
        {
            "question": "Describe how you would architect a distributed inventory management system.",
            "evaluation_prompt": "Evaluate for understanding of distributed systems, consistency models, and operational excellence. Amazon's systems need to be highly available and eventually consistent."
        },
        {
            "question": "How would you optimize Amazon's delivery route planning?",
            "evaluation_prompt": "Assess for algorithmic thinking, optimization techniques, and practical constraints handling. Look for candidates who can balance theoretical optimality with real-world constraints."
        },
        {
            "question": "Tell me about a time you received tough feedback and how you handled it.",
            "evaluation_prompt": "Amazon values continuous learning. Evaluate the candidate's self-awareness, ability to accept criticism, and concrete actions taken to improve based on feedback."
        }
    ],
    "Microsoft": [
        {
            "question": "How would you design a collaborative document editing system like Microsoft Word Online?",
            "evaluation_prompt": "Evaluate the answer for understanding of operational transforms, conflict resolution, and real-time synchronization. Microsoft values detailed technical knowledge combined with user experience considerations."
        },
        {
            "question": "Describe a time when you had to work across teams to deliver a project.",
            "evaluation_prompt": "Microsoft emphasizes collaboration. Assess the candidate's ability to influence without authority, align diverse stakeholders, and drive results across organizational boundaries."
        },
        {
            "question": "How would you improve Microsoft Teams?",
            "evaluation_prompt": "Evaluate for product thinking, technical feasibility, and user-centered design. Microsoft values candidates who can balance innovation with practical implementation considerations."
        },
        {
            "question": "Explain how you would design a cloud-based authentication system.",
            "evaluation_prompt": "Assess for security knowledge, scalability considerations, and understanding of identity protocols. Microsoft expects strong security fundamentals combined with practical implementation approaches."
        },
        {
            "question": "Tell me about a time you had to learn a new technology quickly to solve a problem.",
            "evaluation_prompt": "Microsoft values growth mindset. Evaluate the candidate's learning agility, approach to knowledge acquisition, and ability to apply new technologies to solve real problems."
        }
    ]
}