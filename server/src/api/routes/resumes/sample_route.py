from fastapi import APIRouter
from src.constants import DEFAULT_RESUME_SECTIONS

router = APIRouter()

_SAMPLE_RESUME_DATA = {
    "personalDetails": {
        "fullName": "John Doe",
        "email": "john.doe@example.com",
        "phone": "+1 (555) 123-4567",
        "address": "123 Main Street, San Francisco, CA, United States",
        "jobTitle": "Senior Software Engineer",
        "website": "https://johndoe.dev",
        "linkedin": "https://linkedin.com/in/johndoe",
        "github": "",
    },
    "professionalSummary": {
        "content": (
            "Experienced software engineer with 8+ years of expertise in full-stack development, "
            "cloud architecture, and team leadership. Proven track record of delivering scalable "
            "solutions and driving technical innovation in fast-paced environments. Passionate about "
            "clean code, mentoring junior developers, and staying current with emerging technologies."
        )
    },
    "workExperiences": [
        {
            "id": "we-sample-1",
            "company": "Tech Innovators Inc.",
            "position": "Senior Software Engineer",
            "location": "San Francisco, CA",
            "startDate": "2020-03",
            "endDate": "",
            "current": True,
            "description": (
                "Leading development of cloud-native applications serving 10M+ users. "
                "Architected microservices infrastructure reducing latency by 40%. "
                "Mentoring team of 5 junior engineers and conducting code reviews. "
                "Technologies: React, Node.js, AWS, Kubernetes, PostgreSQL."
            ),
        },
        {
            "id": "we-sample-2",
            "company": "Digital Solutions Corp",
            "position": "Software Engineer",
            "location": "San Francisco, CA",
            "startDate": "2017-06",
            "endDate": "2020-02",
            "current": False,
            "description": (
                "Developed and maintained enterprise web applications for Fortune 500 clients. "
                "Implemented CI/CD pipelines improving deployment frequency by 300%. "
                "Collaborated with cross-functional teams to deliver projects on time and within budget."
            ),
        },
        {
            "id": "we-sample-3",
            "company": "StartUp Ventures",
            "position": "Junior Developer",
            "location": "Palo Alto, CA",
            "startDate": "2014-07",
            "endDate": "2017-05",
            "current": False,
            "description": (
                "Built responsive web interfaces and RESTful APIs for SaaS platform. "
                "Participated in agile sprints and daily standups. "
                "Gained experience in full-stack development and legacy JavaScript frameworks."
            ),
        },
    ],
    "education": [
        {
            "id": "edu-sample-1",
            "institution": "Stanford University",
            "degree": "Master of Science",
            "fieldOfStudy": "Computer Science",
            "startDate": "2012-09",
            "endDate": "2014-06",
            "current": False,
            "description": (
                "Specialized in distributed systems and machine learning. "
                "GPA: 3.9/4.0. Thesis on scalable microservices architecture."
            ),
        },
        {
            "id": "edu-sample-2",
            "institution": "University of California, Berkeley",
            "degree": "Bachelor of Science",
            "fieldOfStudy": "Computer Science",
            "startDate": "2008-09",
            "endDate": "2012-06",
            "current": False,
            "description": (
                "Dean's List all semesters. "
                "President of Computer Science Student Association. "
                "Graduated Summa Cum Laude."
            ),
        },
    ],
    "skills": [
        {"id": "sk-sample-1", "name": "JavaScript/TypeScript", "level": "Expert"},
        {"id": "sk-sample-2", "name": "React & Next.js", "level": "Expert"},
        {"id": "sk-sample-3", "name": "Node.js & Express", "level": "Expert"},
        {"id": "sk-sample-4", "name": "AWS & Cloud Architecture", "level": "Advanced"},
        {"id": "sk-sample-5", "name": "Docker & Kubernetes", "level": "Advanced"},
        {"id": "sk-sample-6", "name": "PostgreSQL & MongoDB", "level": "Advanced"},
        {"id": "sk-sample-7", "name": "Python", "level": "Intermediate"},
        {"id": "sk-sample-8", "name": "CI/CD (GitHub Actions, Jenkins)", "level": "Advanced"},
    ],
    "projects": [
        {
            "id": "pr-sample-1",
            "name": "E-Commerce Platform Redesign",
            "description": (
                "Led complete overhaul of legacy e-commerce platform serving 500K monthly users. "
                "Implemented React architecture with TypeScript, reducing page load times by 60% "
                "and increasing conversion rates by 25%. Integrated Stripe payment gateway."
            ),
            "technologies": ["React", "TypeScript", "Stripe", "Node.js"],
            "link": "https://example-ecommerce.com",
            "startDate": "2023-01",
            "endDate": "2023-08",
        },
        {
            "id": "pr-sample-2",
            "name": "Real-Time Analytics Dashboard",
            "description": (
                "Built comprehensive analytics dashboard with real-time data visualization "
                "using React, D3.js, and WebSockets. Processed millions of events daily with "
                "sub-second latency."
            ),
            "technologies": ["React", "D3.js", "WebSockets", "Redis"],
            "link": "https://github.com/johndoe/analytics-dashboard",
            "startDate": "2022-06",
            "endDate": "2022-12",
        },
    ],
    "certifications": [
        {
            "id": "cert-sample-1",
            "name": "AWS Certified Solutions Architect - Professional",
            "issuer": "Amazon Web Services",
            "issueDate": "2023-03",
            "expiryDate": "2026-03",
            "link": "https://aws.amazon.com/certification/",
        },
        {
            "id": "cert-sample-2",
            "name": "Certified Kubernetes Administrator (CKA)",
            "issuer": "Cloud Native Computing Foundation",
            "issueDate": "2022-09",
            "expiryDate": "2025-09",
            "link": "https://www.cncf.io/certification/cka/",
        },
    ],
    "awards": [
        {
            "id": "aw-sample-1",
            "title": "Employee of the Year",
            "issuer": "Tech Innovators Inc.",
            "date": "2023-12",
            "description": (
                "Recognized for outstanding leadership and contributions to cloud infrastructure modernization."
            ),
        },
    ],
    "publications": [
        {
            "id": "pub-sample-1",
            "title": "Optimizing Microservice Architecture for Scalable Web Applications",
            "publisher": "IEEE Software Engineering Journal",
            "date": "2023-05",
            "description": (
                "Authored a peer-reviewed paper on design strategies for distributed microservice "
                "systems using event-driven patterns."
            ),
            "link": "https://ieeexplore.ieee.org/document/1234567",
        },
    ],
    "languages": [],
    "interests": [],
    "websites": [],
    "volunteering": [],
    "references": [],
    "custom": [],
    "sections": [
        {
            "id": s["id"],
            "type": s["type"],
            "title": s["title"],
            "isVisible": s["is_visible"],
            "order": s["order"],
        }
        for s in DEFAULT_RESUME_SECTIONS
    ],
    "theme": {
        "primaryColor": "#475569",
        "secondaryColor": "#4b5563",
        "fontFamily": "",
        "fontSize": "medium",
        "letterSpacing": "normal",
        "lineSpacing": "normal",
        "dateLocale": "en-US",
    },
    "coverLetterTheme": {
        "primaryColor": "#475569",
        "secondaryColor": "#4b5563",
        "fontFamily": "",
        "fontSize": "medium",
        "letterSpacing": "normal",
        "lineSpacing": "normal",
        "templateKey": "soft-modern",
        "dateLocale": "en-US",
    },
    "coverLetter": {
        "recipientName": "",
        "recipientTitle": "",
        "companyName": "",
        "companyAddress": "",
        "content": "",
    },
}


@router.get("/sample")
async def get_sample_resume() -> dict:
    """Return sample resume data for guest/preview use. No authentication required."""
    return _SAMPLE_RESUME_DATA
